import { Injectable } from '@angular/core';
import { DomService } from './dom.service';

@Injectable()
export class WmsModalService {

  constructor(private domService: DomService) { }
  
  private modalElementId = 'modal-container';
  private overlayElementId = 'overlay';
  public isModalOpen = false;
  init(component: any, inputs: object, outputs: object) {
    if (this.isModalOpen) {
      this.destroy();
    }
    let componentConfig = {
      inputs:inputs,
      outputs:outputs
    }
    this.domService.appendComponentTo(this.modalElementId, component, componentConfig);
    document.getElementById(this.modalElementId).className = 'show';
    document.getElementById(this.overlayElementId).className = 'show';
    this.isModalOpen = true;
  }

  destroy() {
    this.domService.removeComponent();
    document.getElementById(this.modalElementId).className = 'hidden';
    document.getElementById(this.overlayElementId).className = 'hidden';
    this.isModalOpen = false;
  }
}