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
    successRedirect: "http://localhost:5173/chats",
    failureRedirect: "http://localhost:5173/",
  })
);

router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);
router.get(
  "/facebook/callback",
  passport.authenticate("facebook", {
    successRedirect: "http://localhost:5173/chats",
    failureRedirect: "http://localhost:5173/",
  })
);

router.post("/register", register);
router.post("/login", passport.authenticate("local"), loginSuccess);

router.get("/me", getCurrentUser);

export default router;
