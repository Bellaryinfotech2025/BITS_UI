import { useState, useEffect } from "react"
import axios from "axios"
import { MdSave, MdClose, MdEdit, MdDelete, MdAdd } from "react-icons/md"
import { AiOutlineLoading3Quarters } from "react-icons/ai"
import { FaCheck } from "react-icons/fa"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import "../POEntry Component/UpdatePoentryTable.css"

const API_BASE_URL = "http://195.35.45.56:5522/api/V2.0"

const UpdatePoentryTable = ({ order, onClose }) => {
  // Work Order state
  const [formData, setFormData] = useState({
    workOrder: "",
    plantLocation: "",
    department: "",
    workLocation: "",
    workOrderDate: "",
    completionDate: "",
    ldApplicable: false,
    scrapAllowanceVisiblePercent: "",
    scrapAllowanceInvisiblePercent: "",
    materialIssueType: "",
  })
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // Service Order state
  const [serviceOrders, setServiceOrders] = useState([])
  const [serviceLoading, setServiceLoading] = useState(false)
  const [editingServiceId, setEditingServiceId] = useState(null)
  const [editServiceData, setEditServiceData] = useState({})
  
  // New service row state
  const [newServiceRows, setNewServiceRows] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)

  useEffect(() => {
    if (order) {
      setFormData({
        workOrder: order.workOrder || "",
        plantLocation: order.plantLocation || "",
        department: order.department || "",
        workLocation: order.workLocation || "",
        workOrderDate: order.workOrderDate || "",
        completionDate: order.completionDate || "",
        ldApplicable: order.ldApplicable || false,
        scrapAllowanceVisiblePercent: order.scrapAllowanceVisiblePercent || "",
        scrapAllowanceInvisiblePercent: order.scrapAllowanceInvisiblePercent || "",
        materialIssueType: order.materialIssueType || "",
      })
      
      // ENHANCED: Load associated service orders using proper foreign key relationship
      loadServiceOrders();
    }
  }, [order])
  
  // ENHANCED: Load service orders using the new enhanced endpoint
  const loadServiceOrders = async () => {
    try {
      setServiceLoading(true);
      console.log("Loading service orders for orderId:", order.orderId);
      
      // Use the enhanced endpoint that uses proper foreign key relationship
      const response = await axios.get(`${API_BASE_URL}/getBitsLinesByOrderId/details?orderId=${order.orderId}`);
      
      console.log("Service orders response:", response.data);
      setServiceOrders(response.data || []);
    } catch (error) {
      console.error("Error loading service orders:", error);
      
      // Fallback to work order number method if orderId method fails
      try {
        console.log("Trying fallback method with work order number:", order.workOrder);
        const fallbackResponse = await axios.get(`${API_BASE_URL}/getBitsLinesByWorkOrder/details?workOrder=${encodeURIComponent(order.workOrder)}`);
        console.log("Fallback service orders response:", fallbackResponse.data);
        setServiceOrders(fallbackResponse.data || []);
      } catch (fallbackError) {
        console.error("Fallback method also failed:", fallbackError);
        toast.error("Failed to load service order details");
        setServiceOrders([]);
      }
    } finally {
      setServiceLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }
  
  const handleServiceInputChange = (e) => {
    const { name, value } = e.target
    let processedValue = value;
    
    // Handle numeric fields
    if (name === 'qty' || name === 'unitPrice' || name === 'totalPrice') {
      processedValue = value === '' ? '' : parseFloat(value);
      
      // Recalculate totalPrice if qty or unitPrice changes
      if (name === 'qty' || name === 'unitPrice') {
        const qty = name === 'qty' ? processedValue : editServiceData.qty;
        const unitPrice = name === 'unitPrice' ? processedValue : editServiceData.unitPrice;
        
        if (!isNaN(qty) && !isNaN(unitPrice)) {
          setEditServiceData(prev => ({
            ...prev,
            [name]: processedValue,
            totalPrice: (qty * unitPrice).toFixed(2)
          }));
          return;
        }
      }
    }
    
    setEditServiceData(prev => ({
      ...prev,
      [name]: processedValue
    }));
  };

  // ENHANCED: Handle new service row input changes
  const handleNewServiceInputChange = (rowId, e) => {
    const { name, value } = e.target;
    setNewServiceRows(prev => 
      prev.map(row => {
        if (row.id === rowId) {
          const updatedRow = { ...row, [name]: value };
          
          // Auto-calculate total price
          if (name === 'qty' || name === 'unitPrice') {
            const qty = parseFloat(name === 'qty' ? value : updatedRow.qty) || 0;
            const unitPrice = parseFloat(name === 'unitPrice' ? value : updatedRow.unitPrice) || 0;
            updatedRow.totalPrice = (qty * unitPrice).toFixed(2);
          }
          
          return updatedRow;
        }
        return row;
      })
    );
  };

  const showSuccessToast = (message) => {
    toast.success(
      <div className="piSuccessToastol">
        <FaCheck className="piToastIconol" />
        <span className="piToastTextol">{message}</span>
      </div>,
      {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        className: "piCustomToastol",
      },
    )
  }

  const handleUpdate = async () => {
    try {
      setLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Use orderId instead of id
      const response = await axios.put(`${API_BASE_URL}/updateBitsHeader/details?id=${order.orderId}`, formData, {
        headers: {
          "Content-Type": "application/json",
        },
      })

      showSuccessToast("Work Order updated successfully!")
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating work order:", error)
      toast.error("Failed to update work order")
    } finally {
      setLoading(false)
    }
  }
  
  const handleEditService = (service) => {
    setEditingServiceId(service.lineId);
    setEditServiceData({
      serNo: service.serNo || '',
      serviceCode: service.serviceCode || '',
      serviceDesc: service.serviceDesc || '',
      qty: service.qty || '',
      uom: service.uom || '',
      unitPrice: service.unitPrice || service.rate || '', // Handle both field names
      totalPrice: service.totalPrice || service.amount || '' // Handle both field names
    });
  };
  
  const handleUpdateService = async () => {
    try {
      setServiceLoading(true);
      
      const processedData = {
        ...editServiceData,
        qty: editServiceData.qty ? parseFloat(editServiceData.qty) : null,
        unitPrice: editServiceData.unitPrice ? parseFloat(editServiceData.unitPrice) : null,
        totalPrice: editServiceData.totalPrice ? parseFloat(editServiceData.totalPrice) : null,
      };
      
      await axios.put(`${API_BASE_URL}/updateBitsLine/details?id=${editingServiceId}`, processedData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      showSuccessToast("Service Order updated successfully!");
      
      // Refresh service orders
      loadServiceOrders();
      setEditingServiceId(null);
      setEditServiceData({});
    } catch (error) {
      console.error("Error updating service order:", error);
      toast.error("Failed to update service order");
    } finally {
      setServiceLoading(false);
    }
  };
  
  const handleCancelServiceEdit = () => {
    setEditingServiceId(null);
    setEditServiceData({});
  };
  
  const handleDeleteService = async (lineId) => {
    if (!window.confirm("Are you sure you want to delete this service order?")) {
      return;
    }
    
    try {
      setServiceLoading(true);
      
      await axios.delete(`${API_BASE_URL}/deleteBitsLine/details?id=${lineId}`);
      
      showSuccessToast("Service Order deleted successfully!");
      
      // Refresh service orders
      loadServiceOrders();
    } catch (error) {
      console.error("Error deleting service order:", error);
      toast.error("Failed to delete service order");
    } finally {
      setServiceLoading(false);
    }
  };

  // ENHANCED: Add new service functionality
  const handleAddNewService = () => {
    const newRow = {
      id: Date.now() + Math.random(),
      serNo: '',
      serviceCode: '',
      serviceDesc: '',
      qty: '',
      uom: '',
      unitPrice: '',
      totalPrice: ''
    };
    setNewServiceRows(prev => [...prev, newRow]);
    setShowAddForm(true);
  };

  const handleSaveNewServices = async () => {
    try {
      setServiceLoading(true);
      
      // Filter out empty rows
      const validRows = newServiceRows.filter(row => 
        row.serNo || row.serviceCode || row.serviceDesc || row.qty || row.unitPrice
      );
      
      if (validRows.length === 0) {
        toast.warning("Please fill in at least one service row");
        return;
      }
      
      // Prepare data for bulk creation
      const serviceData = validRows.map(row => ({
        serNo: row.serNo || '',
        serviceCode: row.serviceCode || '',
        serviceDesc: row.serviceDesc || '',
        qty: row.qty ? parseFloat(row.qty) : null,
        uom: row.uom || '',
        unitPrice: row.unitPrice ? parseFloat(row.unitPrice) : null,
        totalPrice: row.totalPrice ? parseFloat(row.totalPrice) : null,
        workOrderRef: order.workOrder
      }));
      
      console.log("Creating new services for orderId:", order.orderId, "Data:", serviceData);
      
      // ENHANCED: Use the new bulk create endpoint with proper foreign key handling
      await axios.post(
        `${API_BASE_URL}/createMultipleBitsLines/details?orderId=${order.orderId}`, 
        serviceData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      
      showSuccessToast(`Successfully added ${validRows.length} new service order(s)!`);
      
      // Reset and refresh
      setNewServiceRows([]);
      setShowAddForm(false);
      loadServiceOrders();
      
    } catch (error) {
      console.error("Error creating new services:", error);
      toast.error("Failed to create new service orders");
    } finally {
      setServiceLoading(false);
    }
  };

  const handleCancelNewServices = () => {
    setNewServiceRows([]);
    setShowAddForm(false);
  };

  const handleRemoveNewServiceRow = (rowId) => {
    setNewServiceRows(prev => prev.filter(row => row.id !== rowId));
  };

  const handleCancel = () => {
    onClose()
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  return (
    <div className="piUpdateContainerol">
      {/* Header */}
      <div className="piHeaderSectionol">
        <div className="piTitleSectionol">
          <h2 className="piPageTitleol">Update Work Order</h2>
          <p className="piSubtitleol">Work Order: {order?.workOrder} (ID: {order?.orderId})</p>
        </div>
        <div className="piHeaderButtonsol">
          {!isEditing ? (
            <button className="piEditButtonol" onClick={handleEdit}>
              <MdEdit className="piButtonIconol" />
              Edit
            </button>
          ) : (
            <button className="piUpdateButtonol" onClick={handleUpdate} disabled={loading}>
              {loading ? (
                <>
                  <AiOutlineLoading3Quarters className="piSpinIconol" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <MdSave className="piButtonIconol" />
                  <span>Update</span>
                </>
              )}
            </button>
          )}
          <button className="piCancelButtonol" onClick={handleCancel}>
            <MdClose className="piButtonIconol" />
            Cancel
          </button>
        </div>
      </div>

      {/* Form Grid */}
      <div className="piFormContainerol">
        <div className="piFormHeaderol">
          <h4>Work Order Details</h4>
        </div>
        <div className="piFormGridol">
          <div className="piFormRowol">
            <div className="piFormFieldol">
              <label className="piFormLabelol">Work Order</label>
              <input
                type="text"
                name="workOrder"
                value={formData.workOrder}
                onChange={handleInputChange}
                className={`piFormInputol ${!isEditing ? "piReadonlyol" : ""}`}
                readOnly={!isEditing}
                placeholder="Enter Work Order"
              />
            </div>
            <div className="piFormFieldol">
              <label className="piFormLabelol">Plant Location</label>
              <input
                type="text"
                name="plantLocation"
                value={formData.plantLocation}
                onChange={handleInputChange}
                className={`piFormInputol ${!isEditing ? "piReadonlyol" : ""}`}
                readOnly={!isEditing}
                placeholder="Enter Plant Location"
              />
            </div>
          </div>

          <div className="piFormRowol">
            <div className="piFormFieldol">
              <label className="piFormLabelol">Department</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                className={`piFormInputol ${!isEditing ? "piReadonlyol" : ""}`}
                readOnly={!isEditing}
                placeholder="Enter Department"
              />
            </div>
            <div className="piFormFieldol">
              <label className="piFormLabelol">Work Location</label>
              <input
                type="text"
                name="workLocation"
                value={formData.workLocation}
                onChange={handleInputChange}
                className={`piFormInputol ${!isEditing ? "piReadonlyol" : ""}`}
                readOnly={!isEditing}
                placeholder="Enter Work Location"
              />
            </div>
          </div>

          <div className="piFormRowol">
            <div className="piFormFieldol">
              <label className="piFormLabelol">Work Order Date</label>
              <input
                type="date"
                name="workOrderDate"
                value={formData.workOrderDate}
                onChange={handleInputChange}
                className={`piFormInputol ${!isEditing ? "piReadonlyol" : ""}`}
                readOnly={!isEditing}
              />
            </div>
            <div className="piFormFieldol">
              <label className="piFormLabelol">Completion Date</label>
              <input
                type="date"
                name="completionDate"
                value={formData.completionDate}
                onChange={handleInputChange}
                className={`piFormInputol ${!isEditing ? "piReadonlyol" : ""}`}
                readOnly={!isEditing}
              />
            </div>
          </div>

          <div className="piFormRowol">
            <div className="piFormFieldol">
              <label className="piFormLabelol">Scrap Allowance Visible %</label>
              <input
                type="text"
                name="scrapAllowanceVisiblePercent"
                value={formData.scrapAllowanceVisiblePercent}
                onChange={handleInputChange}
                className={`piFormInputol ${!isEditing ? "piReadonlyol" : ""}`}
                readOnly={!isEditing}
                placeholder="Enter Visible Scrap %"
              />
            </div>
            <div className="piFormFieldol">
              <label className="piFormLabelol">Scrap Allowance Invisible %</label>
              <input
                type="text"
                name="scrapAllowanceInvisiblePercent"
                value={formData.scrapAllowanceInvisiblePercent}
                onChange={handleInputChange}
                className={`piFormInputol ${!isEditing ? "piReadonlyol" : ""}`}
                readOnly={!isEditing}
                placeholder="Enter Invisible Scrap %"
              />
            </div>
          </div>

          <div className="piFormRowol">
            <div className="piFormFieldol">
              <label className="piFormLabelol">Material Issue Type</label>
              <select
                name="materialIssueType"
                value={formData.materialIssueType || ""}
                onChange={handleInputChange}
                className={`piFormInputol ${!isEditing ? "piReadonlyol" : ""}`}
                disabled={!isEditing}
              >
                <option value="">Select Type</option>
                <option value="with_material">With Material</option>
                <option value="without_material">Without Material</option>
              </select>
            </div>
            <div className="piFormFieldol">
              <label className="piFormLabelol">LD Applicable</label>
              <div className="piCheckboxContainerol">
                <input
                  type="checkbox"
                  name="ldApplicable"
                  checked={formData.ldApplicable}
                  onChange={handleInputChange}
                  className="piFormCheckboxol"
                  disabled={!isEditing}
                />
                <span className="piCheckboxLabelol">Yes</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Service Order Details DataGrid */}
      <div className="piFormContainerol piServiceGridContainerol">
        <div className="piFormHeaderol">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h4>Service Order Details ({serviceOrders.length} records)</h4>
            <button 
              className="piAddServiceButtonol" 
              onClick={handleAddNewService}
              disabled={serviceLoading || editingServiceId !== null}
              style={{
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                padding: "8px 16px",
                borderRadius: "4px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "5px"
              }}
            >
              <MdAdd />
              Add Service
            </button>
          </div>
        </div>
        
        <div className="piServiceGridol">
          {serviceLoading && (
            <div className="piServiceLoadingol">
              <AiOutlineLoading3Quarters className="piLoadingSpinnerol" />
              <span>Loading service details...</span>
            </div>
          )}
          
          <table className="piServiceTableol">
            <thead>
              <tr>
                <th>Line #</th>
                <th>Serial No</th>
                <th>Service Code</th>
                <th>Service Description</th>
                <th>QTY</th>
                <th>UOM</th>
                <th>Unit Price</th>
                <th>Total Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {/* Existing Service Orders */}
              {serviceOrders.length > 0 ? (
                serviceOrders.map((service) => (
                  <tr key={service.lineId}>
                    {editingServiceId === service.lineId ? (
                      // Editing row
                      <>
                        <td>
                          <span style={{ fontSize: "12px", color: "#666" }}>
                            {service.lineNumber || '-'}
                          </span>
                        </td>
                        <td>
                          <input
                            type="text"
                            name="serNo"
                            value={editServiceData.serNo || ''}
                            onChange={handleServiceInputChange}
                            className="piServiceInputol"
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            name="serviceCode"
                            value={editServiceData.serviceCode || ''}
                            onChange={handleServiceInputChange}
                            className="piServiceInputol"
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            name="serviceDesc"
                            value={editServiceData.serviceDesc || ''}
                            onChange={handleServiceInputChange}
                            className="piServiceInputol"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            name="qty"
                            value={editServiceData.qty || ''}
                            onChange={handleServiceInputChange}
                            className="piServiceInputol"
                            min="0"
                            step="0.01"
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            name="uom"
                            value={editServiceData.uom || ''}
                            onChange={handleServiceInputChange}
                            className="piServiceInputol"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            step="0.01"
                            name="unitPrice"
                            value={editServiceData.unitPrice || ''}
                            onChange={handleServiceInputChange}
                            className="piServiceInputol"
                            min="0"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            step="0.01"
                            name="totalPrice"
                            value={editServiceData.totalPrice || ''}
                            className="piServiceInputol"
                            readOnly
                            style={{ backgroundColor: "#f8f9fa" }}
                          />
                        </td>
                        <td>
                          <div className="piServiceActionsol">
                            <button 
                              className="piServiceSaveol" 
                              onClick={handleUpdateService}
                              disabled={serviceLoading}
                            >
                              <MdSave />
                            </button>
                            <button 
                              className="piServiceCancelol" 
                              onClick={handleCancelServiceEdit}
                              disabled={serviceLoading}
                            >
                              <MdClose />
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      // Display row
                      <>
                        <td>
                          <span style={{ fontSize: "12px", color: "#666" }}>
                            {service.lineNumber || '-'}
                          </span>
                        </td>
                        <td>{service.serNo || '-'}</td>
                        <td>{service.serviceCode || '-'}</td>
                        <td>{service.serviceDesc || '-'}</td>
                        <td>{service.qty || '-'}</td>
                        <td>{service.uom || '-'}</td>
                        <td>{service.unitPrice || service.rate || '-'}</td>
                        <td>{service.totalPrice || service.amount || '-'}</td>
                        <td>
                          <div className="piServiceActionsol">
                            <button 
                              className="piServiceEditol" 
                              onClick={() => handleEditService(service)}
                              disabled={serviceLoading || editingServiceId !== null}
                            >
                              <MdEdit />
                            </button>
                            <button 
                              className="piServiceDeleteol" 
                              onClick={() => handleDeleteService(service.lineId)}
                              disabled={serviceLoading || editingServiceId !== null}
                            >
                              <MdDelete />
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="piNoServiceDataol">
                    {serviceLoading ? "Loading..." : "No service orders found for this work order."}
                  </td>
                </tr>
              )}
              
              {/* New Service Rows */}
              {newServiceRows.map((row, index) => (
                <tr key={row.id} style={{ backgroundColor: "#f8f9fa" }}>
                  <td>
                    <span style={{ fontSize: "12px", color: "#28a745" }}>
                      NEW
                    </span>
                  </td>
                  <td>
                    <input
                      type="text"
                      name="serNo"
                      value={row.serNo}
                      onChange={(e) => handleNewServiceInputChange(row.id, e)}
                      className="piServiceInputol"
                      placeholder="Serial No"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      name="serviceCode"
                      value={row.serviceCode}
                      onChange={(e) => handleNewServiceInputChange(row.id, e)}
                      className="piServiceInputol"
                      placeholder="Service Code"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      name="serviceDesc"
                      value={row.serviceDesc}
                      onChange={(e) => handleNewServiceInputChange(row.id, e)}
                      className="piServiceInputol"
                      placeholder="Description"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      name="qty"
                      value={row.qty}
                      onChange={(e) => handleNewServiceInputChange(row.id, e)}
                      className="piServiceInputol"
                      placeholder="QTY"
                      min="0"
                      step="0.01"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      name="uom"
                      value={row.uom}
                      onChange={(e) => handleNewServiceInputChange(row.id, e)}
                      className="piServiceInputol"
                      placeholder="UOM"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      name="unitPrice"
                      value={row.unitPrice}
                      onChange={(e) => handleNewServiceInputChange(row.id, e)}
                      className="piServiceInputol"
                      placeholder="Unit Price"
                      min="0"
                      step="0.01"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      name="totalPrice"
                      value={row.totalPrice}
                      className="piServiceInputol"
                      readOnly
                      style={{ backgroundColor: "#e9ecef" }}
                    />
                  </td>
                  <td>
                    <button 
                      className="piServiceDeleteol" 
                      onClick={() => handleRemoveNewServiceRow(row.id)}
                      disabled={serviceLoading}
                    >
                      <MdDelete />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {/* New Service Actions */}
          {showAddForm && newServiceRows.length > 0 && (
            <div style={{ 
              padding: "15px", 
              backgroundColor: "#f8f9fa", 
              borderTop: "1px solid #dee2e6",
              display: "flex",
              gap: "10px",
              justifyContent: "flex-end"
            }}>
              <button 
                onClick={handleSaveNewServices}
                disabled={serviceLoading}
                style={{
                  backgroundColor: "#28a745",
                  color: "white",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                {serviceLoading ? <AiOutlineLoading3Quarters className="piSpinIconol" /> : <MdSave />}
                Save New Services
              </button>
              <button 
                onClick={handleCancelNewServices}
                disabled={serviceLoading}
                style={{
                  backgroundColor: "#6c757d",
                  color: "white",
                  border: "none",
                  padding: "8px 16px",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                <MdClose />
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="piLoadingOverlayol">
          <div className="piLoadingContentol">
            <AiOutlineLoading3Quarters className="piLoadingSpinnerol" />
            <div className="piLoadingTextol">Updating work order...</div>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  )
}

export default UpdatePoentryTable;