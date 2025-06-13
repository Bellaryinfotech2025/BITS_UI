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

  // Fetch all erection entries with enhanced data including fabrication stages
  const fetchAllData = async () => {
    try {
      setLoading(true)

      // Use the new enhanced endpoint that includes fabrication stage synchronization
      const response = await fetch(`${API_BASE_URL}/getEnhancedErectionDrawingEntries/details`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Response is not JSON")
      }

      const data = await response.json()

      console.log("Fetched enhanced erection data:", data)
      console.log("Sample row with fabrication stages:", data[0])

      // Set table data
      setTableData(data)
      setFilteredData(data)

      // Fetch distinct drawing numbers and mark numbers for dropdowns
      await fetchDistinctDrawingNumbers()
      await fetchDistinctMarkNumbers()
    } catch (error) {
      console.error("Error fetching enhanced data:", error)
      toast.error(`Error fetching data: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Fetch distinct drawing numbers for dropdown
  const fetchDistinctDrawingNumbers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/getDistinctErectionDrawingEntryDrawingNumbers/details`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const drawingNos = await response.json()
      setDrawingNumbers(drawingNos.sort())
      console.log("Drawing Numbers:", drawingNos)
    } catch (error) {
      console.error("Error fetching drawing numbers:", error)
      toast.error(`Error fetching drawing numbers: ${error.message}`)
    }
  }

  // Fetch distinct mark numbers for dropdown
  const fetchDistinctMarkNumbers = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/getDistinctErectionDrawingEntryMarkNumbers/details`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const markNos = await response.json()
      setMarkNumbers(markNos.sort())
      setAvailableMarkNosForAlignment(markNos.sort())
      console.log("Mark Numbers:", markNos)
    } catch (error) {
      console.error("Error fetching mark numbers:", error)
      toast.error(`Error fetching mark numbers: ${error.message}`)
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
  const handleSearch = async () => {
    try {
      setLoading(true)

      // Build the search URL based on selected filters
      let searchUrl = `${API_BASE_URL}/searchErectionDrawingEntries/details?`

      if (selectedDrawingNo) {
        searchUrl += `drawingNo=${encodeURIComponent(selectedDrawingNo)}&`
      } else {
        searchUrl += `drawingNo=&`
      }

      if (selectedMarkNo) {
        searchUrl += `markNo=${encodeURIComponent(selectedMarkNo)}&`
      } else {
        searchUrl += `markNo=&`
      }

      // Add other parameters as null
      searchUrl += `sessionCode=&tenantId=&status=erection&page=0&size=100`

      const response = await fetch(searchUrl)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const searchResults = await response.json()

      // Update filtered data with search results
      setFilteredData(searchResults.content || [])
      toast.info(`Found ${searchResults.content?.length || 0} records`)
    } catch (error) {
      console.error("Error searching records:", error)
      toast.error(`Error searching records: ${error.message}`)
    } finally {
      setLoading(false)
    }
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
      totalItemWeight: row.totalItemWeight || "", // NEW FIELD
      totalMarkedWgt: row.totalMarkedWgt || "",
      sessionWeight: row.sessionWeight || "",
      // Add new fields for editing
      drawingWeight: row.drawingWeight || "",
      markWeight: row.markWeight || "",
      drawingReceivedDate: row.drawingReceivedDate || "",
      targetDate: row.targetDate || "",
      // Add attribute fields for editing
      attribute1V: row.attribute1V || "",
      attribute2V: row.attribute2V || "",
      attribute3V: row.attribute3V || "",
      attribute4V: row.attribute4V || "",
      attribute5V: row.attribute5V || "",
      attribute1N: row.attribute1N || "",
      attribute2N: row.attribute2N || "",
      attribute3N: row.attribute3N || "",
      attribute4N: row.attribute4N || "",
      attribute5N: row.attribute5N || "",
    })
  }

  // Handle save edit
  const handleSaveEdit = async () => {
    try {
      setLoading(true)

      // Prepare the update data with all fields including attributes and new fields
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
        totalItemWeight: Number.parseFloat(editFormData.totalItemWeight) || 0, // NEW FIELD
        totalMarkedWgt: Number.parseFloat(editFormData.totalMarkedWgt) || 0,
        sessionWeight: Number.parseFloat(editFormData.sessionWeight) || 0,
        lastUpdatedBy: "system",
        status: "erection",
        // Include new fields
        drawingWeight: Number.parseFloat(editFormData.drawingWeight) || null,
        markWeight: Number.parseFloat(editFormData.markWeight) || null,
        drawingReceivedDate: editFormData.drawingReceivedDate || null,
        targetDate: editFormData.targetDate || null,
        // Include attribute fields
        attribute1V: editFormData.attribute1V || "",
        attribute2V: editFormData.attribute2V || "",
        attribute3V: editFormData.attribute3V || "",
        attribute4V: editFormData.attribute4V || "",
        attribute5V: editFormData.attribute5V || "",
        attribute1N: Number.parseFloat(editFormData.attribute1N) || 0,
        attribute2N: Number.parseFloat(editFormData.attribute2N) || 0,
        attribute3N: Number.parseFloat(editFormData.attribute3N) || 0,
        attribute4N: Number.parseFloat(editFormData.attribute4N) || 0,
        attribute5N: Number.parseFloat(editFormData.attribute5N) || 0,
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
        fetchAllData() // Refresh data with enhanced information
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
        totalItemWeight: item.totalItemWeight || 0, // NEW FIELD
        tenantId: item.tenantId || "DEFAULT_TENANT",
        createdBy: "system",
        lastUpdatedBy: "system",
        status: "alignment",
        // Include new enhanced fields - EXACTLY AS REQUESTED
        drawingWeight: item.drawingWeight || null,
        markWeight: item.markWeight || null,
        drawingReceivedDate: item.drawingReceivedDate || null,
        targetDate: item.targetDate || null,
        // Include fabrication stages - EXACTLY AS REQUESTED
        cuttingStage: item.cuttingStage || "N",
        fitUpStage: item.fitUpStage || "N",
        weldingStage: item.weldingStage || "N",
        finishingStage: item.finishingStage || "N",
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

      // Call the alignment API to store in alignment_drawing_entry table
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

        // Optional: You can also delete or update the status of these entries in the erection table
        // if that's part of your workflow
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

  // Helper function to safely display data with proper fallback
  const displayValue = (value, fallback = "-") => {
    if (value === null || value === undefined || value === "") {
      return fallback
    }
    // Handle numeric values including 0
    if (typeof value === "number") {
      return value.toString()
    }
    return value
  }

  // Helper function to format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "-"
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString()
    } catch (error) {
      return dateString
    }
  }

  // Format number for display
  const formatNumber = (value) => {
    if (value === null || value === undefined) return "-"
    return Number.parseFloat(value).toFixed(3)
  }

  // Helper function to render fabrication stage checkbox
  const renderFabricationCheckbox = (stage, label) => {
    const isChecked = stage === "Y"
    return (
      <div className="erect-fab-checkbox-container">
        <input
          type="checkbox"
          checked={isChecked}
          readOnly
          className="erect-fab-checkbox"
          title={`${label}: ${isChecked ? "Completed" : "Not Completed"}`}
        />
        <label className="erect-fab-checkbox-label">{isChecked ? "✓" : "✗"}</label>
      </div>
    )
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
                <th>Building Name</th>
                <th>Department</th>
                <th>Work Location</th>
                {/* <th>Line Number</th> */}
                <th>Drawing No</th>
                {/* NEW COLUMNS NEXT TO DRAWING NO */}
                <th>Total Mark Weight</th>
                <th>Mark Wgt</th>
                <th>Drawing Received Date</th>
                <th>Target Date</th>
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
                <th>Total Item Weight</th>
                {/* NEW FABRICATION STAGE COLUMNS NEXT TO TOTAL ITEM WEIGHT */}
                <th>Cutting</th>
                <th>Fit Up</th>
                <th>Welding</th>
                <th>Finishing</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, index) => (
                <tr key={`row_${row.lineId || index}`} className="erect-table-row-impala">
                  <td>
                    <div className="erect-order-icon-kudu">
                      <IoMdOpen />
                    </div>
                  </td>
                  {/* Work Order - attribute1V */}
                  <td>{displayValue(row.attribute1V)}</td>
                  {/* Building Name - attribute2V */}
                  <td>{displayValue(row.attribute2V)}</td>
                  {/* Department - attribute3V */}
                  <td>{displayValue(row.attribute3V)}</td>
                  {/* Work Location - attribute4V */}
                  <td>{displayValue(row.attribute4V)}</td>
                  {/* Line Number */}
                  {/* <td>{displayValue(row.lineId)}</td> */}
                  <td>
                    {editingRow === row.lineId ? (
                      <input
                        type="text"
                        value={editFormData.drawingNo}
                        onChange={(e) => handleEditInputChange("drawingNo", e.target.value)}
                        className="erect-edit-input-gemsbok"
                      />
                    ) : (
                      displayValue(row.drawingNo)
                    )}
                  </td>
                  {/* NEW COLUMNS NEXT TO DRAWING NO */}
                  <td>
                    {editingRow === row.lineId ? (
                      <input
                        type="number"
                        step="0.001"
                        value={editFormData.totalMarkedWgt}
                        onChange={(e) => handleEditInputChange("totalMarkedWgt", e.target.value)}
                        className="erect-edit-input-gemsbok"
                      />
                    ) : (
                      formatNumber(row.totalMarkedWgt)
                    )}
                  </td>
                  <td>
                    {editingRow === row.lineId ? (
                      <input
                        type="number"
                        step="0.001"
                        value={editFormData.markWeight}
                        onChange={(e) => handleEditInputChange("markWeight", e.target.value)}
                        className="erect-edit-input-gemsbok"
                      />
                    ) : (
                      formatNumber(row.markWeight)
                    )}
                  </td>
                  <td>
                    {editingRow === row.lineId ? (
                      <input
                        type="date"
                        value={editFormData.drawingReceivedDate}
                        onChange={(e) => handleEditInputChange("drawingReceivedDate", e.target.value)}
                        className="erect-edit-input-gemsbok"
                      />
                    ) : (
                      formatDate(row.drawingReceivedDate)
                    )}
                  </td>
                  <td>
                    {editingRow === row.lineId ? (
                      <input
                        type="date"
                        value={editFormData.targetDate}
                        onChange={(e) => handleEditInputChange("targetDate", e.target.value)}
                        className="erect-edit-input-gemsbok"
                      />
                    ) : (
                      formatDate(row.targetDate)
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
                      displayValue(row.markNo)
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
                      displayValue(row.markedQty)
                    )}
                  </td>
                  {/* Item No - attribute1N */}
                  <td>{displayValue(row.attribute1N)}</td>
                  <td>
                    {editingRow === row.lineId ? (
                      <input
                        type="text"
                        value={editFormData.sessionCode}
                        onChange={(e) => handleEditInputChange("sessionCode", e.target.value)}
                        className="erect-edit-input-gemsbok"
                      />
                    ) : (
                      displayValue(row.sessionCode)
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
                      displayValue(row.sessionName)
                    )}
                  </td>
                  {/* Section Weight - sessionWeight or totalMarkedWgt */}
                  <td>{formatNumber(row.sessionWeight)}</td>
                  <td>
                    {editingRow === row.lineId ? (
                      <input
                        type="number"
                        value={editFormData.width}
                        onChange={(e) => handleEditInputChange("width", e.target.value)}
                        className="erect-edit-input-gemsbok"
                      />
                    ) : (
                      formatNumber(row.width)
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
                      formatNumber(row.length)
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
                      formatNumber(row.itemQty)
                    )}
                  </td>
                  <td>
                    {editingRow === row.lineId ? (
                      <input
                        type="number"
                        step="0.001"
                        value={editFormData.itemWeight}
                        onChange={(e) => handleEditInputChange("itemWeight", e.target.value)}
                        className="erect-edit-input-gemsbok"
                      />
                    ) : (
                      formatNumber(row.itemWeight)
                    )}
                  </td>
                  {/* NEW TOTAL ITEM WEIGHT COLUMN */}
                  <td>
                    {editingRow === row.lineId ? (
                      <input
                        type="number"
                        step="0.001"
                        value={editFormData.totalItemWeight}
                        onChange={(e) => handleEditInputChange("totalItemWeight", e.target.value)}
                        className="erect-edit-input-gemsbok"
                      />
                    ) : (
                      formatNumber(row.totalItemWeight)
                    )}
                  </td>
                  {/* NEW FABRICATION STAGE COLUMNS NEXT TO TOTAL ITEM WEIGHT */}
                  <td>{renderFabricationCheckbox(row.cuttingStage, "Cutting")}</td>
                  <td>{renderFabricationCheckbox(row.fitUpStage, "Fit Up")}</td>
                  <td>{renderFabricationCheckbox(row.weldingStage, "Welding")}</td>
                  <td>{renderFabricationCheckbox(row.finishingStage, "Finishing")}</td>
                  <td>
                    <span className="erect-status-badge-oryx">{displayValue(row.status, "Erection")}</span>
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
                  <td colSpan="29">
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
