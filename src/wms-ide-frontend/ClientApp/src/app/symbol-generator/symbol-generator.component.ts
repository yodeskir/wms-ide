import { Component, OnInit, ElementRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-symbol-generator',
  templateUrl: './symbol-generator.component.html',
  styleUrls: ['./symbol-generator.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class SymbolGeneratorComponent implements OnInit {

  pointMaxValue = 1.05;
  pointXValues: Array<number> = [];
  pointYValues: Array<number> = [];
  pointValues: Array<any> = [];
  firstPoint: any = { x: -1, y: -1 };
  lastPoint: any = { x: -1, y: -1 };
  lines: Array<any> = [];
  XAxisValues: Array<any> = [];
  YAxisValues: Array<any> = [];
  symbolPoints: Array<any> = [];
  constructor(private elRef: ElementRef) {

  }


  ngOnInit() {

    this.createXAxis();
    this.createYAxis();
    this.createPointMatrix();

  }

  private createXAxis() {
    let cols = [];
    cols.push({ 'Xi': 5, 'Yi': 10, 'X': '', 'Y': '0', 'Active': false, 'Hover': false });
    let xi = 0;
    let xpos = 20;
    let xposTmp = 20;
    let ypos = 10;
    for (let j = 0; j < 21; j++) {
      let X = parseFloat(xi.toFixed(2));
      const l = X.toString().length;
      if (l > 3) {
        xposTmp = xpos + 1
      } else if (l == 1) {
        xposTmp = xpos + 8;
      } else {
        xposTmp = xpos + 5
      }
      cols.push({ 'Xi': xposTmp, 'Yi': ypos, 'X': X.toString(), 'Y': '0', 'Active': false, 'Hover': false });
      xi += 0.05;
      xpos += 20;
    }
    this.XAxisValues.push(cols);
  }

  private createYAxis() {
    let cols = [];
    cols.push({ 'Xi': 0, 'Yi': 10, 'X': '', 'Y': '', 'Active': false, 'Hover': false });
    let yi = 0;
    let xpos = 0;
    let ypos = 20;
    for (let j = 0; j < 21; j++) {
      let Y = parseFloat(yi.toFixed(2));
      cols.push({ 'Xi': xpos, 'Yi': ypos + 10, 'X': '0', 'Y': Y.toString(), 'Active': false, 'Hover': false });
      yi += 0.05;
      ypos += 20;
    }
    this.YAxisValues.push(cols);
  }

  private createPointMatrix() {
    let yi = 0;
    let xi = 0;
    let xpos = 20;
    let ypos = 20;
    for (let i = 0; i < 21; i++) {
      xi = 0;
      xpos = 20;
      let cols = [];
      let Y = parseFloat(yi.toFixed(2));
      for (let j = 0; j < 21; j++) {
        let X = parseFloat(xi.toFixed(2));
        cols.push({ 'Xi': xpos, 'Yi': ypos, 'X': X.toString(), 'Y': Y.toString(), 'Active': false, 'Hover': false });
        xi += 0.05;
        xpos += 20;
      }
      this.pointValues.push(cols);
      yi += 0.05;
      ypos += 20;
    }
  }

  pointClick(event: MouseEvent): void {
    //let a = event.currentTarget['attributes']['data-active'].value === 'true';
    let ptX = event.currentTarget['attributes']['data-x'].value;
    let ptY = event.currentTarget['attributes']['data-y'].value;
    const x = event.currentTarget['attributes']['x'].value;
    const y = event.currentTarget['attributes']['y'].value;
    //a = !a;
    //event.currentTarget['attributes']['data-active'].value = (a).toString();
    //if (a) {
    event.currentTarget['classList'].add("point-active");
    this.lastPoint = { 'x': this.firstPoint.x, 'y': this.firstPoint.y };
    this.firstPoint = { 'x': parseInt(x) + 10, 'y': parseInt(y) + 10 };
    if (this.firstPoint.x >= 0 && this.firstPoint.y >= 0 && this.lastPoint.x >= 0 && this.lastPoint.y >= 0) {
      this.lines.push({ x1: this.firstPoint.x, y1: this.firstPoint.y, x2: this.lastPoint.x, y2: this.lastPoint.y });
    }
    this.symbolPoints.push(`${ptX} ${ptY}`);
    //} else {
    //  event.currentTarget['classList'].remove("point-active");
    //}
  }

  addStep(event: MouseEvent): void {
    this.lastPoint = { 'x': -1, 'y': -1 };
    this.firstPoint = { 'x': -1, 'y': -1 };
    this.symbolPoints.push('-99 -99');
  }

}
