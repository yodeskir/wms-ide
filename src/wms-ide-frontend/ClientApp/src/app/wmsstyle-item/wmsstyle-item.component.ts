import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { enumMapValueTypes } from '../wms-components/wms-generic/wms-map.entry.emun';
import { MapService } from '../services/map.service';
import { find, first } from 'lodash';

@Component({
  selector: 'app-wmsstyle-item',
  templateUrl: './wmsstyle-item.component.html',
  styleUrls: ['./wmsstyle-item.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class WmsstyleItemComponent implements OnInit {
  valuePreview: string;
  isColor: boolean;
  isText: boolean;
  blockIcon: string;
  @Input() wmsItem: any;

  constructor(private mapService: MapService) { }

  ngOnInit() {
    switch (this.wmsItem.valueType) {
      case enumMapValueTypes._block:
        switch (this.wmsItem.name.toUpperCase()) {
          case 'CLASS':
            this.blockIcon = 'block';
            break;
          case 'STYLE':
            this.blockIcon = 'bg-colors';
            break;
          case 'LABEL':
            this.blockIcon = 'font-size';
            break;
          case 'LEADER':
            this.blockIcon = 'to-top';
            break;
          case 'METADATA':
            this.blockIcon = 'read';
            break;
          case 'CLUSTER':
            this.blockIcon = 'deployment-unit';
            break;
          case 'VALIDATION':
            this.blockIcon = 'file-protect';
            break;
          case 'GRID':
            this.blockIcon = 'global';
            break;
          case 'PROJECTION':
            this.blockIcon = 'compass';
            break;
          case 'SCALETOKEN':
            this.blockIcon = 'diff';
            break;
          case 'FEATURE':
            this.blockIcon = 'small-dash';
            break;
          case 'POINTS':
            this.blockIcon = 'environment';
            break;
          case 'SCALEBAR':
            this.blockIcon = 'dash';
            break;
          case 'SYMBOL':
            this.blockIcon = 'environment';
            break;
          case 'OUTPUTFORMAT':
            this.blockIcon = 'exception';
            break;
          case 'WEB':
            this.blockIcon = 'radar-chart';
            break;
        }
      case enumMapValueTypes._double_range:
      case enumMapValueTypes._extent:
      case enumMapValueTypes._xy:
        this.valuePreview = this.wmsItem.value;
        this.isText = true;
        break;
      case enumMapValueTypes._scaledenom:
      case enumMapValueTypes._data:
      case enumMapValueTypes._proj:
      case enumMapValueTypes._processing:
        this.valuePreview = '[...]';
        this.isText = true;
        this.isColor = false;
        break;
      case enumMapValueTypes._color:
        this.valuePreview = this.wmsItem.value.toUpperCase();
        this.isColor = true;
        break;
      default:
        this.blockIcon = 'block';
        this.isText = true;
        this.valuePreview = this.wmsItem.value;
    }

  }

  getBlockIcon() {

  }


}
