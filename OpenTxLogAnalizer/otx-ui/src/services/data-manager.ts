import {ILog, OpenTxLogParser} from "./open-tx-log-parser";
import {SrtParser} from "./srt-parser";
import {Injectable} from "@angular/core";
import * as _ from "underscore";
import {Subject} from "rxjs";
import {PersistanceService} from "./persistance-service";

@Injectable()
export class DataManager implements IData {
  openTxLogFileName: string = "";
  originalOtxLogs: ILog[] = [];
  logs = new Subject<ILog[]>();

  get hasData():boolean {
    if (this.openTxLogFileName) return true;
    return false;
  }

  constructor(public otxParser: OpenTxLogParser, public srtParser: SrtParser, private persistance: PersistanceService) {
    //this.loadData();
  }

  loadOpenTxLog(file: FileSystemFileEntry) {
    if (file.name.toLowerCase().endsWith(".csv")) {
      this.openTxLogFileName = file.name;
      file.file(async (f: File) => {
        const text = await f.text();
        this.originalOtxLogs = this.otxParser.parse(text);
        for (let l of this.originalOtxLogs)
          this.updateStatistics(l);
        this.logs.next(this.originalOtxLogs);
        this.saveData();
      });
    }else alert('Only CSV files are supported');
  }

  attachDjiSrtLog(otxLog: ILog, file: FileSystemFileEntry) {
    if (file.name.toLowerCase().endsWith(".srt")) {
      otxLog.srtFileName = file.name;
      file.file(async (f: File) => {
        const text = await f.text();
        const srtLog = this.srtParser.parse(text);
        this.joinSrtLog(otxLog, srtLog);
        this.updateStatistics(otxLog);
        this.logs.next(this.originalOtxLogs);
        this.saveData();
        if (Math.abs(otxLog.duration!.as("seconds") - srtLog.duration!.as("seconds")) > 10)
          alert("Warning, SRT log duration is >10 seconds different to telemetry log, possibly logs mismatch");
      });
    }else alert('Only SRT files are supported');
  }

  joinSrtLog(otxLog: ILog, srtLog:ILog) {
    let s = 0;
    for (let o of otxLog.rows) {
      while (srtLog.rows[s].timecode! < o.timecode! && s < srtLog.rows.length)
        s++;
      if (s < srtLog.rows.length) {
        o.djiBitrate = srtLog.rows[s].djiBitrate;
        o.djiDelay = srtLog.rows[s].djiDelay;
        o.djiChannel = srtLog.rows[s].djiChannel;
        o.djiSignal = srtLog.rows[s].djiSignal;
        o.djiGoggleBattery = srtLog.rows[s].djiGoggleBattery;
      }else {
        o.djiBitrate = 0;
        o.djiDelay = 0;
        o.djiChannel = 0;
        o.djiSignal = 0;
        o.djiGoggleBattery = 0;
      }
    }
  }

  private updateStatistics(log:ILog) {
    const rows = log.rows;
    const last = _.last(rows);
    log.stats = {
      speed: stat(rows.map(x => x.gpsSpeed??0)),
      current: stat(rows.map(x => x.current??0)),
      power: stat(rows.map(x => x.power??0)),
      rxBattery: stat(rows.map(x => x.rxBattery??0)),
      wattPerKm: stat(rows.map(x => x.wattPerKm??0)),
      estimatedRange: stat(rows.map(x => x.estimatedRange??0)),
      estimatedFlightTime: stat(rows.map(x => x.estimatedFlightTime??0)),
      altitude: stat(rows.map(x => x.altitude??0)),
      rss1: stat(rows.map(x => x.rss1??0)),
      rqly: stat(rows.map(x => x.rqly??0)),
      djiDelay: stat(rows.map(x => x.djiDelay ?? 0)),
      djiBitrate: stat(rows.map(x => x.djiBitrate ?? 0)),
      distanceToHome: stat(rows.map(x => x.distanceToHome??0)),
      distanceTraveled: last?.distanceTraveled ?? 0,
      totalCapacity: last?.totalCapacity ?? 0,
      totalWh: last?.totalWh ?? 0,
    };
  }

  private loadData() {
    const t = this.persistance.load<IData>("data-manager-data");
    if (t)
      Object.assign(this, t);
  }

  private saveData() {
    //this.persistance.save<IData>("data-manager-data", {openTxLogFileName: this.openTxLogFileName, originalOtxLogs: this.originalOtxLogs});
  }
}

export interface Stats {
  speed: StatTriple;
  current: StatTriple;
  power: StatTriple;
  rxBattery: StatTriple;
  wattPerKm: StatTriple;
  estimatedRange: StatTriple;
  estimatedFlightTime: StatTriple;
  altitude: StatTriple;
  rss1: StatTriple;
  rqly: StatTriple;
  djiDelay: StatTriple;
  djiBitrate: StatTriple;
  distanceToHome: StatTriple;
  distanceTraveled: number;
  totalCapacity: number;
  totalWh: number;
}

export interface StatTriple {
  min: number;
  avg: number;
  max: number;
}

export interface IData {
  openTxLogFileName: string;
  originalOtxLogs: ILog[];
}

function stat(items:number[]): StatTriple {
  return {
    min: Math.min(...items),
    avg: Math.round(items.reduce((prev, current) => prev + current)/items.length * 10)/10,
    max: Math.max(...items)
  };
}
