import { ApolloServer } from "apollo-server-express";
import { Express } from "express";
import schema from "../api";
import passport from "../config/passport";
import User from "../db/user";

const development: boolean = process.env.NODE_ENV !== "production";

export default (server: Express) => {
  server.get(
    "/graphql",
    passport.authenticate("jwt-static", {
      session: false,
      failureRedirect: "/login"
    })
  );

  server.post("/graphql", passport.authenticate("jwt-api", { session: false }));

  const apollo: ApolloServer = new ApolloServer({
    schema,
    tracing: true,
    cacheControl: true,
    context: ({ req }) => ({
      user: new User(req.user)
    }),
    playground: development
      ? {
          settings: {
            "editor.theme": "light",
            "request.credentials": "include"
          }
        }
      : false,
    debug: development,

    // By setting this to "false", we avoid using Apollo Server 2's
    // integrated metric reporting and fall-back to using the Apollo
    // Engine Proxy (running separately) for metric collection.
    engine: false
  });

  apollo.applyMiddleware({ app: server });
};
