/// <reference lib="webworker" />

import {ILog, ILogRow, Log, LogRow, OpenTxLogParser} from "../services/open-tx-log-parser";
import {SrtParser} from "../services/srt-parser";
import {LogProject} from "../services/data-manager";

const otxParser = new OpenTxLogParser();
const srtParser = new SrtParser();

addEventListener('message', ({ data }) => {
  switch (data.command) {
    case "parse-otx":
      parseOtxLog(data.content);
      break;
    case "load-srt-log":
      loadSrtLog(data.content, data.data.otxLogs);
      break;
    case "update-selected-log":
      updateSelectedLog(data.data, data.content);
      break;
  }
});

function parseOtxLog(content: string) {
  const otxLogs = otxParser.parse(content, (i, max) => {
    postMessage({command: "operation-progress", operation: "Parsing", progress: Math.round(i / max * 100)});
  });
  postMessage({command: "set-otx-logs", otxLogs: otxLogs});
  postMessage({command: "operation-done"});
}

function loadSrtLog(content: string, otxLogs: ILog[]) {
  const logs = otxLogs.map(x => new Log(x))
  const srtLog = srtParser.parse(content, (i, max) => {
    postMessage({command: "operation-progress", operation: "DJI SRT Parsing", progress: Math.round(i / max * 100)});
  });
  postMessage({command: "operation-progress", operation: "DJI SRT Merging", progress: 0});
  for (let i = 0; i < logs.length; i++) {
    logs[i].joinSrtLog(srtLog);
    postMessage({command: "operation-progress", operation: "DJI SRT Merging", progress: Math.round(i / logs.length * 100)});
  }
  postMessage({command: "set-otx-logs", otxLogs: logs});
  postMessage({command: "operation-done"});
}

interface IData {
  selectedOtxIndex: number;
  currentLogProject?: LogProject;
  otxLogs: ILog[];
}

function updateSelectedLog(data: IData, index?: number) {
  if (!data.currentLogProject) return;
  if (index === undefined) index = data.selectedOtxIndex;
  data.selectedOtxIndex = index;
  if (index < 0) {
    postMessage({command: "set-selected-log", selectedLog: undefined});
    return;
  }
  const l = data.otxLogs[data.selectedOtxIndex];
  if (data.currentLogProject.selectedOtxIndex != data.selectedOtxIndex) {
    data.currentLogProject.startRow = 0;
    data.currentLogProject.endRow = l.rows.length;
    data.currentLogProject.selectedOtxIndex = data.selectedOtxIndex;
  }else {
    if (data.currentLogProject.startRow < 0) data.currentLogProject.startRow = 0;
    if (data.currentLogProject.endRow > l.rows.length) data.currentLogProject.endRow = l.rows.length;
    if (data.currentLogProject.startRow > data.currentLogProject.endRow)
      data.currentLogProject.startRow = data.currentLogProject.endRow;
  }

  const selectedLog = new Log(l);
  selectedLog.correction = data.currentLogProject.correction;
  selectedLog.powerAvailable = data.currentLogProject.powerAvailable;
  selectedLog.rows = l.rows.slice(data.currentLogProject.startRow, data.currentLogProject.endRow).map(x => new LogRow(x));
  selectedLog.applyCorrection();
  postMessage({command: "set-selected-log", selectedLog: selectedLog});
}
