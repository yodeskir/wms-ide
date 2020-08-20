import { Component, Input, ViewEncapsulation, OnInit } from '@angular/core';
import { WmsComponent } from '../wms-generic/wms.component';
import { ColorEvent } from 'ngx-color';
import { MapService } from '../../services/map.service';
import { MapStateService } from '../../services/map-state.service';
import { trim } from 'lodash';

@Component({
  template: `
    <div class="col-md-12">
      <label>{{data.name}} (From)</label>
      <button class="wmsbutton" nz-button nz-popover [nzContent]="startColorTemplate"
          nzPlacement="right"
          [(nzVisible)]="visible"
          (nzVisibleChange)="change($event)"
          nzTrigger="click" [style.background-color]="outputRangeColor[0]" style="width:100%;">
      </button>
      <ng-template #startColorTemplate class="wms-color-picker" style="width:200px;">
        <color-sketch style="width:200px;" [color]="outputRangeColor[0]" (onChange)="handleChangeStart($event)" (onChangeComplete)="handleChangeCompleteStart($event,data)"></color-sketch>
      </ng-template>
    </div>
    <div class="col-md-12">
      <label>{{data.name}} (To)</label>
      <button class="wmsbutton" nz-button nz-popover [nzContent]="endColorTemplate"
          nzPlacement="right"
          nzTrigger="click" [style.background-color]="outputRangeColor[1]" style="width:100%;">
      </button>
      <ng-template #endColorTemplate class="wms-color-picker" style="width:200px;">
        <color-sketch style="width:200px;" [color]="outputRangeColor[1]" (onChange)="handleChangeEnd($event)" (onChangeComplete)="handleChangeCompleteEnd($event,data)"></color-sketch>
      </ng-template>
    </div>
  `,
  encapsulation: ViewEncapsulation.None
})

export class WmsRangeColorComponent implements WmsComponent, OnInit {
  @Input() data: any;
  @Input() srcfields: Array<string>;
  @Input() typeOrigin: boolean;
  inputRangeColor: Array<any> = [];
  outputRangeColor: Array<any> = [];
  selectedColor = '';
  visible: boolean;

  constructor(protected mapStateService: MapStateService, private mapService: MapService) { }

  ngOnInit(): void {
    let hexColor = this.data.value.replace(/'/g, '').split(' ');
    this.inputRangeColor = [this.hexAToRGBA(hexColor[0]), this.hexAToRGBA(hexColor[1])];
    this.outputRangeColor = hexColor;
  }

  clickMe(): void {
    this.visible = false;
  }

  change(value: boolean): void {
    console.log(value);
  }

  handleChangeStart($event: ColorEvent) {
    this.outputRangeColor[0] = this.rgbaToHex($event.color.rgb);
    this.data.value = `'${this.outputRangeColor[0]}' '${this.outputRangeColor[1]}'`;
  }

  handleChangeCompleteStart($event: ColorEvent, entry) {
    this.outputRangeColor[0] = this.rgbaToHex($event.color.rgb);
    this.data.value = `'${this.outputRangeColor[0]}' '${this.outputRangeColor[1]}'`;
    this.mapService.updateMapObject(this.mapStateService.getMapState(), entry, true, false);

  }

  handleChangeEnd($event: ColorEvent) {
    this.outputRangeColor[1] = this.rgbaToHex($event.color.rgb);
    this.data.value = `'${this.outputRangeColor[0]}' '${this.outputRangeColor[1]}'`;
  }

  handleChangeCompleteEnd($event: ColorEvent, entry) {
    this.outputRangeColor[1] = this.rgbaToHex($event.color.rgb);
    this.data.value = `'${this.outputRangeColor[0]}' '${this.outputRangeColor[1]}'`;
    this.mapService.updateMapObject(this.mapStateService.getMapState(), entry, true, false);

  }

  rgbaToHex(rgba) {
    let r = rgba.r.toString(16);
    let g = rgba.g.toString(16);
    let b = rgba.b.toString(16);
    let a = Math.round(rgba.a * 255).toString(16);

    if (r.length == 1)
      r = "0" + r;
    if (g.length == 1)
      g = "0" + g;
    if (b.length == 1)
      b = "0" + b;
    if (a.length == 1)
      a = "0" + a;

    return "#" + r + g + b + a;
    // let alpha = this.pad((rgba.a * 255).toString(16).substring(0, 2));
    // return ('#' + rgba.r.toString(16) + rgba.g.toString(16) + rgba.b.toString(16) + alpha);
  }

  hexToDecimal(hex1, hex2) {
    return parseInt(hex1, 16) + parseInt(hex2, 16);
  }

  hexAToRGBA(h) {
    let r = 0;
    let g = 0;
    let b = 0;
    let a = 1;

    if (h.length == 5) {
      r = this.hexToDecimal(h[1], h[1]);
      g = this.hexToDecimal(h[2], h[2]);
      b = this.hexToDecimal(h[3], h[3]);
      a = this.hexToDecimal(h[4], h[4]);

    } else if (h.length == 9) {
      r = this.hexToDecimal(h[1], h[2]);
      g = this.hexToDecimal(h[3], h[4]);
      b = this.hexToDecimal(h[5], h[6]);
      a = this.hexToDecimal(h[7], h[8]);
    }
    a = +(a / 255).toFixed(3);

    return {'a':a, 'r':r, 'g':g, 'b':b };
    // return "rgba(" + +r + "," + +g + "," + +b + "," + a + ")";
  }


}
