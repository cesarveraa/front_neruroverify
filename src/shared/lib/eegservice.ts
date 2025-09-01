// src/shared/lib/eegService.ts
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
  label: "fake" | "real";
  score: number; // 0..1
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

export async function computeEegFeatures(payload: {
  sample_rate: number;
  channels: Record<string, number[]>;
}) {
  const { data } = await api.post<EegFeaturesResp>("/eeg/features", payload);
  return data;
}
