import { Component, OnInit, Input } from '@angular/core';
import { MapService } from '../services/map.service';
import Map from 'ol/Map';
import View from 'ol/View';
import proj4 from 'proj4';
import { addCommon as addCommonProjections } from 'ol/proj.js';
import { LayerDatagridComponent } from '../layer-datagrid/layer-datagrid.component';


@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  olMap: any;
  height = 350;
  width = 450;
  mapIsLoading = true;
  zoomLevel = 1;
  centerMap = '[0,0]';
  execStart = 0;
  execEnd = 0;
  execTime = '-';

  constructor(private mapService: MapService) {

  }

  ngOnInit() {
    window.dispatchEvent(new Event('resize'));
    
    this.olMap = new Map({
      target: document.getElementById('map'),
      view: this.getView(),
      layers: []
    });

    this.mapService.init(this.olMap);
    this.mapService.mapIsLoadingChange.subscribe(isLoading => {
      this.mapIsLoading = isLoading;
      this.execTime = '-';
      const c = this.olMap.getView().getCenter();
      this.zoomLevel = this.olMap.getView().getZoom();
      this.centerMap = `[${Math.floor(c[0])}, ${Math.floor(c[1])}]`;
      if (isLoading) {
        this.execStart = performance.now();
      } else {
        this.execEnd = performance.now();
        this.execTime = (this.execEnd - this.execStart).toFixed(2).toString();
      }
    });
  }

  initProjections() {
    proj4.defs('EPSG:4326', '+proj=longlat +ellps=WGS84 +datum=WGS84 +no_defs');
    proj4.defs('EPSG:3795', '+proj=lcc +lat_1=23 +lat_2=21.7 +lat_0=22.35 +lon_0=-81 +x_0=500000 +y_0=280296.016 +datum=NAD27 +units=m +no_defs');
    proj4.defs('ESRI:102018', '+proj=stere +lat_0=90 +lon_0=0 +k=1 +x_0=0 +y_0=0 +ellps=WGS84 +datum=WGS84 +units=m +no_defs');
    proj4.defs('ESRI:102021', '+proj=stere +lat_0=-90 +lon_0=0 +k=1 +x_0=0 +y_0=0 +ellps=WGS84 +datum=WGS84 +units=m +no_defs');
    proj4.defs('EPSG:2154', '+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs');
    proj4.defs('SR-ORG:6620', '+proj=aea +lat_1=37 +lat_2=41 +lat_0=0 +lon_0=-79 +x_0=0 +y_0=0 +ellps=GRS80 +datum=NAD83 +units=m +no_defs');
  }

  getView() {

    const maxZoom = 16;
    const view = new View({
      center: [0, 0],
      zoom: 1,
      minZoom: 1,
      maxZoom: maxZoom,
      //extent: [-180, -90, 180, 90] 
    });

    return view;
  }

  saveView() {
    this.mapService.saveMapView();
  }

}

