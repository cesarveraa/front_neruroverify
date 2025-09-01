// src/spa/pages/evaluator/EvaluatedScreen.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "../../shared/ui/button";
import { Badge } from "../../shared/ui/badge";
import { Maximize2, RefreshCcw } from "lucide-react";

// Usa el mismo cliente que en Lab
import { generateNews } from "../../shared/lib/eegservice";

export default function EvaluatedScreen() {
  const [params] = useSearchParams();
  const [text, setText] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState("DeepSeek-R1-0528");

  // Progreso opcional vía query: ?step=2&total=10
  const step = Number(params.get("step") || 0);
  const total = Number(params.get("total") || 0);
  const progress = useMemo(() => {
    if (!step || !total) return null;
    const pct = Math.min(100, Math.max(0, Math.round((step / total) * 100)));
    return { step, total, pct };
  }, [step, total]);

  // 1) query ?text=..., 2) sessionStorage.stimulus_text, 3) pedir al backend
  useEffect(() => {
    const fromQuery = params.get("text");
    if (fromQuery && fromQuery.trim()) {
      setText(fromQuery.trim());
      sessionStorage.setItem("stimulus_text", fromQuery.trim());
      return;
    }
    const cached = sessionStorage.getItem("stimulus_text");
    if (cached && cached.trim()) {
      setText(cached);
      return;
    }
    // fallback: pedir al backend
    regen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function regen() {
    try {
      setLoading(true);
      const data = await generateNews(model);
      const t = (data.noticia || "").trim();
      setText(t);
      sessionStorage.setItem("stimulus_text", t);
    } catch (e) {
      setText("No se pudo obtener el estímulo. Verifica el backend (/nlp/generar_noticia).");
    } finally {
      setLoading(false);
    }
  }

  function requestFullscreen() {
    const el = document.documentElement;
    if (el.requestFullscreen) el.requestFullscreen();
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      {/* Barra superior discreta */}
      <div className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-sm font-semibold tracking-wide">Session Running</h1>
            <span className="text-xs text-muted-foreground hidden sm:inline">
              Please focus on the content. Progress will be indicated.
            </span>
            {progress && (
              <Badge variant="secondary" className="ml-2">{progress.step} / {progress.total}</Badge>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" variant="ghost" onClick={requestFullscreen} title="Pantalla completa">
              <Maximize2 className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={regen} disabled={loading} title="Regenerar estímulo">
              <RefreshCcw className="h-4 w-4 mr-1" />
              {loading ? "Generando..." : "Regenerar"}
            </Button>
          </div>
        </div>

        {progress && (
          <div className="h-1 w-full bg-muted">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progress.pct}%` }}
            />
          </div>
        )}
      </div>

      {/* Contenido */}
      <div className="max-w-5xl mx-auto px-4 py-8 md:py-12">
        <div className="rounded-3xl border bg-card shadow-sm p-5 md:p-8">
          {/* Área de estímulo */}
          <div className="rounded-2xl bg-muted/40 border p-6 md:p-10 min-h-[50vh] grid">
            <article className="prose prose-lg md:prose-xl max-w-none text-foreground/95 dark:prose-invert place-self-center">
              {loading ? (
                <p className="text-muted-foreground">Cargando estímulo…</p>
              ) : text ? (
                <p className="whitespace-pre-wrap leading-relaxed tracking-normal">{text}</p>
              ) : (
                <div className="text-muted-foreground text-center">
                  <p className="mb-3">No hay texto de estímulo todavía.</p>
                  <p className="text-sm">
                    Pasa <code>?text=</code> en la URL, guarda en <code>sessionStorage.setItem("stimulus_text", "...")</code>,
                    o usa el botón <b>Regenerar</b> para pedirlo al backend.
                  </p>
                </div>
              )}
            </article>
          </div>

          {/* Opcional: selector de modelo visible solo si quieres control manual */}
          <div className="mt-4 flex items-center gap-3">
            <label className="text-xs text-muted-foreground">Modelo</label>
            <input
              className="px-3 py-2 rounded-md border bg-background text-sm w-72"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="DeepSeek-R1-0528"
            />
          </div>
        </div>
      </div>
    </main>
  );
}
