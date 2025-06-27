import { useState, useEffect } from "react";
import { IoMdOpen } from "react-icons/io";
import { AiOutlineLoading3Quarters } from "react-icons/ai";
import { MdSave, MdEdit, MdDelete } from "react-icons/md";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";
import DeleteConfirm from "../DeleteComponent/DeleteConfirm";
import "../DeleteComponent/DeleteDesign.css";
import "../FabricationNewComponent/FabricationDatabasesearch.css";

const FabricationDatabasesearch = () => {
  // API Base URL
  const API_BASE_URL = "http://195.35.45.56:5522/api/V2.0"

  // State management
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [tableData, setTableData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [drawingNumbers, setDrawingNumbers] = useState([])
  const [markNumbers, setMarkNumbers] = useState([])

  // Additional dropdown data
  const [workOrders, setWorkOrders] = useState([])
  const [plantLocations, setPlantLocations] = useState([])
  const [serialNumbers, setSerialNumbers] = useState([]) // Serial numbers from bits_po_entry_lines
  const [raNumbers, setRaNumbers] = useState([]) // RA numbers from bits_drawing_entry

  // Filter states
  const [selectedDrawingNo, setSelectedDrawingNo] = useState("")
  const [selectedMarkNo, setSelectedMarkNo] = useState("")
  const [selectedWorkOrder, setSelectedWorkOrder] = useState("")
  const [selectedPlantLocation, setSelectedPlantLocation] = useState("")
  const [selectedSerialNo, setSelectedSerialNo] = useState("")

  // NEW: RA NO state for filter section
  const [filterRaNo, setFilterRaNo] = useState("")
  const [savingFilterRaNo, setSavingFilterRaNo] = useState(false)

  // Selected filter values for display with aggregated data
  const [selectedFilters, setSelectedFilters] = useState({
    workOrder: "",
    buildingName: "",
    drawingNo: "",
    markNo: "",
    // Aggregated values to display in filters section
    totalMarkWeight: 0,
    markWgt: 0,
    markQty: 0,
  })

  // RA.NO states for table rows
  const [raNoValues, setRaNoValues] = useState({})
  const [savingRaNo, setSavingRaNo] = useState({})

  // Move to Erection popup states
  const [showMoveToErectionPopup, setShowMoveToErectionPopup] = useState(false)
  const [selectedMarkNosForErection, setSelectedMarkNosForErection] = useState([])
  const [availableMarkNosForErection, setAvailableMarkNosForErection] = useState([])

  // Edit states
  const [editingRow, setEditingRow] = useState(null)
  const [editFormData, setEditFormData] = useState({})

  // Delete confirmation modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)

  // Fabrication process states - tracks checkbox states for each row
  const [fabricationStages, setFabricationStages] = useState({})

  // Fabrication stages in order
  const FABRICATION_STAGES = ["cutting", "fitUp", "welding", "finishing"]
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

  // Initialize fabrication stages for a row from backend data
  const initializeFabricationStagesFromData = (lineId, rowData) => {
    setFabricationStages((prev) => ({
      ...prev,
      [lineId]: {
        cutting: rowData.cuttingStage === "Y",
        fitUp: rowData.fitUpStage === "Y",
        welding: rowData.weldingStage === "Y",
        finishing: rowData.finishingStage === "Y",
      },
    }))
  }

  // Handle fabrication stage checkbox change with sequential logic
  const handleStageChange = (lineId, stage, checked) => {
    setFabricationStages((prev) => {
      const currentStages = prev[lineId] || {
        cutting: false,
        fitUp: false,
        welding: false,
        finishing: false,
      }

      const newStages = { ...currentStages }
      const stageIndex = FABRICATION_STAGES.indexOf(stage)

      if (checked) {
        // If checking a stage, automatically check all previous stages
        for (let i = 0; i <= stageIndex; i++) {
          newStages[FABRICATION_STAGES[i]] = true
        }
      } else {
        // If unchecking a stage, automatically uncheck all subsequent stages
        for (let i = stageIndex; i < FABRICATION_STAGES.length; i++) {
          newStages[FABRICATION_STAGES[i]] = false
        }
      }

      return {
        ...prev,
        [lineId]: newStages,
      }
    })
  }

  // Save fabrication stages to backend
  const handleSaveFabricationStages = async () => {
    try {
      setSaving(true)

      // Prepare fabrication stage updates
      const fabricationUpdates = Object.keys(fabricationStages).map((lineId) => {
        const stages = fabricationStages[lineId]
        return {
          lineId: lineId,
          cuttingStage: stages.cutting ? "Y" : "N",
          fitUpStage: stages.fitUp ? "Y" : "N",
          weldingStage: stages.welding ? "Y" : "N",
          finishingStage: stages.finishing ? "Y" : "N",
        }
      })

      if (fabricationUpdates.length === 0) {
        toast.warning("No fabrication stages to save")
        return
      }

      console.log("Saving fabrication stages:", fabricationUpdates)

      const response = await fetch(`${API_BASE_URL}/updateFabricationStages/details`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fabricationStages: fabricationUpdates,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(`Successfully updated fabrication stages for ${result.updatedCount} entries!`)

        // Refresh data to get updated values
        if (selectedDrawingNo || selectedMarkNo) {
          handleSearch()
        }
      } else {
        const errorText = await response.text()
        console.error("Save fabrication stages failed:", errorText)
        toast.error(`Failed to save fabrication stages: ${errorText}`)
      }
    } catch (error) {
      console.error("Error saving fabrication stages:", error)
      toast.error("Error saving fabrication stages: " + error.message)
    } finally {
      setSaving(false)
    }
  }

  // Handle RA.NO input change for table rows
  const handleRaNoChange = (lineId, value) => {
    setRaNoValues((prev) => ({
      ...prev,
      [lineId]: value,
    }))
  }

  // Save RA.NO to backend for table rows
  const handleSaveRaNo = async (lineId) => {
    const raNoValue = raNoValues[lineId]
    if (!raNoValue || raNoValue.trim() === "") {
      toast.warning("Please enter RA.NO value")
      return
    }

    // Find the row data to get drawing no and mark no
    const rowData = filteredData.find((row) => row.lineId === lineId)
    if (!rowData) {
      toast.error("Row data not found")
      return
    }

    try {
      setSavingRaNo((prev) => ({ ...prev, [lineId]: true }))

      const response = await fetch(`${API_BASE_URL}/updateDrawingEntryRaNo/details`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lineId: String(lineId), // FIXED: Ensure lineId is string
          drawingNo: String(rowData.drawingNo || ""),
          markNo: String(rowData.markNo || ""),
          raNo: String(raNoValue.trim()),
        }),
      })

      if (response.ok) {
        toast.success("RA.NO saved successfully!")

        // Update the table data to reflect the saved value
        setTableData((prev) => prev.map((row) => (row.lineId === lineId ? { ...row, raNo: raNoValue.trim() } : row)))
        setFilteredData((prev) => prev.map((row) => (row.lineId === lineId ? { ...row, raNo: raNoValue.trim() } : row)))
      } else {
        const errorText = await response.text()
        console.error("Save RA.NO failed:", errorText)
        toast.error(`Failed to save RA.NO: ${errorText}`)
      }
    } catch (error) {
      console.error("Error saving RA.NO:", error)
      toast.error("Error saving RA.NO: " + error.message)
    } finally {
      setSavingRaNo((prev) => ({ ...prev, [lineId]: false }))
    }
  }

  // NEW: Save RA.NO from filter section to selected drawing/mark entries
  const handleSaveFilterRaNo = async () => {
    if (!filterRaNo || filterRaNo.trim() === "") {
      toast.warning("Please enter RA.NO value")
      return
    }

    if (!selectedDrawingNo || !selectedMarkNo) {
      toast.warning("Please select both Drawing No and Mark No before saving RA.NO")
      return
    }

    try {
      setSavingFilterRaNo(true)

      // Find all entries that match the selected drawing and mark numbers
      const matchingEntries = filteredData.filter(
        (row) => row.drawingNo === selectedDrawingNo && row.markNo === selectedMarkNo,
      )

      if (matchingEntries.length === 0) {
        toast.warning("No entries found for the selected Drawing No and Mark No")
        return
      }

      // Update RA.NO for all matching entries
      const updatePromises = matchingEntries.map((entry) =>
        fetch(`${API_BASE_URL}/updateDrawingEntryRaNo/details`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            lineId: String(entry.lineId), // FIXED: Ensure lineId is string
            drawingNo: String(entry.drawingNo || ""),
            markNo: String(entry.markNo || ""),
            raNo: String(filterRaNo.trim()),
          }),
        }),
      )

      const responses = await Promise.all(updatePromises)
      const successCount = responses.filter((response) => response.ok).length

      if (successCount === matchingEntries.length) {
        toast.success(`RA.NO saved successfully for ${successCount} entries!`)

        // Update the table data to reflect the saved values
        setTableData((prev) =>
          prev.map((row) =>
            row.drawingNo === selectedDrawingNo && row.markNo === selectedMarkNo
              ? { ...row, raNo: filterRaNo.trim() }
              : row,
          ),
        )
        setFilteredData((prev) =>
          prev.map((row) =>
            row.drawingNo === selectedDrawingNo && row.markNo === selectedMarkNo
              ? { ...row, raNo: filterRaNo.trim() }
              : row,
          ),
        )

        // Update raNoValues state for table inputs
        const updatedRaNoValues = { ...raNoValues }
        matchingEntries.forEach((entry) => {
          updatedRaNoValues[entry.lineId] = filterRaNo.trim()
        })
        setRaNoValues(updatedRaNoValues)

        // Clear the filter input
        setFilterRaNo("")
      } else {
        toast.error(`Failed to save RA.NO for some entries. ${successCount}/${matchingEntries.length} successful.`)
      }
    } catch (error) {
      console.error("Error saving filter RA.NO:", error)
      toast.error("Error saving RA.NO: " + error.message)
    } finally {
      setSavingFilterRaNo(false)
    }
  }

  // Fetch dropdown data on component mount
  useEffect(() => {
    fetchDropdownData()
  }, [])

  // Fetch dropdown data for all dropdowns
  const fetchDropdownData = async () => {
    try {
      setLoading(true)

      // Fetch distinct drawing numbers
      console.log("Fetching drawing numbers from:", `${API_BASE_URL}/getDistinctBitsDrawingEntryDrawingNumbers/details`)
      const drawingResponse = await fetch(`${API_BASE_URL}/getDistinctBitsDrawingEntryDrawingNumbers/details`)
      console.log("Drawing response status:", drawingResponse.status)
      if (drawingResponse.ok) {
        const drawingData = await drawingResponse.json()
        console.log("Drawing Numbers received:", drawingData)
        setDrawingNumbers(drawingData || [])
      } else {
        console.error("Error fetching drawing numbers:", drawingResponse.status, drawingResponse.statusText)
        const errorText = await drawingResponse.text()
        console.error("Error details:", errorText)
        toast.error(`Error fetching drawing numbers: ${drawingResponse.statusText}`)
      }

      // Fetch distinct mark numbers
      console.log("Fetching mark numbers from:", `${API_BASE_URL}/getDistinctBitsDrawingEntryMarkNumbers/details`)
      const markResponse = await fetch(`${API_BASE_URL}/getDistinctBitsDrawingEntryMarkNumbers/details`)
      console.log("Mark response status:", markResponse.status)
      if (markResponse.ok) {
        const markData = await markResponse.json()
        console.log("Mark Numbers received:", markData)
        setMarkNumbers(markData || [])
        setAvailableMarkNosForErection(markData || [])
      } else {
        console.error("Error fetching mark numbers:", markResponse.status, markResponse.statusText)
        const errorText = await markResponse.text()
        console.error("Error details:", errorText)
        toast.error(`Error fetching mark numbers: ${markResponse.statusText}`)
      }

      // Rest of the fetch operations remain the same...
      // Fetch work orders
      const workOrderResponse = await fetch(`${API_BASE_URL}/getworkorder/number`)
      if (workOrderResponse.ok) {
        const workOrderData = await workOrderResponse.json()
        setWorkOrders(workOrderData || [])
        console.log("Work Orders:", workOrderData)
      } else {
        console.error("Error fetching work orders:", workOrderResponse.statusText)
        toast.error(`Error fetching work orders: ${workOrderResponse.statusText}`)
      }

      // Fetch plant locations
      const plantLocationResponse = await fetch(`${API_BASE_URL}/getAllPlantLocations/details`)
      if (plantLocationResponse.ok) {
        const plantLocationData = await plantLocationResponse.json()
        setPlantLocations(plantLocationData || [])
        console.log("Plant Locations:", plantLocationData)
      } else {
        console.error("Error fetching plant locations:", plantLocationResponse.statusText)
        toast.error(`Error fetching plant locations: ${plantLocationResponse.statusText}`)
      }

      // NEW: Fetch serial numbers from bits_po_entry_lines
      const serialNumberResponse = await fetch(`${API_BASE_URL}/getDistinctSerialNumbers/details`)
      if (serialNumberResponse.ok) {
        const serialNumberData = await serialNumberResponse.json()
        setSerialNumbers(serialNumberData || [])
        console.log("Serial Numbers:", serialNumberData)
      } else {
        console.error("Error fetching serial numbers:", serialNumberResponse.statusText)
        // Don't show error toast for this as it's a new endpoint
        setSerialNumbers([])
      }

      // NEW: Fetch RA NO values from bits_drawing_entry
      const raNoResponse = await fetch(`${API_BASE_URL}/getDistinctRaNumbers/details`)
      if (raNoResponse.ok) {
        const raNoData = await raNoResponse.json()
        setRaNumbers(raNoData || [])
        console.log("RA Numbers:", raNoData)
      } else {
        console.error("Error fetching RA numbers:", raNoResponse.statusText)
        setRaNumbers([])
      }
    } catch (error) {
      console.error("Error fetching dropdown data:", error)
      toast.error(`Error fetching dropdown data: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Calculate aggregated values from filtered data
  const calculateAggregatedValues = (data) => {
    if (!data || data.length === 0) {
      return {
        totalMarkWeight: 0,
        markWgt: 0,
        markQty: 0,
      }
    }

    const totals = data.reduce(
      (acc, row) => {
        acc.totalMarkWeight += Number.parseFloat(row.totalMarkedWgt || 0)
        acc.markWgt += Number.parseFloat(row.markWeight || 0)
        acc.markQty += Number.parseFloat(row.markedQty || 0)
        return acc
      },
      {
        totalMarkWeight: 0,
        markWgt: 0,
        markQty: 0,
      },
    )

    return totals
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
      let searchUrl = `${API_BASE_URL}/searchBitsDrawingEntries/details?`
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

      // Calculate aggregated values
      const aggregatedValues = calculateAggregatedValues(data)

      // Set selected filter values for display with aggregated data
      setSelectedFilters({
        workOrder: selectedWorkOrder,
        buildingName: selectedPlantLocation,
        drawingNo: selectedDrawingNo,
        markNo: selectedMarkNo,
        // Add aggregated values
        totalMarkWeight: aggregatedValues.totalMarkWeight,
        markWgt: aggregatedValues.markWgt,
        markQty: aggregatedValues.markQty,
      })

      // Initialize fabrication stages for all rows
      data.forEach((row) => {
        initializeFabricationStagesFromData(row.lineId, row)
      })

      // Initialize RA.NO values from database
      const raNoInitialValues = {}
      data.forEach((row) => {
        raNoInitialValues[row.lineId] = row.raNo || ""
      })
      setRaNoValues(raNoInitialValues)

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
        totalMarkWeight: 0,
        markWgt: 0,
        markQty: 0,
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

      const response = await fetch(`${API_BASE_URL}/updateBitsDrawingEntry/details?lineId=${editingRow}`, {
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

  // Enhanced delete handler - shows confirmation modal instead of window.confirm
  const handleDeleteClick = (lineId) => {
    setItemToDelete(lineId)
    setShowDeleteModal(true)
    // Prevent body scroll when modal is open
    document.body.classList.add("modal-open")
  }

  // Handle delete confirmation
  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return

    try {
      setLoading(true)
      setShowDeleteModal(false)
      document.body.classList.remove("modal-open")

      const response = await fetch(`${API_BASE_URL}/deleteBitsDrawingEntry/details?lineId=${itemToDelete}`, {
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
      setItemToDelete(null)
    }
  }

  // Handle delete cancellation
  const handleDeleteCancel = () => {
    setShowDeleteModal(false)
    setItemToDelete(null)
    document.body.classList.remove("modal-open")
  }

  // Handle Move to Erection button click
  const handleMoveToErection = () => {
    setShowMoveToErectionPopup(true)
  }

  // Handle mark number selection in popup
  const handleMarkNoSelection = (markNo) => {
    setSelectedMarkNosForErection((prev) => {
      if (prev.includes(markNo)) {
        return prev.filter((m) => m !== markNo)
      } else {
        return [...prev, markNo]
      }
    })
  }

  // Handle save to erection - FIXED to transfer ALL rows with correct order_id
  const handleSaveToErection = async () => {
    if (selectedMarkNosForErection.length === 0) {
      toast.warning("Please select at least one Mark No.")
      return
    }

    try {
      setLoading(true)

      // Get ALL entries for selected mark numbers - FIXED: Get ALL rows, not just first one
      const entriesToMove = []

      // For each selected mark number, find ALL entries with that mark number
      for (const markNo of selectedMarkNosForErection) {
        const entries = tableData.filter((item) => item.markNo === markNo)
        entriesToMove.push(...entries) // Add ALL entries, not just one
      }

      if (entriesToMove.length === 0) {
        toast.error("No entries found for selected Mark Numbers")
        return
      }

      console.log(`Found ${entriesToMove.length} entries to move for ${selectedMarkNosForErection.length} mark numbers`)

      // Create erection entries with proper data format and CORRECT order_id
      const erectionEntries = entriesToMove.map((item) => ({
        lineId: item.lineId, // Preserve the same line_id
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
        // FIXED: Properly set order_id from the fabrication entry
        orderId: item.orderId || item.attribute1N || null, // Use orderId or attribute1N as fallback
        raNo: item.raNo || null,
        tenantId: item.tenantId || "DEFAULT_TENANT",
        createdBy: "system",
        lastUpdatedBy: "system",
        status: "erection",
        // Copy attributes - IMPORTANT: These contain work order and plant location
        attribute1V: item.attribute1V || null, // Work Order
        attribute2V: item.attribute2V || null, // Plant Location
        attribute3V: item.attribute3V || null,
        attribute4V: item.attribute5V || null,
        attribute1N: item.attribute1N || null, // This might contain order_id
        attribute2N: item.attribute2N || null,
        attribute3N: item.attribute3N || null,
        attribute4N: item.attribute4N || null,
        attribute5N: item.attribute5N || null,
        // Copy new fields
        drawingWeight: item.drawingWeight || null,
        markWeight: item.markWeight || null,
        // Copy fabrication stages
        cuttingStage: item.cuttingStage || "N",
        fitUpStage: item.fitUpStage || "N",
        weldingStage: item.weldingStage || "N",
        finishingStage: item.finishingStage || "N",
      }))

      console.log("Moving to erection:", erectionEntries.length, "entries")
      console.log("Sample entry with order_id:", erectionEntries[0])

      // Call the erection API
      const response = await fetch(`${API_BASE_URL}/createBulkErectionDrawingEntriesWithDuplicateCheck/details`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(erectionEntries),
      })

      if (response.ok) {
        const result = await response.json()

        // Show detailed feedback
        if (result.skippedCount > 0) {
          toast.warning(
            `${result.createdCount} entries created, ${result.skippedCount} skipped as duplicates. Total processed: ${entriesToMove.length}`,
          )
        } else {
          toast.success(
            `${result.createdCount} entries moved to Erection successfully! (${entriesToMove.length} total entries processed)`,
          )
        }

        setShowMoveToErectionPopup(false)
        setSelectedMarkNosForErection([])
      } else {
        const errorText = await response.text()
        console.error("Move to erection failed:", errorText)
        toast.error(`Failed to move to erection: ${errorText}`)
      }
    } catch (error) {
      console.error("Error moving to erection:", error)
      toast.error("Error moving to Erection: " + error.message)
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
    <div className="fab-container-mammoth">
      {/* Header */}
      <div className="fab-header-elephant">
        <div className="fab-title-tiger">
          <h3>Search for Fabrication Details</h3>
        </div>
        <div className="fab-header-buttons">
          <button
            className="fab-button-giraffe fab-save-stages-btn"
            onClick={handleSaveFabricationStages}
            disabled={saving || loading || filteredData.length === 0}
          >
            {saving ? (
              <>
                <AiOutlineLoading3Quarters className="fab-spin-icon-polar" />
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
            className="fab-button-giraffe fab-move-to-erection-btn"
            onClick={handleMoveToErection}
            disabled={filteredData.length === 0}
          >
            <span>Completed</span>
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="fab-filter-section-zebra">
        <div className="fab-filter-container-hippo">
          <div className="fab-filter-row-rhino">
            {/* Work Order Dropdown */}
            <select
              value={selectedWorkOrder}
              onChange={(e) => setSelectedWorkOrder(e.target.value)}
              className="fab-dropdown-cheetah"
            >
              <option value="">Select Work Order</option>
              {workOrders.map((workOrder, index) => (
                <option key={`work_order_${index}`} value={workOrder}>
                  {workOrder}
                </option>
              ))}
            </select>

            {/* Building Name (Plant Location) Dropdown */}
            <select
              value={selectedPlantLocation}
              onChange={(e) => setSelectedPlantLocation(e.target.value)}
              className="fab-dropdown-cheetah"
            >
              <option value="">Select Building Name</option>
              {plantLocations.map((location, index) => (
                <option key={`plant_location_${index}`} value={location}>
                  {location}
                </option>
              ))}
            </select>

            {/* Serial No Dropdown */}
            <select
              value={selectedSerialNo}
              onChange={(e) => setSelectedSerialNo(e.target.value)}
              className="fab-dropdown-cheetah"
            >
              <option value="">Select Serial No</option>
              {serialNumbers.map((serialNo, index) => (
                <option key={`serial_no_${index}`} value={serialNo}>
                  {serialNo}
                </option>
              ))}
            </select>

            {/* Drawing No Dropdown */}
            <select
              value={selectedDrawingNo}
              onChange={(e) => setSelectedDrawingNo(e.target.value)}
              className="fab-dropdown-cheetah"
            >
              <option value="">Select Drawing No</option>
              {drawingNumbers.map((drawingNo, index) => (
                <option key={`drawing_${index}`} value={drawingNo}>
                  {drawingNo}
                </option>
              ))}
            </select>

            {/* Mark No Dropdown with RA NO field */}
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <select
                value={selectedMarkNo}
                onChange={(e) => setSelectedMarkNo(e.target.value)}
                className="fab-dropdown-cheetah"
              >
                <option value="">Select Mark No</option>
                {markNumbers?.map((markNo, index) => (
                  <option key={`mark_${index}`} value={markNo}>
                    {markNo}
                  </option>
                ))}
              </select>

              {/* RA NO Free Text Field with proper functionality */}
              <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <label style={{ fontSize: "14px", fontWeight: "500", color: "#2d3748", whiteSpace: "nowrap" }}>
                  RA NO:
                </label>
                <input
                  type="text"
                  placeholder="Enter the RA NO"
                  value={filterRaNo}
                  onChange={(e) => setFilterRaNo(e.target.value)}
                  className="fab-edit-input-deer"
                  style={{ minWidth: "150px" }}
                  disabled={!selectedMarkNo || !selectedDrawingNo}
                />
                <button
                  className="fab-action-button-elk fab-save-button-impala"
                  title="Save RA NO"
                  onClick={handleSaveFilterRaNo}
                  disabled={!selectedMarkNo || !selectedDrawingNo || savingFilterRaNo}
                  style={{ minWidth: "32px", height: "32px" }}
                >
                  {savingFilterRaNo ? <AiOutlineLoading3Quarters className="fab-spin-icon-polar" /> : <MdSave />}
                </button>
              </div>
            </div>

            {/* Search Button */}
            <button className="fab-search-button-leopard" onClick={handleSearch} disabled={loading}>
              <span>Search</span>
            </button>
          </div>
        </div>
      </div>

      {/* Selected Filters Display with Aggregated Values */}
      {(selectedFilters.workOrder ||
        selectedFilters.buildingName ||
        selectedFilters.drawingNo ||
        selectedFilters.markNo) && (
        <div className="fab-selected-filters-section">
          <div className="fab-selected-filters-container">
            <h4>Selected Filters:</h4>
            <div className="fab-selected-filters-grid">
              {selectedFilters.workOrder && (
                <div className="fab-filter-item">
                  <span className="fab-filter-label">Work Order:</span>
                  <span className="fab-filter-value">{selectedFilters.workOrder}</span>
                </div>
              )}
              {selectedFilters.buildingName && (
                <div className="fab-filter-item">
                  <span className="fab-filter-label">Building Name:</span>
                  <span className="fab-filter-value">{selectedFilters.buildingName}</span>
                </div>
              )}
              {selectedFilters.drawingNo && (
                <div className="fab-filter-item">
                  <span className="fab-filter-label">Drawing No:</span>
                  <span className="fab-filter-value">{selectedFilters.drawingNo}</span>
                </div>
              )}
              {selectedFilters.markNo && (
                <div className="fab-filter-item">
                  <span className="fab-filter-label">Mark No:</span>
                  <span className="fab-filter-value">{selectedFilters.markNo}</span>
                </div>
              )}
              {selectedSerialNo && (
                <div className="fab-filter-item">
                  <span className="fab-filter-label">Serial No:</span>
                  <span className="fab-filter-value">{selectedSerialNo}</span>
                </div>
              )}

              {/* Display aggregated values */}
              {filteredData.length > 0 && (
                <>
                  <div className="fab-filter-item">
                    <span className="fab-filter-label">Total Mark Weight:</span>
                    <span className="fab-filter-value">{formatNumber(selectedFilters.totalMarkWeight)}</span>
                  </div>
                  <div className="fab-filter-item">
                    <span className="fab-filter-label">Mark Wgt:</span>
                    <span className="fab-filter-value">{formatNumber(selectedFilters.markWgt)}</span>
                  </div>
                  <div className="fab-filter-item">
                    <span className="fab-filter-label">Mark Qty:</span>
                    <span className="fab-filter-value">{formatNumber(selectedFilters.markQty)}</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Table Section */}
      <div className="fab-table-container-lynx">
        {loading && (
          <div className="fab-loading-overlay-panther">
            <div className="fab-loading-spinner-jaguar">
              <AiOutlineLoading3Quarters />
            </div>
            <div className="fab-loading-text-cougar">Loading...</div>
          </div>
        )}

        <div className="fab-table-wrapper-bear">
          <table className="fab-table-wolf">
            <thead>
              <tr>
                <th>Order #</th>
                {/* COMMENTED OUT COLUMNS - KEEP CODE BUT HIDDEN */}
                {/* <th>Total Mark Weight</th> */}
                {/* <th>Mark Wgt</th> */}
                {/* <th>Mark Qty</th> */}
                {/* <th>Item No</th> */}
                <th>Section Code</th>
                <th>Section Name</th>
                <th>Section Weight</th>
                <th>Width</th>
                <th>Length</th>
                <th>Item Qty</th>
                <th>Item Weight</th>
                <th>Total Item Weight</th>
                <th>Status</th>
                {/* Fabrication Process Columns */}
                <th className="fab-process-header">Cutting</th>
                <th className="fab-process-header">Fit Up</th>
                <th className="fab-process-header">Welding</th>
                <th className="fab-process-header">Finishing</th>
                <th>Actions</th>
                <th>RA.NO</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, index) => (
                <tr key={`row_${index}`} className="fab-table-row-fox">
                  <td>
                    <div className="fab-order-icon-rabbit">
                      <IoMdOpen />
                    </div>
                  </td>
                  {/* COMMENTED OUT COLUMNS DATA - KEEP CODE BUT HIDDEN */}
                  {/* <td>{formatNumber(row.totalMarkedWgt)}</td> */}
                  {/* <td>{formatNumber(row.markWeight)}</td> */}
                  {/* <td>{formatNumber(row.markedQty)}</td> */}
                  {/* <td>{row.itemNo || "-"}</td> */}
                  <td>
                    {editingRow === row.lineId ? (
                      <input
                        type="text"
                        value={editFormData.sessionCode}
                        className="fab-edit-input-deer fab-readonly-input"
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
                        className="fab-edit-input-deer fab-readonly-input"
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
                        className="fab-edit-input-deer"
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
                        className="fab-edit-input-deer"
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
                        className="fab-edit-input-deer"
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
                        className="fab-edit-input-deer"
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
                        className="fab-edit-input-deer"
                      />
                    ) : (
                      formatNumber(row.totalItemWeight)
                    )}
                  </td>
                  <td>
                    <span className="fab-status-badge-moose">Fabrication</span>
                  </td>

                  {/* Fabrication Process Columns */}
                  {FABRICATION_STAGES.map((stage) => (
                    <td key={`${row.lineId}_${stage}`} className="fab-process-cell">
                      <div className="fab-checkbox-container">
                        <input
                          type="checkbox"
                          id={`${row.lineId}_${stage}`}
                          checked={fabricationStages[row.lineId]?.[stage] || false}
                          onChange={(e) => handleStageChange(row.lineId, stage, e.target.checked)}
                          className="fab-process-checkbox"
                          aria-label={`${STAGE_LABELS[stage]} for ${row.markNo || "item"}`}
                        />
                        <label
                          htmlFor={`${row.lineId}_${stage}`}
                          className="fab-checkbox-label"
                          title={`Mark ${STAGE_LABELS[stage]} as ${fabricationStages[row.lineId]?.[stage] ? "incomplete" : "complete"}`}
                        />
                      </div>
                    </td>
                  ))}

                  <td>
                    <div className="fab-actions-container-yak">
                      {editingRow === row.lineId ? (
                        <>
                          <button
                            onClick={handleSaveEdit}
                            className="fab-action-button-elk fab-save-button-impala"
                            title="Save"
                          >
                            <MdSave />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="fab-action-button-elk fab-cancel-button-bison"
                            title="Cancel"
                          >
                            ✕
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(row)}
                            className="fab-action-button-elk fab-edit-button-impala"
                            title="Modify"
                          >
                            <MdEdit />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(row.lineId)}
                            className="fab-action-button-elk fab-delete-button-bison"
                            title="Delete"
                          >
                            <MdDelete />
                          </button>
                        </>
                      )}
                    </div>
                  </td>

                  {/* RA.NO COLUMN - RESTORED */}
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                      <input
                        type="text"
                        placeholder="Enter RA.NO"
                        value={raNoValues[row.lineId] || ""}
                        onChange={(e) => handleRaNoChange(row.lineId, e.target.value)}
                        className="fab-edit-input-deer"
                        style={{ minWidth: "120px" }}
                      />
                      <button
                        className="fab-action-button-elk fab-save-button-impala"
                        title="Save RA.NO"
                        onClick={() => handleSaveRaNo(row.lineId)}
                        disabled={savingRaNo[row.lineId]}
                        style={{ minWidth: "32px", height: "32px" }}
                      >
                        {savingRaNo[row.lineId] ? (
                          <AiOutlineLoading3Quarters className="fab-spin-icon-polar" />
                        ) : (
                          <MdSave />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && !loading && (
                <tr className="fab-empty-row-camel">
                  <td colSpan="17">
                    <div className="fab-empty-state-llama">
                      <div className="fab-empty-text-alpaca">
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

      {/* Move to Erection Popup */}
      {showMoveToErectionPopup && (
        <div className="fab-popup-overlay-shark">
          <div className="fab-popup-container-whale">
            <div className="fab-popup-header-dolphin">
              <h3>Mark No.</h3>
              <button onClick={() => setShowMoveToErectionPopup(false)} className="fab-popup-close-octopus">
                ✕
              </button>
            </div>
            <div className="fab-popup-content-squid">
              <div className="fab-multiselect-container-jellyfish">
                <div className="fab-multiselect-label-starfish">Select Mark No(s):</div>
                <div className="fab-multiselect-options-seahorse">
                  {availableMarkNosForErection.map((markNo, index) => (
                    <label key={`popup_mark_${index}`} className="fab-checkbox-label-crab">
                      <input
                        type="checkbox"
                        checked={selectedMarkNosForErection.includes(markNo)}
                        onChange={() => handleMarkNoSelection(markNo)}
                        className="fab-checkbox-input-lobster"
                      />
                      <span className="fab-checkbox-text-shrimp">{markNo}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="fab-popup-actions-turtle">
              <button
                onClick={() => setShowMoveToErectionPopup(false)}
                className="fab-popup-button-seal fab-cancel-button-walrus"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveToErection}
                className="fab-popup-button-seal fab-save-button-penguin"
                disabled={loading || selectedMarkNosForErection.length === 0}
              >
                {loading ? (
                  <>
                    <AiOutlineLoading3Quarters className="fab-spin-icon-polar" />
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

      {/* Delete Confirmation Modal */}
      <DeleteConfirm
        isOpen={showDeleteModal}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        title="Confirm Deletion"
        message="Are you sure you want to delete this item? It will impact on Fabrication Item."
      />

      <ToastContainer />
    </div>
  )
}

export default FabricationDatabasesearch;
