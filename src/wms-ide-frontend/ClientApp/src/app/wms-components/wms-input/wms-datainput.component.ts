import { Component, Input, ViewChild, OnInit } from '@angular/core';
import { WmsComponent } from '../wms-generic/wms.component';
import { MapService } from '../../services/map.service';
import { MapStateService } from '../../services/map-state.service';

@Component({
  template: `
    <div class="col-md-12" *ngIf="(!data.canUseAttribute==true)">
      <label>{{data.name}}</label>
      <textarea rows="4" nz-input [(ngModel)]="data.value" (change)="updateEntry(data)"></textarea>
    </div>
  `
})
export class WmsDataInputComponent implements WmsComponent, OnInit {
  @Input() srcfields: Array<string>;
  @Input() data: any;
  @Input() layerName: string;

  constructor(protected mapStateService: MapStateService,
    protected mapService: MapService) {  }

  ngOnInit(): void {

  }

  updateEntry(entry) {
    this.mapService.updateMapObject(this.mapStateService.getMapState(), entry, true, false);

  }
}
