using System.Collections.Generic;
using wmsShared.Interfaces;
using wmsShared.Model;

namespace mapfileManager.mapfile
{
    public class MetadataObj : AbsMapfileBlock, IMapfileBlock
    {

        #region public properties
        public override string name => "METADATA";

        public override string endName => "END";

        VALUETYPE IMapfileEntry.valueType => VALUETYPE._block;

        public override List<MapfileEntry> entries { get; set; } = new List<MapfileEntry>();
        public override List<IMapfileBlock> blocks { get; set; } = new List<IMapfileBlock>();

        #endregion

        #region public methods


        public override IMapfileBlock GetNewBlockInstance(string blockName)
        {
            return null;
        }


        #endregion

    }
}
