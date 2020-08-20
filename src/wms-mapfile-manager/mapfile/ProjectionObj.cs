using System;
using System.Collections.Generic;
using wmsShared.Interfaces;
using wmsShared.Model;

namespace mapfileManager.mapfile
{
    public sealed class ProjectionObj : AbsMapfileBlock, IMapfileBlock
    {
        public ProjectionObj()
        {
        }
        public ProjectionObj(string projection)
        {
            entries.Add(new MapfileEntry() {
                name = "",
                value = "init=epsg:"+ projection,
                defValue = "init=epsg:4326",
                quoteName = false,
                quoteValue = true,
                valueType = VALUETYPE._proj
            });
        }

        public override string name => "PROJECTION";

        public override string endName => "END";

        VALUETYPE IMapfileEntry.valueType { get => VALUETYPE._block; }
        public override List<MapfileEntry> entries { get; set; } = new List<MapfileEntry>();
        public override List<IMapfileBlock> blocks { get; set; } = new List<IMapfileBlock>();

        public override IMapfileBlock GetNewBlockInstance(string blockName)
        {
            throw new NotImplementedException();
        }

    }
}
