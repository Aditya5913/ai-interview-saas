import ScoreBar from "./ScoreBar";

export default function ReportCard({ report }) {
  const score = report?.matchScore ?? report?.score ?? 0;

  return (
    <div className="space-y-5">
      {/* SCORE HEADER */}
      <div className="bg-gray-900 p-6 rounded-xl border border-gray-800">
        <h2 className="text-2xl font-bold">
          Match Score: <span className="text-green-400">{score}/100</span>
        </h2>

        <div className="mt-4">
          <ScoreBar score={score} />
        </div>
      </div>

      {/* SKILL GAPS */}
      {report.skillGaps?.length > 0 && (
        <div className="bg-gray-900 p-5 rounded-xl border border-red-500">
          <h3 className="text-red-400 font-bold mb-3">Skill Gaps</h3>

          <div className="flex flex-wrap gap-2">
            {report.skillGaps.map((s, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-gray-800 rounded-full text-sm"
              >
                {s.skill} ({s.severity})
              </span>
            ))}
          </div>
        </div>
      )}

      {/* QUESTIONS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* TECH */}
        {report.technicalQuestions?.length > 0 && (
          <div className="bg-gray-900 p-5 rounded-xl border border-blue-500">
            <h3 className="text-blue-400 font-bold mb-3">
              Technical Questions
            </h3>

            <div className="space-y-3">
              {report.technicalQuestions.slice(0, 3).map((q, i) => (
                <div key={i} className="bg-gray-800 p-3 rounded">
                  <p className="font-semibold">Q: {q.question}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BEHAVIORAL */}
        {report.behavioralQuestions?.length > 0 && (
          <div className="bg-gray-900 p-5 rounded-xl border border-purple-500">
            <h3 className="text-purple-400 font-bold mb-3">
              Behavioral Questions
            </h3>

            <div className="space-y-3">
              {report.behavioralQuestions.slice(0, 3).map((q, i) => (
                <div key={i} className="bg-gray-800 p-3 rounded">
                  <p className="font-semibold">Q: {q.question}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ROADMAP */}
      {report.preparationPlan?.length > 0 && (
        <div className="bg-gray-900 p-5 rounded-xl border border-cyan-500">
          <h3 className="text-cyan-400 font-bold mb-3">Preparation Roadmap</h3>

          {report.preparationPlan.map((d, i) => (
            <div key={i} className="mb-3 bg-gray-800 p-3 rounded">
              <p className="font-bold">
                Day {d.day}: {d.focus}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
