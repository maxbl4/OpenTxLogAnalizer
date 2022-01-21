import {Injectable} from "@angular/core";
import {OsdItems} from "./srt-generator";
import {ChartsToDraw} from "../app/charts-view/charts-view.component";

@Injectable()
export class PersistanceService {
  get srtExport_osdItems(): OsdItems|undefined {
    return this.load("srtExport_osdItems");
  }

  set srtExport_osdItems(v: OsdItems|undefined) {
    this.save("srtExport_osdItems", v);
  }

  get chartsToDraw(): ChartsToDraw|undefined {
    return this.load("chartsToDraw");
  }

  set chartsToDraw(v: ChartsToDraw|undefined) {
    this.save("chartsToDraw", v);
  }

  load<T>(key: string) {
    const t = localStorage.getItem(key);
    if (t)
      return <T>JSON.parse(t);
    return undefined;
  }

  save<T>(key: string, value: T){
    localStorage.setItem(key, JSON.stringify(value));
  }
}
