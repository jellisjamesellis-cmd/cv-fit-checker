import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";

function scoreColor(score: number): string {
  if (score >= 75) return "text-emerald-700";
  if (score >= 50) return "text-amber-700";
  return "text-rose-700";
}

export default async function HistoryPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const analyses = await prisma.analysis.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <header className="mb-8 space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          History
        </h1>
        <p className="text-base text-slate-600">
          Past CV fit checks for your account. Full CV text is not stored — only
          the score and advice.
        </p>
      </header>

      {analyses.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-6 text-sm text-slate-600 shadow-sm">
          No analyses yet.{" "}
          <Link href="/" className="font-medium text-slate-900 underline">
            Run your first check
          </Link>
          .
        </div>
      ) : (
        <ul className="space-y-3">
          {analyses.map((item) => (
            <li key={item.id}>
              <Link
                href={`/history/${item.id}`}
                className="block rounded-lg border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 space-y-1">
                    <p className="truncate font-medium text-slate-900">
                      {item.jobTitlePreview}
                    </p>
                    <p className="text-xs text-slate-500">
                      {item.cvFileName} ·{" "}
                      {item.createdAt.toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                    <p className="line-clamp-2 text-sm text-slate-600">
                      {item.verdict}
                    </p>
                  </div>
                  <p
                    className={`shrink-0 text-2xl font-semibold ${scoreColor(item.score)}`}
                  >
                    {item.score}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
