import "dotenv/config";
import express from "express";
import cors from "cors";

const app = express();
const port = Number(process.env.PORT || 4000);
const frontendOrigin = process.env.FRONTEND_ORIGIN;

if (!frontendOrigin) {
  throw new Error("Set FRONTEND_ORIGIN in backend/.env or the hosting environment.");
}

// Tell browsers which frontend origin may read our responses.
app.use(cors({ origin: frontendOrigin }));

// React calls this route using fetch. The backend creates the response.
app.get("/api/message", (_req, res) => {
  res.json({ message: "Hello from the separately running Node + Express backend!" });
});

app.listen(port, "0.0.0.0", () => {
  console.log(`Backend listening on port ${port}`);
});
