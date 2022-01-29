import {ILogRow, Log} from "./open-tx-log-parser";
import {Injectable} from "@angular/core";
import {Duration} from "luxon";
import * as _ from "underscore";

@Injectable()
export class SrtParser {
  parse(text: string): Log {
    const lines = text.split("\n");
    const rows = [];
    let i = 0;
    while (i < lines.length) {
      if (!lines[i * 4])
        break;
      let rowIndex = parseInt(lines[i * 4]);
      let timecode = Duration.fromISOTime(lines[i * 4 + 1].split(" ")[0]);
      let fields = lines[i * 4 + 2].split(" ");
      const resultRow: ILogRow = {index: rowIndex, timecode: timecode.as("seconds"), Time: timecode.toISOTime()};
      rows.push(resultRow);
      for (let f of fields) {
        const fv = f.split(":");
        switch (fv[0]) {
          case "signal":
            resultRow.djiSignal = parseInt(fv[1]);
            break;
          case "ch":
            resultRow.djiChannel = parseInt(fv[1]);
            break;
          case "delay":
            resultRow.djiDelay = parseInt(fv[1]);
            break;
          case "bitrate":
            resultRow.djiBitrate = parseFloat(fv[1]);
            break;
          case "glsBat":
            resultRow.djiGoggleBattery = parseFloat(fv[1]);
            break;
        }
      }

      i++;
    }
    return new Log({rows:rows, duration: _.last(rows)?.Time, capacityUsed: 0, powerUsed: 0, powerAvailable: 0, correction: 1});
  }
}
