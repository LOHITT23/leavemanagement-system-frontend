import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
  ResponsiveContainer,
} from "recharts";
import api from "../services/api";

const MONTHS_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const ReportsPage: React.FC = () => {
  const [data, setData] = useState<{
    byType: Array<{
      name: string;
      color: string;
      total: number;
      count: number;
    }>;
    byDepartment: Array<{ department: string; total: number; count: number }>;
    byStatus: Array<{ _id: string; count: number }>;
    byMonth: Array<{ _id: { month: number }; total: number; count: number }>;
    topUsers: Array<{ name: string; department: string; total: number }>;
  } | null>(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState("");
  const [dept, setDept] = useState("");
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<string[]>([]);

  useEffect(() => {
    api
      .get("/organization")
      .then((r) => setDepartments(r.data.departments || []));
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ year: year.toString() });
    if (month) params.append("month", month);
    if (dept) params.append("department", dept);
    api
      .get(`/reports/analytics?${params}`)
      .then((r) => setData(r.data))
      .finally(() => setLoading(false));
  }, [year, month, dept]);

  const monthData = Array.from({ length: 12 }, (_, i) => {
    const found = data?.byMonth.find((m) => m._id.month === i + 1);
    return {
      month: MONTHS_SHORT[i],
      days: found?.total || 0,
      count: found?.count || 0,
    };
  });

  const statusColors: Record<string, string> = {
    pending: "#F59E0B",
    approved: "#10B981",
    rejected: "#EF4444",
    cancelled: "#94A3B8",
  };

  const exportPDF = () => {
    const content = `
LEAVE MANAGEMENT REPORT - ${year}${month ? ` (Month: ${month})` : ""}${dept ? ` (Dept: ${dept})` : ""}
Generated: ${new Date().toLocaleString()}

=== LEAVE BY TYPE ===
${data?.byType.map((t) => `${t.name}: ${t.total} days (${t.count} requests)`).join("\n") || "No data"}

=== LEAVE BY DEPARTMENT ===
${data?.byDepartment.map((d) => `${d.department}: ${d.total} days (${d.count} requests)`).join("\n") || "No data"}

=== TOP EMPLOYEES BY LEAVE ===
${data?.topUsers.map((u, i) => `${i + 1}. ${u.name} (${u.department}): ${u.total} days`).join("\n") || "No data"}
    `;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `leave-report-${year}.txt`;
    a.click();
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "24px",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div>
          <h1 className="page-title">Reports & Analytics</h1>
          <p className="page-subtitle">Leave data insights and summaries</p>
        </div>
        <button className="btn btn-outline" onClick={exportPDF}>
          📥 Export Report
        </button>
      </div>

      <div className="filter-bar">
        <select
          className="form-control"
          value={year}
          onChange={(e) => setYear(+e.target.value)}
        >
          {[2026, 2025, 2024, 2023].map((y) => (
            <option key={y}>{y}</option>
          ))}
        </select>
        <select
          className="form-control"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        >
          <option value="">All Months</option>
          {MONTHS_SHORT.map((m, i) => (
            <option key={i} value={i + 1}>
              {m}
            </option>
          ))}
        </select>
        <select
          className="form-control"
          value={dept}
          onChange={(e) => setDept(e.target.value)}
        >
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d}>{d}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div style={{ padding: "80px", textAlign: "center" }}>
          <div className="spinner" style={{ margin: "0 auto" }} />
        </div>
      ) : !data ? null : (
        <>
          {/* Stats summary */}
          <div className="stat-grid" style={{ marginBottom: "24px" }}>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: "#D1FAE5" }}>
                ✅
              </div>
              <div>
                <div className="stat-value">
                  {data.byStatus.find((s) => s._id === "approved")?.count || 0}
                </div>
                <div className="stat-label">Approved Requests</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: "#FEF3C7" }}>
                ⏳
              </div>
              <div>
                <div className="stat-value">
                  {data.byStatus.find((s) =>
                    ["pending_manager", "pending_admin"].includes(s._id),
                  )?.count || 0}
                </div>
                <div className="stat-label">Pending</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: "#EBF2FF" }}>
                📅
              </div>
              <div>
                <div className="stat-value">
                  {data.byType.reduce((acc, t) => acc + t.total, 0)}
                </div>
                <div className="stat-label">Total Days Used</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: "#FEE2E2" }}>
                ❌
              </div>
              <div>
                <div className="stat-value">
                  {data.byStatus.find((s) => s._id === "rejected")?.count || 0}
                </div>
                <div className="stat-label">Rejected</div>
              </div>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr",
              gap: "20px",
              marginBottom: "20px",
            }}
          >
            <div className="card">
              <div className="card-header">
                <span className="card-title">📊 Monthly Leave Trend</span>
              </div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={monthData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Bar
                      dataKey="days"
                      name="Days"
                      fill="#3D7EFF"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <span className="card-title">🍕 By Status</span>
              </div>
              <div className="card-body">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={data.byStatus}
                      dataKey="count"
                      nameKey="_id"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ payload }) => `${payload._id}: ${payload.count}`}
                    >
                      {data.byStatus.map((s) => (
                        <Cell
                          key={s._id}
                          fill={statusColors[s._id] || "#94A3B8"}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
              marginBottom: "20px",
            }}
          >
            <div className="card">
              <div className="card-header">
                <span className="card-title">🏷️ By Leave Type</span>
              </div>
              <div className="card-body">
                {data.byType.length === 0 ? (
                  <div
                    style={{
                      color: "var(--gray-500)",
                      textAlign: "center",
                      padding: "20px",
                    }}
                  >
                    No data
                  </div>
                ) : (
                  data.byType.map((t) => (
                    <div key={t.name} style={{ marginBottom: "12px" }}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: "4px",
                          fontSize: ".875rem",
                        }}
                      >
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <span
                            className="leave-type-dot"
                            style={{ background: t.color }}
                          />
                          {t.name}
                        </span>
                        <span style={{ fontWeight: 600 }}>
                          {t.total}d ({t.count})
                        </span>
                      </div>
                      <div className="progress">
                        <div
                          className="progress-bar"
                          style={{
                            width: `${Math.min((t.total / Math.max(...data.byType.map((x) => x.total))) * 100, 100)}%`,
                            background: t.color,
                          }}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="card">
              <div className="card-header">
                <span className="card-title">🏢 By Department</span>
              </div>
              <div className="card-body">
                {data.byDepartment.length === 0 ? (
                  <div
                    style={{
                      color: "var(--gray-500)",
                      textAlign: "center",
                      padding: "20px",
                    }}
                  >
                    No data
                  </div>
                ) : (
                  data.byDepartment.map((d) => (
                    <div
                      key={d.department}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        padding: "8px 0",
                        borderBottom: "1px solid var(--gray-100)",
                        fontSize: ".875rem",
                      }}
                    >
                      <span>{d.department}</span>
                      <span style={{ fontWeight: 600 }}>
                        {d.total} days ({d.count} req)
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {data.topUsers.length > 0 && (
            <div className="card">
              <div className="card-header">
                <span className="card-title">🏆 Top Leave Takers</span>
              </div>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Employee</th>
                      <th>Department</th>
                      <th>Days Taken</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topUsers.map((u, i) => (
                      <tr key={u.name}>
                        <td>
                          <span
                            style={{
                              fontWeight: 700,
                              color:
                                i < 3
                                  ? ["#FFD700", "#C0C0C0", "#CD7F32"][i]
                                  : "var(--gray-500)",
                            }}
                          >
                            #{i + 1}
                          </span>
                        </td>
                        <td style={{ fontWeight: 500 }}>{u.name}</td>
                        <td>{u.department}</td>
                        <td>
                          <strong>{u.total}</strong> days
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ReportsPage;
