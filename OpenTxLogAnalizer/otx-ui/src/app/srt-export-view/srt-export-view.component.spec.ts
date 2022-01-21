import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SrtExportViewComponent } from './srt-export-view.component';

describe('SrtExportViewComponent', () => {
  let component: SrtExportViewComponent;
  let fixture: ComponentFixture<SrtExportViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SrtExportViewComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SrtExportViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
