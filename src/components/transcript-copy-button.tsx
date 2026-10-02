"use client";

import { useState } from "react";

export function TranscriptCopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);

  async function copyTranscript() {
    setCopied(false);
    setError(false);

    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard access is unavailable.");
      }
      await navigator.clipboard.writeText(text);
      setCopied(true);
    } catch {
      setError(true);
    }
  }

  return (
    <div className="transcript-copy-control">
      <button type="button" className="secondary-action" onClick={copyTranscript}>
        {copied ? "Copied" : "Copy transcript"}
      </button>
      {error ? <p className="form-message error" role="alert">Clipboard access failed. Select and copy the transcript text.</p> : null}
    </div>
  );
}