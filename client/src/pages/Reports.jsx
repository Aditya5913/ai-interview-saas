import { useEffect, useState } from "react";
import api from "../services/api";

export default function Reports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const res = await api.get("/interview");
      setReports(res.data.interviewReports || []);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white p-8">
      {" "}
      <h1 className="text-3xl font-bold mb-6">My Reports 📊</h1>
      {loading ? (
        <p>Loading...</p>
      ) : reports.length === 0 ? (
        <p>No Reports Found</p>
      ) : (
        <div className="grid gap-4">
          {reports.map((report) => (
            <div
              key={report._id}
              className="bg-gray-900 p-5 rounded-xl border border-gray-700"
            >
              <h2 className="text-xl font-bold">
                {report.title || "Interview Report"}
              </h2>

              <p className="text-green-400 mt-2">
                Match Score: {report.matchScore}%
              </p>

              <p className="text-gray-400 text-sm mt-2">
                {new Date(report.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
