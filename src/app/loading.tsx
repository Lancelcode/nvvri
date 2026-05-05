/**
 * Root loading state shown while the home page server component is fetching.
 * Renders a skeleton matching the eventual layout so there is no jarring
 * shift when content arrives.
 */
export default function Loading() {
  const cardSkeletonStyle: React.CSSProperties = {
    background: "white",
    border: "1px solid #e2e8f0",
    borderRadius: 12,
    padding: 20,
    height: 240,
    animation: "nvvri-pulse 1.5s ease-in-out infinite",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <style>{`
        @keyframes nvvri-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.55; }
        }
      `}</style>

      {/* Nav skeleton */}
      <div
        style={{
          background: "white",
          borderBottom: "1px solid #e2e8f0",
          padding: "12px 24px",
          height: 56,
        }}
      />

      {/* Hero skeleton */}
      <div
        style={{
          background: "white",
          borderBottom: "1px solid #e2e8f0",
          padding: "32px 24px",
        }}
      >
        <div style={{ maxWidth: 680, margin: "0 auto" }}>
          <div
            style={{
              height: 32,
              width: "70%",
              background: "#e2e8f0",
              borderRadius: 8,
              margin: "0 auto 12px",
              animation: "nvvri-pulse 1.5s ease-in-out infinite",
            }}
          />
          <div
            style={{
              height: 18,
              width: "50%",
              background: "#f1f5f9",
              borderRadius: 6,
              margin: "0 auto 24px",
              animation: "nvvri-pulse 1.5s ease-in-out infinite",
            }}
          />
          <div
            style={{
              height: 80,
              background: "#f0fdf4",
              border: "1.5px solid #bbf7d0",
              borderRadius: 14,
            }}
          />
        </div>
      </div>

      {/* Cards skeleton */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: 24 }}>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
            gap: 20,
          }}
        >
          <div style={cardSkeletonStyle} />
          <div style={cardSkeletonStyle} />
          <div style={cardSkeletonStyle} />
          <div style={cardSkeletonStyle} />
          <div style={cardSkeletonStyle} />
          <div style={cardSkeletonStyle} />
        </div>
      </div>
    </div>
  );
}
