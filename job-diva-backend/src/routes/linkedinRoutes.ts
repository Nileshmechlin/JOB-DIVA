import { Router, Request, Response } from "express";
import { LinkedInController } from "../controller/linkedinController";
import { isAuthenticated } from "../middleware/auth";
import { RequestHandler } from "express";

const router = Router();

// Public routes
router.get("/auth", LinkedInController.authRedirect as RequestHandler);
router.get("/callback", LinkedInController.handleCallback as RequestHandler);

// Check LinkedIn connection status
router.get("/status", 
  isAuthenticated as RequestHandler,
  (async (req: Request, res: Response) => {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    console.log("✅ Current Logged-In User:", req.user.email);
    res.json({
      isConnected: !!req.user.linkedInAccessToken,
      linkedInId: req.user.linkedInId,
      name: req.user.name,
      email: req.user.email
    });
  }) as RequestHandler
);

// Protected routes
router.post("/post-job", 
  isAuthenticated as RequestHandler,
  LinkedInController.postJob as RequestHandler
);

export default router;
