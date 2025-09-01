// src/spa/pages/evaluator/EvaluatorDashboard.tsx
"use client";

import React, { useEffect, useState } from "react";
import { getKPIs, listSessions } from "../../api/eeg";
import StatCard from "../../components/StatCard";
import { EEGLine } from "../../components/Charts";

type KPI = {
  avgAlphaSuppression: number;
  stressIndexDelta: number;
  sessionsToday: number;
};

type Session = {
  id: string;
  participantId: string;
  status: string;
  startedAt: string | number | Date;
};

export default function EvaluatorDashboard() {
  const [kpis, setKpis] = useState<KPI | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [demoEEG, setDemoEEG] = useState<{ t: number; v: number }[]>([]);

  useEffect(() => {
    (async () => {
      try {
        setKpis(await getKPIs());
        setSessions(await listSessions());
      } catch {
        // Fallback demo si algo falla
        setKpis({ avgAlphaSuppression: 0.12, stressIndexDelta: 0.08, sessionsToday: 0 });
        setSessions([]);
      }
      // Sparkline de ejemplo para el preview
      setDemoEEG(
        Array.from({ length: 256 }, (_, i) => ({
          t: i,
          v: Math.sin(i / 8) + (Math.random() - 0.5) * 0.2,
        }))
      );
    })();
  }, []);

  // Si no hay sesiones reales, mostramos ejemplos amigables
  const shownSessions: Session[] = sessions.length
    ? sessions
    : [
        { id: "demo1", participantId: "DemoUser1", status: "completed", startedAt: Date.now() - 60 * 60 * 1000 },
        { id: "demo2", participantId: "DemoUser2", status: "running", startedAt: Date.now() - 10 * 60 * 1000 },
      ];

  return (
    <main className="mx-auto max-w-7xl px-4 py-6 space-y-6">
      {/* KPIs */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Avg α Suppression"
          value={kpis ? (kpis.avgAlphaSuppression * 100).toFixed(1) + "%" : "—"}
          hint="After fake vs real stimuli"
        />
        <StatCard
          title="Stress Index Δ"
          value={kpis ? (kpis.stressIndexDelta * 100).toFixed(1) + "%" : "—"}
          hint="Pre vs post exposure"
        />
        <StatCard title="Sessions Today" value={kpis ? kpis.sessionsToday : "—"} />
      </section>

      {/* EEG Preview + Recent Sessions */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h2 className="mb-2 text-lg font-semibold">Live EEG Preview</h2>
          <EEGLine data={demoEEG} />
          {!sessions.length && (
            <p className="text-xs text-muted-foreground mt-2">
              No EEG history found for configured sessions. Showing a live-style demo sparkline.
            </p>
          )}
        </div>

        <div>
          <h2 className="mb-2 text-lg font-semibold">Recent Sessions</h2>
          <div className="rounded-2xl border bg-white dark:bg-card">
            <table className="w-full text-sm">
              <thead className="text-left text-gray-500 border-b">
                <tr>
                  <th className="p-3">Participant</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Started</th>
                </tr>
              </thead>
              <tbody>
                {shownSessions.map((s) => (
                  <tr key={s.id} className="border-b last:border-0">
                    <td className="p-3">{s.participantId}</td>
                    <td className="p-3">{s.status}</td>
                    <td className="p-3">{new Date(s.startedAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!sessions.length && (
              <div className="p-3 text-xs text-gray-400">
                No sessions yet. Showing demo examples. Configure{" "}
                <code>NEXT_PUBLIC_EEG_SESSIONS</code> o crea sesiones reales.
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
