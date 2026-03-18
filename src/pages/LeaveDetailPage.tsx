import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { leaveAPI } from "../services/api";
import { type Leave } from "../types";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";

const LeaveDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [leave, setLeave] = useState<Leave | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (id)
      leaveAPI
        .getById(id)
        .then((r) => setLeave(r.data.leave))
        .catch(() => navigate(-1))
        .finally(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    if (!leave || !window.confirm("Cancel this leave request?")) return;
    setCancelling(true);
    try {
      await leaveAPI.cancel(leave._id);
      toast.success("Leave cancelled");
      setLeave((l) => (l ? { ...l, status: "cancelled" } : l));
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setCancelling(false);
    }
  };

  if (loading)
    return (
      <div className="loading-page">
        <div
          className="spinner"
          style={{ borderColor: "#e2e8f0", borderTopColor: "#2563eb" }}
        ></div>
      </div>
    );
  if (!leave) return null;

  const lt = leave.leaveTypeId as any;
  const reviewer = leave.reviewedBy as any;
  const managerReviewer = leave.managerApprovedBy as any;
  const statusColors: Record<string, string> = {
    pending_manager: "#d97706",
    pending_admin: "#7c3aed",
    approved: "#16a34a",
    rejected: "#dc2626",
    cancelled: "#64748b",
  };
  const statusLabels: Record<string, string> = {
    pending_manager: "Pending Review",
    pending_admin: "Manager Approved — Awaiting Admin",
    approved: "Approved",
    rejected: "Rejected",
    cancelled: "Cancelled",
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 28,
        }}
      >
        <button
          onClick={() => navigate(-1)}
          className="btn btn-secondary btn-sm"
        >
          ← Back
        </button>
        <div>
          <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: 24 }}>
            Leave Request Details
          </h1>
          <p style={{ color: "#64748b", fontSize: 13 }}>
            Applied {format(new Date(leave.appliedOn), "MMMM d, yyyy")}
          </p>
        </div>
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24 }}
      >
        <div className="card">
          {/* Status banner */}
          <div
            style={{
              padding: "16px 20px",
              borderRadius: 10,
              marginBottom: 28,
              background: `${statusColors[leave.status]}15`,
              border: `1px solid ${statusColors[leave.status]}30`,
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 12,
                height: 12,
                borderRadius: "50%",
                background: statusColors[leave.status],
              }}
            ></div>
            <div>
              <div
                style={{ fontWeight: 600, color: statusColors[leave.status] }}
              >
                {statusLabels[leave.status]}
              </div>
              {leave.status === "pending_admin" && managerReviewer && (
                <div style={{ fontSize: 12, color: "#64748b" }}>
                  Manager {managerReviewer.firstName} {managerReviewer.lastName}{" "}
                  approved on{" "}
                  {leave.managerApprovedOn
                    ? format(
                        new Date(leave.managerApprovedOn),
                        "MMM d, yyyy h:mm a",
                      )
                    : ""}
                </div>
              )}
              {leave.reviewedOn && (
                <div style={{ fontSize: 12, color: "#64748b" }}>
                  Final review on{" "}
                  {format(new Date(leave.reviewedOn), "MMM d, yyyy")}
                  {reviewer
                    ? ` by ${reviewer.firstName} ${reviewer.lastName}`
                    : ""}
                </div>
              )}
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 20,
              marginBottom: 24,
            }}
          >
            {[
              {
                label: "Leave Type",
                value: (
                  <span
                    style={{ display: "flex", alignItems: "center", gap: 6 }}
                  >
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: lt?.color,
                        display: "inline-block",
                      }}
                    ></span>
                    {lt?.name}
                  </span>
                ),
              },
              {
                label: "Duration",
                value: `${leave.totalDays} day${leave.totalDays !== 1 ? "s" : ""}${leave.isHalfDay ? ` (Half Day - ${leave.halfDayPeriod})` : ""}`,
              },
              {
                label: "Start Date",
                value: format(new Date(leave.startDate), "EEEE, MMMM d, yyyy"),
              },
              {
                label: "End Date",
                value: format(new Date(leave.endDate), "EEEE, MMMM d, yyyy"),
              },
            ].map((item) => (
              <div
                key={item.label}
                style={{
                  padding: "14px",
                  background: "#f8fafc",
                  borderRadius: 10,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: "#94a3b8",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: 6,
                  }}
                >
                  {item.label}
                </div>
                <div
                  style={{ fontSize: 14, fontWeight: 500, color: "#0f172a" }}
                >
                  {item.value}
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 20 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "#64748b",
                marginBottom: 8,
              }}
            >
              Reason
            </div>
            <div
              style={{
                padding: "14px",
                background: "#f8fafc",
                borderRadius: 10,
                fontSize: 14,
                color: "#334155",
                lineHeight: 1.6,
              }}
            >
              {leave.reason}
            </div>
          </div>

          {leave.adminComment && (
            <div style={{ marginBottom: 20 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#64748b",
                  marginBottom: 8,
                }}
              >
                Admin Comment
              </div>
              <div
                style={{
                  padding: "14px",
                  background: "#fffbeb",
                  borderRadius: 10,
                  fontSize: 14,
                  color: "#334155",
                  border: "1px solid #fde68a",
                }}
              >
                {leave.adminComment}
              </div>
            </div>
          )}

          {leave.attachments && leave.attachments.length > 0 && (
            <div>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#64748b",
                  marginBottom: 8,
                }}
              >
                Attachments
              </div>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {leave.attachments.map((att, i) => (
                  <a
                    key={i}
                    href={`/${att}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary btn-sm"
                  >
                    📎 Document {i + 1}
                  </a>
                ))}
              </div>
            </div>
          )}

          {leave.status === "pending_manager" && (
            <div
              style={{
                marginTop: 24,
                paddingTop: 20,
                borderTop: "1px solid #f1f5f9",
              }}
            >
              <button
                onClick={handleCancel}
                className="btn btn-danger btn-sm"
                disabled={cancelling}
              >
                {cancelling ? (
                  <>
                    <div className="spinner"></div>Cancelling...
                  </>
                ) : (
                  "✕ Cancel Request"
                )}
              </button>
            </div>
          )}
        </div>

        {/* Timeline */}
        <div className="card" style={{ height: "fit-content" }}>
          <h3 style={{ fontSize: 15, marginBottom: 20 }}>Timeline</h3>
          <div style={{ position: "relative" }}>
            {[
              {
                icon: "📤",
                label: "Submitted",
                date: leave.appliedOn,
                done: true,
                sub: null,
              },
              {
                icon: ["pending_admin", "approved"].includes(leave.status)
                  ? "✅"
                  : leave.status === "rejected" && leave.managerApprovedOn
                    ? "✅"
                    : leave.status === "rejected"
                      ? "❌"
                      : "⏳",
                label: ["pending_admin", "approved"].includes(leave.status)
                  ? "Manager Approved"
                  : leave.status === "rejected" && !leave.managerApprovedOn
                    ? "Rejected"
                    : leave.status === "rejected" && leave.managerApprovedOn
                      ? "Manager Approved"
                      : "Awaiting Manager",
                date:
                  leave.managerApprovedOn ||
                  (leave.status === "rejected" && !leave.managerApprovedOn
                    ? leave.reviewedOn
                    : undefined),
                done:
                  ["pending_admin", "approved"].includes(leave.status) ||
                  !!leave.managerApprovedOn,
                sub: leave.managerApprovedBy
                  ? `by ${(leave.managerApprovedBy as any).firstName} ${(leave.managerApprovedBy as any).lastName}`
                  : null,
              },
              {
                icon:
                  leave.status === "approved"
                    ? "✅"
                    : leave.status === "rejected"
                      ? "❌"
                      : "⏳",
                label:
                  leave.status === "approved"
                    ? "Admin Approved ✅"
                    : leave.status === "rejected" && leave.managerApprovedOn
                      ? "Admin Rejected"
                      : leave.status === "rejected"
                        ? "Rejected"
                        : "Awaiting Admin",
                date: leave.reviewedOn,
                done:
                  ["approved", "rejected"].includes(leave.status) &&
                  !!leave.reviewedOn,
                sub: reviewer
                  ? `by ${reviewer.firstName} ${reviewer.lastName}`
                  : null,
              },
            ].map((event, i, arr) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 14,
                  marginBottom: i < arr.length - 1 ? 20 : 0,
                  position: "relative",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: "50%",
                      background: event.done ? "#eff6ff" : "#f8fafc",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 16,
                      border: `2px solid ${event.done ? "#2563eb" : "#e2e8f0"}`,
                    }}
                  >
                    {event.icon}
                  </div>
                  {i < arr.length - 1 && (
                    <div
                      style={{
                        width: 2,
                        height: 28,
                        background: "#e2e8f0",
                        margin: "4px 0",
                      }}
                    ></div>
                  )}
                </div>
                <div style={{ paddingTop: 6 }}>
                  <div
                    style={{ fontSize: 14, fontWeight: 500, color: "#0f172a" }}
                  >
                    {event.label}
                  </div>
                  {event.sub && (
                    <div
                      style={{
                        fontSize: 11,
                        color: "#7c3aed",
                        fontWeight: 500,
                      }}
                    >
                      {event.sub}
                    </div>
                  )}
                  {event.date && (
                    <div style={{ fontSize: 12, color: "#64748b" }}>
                      {format(new Date(event.date), "MMM d, yyyy h:mm a")}
                    </div>
                  )}
                  {!event.date && !event.done && (
                    <div style={{ fontSize: 12, color: "#94a3b8" }}>
                      Pending...
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          {leave.managerComment && (
            <div
              style={{
                marginTop: 16,
                padding: "10px 12px",
                background: "#f5f3ff",
                borderRadius: 8,
                border: "1px solid #ddd6fe",
                fontSize: 13,
              }}
            >
              <div
                style={{ fontWeight: 600, color: "#7c3aed", marginBottom: 3 }}
              >
                Manager Comment
              </div>
              <div style={{ color: "#334155" }}>{leave.managerComment}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaveDetailPage;
