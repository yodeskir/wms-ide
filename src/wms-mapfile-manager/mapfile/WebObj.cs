using System.Collections.Generic;
using System.Text;
using wmsShared.Interfaces;
using wmsShared.Model;

namespace mapfileManager.mapfile
{
    public class WebObj : AbsMapfileBlock, IMapfileBlock
    {
        public string Imagepath { get; set; }
        public string Imageurl { get; set; }

        public ValidationObj Validation { get; set; } = new ValidationObj();
        public override string name => "WEB";

        public override string endName => "END";

        VALUETYPE IMapfileEntry.valueType => VALUETYPE._block;

        public override List<MapfileEntry> entries { get; set; } = new List<MapfileEntry>();
        public override List<IMapfileBlock> blocks { get; set; } = new List<IMapfileBlock>();

        private IMapfileBlock AddMetadata()
        {
            return new MetadataObj();
        }

        public override IMapfileBlock GetNewBlockInstance(string blockName)
        {
            IMapfileBlock block = null;
            if (blockName == "METADATA") 
                block = AddMetadata();

            return block;
        }

        public void addDefaultConfigEntries(StringBuilder stb, string tab)
        {
            stb.AppendLine($"{tab}IMAGEPATH \"{Imagepath}\"");
            stb.AppendLine($"{tab}IMAGEURL \"{Imageurl}\"");
        }

    }
}
