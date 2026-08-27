import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { AnalysisResultView } from "@/components/AnalysisResultView";

export default async function HistoryDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const item = await prisma.analysis.findFirst({
    where: { id: params.id, userId },
  });

  if (!item) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-6">
        <Link
          href="/history"
          className="text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          ← Back to history
        </Link>
      </div>

      <header className="mb-6 space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          {item.jobTitlePreview}
        </h1>
        <p className="text-sm text-slate-500">
          {item.cvFileName} ·{" "}
          {item.createdAt.toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
          })}
        </p>
      </header>

      <AnalysisResultView
        result={{
          score: item.score,
          verdict: item.verdict,
          strengths: item.strengths,
          gaps: item.gaps,
          missingKeywords: item.missingKeywords,
          tailoringTips: item.tailoringTips,
        }}
      />

      <details className="mt-6 rounded-lg border border-slate-200 bg-white p-4 text-sm shadow-sm">
        <summary className="cursor-pointer font-medium text-slate-800">
          Job description used
        </summary>
        <pre className="mt-3 whitespace-pre-wrap font-sans text-slate-700">
          {item.jobDescription}
        </pre>
      </details>
    </main>
  );
}
