"use client";
import axios from "axios";

const BASE =
  process.env.NEXT_PUBLIC_EEG_API_URL?.replace(/\/+$/, "") || "/eeg-api";

export type GenerateNewsResp = {
  noticia: string;
  model_used: string;
};

export type ClassifyMode = "llm" | "vectorized";
export type ClassifyResp = {
  label: "fake" | "real"; // OJO: en mode=vectorized tu backend puede devolver "0"/"1". Usa llm aquí.
  score: number;          // 0..1
  mode: ClassifyMode;
  extra?: Record<string, unknown>;
};

export type EegFeaturesResp = {
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
  withCredentials: false,
});

// --- NLP ---
export async function generateNews(model_name?: string) {
  const { data } = await api.post<GenerateNewsResp>("/nlp/generar_noticia", {
    ...(model_name ? { model_name } : {}),
  });
  return data;
}

export async function classifyNews(text: string, mode: ClassifyMode) {
  const { data } = await api.post<ClassifyResp>("/nlp/clasificar_noticia", {
    text,
    mode,
  });
  return data;
}

// --- EEG ---
export async function computeEegFeatures(payload: {
  sample_rate: number;
  channels: Record<string, number[]>;
  session_id?: string; // opcional: si lo envías, el servidor cachea
}) {
  const { session_id, ...rest } = payload;
  const { data } = await api.post<EegFeaturesResp>("/eeg/features", rest, {
    params: session_id ? { session_id } : undefined,
  });
  return data;
}

export async function getLatest(session_id: string) {
  const { data } = await api.get<EegFeaturesResp>("/eeg/latest", {
    params: { session_id },
  });
  return data;
}

export async function getHistory(session_id: string, limit = 200) {
  const { data } = await api.get<EegFeaturesResp[]>("/eeg/history", {
    params: { session_id, limit },
  });
  return data;
}
