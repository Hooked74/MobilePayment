import bodyParser from "body-parser";
import cookieParser from "cookie-parser";
import { Express } from "express";
import expressStatusMonitor from "express-status-monitor";
import expressWinston from "express-winston";
import helmet from "helmet";
import methodOverride from "method-override";
import morgan from "morgan";
import passport from "./passport";
import winstonInstance from "./winston";

export default async (server: Express) => {
  /**
   * Express configuration.
   */
  server.set("trust proxy", 1);
  server.set("port", process.env.PORT || 3000);
  server.set("env", process.env.NODE_ENV);
  server
    .use(morgan("dev")) // :method :url :status :response-time ms - :res[content-length]
    .use(bodyParser.json()) // Parse application/json
    .use(bodyParser.urlencoded({ extended: true })) // Parse application/x-www-form-urlencoded
    .use(helmet()) // Secure your app by setting various HTTP headers
    .use(cookieParser()) // Parse Cookie header and populate req.cookies with an object keyed by the cookie names
    .use(methodOverride()) // Lets you use HTTP verbs such as PUT or DELETE in places where the client doesn't support it
    .use(expressStatusMonitor())
    .use(passport.initialize());

  server
    .disable("x-powered-by") // Disable 'X-Powered-By' header in response
    .disable("etag"); // Remove No Cache Control

  // enable detailed API logging
  expressWinston.requestWhitelist.push("body");
  expressWinston.responseWhitelist.push("body");
  server.use(
    expressWinston.logger({
      winstonInstance,
      meta: false, // optional: log meta data about request (defaults to true)
      msg: "HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms",
      colorStatus: true // Color the status code (default green, 3XX cyan, 4XX yellow, 5XX red).
    } as any)
  );
};
