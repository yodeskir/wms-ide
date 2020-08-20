import { Component, Input, OnInit  } from '@angular/core';
import { WmsComponent } from '../wms-generic/wms.component';
import { MapStateService } from '../../services/map-state.service';
import { MapService } from '../../services/map.service';

@Component({
  template: `
    <div class="col-md-12">
      <label>{{data.name}}</label>
      <nz-select style="width: 100%;" [(ngModel)]="selectedValue" (ngModelChange)="updateEntry(data)">
        <nz-option *ngFor="let p of listOfOption" [nzValue]="p" [nzLabel]="p"></nz-option>
      </nz-select>
    </div>
  `
})

export class WmsDropdownComponent implements WmsComponent, OnInit {
  @Input() data: any;
  @Input() srcfields: Array<string>;
  listOfOption = [];
  selectedValue;

  constructor(protected mapStateService: MapStateService, protected mapService: MapService) {
  }

  ngOnInit(): void {
    this.selectedValue = (this.data.value) ? this.data.value.toLowerCase() : this.data.setValues[0].toLowerCase();
    this.listOfOption = this.data.setValues;
  }

  setField(item) {
    if (this.data.canUseAttribute && this.data.encloseInBrakets) {
      this.data.value = '[' + item + ']';
    } else {
      this.data.value = item;
    }
    this.updateEntry(this.data);
  }

  updateEntry(entry) {
    entry.value = this.selectedValue;
    this.mapService.updateMapObject(this.mapStateService.getMapState(), entry, true, false);

  }

}
