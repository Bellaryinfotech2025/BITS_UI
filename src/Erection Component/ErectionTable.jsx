import { useState, useEffect } from "react"
import axios from "axios"
import { IoMdOpen } from "react-icons/io"
import { FiEdit2, FiTrash2, FiSearch, FiRefreshCw } from "react-icons/fi"
import { AiOutlineLoading3Quarters } from "react-icons/ai"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import "../ErectionDesign Component/ErectionTable.css"
import "../ErectionDesign Component/Movepopup.css"
import { MdOutlineDriveFileMove } from "react-icons/md"
// --- MoveToAlignmentPopup component ---
const MoveToAlignmentPopup = ({ open, onClose, markNoOptions, onSubmit, loading }) => {
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
    <div className="moveToAlignmentModalOverlay">
      <div className="moveToAlignmentModal">
        <div className="moveToAlignmentHeader">
          <h3>Move to Alignment</h3>
          <button className="moveToAlignmentClose" onClick={onClose}>
            &times;
          </button>
        </div>
        <form onSubmit={handleSubmit} className="moveToAlignmentForm">
          <label>Select Mark No(s):</label>
          <select
            multiple
            value={selectedMkds}
            onChange={handleChange}
            className="moveToAlignmentSelect"
            required
            style={{
              minHeight: "200px",
              width: "100%",
              padding: "8px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          >
            {markNoOptions.map((markNo, idx) => (
              <option key={markNo + idx} value={markNo}>
                {markNo}
              </option>
            ))}
          </select>
          <div className="moveToAlignmentActions" style={{ marginTop: "15px", display: "flex", gap: "10px" }}>
            <button
              type="submit"
              disabled={loading || selectedMkds.length === 0}
              style={{
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "4px",
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Moving..." : "Move"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="moveToAlignmentCancel"
              style={{
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                padding: "10px 20px",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
// --- End MoveToAlignmentPopup ---

const API_ERECTION_URL = "http://195.35.45.56:5522/api/v3.0/erection"
const API_ALIGNMENT_URL = "http://195.35.45.56:5522/api/v3.0/alignment"

const ErectionTable = () => {
  const [fabricationDetails, setFabricationDetails] = useState([])
  const [loading, setLoading] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentDetail, setCurrentDetail] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [selectedMarkNo, setSelectedMarkNo] = useState("")
  const [selectedLineNo, setSelectedLineNo] = useState("")

  // Move to Alignment
  const [moveToAlignmentOpen, setMoveToAlignmentOpen] = useState(false)
  const [moveLoading, setMoveLoading] = useState(false)

  const markNoOptions = Array.from(new Set(fabricationDetails.map((d) => d.erectionMkd).filter(Boolean)))
  const lineNoOptions = Array.from(new Set(fabricationDetails.map((d) => d.section).filter(Boolean)))

  const formatUomForDisplay = (uom) => {
    if (!uom) return ""
    return uom.toLowerCase()
  }

  const fetchErectionData = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_ERECTION_URL}/stored-records`)
      if (response.data && Array.isArray(response.data)) {
        const sortedData = response.data.sort((a, b) => (b.id || 0) - (a.id || 0))
        setFabricationDetails(sortedData)
        if (sortedData.length > 0) {
          toast.success(`Loaded ${sortedData.length} erection records`, {
            position: "top-right",
            autoClose: 3000,
          })
        } else {
          toast.info("No erection records found", {
            position: "top-right",
            autoClose: 3000,
          })
        }
      } else {
        setFabricationDetails([])
        toast.info("No erection records found", {
          position: "top-right",
          autoClose: 3000,
        })
      }
    } catch (error) {
      console.error("Error fetching erection data:", error)
      toast.error("Failed to fetch erection data", {
        position: "top-right",
        autoClose: 3000,
      })
      setFabricationDetails([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchErectionData()
    window.refreshErectionTable = fetchErectionData
    return () => {
      delete window.refreshErectionTable
    }
  }, [])

  const handleRefresh = () => {
    setFabricationDetails([])
    setSearchQuery("")
    setSearchInput("")
    setSelectedMarkNo("")
    setSelectedLineNo("")
    setCurrentPage(1)
    fetchErectionData()
    toast.info("Erection table refreshed", {
      position: "top-right",
      autoClose: 2000,
    })
  }

  const handleEdit = (detail) => {
    setCurrentDetail({ ...detail })
    setIsEditDialogOpen(true)
  }

  const handleDelete = (detail) => {
    setCurrentDetail(detail)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = async () => {
    if (!currentDetail) return
    setLoading(true)
    try {
      await axios.delete(`${API_ERECTION_URL}/records/${currentDetail.id}`)
      setFabricationDetails(fabricationDetails.filter((detail) => detail.id !== currentDetail.id))
      toast.success("Erection detail deleted successfully", {
        position: "top-right",
        autoClose: 3000,
      })
    } catch (error) {
      console.error("Error deleting erection detail:", error)
      toast.error("Failed to delete erection detail", {
        position: "top-right",
        autoClose: 3000,
      })
    } finally {
      setIsDeleteDialogOpen(false)
      setCurrentDetail(null)
      setLoading(false)
    }
  }

  const saveEditedDetail = async () => {
    if (!currentDetail) return
    setLoading(true)
    try {
      const response = await axios.put(`${API_ERECTION_URL}/records/${currentDetail.id}`, currentDetail)
      setFabricationDetails(
        fabricationDetails.map((detail) => (detail.id === currentDetail.id ? response.data : detail)),
      )
      toast.success("Erection detail updated successfully", {
        position: "top-right",
        autoClose: 3000,
      })
    } catch (error) {
      console.error("Error updating erection detail:", error)
      toast.error("Failed to update erection detail", {
        position: "top-right",
        autoClose: 3000,
      })
    } finally {
      setIsEditDialogOpen(false)
      setCurrentDetail(null)
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    if (!currentDetail) return
    const { name, value } = e.target
    if (["length", "quantity", "unitPrice", "totalQuantity", "repeatedQty"].includes(name)) {
      setCurrentDetail({
        ...currentDetail,
        [name]: value === "" ? "" : Number.parseFloat(value),
      })
    } else {
      setCurrentDetail({
        ...currentDetail,
        [name]: value,
      })
    }
  }

  const filteredDetails = fabricationDetails.filter((detail) => {
    let match = true
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      match =
        (detail.erectionMkd && detail.erectionMkd.toLowerCase().includes(query)) ||
        (detail.itemNo && detail.itemNo.toLowerCase().includes(query)) ||
        (detail.section && detail.section.toLowerCase().includes(query)) ||
        (detail.remark && detail.remark.toLowerCase().includes(query))
    }
    if (selectedMarkNo) {
      match = match && detail.erectionMkd === selectedMarkNo
    }
    if (selectedLineNo) {
      match = match && detail.section === selectedLineNo
    }
    return match
  })

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredDetails.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredDetails.length / itemsPerPage)

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

  const getStatusStyle = (status) => {
    if (!status) return "orderfabStatusBadgedetimp"
    const lowerStatus = status.toLowerCase()
    if (lowerStatus.includes("erection")) {
      return "orderfabStatusBadgedetimp erection-status"
    }
    return "orderfabStatusBadgedetimp"
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setSearchQuery(searchInput)
    setCurrentPage(1)
  }

  // --- Move to Alignment logic ---
  const handleMoveToAlignment = async (selectedMkds) => {
    setMoveLoading(true)
    try {
      console.log("Moving selected mkds to alignment:", selectedMkds)

      // Call the alignment API to store selected erection mkds
      const response = await axios.post(`${API_ALIGNMENT_URL}/store`, {
        erectionMkds: selectedMkds,
      })

      console.log("Move to alignment response:", response.data)

      toast.success(`Successfully moved ${selectedMkds.length} Mark No(s) to Alignment!`, {
        position: "top-right",
        autoClose: 3000,
      })

      setMoveToAlignmentOpen(false)

      // Refresh erection data to reflect any status changes
      fetchErectionData()

      // Notify alignment table to refresh and show only the moved records
      if (window.refreshAlignmentTable) {
        window.refreshAlignmentTable(selectedMkds)
      }
    } catch (error) {
      console.error("Error moving to alignment:", error)
      toast.error("Failed to move to Alignment", {
        position: "top-right",
        autoClose: 3000,
      })
    } finally {
      setMoveLoading(false)
    }
  }
  // ---

  return (
    <div className="orderfabContainerdetimp">
      <div className="orderfabHeaderdetimp">
        <div className="orderfabHeaderTitledetimp">
          <h3>Erection Details</h3>
        </div>
        <div className="orderfabHeaderActionsdetimp">
          <button className="orderfabRefreshButtondetimp" onClick={handleRefresh}>
            <FiRefreshCw />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div className="orderfabSearchSectiondetimp">
        <form className="orderfabSearchControlsdetimp" onSubmit={handleSearch}>
          <div className="orderfabSearchInputWrapperdetimp">
            <div className="orderfabSearchInputContainerdetimp">
              <FiSearch className="orderfabSearchIcondetimp" />
              <input
                type="text"
                placeholder="Search by Mark No..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
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
            <button
            type="button"
            className="orderfabMoveToAlignmentButton"
            style={{
              marginLeft: 12,
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
            onClick={() => setMoveToAlignmentOpen(true)}
            disabled={markNoOptions.length === 0}
          >
          <MdOutlineDriveFileMove/>
            Move to Alignment
          </button>
          </div>
          {/* <div className="orderfabDropdownsdetimp">
            <select
              className="orderfabDropdowndetimp"
              value={selectedMarkNo}
              onChange={(e) => {
                setSelectedMarkNo(e.target.value)
                setCurrentPage(1)
              }}
            >
              <option value="">All Mark No</option>
              {markNoOptions.map((mark, idx) => (
                <option key={mark + idx} value={mark}>
                  {mark}
                </option>
              ))}
            </select>
          </div> */}
           
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
              <th>Erection Mkd</th>
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
              <th>Remarks</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((detail, index) => (
                <tr key={`${detail.id}-${index}`}>
                  <td>
                    <div className="orderfabOrderIcondetimp">
                      <IoMdOpen />
                    </div>
                  </td>
                  <td className="orderfabErectionMkddetimp">{detail.erectionMkd}</td>
                  <td>{detail.itemNo}</td>
                  <td>{detail.section}</td>
                  <td>{detail.length}</td>
                  <td>{formatUomForDisplay(detail.lengthUom)}</td>
                  <td>{detail.quantity}</td>
                  <td>{detail.unitPrice}</td>
                  <td>{formatUomForDisplay(detail.unitPriceUom)}</td>
                  <td>{detail.totalQuantity}</td>
                  <td>{formatUomForDisplay(detail.totalQuantityUom)}</td>
                  <td>{detail.repeatedQty}</td>
                  <td>{detail.quantity && detail.unitPrice ? (detail.quantity * detail.unitPrice).toFixed(2) : ""}</td>
                  <td>{formatUomForDisplay(detail.totalQuantityUom)}</td>
                  <td>
                    <span className={`orderfabRemarkBadgedetimp ${getRemarkStyle(detail.remark)}`}>
                      {detail.remark || "N/A"}
                    </span>
                  </td>
                  <td>
                    <span className={getStatusStyle(detail.status)}>{detail.status || "erection"}</span>
                  </td>
                  <td>
                    <div className="orderfabRowActionsdetimp">
                      <button
                        className="orderfabActionButtondetimp orderfabEditButtondetimp"
                        onClick={() => handleEdit(detail)}
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        className="orderfabActionButtondetimp orderfabDeleteButtondetimp"
                        onClick={() => handleDelete(detail)}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr className="orderfabEmptyRowdetimp">
                <td colSpan={17}>
                  <div className="orderfabNoDatadetimp">
                    <div className="orderfabNoDataMessagedetimp">No erection records found.</div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {filteredDetails.length > 0 && (
        <div className="orderfabPaginationdetimp">
          <div className="orderfabPaginationInfodetimp">
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredDetails.length)} of{" "}
            {filteredDetails.length} entries
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

      <MoveToAlignmentPopup
        open={moveToAlignmentOpen}
        onClose={() => setMoveToAlignmentOpen(false)}
        markNoOptions={markNoOptions}
        onSubmit={handleMoveToAlignment}
        loading={moveLoading}
      />

      {/* Edit Dialog */}
      {isEditDialogOpen && (
        <div className="orderfabModalOverlaydetimp">
          <div className="orderfabModalContainerdetimp">
            <div className="orderfabModalHeaderdetimp">
              <h3>Edit Erection Detail</h3>
              <button className="orderfabCloseButtondetimp" onClick={() => setIsEditDialogOpen(false)}>
                &times;
              </button>
            </div>
            <div className="orderfabModalBodydetimp">
              {currentDetail && (
                <div className="orderfabEditFormdetimp">
                  <div className="orderfabFormRowdetimp">
                    <div className="orderfabFormGroupdetimp">
                      <label>Mark No</label>
                      <input
                        type="text"
                        name="erectionMkd"
                        value={currentDetail.erectionMkd || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="orderfabFormGroupdetimp">
                      <label>Item No</label>
                      <input
                        type="text"
                        name="itemNo"
                        value={currentDetail.itemNo || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="orderfabFormRowdetimp">
                    <div className="orderfabFormGroupdetimp">
                      <label>Section</label>
                      <input
                        type="text"
                        name="section"
                        value={currentDetail.section || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="orderfabFormGroupdetimp">
                      <label>Length</label>
                      <input
                        type="number"
                        name="length"
                        value={currentDetail.length || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="orderfabFormRowdetimp">
                    <div className="orderfabFormGroupdetimp">
                      <label>Quantity</label>
                      <input
                        type="number"
                        name="quantity"
                        value={currentDetail.quantity || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="orderfabFormGroupdetimp">
                      <label>Unit Price</label>
                      <input
                        type="number"
                        name="unitPrice"
                        value={currentDetail.unitPrice || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="orderfabFormRowdetimp">
                    <div className="orderfabFormGroupdetimp">
                      <label>Total Quantity</label>
                      <input
                        type="number"
                        name="totalQuantity"
                        value={currentDetail.totalQuantity || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="orderfabFormGroupdetimp">
                      <label>Repeated Qty</label>
                      <input
                        type="number"
                        name="repeatedQty"
                        value={currentDetail.repeatedQty || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="orderfabFormRowdetimp">
                    <div className="orderfabFormGroupdetimp">
                      <label>Remarks</label>
                      <select name="remark" value={currentDetail.remark || ""} onChange={handleInputChange}>
                        <option value="Completed">Completed</option>
                        <option value="Not Completed">Not Completed</option>
                        <option value="In Progress">In Progress</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="orderfabModalFooterdetimp">
              <button className="orderfabCancelButtondetimp" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </button>
              <button className="orderfabSaveButtondetimp" onClick={saveEditedDetail} disabled={loading}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {isDeleteDialogOpen && (
        <div className="orderfabModalOverlaydetimp">
          <div className="orderfabModalContainerdetimp">
            <div className="orderfabModalHeaderdetimp">
              <h3>Confirm Delete</h3>
              <button className="orderfabCloseButtondetimp" onClick={() => setIsDeleteDialogOpen(false)}>
                &times;
              </button>
            </div>
            <div className="orderfabModalBodydetimp">
              <p>Are you sure you want to delete this erection detail?</p>
              {currentDetail && (
                <div className="orderfabDeleteDetailsdetimp">
                  <p>
                    <strong>Mark No:</strong> {currentDetail.erectionMkd}
                  </p>
                  <p>
                    <strong>Item No:</strong> {currentDetail.itemNo}
                  </p>
                </div>
              )}
              <p className="orderfabDeleteWarningdetimp">This action cannot be undone.</p>
            </div>
            <div className="orderfabModalFooterdetimp">
              <button className="orderfabCancelButtondetimp" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </button>
              <button className="orderfabDeleteButtondetimp" onClick={confirmDelete} disabled={loading}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  )
}

export default ErectionTable;
