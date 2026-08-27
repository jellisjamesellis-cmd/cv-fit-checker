import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";
import {
  parseFile,
  ScannedPdfError,
  UnsupportedFileError,
} from "@/lib/parseFile";

export const runtime = "nodejs";

type AnalysisResult = {
  score: number;
  verdict: string;
  strengths: string[];
  gaps: string[];
  missingKeywords: string[];
  tailoringTips: string[];
};

const SYSTEM_PROMPT = `You are an expert CV / resume reviewer and career coach.
Compare a candidate's CV against a job description and return ONLY valid JSON (no markdown, no commentary) matching this exact shape:
{
  "score": <number 0-100>,
  "verdict": "<one-line summary of fit>",
  "strengths": ["..."],
  "gaps": ["..."],
  "missingKeywords": ["..."],
  "tailoringTips": ["..."]
}

Rules:
- score is an integer from 0 to 100 reflecting how well the CV matches the role.
- verdict is a single concise sentence.
- strengths: concrete matches between the CV and the JD (3–6 items).
- gaps: experience, skills, or qualifications the JD wants that the CV lacks or underplays (2–6 items).
- missingKeywords: important JD terms/phrases absent from the CV (up to 10).
- tailoringTips: specific, actionable edits the candidate can make to improve fit (3–6 items).
- Do not invent experience that is not in the CV. Base the analysis only on the provided texts.`;

function extractJson(text: string): AnalysisResult {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  const candidate = fenced ? fenced[1].trim() : trimmed;
  const parsed = JSON.parse(candidate) as AnalysisResult;

  if (
    typeof parsed.score !== "number" ||
    typeof parsed.verdict !== "string" ||
    !Array.isArray(parsed.strengths) ||
    !Array.isArray(parsed.gaps) ||
    !Array.isArray(parsed.missingKeywords) ||
    !Array.isArray(parsed.tailoringTips)
  ) {
    throw new Error("Model returned JSON in an unexpected shape.");
  }

  return {
    score: Math.max(0, Math.min(100, Math.round(parsed.score))),
    verdict: parsed.verdict,
    strengths: parsed.strengths.map(String),
    gaps: parsed.gaps.map(String),
    missingKeywords: parsed.missingKeywords.map(String),
    tailoringTips: parsed.tailoringTips.map(String),
  };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const jobDescription = String(formData.get("jobDescription") || "").trim();
    const file = formData.get("cv");

    if (!jobDescription) {
      return NextResponse.json(
        { error: "Please paste a job description." },
        { status: 400 }
      );
    }

    if (!(file instanceof File) || file.size === 0) {
      return NextResponse.json(
        { error: "Please upload a CV as a .pdf or .docx file." },
        { status: 400 }
      );
    }

    let cvText: string;
    try {
      cvText = await parseFile(file);
    } catch (parseError) {
      if (parseError instanceof ScannedPdfError) {
        return NextResponse.json({ error: parseError.message }, { status: 422 });
      }
      if (parseError instanceof UnsupportedFileError) {
        return NextResponse.json({ error: parseError.message }, { status: 400 });
      }
      const message =
        parseError instanceof Error
          ? parseError.message
          : "Failed to extract text from the uploaded file.";
      return NextResponse.json({ error: message }, { status: 422 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY is not configured on the server." },
        { status: 500 }
      );
    }

    const anthropic = new Anthropic({ apiKey });

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `JOB DESCRIPTION:\n${jobDescription}\n\n---\n\nCV TEXT:\n${cvText}`,
        },
      ],
    });

    const textBlock = message.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json(
        { error: "No text response received from the model." },
        { status: 502 }
      );
    }

    const result = extractJson(textBlock.text);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Analyze error:", error);
    const message =
      error instanceof Error ? error.message : "Unexpected server error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
