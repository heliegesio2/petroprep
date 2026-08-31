import { ImageResponse } from "next/og";

export const dynamic = "force-static";

const SPECS: Record<string, { size: number; pad: number; bg: string }> = {
  "192": { size: 192, pad: 0, bg: "transparent" },
  "512": { size: 512, pad: 0, bg: "transparent" },
  // Maskable: verde ocupa tudo, o "P" fica na zona segura (~80%).
  maskable: { size: 512, pad: 52, bg: "#007a3d" },
};

export function generateStaticParams() {
  return Object.keys(SPECS).map((spec) => ({ spec }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ spec: string }> },
) {
  const { spec } = await params;
  const cfg = SPECS[spec] ?? SPECS["512"];
  const inner = cfg.size - cfg.pad * 2;

  return new ImageResponse(
    (
      <div
        style={{
          width: cfg.size,
          height: cfg.size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: cfg.bg,
        }}
      >
        <div
          style={{
            width: inner,
            height: inner,
            background: "#007a3d",
            borderRadius: spec === "maskable" ? 0 : Math.round(cfg.size * 0.22),
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            fontSize: Math.round(inner * 0.62),
            fontWeight: 800,
            fontFamily: "sans-serif",
          }}
        >
          P
        </div>
      </div>
    ),
    { width: cfg.size, height: cfg.size },
  );
}
