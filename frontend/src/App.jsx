import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {

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

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");

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
      setReports(res.data || []);
    } catch (err) {
      alert("Failed to load reports");
    }

    setLoadingReports(false);
  };

  // ======================
  // ANALYZE URL
  // ======================
  const analyzeUrl = async () => {

    if (!url) return;

    setLoading(true);
    setResult(null);

    try {

      const res = await axios.post(`${API}/analyze`, {
        url
      });

      // ----------------------
      // HANDLE AI JSON
      // ----------------------
      const aiData =
        res.data.ai_result ||
        res.data.ai_raw ||
        res.data.ai_analysis ||
        {};

      let parsedAI = aiData;

      // If backend returns string JSON
      if (typeof aiData === "string") {
        try {
          parsedAI = JSON.parse(aiData);
        } catch {
          parsedAI = {
            status: "Unknown",
            confidence: 0,
            category: "Unknown",
            reason: "AI returned invalid JSON"
          };
        }
      }

      setResult({
        ...res.data,
        ai: parsedAI
      });

    } catch (err) {
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

    try {

      const res = await axios.post(`${API}/report`, {
        url: reportUrl,
        description: reportDesc,
        category: reportCategory,
        confidence: result?.ai?.confidence || 0
      });

      setReportMsg(res.data.message || "Report submitted");

      // RESET
      setReportUrl("");
      setReportDesc("");
      setReportCategory("");

      fetchReports();

    } catch {
      alert("Report failed");
    }
  };

  // ======================
  // DELETE REPORT
  // ======================
  const deleteReport = async (id) => {

    if (!window.confirm("Delete this report?")) return;

    try {
      await axios.delete(`${API}/report/${id}`);
      fetchReports();
    } catch {
      alert("Delete failed");
    }
  };

  // ======================
  // FILTER + SEARCH
  // ======================
  const filteredReports = reports.filter((r) => {

    const searchLower = search.toLowerCase();

    const matchSearch =
      (r.url || "").toLowerCase().includes(searchLower) ||
      (r.description || "").toLowerCase().includes(searchLower);

    const matchFilter =
      filter === "" || r.category === filter;

    return matchSearch && matchFilter;
  });

  // ======================
  // ANALYTICS
  // ======================
  const total = reports.length;

  const crypto = reports.filter(
    r => r.category === "Crypto Scam"
  ).length;

  const jobs = reports.filter(
    r => r.category === "Fake Job"
  ).length;

  const romance = reports.filter(
    r => r.category === "Romance Scam"
  ).length;

  const phishing = reports.filter(
    r => r.category === "Phishing"
  ).length;

  const investment = reports.filter(
    r => r.category === "Investment Scam"
  ).length;

  const giveaways = reports.filter(
    r => r.category === "Fake Giveaways"
  ).length;

  const others = reports.filter(
    r => ![
      "Fake Job",
      "Crypto Scam",
      "Romance Scam",
      "Phishing",
      "Investment Scam",
      "Fake Giveaways"
    ].includes(r.category)
  ).length;

  // ======================
  // UI
  // ======================
  return (
    <div className="app">

      {/* NAVBAR */}
      <div className="navbar">
        <h2>🛡️ ScamShield AI</h2>
      </div>

      <div className="main">

        <h1>Scam Detection System</h1>

        {/* ====================== */}
        {/* URL ANALYZER */}
        {/* ====================== */}
        <div className="card">

          <h2>URL Analyzer</h2>

          <div className="row">

            <input
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter URL..."
            />

            <button onClick={analyzeUrl}>
              {loading ? "Scanning..." : "Analyze"}
            </button>

          </div>

          {result && (
            <div className="result">

              <h3>Status: {result.ai?.status}</h3>

              <p>
                <strong>Confidence:</strong>{" "}
                {result.ai?.confidence}%
              </p>

              <p>
                <strong>Category:</strong>{" "}
                {result.ai?.category}
              </p>

              <p>
                <strong>Reason:</strong>{" "}
                {result.ai?.reason}
              </p>

            </div>
          )}

        </div>

        {/* ====================== */}
        {/* REPORT FORM */}
        {/* ====================== */}
        <div className="card">

          <h2>Report Scam</h2>

          <input
            placeholder="URL"
            value={reportUrl}
            onChange={(e) => setReportUrl(e.target.value)}
          />

          <textarea
            placeholder="Description"
            value={reportDesc}
            onChange={(e) => setReportDesc(e.target.value)}
          />

          <select
            value={reportCategory}
            onChange={(e) => setReportCategory(e.target.value)}
          >
            <option value="">Select Category</option>

            <option value="Fake Job">
              Fake Job
            </option>

            <option value="Crypto Scam">
              Crypto Scam
            </option>

            <option value="Romance Scam">
              Romance Scam
            </option>

            <option value="Phishing">
              Phishing
            </option>

            <option value="Investment Scam">
              Investment Scam
            </option>

            <option value="Fake Giveaways">
              Fake Giveaways
            </option>

            <option value="Other">
              Other
            </option>

          </select>

          <button onClick={submitReport}>
            Submit
          </button>

          {reportMsg && (
            <p className="success">
              {reportMsg}
            </p>
          )}

        </div>

        {/* ====================== */}
        {/* ANALYTICS */}
        {/* ====================== */}
        <div className="grid">

          <div className="box">
            Total: {total}
          </div>

          <div className="box">
            Crypto: {crypto}
          </div>

          <div className="box">
            Jobs: {jobs}
          </div>

          <div className="box">
            Romance: {romance}
          </div>

          <div className="box">
            Phishing: {phishing}
          </div>

          <div className="box">
            Investment: {investment}
          </div>

          <div className="box">
            Giveaways: {giveaways}
          </div>

          <div className="box">
            Others: {others}
          </div>

        </div>

        {/* ====================== */}
        {/* SEARCH + FILTER */}
        {/* ====================== */}
        <div className="card">

          <h2>Search & Filter</h2>

          <div className="row">

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search reports..."
            />

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="">All</option>

              <option value="Fake Job">
                Fake Job
              </option>

              <option value="Crypto Scam">
                Crypto Scam
              </option>

              <option value="Romance Scam">
                Romance Scam
              </option>

              <option value="Phishing">
                Phishing
              </option>

              <option value="Investment Scam">
                Investment Scam
              </option>

              <option value="Fake Giveaways">
                Fake Giveaways
              </option>

              <option value="Other">
                Other
              </option>

            </select>

            <button
              onClick={() => {
                setSearch("");
                setFilter("");
              }}
            >
              Reset
            </button>

          </div>

        </div>

        {/* ====================== */}
        {/* DASHBOARD */}
        {/* ====================== */}
        <div className="card">

          <h2>Reports Dashboard</h2>

          <button onClick={fetchReports}>
            {loadingReports ? "Loading..." : "Refresh"}
          </button>

          <table className="table">

            <thead>

              <tr>
                <th>ID</th>
                <th>URL</th>
                <th>Category</th>
                <th>Description</th>
                <th>Confidence</th>
                <th>Action</th>
              </tr>

            </thead>

            <tbody>

              {filteredReports.length > 0 ? (

                filteredReports.map((r) => (

                  <tr key={r.id}>

                    <td>{r.id}</td>

                    <td>{r.url}</td>

                    <td>{r.category}</td>

                    <td>{r.description}</td>

                    <td>{r.confidence || 0}%</td>

                    <td>

                      <button
                        className="delete"
                        onClick={() => deleteReport(r.id)}
                      >
                        Delete
                      </button>

                    </td>

                  </tr>

                ))

              ) : (

                <tr>

                  <td colSpan="6">
                    No reports found
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>
    </div>
  );
}

export default App;