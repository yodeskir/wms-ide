import { Component, Input, ViewEncapsulation, OnInit } from '@angular/core';
import { WmsComponent } from '../wms-generic/wms.component';
import { ColorEvent } from 'ngx-color';
import { MapService } from '../../services/map.service';
import { MapStateService } from '../../services/map-state.service';

@Component({
  template: `
    <div class="col-md-12">
      <label>{{data.name}}</label>
      <color-chrome [disableAlpha]=true [color]="data.value" (onChange)="handleChange($event)" (onChangeComplete)="handleChangeComplete($event,data)">
      </color-chrome>
    </div>
  `,
  encapsulation: ViewEncapsulation.None
})

export class WmsColorSketchComponent implements WmsComponent, OnInit {
  @Input() data: any;
  @Input() srcfields: Array<string>;
  @Input() typeOrigin: boolean;
  selectedColor = '';
  visible: boolean;

  constructor(protected mapStateService: MapStateService, private mapService: MapService) { }

  ngOnInit(): void {
    this.selectedColor = this.data.value;
  }

  clickMe(): void {
    this.visible = false;
  }

  change(value: boolean): void {
    console.log(value);
  }

  handleChange($event: ColorEvent) {
    const rgb = $event.color.rgb;
    this.selectedColor = $event.color.hex; // ('#' + rgb.r.toString(16) + rgb.g.toString(16) + rgb.b.toString(16) + (rgb.a * 255).toString(16).substring(0, 2));
    this.data.value = this.selectedColor;
  }

  handleChangeComplete($event: ColorEvent, entry) {
    this.selectedColor = $event.color.hex;
    this.data.value = this.selectedColor;
    this.mapService.updateMapObject(this.mapStateService.getMapState(), entry, true, false);

  }

}
