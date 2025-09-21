import crypto from "node:crypto";

const LINE_COL_REGEX = /:\d+:\d+\)?$/;
const LINE_REGEX = /:\d+\)?$/;
const FINGERPRINT_LENGTH = 12;

export function generateFingerprint(
  message: string,
  stack?: string,
  projectId?: string
) {
  // Extract function name and file from stack trace, ignoring line/column numbers
  let stackSignature = "";
  if (stack) {
    const firstLine = stack.split("\n")[1] || stack.split("\n")[0]; // Get first "at" line or fallback
    // Remove line:column numbers to make fingerprint stable
    stackSignature = firstLine
      .replace(LINE_COL_REGEX, "")
      .replace(LINE_REGEX, "");
  }

  const basis = `${projectId ?? ""}:${message}:${stackSignature}`;
  return crypto
    .createHash("sha1")
    .update(basis)
    .digest("hex")
    .slice(0, FINGERPRINT_LENGTH);
}
