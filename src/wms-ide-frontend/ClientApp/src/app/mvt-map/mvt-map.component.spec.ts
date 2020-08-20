import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MvtMapComponent } from './mvt-map.component';

describe('MvtMapComponent', () => {
  let component: MvtMapComponent;
  let fixture: ComponentFixture<MvtMapComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MvtMapComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MvtMapComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
