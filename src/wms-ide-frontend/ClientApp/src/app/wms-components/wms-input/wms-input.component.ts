import { Component, Input, ViewChild, OnInit } from '@angular/core';
import { WmsComponent } from '../wms-generic/wms.component';
import { ContextMenuComponent, ContextMenuService } from 'ngx-contextmenu';
import { MapService } from '../../services/map.service';
import { MapStateService } from '../../services/map-state.service';

@Component({
  template: `
    <div class="col-md-12" *ngIf="(!data.canUseAttribute==true)">
      <label>{{data.name}}</label>
      <input nz-input ngMaxlength="data.MaxLength" [(ngModel)]="data.value" (change)="updateEntry(data)"/>
    </div>
    <div class="col-md-12" *ngIf="(data.canUseAttribute==true)">
      <label>{{data.name}}</label>
      <nz-input-group nzAttribute [nzSuffix]="suffixIconButton">
        <input nz-input [(ngModel)]="data.value" (change)="updateEntry(data)"/>
      </nz-input-group>
      <ng-template #suffixIconButton>
          <button nz-button (click)="onContextMenu($event, item)" nzTitle="Use an attribute from DB"
            nz-tooltip nzType="default" nzAttribute><i class="anticon anticon-database"></i></button>
          <context-menu #fieldsMenu>
            <ng-template contextMenuItem *ngFor="let lfield of srcfields" (execute)="setField(lfield)">
              {{lfield}}
            </ng-template>
          </context-menu>
      </ng-template>
    </div>
  `
})
export class WmsInputComponent implements WmsComponent, OnInit {
  @Input() srcfields: Array<string>;
  @Input() data: any;
  @Input() layerName: string;
  @ViewChild(ContextMenuComponent) public fieldsMenu: ContextMenuComponent;

  constructor(protected mapStateService: MapStateService, protected mapService: MapService, protected ctxMenu: ContextMenuService) {
  }

  ngOnInit(): void {

  }

  public onContextMenu($event: MouseEvent, item: any): void {
    if (this.srcfields.length > 0) {
      this.ctxMenu.show.next({
        // Optional - if unspecified, all context menu components will open
        contextMenu: this.fieldsMenu,
        event: $event,
        item: item,
      });
    }
    $event.preventDefault();
    $event.stopPropagation();
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
    this.mapService.updateMapObject(this.mapStateService.getMapState(), entry, true, false);

  }
}
