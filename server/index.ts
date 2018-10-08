import d from "debug";
import * as express from "express";
import { IncomingMessage, ServerResponse } from "http";
import * as next from "next";
import { UrlLike } from "next/router";
import applyExpressConfiguration from "./config/express";
import firebase, { firestore } from "./config/firebase";
import applyRoutes from "./routes";

type THandle = (req: IncomingMessage, res: ServerResponse, parsedUrl?: UrlLike) => Promise<void>;

(async function main() {
  const debug: d.IDebugger = d("app:started");
  const dev: boolean = process.env.NODE_ENV !== "production";
  const app: next.Server = next({ dev });
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
