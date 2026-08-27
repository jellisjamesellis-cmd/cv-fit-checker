"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import type { AnalysisResult } from "@/lib/analysis";
import { AnalysisResultView } from "@/components/AnalysisResultView";

type AnalyzeResponse = AnalysisResult & { id?: string };

export default function HomePage() {
  const [jobDescription, setJobDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalyzeResponse | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setResult(null);

    if (!jobDescription.trim()) {
      setError("Please paste a job description.");
      return;
    }

    if (!file) {
      setError("Please upload a CV (.pdf or .docx).");
      return;
    }

    const formData = new FormData();
    formData.append("jobDescription", jobDescription);
    formData.append("cv", file);

    setLoading(true);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong while analyzing your CV.");
        return;
      }

      setResult(data as AnalyzeResponse);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-10 sm:px-6">
      <header className="mb-8 space-y-2">
        <p className="text-sm font-medium text-slate-500">CV Fit Checker</p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Match your CV to a job description
        </h1>
        <p className="max-w-2xl text-base text-slate-600">
          Paste a job description, upload your CV as PDF or Word, and get a
          match score plus concrete tailoring advice. Results are saved to your
          history when you&apos;re signed in.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-lg border border-slate-200 bg-white p-6 shadow-sm"
      >
        <div className="space-y-2">
          <label
            htmlFor="jobDescription"
            className="block text-sm font-medium text-slate-700"
          >
            Job description
          </label>
          <textarea
            id="jobDescription"
            name="jobDescription"
            rows={10}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the full job description here..."
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-slate-400 placeholder:text-slate-400 focus:border-slate-500 focus:ring-2"
            disabled={loading}
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="cv"
            className="block text-sm font-medium text-slate-700"
          >
            CV file (.pdf or .docx)
          </label>
          <input
            id="cv"
            name="cv"
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            className="block w-full text-sm text-slate-700 file:mr-4 file:rounded-md file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-slate-800"
            disabled={loading}
          />
          {file ? (
            <p className="text-xs text-slate-500">Selected: {file.name}</p>
          ) : null}
        </div>

        {error ? (
          <div
            id="form-error"
            role="alert"
            className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-800"
          >
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {loading ? "Analyzing…" : "Check fit"}
        </button>
      </form>

      {result ? (
        <div className="mt-8 space-y-4">
          <AnalysisResultView result={result} />
          {result.id ? (
            <p className="text-sm text-slate-600">
              Saved to{" "}
              <Link
                href={`/history/${result.id}`}
                className="font-medium text-slate-900 underline"
              >
                your history
              </Link>
              .
            </p>
          ) : null}
        </div>
      ) : null}
    </main>
  );
}
