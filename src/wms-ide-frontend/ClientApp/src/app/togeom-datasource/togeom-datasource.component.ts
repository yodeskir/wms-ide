import { Component, OnInit, ViewEncapsulation, HostBinding } from '@angular/core';
import { NavMenuService } from '../services/nav-menu.service';
import { map as _map, keys } from 'lodash';
import { NavNewLayerService } from '../services/nav-newlayer.service';
import { NzNotificationService } from 'ng-zorro-antd';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-togeom-datasource',
  templateUrl: './togeom-datasource.component.html',
  styleUrls: ['./togeom-datasource.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class TogeomDatasourceComponent implements OnInit {
  latValue: string = null;
  lonValue: string = null;
  srcFields: any = [];
  username: string;
  layername: string;
  projection: string;
  baseUrl = environment.baseUrl;
  @HostBinding('class.show-fields-to-geom')
  isToGeomPanelOpen = false;

  constructor(private menuService: NavMenuService, private navNewLayerService: NavNewLayerService,
    private notification: NzNotificationService, private http: HttpClient) { }

  ngOnInit() {
    const that = this;
    this.navNewLayerService.getSourceFieldsChange.subscribe(usrLyn => {
      that.getSourceFields(usrLyn.u, usrLyn.l, usrLyn.p);
    });
  }

  getSourceFields(username, layername, projection) {
    const that = this;
    that.username = username;
    that.layername = layername;
    that.projection = projection;
    that.menuService.getNumericDatasourceFields(username, layername)
      .then(fields => {
        that.srcFields = _map(keys(fields), function (k) { return { name: k, isnumber: !isNaN(parseInt(fields[k], 10)) }; });
        that.isToGeomPanelOpen = true;
      });
  }

  updateSourceGeom() {
    if (this.latValue == null || this.lonValue == null) {
      this.createNotification('error', 'Wrong Lat/Lon fields',
        'You must select one field for lattitud and one field for longitud.');
    } else if (this.latValue === this.lonValue) {
      this.createNotification('error', 'Wrong Lat/Lon fields',
        'Latitud and Longitud fields must be different. Please correct your selection.');
    } else {
      const that = this;
      const urlpath = `/layers/togeometry/${this.username}/${this.layername}/${this.projection}`;
      let headers = new HttpHeaders();
      headers = headers.set('Content-Type', 'application/json; charset=utf-8');
      const s = this.http.post(this.baseUrl + urlpath, [this.latValue, this.lonValue], { headers: headers });
      return s.map((data: any) => {
        that.createNotification('info', 'File uploaded',
          'Geometric field was created for ' + that.layername);
        that.navNewLayerService.updateLayersMenu();
        that.isToGeomPanelOpen = false;
        that.navNewLayerService.toggleImportPanel(true);
        that.navNewLayerService.toggleNewLayerPanel(false);

        return data;
      }).toPromise();
    }
  }

  cancelUpdate() {
    this.createNotification('info', 'Operation canceled',
      'A geometric field was not created for this datasource: ' + this.layername +
      '. You can not use this datasource directly in the mapserver, however, you can usit in conjunction with other geomtrics datasources');
    this.isToGeomPanelOpen = false;
    this.navNewLayerService.toggleImportPanel(true);
    this.navNewLayerService.toggleNewLayerPanel(false);
  }

  createNotification(type: string, title: string, text: string): void {
    this.notification.create(type, title, text);
  }

}
