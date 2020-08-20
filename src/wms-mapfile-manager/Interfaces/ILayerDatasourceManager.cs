using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using wmsShared.Interfaces;
using wmsShared.Model;

namespace mapfileManager.Interfaces
{
    public interface ILayerDatasourceManager
    {
        Task<IMapfileBlock> AddNewLayerFromUpload(ImportViewModel importModel);
        Task<bool> DeleteLayer(string username, string layername);
    }
}
