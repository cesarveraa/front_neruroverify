// src/spa/pages/evaluator/EvaluatedScreen.tsx
import React from "react";

export default function EvaluatedScreen() {
  return (
    <main className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <h1 className="text-xl font-semibold">Session Running</h1>
          <p className="text-gray-400">Please focus on the content. Progress will be indicated.</p>
        </div>
        <div className="aspect-video bg-gray-900 rounded-2xl grid place-items-center">
          <span className="text-gray-500">Stimulus Area</span>
        </div>
        <div className="mt-4 text-sm text-gray-400 text-center">Stimulus 2 of 10</div>
      </div>
    </main>
  );
}
