import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WmsstyleItemComponent } from './wmsstyle-item.component';

describe('WmsstyleItemComponent', () => {
  let component: WmsstyleItemComponent;
  let fixture: ComponentFixture<WmsstyleItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WmsstyleItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WmsstyleItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
