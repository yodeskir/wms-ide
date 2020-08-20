using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using mapfileManager;
using mapfileManager.Interfaces;
using mapfileManager.mapfile;
using Microsoft.AspNetCore.Mvc;
using wms_ide.Models;
using wmsShared.Interfaces;
using wmsShared.Model;

namespace wms_ide.Api
{
    [Route("api/[controller]")]
    public class MapObjController : Controller
    {
        private readonly IMapFileManager _mapFileManager;
        private readonly ILayerDatasourceManager _layerDatasourceManager;

        public MapObjController(IMapFileManager mapFileManager, ILayerDatasourceManager layerDatasourceManager)
        {
            _mapFileManager = mapFileManager;
            _layerDatasourceManager = layerDatasourceManager;
        }

        [HttpGet("{mapname}")]
        public JsonResult GetGlobalMap([FromRoute] string mapname)
        {
            //TODO: needs to be reviewed
            // MapFile.LoadMapFile(null, mapname);
            return Json("");
        }

        [HttpGet("{username}/{mapname}")]
        public JsonResult GetMap([FromRoute] string username, [FromRoute] string mapname)
        {
            var mapOptions = new MapLoadingOptions() { UserName = username, MapFileName = mapname, ServerUrl= Response.HttpContext.Connection.RemoteIpAddress.ToString() };
            return Json(_mapFileManager.GetMapFileObj(mapOptions));
        }
        
        [HttpPost("map/{username}/{mapname}")]
        public JsonResult SetMapEntry([FromBody] MapEntryRequest dto)
        {            
            var mapOptions = new MapLoadingOptions() { UserName = dto.username, MapFileName = dto.name, ServerUrl = Response.HttpContext.Connection.RemoteIpAddress.ToString() };
            return Json(_mapFileManager.WriteMapFile(mapOptions, dto));
        }


        [HttpPost("newentry/{username}")]
        public JsonResult NewMapEntry([FromBody] MapEntryRequest dto)
        {
            var mapOptions = new MapLoadingOptions() { UserName = dto.username, MapFileName = dto.name, ServerUrl = Response.HttpContext.Connection.RemoteIpAddress.ToString() };
            var mapFile = _mapFileManager.AddEntry(mapOptions, dto);
            return Json(mapFile);

        }


        [HttpPost("newblock/{username}")]
        public JsonResult NewMapBlock([FromBody] MapEntryRequest dto)
        {
            var mapOptions = new MapLoadingOptions() { UserName = dto.username, MapFileName = dto.name, ServerUrl = Response.HttpContext.Connection.RemoteIpAddress.ToString() };
            var mapFile = _mapFileManager.AddBlock(mapOptions, dto);
            return Json(mapFile);
        }

        [HttpPost("cloneblock/{username}")]
        public JsonResult CloneMapBlock([FromBody] MapEntryRequest dto)
        {
            var mapOptions = new MapLoadingOptions() { UserName = dto.username, MapFileName = dto.name, ServerUrl = Response.HttpContext.Connection.RemoteIpAddress.ToString() };
            var result = _mapFileManager.DuplicateBlock(mapOptions, dto);
            return Json(result);

        }

        [HttpPost("removelayer/{username}")]
        public async Task<JsonResult> RemoveLayer([FromBody] MapEntryRequest dto)
        {
            var mapOptions = new MapLoadingOptions() { UserName = dto.username, MapFileName = dto.name, ServerUrl = Response.HttpContext.Connection.RemoteIpAddress.ToString() };
            var result = _mapFileManager.GetMapFileObj(mapOptions);
            // delete datasource and layer 
            if (dto.deleteDatasource)
            {
                var deleted = await _layerDatasourceManager.DeleteLayer(dto.username, _mapFileManager.GetLayerNameById(mapOptions, dto));
                if (deleted)
                    result = (MapObj)_mapFileManager.DeleteLayer(mapOptions, dto);
            } else // delete only the layer from mapfile
            {
                result = (MapObj)_mapFileManager.DeleteLayer(mapOptions, dto);
            }
            return Json(result);

        }

        [HttpPost("sort/{username}/{mapname}")]
        public JsonResult SortMapLayers([FromRoute] string username, [FromRoute] string mapname, [FromBody] string[] orderedlayers)
        {
            var mapOptions = new MapLoadingOptions() { UserName = username, MapFileName = mapname, ServerUrl = Response.HttpContext.Connection.RemoteIpAddress.ToString() };
            return Json(_mapFileManager.WriteMapFile(mapOptions, orderedlayers));
        }


        [HttpGet("MAP")]
        public JsonResult GetEntries()
        {
            return Json(_mapFileManager.GetEntries());
        }

        [HttpGet("DIRECTIVES")]
        public JsonResult GetDirectives()
        {
            return Json(_mapFileManager.GetProcessingDirectives());
        }

        //[HttpGet("WEB")]
        //public JsonResult GetWeb()
        //{
        //    var web = new WebObj();
        //    return Json(_mapFileManager.GetBlockEntries(web, LayerType.Autodetect));
        //}

        //[HttpGet("LAYER/{type}")]
        //public JsonResult GetLayers(LayerType ltype)
        //{
        //    var lyr = new LayerObj();
        //    return Json(_mapFileManager.GetBlockEntries(lyr, ltype));
        //}

        //[HttpGet("PROJECTION")]
        //public JsonResult GetProjection()
        //{
        //    var prj = new ProjectionObj();
        //    return Json(_mapFileManager.GetBlockEntries(prj, LayerType.Autodetect));
        //}


        //[HttpGet("SCALEBAR")]
        //public JsonResult GetScaleBar()
        //{
        //    var scale = new ScalebarObj();
        //    return Json(_mapFileManager.GetBlockEntries(scale, LayerType.Autodetect));
        //}


        //[HttpGet("SYMBOL")]
        //public JsonResult GetSymbol()
        //{
        //    var sym = new SymbolObj();
        //    return Json(_mapFileManager.GetBlockEntries(sym, LayerType.Autodetect));
        //}


        //[HttpGet("LEGEND")]
        //public JsonResult GetLegend()
        //{
        //    var leg = new LegendObj();
        //    return Json(_mapFileManager.GetBlockEntries(leg, LayerType.Autodetect));
        //}

        //[HttpGet("VALIDATION")]
        //public JsonResult GetValidation()
        //{
        //    var valid = new ValidationObj();
        //    return Json(_mapFileManager.GetBlockEntries(valid, LayerType.Autodetect));
        //}


        //[HttpGet("METADATA")]
        //public JsonResult GetMetadata()
        //{
        //    var meta = new MetadataObj();
        //    return Json(_mapFileManager.GetBlockEntries(meta, LayerType.Autodetect));
        //}


        //[HttpGet("CLUSTER")]
        //public JsonResult GetCluster()
        //{
        //    var clu = new ClusterObj();
        //    return Json(_mapFileManager.GetBlockEntries(clu, LayerType.Autodetect));
        //}

        //[HttpGet("GRID")]
        //public JsonResult GetGrid()
        //{
        //    var grd = new GridObj();
        //    return Json(_mapFileManager.GetBlockEntries(grd, LayerType.Autodetect));
        //}


        //[HttpGet("COMPOSITE")]
        //public JsonResult GetComposite()
        //{
        //    var cmp = new CompositeObj();
        //    return Json(_mapFileManager.GetBlockEntries(cmp, LayerType.Autodetect));
        //}


        //[HttpGet("CLASS/{type}")]
        //public JsonResult GetClass(LayerType ltype)
        //{
        //    var cls = new ClassObj();
        //    return Json(_mapFileManager.GetBlockEntries(cls, ltype));
        //}


        //[HttpGet("FEATURE")]
        //public JsonResult GetFeature()
        //{
        //    var feat = new FeatureObj();
        //    return Json(_mapFileManager.GetBlockEntries(feat, LayerType.Autodetect));
        //}


        //[HttpGet("LABEL")]
        //public JsonResult GetLabel()
        //{
        //    var label = new LabelObj();
        //    return Json(_mapFileManager.GetBlockEntries(label, LayerType.Autodetect));
        //}


        //[HttpGet("STYLE/{type}")]
        //public JsonResult GetStyle([FromQuery] LayerType ltype)
        //{
        //    var style = new StyleObj();
        //    return Json(_mapFileManager.GetBlockEntries(style, ltype));
        //}

        //[HttpGet("LEADER")]
        //public JsonResult GetLeader()
        //{
        //    var leader = new LeaderObj();
        //    return Json(_mapFileManager.GetBlockEntries(leader, LayerType.Autodetect));
        //}


        //private static void AddEntryToInnerObject(MapEntryRequest dto, MapfileEntry entry, List<IMapfileBlock> blocks)
        //{
        //    if (blocks == null) return;
        //    for (var i = 0; i < blocks.Count; i++)
        //    {
        //        var cls = blocks[i].blocks.Find(e => e.id.Equals(dto.objectid));
        //        if (cls != null)
        //        {
        //            cls.entries.Add(entry);
        //            break;
        //        }

        //        AddEntryToInnerObject(dto, entry, blocks[i].blocks);
        //    }
        //}

    }
}