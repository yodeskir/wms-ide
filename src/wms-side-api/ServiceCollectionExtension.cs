using fileManager;
using mapfileManager;
using mapfileManager.Interfaces;
using mapfileManager.mapfile;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using wmsDataAccess.LayerManagement;
using WMSDataAccess;
using WMSDataAccess.UserManagement;
using WMSDataAccess.UserManagement.DBContexts;
using wmsShared.Interfaces;
using wmsShared.Model;
using WMSTools;

namespace wms_ide
{
    public static class ServiceCollectionExtension
    {
        public static IServiceCollection RegisterServices(this IServiceCollection services, IConfiguration configuration)
        {
            var optionsConnectionString = configuration.GetConnectionString("UsersDatabase");

            var serviceCollection =  services.AddEntityFrameworkNpgsql().AddDbContext<UserDBContext>(options => options.UseNpgsql(optionsConnectionString));
            services.Configure<RuntimeOptions>(options =>
            {
                options.ConnectionString = optionsConnectionString;
            })
            .Configure<MapServerRuntimeOptions>(options =>
            {
                options.ConnectionString = optionsConnectionString;
                options.MapFileConnectionString = configuration.GetConnectionString("MSDatabase");
                options.GlobalMapFilesLocation = configuration["GlobalMapFilesLocation"];
                options.UserMapFilesLocation = configuration["UserMapFilesLocation"];
                options.MsErrorFile = configuration["MS_ERRORFILE"];
                options.PrjFile = configuration["PROJ_FILE"];
                options.ImagePath = configuration["IMAGEPATH"];
                options.ImageUrl = configuration["IMAGEURL"];
                options.FontSet = configuration["FONTSET"];
                options.ShapePath = configuration["SHAPEPATH"];
            })
            .Configure<MapEntriesRuntimeOptions>((entryOptions =>
            {
                var blockNames = configuration["BlockNames"]; ;
                entryOptions.BlockNames = blockNames;
                foreach (var blk in blockNames.Split(","))
                {
                    var valuesSection = configuration.GetSection($"WMSSTYLE:{blk}");
                    foreach (IConfigurationSection section in valuesSection.GetChildren())
                    {
                        ((List<MapfileEntry>)entryOptions[blk]).Add(getEntryFromSection(section));
                    }
                }
            }))
            .Configure<MapDirectivesRuntimeOptions>((entryOptions =>
            {
                var blockNames = configuration["DirectiveGroupNames"]; ;
                foreach (var blk in blockNames.Split(","))
                {
                    var valuesSection = configuration.GetSection($"PROCESSING:{blk}");
                    foreach (IConfigurationSection section in valuesSection.GetChildren())
                    {
                        ((List<MapfileEntry>)entryOptions[blk]).Add(getEntryFromSection(section));
                    }
                }
            }))
            .AddTransient<IUserManager, UserManager>()
            .AddTransient<ILayerManager, LayerManager>()
            .AddTransient<ILayerDatasourceManager, LayerDatasourceManager>()
            .AddTransient<IUserDBContextFactory, UserDBContextFactory>()
            .AddTransient<IMapServerOptions, MapServerOptions>()
            .AddTransient<IMapFileManager, MapFileManager>()
            .AddTransient<WebObj>()
            .AddTransient<LayerObj>()
            .AddTransient<ProjectionObj>()
            .AddTransient<ScalebarObj>()
            .AddTransient<SymbolObj>()
            .AddTransient<LegendObj>()
            .AddTransient<IOgrCommand, OgrImporterCommand>(o => new OgrImporterCommand(configuration["OgrPath"]));

            return serviceCollection;
        }

        private static MapfileEntry getEntryFromSection(IConfigurationSection section)
        {
            return new MapfileEntry()
            {
                name = section.GetValue<string>("name"),
                valueType = section.GetValue("valueType", VALUETYPE._string),
                quoteName = section.GetValue("quoteName", false),
                quoteValue = section.GetValue("quoteValue", false),
                defValue = section.GetValue<string>("defValue"),
                readOnly = section.GetValue("readOnly", false),
                setValues = section.GetValue<string>("setValues"),
                braketAttr = section.GetValue("braketAttr", false),
                includeAsDefault = section.GetValue("showByDefault", false),
                canUseAttribute = section.GetValue<bool>("canUseAttribute"),
                hasEnd = section.GetValue("hasEnd", false),
                allowMultiplesInstances = section.GetValue("allowMultiplesInstances", false),
                help = section.GetValue<string>("help", ""),
            };
        }
    }
}
