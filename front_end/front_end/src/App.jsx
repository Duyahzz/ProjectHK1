import React, { useMemo, useState } from "react";
import LoginPage from "./pages/LoginPage";
import PublicTrackingPage from "./pages/PublicTrackingPage";
import AdminDashboard from "./features/admin/AdminDashboard";
import AgentDashboard from "./features/agent/AgentDashboard";
import CustomerDashboard from "./features/customer/CustomerDashboard";

function getScreenByRole(role) {
  if (role === "ADMIN") return "admin";
  if (role === "AGENT") return "agent";
  return "customer";
}

export default function App() {
  const savedUser = useMemo(() => {
    const raw = localStorage.getItem("cx_auth_user");
    return raw ? JSON.parse(raw) : null;
  }, []);

  const [authUser, setAuthUser] = useState(savedUser);
  const [currentScreen, setCurrentScreen] = useState(
    savedUser ? getScreenByRole(savedUser.role) : "admin"
  );

  const handleLogin = (user) => {
    setAuthUser(user);
    localStorage.setItem("cx_auth_user", JSON.stringify(user));
    setCurrentScreen(getScreenByRole(user.role));
  };

  const handleLogout = () => {
    localStorage.removeItem("cx_auth_user");
    setAuthUser(null);
    setCurrentScreen("admin");
  };

  if (!authUser) {
    return <LoginPage onLogin={handleLogin} />;
  }

  if (currentScreen === "admin") {
    return <AdminDashboard onLogout={handleLogout} />;
  }

  if (currentScreen === "agent") {
    return <AgentDashboard onLogout={handleLogout} />;
  }

  if (currentScreen === "customer") {
    return <CustomerDashboard onLogout={handleLogout} />;
  }

  if (currentScreen === "public-track") {
    return <PublicTrackingPage />;
  }

  return <LoginPage onLogin={handleLogin} />;
}