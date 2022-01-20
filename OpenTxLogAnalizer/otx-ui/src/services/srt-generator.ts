import {ILog} from "./open-tx-log-parser";
import {Injectable} from "@angular/core";
import {Duration} from "luxon";

@Injectable()
export class SrtGenerator {
  exportSrt(log:ILog, osdItems: OsdItems): string {
    let srt = "";
    let prevTimecode = Duration.fromMillis(0);
    for (let i = 0; i < log.rows.length; i++) {
      const r = log.rows[i];
      const timecode = Duration.fromMillis((r.timecode ?? 0) * 1000);
      srt += `${i+1}\n`;
      srt += `${prevTimecode.toFormat('hh:mm:ss,SSS')} --> ${timecode.toFormat('hh:mm:ss,SSS')}\n{\\a1}`;
      if (osdItems.gps) srt += `${(<any>r)["GPS"]}\n`;
      if (osdItems.dist) srt += `Home ${r.distanceToHome}m Trip ${r.distanceTraveled}m\n`;
      if (osdItems.altitude) srt += `Alt ${r.altitude}m `;
      if (osdItems.gpsSpeed) srt += `${r.gpsSpeed}km/h\n`; else if (osdItems.altitude) srt += "\n";
      if (osdItems.rss1) srt += `${r.rss1}dbm ${r.rfmd}:${r.rqly}\n`;
      if (osdItems.dji && (r.djiDelay || r.djiBitrate)) srt += `DJI ${r.djiDelay}ms ${r.djiBitrate}mBit\n`;
      if (osdItems.battery) srt += `${r.rxBattery}v ${r.capacity}mAh\n`;
      if (osdItems.power) srt += `${r.power}w ${r.current}a ${r.wattPerKm}wh/km\n`;
      srt += "\n";

      prevTimecode = timecode;
    }
    return srt;
  }
}

export interface OsdItems {
  dist?:boolean;
  gps?: boolean;
  altitude?:boolean;
  gpsSpeed?:boolean;
  rss1?:boolean;
  dji?:boolean;
  battery?:boolean;
  power?:boolean;
}
