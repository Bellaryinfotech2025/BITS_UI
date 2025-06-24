import { useState, useEffect } from "react"
import axios from "axios"
import { FaFileInvoice, FaTimes, FaSearch } from "react-icons/fa"
import "../InvoiceComponent/Invoice.css"

const API_BASE_URL = "http://195.35.45.56:5522/api/V2.0"

const Invoice = () => {
  const [workOrders, setWorkOrders] = useState([])
  const [filteredWorkOrders, setFilteredWorkOrders] = useState([])
  const [selectedWorkOrder, setSelectedWorkOrder] = useState("")
  const [selectedRaNo, setSelectedRaNo] = useState("")
  const [workOrderSearch, setWorkOrderSearch] = useState("")
  const [showWorkOrderDropdown, setShowWorkOrderDropdown] = useState(false)
  const [invoiceData, setInvoiceData] = useState([])
  const [loading, setLoading] = useState(false)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [invoiceNumber, setInvoiceNumber] = useState("")
  const [invoiceDate, setInvoiceDate] = useState("")
  const [invoiceDetails, setInvoiceDetails] = useState(null)
  const [serviceFromDate, setServiceFromDate] = useState("")
  const [serviceToDate, setServiceToDate] = useState("")

  // Customer Management State
  const [customers, setCustomers] = useState([])
  const [selectedCustomer, setSelectedCustomer] = useState("")
  const [customerSearch, setCustomerSearch] = useState("")
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)
  const [filteredCustomers, setFilteredCustomers] = useState([])
  const [customerDetails, setCustomerDetails] = useState(null)
  const [workOrderDetails, setWorkOrderDetails] = useState(null)

  // Fetch work orders and customers on component mount
  useEffect(() => {
    fetchWorkOrders()
    fetchCustomers()
  }, [])

  // Filter work orders based on search
  useEffect(() => {
    if (workOrderSearch) {
      const filtered = workOrders.filter((order) => order.toLowerCase().includes(workOrderSearch.toLowerCase()))
      setFilteredWorkOrders(filtered)
    } else {
      setFilteredWorkOrders(workOrders)
    }
  }, [workOrderSearch, workOrders])

  // Filter customers based on search
  useEffect(() => {
    if (customerSearch) {
      const filtered = customers.filter(
        (customer) =>
          customer.ledgerName.toLowerCase().includes(customerSearch.toLowerCase()) ||
          (customer.gstin && customer.gstin.toLowerCase().includes(customerSearch.toLowerCase())) ||
          (customer.pan && customer.pan.toLowerCase().includes(customerSearch.toLowerCase())),
      )
      setFilteredCustomers(filtered)
    } else {
      setFilteredCustomers(customers)
    }
  }, [customerSearch, customers])

  const fetchWorkOrders = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/getworkorder/number`)
      setWorkOrders(response.data)
      setFilteredWorkOrders(response.data)
    } catch (error) {
      console.error("Error fetching work orders:", error)
    }
  }

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/getAllCustomers/details`)
      console.log("Customers fetched:", response.data) // Debug log
      setCustomers(response.data)
      setFilteredCustomers(response.data)
    } catch (error) {
      console.error("Error fetching customers:", error)
    }
  }

  // FIXED: Enhanced fetch work order and customer details
  const fetchWorkOrderAndCustomerDetails = async (workOrder, customerId) => {
    try {
      console.log("Fetching details for workOrder:", workOrder, "customerId:", customerId) // Debug log

      const response = await axios.get(`${API_BASE_URL}/getWorkOrderWithCustomer/details`, {
        params: { workOrder, customerId },
      })

      console.log("API Response:", response.data) // Debug log

      if (response.data) {
        setWorkOrderDetails(response.data)

        // FIXED: Ensure customer details include GSTIN and PAN
        const customerDetailsFromAPI = response.data.customerDetails
        if (customerDetailsFromAPI) {
          // Merge with original customer data to ensure GSTIN and PAN are included
          const originalCustomer = customers.find((c) => c.id === customerId)
          const enhancedCustomerDetails = {
            ...customerDetailsFromAPI,
            gstin: customerDetailsFromAPI.gstin || originalCustomer?.gstin,
            pan: customerDetailsFromAPI.pan || originalCustomer?.pan,
            ledgerName: customerDetailsFromAPI.ledgerName || originalCustomer?.ledgerName,
          }

          console.log("Enhanced customer details:", enhancedCustomerDetails) // Debug log
          setCustomerDetails(enhancedCustomerDetails)
        }
      }
    } catch (error) {
      console.error("Error fetching work order and customer details:", error)
    }
  }

  const handleSearch = async () => {
    if (!selectedWorkOrder) {
      alert("Please select a work order")
      return
    }

    setLoading(true)
    try {
      // First get the work order details to get the orderId
      const workOrderResponse = await axios.get(`${API_BASE_URL}/getworkorder/number/${selectedWorkOrder}`)
      const orderId = workOrderResponse.data.orderId

      // Then fetch the invoice data using the orderId
      const invoiceResponse = await axios.get(`${API_BASE_URL}/getInvoiceData/details?orderId=${orderId}`)
      setInvoiceData(invoiceResponse.data)

      // If customer is selected, fetch combined details
      if (selectedCustomer) {
        const selectedCustomerData = customers.find((c) => c.ledgerName === selectedCustomer)
        if (selectedCustomerData) {
          console.log("Selected customer data:", selectedCustomerData) // Debug log
          await fetchWorkOrderAndCustomerDetails(selectedWorkOrder, selectedCustomerData.id)
        }
      }
    } catch (error) {
      console.error("Error fetching invoice data:", error)
      alert("Error fetching data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleInvoiceClick = () => {
    setShowInvoiceModal(true)
  }

  const handleInvoiceSubmit = () => {
    if (!invoiceNumber || !invoiceDate) {
      alert("Please enter both invoice number and date")
      return
    }

    if (!serviceFromDate || !serviceToDate) {
      alert("Please select service rendered period (from and to dates)")
      return
    }

    // FIXED: Ensure customer details are properly set
    const selectedCustomerData = customers.find((c) => c.ledgerName === selectedCustomer)

    setInvoiceDetails({
      invoiceNumber,
      invoiceDate,
      serviceFromDate,
      serviceToDate,
      workOrder: selectedWorkOrder,
      raNo: selectedRaNo,
      customer: selectedCustomer,
      customerDetails: customerDetails || selectedCustomerData, // Fallback to selected customer data
      workOrderDetails: workOrderDetails,
    })

    setShowInvoiceModal(false)
    setInvoiceNumber("")
    setInvoiceDate("")
    setServiceFromDate("")
    setServiceToDate("")
  }

  const handleWorkOrderSelect = (workOrder) => {
    setSelectedWorkOrder(workOrder)
    setShowWorkOrderDropdown(false)
    setWorkOrderSearch("")
  }

  const handleCustomerSelect = (customer) => {
    console.log("Customer selected:", customer) // Debug log
    setSelectedCustomer(customer.ledgerName)
    setShowCustomerDropdown(false)
    setCustomerSearch("")
  }

  const formatCurrency = (amount) => {
    return amount ? `${Number.parseFloat(amount).toFixed(2)}` : "0.00"
  }

  const formatServiceDescription = (serviceCode, serviceDesc) => {
    if (serviceCode && serviceDesc) {
      return `(${serviceCode}) ${serviceDesc}`
    } else if (serviceCode) {
      return `(${serviceCode})`
    } else if (serviceDesc) {
      return serviceDesc
    }
    return "-"
  }

  const calculateTotal = () => {
    return invoiceData.reduce((total, item) => {
      return total + (Number.parseFloat(item.totalPrice) || 0)
    }, 0)
  }

  return (
    <div className="invoice-container">
      <div className="invoice-header">
        <h1 className="invoice-title">Search for Billing Details</h1>
        <div className="invoice-actions">
          <button className="invoice-btn" onClick={handleInvoiceClick}>
            Invoice
          </button>
          <button className="completed-btn">Completed</button>
        </div>
      </div>

      {/* Enhanced Invoice Details Display */}
      {invoiceDetails && (
        <div className="invoice-details-display">
          <div className="invoice-info">
            <div className="info-item">
              <span className="info-label">Invoice No</span>
              <span className="info-value">{invoiceDetails.invoiceNumber}</span>
            </div>
            <div className="info-item">
              <span className="info-label">INVOICE DATE</span>
              <span className="info-value">{invoiceDetails.invoiceDate}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Service Rendered Period</span>
              <span className="info-value">
                {invoiceDetails.serviceFromDate} to {invoiceDetails.serviceToDate}
              </span>
            </div>
            <div className="info-item">
              <span className="info-label">WO.NO</span>
              <span className="info-value">{invoiceDetails.workOrder}</span>
            </div>
            {invoiceDetails.workOrderDetails?.workOrderDate && (
              <div className="info-item">
                <span className="info-label">WO.Date</span>
                <span className="info-value">{invoiceDetails.workOrderDetails.workOrderDate}</span>
              </div>
            )}
            {invoiceDetails.workOrderDetails?.department && (
              <div className="info-item">
                <span className="info-label">Cost Centered</span>
                <span className="info-value">{invoiceDetails.workOrderDetails.department}</span>
              </div>
            )}
            {invoiceDetails.raNo && (
              <div className="info-item">
                <span className="info-label">RA No</span>
                <span className="info-value">{invoiceDetails.raNo}</span>
              </div>
            )}
          </div>

          {/* FIXED: Enhanced Customer Details Section with better debugging */}
          {invoiceDetails.customerDetails && (
            <div style={{ marginTop: "20px", padding: "15px", backgroundColor: "#f8f9fa", borderRadius: "8px" }}>
              <h4 style={{ margin: "0 0 15px 0", color: "#2c3e50", fontSize: "16px" }}>Customer Details</h4>

              {/* Debug info - remove in production */}
              {/* {process.env.NODE_ENV === "development" && (
                <div style={{ fontSize: "12px", color: "#666", marginBottom: "10px" }}>
                  Debug: {JSON.stringify(invoiceDetails.customerDetails)}
                </div>
              )} */}

              <div className="invoice-info">
                <div className="info-item">
                  <span className="info-label">NAME OF THE SERVICE RECIEVER</span>
                  <span className="info-value">{invoiceDetails.customerDetails.ledgerName || "N/A"}</span>
                </div>

                

                {/* FIXED: Better handling of GSTIN display */}
                <div className="info-item">
                  <span className="info-label">GST REGISTRATION NO</span>
                  <span className="info-value">
                    {invoiceDetails.customerDetails.gstin ||
                      invoiceDetails.customerDetails.gstIn ||
                      invoiceDetails.customerDetails.GSTIN ||
                      "Not Available"}
                  </span>
                </div>

                {/* FIXED: Better handling of PAN display */}
                <div className="info-item">
                  <span className="info-label">IT PAN NO</span>
                  <span className="info-value">
                    {invoiceDetails.customerDetails.pan ||
                      invoiceDetails.customerDetails.panNo ||
                      invoiceDetails.customerDetails.PAN ||
                      "Not Available"}
                  </span>
                </div>

                {/* {invoiceDetails.customerDetails.state && (
                  <div className="info-item">
                    <span className="info-label">State</span>
                    <span className="info-value">{invoiceDetails.customerDetails.state}</span>
                  </div>
                )}

                {invoiceDetails.customerDetails.district && (
                  <div className="info-item">
                    <span className="info-label">District</span>
                    <span className="info-value">{invoiceDetails.customerDetails.district}</span>
                  </div>
                )} */}

                {invoiceDetails.customerDetails.fullAddress && (
                  <div className="info-item" style={{ gridColumn: "1 / -1" }}>
                    <span className="info-label">Address</span>
                    <span className="info-value">{invoiceDetails.customerDetails.fullAddress}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Enhanced Search Controls */}
      <div className="search-controls">
        <div className="dropdown-container">
          <div className="custom-dropdown">
            <div className="dropdown-header" onClick={() => setShowWorkOrderDropdown(!showWorkOrderDropdown)}>
              <span className="dropdown-label">{selectedWorkOrder || "Work Order No"}</span>
              <span className="dropdown-arrow">▼</span>
            </div>
            {showWorkOrderDropdown && (
              <div className="dropdown-menu">
                <div className="dropdown-search">
                  <input
                    type="text"
                    placeholder="Search work order no..."
                    value={workOrderSearch}
                    onChange={(e) => setWorkOrderSearch(e.target.value)}
                    className="search-input"
                    autoFocus
                  />
                </div>
                <div className="dropdown-options">
                  {filteredWorkOrders.map((workOrder, index) => (
                    <div key={index} className="dropdown-option" onClick={() => handleWorkOrderSelect(workOrder)}>
                      {workOrder}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* FIXED: Enhanced Customer Name Dropdown with GSTIN/PAN display */}
        <div className="dropdown-container">
          <div className="custom-dropdown">
            <div className="dropdown-header" onClick={() => setShowCustomerDropdown(!showCustomerDropdown)}>
              <span className="dropdown-label">{selectedCustomer || "Customer Name"}</span>
              <span className="dropdown-arrow">▼</span>
            </div>
            {showCustomerDropdown && (
              <div className="dropdown-menu">
                <div className="dropdown-search">
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
                      placeholder="Search customers, GSTIN, PAN..."
                      value={customerSearch}
                      onChange={(e) => setCustomerSearch(e.target.value)}
                      className="search-input"
                      style={{ paddingLeft: "30px" }}
                      autoFocus
                    />
                  </div>
                </div>
                <div className="dropdown-options">
                  {filteredCustomers.map((customer) => (
                    <div
                      key={customer.id}
                      className="dropdown-option"
                      onClick={() => handleCustomerSelect(customer)}
                      style={{ display: "flex", flexDirection: "column", gap: "2px" }}
                    >
                      <div style={{ fontWeight: "500" }}>{customer.ledgerName}</div>
                      <div style={{ fontSize: "11px", color: "#666", display: "flex", gap: "10px" }}>
                        {customer.gstin && <span>GSTIN: {customer.gstin}</span>}
                        {customer.pan && <span>PAN: {customer.pan}</span>}
                      </div>
                      {customer.state && customer.district && (
                        <div style={{ fontSize: "10px", color: "#888" }}>
                          {customer.district}, {customer.state}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="select-group">
          <select value={selectedRaNo} onChange={(e) => setSelectedRaNo(e.target.value)} className="invoice-select">
            <option value="">Select RA NO</option>
            <option value="RA001">RA001</option>
            <option value="RA002">RA002</option>
            <option value="RA003">RA003</option>
          </select>
        </div>

        <button onClick={handleSearch} disabled={loading} className="search-btn">
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {/* Data Table */}
      <div className="table-container">
        <table className="invoice-table">
          <thead>
            <tr>
              <th>Invoice</th>
              <th>SL NO</th>
              <th>Service Description</th>
              <th>UOM</th>
              <th>QTY</th>
              <th>Rate (Rs)</th>
              <th>Amount Total</th>
            </tr>
          </thead>
          <tbody>
            {invoiceData.length > 0 ? (
              invoiceData.map((item, index) => (
                <tr key={item.lineId || index}>
                  <td className="invoice-icon-cell">
                    <FaFileInvoice className="invoice-icon" />
                  </td>
                  <td>{item.serNo || "-"}</td>
                  <td>{formatServiceDescription(item.serviceCode, item.serviceDesc)}</td>
                  <td>{item.uom || "-"}</td>
                  <td>{item.qty || 0}</td>
                  <td>{formatCurrency(item.unitPrice)}</td>
                  <td>{formatCurrency(item.totalPrice)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" className="no-data">
                  {selectedWorkOrder
                    ? "No data found for the selected work order"
                    : "Please select Work Order and Customer, then click Search to view records"}
                </td>
              </tr>
            )}
          </tbody>
          {invoiceData.length > 0 && (
            <tfoot>
              <tr className="total-row">
                <td colSpan="6" className="total-label">
                  Total Amount:
                </td>
                <td className="total-amount">{formatCurrency(calculateTotal())}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      {/* Invoice Modal */}
      {showInvoiceModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Invoice Details</h3>
              <button className="close-btn" onClick={() => setShowInvoiceModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Invoice Number</label>
                <input
                  type="text"
                  placeholder="Enter invoice number"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="modal-input"
                />
              </div>
              <div className="form-group">
                <label>Invoice Date</label>
                <input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="modal-input"
                />
              </div>
              <div className="form-group">
                <label>Service Rendered Period</label>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>From</label>
                    <input
                      type="date"
                      value={serviceFromDate}
                      onChange={(e) => setServiceFromDate(e.target.value)}
                      className="modal-input"
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>To</label>
                    <input
                      type="date"
                      value={serviceToDate}
                      onChange={(e) => setServiceToDate(e.target.value)}
                      className="modal-input"
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowInvoiceModal(false)}>
                Cancel
              </button>
              <button className="submit-btn" onClick={handleInvoiceSubmit}>
                Submit Invoice Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Invoice;
