using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using wms_ide.Utils;
using WMSDataAccess.UserManagement;
using WMSDataAccess.UserManagement.Entities;

namespace wms_ide.Pages
{
    public class RegisterModel : PageModel
    {
        private readonly IUserManager userManager;

        public RegisterModel(IUserManager userManager)
        {
            this.userManager = userManager;
        }

        public IActionResult OnGet()
        {
            return Page();
        }

        [BindProperty]
        public WMSUser WMSUser { get; set; }

        public async Task<IActionResult> OnPostAsync()
        {
            if (!ModelState.IsValid)
            {
                return Page();
            }
            var salt = hashHelper.getSalt();
            var hash = hashHelper.getHash(WMSUser.password + WMSUser.salt);
            await userManager.CreateUser(WMSUser.username, WMSUser.useremail, WMSUser.userfullname, salt, hash);
            
            return RedirectToPage("./Index");
        }
    }
}