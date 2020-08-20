using System;
using System.Collections.Generic;
using wmsShared.Interfaces;
using wmsShared.Model;

namespace mapfileManager.mapfile
{
    public class PatternObj : AbsMapfileBlock, IMapfileBlock
    {
        #region public properties

        public override string name { get; } = "PATTERN";

        public override string endName => "END";

        VALUETYPE IMapfileEntry.valueType { get; } = VALUETYPE._block;

        public override List<MapfileEntry> entries { get; set; } = new List<MapfileEntry>();
        public override List<IMapfileBlock> blocks { get; set; } = new List<IMapfileBlock>();

        #endregion

        #region public methods
        public override IMapfileBlock GetNewBlockInstance(string blockName)
        {
            throw new NotImplementedException();
        }

        #endregion
    }
}
