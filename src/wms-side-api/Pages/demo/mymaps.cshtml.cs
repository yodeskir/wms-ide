using Microsoft.AspNetCore.Mvc.RazorPages;
using WMSDataAccess.UserManagement;

namespace wms_ide.Pages.demo
{
    public class mymapsModel : PageModel
    {
        private readonly IUserManager userManager;
        public mymapsModel(IUserManager userManager)
        {
            this.userManager = userManager;
        }

        public void OnGet()
        {
        }
    }
}