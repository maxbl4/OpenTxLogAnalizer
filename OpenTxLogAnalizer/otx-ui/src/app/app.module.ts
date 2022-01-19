import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import {AgGridModule} from "ag-grid-angular";
import {FormsModule} from "@angular/forms";
import {HttpClientModule} from "@angular/common/http";
import {NgxFileDropModule} from "ngx-file-drop";
import {OpenTxLogParser} from "../services/open-tx-log-parser";

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AgGridModule.withComponents([]),
    HttpClientModule,
    NgxFileDropModule
  ],
  providers: [OpenTxLogParser],
  bootstrap: [AppComponent]
})
export class AppModule { }
