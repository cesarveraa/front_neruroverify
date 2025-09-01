// src/spa/api/auth.ts
"use client";
export async function getMe(): Promise<{ user: { role: "evaluator" | "participant"; email?: string } }> {
  // Si tienes un backend real de auth, reemplaza por fetch a /auth/me
  return { user: { role: "evaluator", email: "evaluator@example.com" } };
}
