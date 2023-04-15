import diagnosticsChannel from "diagnostics_channel";

import fs from "node:fs/promises";

const log = (...message: string[]) => {
  const now = new Date();
  const locale = now
    .toLocaleDateString("ru-ru", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",

      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",

      formatMatcher: "basic",
    })
    .replaceAll(".", "/");

  const time = locale + "." + now.getMilliseconds();
  fs.writeFile("./logs.txt", `${time}: ${message.join("")}\n`, {
    encoding: "utf-8",
    flag: "a",
  });
};

diagnosticsChannel.channel("undici:request:create").subscribe(({ request }: any) => {
  log(`
CREATE REQUEST
- REQUEST
- - method: ${request.method}
- - path: ${request.path}
- - completed: ${request.completed}`);
});

diagnosticsChannel.channel("undici:request:bodySent").subscribe(({ request }: any) => {
  log(`
BODY SENT
- REQUEST
- - method: ${request.method}
- - path: ${request.path}
- - completed: ${request.completed}`);
});

diagnosticsChannel.channel("undici:request:headers").subscribe(({ request, response }: any) => {
  log(`
HEADERS RECEIVED
- REQUEST
- - method: ${request.method}
- - path: ${request.path}
- - completed: ${request.completed}
- RESPONCE
- - statusCode: ${response.statusCode}`);
});

diagnosticsChannel.channel("undici:request:trailers").subscribe(({ request, trailers }: any) => {
  log(`
BODY RECEIVED
- REQUEST
- - method: ${request.method}
- - path: ${request.path}
- - completed: ${request.completed}
- TRAILERS
- - content: ${JSON.stringify(trailers)}`);
});

diagnosticsChannel.channel("undici:request:error").subscribe(({ request, error }: any) => {
  log(`
ERROR EVENT
- REQUEST
- - method: ${request.method}
- - path: ${request.path}
- - completed: ${request.completed}
- ERROR
${error}`);
});
