using System;
using System.Collections.Generic;
using wmsShared.Interfaces;
using wmsShared.Model;

namespace mapfileManager.mapfile
{
    public class PointsObj : AbsMapfileBlock, IMapfileBlock
    {
        public override string name { get; } = "POINTS";

        public override string endName => "END";

        VALUETYPE IMapfileEntry.valueType { get; } = VALUETYPE._block;

        public override List<MapfileEntry> entries { get; set; } = new List<MapfileEntry>();
        public override List<IMapfileBlock> blocks { get; set; } = new List<IMapfileBlock>();

        public override IMapfileBlock GetNewBlockInstance(string blockName)
        {
            throw new NotImplementedException();
        }

    }
}
