using mapfileManager.mapfile;
using System.Collections.Generic;
using wmsShared.Interfaces;
using wmsShared.Model;

namespace mapfileManager.Interfaces
{
    public interface IMapFileManager
    {
        MapObj GetMapFileObj(MapLoadingOptions mapLoadingOptions);
        List<IMapfileBlock> GetLayers(MapLoadingOptions mapLoadingOptions);
        MapEntriesRuntimeOptions GetEntries();
        MapDirectivesRuntimeOptions GetProcessingDirectives();
        IMapfileBlock GetBlockEntries(IMapfileBlock block, LayerType layerType);
        NewMapElementResult AddEntry(MapLoadingOptions mapLoadingOptions, MapEntryRequest entry);
        IMapfileBlock CreateNewMap(string username, string mapname);
        IMapfileBlock AddBlock(MapLoadingOptions mapLoadingOptions, MapEntryRequest dto);
        NewMapElementResult DuplicateBlock(MapLoadingOptions mapLoadingOptions, MapEntryRequest dto);

        MapObj WriteMapFile(MapLoadingOptions mapLoadingOptions, MapEntryRequest entry);
        MapObj WriteMapFile(MapLoadingOptions mapOptions, string[] orderedlayers);
        IMapfileBlock InsertLayerFromImport(ImportViewModel importModel);
        IMapfileBlock DeleteLayer(MapLoadingOptions mapOptions, MapEntryRequest dto);
        string GetLayerNameById(MapLoadingOptions mapLoadingOptions, MapEntryRequest dto);
        string GetDataSourceName(string username, string value);
    }
}