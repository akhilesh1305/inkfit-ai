import { ImageResponse } from "next/og";
import { getSiteUrl } from "@/lib/site";

export const runtime = "edge";
export const alt = "InkFit AI — AI Content Studio";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const site = getSiteUrl().replace(/^https?:\/\//, "");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(145deg, #0A0A0A 0%, #1e1040 45%, #0f172a 100%)",
          position: "relative",
        }}
      >
        {/* Glow accents */}
        <div
          style={{
            position: "absolute",
            top: -80,
            left: -80,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(99,102,241,0.35) 0%, transparent 70%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: -60,
            right: -60,
            width: 350,
            height: 350,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(6,182,212,0.25) 0%, transparent 70%)",
          }}
        />

        {/* Logo mark */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 96,
            height: 96,
            borderRadius: 24,
            background: "linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)",
            marginBottom: 32,
            boxShadow: "0 0 60px rgba(99,102,241,0.5)",
          }}
        >
          <svg width="52" height="52" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* Brand name — high contrast on dark bg */}
        <div
          style={{
            display: "flex",
            fontSize: 80,
            fontWeight: 800,
            letterSpacing: -2,
            color: "#ffffff",
            lineHeight: 1,
          }}
        >
          InkFit
          <span style={{ color: "#818cf8", marginLeft: 16 }}>AI</span>
        </div>

        <div
          style={{
            marginTop: 20,
            fontSize: 34,
            fontWeight: 500,
            color: "#d4d4d8",
            textAlign: "center",
            maxWidth: 900,
            lineHeight: 1.3,
          }}
        >
          AI Content Studio for Blogs, Social & SEO
        </div>

        <div
          style={{
            marginTop: 36,
            display: "flex",
            gap: 16,
          }}
        >
          {["LinkedIn", "Blogs", "SEO", "Images"].map((tag) => (
            <div
              key={tag}
              style={{
                padding: "10px 22px",
                borderRadius: 999,
                border: "1px solid rgba(129,140,248,0.4)",
                background: "rgba(79,70,229,0.15)",
                color: "#a5b4fc",
                fontSize: 20,
                fontWeight: 600,
              }}
            >
              {tag}
            </div>
          ))}
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 36,
            fontSize: 22,
            color: "#71717a",
            fontWeight: 500,
          }}
        >
          {site}
        </div>
      </div>
    ),
    { ...size }
  );
}
