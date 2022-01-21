import {DateTime, Duration} from "luxon";
import {LatLon, Distance} from "gps";
import {Injectable} from "@angular/core";
import * as _ from "underscore";
import {Stats} from "./data-manager";

@Injectable()
export class OpenTxLogParser {
  parse(text: string): ILog[] {
    const lines = text.split("\n");
    if (lines.length == 0) return [];
    const fieldNames = this.readHeader(lines[0]);

    const logs:ILog[] = [];
    let currentLog: ILog|null = null;
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
      const typedRow = <ILogRow>row;
      typedRow.Date = DateTime.fromISO(row["Date"]);
      typedRow.Time = Duration.fromISOTime(row["Time"]);
      typedRow.timestamp = typedRow.Date.plus(typedRow.Time);
      typedRow.rss1 = parseInt(row["1RSS(dB)"]);
      typedRow.rss2 = parseInt(row["2RSS(dB)"]);
      typedRow.rqly = parseInt(row["RQly(%)"]);
      typedRow.rsnr = parseInt(row["RSNR(dB)"]);
      typedRow.rfmd = parseInt(row["RFMD"]);
      typedRow.trss = parseInt(row["TRSS(dB)"]);
      typedRow.tqly = parseInt(row["TQly(%)"]);
      typedRow.tsnr = parseInt(row["TSNR(dB)"]);
      typedRow.tpwr = parseInt(row["TPWR(mW)"]);
      typedRow.txBattery = parseFloat(row["TxBat(V)"]);
      typedRow.rxBattery = parseFloat(row["RxBt(V)"]);
      typedRow.current = parseFloat(row["Curr(A)"]);
      typedRow.power = Math.round(typedRow.rxBattery * typedRow.current * 10)/10;
      typedRow.capacity = parseFloat(row["Capa(mAh)"]);
      typedRow.batteryPercent = Math.round(parseFloat(row["Bat_(%)"]) * 10)/10;
      typedRow.pitchDeg = parseFloat(row["Ptch(rad)"]) * 180 / Math.PI;
      typedRow.rollDeg = parseFloat(row["Roll(rad)"]) * 180 / Math.PI;
      typedRow.yawDeg = parseFloat(row["Yaw(rad)"]) * 180 / Math.PI;
      typedRow.aileron = (parseFloat(row["Ail"]) + 1024) * 100 / 2048;
      typedRow.throttle = (parseFloat(row["Thr"]) + 1024) * 100 / 2048;
      typedRow.rudder = (parseFloat(row["Rud"]) + 1024) * 100 / 2048;
      typedRow.elevator = (parseFloat(row["Ele"]) + 1024) * 100 / 2048;
      typedRow.sats = parseInt(row["Sats"]);
      typedRow.altitude = Math.round(parseFloat(row["Alt(m)"])*10)/10;
      typedRow.gpsSpeed = Math.round(parseFloat(row["GSpd(kmh)"])*10)/10;
      typedRow.wattPerKm = Math.round(1/typedRow.gpsSpeed * typedRow.power * 10)/10;
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

      if (prevRow === null || (typedRow.timestamp.diff(prevRow.timestamp!).as('seconds') > 10)){
        if (currentLog && prevRow) {
          currentLog.duration = prevRow.timestamp!.diff(startTimestamp!);
          this.updateTotals(currentLog);
        }
        currentLog = {timestamp: typedRow.timestamp, rows:[]};
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

      currentLog!.rows.push(row);
      prevRow = typedRow;
    }

    if (currentLog && prevRow) {
      currentLog.duration = prevRow.timestamp!.diff(startTimestamp!);
      this.updateTotals(currentLog);
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

  private updateTotals(currentLog: ILog) {
    if (currentLog.rows.length < 2) return;
    const totalCapacity = (_.last(currentLog.rows)?.capacity ?? 0) / 1000;
    const numberOfCells = Math.round((currentLog.rows[0].rxBattery ?? 0) / 4.2);
    const totalWh = numberOfCells * 3.7 * totalCapacity;
    for (let r of currentLog.rows) {
      r.totalCapacity = Math.round(totalCapacity * 1000);
      r.totalWh = Math.round(totalWh * 10)/10;
      if (totalWh === 0 || !r.wattPerKm)
        r.estimatedRange = 0;
      else
        r.estimatedRange = Math.round(totalWh / r.wattPerKm * 10) / 10;
      if (totalWh === 0 || !r.power) {
        r.estimatedFlightTime = 0;
      }
      else {
        r.estimatedFlightTime = Math.round(totalWh / r.power * 60 * 10) / 10;
      }
    }
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
  stats?: Stats;
}

export interface ILogRow {
  wattPerKm?: number;
  totalCapacity?: number;
  totalWh?: number;
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
