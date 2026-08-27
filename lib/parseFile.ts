import mammoth from "mammoth";

export class ScannedPdfError extends Error {
  constructor(
    message = "This PDF appears to be scanned or image-based and contains no extractable text. Please upload a text-based PDF or a .docx file."
  ) {
    super(message);
    this.name = "ScannedPdfError";
  }
}

export class UnsupportedFileError extends Error {
  constructor(
    message = "Unsupported file type. Please upload a .pdf or .docx file."
  ) {
    super(message);
    this.name = "UnsupportedFileError";
  }
}

export class FileTooLargeError extends Error {
  constructor(
    message = "CV file is too large. Please upload a file under 5 MB."
  ) {
    super(message);
    this.name = "FileTooLargeError";
  }
}

/** Max CV upload size (5 MB). Checked before buffering into memory. */
export const MAX_CV_BYTES = 5 * 1024 * 1024;

function getExtension(filename: string): string {
  const parts = filename.toLowerCase().split(".");
  return parts.length > 1 ? parts[parts.length - 1] : "";
}

async function extractPdfText(buffer: Buffer): Promise<string> {
  // unpdf ships a serverless PDF.js build that does not require browser DOM
  // APIs (DOMMatrix, canvas, etc.) — required for Vercel Node serverless.
  const { extractText, getDocumentProxy } = await import("unpdf");
  const pdf = await getDocumentProxy(new Uint8Array(buffer));
  const { text } = await extractText(pdf, { mergePages: true });
  const normalized = (Array.isArray(text) ? text.join("\n") : String(text || ""))
    .trim();

  if (!normalized) {
    throw new ScannedPdfError();
  }

  return normalized;
}

async function extractDocxText(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  const text = (result.value || "").trim();

  if (!text) {
    throw new Error(
      "Could not extract any text from this Word document. Please check the file and try again."
    );
  }

  return text;
}

export async function parseFile(file: File): Promise<string> {
  if (file.size > MAX_CV_BYTES) {
    throw new FileTooLargeError();
  }

  const extension = getExtension(file.name);
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  if (extension === "pdf") {
    return extractPdfText(buffer);
  }

  if (extension === "docx") {
    return extractDocxText(buffer);
  }

  throw new UnsupportedFileError();
}
