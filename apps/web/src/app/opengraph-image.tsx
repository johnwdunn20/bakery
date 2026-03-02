import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Bakery — Stop Guessing. Start Perfecting.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <div
      style={{
        background: "#0a0a0a",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "80px",
        fontFamily: "sans-serif",
      }}
    >
      {/* Brand mark */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          marginBottom: "48px",
        }}
      >
        <div
          style={{
            width: "56px",
            height: "56px",
            borderRadius: "14px",
            background: "#f97316",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
            fontSize: "28px",
            fontWeight: "700",
          }}
        >
          B
        </div>
        <span
          style={{
            fontSize: "32px",
            fontWeight: "700",
            color: "#ffffff",
            letterSpacing: "-0.5px",
          }}
        >
          Bakery
        </span>
      </div>

      {/* Headline */}
      <div
        style={{
          fontSize: "72px",
          fontWeight: "800",
          color: "#ffffff",
          lineHeight: 1.1,
          letterSpacing: "-2px",
          marginBottom: "24px",
          maxWidth: "900px",
        }}
      >
        Stop Guessing.{" "}
        <span style={{ color: "#f97316", fontStyle: "italic" }}>Start Perfecting.</span>
      </div>

      {/* Subline */}
      <div
        style={{
          fontSize: "28px",
          color: "#a1a1aa",
          maxWidth: "760px",
          lineHeight: 1.5,
        }}
      >
        The professional-grade toolkit for home bakers.
      </div>

      {/* Feature pills */}
      <div
        style={{
          display: "flex",
          gap: "12px",
          marginTop: "48px",
        }}
      >
        {["Recipe Journal", "Baker's Math", "Ingredient Substitutions"].map((label) => (
          <div
            key={label}
            style={{
              padding: "10px 20px",
              borderRadius: "100px",
              border: "1px solid #27272a",
              background: "#18181b",
              color: "#a1a1aa",
              fontSize: "18px",
            }}
          >
            {label}
          </div>
        ))}
      </div>
    </div>,
    { ...size }
  );
}
