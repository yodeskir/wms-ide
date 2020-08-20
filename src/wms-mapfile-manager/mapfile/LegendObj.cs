using System.Collections.Generic;
using wmsShared.Interfaces;
using wmsShared.Model;

namespace mapfileManager.mapfile
{
    public class LegendObj : AbsMapfileBlock, IMapfileBlock
    {
        #region public properties

        public override string name => "LEGEND";

        public override string endName => "END";

        VALUETYPE IMapfileEntry.valueType => VALUETYPE._block;

        public override List<MapfileEntry> entries { get; set; } = new List<MapfileEntry>();
        public override List<IMapfileBlock> blocks { get; set; } = new List<IMapfileBlock>();

        #endregion

        #region public methods

        public override void AddDefaultEntries(LayerType ltype, List<MapfileEntry> allEntries)
        {
            base.AddDefaultEntries(ltype, allEntries);
            var label = new LabelObj();
            label.AddDefaultEntries(ltype, allEntries);
            blocks.Add(label);
        }
        public IMapfileBlock AddLabel()
        {
            return blocks.Find(b => b.name.Equals("LABEL")) ?? new LabelObj();
        }


        public override IMapfileBlock GetNewBlockInstance(string blockName)
        {
            IMapfileBlock block = null;
            switch (blockName)
            {
                case "LABEL":
                    block = AddLabel();
                    break;
            }
            return block;
        }


        #endregion
    }
}
