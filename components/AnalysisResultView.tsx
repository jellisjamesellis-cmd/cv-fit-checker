import type { AnalysisResult } from "@/lib/analysis";

function ResultList({
  title,
  items,
  emptyLabel,
}: {
  title: string;
  items: string[];
  emptyLabel: string;
}) {
  return (
    <section className="space-y-2">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </h3>
      {items.length === 0 ? (
        <p className="text-sm text-slate-500">{emptyLabel}</p>
      ) : (
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-800">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      )}
    </section>
  );
}

function scoreColor(score: number): string {
  if (score >= 75) return "text-emerald-700";
  if (score >= 50) return "text-amber-700";
  return "text-rose-700";
}

export function AnalysisResultView({ result }: { result: AnalysisResult }) {
  return (
    <div className="space-y-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <div className="space-y-1">
        <p className={`text-4xl font-semibold ${scoreColor(result.score)}`}>
          {result.score}
          <span className="text-lg font-normal text-slate-500"> / 100</span>
        </p>
        <p className="text-base text-slate-800">{result.verdict}</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <ResultList
          title="Strengths"
          items={result.strengths}
          emptyLabel="No strengths identified."
        />
        <ResultList
          title="Gaps"
          items={result.gaps}
          emptyLabel="No gaps identified."
        />
        <ResultList
          title="Missing keywords"
          items={result.missingKeywords}
          emptyLabel="No missing keywords."
        />
        <ResultList
          title="Tailoring tips"
          items={result.tailoringTips}
          emptyLabel="No tips available."
        />
      </div>
    </div>
  );
}
