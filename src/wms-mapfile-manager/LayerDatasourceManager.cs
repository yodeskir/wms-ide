using fileManager;
using mapfileManager.Interfaces;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using WMSDataAccess.UserManagement;
using wmsShared.Interfaces;
using wmsShared.Model;

namespace mapfileManager
{
    public class LayerDatasourceManager: ILayerDatasourceManager
    {
        private readonly IUserManager _userManager;
        private readonly IOgrCommand _importer;
        private readonly IConfiguration _configuration;
        private readonly IMapFileManager _mapFileManager;

        public LayerDatasourceManager(IUserManager userManager, IMapFileManager mapFileManager, IOgrCommand importer, IConfiguration configuration)
        {
            _userManager = userManager;
            _mapFileManager = mapFileManager;
            _importer = importer;
            _configuration = configuration;
        }

        public async Task<IMapfileBlock> AddNewLayerFromUpload(ImportViewModel importModel)
        {
            if (importModel.IsValid)
            {
                ImportToPostgresqlDb(importModel);

                if (importModel.IsValid)
                {
                    await _userManager.CreateUserLayer(importModel);

                    return _mapFileManager.InsertLayerFromImport(importModel);
                }
            }
            return GetCachedMapfile(importModel);
        }

        private IMapfileBlock GetCachedMapfile(ImportViewModel importModel)
        {
            var mapOptions = new MapLoadingOptions() { UserName = importModel.UserName, MapFileName = importModel.MapName };
            return _mapFileManager.GetMapFileObj(mapOptions);
        }

        public async Task<bool> DeleteLayer(string username, string layername)
        {
            return await _userManager.DeleteUserLayerAsync(username, layername);

        }

        private void ImportToPostgresqlDb(ImportViewModel importModel)
        {
            var shpFilename = Path.GetFileName(importModel.TargetFilePath);

            var (valid, message) = _importer.Execute(importModel.TargetFilePath, importModel.DatasourceName, importModel.UserName, _configuration.GetConnectionString("OgrDatabase"));
            importModel.IsValid = valid;
            if (valid)
            {
                var ext = Path.GetExtension(shpFilename);
                if (ext.Equals(".csv"))
                {
                    importModel.Geometry = "POINT";
                    importModel.NeedsRework = true;
                }
                else
                    importModel.Geometry = _importer.GetGeometryInfo(importModel.TargetFilePath, shpFilename.Substring(0, shpFilename.Length - 4));
            }
            else
            {
                importModel.Message = message;
            }
        }
    }
}
