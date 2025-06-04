import dotenv from "dotenv";
dotenv.config();

import passport from "passport";
import GoogleStrategy from "passport-google-oauth20";
import FacebookStrategy from "passport-facebook";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import User from "../models/User.js";

console.log("GOOGLE_CLIENT_ID from env:", process.env.GOOGLE_CLIENT_ID);
console.log("GOOGLE_CLIENT_SECRET from env:", process.env.GOOGLE_CLIENT_SECRET);

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/api/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      const email = profile.emails[0].value;
      const avatar = profile.photos?.[0]?.value;

      const [firstName, ...rest] = profile.displayName.split(" ");
      const lastName = rest.join(" ") || "-";

      let user = await User.findOne({ email });
      if (!user) {
        user = await User.create({
          email,
          firstName,
          lastName,
          avatar,
          provider: "google",
        });
      } else {
        user.avatar = avatar;
        await user.save();
      }

      done(null, user);
    }
  )
);

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FB_CLIENT_ID,
      clientSecret: process.env.FB_CLIENT_SECRET,
      callbackURL: `${process.env.BACKEND_URL}/api/auth/facebook/callback`,
      profileFields: ["id", "displayName", "emails"],
    },
    async (accessToken, refreshToken, profile, done) => {
      const email = profile.emails?.[0]?.value || `${profile.id}@facebook.com`;
      let user = await User.findOne({ email });

      const [firstName, ...rest] = profile.displayName.split(" ");
      const lastName = rest.join(" ") || "-";

      if (!user) {
        user = await User.create({
          email,
          firstName,
          lastName,
          provider: "facebook",
        });
      }
      done(null, user);
    }
  )
);

passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        const user = await User.findOne({ email });
        if (!user || user.provider !== "standard") {
          return done(null, false, {
            message: "Користувач не знайдений або не стандартний",
          });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
          return done(null, false, { message: "Неправильний пароль" });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser((id, done) =>
  User.findById(id).then((user) => done(null, user))
);
