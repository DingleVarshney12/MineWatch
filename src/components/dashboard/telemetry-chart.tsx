"use client";

import { useEffect, useRef } from "react";
import {
  CategoryScale,
  Chart,
  Legend,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from "chart.js";
import type { HelmetHistoryRecord, TelemetryMetric } from "@/lib/types";
import { timestampToDate } from "@/lib/format";

Chart.register(
  CategoryScale,
  Legend,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
);

interface TelemetryChartProps {
  title: string;
  metric: TelemetryMetric;
  unit: string;
  records: HelmetHistoryRecord[];
  color: string;
}

function chartValue(
  record: HelmetHistoryRecord,
  metric: TelemetryMetric,
): number | null {
  const sensors = record.sensors;
  if (!sensors) return null;
  if (metric === "gas")
    return Number.isFinite(Number(sensors.gas)) ? Number(sensors.gas) : null;
  if (metric === "temperature") {
    return sensors.temperatureValid === false ||
      !Number.isFinite(Number(sensors.temperature))
      ? null
      : Number(sensors.temperature);
  }
  return sensors.humidityValid === false ||
    !Number.isFinite(Number(sensors.humidity))
    ? null
    : Number(sensors.humidity);
}

function chartLabel(record: HelmetHistoryRecord): string {
  const date = timestampToDate(record.device?.lastUpdate);
  return date
    ? date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "-";
}

export function TelemetryChart({
  title,
  metric,
  unit,
  records,
  color,
}: TelemetryChartProps) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const chart = useRef<Chart<"line", (number | null)[], string> | null>(null);

  useEffect(() => {
    if (!canvas.current) return;
    chart.current = new Chart<"line", (number | null)[], string>(
      canvas.current,
      {
        type: "line",
        data: {
          labels: [],
          datasets: [
            {
              label: title,
              data: [],
              borderColor: color,
              backgroundColor: color,
              fill: false,
              tension: 0.32,
              borderWidth: 2,
              pointRadius: 1.5,
              pointHoverRadius: 4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: false,
          plugins: {
            legend: { display: false },
            tooltip: { mode: "index", intersect: false },
          },
          interaction: { mode: "index", intersect: false },
          scales: {
            x: {
              ticks: { color: "#8294aa", maxTicksLimit: 5, font: { size: 9 } },
              grid: { color: "rgba(143,161,184,.08)" },
              border: { display: false },
            },
            y: {
              ticks: { color: "#8294aa", maxTicksLimit: 5, font: { size: 9 } },
              grid: { color: "rgba(143,161,184,.08)" },
              border: { display: false },
            },
          },
        },
      },
    );
    return () => {
      chart.current?.destroy();
      chart.current = null;
    };
  }, [color, title]);

  useEffect(() => {
    if (!chart.current) return;
    chart.current.data.labels = records.map(chartLabel);
    chart.current.data.datasets[0].data = records.map((record) =>
      chartValue(record, metric),
    );
    chart.current.update("none");
  }, [records, metric]);

  const chartId =
    metric === "gas"
      ? "gasChart"
      : metric === "temperature"
        ? "tempChart"
        : "humidityChart";

  return (
    <article
      className="panel chart-panel"
      aria-label={`${title} history chart`}
    >
      <div className="chart-top">
        <div>
          <div className="chart-title">{title}</div>
          <div className="chart-unit">{unit}</div>
        </div>
        <span className="state">LIVE HISTORY</span>
      </div>
      <div className="chart-box">
        <canvas
          id={chartId}
          ref={canvas}
          aria-label={`${title} history`}
          role="img"
        />
      </div>
    </article>
  );
}
