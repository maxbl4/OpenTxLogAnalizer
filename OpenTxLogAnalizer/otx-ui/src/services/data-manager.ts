import {Log} from "./open-tx-log-parser";
import {EventEmitter, Injectable} from "@angular/core";
import {PersistenceService} from "./persistence.service";
import {demoProject} from "./demo-log";

@Injectable()
export class DataManager {
  worker!: Worker;
  currentLogProject?: LogProject;
  selectedOtxIndex: number = -1;

  otxLogs: Log[] = [];
  srtLog?: Log;
  selectedLog?: Log;
  selectedLogChange = new EventEmitter<Log|undefined>();
  operation?: string;
  progress?: number;

  constructor(private persistance: PersistenceService) {
  }

  initWorker(worker: Worker){
    this.worker = worker;
    worker.onmessage = ({ data }) => {
      switch (data.command) {
        case "set-otx-logs":
          this.otxLogs = data.otxLogs;
          if (this.otxLogs.length == 1) {
            this.updateSelectedLog(0);
          }else this.updateSelectedLog(-1);
          break;
        case "operation-progress":
          this.operation = data.operation;
          this.progress = data.progress;
          break;
        case "operation-done":
          this.operation = undefined;
          this.progress = 0;
          break;
        case "set-selected-log":
          this.selectedLog = data.selectedLog;
          this.selectedLogChange.next(this.selectedLog);
          break;
      }
    };
  }

  loadDemoProject(){
    this.currentLogProject = demoProject;
    this.loadOtxLog();
    this.loadSrtLog();
    this.updateSelectedLog();
  }

  replaceCurrentLogProject(file: FileSystemFileEntry) {
    if (file.name.toLowerCase().endsWith(".csv")) {
      file.file(async (f: File) => {
        const text = await f.text();
        this.otxLogs = [];
        this.srtLog = undefined;
        this.currentLogProject = {otx: {type: "otx", name: file.name, content: text}, selectedOtxIndex: -1, correction: 1, powerAvailable: 0, startRow: 0, endRow: 0};
        this.loadOtxLog();
      });
    }else alert('Only CSV files are supported');
  }

  private loadOtxLog() {
    if (!this.currentLogProject) return;
    this.worker.postMessage({command: 'parse-otx', content: this.currentLogProject.otx.content, data: this});
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
    this.worker.postMessage({command: 'load-srt-log', content: this.currentLogProject.srt.content, data: this});
  }

  public updateSelectedLog(index?: number) {
    this.worker.postMessage({command: 'update-selected-log', data: this});
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
