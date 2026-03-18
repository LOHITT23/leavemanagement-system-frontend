import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { userAPI, authAPI } from "../services/api";
import toast from "react-hot-toast";
import { Eye, EyeOff } from "lucide-react";

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<"profile" | "password">("profile");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
    department: user?.department || "",
    position: user?.position || "",
  });
  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirm: "",
  });
  const [avatar, setAvatar] = useState<File | null>(null);
  const [showPass, setShowPass] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      if (avatar) data.append("avatar", avatar);
      const res = await userAPI.updateProfile(data);
      updateUser(res.data.user);
      toast.success("Profile updated!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    if (pwForm.newPassword.length < 6) {
      toast.error("Min 6 characters");
      return;
    }
    setLoading(true);
    try {
      await authAPI.changePassword({
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      toast.success("Password changed!");
      setPwForm({ currentPassword: "", newPassword: "", confirm: "" });
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed");
    } finally {
      setLoading(false);
    }
  };
  console.log("user", user);
  const updatedAvatar = user?.avatar?.replace(/\\/g, "/");
  console.log("updatedAvatar", updatedAvatar);
  console.log("!user?.avatar", !user?.avatar);

  return (
    <div>
      <div className="page-header">
        <h1>Profile & Settings</h1>
        <p>Manage your personal information and security</p>
      </div>

      <div
        style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 24 }}
      >
        {/* Profile card */}
        <div>
          <div className="card" style={{ textAlign: "center" }}>
            <div
              style={{
                width: 80,
                height: 80,
                borderRadius: "50%",
                background: "#2563eb",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 28,
                color: "white",
                margin: "0 auto 16px",
              }}
            >
              {avatar || user?.avatar ? (
                <img
                  src={
                    avatar
                      ? URL.createObjectURL(avatar) // newly selected file preview
                      : `http://localhost:5000/${updatedAvatar}` // DB avatar
                  }
                  alt="avatar"
                  style={{
                    width: "100%",
                    height: "100%",
                    borderRadius: "50%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                `${user?.firstName?.[0] || ""}${user?.lastName?.[0] || ""}`
              )}
            </div>
            <h3 style={{ fontSize: 16, marginBottom: 4 }}>
              {user?.firstName} {user?.lastName}
            </h3>
            <p style={{ fontSize: 13, color: "#64748b" }}>{user?.position}</p>
            <span
              className={`badge badge-${user?.role}`}
              style={{ marginTop: 8 }}
            >
              {user?.role}
            </span>

            <div
              style={{
                marginTop: 20,
                borderTop: "1px solid #f1f5f9",
                paddingTop: 16,
                textAlign: "left",
              }}
            >
              {[
                ["🏢", user?.department],
                ["✉️", user?.email],
                ["🆔", user?.employeeId],
              ].map(([icon, val]) =>
                val ? (
                  <div
                    key={String(val)}
                    style={{
                      display: "flex",
                      gap: 8,
                      marginBottom: 8,
                      fontSize: 13,
                      color: "#475569",
                    }}
                  >
                    <span>{icon}</span>
                    <span>{val}</span>
                  </div>
                ) : null,
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="card" style={{ marginTop: 16 }}>
            {[
              { key: "profile", label: "👤 Edit Profile" },
              { key: "password", label: "🔒 Change Password" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  padding: "10px 14px",
                  borderRadius: 8,
                  border: "none",
                  background: activeTab === tab.key ? "#eff6ff" : "none",
                  color: activeTab === tab.key ? "#2563eb" : "#475569",
                  fontFamily: "DM Sans",
                  fontSize: 14,
                  fontWeight: activeTab === tab.key ? 600 : 400,
                  cursor: "pointer",
                  marginBottom: 4,
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="card">
          {activeTab === "profile" && (
            <>
              <h3 style={{ fontSize: 18, marginBottom: 20 }}>Edit Profile</h3>
              <form onSubmit={saveProfile}>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 16,
                  }}
                >
                  <div className="form-group">
                    <label className="form-label">First Name</label>
                    <input
                      className="form-input"
                      value={form.firstName}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, firstName: e.target.value }))
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name</label>
                    <input
                      className="form-input"
                      value={form.lastName}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, lastName: e.target.value }))
                      }
                      required
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    className="form-input"
                    value={form.phone}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, phone: e.target.value }))
                    }
                    placeholder="+91 9999999999"
                  />
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    gap: 16,
                  }}
                >
                  <div className="form-group">
                    <label className="form-label">Department</label>
                    <input
                      className="form-input"
                      value={form.department}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, department: e.target.value }))
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Position</label>
                    <input
                      className="form-input"
                      value={form.position}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, position: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Profile Photo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setAvatar(e.target.files?.[0] || null)}
                    style={{ fontSize: 14, color: "#475569" }}
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="spinner"></div>Saving...
                    </>
                  ) : (
                    "💾 Save Changes"
                  )}
                </button>
              </form>
            </>
          )}

          {activeTab === "password" && (
            <>
              <h3 style={{ fontSize: 18, marginBottom: 20 }}>
                Change Password
              </h3>
              <form onSubmit={changePassword} style={{ maxWidth: 400 }}>
                {/* Current Password */}
                <div className="form-group">
                  <label className="form-label">Current Password</label>

                  <div style={{ position: "relative" }}>
                    <input
                      className="form-input"
                      type={showPass.current ? "text" : "password"}
                      value={pwForm.currentPassword}
                      onChange={(e) =>
                        setPwForm((f) => ({
                          ...f,
                          currentPassword: e.target.value,
                        }))
                      }
                      required
                    />

                    <span
                      onClick={() =>
                        setShowPass((s) => ({ ...s, current: !s.current }))
                      }
                      style={{
                        position: "absolute",
                        right: 10,
                        top: "50%",
                        transform: "translateY(-50%)",
                        cursor: "pointer",
                      }}
                    >
                      {showPass.current ? <Eye /> : <EyeOff />}
                    </span>
                  </div>
                </div>

                {/* New Password */}
                <div className="form-group">
                  <label className="form-label">New Password</label>

                  <div style={{ position: "relative" }}>
                    <input
                      className="form-input"
                      type={showPass.new ? "text" : "password"}
                      value={pwForm.newPassword}
                      onChange={(e) =>
                        setPwForm((f) => ({
                          ...f,
                          newPassword: e.target.value,
                        }))
                      }
                      required
                      minLength={6}
                    />

                    <span
                      onClick={() =>
                        setShowPass((s) => ({ ...s, new: !s.new }))
                      }
                      style={{
                        position: "absolute",
                        right: 10,
                        top: "50%",
                        transform: "translateY(-50%)",
                        cursor: "pointer",
                      }}
                    >
                      {showPass.new ? <Eye /> : <EyeOff />}
                    </span>
                  </div>
                </div>

                {/* Confirm Password */}
                <div className="form-group">
                  <label className="form-label">Confirm Password</label>

                  <div style={{ position: "relative" }}>
                    <input
                      className="form-input"
                      type={showPass.confirm ? "text" : "password"}
                      value={pwForm.confirm}
                      onChange={(e) =>
                        setPwForm((f) => ({ ...f, confirm: e.target.value }))
                      }
                      required
                    />

                    <span
                      onClick={() =>
                        setShowPass((s) => ({ ...s, confirm: !s.confirm }))
                      }
                      style={{
                        position: "absolute",
                        right: 10,
                        top: "50%",
                        transform: "translateY(-50%)",
                        cursor: "pointer",
                      }}
                    >
                      {showPass.confirm ? <Eye /> : <EyeOff />}
                    </span>
                  </div>

                  {pwForm.confirm && pwForm.newPassword !== pwForm.confirm && (
                    <p className="form-error">Passwords do not match</p>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="spinner"></div>Updating...
                    </>
                  ) : (
                    "🔒 Update Password"
                  )}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
