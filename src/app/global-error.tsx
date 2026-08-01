"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <head>
        <title>Family Life Admin</title>
      </head>
      <body style={{ margin: 0 }}>
        <main
          role="alert"
          style={{
            alignItems: "center",
            background: "#F7F8F5",
            color: "#1E2723",
            display: "flex",
            fontFamily: "system-ui, sans-serif",
            justifyContent: "center",
            minHeight: "100vh",
            padding: 24,
          }}
        >
          <section
            style={{
              background: "#FFFFFF",
              border: "1px solid #DDE2DE",
              borderRadius: 12,
              boxSizing: "border-box",
              maxWidth: 480,
              padding: 24,
              width: "100%",
            }}
          >
            <h1 style={{ fontSize: 22, margin: 0 }}>
              Family Life Admin needs a moment
            </h1>
            <p style={{ color: "#66706B", lineHeight: 1.5, margin: "12px 0 24px" }}>
              Your household data has not been changed. Try loading the app again.
            </p>
            <button
              type="button"
              onClick={reset}
              style={{
                background: "#236B4E",
                border: 0,
                borderRadius: 8,
                color: "#FFFFFF",
                cursor: "pointer",
                fontSize: 16,
                fontWeight: 700,
                minHeight: 44,
                padding: "10px 18px",
              }}
            >
              Try again
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
