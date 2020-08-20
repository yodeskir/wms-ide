import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ColorbrewerRampComponent } from './colorbrewer-ramp.component';

describe('ColorbrewerRampComponent', () => {
  let component: ColorbrewerRampComponent;
  let fixture: ComponentFixture<ColorbrewerRampComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ColorbrewerRampComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ColorbrewerRampComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
