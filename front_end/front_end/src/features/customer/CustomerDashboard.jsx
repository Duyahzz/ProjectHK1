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
              placeholder="Tracking number..."
              maxLength={20}
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

function CustomerProfilePage({ authUser, customerProfile, onUpdateSuccess }) {
  const [profileTab, setProfileTab] = useState("INFO"); // 'INFO' or 'PASSWORD'
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: customerProfile?.full_name || authUser?.full_name || "",
    email: customerProfile?.email || authUser?.email || "",
    phone: customerProfile?.phone || authUser?.phone || "",
    address_line: customerProfile?.address_line || "",
    city: customerProfile?.city || "",
    country: customerProfile?.country || "",
  });

  const [passData, setPassData] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleUpdateProfile = async () => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await api.updateProfile({
        user_id: authUser.user_id,
        ...profileData,
      });
      if (res.success) {
        setMessage("Profile updated successfully!");
        setIsEditing(false);
        if (onUpdateSuccess) onUpdateSuccess(res.user);
      }
    } catch (err) {
      setError(err.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passData.new_password !== passData.new_password_confirmation) {
      setError("New passwords do not match.");
      return;
    }
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await api.changePassword({
        user_id: authUser.user_id,
        current_password: passData.current_password,
        new_password: passData.new_password,
        new_password_confirmation: passData.new_password_confirmation,
      });
      if (res.success) {
        setMessage("Password changed successfully!");
        setPassData({ current_password: "", new_password: "", new_password_confirmation: "" });
      }
    } catch (err) {
      setError(err.message || "Failed to change password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cx-admin-profile-container" style={{ maxWidth: "800px", margin: "0 auto" }}>
      {/* Tab Navigation */}
      <div className="tabs" style={{ marginBottom: "24px" }}>
        <button 
          className={`tab-btn ${profileTab === 'INFO' ? 'active' : ''}`} 
          onClick={() => { setProfileTab('INFO'); setError(""); setMessage(""); }}
        >
          <UserCircle2 size={16} style={{ marginRight: "8px", verticalAlign: "middle" }} />
          Personal Information
        </button>
        <button 
          className={`tab-btn ${profileTab === 'PASSWORD' ? 'active' : ''}`} 
          onClick={() => { setProfileTab('PASSWORD'); setError(""); setMessage(""); }}
        >
          <ShieldCheck size={16} style={{ marginRight: "8px", verticalAlign: "middle" }} />
          Security & Password
        </button>
      </div>

      {message && <div style={{ color: "green", marginBottom: "15px", fontWeight: "bold", padding: "10px", background: "#dcfce7", borderRadius: "12px" }}>{message}</div>}
      {error && <div style={{ color: "red", marginBottom: "15px", fontWeight: "bold", padding: "10px", background: "#fee2e2", borderRadius: "12px" }}>{error}</div>}

      {profileTab === 'INFO' ? (
        <div className="cx-admin-panel animate-fade-in">
          <div className="cx-admin-panel-header">
            <h3>Customer Profile</h3>
            <p className="cx-admin-profile-subtitle">Manage your account and address</p>
          </div>

          <div className="form-grid">
            <div className="cx-admin-profile-hero">
              <div className="cx-admin-profile-avatar-large">
                {authUser?.full_name?.charAt(0)?.toUpperCase() || "C"}
              </div>
              <div>
                <div className="cx-admin-profile-name">{authUser?.full_name || "Customer"}</div>
                <div className="cx-admin-profile-role">CUSTOMER</div>
              </div>
            </div>

            <div className="grid-1" style={{ gap: "12px" }}>
              <div className="grid-2">
                <div style={{ position: "relative" }}>
                  <label className="label">Full Name</label>
                  <input
                    className="input"
                    disabled={!isEditing}
                    value={profileData.full_name}
                    onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
                    placeholder="Full Name..."
                    maxLength={100}
                  />
                  <span style={{ position: "absolute", right: "12px", top: "38px", fontSize: "10px", color: profileData.full_name.length >= 100 ? "red" : "#999" }}>{profileData.full_name.length}/100</span>
                </div>
                <div>
                  <label className="label">Username</label>
                  <input className="input" disabled value={authUser?.username} />
                </div>
              </div>

              <div className="grid-2">
                <div style={{ position: "relative" }}>
                  <label className="label">Email</label>
                  <input
                    className="input"
                    disabled={!isEditing}
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    placeholder="Email..."
                    maxLength={100}
                  />
                  <span style={{ position: "absolute", right: "12px", top: "38px", fontSize: "10px", color: profileData.email.length >= 100 ? "red" : "#999" }}>{profileData.email.length}/100</span>
                </div>
                <div style={{ position: "relative" }}>
                  <label className="label">Phone</label>
                  <input
                    className="input"
                    disabled={!isEditing}
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    placeholder="Phone..."
                    maxLength={20}
                  />
                  <span style={{ position: "absolute", right: "12px", top: "38px", fontSize: "10px", color: profileData.phone.length >= 20 ? "red" : "#999" }}>{profileData.phone.length}/20</span>
                </div>
              </div>

              <div style={{ position: "relative" }}>
                <label className="label">Address</label>
                <input
                  className="input"
                  disabled={!isEditing}
                  value={profileData.address_line}
                  onChange={(e) => setProfileData({ ...profileData, address_line: e.target.value })}
                  placeholder="Address..."
                  maxLength={250}
                />
                <span style={{ position: "absolute", right: "12px", top: "38px", fontSize: "10px", color: profileData.address_line.length >= 250 ? "red" : "#999" }}>{profileData.address_line.length}/250</span>
              </div>

              <div className="grid-2">
                <div style={{ position: "relative" }}>
                  <label className="label">City</label>
                  <input
                    className="input"
                    disabled={!isEditing}
                    value={profileData.city}
                    onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                    placeholder="City..."
                    maxLength={100}
                  />
                  <span style={{ position: "absolute", right: "12px", top: "38px", fontSize: "10px", color: profileData.city.length >= 100 ? "red" : "#999" }}>{profileData.city.length}/100</span>
                </div>
                <div style={{ position: "relative" }}>
                  <label className="label">Country</label>
                  <input
                    className="input"
                    disabled={!isEditing}
                    value={profileData.country}
                    onChange={(e) => setProfileData({ ...profileData, country: e.target.value })}
                    placeholder="Country..."
                    maxLength={100}
                  />
                  <span style={{ position: "absolute", right: "12px", top: "38px", fontSize: "10px", color: profileData.country.length >= 100 ? "red" : "#999" }}>{profileData.country.length}/100</span>
                </div>
              </div>
            </div>

            <div className="mt-16 flex gap-12">
              {!isEditing ? (
                <button type="button" className="btn" onClick={() => setIsEditing(true)}>
                  Edit Profile
                </button>
              ) : (
                <>
                  <button type="button" className="btn" onClick={handleUpdateProfile} disabled={loading}>
                    {loading ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    type="button"
                    className="btn-outline"
                    onClick={() => {
                      setIsEditing(false);
                      setProfileData({
                        full_name: customerProfile?.full_name || authUser?.full_name || "",
                        email: customerProfile?.email || authUser?.email || "",
                        phone: customerProfile?.phone || authUser?.phone || "",
                        address_line: customerProfile?.address_line || "",
                        city: customerProfile?.city || "",
                        country: customerProfile?.country || "",
                      });
                    }}
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="cx-admin-panel animate-fade-in">
          <div className="cx-admin-panel-header">
            <h3>Security & Password</h3>
            <p className="cx-admin-profile-subtitle">Update your account security</p>
          </div>

          <div className="form-grid">
            <div className="grid-1" style={{ gap: "15px" }}>
              <div>
                <label className="label">Current Password</label>
                <input
                  type="password"
                  className="input"
                  value={passData.current_password}
                  onChange={(e) => setPassData({ ...passData, current_password: e.target.value })}
                />
              </div>
              <div className="separator" style={{ margin: "5px 0" }} />
              <div>
                <label className="label">New Password</label>
                <input
                  type="password"
                  className="input"
                  value={passData.new_password}
                  onChange={(e) => setPassData({ ...passData, new_password: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Confirm Password</label>
                <input
                  type="password"
                  className="input"
                  value={passData.new_password_confirmation}
                  onChange={(e) => setPassData({ ...passData, new_password_confirmation: e.target.value })}
                />
              </div>
            </div>

            <div className="mt-16">
              <button type="button" className="btn" onClick={handleChangePassword} disabled={loading}>
                {loading ? "Updating..." : "Update Password"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CustomerDashboard({ onLogout }) {
  const [authUser, setAuthUser] = useState(JSON.parse(localStorage.getItem("cx_auth_user") || "null"));
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
            onUpdateSuccess={(newUser) => {
              setAuthUser(newUser);
              localStorage.setItem("cx_auth_user", JSON.stringify(newUser));
              // Refresh customer profile to get address/city update
              api.getCustomers().then((items) => {
                const found = items.find((item) => item.user_id === newUser?.user_id);
                setCustomerProfile(found || null);
              });
            }}
          />
        )}
      </main>
    </div>
  );
}