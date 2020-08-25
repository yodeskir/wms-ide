import { Component, Input, OnInit, ViewChild, ComponentFactoryResolver, ViewEncapsulation } from '@angular/core';
import { WmsDirective } from './wms.directive';
import { WmsItem } from './wms-item';
import { WmsComponent } from './wms.component';
import { enumMapValueTypes } from './wms-map.entry.emun';
import { WmsInputComponent } from '../wms-input/wms-input.component';
import { WmsDropdownComponent } from '../wms-input/wms-dropdown.component';
import { WmsExtentComponent } from '../wms-input/wms-extent.component';
import { WmsXYComponent } from '../wms-input/wms-xy.component';
import { WmsColorSketchComponent } from '../wms-input/wms-colorsketch.component';
import { WmsZoomSliderComponent } from '../wms-input/wms-zoomslider.component';
import { WmsBlockContainerComponent } from '../wms-input/wms-blockcontainer.component';
import { WmsDataInputComponent } from '../wms-input/wms-datainput.component';
import { WmsProcessingComponent } from '../wms-input/wms-processing.component';
import { WmsRangeColorComponent } from '../wms-input/wms-rangecolor.component';
import { WmsSymbolPointComponent } from '../wms-input/wms-symbolpoint.component';

@Component({
  selector: 'app-wms-component',
  templateUrl: 'wms-generic.component.html',
  styleUrls: ['./wms-generic.css'],
  encapsulation: ViewEncapsulation.None
})
export class WmsGenericComponent implements OnInit {
  @Input() wmsItem: WmsItem[];
  @Input() srcfields: Array<string>;
  @Input() typeOrigin: boolean;
  @ViewChild(WmsDirective, {  }) wmsHost: WmsDirective;

  constructor(private componentFactoryResolver: ComponentFactoryResolver) { }

  ngOnInit(): void {
    this.loadComponent(this.wmsItem);
  }

  loadComponent(wmsitem) {
    if (wmsitem) {
      const item = this.getControlInstance(wmsitem);
      if (!item.data.readOnly) {
        const componentFactory = this.componentFactoryResolver.resolveComponentFactory(item.component);
        const viewContainerRef = this.wmsHost.viewContainerRef;
        viewContainerRef.clear();
        const componentRef = viewContainerRef.createComponent(componentFactory);
        (<WmsComponent>componentRef.instance).data = item.data;
        (<WmsComponent>componentRef.instance).srcfields = this.srcfields;
      }
    }
  }

  getControlInstance(itemData): WmsItem {

    switch (itemData.valueType) {
      case enumMapValueTypes._block:
        return new WmsItem(WmsBlockContainerComponent, itemData);
      case enumMapValueTypes._char:
        itemData['MaxLength'] = 1;
        return new WmsItem(WmsInputComponent, itemData);
      case enumMapValueTypes._string:
        itemData['MaxLength'] = 1000;
        return new WmsItem(WmsInputComponent, itemData);
      case enumMapValueTypes._set:
        itemData.setValues = (itemData.setValues) ?
          ((itemData.setValues instanceof Array) ?
            itemData.setValues :
            itemData.setValues.split('|')) : [];
        return new WmsItem(WmsDropdownComponent, itemData);
      case enumMapValueTypes._int:
        itemData.NgStep = 1;
        return new WmsItem(WmsInputComponent, itemData);
      case enumMapValueTypes._double:
        itemData.NgStep = 0.1;
        return new WmsItem(WmsInputComponent, itemData);
      case enumMapValueTypes._double_range:
        itemData.NgStep = 0.1;
        return new WmsItem(WmsXYComponent, itemData);
      // case enumMapValueTypes._keyvalue:
      case enumMapValueTypes._extent:
        return new WmsItem(WmsExtentComponent, itemData);
      // case enumMapValueTypes._filename:
      case enumMapValueTypes._color:
        return new WmsItem(WmsColorSketchComponent, itemData);
      case enumMapValueTypes._colorrange:
        return new WmsItem(WmsRangeColorComponent, itemData);
      case enumMapValueTypes._xy:
        return new WmsItem(WmsXYComponent, itemData);
      case enumMapValueTypes._symbol:
        return new WmsItem(WmsSymbolPointComponent, itemData);
        // case enumMapValueTypes._mimetype:
      case enumMapValueTypes._scaledenom:
        return new WmsItem(WmsZoomSliderComponent, itemData);
      // case enumMapValueTypes._attribute:
      case enumMapValueTypes._data:
        return new WmsItem(WmsDataInputComponent, itemData);
      // case enumMapValueTypes._func:
      // case enumMapValueTypes._lyrref:
      // case enumMapValueTypes._setpoints:
      // case enumMapValueTypes._wkt:
      case enumMapValueTypes._processing:
        return new WmsItem(WmsProcessingComponent, itemData);
      case enumMapValueTypes._proj:
        return new WmsItem(WmsInputComponent, itemData);
      default:
        return new WmsItem(WmsInputComponent, itemData);
    }
  }
}


