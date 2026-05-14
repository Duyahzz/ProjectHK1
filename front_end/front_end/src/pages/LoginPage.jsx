import React, { useState } from "react";
import {
  Truck,
  ShieldCheck,
  PackageCheck,
  MapPinned,
  LogIn,
  UserPlus,
  KeyRound,
} from "lucide-react";
import { api } from "../services/api";

export default function LoginPage({ onLogin, onOpenPublicTracking }) {
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const [loginForm, setLoginForm] = useState({
    login: "",
    password: "",
  });

  const [registerForm, setRegisterForm] = useState({
    full_name: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
    address_line: "",
    city: "",
    country: "",
  });

  const [forgotForm, setForgotForm] = useState({
    username: "",
    phone: "",
    password: "",
    password_confirmation: "",
  });

  const clearMessages = () => {
    setError("");
    setSuccess("");
    setFieldErrors({});
  };

  const getFieldError = (name) => {
    const value = fieldErrors?.[name];
    if (Array.isArray(value)) return value[0];
    return value || "";
  };

  const resetRegisterForm = () => {
    setRegisterForm({
      full_name: "",
      username: "",
      email: "",
      phone: "",
      password: "",
      password_confirmation: "",
      address_line: "",
      city: "",
      country: "",
    });
  };

  const resetForgotForm = () => {
    setForgotForm({
      username: "",
      phone: "",
      password: "",
      password_confirmation: "",
    });
  };

  const handleLogin = async () => {
    clearMessages();

    try {
      setLoading(true);
      const data = await api.login(loginForm);
      onLogin(data.user);
    } catch (err) {
      if (err.status === 422) {
        setFieldErrors(err.validationErrors || {});
        setError("Please check the highlighted fields.");
      } else {
        setError(err.serverError || err.message || "Login failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    clearMessages();

    try {
      setLoading(true);
      await api.register(registerForm);

      setSuccess("Register successful. Please login with your new account.");
      setLoginForm({
        login: registerForm.username || registerForm.email,
        password: "",
      });

      resetRegisterForm();
      setMode("login");
    } catch (err) {
      if (err.status === 422) {
        setFieldErrors(err.validationErrors || {});
        setError("Please check the highlighted fields.");
      } else {
        setError(err.serverError || err.message || "Register failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResetPasswordByPhone = async () => {
    clearMessages();

    try {
      setLoading(true);
      const data = await api.resetPasswordByPhone(forgotForm);

      setSuccess(data.message || "Password reset successful. Please login again.");
      setLoginForm((prev) => ({
        ...prev,
        login: forgotForm.username,
        password: "",
      }));

      resetForgotForm();
      setMode("login");
    } catch (err) {
      if (err.status === 422) {
        setFieldErrors(err.validationErrors || {});
        setError("Please check the highlighted fields.");
      } else {
        setError(err.serverError || err.message || "Reset password failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-shell">
      <div className="auth-layout">
        <div className="auth-showcase">
          <div className="auth-brand-pill">
            <Truck size={16} />
            <span>CourierXpress</span>
          </div>

          <div className="auth-showcase-content">
            <div className="auth-overline">Courier Operations Platform</div>
            <h1>Manage shipments with a cleaner, faster workflow.</h1>
            <p>
              One place for admin control, branch operations, shipment tracking,
              billing, and customer account access.
            </p>

            <div className="auth-feature-list">
              <div className="auth-feature-item">
                <div className="auth-feature-icon">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <strong>Role-based access</strong>
                  <span>Separate workflows for admin, agent, and customer.</span>
                </div>
              </div>

              <div className="auth-feature-item">
                <div className="auth-feature-icon">
                  <PackageCheck size={18} />
                </div>
                <div>
                  <strong>Shipment lifecycle control</strong>
                  <span>Create, monitor, and update deliveries efficiently.</span>
                </div>
              </div>

              <div className="auth-feature-item">
                <div className="auth-feature-icon">
                  <MapPinned size={18} />
                </div>
                <div>
                  <strong>Tracking and visibility</strong>
                  <span>Follow shipment status and branch activity in one system.</span>
                </div>
              </div>
            </div>
          </div>

          <div className="auth-stats">
            <div className="auth-stat-card">
              <span>Roles</span>
              <strong>Admin / Agent / Customer</strong>
            </div>
            <div className="auth-stat-card">
              <span>Modules</span>
              <strong>Booking, Tracking, Billing</strong>
            </div>
          </div>
        </div>

        <div className="auth-panel">
          <div className="auth-card">
            <div className="auth-tabs">
              <button
                className={`auth-tab ${mode === "login" ? "active" : ""}`}
                type="button"
                onClick={() => {
                  setMode("login");
                  clearMessages();
                }}
              >
                <LogIn size={16} />
                Login
              </button>

              <button
                className={`auth-tab ${mode === "register" ? "active" : ""}`}
                type="button"
                onClick={() => {
                  setMode("register");
                  clearMessages();
                }}
              >
                <UserPlus size={16} />
                Register
              </button>

              <button
                className={`auth-tab ${mode === "forgot" ? "active" : ""}`}
                type="button"
                onClick={() => {
                  setMode("forgot");
                  clearMessages();
                }}
              >
                <KeyRound size={16} />
                Reset
              </button>
            </div>

            {mode === "login" && (
              <>
                <div className="auth-header">
                  <h2>Sign in</h2>
                  <p>Enter your account details to access the system.</p>
                </div>

                <div className="auth-form-grid">
                  <div style={{ position: "relative" }}>
                    <label className="label">Username or Email</label>
                    <input
                      className={`input ${getFieldError("login") ? "input-error" : ""}`}
                      value={loginForm.login}
                      onChange={(e) => {
                        setLoginForm((prev) => ({ ...prev, login: e.target.value }));
                        setFieldErrors((prev) => ({ ...prev, login: "" }));
                      }}
                      placeholder="Username or Email..."
                      maxLength={100}
                    />
                    <span style={{ position: "absolute", right: "12px", top: "38px", fontSize: "10px", color: loginForm.login.length >= 100 ? "red" : "#999" }}>{loginForm.login.length}/100</span>
                    {getFieldError("login") ? (
                      <div className="field-error">{getFieldError("login")}</div>
                    ) : null}
                  </div>

                  <div>
                    <label className="label">Password</label>
                    <input
                      className={`input ${getFieldError("password") ? "input-error" : ""}`}
                      type="password"
                      value={loginForm.password}
                      onChange={(e) => {
                        setLoginForm((prev) => ({ ...prev, password: e.target.value }));
                        setFieldErrors((prev) => ({ ...prev, password: "" }));
                      }}
                      placeholder="Enter your password"
                    />
                    {getFieldError("password") ? (
                      <div className="field-error">{getFieldError("password")}</div>
                    ) : null}
                  </div>
                </div>

                {success ? <div className="form-success">{success}</div> : null}
                {error ? <div className="form-error">{error}</div> : null}

                <div className="auth-actions">
                  <button className="auth-submit-btn" onClick={handleLogin} disabled={loading}>
                    {loading ? "Signing in..." : "Sign In"}
                  </button>

                  {onOpenPublicTracking ? (
                    <button
                      type="button"
                      className="auth-link-btn"
                      onClick={onOpenPublicTracking}
                    >
                      Track shipment without login
                    </button>
                  ) : null}
                </div>
              </>
            )}

            {mode === "register" && (
              <>
                <div className="auth-header">
                  <h2>Create account</h2>
                  <p>Fill in the information below to register a customer account.</p>
                </div>

                <div className="auth-form-grid">
                  <div style={{ position: "relative" }}>
                    <label className="label">Full Name</label>
                    <input
                      className={`input ${getFieldError("full_name") ? "input-error" : ""}`}
                      value={registerForm.full_name}
                      onChange={(e) => {
                        setRegisterForm((prev) => ({ ...prev, full_name: e.target.value }));
                        setFieldErrors((prev) => ({ ...prev, full_name: "" }));
                      }}
                      placeholder="Full name..."
                      maxLength={100}
                    />
                    <span style={{ position: "absolute", right: "12px", top: "38px", fontSize: "10px", color: registerForm.full_name.length >= 100 ? "red" : "#999" }}>{registerForm.full_name.length}/100</span>
                    {getFieldError("full_name") ? (
                      <div className="field-error">{getFieldError("full_name")}</div>
                    ) : null}
                  </div>

                  <div style={{ position: "relative" }}>
                    <label className="label">Username</label>
                    <input
                      className={`input ${getFieldError("username") ? "input-error" : ""}`}
                      value={registerForm.username}
                      onChange={(e) => {
                        setRegisterForm((prev) => ({ ...prev, username: e.target.value }));
                        setFieldErrors((prev) => ({ ...prev, username: "" }));
                      }}
                      placeholder="Username..."
                      maxLength={100}
                    />
                    <span style={{ position: "absolute", right: "12px", top: "38px", fontSize: "10px", color: registerForm.username.length >= 100 ? "red" : "#999" }}>{registerForm.username.length}/100</span>
                    {getFieldError("username") ? (
                      <div className="field-error">{getFieldError("username")}</div>
                    ) : null}
                  </div>

                  <div style={{ position: "relative" }}>
                    <label className="label">Email</label>
                    <input
                      className={`input ${getFieldError("email") ? "input-error" : ""}`}
                      value={registerForm.email}
                      onChange={(e) => {
                        setRegisterForm((prev) => ({ ...prev, email: e.target.value }));
                        setFieldErrors((prev) => ({ ...prev, email: "" }));
                      }}
                      placeholder="Email..."
                      maxLength={100}
                    />
                    <span style={{ position: "absolute", right: "12px", top: "38px", fontSize: "10px", color: registerForm.email.length >= 100 ? "red" : "#999" }}>{registerForm.email.length}/100</span>
                    {getFieldError("email") ? (
                      <div className="field-error">{getFieldError("email")}</div>
                    ) : null}
                  </div>

                  <div style={{ position: "relative" }}>
                    <label className="label">Phone</label>
                    <input
                      className={`input ${getFieldError("phone") ? "input-error" : ""}`}
                      value={registerForm.phone}
                      onChange={(e) => {
                        setRegisterForm((prev) => ({ ...prev, phone: e.target.value }));
                        setFieldErrors((prev) => ({ ...prev, phone: "" }));
                      }}
                      placeholder="Phone number..."
                      maxLength={20}
                    />
                    <span style={{ position: "absolute", right: "12px", top: "38px", fontSize: "10px", color: registerForm.phone.length >= 20 ? "red" : "#999" }}>{registerForm.phone.length}/20</span>
                    {getFieldError("phone") ? (
                      <div className="field-error">{getFieldError("phone")}</div>
                    ) : null}
                  </div>

                  <div className="auth-col-span-2">
                    <div style={{ position: "relative" }}>
                      <label className="label">Address</label>
                      <input
                        className={`input ${getFieldError("address_line") ? "input-error" : ""}`}
                        value={registerForm.address_line}
                        onChange={(e) => {
                          setRegisterForm((prev) => ({ ...prev, address_line: e.target.value }));
                          setFieldErrors((prev) => ({ ...prev, address_line: "" }));
                        }}
                        placeholder="Address..."
                        maxLength={250}
                      />
                      <span style={{ position: "absolute", right: "12px", top: "38px", fontSize: "10px", color: registerForm.address_line.length >= 250 ? "red" : "#999" }}>{registerForm.address_line.length}/250</span>
                      {getFieldError("address_line") ? (
                        <div className="field-error">{getFieldError("address_line")}</div>
                      ) : null}
                    </div>
                  </div>

                  <div style={{ position: "relative" }}>
                    <label className="label">City</label>
                    <input
                      className={`input ${getFieldError("city") ? "input-error" : ""}`}
                      value={registerForm.city}
                      onChange={(e) => {
                        setRegisterForm((prev) => ({ ...prev, city: e.target.value }));
                        setFieldErrors((prev) => ({ ...prev, city: "" }));
                      }}
                      placeholder="City..."
                      maxLength={100}
                    />
                    <span style={{ position: "absolute", right: "12px", top: "38px", fontSize: "10px", color: registerForm.city.length >= 100 ? "red" : "#999" }}>{registerForm.city.length}/100</span>
                    {getFieldError("city") ? (
                      <div className="field-error">{getFieldError("city")}</div>
                    ) : null}
                  </div>

                  <div style={{ position: "relative" }}>
                    <label className="label">Country</label>
                    <input
                      className={`input ${getFieldError("country") ? "input-error" : ""}`}
                      value={registerForm.country}
                      onChange={(e) => {
                        setRegisterForm((prev) => ({ ...prev, country: e.target.value }));
                        setFieldErrors((prev) => ({ ...prev, country: "" }));
                      }}
                      placeholder="Country..."
                      maxLength={100}
                    />
                    <span style={{ position: "absolute", right: "12px", top: "38px", fontSize: "10px", color: registerForm.country.length >= 100 ? "red" : "#999" }}>{registerForm.country.length}/100</span>
                    {getFieldError("country") ? (
                      <div className="field-error">{getFieldError("country")}</div>
                    ) : null}
                  </div>

                  <div>
                    <label className="label">Password</label>
                    <input
                      className={`input ${getFieldError("password") ? "input-error" : ""}`}
                      type="password"
                      value={registerForm.password}
                      onChange={(e) => {
                        setRegisterForm((prev) => ({ ...prev, password: e.target.value }));
                        setFieldErrors((prev) => ({ ...prev, password: "" }));
                      }}
                      placeholder="Enter password"
                    />
                    {getFieldError("password") ? (
                      <div className="field-error">{getFieldError("password")}</div>
                    ) : null}
                  </div>

                  <div>
                    <label className="label">Confirm Password</label>
                    <input
                      className={`input ${getFieldError("password_confirmation") ? "input-error" : ""}`}
                      type="password"
                      value={registerForm.password_confirmation}
                      onChange={(e) => {
                        setRegisterForm((prev) => ({
                          ...prev,
                          password_confirmation: e.target.value,
                        }));
                        setFieldErrors((prev) => ({
                          ...prev,
                          password_confirmation: "",
                        }));
                      }}
                      placeholder="Confirm password"
                    />
                    {getFieldError("password_confirmation") ? (
                      <div className="field-error">{getFieldError("password_confirmation")}</div>
                    ) : null}
                  </div>
                </div>

                {success ? <div className="form-success">{success}</div> : null}
                {error ? <div className="form-error">{error}</div> : null}

                <div className="auth-actions">
                  <button
                    className="auth-submit-btn"
                    onClick={handleRegister}
                    disabled={loading}
                  >
                    {loading ? "Creating account..." : "Create Account"}
                  </button>
                </div>
              </>
            )}

            {mode === "forgot" && (
              <>
                <div className="auth-header">
                  <h2>Reset password</h2>
                  <p>Use your username and phone number to create a new password.</p>
                </div>

                <div className="auth-form-grid">
                  <div style={{ position: "relative" }}>
                    <label className="label">Username</label>
                    <input
                      className={`input ${getFieldError("username") ? "input-error" : ""}`}
                      value={forgotForm.username}
                      onChange={(e) => {
                        setForgotForm((prev) => ({ ...prev, username: e.target.value }));
                        setFieldErrors((prev) => ({ ...prev, username: "" }));
                      }}
                      placeholder="Username..."
                      maxLength={100}
                    />
                    <span style={{ position: "absolute", right: "12px", top: "38px", fontSize: "10px", color: forgotForm.username.length >= 100 ? "red" : "#999" }}>{forgotForm.username.length}/100</span>
                    {getFieldError("username") ? (
                      <div className="field-error">{getFieldError("username")}</div>
                    ) : null}
                  </div>

                  <div style={{ position: "relative" }}>
                    <label className="label">Phone Number</label>
                    <input
                      className={`input ${getFieldError("phone") ? "input-error" : ""}`}
                      value={forgotForm.phone}
                      onChange={(e) => {
                        setForgotForm((prev) => ({ ...prev, phone: e.target.value }));
                        setFieldErrors((prev) => ({ ...prev, phone: "" }));
                      }}
                      placeholder="Phone number..."
                      maxLength={20}
                    />
                    <span style={{ position: "absolute", right: "12px", top: "38px", fontSize: "10px", color: forgotForm.phone.length >= 20 ? "red" : "#999" }}>{forgotForm.phone.length}/20</span>
                    {getFieldError("phone") ? (
                      <div className="field-error">{getFieldError("phone")}</div>
                    ) : null}
                  </div>

                  <div>
                    <label className="label">New Password</label>
                    <input
                      className={`input ${getFieldError("password") ? "input-error" : ""}`}
                      type="password"
                      value={forgotForm.password}
                      onChange={(e) => {
                        setForgotForm((prev) => ({ ...prev, password: e.target.value }));
                        setFieldErrors((prev) => ({ ...prev, password: "" }));
                      }}
                      placeholder="Enter new password"
                    />
                    {getFieldError("password") ? (
                      <div className="field-error">{getFieldError("password")}</div>
                    ) : null}
                  </div>

                  <div>
                    <label className="label">Confirm New Password</label>
                    <input
                      className={`input ${getFieldError("password_confirmation") ? "input-error" : ""}`}
                      type="password"
                      value={forgotForm.password_confirmation}
                      onChange={(e) => {
                        setForgotForm((prev) => ({
                          ...prev,
                          password_confirmation: e.target.value,
                        }));
                        setFieldErrors((prev) => ({
                          ...prev,
                          password_confirmation: "",
                        }));
                      }}
                      placeholder="Confirm new password"
                    />
                    {getFieldError("password_confirmation") ? (
                      <div className="field-error">{getFieldError("password_confirmation")}</div>
                    ) : null}
                  </div>
                </div>

                {success ? <div className="form-success">{success}</div> : null}
                {error ? <div className="form-error">{error}</div> : null}

                <div className="auth-actions">
                  <button
                    className="auth-submit-btn"
                    onClick={handleResetPasswordByPhone}
                    disabled={loading}
                  >
                    {loading ? "Resetting..." : "Reset Password"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}