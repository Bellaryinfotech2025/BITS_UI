import { useState, useEffect } from "react"
import { IoMdOpen } from "react-icons/io"
import { AiOutlineLoading3Quarters } from "react-icons/ai"
import { MdSave, MdEdit, MdDelete } from "react-icons/md"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import "../ErectionNewComponent/ErectionDatabasesearch.css"

const ErectionDatabasesearch = () => {
  // API Base URL
  const API_BASE_URL = "http://195.35.45.56:5522/api/V2.0"

  // State management
  const [loading, setLoading] = useState(false)
  const [tableData, setTableData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [drawingNumbers, setDrawingNumbers] = useState([])
  const [markNumbers, setMarkNumbers] = useState([])

  // Filter states
  const [selectedDrawingNo, setSelectedDrawingNo] = useState("")
  const [selectedMarkNo, setSelectedMarkNo] = useState("")

  // Move to Alignment popup states
  const [showMoveToAlignmentPopup, setShowMoveToAlignmentPopup] = useState(false)
  const [selectedMarkNosForAlignment, setSelectedMarkNosForAlignment] = useState([])
  const [availableMarkNosForAlignment, setAvailableMarkNosForAlignment] = useState([])

  // Edit states
  const [editingRow, setEditingRow] = useState(null)
  const [editFormData, setEditFormData] = useState({})

  // Fetch all data on component mount
  useEffect(() => {
    fetchAllData()
  }, [])

  // Filter data when filters change
  useEffect(() => {
    filterData()
  }, [selectedDrawingNo, selectedMarkNo, tableData])

  // Fetch unique erection entries and populate dropdowns
  const fetchAllData = async () => {
    try {
      setLoading(true)

      // Use the unique entries endpoint for erection
      const response = await fetch(`${API_BASE_URL}/getUniqueErectionDrawingEntries/details`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Response is not JSON")
      }

      const data = await response.json()

      console.log("Fetched unique erection data:", data)

      // Set table data
      setTableData(data)
      setFilteredData(data)

      // Extract unique drawing numbers and mark numbers for dropdowns
      const uniqueDrawingNos = [...new Set(data.map((item) => item.drawingNo).filter(Boolean))]
      const uniqueMarkNos = [...new Set(data.map((item) => item.markNo).filter(Boolean))]

      setDrawingNumbers(uniqueDrawingNos.sort())
      setMarkNumbers(uniqueMarkNos.sort())
      setAvailableMarkNosForAlignment(uniqueMarkNos.sort())

      console.log("Drawing Numbers:", uniqueDrawingNos)
      console.log("Mark Numbers:", uniqueMarkNos)
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error(`Error fetching data: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Filter data based on selected criteria
  const filterData = () => {
    let filtered = tableData

    if (selectedDrawingNo) {
      filtered = filtered.filter((item) => item.drawingNo === selectedDrawingNo)
    }

    if (selectedMarkNo) {
      filtered = filtered.filter((item) => item.markNo === selectedMarkNo)
    }

    setFilteredData(filtered)
  }

  // Handle search button click
  const handleSearch = () => {
    filterData()
    toast.info(`Found ${filteredData.length} records`)
  }

  // Handle edit button click
  const handleEdit = (row) => {
    setEditingRow(row.lineId)
    setEditFormData({
      drawingNo: row.drawingNo || "",
      markNo: row.markNo || "",
      markedQty: row.markedQty || "",
      sessionCode: row.sessionCode || "",
      sessionName: row.sessionName || "",
      width: row.width || "",
      length: row.length || "",
      itemQty: row.itemQty || "",
      itemWeight: row.itemWeight || "",
      // Add attribute fields for editing
      attribute1V: row.attribute1V || "",
      attribute2V: row.attribute2V || "",
      attribute3V: row.attribute3V || "",
      attribute4V: row.attribute4V || "",
      attribute5V: row.attribute5V || "",
      attribute1N: row.attribute1N || "",
    })
  }

  // Handle save edit
  const handleSaveEdit = async () => {
    try {
      setLoading(true)

      // Prepare the update data with all fields including attributes
      const updateData = {
        drawingNo: editFormData.drawingNo,
        markNo: editFormData.markNo,
        markedQty: Number.parseFloat(editFormData.markedQty) || 0,
        sessionCode: editFormData.sessionCode,
        sessionName: editFormData.sessionName,
        width: Number.parseFloat(editFormData.width) || 0,
        length: Number.parseFloat(editFormData.length) || 0,
        itemQty: Number.parseFloat(editFormData.itemQty) || 0,
        itemWeight: Number.parseFloat(editFormData.itemWeight) || 0,
        lastUpdatedBy: "system",
        status: "erection",
        // Include attribute fields
        attribute1V: editFormData.attribute1V || "",
        attribute2V: editFormData.attribute2V || "",
        attribute3V: editFormData.attribute3V || "",
        attribute4V: editFormData.attribute4V || "",
        attribute5V: editFormData.attribute5V || "",
        attribute1N: Number.parseFloat(editFormData.attribute1N) || 0,
      }

      console.log("Sending update data:", updateData)

      const response = await fetch(`${API_BASE_URL}/updateErectionDrawingEntry/details?lineId=${editingRow}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        toast.success("Record updated successfully!")
        setEditingRow(null)
        setEditFormData({})
        fetchAllData() // Refresh data
      } else {
        const errorText = await response.text()
        console.error("Update failed:", errorText)
        toast.error(`Failed to update record: ${errorText}`)
      }
    } catch (error) {
      console.error("Error updating record:", error)
      toast.error("Error updating record: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingRow(null)
    setEditFormData({})
  }

  // Handle delete
  const handleDelete = async (lineId) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        setLoading(true)

        const response = await fetch(`${API_BASE_URL}/deleteErectionDrawingEntry/details?lineId=${lineId}`, {
          method: "DELETE",
        })

        if (response.ok) {
          toast.success("Record deleted successfully!")
          fetchAllData() // Refresh data
        } else {
          toast.error("Failed to delete record")
        }
      } catch (error) {
        console.error("Error deleting record:", error)
        toast.error("Error deleting record")
      } finally {
        setLoading(false)
      }
    }
  }

  // Handle Move to Alignment button click
  const handleMoveToAlignment = () => {
    setShowMoveToAlignmentPopup(true)
  }

  // Handle mark number selection in popup
  const handleMarkNoSelection = (markNo) => {
    setSelectedMarkNosForAlignment((prev) => {
      if (prev.includes(markNo)) {
        return prev.filter((m) => m !== markNo)
      } else {
        return [...prev, markNo]
      }
    })
  }

  // Handle save to alignment
  const handleSaveToAlignment = async () => {
    if (selectedMarkNosForAlignment.length === 0) {
      toast.warning("Please select at least one Mark No.")
      return
    }

    try {
      setLoading(true)

      // Get all entries for selected mark numbers - only one entry per mark number
      const entriesToMove = []

      // For each selected mark number, find the first entry with that mark number
      for (const markNo of selectedMarkNosForAlignment) {
        const entry = tableData.find((item) => item.markNo === markNo)
        if (entry) {
          entriesToMove.push(entry)
        }
      }

      if (entriesToMove.length === 0) {
        toast.error("No entries found for selected Mark Numbers")
        return
      }

      // Create alignment entries with proper data format
      const alignmentEntries = entriesToMove.map((item) => ({
        // Generate a unique lineId for each alignment entry
        lineId: "A" + Math.floor(Math.random() * 1000000),
        drawingNo: item.drawingNo || "",
        markNo: item.markNo || "",
        markedQty: item.markedQty || 1,
        totalMarkedWgt: item.totalMarkedWgt || 0,
        sessionCode: item.sessionCode || "",
        sessionName: item.sessionName || "",
        sessionWeight: item.sessionWeight || 0,
        width: item.width || 0,
        length: item.length || 0,
        itemQty: item.itemQty || 0,
        itemWeight: item.itemWeight || 0,
        tenantId: item.tenantId || "DEFAULT_TENANT",
        createdBy: "system",
        lastUpdatedBy: "system",
        status: "alignment",
        // Copy attributes
        attribute1V: item.attribute1V || null,
        attribute2V: item.attribute2V || null,
        attribute3V: item.attribute3V || null,
        attribute4V: item.attribute4V || null,
        attribute5V: item.attribute5V || null,
        attribute1N: item.attribute1N || null,
        attribute2N: item.attribute2N || null,
        attribute3N: item.attribute3N || null,
        attribute4N: item.attribute4N || null,
        attribute5N: item.attribute5N || null,
      }))

      console.log("Moving to alignment:", alignmentEntries)

      // Call the alignment API (assuming it exists)
      const response = await fetch(`${API_BASE_URL}/createBulkAlignmentDrawingEntries/details`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(alignmentEntries),
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(
          `${selectedMarkNosForAlignment.length} Mark No(s) moved to Alignment successfully! Created ${result.length} entries.`,
        )
        setShowMoveToAlignmentPopup(false)
        setSelectedMarkNosForAlignment([])
      } else {
        const errorText = await response.text()
        console.error("Move to alignment failed:", errorText)
        toast.error(`Failed to move to alignment: ${errorText}`)
      }
    } catch (error) {
      console.error("Error moving to alignment:", error)
      toast.error("Error moving to Alignment: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  // Handle input change in edit form
  const handleEditInputChange = (field, value) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <div className="erect-container-elephant">
      {/* Header */}
      <div className="erect-header-giraffe">
        <div className="erect-title-lion">
          <h3>Search for Erection Details</h3>
        </div>
        <button className="erect-button-kangaroo erect-move-to-alignment-btn" onClick={handleMoveToAlignment}>
          <span>Completed</span>
        </button>
      </div>

      {/* Filter Section */}
      <div className="erect-filter-section-zebra">
        <div className="erect-filter-container-tiger">
          <div className="erect-filter-row-panda">
            {/* Drawing No Dropdown */}
            <select
              value={selectedDrawingNo}
              onChange={(e) => setSelectedDrawingNo(e.target.value)}
              className="erect-dropdown-leopard"
            >
              <option value="">Select Drawing No</option>
              {drawingNumbers.map((drawingNo, index) => (
                <option key={`drawing_${index}`} value={drawingNo}>
                  {drawingNo}
                </option>
              ))}
            </select>

            {/* Mark No Dropdown */}
            <select
              value={selectedMarkNo}
              onChange={(e) => setSelectedMarkNo(e.target.value)}
              className="erect-dropdown-leopard"
            >
              <option value="">Select Mark No</option>
              {markNumbers.map((markNo, index) => (
                <option key={`mark_${index}`} value={markNo}>
                  {markNo}
                </option>
              ))}
            </select>

            {/* Search Button */}
            <button className="erect-search-button-cheetah" onClick={handleSearch} disabled={loading}>
              <span>Search</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="erect-table-container-rhino">
        {loading && (
          <div className="erect-loading-overlay-hippo">
            <div className="erect-loading-spinner-gazelle">
              <AiOutlineLoading3Quarters />
            </div>
            <div className="erect-loading-text-antelope">Loading...</div>
          </div>
        )}

        <div className="erect-table-wrapper-buffalo">
          <table className="erect-table-wildebeest">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Work Order</th>
                <th>Plant Location</th>
                <th>Department</th>
                <th>Work Location</th>
                <th>Line Number</th>
                <th>Drawing No</th>
                <th>Mark No</th>
                <th>Mark Qty</th>
                <th>Item No</th>
                <th>Section Code</th>
                <th>Section Name</th>
                <th>Section Weight</th>
                <th>Width</th>
                <th>Length</th>
                <th>Item Qty</th>
                <th>Item Weight</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, index) => (
                <tr key={`row_${index}`} className="erect-table-row-impala">
                  <td>
                    <div className="erect-order-icon-kudu">
                      <IoMdOpen />
                    </div>
                  </td>
                  <td>{row.attribute1V || row.workOrder || "-"}</td>
                  <td>{row.attribute2V || row.plantLocation || "-"}</td>
                  <td>{row.attribute3V || row.department || "-"}</td>
                  <td>{row.attribute4V || row.workLocation || "-"}</td>
                  <td>{row.attribute5V || row.lineId || "-"}</td>
                  <td>
                    {editingRow === row.lineId ? (
                      <input
                        type="text"
                        value={editFormData.drawingNo}
                        onChange={(e) => handleEditInputChange("drawingNo", e.target.value)}
                        className="erect-edit-input-gemsbok"
                      />
                    ) : (
                      row.drawingNo || "-"
                    )}
                  </td>
                  <td>
                    {editingRow === row.lineId ? (
                      <input
                        type="text"
                        value={editFormData.markNo}
                        onChange={(e) => handleEditInputChange("markNo", e.target.value)}
                        className="erect-edit-input-gemsbok"
                      />
                    ) : (
                      row.markNo || "-"
                    )}
                  </td>
                  <td>
                    {editingRow === row.lineId ? (
                      <input
                        type="number"
                        value={editFormData.markedQty}
                        onChange={(e) => handleEditInputChange("markedQty", e.target.value)}
                        className="erect-edit-input-gemsbok"
                      />
                    ) : (
                      row.markedQty || "-"
                    )}
                  </td>
                  <td>{row.attribute1N || row.itemNo || "-"}</td>
                  <td>
                    {editingRow === row.lineId ? (
                      <input
                        type="text"
                        value={editFormData.sessionCode}
                        onChange={(e) => handleEditInputChange("sessionCode", e.target.value)}
                        className="erect-edit-input-gemsbok"
                      />
                    ) : (
                      row.sessionCode || "-"
                    )}
                  </td>
                  <td>
                    {editingRow === row.lineId ? (
                      <input
                        type="text"
                        value={editFormData.sessionName}
                        onChange={(e) => handleEditInputChange("sessionName", e.target.value)}
                        className="erect-edit-input-gemsbok"
                      />
                    ) : (
                      row.sessionName || "-"
                    )}
                  </td>
                  <td>{row.sessionWeight || "-"}</td>
                  <td>
                    {editingRow === row.lineId ? (
                      <input
                        type="number"
                        value={editFormData.width}
                        onChange={(e) => handleEditInputChange("width", e.target.value)}
                        className="erect-edit-input-gemsbok"
                      />
                    ) : (
                      row.width || "-"
                    )}
                  </td>
                  <td>
                    {editingRow === row.lineId ? (
                      <input
                        type="number"
                        value={editFormData.length}
                        onChange={(e) => handleEditInputChange("length", e.target.value)}
                        className="erect-edit-input-gemsbok"
                      />
                    ) : (
                      row.length || "-"
                    )}
                  </td>
                  <td>
                    {editingRow === row.lineId ? (
                      <input
                        type="number"
                        value={editFormData.itemQty}
                        onChange={(e) => handleEditInputChange("itemQty", e.target.value)}
                        className="erect-edit-input-gemsbok"
                      />
                    ) : (
                      row.itemQty || "-"
                    )}
                  </td>
                  <td>
                    {editingRow === row.lineId ? (
                      <input
                        type="number"
                        value={editFormData.itemWeight}
                        onChange={(e) => handleEditInputChange("itemWeight", e.target.value)}
                        className="erect-edit-input-gemsbok"
                      />
                    ) : (
                      row.itemWeight || "-"
                    )}
                  </td>
                  <td>
                    <span className="erect-status-badge-oryx">{row.status || "Erection"}</span>
                  </td>
                  <td>
                    <div className="erect-actions-container-springbok">
                      {editingRow === row.lineId ? (
                        <>
                          <button
                            onClick={handleSaveEdit}
                            className="erect-action-button-eland erect-save-button-nyala"
                            title="Save"
                          >
                            <MdSave />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="erect-action-button-eland erect-cancel-button-waterbuck"
                            title="Cancel"
                          >
                            ✕
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(row)}
                            className="erect-action-button-eland erect-edit-button-nyala"
                            title="Modify"
                          >
                            <MdEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(row.lineId)}
                            className="erect-action-button-eland erect-delete-button-waterbuck"
                            title="Delete"
                          >
                            <MdDelete />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && !loading && (
                <tr className="erect-empty-row-hartebeest">
                  <td colSpan="19">
                    <div className="erect-empty-state-gnu">
                      <div className="erect-empty-text-duiker">No records found.</div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Move to Alignment Popup */}
      {showMoveToAlignmentPopup && (
        <div className="erect-popup-overlay-crocodile">
          <div className="erect-popup-container-alligator">
            <div className="erect-popup-header-iguana">
              <h3>Mark No.</h3>
              <button onClick={() => setShowMoveToAlignmentPopup(false)} className="erect-popup-close-lizard">
                ✕
              </button>
            </div>
            <div className="erect-popup-content-snake">
              <div className="erect-multiselect-container-turtle">
                <div className="erect-multiselect-label-tortoise">Select Mark No(s):</div>
                <div className="erect-multiselect-options-chameleon">
                  {availableMarkNosForAlignment.map((markNo, index) => (
                    <label key={`popup_mark_${index}`} className="erect-checkbox-label-gecko">
                      <input
                        type="checkbox"
                        checked={selectedMarkNosForAlignment.includes(markNo)}
                        onChange={() => handleMarkNoSelection(markNo)}
                        className="erect-checkbox-input-salamander"
                      />
                      <span className="erect-checkbox-text-newt">{markNo}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="erect-popup-actions-frog">
              <button
                onClick={() => setShowMoveToAlignmentPopup(false)}
                className="erect-popup-button-toad erect-cancel-button-tadpole"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveToAlignment}
                className="erect-popup-button-toad erect-save-button-bullfrog"
                disabled={loading || selectedMarkNosForAlignment.length === 0}
              >
                {loading ? (
                  <>
                    <AiOutlineLoading3Quarters className="erect-spin-icon-treefrog" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <MdSave />
                    <span>Save</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  )
}

export default ErectionDatabasesearch;
