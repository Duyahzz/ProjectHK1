import React from "react";
import { Building2, Boxes, CircleDollarSign, History, Home, Package, Search, ShieldCheck, Truck, UserRoundCog, Users } from "lucide-react";

const menuByRole = {
  ADMIN: [
    { key: "admin", label: "Dashboard", icon: Home },
    { key: "public-track", label: "Public Tracking", icon: Search },
  ],
  AGENT: [
    { key: "agent", label: "Dashboard", icon: Home },
    { key: "public-track", label: "Public Tracking", icon: Search },
  ],
  CUSTOMER: [
    { key: "customer", label: "Dashboard", icon: Home },
    { key: "public-track", label: "Public Tracking", icon: Search },
  ],
};

export default function Sidebar({ currentRole, currentScreen, setCurrentScreen, onLogout }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-box">
          <Truck size={20} />
        </div>
        <div>
          <div style={{ fontWeight: 700 }}>CourierXpress</div>
          <div style={{ fontSize: 12, color: "#94a3b8" }}>React UI Project</div>
        </div>
      </div>

      <div className="role-box">
        <div style={{ fontSize: 12, color: "#cbd5e1" }}>Current Role</div>
        <div style={{ marginTop: 6, fontWeight: 700 }}>{currentRole}</div>
      </div>

      <div className="sidebar-nav">
        {menuByRole[currentRole].map((item) => {
          const Icon = item.icon;
          const active = currentScreen === item.key;
          return (
            <button
              key={item.key}
              className={`sidebar-button ${active ? "active" : ""}`}
              onClick={() => setCurrentScreen(item.key)}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </div>

      <div className="sidebar-entities">
        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: 1, color: "#94a3b8", marginBottom: 8 }}>
          Entities From Database
        </div>
        <div className="entity-grid">
          {[
            [Users, "Users"],
            [UserRoundCog, "Customers"],
            [Building2, "Branches"],
            [Boxes, "Types"],
            [Package, "Shipments"],
            [History, "Status"],
            [CircleDollarSign, "Bills"],
            [ShieldCheck, "Tracking"],
          ].map(([Icon, label]) => (
            <div className="entity-chip" key={label}>
              <Icon size={13} style={{ marginRight: 6, verticalAlign: "middle" }} />
              {label}
            </div>
          ))}
        </div>
      </div>

      <div className="sidebar-footer">
        <button className="btn-outline" style={{ width: "100%" }} onClick={onLogout}>
          Logout
        </button>
      </div>
    </aside>
  );
}
