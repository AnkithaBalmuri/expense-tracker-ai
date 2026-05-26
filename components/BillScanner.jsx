"use client";

import { useMemo, useState } from "react";
import { createWorker } from "tesseract.js";
import { CATEGORIES } from "@/lib/constants";
import { parseOcrText } from "@/lib/helpers";

export default function BillScanner({ onApply }) {
  const [fileName, setFileName] = useState("");
  const [progress, setProgress] = useState(0);
  const [scanning, setScanning] = useState(false);
  const [extracted, setExtracted] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [error, setError] = useState("");

  const progressLabel = useMemo(() => `${Math.round(progress * 100)}%`, [progress]);

  async function scanFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setError("Please upload a JPG or PNG bill image. PDF images are not supported by browser OCR directly.");
      return;
    }

    setFileName(file.name);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
    setError("");
    setScanning(true);
    setProgress(0);
    setExtracted(null);

    const worker = await createWorker("eng", 1, {
      logger: (message) => {
        if (message.status === "recognizing text") setProgress(message.progress || 0);
      }
    });

    try {
      await worker.setParameters({
        preserve_interword_spaces: "1",
        tessedit_pageseg_mode: "6"
      });
      const result = await worker.recognize(file);
      const parsed = parseOcrText(result.data.text || "");
      parsed.confidence = Math.round(result.data.confidence || 0);
      setExtracted(parsed);
    } catch (scanError) {
      setError(scanError.message || "OCR could not read this image.");
    } finally {
      await worker.terminate();
      setScanning(false);
    }
  }

  function updateExtracted(field, value) {
    setExtracted((current) => {
      if (field !== "rawText") return { ...current, [field]: value };
      const reparsed = parseOcrText(value);
      return {
        ...current,
        ...reparsed,
        rawText: value,
        confidence: current.confidence
      };
    });
  }

  async function copyExactText() {
    if (!extracted?.rawText) return;
    await navigator.clipboard.writeText(extracted.rawText);
  }

  return (
    <section className="card p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="panel-title">Bill scanner</h2>
        {scanning ? <span className="chip">{progressLabel}</span> : null}
      </div>

      <label className="mt-3 flex cursor-pointer items-center justify-between gap-3 rounded-lg border-2 border-dashed border-[#9baa7a] bg-white p-4 text-sm font-black text-[#34451e]">
        <span className="truncate">{fileName || "Choose JPG or PNG bill image"}</span>
        <span className="rounded-full bg-[#edf3e3] px-3 py-1 text-xs">Browse</span>
        <input className="sr-only" type="file" accept="image/png,image/jpeg" onChange={scanFile} />
      </label>

      {scanning ? (
        <div className="mt-4">
          <div className="h-3 overflow-hidden rounded-full border border-[#c7d2b6] bg-white">
            <div className="h-full bg-[#556b2f]" style={{ width: progressLabel }} />
          </div>
        </div>
      ) : null}

      {error ? <div className="mt-4 rounded-lg border border-red-300 bg-red-50 p-3 font-bold text-red-800">{error}</div> : null}

      {previewUrl ? (
        <div className="mt-3 overflow-hidden rounded-lg border border-[#c7d2b6] bg-white">
          <img className="max-h-52 w-full object-contain" src={previewUrl} alt="Uploaded bill preview" />
        </div>
      ) : null}

      {extracted ? (
        <div className="mt-4 grid gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-[#c7d2b6] bg-[#f7f9f2] p-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.12em] text-[#556b2f]">Exact OCR output</p>
              <p className="mt-1 text-sm font-bold text-[#647052]">
                {extracted.lines?.length || 0} readable lines
                {Number.isFinite(extracted.confidence) ? ` | ${extracted.confidence}% confidence` : ""}
              </p>
            </div>
            <button className="btn btn-outline px-4 py-2 text-xs" type="button" onClick={copyExactText}>
              Copy Text
            </button>
          </div>

          <label className="grid gap-1.5 label">
            Raw scanned text
            <textarea
              className="field min-h-40 resize-y font-mono text-sm leading-6"
              value={extracted.rawText}
              onChange={(event) => updateExtracted("rawText", event.target.value)}
              spellCheck="false"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1.5 label">
              Merchant / Title
              <input className="field" value={extracted.title} onChange={(event) => updateExtracted("title", event.target.value)} />
            </label>
            <label className="grid gap-1.5 label">
              Amount
              <input
                className="field"
                type="number"
                min="0"
                step="0.01"
                value={extracted.amount}
                onChange={(event) => updateExtracted("amount", event.target.value)}
              />
            </label>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="grid gap-1.5 label">
              Date
              <input className="field" type="date" value={extracted.date} onChange={(event) => updateExtracted("date", event.target.value)} />
            </label>
            <label className="grid gap-1.5 label">
              Category
              <select className="field" value={extracted.category} onChange={(event) => updateExtracted("category", event.target.value)}>
                {CATEGORIES.map((category) => (
                  <option key={category}>{category}</option>
                ))}
              </select>
            </label>
          </div>
          <button className="btn btn-primary" type="button" onClick={() => onApply(extracted)}>
            Use Parsed Fields
          </button>
        </div>
      ) : null}
    </section>
  );
}
