import { Component, Input } from '@angular/core';
import { WmsComponent } from '../wms-generic/wms.component';
import { zipWith } from 'lodash'

@Component({
  template: `
    <div class="col-md-12">
      <label>{{data.name}}</label>
      <nz-form-item *ngFor="let ext of listOfExtents">
        <nz-form-label [nzSm]="6" [nzXs]="12">{{ext.label}}</nz-form-label>
        <nz-form-control [nzSm]="14" [nzXs]="24">
          <input nz-input [(ngModel)]="ext.value">
        </nz-form-control>
      </nz-form-item>
    </div>
  `
})
export class WmsExtentComponent implements WmsComponent {
  @Input() data: any;
  @Input() srcfields: Array<string>;
  listOfExtentLabels = [];
  listOfExtentValues = [];
  listOfExtents = [];

  ngOnInit(): void {

    this.listOfExtentLabels = ["min-x", "min-y", "max-x", "max-y"];
    this.listOfExtentValues = this.data.value.split(' ');
    this.listOfExtents = zipWith(this.listOfExtentLabels, this.listOfExtentValues, function (l, v) {
      return { 'label': l, 'value': v };    
    })
  }

}
