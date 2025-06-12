import { useState, useEffect } from "react"
import axios from "axios"
import { MdSave, MdClose, MdEdit, MdDelete } from "react-icons/md"
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
      
      // Load associated service orders
      loadServiceOrders(order.workOrder);
    }
  }, [order])
  
  const loadServiceOrders = async (workOrderNo) => {
    try {
      setServiceLoading(true);
      console.log("Loading service orders for work order:", workOrderNo);
      
      // Use the new endpoint to get service orders by work order
      const response = await axios.get(`${API_BASE_URL}/getBitsLinesByWorkOrder/details?workOrder=${encodeURIComponent(workOrderNo)}`);
      
      console.log("Service orders response:", response.data);
      setServiceOrders(response.data || []);
    } catch (error) {
      console.error("Error loading service orders:", error);
      toast.error("Failed to load service order details");
      setServiceOrders([]);
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
    if (name === 'qty' || name === 'rate' || name === 'amount') {
      processedValue = value === '' ? '' : parseFloat(value);
      
      // Recalculate amount if qty or rate changes
      if (name === 'qty' || name === 'rate') {
        const qty = name === 'qty' ? processedValue : editServiceData.qty;
        const rate = name === 'rate' ? processedValue : editServiceData.rate;
        
        if (!isNaN(qty) && !isNaN(rate)) {
          setEditServiceData(prev => ({
            ...prev,
            [name]: processedValue,
            amount: (qty * rate).toFixed(2)
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
      rate: service.rate || '',
      amount: service.amount || ''
    });
  };
  
  const handleUpdateService = async () => {
    try {
      setServiceLoading(true);
      
      const processedData = {
        ...editServiceData,
        qty: editServiceData.qty ? parseFloat(editServiceData.qty) : null,
        rate: editServiceData.rate ? parseFloat(editServiceData.rate) : null,
        amount: editServiceData.amount ? parseFloat(editServiceData.amount) : null,
      };
      
      await axios.put(`${API_BASE_URL}/updateBitsLine/details?id=${editingServiceId}`, processedData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      
      showSuccessToast("Service Order updated successfully!");
      
      // Refresh service orders
      loadServiceOrders(order.workOrder);
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
      loadServiceOrders(order.workOrder);
    } catch (error) {
      console.error("Error deleting service order:", error);
      toast.error("Failed to delete service order");
    } finally {
      setServiceLoading(false);
    }
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
          <p className="piSubtitleol">Work Order: {order?.workOrder}</p>
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
          <h4>Service Order Details ({serviceOrders.length} records)</h4>
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
              {serviceOrders.length > 0 ? (
                serviceOrders.map((service) => (
                  <tr key={service.lineId}>
                    {editingServiceId === service.lineId ? (
                      // Editing row
                      <>
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
                            name="rate"
                            value={editServiceData.rate || ''}
                            onChange={handleServiceInputChange}
                            className="piServiceInputol"
                          />
                        </td>
                        <td>
                          <input
                            type="number"
                            step="0.01"
                            name="amount"
                            value={editServiceData.amount || ''}
                            className="piServiceInputol"
                            readOnly
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
                        <td>{service.serNo || '-'}</td>
                        <td>{service.serviceCode || '-'}</td>
                        <td>{service.serviceDesc || '-'}</td>
                        <td>{service.qty || '-'}</td>
                        <td>{service.uom || '-'}</td>
                        <td>{service.rate || '-'}</td>
                        <td>{service.amount || '-'}</td>
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
                  <td colSpan="8" className="piNoServiceDataol">
                    {serviceLoading ? "Loading..." : "No service orders found for this work order."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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