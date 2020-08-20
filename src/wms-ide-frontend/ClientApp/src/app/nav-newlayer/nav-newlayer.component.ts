import { Component, OnInit, HostBinding, ViewEncapsulation, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';
import { NavMenuComponent } from '../nav-menu/nav-menu.component';
import { NavNewLayerService } from '../services/nav-newlayer.service';
import { MapState, MapFileObject } from '../map-state';
import { MapStateService } from '../services/map-state.service';

@Component({
  selector: 'app-nav-newlayer',
  templateUrl: './nav-newlayer.component.html',
  styleUrls: ['./nav-newlayer.component.css'],
  encapsulation: ViewEncapsulation.None
})

export class NavNewlayerComponent implements OnInit {
  mysources = [];
  baseUrl = environment.baseUrl;
  creationTypeValue = 'F';
  @Input() navMenuComponent: NavMenuComponent;

  @HostBinding('class.show-newlayer')
  isOpen = false;

  constructor(private mapStateService: MapStateService, private navNewLayerService: NavNewLayerService, private http: HttpClient) { }

  ngOnInit(): void {
    this.creationTypeValue = 'F';
    this.updateUserDatasources();

    this.navNewLayerService.toggleNewLayerChange.subscribe(isOpen => {
      this.isOpen = isOpen;
      this.navNewLayerService.toggleImportPanel(isOpen);
    });

    this.navNewLayerService.updateLayersMenuChange.subscribe(() => {
      this.navMenuComponent.updateLayersMenu();
      this.updateUserDatasources();
    });

  }

  onNewDataSourceChange() {
    this.navNewLayerService.toggleImportPanel(true);
  }

  updateUserDatasources() {
    const mapstate: MapState = this.mapStateService.getMapState();
    this.navNewLayerService.listLayerDataSources(mapstate.username).subscribe(result=>{
      this.mysources = result;
    });
  }


  deleteUserDatasource(layername) {
    const that = this;
    let s: any;
    const mapstate: MapState = this.mapStateService.getMapState();
    s = this.http.delete(this.baseUrl + '/layers/' + mapstate.username + '/' + layername);
    return s.map((src: any) => {
      that.navMenuComponent.updateLayersMenu();
      that.updateUserDatasources();
      return src;
    }).toPromise();

  }

  toggle(close) {
    if (close) {
      this.isOpen = !this.isOpen;
    } else {
      this.isOpen = close;
    }

  }



}
