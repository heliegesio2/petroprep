"use client";

import { useEffect, useState } from "react";

interface Parts {
  dias: number;
  horas: number;
  minutos: number;
  segundos: number;
}

function diff(target: number): Parts {
  const total = Math.max(0, target - Date.now());
  return {
    dias: Math.floor(total / 86_400_000),
    horas: Math.floor((total / 3_600_000) % 24),
    minutos: Math.floor((total / 60_000) % 60),
    segundos: Math.floor((total / 1000) % 60),
  };
}

export function Countdown({ target }: { target: string }) {
  const targetMs = new Date(target).getTime();
  const [parts, setParts] = useState<Parts>(() => diff(targetMs));

  useEffect(() => {
    const id = setInterval(() => setParts(diff(targetMs)), 1000);
    return () => clearInterval(id);
  }, [targetMs]);

  const cells: Array<[string, number]> = [
    ["dias", parts.dias],
    ["horas", parts.horas],
    ["min", parts.minutos],
    ["seg", parts.segundos],
  ];

  return (
    <div className="flex gap-2 sm:gap-3" aria-label="Contagem regressiva estimada para a prova">
      {cells.map(([label, value]) => (
        <div
          key={label}
          className="min-w-[3.75rem] rounded-xl border border-current/15 bg-current/10 px-2 py-2 text-center sm:min-w-[4.5rem] sm:px-3"
        >
          <div
            className="font-mono text-xl font-bold tabular-nums sm:text-2xl"
            suppressHydrationWarning
          >
            {String(value).padStart(2, "0")}
          </div>
          <div className="text-[0.7rem] opacity-55">{label}</div>
        </div>
      ))}
    </div>
  );
}
