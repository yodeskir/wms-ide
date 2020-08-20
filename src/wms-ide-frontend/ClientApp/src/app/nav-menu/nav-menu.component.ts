import { Component, OnInit, Input, ViewEncapsulation, OnDestroy, AfterContentInit, TemplateRef } from '@angular/core';
import { NavMenuService } from '../services/nav-menu.service';
import { filter, find, map as _map, chain, each, map } from 'lodash';
import { MapService } from '../services/map.service';
import { NavNewLayerService } from '../services/nav-newlayer.service';
import { Subscription } from 'rxjs';
import { DragulaService } from 'ng2-dragula';
import { MapStateService } from '../services/map-state.service';
import { MapState, MapFileObject, MenuState } from '../map-state';
import { Router } from '@angular/router';
import { WmsstylePropertiesComponent } from '../wmsstyle-properties/wmsstyle-properties.component';
import { LayerdataService } from '../services/layerdata.service';
import { NzModalRef, NzModalService } from 'ng-zorro-antd';


@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class NavMenuComponent implements OnInit, OnDestroy {
  // activeLayer: any;
  mapIsWMS = true;
  isLayerActive = false;
  isMapActive = false;
  isOpenNewLayer = false;
  isOpenDataLayer = false;
  deleteModal: NzModalRef;
  deleteDatasource:boolean = false
  deleteModalLoading = false;

  @Input() props: WmsstylePropertiesComponent;

  BAG = 'DRAGULA_FACTS';
  subs = new Subscription();
  menuState: MenuState = new MenuState();

  constructor(private router: Router,
    private menuService: NavMenuService,
    private mapService: MapService,
    private dragulaService: DragulaService,
    private navNewLayerService: NavNewLayerService,
    private mapStateService: MapStateService,
    private layerdataService: LayerdataService,
    private modalService: NzModalService) {
    const that = this;

    this.subs.add(dragulaService.drop(this.BAG)
      .subscribe(({ el }) => {
        that.sortLayers();
      })
    );
    // this.mapIsWMS = this.router.url.endsWith('wmsmap');
  }

  public ngOnInit() {
    if (this.mapIsWMS) {
      this.createWMSMap();
    }
  }

  // private buildLayerTreeMenu(): Array<any> {
  //   let nodeMap = [];
  //   let nodeLayers = [];
    
  //   for (let i = 0; i < this.menuState.LayersMenu.length; i++) {
  //     const l = this.menuState.LayersMenu[i];
  //     nodeLayers.push({
  //       title: l.layerName, key: l.id, isLeaf: true //icon: this.getSvgIcon(l.layerType)
  //     });
  //   };

  //   nodeMap.push(
  //     {
  //       title: 'Map',
  //       key: '100',
  //       expanded: true,
  //       icon: 'anticon anticon-global-o',
  //       children: nodeLayers
  //     });


  //   return nodeMap;
  // }

  private createWMSMap() {
    const mapstate: MapState = this.mapStateService.getMapState();
    this.getMapFile()
      .then(r => {
        this.updateLayersMenu();
      });
    this.mapService.getAllMapEntries().subscribe(e => {
      mapstate.mapEntries = e;
      this.mapStateService.setMapState(mapstate);
    });
  }

  getSvgIcon(layerType) {
    return this.menuService.getSvgIcon(layerType);
  }

  onMapTypeChange() {
    this.mapIsWMS = !this.mapIsWMS;
    if (this.mapIsWMS) {
      this.router.navigateByUrl('/wmsmap');
      this.createWMSMap();
    } else {
      this.router.navigateByUrl('/mvtmap');
    }
  }

  public activateMapPanel() {
    this.isMapActive = true;
    this.isLayerActive = false;
    const menuState = this.mapStateService.getMenuState();
    menuState.ActiveObject = null;

    this.navNewLayerService.toggleNewLayerPanel(false);
    this.isOpenNewLayer = false;
    this.deactivateOtherLayers(null, this.mapStateService.getMenuState());

    this.props.toggleWMSMapPropertiesPanel(false, this.isMapActive);
    this.updateMapState('MAP', -1);
  }

  public activateLayerPanel(layerItem) {
    const menuState = this.mapStateService.getMenuState();
    const mapFileObj = this.mapStateService.getMapFileObject();
    this.navNewLayerService.toggleNewLayerPanel(false);
    this.isOpenNewLayer = false;
    this.isMapActive = false;
    this.isLayerActive = true;

    menuState.ActiveObject = layerItem;
    const layer = find(mapFileObj.mapfile.blocks, { 'id': layerItem.id });
    this.deactivateOtherLayers(layerItem.id, menuState);
    layerItem.active = true;
    let checkSameLayer = this.props.toggleWMSPropertiesPanel(false, layer);
    this.layerdataService.setGridChangingDatasource(checkSameLayer);

    this.updateMapState('LAYER', layerItem.id);

    if (!checkSameLayer) {
      this.isOpenDataLayer = !checkSameLayer;
      this.openLayerDataGrid();
    }
  }

  private updateMapState(objtype, id) {
    const mapstate: MapState = this.mapStateService.getMapState();
    mapstate.objtype = objtype;
    mapstate.layerid = id;
    this.mapStateService.setMapState(mapstate);
  }

  async getMapFile(): Promise<boolean> {
    const mapstate: MapState = this.mapStateService.getMapState();
    const mapFileObj: MapFileObject = this.mapStateService.getMapFileObject();
    await this.menuService.getMapFile(mapstate)
      .then(result => {
        mapFileObj.Url = result.serverUrl;
        mapFileObj.mapfile = result;
        mapFileObj.isActive = false;
        this.mapStateService.setMapFileObject(mapFileObj);
      });

    return true;
  }

  updateLayersMenu() {
    const that = this;
    const mapstate: MapState = this.mapStateService.getMapState();
    this.menuState = this.mapStateService.getMenuState();
    this.getMapFile();
    this.menuService.getLayersMenu(mapstate)
      .then(result => {
        this.menuState.LayersMenu = result;
        this.mapStateService.setMenuState();
        that.mapService.showWMSMap(mapstate.name, mapstate.id);

        // lets get all datasource fields one time.
        that.menuService.getDatasourceFields(mapstate.username, this.menuState.LayerNames)
          .then(fields => {
            const lfields = chain(fields).groupBy('layername').map(function (v, i) {
              const l = {};
              l[i] = _map(v, 'field');
              return l;
            }).value();

            mapstate.layerFields = lfields;
            that.mapStateService.setMapState(mapstate);
          });
      });
  }

  private updateLayersMenuInternal(mapFileObj: MapFileObject) {
    const menuState = this.mapStateService.getMenuState();
    menuState.LayersMenu = filter(mapFileObj.mapfile.blocks, function (b) {
      return b.name === 'LAYER' && find(b.entries, { 'name': 'STATUS' })['value'] === 'ON';
    });
    this.mapStateService.setMenuState();
  }

  sortLayers() {
    const mapstate: MapState = this.mapStateService.getMapState();
    this.mapService.sortMapLayers(mapstate);
  }

  activateNewLayerPanel() {
    this.props.isPropsPanelOpen = false;
    this.navNewLayerService.toggleNewLayerPanel(null);
    this.isOpenNewLayer = !this.isOpenNewLayer;
  }

  openLayerDataGrid() {
    this.isOpenNewLayer = false;
    const menuState = this.mapStateService.getMenuState();
    this.layerdataService.openLayerDataGrid(menuState.ActiveObject.layerName, menuState.ActiveObject.datasourceName, !this.isOpenDataLayer);
    this.isOpenDataLayer = !this.isOpenDataLayer;
  }

  deleteLayer() {
    this.deleteModalLoading = true;
    const mapstate: MapState = this.mapStateService.getMapState();
    const mapFileObj: MapFileObject = this.mapStateService.getMapFileObject();
    
    if (mapstate.objtype === 'LAYER' && mapstate.layerid) {
      this.mapService.deleteLayer(mapstate, this.deleteDatasource).subscribe(e => {
        mapFileObj.mapfile = e;
        this.mapStateService.setMapFileObject(mapFileObj);
        this.updateLayersMenu();
        this.destroyTplModal();
      });
    }
  }

  createDeleteModal(tplTitle: TemplateRef<{}>, tplContent: TemplateRef<{}>, tplFooter: TemplateRef<{}>): void {
    this.deleteModal = this.modalService.create({
      nzTitle: tplTitle,
      nzContent: tplContent,
      nzFooter: tplFooter,
      nzMaskClosable: false,
      nzClosable: false,
      nzOnOk: () => console.log('Click ok')
    });
  }

  destroyTplModal(): void {
    this.deleteModalLoading = false;
    this.deleteModal.destroy();
  }

  setStatusLayer() {
    alert('show/hide layer');
  }

  deactivateOtherLayers(layerid, menuState) {
    each(menuState.LayersMenu, function (m) {
      if (m.id === layerid) {
        m.active = true;
      } else {
        m.active = false;
      }
    });
    this.mapStateService.setMenuState();
  }

  ngOnDestroy() {
    this.subs.unsubscribe();
  }

}
