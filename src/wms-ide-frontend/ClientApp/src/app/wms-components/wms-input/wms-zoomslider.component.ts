import { Component, Input, OnInit } from '@angular/core';
import { WmsComponent } from '../wms-generic/wms.component';
import { MapStateService } from '../../services/map-state.service';
import { MapService } from '../../services/map.service';

@Component({
  template: `
    <div class="ant-col-24 wms-slider" style="margin-left:5px;">
      <label style="display:block;">{{data.name}}</label>
      <nz-row>
      <div nz-col nzSpan="3"><span class="minmax-label">MIN</span></div>
        <nz-col nzSpan="11">
          <nz-slider [nzMin]="1" [nzMax]="18" [(ngModel)]="minZoomValue" (nzOnAfterChange)="onAfterChange($event)"></nz-slider>
        </nz-col>
        <div nz-col nzSpan="3">
          <nz-input-number [nzMin]="1" [nzMax]="18" [ngStyle]="{ 'marginLeft': '20px' }" [(ngModel)]="minZoomValue"></nz-input-number>
        </div>
      </nz-row>

      <nz-row>
        <div nz-col nzSpan="3"><span class="minmax-label">MAX</span></div>  
        <nz-col nzSpan="11">
          <nz-slider [nzMin]="1" [nzMax]="18" [(ngModel)]="maxZoomValue" (nzOnAfterChange)="onAfterChange($event)"></nz-slider>
        </nz-col>
        <nz-col nzSpan="3">
          <nz-input-number [nzMin]="1" [nzMax]="18" [ngStyle]="{ marginLeft: '20px' }" [(ngModel)]="maxZoomValue"></nz-input-number>
        </nz-col>
      </nz-row>
    
    </div>
  `
})

export class WmsZoomSliderComponent implements WmsComponent, OnInit {
  @Input() data: any;
  @Input() srcfields: Array<string>;
  isMax = false;
  scaleValues = [];
  scales = {};
  minZoomValue = 1;
  maxZoomValue = 18;

  constructor(protected mapStateService: MapStateService, protected mapService: MapService) {
  }


  ngOnInit(): void {
    this.scaleValues = this.data.value.split('|');

    if (this.scaleValues.length === 2) {
      this.minZoomValue = this.mapStateService.getMinZoomFromScaleDenom(this.scaleValues[1]);
      this.maxZoomValue = this.mapStateService.getMaxZoomFromScaleDenom(this.scaleValues[0]);
    }
  }


  onAfterChange(event) {
    const _minscale = this.mapStateService.getMinScaleDenomFromZoom(this.maxZoomValue);
    const _maxscale = this.mapStateService.getMaxScaleDenomFromZoom(this.minZoomValue);

    this.data.value = `${_minscale}|${_maxscale}`;
    this.mapService.updateMapObject(this.mapStateService.getMapState(), this.data, true, false);
  }
}

