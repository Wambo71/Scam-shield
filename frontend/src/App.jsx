import { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyzeUrl = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/analyze",
        { url }
      );

      setResult(response.data);
    } catch (error) {
      alert("Backend connection failed");
      console.log(error);
    }

    setLoading(false);
  };

  const getStatusColor = (status) => {
    if (status === "Safe") return "#16a34a";       // green
    if (status === "Suspicious") return "#f59e0b"; // yellow
    return "#dc2626";                               // red
  };

  return (
    <div className="container">
      <h1 className="title">🛡️ ScamShield</h1>
      <p className="subtitle">Detect fake jobs & scam websites instantly</p>

      <div className="inputBox">
        <input
          type="text"
          placeholder="Paste suspicious URL..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />

        <button onClick={analyzeUrl} disabled={loading}>
          {loading ? "Analyzing..." : "Analyze"}
        </button>
      </div>

      {result && (
        <div className="card">
          <h2 style={{ color: getStatusColor(result.status) }}>
            {result.status}
          </h2>

          <p><b>Risk Score:</b> {result.risk_score}%</p>

          <h3>Reasons:</h3>
          <ul>
            {result.reasons.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;