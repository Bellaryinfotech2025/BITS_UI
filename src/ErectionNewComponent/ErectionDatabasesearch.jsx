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
  const [saving, setSaving] = useState(false)
  const [tableData, setTableData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [drawingNumbers, setDrawingNumbers] = useState([])
  const [markNumbers, setMarkNumbers] = useState([])

  // Filter states
  const [selectedDrawingNo, setSelectedDrawingNo] = useState("")
  const [selectedMarkNo, setSelectedMarkNo] = useState("")

  // Selected filter values for display
  const [selectedFilters, setSelectedFilters] = useState({
    workOrder: "",
    buildingName: "",
    drawingNo: "",
    markNo: "",
  })

  // Move to Alignment popup states
  const [showMoveToAlignmentPopup, setShowMoveToAlignmentPopup] = useState(false)
  const [selectedMarkNosForAlignment, setSelectedMarkNosForAlignment] = useState([])
  const [availableMarkNosForAlignment, setAvailableMarkNosForAlignment] = useState([])

  // Edit states
  const [editingRow, setEditingRow] = useState(null)
  const [editFormData, setEditFormData] = useState({})

  // Erection process states - tracks checkbox states for each row
  const [erectionStages, setErectionStages] = useState({})

  // Erection stages in order
  const ERECTION_STAGES = ["cutting", "fitUp", "welding", "finishing"]
  const STAGE_LABELS = {
    cutting: "Cutting",
    fitUp: "Fit Up",
    welding: "Welding",
    finishing: "Finishing",
  }

  // Backend field mapping
  const STAGE_FIELD_MAPPING = {
    cutting: "cuttingStage",
    fitUp: "fitUpStage",
    welding: "weldingStage",
    finishing: "finishingStage",
  }

  // Initialize erection stages for a row from backend data
  const initializeErectionStagesFromData = (lineId, rowData) => {
    setErectionStages((prev) => ({
      ...prev,
      [lineId]: {
        cutting: rowData.cuttingStage === "Y",
        fitUp: rowData.fitUpStage === "Y",
        welding: rowData.weldingStage === "Y",
        finishing: rowData.finishingStage === "Y",
      },
    }))
  }

  // Handle erection stage checkbox change with sequential logic
  const handleStageChange = (lineId, stage, checked) => {
    setErectionStages((prev) => {
      const currentStages = prev[lineId] || {
        cutting: false,
        fitUp: false,
        welding: false,
        finishing: false,
      }

      const newStages = { ...currentStages }
      const stageIndex = ERECTION_STAGES.indexOf(stage)

      if (checked) {
        // If checking a stage, automatically check all previous stages
        for (let i = 0; i <= stageIndex; i++) {
          newStages[ERECTION_STAGES[i]] = true
        }
      } else {
        // If unchecking a stage, automatically uncheck all subsequent stages
        for (let i = stageIndex; i < ERECTION_STAGES.length; i++) {
          newStages[ERECTION_STAGES[i]] = false
        }
      }

      return {
        ...prev,
        [lineId]: newStages,
      }
    })
  }

  // Save erection stages to backend
  const handleSaveErectionStages = async () => {
    try {
      setSaving(true)

      // Prepare erection stage updates
      const erectionUpdates = Object.keys(erectionStages).map((lineId) => {
        const stages = erectionStages[lineId]
        return {
          lineId: lineId,
          cuttingStage: stages.cutting ? "Y" : "N",
          fitUpStage: stages.fitUp ? "Y" : "N",
          weldingStage: stages.welding ? "Y" : "N",
          finishingStage: stages.finishing ? "Y" : "N",
        }
      })

      if (erectionUpdates.length === 0) {
        toast.warning("No erection stages to save")
        return
      }

      console.log("Saving erection stages:", erectionUpdates)

      const response = await fetch(`${API_BASE_URL}/updateErectionStages/details`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          erectionStages: erectionUpdates,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(`Successfully updated erection stages for ${result.updatedCount} entries!`)

        // Refresh data to get updated values
        if (selectedDrawingNo || selectedMarkNo) {
          handleSearch()
        }
      } else {
        const errorText = await response.text()
        console.error("Save erection stages failed:", errorText)
        toast.error(`Failed to save erection stages: ${errorText}`)
      }
    } catch (error) {
      console.error("Error saving erection stages:", error)
      toast.error("Error saving erection stages: " + error.message)
    } finally {
      setSaving(false)
    }
  }

  // Fetch dropdown data on component mount
  useEffect(() => {
    fetchDropdownData()
  }, [])

  // Fetch dropdown data for Drawing No and Mark No
  const fetchDropdownData = async () => {
    try {
      setLoading(true)

      // Fetch distinct drawing numbers
      const drawingResponse = await fetch(`${API_BASE_URL}/getDistinctErectionDrawingEntryDrawingNumbers/details`)
      if (drawingResponse.ok) {
        const drawingData = await drawingResponse.json()
        setDrawingNumbers(drawingData || [])
        console.log("Drawing Numbers:", drawingData)
      }

      // Fetch distinct mark numbers
      const markResponse = await fetch(`${API_BASE_URL}/getDistinctErectionDrawingEntryMarkNumbers/details`)
      if (markResponse.ok) {
        const markData = await markResponse.json()
        setMarkNumbers(markData || [])
        setAvailableMarkNosForAlignment(markData || [])
        console.log("Mark Numbers:", markData)
      }
    } catch (error) {
      console.error("Error fetching dropdown data:", error)
      toast.error(`Error fetching dropdown data: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Handle search button click
  const handleSearch = async () => {
    if (!selectedDrawingNo && !selectedMarkNo) {
      toast.warning("Please select at least Drawing No or Mark No to search")
      return
    }

    try {
      setLoading(true)

      // Build search URL with parameters
      let searchUrl = `${API_BASE_URL}/searchErectionDrawingEntries/details?`
      const params = new URLSearchParams()

      if (selectedDrawingNo) {
        params.append("drawingNo", selectedDrawingNo)
      }
      if (selectedMarkNo) {
        params.append("markNo", selectedMarkNo)
      }

      // Add pagination parameters
      params.append("page", "0")
      params.append("size", "1000")
      params.append("sortBy", "creationDate")
      params.append("sortDir", "desc")

      searchUrl += params.toString()

      console.log("Search URL:", searchUrl)

      const response = await fetch(searchUrl)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Response is not JSON")
      }

      const result = await response.json()
      console.log("Search result:", result)

      // Handle paginated response
      const data = result.content || result || []

      setTableData(data)
      setFilteredData(data)

      // Set selected filter values for display
      if (data.length > 0) {
        const firstRow = data[0]
        setSelectedFilters({
          workOrder: firstRow.attribute1V || "",
          buildingName: firstRow.attribute2V || "",
          drawingNo: selectedDrawingNo,
          markNo: selectedMarkNo,
        })
      }

      // Initialize erection stages for all rows
      data.forEach((row) => {
        initializeErectionStagesFromData(row.lineId, row)
      })

      toast.info(`Found ${data.length} records`)
    } catch (error) {
      console.error("Error searching data:", error)
      toast.error(`Error searching data: ${error.message}`)
      setTableData([])
      setFilteredData([])
      setSelectedFilters({
        workOrder: "",
        buildingName: "",
        drawingNo: "",
        markNo: "",
      })
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
      totalItemWeight: row.totalItemWeight || "",
      drawingWeight: row.drawingWeight || "",
      markWeight: row.markWeight || "",
      totalMarkedWgt: row.totalMarkedWgt || "",
    })
  }

  // Handle save edit
  const handleSaveEdit = async () => {
    try {
      setLoading(true)

      // Prepare the update data with only the fields that can be updated
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
        totalItemWeight: Number.parseFloat(editFormData.totalItemWeight) || 0,
        drawingWeight: Number.parseFloat(editFormData.drawingWeight) || null,
        markWeight: Number.parseFloat(editFormData.markWeight) || null,
        totalMarkedWgt: Number.parseFloat(editFormData.totalMarkedWgt) || null,
        lastUpdatedBy: "system",
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
        handleSearch() // Refresh data
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
          handleSearch() // Refresh data
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
        totalItemWeight: item.totalItemWeight || 0,
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
        // Copy new fields
        drawingWeight: item.drawingWeight || null,
        markWeight: item.markWeight || null,
      }))

      console.log("Moving to alignment:", alignmentEntries)

      // Call the alignment API
      const response = await fetch(`${API_BASE_URL}/createBulkAlignmentDrawingEntriesWithDuplicateCheck/details`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(alignmentEntries),
      })

      if (response.ok) {
        const result = await response.json()

        // Show detailed feedback
        if (result.skippedCount > 0) {
          toast.warning(
            `${result.createdCount} entries created, ${result.skippedCount} skipped as duplicates. Skipped: ${result.skippedDuplicates.join(", ")}`,
          )
        } else {
          toast.success(`${result.createdCount} Mark No(s) moved to Alignment successfully!`)
        }

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

  // Format date for display (DD-MMMM-YYYY)
  const formatDate = (dateString) => {
    if (!dateString) return "-"
    try {
      const date = new Date(dateString)
      const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ]
      const day = date.getDate().toString().padStart(2, "0")
      const month = months[date.getMonth()]
      const year = date.getFullYear()
      return `${day}-${month}-${year}`
    } catch (error) {
      return dateString
    }
  }

  // Format number for display
  const formatNumber = (value) => {
    if (value === null || value === undefined) return "-"
    return Number.parseFloat(value).toFixed(3)
  }

  return (
    <div className="erect-container-mammoth">
      {/* Header */}
      <div className="erect-header-elephant">
        <div className="erect-title-tiger">
          <h3>Search for Erection Details</h3>
        </div>
        <div className="erect-header-buttons">
          <button
            className="erect-button-giraffe erect-save-stages-btn"
            onClick={handleSaveErectionStages}
            disabled={saving || loading || filteredData.length === 0}
          >
            {saving ? (
              <>
                <AiOutlineLoading3Quarters className="erect-spin-icon-polar" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <MdSave />
                <span>Save</span>
              </>
            )}
          </button>
          <button
            className="erect-button-giraffe erect-move-to-alignment-btn"
            onClick={handleMoveToAlignment}
            disabled={filteredData.length === 0}
          >
            <span>Completed</span>
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="erect-filter-section-zebra">
        <div className="erect-filter-container-hippo">
          <div className="erect-filter-row-rhino">
            {/* Drawing No Dropdown */}
            <select
              value={selectedDrawingNo}
              onChange={(e) => setSelectedDrawingNo(e.target.value)}
              className="erect-dropdown-cheetah"
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
              className="erect-dropdown-cheetah"
            >
              <option value="">Select Mark No</option>
              {markNumbers?.map((markNo, index) => (
                <option key={`mark_${index}`} value={markNo}>
                  {markNo}
                </option>
              ))}
            </select>

            {/* Search Button */}
            <button className="erect-search-button-leopard" onClick={handleSearch} disabled={loading}>
              <span>Search</span>
            </button>
          </div>
        </div>
      </div>

      {/* Selected Filters Display */}
      {(selectedFilters.workOrder ||
        selectedFilters.buildingName ||
        selectedFilters.drawingNo ||
        selectedFilters.markNo) && (
        <div className="erect-selected-filters-section">
          <div className="erect-selected-filters-container">
            <h4>Selected Filters:</h4>
            <div className="erect-selected-filters-grid">
              {selectedFilters.workOrder && (
                <div className="erect-filter-item">
                  <span className="erect-filter-label">Work Order:</span>
                  <span className="erect-filter-value">{selectedFilters.workOrder}</span>
                </div>
              )}
              {selectedFilters.buildingName && (
                <div className="erect-filter-item">
                  <span className="erect-filter-label">Building Name:</span>
                  <span className="erect-filter-value">{selectedFilters.buildingName}</span>
                </div>
              )}
              {selectedFilters.drawingNo && (
                <div className="erect-filter-item">
                  <span className="erect-filter-label">Drawing No:</span>
                  <span className="erect-filter-value">{selectedFilters.drawingNo}</span>
                </div>
              )}
              {selectedFilters.markNo && (
                <div className="erect-filter-item">
                  <span className="erect-filter-label">Mark No:</span>
                  <span className="erect-filter-value">{selectedFilters.markNo}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Table Section */}
      <div className="erect-table-container-lynx">
        {loading && (
          <div className="erect-loading-overlay-panther">
            <div className="erect-loading-spinner-jaguar">
              <AiOutlineLoading3Quarters />
            </div>
            <div className="erect-loading-text-cougar">Loading...</div>
          </div>
        )}

        <div className="erect-table-wrapper-bear">
          <table className="erect-table-wolf">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Total Mark Weight</th>
                <th>Mark Wgt</th>
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
                <th>Status</th>
                {/* Erection Process Columns */}
                <th className="erect-process-header">Cutting</th>
                <th className="erect-process-header">Fit Up</th>
                <th className="erect-process-header">Welding</th>
                <th className="erect-process-header">Finishing</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, index) => (
                <tr key={`row_${index}`} className="erect-table-row-fox">
                  <td>
                    <div className="erect-order-icon-rabbit">
                      <IoMdOpen />
                    </div>
                  </td>
                  <td>
                    {editingRow === row.lineId ? (
                      <input
                        type="number"
                        step="0.001"
                        value={editFormData.totalMarkedWgt}
                        onChange={(e) => handleEditInputChange("totalMarkedWgt", e.target.value)}
                        className="erect-edit-input-deer"
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
                        className="erect-edit-input-deer"
                      />
                    ) : (
                      formatNumber(row.markWeight)
                    )}
                  </td>
                  <td>
                    {editingRow === row.lineId ? (
                      <input
                        type="number"
                        value={editFormData.markedQty}
                        onChange={(e) => handleEditInputChange("markedQty", e.target.value)}
                        className="erect-edit-input-deer"
                      />
                    ) : (
                      row.markedQty || "-"
                    )}
                  </td>
                  <td>{row.attribute1N || "-"}</td>
                  <td>
                    {editingRow === row.lineId ? (
                      <input
                        type="text"
                        value={editFormData.sessionCode}
                        className="erect-edit-input-deer erect-readonly-input"
                        readOnly
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
                        className="erect-edit-input-deer erect-readonly-input"
                        readOnly
                      />
                    ) : (
                      row.sessionName || "-"
                    )}
                  </td>
                  <td>{formatNumber(row.sessionWeight)}</td>
                  <td>
                    {editingRow === row.lineId ? (
                      <input
                        type="number"
                        value={editFormData.width}
                        onChange={(e) => handleEditInputChange("width", e.target.value)}
                        className="erect-edit-input-deer"
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
                        className="erect-edit-input-deer"
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
                        className="erect-edit-input-deer"
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
                        className="erect-edit-input-deer"
                      />
                    ) : (
                      formatNumber(row.itemWeight)
                    )}
                  </td>
                  <td>
                    {editingRow === row.lineId ? (
                      <input
                        type="number"
                        step="0.001"
                        value={editFormData.totalItemWeight}
                        onChange={(e) => handleEditInputChange("totalItemWeight", e.target.value)}
                        className="erect-edit-input-deer"
                      />
                    ) : (
                      formatNumber(row.totalItemWeight)
                    )}
                  </td>
                  <td>
                    <span className="erect-status-badge-moose">Erection</span>
                  </td>

                  {/* Erection Process Columns */}
                  {ERECTION_STAGES.map((stage) => (
                    <td key={`${row.lineId}_${stage}`} className="erect-process-cell">
                      <div className="erect-checkbox-container">
                        <input
                          type="checkbox"
                          id={`${row.lineId}_${stage}`}
                          checked={erectionStages[row.lineId]?.[stage] || false}
                          onChange={(e) => handleStageChange(row.lineId, stage, e.target.checked)}
                          className="erect-process-checkbox"
                          aria-label={`${STAGE_LABELS[stage]} for ${row.markNo || "item"}`}
                        />
                        <label
                          htmlFor={`${row.lineId}_${stage}`}
                          className="erect-checkbox-label"
                          title={`Mark ${STAGE_LABELS[stage]} as ${erectionStages[row.lineId]?.[stage] ? "incomplete" : "complete"}`}
                        />
                      </div>
                    </td>
                  ))}

                  <td>
                    <div className="erect-actions-container-yak">
                      {editingRow === row.lineId ? (
                        <>
                          <button
                            onClick={handleSaveEdit}
                            className="erect-action-button-elk erect-save-button-impala"
                            title="Save"
                          >
                            <MdSave />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="erect-action-button-elk erect-cancel-button-bison"
                            title="Cancel"
                          >
                            ✕
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(row)}
                            className="erect-action-button-elk erect-edit-button-impala"
                            title="Modify"
                          >
                            <MdEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(row.lineId)}
                            className="erect-action-button-elk erect-delete-button-bison"
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
                <tr className="erect-empty-row-camel">
                  <td colSpan="19">
                    <div className="erect-empty-state-llama">
                      <div className="erect-empty-text-alpaca">
                        {selectedDrawingNo || selectedMarkNo
                          ? "No records found for the selected criteria."
                          : "Please select Drawing No and/or Mark No and click Search to view records."}
                      </div>
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
        <div className="erect-popup-overlay-shark">
          <div className="erect-popup-container-whale">
            <div className="erect-popup-header-dolphin">
              <h3>Mark No.</h3>
              <button onClick={() => setShowMoveToAlignmentPopup(false)} className="erect-popup-close-octopus">
                ✕
              </button>
            </div>
            <div className="erect-popup-content-squid">
              <div className="erect-multiselect-container-jellyfish">
                <div className="erect-multiselect-label-starfish">Select Mark No(s):</div>
                <div className="erect-multiselect-options-seahorse">
                  {availableMarkNosForAlignment.map((markNo, index) => (
                    <label key={`popup_mark_${index}`} className="erect-checkbox-label-crab">
                      <input
                        type="checkbox"
                        checked={selectedMarkNosForAlignment.includes(markNo)}
                        onChange={() => handleMarkNoSelection(markNo)}
                        className="erect-checkbox-input-lobster"
                      />
                      <span className="erect-checkbox-text-shrimp">{markNo}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="erect-popup-actions-turtle">
              <button
                onClick={() => setShowMoveToAlignmentPopup(false)}
                className="erect-popup-button-seal erect-cancel-button-walrus"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveToAlignment}
                className="erect-popup-button-seal erect-save-button-penguin"
                disabled={loading || selectedMarkNosForAlignment.length === 0}
              >
                {loading ? (
                  <>
                    <AiOutlineLoading3Quarters className="erect-spin-icon-polar" />
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
