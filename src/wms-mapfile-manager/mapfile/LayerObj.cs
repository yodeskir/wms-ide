using System;
using System.Collections.Generic;
using System.Linq;
using wmsShared.Interfaces;
using wmsShared.Model;

namespace mapfileManager.mapfile
{
    public class LayerObj : AbsMapfileBlock, IMapfileBlock
    {
        #region private properties

        private readonly MapDirectivesRuntimeOptions _directiveOptions;

        private LayerType _layerType { get; set; }
        private string _layersql { get; set; }
        private string _layercnn { get; set; }

        #endregion

        #region public properties
        public string LayerType { get; set; }
        public string DatasourceName { get; set; }
        public string LayerName { get; set; }

        public override string name => "LAYER";

        public override string endName => "END";

        public override bool allowMultiplesInstances { get; set; } = true;

        VALUETYPE IMapfileEntry.valueType => VALUETYPE._block;

        #endregion

        #region constructor

        public LayerObj()
        {
            _layerType = wmsShared.Model.LayerType.Autodetect;
        }

        public LayerObj(ImportViewModel importViewModel, string cnn, MapDirectivesRuntimeOptions directiveOptions)
        {
            _directiveOptions = directiveOptions;
            id = Guid.NewGuid().ToString("N");
            _layerType = importViewModel.UploadedLayerType;
            LayerType = _layerType.ToString();
            DatasourceName = importViewModel.DatasourceName;
            LayerName = importViewModel.LayerName;

            if (importViewModel.UploadedLayerType == wmsShared.Model.LayerType.HeatMap)
            {
                _layercnn = $"{LayerName}_point";
                _layersql = "";
            }
            else
            {
                _layercnn = cnn;
                _layersql = $"geom from (select * from {importViewModel.UserName}.{importViewModel.DatasourceName}) as foo using unique id using srid={importViewModel.Projection}";
            }
        }

        #endregion


        #region public methods

        public override void AddDefaultEntries(LayerType ltype, List<MapfileEntry> allEntries)
        {
            base.AddDefaultEntries(ltype, allEntries);
            entries.FirstOrDefault(e => e.name.Equals("NAME")).value = LayerName;
            entries.FirstOrDefault(e => e.name.Equals("CONNECTION")).value = _layercnn;
            entries.FirstOrDefault(e => e.name.Equals("DATA")).value = _layersql;

            var datatype = "";
            switch (ltype)
            {
                case wmsShared.Model.LayerType.Line:
                    datatype = "LINE";
                    break;
                case wmsShared.Model.LayerType.Point:
                    datatype = "POINT";
                    break;
                case wmsShared.Model.LayerType.Polygon:
                    datatype = "POLYGON";
                    break;
                case wmsShared.Model.LayerType.Raster:
                    datatype = "RASTER";
                    break;
                case wmsShared.Model.LayerType.HeatMap:
                    datatype = "RASTER";
                    entries.FirstOrDefault(e => e.name.Equals("CONNECTIONTYPE")).value = "kerneldensity";
                    foreach (var dh in _directiveOptions.HEATMAP)
                    {
                        entries.Add(new MapfileEntry() { name = "PROCESSING", value = $"{dh.name}={dh.defValue}", id = Guid.NewGuid().ToString("N"), allowMultiplesInstances = false, quoteValue = true, quoteName = false, valueType = VALUETYPE._string });
                    } 
                    entries.Remove(entries.FirstOrDefault(e => e.name.Equals("DATA")));
                    break;
                case wmsShared.Model.LayerType.Chart:
                    datatype = "CHART";
                    entries.FirstOrDefault(e => e.name.Equals("PROCESSING")).value = "CHART_TYPE=pie";
                    entries.FirstOrDefault(e => e.name.Equals("PROCESSING")).value = "CHART_SIZE=30";
                    break;
            }
            
            entries.FirstOrDefault(e => e.name.Equals("TYPE")).value = datatype;
            entries.All(x => { x.id = Guid.NewGuid().ToString("N"); return true; });
        }


        public void AddProjection(string prj)
        {
            if (blocks.Exists(b => b.name.Equals("PROJECTION", StringComparison.InvariantCultureIgnoreCase))) return;
            blocks.Add(new ProjectionObj(prj));
        }

        private IMapfileBlock AddCluster() {
            return new ClusterObj();
        }

        private IMapfileBlock AddValidation()
        {
            return blocks.Find(b => b.name.Equals("VALIDATION")) ?? new ValidationObj();
        }

        private IMapfileBlock AddGrid()
        {
            return blocks.Find(b => b.name.Equals("GRID")) ?? new GridObj();
        }

        private IMapfileBlock AddComposite()
        {
            return blocks.Find(b => b.name.Equals("COMPOSITE")) ?? new CompositeObj();
        }

        private IMapfileBlock AddMetadata()
        {
            return blocks.Find(b => b.name.Equals("METADATA")) ?? new MetadataObj();
        }

        private IMapfileBlock AddClass()
        {
            return new ClassObj();
        }

        private IMapfileBlock AddFeature()
        {
            return blocks.Find(b => b.name.Equals("FEATURE")) ?? new FeatureObj();
        }
        public override List<MapfileEntry> entries { get; set; } = new List<MapfileEntry>();
        public override List<IMapfileBlock> blocks { get; set; } = new List<IMapfileBlock>();

        public override IMapfileBlock GetNewBlockInstance(string blockName)
        {
            IMapfileBlock block = null;
            switch (blockName)
            {
                case "CLUSTER":
                    block = AddCluster();
                    break;
                case "VALIDATION":
                    block = AddValidation();
                    break;
                case "GRID":
                    block = AddGrid();
                    break;
                case "PROJECTION":
                    block = new ProjectionObj();
                    break;
                case "COMPOSITE":
                    block = AddComposite();
                    break;
                case "CLASS":
                    block = AddClass();
                    break;
                case "FEATURE":
                    block = AddFeature();
                    break;
                case "METADATA":
                    block = AddMetadata();
                    break;
            }
            return block;
        }

        public LayerType ResolveLayerType(string type) {
            switch (type) {
                case "LINE":
                    return wmsShared.Model.LayerType.Line;
                case "POINT":
                    return wmsShared.Model.LayerType.Point;
                case "POLYGON":
                    return wmsShared.Model.LayerType.Polygon;
                case "RASTER":
                    return wmsShared.Model.LayerType.Raster;
                case "CHART":
                    return wmsShared.Model.LayerType.Chart;
                case "CIRCLE":
                    return wmsShared.Model.LayerType.Circle;
                default:
                    return wmsShared.Model.LayerType.Point;
            }
        }


        #endregion
    }                                              
}                                                  
                                        