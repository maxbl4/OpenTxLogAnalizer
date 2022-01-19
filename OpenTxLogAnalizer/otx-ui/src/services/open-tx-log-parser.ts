import {DateTime, Duration} from "luxon";
import {LatLon, Distance} from "gps";
import {Injectable} from "@angular/core";

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
      typedRow.rss1 = parseFloat(row["1RSS(dB)"]);
      typedRow.rss2 = parseFloat(row["2RSS(dB)"]);
      typedRow.rqly = parseFloat(row["RQly(%)"]);
      typedRow.rsnr = parseFloat(row["RSNR(dB)"]);
      typedRow.rfmd = parseFloat(row["RFMD"]);
      typedRow.trss = parseFloat(row["TRSS(dB)"]);
      typedRow.tqly = parseFloat(row["TQly(%)"]);
      typedRow.tsnr = parseFloat(row["TSNR(dB)"]);
      typedRow.txBattery = parseFloat(row["TxBat(V)"]);
      typedRow.rxBattery = parseFloat(row["RxBt(V)"]);
      typedRow.current = parseFloat(row["Curr(A)"]);
      typedRow.power = Math.round(typedRow.rxBattery * typedRow.current * 10)/10;
      typedRow.capacity = parseFloat(row["Capa(mAh)"]);
      typedRow.batteryPercent = parseFloat(row["Bat_(%)"]);
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

    console.log(prevRow);
    if (currentLog && prevRow) {
      currentLog.duration = prevRow.timestamp!.diff(startTimestamp!);
    }

    return logs;
  }

  readHeader(header: string): string[] {
    return header.split(",").map(x => x.trim());
  }
}

export interface ILog {
  timestamp?: DateTime;
  duration?: Duration;
  rows: ILogRow[];
  isSelected?: boolean;
}

export interface ILogRow {
  wattPerKm?: number;
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
  SG?: number;
  SH?: number;
  djiSignal?: number;
  djiChannel?: number;
  djiDelay?: number;
  djiGoggleBattery?: number;
  djiBitrate?: number;
}
