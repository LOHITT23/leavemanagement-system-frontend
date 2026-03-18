import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router";
import api from "../services/api";
import type { Leave, User, LeaveType } from "../types";

const PendingRequestsPage: React.FC = () => {
  const navigate = useNavigate();
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const fetchPending = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/leaves/pending?page=${page}&limit=10`);
      setLeaves(data.leaves);
      setTotal(data.total);
      setPages(data.pages);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    fetchPending();
  }, [fetchPending]);

  const quickAction = async (id: string, status: "approved" | "rejected") => {
    const comment =
      status === "rejected"
        ? (window.prompt("Rejection reason (optional):") ?? "")
        : "";
    try {
      await api.put(`/leaves/${id}/action`, { status, comment });
      fetchPending();
    } catch (err: unknown) {
      alert(
        (err as { response?: { data?: { message?: string } } })?.response?.data
          ?.message || "Action failed",
      );
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Pending Requests</h1>
        <p className="page-subtitle">
          {total} request(s) awaiting your approval
        </p>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ padding: "60px", textAlign: "center" }}>
            <div className="spinner" style={{ margin: "0 auto" }} />
          </div>
        ) : leaves.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">🎉</div>
            <div className="empty-state-title">All caught up!</div>
            <p className="empty-state-text">
              No pending leave requests at the moment.
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Leave Type</th>
                  <th>Dates</th>
                  <th>Days</th>
                  <th>Applied</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {leaves.map((l) => {
                  const user = l.userId as User;
                  const lt = l.leaveTypeId as LeaveType;
                  const waitDays = Math.floor(
                    (Date.now() - new Date(l.createdAt).getTime()) /
                      (1000 * 60 * 60 * 24),
                  );
                  return (
                    <tr key={l._id}>
                      <td>
                        <div style={{ fontWeight: 500 }}>{user?.firstName}</div>
                        <div
                          style={{
                            fontSize: ".8rem",
                            color: "var(--gray-500)",
                          }}
                        >
                          {user?.position}
                        </div>
                      </td>
                      <td>{user?.department}</td>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <div
                            className="leave-type-dot"
                            style={{ background: lt?.color }}
                          />
                          {lt?.name}
                        </div>
                      </td>
                      <td style={{ fontSize: ".85rem" }}>
                        {new Date(l.startDate).toLocaleDateString()} -{" "}
                        {new Date(l.endDate).toLocaleDateString()}
                      </td>
                      <td>
                        {Math.ceil(
                          (new Date(l.endDate).getTime() -
                            new Date(l.startDate).getTime()) /
                            (1000 * 60 * 60 * 24),
                        ) + 1}
                      </td>
                      <td style={{ fontSize: ".85rem" }}>
                        <div>{new Date(l.createdAt).toLocaleDateString()}</div>
                        {waitDays > 2 && (
                          <div
                            style={{
                              fontSize: ".75rem",
                              color: "var(--danger)",
                            }}
                          >
                            ⚠️ {waitDays}d waiting
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ display: "flex", gap: "6px" }}>
                          <button
                            className="btn btn-sm btn-outline"
                            onClick={() => navigate(`/admin/leaves/${l._id}`)}
                          >
                            Review
                          </button>
                          <button
                            className="btn btn-sm btn-success"
                            onClick={() => quickAction(l._id, "approved")}
                          >
                            ✓ Approve
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
                            onClick={() => quickAction(l._id, "rejected")}
                          >
                            ✗
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {pages > 1 && (
          <div className="card-footer">
            <div className="pagination">
              <button
                className="page-btn"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                ‹
              </button>
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  className={`page-btn ${page === p ? "active" : ""}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}
              <button
                className="page-btn"
                disabled={page === pages}
                onClick={() => setPage((p) => p + 1)}
              >
                ›
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PendingRequestsPage;
