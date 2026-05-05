import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

// Admin pages must never be cached at the edge or indexed. This is fresh
// data on every request.
export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Search analytics",
  robots: { index: false, follow: false },
};

interface ModelRow {
  model: string;
  total: number;
  avgLatencyMs: number;
  successRate: number;
}

interface DashboardData {
  totalLast7d: number;
  successLast7d: number;
  failLast7d: number;
  successRate: number;
  modelBreakdown: ModelRow[];
  recent: Array<{
    id: string;
    query: string;
    model: string | null;
    success: boolean;
    latencyMs: number;
    createdAt: Date;
  }>;
  topFailing: Array<{ query: string; count: number }>;
}

async function loadDashboard(): Promise<DashboardData> {
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [totals, byModel, recent, failures] = await Promise.all([
    prisma.searchLog.groupBy({
      by: ["success"],
      where: { createdAt: { gte: sevenDaysAgo } },
      _count: { _all: true },
    }),
    prisma.searchLog.groupBy({
      by: ["model", "success"],
      where: { createdAt: { gte: sevenDaysAgo }, model: { not: null } },
      _count: { _all: true },
      _avg: { latencyMs: true },
    }),
    prisma.searchLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        id: true,
        query: true,
        model: true,
        success: true,
        latencyMs: true,
        createdAt: true,
      },
    }),
    prisma.searchLog.groupBy({
      by: ["query"],
      where: { createdAt: { gte: sevenDaysAgo }, success: false },
      _count: { _all: true },
      orderBy: { _count: { query: "desc" } },
      take: 10,
    }),
  ]);

  const successLast7d =
    totals.find((t) => t.success === true)?._count._all ?? 0;
  const failLast7d = totals.find((t) => t.success === false)?._count._all ?? 0;
  const totalLast7d = successLast7d + failLast7d;

  // Aggregate per-model rows. Each model can appear with success=true and
  // success=false; combine them into one row with a success rate.
  const modelMap = new Map<string, { successes: number; failures: number; latencySum: number; latencyCount: number }>();
  for (const row of byModel) {
    if (!row.model) continue;
    const existing = modelMap.get(row.model) ?? {
      successes: 0,
      failures: 0,
      latencySum: 0,
      latencyCount: 0,
    };
    if (row.success) existing.successes += row._count._all;
    else existing.failures += row._count._all;
    if (row._avg.latencyMs !== null) {
      existing.latencySum += row._avg.latencyMs * row._count._all;
      existing.latencyCount += row._count._all;
    }
    modelMap.set(row.model, existing);
  }

  const modelBreakdown: ModelRow[] = Array.from(modelMap.entries())
    .map(([model, stats]) => {
      const total = stats.successes + stats.failures;
      return {
        model,
        total,
        avgLatencyMs:
          stats.latencyCount > 0
            ? Math.round(stats.latencySum / stats.latencyCount)
            : 0,
        successRate: total > 0 ? stats.successes / total : 0,
      };
    })
    .sort((a, b) => b.total - a.total);

  return {
    totalLast7d,
    successLast7d,
    failLast7d,
    successRate: totalLast7d > 0 ? successLast7d / totalLast7d : 0,
    modelBreakdown,
    recent,
    topFailing: failures.map((f) => ({
      query: f.query ?? "",
      count: f._count._all,
    })),
  };
}

export default async function SearchesAdminPage() {
  const data = await loadDashboard();

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        fontFamily:
          "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
        color: "#e2e8f0",
        padding: "32px 24px",
      }}
    >
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 32,
          }}
        >
          <div>
            <h1
              style={{
                fontSize: 22,
                fontWeight: 700,
                margin: "0 0 4px",
                color: "white",
                letterSpacing: "-0.01em",
              }}
            >
              nvvri search analytics
            </h1>
            <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>
              Last 7 days · live data from Neon
            </p>
          </div>
          <a
            href="/"
            style={{
              fontSize: 12,
              color: "#94a3b8",
              textDecoration: "none",
              border: "1px solid #334155",
              padding: "5px 12px",
              borderRadius: 6,
            }}
          >
            ← back to site
          </a>
        </div>

        {/* Top stats */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: 12,
            marginBottom: 32,
          }}
        >
          <Stat label="total queries" value={data.totalLast7d.toLocaleString()} />
          <Stat
            label="success rate"
            value={`${(data.successRate * 100).toFixed(1)}%`}
            tone={data.successRate >= 0.9 ? "good" : data.successRate >= 0.7 ? "warn" : "bad"}
          />
          <Stat
            label="ai succeeded"
            value={data.successLast7d.toLocaleString()}
          />
          <Stat
            label="ai failed (parser fallback)"
            value={data.failLast7d.toLocaleString()}
            tone={data.failLast7d > 0 ? "warn" : "good"}
          />
        </div>

        {/* Model breakdown */}
        <Section title="model performance">
          {data.modelBreakdown.length === 0 ? (
            <Empty>No data yet. Run some searches at /</Empty>
          ) : (
            <table style={tableStyle}>
              <thead>
                <tr>
                  <Th>model</Th>
                  <Th align="right">queries</Th>
                  <Th align="right">success rate</Th>
                  <Th align="right">avg latency</Th>
                  <Th>distribution</Th>
                </tr>
              </thead>
              <tbody>
                {data.modelBreakdown.map((row) => {
                  const share = row.total / Math.max(data.totalLast7d, 1);
                  return (
                    <tr key={row.model} style={trStyle}>
                      <Td>
                        <span style={{ color: "#e2e8f0" }}>
                          {shortenModel(row.model)}
                        </span>
                      </Td>
                      <Td align="right">{row.total}</Td>
                      <Td align="right">
                        <span
                          style={{
                            color:
                              row.successRate >= 0.9
                                ? "#86efac"
                                : row.successRate >= 0.7
                                ? "#fde68a"
                                : "#fca5a5",
                          }}
                        >
                          {(row.successRate * 100).toFixed(1)}%
                        </span>
                      </Td>
                      <Td align="right">{row.avgLatencyMs}ms</Td>
                      <Td>
                        <div
                          style={{
                            background: "#1e293b",
                            borderRadius: 4,
                            height: 6,
                            overflow: "hidden",
                            width: 160,
                          }}
                        >
                          <div
                            style={{
                              background: "#1a7a4a",
                              height: "100%",
                              width: `${share * 100}%`,
                            }}
                          />
                        </div>
                      </Td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </Section>

        {/* Top failing queries */}
        {data.topFailing.length > 0 && (
          <Section title="queries the ai struggled with (last 7d)">
            <table style={tableStyle}>
              <thead>
                <tr>
                  <Th>query</Th>
                  <Th align="right">failures</Th>
                </tr>
              </thead>
              <tbody>
                {data.topFailing.map((row, i) => (
                  <tr key={i} style={trStyle}>
                    <Td>
                      <code style={{ color: "#fde68a", fontSize: 12 }}>
                        {row.query}
                      </code>
                    </Td>
                    <Td align="right">{row.count}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>
        )}

        {/* Recent activity */}
        <Section title="recent activity (last 50)">
          {data.recent.length === 0 ? (
            <Empty>No queries logged yet.</Empty>
          ) : (
            <table style={tableStyle}>
              <thead>
                <tr>
                  <Th>time</Th>
                  <Th>query</Th>
                  <Th>model</Th>
                  <Th align="right">latency</Th>
                  <Th align="right">status</Th>
                </tr>
              </thead>
              <tbody>
                {data.recent.map((row) => (
                  <tr key={row.id} style={trStyle}>
                    <Td>
                      <span style={{ color: "#64748b", fontSize: 11 }}>
                        {formatTime(row.createdAt)}
                      </span>
                    </Td>
                    <Td>
                      <code style={{ fontSize: 12, color: "#e2e8f0" }}>
                        {truncate(row.query, 60)}
                      </code>
                    </Td>
                    <Td>
                      <span style={{ fontSize: 11, color: "#94a3b8" }}>
                        {row.model ? shortenModel(row.model) : "—"}
                      </span>
                    </Td>
                    <Td align="right">{row.latencyMs}ms</Td>
                    <Td align="right">
                      <span
                        style={{
                          fontSize: 11,
                          padding: "1px 8px",
                          borderRadius: 4,
                          background: row.success ? "#064e3b" : "#7f1d1d",
                          color: row.success ? "#86efac" : "#fca5a5",
                        }}
                      >
                        {row.success ? "ok" : "fail"}
                      </span>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </Section>

        <p
          style={{
            fontSize: 11,
            color: "#475569",
            marginTop: 32,
            textAlign: "center",
          }}
        >
          dashboard regenerates on every request · cached for 0 seconds
        </p>
      </div>
    </div>
  );
}

// Components

function Stat({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "good" | "warn" | "bad";
}) {
  const accent = {
    neutral: "#94a3b8",
    good: "#86efac",
    warn: "#fde68a",
    bad: "#fca5a5",
  }[tone];

  return (
    <div
      style={{
        background: "#1e293b",
        border: "1px solid #334155",
        borderRadius: 8,
        padding: "14px 16px",
      }}
    >
      <p style={{ fontSize: 11, color: "#64748b", margin: "0 0 6px" }}>{label}</p>
      <p
        style={{
          fontSize: 22,
          fontWeight: 700,
          color: accent,
          margin: 0,
          letterSpacing: "-0.02em",
        }}
      >
        {value}
      </p>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ marginBottom: 28 }}>
      <h2
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: "#94a3b8",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          margin: "0 0 12px",
        }}
      >
        {title}
      </h2>
      <div
        style={{
          background: "#1e293b",
          border: "1px solid #334155",
          borderRadius: 8,
          padding: "8px 16px",
          overflowX: "auto",
        }}
      >
        {children}
      </div>
    </div>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        fontSize: 13,
        color: "#64748b",
        textAlign: "center",
        padding: "20px 0",
        margin: 0,
      }}
    >
      {children}
    </p>
  );
}

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  fontSize: 13,
};

const trStyle: React.CSSProperties = {
  borderTop: "1px solid #334155",
};

function Th({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      style={{
        textAlign: align,
        padding: "10px 8px",
        fontSize: 11,
        fontWeight: 600,
        color: "#64748b",
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <td
      style={{
        textAlign: align,
        padding: "10px 8px",
        color: "#cbd5e1",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </td>
  );
}

// Helpers

function shortenModel(model: string): string {
  // "meta-llama/llama-3.3-70b-instruct:free" -> "llama-3.3-70b"
  const base = model.split("/").pop() ?? model;
  return base.replace(/-instruct.*$/, "").replace(/:free$/, "");
}

function truncate(s: string, max: number): string {
  return s.length <= max ? s : `${s.slice(0, max)}...`;
}

function formatTime(d: Date): string {
  const now = Date.now();
  const diff = now - d.getTime();
  if (diff < 60_000) return "just now";
  if (diff < 3600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86400_000) return `${Math.floor(diff / 3600_000)}h ago`;
  return `${Math.floor(diff / 86400_000)}d ago`;
}
