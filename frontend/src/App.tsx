import { useState } from "react";

type MessageResponse = { message: string };
const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, "");

export default function App() {
  const [message, setMessage] = useState("Click the button to call the backend.");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function getMessage() {
    setLoading(true);
    setError("");
    try {
      if (!API_URL) throw new Error("Set VITE_API_URL in frontend/.env and restart Vite.");
      // This URL points to the separately running Express server.
      const response = await fetch(`${API_URL}/api/message`);
      if (!response.ok) throw new Error(`Backend returned HTTP ${response.status}`);
      const data: MessageResponse = await response.json();
      setMessage(data.message);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ fontFamily: "sans-serif", maxWidth: 640, margin: "60px auto", padding: 24 }}>
      <h1>React frontend + Node backend</h1>
      <p>The page runs in React. The message comes from Express.</p>
      <p>Backend URL: <code>{API_URL || "Not configured"}</code></p>
      <button onClick={getMessage} disabled={loading}>
        {loading ? "Loading..." : "Fetch backend message"}
      </button>
      <p aria-live="polite">{message}</p>
      {error && <p role="alert" style={{ color: "crimson" }}>{error}</p>}
    </main>
  );
}
