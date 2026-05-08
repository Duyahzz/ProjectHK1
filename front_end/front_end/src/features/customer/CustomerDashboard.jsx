import React, { useEffect, useMemo, useState } from "react";
import {
  History,
  LayoutDashboard,
  MapPinned,
  Package,
  ShieldCheck,
  UserCircle2,
} from "lucide-react";
import { api } from "../../services/api";
import { formatCurrency } from "../../utils/helpers";

function CustomerMenu({ activeTab, setActiveTab, onLogout }) {
  const menuItems = [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { key: "track", label: "Track Shipment", icon: MapPinned },
    { key: "history", label: "Shipment History", icon: History },
    { key: "profile", label: "My Profile", icon: UserCircle2 },
  ];

  return (
    <aside className="cx-admin-sidebar">
      <div className="cx-admin-brand">
        <div className="cx-admin-brand-logo">CX</div>
        <div>
          <div className="cx-admin-brand-title">CourierXpress</div>
          <div className="cx-admin-brand-subtitle">Customer Panel</div>
        </div>
      </div>

      <div className="cx-admin-role-card">
        <div className="cx-admin-role-label">Current Role</div>
        <div className="cx-admin-role-value">CUSTOMER</div>
      </div>

      <div className="cx-admin-nav-title">Customer Menu</div>

      <div className="cx-admin-nav-list">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              className={`cx-admin-nav-item ${activeTab === item.key ? "active" : ""}`}
              onClick={() => setActiveTab(item.key)}
            >
              <Icon size={16} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      <button className="cx-admin-logout" onClick={onLogout}>
        Logout
      </button>
    </aside>
  );
}

function HeaderBar({ authUser, onOpenProfile }) {
  return (
    <div className="cx-admin-header">
      <div>
        <h1>Customer Dashboard</h1>
        <p>Track shipments, view profile, and check shipment history.</p>
      </div>

      <div className="cx-admin-header-right">
        <div
          className="cx-admin-user-box clickable"
          onClick={onOpenProfile}
          title="View customer profile"
        >
          <div className="cx-admin-user-avatar">
            {authUser?.full_name?.charAt(0)?.toUpperCase() || "C"}
          </div>
          <div>
            <div className="cx-admin-user-name">{authUser?.full_name || "Customer"}</div>
            <div className="cx-admin-user-role">
              {authUser?.role === "CUSTOMER" ? "Customer" : authUser?.role || "-"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardStat({ title, value, tone = "default" }) {
  return (
    <div className={`cx-admin-stat-card ${tone}`}>
      <div className="cx-admin-stat-title">{title}</div>
      <div className="cx-admin-stat-value">{value}</div>
    </div>
  );
}

function StatusPill({ value }) {
  const status = String(value || "").toUpperCase();

  let className = "pending";
  if (status === "IN_TRANSIT" || status === "PICKED_UP" || status === "OUT_FOR_DELIVERY") {
    className = "transit";
  }
  if (status === "DELIVERED" || status === "PAID" || status === "ACTIVE") {
    className = "delivered";
  }
  if (status === "CANCELLED" || status === "UNPAID" || status === "INACTIVE") {
    className = "cancelled";
  }

  return <span className={`cx-status-pill ${className}`}>{status || "-"}</span>;
}

function DashboardView({ historyShipments, setActiveTab }) {
  const deliveredCount = historyShipments.filter((item) => item.current_status === "DELIVERED").length;
  const transitCount = historyShipments.filter((item) => item.current_status === "IN_TRANSIT").length;
  const totalSpent = historyShipments.reduce((sum, item) => sum + Number(item.total_charge || 0), 0);

  return (
    <>
      <div className="cx-admin-stat-grid">
        <DashboardStat title="Tracked Shipments" value={historyShipments.length} />
        <DashboardStat title="In Transit" value={transitCount} tone="transit" />
        <DashboardStat title="Delivered" value={deliveredCount} tone="delivered" />
        <DashboardStat title="Total Charges" value={formatCurrency(totalSpent)} />
      </div>

      <div className="cx-admin-grid-two">
        <div className="cx-admin-panel">
          <div className="cx-admin-panel-header">
            <h3>Customer Summary</h3>
          </div>

          <div className="cx-admin-summary-list">
            <div className="cx-admin-summary-row">
              <span>Total Shipment History</span>
              <strong>{historyShipments.length}</strong>
            </div>
            <div className="cx-admin-summary-row">
              <span>Delivered Shipments</span>
              <strong>{deliveredCount}</strong>
            </div>
            <div className="cx-admin-summary-row">
              <span>Tracking Module</span>
              <button className="cx-inline-link" onClick={() => setActiveTab("track")}>
                Open Tracking
              </button>
            </div>
          </div>
        </div>

        <div className="cx-admin-panel">
          <div className="cx-admin-panel-header">
            <h3>Quick Access</h3>
          </div>

          <div className="cx-admin-shortcuts">
            <button className="cx-admin-shortcut" onClick={() => setActiveTab("track")}>
              <MapPinned size={16} />
              <span>Track Shipment</span>
            </button>

            <button className="cx-admin-shortcut" onClick={() => setActiveTab("history")}>
              <History size={16} />
              <span>Shipment History</span>
            </button>

            <button className="cx-admin-shortcut" onClick={() => setActiveTab("profile")}>
              <UserCircle2 size={16} />
              <span>My Profile</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function TrackView({
  trackingNumber,
  setTrackingNumber,
  trackingDetails,
  setTrackingDetails,
}) {
  const [loading, setLoading] = useState(false);

  const handleTrack = async () => {
    setLoading(true);
    try {
      const data = await api.trackShipment(trackingNumber);
      setTrackingDetails(data);
    } catch (error) {
      alert("Tracking number not found");
      setTrackingDetails(null);
    } finally {
      setLoading(false);
    }
  };

  const timeline = trackingDetails?.status_history || trackingDetails?.statusHistory || [];

  return (
    <div className="cx-admin-grid-two">
      <div className="cx-admin-panel">
        <div className="cx-admin-panel-header">
          <h3>Track by Tracking Number</h3>
          <p className="cx-admin-profile-subtitle">
            Enter a valid tracking number to see shipment details and timeline.
          </p>
        </div>

        <div className="cx-admin-toolbar">
          <div className="cx-admin-search">
            <MapPinned size={16} />
            <input
              value={trackingNumber}
              onChange={(e) => setTrackingNumber(e.target.value)}
              placeholder="Enter tracking number..."
            />
          </div>

          <button className="btn" onClick={handleTrack}>
            {loading ? "Tracking..." : "Track"}
          </button>
        </div>

        {trackingDetails ? (
          <div className="summary-box mt-20">
            <div className="summary-row">
              <span>Tracking No</span>
              <strong>{trackingDetails.tracking_number}</strong>
            </div>
            <div className="summary-row">
              <span>Status</span>
              <StatusPill value={trackingDetails.current_status} />
            </div>
            <div className="summary-row">
              <span>Sender</span>
              <span>{trackingDetails.sender?.full_name || "-"}</span>
            </div>
            <div className="summary-row">
              <span>Receiver</span>
              <span>{trackingDetails.receiver?.full_name || "-"}</span>
            </div>
            <div className="summary-row">
              <span>Type</span>
              <span>
                {trackingDetails.shipment_type?.type_name ||
                  trackingDetails.shipmentType?.type_name ||
                  "-"}
              </span>
            </div>
            <div className="summary-row">
              <span>Expected Delivery</span>
              <span>{trackingDetails.expected_delivery_date || "-"}</span>
            </div>
          </div>
        ) : (
          <div className="text-muted mt-20">No shipment loaded yet.</div>
        )}
      </div>

      <div className="cx-admin-panel">
        <div className="cx-admin-panel-header">
          <h3>Shipment Timeline</h3>
          <p className="cx-admin-profile-subtitle">
            Status records from shipment_status_history.
          </p>
        </div>

        <div className="timeline">
          {timeline.length ? (
            timeline.map((item, index) => (
              <div className="timeline-item" key={item.history_id || index}>
                <div
                  className="flex"
                  style={{ justifyContent: "space-between", alignItems: "center" }}
                >
                  <StatusPill value={item.status} />
                  <span className="text-muted">{item.event_time}</span>
                </div>
                <div className="mt-16">{item.status_note}</div>
              </div>
            ))
          ) : (
            <div className="text-muted">No timeline available.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function HistoryView({ shipments }) {
  return (
    <div className="cx-admin-panel">
      <div className="cx-admin-table-wrap">
        <table className="cx-admin-table">
          <thead>
            <tr>
              <th>Tracking</th>
              <th>Booking Date</th>
              <th>Status</th>
              <th>Expected Delivery</th>
              <th>Charge</th>
            </tr>
          </thead>
          <tbody>
            {shipments.length ? (
              shipments.map((item) => (
                <tr key={item.shipment_id}>
                  <td className="cx-highlight-cell">{item.tracking_number}</td>
                  <td>{item.booking_date || "-"}</td>
                  <td>
                    <StatusPill value={item.current_status} />
                  </td>
                  <td>{item.expected_delivery_date || "-"}</td>
                  <td>{formatCurrency(item.total_charge || 0)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="cx-empty-row">
                  No shipment history.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CustomerProfilePage({ authUser, customerProfile, historyCount, onBack }) {
  return (
    <div className="cx-admin-panel">
      <div className="cx-admin-panel-header cx-admin-profile-header-row">
        <div>
          <h3>Customer Profile</h3>
          <p className="cx-admin-profile-subtitle">Detailed account information</p>
        </div>

        <button className="btn-outline" onClick={onBack}>
          Back
        </button>
      </div>

      <div className="cx-admin-profile-hero">
        <div className="cx-admin-profile-avatar-large">
          {authUser?.full_name?.charAt(0)?.toUpperCase() || "C"}
        </div>

        <div>
          <div className="cx-admin-profile-name">{authUser?.full_name || "Customer"}</div>
          <div className="cx-admin-profile-role">
            {authUser?.role === "CUSTOMER" ? "Customer" : authUser?.role || "-"}
          </div>
        </div>
      </div>

      <div className="cx-admin-profile-grid">
        <div className="cx-admin-profile-item">
          <span>Full Name</span>
          <strong>{customerProfile?.full_name || authUser?.full_name || "-"}</strong>
        </div>

        <div className="cx-admin-profile-item">
          <span>Username</span>
          <strong>{authUser?.username || "-"}</strong>
        </div>

        <div className="cx-admin-profile-item">
          <span>Email</span>
          <strong>{customerProfile?.email || authUser?.email || "-"}</strong>
        </div>

        <div className="cx-admin-profile-item">
          <span>Phone</span>
          <strong>{customerProfile?.phone || authUser?.phone || "-"}</strong>
        </div>

        <div className="cx-admin-profile-item">
          <span>Address</span>
          <strong>{customerProfile?.address_line || "-"}</strong>
        </div>

        <div className="cx-admin-profile-item">
          <span>City</span>
          <strong>{customerProfile?.city || "-"}</strong>
        </div>

        <div className="cx-admin-profile-item">
          <span>Country</span>
          <strong>{customerProfile?.country || "-"}</strong>
        </div>

        <div className="cx-admin-profile-item">
          <span>Role</span>
          <strong>{authUser?.role || "-"}</strong>
        </div>

        <div className="cx-admin-profile-item">
          <span>User ID</span>
          <strong>{authUser?.user_id || "-"}</strong>
        </div>

        <div className="cx-admin-profile-item">
          <span>Tracked Shipments</span>
          <strong>{historyCount}</strong>
        </div>
      </div>
    </div>
  );
}

export default function CustomerDashboard({ onLogout }) {
  const authUser = JSON.parse(localStorage.getItem("cx_auth_user") || "null");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [trackingNumber, setTrackingNumber] = useState("TRK003");
  const [trackingDetails, setTrackingDetails] = useState(null);
  const [historyShipments, setHistoryShipments] = useState([]);
  const [customerProfile, setCustomerProfile] = useState(null);

  useEffect(() => {
    api
      .getShipments()
      .then((items) => {
        const filtered = items.filter((item) => {
          const senderUserId = item.sender?.user_id;
          const receiverUserId = item.receiver?.user_id;
          return senderUserId === authUser?.user_id || receiverUserId === authUser?.user_id;
        });

        setHistoryShipments(filtered);
      })
      .catch(console.error);
  }, [authUser?.user_id]);

  useEffect(() => {
    api
      .getCustomers()
      .then((items) => {
        const found = items.find((item) => item.user_id === authUser?.user_id);
        setCustomerProfile(found || null);
      })
      .catch(console.error);
  }, [authUser?.user_id]);

  return (
    <div className="cx-admin-layout">
      <CustomerMenu activeTab={activeTab} setActiveTab={setActiveTab} onLogout={onLogout} />

      <main className="cx-admin-main">
        <HeaderBar authUser={authUser} onOpenProfile={() => setActiveTab("profile")} />

        {activeTab === "dashboard" && (
          <DashboardView historyShipments={historyShipments} setActiveTab={setActiveTab} />
        )}

        {activeTab === "track" && (
          <TrackView
            trackingNumber={trackingNumber}
            setTrackingNumber={setTrackingNumber}
            trackingDetails={trackingDetails}
            setTrackingDetails={setTrackingDetails}
          />
        )}

        {activeTab === "history" && <HistoryView shipments={historyShipments} />}

        {activeTab === "profile" && (
          <CustomerProfilePage
            authUser={authUser}
            customerProfile={customerProfile}
            historyCount={historyShipments.length}
            onBack={() => setActiveTab("dashboard")}
          />
        )}
      </main>
    </div>
  );
}