import { Injectable, Output, EventEmitter } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { MapStateService } from './map-state.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})

export class LayerdataService {
  baseUrl = environment.baseUrl;

  @Output() openLayerDatagridTrigger: EventEmitter<any> = new EventEmitter();
  @Output() setGridChangingDatasourceTrigger: EventEmitter<boolean> = new EventEmitter();

  constructor(private http: HttpClient, protected mapStateService: MapStateService) {

  }

  getLayerData(layerName, rowStart: number, rowEnd: number, filterByField: string, filterOpType: string, filterValue: string): Observable<any> {
    const mapstate = this.mapStateService.getMapState();
    const urlpath = `${this.baseUrl}/layers/${mapstate.username}/${layerName}/data`;
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json; charset=utf-8');
    const req = { 'RowStart': rowStart, 'RowEnd': rowEnd, 'FilterBy': filterByField, 'FilterOpType': filterOpType, 'FilterValue': filterValue };
    return this.http.post<any>(urlpath, req, { headers: headers });
  }


  async getLayerDataAsync(layerName: string): Promise<Array<any>> {
    const mapstate = this.mapStateService.getMapState();
    const urlpath = `${this.baseUrl}/layers/${mapstate.username}/${layerName}/data`;
    let headers = new HttpHeaders();
    headers = headers.set('Content-Type', 'application/json; charset=utf-8');

    const response = await this.http.get<any>(urlpath, { headers: headers }).toPromise();
    return response;
  }

  openLayerDataGrid(layerName, datasourceName, open) {
    this.openLayerDatagridTrigger.emit({ 'layerName': layerName, 'datasourceName': datasourceName, 'openDataPanel': open });
  }
  
  setGridChangingDatasource(newData) {
    this.setGridChangingDatasourceTrigger.emit(newData);
  }
}
