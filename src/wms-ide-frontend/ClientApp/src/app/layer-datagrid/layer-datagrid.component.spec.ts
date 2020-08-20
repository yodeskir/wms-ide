import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LayerDatagridComponent } from './layer-datagrid.component';

describe('LayerDatagridComponent', () => {
  let component: LayerDatagridComponent;
  let fixture: ComponentFixture<LayerDatagridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LayerDatagridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LayerDatagridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
