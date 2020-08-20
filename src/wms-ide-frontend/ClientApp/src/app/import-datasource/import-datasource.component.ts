import { Component, OnInit, HostBinding, ViewEncapsulation } from '@angular/core';
import { UploadFile, NzNotificationService } from 'ng-zorro-antd';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { environment } from '../../environments/environment';
import { NavNewLayerService } from '../services/nav-newlayer.service';
import { MapState, MapFileObject } from '../map-state';
import { filter } from 'rxjs/operators';
import { HttpClient, HttpRequest, HttpResponse } from '@angular/common/http';
import { MapStateService } from '../services/map-state.service';
import { find, each } from 'lodash';

@Component({
  selector: 'app-import-datasource',
  templateUrl: './import-datasource.component.html',
  styleUrls: ['./import-datasource.component.css'],
  encapsulation: ViewEncapsulation.None,
  providers: [MapState]
})

export class ImportDatasourceComponent implements OnInit {
  projections = [];
  uploading = false;
  fileList: UploadFile[] = [];

  layerTypes = ['autodetect', 'point', 'line', 'polygon', 'raster', 'heatmap', 'chart', 'circle']
  pointLayers: Array<any> = [];
  layerType = "";
  layerConnection = "";
  layerName = "";
  layerDescription: "";
  layerProjection = "";
  layerIsPublic = false;
  numberClasses = 1;
  colorClasses = "";
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

    this.navNewLayerService.toggleImportPanelChange.subscribe(open => {
      this.isImportPanelOpen = open;
      this.projections = mapState.projections.split(',');
      each(menuState.LayersMenu, function (b) {
        if (find(b.entries, { 'name': 'TYPE', 'value': 'POINT' }))
          that.pointLayers.push(b.layerName);
      });
    });

    this.navNewLayerService.setRampColorValuesChange.subscribe(ramp => {
      that.numberClasses = ramp.numClasses;
      that.colorClasses = ramp.rampColors;
    });

  }

  beforeUpload = (file: UploadFile): boolean => {
    this.fileList.push(file);
    return false;
  }

  handleUpload(): void {
    const mapstate: MapState = this.mapStateService.getMapState();
    const mapFileObj: MapFileObject = this.mapStateService.getMapFileObject();
    if (this.layerName) {
      const formData = new FormData();
      this.fileList.forEach((file: any) => {
        formData.append('file', file);
        formData.append('mapname', mapstate.name);
        formData.append('layername', this.layerName);
        formData.append('layerType', this.layerType);
        formData.append('layerdescription', this.layerDescription);
        formData.append('projection', this.layerProjection);
        formData.append('ispublic', this.isPublic.toString());
        formData.append('numberclasses', this.numberClasses.toString());
        formData.append('colorclasses', this.colorClasses);
        formData.append('username', mapstate.username);
      });

      this.uploading = true;
      this.navNewLayerService.uploadFile(formData).pipe(filter(e => e instanceof HttpResponse))
        .subscribe(
          (importvm: any) => {
            this.uploading = false;
            const res = importvm.body;
            if (!res.isValid) {
              this.createNotification('error', 'Error uploading', res.message);
            } else {
              if (res.needsrework) {
                this.isImportPanelOpen = false;
                this.createNotification('warning',
                  'Attention!',
                  `${this.layerName} was uploaded successfully but needs your attention to create GEOMETRY field.`);
                this.navNewLayerService.getSourceFields(res.username, res.layername, res.projection);
              } else {
                this.fileList = [];
                this.createNotification('info', 'File uploaded', `${this.layerName} was uploaded successfully.`);
                mapFileObj.mapfile = res.mapFile;
                this.mapStateService.setMapFileObject(mapFileObj);
                this.navNewLayerService.toggleNewLayerPanel(false);
                this.navNewLayerService.updateLayersMenu();
              }
            }
          },
          () => {
            this.uploading = false;
            this.createNotification('error', 'Upload failed', 'An internal server error has occour and the upload process failed.');
          }

        );
    } else {
      this.createNotification('error', 'Layername required', 'Please, specify a valid layer name without blank spaces.');
    }
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
        .pipe(filter(e => e instanceof HttpResponse))
        .subscribe(
          (mapfile: any) => {
            this.navNewLayerService.toggleNewLayerPanel(false);
            this.navNewLayerService.updateLayersMenu();  
          },
          () => {
            this.uploading = false;
            this.createNotification('error', 'New heatmap layer failed', 'An internal server error has occour and the process failed.');
          }

        );
  }

  createNotification(type: string, title: string, text: string): void {
    this.notification.create(type, title, text);
  }
}
