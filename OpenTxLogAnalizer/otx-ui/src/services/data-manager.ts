import {ILog, OpenTxLogParser} from "./open-tx-log-parser";
import {SrtParser} from "./srt-parser";
import {Injectable} from "@angular/core";

@Injectable()
export class DataManager {
  openTxLogFileName: string = "";
  originalOtxLogs: ILog[] = [];
  private srtFileName: string = "";
  srtLog?: ILog;
  get hasData():boolean {
    if (this.openTxLogFileName) return true;
    return false;
  }

  constructor(public otxParser: OpenTxLogParser, public srtParser: SrtParser) {
  }

  processLog(file: FileSystemFileEntry) {
    this.openTxLogFileName = file.name;
    file.file(async (f: File) => {
      const text = await f.text();
      if (file.name.toLowerCase().endsWith(".csv")){
        this.openTxLogFileName = file.name;
        this.originalOtxLogs = this.otxParser.parse(text);
      }
      if (file.name.toLowerCase().endsWith(".srt")){
        this.srtFileName = file.name;
        this.srtLog = this.srtParser.parse(text);
      }
    });
  }
}
