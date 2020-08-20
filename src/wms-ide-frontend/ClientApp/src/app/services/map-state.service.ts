
import { Injectable, Output, EventEmitter } from '@angular/core';
import { map as _map, filter, find } from 'lodash';
import { MapState, MapFileObject, MenuState, ProcessingDirectivesState } from '../map-state';

@Injectable()
export class MapStateService {
    mapState: MapState;
    mapFileStore: MapFileObject;
    menuLayerStore: MenuState;
    processingDiretives: ProcessingDirectivesState;
    // represents min zoom
    maxscales = {
        0: 99999999999,
        1: 332808204,
        2: 166404102,
        3: 83202051,
        4: 41601025,
        5: 20800512,
        6: 10400256,
        7: 5200128,
        8: 2600064,
        9: 1300032,
        10: 650016,
        11: 325008,
        12: 162504,
        13: 81252,
        14: 40626,
        15: 20313,
        16: 10156,
        17: 5078,
        18: 2539
    };

    // represents max zoom
    minscales = {
        0: 332808204,
        1: 166404102,
        2: 83202051,
        3: 41601025,
        4: 20800512,
        5: 10400256,
        6: 5200128,
        7: 2600064,
        8: 1300032,
        9: 650016,
        10: 325008,
        11: 162504,
        12: 81252,
        13: 40626,
        14: 20313,
        15: 10156,
        16: 5078,
        17: 2539,
        18: 0
    };

    constructor() {
        this.mapState = {
            id: 1,
            name: 'mapcanada',
            username: null,
            objectid: null,
            layerid: null,
            objtype: 'MAP',
            projections: 'EPSG:4326,EPSG:3857',
            layerFields: null,
            mapEntries: null,
            token: null,
        };

        this.mapFileStore = {
            Url: null,
            isActive: null,
            name: null,
            mapfile: null
        };

        this.menuLayerStore = {
            LayersMenu: [],
            LayerNames: [],
            ActiveObject: null
        };

        this.processingDiretives = {
            LAYER: [],
            CLUSTER: [],
            CONTOUR: [],
            HEATMAP: [],
            RASTER :[],
            CHART: []
        }
    }

    getMapState(): MapState {
        return this.mapState;
    }

    setMapState(state: MapState): void {
        this.mapState = state;
    }

    setMapFileObject(state: MapFileObject): void {
        this.mapFileStore = state;
    }

    getMapFileObject(): MapFileObject {
        return this.mapFileStore;
    }

    getLayerInMapFileObject(layerId: string): any {
        const layers = filter(this.mapFileStore.mapfile.blocks, { name: 'LAYER' });
        return find(layers, { 'id': layerId });
    }

    getBlockInLayerObject(parent: any, blockId: string): any {
        for (var i = 0; i < parent.blocks.length; i++) {
            if (parent.blocks[i].id === blockId) {
                return parent.blocks[i];
            } else {
                var block = this.getBlockInLayerObject(parent.blocks[i], blockId);
                if (block)
                    return block;
            }
        }
    }

    setMenuState(): void {
        this.menuLayerStore.LayersMenu = filter(this.mapFileStore.mapfile.blocks, { name: 'LAYER' });
        this.menuLayerStore.LayerNames = _map(this.menuLayerStore.LayersMenu, 'layerName').join(',');
    }

    getMenuState(): MenuState {
        return this.menuLayerStore;
    }

    getProcessingDirectivesState(): ProcessingDirectivesState {
        return this.processingDiretives;
    }

    setProcessingDirectivesState(state: ProcessingDirectivesState): void {
        this.processingDiretives = state;
    }

    getAvailableEntries(itemName) {
        return (itemName) ? this.mapState.mapEntries[itemName.toLowerCase()] : [];
    }

    getMinZoomFromScaleDenom(min) {
        let zoomValue = 1;
        for (const zoom in this.maxscales) {
            if (this.maxscales.hasOwnProperty(zoom)) {
                const denom: number = this.maxscales[zoom];
                const parsedScale = parseInt(min, 10);
                if (parsedScale > 332808204 + 1) {
                    zoomValue = 1;
                    break;
                }
                if (parsedScale < 5078) {
                    zoomValue = 18;
                    break;
                }
                const rest = (denom / 2) + 100;
                if (parsedScale === denom || (parsedScale < denom && parsedScale > rest)) {
                    zoomValue = parseInt(zoom, 10);
                    break;
                }
            }
        }

        return zoomValue;
    }

    getMaxZoomFromScaleDenom(max) {
        let zoomValue = 18;
        // looking for min zoom
        for (const zoom in this.minscales) {
            if (this.minscales.hasOwnProperty(zoom)) {
                const denom: number = this.minscales[zoom];
                const parsedScale1 = parseInt(max, 10);
                if (parsedScale1 >= 332808204) {
                    zoomValue = 1;
                    break;
                }
                if (parsedScale1 < 2539) {
                    zoomValue = 18;
                    break;
                }
                const rest = (denom / 2) + 100;
                if (parsedScale1 === denom || (parsedScale1 < denom && parsedScale1 > rest)) {
                    zoomValue = parseInt(zoom, 10);
                    break;
                }
            }
        }

        return zoomValue;
    }

    getMinScaleDenomFromZoom(minZoom): any {
        return this.minscales[minZoom];
    }
    getMaxScaleDenomFromZoom(maxZoom): any {
        return this.maxscales[maxZoom];
    }
}

