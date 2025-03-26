import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../entity/User";
import { AppDataSource } from "../data-source";
import { REFRESH_TOKEN_SECRET, generateAccessToken, generateRefreshToken } from "../utils/jwt";
import dotenv from "dotenv";

dotenv.config();

interface JWTPayload {
  userId: string;
}

export const signup = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, name, role = "employer" } = req.body;
    
    if (!email || !password || !name) {
      res.status(400).json({ message: "Email, password and name are required" });
      return;
    }

    const userRepo = AppDataSource.getRepository(User);

    const existingUser = await userRepo.findOne({ where: { email } });
    if (existingUser) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = userRepo.create({
      email,
      password: hashedPassword,
      name,
      role
    });

    await userRepo.save(newUser);

    // Generate tokens
    const accessToken = generateAccessToken(newUser.id);
    const refreshToken = generateRefreshToken(newUser.id);

    // Set refresh token in cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 
    });

    res.status(201).json({ 
      message: "User registered successfully",
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      },
      accessToken
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// ✅ Login User
export const login = async (req: Request, res: Response): Promise<void> => {
  const { email, password } = req.body;
  const userRepo = AppDataSource.getRepository(User);

  const user = await userRepo.findOne({ where: { email } });
  if (!user || !user.password) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }

  const isValidPassword = await bcrypt.compare(password, user.password);
  if (!isValidPassword) {
    res.status(401).json({ message: "Invalid credentials" });
    return;
  }

  const accessToken = generateAccessToken(user.id);
  const refreshToken = generateRefreshToken(user.id);

  res.cookie("refreshToken", refreshToken, { httpOnly: true, secure: true });
  res.json({ accessToken });
};

// ✅ Refresh Token
export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  if (!REFRESH_TOKEN_SECRET) {
    res.status(500).json({ message: "Server configuration error" });
    return;
  }

  try {
    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET) as unknown as JWTPayload;
    const newAccessToken = generateAccessToken(decoded.userId);
    res.json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(403).json({ message: "Invalid refresh token" });
  }
};

export const logout = async (req: Request, res: Response): Promise<void> => {
  req.logout(() => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to log out" });
      }
      res.clearCookie("connect.sid"); // Clear session cookie
      res.clearCookie("refreshToken"); // Clear refresh token
      res.status(200).json({ message: "Logged out successfully" });
    });
  });
};

