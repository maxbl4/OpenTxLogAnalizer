import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogChooserViewComponent } from './log-chooser-view.component';

describe('LogChooserViewComponent', () => {
  let component: LogChooserViewComponent;
  let fixture: ComponentFixture<LogChooserViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LogChooserViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LogChooserViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
