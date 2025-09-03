import "dotenv/config";
import express from "express";
import cors from "cors";
import { handleDemo } from "./routes/demo";
import * as authRoutes from "./routes/auth";
import AuthUtils from "./utils/auth";
import DatabaseConnection from "./utils/database";

export function createServer() {
  const app = express();

  // Initialize database connection
  const db = DatabaseConnection.getInstance();
  db.connect().catch(console.error);

  // Middleware
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Health check routes
  app.get("/api/ping", (_req, res) => {
    const ping = process.env.PING_MESSAGE ?? "ping";
    res.json({ message: ping });
  });

  app.get("/api/health", (_req, res) => {
    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      database: db.getConnectionStatus() ? 'connected' : 'disconnected'
    });
  });

  // Authentication routes
  app.post("/api/auth/login", authRoutes.login);
  app.post("/api/auth/register", authRoutes.register);
  app.get("/api/auth/profile", AuthUtils.authenticateToken, authRoutes.getProfile);
  app.put("/api/auth/profile", AuthUtils.authenticateToken, authRoutes.updateProfile);
  app.post("/api/auth/change-password", AuthUtils.authenticateToken, authRoutes.changePassword);

  // Protected routes placeholder
  app.get("/api/dashboard", AuthUtils.authenticateToken, (req, res) => {
    res.json({
      message: "Welcome to your dashboard",
      user: req.user
    });
  });

  // Legacy demo route
  app.get("/api/demo", handleDemo);

  return app;
}
