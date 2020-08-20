import { Injectable, Output, EventEmitter } from '@angular/core';
import Map from 'ol/Map';
import Image from 'ol/layer/Image';
import ImageWMS from 'ol/source/ImageWMS';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { map as _map } from 'lodash';
import { MapStateService } from './map-state.service';
import { MapFileObject, MapState } from '../map-state';
import { catchError } from 'rxjs/operators';
import { Observable } from 'rxjs';


@Injectable()
export class MapService {
  baseUrl = environment.baseUrl;
  url_: string;
  olMap: Map;
  olLayer: any;
  mapId: number;
  mapView: any;
  @Output() mapIsLoadingChange: EventEmitter<boolean> = new EventEmitter();

  constructor(private http: HttpClient, protected mapStateService: MapStateService) {
  }

  init(map) {
    const that = this;
    this.olMap = map;
    this.url_ = location.href;
    this.olMap.on('precompose', function () { that.mapIsLoadingChange.emit(true); });
    this.olMap.on('rendercomplete', function () {
      return that.stopLoadingProgress(that);
    });

  }

  getSourceWMS(layerNames, mapId) {
    const mapstate = this.mapStateService.getMapState();
    const mapFileObj: MapFileObject = this.mapStateService.getMapFileObject();
    const proxyUrl = environment.proxyUrl;
    const source = new ImageWMS({
      attributions: '',
      serverType: 'mapserver',
      crossOrigin: 'Anonymous',
      ratio: 1,
      params: { 'LAYERS': layerNames, 'TRANSPARENT': false, 'TIME': new Date().getTime().toLocaleString() },
      projection: 'EPSG:3857',
      url: `${proxyUrl}/appgiswms/${mapId}?`
    });
    source.setImageLoadFunction(function (image, src) {
      const xhr = new XMLHttpRequest();
      xhr.responseType = 'blob';
      xhr.addEventListener('loadend', function () {
        const data = this.response;
        if (data) {
          image.getImage()['src'] = (URL) ? URL.createObjectURL(data) : '';
        }
      });
      xhr.open('GET', src);
      xhr.setRequestHeader('WMS.Auth', mapstate.token);
      xhr.send();
    });

    return source;
  }

  getImageLayer(layerNames, mapId) {
    return new Image({
      source: this.getSourceWMS(layerNames, mapId)
    });
  }

  showWMSMap(mapName, mapId) {
    const that = this;
    const menuState = this.mapStateService.getMenuState();
    that.mapId = mapId;
    that.olLayer = this.getImageLayer(menuState.LayerNames, mapName);
    this.olMap.addLayer(that.olLayer);

    that.getMapEntity(mapId).then(m => {
      if (m) {
        that.mapView = m;
        const center = (m && m.center) ? m.center.split(',').map(Number) : [0, 0];
        that.olMap.getView().setCenter(center);
        that.olMap.getView().setZoom(m.zoom || 1);
      }
    });

    setTimeout(function () {
      that.olMap.renderSync();
    }, 10);
  }

  refreshLayer(mapName) {
    const menuState = this.mapStateService.getMenuState();
    this.olLayer = this.getImageLayer(menuState.LayerNames, mapName);
    this.olMap.addLayer(this.olLayer);

  }

  updateLayer() {
    const menuState = this.mapStateService.getMenuState();

    setTimeout(this.olLayer.getSource().updateParams(
      { 'LAYERS': menuState.LayerNames, 'TIME': new Date().getTime().toLocaleString() + Math.random }), 3000);
  }

  updateMapObject(mapState: MapState, entry, refreshMap, deleteEntry) {
    const that = this;
    const mapFileObj: MapFileObject = that.mapStateService.getMapFileObject();
    const urlpath = `/mapobj/map/${mapState.username}/${mapState.name}`;

    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json; charset=utf-8');
    mapState['entry'] = entry;
    mapState['entry']['setValues'] = null;
    mapState['deleteEntry'] = deleteEntry;

    const tablemap = mapState;

    const s = this.http.post(this.baseUrl + urlpath, tablemap, { headers: headers });
    return s.map((data: any) => {
      if (refreshMap) {
        that.updateLayer();
      }
      mapFileObj.mapfile = data;
      that.mapStateService.setMapFileObject(mapFileObj);
      return data;
    }).toPromise();
  }

  newMapEntry(m, entry) {
    const that = this;
    const mapFileObj: MapFileObject = that.mapStateService.getMapFileObject();
    const urlpath = `/mapobj/NEWENTRY/${m.username}`;

    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json; charset=utf-8');
    // clean some props not needed in backend
    // const setValues = `${entry.setValues}`;
    // entry.setValues = null;
    
    m['entry'] = entry;
    const tablemap = m;

    const s = this.http.post(this.baseUrl + urlpath, tablemap, { headers: headers });
    return s.map((data: any) => {
      mapFileObj.mapfile = data;
      that.mapStateService.setMapFileObject(mapFileObj);
      entry.id = data.itemId;
      if (entry.defValue) {
        this.updateLayer();
      }
      return data;
    }).toPromise();
  }

  getMapBlock(item, type) {
    let urlpath = `/mapobj/${item.name}`;
    if (item.name === 'STYLE' || item.name === 'CLASS' || item.name === 'LAYER') {
      urlpath += `/${type}`;
    }
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json; charset=utf-8');

    const s = this.http.get(this.baseUrl + urlpath, { headers: headers });
    return s.map((data: any) => {
      return data;
    }).toPromise();
  }

  newMapBlock(m, blockName) {
    const that = this;
    const mapFileObj: MapFileObject = that.mapStateService.getMapFileObject();
    const urlpath = `/mapobj/newblock/${m.username}`;

    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json; charset=utf-8');
    m['objectname'] = blockName;
    const tablemap = m;

    const s = this.http.post(this.baseUrl + urlpath, tablemap, { headers: headers });
    return s.map((data: any) => {
      mapFileObj.mapfile = data;
      that.mapStateService.setMapFileObject(mapFileObj);
      return data;
    }).toPromise();
  }

  cloneMapBlock(mapstate): Observable<any> {
    const urlpath = `/mapobj/cloneblock/${mapstate.username}`;
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json; charset=utf-8');

    return this.http.post<any>(this.baseUrl + urlpath, mapstate, { headers: headers });
  }

  sortMapLayers(m) {
    const that = this;
    const mapFileObj: MapFileObject = that.mapStateService.getMapFileObject();
    const menuState = this.mapStateService.getMenuState();

    const orderednames = _map(menuState.LayersMenu, 'layerName');
    const urlpath = `/mapobj/sort/${m.username}/${m.name}`;

    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json; charset=utf-8');

    const s = this.http.post(this.baseUrl + urlpath, orderednames, { headers: headers });
    return s.map((data: any) => {
      that.updateLayer();
      mapFileObj.mapfile = data;
      that.mapStateService.setMapFileObject(mapFileObj);
      return data;
    }).toPromise();
  }

  getAllMapEntries(): Observable<any> {
    const urlpath = '/mapobj/MAP';
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json; charset=utf-8');

    return this.http.get<any>(this.baseUrl + urlpath, { headers: headers });
  }

  getMapEntity(mapid) {
    const urlpath = `/maps/${mapid}`;
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json; charset=utf-8');

    const s = this.http.get(this.baseUrl + urlpath, { headers: headers });
    return s.map((data: any) => {
      return data;
    }).toPromise();
  }

  deleteLayer(mapstate: MapState, deleteDataSource: boolean): Observable<any> {
    const urlpath = `/mapobj/removelayer/${mapstate.username}`;
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json; charset=utf-8');
    mapstate['deleteDatasource'] = deleteDataSource;
    return this.http.post<any>(this.baseUrl + urlpath, mapstate, { headers: headers });
  }

  saveMapView() {
    const urlpath = '/maps/save';
    this.mapView.center = this.olMap.getView().getCenter().join();
    this.mapView.zoom = this.olMap.getView().getZoom();
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json; charset=utf-8');

    const s = this.http.post(this.baseUrl + urlpath, this.mapView, { headers: headers });
    return s.map((data: any) => {
      return data;
    }).toPromise();
  }

  stopLoadingProgress(caller) {
    caller.mapIsLoadingChange.emit(false);
  }

}
