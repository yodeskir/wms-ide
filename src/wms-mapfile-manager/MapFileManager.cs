using mapfileManager.mapfile;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Options;
using System;
using System.Reactive;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Runtime.Serialization.Formatters.Binary;
using System.Text;
using System.Text.RegularExpressions;
using WMSDataAccess.UserManagement;
using wmsShared.Interfaces;
using wmsShared.Model;
using System.Reactive.Linq;
using wmsTools;
using mapfileManager.Interfaces;

namespace mapfileManager
{

    public class MapFileManager: IMapFileManager
    {
        private MapLoadingOptions _mapLoadingOptions;
        private IMapServerOptions _mapServerOptions;
        private MapServerRuntimeOptions _runtimeOptions;
        private MapEntriesRuntimeOptions _entryOptions;
        private MapDirectivesRuntimeOptions _directiveOptions;
        private readonly IUserManager _userManager;
        private readonly IMemoryCache _cache;
        private static readonly object Locker = new object();
        
        private int _curIndex;

        const string REGCOLOR = "^#(?:[0-9a-fA-F]{3}){1,2}$|#(?:[0-9a-fA-F]{4}){2}$";

        public MapFileManager(IMapServerOptions mapServerOptions, IUserManager userManager, IMemoryCache cache)
        {
            _mapServerOptions = mapServerOptions;
            _runtimeOptions = _mapServerOptions.GetRuntimeOptions();
            _entryOptions = _mapServerOptions.GetEntryOptions();
            _directiveOptions = _mapServerOptions.GetDirectivesOptions();
            _userManager = userManager;
            _cache = cache;
        }

        private MapObj CreateMapObject(string userName, string mapName)
        {
            return new MapObj(_mapServerOptions) {
                UserName = userName,
                MapName = mapName,
                MapFileError = $"{userName}_{mapName}.log"
            };
        }

        public IMapfileBlock CreateNewMap(string username, string mapname)
        {
            var mapOptions = new MapLoadingOptions() { UserName = username, MapFileName = mapname, ServerUrl = "" };
            var mapObj = CreateMapObject(username, mapname);

            mapObj.AddDefaultEntries(LayerType.Autodetect, _entryOptions.MAP);
            SaveMapFile(mapOptions, mapObj);
            SetCachedMapFile(username, mapObj);
            return mapObj;
        }

        public MapObj GetMapFileObj(MapLoadingOptions mapLoadingOptions)
        {
            MapObj mapObj = (MapObj)_cache.Get(mapLoadingOptions.UserName) ?? LoadMapFileToMapObj(mapLoadingOptions);
            return mapObj;
        }

        public MapEntriesRuntimeOptions GetEntries()
        {
            return _entryOptions;
        }

        public MapDirectivesRuntimeOptions GetProcessingDirectives()
        {
            return _directiveOptions;
        }

        public List<IMapfileBlock> GetLayers(MapLoadingOptions mapLoadingOptions)
        {
            return GetMapFileObj(mapLoadingOptions).blocks.Where(b => b.name.Equals("LAYER")).ToList();
        }

        public string GetLayerNameById(MapLoadingOptions mapLoadingOptions, MapEntryRequest dto)
        {
            var mapObj = GetMapFileObj(mapLoadingOptions);
            if (dto.objtype.Equals("LAYER"))
            {
                var layer = mapObj.blocks.Find(b => b.id.Equals(dto.layerid));
                if (layer != null)
                    return ((LayerObj)layer).LayerName;
            }
            return null;
        }


        private MapObj LoadMapFileToMapObj(MapLoadingOptions mapLoadingOptions)
        {
            _mapLoadingOptions = mapLoadingOptions;
            _mapLoadingOptions.MapFileError = $"{_mapLoadingOptions.UserName}_{_mapLoadingOptions.MapFileName}.log";

            var mapObj = CreateMapObject(mapLoadingOptions.UserName, mapLoadingOptions.MapFileName);
            
            var pathfile = Path.Combine(_runtimeOptions.UserMapFilesLocation, _mapLoadingOptions.UserName, _mapLoadingOptions.MapFileName + ".map");
            _curIndex = 0;
            if (!File.Exists(pathfile))
                return null;

            string all;
            using (var sr = new StreamReader(pathfile, Encoding.ASCII, true, 65536))
            {
                all = sr.ReadToEnd();
            }
            var allLines = all.Split('\n');

            FillBlockEntries(mapObj, allLines, "MAP", _curIndex + 1, LayerType.Autodetect, mapLoadingOptions.UserName);

            SetCachedMapFile(_mapLoadingOptions.UserName, mapObj);

            return mapObj;
        }

        public NewMapElementResult AddEntry(MapLoadingOptions mapLoadingOptions, MapEntryRequest dto)
        {
            var mapObj = GetMapFileObj(mapLoadingOptions);
            var entry = FromDtoToMapfileEntry(dto);

            entry.value = entry.defValue;
            entry.id = Guid.NewGuid().ToString("N");

            if (dto.objtype.Equals("MAP"))
                mapObj.entries.Add(entry);
            else if (dto.objtype.Equals("LAYER"))
            {
                var layer = mapObj.blocks.Find(b => b.id.Equals(dto.layerid));
                layer?.entries.Add(entry);
            }
            else if (dto.objtype.Equals("CLASS"))
            {
                var layer = mapObj.blocks.Find(b => b.id.Equals(dto.layerid));
                var classes = layer.blocks.Where(c => c.name.Equals("CLASS")).ToList();
                AddEntryWithRecursion(dto, entry, classes);
            }
            else // generic block
            {
                var blocks = mapObj.blocks.ToList();
                AddEntryWithRecursion(dto, entry, blocks);
            }
            SaveMapFile(mapLoadingOptions, mapObj);
            SetCachedMapFile(mapLoadingOptions.UserName, mapObj);

            return new NewMapElementResult() {
                MapFile = mapObj,
                ItemId = entry.id,
                Status = StatusCode.Ok,
                Message= "Entry created."
            };
        }

        public IMapfileBlock GetBlockEntries(IMapfileBlock block, LayerType layerType)
        {
            var blockObj = block;
            blockObj.entries = ((List<MapfileEntry>)_entryOptions[block.name.ToUpper()]).Where(m=>m.includeAsDefault == true).ToList();
            blockObj.entries.All(x => { x.value = x.defValue; return true; });
            blockObj.id = Guid.NewGuid().ToString("N");
            return blockObj;
        }

        public IMapfileBlock AddBlock(MapLoadingOptions mapLoadingOptions, MapEntryRequest dto)
        {
            var mapObj = GetMapFileObj(mapLoadingOptions);
            IMapfileBlock blockObj;
            if (dto.objtype.Equals("MAP"))
            {
                blockObj = addBlockToParent(dto, mapObj);
            }
            else if (dto.objtype.Equals("LAYER"))
            {
                var layer = mapObj.blocks.Find(b => b.id.Equals(dto.layerid));
                blockObj = addBlockToParent(dto, (AbsMapfileBlock)layer);
            }
            else if (dto.objtype.Equals("CLASS"))
            {
                var layer = mapObj.blocks.Find(b => b.id.Equals(dto.layerid));
                var classes = layer.blocks.Where(c => c.name.Equals("CLASS")).ToList();
                var classb = classes.FirstOrDefault(c => c.id.Equals(dto.objectid));
                if (classb != null)
                {    /* Block that belongs to a CLASS  1st Level */
                    blockObj = addBlockToParent(dto, (AbsMapfileBlock)classb);
                }
                else
                {
                    AddBlockToObjectRecursive(dto, classes);
                }


            }
            SaveMapFile(mapLoadingOptions, mapObj);
            SetCachedMapFile(mapLoadingOptions.UserName, mapObj);
            return mapObj;
        }

        public NewMapElementResult DuplicateBlock(MapLoadingOptions mapLoadingOptions, MapEntryRequest dto)
        {
            var mapObj = GetMapFileObj(mapLoadingOptions);

            if (dto.objtype.Equals("MAP"))
            {
                return null;
            }
            var layer = mapObj.blocks.Find(b => b.id.Equals(dto.layerid));
            var block = findBlockToDuplicate(dto, (AbsMapfileBlock)layer, layer.blocks, false);

            SaveMapFile(mapLoadingOptions, mapObj);
            SetCachedMapFile(mapLoadingOptions.UserName, mapObj);

            return new NewMapElementResult()
            {
                MapFile = mapObj,
                ItemId = (block != null) ? block.id : null,
                Status = (block != null) ? StatusCode.Ok : StatusCode.ServerError,
                Message = (block != null) ? "Block duplicated." : "There is no block to duplicate"
            };
        }

        public IMapfileBlock DeleteLayer(MapLoadingOptions mapOptions, MapEntryRequest dto)
        {
            var mapObj = GetMapFileObj(mapOptions);
            if (dto.objtype.Equals("LAYER"))
            {
                var layer = mapObj.blocks.Find(b => b.id.Equals(dto.layerid));
                if(layer!=null)
                    mapObj.blocks.Remove(layer);

                SaveMapFile(mapOptions, mapObj);
                SetCachedMapFile(mapOptions.UserName, mapObj);
            }
            return mapObj;
        }

        private IMapfileBlock addBlockToParent(MapEntryRequest dto, AbsMapfileBlock parent)
        {
            IMapfileBlock blockObj = parent.GetNewBlockInstance(dto.entry.name.ToUpper());
            blockObj.id = dto.entry.id;
            blockObj.entries = ((List<MapfileEntry>)_entryOptions[dto.entry.name.ToUpper()]).Where(m => m.includeAsDefault == true).ToList();
            blockObj.entries.All(x => { x.value = x.defValue; return true; });
            parent.blocks.Add(blockObj);
            return blockObj;
        }

        private IMapfileBlock findBlockToDuplicate(MapEntryRequest dto, AbsMapfileBlock parent, List<IMapfileBlock> blocks, bool blockWasFound)
        {
            if (blocks == null) return null;
            IMapfileBlock blockObj = null;
            foreach (var b in blocks)
            {
                if (blockWasFound) break;
                var innerBlocks = b.blocks;
                if (b.id.Equals(dto.objectid))
                {
                    blockObj = (IMapfileBlock)b.Clone();
                    setPropertiesToDuplicatedBlock(blockObj, b);
                    parent.blocks.Add(blockObj);
                    blockWasFound = true;
                    return blockObj;
                }
                else {
                    blockObj = findBlockToDuplicate(dto, (AbsMapfileBlock)b, innerBlocks, blockWasFound);
                    if (blockObj != null) return blockObj;
                }
            }

            return blockObj;
        }

        private void setPropertiesToDuplicatedBlock(IMapfileBlock blockObj, IMapfileBlock sourceBlockObj)
        {
            blockObj.id = Guid.NewGuid().ToString("N");
            
            var entries = DeepClone(sourceBlockObj.entries);
            blockObj.entries.AddRange(entries);
            blockObj.entries.All(x =>
            {
                x.id = Guid.NewGuid().ToString("N");
                return true;
            });

            foreach (var b in sourceBlockObj.blocks)
            {
                var newBlock = blockObj.GetNewBlockInstance(b.name);
                blockObj.blocks.Add(newBlock);
                setPropertiesToDuplicatedBlock(newBlock, b);
            }
            
        }

        public MapObj WriteMapFile(MapLoadingOptions mapLoadingOptions, MapEntryRequest dto)
        {
            var mapObj = GetMapFileObj(mapLoadingOptions);
            var entry = FromDtoToMapfileEntry(dto);
            try
            {
                if (entry.valueType == VALUETYPE._block && dto.deleteEntry)
                    deleteBlock(mapObj, entry);
                else
                {
                    var block = findBlockForUpdate(mapObj, dto);
                    findAndUpdateEntry(block, entry, dto.deleteEntry);
                }
                SaveMapFile(mapLoadingOptions, mapObj);
                SetCachedMapFile(mapLoadingOptions.UserName, mapObj);
                return mapObj;
            }
            catch
            {
                return null;
            }
        }


        public MapObj WriteMapFile(MapLoadingOptions mapLoadingOptions, string[] orderedlayers)
        {
            var mapObj = GetMapFileObj(mapLoadingOptions);
            try
            {
                var layerblocks = mapObj.blocks.Where(b => b.name.Equals("LAYER"));
                foreach (var mapfileBlock in layerblocks)
                {
                    var lb = (LayerObj)mapfileBlock;
                    lb.order = Array.IndexOf(orderedlayers, lb.LayerName) + 1;
                }
                SaveMapFile(mapLoadingOptions, mapObj);
                SetCachedMapFile(mapLoadingOptions.UserName, mapObj);
                return mapObj;

            }
            catch
            {
                return null;
            }
        }

        public IMapfileBlock InsertLayerFromImport(ImportViewModel importModel)
        {
            try
            {
                CreateOriginLayer(importModel);
                CreateSaveLayer(importModel);
            }
            catch (Exception ex)
            {
                importModel.Message = ex.Message;
                importModel.IsValid = false;
            }
            var mapOptions = new MapLoadingOptions() { UserName = importModel.UserName, MapFileName = importModel.MapName };
            return GetMapFileObj(mapOptions);
             
        }

        private void CreateOriginLayer(ImportViewModel importModel)
        {
            if (importModel.UploadedLayerType == LayerType.HeatMap)
            {
                var pointViewModel = new ImportViewModel()
                {
                    TargetFilePath = importModel.TargetFilePath,
                    UploadedLayerType = LayerType.Point,
                    SourceFile = importModel.SourceFile,
                    MapName = importModel.MapName,
                    LayerName = $"{importModel.LayerName}_point",
                    DatasourceName = importModel.DatasourceName,
                    LayerDescription = importModel.LayerDescription,
                    Projection = importModel.Projection,
                    IsPublic = importModel.IsPublic,
                    UserName = importModel.UserName,
                    Geometry = "point",
                    Extent = importModel.Extent,
                    NeedsRework = importModel.NeedsRework,
                    Message = importModel.Message,
                    IsValid = importModel.IsValid
                };
                CreateSaveLayer(pointViewModel);
            }
        }

        private void CreateSaveLayer(ImportViewModel importModel)
        {
            var mapOptions = new MapLoadingOptions() { UserName = importModel.UserName, MapFileName = importModel.MapName };
            var mapObj = LoadMapFileToMapObj(mapOptions);

            IMapfileBlock layerObj = CreateLayerObj(importModel, mapObj);

            NormalizeBlockScales(ref layerObj);

            if (importModel.UploadedLayerType == LayerType.HeatMap)
                GenerateHeatMapClasses(importModel, layerObj);
            else
            {
                var classObj = GenerateNewClass(importModel, layerObj);
                layerObj.blocks.Add(classObj);
            }

            mapObj.blocks.Add(((LayerObj)layerObj));
            SetCachedMapFile(importModel.UserName, mapObj);
            SaveMapFile(mapOptions, mapObj);
        }

        private void GenerateHeatMapClasses(ImportViewModel importModel, IMapfileBlock layerObj)
        {
            var numClasses = 1;
            int.TryParse(importModel.NumberClasses, out numClasses);
            if (numClasses > 1)
            {
                var inc = 255 / numClasses;
                var colors = importModel.ColorClasses.Split(',', StringSplitOptions.RemoveEmptyEntries);
                var random = new Random();
                var dmin = 0;
                var dmax = 0;
                var clmin = $"{colors[0]}";
                var clmax = colors[1];

                var classObj = ((LayerObj)layerObj).GetNewBlockInstance("CLASS");
                classObj.id = Guid.NewGuid().ToString("N");
                //classObj.entries.FirstOrDefault(e => e.name.Equals("NAME", StringComparison.InvariantCultureIgnoreCase)).value = $"FROM-{dmin}-TO-{dmax}";
                for (var i = 0; i < numClasses; i++)
                {
                    dmin = (i * inc);
                    dmax = (i == numClasses - 1) ? 255 : dmax + inc;
                    clmin = (i == 0) ? $"#FFFFFF00" : $"{colors[i - 1]}";
                    clmax = colors[i];

                    var style = new StyleObj();
                    var colorRange = DeepClone(_entryOptions.STYLE.FirstOrDefault(s => s.name.Equals("COLORRANGE")));
                    var dataRange = DeepClone(_entryOptions.STYLE.FirstOrDefault(s => s.name.Equals("DATARANGE")));
                    colorRange.value = $"{clmin} {clmax}";
                    dataRange.value = $"{dmin} {dmax}";
                    style.entries.Add(colorRange);
                    style.entries.Add(dataRange);
                    classObj.blocks.Add(style);
                }
                
                layerObj.blocks.Add(classObj);
            }
            NormalizeProcessingDirective(ref layerObj);
        }

        private IMapfileBlock GenerateNewClass(ImportViewModel importModel, IMapfileBlock layerObj)
        {
            var classObj = ((LayerObj)layerObj).GetNewBlockInstance("CLASS");
            classObj.id = Guid.NewGuid().ToString("N");
            ((ClassObj)classObj).AddDefaultEntries(importModel.UploadedLayerType, _entryOptions.CLASS);

            var styleObj = classObj.GetNewBlockInstance("STYLE");
            styleObj.id = Guid.NewGuid().ToString("N");
            ((StyleObj)styleObj).AddDefaultEntries(importModel.UploadedLayerType, _entryOptions.STYLE);

            classObj.blocks.Add(styleObj);

            return classObj;
        }

        private void SetCachedMapFile(string key, MapObj mapObj)
        {
            _cache.Remove(key);
            _cache.Set(key, mapObj);
        }

        private IMapfileBlock CreateLayerObj(ImportViewModel importModel, MapObj mapObj)
        {
            var layerObj = mapObj.AddLayer(importModel, _runtimeOptions.MapFileConnectionString);
            layerObj.id = Guid.NewGuid().ToString("N");
            ((LayerObj)layerObj).order = mapObj.getLastLayerOrder() + 1;

            ((LayerObj)layerObj).AddDefaultEntries(importModel.UploadedLayerType, _entryOptions.LAYER);
            ((LayerObj)layerObj).AddProjection(importModel.Projection);

            //if (importModel.UploadedLayerType.Equals(LayerType.HeatMap))
            //    ((LayerObj)layerObj).AddConnectionLayer(importModel.ConnectionLayer);

            return layerObj;
        }

        private void AddBlockToObjectRecursive(MapEntryRequest dto, List<IMapfileBlock> blocks)
        {
            if (blocks == null) return;
            foreach (var t in blocks)
            {
                var innerBlocks = t.blocks;
                var blk = innerBlocks.Find(b => b.id.Equals(dto.objectid));
                if (blk != null)
                {
                    var blockObj = addBlockToParent(dto, (AbsMapfileBlock)blk);
                    break;
                }

                AddBlockToObjectRecursive(dto, innerBlocks);
            }
        }

        private static void AddEntryWithRecursion(MapEntryRequest dto, MapfileEntry entry, List<IMapfileBlock> blocks)
        {
            if (blocks == null) return;
            for (var i = 0; i < blocks.Count; i++)
            {
                
                if (!string.IsNullOrEmpty(blocks[i].id) && blocks[i].id.Equals(dto.objectid))
                {
                    blocks[i].entries.Add(entry);
                    break;
                }

                AddEntryWithRecursion(dto, entry, blocks[i].blocks);
            }
        }

        private bool SaveMapFile(MapLoadingOptions mapLoadingOptions, MapObj mapObj)
        {
            try
            {
                var mapfileContent = mapObj.ToString();
                lock (Locker)
                {
                    var pathfile = Path.Combine(_runtimeOptions.UserMapFilesLocation, mapLoadingOptions.UserName, mapLoadingOptions.MapFileName + ".map");
                    File.WriteAllText(pathfile, mapfileContent);
                }
                LogMapFile(mapLoadingOptions, mapfileContent);
                return true;

            }
            catch
            {
                return false;
            }
        }

        private void LogMapFile(MapLoadingOptions mapLoadingOptions, string mapfileContent)
        {
            var o = Observable.Start(() =>
            {
                _userManager.LogMapStateAsync(mapLoadingOptions.UserName, mapLoadingOptions.MapFileName, mapfileContent);

            }).Finally(() => ConsoleHelper.Info("Map file loged to historic logs table."));
            o.Wait();
            
        }


        private static void AddSymbolIfNeed(LayerType layertype, ref MapObj mapObj, StyleObj style)
        {
            if (layertype == LayerType.Point)
            {
                var sym = mapObj.blocks.Find(b => b.name.Equals("SYMBOL", StringComparison.InvariantCultureIgnoreCase));
                var existSym = sym?.entries.Find(e => e.name.Equals("name", StringComparison.InvariantCultureIgnoreCase) && e.value.Equals("circle", StringComparison.InvariantCultureIgnoreCase));

                if (existSym == null)
                    mapObj.blocks.Insert(1, mapObj.AddDefaultSymbol());

                style.entries.Add(new MapfileEntry() { name="SYMBOL", value = "circle", allowMultiplesInstances=false, id = Guid.NewGuid().ToString("N"), quoteValue=true, valueType=VALUETYPE._string });
                style.entries.Add(new MapfileEntry() { name = "SIZE", value = "1", allowMultiplesInstances = false, id = Guid.NewGuid().ToString("N"), quoteValue = false, valueType = VALUETYPE._int });
            }
        }

        private AbsMapfileBlock findBlockForUpdate(MapObj mapObj, MapEntryRequest dto)
        {
            if (!dto.objtype.Equals("LAYER"))
                return mapObj;

            var layerBlocks = mapObj.blocks.Where(x => x.name.Equals("LAYER")).ToList();
            var layer = (AbsMapfileBlock)layerBlocks.FirstOrDefault(x => x.id.Equals(dto.layerid));
            if (layer != null)
                return layer;
            else
                return mapObj;

        }

        private MapfileEntry FromDtoToMapfileEntry(MapEntryRequest dto)
        {
            var entry = new MapfileEntry()
            {
                id = dto.entry.id,
                name = dto.entry.name,
                value = dto.entry.value,
                hasEnd = dto.entry.hasEnd,
                defValue = dto.entry.defValue,
                readOnly = dto.entry.readOnly,
                quoteName = dto.entry.quoteName,
                setValues = dto.entry.setValues,
                valueType = dto.entry.valueType,
                braketAttr = dto.entry.braketAttr,
                quoteValue = dto.entry.quoteValue,
                canUseAttribute = dto.entry.canUseAttribute,
                includeAsDefault = dto.entry.includeAsDefault,
                allowMultiplesInstances = dto.entry.allowMultiplesInstances
            };
            return entry;
        }

        private void deleteBlock(AbsMapfileBlock mapblock, MapfileEntry entry)
        {
            foreach (var b in mapblock.blocks)
            {
                if (!string.IsNullOrEmpty(b.id) && b.id.Equals(entry?.id))
                {
                    mapblock.blocks.Remove(b);
                    break;
                }
            }

            foreach (var b in mapblock.blocks)
            {
                deleteBlock(b as AbsMapfileBlock, entry);
            }

        }
        private void findAndUpdateEntry(AbsMapfileBlock mapblock, MapfileEntry entry, bool deleteEntry)
        {
            foreach (var e in mapblock.entries)
            {
                if (!string.IsNullOrEmpty(e.id) && e.id.Equals(entry?.id))
                {
                    if (deleteEntry)
                        mapblock.entries.Remove(e);
                    else
                        e.value = entry.value;

                    break;
                }
            }

            foreach (var b in mapblock.blocks)
            {
                findAndUpdateEntry(b as AbsMapfileBlock, entry, deleteEntry);
            }

        }

        private List<MapfileEntry> GetEntries(string blockName, LayerType layerType)
        {
            var result = new List<MapfileEntry>();
            result = ((List<MapfileEntry>)_entryOptions[blockName]);
            return (result==null) ? null : DeepClone(result);
        }

        private IMapfileBlock FillBlockEntries(IMapfileBlock block, IReadOnlyList<string> lines, string entryName, int index, LayerType layerType, string userName)
        {
            var blockEntries = GetEntries(block.name, layerType);
            string trimedLine;
            var forceAdd = false;
            var ltype = layerType;
            _curIndex = index - 1;
            do
            {
                _curIndex++;
                trimedLine = GetTrimedLine(lines);

                if (trimedLine.StartsWith("END")) break;
                if (string.IsNullOrEmpty(trimedLine) || trimedLine.StartsWith("#")) continue;

                bool isBlockStart = _entryOptions.BlockNames.IndexOf(trimedLine.ToUpper(), StringComparison.CurrentCultureIgnoreCase) >= 0;
                if (isBlockStart)
                {
                    AddInnerBlock(block, lines, trimedLine, ltype, userName);
                    continue;
                }

                forceAdd = ResolveEntryNameAndValue(entryName, trimedLine, forceAdd, out string eValue, out string eName);

                if (eName.Equals("END"))
                    break;

                MapfileEntry entry = AddResolvedEntry(block, blockEntries, forceAdd, eValue, eName, _curIndex.ToString());

                forceAdd = false;

                if (!(block is LayerObj))
                    continue;

                if (eName.Equals("TYPE"))
                {
                    ltype = (block as LayerObj).ResolveLayerType(entry?.value);
                    (block as LayerObj).LayerType = entry?.value;
                }
                if (eName.Equals("NAME"))
                {
                    (block as LayerObj).LayerName = entry?.value;
                }
                if (eName.Equals("DATA"))
                {
                    (block as LayerObj).DatasourceName = GetDataSourceName(userName, entry?.value);
                }
                

            } while (!trimedLine.Equals("END"));

            NormalizeBlockScales(ref block);
            NormalizeProcessingDirective(ref block);
            if (block is LayerObj) NormalizeDataSource(ref block);
            return block;
        }

        private void NormalizeDataSource(ref IMapfileBlock block) {
            if(string.IsNullOrEmpty((block as LayerObj).DatasourceName)) {
                if (block.entries.Any(e => e.name.Equals("CONNECTIONTYPE") && e.value.Equals("kerneldensity", StringComparison.InvariantCultureIgnoreCase)))
                {
                    (block as LayerObj).DatasourceName = $"^{block.entries.FirstOrDefault(e => e.name.Equals("CONNECTION"))?.value}";
                }
            }
        }

        public string GetDataSourceName(string username, string value)
        {
            if (string.IsNullOrEmpty(value))
                return string.Empty;

            var result = string.Empty;
            var reg1 = new Regex($@"({username}\.)+");
            var reg2 = new Regex("\\)");
            var arr = reg1.Split(value);
            if (arr.Length > 2)
                arr = reg2.Split(arr[2]);
            if (arr.Length > 0)
                result = arr[0];
            return result;
        }

        private void NormalizeProcessingDirective(ref IMapfileBlock block)
        {
            if (!block.entries.Any(e => e.name.Equals("PROCESSING")))
                return;

            var allProcessing = block.entries.Where(e => e.name.Equals("PROCESSING")).ToList();
            var lst = new List<string>();
            foreach (var e in allProcessing) {
                lst.Add(e.value);
                block.entries.Remove(e);
            }

            var normalizedProcessing = new MapfileEntry
            {
                id = Guid.NewGuid().ToString("N"), //_curIndex.ToString(),
                name = "PROCESSING",
                value = string.Join("|", lst.ToArray()),
                defValue = "",
                quoteName = false,
                quoteValue = false,
                valueType = VALUETYPE._processing,
                help = "Processing directives",
            };
            
            block.entries.Add(normalizedProcessing);
        }

        private static MapfileEntry AddResolvedEntry(IMapfileBlock block, List<MapfileEntry> blockEntries, bool forceAdd, string eValue, string eName, string id)
        {
            var s1 = eName;
            var entry = DeepClone(blockEntries?.Find(e => e.name.Equals(s1) || e.name.Equals(s1)));

            if (entry != null || forceAdd)
            {
                if (entry != null)
                {
                    entry.value = (entry.name.ToUpper().Equals("WRAP")) ? eValue : eValue.Replace("\t", "").TrimStart();
                    entry.id = Guid.NewGuid().ToString("N"); //id;
                    block.entries.Add(entry);
                }
            }

            return entry;
        }

        private static bool ResolveEntryNameAndValue(string entryName, string trimedLine, bool forceAdd, out string value, out string s)
        {
            switch (entryName.ToUpper())
            {
                case "PROJECTION":
                    s = "";
                    value = trimedLine;
                    break;
                case "POINTS":
                case "PATTERN":
                    s = "";
                    value = trimedLine;
                    forceAdd = true;
                    break;
                default:
                    var l = trimedLine.IndexOfAny(new[] { ' ', '\t' });
                    //var regIndex = Regex.Match(trimedLine, "[^\" ]+| (\"[^\"]*\")").Index;

                    if (l >= 0)
                    {
                        s = trimedLine.Substring(0, l).TrimStart().ToUpper();
                        value = trimedLine.Substring(l);
                    }
                    else
                    {
                        s = "#" + trimedLine;
                        value = "";
                    }
                    break;

            }

            if (s == "COLOR" || s == "OUTLINECOLOR" || s == "OFFSITE")
                value = NormalizeColorEntry(value);

            if (s.Equals("COLORRANGE"))
                value = NormalizeRangeColorEntry(value);

            return forceAdd;
        }

        private void AddInnerBlock(IMapfileBlock block, IReadOnlyList<string> lines, string trimedLine, LayerType ltype, string userName)
        {
            if (block is WebObj) {
                (block as WebObj).Imagepath = _runtimeOptions.ImagePath;
                (block as WebObj).Imageurl = _runtimeOptions.ImageUrl;
            }
            var innerBlock = block.GetNewBlockInstance(trimedLine.ToUpper());
            
            if (trimedLine.Equals("LAYER", StringComparison.InvariantCultureIgnoreCase))
                ((LayerObj)innerBlock).order = ((AbsMapfileBlock)block).blocks.Count(b => b.name.Equals("LAYER")) + 1;

            var childBlock = FillBlockEntries(innerBlock, lines, trimedLine, _curIndex + 1, ltype, userName);
            childBlock.id = Guid.NewGuid().ToString("N"); //_curIndex.ToString();
            (block as AbsMapfileBlock)?.blocks.Add(childBlock);
        }

        private string GetTrimedLine(IReadOnlyList<string> lines)
        {
            var exception = new string[] { "expression", "filter", "text", "utfdata", "geomtransform" };
            var trimLine = lines[_curIndex].TrimStart();
            if (Regex.IsMatch(trimLine, @"\bEXPRESSION\s|\bFILTER\s|\bTEXT\s|\BUTFDATA|\bGEOMTRANSFORM", RegexOptions.IgnoreCase)) //!trimLine.Contains("EXPRESSION") && !trimLine.Contains("TEXT"))
                return trimLine;
            else
                trimLine = trimLine.TrimEnd().Replace("\"", "").Replace("'", "");

            return trimLine;
        }

        private static string NormalizeColorEntry(string value)
        {
            var hexvalue = value.Replace("\t", "").TrimStart();
            if (!Regex.Match(hexvalue, REGCOLOR).Success)
            {
                var cm = value.Replace("\t", "").TrimStart().IndexOf("#", StringComparison.Ordinal);
                if (cm > 0) value = value.Substring(0, cm);
                var arr = value.TrimStart().Split(" ");
                Color myColor = Color.FromArgb(int.Parse(arr[0]), int.Parse(arr[1]), int.Parse(arr[2]));
                value = "#" + myColor.R.ToString("X2") + myColor.G.ToString("X2") + myColor.B.ToString("X2");
            }

            return value;
        }

        private static string NormalizeRangeColorEntry(string value)
        {
            var hexvalue = value.Replace("\t", "").TrimStart();
            if (hexvalue.StartsWith("#") || hexvalue.StartsWith("'#"))
            {
                var hexArr = hexvalue.Replace("'", "").Split(" ");
                if (hexArr.Length == 2 && Regex.Match(hexArr[0], REGCOLOR).Success && Regex.Match(hexArr[1], REGCOLOR).Success)
                    return value;
            }
            var cm = value.Replace("\t", "").TrimStart().IndexOf("#", StringComparison.Ordinal);
            if (cm > 0) value = value.Substring(0, cm);
            var arr = value.TrimStart().Split(" ");
            Color myColor1 = Color.FromArgb(int.Parse(arr[0]), int.Parse(arr[1]), int.Parse(arr[2]));
            Color myColor2 = Color.FromArgb(int.Parse(arr[3]), int.Parse(arr[4]), int.Parse(arr[5]));
            value = $"'#{myColor1.R.ToString("X2")}{myColor1.G.ToString("X2")}{myColor1.B.ToString("X2")}'" + $"'#{myColor2.R.ToString("X2")}{myColor2.G.ToString("X2")}{myColor2.B.ToString("X2")}'";


            return value;
        }

        private void NormalizeBlockScales(ref IMapfileBlock block)
        {
            if (!block.entries.Any(e => e.name.Equals("MAXSCALEDENOM") || e.name.Equals("MINSCALEDENOM")))
                return;

            var maxScale = "99999999999";
            var minScale = "0";
            var maxScaleEntry = block.entries.Find(e => e.name.Equals("MAXSCALEDENOM"));
            var minScaleEntry = block.entries.Find(e => e.name.Equals("MINSCALEDENOM"));
            if (maxScaleEntry != null) maxScale = maxScaleEntry.value;
            if (minScaleEntry != null) minScale = minScaleEntry.value;
            var normalizedScale = new MapfileEntry
            {
                id = Guid.NewGuid().ToString("N"), //_curIndex.ToString(),
                name = "ZOOM-LEVEL",
                value = minScale + "|" + maxScale,
                defValue = "0|999999999",
                quoteName = false,
                quoteValue = false,
                valueType = VALUETYPE._scaledenom,
                help = "Minimun and mazimun zoom levels which this OBJECT is drawn/valid",
            };
            block.entries.Remove(maxScaleEntry);
            block.entries.Remove(minScaleEntry);
            block.entries.Add(normalizedScale);

        }

        public static T DeepClone<T>(T obj)
        {
            using (var ms = new MemoryStream())
            {
                var formatter = new BinaryFormatter();
                formatter.Serialize(ms, obj);
                ms.Position = 0;

                return (T)formatter.Deserialize(ms);
            }
        }

    }
}
