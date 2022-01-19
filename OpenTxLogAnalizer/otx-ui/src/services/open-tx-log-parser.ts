import {DateTime} from "luxon";
import {LatLon, Distance} from "gps";

export class OpenTxLogParser {
  load(){

  }
}

export interface LogRow {
  timecode: number;
  timestamp: DateTime;
  lat: number;
  long: number;
  distanceToHome: number;
  distanceTraveled: number;
  date: DateTime
  time: DateTime
  //[Name("1RSS(dB)")]
  rss1: number;
  //[Name("RQly(%)")]
  rqly: number;
  //[Name("RSNR(dB)")]
  rsnr: number;
  //[Name("RFMD")]
  rfmd: number;
  //[Name("TRSS(dB)")]
  trss: number;
  //[Name("TQly(%)")]
  tqly: number;
  //[Name("TSNR(dB)")]
  tsnr: number;
  //[Name("RxBt(V)")]
  rxBattery: number;
  //[Name("Curr(A)")]
  current: number;
  //[Name("Capa(mAh)")]
  capacity: number;
  //[Name("Bat_(%)")]
  batteryPercent: number;
  //[Name("Ptch(rad)")]
  pitch: number;
  //[Name("Roll(rad)")]
  roll: number;
  //[Name("Yaw(rad)")]
  yaw: number;
  //[Name("GPS")]
  gps: string;
  //[Name("GSpd(kmh)")]
  gpsSpeed: number;
  //[Name("Hdg(@)")]
  heading: number;
  //[Name("Alt(m)")]
  altitude: number;
  //[Name("Sats")]
  sats: number;
  //[Name("Rud")]
  rudder: number;
  //[Name("Ele")]
  elevator: number;
  //[Name("Thr")]
  throttle: number;
  //[Name("Ail")]
  aileron: number;
  //[Name("TxBat(V)")]
  txBattery: number;
  //[Name("SA")]
  sa: number;
  //[Name("SB")]
  sb: number;
  //[Name("SC")]
  sc: number;
  //[Name("SD")]
  sd: number;
  se: number;
  sf: number;
  sg: number;
  sh: number;
  djiSignal: number;
  djiChannel: number;
  djiDelay: number;
  djiGoggleBattery: number;
  djiBitrate: number;
}
