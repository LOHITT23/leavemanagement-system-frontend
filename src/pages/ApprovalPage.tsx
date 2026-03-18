import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import api from "../services/api";
import type { Leave, User, LeaveType } from "../types";

const ApprovalPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [leave, setLeave] = useState<Leave | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [comment, setComment] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/leaves/${id}`)
      .then((r) => setLeave(r.data))
      .catch(() => setError("Leave not found"))
      .finally(() => setLoading(false));
  }, [id]);

  const handleAction = async (status: "approved" | "rejected") => {
    if (status === "rejected" && !comment.trim()) {
      setError("Please provide a reason for rejection");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await api.put(`/leaves/${id}/action`, { status, comment });
      navigate("/admin/pending", {
        state: { message: `Leave ${status} successfully.` },
      });
    } catch (err: unknown) {
      setError(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Action failed",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading)
    return (
      <div className="loading-screen" style={{ minHeight: 400 }}>
        <div className="spinner" />
      </div>
    );
  if (error && !leave) return <div className="alert alert-error">{error}</div>;
  if (!leave) return null;

  const lt = leave.leaveTypeId as LeaveType;
  const lu = leave.userId as User;
console.log("leave",leave);

  return (
    <div style={{ maxWidth: 700, margin: "0 auto" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "24px",
        }}
      >
        <button
          className="btn btn-secondary btn-sm"
          onClick={() => navigate(-1)}
        >
          ← Back
        </button>
        <h1 className="page-title" style={{ margin: 0 }}>
          Review Leave Request
        </h1>
      </div>

      {error && <div className="alert alert-error">⚠️ {error}</div>}

      {leave.status !== "pending_manager" && (
        <div
          className={`alert alert-${leave.status === "approved" ? "success" : "error"}`}
        >
          This request has already been {leave.status}.
        </div>
      )}

      <div className="card" style={{ marginBottom: "20px" }}>
        <div className="card-header">
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              className="leave-type-dot"
              style={{ background: lt?.color, width: 14, height: 14 }}
            />
            <span className="card-title">{lt?.name} Leave</span>
          </div>
          <span className={`badge badge-${leave.status}`}>{leave.status}</span>
        </div>
        <div className="card-body">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "20px",
              marginBottom: "20px",
            }}
          >
            {[
              { label: "Employee", val: lu?.firstName },
              { label: "Employee ID", val: lu?.employeeId || "-" },
              { label: "Department", val: lu?.department },
              { label: "Position", val: lu?.position },
              { label: "Leave Type", val: lt?.name },
              { label: "Duration", val: `${leave.totalDays} day(s)` },
              {
                label: "Start Date",
                val: new Date(leave.startDate).toLocaleDateString("en-US", {
                  weekday: "short",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                }),
              },
              {
                label: "End Date",
                val: leave.isHalfDay
                  ? `${leave.halfDayPeriod} half-day`
                  : new Date(leave.endDate).toLocaleDateString("en-US", {
                      weekday: "short",
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    }),
              },
            ].map((item) => (
              <div key={item.label}>
                <div
                  style={{
                    fontSize: ".8rem",
                    color: "var(--gray-500)",
                    marginBottom: "3px",
                    textTransform: "uppercase",
                    letterSpacing: ".04em",
                  }}
                >
                  {item.label}
                </div>
                <div style={{ fontWeight: 500 }}>{item.val}</div>
              </div>
            ))}
          </div>

          <div
            style={{
              padding: "14px",
              background: "var(--gray-50)",
              borderRadius: "var(--radius-sm)",
              marginBottom: "16px",
            }}
          >
            <div
              style={{
                fontSize: ".8rem",
                color: "var(--gray-500)",
                marginBottom: "4px",
                textTransform: "uppercase",
              }}
            >
              Reason
            </div>
            <p style={{ color: "var(--gray-700)" }}>{leave.reason}</p>
          </div>

          {leave.attachments && leave.attachments.length > 0 && (
            <div>
              <div
                style={{
                  fontSize: ".8rem",
                  color: "var(--gray-500)",
                  marginBottom: "8px",
                  textTransform: "uppercase",
                }}
              >
                Attached Documents
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                {leave.attachments.map((doc, i) => (
                  <a
                    key={i}
                    href={doc}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline btn-sm"
                  >
                    📄 Document {i + 1}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {leave.status === "pending_manager" && (
        <div className="card">
          <div className="card-header">
            <span className="card-title">💬 Decision</span>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">
                Comment / Reason{" "}
                <span style={{ color: "var(--gray-400)", fontSize: ".8rem" }}>
                  (Required for rejection)
                </span>
              </label>
              <textarea
                className="form-control"
                rows={4}
                placeholder="Add a comment for the employee (optional for approval, required for rejection)..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </div>
            <div
              style={{
                display: "flex",
                gap: "12px",
                justifyContent: "flex-end",
                marginTop: "8px",
              }}
            >
              <button
                className="btn btn-danger"
                onClick={() => handleAction("rejected")}
                disabled={submitting}
              >
                {submitting ? "⏳..." : "❌ Reject"}
              </button>
              <button
                className="btn btn-success"
                onClick={() => handleAction("approved")}
                disabled={submitting}
              >
                {submitting ? "⏳..." : "✅ Approve"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApprovalPage;
