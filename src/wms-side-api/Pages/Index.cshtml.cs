﻿using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;

namespace wms_ide.Pages
{
    public class IndexModel : PageModel
    {
        public async Task<IActionResult> OnGetAsync(int id)
        {
            return Page();
        }
    }
}
