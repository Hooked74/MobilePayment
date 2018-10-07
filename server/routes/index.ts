import { Express } from "express";
import applyAPIMiddleware from "./api";
import login from "./login";
import ssr from "./ssr";

export default (server: Express) => {
  server.use(login);
  applyAPIMiddleware(server);
  server.use(ssr);
};
