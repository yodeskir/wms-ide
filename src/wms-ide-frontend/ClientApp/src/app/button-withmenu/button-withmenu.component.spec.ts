import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonWithmenuComponent } from './button-withmenu.component';

describe('ButtonWithmenuComponent', () => {
  let component: ButtonWithmenuComponent;
  let fixture: ComponentFixture<ButtonWithmenuComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ButtonWithmenuComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ButtonWithmenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
