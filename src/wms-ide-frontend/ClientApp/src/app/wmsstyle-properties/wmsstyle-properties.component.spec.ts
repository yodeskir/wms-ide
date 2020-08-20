import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WmsstylePropertiesComponent } from './wmsstyle-properties.component';

describe('WmsstylePropertiesComponent', () => {
  let component: WmsstylePropertiesComponent;
  let fixture: ComponentFixture<WmsstylePropertiesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WmsstylePropertiesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WmsstylePropertiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
