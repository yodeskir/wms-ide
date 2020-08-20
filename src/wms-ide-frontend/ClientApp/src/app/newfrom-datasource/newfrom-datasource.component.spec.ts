import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewfromDatasourceComponent } from './newfrom-datasource.component';

describe('NewfromDatasourceComponent', () => {
  let component: NewfromDatasourceComponent;
  let fixture: ComponentFixture<NewfromDatasourceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewfromDatasourceComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewfromDatasourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
