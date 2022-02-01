import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import {AgGridModule} from "ag-grid-angular";
import {FormsModule} from "@angular/forms";
import {HttpClientModule} from "@angular/common/http";
import {NgxFileDropModule} from "ngx-file-drop";
import {
  NgbDropdownModule,
  NgbModalModule,
  NgbNavModule,
  NgbProgressbarModule,
  NgbTooltipModule
} from "@ng-bootstrap/ng-bootstrap";
import {NgxChartsModule} from "@swimlane/ngx-charts";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {DataManager} from "../services/data-manager";
import {SrtGenerator} from "../services/srt-generator";
import { StatisticsViewComponent } from './statistics-view/statistics-view.component';
import { ChartsViewComponent } from './charts-view/charts-view.component';
import { UsageTextViewComponent } from './usage-text-view/usage-text-view.component';
import { LogChooserViewComponent } from './log-chooser-view/log-chooser-view.component';
import { SrtExportViewComponent } from './srt-export-view/srt-export-view.component';
import {PersistenceService} from "../services/persistence.service";
import { MapViewComponent } from './map-view/map-view.component';
import { LogBoundsControlComponent } from './log-bounds-control/log-bounds-control.component';

@NgModule({
  declarations: [
    AppComponent,
    StatisticsViewComponent,
    ChartsViewComponent,
    UsageTextViewComponent,
    LogChooserViewComponent,
    SrtExportViewComponent,
    MapViewComponent,
    LogBoundsControlComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AgGridModule.withComponents([]),
    HttpClientModule,
    NgxFileDropModule,
    NgbDropdownModule,
    NgbNavModule,
    NgbTooltipModule,
    NgbModalModule,
    NgbProgressbarModule,
    NgxChartsModule,
    BrowserAnimationsModule,
  ],
  providers: [DataManager, SrtGenerator, PersistenceService],
  bootstrap: [AppComponent]
})
export class AppModule { }
