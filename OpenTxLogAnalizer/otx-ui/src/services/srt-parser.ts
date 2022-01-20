import {ILog} from "./open-tx-log-parser";
import {Injectable} from "@angular/core";

@Injectable()
export class SrtParser {
  parse(text: string): ILog {
    return {rows:[]};
  }
}
