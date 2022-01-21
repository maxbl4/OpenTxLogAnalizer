import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsageTextViewComponent } from './usage-text-view.component';

describe('UsageTextViewComponent', () => {
  let component: UsageTextViewComponent;
  let fixture: ComponentFixture<UsageTextViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UsageTextViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UsageTextViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
