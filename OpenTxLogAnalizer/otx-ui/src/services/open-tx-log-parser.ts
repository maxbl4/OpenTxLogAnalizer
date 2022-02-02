import {DateTime, Duration} from "luxon";
import {LatLon, Distance} from "gps";
import {Injectable} from "@angular/core";
import {statKeys, IStats, IStatTriple, Stats} from "./IStats";

@Injectable()
export class OpenTxLogParser {
  parse(text: string): Log[] {
    const lines = text.split("\n");
    if (lines.length == 0) return [];
    const fieldNames = this.readHeader(lines[0]);

    const logs:Log[] = [];
    let currentLog: Log|null = null;
    let prevRow: ILogRow|null = null;
    let startTimestamp: DateTime|null = null;
    let home: LatLon = {lat:0,lon:0};
    let index = 1;

    for (let i = 1; i < lines.length; i++){
      const values = lines[i].split(",");
      if (values.length != fieldNames.length)
        continue;
      const row: any = {};
      for (let f = 0; f < fieldNames.length; f++) {
        row[fieldNames[f]] = values[f];
      }
      const typedRow = new LogRow(row);
      typedRow.Date = DateTime.fromISO(row["Date"]);
      typedRow.Time = Duration.fromISOTime(row["Time"]);
      typedRow.timestamp = typedRow.Date.plus(typedRow.Time);
      typedRow.rss1 = parseInt(row["1RSS(dB)"]);
      typedRow.rss2 = parseInt(row["2RSS(dB)"]);
      typedRow.rsnr = parseInt(row["RSNR(dB)"]);
      typedRow.rfmd = parseInt(row["RFMD"]);
      typedRow.rqly = parseInt(row["RQly(%)"]) - 1 + 100 * typedRow.rfmd;
      typedRow.trss = parseInt(row["TRSS(dB)"]);
      typedRow.tqly = parseInt(row["TQly(%)"]);
      typedRow.tsnr = parseInt(row["TSNR(dB)"]);
      typedRow.tpwr = parseInt(row["TPWR(mW)"]);
      typedRow.txBattery = parseFloat(row["TxBat(V)"]);
      typedRow.rxBattery = parseFloat(row["RxBt(V)"]);
      typedRow.current = parseFloat(row["Curr(A)"]);
      typedRow.capacity = parseFloat(row["Capa(mAh)"]);
      typedRow.batteryPercent = Math.round(parseFloat(row["Bat_(%)"]) * 10)/10;
      typedRow.pitchDeg = Math.round( parseFloat(row["Ptch(rad)"]) * 180 / Math.PI);
      typedRow.rollDeg = Math.round(parseFloat(row["Roll(rad)"]) * 180 / Math.PI);
      typedRow.yawDeg = Math.round(parseFloat(row["Yaw(rad)"]) * 180 / Math.PI);
      typedRow.aileron = Math.round((parseFloat(row["Ail"]) + 1024) * 100 / 2048);
      typedRow.throttle = Math.round((parseFloat(row["Thr"]) + 1024) * 100 / 2048);
      typedRow.rudder = Math.round((parseFloat(row["Rud"]) + 1024) * 100 / 2048);
      typedRow.elevator = Math.round((parseFloat(row["Ele"]) + 1024) * 100 / 2048);
      typedRow.sats = parseInt(row["Sats"]);
      typedRow.altitude = Math.round(parseFloat(row["Alt(m)"])*10)/10;
      typedRow.gps = row["GPS"];
      typedRow.gpsSpeed = Math.round(parseFloat(row["GSpd(kmh)"])*10)/10;
      typedRow.distanceTraveled = 0;
      const coords = row["GPS"] as string;
      if (coords && coords.length > 5) {
        const parts = coords.split(" ");
        if (parts.length == 2){
          typedRow.lat = parseFloat(parts[0]);
          typedRow.lon = parseFloat(parts[1]);
          typedRow.position = {lat:typedRow.lat, lon: typedRow.lon}
        }
      }
      typedRow.calculate();

      if (prevRow === null || (typedRow.timestamp.diff(prevRow.timestamp!).as('seconds') > 10)){
        if (currentLog && prevRow) {
          currentLog.duration = prevRow.timestamp!.diff(startTimestamp!);
          currentLog.calculate();
        }
        currentLog = new Log({timestamp: typedRow.timestamp, rows:[], capacityUsed: 0, powerUsed: 0, correction: 1, powerAvailable: 0});
        logs.push(currentLog);
        startTimestamp = typedRow.timestamp;
        index = 1;
        if (typedRow.position) {
          home = typedRow.position;
        }
      }else {
        if (prevRow.position && typedRow.position) {
          typedRow.distanceTraveled = prevRow.distanceTraveled! +
            Math.round(Distance(prevRow.position.lat, prevRow.position.lon, typedRow.position.lat, typedRow.position.lon) * 1000);
        }else {
          typedRow.distanceTraveled = prevRow.distanceTraveled;
        }
      }
      typedRow.index = index++;

      if (home && typedRow.position) {
        typedRow.distanceToHome = Math.round(Distance(home.lat, home.lon, typedRow.position.lat, typedRow.position.lon) * 1000);
      }

      typedRow.timecode = typedRow.timestamp.diff(startTimestamp!).as('seconds');

      currentLog!.rows.push(typedRow);
      prevRow = typedRow;
    }

    if (currentLog && prevRow) {
      currentLog.duration = prevRow.timestamp!.diff(startTimestamp!);
      currentLog.calculate();
    }
    return logs;
  }

  exportToCsv(log:ILog): string {
    const s = getSeparatorChars();
    let csv = csvFieldMap.map(x => x.title).join(s.csv) + "\n";
    for (let r of log.rows) {
      let row = "";
      for (let f of csvFieldMap) {
        const value = ((<any>r)[f.field] ?? "").toString().replace(".", s.decimal);
        row += value + s.csv;
      }
      csv += row + "\n";
    }
    return csv;
  }

  readHeader(header: string): string[] {
    return header.split(",").map(x => x.trim());
  }
}

const csvFieldMap = [
  {title:"Index", field: "index"},
  {title:"Timecode", field: "timecode"},
  {title:"Timestamp", field: "timestamp"},
  {title:"Lat", field: "lat"},
  {title:"Lon", field: "lon"},
  {title:"DistanceToHome", field: "distanceToHome"},
  {title:"DistanceTraveled", field: "distanceTraveled"},
  {title:"1RSS(dB)", field: "rss1"},
  {title:"2RSS(dB)", field: "rss2"},
  {title:"RQly(%)", field: "rqly"},
  {title:"RSNR(dB)", field: "rsnr"},
  {title:"ANT", field: "ANT"},
  {title:"RFMD", field: "rfmd"},
  {title:"TPWR(mW)", field: "tpwr"},
  {title:"TRSS(dB)", field: "trss"},
  {title:"TQly(%)", field: "tqly"},
  {title:"TSNR(dB)", field: "tsnr"},
  {title:"RxBt(V)", field: "rxBattery"},
  {title:"Curr(A)", field: "current"},
  {title:"Capa(mAh)", field: "capacity"},
  {title:"Power", field: "power"},
  {title:"WattPerKm", field: "wattPerKm"},
  {title:"TotalCapacity", field: "totalCapacity"},
  {title:"EstimatedRange", field: "estimatedRange"},
  {title:"EstimatedFlightTime", field: "estimatedFlightTime"},
  {title:"Bat_(%)", field: "batteryPercent"},
  {title:"Ptch(rad)", field: "pitchDeg"},
  {title:"Roll(rad)", field: "rollDeg"},
  {title:"Yaw(rad)", field: "yawDeg"},
  {title:"FM", field: "FM"},
  {title:"GPS", field: "GPS"},
  {title:"GSpd(kmh)", field: "gpsSpeed"},
  {title:"Hdg(@)", field: "Hdg(@)"},
  {title:"Sats", field: "Sats"},
  {title:"Rud", field: "rudder"},
  {title:"Ele", field: "elevator"},
  {title:"Thr", field: "throttle"},
  {title:"Ail", field: "aileron"},
  {title:"SA", field: "SA"},
  {title:"SB", field: "SB"},
  {title:"SC", field: "SC"},
  {title:"SD", field: "SD"},
  {title:"SE", field: "SE"},
  {title:"SF", field: "SF"},
  {title:"LSW", field: "LSW"},
  {title:"TxBat(V)", field: "txBattery"},
  {title:"DjiDelay", field: "djiDelay"},
  {title:"DjiBitrate", field: "djiBitrate"},
  {title:"DjiSignal", field: "djiSignal"},
  {title:"DjiChannel", field: "djiChannel"},
  {title:"DjiGoggleBattery", field: "djiGoggleBattery"},
];

function getSeparatorChars() {
  return {decimal: ",", csv: ";"};
  const n = 1.1;
  const decimal = n.toLocaleString().substring(1, 2);
  if (decimal != ".") {
    return {decimal: ",", csv: ";"}
  }
  return {decimal: ".", csv: ","}
}

export interface ILog {
  timestamp?: DateTime;
  duration?: Duration;
  rows: ILogRow[];
  isSelected?: boolean;
  srtFileName?: string;
  stats?: IStats;
  capacityUsed: number;
  powerUsed: number;
  powerAvailable: number;
  correction: number;
}

export class Log implements ILog {
  constructor(props: ILog) {
    Object.assign(this, props);
    this.rows = props.rows.map(x => new LogRow(x));
    this.capacityUsed = props.capacityUsed;
    this.powerUsed = props.powerUsed;
    this.powerAvailable = props.powerAvailable;
    this.correction = props.correction;
  }

  calculate() {
    this.capacityUsed = this.getCapacityUsed();
    this.powerUsed = this.getPowerUsed();
    const power = this.powerAvailable > 0 ? this.powerAvailable : this.powerUsed;
    for (let r of this.rows) {
      r.calculateEstimations(power);
    }
    this.updateStatistics();
  }

  applyCorrection() {
    this.rows = this.rows.map(x => {
      const o = new LogRow(x);
      o.capacity = Math.round((o.capacity ?? 0) * this.correction * 10) / 10;
      o.current = Math.round((o.current ?? 0) * this.correction * 10) / 10;
      o.calculate();
      return o;
    });
    this.calculate();
  }

  updateStatistics() {
    if (this.rows.length == 0) return;
    this.stats = new Stats();
    let initialized = false;
    for (let i = 0; i < this.rows.length; i++) {
      const r = this.rows[i];
      for (let k of statKeys) {
        const currentValue = (<any>r)[k] ?? 0;
        if (!initialized) {
          this.stats[k].avg = currentValue;
          this.stats[k].min = currentValue;
          this.stats[k].minIndex = i;
          this.stats[k].max = currentValue;
          this.stats[k].maxIndex = i;
        }else {
          this.stats[k].avg += currentValue;
          if (this.stats[k].max < currentValue) {
            this.stats[k].max = currentValue;
            this.stats[k].maxIndex = i;
          }
          if (this.stats[k].min > currentValue) {
            this.stats[k].min = currentValue;
            this.stats[k].minIndex = i;
          }
        }
      }
      initialized = true;
    }
    for (let k of statKeys) {
      this.stats[k].avg = Math.round(this.stats[k].avg / this.rows.length * 10)/10;
    }
  }

  joinSrtLog(srtLog:ILog) {
    let s = 0;
    for (let o of this.rows) {
      while (s < srtLog.rows.length && srtLog.rows[s].timecode! < o.timecode!)
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
    this.calculate();
  }

  private getPowerUsed() {
    if (this.rows.length < 1) return 0;
    const last = this.rows[this.rows.length - 1];
    const totalCapacity = (last.capacity ?? 0) - (this.rows[0].capacity ?? 0);
    const numberOfCells = Math.ceil((this.rows[0].rxBattery ?? 0) / 4.2);
    return numberOfCells * 3.7 * totalCapacity / 1000;
  }

  private getCapacityUsed() {
    if (this.rows.length < 2) return 0;
    return (this.rows[this.rows.length - 1].capacity ?? 0) - (this.rows[0].capacity ?? 0);
  }

  timestamp?: DateTime;
  duration?: Duration;
  rows: LogRow[];
  isSelected?: boolean;
  srtFileName?: string;
  stats?: IStats;
  capacityUsed: number;
  powerUsed: number;
  powerAvailable: number;
  correction: number;
}


export interface ILogRow {
  wattPerKm?: number;
  wattPer10Km?: number;
  estimatedRange?: number;
  estimatedFlightTime?: number;
  index: number;
  timecode?: number;
  timestamp?: DateTime;
  lat?: number;
  lon?: number;
  position?: LatLon;
  distanceToHome?: number;
  distanceTraveled?: number;
  Date?: DateTime
  Time?: Duration
  rss1?: number;
  rss2?: number;
  rqly?: number;
  rsnr?: number;
  rfmd?: number;
  trss?: number;
  tqly?: number;
  tsnr?: number;
  tpwr?: number;
  rxBattery?: number;
  current?: number;
  capacity?: number;
  power?: number;
  batteryPercent?: number;
  pitchDeg?: number;
  rollDeg?: number;
  yawDeg?: number;
  gps?: string;
  gpsSpeed?: number;
  heading?: number;
  altitude?: number;
  sats?: number;
  rudder?: number;
  elevator?: number;
  throttle?: number;
  aileron?: number;
  txBattery?: number;
  SA?: number;
  SB?: number;
  SC?: number;
  SD?: number;
  SE?: number;
  SF?: number;
  djiSignal?: number;
  djiChannel?: number;
  djiDelay?: number;
  djiGoggleBattery?: number;
  djiBitrate?: number;
}

export class LogRow implements ILogRow {
  constructor(props: ILogRow) {
    Object.assign(this, props);
    this.index = props.index;
  }

  calculate() {
    if (this.rxBattery && this.current)
      this.power = Math.round(this.rxBattery * this.current * 10)/10;
    else this.power = 0;

    if (this.gpsSpeed) {
      this.wattPerKm = Math.round(1 / this.gpsSpeed * this.power * 10) / 10;
      this.wattPer10Km = Math.round(1 / this.gpsSpeed * this.power * 100) / 10;
    }else {
      this.wattPerKm = 0;
      this.wattPer10Km = 0;
    }
  }

  calculateEstimations(powerUsed: number) {
    if (powerUsed) {
      if (this.wattPerKm)
        this.estimatedRange = Math.round(powerUsed / this.wattPerKm * 10) / 10;
      if (this.power)
        this.estimatedFlightTime = Math.round(powerUsed / this.power * 60 * 10) / 10;
      return;
    }
    this.estimatedFlightTime = 0;
    this.estimatedRange = 0;
  }

  wattPerKm?: number;
  wattPer10Km?: number;
  estimatedRange?: number;
  estimatedFlightTime?: number;
  index: number;
  timecode?: number;
  timestamp?: DateTime;
  lat?: number;
  lon?: number;
  position?: LatLon;
  distanceToHome?: number;
  distanceTraveled?: number;
  Date?: DateTime
  Time?: Duration
  rss1?: number;
  rss2?: number;
  rqly?: number;
  rsnr?: number;
  rfmd?: number;
  trss?: number;
  tqly?: number;
  tsnr?: number;
  tpwr?: number;
  rxBattery?: number;
  current?: number;
  capacity?: number;
  power?: number;
  batteryPercent?: number;
  pitchDeg?: number;
  rollDeg?: number;
  yawDeg?: number;
  gps?: string;
  gpsSpeed?: number;
  heading?: number;
  altitude?: number;
  sats?: number;
  rudder?: number;
  elevator?: number;
  throttle?: number;
  aileron?: number;
  txBattery?: number;
  SA?: number;
  SB?: number;
  SC?: number;
  SD?: number;
  SE?: number;
  SF?: number;
  djiSignal?: number;
  djiChannel?: number;
  djiDelay?: number;
  djiGoggleBattery?: number;
  djiBitrate?: number;
}
