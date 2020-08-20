import { Component, Input, ViewChild, ViewEncapsulation, OnInit } from '@angular/core';
import { WmsComponent } from '../wms-generic/wms.component';
import { ContextMenuComponent, ContextMenuService } from 'ngx-contextmenu';
import { MapStateService } from '../../services/map-state.service';
import { MapService } from '../../services/map.service';
import { WmsModalService } from '../../services/wms-modal.service';
import { SymbolGeneratorComponent } from '../../symbol-generator/symbol-generator.component';

@Component({
  template: `
    <div class="col-md-12" *ngIf="(!data.canUseAttribute==true)">
      <label>{{data.name}}</label>
      <nz-row>  
        <div nz-col nzSpan="12" class="text-center"><label>X</label></div>
        <div nz-col nzSpan="12" class="text-center"><label>Y</label></div>
      </nz-row>
      <nz-row>  
        <div nz-col nzSpan="12"><input class="text-center" [(ngModel)]="listOfValues[0]" style="width: 90%;" (change)="updateEntry(data)"/></div>
        <div nz-col nzSpan="12"><input class="text-center" [(ngModel)]="listOfValues[1]" style="width: 90%;" (change)="updateEntry(data)"/></div>
      </nz-row>
    </div>
    <div nz-row class="margin-three">
        <button nz-button class="wmsbutton" [nzType]="'primary'" [nzLoading]="uploading" (click)="showModalDesigner()"
          style="margin-top: 16px">
          Symbol designer
        </button>
    </div>
  `,
  encapsulation: ViewEncapsulation.None
})

export class WmsSymbolPointComponent implements OnInit, WmsComponent {
  SPACE = ' ';
  @Input() data: any;
  @Input() srcfields: Array<string>;
  listOfValues = [];
  @ViewChild(ContextMenuComponent) public fieldsMenuX: ContextMenuComponent;
  @ViewChild(ContextMenuComponent) public fieldsMenuY: ContextMenuComponent;

  constructor(protected mapStateService: MapStateService, protected mapService: MapService, 
    protected ctxMenu: ContextMenuService, protected modalService: WmsModalService) {
  }

  ngOnInit(): void {
    this.listOfValues = this.data.value.split(this.SPACE);
  }

  public onContextMenu($event: MouseEvent, item: any): void {
    this.ctxMenu.show.next({
      event: $event,
      item: item,
    });
    $event.preventDefault();
    $event.stopPropagation();
  }

  setField(item, value) {
    if (item === 'X') {
      this.listOfValues[0] = `[${value}]`;
    }
    if (item === 'Y') {
      this.listOfValues[1] = `[${value}]`;
    }
    this.updateEntry(this.data);
  }

  updateEntry(entry) {
    entry.value = `${this.listOfValues[0]}${this.SPACE}${this.listOfValues[1]}`;
    this.mapService.updateMapObject(this.mapStateService.getMapState(), entry, true, false);
  }

  showModalDesigner(): void {
    let inputs = {'mode': 'add', 'componetWidth':'375px', 'componentLeft':'440px', 'item' : null};
    let outputs = { 'entry': this.data, 'currentData': this.listOfValues };
    this.modalService.init(SymbolGeneratorComponent, inputs, outputs);
  }

}
