import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogBoundsControlComponent } from './log-bounds-control.component';

describe('LogBoundsControlComponent', () => {
  let component: LogBoundsControlComponent;
  let fixture: ComponentFixture<LogBoundsControlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LogBoundsControlComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LogBoundsControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
