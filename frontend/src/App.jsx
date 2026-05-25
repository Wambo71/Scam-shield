import { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  // ======================
  // SCAN STATES
  // ======================
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // ======================
  // REPORT STATES
  // ======================
  const [reportUrl, setReportUrl] = useState("");
  const [reportDesc, setReportDesc] = useState("");
  const [reportMsg, setReportMsg] = useState("");
  const [reportLoading, setReportLoading] = useState(false);

  // ======================
  // ANALYZE FUNCTION
  // ======================
  const analyzeUrl = async () => {
    if (!url) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/analyze",
        { url }
      );

      setResult(response.data);
    } catch (error) {
      console.log(error);
      alert("Backend connection failed");
    }

    setLoading(false);
  };

  // ======================
  // SUBMIT REPORT FUNCTION
  // ======================
  const submitReport = async () => {
    if (!reportUrl || !reportDesc) {
      alert("Please fill all fields");
      return;
    }

    setReportLoading(true);
    setReportMsg("");

    try {
      const res = await axios.post("http://127.0.0.1:5000/report", {
        url: reportUrl,
        description: reportDesc,
      });

      setReportMsg(res.data.message);

      setReportUrl("");
      setReportDesc("");
    } catch (error) {
      console.log(error);
      alert("Failed to submit report");
    }

    setReportLoading(false);
  };

  // ======================
  // STATUS COLOR FUNCTION
  // ======================
  const getStatusColor = (status) => {
    if (status === "Safe") return "#16a34a";
    if (status === "Suspicious") return "#f59e0b";
    return "#dc2626";
  };

  // ======================
  // UI
  // ======================
  return (
    <div className="container">

      {/* TITLE */}
      <h1 className="title">🛡️ ScamShield</h1>
      <p className="subtitle">
        Detect fake jobs & scam websites instantly
      </p>

      {/* ANALYZER INPUT */}
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

      {/* RESULT CARD */}
      {result && (
        <div className="card">
          <h2 style={{ color: getStatusColor(result.status) }}>
            {result.status}
          </h2>

          <p>
            <b>Risk Score:</b> {result.risk_score}%
          </p>

          <h3>Reasons:</h3>
          <ul>
            {result.reasons.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}

      {/* REPORT FORM */}
      <div className="reportCard">
        <h2>🚨 Report a Scam</h2>

        <input
          type="text"
          placeholder="Scam URL"
          value={reportUrl}
          onChange={(e) => setReportUrl(e.target.value)}
        />

        <textarea
          placeholder="Describe the scam..."
          value={reportDesc}
          onChange={(e) => setReportDesc(e.target.value)}
        />

        <button onClick={submitReport} disabled={reportLoading}>
          {reportLoading ? "Submitting..." : "Submit Report"}
        </button>

        {reportMsg && (
          <p style={{ color: "lightgreen", marginTop: "10px" }}>
            {reportMsg}
          </p>
        )}
      </div>

    </div>
  );
}

export default App;