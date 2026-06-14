import express from "express";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { connectDB } from "./server/config/db";
import authRoutes from "./server/routes/authRoutes";
import adminRoutes from "./server/routes/adminRoutes";
import studentRoutes from "./server/routes/studentRoutes";

// Load environment variables
dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Gracefully initiate MongoDB Atlas Connection
  await connectDB();

  // Middleware
  app.use(express.json());

  // Strict CORS setup
  const allowedOrigins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://your-frontend.vercel.app"
  ];
  if (process.env.APP_URL) {
    allowedOrigins.push(process.env.APP_URL);
  }

  app.use(
    cors({
      origin: function (origin, callback) {
        // Allow same-origin/internal requests or matches list
        if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== "production") {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      },
      credentials: true,
    })
  );

  // --- API ROUTES ---

  // Health Check Endpoint (Mandatory)
  app.get("/api/health", (req, res) => {
    res.status(200).send("KaroGrade API is running");
  });

  // Main Route Modules
  app.use("/api/auth", authRoutes);
  app.use("/api/admin", adminRoutes);
  app.use("/api/student", studentRoutes);

  // --- VITE WEB MIDDLEWARE & SPA RENDERING ---

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("🚀 Vite developer server loaded successfully.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("📦 Production assets compiled directory registered.");
  }

  // Bind exclusively to 0.0.0.0:3000
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`=========================================`);
    console.log(`🎓 KaroGrade system online on port ${PORT}`);
    console.log(`=========================================`);
  });
}

startServer().catch((err) => {
  console.error("FATAL ERROR BOOTSTRAPPING SERVER:", err);
});
