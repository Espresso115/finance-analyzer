import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/database.js";
import { API_PREFIX } from "./config/app.js";
import authRoutes from "./routes/auth.routes.js";
import docsRoutes from "./routes/docs.routes.js";
import userRoutes from "./routes/user.routes.js";
import marketRoutes from "./routes/market.routes.js";
import redisClient from "./config/redis.js";
import { ensureAvatarUploadDirectory } from "./controllers/user.controller.js";
import { errorHandler, notFound } from "./middleware/error.middleware.js";
import { authorizeRoles, protect } from "./middleware/auth.middleware.js";
import { requestId } from "./middleware/requestId.middleware.js";

dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadRoot = path.resolve(__dirname, "..", "uploads");
fs.mkdirSync(path.join(uploadRoot, "avatars"), { recursive: true });

app.use(cors());
app.use(requestId);
app.use(express.json());
app.use('/uploads', express.static(uploadRoot));

// Routes
app.use(`${API_PREFIX}/auth`, authRoutes);
app.use(`${API_PREFIX}/users`, userRoutes);
app.use(`${API_PREFIX}/market`, marketRoutes);
app.use(`${API_PREFIX}/docs`, docsRoutes);


app.get("/health", (req, res) => {
  res.json({
    service: "api-gateway",
    status: "running"
  });
});

app.get("/test-llm", async (req, res) => {
  try {
    const response = await axios.get(
      `${process.env.LLM_SERVICE_URL}/health`
    );

    res.json(response.data);

  } catch (error) {
    res.status(500).json({
      error: error.message
    });
  }
});

if (process.env.NODE_ENV === 'test') {
  app.get('/api/v1/test-protect', protect, (req, res) => {
    res.json({ success: true, userId: req.user._id });
  });

  app.get('/api/v1/test-admin-only', protect, authorizeRoles('admin'), (req, res) => {
    res.json({ success: true, userId: req.user._id });
  });
}

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;

if (process.env.NODE_ENV !== 'test') {
  connectDB().then(async () => {
    await ensureAvatarUploadDirectory(uploadRoot);
    try {
      await redisClient.connect();
    } catch (err) {
      console.error('Failed to connect to Redis on startup:', err.message);
    }
    app.listen(PORT, () => {
      console.log(`API Gateway running on port ${PORT}`);
    });
  });
}

export default app;


/*app.get("/test-llm", async (req, res) => {
  try {

    console.log("ENV VALUE:");
    console.log(process.env.LLM_SERVICE_URL);

    const url = `${process.env.LLM_SERVICE_URL}/health`;

    console.log("FINAL URL:");
    console.log(url);

    const response = await axios.get(url);

    res.json(response.data);

  } catch (error) {

    console.log(error);

    res.status(500).json({
      error: error.message
    });
  }
});
*/
