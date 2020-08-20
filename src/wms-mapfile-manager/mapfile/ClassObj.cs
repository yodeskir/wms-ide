using System;
using System.Collections.Generic;
using wmsShared.Interfaces;
using wmsShared.Model;

namespace mapfileManager.mapfile
{
    [Serializable]
    public class ClassObj : AbsMapfileBlock, IMapfileBlock
    {
        #region constructor

        #endregion

        #region public properties

        public override string name => "CLASS";

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

        private IMapfileBlock CreateNewStyle()
        {
            return new StyleObj();
        }

        private IMapfileBlock CreateNewValidation()
        {
            return blocks.Find(b => b.name.Equals("VALIDATION")) ?? new ValidationObj();
        }

        private IMapfileBlock CreateNewLeader()
        {
            return new LeaderObj();
        }

        private IMapfileBlock CreateNewLabel()
        {
            return new LabelObj();
        }


        public override IMapfileBlock GetNewBlockInstance(string blockName)
        {
            IMapfileBlock block = null;
            switch (blockName)
            {
                case "STYLE":
                    block = CreateNewStyle();
                    break;
                case "LABEL":
                    block = CreateNewLabel();
                    break;
                case "LEADER":
                    block = CreateNewLeader();
                    break;
                case "VALIDATION":
                    block = CreateNewValidation();
                    break;
            }
            return block;
        }
        #endregion
        
    }
}
