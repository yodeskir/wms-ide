import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { WmsModalService } from '../services/wms-modal.service';

@Component({
  selector: 'app-wms-modal',
  templateUrl: './wms-modal.component.html',
  styleUrls: ['./wms-modal.component.css'],
  encapsulation: ViewEncapsulation.None,
})

export class WmsModalComponent implements OnInit {
  width;
  left;
  top;
  constructor(protected modalService: WmsModalService) { }

  ngOnInit(): void {
    if (this['inputs']) {
      this.width = this['inputs']['componetWidth'] || '350px';
      this.left = this['inputs']['componentLeft'] || `calc(50% - ${this.width / 2})`;
      this.top = this['inputs']['componentTop'] || '25%';
    }
  }

  setStyles() {
    if (this['inputs']) {
      let styles = {
        'width': this['inputs']['componetWidth'] || '350px',
        'left': this['inputs']['componentLeft'] || `calc(50% - ${this.width / 2})`,
        'top': this['inputs']['componentTop'] || '25%'
      };
      return styles;
    }
  }

  removeModal() {
    this.modalService.destroy();
  }

}
