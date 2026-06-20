import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import ReportCard from "../components/ReportCard";

export default function Dashboard() {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [selfDescription, setSelfDescription] = useState("");
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    try {
      setError("");

      if (!file || !jobDescription || !selfDescription) {
        setError("⚠️ Please fill all fields");
        return;
      }

      setLoading(true);
      setReport(null);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("jobDescription", jobDescription);
      formData.append("selfDescription", selfDescription);

      const res = await api.post("/interview", formData);

      const data = res.data?.interviewReport || res.data;

      if (!data) {
        setError("No report generated");
        return;
      }

      setReport(data);
    } catch (err) {
      console.log(err);
      setError("❌ Error generating report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-950 text-white">
      {/* SIDEBAR */}
      <aside className="w-full md:w-64 bg-gray-900 border-b md:border-r border-gray-800 p-4">
        <h1 className="text-xl font-bold text-green-400 mb-4">
          ResumeIQ AI 🚀
        </h1>

        <nav className="flex md:flex-col gap-3 text-sm md:text-base overflow-x-auto">
          <Link className="hover:text-white" to="/dashboard">
            Dashboard
          </Link>
          <Link className="hover:text-white" to="/reports">
            Reports
          </Link>
          <Link className="hover:text-white" to="/resume-builder">
            Resume
          </Link>
          <Link className="hover:text-white" to="/settings">
            Settings
          </Link>
        </nav>
      </aside>

      {/* MAIN */}
      <main className="flex-1 p-4 md:p-8 overflow-auto">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">Dashboard 🚀</h1>

        {/* INPUT CARD */}
        <div className="bg-gray-900 p-4 md:p-6 rounded-xl space-y-4 border border-gray-800">
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full text-sm"
          />

          <textarea
            placeholder="Self Description"
            className="w-full p-3 bg-gray-800 rounded"
            value={selfDescription}
            onChange={(e) => setSelfDescription(e.target.value)}
          />

          <textarea
            placeholder="Job Description"
            className="w-full p-3 bg-gray-800 rounded"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full md:w-auto bg-green-500 px-5 py-2 rounded hover:bg-green-600"
          >
            {loading ? "AI Analyzing..." : "Generate Report"}
          </button>

          {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>

        {/* LOADING */}
        {loading && (
          <p className="text-yellow-400 mt-4 animate-pulse">Processing...</p>
        )}

        {/* REPORT */}
        {report && (
          <div className="mt-6">
            <ReportCard report={report} />
          </div>
        )}
      </main>
    </div>
  );
}
