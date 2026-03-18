import React, { useState, useEffect } from "react";
import { Link } from "react-router";
import { leaveAPI } from "../services/api";
import { type Leave } from "../types";
import { format } from "date-fns";

const LeaveHistoryPage = () => {
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "",
    year: new Date().getFullYear().toString(),
  });
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const load = async () => {
    setLoading(true);
    try {
      const res = await leaveAPI.getMy({ ...filters, page, limit: 10 });
      setLeaves(res.data.leaves);
      setTotal(res.data.total);
      setTotalPages(res.data.totalPages);
    } catch {}
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [filters, page]);

  const exportCSV = () => {
    const rows = [
      [
        "Date Applied",
        "Leave Type",
        "Start",
        "End",
        "Days",
        "Status",
        "Reason",
      ],
    ];
    leaves.forEach((l) => {
      const lt = l.leaveTypeId as any;
      rows.push([
        format(new Date(l.appliedOn), "MMM d yyyy"),
        lt?.name || "",
        format(new Date(l.startDate), "MMM d yyyy"),
        format(new Date(l.endDate), "MMM d yyyy"),
        String(l.totalDays),
        l.status,
        l.reason,
      ]);
    });
    const csv = rows.map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "leave-history.csv";
    a.click();
  };

  const statusLabels: Record<string, string> = {
    pending_manager: "Pending Manager",
    pending_admin: "Pending Admin",
    approved: "Approved",
    rejected: "Rejected",
    cancelled: "Cancelled",
  };
  const statusBadge = (s: string) => (
    <span className={`badge badge-${s}`}>{statusLabels[s] || s}</span>
  );

  return (
    <div>
      <div
        className="page-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <div>
          <h1>Leave History</h1>
          <p>Your past and current leave requests · {total} total</p>
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={exportCSV} className="btn btn-secondary btn-sm">
            📥 Export CSV
          </button>
          <Link to="/leaves/new" className="btn btn-primary btn-sm">
            + Apply Leave
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label className="form-label">Status</label>
            <select
              className="form-input"
              style={{ width: 160 }}
              value={filters.status}
              onChange={(e) => {
                setFilters((f) => ({ ...f, status: e.target.value }));
                setPage(1);
              }}
            >
              <option value="">All Status</option>
              {[
                "pending_manager",
                "pending_admin",
                "approved",
                "rejected",
                "cancelled",
              ].map((s) => {
                const labels: Record<string, string> = {
                  pending_manager: "Pending (Manager)",
                  pending_admin: "Pending (Admin)",
                  approved: "Approved",
                  rejected: "Rejected",
                  cancelled: "Cancelled",
                };
                return (
                  <option key={s} value={s}>
                    {labels[s]}
                  </option>
                );
              })}
            </select>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label className="form-label">Year</label>
            <select
              className="form-input"
              style={{ width: 120 }}
              value={filters.year}
              onChange={(e) => {
                setFilters((f) => ({ ...f, year: e.target.value }));
                setPage(1);
              }}
            >
              {[2025, 2024, 2023].map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
          <button
            className="btn btn-secondary btn-sm"
            style={{ alignSelf: "flex-end" }}
            onClick={() => {
              setFilters({
                status: "",
                year: new Date().getFullYear().toString(),
              });
              setPage(1);
            }}
          >
            Clear
          </button>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ textAlign: "center", padding: 40 }}>
            <div
              className="spinner"
              style={{
                width: 28,
                height: 28,
                borderColor: "#e2e8f0",
                borderTopColor: "#2563eb",
                margin: "auto",
              }}
            ></div>
          </div>
        ) : leaves.length === 0 ? (
          <div className="empty-state">
            <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
            <h3>No leaves found</h3>
            <p>Try changing filters or apply for a leave</p>
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Leave Type</th>
                <th>Duration</th>
                <th>Days</th>
                <th>Applied On</th>
                <th>Status</th>
                <th>Comment</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {leaves.map((leave) => {
                const lt = leave.leaveTypeId as any;
                return (
                  <tr key={leave._id}>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <div
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            background: lt?.color || "#2563eb",
                            flexShrink: 0,
                          }}
                        ></div>
                        <span style={{ fontWeight: 500 }}>{lt?.name}</span>
                        {leave.isHalfDay && (
                          <span
                            style={{
                              fontSize: 11,
                              background: "#f1f5f9",
                              padding: "2px 6px",
                              borderRadius: 4,
                            }}
                          >
                            Half Day
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontSize: 13 }}>
                        {format(new Date(leave.startDate), "MMM d")} –{" "}
                        {format(new Date(leave.endDate), "MMM d, yyyy")}
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{leave.totalDays}</td>
                    <td style={{ fontSize: 13, color: "#64748b" }}>
                      {format(new Date(leave.appliedOn), "MMM d, yyyy")}
                    </td>
                    <td>{statusBadge(leave.status)}</td>
                    <td
                      style={{
                        fontSize: 12,
                        color: "#64748b",
                        maxWidth: 200,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {leave.adminComment || "—"}
                    </td>
                    <td>
                      <div style={{ display: "flex", gap: 6 }}>
                        <Link
                          to={`/leaves/${leave._id}`}
                          className="btn btn-secondary btn-sm"
                        >
                          View
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {totalPages > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 8,
              marginTop: 20,
              paddingTop: 16,
              borderTop: "1px solid #f1f5f9",
            }}
          >
            <button
              className="btn btn-secondary btn-sm"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              ← Prev
            </button>
            <span
              style={{ padding: "6px 14px", fontSize: 14, color: "#475569" }}
            >
              Page {page} of {totalPages}
            </span>
            <button
              className="btn btn-secondary btn-sm"
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next →
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaveHistoryPage;
