import { Component, HostBinding, ViewEncapsulation, ViewChild, OnInit } from '@angular/core';
import { filter, find, map as _map, head, values, remove } from 'lodash';
import { ContextMenuService, ContextMenuComponent } from 'ngx-contextmenu';
import { NavMenuService } from '../services/nav-menu.service';
import { MapService } from '../services/map.service';
import { MapStateService } from '../services/map-state.service';
import { MapFileObject, MapState } from '../map-state';

@Component({
  selector: 'app-nav-props',
  templateUrl: './nav-props.component.html',
  styleUrls: ['./nav-props.component.css'],
  encapsulation: ViewEncapsulation.None
})

export class NavPropsComponent implements OnInit {
  username: string;
  layerName;
  layerType = 4; /** UNKNOW(4) by default */
  objectType;
  objectSubType; /** 0: ELEMENTS (itemEntries), 1: BLOCKS (itemBlocks), 2: CLASS (itemClass) */
  activeItemObject: any;

  itemEntries: Array<any> = [];
  itemBlocks: Array<any> = [];
  itemClass: Array<any> = [];

  menuEntries: Array<any> = [];
  selectedTabIndex = 0;
  tooltipNewEntry = 'Add new layer property';
  layerFields: any;
  isMapObjectActive: boolean;
  isNewLayerPanelOpen: boolean;

  @ViewChild(ContextMenuComponent) public entriesMenu: ContextMenuComponent;
  @HostBinding('class.show-props')
  isPropsPanelOpen = false;

  constructor(private mapStateService: MapStateService,
    private ctxMenu: ContextMenuService,
    private mapService: MapService,
    private menuService: NavMenuService) {

    this.username = this.mapStateService.getMapState().username;
  }

  ngOnInit(): void {
    const that = this;
    this.menuService.createNewEntryControlTrigger.subscribe(e => {
      switch (this.objectSubType) {
        case 0: /* map and layer elements */
          this.applyUpdateNewElementItem(e.item, e.parent);
          break;
        case 1: /* blocks */
          if (e.item.valueType === 0) {
            this.applyUpdateNewBlockObject(e.item);
          } else {
            this.applyUpdateNewSubElementItem(e.item, this.itemBlocks, e.parent);
          }
          break;
        case 2: /* class */
          if (e.item.valueType === 0) {
            this.applyUpdateNewClassBlock(e.item, this.itemClass, e.parent);
          } else {
            this.applyUpdateNewSubElementItem(e.item, this.itemClass, e.parent);
          }
          break;
      }

      switch (e.item.valueType) {
        case 0: /** new block based on valueType */
          break;
        default: /** new entry based on valueType */
          this.resolveMenuEntries(this.activeItemObject, true);
          break;
      }

    });
  }

  private applyUpdateNewBlockObject(_item: any) {
    this.mapService.getMapBlock(_item, this.layerType).then(dataBlock => {
      this.itemBlocks.push(dataBlock);
      this.mapService.newMapBlock(this.mapStateService.getMapState(), dataBlock)
        .then(result => {
          const mapFileObj: MapFileObject = this.mapStateService.getMapFileObject();
          mapFileObj.mapfile = result;
          this.mapStateService.setMapFileObject(mapFileObj);
        });
    });
  }

  private applyUpdateNewElementItem(_item: any, _parent: any) {
    this.itemEntries.push(_item);
    const mapState = this.mapStateService.getMapState();
    mapState.objectid = _parent.id;
    this.mapService.newMapEntry(mapState, _item)
      .then(result => {
        const mapFileObj: MapFileObject = this.mapStateService.getMapFileObject();
        mapFileObj.mapfile = result;
        this.mapStateService.setMapFileObject(mapFileObj);
      });
  }

  private applyUpdateNewClassBlock(_item: any, blocks: any, _parent: any) {
    this.mapService.getMapBlock(_item, this.layerType).then(dataBlock => {
      for (let i = 0; i < blocks.length; i++) {
        if (blocks[i].id === _parent.id) {
          blocks[i].blocks.push(dataBlock);
        } else {
          this.applyUpdateNewClassBlock(_item, blocks[i].blocks, _parent);
          const mapState = this.mapStateService.getMapState();
          mapState.objectid = _parent.id;
          this.mapService.newMapBlock(this.mapStateService.getMapState(), dataBlock)
            .then(result => {
              const mapFileObj: MapFileObject = this.mapStateService.getMapFileObject();
              mapFileObj.mapfile = result;
              this.mapStateService.setMapFileObject(mapFileObj);
            });
        }
      }
    });
  }

  private applyUpdateNewSubElementItem(_item: any, blocks: any, _parent: any) {
    for (let i = 0; i < blocks.length; i++) {
      if (blocks[i].id === _parent.id) {
        blocks[i].entries.push(_item);
        const mapState = this.mapStateService.getMapState();
        mapState.objectid = _parent.id;
        mapState.objtype = _parent.name;
        this.mapService.newMapEntry(mapState, _item)
          .then(result => {
            const mapFileObj: MapFileObject = this.mapStateService.getMapFileObject();
            mapFileObj.mapfile = result;
            this.mapStateService.setMapFileObject(mapFileObj);
          });
        break;
      } else {
        this.applyUpdateNewSubElementItem(_item, blocks[i].blocks, _parent);
      }

    }

  }

  public onContextMenu($event: MouseEvent, item: any): void {
    if (item.availableEntries.length > 0) {
      this.ctxMenu.show.next({
        contextMenu: this.entriesMenu,
        event: $event,
        item: item,
      });
    }
    $event.preventDefault();
    $event.stopPropagation();
  }

  private resolveMenuEntries(itemObj: any, onlyProps) {
    if (itemObj === null) {
      this.menuEntries = [{ 'name': 'Add new class', 'valueType': 0 }];
    } else {
      this.menuEntries = filter(itemObj.availableEntries, function (it) {
        return (onlyProps) ? it.valueType !== 0 : it.valueType === 0 && (it.name !== 'LAYER' && it.name !== 'CLASS');
      });

      this.itemEntries.forEach(element => {
        remove(this.menuEntries, function (n: any) {
          return n.name === element.name;
        });
      });

      this.itemBlocks.forEach(element => {
        remove(this.menuEntries, function (n: any) {
          return n.name === element.name;
        });
      });
    }
  }

  toggleMapPanel(close, isMapActive) {
    const mapFileObj: MapFileObject = this.mapStateService.getMapFileObject();
    if (close) {
      this.isPropsPanelOpen = false;
    } else {
      this.activeItemObject = mapFileObj.mapfile;
      this.itemEntries = filter(mapFileObj.mapfile.entries, { 'readOnly': false });
      this.itemBlocks = filter(mapFileObj.mapfile.blocks, function (b) { return b.name !== 'LAYER'; });
      this.layerName = null;
      this.layerType = 4;
      this.objectType = 'MAP';
      this.objectSubType = 0;
      this.isPropsPanelOpen = isMapActive;
      this.selectedTabIndex = 0;
      this.onGeneralChange();
    }
    this.isMapObjectActive = true;
  }

  toggleLayerPanel(close, layerItem) {
    if (close) {
      this.isPropsPanelOpen = false;
    } else {
      this.activeItemObject = layerItem;
      this.itemEntries = filter(layerItem.entries, { 'readOnly': false });
      this.itemBlocks = filter(layerItem.blocks, function (b) { return b.name !== 'CLASS'; });
      this.itemClass = filter(layerItem.blocks, function (b) { return b.name === 'CLASS'; });
      this.objectType = 'LAYER';
      this.objectSubType = 0;
      this.selectedTabIndex = 0;
      this.onGeneralChange();

      for (const c of this.itemClass) {
        c['byName'] = find(c.entries, function (e) {
          if (e.name === 'NAME') {
            e.hasName = true;
            e.label = e.value;
            return e;
          } else {
            e.label = 'default';
            return e;
          }
        });

        if (!c['byName']) {
          c['byName'] = { 'name': '', 'value': null, 'hasName': false, 'label': 'default' };
        }
      }
      const sameLayer = this.layerName === layerItem.layerName;
      this.layerName = layerItem.layerName;
      this.layerType = layerItem.layerType;
      this.isPropsPanelOpen = (sameLayer) ? !this.isPropsPanelOpen : true;
      this.layerFields = head(values(find(this.mapStateService.getMapState().layerFields, this.layerName)));
    }
    this.isMapObjectActive = false;
  }

  private updateMapState(objectIsMap: boolean, _objType) {
    const mapstate: MapState = this.mapStateService.getMapState();
    if (_objType) {
      mapstate.objtype = _objType;
    }
    mapstate.objectid = this.activeItemObject.id;
    mapstate.layerid = this.activeItemObject.id;
    this.mapStateService.setMapState(mapstate);
  }

  onGeneralChange() {
    const objectIsMap = this.objectType === 'MAP';
    this.updateMapState(objectIsMap, this.objectType);
    this.tooltipNewEntry = 'Add new layer property';
    this.resolveMenuEntries(this.activeItemObject, true);
    this.objectSubType = 0;
  }

  onClassChange() {
    const objectIsMap = this.objectType === 'MAP';
    this.updateMapState(objectIsMap, 'CLASS');
    this.tooltipNewEntry = 'Add new class';
    this.resolveMenuEntries(null, false);
    this.objectSubType = 2;
  }



  onExtendedChange() {
    const objectIsMap = this.objectType === 'MAP';
    this.updateMapState(objectIsMap, null);
    this.resolveMenuEntries(this.activeItemObject, false);
    this.tooltipNewEntry = 'Add new extended layer property';
    this.objectSubType = 1;
  }

  onCollapseChange(item) {
    let entry = null;
    if (item.entries.length > 0) {
      entry = filter(item.entries, function (e) {
        return e.name === 'NAME' || e.name === 'EXPRESSION';
      });
    }
    const objectIsMap = false;
    if (!entry) { entry = [{ name: 'default', value: '' }]; }
    this.updateMapState(objectIsMap, 'CLASS');
  }

}
