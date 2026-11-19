import type { FirebaseTimestamp, HelmetHistoryRecord } from "@/lib/types";

export function timestampToDate(
  value: FirebaseTimestamp | undefined,
): Date | null {
  if (typeof value !== "number" || !Number.isFinite(value) || value <= 0)
    return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function formatTimestamp(value: FirebaseTimestamp | undefined): string {
  const date = timestampToDate(value);
  return date
    ? date.toLocaleString([], {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "Timestamp unavailable";
}

export function formatLastUpdate(
  value: FirebaseTimestamp | undefined,
  now = Date.now(),
): string {
  const date = timestampToDate(value);
  if (!date) return "No valid timestamp";
  const ageSeconds = Math.max(0, Math.round((now - date.getTime()) / 1000));
  return `${formatTimestamp(value)} · ${ageSeconds}s ago`;
}

export function telemetryToCsv(records: HelmetHistoryRecord[]): string {
  const rows: unknown[][] = [
    [
      "time",
      "gas_adc",
      "temperature_c",
      "humidity_percent",
      "gps_fix",
      "latitude",
      "longitude",
      "status",
    ],
    ...records.map((record) => [
      formatTimestamp(record.device?.lastUpdate),
      record.sensors?.gas ?? "",
      record.sensors?.temperatureValid === false
        ? ""
        : (record.sensors?.temperature ?? ""),
      record.sensors?.humidityValid === false
        ? ""
        : (record.sensors?.humidity ?? ""),
      record.gps?.gpsFix ? "true" : "false",
      record.gps?.latitude ?? "",
      record.gps?.longitude ?? "",
      record.alerts?.status ?? "",
    ]),
  ];

  return rows
    .map((row) =>
      row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(","),
    )
    .join("\r\n");
}
