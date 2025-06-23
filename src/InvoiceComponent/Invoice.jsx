import { useState, useEffect } from "react";
import axios from "axios";
import { FaFileInvoice, FaTimes } from "react-icons/fa";
import "../InvoiceComponent/Invoice.css";

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

  // Fetch work orders on component mount
  useEffect(() => {
    fetchWorkOrders()
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

  const fetchWorkOrders = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/getworkorder/number`)
      setWorkOrders(response.data)
      setFilteredWorkOrders(response.data)
    } catch (error) {
      console.error("Error fetching work orders:", error)
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

    setInvoiceDetails({
      invoiceNumber,
      invoiceDate,
      workOrder: selectedWorkOrder,
      raNo: selectedRaNo,
    })
    setShowInvoiceModal(false)
    setInvoiceNumber("")
    setInvoiceDate("")
  }

  const handleWorkOrderSelect = (workOrder) => {
    setSelectedWorkOrder(workOrder)
    setShowWorkOrderDropdown(false)
    setWorkOrderSearch("")
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

      {/* Invoice Details Display */}
      {invoiceDetails && (
        <div className="invoice-details-display">
          <div className="invoice-info">
            <div className="info-item">
              <span className="info-label">Invoice No</span>
              <span className="info-value">{invoiceDetails.invoiceNumber}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Date</span>
              <span className="info-value">{invoiceDetails.invoiceDate}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Work Order</span>
              <span className="info-value">{invoiceDetails.workOrder}</span>
            </div>
            {invoiceDetails.raNo && (
              <div className="info-item">
                <span className="info-label">RA No</span>
                <span className="info-value">{invoiceDetails.raNo}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search Controls */}
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
                    : "Please select Work Order and click Search to view records"}
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
