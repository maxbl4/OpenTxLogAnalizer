import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import {AgGridModule} from "ag-grid-angular";
import {FormsModule} from "@angular/forms";
import {HttpClientModule} from "@angular/common/http";
import {NgxFileDropModule} from "ngx-file-drop";
import {OpenTxLogParser} from "../services/open-tx-log-parser";
import {NgbDropdownModule, NgbModalModule, NgbNavModule, NgbTooltipModule} from "@ng-bootstrap/ng-bootstrap";
import {NgxChartsModule} from "@swimlane/ngx-charts";
import {BrowserAnimationsModule} from "@angular/platform-browser/animations";
import {DataManager} from "../services/data-manager";
import {SrtParser} from "../services/srt-parser";
import {SrtGenerator} from "../services/srt-generator";
import { StatisticsViewComponent } from './statistics-view/statistics-view.component';
import { ChartsViewComponent } from './charts-view/charts-view.component';
import { UsageTextViewComponent } from './usage-text-view/usage-text-view.component';
import { LogChooserViewComponent } from './log-chooser-view/log-chooser-view.component';
import { SrtExportViewComponent } from './srt-export-view/srt-export-view.component';
import {PersistanceService} from "../services/persistance-service";
import { MapViewComponent } from './map-view/map-view.component';

@NgModule({
  declarations: [
    AppComponent,
    StatisticsViewComponent,
    ChartsViewComponent,
    UsageTextViewComponent,
    LogChooserViewComponent,
    SrtExportViewComponent,
    MapViewComponent
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
    NgxChartsModule,
    BrowserAnimationsModule,
  ],
  providers: [OpenTxLogParser, DataManager, SrtParser, SrtGenerator, PersistanceService],
  bootstrap: [AppComponent]
})
export class AppModule { }
