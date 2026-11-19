"use client";

import type { HelmetHistoryRecord } from "@/lib/types";
import { telemetryToCsv } from "@/lib/format";

interface ExportCsvButtonProps {
  records: HelmetHistoryRecord[];
  onNotify: (message: string) => void;
}

export function ExportCsvButton({ records, onNotify }: ExportCsvButtonProps) {
  function exportCsv() {
    if (records.length === 0) {
      onNotify("There are no telemetry records to export yet.");
      return;
    }

    const blob = new Blob([telemetryToCsv(records)], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "mining-helmet-history.csv";
    link.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <button
      className="btn flex items-center gap-2"
      type="button"
      onClick={exportCsv}
    >
      Export CSV
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <path d="M14 2v6h6" />
        <path d="M8 13h8M8 17h8M10 11v8M14 11v8" />
      </svg>
    </button>
  );
}
