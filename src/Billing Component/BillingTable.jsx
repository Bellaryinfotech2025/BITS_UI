import { useState, useEffect } from "react"
import axios from "axios"
import { IoMdOpen } from "react-icons/io"
import { FiRefreshCw, FiSearch } from "react-icons/fi"
import { AiOutlineLoading3Quarters } from "react-icons/ai"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import "../BillingDesign Component/BillingDesign.css"

const API_BILLING_URL = "http://195.35.45.56:5522/api/v3.0/billing"

const BillingTable = () => {
  const [billingRows, setBillingRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [showingLatestOnly, setShowingLatestOnly] = useState(true) // Default to showing latest only

  // Set up global function for AlignmentTable to call
  useEffect(() => {
    window.refreshBillingTable = (movedMkds) => {
      console.log("Billing table received moved mkds:", movedMkds)
      // Fetch the latest stored records from backend
      fetchLatestBillingData()
      setCurrentPage(1)
      setShowingLatestOnly(true)

      // Show success message
      toast.success(`Displaying ${movedMkds.length} newly moved records`, {
        position: "top-right",
        autoClose: 3000,
      })
    }

    return () => {
      delete window.refreshBillingTable
    }
  }, [])

  // Fetch only the latest stored billing records
  const fetchLatestBillingData = async () => {
    try {
      setLoading(true)
      console.log("Fetching latest billing records...")

      const response = await axios.get(`${API_BILLING_URL}/latest`)

      if (response.data && Array.isArray(response.data)) {
        const sortedData = response.data.sort((a, b) => (b.id || 0) - (a.id || 0))
        setBillingRows(sortedData)
        setShowingLatestOnly(true)

        if (sortedData.length > 0) {
          toast.success(`Loaded ${sortedData.length} latest billing records`, {
            position: "top-right",
            autoClose: 2000,
          })
        } else {
          toast.info("No latest billing records found", {
            position: "top-right",
            autoClose: 2000,
          })
        }
      } else {
        setBillingRows([])
        toast.info("No latest billing records found", {
          position: "top-right",
          autoClose: 2000,
        })
      }
    } catch (error) {
      console.error("Error fetching latest billing data:", error)
      toast.error("Failed to fetch latest billing data", {
        position: "top-right",
        autoClose: 2000,
      })
      setBillingRows([])
    } finally {
      setLoading(false)
    }
  }

  // Fetch all billing records
  const fetchAllBillingData = async () => {
    try {
      setLoading(true)
      console.log("Fetching all billing records...")

      const response = await axios.get(API_BILLING_URL)

      if (response.data && Array.isArray(response.data)) {
        const sortedData = response.data.sort((a, b) => (b.id || 0) - (a.id || 0))
        setBillingRows(sortedData)
        setShowingLatestOnly(false)

        toast.success(`Loaded ${sortedData.length} billing records`, {
          position: "top-right",
          autoClose: 2000,
        })
      } else {
        setBillingRows([])
        toast.info("No billing records found", {
          position: "top-right",
          autoClose: 2000,
        })
      }
    } catch (error) {
      console.error("Error fetching all billing data:", error)
      toast.error("Failed to fetch billing data", {
        position: "top-right",
        autoClose: 2000,
      })
      setBillingRows([])
    } finally {
      setLoading(false)
    }
  }

  // Initial load - fetch latest records by default
  useEffect(() => {
    fetchLatestBillingData()
  }, [])

  const handleRefresh = () => {
    setBillingRows([])
    setSearchQuery("")
    setCurrentPage(1)

    if (showingLatestOnly) {
      fetchLatestBillingData()
      toast.info("Latest billing records refreshed", {
        position: "top-right",
        autoClose: 2000,
      })
    } else {
      fetchAllBillingData()
      toast.info("All billing records refreshed", {
        position: "top-right",
        autoClose: 2000,
      })
    }
  }

  const handleShowAll = () => {
    fetchAllBillingData()
  }

  const handleShowLatestOnly = () => {
    fetchLatestBillingData()
  }

  // Filter rows by search query
  const filteredRows = billingRows.filter((row) => {
    if (!searchQuery) return true

    const query = searchQuery.toLowerCase()
    return (
      (row.erectionMkd && row.erectionMkd.toLowerCase().includes(query)) ||
      (row.itemNo && row.itemNo.toLowerCase().includes(query)) ||
      (row.section && row.section.toLowerCase().includes(query)) ||
      (row.remark && row.remark.toLowerCase().includes(query))
    )
  })

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredRows.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredRows.length / itemsPerPage)

  // Helper for status badge
  const getStatusStyle = (status) => {
    if (!status) return "orderfabStatusBadgedetimp"
    const lowerStatus = status.toLowerCase()
    if (lowerStatus.includes("billing")) {
      return "orderfabStatusBadgedetimp billing-status"
    }
    return "orderfabStatusBadgedetimp"
  }

  const getRemarkStyle = (remark) => {
    if (!remark) return ""
    const lowerRemark = remark.toLowerCase()
    if (lowerRemark.includes("completed")) {
      return "orderfabRemarkCompleteddetimp"
    } else if (lowerRemark.includes("not completed")) {
      return "orderfabRemarkNotCompleteddetimp"
    } else {
      return "orderfabRemarkCompleteddetimp"
    }
  }

  const formatUomForDisplay = (uom) => {
    if (!uom) return ""
    return uom.toLowerCase()
  }

  return (
    <div className="orderfabContainerdetimp">
      <div className="orderfabHeaderdetimp">
        <div className="orderfabHeaderTitledetimp">
          <h3>Billing Table</h3>
          <div
            style={{
              fontSize: "12px",
              color: showingLatestOnly ? "#007bff" : "#6c757d",
              marginTop: "5px",
              fontWeight: "normal",
            }}
          >
            {showingLatestOnly
              ? `Showing ${billingRows.length} latest stored records`
              : `Showing all ${billingRows.length} records`}
          </div>
        </div>
        <div className="orderfabHeaderActionsdetimp">
          {showingLatestOnly ? (
            <button
              className="orderfabRefreshButtondetimp"
              onClick={handleShowAll}
              style={{ marginRight: "10px", backgroundColor: "#2c5282",color:'white' }}
            >
              <span>Show All</span>
            </button>
          ) : (
            <button
              className="orderfabRefreshButtondetimp"
              onClick={handleShowLatestOnly}
              style={{ marginRight: "10px", backgroundColor: "#007bff" }}
            >
              <span>Show Latest Only</span>
            </button>
          )}
          <button className="orderfabRefreshButtondetimp" onClick={handleRefresh}>
            <FiRefreshCw />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div className="orderfabSearchSectiondetimp">
        <form
          className="orderfabSearchControlsdetimp"
          onSubmit={(e) => {
            e.preventDefault()
            setCurrentPage(1)
          }}
        >
          <div className="orderfabSearchInputWrapperdetimp">
            <div className="orderfabSearchInputContainerdetimp">
              <FiSearch className="orderfabSearchIcondetimp" />
              <input
                type="text"
                placeholder="Search by Mark No..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="orderfabSearchInputdetimp"
              />
            </div>
            <button type="submit" className="orderfabSearchButtondetimp">
              Search
            </button>
          </div>
        </form>
      </div>

      <div className="orderfabTableContainerdetimp">
        {loading && (
          <div className="orderfabLoadingOverlaydetimp">
            <div className="orderfabSpinnerdetimp">
              <AiOutlineLoading3Quarters />
            </div>
            <div className="orderfabLoadingTextdetimp">Loading data...</div>
          </div>
        )}

        <table className="orderfabTabledetimp">
          <thead>
            <tr>
              <th>#</th>
              <th>Mark No</th>
              <th>Item No</th>
              <th>Section</th>
              <th>Length</th>
              <th>Length(mm)</th>
              <th>Qty</th>
              <th>Unit</th>
              <th>Unit(mm)</th>
              <th>Total Wt</th>
              <th>Total Wt(mm)</th>
              <th>Qty Reqd</th>
              <th>Erec Mkd Wt</th>
              <th>Erec Mkd Wt(mm)</th>
              <th>Remark</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((row, idx) => (
                <tr
                  key={row.id || idx}
                  className={showingLatestOnly ? "highlighted-row" : ""}
                  style={showingLatestOnly ? { backgroundColor: "#f8f9fa" } : {}}
                >
                  <td>
                    <div className="orderfabOrderIcondetimp">
                      <IoMdOpen />
                    </div>
                  </td>
                  <td className="orderfabErectionMkddetimp">{row.erectionMkd}</td>
                  <td>{row.itemNo}</td>
                  <td>{row.section}</td>
                  <td>{row.length}</td>
                  <td>{formatUomForDisplay(row.lengthUom)}</td>
                  <td>{row.quantity}</td>
                  <td>{row.unitPrice}</td>
                  <td>{formatUomForDisplay(row.unitPriceUom)}</td>
                  <td>{row.totalQuantity}</td>
                  <td>{formatUomForDisplay(row.totalQuantityUom)}</td>
                  <td>{row.repeatedQty}</td>
                  <td>{row.quantity && row.unitPrice ? (row.quantity * row.unitPrice).toFixed(2) : ""}</td>
                  <td>{formatUomForDisplay(row.totalQuantityUom)}</td>
                  <td>
                    <span className={`orderfabRemarkBadgedetimp ${getRemarkStyle(row.remark)}`}>
                      {row.remark || "N/A"}
                    </span>
                  </td>
                  <td>
                    <span className={getStatusStyle(row.status)}>{row.status || "billing"}</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr className="orderfabEmptyRowdetimp">
                <td colSpan={16}>
                  <div className="orderfabNoDatadetimp">
                    <div className="orderfabNoDataMessagedetimp">
                      {showingLatestOnly ? "No latest stored billing records found." : "No billing records found."}
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {filteredRows.length > 0 && (
        <div className="orderfabPaginationdetimp">
          <div className="orderfabPaginationInfodetimp">
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredRows.length)} of {filteredRows.length}{" "}
            entries
            {showingLatestOnly && (
              <span style={{ color: "#007bff", marginLeft: "10px" }}>(Latest stored records only)</span>
            )}
          </div>
          <div className="orderfabPaginationControlsdetimp">
            <button
              className="orderfabPaginationButtondetimp"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              First
            </button>
            <button
              className="orderfabPaginationButtondetimp"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <div className="orderfabPaginationPagesdetimp">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i
                if (pageNum <= totalPages) {
                  return (
                    <button
                      key={pageNum}
                      className={`orderfabPaginationPagedetimp ${currentPage === pageNum ? "active" : ""}`}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  )
                }
                return null
              })}
            </div>
            <button
              className="orderfabPaginationButtondetimp"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
            <button
              className="orderfabPaginationButtondetimp"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              Last
            </button>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  )
}

export default BillingTable;
