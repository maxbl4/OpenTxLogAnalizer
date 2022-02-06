import {Log} from "./open-tx-log-parser";
import {Injectable} from "@angular/core";

@Injectable()
export class GpxGenerator {
  exportGpx(log: Log) {
    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<gpx xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd" xmlns="http://www.topografix.com/GPX/1/1" version="1.1" creator="OTX UI (c) Vladimir Perevalov 2022">
<metadata>
<time>${log.timestamp?.toISODate()}</time>
</metadata>
<trk>
<name>${log.timestamp?.toLocaleString()}</name>
<trkseg>\n`;
    for (let r of log.rows) {

      xml += `<trkpt lat="${r.lat}" lon="${r.lon}"><ele>${r.altitude}</ele></trkpt>\n`;
    }
    return xml + "</trkseg></trk></gpx>";
  }
}
