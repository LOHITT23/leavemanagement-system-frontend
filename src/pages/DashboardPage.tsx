import React, { useEffect, useState } from "react";
import { Link } from "react-router";
import { useAuth } from "../context/AuthContext";
import { reportAPI } from "../services/api";
import type { Leave, DashboardStats, LeaveBalance } from "../types";
import { format } from "date-fns";

const statusLabels: Record<string, string> = {
  pending_manager: "Pending Manager",
  pending_admin: "Pending Admin",
  approved: "Approved",
  rejected: "Rejected",
  cancelled: "Cancelled",
};
const StatusBadge = ({ status }: { status: string }) => (
  <span className={`badge badge-${status}`}>
    {statusLabels[status] || status}
  </span>
);

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({});
  const [recentLeaves, setRecentLeaves] = useState<Leave[]>([]);
  const [leaveBalances, setLeaveBalances] = useState<LeaveBalance[]>([]);
  const [loading, setLoading] = useState(true);
  const isAdmin = ["admin", "manager"].includes(user?.role || "");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await reportAPI.getDashboard();
        setStats(res.data.stats);
        setRecentLeaves(res.data.recentLeaves || []);
        setLeaveBalances(res.data.leaveBalances || []);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  if (loading)
    return (
      <div className="loading-page">
        <div
          className="spinner"
          style={{ borderColor: "#e2e8f0", borderTopColor: "#2563eb" }}
        ></div>
      </div>
    );

  const adminStatCards = [
    {
      icon: "👥",
      label: "Total Employees",
      value: stats.totalUsers ?? 0,
      bg: "#eff6ff",
      color: "#2563eb",
    },
    {
      icon: "⏳",
      label: "Pending Requests",
      value: stats.pendingLeaves ?? 0,
      bg: "#fffbeb",
      color: "#d97706",
    },
    {
      icon: "✅",
      label: "Approved This Year",
      value: stats.approvedThisYear ?? 0,
      bg: "#f0fdf4",
      color: "#16a34a",
    },
    {
      icon: "🏷️",
      label: "Leave Types",
      value: stats.totalLeaveTypes ?? 0,
      bg: "#fdf4ff",
      color: "#9333ea",
    },
  ];

  const userStatCards = [
    {
      icon: "⏳",
      label: "Pending",
      value: stats.myPending ?? 0,
      bg: "#fffbeb",
      color: "#d97706",
    },
    {
      icon: "✅",
      label: "Approved",
      value: stats.myApproved ?? 0,
      bg: "#f0fdf4",
      color: "#16a34a",
    },
    {
      icon: "❌",
      label: "Rejected",
      value: stats.myRejected ?? 0,
      bg: "#fef2f2",
      color: "#dc2626",
    },
  ];

  const cards = isAdmin ? adminStatCards : userStatCards;

  return (
    <div>
      <div
        className="page-header"
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <div>
          <h1>
            Good{" "}
            {new Date().getHours() < 12
              ? "morning"
              : new Date().getHours() < 17
                ? "afternoon"
                : "evening"}
            , {user?.firstName}! 👋
          </h1>
          <p>
            {format(new Date(), "EEEE, MMMM d, yyyy")} · {user?.department} ·{" "}
            {user?.position}
          </p>
        </div>
        <Link to="/leaves/new" className="btn btn-primary">
          ✏️ Apply Leave
        </Link>
      </div>

      {/* Stats */}
      <div className={`grid grid-${cards.length} mb-4`}>
        {cards.map((card) => (
          <div key={card.label} className="stat-card">
            <div className="stat-icon" style={{ background: card.bg }}>
              <span>{card.icon}</span>
            </div>
            <div className="stat-value" style={{ color: card.color }}>
              {card.value}
            </div>
            <div className="stat-label">{card.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
        {/* Recent Leaves */}
        <div className="card">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <h3 style={{ fontSize: 16, color: "#0f172a" }}>
              {isAdmin ? "Recent Pending Requests" : "My Recent Leaves"}
            </h3>
            <Link
              to={isAdmin ? "/admin/pending" : "/leaves/history"}
              style={{ fontSize: 13, color: "#2563eb", textDecoration: "none" }}
            >
              View all →
            </Link>
          </div>
          {recentLeaves.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: 40, marginBottom: 12 }}>📋</div>
              <h3>No leaves yet</h3>
              <p>No leave requests found</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {recentLeaves.map((leave) => {
                const lt = leave.leaveTypeId as any;
                const u = leave.userId as any;
                return (
                  <Link
                    to={
                      isAdmin
                        ? `/admin/approve/${leave._id}`
                        : `/leaves/${leave._id}`
                    }
                    key={leave._id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px",
                      background: "#f8fafc",
                      borderRadius: 10,
                      textDecoration: "none",
                      border: "1px solid #e2e8f0",
                      transition: "background 0.15s",
                    }}
                  >
                    <div
                      style={{ display: "flex", alignItems: "center", gap: 10 }}
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
                      <div>
                        {isAdmin && (
                          <div
                            style={{
                              fontSize: 13,
                              fontWeight: 600,
                              color: "#0f172a",
                            }}
                          >
                            {u?.firstName} {u?.lastName}
                          </div>
                        )}
                        <div style={{ fontSize: 13, color: "#475569" }}>
                          {lt?.name} · {leave.totalDays} day
                          {leave.totalDays !== 1 ? "s" : ""}
                        </div>
                        <div style={{ fontSize: 11, color: "#94a3b8" }}>
                          {format(new Date(leave.startDate), "MMM d")} –{" "}
                          {format(new Date(leave.endDate), "MMM d, yyyy")}
                        </div>
                      </div>
                    </div>
                    <StatusBadge status={leave.status} />
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Leave Balance / Quick Actions */}
        <div>
          {!isAdmin && leaveBalances.length > 0 && (
            <div className="card mb-4">
              <h3 style={{ fontSize: 16, marginBottom: 16 }}>Leave Balance</h3>
              <div
                style={{ display: "flex", flexDirection: "column", gap: 12 }}
              >
                {leaveBalances.map((bal) => {
                  const lt = bal.leaveTypeId as any;
                  const pct =
                    bal.allocated > 0 ? (bal.used / bal.allocated) * 100 : 0;
                  return (
                    <div key={lt?._id || String(bal.leaveTypeId)}>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginBottom: 6,
                          fontSize: 13,
                        }}
                      >
                        <span
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <span
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: "50%",
                              background: lt?.color || "#2563eb",
                              display: "inline-block",
                            }}
                          ></span>
                          {lt?.name || "Leave"}
                        </span>
                        <span style={{ color: "#475569" }}>
                          <b>{bal.remaining}</b> / {bal.allocated} days
                        </span>
                      </div>
                      <div
                        style={{
                          background: "#e2e8f0",
                          borderRadius: 4,
                          height: 6,
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${pct}%`,
                            background: lt?.color || "#2563eb",
                            height: "100%",
                            borderRadius: 4,
                            transition: "width 0.5s",
                          }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="card">
            <h3 style={{ fontSize: 16, marginBottom: 16 }}>Quick Actions</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[
                {
                  to: "/leaves/new",
                  icon: "✏️",
                  label: "Apply for Leave",
                  desc: "Submit a new request",
                },
                {
                  to: "/leaves/history",
                  icon: "📋",
                  label: "View History",
                  desc: "Past leave requests",
                },
                {
                  to: "/calendar",
                  icon: "📅",
                  label: "Team Calendar",
                  desc: "See who's on leave",
                },
                ...(isAdmin
                  ? [
                      {
                        to: "/admin/pending",
                        icon: "⏳",
                        label: "Pending Approvals",
                        desc: "Review requests",
                      },
                    ]
                  : []),
              ].map((a) => (
                <Link
                  to={a.to}
                  key={a.to}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px",
                    borderRadius: 10,
                    textDecoration: "none",
                    border: "1px solid #e2e8f0",
                    transition: "background 0.15s",
                    background: "white",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "#f8fafc")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "white")
                  }
                >
                  <span style={{ fontSize: 20 }}>{a.icon}</span>
                  <div>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 500,
                        color: "#0f172a",
                      }}
                    >
                      {a.label}
                    </div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>
                      {a.desc}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
