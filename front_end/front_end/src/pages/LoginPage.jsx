import React, { useState } from "react";
import { Truck } from "lucide-react";
import { api } from "../services/api";

export default function LoginPage({ onLogin }) {
  const [mode, setMode] = useState("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [loginForm, setLoginForm] = useState({
    login: "admin01",
    password: "123456",
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
    country: "Vietnam",
  });

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
      country: "Vietnam",
    });
  };

  const handleLogin = async () => {
    setError("");
    setSuccess("");

    try {
      setLoading(true);
      const data = await api.login(loginForm);
      onLogin(data.user);
    } catch (err) {
      setError(err.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    setError("");
    setSuccess("");

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
      setError(err.message || "Register failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-shell">
      <div className="login-card">
        <div className="login-left">
          <div>
            <div className="login-chip">
              <Truck size={16} />
              CourierXpress
            </div>
            <h1>Courier Management UI</h1>
            <p>
              Full React interface based on your database tables: users, customers, branches,
              shipment types, shipments, shipment status history, and bills.
            </p>
          </div>

          <div className="login-feature-grid">
            <div className="login-feature">
              <div style={{ fontSize: 13, color: "#cbd5e1" }}>Roles</div>
              <div style={{ fontSize: 20, fontWeight: 700, marginTop: 6 }}>
                Admin / Agent / Customer
              </div>
            </div>
            <div className="login-feature">
              <div style={{ fontSize: 13, color: "#cbd5e1" }}>Core Modules</div>
              <div style={{ fontSize: 20, fontWeight: 700, marginTop: 6 }}>
                Booking, Tracking, Billing
              </div>
            </div>
          </div>
        </div>

        <div className="login-right">
          <div className="login-form">
            <div className="flex gap-12" style={{ marginBottom: 20 }}>
              <button
                className={mode === "login" ? "btn" : "btn-outline"}
                type="button"
                onClick={() => {
                  setMode("login");
                  setError("");
                  setSuccess("");
                }}
              >
                Login
              </button>

              <button
                className={mode === "register" ? "btn" : "btn-outline"}
                type="button"
                onClick={() => {
                  setMode("register");
                  setError("");
                  setSuccess("");
                }}
              >
                Register
              </button>
            </div>

            {mode === "login" ? (
              <>
                <h2>Login</h2>
                <p>Enter your credentials to access the platform.</p>

                <div className="mt-20">
                  <label className="label">Username or Email</label>
                  <input
                    className="input"
                    value={loginForm.login}
                    onChange={(e) =>
                      setLoginForm((prev) => ({ ...prev, login: e.target.value }))
                    }
                    placeholder="Enter your username or email"
                  />
                </div>

                <div className="mt-16">
                  <label className="label">Password</label>
                  <input
                    className="input"
                    type="password"
                    value={loginForm.password}
                    onChange={(e) =>
                      setLoginForm((prev) => ({ ...prev, password: e.target.value }))
                    }
                    placeholder="Enter your password"
                  />
                </div>

                {success ? (
                  <div style={{ color: "green", marginTop: 16, fontWeight: 600 }}>
                    {success}
                  </div>
                ) : null}

                {error ? (
                  <div style={{ color: "red", marginTop: 16, fontWeight: 600 }}>
                    {error}
                  </div>
                ) : null}

                <div className="flex gap-12 mt-24">
                  <button className="btn" onClick={handleLogin} disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2>Register</h2>
                <p>Create a new customer account.</p>

                <div className="mt-16">
                  <label className="label">Full Name</label>
                  <input
                    className="input"
                    value={registerForm.full_name}
                    onChange={(e) =>
                      setRegisterForm((prev) => ({ ...prev, full_name: e.target.value }))
                    }
                  />
                </div>

                <div className="mt-16">
                  <label className="label">Username</label>
                  <input
                    className="input"
                    value={registerForm.username}
                    onChange={(e) =>
                      setRegisterForm((prev) => ({ ...prev, username: e.target.value }))
                    }
                  />
                </div>

                <div className="mt-16">
                  <label className="label">Email</label>
                  <input
                    className="input"
                    value={registerForm.email}
                    onChange={(e) =>
                      setRegisterForm((prev) => ({ ...prev, email: e.target.value }))
                    }
                  />
                </div>

                <div className="mt-16">
                  <label className="label">Phone</label>
                  <input
                    className="input"
                    value={registerForm.phone}
                    onChange={(e) =>
                      setRegisterForm((prev) => ({ ...prev, phone: e.target.value }))
                    }
                  />
                </div>

                <div className="mt-16">
                  <label className="label">Address</label>
                  <input
                    className="input"
                    value={registerForm.address_line}
                    onChange={(e) =>
                      setRegisterForm((prev) => ({ ...prev, address_line: e.target.value }))
                    }
                  />
                </div>

                <div className="mt-16">
                  <label className="label">City</label>
                  <input
                    className="input"
                    value={registerForm.city}
                    onChange={(e) =>
                      setRegisterForm((prev) => ({ ...prev, city: e.target.value }))
                    }
                  />
                </div>

                <div className="mt-16">
                  <label className="label">Country</label>
                  <input
                    className="input"
                    value={registerForm.country}
                    onChange={(e) =>
                      setRegisterForm((prev) => ({ ...prev, country: e.target.value }))
                    }
                  />
                </div>

                <div className="mt-16">
                  <label className="label">Password</label>
                  <input
                    className="input"
                    type="password"
                    value={registerForm.password}
                    onChange={(e) =>
                      setRegisterForm((prev) => ({ ...prev, password: e.target.value }))
                    }
                  />
                </div>

                <div className="mt-16">
                  <label className="label">Confirm Password</label>
                  <input
                    className="input"
                    type="password"
                    value={registerForm.password_confirmation}
                    onChange={(e) =>
                      setRegisterForm((prev) => ({
                        ...prev,
                        password_confirmation: e.target.value,
                      }))
                    }
                  />
                </div>

                {success ? (
                  <div style={{ color: "green", marginTop: 16, fontWeight: 600 }}>
                    {success}
                  </div>
                ) : null}

                {error ? (
                  <div style={{ color: "red", marginTop: 16, fontWeight: 600 }}>
                    {error}
                  </div>
                ) : null}

                <div className="flex gap-12 mt-24">
                  <button className="btn" onClick={handleRegister} disabled={loading}>
                    {loading ? "Creating account..." : "Register"}
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