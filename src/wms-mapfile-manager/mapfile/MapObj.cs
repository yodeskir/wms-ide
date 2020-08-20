using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Net;
using System.Text;
using System.Text.RegularExpressions;
using mapfileManager.Interfaces;
using Microsoft.Extensions.Options;
using wmsShared.Interfaces;
using wmsShared.Model;

namespace mapfileManager.mapfile
{
    public class MapObj : AbsMapfileBlock, IMapfileBlock
    {
        #region privates properties

        private string _msErrorFilePath = "/var/www/appgiswms/tmp/";
        private string _prjFilePath = "/usr/share/proj/";
        private string _imagePath = "/var/www/appgiswms/tmp/";
        private string _imagUrl = "/tmp/";
        private string _fontSetFilePath = "/var/www/appgiswms/fonts/fonts.txt";
        private string _shapeFilePath = "maps/data/";
        private string _blockNames = "";

        private MapServerRuntimeOptions _runtimeOptions;
        private MapEntriesRuntimeOptions _entryOptions;
        private MapDirectivesRuntimeOptions _directiveOptions;

        private int curIndex { get; set; }
        private static readonly object Locker = new object();

        #endregion

        #region public properties

        private string GlobalMapFilesPath { get; set; }
        private string UserMapFilesPath { get; set; }
        public string UserName { get; set; }
        public string MapName { get; set; }

        public string MapFileError { get; set; }
        public string ConnStr { get; set; }

        public bool UseDefaulEntries { private get; set; }
        public override string name => "MAP";

        public override string endName => "END";

        VALUETYPE IMapfileEntry.valueType => VALUETYPE._block;

        #endregion

        #region constructor
        public MapObj()
        {

        }

        public MapObj(IMapServerOptions  options)
        {
            _runtimeOptions = options.GetRuntimeOptions();
            _entryOptions = options.GetEntryOptions();
            _directiveOptions = options.GetDirectivesOptions();

            GlobalMapFilesPath = _runtimeOptions.GlobalMapFilesLocation;
            UserMapFilesPath = _runtimeOptions.UserMapFilesLocation;
            ConnStr = _runtimeOptions.MapFileConnectionString;
            _msErrorFilePath = _runtimeOptions.MsErrorFile;
            _prjFilePath = _runtimeOptions.PrjFile;
            _imagePath = _runtimeOptions.ImagePath;
            _imagUrl = _runtimeOptions.ImageUrl;
            _fontSetFilePath = _runtimeOptions.FontSet;
            _shapeFilePath = _runtimeOptions.ShapePath;
            
            _blockNames = _entryOptions.BlockNames;
        }

        #endregion


        #region private methods
        
        internal int getLastLayerOrder()
        {
            return ((LayerObj)blocks.Last(b => b.name.Equals("LAYER"))).order;
        }
        #endregion

        #region public methods

        public IMapfileBlock AddWeb()
        {
            return blocks.Find(b => b.name.Equals("WEB")) ?? new WebObj();
        }

        private IMapfileBlock AddLayer()
        {
            return new LayerObj();
        }
        public IMapfileBlock AddLayer(ImportViewModel importViewModel, string cnnString)
        {
            return new LayerObj(importViewModel, cnnString, _directiveOptions);
        }
        public IMapfileBlock AddProjection(string projection)
        {
            return blocks.Find(b => b.name.Equals("PROJECTION")) ?? new ProjectionObj(projection);
        }
        public IMapfileBlock AddScalebar()
        {
            return blocks.Find(b => b.name.Equals("SCALEBAR")) ?? new ScalebarObj();
        }

        private IMapfileBlock AddLegend()
        {
            return blocks.Find(b => b.name.Equals("LEGEND")) ?? new LegendObj();
        }

        private IMapfileBlock AddSymbol()
        {
            var sym = blocks.Find(b => b.name.Equals("SYMBOL", StringComparison.InvariantCultureIgnoreCase));
            var existSym = sym?.entries.Find(e => e.name.Equals("name", StringComparison.InvariantCultureIgnoreCase) && e.value.Equals("circle", StringComparison.InvariantCultureIgnoreCase));
            return (existSym == null) ? new SymbolObj() : sym;
        }

        private IMapfileBlock AddMetadata()
        {
            return blocks.Find(b => b.name.Equals("METADATA")) ?? new MetadataObj();
        }

        private IMapfileBlock AddOutputFormat()
        {
            return new OutputFormatObj();
        }

        public IEnumerable<IMapfileBlock> GetLayers() {
            return blocks.Where(b=>b.name.Equals("LAYER")).ToList();
        }
        public override List<MapfileEntry> entries { get; set; } = new List<MapfileEntry>();
        public override List<IMapfileBlock> blocks { get; set; } = new List<IMapfileBlock>();


        public new string ToString(int tabOrder)
        {
            const string mapstr = "MAP\n";
            const char tab = '\t';
            var defEntries = entries;

            var stb = new StringBuilder();
            foreach (var e in defEntries)
            {
                var entryName = (e.quoteName) ? $"\"{e.name}\"" : $"{e.name}";
                var value = (string.IsNullOrEmpty(e.value)) ? e.defValue : e.value;

                if (string.IsNullOrEmpty(e.value) && string.IsNullOrEmpty(e.defValue))
                    continue;
                
                // fontset, shapepath, error file and projlib path are defined by runtime options
                if (e.name.Equals("FONTSET") || e.name.Equals("SHAPEPATH")) continue;
                if (e.name.Equals("CONFIG") && (e.value.Contains("MS_ERRORFILE") || e.value.Contains("PROJ_LIB"))) continue;

                if (e.valueType == VALUETYPE._keyvalue && e.quoteValue) {
                    var arrvalue = value.Split(" ");
                    for (var v=0;v<arrvalue.Length;v++) {
                        arrvalue[v] = $"\"{arrvalue[v]}\"";
                    }

                    value = string.Join(" ", arrvalue);
                }
                else
                    value = (e.quoteValue) ? $"\"{value}\"" : $"{value}";

                stb.AppendLine($"{tab}{entryName} {value}");
            }

            addDefaultConfigEntries(stb, tab);

            var generalBlocks = blocks.Where(b => !b.name.Equals("LAYER"));
            foreach (var b in generalBlocks)
            {
                stb.AppendLine(b.ToString(tabOrder));
            }

            var layerBlocks = blocks.Where(b => b.name.Equals("LAYER")).OrderBy(o => ((LayerObj)o).order);
            foreach (var b in layerBlocks) {
                stb.AppendLine(b.ToString(tabOrder));
            }

            stb.AppendLine(endName);
            return mapstr + stb;
        }

        private void addDefaultConfigEntries(StringBuilder stb, char tab)
        {
            stb.AppendLine($"{tab}FONTSET \"{_fontSetFilePath}\"");
            stb.AppendLine($"{tab}SHAPEPATH \"{_shapeFilePath}\"");
            stb.AppendLine($"{tab}CONFIG \"MS_ERRORFILE\" \"{Path.Combine(_msErrorFilePath, MapFileError)}\"");
            stb.AppendLine($"{tab}CONFIG \"PROJ_LIB\" \"{_prjFilePath}\"");
        }

        public override string ToString() {
            return ToString(0);
        }


        public IMapfileBlock AddDefaultSymbol()
        {
            var sym = new SymbolObj();
            sym.id = Guid.NewGuid().ToString("N");
            sym.AddDefaultEntries(LayerType.Point, null);
            return sym;
        }
        
        public override IMapfileBlock GetNewBlockInstance(string blockName)
        {
            IMapfileBlock block = null;
            switch (blockName)
            {
                case "MAP":
                    break;
                case "LAYER":
                    block = AddLayer();
                    break;
                case "LEGEND":
                    block = AddLegend();
                    break;
                case "METADATA":
                    block = AddMetadata();
                    break;
                case "OUTPUTFORMAT":
                    block = AddOutputFormat();
                    break;
                case "PROJECTION":
                    block = new ProjectionObj();
                    break;
                case "SCALEBAR":
                    block = new ScalebarObj();
                    break;
                case "SYMBOL":
                    block = AddSymbol();
                    break;
                case "WEB":
                    block = new WebObj();
                    break;
            }
            return block;
        }




        #endregion

    }
}
