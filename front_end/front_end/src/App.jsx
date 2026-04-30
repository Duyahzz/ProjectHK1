import React, { useState } from "react";
import LoginPage from "./pages/LoginPage";
import PublicTrackingPage from "./pages/PublicTrackingPage";
import Sidebar from "./components/layout/Sidebar";
import AdminDashboard from "./features/admin/AdminDashboard";
import AgentDashboard from "./features/agent/AgentDashboard";
import CustomerDashboard from "./features/customer/CustomerDashboard";

export default function App() {
  const [loggedInRole, setLoggedInRole] = useState(null);
  const [currentScreen, setCurrentScreen] = useState("admin");

  if (!loggedInRole) {
    return (
      <LoginPage
        onLogin={(role) => {
          setLoggedInRole(role);
          setCurrentScreen(role === "ADMIN" ? "admin" : role === "AGENT" ? "agent" : "customer");
        }}
      />
    );
  }

  return (
    <div className="app-shell">
      <Sidebar
        currentRole={loggedInRole}
        currentScreen={currentScreen}
        setCurrentScreen={setCurrentScreen}
        onLogout={() => setLoggedInRole(null)}
      />

      <main className="main-area">
        {currentScreen === "admin" && <AdminDashboard />}
        {currentScreen === "agent" && <AgentDashboard />}
        {currentScreen === "customer" && <CustomerDashboard />}
        {currentScreen === "public-track" && <PublicTrackingPage />}
      </main>
    </div>
  );
}
