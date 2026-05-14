import React, { useEffect, useMemo, useState } from "react";
import {
  Building2,
  ClipboardList,
  FileText,
  LayoutDashboard,
  MapPinned,
  Package,
  Receipt,
  Users,
} from "lucide-react";
import { api } from "../../services/api";
import { formatCurrency } from "../../utils/helpers";

function AdminMenu({ activeTab, setActiveTab, onLogout }) {
  const menuItems = [
    { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { key: "shipments", label: "Shipments", icon: Package },
    { key: "customers", label: "Customers", icon: Users },
    { key: "branches", label: "Branches", icon: Building2 },
    { key: "types", label: "Shipment Types", icon: ClipboardList },
    { key: "bills", label: "Bills", icon: Receipt },
    { key: "reports", label: "Reports", icon: FileText },
  ];

  return (
    <aside className="cx-admin-sidebar">
      <div className="cx-admin-brand">
        <div className="cx-admin-brand-logo">CX</div>
        <div>
          <div className="cx-admin-brand-title">CourierXpress</div>
          <div className="cx-admin-brand-subtitle">Admin Panel</div>
        </div>
      </div>

      <div className="cx-admin-role-card">
        <div className="cx-admin-role-label">Current Role</div>
        <div className="cx-admin-role-value">ADMIN</div>
      </div>

      <div className="cx-admin-nav-title">Management Menu</div>

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
        <h1>Admin Dashboard</h1>
        <p>Overview of shipment operations, billing, and master data.</p>
      </div>

      <div className="cx-admin-header-right">
        <div
          className="cx-admin-user-box clickable"
          onClick={onOpenProfile}
          title="View administrator profile"
        >
          <div className="cx-admin-user-avatar">
            {authUser?.full_name?.charAt(0)?.toUpperCase() || "A"}
          </div>
          <div>
            <div className="cx-admin-user-name">
              {authUser?.full_name || "Admin"}
            </div>
            <div className="cx-admin-user-role">
              {authUser?.role === "ADMIN"
                ? "Administrator"
                : authUser?.role || "-"}
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
  if (status === "IN_TRANSIT") className = "transit";
  if (status === "DELIVERED" || status === "PAID" || status === "ACTIVE") {
    className = "delivered";
  }
  if (status === "CANCELLED" || status === "UNPAID" || status === "INACTIVE") {
    className = "cancelled";
  }

  return <span className={`cx-status-pill ${className}`}>{status || "-"}</span>;
}

function DashboardView({ shipments, bills, setActiveTab }) {
  const shipmentList = Array.isArray(shipments) ? shipments : (shipments?.data || []);
  const billList = Array.isArray(bills) ? bills : (bills?.data || []);

  const bookedCount = shipmentList.filter(
    (item) => item.current_status === "BOOKED"
  ).length;
  const transitCount = shipmentList.filter(
    (item) => item.current_status === "IN_TRANSIT"
  ).length;
  const deliveredCount = shipmentList.filter(
    (item) => item.current_status === "DELIVERED"
  ).length;
  const cancelledCount = shipmentList.filter(
    (item) => item.current_status === "CANCELLED"
  ).length;

  const revenue = billList.reduce(
    (sum, item) => sum + Number(item.total_amount || 0),
    0
  );

  return (
    <>
      <div className="cx-admin-stat-grid">
        <DashboardStat title="Total Shipments" value={shipmentList.length} />
        <DashboardStat title="Booked" value={bookedCount} tone="pending" />
        <DashboardStat title="In Transit" value={transitCount} tone="transit" />
        <DashboardStat
          title="Delivered"
          value={deliveredCount}
          tone="delivered"
        />
        <DashboardStat
          title="Cancelled"
          value={cancelledCount}
          tone="cancelled"
        />
      </div>

      <div className="cx-admin-grid-two">
        <div className="cx-admin-panel">
          <div className="cx-admin-panel-header">
            <h3>Business Summary</h3>
          </div>

          <div className="cx-admin-summary-list">
            <div className="cx-admin-summary-row">
              <span>Total Bills</span>
              <strong>{billList.length}</strong>
            </div>
            <div className="cx-admin-summary-row">
              <span>Total Revenue</span>
              <strong>{formatCurrency(revenue)}</strong>
            </div>
            <div className="cx-admin-summary-row">
              <span>Shipment Management</span>
              <button
                className="cx-inline-link"
                onClick={() => setActiveTab("shipments")}
              >
                Open Shipments
              </button>
            </div>
          </div>
        </div>

        <div className="cx-admin-panel">
          <div className="cx-admin-panel-header">
            <h3>Quick Access</h3>
          </div>

          <div className="cx-admin-shortcuts">
            <button
              className="cx-admin-shortcut"
              onClick={() => setActiveTab("shipments")}
            >
              <Package size={16} />
              <span>Shipment Overview</span>
            </button>

            <button
              className="cx-admin-shortcut"
              onClick={() => setActiveTab("customers")}
            >
              <Users size={16} />
              <span>Customer Records</span>
            </button>

            <button
              className="cx-admin-shortcut"
              onClick={() => setActiveTab("branches")}
            >
              <Building2 size={16} />
              <span>Branches</span>
            </button>

            <button
              className="cx-admin-shortcut"
              onClick={() => setActiveTab("bills")}
            >
              <Receipt size={16} />
              <span>Billing</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function ShipmentsView({ refreshKey, authUser, onDataChanged }) {
  const [shipmentFilter, setShipmentFilter] = useState("ALL");
  const [keyword, setKeyword] = useState("");
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedShipment, setSelectedShipment] = useState(null);
  const [statusForm, setStatusForm] = useState({
    status: "BOOKED",
    status_note: "",
  });
  const [statusLoading, setStatusLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    setLoading(true);
    api
      .getShipments({ status: shipmentFilter === "ALL" ? "" : shipmentFilter })
      .then(setShipments)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [shipmentFilter, refreshKey]);

  const filteredShipments = useMemo(() => {
    const list = Array.isArray(shipments) ? shipments : (shipments?.data || []);
    const q = keyword.trim().toLowerCase();
    if (!q) return list;

    return list.filter(
      (item) =>
        item.tracking_number?.toLowerCase().includes(q) ||
        item.sender?.full_name?.toLowerCase().includes(q) ||
        item.receiver?.full_name?.toLowerCase().includes(q)
    );
  }, [shipments, keyword]);

  const openStatusEditor = (shipment) => {
    setSelectedShipment(shipment);
    setStatusForm({
      status: shipment.current_status || "BOOKED",
      status_note: "",
    });
    setStatusMessage("");
  };

  const handleUpdateStatus = async () => {
    if (!selectedShipment) return;

    try {
      setStatusLoading(true);
      setStatusMessage("");

      await api.updateShipmentStatus(selectedShipment.shipment_id, {
        status: statusForm.status,
        status_note: statusForm.status_note,
        updated_by_user_id: authUser?.user_id || 1,
      });

      setStatusMessage("Shipment status updated successfully.");
      setSelectedShipment(null);
      onDataChanged();
    } catch (error) {
      setStatusMessage(error.message || "Cannot update shipment status.");
    } finally {
      setStatusLoading(false);
    }
  };

  return (
    <>
      <div className="cx-admin-panel">
        <div className="cx-admin-toolbar">
          <div className="cx-admin-search">
            <MapPinned size={16} />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search by tracking number, sender, or receiver..."
            />
          </div>

          <select
            className="cx-admin-select"
            value={shipmentFilter}
            onChange={(e) => setShipmentFilter(e.target.value)}
          >
            <option value="ALL">All Status</option>
            <option value="BOOKED">BOOKED</option>
            <option value="IN_TRANSIT">IN_TRANSIT</option>
            <option value="DELIVERED">DELIVERED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>

        <div className="cx-admin-table-wrap">
          <table className="cx-admin-table">
            <thead>
              <tr>
                <th>Tracking No</th>
                <th>Sender</th>
                <th>Receiver</th>
                <th>Type</th>
                <th>Branch</th>
                <th>Status</th>
                <th>Total Charge</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="cx-empty-row">
                    Loading shipments...
                  </td>
                </tr>
              ) : filteredShipments.length ? (
                filteredShipments.map((item) => (
                  <tr key={item.shipment_id}>
                    <td className="cx-highlight-cell">
                      {item.tracking_number}
                    </td>
                    <td>{item.sender?.full_name || "-"}</td>
                    <td>{item.receiver?.full_name || "-"}</td>
                    <td>
                      {item.shipment_type?.type_name ||
                        item.shipmentType?.type_name ||
                        "-"}
                    </td>
                    <td>{item.branch?.branch_name || "-"}</td>
                    <td>
                      <StatusPill value={item.current_status} />
                    </td>
                    <td>{formatCurrency(item.total_charge || 0)}</td>
                    <td>
                      <button
                        className="btn-outline"
                        onClick={() => openStatusEditor(item)}
                      >
                        Change Status
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="cx-empty-row">
                    No shipments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedShipment && (
        <div className="cx-admin-panel mt-24">
          <div className="cx-admin-panel-header">
            <h3>Update Shipment Status</h3>
            <p className="cx-admin-profile-subtitle">
              Tracking: {selectedShipment.tracking_number}
            </p>
          </div>

          <div className="grid-2">
            <div>
              <label className="label">Status</label>
              <select
                className="select"
                value={statusForm.status}
                onChange={(e) =>
                  setStatusForm((prev) => ({ ...prev, status: e.target.value }))
                }
              >
                <option value="BOOKED">BOOKED</option>
                <option value="IN_TRANSIT">IN_TRANSIT</option>
                <option value="DELIVERED">DELIVERED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>

            <div style={{ position: "relative" }}>
              <label className="label">Note</label>
              <input
                className="input"
                value={statusForm.status_note}
                onChange={(e) =>
                  setStatusForm((prev) => ({
                    ...prev,
                    status_note: e.target.value,
                  }))
                }
                placeholder="Enter status note..."
                maxLength={250}
              />
              <span style={{ position: "absolute", right: "12px", top: "38px", fontSize: "10px", color: statusForm.status_note.length >= 250 ? "red" : "#999" }}>{statusForm.status_note.length}/250</span>
            </div>
          </div>

          {statusMessage ? (
            <div style={{ marginTop: 14, fontWeight: 600 }}>
              {statusMessage}
            </div>
          ) : null}

          <div className="flex gap-12 mt-24">
            <button
              className="btn"
              onClick={handleUpdateStatus}
              disabled={statusLoading}
            >
              {statusLoading ? "Saving..." : "Save Status"}
            </button>

            <button
              className="btn-outline"
              onClick={() => {
                setSelectedShipment(null);
                setStatusMessage("");
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function CustomersView({ refreshKey, onDataChanged }) {
  const emptyForm = {
    full_name: "",
    email: "",
    phone: "",
    address_line: "",
    city: "",
    country: "Vietnam",
  };

  const [query, setQuery] = useState("");
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const loadCustomers = () => {
    setLoading(true);
    api
      .getCustomers(query)
      .then(setCustomers)
      .catch((error) => {
        console.error(error);
        setMessage(error.message || "Cannot load customers.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      loadCustomers();
    }, 250);

    return () => clearTimeout(timer);
  }, [query, refreshKey]);

  const getFieldError = (name) => {
    const value = fieldErrors?.[name];
    if (Array.isArray(value)) return value[0];
    return value || "";
  };

  const clearFieldError = (name) => {
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async () => {
    try {
      setSaving(true);
      setMessage("");
      setFieldErrors({});

      if (editingCustomer) {
        await api.updateCustomer(editingCustomer.customer_id, form);
        setMessage("Customer updated successfully.");
      } else {
        await api.createCustomer(form);
        setMessage("Customer created successfully.");
      }

      setForm(emptyForm);
      setEditingCustomer(null);
      onDataChanged();
    } catch (error) {
      if (error.status === 422) {
        setFieldErrors(error.validationErrors || {});
        setMessage("Please check the highlighted fields.");
      } else {
        setMessage(error.message || "Cannot save customer.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    setForm({
      full_name: customer.full_name || "",
      email: customer.email || "",
      phone: customer.phone || "",
      address_line: customer.address_line || "",
      city: customer.city || "",
      country: customer.country || "Vietnam",
    });
    setMessage("");
    setFieldErrors({});
  };

  const handleDelete = async (customer) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete customer "${customer.full_name}"?`
    );

    if (!confirmed) return;

    try {
      setMessage("");
      const res = await api.deleteCustomer(customer.customer_id);
      setMessage(res.message || "Customer deleted successfully.");

      if (editingCustomer?.customer_id === customer.customer_id) {
        setEditingCustomer(null);
        setForm(emptyForm);
      }

      onDataChanged();
    } catch (error) {
      setMessage(error.message || "Cannot delete customer.");
      alert(error.message || "Cannot delete customer.");
    }
  };

  return (
    <>
      <div className="cx-admin-panel">
        <div className="cx-admin-toolbar">
          <div className="cx-admin-search">
            <Users size={16} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, phone, city, or code..."
            />
          </div>
        </div>

        <div className="cx-admin-table-wrap">
          <table className="cx-admin-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Name</th>
                <th>Phone</th>
                <th>Email</th>
                <th>City</th>
                <th>Country</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="cx-empty-row">
                    Loading customers...
                  </td>
                </tr>
              ) : customers.length ? (
                customers.map((item) => (
                  <tr key={item.customer_id}>
                    <td>{item.customer_code}</td>
                    <td>{item.full_name}</td>
                    <td>{item.phone}</td>
                    <td>{item.email}</td>
                    <td>{item.city}</td>
                    <td>{item.country}</td>
                    <td>
                      <div className="flex gap-12">
                        <button
                          className="btn-outline"
                          onClick={() => handleEdit(item)}
                        >
                          Edit
                        </button>

                        <button
                          className="btn-outline"
                          onClick={() => handleDelete(item)}
                          style={{ color: "#dc2626", borderColor: "#fecaca" }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="cx-empty-row">
                    No customers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="cx-admin-panel mt-24">
        <div className="cx-admin-panel-header">
          <h3>{editingCustomer ? "Edit Customer" : "Add Customer"}</h3>
        </div>

        <div className="grid-2">
          <div style={{ position: "relative" }}>
            <label className="label">Full Name</label>
            <input
              className={`input ${getFieldError("full_name") ? "input-error" : ""}`}
              value={form.full_name}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, full_name: e.target.value }));
                clearFieldError("full_name");
              }}
              placeholder="Full name..."
              maxLength={100}
            />
            <span style={{ position: "absolute", right: "12px", top: "38px", fontSize: "10px", color: form.full_name.length >= 100 ? "red" : "#999" }}>{form.full_name.length}/100</span>
            {getFieldError("full_name") ? (
              <div className="field-error">{getFieldError("full_name")}</div>
            ) : null}
          </div>

          <div style={{ position: "relative" }}>
            <label className="label">Email</label>
            <input
              className={`input ${getFieldError("email") ? "input-error" : ""}`}
              value={form.email}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, email: e.target.value }));
                clearFieldError("email");
              }}
              placeholder="Email..."
              maxLength={100}
            />
            <span style={{ position: "absolute", right: "12px", top: "38px", fontSize: "10px", color: form.email.length >= 100 ? "red" : "#999" }}>{form.email.length}/100</span>
            {getFieldError("email") ? (
              <div className="field-error">{getFieldError("email")}</div>
            ) : null}
          </div>

          <div style={{ position: "relative" }}>
            <label className="label">Phone</label>
            <input
              className={`input ${getFieldError("phone") ? "input-error" : ""}`}
              value={form.phone}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, phone: e.target.value }));
                clearFieldError("phone");
              }}
              placeholder="Phone..."
              maxLength={20}
            />
            <span style={{ position: "absolute", right: "12px", top: "38px", fontSize: "10px", color: form.phone.length >= 20 ? "red" : "#999" }}>{form.phone.length}/20</span>
            {getFieldError("phone") ? (
              <div className="field-error">{getFieldError("phone")}</div>
            ) : null}
          </div>

          <div style={{ position: "relative" }}>
            <label className="label">Address</label>
            <input
              className={`input ${getFieldError("address_line") ? "input-error" : ""}`}
              value={form.address_line}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, address_line: e.target.value }));
                clearFieldError("address_line");
              }}
              placeholder="Address..."
              maxLength={250}
            />
            <span style={{ position: "absolute", right: "12px", top: "38px", fontSize: "10px", color: form.address_line.length >= 250 ? "red" : "#999" }}>{form.address_line.length}/250</span>
            {getFieldError("address_line") ? (
              <div className="field-error">{getFieldError("address_line")}</div>
            ) : null}
          </div>

          <div style={{ position: "relative" }}>
            <label className="label">City</label>
            <input
              className={`input ${getFieldError("city") ? "input-error" : ""}`}
              value={form.city}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, city: e.target.value }));
                clearFieldError("city");
              }}
              placeholder="City..."
              maxLength={100}
            />
            <span style={{ position: "absolute", right: "12px", top: "38px", fontSize: "10px", color: form.city.length >= 100 ? "red" : "#999" }}>{form.city.length}/100</span>
            {getFieldError("city") ? (
              <div className="field-error">{getFieldError("city")}</div>
            ) : null}
          </div>

          <div style={{ position: "relative" }}>
            <label className="label">Country</label>
            <input
              className={`input ${getFieldError("country") ? "input-error" : ""}`}
              value={form.country}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, country: e.target.value }));
                clearFieldError("country");
              }}
              placeholder="Country..."
              maxLength={100}
            />
            <span style={{ position: "absolute", right: "12px", top: "38px", fontSize: "10px", color: form.country.length >= 100 ? "red" : "#999" }}>{form.country.length}/100</span>
            {getFieldError("country") ? (
              <div className="field-error">{getFieldError("country")}</div>
            ) : null}
          </div>
        </div>

        {message ? (
          <div style={{ marginTop: 14, fontWeight: 600 }}>{message}</div>
        ) : null}

        <div className="flex gap-12 mt-24">
          <button className="btn" onClick={handleSubmit} disabled={saving}>
            {saving
              ? "Saving..."
              : editingCustomer
                ? "Update Customer"
                : "Add Customer"}
          </button>

          <button
            className="btn-outline"
            onClick={() => {
              setEditingCustomer(null);
              setForm(emptyForm);
              setFieldErrors({});
              setMessage("");
            }}
          >
            Reset
          </button>
        </div>
      </div>
    </>
  );
}

function BranchesView({ refreshKey, onDataChanged }) {
  const emptyForm = {
    branch_code: "",
    branch_name: "",
    city: "",
    phone: "",
    email: "",
    status: "ACTIVE",
  };

  const [branches, setBranches] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const loadBranches = () => {
    api.getBranches().then(setBranches).catch(console.error);
  };

  useEffect(() => {
    loadBranches();
  }, [refreshKey]);

  const getFieldError = (name) => {
    const value = fieldErrors?.[name];
    if (Array.isArray(value)) return value[0];
    return value || "";
  };

  const clearFieldError = (name) => {
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleCreateBranch = async () => {
    try {
      setSaving(true);
      setMessage("");
      setFieldErrors({});

      const res = await api.createBranch(form);

      setMessage(res.message || "Branch created successfully.");
      setForm(emptyForm);
      onDataChanged();
    } catch (error) {
      if (error.status === 422) {
        setFieldErrors(error.validationErrors || {});
        setMessage("Please check the highlighted fields.");
      } else {
        setMessage(error.message || "Cannot create branch.");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (branchId, status) => {
    try {
      await api.updateBranchStatus(branchId, { status });
      onDataChanged();
    } catch (error) {
      alert(error.message || "Cannot update branch status.");
    }
  };

  return (
    <>
      <div className="cx-admin-panel">
        <div className="cx-admin-table-wrap">
          <table className="cx-admin-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Branch Name</th>
                <th>City</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {branches.length ? (
                branches.map((item) => (
                  <tr key={item.branch_id}>
                    <td>{item.branch_code}</td>
                    <td>{item.branch_name}</td>
                    <td>{item.city}</td>
                    <td>{item.phone}</td>
                    <td>{item.email}</td>
                    <td>
                      <StatusPill value={item.status} />
                    </td>
                    <td>
                      <div className="flex gap-12">
                        <button
                          className="btn-outline"
                          onClick={() => handleStatusChange(item.branch_id, "ACTIVE")}
                        >
                          Set Active
                        </button>
                        <button
                          className="btn-outline"
                          onClick={() => handleStatusChange(item.branch_id, "INACTIVE")}
                        >
                          Set Inactive
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="cx-empty-row">
                    Loading branches...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="cx-admin-panel mt-24">
        <div className="cx-admin-panel-header">
          <h3>Add Branch</h3>
        </div>

        <div className="grid-2">
          <div style={{ position: "relative" }}>
            <label className="label">Branch Code</label>
            <input
              className={`input ${getFieldError("branch_code") ? "input-error" : ""}`}
              value={form.branch_code}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, branch_code: e.target.value }));
                clearFieldError("branch_code");
              }}
              placeholder="Branch code..."
              maxLength={20}
            />
            <span style={{ position: "absolute", right: "12px", top: "38px", fontSize: "10px", color: form.branch_code.length >= 20 ? "red" : "#999" }}>{form.branch_code.length}/20</span>
            {getFieldError("branch_code") ? (
              <div className="field-error">{getFieldError("branch_code")}</div>
            ) : null}
          </div>

          <div style={{ position: "relative" }}>
            <label className="label">Branch Name</label>
            <input
              className={`input ${getFieldError("branch_name") ? "input-error" : ""}`}
              value={form.branch_name}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, branch_name: e.target.value }));
                clearFieldError("branch_name");
              }}
              placeholder="Branch name..."
              maxLength={100}
            />
            <span style={{ position: "absolute", right: "12px", top: "38px", fontSize: "10px", color: form.branch_name.length >= 100 ? "red" : "#999" }}>{form.branch_name.length}/100</span>
            {getFieldError("branch_name") ? (
              <div className="field-error">{getFieldError("branch_name")}</div>
            ) : null}
          </div>

          <div style={{ position: "relative" }}>
            <label className="label">City</label>
            <input
              className={`input ${getFieldError("city") ? "input-error" : ""}`}
              value={form.city}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, city: e.target.value }));
                clearFieldError("city");
              }}
              placeholder="City..."
              maxLength={100}
            />
            <span style={{ position: "absolute", right: "12px", top: "38px", fontSize: "10px", color: form.city.length >= 100 ? "red" : "#999" }}>{form.city.length}/100</span>
            {getFieldError("city") ? (
              <div className="field-error">{getFieldError("city")}</div>
            ) : null}
          </div>

          <div style={{ position: "relative" }}>
            <label className="label">Phone</label>
            <input
              className={`input ${getFieldError("phone") ? "input-error" : ""}`}
              value={form.phone}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, phone: e.target.value }));
                clearFieldError("phone");
              }}
              placeholder="Phone..."
              maxLength={20}
            />
            <span style={{ position: "absolute", right: "12px", top: "38px", fontSize: "10px", color: form.phone.length >= 20 ? "red" : "#999" }}>{form.phone.length}/20</span>
            {getFieldError("phone") ? (
              <div className="field-error">{getFieldError("phone")}</div>
            ) : null}
          </div>

          <div style={{ position: "relative" }}>
            <label className="label">Email</label>
            <input
              className={`input ${getFieldError("email") ? "input-error" : ""}`}
              value={form.email}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, email: e.target.value }));
                clearFieldError("email");
              }}
              placeholder="Email..."
              maxLength={100}
            />
            <span style={{ position: "absolute", right: "12px", top: "38px", fontSize: "10px", color: form.email.length >= 100 ? "red" : "#999" }}>{form.email.length}/100</span>
            {getFieldError("email") ? (
              <div className="field-error">{getFieldError("email")}</div>
            ) : null}
          </div>

          <div>
            <label className="label">Status</label>
            <select
              className={`select ${getFieldError("status") ? "input-error" : ""}`}
              value={form.status}
              onChange={(e) => {
                setForm((prev) => ({ ...prev, status: e.target.value }));
                clearFieldError("status");
              }}
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
            {getFieldError("status") ? (
              <div className="field-error">{getFieldError("status")}</div>
            ) : null}
          </div>
        </div>

        {message ? (
          <div style={{ marginTop: 14, fontWeight: 600 }}>{message}</div>
        ) : null}

        <div className="flex gap-12 mt-24">
          <button
            className="btn"
            onClick={handleCreateBranch}
            disabled={saving}
          >
            {saving ? "Saving..." : "Create Branch"}
          </button>

          <button
            className="btn-outline"
            onClick={() => {
              setForm(emptyForm);
              setFieldErrors({});
              setMessage("");
            }}
          >
            Reset
          </button>
        </div>
      </div>
    </>
  );
}

function TypesView() {
  const [types, setTypes] = useState([]);

  useEffect(() => {
    api.getShipmentTypes().then(setTypes).catch(console.error);
  }, []);

  return (
    <div className="cx-admin-panel">
      <div className="cx-admin-table-wrap">
        <table className="cx-admin-table">
          <thead>
            <tr>
              <th>Type Name</th>
              <th>Description</th>
              <th>Base Rate</th>
            </tr>
          </thead>
          <tbody>
            {types.length ? (
              types.map((item) => (
                <tr key={item.shipment_type_id}>
                  <td>{item.type_name}</td>
                  <td>{item.description}</td>
                  <td>{formatCurrency(item.base_rate || 0)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3" className="cx-empty-row">
                  Loading shipment types...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BillsView() {
  const [bills, setBills] = useState([]);

  useEffect(() => {
    api.getBills().then(setBills).catch(console.error);
  }, []);

  return (
    <div className="cx-admin-panel">
      <div className="cx-admin-table-wrap">
        <table className="cx-admin-table">
          <thead>
            <tr>
              <th>Bill No</th>
              <th>Tracking No</th>
              <th>Total</th>
              <th>Payment Status</th>
              <th>Method</th>
              <th>Issued At</th>
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
                  <td>{item.issued_at || "-"}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="cx-empty-row">
                  Loading bills...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ReportsView() {
  return (
    <div className="cx-admin-report-grid">
      <div className="cx-admin-panel">
        <div className="cx-admin-panel-header">
          <h3>Date-wise Shipment Report</h3>
        </div>
        <div className="cx-admin-report-text">
          Use shipment filters and export features later from backend.
        </div>
      </div>

      <div className="cx-admin-panel">
        <div className="cx-admin-panel-header">
          <h3>City-wise Shipment Report</h3>
        </div>
        <div className="cx-admin-report-text">
          Branch and customer city information is already available from the API.
        </div>
      </div>

      <div className="cx-admin-panel">
        <div className="cx-admin-panel-header">
          <h3>Agent / Branch Performance</h3>
        </div>
        <div className="cx-admin-report-text">
          You can extend this page later with charts and export actions.
        </div>
      </div>
    </div>
  );
}

function AdminProfilePage({ authUser, onBack }) {
  return (
    <div className="cx-admin-panel">
      <div className="cx-admin-panel-header cx-admin-profile-header-row">
        <div>
          <h3>Administrator Profile</h3>
          <p className="cx-admin-profile-subtitle">
            Detailed account information
          </p>
        </div>

        <button className="btn-outline" onClick={onBack}>
          Back
        </button>
      </div>

      <div className="cx-admin-profile-hero">
        <div className="cx-admin-profile-avatar-large">
          {authUser?.full_name?.charAt(0)?.toUpperCase() || "A"}
        </div>

        <div>
          <div className="cx-admin-profile-name">
            {authUser?.full_name || "Admin"}
          </div>
          <div className="cx-admin-profile-role">
            {authUser?.role === "ADMIN"
              ? "Administrator"
              : authUser?.role || "-"}
          </div>
        </div>
      </div>

      <div className="cx-admin-profile-grid">
        <div className="cx-admin-profile-item">
          <span>Full Name</span>
          <strong>{authUser?.full_name || "-"}</strong>
        </div>

        <div className="cx-admin-profile-item">
          <span>Username</span>
          <strong>{authUser?.username || "-"}</strong>
        </div>

        <div className="cx-admin-profile-item">
          <span>Email</span>
          <strong>{authUser?.email || "-"}</strong>
        </div>

        <div className="cx-admin-profile-item">
          <span>Phone</span>
          <strong>{authUser?.phone || "-"}</strong>
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
          <span>Branch ID</span>
          <strong>{authUser?.branch_id ?? "-"}</strong>
        </div>

        <div className="cx-admin-profile-item">
          <span>Status</span>
          <strong>Active</strong>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard({ onLogout }) {
  const authUser = JSON.parse(localStorage.getItem("cx_auth_user") || "null");
  const [shipments, setShipments] = useState([]);
  const [bills, setBills] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [refreshKey, setRefreshKey] = useState(0);

  const loadDashboardData = () => {
    api.getShipments().then(setShipments).catch(console.error);
    api.getBills().then(setBills).catch(console.error);
  };

  useEffect(() => {
    loadDashboardData();
  }, [refreshKey]);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="cx-admin-layout">
      <AdminMenu
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={onLogout}
      />

      <main className="cx-admin-main">
        <HeaderBar
          authUser={authUser}
          onOpenProfile={() => setActiveTab("admin-profile")}
        />

        {activeTab === "dashboard" && (
          <DashboardView
            shipments={shipments}
            bills={bills}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === "admin-profile" && (
          <AdminProfilePage
            authUser={authUser}
            onBack={() => setActiveTab("dashboard")}
          />
        )}

        {activeTab === "shipments" && (
          <ShipmentsView
            refreshKey={refreshKey}
            authUser={authUser}
            onDataChanged={handleRefresh}
          />
        )}

        {activeTab === "customers" && (
          <CustomersView
            refreshKey={refreshKey}
            onDataChanged={handleRefresh}
          />
        )}

        {activeTab === "branches" && (
          <BranchesView
            refreshKey={refreshKey}
            onDataChanged={handleRefresh}
          />
        )}

        {activeTab === "types" && <TypesView />}
        {activeTab === "bills" && <BillsView />}
        {activeTab === "reports" && <ReportsView />}
      </main>
    </div>
  );
}