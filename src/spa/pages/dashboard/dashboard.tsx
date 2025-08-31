// src/spa/pages/dashboard/dashboard.tsx
"use client";

import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import {
  Area, AreaChart, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, ScatterChart, Scatter, ZAxis, CartesianGrid,
  BarChart, Bar
} from "recharts";
import {
  Activity, Brain, Gauge, Upload, BarChart3, PieChart as PieIcon,
  LineChart as LineIcon, FileSpreadsheet, ArrowRight, Database
} from "lucide-react";

import { useAuthStore } from "../../../features/auth/model/store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../shared/ui/card";
import { Button } from "../../../shared/ui/button";
import { Badge } from "../../../shared/ui/badge";

// ————————————————————————————————————
// Tipos y helpers
// ————————————————————————————————————

type EEGPoint = {
  t: number;             // seconds from start
  delta: number;
  theta: number;
  alpha: number;
  beta: number;
  gamma: number;
  attention: number;     // 0-100
  stress: number;        // 0-100
  relax: number;         // 0-100
};

function clamp(n: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

function makeNext(prev?: EEGPoint, t = 0): EEGPoint {
  const noise = () => (Math.random() - 0.5) * 8;
  const baseAtt = clamp((prev?.attention ?? 55) + noise());
  const baseStr = clamp((prev?.stress ?? 40) + noise());
  const baseRlx = clamp(100 - (baseAtt * 0.4 + baseStr * 0.6) + (Math.random() - 0.5) * 5);

  // bandas (suman aprox 1.0)
  const d = Math.max(0.05, 0.30 + (baseRlx - 50) / 800 + (Math.random() - 0.5) * 0.02);
  const th = Math.max(0.05, 0.22 + (baseRlx - 50) / 900 + (Math.random() - 0.5) * 0.02);
  const a = Math.max(0.05, 0.20 + (baseAtt - 50) / 1000 + (Math.random() - 0.5) * 0.02);
  const b = Math.max(0.05, 0.18 + (baseAtt - 50) / 900 + (Math.random() - 0.5) * 0.02);
  const g = Math.max(0.05, 1 - (d + th + a + b));

  return {
    t,
    delta: +d.toFixed(3),
    theta: +th.toFixed(3),
    alpha: +a.toFixed(3),
    beta: +b.toFixed(3),
    gamma: +g.toFixed(3),
    attention: Math.round(baseAtt),
    stress: Math.round(baseStr),
    relax: Math.round(baseRlx),
  };
}

// ————————————————————————————————————
// Componente principal
// ————————————————————————————————————

export const DashboardPage: React.FC = () => {
  const { t } = useTranslation("dashboard");
  const { user } = useAuthStore();
  const displayName = user?.displayName || user?.email?.split("@")[0] || "User";

  // stream de 60s (1 punto/500ms)
  const [series, setSeries] = useState<EEGPoint[]>([]);
  const t0 = useRef<number>(Date.now());

  useEffect(() => {
    let mounted = true;
    let last = makeNext(undefined, 0);
    setSeries([last]);

    const id = setInterval(() => {
      if (!mounted) return;
      const sec = (Date.now() - t0.current) / 1000;
      const next = makeNext(last, +sec.toFixed(1));
      last = next;
      setSeries((prev) => {
        const arr = [...prev, next];
        // mantener ventana de 60s aprox
        const cutoff = sec - 60;
        return arr.filter((p) => p.t >= cutoff);
      });
    }, 500);

    return () => {
      mounted = false;
      clearInterval(id);
    };
  }, []);

  const kpis = useMemo(() => {
    if (!series.length) return { expos: 0, fakePct: 0, att: 0, str: 0 };
    const n = series.length;
    const att = Math.round(series.reduce((a, b) => a + b.attention, 0) / n);
    const str = Math.round(series.reduce((a, b) => a + b.stress, 0) / n);
    // mock exposiciones y % fake
    const expos = 24; // en la sesión
    const fakePct = 58; // %
    return { expos, fakePct, att, str };
  }, [series]);

  // donut fake vs real
  const exposureDist = [
    { name: "Fake", value: kpis.fakePct },
    { name: "Real", value: 100 - kpis.fakePct },
  ];

  // scatter arousal-valence mock
  const scatter = useMemo(
    () =>
      Array.from({ length: 40 }).map(() => {
        const arousal = Math.round(40 + Math.random() * 60);
        const valence = Math.round(20 + Math.random() * 60);
        const type = Math.random() > 0.55 ? "Fake" : "Real";
        return { arousal, valence, type, size: 60 + Math.random() * 200 };
      }),
    []
  );

  // confusion matrix mock (TP, FP, FN, TN)
  const cm = [
    { row: "Pred Real", TN: 62, FP: 8 },
    { row: "Pred Fake", FN: 10, TP: 20 },
  ];

  // comparativa por dataset
  const byDataset = [
    { dataset: "Demo-A", stress: 42, attention: 61, fakePct: 54 },
    { dataset: "Demo-B", stress: 48, attention: 57, fakePct: 63 },
    { dataset: "Demo-C", stress: 35, attention: 66, fakePct: 49 },
  ];

  // timeline (eventos recientes)
  const events = [
    { ts: "00:12", label: "Scroll-stop", kind: "ui" },
    { ts: "00:27", label: "Pico estrés", kind: "eeg" },
    { ts: "00:39", label: "Click video", kind: "ui" },
    { ts: "00:46", label: "Clasificado Falso", kind: "ml" },
  ];

  // colores para el donut
  const donutColors = ["#ef4444", "#10b981"];

  // ——————————————————
  // SECCIONES NUEVAS
  // ——————————————————

  // sesgo por fuente (porcentaje de fake por dominio/formato)
  const sourceBias = [
    { source: "YouTube", fakePct: 62, exposures: 120 },
    { source: "TikTok", fakePct: 71, exposures: 98 },
    { source: "Blogs", fakePct: 48, exposures: 76 },
    { source: "Noticias", fakePct: 33, exposures: 132 },
    { source: "Foros", fakePct: 55, exposures: 64 },
  ];

  // eficacia del clasificador a distintos umbrales (simulado)
  const thresholdSeries = [
    { thr: 0.3, precision: 0.62, recall: 0.88, f1: 0.73 },
    { thr: 0.4, precision: 0.68, recall: 0.84, f1: 0.75 },
    { thr: 0.5, precision: 0.74, recall: 0.78, f1: 0.76 },
    { thr: 0.6, precision: 0.80, recall: 0.69, f1: 0.74 },
    { thr: 0.7, precision: 0.86, recall: 0.58, f1: 0.69 },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-balance bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
          {t("welcome", { name: displayName }) || `Bienvenido, ${displayName}`}
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl">
          {t("subtitle") || "Monitorea cómo varía tu actividad cerebral frente a noticias reales vs falsas."}
        </p>
        <p className="text-muted-foreground max-w-3xl">
          {t("description") || "Conecta tu EEG o usa datasets de ejemplo para explorar atención, estrés, relajación y respuestas afectivas mientras consumes contenidos."}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Exposiciones</CardTitle>
            <BarChart3 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{kpis.expos}</div>
            <p className="text-xs text-muted-foreground">en esta sesión</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">% Fake</CardTitle>
            <PieIcon className="h-4 w-4 text-rose-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{kpis.fakePct}%</div>
            <p className="text-xs text-muted-foreground">del total expuesto</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Atención (avg)</CardTitle>
            <Gauge className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{kpis.att}</div>
            <p className="text-xs text-muted-foreground">0–100</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Estrés (avg)</CardTitle>
            <Activity className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{kpis.str}</div>
            <p className="text-xs text-muted-foreground">0–100</p>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Gauges */}
      <div className="grid gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Brain className="h-5 w-5" /> Atención en tiempo real</CardTitle>
            <CardDescription>Actualiza cada 0.5s</CardDescription>
          </CardHeader>
          <CardContent>
            <GaugeBar value={series.at(-1)?.attention ?? 0} label="Atención" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" /> Estrés en tiempo real</CardTitle>
            <CardDescription>Actualiza cada 0.5s</CardDescription>
          </CardHeader>
          <CardContent>
            <GaugeBar value={series.at(-1)?.stress ?? 0} label="Estrés" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Brain className="h-5 w-5" /> Relajación en tiempo real</CardTitle>
            <CardDescription>Actualiza cada 0.5s</CardDescription>
          </CardHeader>
          <CardContent>
            <GaugeBar value={series.at(-1)?.relax ?? 0} label="Relajación" />
          </CardContent>
        </Card>
      </div>

      {/* Bandas + Donut */}
      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><LineIcon className="h-5 w-5" /> EEG Bands (últimos 60s)</CardTitle>
            <CardDescription>Delta/Theta/Alpha/Beta/Gamma (stacked)</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={series}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopOpacity={0.8}/>
                    <stop offset="95%" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="t" tickFormatter={(v) => `${v}s`} />
                <YAxis domain={[0, 1]} />
                <Tooltip />
                <Area type="monotone" dataKey="delta" stackId="1" strokeOpacity={0.9} fillOpacity={0.3} />
                <Area type="monotone" dataKey="theta" stackId="1" strokeOpacity={0.9} fillOpacity={0.3} />
                <Area type="monotone" dataKey="alpha" stackId="1" strokeOpacity={0.9} fillOpacity={0.3} />
                <Area type="monotone" dataKey="beta"  stackId="1" strokeOpacity={0.9} fillOpacity={0.3} />
                <Area type="monotone" dataKey="gamma" stackId="1" strokeOpacity={0.9} fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribución de Exposición</CardTitle>
            <CardDescription>Real vs Fake</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={exposureDist} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={2}>
                  {exposureDist.map((_, i) => (
                    <Cell key={i} fill={donutColors[i % donutColors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-3 flex items-center gap-2">
              <Badge variant="outline">Sesión activa</Badge>
              <Badge variant="secondary">EEG simulado</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Scatter + Matriz de confusión */}
      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Arousal vs Valence</CardTitle>
            <CardDescription>Muestras recientes por tipo de contenido</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart>
                <CartesianGrid />
                <XAxis type="number" dataKey="arousal" name="Arousal" domain={[0,100]} />
                <YAxis type="number" dataKey="valence" name="Valence" domain={[0,100]} />
                <ZAxis type="number" dataKey="size" range={[40, 200]} />
                <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                <Scatter data={scatter.filter(d=>d.type==="Real")} name="Real" />
                <Scatter data={scatter.filter(d=>d.type==="Fake")} name="Fake" />
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Matriz de Confusión</CardTitle>
            <CardDescription>Clasificador (Fake/Real)</CardDescription>
          </CardHeader>
          <CardContent>
            <ConfusionMatrix data={cm} />
          </CardContent>
        </Card>
      </div>

      {/* Timeline & datasets */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Eventos recientes</CardTitle>
            <CardDescription>Interacciones y picos fisiológicos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {events.map((ev, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg border p-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs px-2 py-0.5 rounded bg-muted">{ev.ts}</span>
                  <span className="text-sm">{ev.label}</span>
                </div>
                <Badge variant={ev.kind === "eeg" ? "default" : ev.kind === "ml" ? "secondary" : "outline"}>
                  {ev.kind.toUpperCase()}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Database className="h-5 w-5" /> Comparativa por Dataset</CardTitle>
            <CardDescription>Promedios de la última corrida</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byDataset}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dataset" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="stress" name="Estrés" />
                <Bar dataKey="attention" name="Atención" />
                <Bar dataKey="fakePct" name="% Fake" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* NUEVAS secciones: Sesgo por Fuente & Umbral */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sesgo por Fuente</CardTitle>
            <CardDescription>% contenido falso por origen (últimas 24h)</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sourceBias}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="source" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="fakePct" name="% Fake" />
              </BarChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground mt-2">
              Tamaño de muestra aproximado (exposiciones):{" "}
              {sourceBias.reduce((a, b) => a + b.exposures, 0)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Eficacia por Umbral</CardTitle>
            <CardDescription>Precision / Recall / F1 vs umbral</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={thresholdSeries}>
                <defs>
                  <linearGradient id="gPrec" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopOpacity={0.9}/>
                    <stop offset="95%" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="thr" tickFormatter={(v)=>v.toFixed(1)} />
                <YAxis domain={[0,1]} />
                <Tooltip />
                <Area type="monotone" dataKey="precision" name="Precision" strokeOpacity={0.95} fillOpacity={0.25} />
                <Area type="monotone" dataKey="recall"    name="Recall"    strokeOpacity={0.95} fillOpacity={0.25} />
                <Area type="monotone" dataKey="f1"        name="F1"        strokeOpacity={0.95} fillOpacity={0.25} />
              </AreaChart>
            </ResponsiveContainer>
            <p className="text-xs text-muted-foreground mt-2">
              Ajusta el umbral de decisión para priorizar menos falsos positivos (↑precision) o menos falsos negativos (↑recall).
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Acciones rápidas */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="group hover:shadow-md transition-all hover:scale-[1.01]">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Upload className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-lg">Cargar Dataset EEG/CSV</CardTitle>
            </div>
            <CardDescription>Sube señales o resultados etiquetados</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full group-hover:bg-primary/90">
              <Link to="/verticals">
                Ir a Datasets <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-md transition-all hover:scale-[1.01]">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileSpreadsheet className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-lg">Explorar Resultados</CardTitle>
            </div>
            <CardDescription>Métricas, sesiones, cohortes</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline" className="w-full">
              <Link to="/analytics">Abrir Analytics</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-md transition-all hover:scale-[1.01]">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <CardTitle className="text-lg">Guía de Estudio</CardTitle>
            </div>
            <CardDescription>Cómo interpretar señales y sesgos</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="ghost" className="w-full">
              <Link to="/docs">Ver documentación</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

// ————————————————————————————————————
// Subcomponentes UI
// ————————————————————————————————————

const GaugeBar: React.FC<{ value: number; label: string }> = ({ value, label }) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-medium">{value}</span>
      </div>
      <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${clamp(value)}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>0</span><span>50</span><span>100</span>
      </div>
    </div>
  );
};

const ConfusionMatrix: React.FC<{ data: { row: string; TN: number; FP: number }[] }> = ({ data }) => {
  // data rows: ["Pred Real" => TN/FP], ["Pred Fake" => FN/TP]
  const max = Math.max(...data.flatMap((r) => [r.TN, r.FP]));
  const cell = (v: number) => {
    const pct = max ? v / max : 0;
    const bg = `rgba(34,197,94,${0.15 + pct * 0.6})`; // escala verde
    return (
      <div className="aspect-square flex items-center justify-center rounded-md text-sm font-medium" style={{ background: bg }}>
        {v}
      </div>
    );
  };

  return (
    <div className="space-y-3">
      <div className="text-xs text-muted-foreground">Ground Truth → (Real / Fake)</div>
      <div className="grid grid-cols-3 gap-2">
        <div />
        <div className="text-xs text-center text-muted-foreground">Real</div>
        <div className="text-xs text-center text-muted-foreground">Fake</div>

        <div className="text-xs text-muted-foreground self-center">Pred Real</div>
        {cell(data[0].TN)}
        {cell(data[0].FP)}

        <div className="text-xs text-muted-foreground self-center">Pred Fake</div>
        {cell((data as any)[1].FN)}
        {cell((data as any)[1].TP)}
      </div>
    </div>
  );
};
