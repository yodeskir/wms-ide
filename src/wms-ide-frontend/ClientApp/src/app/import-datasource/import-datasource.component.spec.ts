import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ImportDatasourceComponent } from './import-datasource.component';

describe('ImportDatasourceComponent', () => {
  let component: ImportDatasourceComponent;
  let fixture: ComponentFixture<ImportDatasourceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ImportDatasourceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ImportDatasourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
