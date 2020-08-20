namespace wms_ide.Models
{
    public class MenuModel
    {
        public string id { get; set; }
        public string layerName { get; set; }
        public string datasourceName { get; set; }

        public string status { get; set; }
        public bool active { get; internal set; }
    }
}
