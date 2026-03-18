import React, { useState, useEffect } from "react";
import { Outlet, NavLink, useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";
import { notificationAPI } from "../../services/api";

const SideLink = ({
  to,
  icon,
  label,
  badge,
  open,
}: {
  to: string;
  icon: string;
  label: string;
  badge?: number;
  open: boolean;
}) => (
  <NavLink
    to={to}
    style={({ isActive }) => ({
      display: "flex",
      alignItems: "center",
      gap: 10,
      padding: "9px 12px",
      borderRadius: 8,
      color: isActive ? "white" : "rgba(255,255,255,0.6)",
      textDecoration: "none",
      background: isActive ? "rgba(37,99,235,0.5)" : "none",
      fontSize: 14,
      marginBottom: 2,
      transition: "all 0.15s",
      justifyContent: open ? "flex-start" : "center",
    })}
  >
    <span style={{ fontSize: 16, flexShrink: 0 }}>{icon}</span>
    {open && <span style={{ flex: 1 }}>{label}</span>}
    {open && badge && badge > 0 ? (
      <span
        style={{
          background: "#dc2626",
          color: "white",
          borderRadius: 10,
          padding: "1px 7px",
          fontSize: 11,
          fontWeight: 600,
        }}
      >
        {badge}
      </span>
    ) : null}
  </NavLink>
);

const NavGroup = ({
  label,
  children,
  show,
}: {
  label: string;
  children: React.ReactNode;
  show: boolean;
}) => (
  <div style={{ marginBottom: 8 }}>
    {show && (
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: "rgba(255,255,255,0.3)",
          textTransform: "uppercase",
          letterSpacing: "0.1em",
          padding: "8px 12px 4px",
        }}
      >
        {label}
      </div>
    )}
    {children}
  </div>
);

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unread, setUnread] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    // Poll for unread notification count every 30 seconds
    const fetchUnread = async () => {
      try {
        const res = await notificationAPI.getAll();
        setUnread(res.data.unreadCount);
      } catch {}
    };
    // Clear the polling interval when the component unmounts
    fetchUnread();
    const iv = setInterval(fetchUnread, 30000);
    return () => clearInterval(iv);
  }, []);
  // Controls which nav sections are visible based on role
  const isAdminOrManager = ["admin", "manager"].includes(user?.role || "");

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside
        style={{
          width: sidebarOpen ? 256 : 72,
          background: "#0f172a",
          color: "white",
          display: "flex",
          flexDirection: "column",
          transition: "width 0.2s",
          position: "sticky",
          top: 0,
          height: "100vh",
          overflow: "hidden",
          flexShrink: 0,
        }}
      >
        <div
          style={{
            padding: "20px 16px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          {sidebarOpen && (
            <div>
              <img
                src={"/breyer.jpeg"}
                alt="logo"
                style={{
                  width: 80,
                  objectFit: "fill",
                  marginBottom: 24,
                }}
              />
              <div
                style={{
                  fontFamily: "Playfair Display, serif",
                  fontSize: 18,
                  fontWeight: 700,
                }}
              >
                Smart
              </div>
              <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>
                Leave Management
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            style={{
              marginLeft: sidebarOpen ? "auto" : "auto",
              marginRight: sidebarOpen ? 0 : "auto",
              background: "rgba(255,255,255,0.08)",
              border: "none",
              borderRadius: 8,
              padding: "6px 10px",
              cursor: "pointer",
              color: "rgba(255,255,255,0.7)",
              fontSize: 12,
            }}
          >
            {sidebarOpen ? "◀" : "▶"}
          </button>
        </div>

        <div
          style={{
            padding: "14px 12px",
            borderBottom: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              justifyContent: sidebarOpen ? "flex-start" : "center",
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "#2563eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 14,
                flexShrink: 0,
              }}
            >
              {user?.firstName?.[0]}
              {user?.lastName?.[0]}
            </div>
            {sidebarOpen && (
              <div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: 140,
                  }}
                >
                  {user?.firstName} {user?.lastName}
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "rgba(255,255,255,0.4)",
                    textTransform: "capitalize",
                  }}
                >
                  {user?.role}
                </div>
              </div>
            )}
          </div>
        </div>

        <nav style={{ flex: 1, padding: "10px 8px", overflowY: "auto" }}>
          <NavGroup label="Main" show={sidebarOpen}>
            <SideLink
              to="/dashboard"
              icon="📊"
              label="Dashboard"
              open={sidebarOpen}
            />
            <SideLink
              to="/leaves/new"
              icon="✏️"
              label="Apply Leave"
              open={sidebarOpen}
            />
            <SideLink
              to="/leaves/history"
              icon="📋"
              label="Leave History"
              open={sidebarOpen}
            />
            <SideLink
              to="/calendar"
              icon="📅"
              label="Calendar"
              open={sidebarOpen}
            />
            <SideLink
              to="/notifications"
              icon="🔔"
              label="Notifications"
              badge={unread}
              open={sidebarOpen}
            />
          </NavGroup>

          {isAdminOrManager && (
            <NavGroup label="Admin" show={sidebarOpen}>
              <SideLink
                to="/admin/pending"
                icon="⏳"
                label="Pending Requests"
                open={sidebarOpen}
              />
              <SideLink
                to="/admin/reports"
                icon="📈"
                label="Reports"
                open={sidebarOpen}
              />
              {user?.role === "admin" && (
                <>
                  <SideLink
                    to="/admin/users"
                    icon="👥"
                    label="User Management"
                    open={sidebarOpen}
                  />
                  <SideLink
                    to="/admin/leave-types"
                    icon="🏷️"
                    label="Leave Types"
                    open={sidebarOpen}
                  />
                  <SideLink
                    to="/admin/audit"
                    icon="🔍"
                    label="Audit Log"
                    open={sidebarOpen}
                  />
                  <SideLink
                    to="/admin/settings"
                    icon="⚙️"
                    label="Org Settings"
                    open={sidebarOpen}
                  />
                </>
              )}
            </NavGroup>
          )}

          <NavGroup label="Account" show={sidebarOpen}>
            <SideLink
              to="/profile"
              icon="👤"
              label="Profile & Settings"
              open={sidebarOpen}
            />
            <SideLink
              to="/help"
              icon="❓"
              label="Help / FAQ"
              open={sidebarOpen}
            />
          </NavGroup>
        </nav>

        <div
          style={{
            padding: "12px",
            borderTop: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <button
            onClick={() => {
              logout();
              navigate("/login");
            }}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "9px 12px",
              borderRadius: 8,
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.6)",
              cursor: "pointer",
              fontSize: 14,
              marginBottom: 12,
            }}
          >
            <span>⏻</span>
            {sidebarOpen && <span>Sign Out</span>}
          </button>

          {sidebarOpen && (
            <div
              style={{
                background: "rgba(255,255,255,0.04)",
                borderRadius: 8,
                padding: "10px",
                fontSize: 11,
                lineHeight: 1.5,
                color: "rgba(255,255,255,0.5)",
              }}
            >
              <div style={{ fontWeight: 600, color: "white", marginBottom: 4 }}>
                Breyer College
              </div>

              <div>Breyer college gombak No 1c,jalan sg 3/19,</div>
              <div>taman sri gombak,68100 batu caves, </div>
              <div>selangor</div>

              <div style={{ marginTop: 6 }}>📞 +603-6185-4543</div>
              <div>✉ enquiry.sg@breyer.com.my</div>
            </div>
          )}
        </div>
      </aside>

      <main style={{ flex: 1, padding: 32, minWidth: 0, overflowX: "hidden" }}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
