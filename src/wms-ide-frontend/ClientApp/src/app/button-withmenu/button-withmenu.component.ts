import { Component, OnInit, Input, ViewChild, ViewEncapsulation } from '@angular/core';
import { ContextMenuComponent, ContextMenuService } from 'ngx-contextmenu';
import { NavMenuService } from '../services/nav-menu.service';

@Component({
  selector: 'app-button-withmenu',
  templateUrl: './button-withmenu.component.html',
  styleUrls: ['./button-withmenu.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ButtonWithmenuComponent implements OnInit {
  @Input() tooltipNewEntry: 'Add new entry';
  @Input() tooltipPlacement: 'top';
  @Input() buttonClass: '';
  @Input() blockParent: any;
  @Input() itemMenus: Array<any> = [];
  @ViewChild(ContextMenuComponent, {  }) public entriesMenu: ContextMenuComponent;


  constructor(protected ctxMenu: ContextMenuService, private menuService: NavMenuService) { }

  ngOnInit() {

  }

  public onContextMenu($event: MouseEvent, item: any): void {
    this.ctxMenu.show.next({
      contextMenu: this.entriesMenu,
      event: $event,
      item: item,
    });
    $event.preventDefault();
    $event.stopPropagation();
  }

  execMenuEntry(item) {
    item.value = item.defValue;
    this.menuService.createNewEntryControl(item, this.blockParent);
  }

}
