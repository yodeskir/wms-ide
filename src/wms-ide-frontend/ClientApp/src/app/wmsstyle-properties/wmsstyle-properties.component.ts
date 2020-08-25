import { Component, OnInit, ViewEncapsulation, HostBinding, ViewChild, Input } from '@angular/core';
import { MapStateService } from '../services/map-state.service';
import { filter, head, values, find, remove, each, clone } from 'lodash';
import { WmsGenericComponent } from '../wms-components/wms-generic/wms-generic.component';
import { NavMenuService } from '../services/nav-menu.service';
import { MapFileObject, MapState } from '../map-state';
import { MapService } from '../services/map.service';
import { enumMapValueTypes } from '../wms-components/wms-generic/wms-map.entry.emun';
import { ContextMenuService, ContextMenuComponent } from 'ngx-contextmenu';
import { NzModalRef, NzModalService } from 'ng-zorro-antd';
import { NGXLogger } from 'ngx-logger';
import { MessageService } from '../services/message.service';

@Component({
  selector: 'app-wmsstyle-properties',
  templateUrl: './wmsstyle-properties.component.html',
  styleUrls: ['./wmsstyle-properties.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class WmsstylePropertiesComponent implements OnInit {
  username: string;
  tooltipClone: string = 'Clone';
  /** layer */
  layerName;
  layerId;
  layerType;
  layerFields: any;

  /** block */
  activeBlock: any;
  activeBlocksPath: Array<any> = [];
  itemBlocks: Array<any> = [];
  itemBlocksPath: Array<any> = [];

  /** entry */
  itemEntryLevel = 0;
  activeEntry: any;
  itemEntries: Array<any> = [];
  itemEntriesTop: Array<any> = [];
  menuEntries: Array<any> = [];

  itemHelpEntryName = '';
  itemHelp: string;

  crumb = 'LAYER';
  crumbs = ['LAYER'];

  @ViewChild('wmsValueComponent', {  }) wmsValueComponent: WmsGenericComponent;
  @ViewChild(ContextMenuComponent, {  }) public actionMenu: ContextMenuComponent;
  actionMenuEntries: Array<any> = [];
  confirmDeleteModal: NzModalRef;

  @HostBinding('class.show-props')
  isPropsPanelOpen = false;

  constructor(private mapStateService: MapStateService,
    private menuService: NavMenuService,
    private mapService: MapService,
    protected ctxMenu: ContextMenuService,
    private modal: NzModalService,
    private messageService: MessageService,
    private logger: NGXLogger) {
    this.username = this.mapStateService.getMapState().username;
  }

  ngOnInit() {
    this.menuService.createNewEntryControlTrigger.subscribe(e => {
      switch (e.item.valueType) {
        case 0: /** new block based on valueType */
          this.applyUpdateNewBlockItem(e.item, e.parent);
          this.resolveMenuEntries(this.activeBlock.name, true);
          break;
        default: /** new entry based on valueType */
          this.applyUpdateNewElementItem(e.item, e.parent);
          this.resolveMenuEntries(this.activeBlock.name, true);
          break;
      }

    });
  }

  public onContextMenu($event: MouseEvent, item: any): void {
    this.ctxMenu.show.next({
      contextMenu: this.actionMenu,
      event: $event,
      item: item,
    });
    $event.preventDefault();
    $event.stopPropagation();
  }

  buildDeleteMenu() {
    /** action menu (Delete) */
    this.actionMenuEntries = [];
    this.actionMenuEntries.push(this.activeEntry);
    this.actionMenuEntries.push(this.activeBlock);
  }
  /** Delete item or block */
  execActionMenu(item) {
    const title = (item.valueType === 0) ? `Delete ${item.name} (All elements)` : `Delete ${item.name} (Active element)`;
    this.confirmDeleteModal = this.modal.confirm({
      nzTitle: title,
      nzContent: `Press Ok to confirm you want to delete the item ${item.name}.`,
      nzOkText: 'Ok',
      nzCancelText: 'Cancel',
      nzOnOk: () => new Promise((resolve, reject) => {
        this.deleteEntry(item);
        resolve(0);
      }).catch(() => console.log('Oops errors!'))
    });
  }

  applyUpdateNewElementItem(_item: any, _parent: any) {
    this.itemEntries.push(clone(_item));
    const tmpItem = this.itemEntries[this.itemEntries.length - 1];
    this.activateWmsItem(this.itemEntries[this.itemEntries.length - 1]);
    const mapState = this.mapStateService.getMapState();
    mapState.layerid = this.layerId;
    mapState.objtype = this.activeBlock.name;
    mapState.objectid = this.activeBlock.id;
    this.mapService.newMapEntry(mapState, _item)
      .then(result => {
        const mapFileObj: MapFileObject = this.mapStateService.getMapFileObject();
        tmpItem.id = result.itemId;
        mapFileObj.mapfile = result.mapFile;
        this.mapStateService.setMapFileObject(mapFileObj);
      });
  }

  applyUpdateNewBlockItem(_item: any, _parent: any) {
    this.mapService.getMapBlock(_item, this.layerType).then(dataBlock => {
      this.itemBlocks.push(dataBlock);
      const mapState = this.mapStateService.getMapState();
      mapState.layerid = this.layerId;
      mapState.objectid = this.activeBlock.id;
      mapState.objtype = this.activeBlock.name;
      mapState['entry'] = dataBlock;
      this.mapService.newMapBlock(mapState, dataBlock.Name)
        .then(result => {
          const mapFileObj: MapFileObject = this.mapStateService.getMapFileObject();
          mapFileObj.mapfile = result;
          this.mapStateService.setMapFileObject(mapFileObj);
        });
    });
  }

  toggleWMSPropertiesPanel(close, layerItem) {
    this.crumb = 'LAYER';
    let checkSameLayer = false;
    layerItem.active = true;
    this.activeBlock = layerItem;
    if (!close) {
      checkSameLayer = this.checkIsIsTheSameLayer(layerItem);
      this.initObjectEntryItems(layerItem, false);
      this.resolveMenuEntries(this.activeBlock.name, true);
      this.activateWmsItem(this.itemEntries[0]);
      this.tooltipClone = `Clone ${this.layerName} layer`;
    } else {
      this.isPropsPanelOpen = false;
    }
    this.buildDeleteMenu();
    return close || checkSameLayer;
  }

  toggleWMSMapPropertiesPanel(close, isMapActive) {
    this.crumb = 'MAP';
    const mapFileObj = this.mapStateService.getMapFileObject(); 
    this.activeBlock = mapFileObj.mapfile;
    if (!close) {
      this.isPropsPanelOpen = isMapActive;
      this.initObjectEntryItems(this.activeBlock, true);
      this.resolveMenuEntries(this.activeBlock.name, true);
      this.activateWmsItem(this.itemEntries[0]);
    } else {
      this.isPropsPanelOpen = false;
    }
    this.buildDeleteMenu();
  }

  private checkIsIsTheSameLayer(layerItem: any) {
    const sameLayer = this.layerName === layerItem.layerName;
    this.isPropsPanelOpen = (sameLayer) ? !this.isPropsPanelOpen : true;
    return sameLayer;
  }

  private initObjectEntryItems(layerItem: any, isMapObject: boolean) {
    this.itemEntryLevel = 0;
    this.itemEntries = clone(filter(layerItem.entries, { 'readOnly': false }));
    this.itemEntriesTop[this.itemEntryLevel] = clone(this.itemEntries);
    if(!isMapObject) {
      this.itemBlocks = clone(layerItem.blocks);
    } else {
      this.itemBlocks = filter(clone(layerItem.blocks), function(o) { return !(o.name === 'LAYER'); });
    }
    this.itemBlocksPath[this.itemEntryLevel] = clone(this.itemBlocks);
    this.activeBlocksPath[this.itemEntryLevel] = layerItem;
    this.layerFields = head(values(find(this.mapStateService.getMapState().layerFields, this.layerName)));
    this.layerName = layerItem.layerName;
    this.layerId = layerItem.id;
    this.layerType = layerItem.layerType;
    this.crumbs = [];
    this.crumb = (this.layerType) ?'LAYER' : 'MAP';
  }

  private resolveMenuEntries(itemName, onlyProps) {
    const availableEntries = this.mapStateService.getAvailableEntries(itemName || 'LAYER');

    this.menuEntries = filter(availableEntries, function (it) {
      return (onlyProps) ? it.readOnly !== true : it.valueType === 0 && (it.name !== 'LAYER' && it.name !== 'CLASS');
    });

    this.itemEntries.forEach(element => {
      this.setPreviewValue(element);
      remove(this.menuEntries, function (n: any) {
        return n.name === element.name && !n.allowMultiplesInstances;
      });
    });
    if (this.itemBlocks) {
      this.itemBlocks.forEach(element => {
        this.setPreviewValue(element);
        remove(this.menuEntries, function (n: any) {
          return n.name === element.name && !n.allowMultiplesInstances;
        });
      });
    }
  }

  activateWmsItem(item) {
    if (item) {
      if (item.valueType === 0) {
        this.activeBlocksPath[this.itemEntryLevel] = clone(this.activeBlock);
        this.logger.debug(this.activeBlocksPath[this.itemEntryLevel].name);
        this.itemEntryLevel++;
        this.tooltipClone = `Clone ${item.name} block`;
        this.getInnerItemBlocks(item);
      } else {
        this.activateAndLoadComponent(item);
      }
    }
  }

  deleteEntry(entry) {
    this.mapService.updateMapObject(this.mapStateService.getMapState(), entry, true, true);
    if (entry.valueType === 0) {
      remove(this.itemBlocks, function (n: any) {
        return n.name === entry.name;
      });
      remove(this.itemBlocksPath[this.itemEntryLevel], function (n: any) {
        return n.name === entry.name;
      });
      this.switchItemEntriesAndBlocks(null, true);
    } else {
      remove(this.itemEntries, function (n: any) {
        return n.name === entry.name;
      });
      this.activateWmsItem(this.itemEntries[0]);
    }
    this.resolveMenuEntries(this.crumbs[this.itemEntryLevel], true);
  }

  cloneActiveBlock() {
    const mapstate: MapState = this.mapStateService.getMapState();
    const mapFileObj: MapFileObject = this.mapStateService.getMapFileObject();
    mapstate.objectid = this.activeBlock.id;
    mapstate.layerid = this.layerId;
    const parentBlock = this.itemBlocksPath[this.itemEntryLevel];
    this.mapService.cloneMapBlock(mapstate).subscribe(result => {
      if(result.status!==0) {
        // something went worong cloning the block
        this.messageService.show('error', 'Clonning map block', result.message);
      } else {
        // the block was cloned and its Id is in result.itemId
        mapFileObj.mapfile = result.mapFile;
        this.mapStateService.setMapFileObject(mapFileObj);
        var layerItem = this.mapStateService.getLayerInMapFileObject(mapstate.layerid);
        var block = this.mapStateService.getBlockInLayerObject(layerItem, result.itemId);
        parentBlock.push(block);
        this.switchItemEntriesAndBlocks(null, true);
      } 
    });
  }

  private activateAndLoadComponent(item: any) {
    each(this.itemEntries, function (e) {
      e.isActive = false;
    });
    this.activeEntry = item;
    this.itemHelpEntryName = `${this.activeBlock.name}: ${item.name}`;
    this.itemHelp = item.help;
    item.isActive = true;
    this.wmsValueComponent.loadComponent(this.activeEntry);
    this.buildDeleteMenu();
  }

  private getInnerItemBlocks(item: any) {
    this.activeBlock = item;
    this.refreshCrumbs(item);
    this.switchItemEntriesAndBlocks(item, false);
  }

  private refreshCrumbs(item: any) {
    if (item) {
      this.crumbs[this.itemEntryLevel] = item.name;
    } else {
      this.crumbs.splice(this.itemEntryLevel, 1);
    }
    var crumbRoot = (this.layerType) ?'LAYER' : 'MAP';
    this.crumb =  crumbRoot + this.crumbs.join('/');
  }

  switchItemEntriesAndBlocks(item: any, backToTop: boolean) {
    if (backToTop) {
      if (this.itemEntryLevel > 0) {
        this.itemEntries = clone(this.itemEntriesTop[this.itemEntryLevel]);
        this.itemBlocks = clone(this.itemBlocksPath[this.itemEntryLevel]);
        this.refreshCrumbs('');
        this.itemEntryLevel--;
        this.activeBlock = clone(this.activeBlocksPath[this.itemEntryLevel]);
        this.resolveMenuEntries(this.crumbs[this.itemEntryLevel], true);
        this.logger.debug(this.activeBlock.name);
      }
    } else {
      this.itemEntriesTop[this.itemEntryLevel] = clone(this.itemEntries);
      this.itemBlocksPath[this.itemEntryLevel] = clone(this.itemBlocks);
      this.itemEntries = clone(item.entries);
      this.itemBlocks = clone(item.blocks);
      this.activateWmsItem(this.itemEntries[0]);
      this.resolveMenuEntries(item.name, true);
    }

  }

  incrementEntryLevel(isBlock) {
    if (isBlock) {
      this.itemEntryLevel++;
    } else {
      if (this.itemEntryLevel === 0) {
        return;
      }
    }
  }

  setPreviewValue(item) {
    switch (item.valueType) {
      case enumMapValueTypes._block:
        const ent = find(item.entries, ['name', 'NAME']);
        if (ent) {
          item.previewValue = ent.value;
        }
        break;
      case enumMapValueTypes._double_range:
      case enumMapValueTypes._extent:
      case enumMapValueTypes._xy:
        item.previewValue = item.value.replace(' ', ' - ');
        break;
      case enumMapValueTypes._scaledenom:
        const scales = item.value.split('|');
        item.previewValue = `${this.mapStateService.getMinZoomFromScaleDenom(scales[1])} - ${this.mapStateService.getMaxZoomFromScaleDenom(scales[0])}`;
        break;
      case enumMapValueTypes._data:
      case enumMapValueTypes._proj:
      case enumMapValueTypes._processing:
        item.previewValue = '[...]';
        break;
      case enumMapValueTypes._color:
        item.previewValue = item.value.toUpperCase();
        break;
      default:
        item.previewValue = item.value;
    }
  }

}
