import { Router } from "express";
import * as jwt from "jsonwebtoken";
import passport from "../config/passport";
import { UserException } from "../db/user";

const router: Router = new (Router as any)();
const LOGIN_ERROR_MESSAGE: string = "Missing credentials";

const appendCookie = (res, user) =>
  res.cookie("token", jwt.sign(user, process.env.JWT_SECRET_KEY), {
    expires: new Date(Date.now() + 2592000)
  });

const socialCallbackMiddleware = (social: string) => (req, res) => {
  passport.authenticate(social, { session: false }, (err, user) => {
    if (err)
      res.redirect(
        `/login?error=${encodeURIComponent(
          new UserException(user, LOGIN_ERROR_MESSAGE).toString()
        )}#`
      );

    appendCookie(res, user);
    res.redirect("/#");
  })(req, res);
};

router.post("/login", (req, res) => {
  passport.authenticate("local", { session: false }, (err, user, info) => {
    if (err || !user) {
      return res.status(400).json({
        error: info ? info.message : LOGIN_ERROR_MESSAGE
      });
    }

    appendCookie(res, user);
    return res.json({ success: true });
  })(req, res);
});

router.get(
  "/login/google",
  passport.authenticate("google", {
    scope: [
      "https://www.googleapis.com/auth/plus.login",
      "https://www.googleapis.com/auth/userinfo.email"
    ]
  })
);

router.get("/login/google/callback", socialCallbackMiddleware("google"));

router.get(
  "/login/facebook",
  passport.authenticate("facebook", {
    scope: ["public_profile", "email"]
  })
);

router.get("/login/facebook/callback", socialCallbackMiddleware("facebook"));

export default router;
