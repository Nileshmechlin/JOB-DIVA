import express from "express";
import { RequestHandler } from "express";
import { signup, login, logout } from "../controller/AuthController";

const router = express.Router();

// ✅ Normal Signup & Login Routes
router.post("/signup", signup as RequestHandler);
router.post("/login", login as RequestHandler);
router.post("/logout", logout as RequestHandler);

export default router;
