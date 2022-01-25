import {ILog, ILogRow, Log, LogRow, OpenTxLogParser} from "./open-tx-log-parser";
import {SrtParser} from "./srt-parser";
import {EventEmitter, Injectable} from "@angular/core";
import {PersistenceService} from "./persistence.service";
import {demoProject} from "./demo-log";

@Injectable()
export class DataManager {
  currentLogProject?: LogProject;
  selectedOtxIndex: number = -1;

  otxLogs: Log[] = [];
  srtLog?: Log;
  selectedLog?: Log;
  selectedLogChange = new EventEmitter<Log>();


  constructor(public otxParser: OpenTxLogParser, public srtParser: SrtParser, private persistance: PersistenceService) {
  }

  loadDemoProject(){
    this.currentLogProject = demoProject;
    this.loadOtxLog();
    this.loadSrtLog();
    this.updateSelectedLog(0);
  }

  replaceCurrentLogProject(file: FileSystemFileEntry) {
    if (file.name.toLowerCase().endsWith(".csv")) {
      file.file(async (f: File) => {
        const text = await f.text();
        this.otxLogs = [];
        this.srtLog = undefined;
        this.currentLogProject = {otx: {type: "otx", name: file.name, content: text}, selectedOtxIndex: -1, correction: 1, powerAvailable: 0, startRow: 0, endRow: 0};
        //this.persistance.logProject = this.currentLogProject;
        this.loadOtxLog();
      });
    }else alert('Only CSV files are supported');
  }

  private loadOtxLog() {
    if (!this.currentLogProject) return;
    this.otxLogs = this.otxParser.parse(this.currentLogProject.otx.content);
    for (let l of this.otxLogs)
      l.calculate();
    if (this.otxLogs.length == 1) {
      this.updateSelectedLog(0);
    }else this.updateSelectedLog(-1);
  }

  attachDjiSrtLog(file: FileSystemFileEntry) {
    if (!this.currentLogProject) return;
    const p = this.currentLogProject;
    if (file.name.toLowerCase().endsWith(".srt")) {
      file.file(async (f: File) => {
        const text = await f.text();
        p.srt = {type: "srt", name: file.name, content: text};
        this.loadSrtLog();
      });
    }else alert('Only SRT files are supported');
  }

  loadSrtLog() {
    if (!this.currentLogProject || !this.currentLogProject.srt) return;
    this.srtLog = this.srtParser.parse(this.currentLogProject.srt.content);
    for (let l of this.otxLogs) {
      l.joinSrtLog(this.srtLog);
    }
  }

  public updateSelectedLog(index?: number) {
    if (!this.currentLogProject) return;
    if (index === undefined) index = this.selectedOtxIndex;
    this.selectedOtxIndex = index;
    if (index < 0) {
      this.selectedLog = undefined;
      return;
    }
    const l = this.otxLogs[this.selectedOtxIndex];
    if (this.currentLogProject.selectedOtxIndex != this.selectedOtxIndex) {
      this.currentLogProject.startRow = 0;
      this.currentLogProject.endRow = l.rows.length;
      this.currentLogProject.selectedOtxIndex = this.selectedOtxIndex;
    }else {
      if (this.currentLogProject.startRow < 0) this.currentLogProject.startRow = 0;
      if (this.currentLogProject.endRow > l.rows.length) this.currentLogProject.endRow = l.rows.length;
      if (this.currentLogProject.startRow > this.currentLogProject.endRow)
        this.currentLogProject.startRow = this.currentLogProject.endRow;
    }

    this.selectedLog = new Log(l);
    this.selectedLog.correction = this.currentLogProject.correction;
    this.selectedLog.powerAvailable = this.currentLogProject.powerAvailable;
    this.selectedLog.rows = l.rows.slice(this.currentLogProject.startRow, this.currentLogProject.endRow).map(x => new LogRow(x));
    this.selectedLog.applyCorrection();
    this.selectedLogChange.next(this.selectedLog);
  }
}

export type LogType = "otx"|"srt";

export interface SerializeLogFile {
  name: string;
  content: string;
  type: LogType;
}

export interface LogProject {
  otx: SerializeLogFile;
  srt?: SerializeLogFile;
  selectedOtxIndex: number;

  startRow: number;
  endRow: number;
  correction: number;
  powerAvailable: number;
}
