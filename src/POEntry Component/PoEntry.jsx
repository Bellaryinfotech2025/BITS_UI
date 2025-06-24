import { useState, useEffect } from "react"
import axios from "axios"
import { AiOutlineLoading3Quarters } from "react-icons/ai"
import { MdDelete, MdSave, MdAdd, MdClose } from "react-icons/md"
import { FaCheck, FaSearch } from "react-icons/fa"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import "../POEntry Component/PoEntry.css"

const API_BASE_URL = "http://195.35.45.56:5522/api/V2.0"

const POEntry = ({ onClose }) => {
  // Bits Header Table State
  const [headerRows, setHeaderRows] = useState([])
  const [formRows, setFormRows] = useState([])
  const [loading, setLoading] = useState(false)

  // Service Details Table State
  const [serviceFormRows, setServiceFormRows] = useState([])
  const [serviceLoading, setServiceLoading] = useState(false)

  // NEW: Customer Management State
  const [customers, setCustomers] = useState([])
  const [selectedCustomer, setSelectedCustomer] = useState("")
  const [customerSearch, setCustomerSearch] = useState("")
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)
  const [filteredCustomers, setFilteredCustomers] = useState([])
  const [customerDropdownEnabled, setCustomerDropdownEnabled] = useState(false)
  const [savedOrderId, setSavedOrderId] = useState(null)

  // Initialize with one form row
  useEffect(() => {
    setFormRows([createNewFormRow()])
    fetchCustomers()
  }, [])

  // Filter customers based on search
  useEffect(() => {
    if (customerSearch) {
      const filtered = customers.filter(
        (customer) =>
          customer.ledgerName.toLowerCase().includes(customerSearch.toLowerCase()) ||
          (customer.contactPersonName &&
            customer.contactPersonName.toLowerCase().includes(customerSearch.toLowerCase())),
      )
      setFilteredCustomers(filtered)
    } else {
      setFilteredCustomers(customers)
    }
  }, [customerSearch, customers])

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/getAllCustomers/details`)
      setCustomers(response.data)
      setFilteredCustomers(response.data)
    } catch (error) {
      console.error("Error fetching customers:", error)
    }
  }

  const createNewFormRow = () => ({
    id: Date.now() + Math.random(),
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

  const createNewServiceRow = () => ({
    id: Date.now() + Math.random(),
    serNo: "",
    serviceCode: "",
    serviceDesc: "",
    qty: "",
    uom: "",
    rate: "",
    amount: "",
  })

  const handleFormInputChange = (rowId, e) => {
    const { name, value, type, checked } = e.target
    setFormRows((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, [name]: type === "checkbox" ? checked : value } : row)),
    )
  }

  const handleServiceInputChange = (rowId, e) => {
    const { name, value } = e.target
    setServiceFormRows((prev) =>
      prev.map((row) => {
        if (row.id === rowId) {
          const updatedRow = { ...row, [name]: value }
          if (name === "qty" || name === "rate") {
            const qty = Number.parseFloat(name === "qty" ? value : updatedRow.qty) || 0
            const rate = Number.parseFloat(name === "rate" ? value : updatedRow.rate) || 0
            updatedRow.amount = (qty * rate).toFixed(2)
          }
          return updatedRow
        }
        return row
      }),
    )
  }

  const handleAddService = () => {
    setServiceFormRows((prev) => [...prev, createNewServiceRow()])
  }

  const handleCustomerSelect = (customer) => {
    setSelectedCustomer(customer.ledgerName)
    setShowCustomerDropdown(false)
    setCustomerSearch("")
  }

  // NEW: Submit for Invoice function
  const handleSubmitForInvoice = async () => {
    if (!selectedCustomer) {
      toast.error("Please select a customer before submitting for invoice")
      return
    }

    if (!savedOrderId) {
      toast.error("Please save the order first before submitting for invoice")
      return
    }

    try {
      const selectedCustomerData = customers.find((c) => c.ledgerName === selectedCustomer)
      if (!selectedCustomerData) {
        toast.error("Selected customer not found")
        return
      }

      // Update the order with customer ID
      const response = await axios.put(`${API_BASE_URL}/updateCustomer/details`, null, {
        params: {
          orderId: savedOrderId,
          customerId: selectedCustomerData.id,
        },
      })

      if (response.data.success) {
        showSuccessToast("Order successfully submitted for invoice with customer details!")

        // Reset form
        setFormRows([createNewFormRow()])
        setServiceFormRows([])
        setSelectedCustomer("")
        setCustomerDropdownEnabled(false)
        setSavedOrderId(null)
      }
    } catch (error) {
      console.error("Error submitting for invoice:", error)
      toast.error("Failed to submit for invoice: " + (error.response?.data || error.message))
    }
  }

  const showSuccessToast = (message) => {
    toast.success(
      <div className="AOsuccessToastKI">
        <FaCheck className="AOtoastIconKI" />
        <span className="AOtoastTextKI">{message}</span>
      </div>,
      {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        className: "AOcustomToastKI",
      },
    )
  }

  // ENHANCED: Updated save function
  const handleSaveBoth = async () => {
    try {
      setLoading(true)
      setServiceLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      console.log("Starting save process...")

      // First save the work order header
      const savedHeaders = []
      for (const formData of formRows) {
        const { id, ...dataToSave } = formData
        console.log("Saving work order:", dataToSave)

        const response = await axios.post(`${API_BASE_URL}/createBitsHeader/details`, dataToSave, {
          headers: {
            "Content-Type": "application/json",
          },
        })

        if (response.data) {
          console.log("Saved work order response:", response.data)
          savedHeaders.push(response.data)
          setSavedOrderId(response.data.orderId) // Store the saved order ID
        }
      }

      // If we have service rows to save and we successfully saved a header
      if (serviceFormRows.length > 0 && savedHeaders.length > 0) {
        const savedHeader = savedHeaders[0]
        const workOrderId = savedHeader?.orderId
        const workOrderNo = savedHeader?.workOrder

        console.log("Work Order ID:", workOrderId, "Work Order No:", workOrderNo)

        if (!workOrderId) {
          throw new Error("Failed to get work order ID from saved header")
        }

        if (!workOrderNo) {
          throw new Error("Failed to get work order number from saved header")
        }

        const serviceDataToSave = serviceFormRows.map((formData) => {
          const { id, ...dataToSave } = formData
          return {
            ...dataToSave,
            qty: dataToSave.qty ? Number.parseFloat(dataToSave.qty) : null,
            unitPrice: dataToSave.rate ? Number.parseFloat(dataToSave.rate) : null,
            totalPrice: dataToSave.amount ? Number.parseFloat(dataToSave.amount) : null,
            workOrderRef: workOrderNo,
          }
        })

        console.log("Saving service orders with bulk method:", serviceDataToSave)

        const serviceResponse = await axios.post(
          `${API_BASE_URL}/createMultipleBitsLines/details?orderId=${workOrderId}`,
          serviceDataToSave,
          {
            headers: {
              "Content-Type": "application/json",
            },
          },
        )

        console.log("Bulk saved service orders response:", serviceResponse.data)
      }

      // Enable customer dropdown after successful save
      setCustomerDropdownEnabled(true)

      showSuccessToast("Work Order and Service Order data successfully saved! You can now select a customer.")
    } catch (error) {
      console.error("Error saving data:", error)
      let errorMessage = "Failed to save data"
      if (error.response?.data) {
        errorMessage +=
          ": " + (typeof error.response.data === "string" ? error.response.data : JSON.stringify(error.response.data))
      } else if (error.message) {
        errorMessage += ": " + error.message
      }
      toast.error(errorMessage)
    } finally {
      setLoading(false)
      setServiceLoading(false)
    }
  }

  const handleRemoveServiceRow = (rowId) => {
    setServiceFormRows((prev) => prev.filter((row) => row.id !== rowId))
  }

  const handleCancel = () => {
    if (onClose) {
      onClose()
    }
  }

  const isSaveDisabled = () => {
    return loading || serviceLoading || formRows.length === 0 || !formRows[0] || !formRows[0].workOrder
  }

  return (
    <div className="AOelephantKI">
      {/* Header with Save and Cancel Buttons */}
      <div className="AOlionKI">
        <div className="AOtigerKI">
          <h3>Work Order Entry Form</h3>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <button className="AOcheetahKI AOsaveBtnKI" onClick={handleSaveBoth} disabled={isSaveDisabled()}>
            {loading || serviceLoading ? (
              <>
                <AiOutlineLoading3Quarters className="AOspinIconKI" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <MdSave className="AObuttonIconKI" />
                <span>Save All</span>
              </>
            )}
          </button>

          {/* NEW: Customer Name Dropdown */}
          <div className="customer-dropdown-container" style={{ position: "relative", minWidth: "200px" }}>
            <div
              className={`customer-dropdown-header ${!customerDropdownEnabled ? "disabled" : ""}`}
              onClick={() => customerDropdownEnabled && setShowCustomerDropdown(!showCustomerDropdown)}
              style={{
                background: customerDropdownEnabled ? "white" : "#f5f5f5",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                padding: "10px 12px",
                cursor: customerDropdownEnabled ? "pointer" : "not-allowed",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontSize: "14px",
                color: customerDropdownEnabled ? "#2d3748" : "#a0aec0",
                opacity: customerDropdownEnabled ? 1 : 0.6,
              }}
            >
              <span>{selectedCustomer || "Customer Name"}</span>
              <span style={{ fontSize: "12px", color: "#a0aec0" }}>▼</span>
            </div>
            {showCustomerDropdown && customerDropdownEnabled && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  background: "white",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
                  zIndex: 1000,
                  maxHeight: "300px",
                  overflow: "hidden",
                }}
              >
                <div style={{ padding: "12px", borderBottom: "1px solid #e2e8f0" }}>
                  <div style={{ position: "relative" }}>
                    <FaSearch
                      style={{
                        position: "absolute",
                        left: "10px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        color: "#a0aec0",
                        fontSize: "12px",
                      }}
                    />
                    <input
                      type="text"
                      placeholder="Search customers..."
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px 8px 8px 30px",
                        border: "1px solid #e2e8f0",
                        borderRadius: "6px",
                        fontSize: "14px",
                        outline: "none",
                      }}
                      autoFocus
                    />
                  </div>
                </div>
                <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                  {filteredCustomers.map((customer) => (
                    <div
                      key={customer.id}
                      onClick={() => handleCustomerSelect(customer)}
                      style={{
                        padding: "12px 16px",
                        cursor: "pointer",
                        fontSize: "14px",
                        color: "#2d3748",
                        borderBottom: "1px solid #f7fafc",
                        display: "flex",
                        flexDirection: "column",
                        gap: "2px",
                      }}
                      onMouseEnter={(e) => (e.target.style.background = "#f7fafc")}
                      onMouseLeave={(e) => (e.target.style.background = "white")}
                    >
                      <div style={{ fontWeight: "500" }}>{customer.ledgerName}</div>
                      {customer.contactPersonName && (
                        <div style={{ fontSize: "12px", color: "#666" }}>{customer.contactPersonName}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* NEW: Submit for Invoice Button */}
          <button
            className="AOcheetahKI"
            onClick={handleSubmitForInvoice}
            disabled={!customerDropdownEnabled || !selectedCustomer}
            style={{
              backgroundColor: customerDropdownEnabled && selectedCustomer ? "#28a745" : "#6c757d",
              cursor: customerDropdownEnabled && selectedCustomer ? "pointer" : "not-allowed",
            }}
          >
            <FaCheck className="AObuttonIconKI" />
            <span>Submit for Invoice</span>
          </button>

          <button className="AOcancelButtonKI" onClick={handleCancel}>
            <MdClose className="AOrefreshIconKI" />
            <span>Cancel</span>
          </button>
        </div>
      </div>

      {/* Work Order Form Section - Always show one form */}
      <div className="AOformSectionKI">
        <div className="AOformHeaderKI">
          <h4>Work Order Entry</h4>
        </div>

        {/* Form Grid Layout */}
        {formRows.map((formData) => (
          <div key={formData.id} className="AOformGridKI">
            <div className="AOformRowKI">
              <div className="AOformFieldKI">
                <label className="AOformLabelKI">Work Order</label>
                <input
                  type="text"
                  name="workOrder"
                  value={formData.workOrder}
                  onChange={(e) => handleFormInputChange(formData.id, e)}
                  className="AOformInputKI"
                  placeholder="Enter Work Order"
                />
              </div>
              <div className="AOformFieldKI">
                <label className="AOformLabelKI">Building Name</label>
                <input
                  type="text"
                  name="plantLocation"
                  value={formData.plantLocation}
                  onChange={(e) => handleFormInputChange(formData.id, e)}
                  className="AOformInputKI"
                  placeholder="Enter Building Name"
                />
              </div>
            </div>
            <div className="AOformRowKI">
              <div className="AOformFieldKI">
                <label className="AOformLabelKI">Department</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={(e) => handleFormInputChange(formData.id, e)}
                  className="AOformInputKI"
                  placeholder="Enter Department"
                />
              </div>
              <div className="AOformFieldKI">
                <label className="AOformLabelKI">Work Location</label>
                <input
                  type="text"
                  name="workLocation"
                  value={formData.workLocation}
                  onChange={(e) => handleFormInputChange(formData.id, e)}
                  className="AOformInputKI"
                  placeholder="Enter Work Location"
                />
              </div>
            </div>
            <div className="AOformRowKI">
              <div className="AOformFieldKI">
                <label className="AOformLabelKI">Work Order Date</label>
                <input
                  type="date"
                  name="workOrderDate"
                  value={formData.workOrderDate}
                  onChange={(e) => handleFormInputChange(formData.id, e)}
                  className="AOformInputKI"
                />
              </div>
              <div className="AOformFieldKI">
                <label className="AOformLabelKI">Completion Date</label>
                <input
                  type="date"
                  name="completionDate"
                  value={formData.completionDate}
                  onChange={(e) => handleFormInputChange(formData.id, e)}
                  className="AOformInputKI"
                />
              </div>
            </div>
            <div className="AOformRowKI">
              <div className="AOformFieldKI">
                <label className="AOformLabelKI">Scrap Allowance Visible %</label>
                <input
                  type="text"
                  name="scrapAllowanceVisiblePercent"
                  value={formData.scrapAllowanceVisiblePercent}
                  onChange={(e) => handleFormInputChange(formData.id, e)}
                  className="AOformInputKI"
                  placeholder="Enter Visible Scrap %"
                />
              </div>
              <div className="AOformFieldKI">
                <label className="AOformLabelKI">Scrap Allowance Invisible %</label>
                <input
                  type="text"
                  name="scrapAllowanceInvisiblePercent"
                  value={formData.scrapAllowanceInvisiblePercent}
                  onChange={(e) => handleFormInputChange(formData.id, e)}
                  className="AOformInputKI"
                  placeholder="Enter Invisible Scrap %"
                />
              </div>
            </div>
            <div className="AOformRowKI">
              <div className="AOformFieldKI">
                <label className="AOformLabelKI">Material Issue Type</label>
                <select
                  name="materialIssueType"
                  value={formData.materialIssueType}
                  onChange={(e) => handleFormInputChange(formData.id, e)}
                  className="AOformInputKI"
                >
                  <option value="">Select Type</option>
                  <option value="with_material">With Material</option>
                  <option value="without_material">Without Material</option>
                </select>
              </div>
              <div className="AOformFieldKI">
                <label className="AOformLabelKI">LD Applicable</label>
                <div className="AOcheckboxContainerKI">
                  <input
                    type="checkbox"
                    name="ldApplicable"
                    checked={formData.ldApplicable}
                    onChange={(e) => handleFormInputChange(formData.id, e)}
                    className="AOformCheckboxKI"
                  />
                  <span className="AOcheckboxLabelKI">Yes</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Service Details Table */}
      <div className="AOzebraKI AOserviceSectionKI">
        <div className="AOhippoKI">
          <div className="AOrhinoKI">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
              <h4 style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: "#2c3e50" }}>
                Service Order ({serviceFormRows.length} items)
              </h4>
              <div style={{ display: "flex", gap: "10px" }}>
                <button className="AOcheetahKI AOaddBtnKI" onClick={handleAddService}>
                  <MdAdd className="AObuttonIconKI" />
                  <span>Add Service</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="AOleopardKI">
        {serviceLoading && (
          <div className="AOpantherKI">
            <div className="AOjaguarKI">
              <AiOutlineLoading3Quarters />
            </div>
            <div className="AOcougarKI">Saving service data with proper relationships...</div>
          </div>
        )}

        <table className="AOlynxKI">
          <thead>
            <tr>
              <th>Service #</th>
              <th>Serial No</th>
              <th>Service Code</th>
              <th>Service Description</th>
              <th>QTY</th>
              <th>UOM</th>
              <th>Unit Price</th>
              <th>Total Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {serviceFormRows.map((formData, index) => (
              <tr key={formData.id} className="AObearKI">
                <td>
                  <div className="AOwolfKI">
                    <span style={{ fontSize: "12px", color: "#666" }}>{index + 1}</span>
                  </div>
                </td>
                <td>
                  <input
                    type="text"
                    name="serNo"
                    value={formData.serNo}
                    onChange={(e) => handleServiceInputChange(formData.id, e)}
                    className="AOfoxKI"
                    placeholder="Serial No"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    name="serviceCode"
                    value={formData.serviceCode}
                    onChange={(e) => handleServiceInputChange(formData.id, e)}
                    className="AOfoxKI"
                    placeholder="Service Code"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    name="serviceDesc"
                    value={formData.serviceDesc}
                    onChange={(e) => handleServiceInputChange(formData.id, e)}
                    className="AOfoxKI"
                    placeholder="Service Description"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    name="qty"
                    value={formData.qty}
                    onChange={(e) => handleServiceInputChange(formData.id, e)}
                    className="AOfoxKI"
                    placeholder="QTY"
                    min="0"
                    step="0.01"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    name="uom"
                    value={formData.uom}
                    onChange={(e) => handleServiceInputChange(formData.id, e)}
                    className="AOfoxKI"
                    placeholder="UOM"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    step="0.01"
                    name="rate"
                    value={formData.rate}
                    onChange={(e) => handleServiceInputChange(formData.id, e)}
                    className="AOfoxKI"
                    placeholder="Unit Price"
                    min="0"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    step="0.01"
                    name="amount"
                    value={formData.amount}
                    className="AOfoxKI readonly"
                    placeholder="Total Price"
                    readOnly
                    style={{ backgroundColor: "#f8f9fa", color: "#6c757d" }}
                  />
                </td>
                <td>
                  <span className="AOdeerKI">{serviceLoading ? "Saving..." : "Ready"}</span>
                </td>
                <td>
                  <div className="AOmooseKI">
                    <button
                      className="AOelkKI AObisonKI"
                      onClick={() => handleRemoveServiceRow(formData.id)}
                      title="Remove Service"
                      disabled={serviceLoading}
                    >
                      <MdDelete />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {serviceFormRows.length === 0 && (
              <tr className="AOyakKI">
                <td colSpan="10">
                  <div className="AOcamelKI">
                    <div className="AOllamaKI">
                      No service records. Click "Add Service" to create a new service order.
                      <br />
                      <small style={{ color: "#666", fontSize: "12px" }}>
                        Service lines will be automatically numbered and linked to the work order.
                      </small>
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Enhanced Loading Overlay */}
      {(loading || serviceLoading) && (
        <div
          className="AOloadingOverlayKI"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "30px",
              borderRadius: "10px",
              textAlign: "center",
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            }}
          >
            <AiOutlineLoading3Quarters
              style={{
                fontSize: "40px",
                color: "#007bff",
                animation: "spin 1s linear infinite",
              }}
            />
            <div style={{ marginTop: "15px", fontSize: "16px", color: "#333" }}>
              {loading && serviceLoading
                ? "Saving work order and service lines..."
                : loading
                  ? "Saving work order..."
                  : "Saving service lines with proper relationships..."}
            </div>
            <div style={{ marginTop: "10px", fontSize: "12px", color: "#666" }}>
              Please wait while we establish proper foreign key relationships...
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  )
}

export default POEntry;
