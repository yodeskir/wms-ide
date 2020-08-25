using System;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Caching.Memory;
using WMSDataAccess.UserManagement.DBContexts;
using mapfileManager.Interfaces;

namespace wms_ide
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration ?? throw new ArgumentNullException(nameof(Configuration));
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddCors(options =>
            {
                options.AddPolicy("AllowOrigins",
                    builder => builder
                    .WithOrigins("http://localhost:4200")
                    .WithOrigins("http://appgis.eastus.cloudapp.azure.com")
                    .WithOrigins("http://appgis.com")
                    .AllowAnyMethod()
                    .AllowAnyHeader()
                    .AllowCredentials());
            });

            services.Configure<CookiePolicyOptions>(options =>
            {
                // This lambda determines whether user consent for non-essential cookies is needed for a given request.
                options.CheckConsentNeeded = context => true;
                options.MinimumSameSitePolicy = SameSiteMode.None;
            });

            services.AddHttpContextAccessor();
            services.AddMvc(options =>
                 options.Filters.Add(new IgnoreAntiforgeryTokenAttribute())
            );

            services.RegisterServices(Configuration);

        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IMemoryCache cache, IUserDBContextFactory userDBContextFactory, IMapFileManager mapFileManager)
        {
            app.UseExceptionHandler("/Error");
            app.UseHsts();
            
            app.UseStaticFiles();
            app.UseCookiePolicy();
            app.UseCors("AllowOrigins");
            app.UseRouting();
            app.UseEndpoints(endpoints => {
                endpoints.MapControllers();
                endpoints.MapControllerRoute(
                    name: "default",
                    pattern: "{controller=Home}/{action=Index}/{id?}");
            });
        }
    }
}
