import React, { useState, useEffect } from "react";
import "../VendorComponent/CustomerProfile.css";
const CUSTOMER_API_BASE_URL = "http://195.35.45.56:5522/api/V2.0";

const initialState = {
  name: "",
  purchaseOrder: "",
  telNo: "",
  faxNo: "",
  poNo: "",
  poDate: "",
  type: "",
  ldApplicable: "no",
};

const CustomerProfile = () => {
  const [customer, setCustomer] = useState(initialState);
  const [isEditing, setIsEditing] = useState(true);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ show: false, message: "" });

  // On mount, fetch last saved customer if present
  useEffect(() => {
    const lastCustomerId = localStorage.getItem("lastCustomerId");
    if (lastCustomerId) {
      loadCustomerData(lastCustomerId);
    }
  }, []);

  const loadCustomerData = async (id) => {
    try {
      setLoading(true);
      const response = await fetch(`${CUSTOMER_API_BASE_URL}/getcustomer/details?id=${id}`);
      if (response.ok) {
        const data = await response.json();
        setCustomer(data);
        setIsEditing(false);
      } else {
        showToast("Failed to load customer data");
      }
    } catch (error) {
      console.error("Error loading customer data:", error);
      showToast("Error loading customer data");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setCustomer((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Checkbox handler: convert boolean to "yes"/"no"
  const handleCheckboxChange = (e) => {
    setCustomer((prev) => ({
      ...prev,
      ldApplicable: e.target.checked ? "yes" : "no",
    }));
  };

  const handleSave = async () => {
    if (!customer.name.trim()) {
      showToast("Name is required");
      return;
    }
    setLoading(true);
    try {
      const response = await fetch(`${CUSTOMER_API_BASE_URL}/savecustomer/details`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(customer),
      });
      if (response.ok) {
        const data = await response.json();
        setCustomer(data);
        localStorage.setItem("lastCustomerId", data.id); // Persist ID
        showToast("Customer saved successfully!");
        setIsEditing(false);
      } else {
        showToast("Failed to save customer");
      }
    } catch {
      showToast("Network error");
    } finally {
      setLoading(false);
    }
  };

  const showToast = (message) => {
    setToast({ show: true, message });
    setTimeout(() => setToast({ show: false, message: "" }), 2500);
  };

  const handleEdit = () => setIsEditing(true);

  const handleClear = () => setCustomer(initialState);

  return (
    <div className="cus-main-wrapper">
      <div className="cus-header-section">
        <h2 className="cus-app-title">Customer Entry</h2>
        <p className="cus-app-subtitle">Billing Software - Customer Management</p>
      </div>
      <div className="cus-card">
        <div className="cus-content-area">
          {isEditing ? (
            <div className="cus-form-container">
              <div className="cus-section-header">
                <h3>Customer Information</h3>
              </div>
              <div className="cus-form-layout">
                <div className="cus-form-row">
                  <div className="cus-floating-input-group">
                    <input
                      type="text"
                      id="name"
                      value={customer.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      className="cus-floating-input"
                      disabled={loading}
                    />
                    <label htmlFor="name" className="cus-floating-label">Name *</label>
                  </div>
                  <div className="cus-floating-input-group">
                    <input
                      type="text"
                      id="telNo"
                      value={customer.telNo}
                      onChange={(e) => handleChange("telNo", e.target.value)}
                      className="cus-floating-input"
                      disabled={loading}
                    />
                    <label htmlFor="telNo" className="cus-floating-label">Tel No</label>
                  </div>
                </div>
                <div className="cus-form-row">
                  <div className="cus-floating-input-group">
                    <input
                      type="text"
                      id="faxNo"
                      value={customer.faxNo}
                      onChange={(e) => handleChange("faxNo", e.target.value)}
                      className="cus-floating-input"
                      disabled={loading}
                    />
                    <label htmlFor="faxNo" className="cus-floating-label">Fax No</label>
                  </div>
                  <div className="cus-floating-input-group">
                    <input
                      type="text"
                      id="poNo"
                      value={customer.poNo}
                      onChange={(e) => handleChange("poNo", e.target.value)}
                      className="cus-floating-input"
                      disabled={loading}
                    />
                    <label htmlFor="poNo" className="cus-floating-label">P.O No</label>
                  </div>
                </div>
                <div className="cus-form-row">
                  <div className="cus-floating-input-group">
                    <input
                      type="date"
                      id="poDate"
                      value={customer.poDate}
                      onChange={(e) => handleChange("poDate", e.target.value)}
                      className="cus-floating-input"
                      disabled={loading}
                    />
                    <label htmlFor="poDate" className="cus-floating-label">P.O Date</label>
                  </div>
                  <div className="cus-floating-input-group">
                    <input
                      type="text"
                      id="type"
                      value={customer.type}
                      onChange={(e) => handleChange("type", e.target.value)}
                      className="cus-floating-input"
                      disabled={loading}
                    />
                    <label htmlFor="type" className="cus-floating-label">Type</label>
                  </div>
                </div>
                <div className="cus-form-row">
                  <div className="cus-floating-input-group cus-full-width">
                    <textarea
                      id="purchaseOrder"
                      value={customer.purchaseOrder}
                      onChange={(e) => handleChange("purchaseOrder", e.target.value)}
                      className="cus-floating-input"
                      rows={3}
                      disabled={loading}
                    />
                    <label htmlFor="purchaseOrder" className="cus-floating-label">Purchase Order</label>
                  </div>
                </div>
                <div className="cus-form-row">
                  <div className="cus-checkbox-group">
                    <input
                      type="checkbox"
                      id="ldApplicable"
                      checked={customer.ldApplicable === "yes"}
                      onChange={handleCheckboxChange}
                      disabled={loading}
                    />
                    <label htmlFor="ldApplicable" className="cus-checkbox-label">LD Applicable</label>
                  </div>
                </div>
              </div>
              <div className="cus-button-group">
                <button className="cus-save-btn" onClick={handleSave} disabled={loading}>
                  {loading ? "Saving..." : "Save Customer Details"}
                </button>
                <button className="cus-clear-btn" onClick={handleClear} disabled={loading}>
                  Clear
                </button>
              </div>
            </div>
          ) : (
            <div className="cus-details-container">
              <div className="cus-section-header">
                <h3>Customer Details</h3>
                <button className="cus-edit-btn" onClick={handleEdit}>Edit</button>
              </div>
              <div className="cus-details-layout">
                <div className="cus-detail-card"><span>Name</span><span>{customer.name}</span></div>
                <div className="cus-detail-card"><span>Tel No</span><span>{customer.telNo}</span></div>
                <div className="cus-detail-card"><span>Fax No</span><span>{customer.faxNo}</span></div>
                <div className="cus-detail-card"><span>P.O No</span><span>{customer.poNo}</span></div>
                <div className="cus-detail-card"><span>P.O Date</span><span>{customer.poDate}</span></div>
                <div className="cus-detail-card"><span>Type</span><span>{customer.type}</span></div>
                <div className="cus-detail-card cus-full-width"><span>Purchase Order</span><span>{customer.purchaseOrder}</span></div>
                <div className="cus-detail-card"><span>LD Applicable</span><span>{customer.ldApplicable === "yes" ? "Yes" : "No"}</span></div>
              </div>
            </div>
          )}
        </div>
      </div>
      {toast.show && <div className="cus-toast-notification">{toast.message}</div>}
    </div>
  );
};

export default CustomerProfile;
