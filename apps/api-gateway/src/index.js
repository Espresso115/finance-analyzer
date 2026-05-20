import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import axios from "axios";
import connectDB from "./config/database.js";
import authRoutes from "./routes/auth.routes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1/auth', authRoutes);

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


const PORT = process.env.PORT || 4000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`API Gateway running on port ${PORT}`);
  });
});


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