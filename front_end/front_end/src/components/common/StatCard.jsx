import React from "react";

export default function StatCard({ title, value, icon: Icon, subtitle }) {
  return (
    <div className="card">
      <div className="stat-card">
        <div>
          <h3>{title}</h3>
          <div className="stat-value">{value}</div>
          {subtitle ? <div className="stat-subtitle">{subtitle}</div> : null}
        </div>
        <div className="icon-box">
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}
