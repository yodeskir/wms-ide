import { Component, Input, ViewChild, OnInit } from '@angular/core';
import { WmsComponent } from '../wms-generic/wms.component';
import { filter, remove } from 'lodash';
import { ContextMenuService, ContextMenuComponent } from 'ngx-contextmenu';

@Component({
  template: `
  <div class="block-container"><nz-divider *ngIf="(data.name!='CLASS' && blockHasEntries)" [nzText]="text">
    <ng-template #text>{{data.name}}
      <app-button-withmenu [itemMenus]="menuEntries" [blockParent]="data" tooltipNewEntry="Add new entry to {{data.name}}"
        tooltipPlacement="top" buttonClass="entry-button">
      </app-button-withmenu>
    </ng-template>
  </nz-divider>
  <div *ngFor="let lItem of data.entries" class="row">
        <app-wms-component [wmsItem]="lItem" [srcfields]="srcfields"></app-wms-component>
  </div>
  <div *ngFor="let lBlock of data.blocks" class="row">
      <app-wms-component [wmsItem]="lBlock" [srcfields]="srcfields"></app-wms-component>
  </div></div>
  `
})
export class WmsBlockContainerComponent implements WmsComponent, OnInit {
  @Input() data: any;
  @Input() srcfields: Array<string>;
  entries: any;
  blocks: Array<any>;
  menuEntries: Array<string>;
  blockHasEntries = true;
  @ViewChild(ContextMenuComponent) public entriesMenu: ContextMenuComponent;

  constructor(protected ctxMenu: ContextMenuService) {

  }

  ngOnInit(): void {
    this.entries = filter(this.data.entries, { 'readOnly': false });
    this.blocks = this.data.blocks;
    this.menuEntries = this.data.availableEntries;
    this.entries.forEach(element => {
      remove(this.menuEntries, function(n: any) {
        return n.name === element.name;
      });
    });
    this.blockHasEntries = filter(this.entries, { 'readOnly': false }).length > 0;
  }

  public onContextMenu($event: MouseEvent, item: any): void {
    if (this.menuEntries.length > 0) {
      this.ctxMenu.show.next({
        contextMenu: this.entriesMenu,
        event: $event,
        item: item,
      });
    }
    $event.preventDefault();
    $event.stopPropagation();
  }

  addEntry(parent, entry) {
    alert(parent + entry);
  }
}
