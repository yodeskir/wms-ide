using System;
using System.Collections.Generic;
using wmsShared.Model;
using wmsShared.Interfaces;

namespace mapfileManager.mapfile
{
    public class ClusterObj : AbsMapfileBlock, IMapfileBlock
    {
        #region public properties
        public override string name => "CLUSTER";

        public override string endName => "END";

        VALUETYPE IMapfileEntry.valueType => VALUETYPE._block;
        public override List<MapfileEntry> entries { get; set; } = new List<MapfileEntry>();
        public override List<IMapfileBlock> blocks { get; set; } = new List<IMapfileBlock>();
        
        #endregion


        #region public methods
        public override void AddDefaultEntries(LayerType ltype, List<MapfileEntry> allEntries)
        {
            base.AddDefaultEntries(ltype, allEntries);
        }
        public override IMapfileBlock GetNewBlockInstance(string blockName)
        {
            throw new NotImplementedException();
        }


        #endregion

    }
}
