using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using wmsShared.Interfaces;
using wmsShared.Model;

namespace mapfileManager.mapfile
{
    [Serializable]
    public abstract class AbsMapfileBlock : IMapfileBlock
    {
        public string id { get; set; }
        public int order { get; set; }
        public abstract string name { get;}
        public abstract string endName { get; }
        public VALUETYPE valueType { get; set; } = VALUETYPE._block;
        public abstract List<MapfileEntry> entries { get; set; }
        public abstract List<IMapfileBlock> blocks { get; set; }

        protected AbsMapfileBlock()
        {
        }

        public virtual bool allowMultiplesInstances { get; set; } = false;

        public abstract IMapfileBlock GetNewBlockInstance(string blockName);

        public virtual void AddDefaultEntries(LayerType ltype, List<MapfileEntry> allEntries)
        {
            var defEntries = allEntries.Where(e => e.includeAsDefault==true).ToList();
            foreach (var entry in defEntries)
            {
                entry.value = entry.defValue;
                entry.id = Guid.NewGuid().ToString("N");
                if (!entries.Exists(e => e.name.Equals(entry.name, StringComparison.InvariantCultureIgnoreCase) && e.value.Equals(entry.value, StringComparison.InvariantCultureIgnoreCase)))
                    entries.Add(entry);
            }
        }

        public string ToString(int tabOrder)
        {
            ++tabOrder;
            var tab = new String('\t', tabOrder);
            var feattab = new String('\t', tabOrder+1);
            if (entries.Count == 0 && blocks.Count==0) return "";
            var stb = new StringBuilder();
            stb.AppendLine(tab + name);

            foreach (var e in entries)
            {
                if (name.Equals("WEB") && e.name.Equals("IMAGEPATH") || e.name.Equals("IMAGEURL")) continue;

                var entryName = (e.quoteName) ? $"\"{e.name}\"" : $"{e.name}";

                if (reconstructScaleDenominators(e, feattab, ref stb)) continue;
                if (reconstructProcessingDirectives(e, feattab, ref stb)) continue;
                if (reconstructColorRange(e, feattab, ref stb)) continue;

                var value = (e.quoteValue) ? $"\"{e.value}\"" : $"{e.value}";
                stb.AppendLine($"{feattab}{entryName} {value}");
            }

            if (name.Equals("WEB"))
                ((WebObj)this).addDefaultConfigEntries(stb, feattab);

            foreach (IMapfileBlock b in blocks)
            {
                stb.AppendLine(b.ToString(tabOrder));
            }
            stb.AppendLine(tab + endName);
            return stb.ToString();
        }

        private bool reconstructScaleDenominators(MapfileEntry e, string feattab, ref StringBuilder stb)
        {
            if (e.name.Equals("ZOOM-LEVEL", StringComparison.InvariantCultureIgnoreCase))
            {
                var tmpv = e.value.Split("|");
                if (tmpv.Length == 2)
                {
                    stb.AppendLine($"{feattab}MINSCALEDENOM {tmpv[0]}");
                    stb.AppendLine($"{feattab}MAXSCALEDENOM {tmpv[1]}");
                    return true;
                }
            }
            return false;
        }

        private bool reconstructProcessingDirectives(MapfileEntry e, string feattab, ref StringBuilder stb)
        {
            if (e.name.Equals("PROCESSING", StringComparison.InvariantCultureIgnoreCase))
            {
                var tmpv = e.value.Replace("PROCESSING", "", StringComparison.InvariantCultureIgnoreCase).Split("|");
                foreach(var p in tmpv)
                {
                    stb.AppendLine($"{feattab}PROCESSING \"{p}\"");
                }
                return true;
            }
            return false;
        }

        private bool reconstructColorRange(MapfileEntry e, string feattab, ref StringBuilder stb)
        {
            if (e.name.Equals("COLORRANGE", StringComparison.InvariantCultureIgnoreCase))
            {
                var tmpv = e.value.Replace("'","").Replace('"','\0').Split(" ");
                if (tmpv.Length == 2)
                {
                    stb.AppendLine($"{feattab}COLORRANGE '{tmpv[0]}' '{tmpv[1]}'");
                    return true;
                }
            }
            return false;
        }

        public virtual IMapfileBlock Clone()
        {
            switch (this.name)
            {
                case "LAYER":
                    return new LayerObj();
                case "STYLE":
                    return new StyleObj();
                case "FEATURE":
                    return new FeatureObj();
                case "CLASS":
                    return new ClassObj();
                case "LABEL":
                    return new LabelObj();
                case "CLUSTER":
                    return new ClusterObj();
                case "LEADER":
                    return new LeaderObj();
                case "VALIDATION":
                    return new ValidationObj();
                case "PATTERN":
                    return new PatternObj();
            }
            return null;
        }
    }
}
