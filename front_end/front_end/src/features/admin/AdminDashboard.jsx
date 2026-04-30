import React, { useEffect, useMemo, useState } from "react";
import { CircleDollarSign, Package, ShieldCheck, Truck } from "lucide-react";
import SectionTitle from "../../components/common/SectionTitle";
import StatCard from "../../components/common/StatCard";
import TableCard from "../../components/common/TableCard";
import StatusBadge from "../../components/common/StatusBadge";
import { api } from "../../services/api";
import { formatCurrency } from "../../utils/helpers";

function Tabs({ activeTab, setActiveTab }) {
  const tabs = ["shipments", "create-shipment", "customers", "branches", "types", "bills", "reports"];

  return (
    <div className="tabs">
      {tabs.map((tab) => (
        <button
          key={tab}
          className={`tab-btn ${activeTab === tab ? "active" : ""}`}
          onClick={() => setActiveTab(tab)}
        >
          {tab === "types" ? "shipment types" : tab}
        </button>
      ))}
    </div>
  );
}

function ShipmentsTab({ refreshKey }) {
  const [shipmentFilter, setShipmentFilter] = useState("ALL");
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .getShipments({ status: shipmentFilter })
      .then(setShipments)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [shipmentFilter, refreshKey]);

  return (
    <div className="mt-20">
      <div className="toolbar">
        <select
          className="select"
          style={{ maxWidth: 240 }}
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

      <TableCard headers={["Tracking No", "Sender", "Receiver", "Type", "Branch", "Agent", "Status", "Total Charge"]}>
        {loading ? (
          <tr>
            <td colSpan="8">Loading shipments...</td>
          </tr>
        ) : shipments.length ? (
          shipments.map((item) => (
            <tr key={item.shipment_id}>
              <td>{item.tracking_number}</td>
              <td>{item.sender?.full_name}</td>
              <td>{item.receiver?.full_name}</td>
              <td>{item.shipment_type?.type_name || item.shipmentType?.type_name}</td>
              <td>{item.branch?.branch_name}</td>
              <td>{item.agent?.full_name || "-"}</td>
              <td>
                <StatusBadge value={item.current_status} />
              </td>
              <td>{formatCurrency(item.total_charge)}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="8">No shipments found.</td>
          </tr>
        )}
      </TableCard>
    </div>
  );
}

function CreateShipmentTab({ onShipmentCreated }) {
  const [customers, setCustomers] = useState([]);
  const [branches, setBranches] = useState([]);
  const [shipmentTypes, setShipmentTypes] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [createMessage, setCreateMessage] = useState("");
  const [createError, setCreateError] = useState("");

  const [formData, setFormData] = useState({
    sender_customer_id: "",
    receiver_customer_id: "",
    shipment_type_id: "",
    origin_branch_id: "",
    assigned_agent_id: "",
    weight: "",
    total_charge: "",
    expected_delivery_date: "",
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
  };

  const resetForm = () => {
    setFormData({
      sender_customer_id: "",
      receiver_customer_id: "",
      shipment_type_id: "",
      origin_branch_id: "",
      assigned_agent_id: "",
      weight: "",
      total_charge: "",
      expected_delivery_date: "",
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
        sender_customer_id: Number(formData.sender_customer_id),
        receiver_customer_id: Number(formData.receiver_customer_id),
        shipment_type_id: Number(formData.shipment_type_id),
        origin_branch_id: Number(formData.origin_branch_id),
        assigned_agent_id: formData.assigned_agent_id
          ? Number(formData.assigned_agent_id)
          : null,
        weight: Number(formData.weight),
        total_charge: Number(formData.total_charge),
        expected_delivery_date: formData.expected_delivery_date,
        notes: formData.notes,
      };

      await api.createShipment(payload);

      setCreateMessage("Create shipment successfully.");
      resetForm();

      if (onShipmentCreated) {
        onShipmentCreated();
      }
    } catch (error) {
      console.error(error);
      setCreateError("Create shipment failed. Please check your input and backend.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-20">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Create Shipment Booking</h3>
          <div className="card-subtitle">
            Create a new shipment and save it to the real database.
          </div>
        </div>

        <div className="card-body">
          <form onSubmit={handleCreateShipment} className="form-grid">
            <div className="grid-2">
              <div>
                <label className="label">Sender</label>
                <select
                  className="select"
                  value={formData.sender_customer_id}
                  onChange={(e) => handleChange("sender_customer_id", e.target.value)}
                  required
                >
                  <option value="">Select sender</option>
                  {customers.map((customer) => (
                    <option key={customer.customer_id} value={customer.customer_id}>
                      {customer.full_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Receiver</label>
                <select
                  className="select"
                  value={formData.receiver_customer_id}
                  onChange={(e) => handleChange("receiver_customer_id", e.target.value)}
                  required
                >
                  <option value="">Select receiver</option>
                  {customers.map((customer) => (
                    <option key={customer.customer_id} value={customer.customer_id}>
                      {customer.full_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

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
                  value={formData.total_charge}
                  onChange={(e) => handleChange("total_charge", e.target.value)}
                  placeholder="Example: 50000"
                  required
                />
              </div>
            </div>

            <div>
              <label className="label">Expected Delivery Date</label>
              <input
                className="input"
                type="date"
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

              <button
                type="button"
                className="btn-outline"
                onClick={resetForm}
                disabled={submitting}
              >
                Reset
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function CustomersTab() {
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
    <div className="mt-20">
      <div className="toolbar">
        <input
          className="input"
          style={{ maxWidth: 340 }}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, phone, city, code"
        />
      </div>

      <TableCard headers={["Code", "Name", "Phone", "Email", "City", "Country"]}>
        {loading ? (
          <tr>
            <td colSpan="6">Loading customers...</td>
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
            <td colSpan="6">No customers found.</td>
          </tr>
        )}
      </TableCard>
    </div>
  );
}

function BranchesTab() {
  const [branches, setBranches] = useState([]);

  useEffect(() => {
    api.getBranches().then(setBranches).catch(console.error);
  }, []);

  return (
    <div className="mt-20">
      <TableCard headers={["Code", "Branch Name", "City", "Phone", "Email", "Status"]}>
        {branches.length ? (
          branches.map((item) => (
            <tr key={item.branch_id}>
              <td>{item.branch_code}</td>
              <td>{item.branch_name}</td>
              <td>{item.city}</td>
              <td>{item.phone}</td>
              <td>{item.email}</td>
              <td>
                <StatusBadge value={item.status} />
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="6">Loading branches...</td>
          </tr>
        )}
      </TableCard>
    </div>
  );
}

function TypesTab() {
  const [types, setTypes] = useState([]);

  useEffect(() => {
    api.getShipmentTypes().then(setTypes).catch(console.error);
  }, []);

  return (
    <div className="mt-20">
      <TableCard headers={["Type Name", "Description", "Base Rate"]}>
        {types.length ? (
          types.map((item) => (
            <tr key={item.shipment_type_id}>
              <td>{item.type_name}</td>
              <td>{item.description}</td>
              <td>{formatCurrency(item.base_rate)}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="3">Loading shipment types...</td>
          </tr>
        )}
      </TableCard>
    </div>
  );
}

function BillsTab() {
  const [bills, setBills] = useState([]);

  useEffect(() => {
    api.getBills().then(setBills).catch(console.error);
  }, []);

  return (
    <div className="mt-20">
      <TableCard headers={["Bill No", "Tracking No", "Total", "Payment Status", "Method", "Issued At"]}>
        {bills.length ? (
          bills.map((item) => (
            <tr key={item.bill_id}>
              <td>{item.bill_number}</td>
              <td>{item.shipment?.tracking_number}</td>
              <td>{formatCurrency(item.total_amount)}</td>
              <td>
                <StatusBadge value={item.payment_status} />
              </td>
              <td>{item.payment_method}</td>
              <td>{item.issued_at}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="6">Loading bills...</td>
          </tr>
        )}
      </TableCard>
    </div>
  );
}

function ReportsTab() {
  return (
    <div className="grid-3 mt-20">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Date-wise Shipment Report</h3>
        </div>
        <div className="card-body">
          Use the shipment tab with status filters and export from backend later.
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">City-wise Shipment Report</h3>
        </div>
        <div className="card-body">
          Branch and customer city data is already loaded from API.
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Agent / Branch Performance</h3>
        </div>
        <div className="card-body">
          You can extend this after adding a dedicated reporting endpoint.
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [shipments, setShipments] = useState([]);
  const [bills, setBills] = useState([]);
  const [activeTab, setActiveTab] = useState("shipments");
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

  const handleShipmentCreated = () => {
    setRefreshKey((prev) => prev + 1);
    setActiveTab("shipments");
  };

  return (
    <div className="page-wrap">
      <SectionTitle
        title="Admin Dashboard"
        description="Overview of shipment operations, billing, and master data from Laravel API."
      />

      <div className="grid-4">
        <StatCard
          title="Total Shipments"
          value={shipments.length}
          icon={Package}
          subtitle="All shipment records"
        />
        <StatCard
          title="In Transit"
          value={transitCount}
          icon={Truck}
          subtitle="Currently on the way"
        />
        <StatCard
          title="Delivered"
          value={deliveredCount}
          icon={ShieldCheck}
          subtitle="Completed shipments"
        />
        <StatCard
          title="Revenue"
          value={formatCurrency(revenue)}
          icon={CircleDollarSign}
          subtitle="Total billed amount"
        />
      </div>

      <div className="mt-24">
        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {activeTab === "shipments" && <ShipmentsTab refreshKey={refreshKey} />}
      {activeTab === "create-shipment" && (
        <CreateShipmentTab onShipmentCreated={handleShipmentCreated} />
      )}
      {activeTab === "customers" && <CustomersTab />}
      {activeTab === "branches" && <BranchesTab />}
      {activeTab === "types" && <TypesTab />}
      {activeTab === "bills" && <BillsTab />}
      {activeTab === "reports" && <ReportsTab />}
    </div>
  );
}