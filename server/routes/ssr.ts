import { Router } from "express";
import passport from "../config/passport";

const router: Router = new (Router as any)();

router.get("/_next/*", (req, res) => {
  res.app.get("handleStatic")(req, res);
});

router.get("/login", (req, res) => {
  passport.authenticate("jwt-static", { session: false }, (err, user) => {
    if (!err && user) {
      res.redirect("/");
    } else {
      res.app.get("handleStatic")(req, res);
    }
  })(req, res);
});

router.get(
  "/o/:id",
  passport.authenticate("jwt-static", {
    session: false,
    failureRedirect: "/login"
  }),
  (req, res) => {
    const actualPage = "/";
    const queryParams = { id: req.params.id };
    res.app.get("app").render(req, res, actualPage, queryParams);
  }
);

router.get(
  "*",
  passport.authenticate("jwt-static", {
    session: false,
    failureRedirect: "/login"
  }),
  (req, res) => res.app.get("handleStatic")(req, res)
);

export default router;
