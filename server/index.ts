import d from "debug";
import express from "express";
import { IncomingMessage, ServerResponse } from "http";
import next from "next";
import Server from "next-server/dist/server/next-server";
import { UrlWithParsedQuery } from "url";
import applyExpressConfiguration from "./config/express";
import firebase, { firestore } from "./config/firebase";
import applyRoutes from "./routes";

type THandle = (
  req: IncomingMessage,
  res: ServerResponse,
  parsedUrl?: UrlWithParsedQuery
) => Promise<void>;

(async function main() {
  const debug: d.IDebugger = d("app:started");
  const dev: boolean = process.env.NODE_ENV !== "production";
  const app: Server = next({ dev });
  const server: express.Express = express();
  const handle: THandle = app.getRequestHandler();

  server.set("handleStatic", handle);
  server.set("firebase", firebase);
  server.set("firestore", firestore);
  server.set("app", app);

  await app.prepare();

  applyExpressConfiguration(server);
  applyRoutes(server);

  /**
   * Start Express server.
   */
  server.listen(server.get("port"), () => {
    debug(`App is running at :${server.get("port")} in ${server.get("env")} mode`);
  });
})();
