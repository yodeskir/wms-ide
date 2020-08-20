import { Directive, ViewContainerRef } from '@angular/core';

@Directive({
  selector: '[wms-host]',
})
export class WmsDirective {
  constructor(public viewContainerRef: ViewContainerRef) { }
}
