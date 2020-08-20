import { Component, OnInit, ViewEncapsulation, HostBinding } from '@angular/core';
import { environment } from '../../environments/environment';
import { MapStateService } from '../services/map-state.service';
import { NavNewLayerService } from '../services/nav-newlayer.service';
import { NzNotificationService } from 'ng-zorro-antd';
import { MapState } from '../map-state';
import { each, find } from 'lodash';
import { HttpClient, HttpRequest } from '@angular/common/http';
import { LayerdataService } from '../services/layerdata.service';

@Component({
  selector: 'app-newfrom-datasource',
  templateUrl: './newfrom-datasource.component.html',
  styleUrls: ['./newfrom-datasource.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class NewfromDatasourceComponent implements OnInit {
  projections = [];
  layerTypes = ['autodetect', 'point', 'line', 'polygon', 'raster', 'heatmap', 'chart', 'circle']
  pointLayers: Array<any> = [];
  layerDatasources: Array<any> = [];
  layerType = "";
  layerConnection = "";
  layerName = "";
  layerDescription: "";
  layerProjection = "";
  layerIsPublic = false;

  isPublic = false;
  baseUrl = environment.baseUrl;
  
  @HostBinding('class.show-import-panel')
  isImportPanelOpen = true;

  constructor(private mapStateService: MapStateService,
    private navNewLayerService: NavNewLayerService,
    private http: HttpClient,
    private notification: NzNotificationService) { }

  ngOnInit() {
    const mapState: MapState = this.mapStateService.getMapState();
    const menuState = this.mapStateService.getMenuState();
    const that = this;
    this.isImportPanelOpen = true;
    
    this.navNewLayerService.listLayerDataSources(mapState.username).subscribe(result=> {
      this.layerDatasources = result;
    });
    
    this.projections = mapState.projections.split(',');
    each(menuState.LayersMenu, function (b) {
      if (find(b.entries, { 'name': 'TYPE', 'value': 'POINT' }))
        that.pointLayers.push(b.layerName);
    });

    this.navNewLayerService.toggleImportPanelChange.subscribe(open => {
      this.isImportPanelOpen = open;
    });
  }

  handleNewHeatMap() {
    const mapstate: MapState = this.mapStateService.getMapState();
    let data = {
      'layertype': this.layerType,
      'mapname': mapstate.name,
      'layername': this.layerName,
      'layerdescription': this.layerDescription,
      'projection': this.layerProjection,
      'ispublic': this.isPublic.toString(),
      'username': mapstate.username
    };

    const req = new HttpRequest('POST', `${this.baseUrl}/import/heatmap`, data, {
      // reportProgress: true
    });
    this.http
        .request(req)
        .subscribe(
          () => {
            this.navNewLayerService.toggleNewLayerPanel(false);
            this.navNewLayerService.updateLayersMenu();  
          },
          () => {
            this.createNotification('error', 'Create new layer failed', 'An internal server error has occour and the process failed.');
          }

        );
  }

  createNotification(type: string, title: string, text: string): void {
    this.notification.create(type, title, text);
  }

}
