import diagnosticsChannel from "diagnostics_channel";

diagnosticsChannel.channel("undici:request:create").subscribe(({ request }: any) => {
  console.log("CREATE REQUEST");
  console.log("- REQUEST");
  console.log("- - method: ", request.method);
  console.log("- - path: ", request.path);
  console.log("- - completed: ", request.completed);
});

diagnosticsChannel.channel("undici:request:bodySent").subscribe(({ request }: any) => {
  console.log("BODY SENT");
  console.log("- REQUEST");
  console.log("- - method: ", request.method);
  console.log("- - path: ", request.path);
  console.log("- - completed: ", request.completed);
});

diagnosticsChannel.channel("undici:request:headers").subscribe(({ request, response }: any) => {
  console.log("HEADERS RECEIVED");
  console.log("- REQUEST");
  console.log("- - method: ", request.method);
  console.log("- - path: ", request.path);
  console.log("- - completed: ", request.completed);

  console.log("- RESPONCE");
  console.log("- - statusCode: ", response.statusCode);
  // request is the same object undici:request:create
  // console.log('statusCode', response.statusCode)
  // console.log(response.statusText)
  // // response.headers are buffers.
  // console.log(response.headers.map((x: any) => x.toString()))
});

diagnosticsChannel.channel("undici:request:trailers").subscribe(({ request, trailers }: any) => {
  console.log("BODY RECEIVED");
  console.log("- REQUEST");
  console.log("- - method: ", request.method);
  console.log("- - path: ", request.path);
  console.log("- - completed: ", request.completed);

  console.log("- TRAILERS");
  console.log("- - content: ", JSON.stringify(trailers));
});

diagnosticsChannel.channel("undici:request:error").subscribe(({ request, error }: any) => {
  console.log("ERROR EVENT");
  console.log("- REQUEST");
  console.log("- - method: ", request.method);
  console.log("- - path: ", request.path);
  console.log("- - completed: ", request.completed);

  console.log("- ERROR");
  console.log(error);
});
