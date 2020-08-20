using System;
using System.Collections.Generic;
using System.Linq;
using wmsShared.Interfaces;
using wmsShared.Model;

namespace mapfileManager.mapfile
{

    [Serializable]
    public class StyleObj : AbsMapfileBlock, IMapfileBlock
    {
        
        #region constructor

        #endregion

        #region public properties
        public override string name => "STYLE";

        public override string endName => "END";

        VALUETYPE IMapfileEntry.valueType => VALUETYPE._block;

        public override List<MapfileEntry> entries { get; set; } = new List<MapfileEntry>();
        public override List<IMapfileBlock> blocks { get; set; } = new List<IMapfileBlock>();

        #endregion

        #region public methods

        public override IMapfileBlock GetNewBlockInstance(string blockName)
        {
            IMapfileBlock block = null;
            if (blockName == "PATTERN") 
                block = new PatternObj();

            return block;
        }

        public override void AddDefaultEntries(LayerType ltype, List<MapfileEntry> allEntries)
        {
            base.AddDefaultEntries(ltype, allEntries);
            var color = "";
            string width = null;
            bool hasOutline = false;
            bool done = false;
            switch (ltype)
            {
                case LayerType.Line:
                    color = "#000000";
                    width = "1";
                    break;
                case LayerType.Point:
                    color = "#000000";
                    width = "1";
                    entries.Add(new MapfileEntry() { name = "SYMBOL", value = "circle", allowMultiplesInstances = false, id = Guid.NewGuid().ToString("N"), quoteValue = true, valueType = VALUETYPE._string });
                    entries.Add(new MapfileEntry() { name = "SIZE", value = "1", allowMultiplesInstances = false, id = Guid.NewGuid().ToString("N"), quoteValue = false, valueType = VALUETYPE._int });
                    break;
                case LayerType.Polygon:
                    color = "#fefefe";
                    width = "0.5";
                    hasOutline = true;
                    break;
                case LayerType.Raster:
                    break;
                case LayerType.HeatMap:
                    entries.Clear();
                    entries.Add(new MapfileEntry() { name = "COLORRANGE", value = "'#58a5ff00' '#9013feff'", canUseAttribute = false, quoteValue = false, valueType = VALUETYPE._colorrange });
                    entries.Add(new MapfileEntry() { name = "DATARANGE", value = "1 255", canUseAttribute = false, quoteValue = false, valueType = VALUETYPE._double_range });
                    done = true;
                    break;
                default:
                    color = "#000000";
                    width = "1";
                    break;
            }

            if (!done)
            {
                entries.FirstOrDefault(e => e.name.Equals("COLOR")).value = color;
                if (hasOutline)
                {
                    entries.Add(new MapfileEntry() { name = "OUTLINECOLOR", value = "#444444", canUseAttribute = true, quoteValue = true, valueType = VALUETYPE._color });
                    entries.Add(new MapfileEntry() { name = "OUTLINEWIDTH", value = width, quoteValue = false, canUseAttribute = true, valueType = VALUETYPE._double });
                }
            }

            entries.All(x => { x.id = Guid.NewGuid().ToString("N"); return true; });
        }


        #endregion
    }
}
