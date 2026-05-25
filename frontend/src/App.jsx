import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

function App() {

  // ======================
  // API BASE URL
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
  const [reportMsg, setReportMsg] = useState("");
  const [reportLoading, setReportLoading] = useState(false);

  // ======================
  // EFFECT
  // ======================
  useEffect(() => {
    fetchReports();
  }, []);

  // ======================
  // FETCH REPORTS
  // ======================
  const fetchReports = async () => {

    setLoadingReports(true);

    try {

      const res = await axios.get(
        `${API}/reports`
      );

      setReports(res.data);

    } catch (error) {

      console.log(error);
      alert("Failed to fetch reports");
    }

    setLoadingReports(false);
  };

  // ======================
  // ANALYZE URL
  // ======================
  const analyzeUrl = async () => {

    if (!url.trim()) {
      alert("Please enter a URL");
      return;
    }

    setLoading(true);
    setResult(null);

    try {

      const response = await axios.post(
        `${API}/analyze`,
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
  // SUBMIT REPORT
  // ======================
  const submitReport = async () => {

    if (!reportUrl || !reportDesc) {

      alert("Please fill all fields");
      return;
    }

    setReportLoading(true);
    setReportMsg("");

    try {

      const res = await axios.post(
        `${API}/report`,
        {
          url: reportUrl,
          description: reportDesc,
        }
      );

      setReportMsg(res.data.message);

      setReportUrl("");
      setReportDesc("");

      // refresh reports
      fetchReports();

    } catch (error) {

      console.log(error);
      alert("Failed to submit report");
    }

    setReportLoading(false);
  };

  // ======================
  // DELETE REPORT
  // ======================
  const deleteReport = async (id) => {

    const confirmDelete = window.confirm(
      "Are you sure you want to delete this report?"
    );

    if (!confirmDelete) return;

    try {

      await axios.delete(
        `${API}/report/${id}`
      );

      // refresh reports
      fetchReports();

    } catch (error) {

      console.log(error);
      alert("Failed to delete report");
    }
  };

  // ======================
  // STATUS COLOR
  // ======================
  const getStatusColor = (status) => {

    if (status === "Safe") return "#16a34a";

    if (status === "Suspicious") return "#f59e0b";

    return "#dc2626";
  };

  // ======================
  // ANALYTICS
  // ======================
  const totalReports = reports.length;

  const suspiciousReports = reports.filter((r) =>
    r.description.toLowerCase().includes("crypto") ||
    r.description.toLowerCase().includes("telegram") ||
    r.description.toLowerCase().includes("investment")
  ).length;

  const otherReports = totalReports - suspiciousReports;

  // ======================
  // UI
  // ======================
  return (

    <div className="container">

      {/* TITLE */}
      <h1 className="title">
        🛡️ ScamShield
      </h1>

      <p className="subtitle">
        Detect fake jobs & scam websites instantly
      </p>

      {/* ANALYZER */}
      <div className="inputBox">

        <input
          type="text"
          placeholder="Paste suspicious URL..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />

        <button
          onClick={analyzeUrl}
          disabled={loading}
        >
          {loading ? "Analyzing..." : "Analyze"}
        </button>

      </div>

      {/* RESULT */}
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
            {result.reasons.map((reason, index) => (
              <li key={index}>
                {reason}
              </li>
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

        <button
          onClick={submitReport}
          disabled={reportLoading}
        >
          {reportLoading
            ? "Submitting..."
            : "Submit Report"}
        </button>

        {reportMsg && (
          <p
            style={{
              color: "lightgreen",
              marginTop: "10px"
            }}
          >
            {reportMsg}
          </p>
        )}

      </div>

      {/* ANALYTICS */}
      <div className="analyticsGrid">

        <div className="analyticsCard">
          <h3>Total Reports</h3>
          <p>{totalReports}</p>
        </div>

        <div className="analyticsCard">
          <h3>Suspicious Reports</h3>
          <p>{suspiciousReports}</p>
        </div>

        <div className="analyticsCard">
          <h3>Other Reports</h3>
          <p>{otherReports}</p>
        </div>

      </div>

      {/* DASHBOARD */}
      <div className="reportDashboard">

        <h2>📊 Scam Reports Dashboard</h2>

        <button onClick={fetchReports}>
          {loadingReports
            ? "Loading..."
            : "Refresh Reports"}
        </button>

        {reports.length === 0 ? (

          <p className="emptyText">
            No reports found
          </p>

        ) : (

          <div className="reportGrid">

            {reports.map((report) => (

              <div
                key={report.id}
                className="reportCardItem"
              >

                <div className="reportHeader">

                  <span className="reportId">
                    #{report.id}
                  </span>

                </div>

                <div className="reportBody">

                  <p className="label">
                    URL
                  </p>

                  <p className="value urlText">
                    {report.url}
                  </p>

                  <p className="label">
                    Description
                  </p>

                  <p className="value">
                    {report.description}
                  </p>

                  <button
                    className="deleteBtn"
                    onClick={() => deleteReport(report.id)}
                  >
                    Delete
                  </button>

                </div>

              </div>

            ))}

          </div>

        )}

      </div>

    </div>
  );
}

export default App;