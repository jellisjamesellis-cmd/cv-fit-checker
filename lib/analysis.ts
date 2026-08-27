export type AnalysisResult = {
  score: number;
  verdict: string;
  strengths: string[];
  gaps: string[];
  missingKeywords: string[];
  tailoringTips: string[];
};

export type SavedAnalysis = AnalysisResult & {
  id: string;
  cvFileName: string;
  jobTitlePreview: string;
  createdAt: string;
};

/** First non-empty line of the JD, truncated for list views. */
export function jobTitlePreviewFromJd(jobDescription: string, max = 120): string {
  const line =
    jobDescription
      .split(/\r?\n/)
      .map((l) => l.trim())
      .find((l) => l.length > 0) || "Untitled role";
  return line.length > max ? `${line.slice(0, max - 1)}…` : line;
}
