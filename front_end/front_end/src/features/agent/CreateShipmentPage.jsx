import React, { useEffect, useState } from "react";
import { api } from "../../services/api";

export default function CreateShipmentPage({ onShipmentCreated }) {
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
    origin_branch_id: "",
    assigned_agent_id: "",
    weight: "",
    total_charge: "",
    parcel_name: "",
    item_description: "",
    expected_delivery_date: new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
    notes: "",
  });

  useEffect(() => {
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
      sender_name: "",
      sender_phone: "",
      sender_address: "",
      sender_city: "",
      receiver_name: "",
      receiver_phone: "",
      receiver_address: "",
      receiver_city: "",
      shipment_type_id: "",
      origin_branch_id: "",
      assigned_agent_id: "",
      weight: "",
      total_charge: "",
      parcel_name: "",
      item_description: "",
      expected_delivery_date: new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
      notes: "",
    });
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
    <div className="mt-20">
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Create Shipment Booking</h3>
          <div className="card-subtitle">
            Enter sender, receiver and parcel details manually.
          </div>
        </div>

        <div className="card-body">
          <form onSubmit={handleCreateShipment} className="form-grid">
            {/* Sender Section */}
            <div className="section-title" style={{ gridColumn: "1 / -1", fontWeight: "bold", borderBottom: "1px solid #eee", paddingBottom: "5px", marginBottom: "10px" }}>SENDER INFORMATION</div>
            <div className="grid-2">
              <div>
                <label className="label">Sender Name</label>
                <input className="input" type="text" value={formData.sender_name} onChange={(e) => handleChange("sender_name", e.target.value)} required placeholder="Full Name" />
              </div>
              <div>
                <label className="label">Sender Phone</label>
                <input className="input" type="text" value={formData.sender_phone} onChange={(e) => handleChange("sender_phone", e.target.value)} required placeholder="Phone Number" />
              </div>
            </div>
            <div className="grid-2">
              <div>
                <label className="label">Sender Address</label>
                <input className="input" type="text" value={formData.sender_address} onChange={(e) => handleChange("sender_address", e.target.value)} required placeholder="Address" />
              </div>
              <div>
                <label className="label">Sender City</label>
                <input className="input" type="text" value={formData.sender_city} onChange={(e) => handleChange("sender_city", e.target.value)} placeholder="City" />
              </div>
            </div>

            {/* Receiver Section */}
            <div className="section-title" style={{ gridColumn: "1 / -1", fontWeight: "bold", borderBottom: "1px solid #eee", paddingBottom: "5px", marginBottom: "10px", marginTop: "20px" }}>RECEIVER INFORMATION</div>
            <div className="grid-2">
              <div>
                <label className="label">Receiver Name</label>
                <input className="input" type="text" value={formData.receiver_name} onChange={(e) => handleChange("receiver_name", e.target.value)} required placeholder="Full Name" />
              </div>
              <div>
                <label className="label">Receiver Phone</label>
                <input className="input" type="text" value={formData.receiver_phone} onChange={(e) => handleChange("receiver_phone", e.target.value)} required placeholder="Phone Number" />
              </div>
            </div>
            <div className="grid-2">
              <div>
                <label className="label">Receiver Address</label>
                <input className="input" type="text" value={formData.receiver_address} onChange={(e) => handleChange("receiver_address", e.target.value)} required placeholder="Address" />
              </div>
              <div>
                <label className="label">Receiver City</label>
                <input className="input" type="text" value={formData.receiver_city} onChange={(e) => handleChange("receiver_city", e.target.value)} placeholder="City" />
              </div>
            </div>

            {/* Shipment Details Section */}
            <div className="section-title" style={{ gridColumn: "1 / -1", fontWeight: "bold", borderBottom: "1px solid #eee", paddingBottom: "5px", marginBottom: "10px", marginTop: "20px" }}>SHIPMENT DETAILS</div>
            <div className="grid-2">
              <div>
                <label className="label">Shipment Type</label>
                <select className="select" value={formData.shipment_type_id} onChange={(e) => handleChange("shipment_type_id", e.target.value)} required>
                  <option value="">Select shipment type</option>
                  {shipmentTypes.map((type) => (
                    <option key={type.shipment_type_id} value={type.shipment_type_id}>{type.type_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Origin Branch</label>
                <select className="select" value={formData.origin_branch_id} onChange={(e) => handleChange("origin_branch_id", e.target.value)} required>
                  <option value="">Select branch</option>
                  {branches.map((branch) => (
                    <option key={branch.branch_id} value={branch.branch_id}>{branch.branch_name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid-3">
              <div>
                <label className="label">Parcel Name</label>
                <input className="input" type="text" value={formData.parcel_name} onChange={(e) => handleChange("parcel_name", e.target.value)} placeholder="e.g. Clothes, Shoes" />
              </div>
              <div>
                <label className="label">Weight (kg)</label>
                <input className="input" type="number" step="0.01" value={formData.weight} onChange={(e) => handleChange("weight", e.target.value)} required />
              </div>
              <div>
                <label className="label">Total Charge ($)</label>
                <input className="input" type="number" step="0.01" value={formData.total_charge} onChange={(e) => handleChange("total_charge", e.target.value)} required />
              </div>
            </div>

            <div className="grid-2">
              <div>
                <label className="label">Expected Delivery Date & Time</label>
                <input className="input" type="datetime-local" min={new Date().toISOString().slice(0, 16)} value={formData.expected_delivery_date} onChange={(e) => handleChange("expected_delivery_date", e.target.value)} required />
              </div>
              <div>
                <label className="label">Assigned Agent ID</label>
                <input className="input" type="number" value={formData.assigned_agent_id} onChange={(e) => handleChange("assigned_agent_id", e.target.value)} placeholder="Example: 2" />
              </div>
            </div>

            <div>
              <label className="label">Item Description</label>
              <textarea className="textarea" value={formData.item_description} onChange={(e) => handleChange("item_description", e.target.value)} placeholder="Detailed description of items" />
            </div>

            <div>
              <label className="label">Notes</label>
              <textarea className="textarea" value={formData.notes} onChange={(e) => handleChange("notes", e.target.value)} placeholder="Enter shipment notes" />
            </div>

            {createMessage ? <div style={{ color: "green", fontWeight: "bold" }}>{createMessage}</div> : null}
            {createError ? <div style={{ color: "red", fontWeight: "bold" }}>{createError}</div> : null}
            <div className="flex gap-12">
              <button type="submit" className="btn" disabled={submitting}>
                {submitting ? "Creating..." : "Create Shipment"}
              </button>
              <button type="button" className="btn-outline" onClick={resetForm}>Reset</button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}