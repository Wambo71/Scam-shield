import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {

  // ======================
  // API
  // ======================
  const API = "http://127.0.0.1:5000";

  // ======================
  // STATES
  // ======================
  const [reports, setReports] = useState([]);
  const [loadingReports, setLoadingReports] = useState(false);

  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const [reportUrl, setReportUrl] = useState("");
  const [reportDesc, setReportDesc] = useState("");
  const [reportCategory, setReportCategory] = useState("");
  const [reportMsg, setReportMsg] = useState("");
  const [reportLoading, setReportLoading] = useState(false);

  // 🔍 SEARCH + FILTER STATES
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");

  // ======================
  // LOAD REPORTS
  // ======================
  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {

    setLoadingReports(true);

    try {

      const res = await axios.get(`${API}/reports`);
      setReports(res.data);

    } catch (error) {

      console.log(error);
      alert("Failed to load reports");
    }

    setLoadingReports(false);
  };

  // ======================
  // ANALYZE URL
  // ======================
  const analyzeUrl = async () => {

    if (!url.trim()) return alert("Enter URL");

    setLoading(true);
    setResult(null);

    try {

      const res = await axios.post(`${API}/analyze`, { url });
      setResult(res.data);

    } catch (error) {

      console.log(error);
      alert("Analysis failed");
    }

    setLoading(false);
  };

  // ======================
  // SUBMIT REPORT
  // ======================
  const submitReport = async () => {

    if (!reportUrl || !reportDesc || !reportCategory) {
      alert("Fill all fields");
      return;
    }

    setReportLoading(true);

    try {

      const res = await axios.post(`${API}/report`, {
        url: reportUrl,
        description: reportDesc,
        category: reportCategory
      });

      setReportMsg(res.data.message);

      setReportUrl("");
      setReportDesc("");
      setReportCategory("");

      fetchReports();

    } catch (error) {

      console.log(error);
      alert("Report failed");
    }

    setReportLoading(false);
  };

  // ======================
  // DELETE REPORT
  // ======================
  const deleteReport = async (id) => {

    if (!window.confirm("Delete this report?")) return;

    try {

      await axios.delete(`${API}/report/${id}`);
      fetchReports();

    } catch (error) {

      console.log(error);
      alert("Delete failed");
    }
  };

  // ======================
  // ANALYTICS
  // ======================
  const total = reports.length;

  const crypto = reports.filter(r => r.category === "Crypto Scam").length;
  const jobs = reports.filter(r => r.category === "Fake Job").length;
  const others = total - (crypto + jobs);

  // ======================
  // 🔍 FILTER LOGIC (SEARCH + CATEGORY)
  // ======================
  const filteredReports = reports.filter((r) => {

    const matchesSearch =
      r.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      filterCategory === "" || r.category === filterCategory;

    return matchesSearch && matchesCategory;
  });

  // ======================
  // UI
  // ======================
  return (
    <div className="container">

      {/* TITLE */}
      <h1 className="title">🛡️ ScamShield</h1>
      <p className="subtitle">Detect scam websites & fake jobs</p>

      {/* ======================
          ANALYZER
      ====================== */}
      <div className="inputBox">

        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste URL..."
        />

        <button onClick={analyzeUrl} disabled={loading}>
          {loading ? "Analyzing..." : "Analyze"}
        </button>

      </div>

      {/* RESULT */}
      {result && (
        <div className="card">

          <h2>{result.status}</h2>

          <p><b>Risk:</b> {result.risk_score}%</p>

          <p className="aiText">
            🤖 {result.ai_analysis}
          </p>

          <h3>Reasons</h3>
          <ul>
            {result.reasons.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>

        </div>
      )}

      {/* ======================
          REPORT FORM
      ====================== */}
      <div className="reportCard">

        <h2>🚨 Report Scam</h2>

        <input
          value={reportUrl}
          onChange={(e) => setReportUrl(e.target.value)}
          placeholder="URL"
        />

        <textarea
          value={reportDesc}
          onChange={(e) => setReportDesc(e.target.value)}
          placeholder="Description"
        />

        <select
          value={reportCategory}
          onChange={(e) => setReportCategory(e.target.value)}
        >
          <option value="">Select Category</option>
          <option value="Fake Job">Fake Job</option>
          <option value="Crypto Scam">Crypto Scam</option>
          <option value="Investment Scam">Investment Scam</option>
          <option value="Phishing">Phishing</option>
          <option value="Romance Scam">Romance Scam</option>
          <option value="Fake Giveaway">Fake Giveaway</option>
          <option value="Other">Other</option>
        </select>

        <button onClick={submitReport} disabled={reportLoading}>
          {reportLoading ? "Submitting..." : "Submit"}
        </button>

        {reportMsg && <p className="success">{reportMsg}</p>}

      </div>

      {/* ======================
          ANALYTICS
      ====================== */}
      <div className="analyticsGrid">

        <div className="analyticsCard">
          <h3>Total</h3>
          <p>{total}</p>
        </div>

        <div className="analyticsCard">
          <h3>Crypto</h3>
          <p>{crypto}</p>
        </div>

        <div className="analyticsCard">
          <h3>Jobs</h3>
          <p>{jobs}</p>
        </div>

        <div className="analyticsCard">
          <h3>Others</h3>
          <p>{others}</p>
        </div>

      </div>

      {/* ======================
          🔍 SEARCH + FILTER
      ====================== */}
      <div className="searchFilterBox">

        <input
          placeholder="Search reports..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="Fake Job">Fake Job</option>
          <option value="Crypto Scam">Crypto Scam</option>
          <option value="Investment Scam">Investment Scam</option>
          <option value="Phishing">Phishing</option>
          <option value="Romance Scam">Romance Scam</option>
          <option value="Fake Giveaway">Fake Giveaway</option>
          <option value="Other">Other</option>
        </select>

        <button onClick={() => {
          setSearchTerm("");
          setFilterCategory("");
        }}>
          Reset
        </button>

      </div>

      {/* ======================
          DASHBOARD
      ====================== */}
      <div className="reportDashboard">

        <h2>📊 Reports</h2>

        <button onClick={fetchReports}>
          {loadingReports ? "Loading..." : "Refresh"}
        </button>

        {filteredReports.length === 0 ? (
          <p>No matching reports</p>
        ) : (
          <div className="reportGrid">

            {filteredReports.map((r) => (
              <div key={r.id} className="reportCardItem">

                <p><b>ID:</b> #{r.id}</p>
                <p><b>Category:</b> {r.category}</p>
                <p><b>URL:</b> {r.url}</p>
                <p><b>Description:</b> {r.description}</p>

                <button
                  className="deleteBtn"
                  onClick={() => deleteReport(r.id)}
                >
                  Delete
                </button>

              </div>
            ))}

          </div>
        )}

      </div>

    </div>
  );
}

export default App;