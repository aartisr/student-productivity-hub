import { ImageResponse } from "next/og";

export const alt = "Student Productivity Hub: a calm study workspace";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          height: "100%",
          width: "100%",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px",
          color: "#152126",
          background: "linear-gradient(135deg, #f7eee6 0%, #edf4f5 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", color: "#005d73", fontSize: 28, fontWeight: 700 }}>
          STUDENT PRODUCTIVITY
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          <div style={{ display: "flex", fontSize: 72, fontWeight: 800, lineHeight: 1.05 }}>
            Student Productivity Hub
          </div>
          <div style={{ display: "flex", maxWidth: 820, color: "#526167", fontSize: 32, lineHeight: 1.3 }}>
            Plan assignments, focus your study time, practice with quizzes, and understand your progress.
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 24 }}>
          <span style={{ color: "#005d73", fontWeight: 700 }}>A calm, open study workspace</span>
          <span>sph.ai-aarti.com</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
