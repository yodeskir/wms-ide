import { Component, Input, OnInit } from '@angular/core';
import { WmsComponent } from '../wms-generic/wms.component';
import { MapService } from '../../services/map.service';
import { MapStateService } from '../../services/map-state.service';
import { WmsModalService } from '../../services/wms-modal.service';
import { WmsAddProcessingComponent } from './wms-add-processing.component';

@Component({
  template: `
    <div class="col-md-12">
      <label>{{data.name}}</label>
      <nz-table #processingTable nzBordered nzShowPagination=false [nzData]="processingData">
      <thead>
        <tr>
          <th>Name</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let data of processingData" >
          <td><a (click)='editProcessItem(data)'>{{ data.name }} ></a></td>
          <td>{{ data.value }}</td>
        </tr>
      </tbody>
    </nz-table>
    </div>
    <div class="col-md-12 padding-three">
      <button nz-button nzType="default" class="wmsbutton" (click)="showModalDirective()">Add new directive
      </button>
    </div>
  `
})
export class WmsProcessingComponent implements WmsComponent, OnInit {
  processingData: Array<any> = [];
  isModalVisible = false;
  @Input() srcfields: Array<string>;
  @Input() data: any;
  @Input() layerName: string;

  constructor(protected mapStateService: MapStateService, protected mapService: MapService, protected modalService: WmsModalService) {
  }

  ngOnInit(): void {
    let arr = this.data.value.split('|');
    let id = 0;
    arr.forEach(a => {
      const kv = a.split('=');
      this.processingData.push({ 'id': id++, name: kv[0], value: kv[1] });
    });
  }

  editProcessItem(processItem) {
    let inputs = {'mode': 'edit', 'componetWidth':'375px', 'componentLeft':'440px', 'item' : processItem };
    let outputs = { 'entry': this.data, 'currentData': this.processingData };
    this.modalService.init(WmsAddProcessingComponent, inputs, outputs);
  }

  showModalDirective(): void {
    let inputs = {'mode': 'add', 'componetWidth':'375px', 'componentLeft':'440px', 'item' : null};
    let outputs = { 'entry': this.data, 'currentData': this.processingData };
    this.modalService.init(WmsAddProcessingComponent, inputs, outputs);
  }


  updateEntry(entry) {
    this.mapService.updateMapObject(this.mapStateService.getMapState(), entry, true, false);
  }

}
