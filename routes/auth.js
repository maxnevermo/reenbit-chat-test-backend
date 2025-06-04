import express from "express";
import passport from "passport";

import {
  register,
  loginSuccess,
  getCurrentUser,
} from "../controllers/authController.js";

const router = express.Router();

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);
router.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: process.env.CLIENT_URL + "/chats",
    failureRedirect: process.env.CLIENT_URL,
  })
);

router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);
router.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    successRedirect: process.env.CLIENT_URL + "/chats",
    failureRedirect: process.env.CLIENT_URL,
  })
);

router.post("/register", register);
router.post("/login", passport.authenticate("local"), loginSuccess);

router.get("/me", getCurrentUser);

export default router;
