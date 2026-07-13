/**
 * Keep generated UPSC statements readable even when an older database row
 * contains inline markers such as "1) ... 2) ...".
 */
export function formatQuestionText(text: string | null | undefined): string {
  if (!text) return "";

  return text
    .replace(/\r\n?/g, "\n")
    .replace(/[ \t]+(?=(?:[1-4])[.)](?!\d))/g, "\n")
    .replace(/(^|\n)(\s*[1-4][.)])(?=\S)/g, "$1$2 ")
    .replace(/[ \t]+(?=(?:Assertion \(A\)|Reason \(R\))\s*:)/gi, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
