import React, { useState } from "react";
import SectionTitle from "../components/common/SectionTitle";
import StatusBadge from "../components/common/StatusBadge";
import { api } from "../services/api";

export default function PublicTrackingPage() {
  const [tracking, setTracking] = useState("TRK002");
  const [shipment, setShipment] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTrack = async () => {
    setLoading(true);
    try {
      const data = await api.trackShipment(tracking);
      setShipment(data);
    } catch (error) {
      alert("Tracking number not found");
      setShipment(null);
    } finally {
      setLoading(false);
    }
  };

  const timeline = shipment?.status_history || shipment?.statusHistory || [];

  return (
    <div className="page-wrap">
      <SectionTitle title="Public Tracking" description="Track shipments without entering the full dashboard." />
      <div className="card">
        <div className="card-body">
          <div className="toolbar">
            <input className="input" style={{ maxWidth: 420 }} value={tracking} onChange={(e) => setTracking(e.target.value)} placeholder="Enter tracking number" />
            <button className="btn" onClick={handleTrack}>{loading ? "Tracking..." : "Track"}</button>
          </div>

          {shipment ? (
            <div className="grid-2 mt-20">
              <div className="summary-box">
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Shipment Summary</div>
                <div className="summary-row"><span>Tracking Number</span><span>{shipment.tracking_number}</span></div>
                <div className="summary-row"><span>Status</span><StatusBadge value={shipment.current_status} /></div>
                <div className="summary-row"><span>Type</span><span>{shipment.shipment_type?.type_name || shipment.shipmentType?.type_name}</span></div>
                <div className="summary-row"><span>Branch</span><span>{shipment.branch?.branch_name}</span></div>
                <div className="summary-row"><span>Expected Delivery</span><span>{shipment.expected_delivery_date}</span></div>
              </div>

              <div className="summary-box">
                <div style={{ fontWeight: 700, marginBottom: 8 }}>Timeline</div>
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
          ) : <div className="text-muted mt-20">Enter a tracking number and click Track.</div>}
        </div>
      </div>
    </div>
  );
}
