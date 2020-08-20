import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
  })
export class MapState {
    id: number = null;
    name: string = null;
    username: string = null;
    layerid: string = null;
    objectid: string = null;
    objtype: string = null;
    projections = 'EPSG:4326,EPSG:3857,EPSG:102018,EPSG:102021,EPSG:3411,EPSG:2154,EPSG:4171,EPSG:2986,EPSG:4047';
    layerFields: any = [];
    token = '';
    mapEntries: any = null;
    constructor() {}
}

@Injectable({
    providedIn: 'root',
  })

export class MapFileObject {
    Url: string;
    isActive: boolean;
    name: string;
    mapfile: any;
    constructor() {}
}

@Injectable({
    providedIn: 'root',
  })
export class MenuState {
    LayersMenu: Array<any> = [];
    LayerNames: any = [];
    ActiveObject: any;
    constructor() {}
}

@Injectable({
  providedIn: 'root',
})
export class ProcessingDirectivesState {
  LAYER: Array<any> = [];
  CLUSTER: Array<any> = [];
  CONTOUR: Array<any> = [];
  HEATMAP: Array<any> = [];
  RASTER: Array<any> = [];
  CHART: Array<any> = [];
  constructor() {}
}