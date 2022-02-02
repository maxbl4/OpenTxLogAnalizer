import {Injectable} from "@angular/core";
import {ILog, Log} from "./open-tx-log-parser";
import {Duration} from "luxon";

const osdHeaderRegex = /^#!.+?\n/gm;

@Injectable()
export class AssGenerator {
  exportAss(log: ILog, osdLayout: string): string {
    const settings = this.getLayoutSettings(osdLayout);
    const color = reverseColor(settings.color);
    let srt = `[Script Info]
ScriptType: v4.00
PlayResX: ${settings.width}
PlayResY: ${settings.height}

[V4 Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, TertiaryColour, BackColour, Bold, Italic, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, AlphaLevel, Encoding
Style: OSD, ${settings.font},${settings.fontSize},&H00${color},&H00${color},&H00${color},-2147483640,-1,0,1,1,2,1,30,30,30,0,0

[Events]
Format: Marked, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;
    let prevTimecode = Duration.fromMillis(0);
    for (let i = 0; i < log.rows.length; i++) {
      const r = log.rows[i];
      const timecode = Duration.fromMillis((r.timecode ?? 0) * 1000);
      let frame = `Dialogue: Marked=0,${formatTime(prevTimecode)},${formatTime(timecode)},OSD,NTP,0,0,0,,{\\pos(${settings.x},${settings.y})}`;
      frame += this.getOsd(osdLayout, r).replace(/\n/g, "\\N");
      srt += frame + "\n";
      prevTimecode = timecode;
    }
    return srt;
  }

  getLayoutSettings(osdLayout: string): ILayoutSettings {
    const settings = new LayoutSettings();
    const header = osdLayout.match(osdHeaderRegex);
    if (!header) return settings;
    const keys = Object.keys(settings);
    const stringKeys:(keyof ILayoutSettings)[] = ["color", "font"];
    const fields = header[0].substring(2, header[0].length - 1).split(",");
    for (let f of fields) {
      const fv = f.split(":");
      const fieldName = <keyof ILayoutSettings>fv[0].trim();
      if (keys.findIndex(x => x == fieldName) >= 0) {
        if (stringKeys.findIndex(x => x == fieldName) < 0) {
          const v = parseInt(fv[1]);
          if (!isNaN(v))
            (<any>settings[fieldName]) = v;
        }else
          (<any>settings[fieldName]) = fv[1];
      }
    }
    return settings;
  }

  getOsd(osdLayout: string, row: any) {
    let osd = "";
    const header = osdLayout.match(osdHeaderRegex);
    if (header)
      osdLayout = osdLayout.substring(header[0].length);
    const matches = osdLayout.matchAll(/\{(\w+),?(\d+)?\}/gm);
    let prevIndex = 0;
    for (let m of matches) {
      const field = m[1];
      const padding = parseInt(m[2] ?? "0");
      const value = pad(row[field], padding);
      osd += osdLayout.substring(prevIndex, m.index) + value;
      prevIndex = m.index! + m[0].length;
    }
    if (prevIndex < osdLayout.length) osd += osdLayout.substring(prevIndex, osdLayout.length);
    return osd;
  }

  getPreview(osdLayout: string, log: Log) {
    this.getLayoutSettings(osdLayout);
    const sampleRowIndex = Math.floor(log.rows.length / 2);
    const row = <any>log.rows[sampleRowIndex];
    return this.getOsd(osdLayout, row);
  }
}

function formatTime(d: Duration) {
  let t = d.toFormat('h:mm:ss.S');
  if (t.match(/\.\d{3}$/gm))
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

function reverseColor(rgb:string) {
  if (rgb.length != 6) return rgb;
  return rgb.substring(4,6) + rgb.substring(2,4) + rgb.substring(0,2);
}

export interface ILayoutSettings {
  x: number;
  y: number;
  width: number;
  height: number;
  font: string;
  fontSize: number;
  color: string;
}

export class LayoutSettings implements ILayoutSettings {
  x: number = 10;
  y: number = 600;
  width: number = 960;
  height: number = 720;
  font: string = "Consolas";
  fontSize: number = 28;
  color: string = "FFFFFF";
}
