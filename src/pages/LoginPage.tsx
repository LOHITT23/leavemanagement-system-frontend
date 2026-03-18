import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form.email, form.password);
      toast.success("Welcome back!");
      navigate("/dashboard");
    } catch (err: any) {
      console.log("err.response", err);
      toast.error(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        background:
          "linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)",
      }}
    >
      {/* Left panel */}
      <div
        style={{
          flex: 1,
          display: window.innerWidth < 768 ? "none" : "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "60px",
          color: "white",
        }}
      >
        <img
          src={"/breyer.jpeg"}
          alt="logo"
          style={{
            width: 80,
            marginBottom: 24,
          }}
        />
        <div
          style={{
            fontFamily: "Playfair Display, serif",
            fontSize: 48,
            fontWeight: 700,
            lineHeight: 1.1,
            marginBottom: 20,
          }}
        >
          Smart Leave
          <br />
          Management
        </div>
        <p
          style={{
            fontSize: 16,
            color: "rgba(255,255,255,0.6)",
            maxWidth: 380,
            lineHeight: 1.7,
          }}
        >
          Streamline leave requests, approvals, and tracking for your entire
          organization in one place.
        </p>
        <div style={{ display: "flex", gap: 32, marginTop: 48 }}>
          {[
            ["✅", "Instant Approvals"],
            ["📊", "Live Analytics"],
            ["🔔", "Smart Alerts"],
          ].map(([icon, label]) => (
            <div
              key={label as string}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span style={{ fontSize: 28 }}>{icon}</span>
              <span style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
                {label as string}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Right panel */}
      <div
        style={{
          width: "100%",
          maxWidth: 480,
          background: "white",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 48,
        }}
      >
        <div style={{ marginBottom: 36 }}>
          <div
            style={{
              fontFamily: "Playfair Display, serif",
              fontSize: 28,
              fontWeight: 700,
              color: "#0f172a",
              marginBottom: 8,
            }}
          >
            Sign In
          </div>
          <p style={{ color: "#64748b", fontSize: 14 }}>
            Enter your credentials to continue
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              className="form-input"
              type="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: "relative" }}>
              <input
                className="form-input"
                type={!showPass ? "password" : "text"}
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
              <span
                onClick={() => setShowPass((s) => !s)}
                style={{
                  position: "absolute",
                  right: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  cursor: "pointer",
                }}
              >
                {showPass ? <Eye /> : <EyeOff />}
              </span>
            </div>
          </div>

          <div style={{ textAlign: "right", marginBottom: 20 }}>
            <Link
              to="/forgot-password"
              style={{ fontSize: 13, color: "#2563eb", textDecoration: "none" }}
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            style={{ width: "100%", justifyContent: "center" }}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="spinner"></div>Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <p
          style={{
            textAlign: "center",
            marginTop: 28,
            fontSize: 14,
            color: "#64748b",
          }}
        >
          New user?{" "}
          <Link
            to="/register"
            style={{
              color: "#2563eb",
              textDecoration: "none",
              fontWeight: 500,
            }}
          >
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
