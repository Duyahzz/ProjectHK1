import React, { useEffect, useMemo, useState } from "react";
import {
  Building2,
  CircleDollarSign,
  ClipboardList,
  FileText,
  LayoutDashboard,
  MapPinned,
  Package,
  Receipt,
  ShieldCheck,
  Truck,
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
            <div className="cx-admin-user-name">{authUser?.full_name || "Admin"}</div>
            <div className="cx-admin-user-role">
              {authUser?.role === "ADMIN" ? "Administrator" : authUser?.role || "-"}
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
  if (status === "DELIVERED" || status === "PAID" || status === "ACTIVE") className = "delivered";
  if (status === "CANCELLED" || status === "UNPAID" || status === "INACTIVE") className = "cancelled";

  return <span className={`cx-status-pill ${className}`}>{status || "-"}</span>;
}

function DashboardView({ shipments, bills, setActiveTab }) {
  const bookedCount = shipments.filter((item) => item.current_status === "BOOKED").length;
  const transitCount = shipments.filter((item) => item.current_status === "IN_TRANSIT").length;
  const deliveredCount = shipments.filter((item) => item.current_status === "DELIVERED").length;
  const cancelledCount = shipments.filter((item) => item.current_status === "CANCELLED").length;
  const revenue = bills.reduce((sum, item) => sum + Number(item.total_amount || 0), 0);

  return (
    <>
      <div className="cx-admin-stat-grid">
        <DashboardStat title="Total Shipments" value={shipments.length} />
        <DashboardStat title="Booked" value={bookedCount} tone="pending" />
        <DashboardStat title="In Transit" value={transitCount} tone="transit" />
        <DashboardStat title="Delivered" value={deliveredCount} tone="delivered" />
        <DashboardStat title="Cancelled" value={cancelledCount} tone="cancelled" />
      </div>

      <div className="cx-admin-grid-two">
        <div className="cx-admin-panel">
          <div className="cx-admin-panel-header">
            <h3>Business Summary</h3>
          </div>

          <div className="cx-admin-summary-list">
            <div className="cx-admin-summary-row">
              <span>Total Bills</span>
              <strong>{bills.length}</strong>
            </div>
            <div className="cx-admin-summary-row">
              <span>Total Revenue</span>
              <strong>{formatCurrency(revenue)}</strong>
            </div>
            <div className="cx-admin-summary-row">
              <span>Tracking Module</span>
              <button className="cx-inline-link" onClick={() => setActiveTab("shipments")}>
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
            <button className="cx-admin-shortcut" onClick={() => setActiveTab("shipments")}>
              <Package size={16} />
              <span>Shipment Overview</span>
            </button>
            <button className="cx-admin-shortcut" onClick={() => setActiveTab("customers")}>
              <Users size={16} />
              <span>Customer Records</span>
            </button>
            <button className="cx-admin-shortcut" onClick={() => setActiveTab("branches")}>
              <Building2 size={16} />
              <span>Branches</span>
            </button>
            <button className="cx-admin-shortcut" onClick={() => setActiveTab("bills")}>
              <Receipt size={16} />
              <span>Billing</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

function ShipmentsView({ refreshKey }) {
  const [shipmentFilter, setShipmentFilter] = useState("ALL");
  const [keyword, setKeyword] = useState("");
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .getShipments({ status: shipmentFilter === "ALL" ? "" : shipmentFilter })
      .then(setShipments)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [shipmentFilter, refreshKey]);

  const filteredShipments = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return shipments;

    return shipments.filter(
      (item) =>
        item.tracking_number?.toLowerCase().includes(q) ||
        item.sender?.full_name?.toLowerCase().includes(q) ||
        item.receiver?.full_name?.toLowerCase().includes(q)
    );
  }, [shipments, keyword]);

  return (
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
              <th>Agent</th>
              <th>Status</th>
              <th>Total Charge</th>
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
                  <td className="cx-highlight-cell">{item.tracking_number}</td>
                  <td>{item.sender?.full_name || "-"}</td>
                  <td>{item.receiver?.full_name || "-"}</td>
                  <td>{item.shipment_type?.type_name || item.shipmentType?.type_name || "-"}</td>
                  <td>{item.branch?.branch_name || "-"}</td>
                  <td>{item.agent?.full_name || "-"}</td>
                  <td>
                    <StatusPill value={item.current_status} />
                  </td>
                  <td>{formatCurrency(item.total_charge || 0)}</td>
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
  );
}

function CustomersView() {
  const [query, setQuery] = useState("");
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      api
        .getCustomers(query)
        .then(setCustomers)
        .catch(console.error)
        .finally(() => setLoading(false));
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  return (
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
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className="cx-empty-row">
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
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="cx-empty-row">
                  No customers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BranchesView() {
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    api.getBranches().then(setBranches).catch(console.error);
  }, []);

  return (
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
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="cx-empty-row">
                  Loading branches...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
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
          <p className="cx-admin-profile-subtitle">Detailed account information</p>
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
          <div className="cx-admin-profile-name">{authUser?.full_name || "Admin"}</div>
          <div className="cx-admin-profile-role">
            {authUser?.role === "ADMIN" ? "Administrator" : authUser?.role || "-"}
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

  const transitCount = useMemo(
    () => shipments.filter((item) => item.current_status === "IN_TRANSIT").length,
    [shipments]
  );

  const deliveredCount = useMemo(
    () => shipments.filter((item) => item.current_status === "DELIVERED").length,
    [shipments]
  );

  const revenue = useMemo(
    () => bills.reduce((sum, item) => sum + Number(item.total_amount || 0), 0),
    [bills]
  );

  return (
    <div className="cx-admin-layout">
      <AdminMenu activeTab={activeTab} setActiveTab={setActiveTab} onLogout={onLogout} />

      <main className="cx-admin-main">
        <HeaderBar
          authUser={authUser}
          onOpenProfile={() => setActiveTab("admin-profile")}
        />

        {activeTab === "dashboard" && (
          <DashboardView shipments={shipments} bills={bills} setActiveTab={setActiveTab} />
        )}

        {activeTab === "admin-profile" && (
          <AdminProfilePage authUser={authUser} onBack={() => setActiveTab("dashboard")} />
        )}

        {activeTab === "shipments" && <ShipmentsView refreshKey={refreshKey} />}
        {activeTab === "customers" && <CustomersView />}
        {activeTab === "branches" && <BranchesView />}
        {activeTab === "types" && <TypesView />}
        {activeTab === "bills" && <BillsView />}
        {activeTab === "reports" && <ReportsView />}
      </main>
    </div>
  );
}