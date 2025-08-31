// src/spa/pages/verticals/verticals.tsx
"use client";

import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../shared/ui/card";
import { Button } from "../../../shared/ui/button";
import { Input } from "../../../shared/ui/input";
import { Badge } from "../../../shared/ui/badge";

import {
  Upload,
  Database,
  FileSpreadsheet,
  FileJson,
  Search,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Settings2,
  Info,
  Brain,
  Activity,
  PieChart,
} from "lucide-react";

// ————————————————————————————————————
// Tipos y constantes
// ————————————————————————————————————

type Row = Record<string, any>;

type DatasetMeta = {
  id: string;
  name: string;
  rows: Row[];
  headers: string[];
  createdAt: number;
  source?: "upload" | "demo";
  mapping: ColumnMapping;
};

type ColumnMapping = {
  time?: string;               // columna de tiempo (s, ms, ISO) o índice
  label?: string;              // "Fake"/"Real" o 0/1
  source?: string;             // dominio/origen (YouTube, Blog, ...)
  attention?: string;
  stress?: string;
  relax?: string;
  delta?: string;
  theta?: string;
  alpha?: string;
  beta?: string;
  gamma?: string;
};

const REQUIRED_AT_LEAST_ONE = ["attention", "stress", "relax", "delta", "theta", "alpha", "beta", "gamma"] as const;
const OPTIONAL_FIELDS = ["source"] as const;
const CORE_FIELDS = ["time", "label"] as const;

const MAPPING_KEYS: Array<keyof ColumnMapping> = [
  "time", "label", "source",
  "attention", "stress", "relax",
  "delta", "theta", "alpha", "beta", "gamma",
];

const SUGGESTIONS: Partial<Record<keyof ColumnMapping, string[]>> = {
  time: ["time", "timestamp", "t", "ms", "seconds", "fecha", "tiempo"],
  label: ["label", "target", "y", "fake", "is_fake", "class", "etiqueta"],
  source: ["source", "domain", "origen", "fuente", "platform"],
  attention: ["attention", "att", "focus"],
  stress: ["stress", "estres", "strain"],
  relax: ["relax", "relaxation", "calm"],
  delta: ["delta", "band_delta"],
  theta: ["theta", "band_theta"],
  alpha: ["alpha", "band_alpha"],
  beta: ["beta", "band_beta"],
  gamma: ["gamma", "band_gamma"],
};

// ————————————————————————————————————
// Utils: CSV/JSON parsing
// ————————————————————————————————————

function parseCSV(text: string): Row[] {
  // CSV robusto simple (comillas, separador coma; ignora BOM)
  const clean = text.replace(/^\uFEFF/, "");
  const lines = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i];
    if (ch === '"') {
      // Ver comillas escapadas
      if (inQuotes && clean[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "\n" || ch === "\r") {
      // nueva línea si no estamos en comillas
      if (!inQuotes) {
        lines.push(current);
        current = "";
        // saltar \r\n doble
        if (ch === "\r" && clean[i + 1] === "\n") i++;
      } else {
        current += ch;
      }
    } else {
      current += ch;
    }
  }
  if (current) lines.push(current);

  const rows: string[][] = lines
    .filter((l) => l.trim().length)
    .map((l) => {
      const out: string[] = [];
      let cell = "";
      let quotes = false;
      for (let i = 0; i < l.length; i++) {
        const c = l[i];
        if (c === '"') {
          if (quotes && l[i + 1] === '"') {
            cell += '"';
            i++;
          } else {
            quotes = !quotes;
          }
        } else if (c === "," && !quotes) {
          out.push(cell);
          cell = "";
        } else {
          cell += c;
        }
      }
      out.push(cell);
      return out;
    });

  if (rows.length === 0) return [];
  const header = rows[0].map((h) => h.trim());
  return rows.slice(1).map((cols) => {
    const obj: Row = {};
    for (let i = 0; i < header.length; i++) {
      obj[header[i]] = cols[i] ?? "";
    }
    return obj;
  });
}

async function parseFile(file: File): Promise<{ rows: Row[]; headers: string[]; name: string }> {
  const text = await file.text();
  if (file.name.toLowerCase().endsWith(".json")) {
    const parsed = JSON.parse(text);
    const rows: Row[] = Array.isArray(parsed) ? parsed : parsed.data ?? [];
    const headers = inferHeadersFromRows(rows);
    return { rows, headers, name: file.name };
  }
  // csv / txt
  const rows = parseCSV(text);
  const headers = inferHeadersFromRows(rows);
  return { rows, headers, name: file.name };
}

function inferHeadersFromRows(rows: Row[]): string[] {
  if (!rows.length) return [];
  const set = new Set<string>();
  rows.slice(0, 50).forEach((r) => Object.keys(r).forEach((k) => set.add(k)));
  return Array.from(set);
}

// Fuzzy muy simple: normaliza y busca "empates" por includes y prefijos
function pickSuggestion(headers: string[], candidates: string[]): string | undefined {
  const norm = (s: string) => s.toLowerCase().replace(/\s+|_|-|\./g, "");
  const H = headers.map((h) => ({ raw: h, n: norm(h) }));
  const C = candidates.map((c) => norm(c));
  // match exact
  for (const h of H) {
    if (C.includes(h.n)) return h.raw;
  }
  // startsWith
  for (const h of H) {
    if (C.some((c) => h.n.startsWith(c))) return h.raw;
  }
  // includes
  for (const h of H) {
    if (C.some((c) => h.n.includes(c))) return h.raw;
  }
  return undefined;
}

function autoMapping(headers: string[]): ColumnMapping {
  const m: ColumnMapping = {};
  for (const k of MAPPING_KEYS) {
    const suggestion = SUGGESTIONS[k];
    if (!suggestion) continue;
    const match = pickSuggestion(headers, suggestion);
    if (match) (m as any)[k] = match;
  }
  return m;
}

function validateMapping(mapping: ColumnMapping, rows: Row[]) {
  const problems: string[] = [];

  // core obligatorios
  CORE_FIELDS.forEach((k) => {
    if (!mapping[k]) problems.push(`Falta columna obligatoria: ${k}`);
  });

  // al menos una métrica EEG/afectiva
  const hasOne = REQUIRED_AT_LEAST_ONE.some((k) => !!mapping[k]);
  if (!hasOne) {
    problems.push("Debes mapear al menos una señal o métrica (attention/stress/relax/delta/theta/alpha/beta/gamma).");
  }

  // chequeo de existencia en headers
  const headers = rows.length ? Object.keys(rows[0]) : [];
  for (const [k, v] of Object.entries(mapping)) {
    if (!v) continue;
    if (!headers.includes(v)) problems.push(`Columna mapeada no existe en datos: ${k} → "${v}"`);
  }

  return problems;
}

// ————————————————————————————————————
// Storage local
// ————————————————————————————————————

const LS_KEY = "eeg_fake_news_datasets_v1";

function loadDatasets(): DatasetMeta[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as DatasetMeta[];
    return parsed ?? [];
  } catch {
    return [];
  }
}

function saveDatasets(list: DatasetMeta[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(list));
}

// ————————————————————————————————————
// DEMOS (ligeras)
// ————————————————————————————————————

const DEMO_A: Row[] = Array.from({ length: 120 }).map((_, i) => ({
  time: i, // s
  attention: Math.round(40 + Math.random() * 40),
  stress: Math.round(30 + Math.random() * 40),
  relax: Math.round(30 + Math.random() * 40),
  delta: +(0.25 + Math.random() * 0.1).toFixed(3),
  theta: +(0.20 + Math.random() * 0.1).toFixed(3),
  alpha: +(0.18 + Math.random() * 0.1).toFixed(3),
  beta:  +(0.18 + Math.random() * 0.1).toFixed(3),
  gamma: +(0.19 + Math.random() * 0.1).toFixed(3),
  label: Math.random() > 0.45 ? "Fake" : "Real",
  source: ["YouTube", "Blog", "Noticias", "Foros"][Math.floor(Math.random() * 4)],
}));

const DEMO_B: Row[] = Array.from({ length: 80 }).map((_, i) => ({
  timestamp: i * 500, // ms
  att: Math.round(45 + Math.random() * 35),
  estres: Math.round(35 + Math.random() * 35),
  relax: Math.round(30 + Math.random() * 45),
  band_delta: +(0.30 + Math.random() * 0.08).toFixed(3),
  band_theta: +(0.22 + Math.random() * 0.08).toFixed(3),
  band_alpha: +(0.20 + Math.random() * 0.08).toFixed(3),
  band_beta:  +(0.16 + Math.random() * 0.08).toFixed(3),
  band_gamma: +(0.12 + Math.random() * 0.08).toFixed(3),
  target: Math.random() > 0.55 ? 1 : 0, // 1 fake, 0 real
  domain: ["TikTok", "Noticias", "Foros"][Math.floor(Math.random() * 3)],
}));

// ————————————————————————————————————
// Componente principal
// ————————————————————————————————————

export const VerticalsPage: React.FC = () => {
  const { t } = useTranslation("verticals");
  const [query, setQuery] = useState("");
  const [datasets, setDatasets] = useState<DatasetMeta[]>(() => loadDatasets());
  const [current, setCurrent] = useState<DatasetMeta | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  // filtro por nombre
  const filtered = useMemo(() => {
    if (!query) return datasets;
    const q = query.toLowerCase();
    return datasets.filter((d) => d.name.toLowerCase().includes(q));
  }, [datasets, query]);

  // al montar, si no hay datasets, ofrecemos demos
  useEffect(() => {
    // no-op
  }, []);

  function onPickFile() {
    fileRef.current?.click();
  }

  async function onFilesSelected(files: FileList | null) {
    if (!files || !files.length) return;
    const file = files[0];
    try {
      const { rows, headers, name } = await parseFile(file);
      const mapping = autoMapping(headers);
      const meta: DatasetMeta = {
        id: crypto.randomUUID(),
        name,
        rows,
        headers,
        source: "upload",
        createdAt: Date.now(),
        mapping,
      };
      setCurrent(meta);
    } catch (e) {
      console.error(e);
      alert("No se pudo parsear el archivo. Verifica formato CSV/JSON.");
    } finally {
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function addDemo(name: string, rows: Row[]) {
    const headers = inferHeadersFromRows(rows);
    const mapping = autoMapping(headers);
    const meta: DatasetMeta = {
      id: crypto.randomUUID(),
      name,
      rows,
      headers,
      source: "demo",
      createdAt: Date.now(),
      mapping,
    };
    setCurrent(meta);
  }

  function commitDataset(meta: DatasetMeta) {
    const list = [meta, ...datasets];
    setDatasets(list);
    saveDatasets(list);
    setCurrent(null);
  }

  function discardCurrent() {
    setCurrent(null);
  }

  function removeDataset(id: string) {
    const list = datasets.filter((d) => d.id !== id);
    setDatasets(list);
    saveDatasets(list);
  }

  function updateMapping(field: keyof ColumnMapping, value: string) {
    if (!current) return;
    setCurrent({ ...current, mapping: { ...current.mapping, [field]: value || undefined } });
  }

  const validationProblems = useMemo(
    () => (current ? validateMapping(current.mapping, current.rows) : []),
    [current]
  );

  // ————————————————————————————————————
  // UI
  // ————————————————————————————————————

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-balance">
          {t("title") || "Datasets EEG / Fake News"}
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl">
          {t("subtitle") ||
            "Sube señales EEG o resultados etiquetados (CSV/JSON), mapea columnas, valida y guarda para analizarlas en el dashboard/analytics."}
        </p>
      </div>

      {/* Quick actions */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="hover:shadow-md transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" /> Subir archivo
            </CardTitle>
            <CardDescription>CSV o JSON con cabecera</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <input
              ref={fileRef}
              type="file"
              accept=".csv,.json,.txt"
              onChange={(e) => onFilesSelected(e.target.files)}
              className="hidden"
            />
            <Button onClick={onPickFile} className="w-full">
              Seleccionar archivo
            </Button>
            <DropZone onFiles={onFilesSelected} />
            <p className="text-xs text-muted-foreground">
              Sugerido: columnas como <code>time</code>, <code>label</code>,{" "}
              <code>attention</code>, <code>stress</code>, <code>relax</code>, <code>delta</code>,{" "}
              <code>theta</code>, <code>alpha</code>, <code>beta</code>, <code>gamma</code> y <code>source</code>.
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" /> Cargar demos
            </CardTitle>
            <CardDescription>Datos sintéticos para pruebas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="outline" className="w-full" onClick={() => addDemo("DEMO_A.csv", DEMO_A)}>
              DEMO_A (headers estándar)
            </Button>
            <Button variant="outline" className="w-full" onClick={() => addDemo("DEMO_B.json", DEMO_B)}>
              DEMO_B (headers variados)
            </Button>
            <div className="flex gap-2">
              <Badge variant="secondary" className="flex items-center gap-1">
                <Brain className="h-3 w-3" /> atención/relax
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <Activity className="h-3 w-3" /> estrés
              </Badge>
              <Badge variant="secondary" className="flex items-center gap-1">
                <PieChart className="h-3 w-3" /> bandas
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-all">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5" /> Ir a Analytics
            </CardTitle>
            <CardDescription>Explora métricas, cohortes y sesiones</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild variant="ghost" className="w-full">
              <Link to="/analytics">
                Abrir Analytics <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Editor de dataset actual */}
      {current && (
        <Card className="border-primary/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings2 className="h-5 w-5" /> Configurar Dataset
            </CardTitle>
            <CardDescription>
              {current.name} · {current.rows.length.toLocaleString()} filas · {current.headers.length} columnas
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Mapping */}
            <ColumnMapper
              headers={current.headers}
              mapping={current.mapping}
              onChange={updateMapping}
            />

            {/* Validación */}
            <ValidationPanel problems={validationProblems} />

            {/* Preview */}
            <PreviewTable rows={current.rows} headers={current.headers} limit={100} />

            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <Button variant="outline" onClick={discardCurrent}>
                Cancelar
              </Button>
              <Button
                onClick={() => commitDataset(current)}
                disabled={validationProblems.length > 0 || current.rows.length === 0}
              >
                Guardar dataset
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Búsqueda + listado de datasets guardados */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nombre…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          {query && (
            <Button variant="outline" onClick={() => setQuery("")}>
              Limpiar
            </Button>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((d) => (
            <Card key={d.id} className="hover:shadow-md transition-all">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{d.name}</CardTitle>
                    <CardDescription className="text-sm">
                      {new Date(d.createdAt).toLocaleString()} · {d.rows.length.toLocaleString()} filas
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="flex items-center gap-1">
                    {d.source === "demo" ? <FileJson className="h-3 w-3" /> : <FileSpreadsheet className="h-3 w-3" />}
                    {d.source ?? "upload"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-1">
                  {Object.entries(d.mapping)
                    .filter(([, v]) => !!v)
                    .slice(0, 6)
                    .map(([k, v]) => (
                      <Badge key={k} variant="secondary" className="text-xs">{k}: {v as string}</Badge>
                    ))}
                </div>
                <div className="flex items-center justify-between pt-1">
                  <Button asChild size="sm" variant="outline">
                    <Link to="/analytics">Analizar</Link>
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => removeDataset(d.id)}>
                    Eliminar
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center text-muted-foreground py-10">
            No hay datasets guardados {query ? `para “${query}”` : ""}.
          </div>
        )}
      </div>
    </div>
  );
};

// ————————————————————————————————————
// Subcomponentes
// ————————————————————————————————————

const DropZone: React.FC<{ onFiles: (files: FileList | null) => void }> = ({ onFiles }) => {
  const [hover, setHover] = useState(false);
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setHover(true); }}
      onDragLeave={() => setHover(false)}
      onDrop={(e) => {
        e.preventDefault();
        setHover(false);
        onFiles(e.dataTransfer.files);
      }}
      className={`w-full border-2 border-dashed rounded-lg p-6 text-center text-sm transition-colors ${
        hover ? "border-primary bg-primary/5" : "border-muted-foreground/20"
      }`}
    >
      Arrastra y suelta tu archivo aquí
    </div>
  );
};

const ColumnMapper: React.FC<{
  headers: string[];
  mapping: ColumnMapping;
  onChange: (field: keyof ColumnMapping, value: string) => void;
}> = ({ headers, mapping, onChange }) => {
  const fieldOrder: Array<keyof ColumnMapping> = [
    "time", "label", "source",
    "attention", "stress", "relax",
    "delta", "theta", "alpha", "beta", "gamma",
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Info className="h-4 w-4" />
        Mapea tus columnas. <span className="font-medium">time</span> y <span className="font-medium">label</span> son obligatorias; al menos una métrica/ banda debe estar mapeada.
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {fieldOrder.map((k) => (
          <div key={k} className="space-y-1">
            <label className="text-xs text-muted-foreground">{k}</label>
            <select
              className="w-full h-9 rounded-md border bg-background px-2 text-sm"
              value={(mapping[k] ?? "") as string}
              onChange={(e) => onChange(k, e.target.value)}
            >
              <option value="">— sin asignar —</option>
              {headers.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>
        ))}
      </div>
    </div>
  );
};

const ValidationPanel: React.FC<{ problems: string[] }> = ({ problems }) => {
  if (problems.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 rounded-md p-3">
        <CheckCircle2 className="h-4 w-4" />
        Mapeo válido. Puedes guardar el dataset.
      </div>
    );
  }
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-md p-3">
        <XCircle className="h-4 w-4" />
        Revisa los siguientes problemas:
      </div>
      <ul className="list-disc pl-6 text-sm text-rose-700">
        {problems.map((p, i) => (
          <li key={i}>{p}</li>
        ))}
      </ul>
    </div>
  );
};

const PreviewTable: React.FC<{ rows: Row[]; headers: string[]; limit?: number }> = ({ rows, headers, limit = 100 }) => {
  const slice = rows.slice(0, limit);
  return (
    <div className="border rounded-lg overflow-auto">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 sticky top-0">
          <tr>
            {headers.map((h) => (
              <th key={h} className="text-left px-3 py-2 font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {slice.map((r, i) => (
            <tr key={i} className="border-t">
              {headers.map((h) => (
                <td key={h} className="px-3 py-1 whitespace-nowrap">
                  {String(r[h] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length > limit && (
        <div className="p-2 text-xs text-muted-foreground">
          Mostrando {limit.toLocaleString()} de {rows.length.toLocaleString()} filas.
        </div>
      )}
    </div>
  );
};
