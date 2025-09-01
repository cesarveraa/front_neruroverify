// src/spa/api/eeg.ts
"use client";
import axios from "axios";

const BASE = (process.env.NEXT_PUBLIC_EEG_API_URL || "").replace(/\/+$/, "");

type EegFeaturesResp = {
  sample_rate: number;
  n_samples: number;
  per_channel_relative_power: Record<
    string,
    { alpha: number; beta: number; delta: number; theta: number; gamma: number }
  >;
  metrics: {
    engagement?: number;
    alpha_asymmetry_F4_minus_F3?: number;
    [k: string]: number | undefined;
  };
};

const api = axios.create({
  baseURL: BASE,
  headers: { "Content-Type": "application/json" },
});

export async function getHistory(session_id: string, limit = 512): Promise<EegFeaturesResp[]> {
  const { data } = await api.get<EegFeaturesResp[]>("/eeg/history", { params: { session_id, limit } });
  return data;
}

/**
 * KPIs “operativos” derivados de /eeg/history:
 * - avgAlphaSuppression: 1 - mean(alpha_rel) promedio (0..1)
 * - stressIndexDelta: mean(beta_rel - alpha_rel) (proxy simple)
 * - sessionsToday: #sesiones configuradas (desde env)
 */
export async function getKPIs(sessionId?: string) {
  const sid = sessionId || (process.env.NEXT_PUBLIC_EEG_SESSIONS?.split(",")[0] || "demo1");
  try {
    const hist = await getHistory(sid, 400);
    if (!hist.length) throw new Error("no history");

    let alphaVals: number[] = [];
    let stressRatio: number[] = [];

    for (const point of hist) {
      const powers = point.per_channel_relative_power || {};
      const chans = Object.values(powers);
      if (!chans.length) continue;
      const alphaAvg = chans.reduce((a, c) => a + (c.alpha ?? 0), 0) / chans.length;
      const betaAvg  = chans.reduce((a, c) => a + (c.beta  ?? 0), 0) / chans.length;

      alphaVals.push(alphaAvg);
      stressRatio.push(betaAvg - alphaAvg);
    }

    const mean = (arr: number[]) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
    const avgAlphaSuppression = Math.max(0, Math.min(1, 1 - mean(alphaVals)));
    const stressIndexDelta    = Math.max(0, Math.min(1, mean(stressRatio)));
    const sessionsList = (process.env.NEXT_PUBLIC_EEG_SESSIONS || "demo1").split(",").filter(Boolean);
    const sessionsToday = sessionsList.length;

    return { avgAlphaSuppression, stressIndexDelta, sessionsToday };
  } catch {
    return { avgAlphaSuppression: 0.12, stressIndexDelta: 0.08, sessionsToday: 1 };
  }
}

/**
 * Lista de sesiones desde env (stub). Si luego expones /sessions en backend, cámbialo aquí.
 */
export async function listSessions(): Promise<Array<{ id: string; participantId: string; status: string; startedAt: string }>> {
  const ids = (process.env.NEXT_PUBLIC_EEG_SESSIONS || "demo1").split(",").filter(Boolean);
  const now = new Date().toISOString();
  return ids.map((id) => ({
    id,
    participantId: id.toUpperCase(),
    status: "active",
    startedAt: now,
  }));
}
