using System;
using System.Collections.Generic;
using wmsShared.Interfaces;
using wmsShared.Model;

namespace mapfileManager.mapfile
{
    public class ScalebarObj : AbsMapfileBlock, IMapfileBlock
    {
        public override string name { get; } = "SCALEBAR";

        public override string endName => "END";
        VALUETYPE IMapfileEntry.valueType => VALUETYPE._block;

        public IMapfileBlock AddLabel()
        {
            return blocks.Find(b => b.name.Equals("LABEL")) ?? new LabelObj();
        }
        public override List<MapfileEntry> entries { get; set; } = new List<MapfileEntry>();
        public override List<IMapfileBlock> blocks { get; set; } = new List<IMapfileBlock>();


        public override IMapfileBlock GetNewBlockInstance(string blockName)
        {
            IMapfileBlock block = null;
            switch (blockName)
            {
                case "LABEL":
                    block = new LabelObj();
                    break;
            }
            return block;
        }

    }
}
