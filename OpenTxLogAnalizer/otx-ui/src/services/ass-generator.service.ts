import {Injectable} from "@angular/core";
import {ILog} from "./open-tx-log-parser";
import {Duration} from "luxon";
import {OsdItems} from "./srt-generator";

@Injectable()
export class AssGenerator {
  exportAss(log: ILog, osdItems: OsdItems): string {
    let srt = `[Script Info]
ScriptType: v4.00
PlayResY: 960
PlayResY: 720

[V4 Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, TertiaryColour, BackColour, Bold, Italic, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, AlphaLevel, Encoding
Style: OSD, Consolas,28,&H00FFFFFF,&H00FFFFFF,&H00FFFFFF,-2147483640,-1,0,1,1,2,1,30,30,30,0,0

[Events]
Format: Marked, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;
    let prevTimecode = Duration.fromMillis(0);
    for (let i = 0; i < log.rows.length; i++) {
      const r = log.rows[i];
      const timecode = Duration.fromMillis((r.timecode ?? 0) * 1000);
      let frame = `Dialogue: Marked=0,${formatTime(prevTimecode)},${formatTime(timecode)},OSD,NTP,0,0,0,,{\\pos(10,720)}`;
      if (osdItems.gps) frame += `${(<any>r)["GPS"]}\\N`;
      if (osdItems.dist) frame += `Home ${pad(r.distanceToHome, 5)}m Trip ${pad(r.distanceTraveled, 5)}m\\N`;
      if (osdItems.altitude) frame += `Alt ${pad(r.altitude, 4)}m `;
      if (osdItems.gpsSpeed) frame += `${pad(r.gpsSpeed, 5)}km/h\\N`; else if (osdItems.altitude) frame += "\\N";
      if (osdItems.rss1) frame += `${pad(r.rss1, 4)}dbm ${r.rfmd}:${pad(r.rqly,3)}\\N`;
      if (osdItems.dji && (r.djiDelay || r.djiBitrate)) frame += `DJI ${r.djiDelay}ms ${pad(r.djiBitrate, 4)}mBit\\N`;
      if (osdItems.battery) frame += `${r.rxBattery}v ${r.capacity}mAh\\N`;
      if (osdItems.power) frame += `${r.power}w ${r.current}a ${r.wattPerKm}wh/km\\N`;
      frame += "\n";
      srt += frame;

      prevTimecode = timecode;
    }
    return srt;
  }
}

function formatTime(d: Duration) {
  let t = d.toFormat('h:mm:ss.S');
  if (t.endsWith("00"))
    return t.substring(0, t.length - 1);
  return t;
}

function pad(s?: any, n?: number) {
  if (s === undefined) return "";
  if (n === undefined) return s;
  s = s.toString();
  if (n > s.length)
    return " ".repeat(n - s.length) + s;
  return s;
}
