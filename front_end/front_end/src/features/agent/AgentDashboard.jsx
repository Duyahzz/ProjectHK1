import React, { useEffect, useMemo, useState } from "react";
import {
  ClipboardList,
  FileText,
  LayoutDashboard,
  MapPinned,
  PackagePlus,
  Receipt,
  ShieldCheck,
  Truck,
  UserCircle2,
} from "lucide-react";
import { api } from "../../services/api";
import { formatCurrency } from "../../utils/helpers";

function AgentMenu({ activeTab, setActiveTab, onLogout }) {
  const menuItems = [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { key: "bookings", label: "Shipment Management", icon: ClipboardList },
    { key: "create-shipment", label: "Create Shipment", icon: PackagePlus },
    { key: "status", label: "Status Update", icon: MapPinned },
    { key: "bills", label: "Bills", icon: Receipt },
  ];

  return (
    <aside className="cx-admin-sidebar">
      <div className="cx-admin-brand">
        <div className="cx-admin-brand-logo">CX</div>
        <div>
          <div className="cx-admin-brand-title">CourierXpress</div>
          <div className="cx-admin-brand-subtitle">Agent Panel</div>
        </div>
      </div>

      <div className="cx-admin-role-card">
        <div className="cx-admin-role-label">Current Role</div>
        <div className="cx-admin-role-value">AGENT</div>
      </div>

      <div className="cx-admin-nav-title">Branch Operations</div>

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
        <h1>Agent Dashboard</h1>
        <p>Branch shipment booking, status update, billing, and search.</p>
      </div>

      <div className="cx-admin-header-right">
        <div
          className="cx-admin-user-box clickable"
          onClick={onOpenProfile}
          title="View agent profile"
        >
          <div className="cx-admin-user-avatar">
            {authUser?.full_name?.charAt(0)?.toUpperCase() || "A"}
          </div>
          <div>
            <div className="cx-admin-user-name">{authUser?.full_name || "Agent"}</div>
            <div className="cx-admin-user-role">
              {authUser?.role === "AGENT" ? "Agent" : authUser?.role || "-"}
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

function DashboardView({ shipments, bills, setActiveTab }) {
  const bookedCount = shipments.filter((item) => item.current_status === "BOOKED").length;
  const transitCount = shipments.filter((item) => item.current_status === "IN_TRANSIT").length;
  const deliveredCount = shipments.filter((item) => item.current_status === "DELIVERED").length;
  const pendingBills = bills.filter((item) => item.payment_status === "UNPAID").length;

  return (
    <>
      <div className="cx-admin-stat-grid">
        <DashboardStat title="Booked" value={bookedCount} tone="pending" />
        <DashboardStat title="In Transit" value={transitCount} tone="transit" />
        <DashboardStat title="Delivered" value={deliveredCount} tone="delivered" />
        <DashboardStat title="Pending Bills" value={pendingBills} tone="cancelled" />
      </div>

      <div className="cx-admin-grid-two">
        <div className="cx-admin-panel">
          <div className="cx-admin-panel-header">
            <h3>Branch Summary</h3>
          </div>

          <div className="cx-admin-summary-list">
            <div className="cx-admin-summary-row">
              <span>Total Shipments</span>
              <strong>{shipments.length}</strong>
            </div>
            <div className="cx-admin-summary-row">
              <span>Total Bills</span>
              <strong>{bills.length}</strong>
            </div>
            <div className="cx-admin-summary-row">
              <span>Revenue</span>
              <strong>
                {formatCurrency(
                  bills.reduce((sum, item) => sum + Number(item.total_amount || 0), 0)
                )}
              </strong>
            </div>
          </div>
        </div>

        <div className="cx-admin-panel">
          <div className="cx-admin-panel-header">
            <h3>Quick Access</h3>
          </div>

          <div className="cx-admin-shortcuts">
            <button className="cx-admin-shortcut" onClick={() => setActiveTab("bookings")}>
              <ClipboardList size={16} />
              <span>Shipment Management</span>
            </button>

            <button className="cx-admin-shortcut" onClick={() => setActiveTab("create-shipment")}>
              <PackagePlus size={16} />
              <span>Create Shipment</span>
            </button>

            <button className="cx-admin-shortcut" onClick={() => setActiveTab("status")}>
              <MapPinned size={16} />
              <span>Status Update</span>
            </button>

            <button className="cx-admin-shortcut" onClick={() => setActiveTab("bills")}>
              <Receipt size={16} />
              <span>View Bills</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function BookingsView({ shipments }) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return shipments;

    return shipments.filter(
      (item) =>
        item.tracking_number?.toLowerCase().includes(q) ||
        item.sender?.full_name?.toLowerCase().includes(q) ||
        item.receiver?.full_name?.toLowerCase().includes(q)
    );
  }, [query, shipments]);

  return (
    <div className="cx-admin-panel">
      <div className="cx-admin-toolbar">
        <div className="cx-admin-search">
          <ClipboardList size={16} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by tracking number or customer..."
          />
        </div>
      </div>

      <div className="cx-admin-table-wrap">
        <table className="cx-admin-table">
          <thead>
            <tr>
              <th>Tracking</th>
              <th>Sender</th>
              <th>Receiver</th>
              <th>Status</th>
              <th>Expected</th>
              <th>Charge</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length ? (
              filtered.map((item) => (
                <tr key={item.shipment_id}>
                  <td className="cx-highlight-cell">{item.tracking_number}</td>
                  <td>{item.sender?.full_name || "-"}</td>
                  <td>{item.receiver?.full_name || "-"}</td>
                  <td>
                    <StatusPill value={item.current_status} />
                  </td>
                  <td>{item.expected_delivery_date || "-"}</td>
                  <td>{formatCurrency(item.total_charge || 0)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="cx-empty-row">
                  No shipments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CreateShipmentView({ onShipmentCreated, authUser }) {
  const [customers, setCustomers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [shipmentTypes, setShipmentTypes] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [createMessage, setCreateMessage] = useState("");
  const [createError, setCreateError] = useState("");

  const [formData, setFormData] = useState({
    sender_name: "",
    sender_phone: "",
    sender_address: "",
    sender_city: "",
    receiver_name: "",
    receiver_phone: "",
    receiver_address: "",
    receiver_city: "",
    shipment_type_id: "",
    origin_branch_id: authUser?.branch_id ? String(authUser.branch_id) : "",
    assigned_agent_id: authUser?.user_id ? String(authUser.user_id) : "",
    weight: "",
    total_charge: "",
    parcel_name: "",
    item_description: "",
    expected_delivery_date: new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
    notes: "",
  });

  useEffect(() => {
    api.getCustomers().then(setCustomers).catch(console.error);
    api.getBranches().then(setBranches).catch(console.error);
    api.getShipmentTypes().then(setShipmentTypes).catch(console.error);
  }, []);

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Smart Search Logic for Phone Numbers
    if (field === 'sender_phone' || field === 'receiver_phone') {
      const type = field === 'sender_phone' ? 'sender' : 'receiver';
      if (value.length >= 3) { // Start searching after 3 characters
        const customer = customers.find(c => c.phone && c.phone.includes(value));
        if (customer && customer.phone === value) { // Exact match
          autoFill(type, customer);
        }
      }
    }
  };

  const autoFill = (type, customer) => {
    if (type === 'sender') {
      setFormData(prev => ({
        ...prev,
        sender_name: customer.full_name || prev.sender_name,
        sender_address: customer.address_line || prev.sender_address,
        sender_city: customer.city || prev.sender_city,
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        receiver_name: customer.full_name || prev.receiver_name,
        receiver_address: customer.address_line || prev.receiver_address,
        receiver_city: customer.city || prev.receiver_city,
      }));
    }
  };

  const resetForm = () => {
    setFormData({
      sender_name: "",
      sender_phone: "",
      sender_address: "",
      sender_city: "",
      receiver_name: "",
      receiver_phone: "",
      receiver_address: "",
      receiver_city: "",
      shipment_type_id: "",
      origin_branch_id: authUser?.branch_id ? String(authUser.branch_id) : "",
      assigned_agent_id: authUser?.user_id ? String(authUser.user_id) : "",
      weight: "",
      total_charge: "",
      parcel_name: "",
      item_description: "",
      expected_delivery_date: new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
      notes: "",
    });
    setCreateMessage("");
    setCreateError("");
  };

  const handleCreateShipment = async (e) => {
    e.preventDefault();
    setCreateMessage("");
    setCreateError("");

    try {
      setSubmitting(true);

      const payload = {
        ...formData,
        shipment_type_id: Number(formData.shipment_type_id),
        origin_branch_id: Number(formData.origin_branch_id),
        assigned_agent_id: formData.assigned_agent_id ? Number(formData.assigned_agent_id) : null,
        weight: Number(formData.weight),
        total_charge: Number(formData.total_charge),
      };

      await api.createShipment(payload);

      setCreateMessage("Create shipment successfully.");
      resetForm();

      if (onShipmentCreated) {
        onShipmentCreated();
      }
    } catch (error) {
      console.error(error);
      setCreateError("Create shipment failed. Please check your data.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="cx-admin-panel">
      <div className="cx-admin-panel-header">
        <h3>Create Shipment Booking</h3>
        <p className="cx-admin-profile-subtitle">
          Create a new shipment and save it to the real database.
        </p>
      </div>

      <form onSubmit={handleCreateShipment} className="form-grid">
        {/* Sender Section */}
        <div style={{ gridColumn: "1 / -1", fontWeight: "bold", color: "#2563eb", borderBottom: "1px solid #ddd", paddingBottom: "5px" }}>
          SENDER INFORMATION (Type phone to search)
        </div>
        <div className="grid-2">
          <div>
            <label className="label">Sender Phone</label>
            <input className="input" type="text" value={formData.sender_phone} onChange={(e) => handleChange("sender_phone", e.target.value)} required placeholder="Search by phone..." />
          </div>
          <div>
            <label className="label">Sender Name</label>
            <input className="input" type="text" value={formData.sender_name} onChange={(e) => handleChange("sender_name", e.target.value)} required />
          </div>
        </div>
        <div className="grid-2">
          <div>
            <label className="label">Sender Address</label>
            <input className="input" type="text" value={formData.sender_address} onChange={(e) => handleChange("sender_address", e.target.value)} required />
          </div>
          <div>
            <label className="label">Sender City</label>
            <input className="input" type="text" value={formData.sender_city} onChange={(e) => handleChange("sender_city", e.target.value)} />
          </div>
        </div>

        {/* Receiver Section */}
        <div style={{ gridColumn: "1 / -1", fontWeight: "bold", color: "#2563eb", borderBottom: "1px solid #ddd", paddingBottom: "5px", marginTop: "10px" }}>
          RECEIVER INFORMATION (Type phone to search)
        </div>
        <div className="grid-2">
          <div>
            <label className="label">Receiver Phone</label>
            <input className="input" type="text" value={formData.receiver_phone} onChange={(e) => handleChange("receiver_phone", e.target.value)} required placeholder="Search by phone..." />
          </div>
          <div>
            <label className="label">Receiver Name</label>
            <input className="input" type="text" value={formData.receiver_name} onChange={(e) => handleChange("receiver_name", e.target.value)} required />
          </div>
        </div>
        <div className="grid-2">
          <div>
            <label className="label">Receiver Address</label>
            <input className="input" type="text" value={formData.receiver_address} onChange={(e) => handleChange("receiver_address", e.target.value)} required />
          </div>
          <div>
            <label className="label">Receiver City</label>
            <input className="input" type="text" value={formData.receiver_city} onChange={(e) => handleChange("receiver_city", e.target.value)} />
          </div>
        </div>

        {/* Shipment Details Section */}
        <div style={{ gridColumn: "1 / -1", fontWeight: "bold", color: "#2563eb", borderBottom: "1px solid #ddd", paddingBottom: "5px", marginTop: "10px" }}>SHIPMENT DETAILS</div>

        <div className="grid-2">
          <div>
            <label className="label">Shipment Type</label>
            <select
              className="select"
              value={formData.shipment_type_id}
              onChange={(e) => handleChange("shipment_type_id", e.target.value)}
              required
            >
              <option value="">Select shipment type</option>
              {shipmentTypes.map((type) => (
                <option key={type.shipment_type_id} value={type.shipment_type_id}>
                  {type.type_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">Origin Branch</label>
            <select
              className="select"
              value={formData.origin_branch_id}
              onChange={(e) => handleChange("origin_branch_id", e.target.value)}
              required
            >
              <option value="">Select branch</option>
              {branches.map((branch) => (
                <option key={branch.branch_id} value={branch.branch_id}>
                  {branch.branch_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid-3">
          <div>
            <label className="label">Assigned Agent ID</label>
            <input
              className="input"
              type="number"
              value={formData.assigned_agent_id}
              onChange={(e) => handleChange("assigned_agent_id", e.target.value)}
              placeholder="Example: 2"
            />
          </div>

          <div>
            <label className="label">Weight</label>
            <input
              className="input"
              type="number"
              step="0.01"
              min="0.01"
              value={formData.weight}
              onChange={(e) => handleChange("weight", e.target.value)}
              placeholder="Example: 1.5"
              required
            />
          </div>

          <div>
            <label className="label">Total Charge</label>
            <input
              className="input"
              type="number"
              step="0.01"
              min="0"
              value={formData.total_charge}
              onChange={(e) => handleChange("total_charge", e.target.value)}
              placeholder="Example: 50000"
              required
            />
          </div>
        </div>

        <div>
          <label className="label">Expected Delivery Date & Time</label>
          <input
            className="input"
            type="datetime-local"
            min={new Date().toISOString().slice(0, 16)}
            value={formData.expected_delivery_date}
            onChange={(e) => handleChange("expected_delivery_date", e.target.value)}
            required
          />
        </div>

        <div>
          <label className="label">Notes</label>
          <textarea
            className="textarea"
            value={formData.notes}
            onChange={(e) => handleChange("notes", e.target.value)}
            placeholder="Enter shipment notes"
          />
        </div>

        {createMessage ? (
          <div style={{ color: "green", fontWeight: 600 }}>{createMessage}</div>
        ) : null}

        {createError ? (
          <div style={{ color: "red", fontWeight: 600 }}>{createError}</div>
        ) : null}

        <div className="flex gap-12">
          <button type="submit" className="btn" disabled={submitting}>
            {submitting ? "Creating..." : "Create Shipment"}
          </button>

          <button type="button" className="btn-outline" onClick={resetForm} disabled={submitting}>
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}

function StatusView({ authUser, onStatusUpdated }) {
  const [tracking, setTracking] = useState("TRK002");
  const [details, setDetails] = useState(null);
  const [status, setStatus] = useState("IN_TRANSIT");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);

  const search = async () => {
    setLoading(true);
    try {
      const result = await api.trackShipment(tracking);
      setDetails(result);
      setStatus(result.current_status || "IN_TRANSIT");
    } catch (error) {
      alert("Tracking number not found");
      setDetails(null);
    } finally {
      setLoading(false);
    }
  };

  const save = async () => {
    if (!details) return;

    try {
      const result = await api.updateShipmentStatus(details.shipment_id, {
        status,
        status_note: note,
        updated_by_user_id: authUser?.user_id || 1,
      });

      setDetails((prev) => ({
        ...prev,
        current_status: result.shipment.current_status,
        status_history: [...(prev.status_history || prev.statusHistory || []), result.history],
      }));
      setNote("");
      alert("Status updated successfully");
      if (onStatusUpdated) onStatusUpdated();
    } catch (error) {
      alert(error.message || "Cannot update shipment status");
    }
  };

  const timeline = details?.status_history || details?.statusHistory || [];

  return (
    <div className="cx-admin-grid-two">
      <div className="cx-admin-panel">
        <div className="cx-admin-panel-header">
          <h3>Update Shipment Status</h3>
          <p className="cx-admin-profile-subtitle">
            Search by tracking number and save a new shipment stage.
          </p>
        </div>

        <div className="form-grid">
          <div className="toolbar">
            <input
              className="input"
              placeholder="Enter tracking number"
              value={tracking}
              onChange={(e) => setTracking(e.target.value)}
            />
            <button className="btn" onClick={search}>
              {loading ? "Searching..." : "Search"}
            </button>
          </div>

          <div className="grid-2">
            <select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option>BOOKED</option>
              <option>PICKED_UP</option>
              <option>IN_TRANSIT</option>
              <option>OUT_FOR_DELIVERY</option>
              <option>DELIVERED</option>
              <option>CANCELLED</option>
            </select>

            <input
              className="input"
              placeholder="Remark"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <button className="btn" style={{ width: "fit-content" }} onClick={save} disabled={!details}>
            Save Update
          </button>
        </div>
      </div>

      <div className="cx-admin-panel">
        <div className="cx-admin-panel-header">
          <h3>Status Timeline</h3>
          <p className="cx-admin-profile-subtitle">
            History stored in shipment_status_history.
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
            <div className="text-muted">No tracking timeline yet. Search a tracking number first.</div>
          )}
        </div>
      </div>
    </div>
  );
}

function BillsView({ bills }) {
  const firstBill = bills[0];

  return (
    <div className="cx-admin-grid-two">
      <div className="cx-admin-panel">
        <div className="cx-admin-table-wrap">
          <table className="cx-admin-table">
            <thead>
              <tr>
                <th>Bill No</th>
                <th>Tracking</th>
                <th>Total</th>
                <th>Status</th>
                <th>Method</th>
              </tr>
            </thead>
            <tbody>
              {bills.length ? (
                bills.map((item) => (
                  <tr key={item.bill_id}>
                    <td>{item.bill_number}</td>
                    <td>{item.shipment?.tracking_number || "-"}</td>
                    <td>{formatCurrency(item.total_amount || 0)}</td>
                    <td>
                      <StatusPill value={item.payment_status} />
                    </td>
                    <td>{item.payment_method || "-"}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="cx-empty-row">
                    Loading bills...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="cx-admin-panel">
        <div className="cx-admin-panel-header">
          <h3>Bill Details</h3>
        </div>

        {firstBill ? (
          <>
            <div className="cx-admin-summary-list">
              <div className="cx-admin-summary-row">
                <span>Bill Number</span>
                <strong>{firstBill.bill_number}</strong>
              </div>
              <div className="cx-admin-summary-row">
                <span>Tracking Number</span>
                <strong>{firstBill.shipment?.tracking_number || "-"}</strong>
              </div>
              <div className="cx-admin-summary-row">
                <span>Total</span>
                <strong>{formatCurrency(firstBill.total_amount || 0)}</strong>
              </div>
              <div className="cx-admin-summary-row">
                <span>Status</span>
                <StatusPill value={firstBill.payment_status} />
              </div>
            </div>

            <div className="separator" />

            <div className="flex gap-12">
              <button className="btn">Print Bill</button>
              <button className="btn-outline">Mark Paid</button>
            </div>
          </>
        ) : (
          <div className="text-muted">No bill loaded.</div>
        )}
      </div>
    </div>
  );
}

function AgentProfilePage({ authUser, onUpdateSuccess }) {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: authUser?.full_name || "",
    email: authUser?.email || "",
    phone: authUser?.phone || "",
  });

  const [passData, setPassData] = useState({
    current_password: "",
    new_password: "",
    new_password_confirmation: "",
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
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

  const handleChangePassword = async (e) => {
    e.preventDefault();
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
    <div className="cx-admin-grid-two">
      <div className="cx-admin-panel">
        <div className="cx-admin-panel-header">
          <h3>Agent Profile</h3>
          <p className="cx-admin-profile-subtitle">Manage your personal information</p>
        </div>

        {message && <div style={{ color: "green", marginBottom: "15px", fontWeight: "bold" }}>{message}</div>}
        {error && <div style={{ color: "red", marginBottom: "15px", fontWeight: "bold" }}>{error}</div>}

        <div className="form-grid">
          <div className="cx-admin-profile-hero">
            <div className="cx-admin-profile-avatar-large">
              {authUser?.full_name?.charAt(0)?.toUpperCase() || "A"}
            </div>
            <div>
              <div className="cx-admin-profile-name">{authUser?.full_name || "Agent"}</div>
              <div className="cx-admin-profile-role">AGENT</div>
            </div>
          </div>

          <div className="grid-1" style={{ gap: "15px" }}>
            <div>
              <label className="label">Full Name</label>
              <input
                className="input"
                disabled={!isEditing}
                value={profileData.full_name}
                onChange={(e) => setProfileData({ ...profileData, full_name: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Email Address</label>
              <input
                className="input"
                disabled={!isEditing}
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Phone Number</label>
              <input
                className="input"
                disabled={!isEditing}
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
              />
            </div>
            <div className="cx-admin-profile-item" style={{ border: "none", padding: 0 }}>
              <span>Username: </span>
              <strong>{authUser?.username}</strong>
            </div>
          </div>

          <div className="flex gap-12 mt-16">
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
                      full_name: authUser.full_name,
                      email: authUser.email,
                      phone: authUser.phone,
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

      <div className="cx-admin-panel">
        <div className="cx-admin-panel-header">
          <h3>Change Password</h3>
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
                required
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
                required
              />
            </div>
            <div>
              <label className="label">Confirm New Password</label>
              <input
                type="password"
                className="input"
                value={passData.new_password_confirmation}
                onChange={(e) => setPassData({ ...passData, new_password_confirmation: e.target.value })}
                required
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
    </div>
  );
}

export default function AgentDashboard({ onLogout }) {
  const [authUser, setAuthUser] = useState(JSON.parse(localStorage.getItem("cx_auth_user") || "null"));
  const [activeTab, setActiveTab] = useState("dashboard");
  const [shipments, setShipments] = useState([]);
  const [bills, setBills] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadDashboardData = () => {
    const params = authUser?.branch_id ? { branch_id: authUser.branch_id } : {};
    api.getShipments(params).then(setShipments).catch(console.error);
    api.getBills(params).then(setBills).catch(console.error);
  };

  useEffect(() => {
    loadDashboardData();
  }, [refreshKey]);

  const handleShipmentCreated = () => {
    setRefreshKey((prev) => prev + 1);
    setActiveTab("bookings");
  };

  return (
    <div className="cx-admin-layout">
      <AgentMenu activeTab={activeTab} setActiveTab={setActiveTab} onLogout={onLogout} />

      <main className="cx-admin-main">
        <HeaderBar
          authUser={authUser}
          onOpenProfile={() => setActiveTab("agent-profile")}
        />

        {activeTab === "dashboard" && (
          <DashboardView shipments={shipments} bills={bills} setActiveTab={setActiveTab} />
        )}

        {activeTab === "agent-profile" && (
          <AgentProfilePage
            authUser={authUser}
            onUpdateSuccess={(newUser) => {
              setAuthUser(newUser);
              localStorage.setItem("cx_auth_user", JSON.stringify(newUser));
            }}
          />
        )}

        {activeTab === "bookings" && <BookingsView shipments={shipments} />}

        {activeTab === "create-shipment" && (
          <CreateShipmentView
            onShipmentCreated={handleShipmentCreated}
            authUser={authUser}
          />
        )}

        {activeTab === "status" && <StatusView authUser={authUser} onStatusUpdated={loadDashboardData} />}

        {activeTab === "bills" && <BillsView bills={bills} />}
      </main>
    </div>
  );
}