import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NavNewlayerComponent } from './nav-newlayer.component';

describe('NavNewlayerComponent', () => {
  let component: NavNewlayerComponent;
  let fixture: ComponentFixture<NavNewlayerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NavNewlayerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NavNewlayerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
