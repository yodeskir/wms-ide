using System.Linq;
using System.Threading.Tasks;
using mapfileManager;
using mapfileManager.Interfaces;
using mapfileManager.mapfile;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using wms_ide.Models;
using wmsDataAccess.LayerManagement;
using WMSDataAccess.UserManagement;
using wmsShared.Model;

namespace wms_ide.Api
{
    [Produces("application/json")]
    [Route("api/layers")]
    public class LayerController : Controller
    {
        private readonly IUserManager _userManager;
        private readonly ILayerManager _layerManager;
        private readonly IMapFileManager _mapFileManager;

        public LayerController(IUserManager userManager, ILayerManager layerManager, IMapFileManager mapFileManager)
        {
            _userManager = userManager;
            _layerManager = layerManager;
            _mapFileManager = mapFileManager;
        }

        [HttpGet("menu/{username}/{mapname}")]
        public JsonResult GetLayersMenu([FromRoute] string username, [FromRoute] string mapname)
        {
            var mapOptions = new MapLoadingOptions() { UserName = username, MapFileName = mapname };
            var layers = _mapFileManager.GetLayers(mapOptions);
            var result = layers.Select(l => new MenuModel
            {
                id = l.id,
                layerName = l.entries.FirstOrDefault(e => e.name.Equals("NAME"))?.value,
                datasourceName = _mapFileManager.GetDataSourceName(username, l.entries.FirstOrDefault(e => e.name.Equals("DATA"))?.value),
                status = l.entries.FirstOrDefault(e => e.name.Equals("STATUS"))?.value ?? "OFF",
                active = false
            }).ToList();

            return Json(result);
        }

        [HttpGet("all/{username}")]
        public JsonResult GetLayers([FromRoute] string username)
        {
            return Json(_userManager.GetUserLayers(username));
        }

        [HttpGet("{username}/{layername}")]
        public JsonResult GetLayer([FromRoute] string username, [FromRoute] string layername)
        {
            return Json(_userManager.GetUserLayer(username, layername));
        }

        [HttpGet("fields/{username}/{layername}")]
        public JsonResult GetLayerFields([FromRoute] string username, string layername)
        {
            return Json(_userManager.GetUserLayerFields(username, layername.Split(",")));
        }

        [HttpGet("numericfields/{username}/{layername}")]
        public JsonResult GetNumericLayerFields([FromRoute] string username, string layername)
        {
            return Json(_userManager.GetNumericUserLayerFields(username, layername));
        }

        [HttpPost("{username}/{datasource}/data")]
        public JsonResult GetLayerData([FromRoute] string username, [FromRoute] string datasource, [FromBody] LayerDataRequestModel layerDataRequestModel)
        {
            if (datasource == null || datasource.Equals("null")) return null;
            
            return Json(_layerManager.GetLayerData(username, datasource.ToLower(), layerDataRequestModel));
        }


        [HttpPost("togeometry/{username}/{layername}/{projection}")]
        public async Task<JsonResult> LatLonToGeom([FromRoute] string username, [FromRoute] string layername, [FromRoute] string projection, [FromBody] string[] latlon)
        {
            var result = await _userManager.LatLonToGeomAsync(username, layername, projection, latlon);
            return Json(result);
        }


        public IActionResult Index()
        {
            return View();
        }
    }
}