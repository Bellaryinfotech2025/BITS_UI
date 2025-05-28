import { useState, useEffect } from "react"
import axios from "axios"
import { IoMdOpen } from "react-icons/io"
import { FiRefreshCw, FiSearch, FiX } from "react-icons/fi"
import { AiOutlineLoading3Quarters } from "react-icons/ai"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import "../AligmentDesign Component/AlignmentDesign.css"
import "../AligmentDesign Component/MoveAlign.css"
import { MdOutlineDriveFileMove } from "react-icons/md"

const API_ALIGNMENT_URL = "http://195.35.45.56:5522/api/v3.0/alignment"
const API_BILLING_URL = "http://195.35.45.56:5522/api/v3.0/billing"

// Move to Billing Popup Component
const MoveToBillingPopup = ({ open, onClose, markNoOptions, onSubmit, loading }) => {
  const [selectedMkds, setSelectedMkds] = useState([])

  useEffect(() => {
    if (!open) setSelectedMkds([])
  }, [open])

  const handleChange = (e) => {
    const options = Array.from(e.target.selectedOptions)
    setSelectedMkds(options.map((opt) => opt.value))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (selectedMkds.length === 0) {
      toast.warning("Please select at least one Mark No", {
        position: "top-right",
        autoClose: 2000,
      })
      return
    }
    onSubmit(selectedMkds)
  }

  if (!open) return null

  return (
    <div className="moveToBillingModalOverlay">
      <div className="moveToBillingModal">
        <div className="moveToBillingHeader">
          <h3>Move to Billing</h3>
          <button className="moveToBillingClose" onClick={onClose}>
            <FiX />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="moveToBillingForm">
          <label>Select Mark No(s) from Alignment Table:</label>
          <div style={{ marginBottom: "10px", fontSize: "12px", color: "#666" }}>
            Available Mark Numbers: {markNoOptions.length} total
          </div>
          <select multiple value={selectedMkds} onChange={handleChange} className="moveToBillingSelect" required>
            {markNoOptions.length > 0 ? (
              markNoOptions.map((markNo, idx) => (
                <option key={markNo + idx} value={markNo}>
                  {markNo}
                </option>
              ))
            ) : (
              <option disabled>No Mark Numbers available</option>
            )}
          </select>
          <div className="moveToBillingHelperText">
            Hold Ctrl (Windows) or Cmd (Mac) to select multiple items. Selected: {selectedMkds.length} of{" "}
            {markNoOptions.length}
          </div>
          <div className="moveToBillingActions">
            <button type="button" onClick={onClose} className="moveToBillingCancel">
              Cancel
            </button>
            <button type="submit" disabled={loading || selectedMkds.length === 0 || markNoOptions.length === 0}>
              {loading ? (
                <div className="moveToBillingLoading">
                  <AiOutlineLoading3Quarters />
                  Moving...
                </div>
              ) : (
                `Save (${selectedMkds.length} selected)`
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const AlignmentTable = () => {
  const [alignmentRows, setAlignmentRows] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [showingLatestOnly, setShowingLatestOnly] = useState(true)

  // Move to Billing states
  const [moveToBillingOpen, setMoveToBillingOpen] = useState(false)
  const [moveLoading, setMoveLoading] = useState(false)
  const [allErectionMkds, setAllErectionMkds] = useState([]) // All erection mkds from database
  const [fetchingMkds, setFetchingMkds] = useState(false)

  // Set up global function for ErectionTable to call
  useEffect(() => {
    window.refreshAlignmentTable = (movedMkds) => {
      console.log("Alignment table received moved mkds:", movedMkds)
      fetchLatestAlignmentData()
      setCurrentPage(1)
      setShowingLatestOnly(true)

      toast.success(`Displaying ${movedMkds.length} newly moved records`, {
        position: "top-right",
        autoClose: 3000,
      })
    }

    return () => {
      delete window.refreshAlignmentTable
    }
  }, [])

  // Fetch ALL erection mkds from alignment table for popup
  const fetchAllErectionMkds = async () => {
    try {
      setFetchingMkds(true)
      console.log("Frontend: Fetching all erection mkds from alignment table...")

      const response = await axios.get(`${API_ALIGNMENT_URL}/erection-mkds`)
      console.log("Frontend: API response:", response)
      console.log("Frontend: Response data:", response.data)

      if (response.data && Array.isArray(response.data)) {
        const sortedMkds = response.data.filter((mkd) => mkd && mkd.trim() !== "").sort()
        setAllErectionMkds(sortedMkds)
        console.log(`Frontend: Successfully set ${sortedMkds.length} erection mkds:`, sortedMkds)

        if (sortedMkds.length === 0) {
          toast.warning("No erection mark numbers found in alignment table", {
            position: "top-right",
            autoClose: 3000,
          })
        } else {
          toast.success(`Found ${sortedMkds.length} erection mark numbers`, {
            position: "top-right",
            autoClose: 2000,
          })
        }
      } else {
        console.log("Frontend: Invalid response format:", response.data)
        setAllErectionMkds([])
        toast.error("Invalid response format from server", {
          position: "top-right",
          autoClose: 3000,
        })
      }
    } catch (error) {
      console.error("Frontend: Error fetching all erection mkds:", error)
      console.error("Frontend: Error details:", error.response?.data)

      // Try to get erection mkds from current alignment data as fallback
      const fallbackMkds = alignmentRows
        .map((row) => row.erectionMkd)
        .filter((mkd) => mkd && mkd.trim() !== "")
        .filter((mkd, index, arr) => arr.indexOf(mkd) === index) // Remove duplicates
        .sort()

      if (fallbackMkds.length > 0) {
        setAllErectionMkds(fallbackMkds)
        toast.warning(`Using ${fallbackMkds.length} mark numbers from current view`, {
          position: "top-right",
          autoClose: 3000,
        })
      } else {
        setAllErectionMkds([])
        toast.error("Failed to fetch erection mark numbers", {
          position: "top-right",
          autoClose: 3000,
        })
      }
    } finally {
      setFetchingMkds(false)
    }
  }

  // Fetch only the latest stored alignment records
  const fetchLatestAlignmentData = async () => {
    try {
      setLoading(true)
      console.log("Frontend: Fetching latest alignment records...")

      const response = await axios.get(`${API_ALIGNMENT_URL}/latest`)

      if (response.data && Array.isArray(response.data)) {
        const sortedData = response.data.sort((a, b) => (b.id || 0) - (a.id || 0))
        setAlignmentRows(sortedData)
        setShowingLatestOnly(true)

        if (sortedData.length > 0) {
          toast.success(`Loaded ${sortedData.length} latest alignment records`, {
            position: "top-right",
            autoClose: 2000,
          })
        } else {
          toast.info("No latest alignment records found", {
            position: "top-right",
            autoClose: 2000,
          })
        }
      } else {
        setAlignmentRows([])
        toast.info("No latest alignment records found", {
          position: "top-right",
          autoClose: 2000,
        })
      }
    } catch (error) {
      console.error("Frontend: Error fetching latest alignment data:", error)
      toast.error("Failed to fetch latest alignment data", {
        position: "top-right",
        autoClose: 2000,
      })
      setAlignmentRows([])
    } finally {
      setLoading(false)
    }
  }

  // Fetch all alignment records
  const fetchAllAlignmentData = async () => {
    try {
      setLoading(true)
      console.log("Frontend: Fetching all alignment records...")

      const response = await axios.get(API_ALIGNMENT_URL)

      if (response.data && Array.isArray(response.data)) {
        const sortedData = response.data.sort((a, b) => (b.id || 0) - (a.id || 0))
        setAlignmentRows(sortedData)
        setShowingLatestOnly(false)

        toast.success(`Loaded ${sortedData.length} alignment records`, {
          position: "top-right",
          autoClose: 2000,
        })
      } else {
        setAlignmentRows([])
        toast.info("No alignment records found", {
          position: "top-right",
          autoClose: 2000,
        })
      }
    } catch (error) {
      console.error("Frontend: Error fetching all alignment data:", error)
      toast.error("Failed to fetch alignment data", {
        position: "top-right",
        autoClose: 2000,
      })
      setAlignmentRows([])
    } finally {
      setLoading(false)
    }
  }

  // Initial load - fetch latest records by default
  useEffect(() => {
    fetchLatestAlignmentData()
  }, [])

  const handleRefresh = () => {
    setAlignmentRows([])
    setSearchQuery("")
    setCurrentPage(1)

    if (showingLatestOnly) {
      fetchLatestAlignmentData()
      toast.info("Latest alignment records refreshed", {
        position: "top-right",
        autoClose: 2000,
      })
    } else {
      fetchAllAlignmentData()
      toast.info("All alignment records refreshed", {
        position: "top-right",
        autoClose: 2000,
      })
    }
  }

  const handleShowAll = () => {
    fetchAllAlignmentData()
  }

  const handleShowLatestOnly = () => {
    fetchLatestAlignmentData()
  }

  // Handle Move to Billing button click - fetch all erection mkds first
  const handleMoveToBillingClick = async () => {
    console.log("Frontend: Move to Billing button clicked")
    await fetchAllErectionMkds() // Fetch all erection mkds from database
    setMoveToBillingOpen(true)
  }

  // Handle Move to Billing
  const handleMoveToBilling = async (selectedMkds) => {
    setMoveLoading(true)
    try {
      console.log("Frontend: Moving selected mkds to billing:", selectedMkds)

      const response = await axios.post(`${API_BILLING_URL}/store`, {
        erectionMkds: selectedMkds,
      })

      console.log("Frontend: Move to billing response:", response.data)

      toast.success(`Successfully moved ${selectedMkds.length} Mark No(s) to Billing!`, {
        position: "top-right",
        autoClose: 3000,
      })

      setMoveToBillingOpen(false)

      // Notify billing table to refresh and show only the moved records
      if (window.refreshBillingTable) {
        window.refreshBillingTable(selectedMkds)
      }
    } catch (error) {
      console.error("Frontend: Error moving to billing:", error)
      toast.error("Failed to move to Billing", {
        position: "top-right",
        autoClose: 3000,
      })
    } finally {
      setMoveLoading(false)
    }
  }

  // Filter rows based on search query only
  const filteredRows = alignmentRows.filter((row) => {
    if (!searchQuery) return true

    const query = searchQuery.toLowerCase()
    return (
      (row.erectionMkd && row.erectionMkd.toLowerCase().includes(query)) ||
      (row.itemNo && row.itemNo.toLowerCase().includes(query)) ||
      (row.section && row.section.toLowerCase().includes(query)) ||
      (row.remark && row.remark.toLowerCase().includes(query))
    )
  })

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredRows.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredRows.length / itemsPerPage)

  const getStatusStyle = (status) => {
    if (!status) return "orderfabStatusBadgedetimp"
    const lowerStatus = status.toLowerCase()
    if (lowerStatus.includes("alignment")) {
      return "orderfabStatusBadgedetimp alignment-status"
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
          <h3>Alignment Table</h3>
          <div
            style={{
              fontSize: "12px",
              color: showingLatestOnly ? "#007bff" : "#6c757d",
              marginTop: "5px",
              fontWeight: "normal",
            }}
          >
            {showingLatestOnly
              ? `Showing ${alignmentRows.length} latest stored records`
              : `Showing all ${alignmentRows.length} records`}
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
             &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
             &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
              &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
               &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
                &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
              {/* Move to Billing Button */}
          <button
            type="button"
            className="orderfabRefreshButtondetimp"
            onClick={handleMoveToBillingClick}
            disabled={fetchingMkds}
            style={{
              marginLeft: "15px",
             backgroundColor: "#2c5282",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
              width: "150px",
              height: "35px",
              fontWeight: "500",
              borderColor: "#2c5282",
               

            }}
          >
            {fetchingMkds ? (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <AiOutlineLoading3Quarters style={{ animation: "spin 1s linear infinite" }} />
                <span>Loading...</span>
              </div>
            ) : (
              <span> 
              <MdOutlineDriveFileMove/>
              Move to Billing
              </span>
            )}
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
              <th>Order #</th>
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
                    <span className={getStatusStyle(row.status)}>{row.status || "alignment"}</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr className="orderfabEmptyRowdetimp">
                <td colSpan={16}>
                  <div className="orderfabNoDatadetimp">
                    <div className="orderfabNoDataMessagedetimp">
                      {showingLatestOnly ? "No latest stored alignment records found." : "No alignment records found."}
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

      {/* Move to Billing Popup */}
      <MoveToBillingPopup
        open={moveToBillingOpen}
        onClose={() => setMoveToBillingOpen(false)}
        markNoOptions={allErectionMkds} // Use ALL erection mkds from database
        onSubmit={handleMoveToBilling}
        loading={moveLoading}
      />

      <ToastContainer />
    </div>
  )
}

export default AlignmentTable;
