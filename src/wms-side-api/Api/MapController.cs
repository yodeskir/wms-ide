using Microsoft.AspNetCore.Mvc;
using WMSDataAccess.UserManagement;
using WMSDataAccess.UserManagement.Entities;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace wms_ide.Api
{
    [Produces("application/json")]
    [Route("api/maps")]
    public class MapsController : Controller
    {
        private readonly IUserManager userManager;

        public MapsController(IUserManager userManager)
        {
            this.userManager = userManager;
        }

        [HttpGet("{username}")]
        public JsonResult GetMaps([FromRoute] string username)
        {
            return Json(userManager.GetUserMaps(username));
        }

        [HttpGet("{mapid}")]
        public JsonResult Get([FromRoute]  int mapid)
        {
            return Json(userManager.GetMap(mapid));
        }


        [HttpPost]
        [Route("save")]
        public void Post([FromBody]WMSMaps value)
        {
            userManager.UpdateMapAsync(value);
        }

        [HttpDelete("{id}")]
        public void Delete(int id)
        {
        }
    }
}
