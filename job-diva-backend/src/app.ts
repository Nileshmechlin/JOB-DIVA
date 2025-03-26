import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import session from 'express-session';
import MemoryStore from 'memorystore';
import { passport } from "./config/passport";
import authRoutes from "./routes/authRoutes";
import linkedinRoutes from "./routes/linkedinRoutes";
import { sessionLogger } from './middleware/sessionLogger';


const MemoryStoreSession = MemoryStore(session);

// Load environment variables
dotenv.config();

// Verify critical environment variables
const requiredEnvVars = [
  'LINKEDIN_CLIENT_ID',
  'LINKEDIN_CLIENT_SECRET',
  'LINKEDIN_REDIRECT_URI'
];

requiredEnvVars.forEach(varName => {
  if (!process.env[varName]) {
    console.error(`❌ Missing required environment variable: ${varName}`);
    process.exit(1);
  }
});

console.log("✅ LinkedIn configuration loaded:", {
  clientId: process.env.LINKEDIN_CLIENT_ID,
  redirectUri: process.env.LINKEDIN_REDIRECT_URI,
  hasSecret: !!process.env.LINKEDIN_CLIENT_SECRET
});

const app = express();

// Define allowed origins
const allowedOrigins = [
  "http://localhost:5173",  // Vite development server

];

if (process.env.CLIENT_URL) {
  allowedOrigins.push(process.env.CLIENT_URL);
}

// CORS configuration
app.use(cors({
  origin: "http://localhost:5173", // Frontend URL
  credentials: true, // Important for cookies/auth
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Add OPTIONS
  allowedHeaders: [
    "Content-Type", 
    "Authorization",
    "Access-Control-Allow-Credentials",
    "Access-Control-Allow-Origin"
  ],
  exposedHeaders: ["set-cookie"]
}));

// Add before routes
app.options('*', cors()); // Enable pre-flight for all routes

// Middleware
app.use(express.json());
app.use(cookieParser());

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  store: new MemoryStoreSession({
    checkPeriod: 86400000 // prune expired entries every 24h
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Initialize passport
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/linkedin", linkedinRoutes);

// Add after session middleware
app.use(sessionLogger);

// ✅ Health Check Route
app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK", timestamp: new Date() });
});

// ✅ Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("🔴 Error:", err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || "Internal Server Error",
      status: err.status || 500,
      timestamp: new Date()
    }
  });
});

// ✅ 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: "Route not found",
      status: 404,
      path: req.path
    }
  });
});

export default app;
