import { useState } from "react";
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
      formData.append("resume", file);
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
      console.error(err);
      setError("❌ Error generating report. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex">
      {/* SIDEBAR */}
      <div className="w-64 bg-gray-900 p-5 border-r border-gray-800">
        <h1 className="text-xl font-bold text-green-400 mb-8">AI SaaS</h1>

        <nav className="space-y-3 text-gray-300">
          <p className="hover:text-white cursor-pointer">Dashboard</p>
          <p className="hover:text-white cursor-pointer">Reports</p>
          <p className="hover:text-white cursor-pointer">Resume Builder</p>
          <p className="hover:text-white cursor-pointer">Settings</p>
        </nav>
      </div>

      {/* MAIN */}
      <div className="flex-1 p-8 overflow-auto">
        {/* HEADER */}
        <h1 className="text-3xl font-bold mb-6">Interview AI Dashboard 🚀</h1>

        {/* INPUT CARD */}
        <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 space-y-4">
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full text-sm"
          />

          <textarea
            placeholder="Self Description"
            className="w-full p-3 bg-gray-800 rounded outline-none"
            value={selfDescription}
            onChange={(e) => setSelfDescription(e.target.value)}
          />

          <textarea
            placeholder="Job Description"
            className="w-full p-3 bg-gray-800 rounded outline-none"
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
          />

          <button
            onClick={handleSubmit}
            disabled={loading}
            className="bg-green-500 px-5 py-2 rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? "AI Analyzing..." : "Generate Report"}
          </button>

          {/* ERROR */}
          {error && <p className="text-red-400 text-sm">{error}</p>}
        </div>

        {/* LOADING */}
        {loading && (
          <p className="text-yellow-400 mt-5 animate-pulse">
            AI analyzing resume... ⏳
          </p>
        )}

        {/* EMPTY STATE */}
        {!report && !loading && !error && (
          <p className="text-gray-500 mt-6">
            Upload resume and generate AI report
          </p>
        )}

        {/* REPORT */}
        {report && (
          <div className="mt-6">
            <ReportCard report={report} />
          </div>
        )}
      </div>
    </div>
  );
}
