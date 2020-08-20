import { Component, Input, ViewChild, ViewEncapsulation, OnInit } from '@angular/core';
import { WmsComponent } from '../wms-generic/wms.component';
import { ContextMenuComponent, ContextMenuService } from 'ngx-contextmenu';
import { MapStateService } from '../../services/map-state.service';
import { MapService } from '../../services/map.service';

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
    <div class="col-md-12" *ngIf="(data.canUseAttribute==true)">
      <label>{{data.name}}</label>
      <nz-input-group nzCompact>
        <nz-input-group nzAttribute [nzSuffix]="suffixIconButtonX" style="margin-left: 10px; width:80%">
          <input #inputX nz-input [(ngModel)]="listOfValues[0]" (change)="updateEntry(data)"/>
        </nz-input-group>
        <ng-template #suffixIconButtonX>
            <button nz-button [contextMenu]="fieldsMenuX" (click)="onContextMenu($event, 'X')" nzTitle="Use an attribute from DB" nz-tooltip nzType="default" nzAttribute>
              <i class="anticon anticon-database"></i>
            </button>
            <context-menu #fieldsMenuX>
              <ng-template contextMenuItem *ngFor="let lfield of layerFields" (execute)="setField($event.item, lfield)">
                {{lfield}}
              </ng-template>
            </context-menu>
        </ng-template>

        <nz-input-group nzAttribute [nzSuffix]="suffixIconButtonY" style="margin-left: 10px; width:80%">
          <input #inputY nz-input [(ngModel)]="listOfValues[1]" (change)="updateEntry(data)"/>
        </nz-input-group>
        <ng-template #suffixIconButtonY>
            <button nz-button [contextMenu]="fieldsMenuY" (click)="onContextMenu($event, 'Y')" nzTitle="Use an attribute from DB" nz-tooltip nzType="default" nzAttribute>
              <i class="anticon anticon-database"></i>
            </button>
            <context-menu #fieldsMenuY>
              <ng-template contextMenuItem *ngFor="let lfield of srcfields" (execute)="setField($event.item, lfield)">
                {{lfield}}
              </ng-template>
            </context-menu>
        </ng-template>

      </nz-input-group>
    </div>
  `,
  encapsulation: ViewEncapsulation.None
})

export class WmsXYComponent implements OnInit, WmsComponent {
  SPACE = ' ';
  @Input() data: any;
  @Input() srcfields: Array<string>;
  listOfValues = [];
  @ViewChild(ContextMenuComponent) public fieldsMenuX: ContextMenuComponent;
  @ViewChild(ContextMenuComponent) public fieldsMenuY: ContextMenuComponent;

  constructor(protected mapStateService: MapStateService, protected mapService: MapService, protected ctxMenu: ContextMenuService) {
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



}
