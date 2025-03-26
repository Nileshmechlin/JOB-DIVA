import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppDataSource } from '../data-source';
import { User } from '../entity/User';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export const isAuthenticated = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) return res.status(401).json({ error: "No token provided" });

    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Invalid token format" });

    console.log("🔹 Received Token:", token);

    // 🛑 DEBUG: JWT Decode
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET_KEY!) as any;

    console.log("🔹 Decoded Token:", decoded);

    if (!decoded || !decoded.userId) { 
      return res.status(401).json({ error: "Invalid token structure" });
    }

    console.log("🔹 Decoded User ID:", decoded.userId);

    const userRepo = AppDataSource.getRepository(User);
    const user = await userRepo.findOne({ where: { id: decoded.userId } });

    if (!user) return res.status(401).json({ error: "User not found" });

    console.log("✅ Fetched User from DB:", user.email);

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      linkedInId: user.linkedInId,
      linkedInAccessToken: user.linkedInAccessToken,
      role: user.role
    };

    next();
  } catch (error) {
    console.error("❌ Auth error:", error);
    res.status(401).json({ error: "Invalid token" });
  }
};
