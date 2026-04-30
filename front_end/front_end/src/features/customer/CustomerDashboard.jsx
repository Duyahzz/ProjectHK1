import React, { useEffect, useState } from "react";
import { Package, ShieldCheck } from "lucide-react";
import SectionTitle from "../../components/common/SectionTitle";
import StatusBadge from "../../components/common/StatusBadge";
import StatCard from "../../components/common/StatCard";
import TableCard from "../../components/common/TableCard";
import { api } from "../../services/api";
import { formatCurrency } from "../../utils/helpers";

function Tabs({ activeTab, setActiveTab }) {
  const tabs = ["track", "history", "profile"];
  return <div className="tabs">{tabs.map((tab) => <button key={tab} className={`tab-btn ${activeTab === tab ? "active" : ""}`} onClick={() => setActiveTab(tab)}>{tab}</button>)}</div>;
}

function TrackTab({ trackingNumber, setTrackingNumber, trackingDetails, setTrackingDetails }) {
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
    <div className="grid-2 mt-20">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Track by Tracking Number</h3>
          <p className="card-subtitle">Enter a valid tracking number to see shipment details and timeline.</p>
        </div>
        <div className="card-body">
          <div className="toolbar">
            <input className="input" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} />
            <button className="btn" onClick={handleTrack}>{loading ? "Tracking..." : "Track"}</button>
          </div>

          {trackingDetails ? (
            <div className="summary-box mt-20">
              <div className="summary-row"><span>Tracking No</span><strong>{trackingDetails.tracking_number}</strong></div>
              <div className="summary-row"><span>Status</span><StatusBadge value={trackingDetails.current_status} /></div>
              <div className="summary-row"><span>Sender</span><span>{trackingDetails.sender?.full_name}</span></div>
              <div className="summary-row"><span>Receiver</span><span>{trackingDetails.receiver?.full_name}</span></div>
              <div className="summary-row"><span>Type</span><span>{trackingDetails.shipment_type?.type_name || trackingDetails.shipmentType?.type_name}</span></div>
              <div className="summary-row"><span>Expected Delivery</span><span>{trackingDetails.expected_delivery_date}</span></div>
            </div>
          ) : <div className="text-muted mt-20">No shipment loaded yet.</div>}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Shipment Timeline</h3>
          <p className="card-subtitle">Status records from shipment_status_history.</p>
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
            )) : <div className="text-muted">No timeline available.</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

function HistoryTab({ shipments }) {
  return (
    <div className="mt-20">
      <TableCard headers={["Tracking", "Booking Date", "Status", "Expected Delivery", "Charge"]}>
        {shipments.length ? shipments.map((item) => (
          <tr key={item.shipment_id}>
            <td>{item.tracking_number}</td>
            <td>{item.booking_date}</td>
            <td><StatusBadge value={item.current_status} /></td>
            <td>{item.expected_delivery_date}</td>
            <td>{formatCurrency(item.total_charge)}</td>
          </tr>
        )) : <tr><td colSpan="5">No shipment history.</td></tr>}
      </TableCard>
    </div>
  );
}

function ProfileTab({ trackingDetails, historyCount }) {
  const customer = trackingDetails?.sender || trackingDetails?.receiver;
  return (
    <div className="grid-2 mt-20">
      <div className="card">
        <div className="card-header"><h3 className="card-title">Profile Information</h3></div>
        <div className="card-body">
          <div className="form-grid">
            <input className="input" value={customer?.full_name || "Le Minh"} readOnly />
            <input className="input" value={customer?.phone || "0911000004"} readOnly />
            <input className="input" value={customer?.email || "minh@gmail.com"} readOnly />
            <textarea className="textarea" value={customer?.address_line || "12 Le Loi Street, Ho Chi Minh City"} readOnly />
          </div>
        </div>
      </div>

      <div className="grid-2">
        <StatCard title="Tracked Shipments" value={historyCount} icon={Package} />
        <StatCard title="Delivered" value={trackingDetails?.current_status === "DELIVERED" ? 1 : 0} icon={ShieldCheck} />
      </div>
    </div>
  );
}

export default function CustomerDashboard() {
  const [activeTab, setActiveTab] = useState("track");
  const [trackingNumber, setTrackingNumber] = useState("TRK003");
  const [trackingDetails, setTrackingDetails] = useState(null);
  const [historyShipments, setHistoryShipments] = useState([]);

  useEffect(() => {
    api.getShipments().then((items) => {
      const filtered = items.filter((item) => item.sender_customer_id === 1 || item.receiver_customer_id === 1);
      setHistoryShipments(filtered);
    }).catch(console.error);
  }, []);

  return (
    <div className="page-wrap">
      <SectionTitle title="Customer Dashboard" description="Track shipments, view profile, and check shipment history." />
      <div className="mt-24"><Tabs activeTab={activeTab} setActiveTab={setActiveTab} /></div>
      {activeTab === "track" && <TrackTab trackingNumber={trackingNumber} setTrackingNumber={setTrackingNumber} trackingDetails={trackingDetails} setTrackingDetails={setTrackingDetails} />}
      {activeTab === "history" && <HistoryTab shipments={historyShipments} />}
      {activeTab === "profile" && <ProfileTab trackingDetails={trackingDetails} historyCount={historyShipments.length} />}
    </div>
  );
}
