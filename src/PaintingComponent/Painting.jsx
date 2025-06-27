import { useState, useEffect } from "react"
import { IoMdOpen } from "react-icons/io"
import { AiOutlineLoading3Quarters } from "react-icons/ai"
import { MdSave, MdEdit, MdDelete } from "react-icons/md"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import "../AlignmentNewComponent/AlignmentDatabasesearch.css"

const PaintingDatabasesearch = () => {
  // API Base URL
  const API_BASE_URL = "http://195.35.45.56:5522/api/V2.0"

  // State management
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [tableData, setTableData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [drawingNumbers, setDrawingNumbers] = useState([])
  const [markNumbers, setMarkNumbers] = useState([])
  const [workOrders, setWorkOrders] = useState([]) // NEW: Work Orders from erection
  const [buildingNames, setBuildingNames] = useState([]) // NEW: Building Names from erection

  // Filter states
  const [selectedDrawingNo, setSelectedDrawingNo] = useState("")
  const [selectedMarkNo, setSelectedMarkNo] = useState("")
  const [selectedWorkOrder, setSelectedWorkOrder] = useState("") // NEW: Work Order filter
  const [selectedBuildingName, setSelectedBuildingName] = useState("") // NEW: Building Name filter

  // Selected filter values for display
  const [selectedFilters, setSelectedFilters] = useState({
    workOrder: "",
    buildingName: "",
    drawingNo: "",
    markNo: "",
  })

  // Move to Billing popup states
  const [showMoveToBillingPopup, setShowMoveToBillingPopup] = useState(false)
  const [selectedMarkNosForBilling, setSelectedMarkNosForBilling] = useState([])
  const [availableMarkNosForBilling, setAvailableMarkNosForBilling] = useState([])

  // Edit states
  const [editingRow, setEditingRow] = useState(null)
  const [editFormData, setEditFormData] = useState({})

  // RA NO edit states - NEW
  const [editingRaNo, setEditingRaNo] = useState({}) // Track which RA NO fields are being edited
  const [raNoValues, setRaNoValues] = useState({}) // Track RA NO input values
  const [savingRaNo, setSavingRaNo] = useState({}) // Track which RA NO fields are being saved

  // Alignment process states - tracks checkbox states for each row
  const [alignmentStages, setAlignmentStages] = useState({})

  // Alignment stages in order
  const ALIGNMENT_STAGES = ["cutting", "fitUp", "welding", "finishing"]
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

  // Initialize alignment stages for a row from backend data
  const initializeAlignmentStagesFromData = (lineId, rowData) => {
    setAlignmentStages((prev) => ({
      ...prev,
      [lineId]: {
        cutting: rowData.cuttingStage === "Y",
        fitUp: rowData.fitUpStage === "Y",
        welding: rowData.weldingStage === "Y",
        finishing: rowData.finishingStage === "Y",
      },
    }))
  }

  // Initialize RA NO values from data - NEW
  const initializeRaNoFromData = (lineId, raNo) => {
    setRaNoValues((prev) => ({
      ...prev,
      [lineId]: raNo || "",
    }))
  }

  // Handle RA NO input change - NEW
  const handleRaNoInputChange = (lineId, value) => {
    setRaNoValues((prev) => ({
      ...prev,
      [lineId]: value,
    }))
  }

  // Handle RA NO save - NEW
  const handleSaveRaNo = async (lineId) => {
    try {
      setSavingRaNo((prev) => ({ ...prev, [lineId]: true }))

      const raNoValue = raNoValues[lineId] || ""

      // Prepare update data with only RA NO field
      const updateData = {
        raNo: raNoValue.trim() || null,
        lastUpdatedBy: "system",
      }

      console.log(`Updating RA NO for lineId ${lineId}:`, updateData)

      const response = await fetch(`${API_BASE_URL}/updateAlignmentDrawingEntry/details?lineId=${lineId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        toast.success("RA NO updated successfully!")
        
        // Update the table data with new RA NO value
        setTableData((prev) =>
          prev.map((row) =>
            row.lineId === lineId ? { ...row, raNo: raNoValue.trim() || null } : row
          )
        )
        setFilteredData((prev) =>
          prev.map((row) =>
            row.lineId === lineId ? { ...row, raNo: raNoValue.trim() || null } : row
          )
        )

        // Exit edit mode for this RA NO field
        setEditingRaNo((prev) => ({ ...prev, [lineId]: false }))
      } else {
        const errorText = await response.text()
        console.error("RA NO update failed:", errorText)
        toast.error(`Failed to update RA NO: ${errorText}`)
      }
    } catch (error) {
      console.error("Error updating RA NO:", error)
      toast.error("Error updating RA NO: " + error.message)
    } finally {
      setSavingRaNo((prev) => ({ ...prev, [lineId]: false }))
    }
  }

  // Handle RA NO edit mode toggle - NEW
  const handleEditRaNo = (lineId, currentValue) => {
    setEditingRaNo((prev) => ({ ...prev, [lineId]: true }))
    setRaNoValues((prev) => ({ ...prev, [lineId]: currentValue || "" }))
  }

  // Handle RA NO cancel edit - NEW
  const handleCancelRaNoEdit = (lineId, originalValue) => {
    setEditingRaNo((prev) => ({ ...prev, [lineId]: false }))
    setRaNoValues((prev) => ({ ...prev, [lineId]: originalValue || "" }))
  }

  // Handle alignment stage checkbox change with sequential logic
  const handleStageChange = (lineId, stage, checked) => {
    setAlignmentStages((prev) => {
      const currentStages = prev[lineId] || {
        cutting: false,
        fitUp: false,
        welding: false,
        finishing: false,
      }

      const newStages = { ...currentStages }
      const stageIndex = ALIGNMENT_STAGES.indexOf(stage)

      if (checked) {
        // If checking a stage, automatically check all previous stages
        for (let i = 0; i <= stageIndex; i++) {
          newStages[ALIGNMENT_STAGES[i]] = true
        }
      } else {
        // If unchecking a stage, automatically uncheck all subsequent stages
        for (let i = stageIndex; i < ALIGNMENT_STAGES.length; i++) {
          newStages[ALIGNMENT_STAGES[i]] = false
        }
      }

      return {
        ...prev,
        [lineId]: newStages,
      }
    })
  }

  // Save alignment stages to backend
  const handleSaveAlignmentStages = async () => {
    try {
      setSaving(true)

      // Prepare alignment stage updates
      const alignmentUpdates = Object.keys(alignmentStages).map((lineId) => {
        const stages = alignmentStages[lineId]
        return {
          lineId: Number.parseInt(lineId), // CONVERT TO LONG INTEGER
          cuttingStage: stages.cutting ? "Y" : "N",
          fitUpStage: stages.fitUp ? "Y" : "N",
          weldingStage: stages.welding ? "Y" : "N",
          finishingStage: stages.finishing ? "Y" : "N",
        }
      })

      if (alignmentUpdates.length === 0) {
        toast.warning("No alignment stages to save")
        return
      }

      console.log("Saving alignment stages:", alignmentUpdates)

      const response = await fetch(`${API_BASE_URL}/updateAlignmentStages/details`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          alignmentStages: alignmentUpdates,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(`Successfully updated alignment stages for ${result.updatedCount} entries!`)

        // Refresh data to get updated values
        if (selectedDrawingNo || selectedMarkNo || selectedWorkOrder || selectedBuildingName) {
          handleSearch()
        }
      } else {
        const errorText = await response.text()
        console.error("Save alignment stages failed:", errorText)
        toast.error(`Failed to save alignment stages: ${errorText}`)
      }
    } catch (error) {
      console.error("Error saving alignment stages:", error)
      toast.error("Error saving alignment stages: " + error.message)
    } finally {
      setSaving(false)
    }
  }

  // Fetch dropdown data on component mount
  useEffect(() => {
    fetchDropdownData()
  }, [])

  // Fetch dropdown data for all filters
  const fetchDropdownData = async () => {
    try {
      setLoading(true)

      // NEW: Fetch Work Orders that were moved from erection (have order_id)
      const workOrderResponse = await fetch(`${API_BASE_URL}/getDistinctErectionWorkOrders/details`)
      if (workOrderResponse.ok) {
        const workOrderData = await workOrderResponse.json()
        setWorkOrders(workOrderData || [])
        console.log("Work Orders from erection:", workOrderData)
      }

      // NEW: Fetch Building Names that were moved from erection (have ra_no)
      const buildingResponse = await fetch(`${API_BASE_URL}/getDistinctErectionPlantLocations/details`)
      if (buildingResponse.ok) {
        const buildingData = await buildingResponse.json()
        setBuildingNames(buildingData || [])
        console.log("Building Names from erection:", buildingData)
      }

      // Fetch distinct drawing numbers
      const drawingResponse = await fetch(`${API_BASE_URL}/getDistinctAlignmentDrawingEntryDrawingNumbers/details`)
      if (drawingResponse.ok) {
        const drawingData = await drawingResponse.json()
        setDrawingNumbers(drawingData || [])
        console.log("Drawing Numbers:", drawingData)
      }

      // Fetch distinct mark numbers
      const markResponse = await fetch(`${API_BASE_URL}/getDistinctAlignmentDrawingEntryMarkNumbers/details`)
      if (markResponse.ok) {
        const markData = await markResponse.json()
        setMarkNumbers(markData || [])
        setAvailableMarkNosForBilling(markData || [])
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
    if (!selectedDrawingNo && !selectedMarkNo && !selectedWorkOrder && !selectedBuildingName) {
      toast.warning("Please select at least one filter to search")
      return
    }

    try {
      setLoading(true)

      // Build search URL with parameters
      let searchUrl = `${API_BASE_URL}/searchAlignmentDrawingEntries/details?`
      const params = new URLSearchParams()

      if (selectedDrawingNo) {
        params.append("drawingNo", selectedDrawingNo)
      }
      if (selectedMarkNo) {
        params.append("markNo", selectedMarkNo)
      }
      // NEW: Add Work Order and Building Name filters
      if (selectedWorkOrder) {
        params.append("orderId", selectedWorkOrder)
      }
      if (selectedBuildingName) {
        params.append("raNo", selectedBuildingName)
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
      setSelectedFilters({
        workOrder: selectedWorkOrder,
        buildingName: selectedBuildingName,
        drawingNo: selectedDrawingNo,
        markNo: selectedMarkNo,
      })

      // Initialize alignment stages and RA NO values for all rows
      data.forEach((row) => {
        initializeAlignmentStagesFromData(row.lineId, row)
        initializeRaNoFromData(row.lineId, row.raNo) // NEW: Initialize RA NO values
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

  // Clear all filters
  const handleClearFilters = () => {
    setSelectedWorkOrder("")
    setSelectedBuildingName("")
    setSelectedDrawingNo("")
    setSelectedMarkNo("")
    setTableData([])
    setFilteredData([])
    setSelectedFilters({
      workOrder: "",
      buildingName: "",
      drawingNo: "",
      markNo: "",
    })
    setAlignmentStages({})
    setRaNoValues({}) // NEW: Clear RA NO values
    setEditingRaNo({}) // NEW: Clear RA NO edit states
    toast.info("All filters cleared")
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
      orderId: row.orderId || "", // NEW: Order ID
      raNo: row.raNo || "", // NEW: RA NO
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
        orderId: editFormData.orderId ? Number.parseInt(editFormData.orderId) : null, // NEW: Order ID as Long
        raNo: editFormData.raNo || null, // NEW: RA NO
        lastUpdatedBy: "system",
      }

      console.log("Sending update data:", updateData)

      const response = await fetch(`${API_BASE_URL}/updateAlignmentDrawingEntry/details?lineId=${editingRow}`, {
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

        const response = await fetch(`${API_BASE_URL}/deleteAlignmentDrawingEntry/details?lineId=${lineId}`, {
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

  // Handle Move to Billing button click
  const handleMoveToBilling = () => {
    setShowMoveToBillingPopup(true)
  }

  // Handle mark number selection in popup
  const handleMarkNoSelection = (markNo) => {
    setSelectedMarkNosForBilling((prev) => {
      if (prev.includes(markNo)) {
        return prev.filter((m) => m !== markNo)
      } else {
        return [...prev, markNo]
      }
    })
  }

  // Handle save to billing
  const handleSaveToBilling = async () => {
    if (selectedMarkNosForBilling.length === 0) {
      toast.warning("Please select at least one Mark No.")
      return
    }

    try {
      setLoading(true)

      // Get ALL entries for selected mark numbers
      const entriesToMove = []

      // For each selected mark number, find ALL entries with that mark number
      for (const markNo of selectedMarkNosForBilling) {
        const entries = tableData.filter((item) => item.markNo === markNo)
        entriesToMove.push(...entries)
      }

      if (entriesToMove.length === 0) {
        toast.error("No entries found for selected Mark Numbers")
        return
      }

      // Create billing entries with proper data format
      const billingEntries = entriesToMove.map((item) => ({
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
        status: "billing",
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
        orderId: item.orderId || null, // NEW: Order ID
        raNo: item.raNo || null, // NEW: RA NO
        // Copy fabrication stages
        cuttingStage: item.cuttingStage || "N",
        fitUpStage: item.fitUpStage || "N",
        weldingStage: item.weldingStage || "N",
        finishingStage: item.finishingStage || "N",
      }))

      console.log("Moving to billing:", billingEntries)

      // Call the billing API
      const response = await fetch(`${API_BASE_URL}/createBulkBillingDrawingEntries/details`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(billingEntries),
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(`${entriesToMove.length} entries moved to Billing successfully!`)
        setShowMoveToBillingPopup(false)
        setSelectedMarkNosForBilling([])
      } else {
        const errorText = await response.text()
        console.error("Move to billing failed:", errorText)
        toast.error(`Failed to move to billing: ${errorText}`)
      }
    } catch (error) {
      console.error("Error moving to billing:", error)
      toast.error("Error moving to Billing: " + error.message)
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
    <div className="align-container-mammoth">
      {/* Header */}
      <div className="align-header-elephant">
        <div className="align-title-tiger">
          <h3>Search for Painting Details</h3>
        </div>
        <div className="align-header-buttons">
          <button
            className="align-button-giraffe align-move-to-billing-btn"
            onClick={handleMoveToBilling}
            disabled={filteredData.length === 0}
          >
            <span>Completed</span>
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="align-filter-section-zebra">
        <div className="align-filter-container-hippo">
          <div className="align-filter-row-rhino">
            {/* NEW: Work Order Dropdown */}
            <select
              value={selectedWorkOrder}
              onChange={(e) => setSelectedWorkOrder(e.target.value)}
              className="align-dropdown-cheetah"
            >
              <option value="">Select Work Order</option>
              {workOrders.map((workOrder, index) => (
                <option key={`work_order_${index}`} value={workOrder}>
                  {workOrder}
                </option>
              ))}
            </select>

            {/* NEW: Building Name Dropdown */}
            <select
              value={selectedBuildingName}
              onChange={(e) => setSelectedBuildingName(e.target.value)}
              className="align-dropdown-cheetah"
            >
              <option value="">Select Building Name</option>
              {buildingNames.map((buildingName, index) => (
                <option key={`building_${index}`} value={buildingName}>
                  {buildingName}
                </option>
              ))}
            </select>

            {/* Drawing No Dropdown */}
            <select
              value={selectedDrawingNo}
              onChange={(e) => setSelectedDrawingNo(e.target.value)}
              className="align-dropdown-cheetah"
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
              className="align-dropdown-cheetah"
            >
              <option value="">Select Mark No</option>
              {markNumbers?.map((markNo, index) => (
                <option key={`mark_${index}`} value={markNo}>
                  {markNo}
                </option>
              ))}
            </select>

            {/* Search Button */}
            <button className="align-search-button-leopard" onClick={handleSearch} disabled={loading}>
              <span>Search</span>
            </button>

            {/* Clear Filters Button */}
            <button className="align-clear-button-tiger" onClick={handleClearFilters}>
              <span>Clear</span>
            </button>
          </div>
        </div>
      </div>

      {/* Selected Filters Display */}
      {(selectedFilters.workOrder ||
        selectedFilters.buildingName ||
        selectedFilters.drawingNo ||
        selectedFilters.markNo) && (
        <div className="align-selected-filters-section">
          <div className="align-selected-filters-container">
            <h4>Selected Filters:</h4>
            <div className="align-selected-filters-grid">
              {selectedFilters.workOrder && (
                <div className="align-filter-item">
                  <span className="align-filter-label">Work Order:</span>
                  <span className="align-filter-value">{selectedFilters.workOrder}</span>
                </div>
              )}
              {selectedFilters.buildingName && (
                <div className="align-filter-item">
                  <span className="align-filter-label">Building Name:</span>
                  <span className="align-filter-value">{selectedFilters.buildingName}</span>
                </div>
              )}
              {selectedFilters.drawingNo && (
                <div className="align-filter-item">
                  <span className="align-filter-label">Drawing No:</span>
                  <span className="align-filter-value">{selectedFilters.drawingNo}</span>
                </div>
              )}
              {selectedFilters.markNo && (
                <div className="align-filter-item">
                  <span className="align-filter-label">Mark No:</span>
                  <span className="align-filter-value">{selectedFilters.markNo}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Table Section */}
      <div className="align-table-container-lynx">
        {loading && (
          <div className="align-loading-overlay-panther">
            <div className="align-loading-spinner-jaguar">
              <AiOutlineLoading3Quarters />
            </div>
            <div className="align-loading-text-cougar">Loading...</div>
          </div>
        )}

        <div className="align-table-wrapper-bear">
          <table className="align-table-wolf">
            <thead>
              <tr>
                <th>Order #</th>
                <th>RA NO</th> {/* NEW: RA NO Column */}
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
                {/* Alignment Process Columns */}
                <th className="align-process-header">Cutting</th>
                <th className="align-process-header">Fit Up</th>
                <th className="align-process-header">Welding</th>
                <th className="align-process-header">Finishing</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, index) => (
                <tr key={`row_${index}`} className="align-table-row-fox">
                  <td>
                    {editingRow === row.lineId ? (
                      <input
                        type="text"
                        value={editFormData.orderId}
                        onChange={(e) => handleEditInputChange("orderId", e.target.value)}
                        className="align-edit-input-deer"
                      />
                    ) : (
                      <div className="align-order-icon-rabbit">{row.orderId || <IoMdOpen />}</div>
                    )}
                  </td>
                  {/* NEW: Enhanced RA NO Column with inline editing */}
                  <td>
                    <div className="align-ra-no-container">
                      {editingRaNo[row.lineId] ? (
                        <div className="align-ra-no-edit-wrapper">
                          <input
                            type="text"
                            value={raNoValues[row.lineId] || ""}
                            onChange={(e) => handleRaNoInputChange(row.lineId, e.target.value)}
                            placeholder="Enter RA NO"
                            className="align-ra-no-input"
                            disabled={savingRaNo[row.lineId]}
                          />
                          <div className="align-ra-no-actions">
                            <button
                              onClick={() => handleSaveRaNo(row.lineId)}
                              className="align-ra-no-save-btn"
                              disabled={savingRaNo[row.lineId]}
                              title="Save RA NO"
                            >
                              {savingRaNo[row.lineId] ? (
                                <AiOutlineLoading3Quarters className="align-ra-no-spinner" />
                              ) : (
                                <MdSave />
                              )}
                            </button>
                            <button
                              onClick={() => handleCancelRaNoEdit(row.lineId, row.raNo)}
                              className="align-ra-no-cancel-btn"
                              disabled={savingRaNo[row.lineId]}
                              title="Cancel"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="align-ra-no-display-wrapper">
                          <span className="align-ra-no-value">
                            {row.raNo || "-"}
                          </span>
                          <button
                            onClick={() => handleEditRaNo(row.lineId, row.raNo)}
                            className="align-ra-no-edit-btn"
                            title="Edit RA NO"
                          >
                            <MdEdit />
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    {editingRow === row.lineId ? (
                      <input
                        type="number"
                        step="0.001"
                        value={editFormData.totalMarkedWgt}
                        onChange={(e) => handleEditInputChange("totalMarkedWgt", e.target.value)}
                        className="align-edit-input-deer"
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
                        className="align-edit-input-deer"
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
                        className="align-edit-input-deer"
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
                        className="align-edit-input-deer align-readonly-input"
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
                        className="align-edit-input-deer align-readonly-input"
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
                        className="align-edit-input-deer"
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
                        className="align-edit-input-deer"
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
                        className="align-edit-input-deer"
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
                        className="align-edit-input-deer"
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
                        className="align-edit-input-deer"
                      />
                    ) : (
                      formatNumber(row.totalItemWeight)
                    )}
                  </td>
                  <td>
                    <span className="align-status-badge-moose">Alignment</span>
                  </td>
                  {/* Alignment Process Columns */}
                  {ALIGNMENT_STAGES.map((stage) => (
                    <td key={`${row.lineId}_${stage}`} className="align-process-cell">
                      <div className="align-checkbox-container">
                        <input
                          type="checkbox"
                          id={`${row.lineId}_${stage}`}
                          checked={alignmentStages[row.lineId]?.[stage] || false}
                          onChange={(e) => handleStageChange(row.lineId, stage, e.target.checked)}
                          className="align-process-checkbox"
                          aria-label={`${STAGE_LABELS[stage]} for ${row.markNo || "item"}`}
                        />
                        <label
                          htmlFor={`${row.lineId}_${stage}`}
                          className="align-checkbox-label"
                          title={`Mark ${STAGE_LABELS[stage]} as ${alignmentStages[row.lineId]?.[stage] ? "incomplete" : "complete"}`}
                        />
                      </div>
                    </td>
                  ))}
                  <td>
                    <div className="align-actions-container-yak">
                      {editingRow === row.lineId ? (
                        <>
                          <button
                            onClick={handleSaveEdit}
                            className="align-action-button-elk align-save-button-impala"
                            title="Save"
                          >
                            <MdSave />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="align-action-button-elk align-cancel-button-bison"
                            title="Cancel"
                          >
                            ✕
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(row)}
                            className="align-action-button-elk align-edit-button-impala"
                            title="Modify"
                          >
                            <MdEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(row.lineId)}
                            className="align-action-button-elk align-delete-button-bison"
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
                <tr className="align-empty-row-camel">
                  <td colSpan="20">
                    <div className="align-empty-state-llama">
                      <div className="align-empty-text-alpaca">
                        {selectedDrawingNo || selectedMarkNo || selectedWorkOrder || selectedBuildingName
                          ? "No records found for the selected criteria."
                          : "Please select at least one filter and click Search to view records."}
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Move to Billing Popup */}
      {showMoveToBillingPopup && (
        <div className="align-popup-overlay-shark">
          <div className="align-popup-container-whale">
            <div className="align-popup-header-dolphin">
              <h3>Mark No.</h3>
              <button onClick={() => setShowMoveToBillingPopup(false)} className="align-popup-close-octopus">
                ✕
              </button>
            </div>
            <div className="align-popup-content-squid">
              <div className="align-multiselect-container-jellyfish">
                <div className="align-multiselect-label-starfish">Select Mark No(s):</div>
                <div className="align-multiselect-options-seahorse">
                  {availableMarkNosForBilling.map((markNo, index) => (
                    <label key={`popup_mark_${index}`} className="align-checkbox-label-crab">
                      <input
                        type="checkbox"
                        checked={selectedMarkNosForBilling.includes(markNo)}
                        onChange={() => handleMarkNoSelection(markNo)}
                        className="align-checkbox-input-lobster"
                      />
                      <span className="align-checkbox-text-shrimp">{markNo}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="align-popup-actions-turtle">
              <button
                onClick={() => setShowMoveToBillingPopup(false)}
                className="align-popup-button-seal align-cancel-button-walrus"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveToBilling}
                className="align-popup-button-seal align-save-button-penguin"
                disabled={loading || selectedMarkNosForBilling.length === 0}
              >
                {loading ? (
                  <>
                    <AiOutlineLoading3Quarters className="align-spin-icon-polar" />
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

      {/* NEW: CSS Styles for RA NO editing */}
      <style jsx>{`
        .align-ra-no-container {
          min-width: 150px;
          position: relative;
        }

        .align-ra-no-edit-wrapper {
          display: flex;
          align-items: center;
          gap: 4px;
          width: 100%;
        }

        .align-ra-no-input {
          flex: 1;
          padding: 4px 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 12px;
          min-width: 100px;
          background-color: #fff;
        }

        .align-ra-no-input:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
        }

        .align-ra-no-input:disabled {
          background-color: #f8f9fa;
          cursor: not-allowed;
        }

        .align-ra-no-actions {
          display: flex;
          gap: 2px;
        }

        .align-ra-no-save-btn,
        .align-ra-no-cancel-btn,
        .align-ra-no-edit-btn {
          padding: 4px 6px;
          border: none;
          border-radius: 3px;
          cursor: pointer;
          font-size: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 24px;
          height: 24px;
          transition: all 0.2s ease;
        }

        .align-ra-no-save-btn {
          background-color: #28a745;
          color: white;
        }

        .align-ra-no-save-btn:hover:not(:disabled) {
          background-color: #218838;
        }

        .align-ra-no-save-btn:disabled {
          background-color: #6c757d;
          cursor: not-allowed;
        }

        .align-ra-no-cancel-btn {
          background-color: #dc3545;
          color: white;
        }

        .align-ra-no-cancel-btn:hover:not(:disabled) {
          background-color: #c82333;
        }

        .align-ra-no-edit-btn {
          background-color: #007bff;
          color: white;
          opacity: 0.7;
          transition: opacity 0.2s ease;
        }

        .align-ra-no-edit-btn:hover {
          background-color: #0056b3;
          opacity: 1;
        }

        .align-ra-no-display-wrapper {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          width: 100%;
        }

        .align-ra-no-value {
          flex: 1;
          font-size: 13px;
          color: #333;
        }

        .align-ra-no-spinner {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .align-ra-no-container {
            min-width: 120px;
          }

          .align-ra-no-input {
            min-width: 80px;
            font-size: 11px;
          }

          .align-ra-no-save-btn,
          .align-ra-no-cancel-btn,
          .align-ra-no-edit-btn {
            min-width: 20px;
            height: 20px;
            font-size: 10px;
          }
        }
      `}</style>
    </div>
  )
}

export default PaintingDatabasesearch;