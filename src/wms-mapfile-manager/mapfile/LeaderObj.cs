using System.Collections.Generic;
using wmsShared.Interfaces;
using wmsShared.Model;

namespace mapfileManager.mapfile
{
    public class LeaderObj : AbsMapfileBlock, IMapfileBlock
    {
        #region public properties
        public override string name => "LEADER";

        public override string endName => "END";

        VALUETYPE IMapfileEntry.valueType => VALUETYPE._block;

        public override List<MapfileEntry> entries { get; set; } = new List<MapfileEntry>();
        public override List<IMapfileBlock> blocks { get; set; } = new List<IMapfileBlock>();

        #endregion

        #region public methods

        public override void AddDefaultEntries(LayerType ltype, List<MapfileEntry> allEntries)
        {
            base.AddDefaultEntries(ltype, allEntries);
            var style = new StyleObj();
            style.AddDefaultEntries(ltype, allEntries);
            blocks.Add(style);
        }
        public IMapfileBlock AddStyle()
        {
            return blocks.Find(b => b.name.Equals("STYLE")) ?? new StyleObj();
        }
        

        public override IMapfileBlock GetNewBlockInstance(string blockName)
        {
            IMapfileBlock block = null;
            switch (blockName)
            {
                case "STYLE":
                    block = CreateNewStyle();
                    break;
            }
            return block;
        }

        private IMapfileBlock CreateNewStyle()
        {
            return new StyleObj();
        }

        #endregion
    }
}
