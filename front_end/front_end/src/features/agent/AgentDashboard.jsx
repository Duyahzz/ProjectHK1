import React, { useEffect, useMemo, useState } from "react";
import { ClipboardList, Receipt, ShieldCheck, Truck } from "lucide-react";
import SectionTitle from "../../components/common/SectionTitle";
import StatCard from "../../components/common/StatCard";
import TableCard from "../../components/common/TableCard";
import StatusBadge from "../../components/common/StatusBadge";
import { api } from "../../services/api";
import { formatCurrency } from "../../utils/helpers";

function Tabs({ activeTab, setActiveTab }) {
  const tabs = ["bookings", "status", "bills", "dashboard"];
  return <div className="tabs">{tabs.map((tab) => <button key={tab} className={`tab-btn ${activeTab === tab ? "active" : ""}`} onClick={() => setActiveTab(tab)}>{tab === "bookings" ? "shipment management" : tab}</button>)}</div>;
}

function BookingsTab({ shipments }) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return shipments.filter((item) =>
      item.tracking_number?.toLowerCase().includes(q) ||
      item.sender?.full_name?.toLowerCase().includes(q) ||
      item.receiver?.full_name?.toLowerCase().includes(q)
    );
  }, [query, shipments]);

  return (
    <div className="mt-20">
      <div className="toolbar">
        <input className="input" style={{ maxWidth: 360 }} value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by tracking number or customer" />
      </div>
      <TableCard headers={["Tracking", "Sender", "Receiver", "Status", "Expected", "Charge"]}>
        {filtered.length ? filtered.map((item) => (
          <tr key={item.shipment_id}>
            <td>{item.tracking_number}</td>
            <td>{item.sender?.full_name}</td>
            <td>{item.receiver?.full_name}</td>
            <td><StatusBadge value={item.current_status} /></td>
            <td>{item.expected_delivery_date}</td>
            <td>{formatCurrency(item.total_charge)}</td>
          </tr>
        )) : <tr><td colSpan="6">No shipments found.</td></tr>}
      </TableCard>
    </div>
  );
}

function StatusTab() {
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
        updated_by_user_id: 1,
      });
      setDetails((prev) => ({
        ...prev,
        current_status: result.shipment.current_status,
        status_history: [...(prev.status_history || prev.statusHistory || []), result.history],
      }));
      setNote("");
      alert("Status updated successfully");
    } catch (error) {
      alert("Cannot update shipment status");
    }
  };

  const timeline = details?.status_history || details?.statusHistory || [];

  return (
    <div className="grid-2 mt-20">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Update Shipment Status</h3>
          <p className="card-subtitle">Search by tracking number and save a new shipment stage.</p>
        </div>
        <div className="card-body">
          <div className="form-grid">
            <div className="toolbar">
              <input className="input" placeholder="Enter tracking number" value={tracking} onChange={(e) => setTracking(e.target.value)} />
              <button className="btn" onClick={search}>{loading ? "Searching..." : "Search"}</button>
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
              <input className="input" placeholder="Remark" value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
            <button className="btn" style={{ width: "fit-content" }} onClick={save} disabled={!details}>Save Update</button>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Status Timeline</h3>
          <p className="card-subtitle">History stored in shipment_status_history.</p>
        </div>
        <div className="card-body">
          <div className="timeline">
            {timeline.length ? timeline.map((item, index) => (
              <div className="timeline-item" key={item.history_id || index}>
                <div className="flex" style={{ justifyContent: "space-between", alignItems: "center" }}>
                  <StatusBadge value={item.status} />
                  <span className="text-muted">{item.event_time}</span>
                </div>
                <div className="mt-16">{item.status_note}</div>
              </div>
            )) : <div className="text-muted">No tracking timeline yet. Search a tracking number first.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

function BillsTab({ bills }) {
  const firstBill = bills[0];
  return (
    <div className="grid-2 mt-20">
      <TableCard headers={["Bill No", "Tracking", "Total", "Status", "Method"]}>
        {bills.length ? bills.map((item) => (
          <tr key={item.bill_id}>
            <td>{item.bill_number}</td>
            <td>{item.shipment?.tracking_number}</td>
            <td>{formatCurrency(item.total_amount)}</td>
            <td><StatusBadge value={item.payment_status} /></td>
            <td>{item.payment_method}</td>
          </tr>
        )) : <tr><td colSpan="5">Loading bills...</td></tr>}
      </TableCard>

      <div className="card">
        <div className="card-header"><h3 className="card-title">Bill Details</h3></div>
        <div className="card-body">
          {firstBill ? (
            <>
              <div className="summary-row"><span>Bill Number</span><span>{firstBill.bill_number}</span></div>
              <div className="summary-row"><span>Tracking Number</span><span>{firstBill.shipment?.tracking_number}</span></div>
              <div className="summary-row"><span>Total</span><strong>{formatCurrency(firstBill.total_amount)}</strong></div>
              <div className="summary-row"><span>Status</span><StatusBadge value={firstBill.payment_status} /></div>
              <div className="separator" />
              <div className="flex gap-12">
                <button className="btn">Print Bill</button>
                <button className="btn-outline">Mark Paid</button>
              </div>
            </>
          ) : <div className="text-muted">No bill loaded.</div>}
        </div>
      </div>
    </div>
  );
}

function DashboardTab({ shipments, bills }) {
  const todayCount = shipments.length;
  const pendingCount = shipments.filter((item) => item.current_status !== "DELIVERED" && item.current_status !== "CANCELLED").length;
  const branchRevenue = bills.reduce((sum, item) => sum + Number(item.total_amount || 0), 0);
  return (
    <div className="grid-3 mt-20">
      <div className="card"><div className="card-header"><h3 className="card-title">All Shipments</h3></div><div className="card-body"><div className="stat-value">{todayCount}</div></div></div>
      <div className="card"><div className="card-header"><h3 className="card-title">Pending Deliveries</h3></div><div className="card-body"><div className="stat-value">{pendingCount}</div></div></div>
      <div className="card"><div className="card-header"><h3 className="card-title">Branch Revenue</h3></div><div className="card-body"><div className="stat-value">{formatCurrency(branchRevenue)}</div></div></div>
    </div>
  );
}

export default function AgentDashboard() {
  const [activeTab, setActiveTab] = useState("bookings");
  const [shipments, setShipments] = useState([]);
  const [bills, setBills] = useState([]);

  useEffect(() => {
    api.getShipments().then(setShipments).catch(console.error);
    api.getBills().then(setBills).catch(console.error);
  }, []);

  return (
    <div className="page-wrap">
      <SectionTitle title="Agent Dashboard" description="Branch-specific shipment booking, status update, billing, and search." />
      <div className="grid-4">
        <StatCard title="Booked" value={shipments.filter((item) => item.current_status === "BOOKED").length} icon={ClipboardList} />
        <StatCard title="In Transit" value={shipments.filter((item) => item.current_status === "IN_TRANSIT").length} icon={Truck} />
        <StatCard title="Delivered" value={shipments.filter((item) => item.current_status === "DELIVERED").length} icon={ShieldCheck} />
        <StatCard title="Pending Bills" value={bills.filter((item) => item.payment_status === "UNPAID").length} icon={Receipt} />
      </div>
      <div className="mt-24"><Tabs activeTab={activeTab} setActiveTab={setActiveTab} /></div>
      {activeTab === "bookings" && <BookingsTab shipments={shipments} />}
      {activeTab === "status" && <StatusTab />}
      {activeTab === "bills" && <BillsTab bills={bills} />}
      {activeTab === "dashboard" && <DashboardTab shipments={shipments} bills={bills} />}
    </div>
  );
}
