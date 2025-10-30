// backend/test-cors.js
import express from "express";
import cors from "cors";

const app = express();

// Ultra-simple CORS for testing
app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.get("/test", (req, res) => {
  res.json({
    message: "CORS is working!",
    origin: req.headers.origin,
    timestamp: new Date().toISOString(),
  });
});

const PORT = 5001;
app.listen(PORT, () => {
  console.log(`🧪 Test CORS server running on http://localhost:${PORT}`);
  console.log(`🌍 Test URL: http://localhost:${PORT}/test`);
});
