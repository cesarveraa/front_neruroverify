// src/spa/pages/lab/lab.tsx
"use client";

import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  generateNews,
  classifyNews,
  computeEegFeatures,
  type ClassifyMode,
  type EegFeaturesResp,
} from "../../../shared/lib/eegservice";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../shared/ui/card";
import { Button } from "../../../shared/ui/button";
import { Input } from "../../../shared/ui/input";
import { Textarea } from "../../../shared/ui/textarea";
import { Badge } from "../../../shared/ui/badge";
import { Label } from "../../../shared/ui/label";
import { toast } from "../../../shared/hooks/use-toast";

import {
  Brain,
  Newspaper,
  Sparkles,
  Wand2,
  Gauge,
  Activity,
  Play,
  Square,
  ArrowRight,
  Maximize2,
  X,
  ChevronRight,
} from "lucide-react";

import {
  LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, BarChart, Bar,
} from "recharts";

// ————————————————————————————————————
// Utils simulación EEG
// ————————————————————————————————————
function buildSine(n: number, freq: number, noiseAmp = 0.2) {
  const arr: number[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / n;
    const v = Math.sin(2 * Math.PI * freq * t) + (Math.random() - 0.5) * noiseAmp;
    arr.push(v);
  }
  return arr;
}

function simulateChannels(nSamples: number) {
  return {
    F3: buildSine(nSamples, 8, 0.35),  // ~alpha/θ
    F4: buildSine(nSamples, 14, 0.35), // ~beta baja
  };
}

// ————————————————————————————————————
// Componente principal
// ————————————————————————————————————
export const LabPage: React.FC = () => {
  // NLP — generar / clasificar
  const [model, setModel] = useState("DeepSeek-R1-0528");
  const [genLoading, setGenLoading] = useState(false);
  const [news, setNews] = useState<string>("");

  const [mode, setMode] = useState<ClassifyMode>("llm");
  const [clsLoading, setClsLoading] = useState(false);
  const [cls, setCls] = useState<{ label: "fake" | "real"; score: number } | null>(null);

  // EEG — streaming (sim)
  const [sr, setSr] = useState(256); // sample_rate
  const [nSamples, setNSamples] = useState(512);
  const [simOn, setSimOn] = useState(false);
  const simId = useRef<number | null>(null);

  const [engSeries, setEngSeries] = useState<{ x: number; engagement: number }[]>([]);
  const [bands, setBands] = useState<
    { channel: string; alpha: number; beta: number; delta: number; theta: number; gamma: number }[]
  >([]);
  const [lastMetrics, setLastMetrics] = useState<EegFeaturesResp["metrics"] | null>(null);

  const engagementLine = useMemo(() => engSeries.slice(-120), [engSeries]); // ~120 puntos visibles

  // ——— Focus Stimulus (pantalla completa)
  const [focusOpen, setFocusOpen] = useState(false);

  const openFocus = () => {
    if (!news.trim()) {
      toast({ variant: "destructive", title: "No hay noticia", description: "Genera o pega una noticia primero." });
      return;
    }
    setFocusOpen(true);
  };
  const closeFocus = () => setFocusOpen(false);

  const nextStimulus = async () => {
    try {
      setGenLoading(true);
      setCls(null);
      const data = await generateNews(model);
      setNews(data.noticia || "");
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Error al generar",
        description: e?.response?.data?.message || e?.message || "Intenta nuevamente.",
      });
    } finally {
      setGenLoading(false);
    }
  };

  // Atajos: ESC cierra, N siguiente estímulo
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!focusOpen) return;
      if (e.key === "Escape") {
        e.preventDefault();
        closeFocus();
      } else if (e.key.toLowerCase() === "n") {
        e.preventDefault();
        nextStimulus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focusOpen]);

  // ——— NLP: Generar noticia
  const handleGenerate = async () => {
    try {
      setGenLoading(true);
      setCls(null);
      const data = await generateNews(model);
      setNews(data.noticia || "");
      toast({ title: "Noticia generada", description: `Modelo: ${data.model_used}` });
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Error al generar",
        description: e?.response?.data?.message || e?.message || "Intenta nuevamente.",
      });
    } finally {
      setGenLoading(false);
    }
  };

  // ——— NLP: Clasificar noticia
  const handleClassify = async () => {
    if (!news.trim()) {
      toast({ variant: "destructive", title: "No hay texto", description: "Genera o pega una noticia primero." });
      return;
    }
    try {
      setClsLoading(true);
      const data = await classifyNews(news, mode);
      setCls({ label: data.label, score: data.score });
      toast({
        title: "Clasificación lista",
        description: `Veredicto: ${data.label.toUpperCase()} (${Math.round(data.score * 100)}%)`,
      });
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Error al clasificar",
        description: e?.response?.data?.message || e?.message || "Intenta nuevamente.",
      });
    } finally {
      setClsLoading(false);
    }
  };

  // ——— EEG: tick de envío/lectura (sim o real)
  const tickOnce = useCallback(async () => {
    try {
      const channels = simulateChannels(nSamples);
      const resp = await computeEegFeatures({ sample_rate: sr, channels });

      const eng = resp.metrics?.engagement ?? 0;
      setEngSeries((prev) => [...prev, { x: Date.now(), engagement: +eng.toFixed(3) }]);

      const b = Object.entries(resp.per_channel_relative_power || {}).map(([ch, v]) => ({
        channel: ch,
        alpha: +(v.alpha ?? 0).toFixed(3),
        beta: +(v.beta ?? 0).toFixed(3),
        delta: +(v.delta ?? 0).toFixed(3),
        theta: +(v.theta ?? 0).toFixed(3),
        gamma: +(v.gamma ?? 0).toFixed(3),
      }));
      setBands(b);
      setLastMetrics(resp.metrics);
    } catch (e: any) {
      toast({
        variant: "destructive",
        title: "Error en /eeg/features",
        description: e?.response?.data?.message || e?.message || "Revisa el backend o tu payload.",
      });
      if (simOn) setSimOn(false);
    }
  }, [nSamples, sr, simOn]);

  // ——— Sim loop on/off
  useEffect(() => {
    if (!simOn) {
      if (simId.current) {
        window.clearInterval(simId.current);
        simId.current = null;
      }
      return;
    }
    tickOnce();
    simId.current = window.setInterval(tickOnce, 1200);
    return () => {
      if (simId.current) {
        window.clearInterval(simId.current);
        simId.current = null;
      }
    };
  }, [simOn, tickOnce]);

  // ——— UI helpers
  const labelBadge = (v: "fake" | "real" | null) => {
    if (!v) return null;
    const isFake = v === "fake";
    return <Badge className={isFake ? "bg-rose-600" : "bg-emerald-600"}>{isFake ? "FAKE" : "REAL"}</Badge>;
  };

  const scoreColor = (s: number) => {
    if (s >= 0.66) return "text-emerald-600";
    if (s >= 0.33) return "text-amber-600";
    return "text-rose-600";
  };

  return (
    <div className="space-y-8">
      {/* HEADER */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
          Lab — NLP + EEG
        </h1>
        <p className="text-muted-foreground max-w-2xl">
          Genera noticias, clasifícalas (fake/real) y observa métricas EEG (engagement, bandas) en tiempo real.
        </p>
      </div>

      {/* NLP: Generar + Clasificar */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="hover:shadow-md transition">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Newspaper className="h-5 w-5" /> Generar noticia
            </CardTitle>
            <CardDescription>Usa tu endpoint /nlp/generar_noticia</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <Label className="text-xs text-muted-foreground">Modelo</Label>
                <Input value={model} onChange={(e) => setModel(e.target.value)} placeholder="DeepSeek-R1-0528" />
              </div>
              <div className="flex items-end gap-2">
                <Button onClick={handleGenerate} className="w-full" disabled={genLoading}>
                  <Wand2 className="h-4 w-4 mr-1" />
                  {genLoading ? "Generando..." : "Generar"}
                </Button>
                <Button variant="outline" onClick={openFocus} title="Ver estímulo">
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Noticia generada</Label>
              <Textarea
                rows={8}
                value={news}
                onChange={(e) => setNews(e.target.value)}
                placeholder="Aquí verás el texto generado..."
              />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" /> Clasificar noticia (fake/real)
            </CardTitle>
            <CardDescription>/nlp/clasificar_noticia (llm / vectorized)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <Label className="text-xs text-muted-foreground">Modo</Label>
                <select
                  className="w-full rounded-md border bg-background p-2 text-sm"
                  value={mode}
                  onChange={(e) => setMode(e.target.value as ClassifyMode)}
                >
                  <option value="llm">llm (SambaNova)</option>
                  <option value="vectorized">vectorized (sklearn)</option>
                </select>
              </div>
              <div className="flex items-end">
                <Button onClick={handleClassify} className="w-full" disabled={clsLoading}>
                  <Brain className="h-4 w-4 mr-1" />
                  {clsLoading ? "Clasificando..." : "Clasificar"}
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Veredicto:</span>
              {labelBadge(cls?.label ?? null)}
              {typeof cls?.score === "number" && (
                <span className={`text-sm font-medium ${scoreColor(cls!.score)}`}>
                  score: {Math.round((cls!.score ?? 0) * 100)}%
                </span>
              )}
            </div>

            <div className="pt-2">
              <Button asChild variant="outline" size="sm">
                <Link to="/analytics">
                  Ver Analytics <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* EEG: Streaming / Visualización */}
      <Card className="hover:shadow-md transition">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" /> EEG — Engagement & Bandas
          </CardTitle>
          <CardDescription>Usa /eeg/features (simulación local opcional)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Controles */}
          <div className="grid md:grid-cols-4 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Sample rate (Hz)</Label>
              <Input
                type="number"
                min={64}
                max={1024}
                value={sr}
                onChange={(e) => setSr(parseInt(e.target.value || "256", 10))}
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">N samples</Label>
              <Input
                type="number"
                min={64}
                max={4096}
                value={nSamples}
                onChange={(e) => setNSamples(parseInt(e.target.value || "512", 10))}
              />
            </div>
            <div className="flex items-end gap-2">
              <Button onClick={() => setSimOn((v) => !v)} className="w-full" variant={simOn ? "destructive" : "default"}>
                {simOn ? (
                  <>
                    <Square className="h-4 w-4 mr-1" /> Detener
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-1" /> Iniciar sim
                  </>
                )}
              </Button>
              <Button onClick={tickOnce} variant="outline">
                1 tick
              </Button>
            </div>
            <div className="flex items-end">
              {typeof lastMetrics?.alpha_asymmetry_F4_minus_F3 === "number" && (
                <div className="w-full rounded-lg border p-3">
                  <div className="text-xs text-muted-foreground">Alpha Asymmetry (F4 - F3)</div>
                  <div className="text-lg font-semibold">{lastMetrics.alpha_asymmetry_F4_minus_F3.toFixed(3)}</div>
                </div>
              )}
            </div>
          </div>

          {/* Engagement line + Bandas */}
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={engagementLine}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="x" tickFormatter={() => ""} />
                    <YAxis />
                    <Tooltip labelFormatter={() => ""} />
                    <Line type="monotone" dataKey="engagement" dot={false} strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">
                <Gauge className="inline h-3 w-3 mr-1" />
                Engagement (últimos {engagementLine.length} pts)
              </div>
            </div>

            <div className="">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={bands}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="channel" />
                    <YAxis domain={[0, 1]} />
                    <Tooltip />
                    <Bar dataKey="alpha" stackId="1" />
                    <Bar dataKey="beta" stackId="1" />
                    <Bar dataKey="delta" stackId="1" />
                    <Bar dataKey="theta" stackId="1" />
                    <Bar dataKey="gamma" stackId="1" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 text-xs text-muted-foreground">Bandas relativas por canal (stacked)</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Overlay — Focus Stimulus */}
      {focusOpen && (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70">
          <div className="absolute inset-0 overflow-auto">
            <div className="mx-auto max-w-4xl px-6 py-10 md:py-14">
              <div className="flex items-center justify-between mb-6">
                <Badge variant="secondary" className="text-xs">ESTÍMULO</Badge>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={closeFocus} title="Cerrar (ESC)">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <article className="prose prose-invert max-w-none">
                <h1 className="text-3xl md:text-4xl font-bold leading-tight tracking-tight">
                  {news ? "Noticia" : "Sin contenido"}
                </h1>
                <p className="mt-6 text-lg md:text-2xl leading-relaxed whitespace-pre-wrap">
                  {news || "Genera una noticia para iniciar el estímulo."}
                </p>
              </article>

              <div className="mt-10 flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={nextStimulus}
                  disabled={genLoading}
                  className="w-full sm:w-auto"
                  title="N"
                >
                  {genLoading ? (
                    "Generando..."
                  ) : (
                    <>
                      Siguiente estímulo <ChevronRight className="h-4 w-4 ml-1" />
                    </>
                  )}
                </Button>

                <Button variant="outline" onClick={handleClassify} disabled={!news.trim() || clsLoading}>
                  {clsLoading ? "Clasificando..." : "Clasificar (fake/real)"}
                </Button>

                <Button variant="ghost" onClick={closeFocus} className="sm:ml-auto">
                  Cerrar
                </Button>
              </div>

              {cls && (
                <div className="mt-6 flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">Veredicto:</span>
                  {labelBadge(cls.label)}
                  <span className={`text-sm font-medium ${scoreColor(cls.score)}`}>
                    score: {Math.round(cls.score * 100)}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LabPage;
