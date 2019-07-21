// tslint:disable:max-classes-per-file

import passport from "passport";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { ExtractJwt, Strategy as JWTStrategy } from "passport-jwt";
import { Strategy as LocalStrategy } from "passport-local";
import User, { ISafeUserData, UserException } from "../db/user";

class JWTStaticStrategy extends JWTStrategy {
  public name: string = "jwt-static";
}

class JWTAPIStrategy extends JWTStrategy {
  public name: string = "jwt-api";
}

const handleJWTStrategy = async (jwtPayload: ISafeUserData, next) => {
  const user: User = new User(jwtPayload);
  const snapshot: FirebaseFirestore.QueryDocumentSnapshot = await user.find();

  if (snapshot) {
    await user.sync(snapshot);
    next(null, user.getSafeData());
  } else {
    next(new UserException(jwtPayload));
  }
};

const handleSocialStrategy = async (accessToken, refreshToken, profile, next) => {
  const { id, displayName, emails } = profile;
  const user: User = new User({
    id: `${id}`,
    name: displayName,
    email: Array.isArray(emails) && emails[0] && emails[0].value ? emails[0].value : null,
    provider: (profile as any).provider
  });

  try {
    const userData: ISafeUserData = await user.login({
      accessToken: accessToken || null,
      refreshToken: refreshToken || null
    });

    next(null, userData);
  } catch (e) {
    next(e);
  }
};

passport.use(
  new JWTStaticStrategy(
    {
      jwtFromRequest: req => (req && req.cookies ? req.cookies.token : null),
      secretOrKey: process.env.JWT_SECRET_KEY
    },
    handleJWTStrategy
  )
);

passport.use(
  new JWTAPIStrategy(
    {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET_KEY
    },
    handleJWTStrategy
  )
);

passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
      session: false
    },
    async (email, password, next) => {
      const user: User = new User({
        email,
        password,
        provider: User.LOCAL_PROVIDER
      });

      try {
        next(null, await user.login());
      } catch (e) {
        next(e);
      }
    }
  )
);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/login/google/callback"
    },
    handleSocialStrategy
  )
);

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_APP_ID,
      clientSecret: process.env.FACEBOOK_APP_SECRET,
      callbackURL: "/login/facebook/callback",
      profileFields: ["id", "name", "displayName", "email"]
    },
    handleSocialStrategy
  )
);

export default passport;
