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
      setCreateError("Create shipment failed.");
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

            {createMessage ? <div style={{ color: "green" }}>{createMessage}</div> : null}
            {createError ? <div style={{ color: "red" }}>{createError}</div> : null}

            <div className="flex gap-12">
              <button type="submit" className="btn" disabled={submitting}>
                {submitting ? "Creating..." : "Create Shipment"}
              </button>
              <button type="button" className="btn-outline" onClick={resetForm}>
                Reset
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}