/// <reference lib="webworker" />

import {OpenTxLogParser} from "../services/open-tx-log-parser";

const otxParser = new OpenTxLogParser();

addEventListener('message', ({ data }) => {
  switch (data.command) {
    case "parse-otx":
      const otxLogs = otxParser.parse(data.content, (i, max) => {
        postMessage({command: "operation-progress", operation: "Parsing", progress: Math.round(i / max * 100)});
      });
      postMessage({command: "set-otx-logs", otxLogs: otxLogs});
      postMessage({command: "operation-done"});
      break;
  }
});
