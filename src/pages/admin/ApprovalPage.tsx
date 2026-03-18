import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { leaveAPI } from "../../services/api";
import { type Leave } from "../../types";
import { format } from "date-fns";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";

const ApprovalPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [leave, setLeave] = useState<Leave | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState<"approved" | "rejected" | null>(
    null,
  );

  useEffect(() => {
    if (id)
      leaveAPI
        .getById(id)
        .then((r) => setLeave(r.data.leave))
        .catch(() => navigate("/admin/pending"))
        .finally(() => setLoading(false));
  }, [id]);

  const handleAction = async (action: "approved" | "rejected") => {
    if (!leave) return;
    if (action === "rejected" && !comment.trim()) {
      toast.error("Please add a comment when rejecting");
      return;
    }
    setSubmitting(action);
    try {
      await leaveAPI.review(leave._id, { action, comment });
      toast.success(`Leave ${action} successfully`);
      navigate("/admin/pending");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Action failed");
    } finally {
      setSubmitting(null);
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

  const u = leave.userId as any;
  const lt = leave.leaveTypeId as any;
  const managerReviewer = (leave as any).managerApprovedBy as any;

  const isManager = user?.role === "manager";
  const isAdmin = user?.role === "admin";
  const status = leave.status;

  // ── Who can act ──────────────────────────────────────────────
  // Manager : buttons shown when status = pending_manager
  // Admin   : buttons shown when status = pending_manager OR pending_admin
  // ─────────────────────────────────────────────────────────────
  const canAct =
    (isManager && status === "pending_manager") ||
    (isAdmin && (status === "pending_manager" || status === "pending_admin"));

  const statusColors: Record<string, string> = {
    pending_manager: "#d97706",
    pending_admin: "#7c3aed",
    approved: "#16a34a",
    rejected: "#dc2626",
    cancelled: "#64748b",
  };
  const statusLabels: Record<string, string> = {
    pending_manager: "⏳ Awaiting Manager Approval",
    pending_admin: "🟣 Manager Approved — Awaiting Admin Final Approval",
    approved: "✅ Fully Approved",
    rejected: "❌ Rejected",
    cancelled: "🚫 Cancelled",
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
          onClick={() => navigate("/admin/pending")}
          className="btn btn-secondary btn-sm"
        >
          ← Back
        </button>
        <div>
          <h1 style={{ fontFamily: "Playfair Display, serif", fontSize: 24 }}>
            Leave Approval
          </h1>
          <p style={{ color: "#64748b", fontSize: 13 }}>
            Review and take action on this request
          </p>
        </div>
      </div>

      {/* Status banner */}
      <div
        style={{
          padding: "12px 18px",
          borderRadius: 10,
          marginBottom: 16,
          background: `${statusColors[status]}12`,
          border: `1.5px solid ${statusColors[status]}40`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: statusColors[status],
            }}
          />
          <span
            style={{
              fontWeight: 600,
              color: statusColors[status],
              fontSize: 14,
            }}
          >
            {statusLabels[status]}
          </span>
        </div>
        {status === "pending_admin" && managerReviewer && (
          <span
            style={{
              fontSize: 12,
              color: "#7c3aed",
              background: "#f5f3ff",
              padding: "3px 10px",
              borderRadius: 6,
              border: "1px solid #ddd6fe",
            }}
          >
            ✅ Manager {managerReviewer.firstName} {managerReviewer.lastName}{" "}
            approved
          </span>
        )}
      </div>

      {/* Context hint banners */}
      {isManager && status === "pending_admin" && (
        <div
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            marginBottom: 14,
            background: "#fef9c3",
            border: "1px solid #fde047",
            fontSize: 13,
            color: "#713f12",
          }}
        >
          ⚠️ You already approved this leave. It is now{" "}
          <strong>waiting for admin final approval</strong>.
        </div>
      )}
      {isAdmin && status === "pending_manager" && (
        <div
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            marginBottom: 14,
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            fontSize: 13,
            color: "#1e40af",
          }}
        >
          ℹ️ No manager review yet. As admin you can{" "}
          <strong>approve directly</strong> or reject.
        </div>
      )}
      {isAdmin && status === "pending_admin" && (
        <div
          style={{
            padding: "10px 14px",
            borderRadius: 8,
            marginBottom: 14,
            background: "#f5f3ff",
            border: "1px solid #ddd6fe",
            fontSize: 13,
            color: "#5b21b6",
          }}
        >
          🟣 Manager approved. <strong>Your final approval is required</strong>.
        </div>
      )}

      <div
        style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 24 }}
      >
        {/* ── Left: details + action ── */}
        <div className="card">
          {/* Employee info */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              padding: "16px",
              background: "#f8fafc",
              borderRadius: 12,
              marginBottom: 24,
            }}
          >
            <div
              style={{
                width: 52,
                height: 52,
                borderRadius: "50%",
                background: "#2563eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontWeight: 700,
                fontSize: 18,
              }}
            >
              {u?.firstName?.[0]}
              {u?.lastName?.[0]}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>
                {u?.firstName} {u?.lastName}
              </div>
              <div style={{ fontSize: 13, color: "#64748b" }}>
                {u?.position} · {u?.department}
              </div>
              <div style={{ fontSize: 12, color: "#94a3b8" }}>{u?.email}</div>
            </div>
          </div>

          {/* Info grid */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
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
                label: "Total Days",
                value: `${leave.totalDays} day${leave.totalDays !== 1 ? "s" : ""}${leave.isHalfDay ? " (Half)" : ""}`,
              },
              {
                label: "Start Date",
                value: format(new Date(leave.startDate), "EEEE, MMM d, yyyy"),
              },
              {
                label: "End Date",
                value: format(new Date(leave.endDate), "EEEE, MMM d, yyyy"),
              },
              {
                label: "Applied On",
                value: format(new Date(leave.appliedOn), "MMM d, yyyy, h:mm a"),
              },
              {
                label: "Status",
                value: (
                  <span className={`badge badge-${status}`}>
                    {statusLabels[status]}
                  </span>
                ),
              },
            ].map((item) => (
              <div
                key={item.label}
                style={{ background: "#f8fafc", padding: 14, borderRadius: 10 }}
              >
                <div
                  style={{
                    fontSize: 11,
                    color: "#94a3b8",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginBottom: 4,
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

          {/* Reason */}
          <div style={{ marginBottom: 20 }}>
            <div
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: "#64748b",
                marginBottom: 8,
              }}
            >
              Reason for Leave
            </div>
            <div
              style={{
                padding: 14,
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

          {/* Attachments */}
          {leave.attachments && leave.attachments.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: "#64748b",
                  marginBottom: 8,
                }}
              >
                Supporting Documents
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {leave.attachments.map((att, i) => (
                  <a
                    key={i}
                    href={`http://localhost:5000/${att}`}
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

          {/* Manager comment */}
          {(leave as any).managerComment &&
            (leave as any).managerComment !== "Self-submitted" && (
              <div
                style={{
                  padding: 14,
                  background: "#f5f3ff",
                  borderRadius: 10,
                  border: "1px solid #ddd6fe",
                  marginBottom: 16,
                }}
              >
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#7c3aed",
                    marginBottom: 4,
                  }}
                >
                  Manager Comment
                </div>
                <div style={{ fontSize: 14, color: "#334155" }}>
                  {(leave as any).managerComment}
                </div>
              </div>
            )}

          {/* ══ ACTION BUTTONS ══
              Shown to manager when: status = pending_manager
              Shown to admin when:   status = pending_manager OR pending_admin  */}
          {canAct && (
            <div style={{ borderTop: "1px solid #f1f5f9", paddingTop: 20 }}>
              <div className="form-group">
                <label className="form-label">
                  {isManager ? "Manager" : "Admin"} Comment
                  <span
                    style={{ color: "#94a3b8", fontSize: 12, marginLeft: 6 }}
                  >
                    (optional for approval · required for rejection)
                  </span>
                </label>
                <textarea
                  className="form-input"
                  placeholder="Add a comment (required for rejection)..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  style={{ minHeight: 80 }}
                />
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <button
                  onClick={() => handleAction("approved")}
                  className="btn btn-success"
                  disabled={!!submitting}
                >
                  {submitting === "approved" ? (
                    <>
                      <div className="spinner"></div> Approving...
                    </>
                  ) : isManager ? (
                    "✅ Approve (Level 1)"
                  ) : status === "pending_admin" ? (
                    "✅ Final Approve"
                  ) : (
                    "✅ Approve"
                  )}
                </button>
                <button
                  onClick={() => handleAction("rejected")}
                  className="btn btn-danger"
                  disabled={!!submitting}
                >
                  {submitting === "rejected" ? (
                    <>
                      <div className="spinner"></div> Rejecting...
                    </>
                  ) : (
                    "❌ Reject"
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Final admin comment (read-only after decision) */}
          {!canAct && leave.adminComment && (
            <div
              style={{
                padding: 14,
                background: "#fffbeb",
                borderRadius: 10,
                border: "1px solid #fde68a",
                marginTop: 16,
              }}
            >
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>
                Admin Comment
              </div>
              <div style={{ fontSize: 14, color: "#334155" }}>
                {leave.adminComment}
              </div>
            </div>
          )}
        </div>

        {/* ── Right: Policy ── */}
        {lt && (
          <div className="card" style={{ height: "fit-content" }}>
            <h3 style={{ fontSize: 15, marginBottom: 16 }}>
              Leave Type Policy
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {[
                { label: "Type", value: lt.name },
                {
                  label: "Default Allocation",
                  value: `${lt.defaultDays} days/year`,
                },
                {
                  label: "Max Consecutive",
                  value: `${lt.maxConsecutiveDays} days`,
                },
                {
                  label: "Notice Required",
                  value: `${lt.minNoticeDays} day${lt.minNoticeDays !== 1 ? "s" : ""}`,
                },
                {
                  label: "Document Required",
                  value: lt.requiresDocument ? "Yes" : "No",
                },
                {
                  label: "Carry Forward",
                  value: lt.carryForward
                    ? `Yes (max ${lt.maxCarryForwardDays} days)`
                    : "No",
                },
              ].map((item) => (
                <div
                  key={item.label}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "8px 0",
                    borderBottom: "1px solid #f1f5f9",
                    fontSize: 13,
                  }}
                >
                  <span style={{ color: "#64748b" }}>{item.label}</span>
                  <span style={{ fontWeight: 500, color: "#0f172a" }}>
                    {item.value}
                  </span>
                </div>
              ))}
            </div>
            {lt.description && (
              <div
                style={{
                  marginTop: 14,
                  padding: 12,
                  background: "#f8fafc",
                  borderRadius: 8,
                  fontSize: 13,
                  color: "#475569",
                }}
              >
                {lt.description}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ApprovalPage;
