import {Injectable} from "@angular/core";
import {OsdItems} from "./srt-generator";
import {MapViewPreferences, StatDesc} from "../app/map-view/map-view.component";
import {LogProject} from "./data-manager";

@Injectable()
export class PersistenceService {
  get srtExport_osdItems(): OsdItems|undefined {
    return this.load("srtExport_osdItems");
  }

  set srtExport_osdItems(v: OsdItems|undefined) {
    this.save("srtExport_osdItems", v);
  }

  get mapViewPreferences(): MapViewPreferences|undefined {
    return this.load("mapViewPreferences");
  }

  set mapViewPreferences(v: MapViewPreferences|undefined) {
    this.save("mapViewPreferences", v);
  }

  get chartsToDraw(): StatDesc[]|undefined {
    return this.load("chartsToDraw");
  }

  set chartsToDraw(v: StatDesc[]|undefined) {
    this.save("chartsToDraw", v);
  }

  get selectedTabPane(): number|undefined {
    return this.load("selectedTabPane");
  }

  set selectedTabPane(v: number|undefined) {
    this.save("selectedTabPane", v);
  }

  get howToRecordLogsDismissed(): boolean|undefined {
    return this.load("howToRecordLogsDismissed");
  }

  set howToRecordLogsDismissed(v: boolean|undefined) {
    this.save("howToRecordLogsDismissed", v);
  }

  get logProject(): LogProject|undefined {
    return this.load("logProject");
  }

  set logProject(v: LogProject|undefined) {
    this.save("logProject", v);
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
