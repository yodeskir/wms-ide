import { Component, Input, OnInit, ElementRef } from '@angular/core';
import { WmsComponent } from '../wms-generic/wms.component';
import { MapService } from '../../services/map.service';
import { MapStateService } from '../../services/map-state.service';
import { WmsModalService } from '../../services/wms-modal.service';

@Component({
  template: `
  <div class="modal-processing">  
    
    <div nz-row class="padding-one">
      <div nz-col nzSpan="12">
        <label>Directive name</label>
      </div>
    </div>

    <div nz-row class="padding-one">
      <div nz-col nzSpan="24">
        <nz-select name="layerType" [(ngModel)]="directiveName">
          <nz-option *ngFor="let d of directives" [nzValue]="d" [nzLabel]="d"></nz-option>
        </nz-select>
      </div>
    </div>

    <div nz-row class="padding-one">
      <div nz-col nzSpan="12">
        <label>Directive value</label>
      </div>
    </div>

    <div nz-row class="padding-one">
      <div nz-col nzSpan="24">
        <input type="text" nz-input required name="layerName" [(ngModel)]="directiveValue" (ngModelChange)="handleChange()"/>
      </div>
    </div>

    <div nz-row class="padding-five">
      <div nz-col nzSpan="24">
        <button nz-button nzType="default" (click)="handleCancel()">Close</button>  
        <button nz-button nzType="primary" (click)="handleOk()" style="margin-left:8px">Accept</button>
      </div>
    </div>

  </div>
  `
})

export class WmsAddProcessingComponent implements OnInit {
  directives: Array<any> = [];
  directiveName: string;
  directiveValue: string;
  mode: string;
  inputItem: any;
  outEntry: any;
  outProcessingData: any;
  @Input() srcfields: Array<string>;
  @Input() inputs: any;
  
  constructor(private _host: ElementRef, protected mapStateService: MapStateService,
    protected mapService: MapService, protected modalService: WmsModalService) {

  }

  ngOnInit(): void {
    this.directives = ['RANGE_COLORSPACE', 'KERNELDENSITY_RADIUS', 'KERNELDENSITY_COMPUTE_BORDERS', 'KERNELDENSITY_NORMALIZATION'];
    let inputs = this['inputs'];
    let outputs = this['outputs'];

    this.mode = inputs['mode'];
    const width = inputs['componetWidth'] || '400px';
    const left = inputs['componentLeft'] || '400px';
    
    this.inputItem = inputs['item'];
    this.directiveName = (this.inputItem) ? this.inputItem.name : null;
    this.directiveValue = (this.inputItem) ? this.inputItem.value: null;

    this.outEntry = outputs['entry'];
    this.outProcessingData = outputs['currentData'];
    
    this._host.nativeElement.parentElement.style.width = width;
    this._host.nativeElement.parentElement.style.left = left;
    
  }

  handleChange():void {
    this.handleUpdateData();
  }

  handleOk(): void {
    this.handleUpdateData();
    this.modalService.destroy();
  }

  private handleUpdateData() {
    if (this.mode === 'edit') {
      this.inputItem['name'] = this.directiveName;
      this.inputItem['value'] = this.directiveValue;
    }
    else {
      this.outProcessingData.push({ 'id': 0, name: this.directiveName, value: this.directiveValue });
    }
    this.updateProcessingData();
  }

  private updateProcessingData() {
    let entryValues = [];
    for (let i=0; i < this.outProcessingData.length; i++) {
      if(this.outProcessingData[i].name === this.directiveName) {
        this.outProcessingData[i].value = this.directiveValue;
      }
      entryValues.push(`${this.outProcessingData[i].name}=${this.outProcessingData[i].value}`);
    } 
    this.outEntry.value = entryValues.join('|');
    this.updateEntry(this.outEntry);
  }

  handleCancel(): void {
    this.modalService.destroy();
  }

  updateEntry(entry) {
    this.mapService.updateMapObject(this.mapStateService.getMapState(), entry, true, false);
  }

}
