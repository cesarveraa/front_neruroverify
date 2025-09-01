// src/spa/components/Charts.tsx
import React from "react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export function EEGLine({ data }: { data: Array<{ t: number; v: number }> }) {
  return (
    <div className="h-56 rounded-2xl border bg-white p-3">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="t" tickFormatter={() => ""} />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="v" dot={false} strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
