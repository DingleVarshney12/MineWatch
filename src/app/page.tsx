"use client";

import { useEffect, useState } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { HistoryTable } from "@/components/dashboard/history-table";
import { LocationCard } from "@/components/dashboard/location-card";
import { MetricCard } from "@/components/dashboard/metric-card";
import { SafetyControls } from "@/components/dashboard/safety-controls";
import { TelemetryChart } from "@/components/dashboard/telemetry-chart";
import { Toast } from "@/components/ui/toast";
import { useDashboardData } from "@/lib/firebase/use-dashboard-data";
import { formatLastUpdate, timestampToDate } from "@/lib/format";

const degreeC = "\u00b0C";
const middleDot = "\u00b7";

const DropLets = () =>{
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-droplets preview-icon"><path d="M7 16.3c2.2 0 4-1.83 4-4.05 0-1.16-.57-2.26-1.71-3.19S7.29 6.75 7 5.3c-.29 1.45-1.14 2.84-2.29 3.76S3 11.1 3 12.25c0 2.22 1.8 4.05 4 4.05z"/><path d="M12.56 6.6A10.97 10.97 0 0 0 14 3.02c.5 2.5 2 4.9 4 6.5s3 3.5 3 5.5a6.98 6.98 0 0 1-11.91 4.97"/></svg>
}
const HeatWaves = ()=>{
  return <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-waves-vertical preview-icon"><path d="M12 2q2 2.5 0 5t0 5 0 5 0 5"/><path d="M19 2q2 2.5 0 5t0 5 0 5 0 5"/><path d="M5 2q2 2.5 0 5t0 5 0 5 0 5"/></svg>;
}
const GasSensor = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="preview-icon"
  >
    <path d="M12 22a8 8 0 0 0 8-8c0-3-2-5-4-7-1.5-1.5-2-3-2-5-4 3-7 7-7 11a5 5 0 0 0 5 9Z" />
    <path d="M10 18a3 3 0 0 0 3-3c0-1-.5-2-1.5-3" />
    <path d="M4 8 2 7" />
    <path d="M5 4 4 2" />
  </svg>
);
const SatelliteIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="preview-icon"
  >
    <path d="m13.5 6.5 4 4" />
    <path d="m16 4 4 4" />
    <path d="m8 16-4 4" />
    <path d="m4 16 4 4" />
    <path d="m14 10 4-4" />
    <path d="m10 14-4 4" />
    <rect x="9" y="9" width="6" height="6" rx="1.5" transform="rotate(45 12 12)" />
    <path d="M19 3a2 2 0 0 1 2 2" />
    <path d="M3 21a2 2 0 0 1 2-2" />
  </svg>
);
function numberOrNull(value: number | undefined): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function fixed(value: number | null, digits = 1): string {
  if (value === null) return "--";
  return digits === 0 ? String(Math.round(value)) : value.toFixed(digits);
}

function percent(value: number | null, maximum: number): number {
  if (value === null) return 0;
  return Math.max(0, Math.min(100, (value / maximum) * 100));
}

export default function Home() {
  const dashboard = useDashboardData();
  const [now, setNow] = useState<number | undefined>();

  useEffect(() => {
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const sensors = dashboard.live?.sensors;
  const gps = dashboard.live?.gps;
  const alerts = dashboard.live?.alerts;
  const gas = numberOrNull(sensors?.gas);
  const temperature =
    sensors?.temperatureValid === false
      ? null
      : numberOrNull(sensors?.temperature);
  const humidity =
    sensors?.humidityValid === false ? null : numberOrNull(sensors?.humidity);
  const satellites = numberOrNull(gps?.satellites);
  const gasAlert = gas !== null && gas > 400;
  const highTempAlert = temperature !== null && temperature > 35;
  const lastUpdate = timestampToDate(dashboard.live?.device?.lastUpdate);
  const helmetStatus = !dashboard.live
    ? "unknown"
    : dashboard.live.device?.online === true &&
        lastUpdate &&
        now !== undefined &&
        now - lastUpdate.getTime() < 20_000
      ? "online"
      : "offline";
  const lastUpdated =
    dashboard.live && lastUpdate && now !== undefined
      ? formatLastUpdate(dashboard.live?.device?.lastUpdate, now)
      : dashboard.live
        ? "No valid timestamp"
        : "Waiting for device data";

  return (
    <>
      <DashboardShell
        email={
          dashboard.user?.email ??
          (dashboard.authLoading ? "Authenticated" : "Signed out")
        }
        firebaseStatus={dashboard.firebaseStatus}
        helmetStatus={helmetStatus}
        lastUpdated={lastUpdated}
        onSignOut={() => void dashboard.logout()}
      >
        <div className="dashboard-stack" id="overview">
          <section className="page-heading">
            <div>
              <div className="eyebrow">Operations / Live monitoring</div>
              <h1>Helmet overview</h1>
              
            </div>
            <div className="sync-note">
              LAST UPDATE
              <br />
              <span>{lastUpdated}</span>
            </div>
          </section>

          <section className="grid metrics" aria-label="Live helmet readings">
            <MetricCard
              title="GAS SENSOR"
              value={fixed(gas, 0)}
              unit="ADC"
              note={
                gas === null
                  ? dashboard.live
                    ? "No sensor data"
                    : "Waiting for reading"
                  : gas > 400
                    ? "Above configured threshold"
                    : "Within configured threshold"
              }
              icon={GasSensor()}
              dotClass={dashboard.live ? (gasAlert ? "red" : "green") : ""}
              meterWidth={percent(gas, 1023)}
              meterColor={gasAlert ? "var(--red)" : "var(--green)"}
            />
            <MetricCard
              title="TEMPERATURE"
              value={fixed(temperature)}
              unit={degreeC}
              note={
                temperature === null
                  ? dashboard.live
                    ? "DHT11 reading invalid"
                    : `DHT11 ${middleDot} waiting`
                  : temperature > 35
                    ? "Above configured threshold"
                    : "DHT11 reading"
              }
              icon={HeatWaves()}
              dotClass={dashboard.live ? (highTempAlert ? "red" : "green") : ""}
              meterWidth={percent(temperature, 60)}
              meterColor={highTempAlert ? "var(--red)" : "var(--blue)"}
            />
            <MetricCard
              title="HUMIDITY"
              value={fixed(humidity)}
              unit="%"
              note={
                humidity === null
                  ? dashboard.live
                    ? "DHT11 reading invalid"
                    : `DHT11 ${middleDot} waiting`
                  : "DHT11 relative humidity"
              }
              icon={DropLets()}
              dotClass={dashboard.live ? "green" : ""}
              meterWidth={percent(humidity, 100)}
              meterColor="var(--green)"
            />
            <MetricCard
              title="GPS SATELLITES"
              value={fixed(satellites, 0)}
              unit="SAT"
              note={
                gps?.gpsFix
                  ? "Valid position received"
                  : dashboard.live
                    ? "Waiting for valid GPS fix"
                    : "Waiting for GPS fix"
              }
              icon={SatelliteIcon()}
              dotClass={gps?.gpsFix ? "green" : ""}
              meterWidth={gps?.gpsFix ? percent(satellites, 12) : 0}
              meterColor="var(--green)"
            />
          </section>

          <section
            className="grid main-grid"
            aria-label="Location and safety controls"
          >
            <LocationCard gps={gps} history={dashboard.history} />
            <SafetyControls
              alerts={alerts}
              hasTelemetry={dashboard.live !== null}
              buzzerOn={dashboard.buzzerOn}
              buzzerBusy={dashboard.buzzerBusy}
              buzzerAvailable={dashboard.buzzerAvailable}
              buzzerError={dashboard.buzzerError}
              onToggleBuzzer={() =>
                void dashboard.setDashboardBuzzer(!dashboard.buzzerOn)
              }
            />
          </section>

          <section
            className="grid charts"
            id="telemetry"
            aria-label="Sensor history charts"
          >
            <TelemetryChart
              title="Gas level"
              metric="gas"
              unit={`Raw ADC ${middleDot} 0-1023`}
              records={dashboard.history}
              color="#f7bd55"
            />
            <TelemetryChart
              title="Temperature"
              metric="temperature"
              unit="Degrees Celsius"
              records={dashboard.history}
              color="#69a9ff"
            />
            <TelemetryChart
              title="Humidity"
              metric="humidity"
              unit={`Relative humidity ${middleDot} %`}
              records={dashboard.history}
              color="#49d69a"
            />
          </section>

          <HistoryTable
            records={dashboard.history}
            loaded={dashboard.historyLoaded}
            onNotify={dashboard.setNotice}
          />
        </div>
      </DashboardShell>
      {!dashboard.user && (
        <LoginForm error={dashboard.loginError} onSubmit={dashboard.login} />
      )}
      <Toast message={dashboard.notice} onDismiss={dashboard.clearNotice} />
    </>
  );
}
