import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        fontFamily: "system-ui, -apple-system, sans-serif",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div style={{ textAlign: "center", maxWidth: 420 }}>
        <p
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#1a7a4a",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            margin: 0,
          }}
        >
          404
        </p>
        <h1
          style={{
            fontSize: 28,
            fontWeight: 700,
            color: "#0f172a",
            margin: "8px 0 12px",
            letterSpacing: "-0.02em",
          }}
        >
          Page not found
        </h1>
        <p
          style={{
            fontSize: 15,
            color: "#64748b",
            margin: "0 0 24px",
            lineHeight: 1.6,
          }}
        >
          The page you are looking for does not exist.
        </p>
        <Link
          href="/"
          style={{
            display: "inline-block",
            background: "#1a7a4a",
            color: "white",
            textDecoration: "none",
            borderRadius: 10,
            padding: "10px 22px",
            fontSize: 14,
            fontWeight: 500,
          }}
        >
          Go home
        </Link>
      </div>
    </div>
  );
}
