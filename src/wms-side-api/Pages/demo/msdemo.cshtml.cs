using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using mapfileManager.mapfile;
using wms_ide.Models;

namespace wms_ide.Pages
{
    public class msDemoModel : PageModel
    {
        public MapViewModel mapModel = new MapViewModel();
        public IActionResult OnGet(int id)
        {
            this.mapModel.mapObj = new MapObj();
            return Page();
        }
    }
}
