import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TogeomDatasourceComponent } from './togeom-datasource.component';

describe('TogeomDatasourceComponent', () => {
  let component: TogeomDatasourceComponent;
  let fixture: ComponentFixture<TogeomDatasourceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TogeomDatasourceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TogeomDatasourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
