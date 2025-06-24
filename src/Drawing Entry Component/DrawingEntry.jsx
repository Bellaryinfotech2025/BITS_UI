import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { IoMdOpen } from "react-icons/io"
import { AiOutlineLoading3Quarters } from "react-icons/ai"
import { MdSave, MdAdd } from "react-icons/md"
import { FaCheck, FaChevronUp, FaChevronDown, FaSearch } from "react-icons/fa"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import DeleteConfirm from "../DeleteComponent/DeleteConfirm"
import "../DeleteComponent/DeleteDesign.css"
import "../Drawing Entry Component/DrawingEntry.css"

const DrawingEntry = () => {
  // API Base URL
  const API_BASE_URL = "http://195.35.45.56:5522/api/V2.0"

  // Drawing Entry State (Single Row)
  const [drawingEntryData, setDrawingEntryData] = useState({
    id: "drawing_entry_1",
    workOrder: "",
    orderId: null,
    plantLocation: "",
    department: "",
    workLocation: "",
    lineNumber: "",
    lineNumberDisplay: "",
    drawingNo: "",
    markWeight: "",
    totalMarkWeight: "",
    drawingReceivedDate: "",
    targetDate: "",
    markNo: "",
    markQty: "",
  })

  // BOM Entry State (Multiple Rows)
  const [bomEntryRows, setBomEntryRows] = useState([])
  const [loading, setLoading] = useState(false)

  // Delete confirmation modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [itemToDelete, setItemToDelete] = useState(null)

  // API Data State
  const [workOrderOptions, setWorkOrderOptions] = useState([])
  const [sectionCodeOptions, setSectionCodeOptions] = useState([])
  const [lineNumberOptions, setLineNumberOptions] = useState([])
  const [searchTerms, setSearchTerms] = useState({})
  const [filteredSectionCodes, setFilteredSectionCodes] = useState({})
  const [showDropdowns, setShowDropdowns] = useState({})
  const [filteredWorkOrders, setFilteredWorkOrders] = useState([])
  const [dropdownPositions, setDropdownPositions] = useState({})

  // Refs for dropdown positioning
  const dropdownRefs = useRef({})
  const fieldRefs = useRef({})

  // Saved entries for display
  const [savedEntries, setSavedEntries] = useState([])

  // Fetch work orders, section codes, and line numbers on component mount
  useEffect(() => {
    fetchWorkOrders()
    fetchSectionCodes()
    fetchLineNumbers()
    // Initialize with one BOM row
    setBomEntryRows([createNewBomRow()])
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".drAOenhancedDropdownContainer")) {
        setShowDropdowns({})
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Handle scroll events to update dropdown positions
  useEffect(() => {
    const handleScroll = () => {
      Object.keys(showDropdowns).forEach((key) => {
        if (showDropdowns[key] && fieldRefs.current[key]) {
          updateDropdownPosition(key)
        }
      })
    }

    window.addEventListener("scroll", handleScroll, true)
    return () => window.removeEventListener("scroll", handleScroll, true)
  }, [showDropdowns])

  // Calculate total item weight from all BOM rows and update Drawing Entry Mark Wgt
  const totalItemWeight = useMemo(() => {
    return bomEntryRows.reduce((sum, row) => {
      const totalWeight = Number.parseFloat(row.totalItemWeight) || 0
      return sum + totalWeight
    }, 0)
  }, [bomEntryRows])

  // Update Mark Weight when totalItemWeight changes
  const updateMarkWeight = useCallback(() => {
    if (totalItemWeight > 0) {
      const markQty = Number.parseFloat(drawingEntryData.markQty) || 0
      const totalMarkWeight = totalItemWeight * markQty
      setDrawingEntryData((prev) => ({
        ...prev,
        markWeight: totalItemWeight.toFixed(3),
        totalMarkWeight: totalMarkWeight.toFixed(3),
      }))
    }
  }, [totalItemWeight, drawingEntryData.markQty])

  useEffect(() => {
    updateMarkWeight()
  }, [totalItemWeight])

  // Enhanced dropdown positioning function
  const updateDropdownPosition = (fieldId) => {
    const fieldElement = fieldRefs.current[fieldId]
    if (!fieldElement) return

    const rect = fieldElement.getBoundingClientRect()
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft

    const position = {
      top: rect.bottom + scrollTop + 2,
      left: rect.left + scrollLeft,
      width: Math.max(rect.width, 250),
      maxWidth: 350,
    }

    setDropdownPositions((prev) => ({
      ...prev,
      [fieldId]: position,
    }))
  }

  // Fetch work orders from bits_po_entry_header table
  const fetchWorkOrders = async () => {
    try {
      console.log("🔄 Fetching work orders from bits_po_entry_header table...")
      const response = await fetch(`${API_BASE_URL}/getworkorder/number`)

      if (response.ok) {
        const data = await response.json()
        console.log("✅ Raw work order data from database:", data)

        if (Array.isArray(data) && data.length > 0) {
          const formattedOptions = data.map((workOrder) => ({
            value: workOrder,
            label: workOrder,
          }))
          setWorkOrderOptions(formattedOptions)
          setFilteredWorkOrders(formattedOptions)
          console.log("✅ Successfully fetched work orders from database:", formattedOptions)
        } else {
          console.warn("⚠️ No work orders found in database")
          setWorkOrderOptions([])
          setFilteredWorkOrders([])
          toast.warning("No work orders found in database. Please add some work orders first.")
        }
      } else {
        console.error("❌ Failed to fetch work orders, status:", response.status)
        const errorText = await response.text()
        console.error("Error response:", errorText)
        setWorkOrderOptions([])
        setFilteredWorkOrders([])
        toast.error(`Failed to fetch work orders: ${response.status} - ${errorText}`)
      }
    } catch (error) {
      console.error("❌ Error fetching work orders:", error)
      setWorkOrderOptions([])
      setFilteredWorkOrders([])
      toast.error(`Error connecting to server: ${error.message}`)
    }
  }

  // Fetch section codes from API with error handling
  const fetchSectionCodes = async () => {
    try {
      console.log("🔄 Fetching section codes...")
      const response = await fetch(`${API_BASE_URL}/service_code_entry/codes`)

      if (response.ok) {
        const data = await response.json()
        console.log("✅ Raw section code data:", data)

        if (Array.isArray(data) && data.length > 0) {
          const formattedOptions = data.map((code) => ({
            value: code,
            label: code,
          }))
          setSectionCodeOptions(formattedOptions)
          console.log("✅ Successfully fetched section codes:", formattedOptions)
        } else {
          console.warn("⚠️ No section codes found")
          setSectionCodeOptions([])
          toast.warning("No section codes found in database")
        }
      } else {
        console.error("❌ Failed to fetch section codes, status:", response.status)
        setSectionCodeOptions([])
        toast.error("Failed to fetch section codes from server")
      }
    } catch (error) {
      console.error("❌ Error fetching section codes:", error)
      setSectionCodeOptions([])
      toast.error(`Error fetching section codes: ${error.message}`)
    }
  }

  // Fetch line numbers from bits_po_entry_lines table with error handling
  const fetchLineNumbers = async () => {
    try {
      console.log("🔄 Fetching line numbers...")
      const response = await fetch(`${API_BASE_URL}/getAllBitsLines/details`)

      if (response.ok) {
        const data = await response.json()
        console.log("✅ Raw line number data:", data)

        if (Array.isArray(data) && data.length > 0) {
          const formattedOptions = data.map((line) => ({
            value: line.lineId,
            label: line.lineNumber ? line.lineNumber.toString() : `${line.lineId}`,
            lineData: line,
          }))
          setLineNumberOptions(formattedOptions)
          console.log("✅ Successfully fetched line numbers:", formattedOptions)
        } else {
          console.warn("⚠️ No line numbers found")
          setLineNumberOptions([])
          toast.warning("No line numbers found in database")
        }
      } else {
        console.error("❌ Failed to fetch line numbers, status:", response.status)
        setLineNumberOptions([])
        toast.error("Failed to fetch line numbers from server")
      }
    } catch (error) {
      console.error("❌ Error fetching line numbers:", error)
      setLineNumberOptions([])
      toast.error(`Error fetching line numbers: ${error.message}`)
    }
  }

  // Fetch work order details when a work order is selected
  const fetchWorkOrderDetails = async (workOrder) => {
    try {
      console.log(`🔄 Fetching details for work order: ${workOrder}`)
      const response = await fetch(`${API_BASE_URL}/getworkorder/number/${workOrder}`)

      if (response.ok) {
        const data = await response.json()
        console.log("✅ Work order details from database:", data)

        // Check different possible field names for order_id
        const orderId = data.orderId || data.order_id || data.id || null

        console.log("Extracted order_id:", orderId) // Debug log

        setDrawingEntryData((prev) => ({
          ...prev,
          orderId: orderId, // Store the order_id
          plantLocation: data.plantLocation || data.plant_location || "",
          department: data.department || "",
          workLocation: data.workLocation || data.work_location || "",
        }))

        if (orderId) {
          toast.success(`Loaded details for work order ${workOrder} (Order ID: ${orderId})`)
        } else {
          toast.warning(`Work order ${workOrder} loaded but no Order ID found`)
        }
      } else {
        console.error("❌ Failed to fetch work order details")
        toast.error(`Failed to fetch details for work order ${workOrder}`)
      }
    } catch (error) {
      console.error("❌ Error fetching work order details:", error)
      toast.error(`Error fetching work order details: ${error.message}`)
    }
  }

  // Fetch section code details when a section code is selected
  const fetchSectionCodeDetails = async (sectionCode, rowId) => {
    try {
      console.log(`🔄 Fetching details for section code: ${sectionCode}`)
      const response = await fetch(`${API_BASE_URL}/service_code_entry/code/${sectionCode}`)

      if (response.ok) {
        const data = await response.json()
        console.log("✅ Section code details:", data)

        setBomEntryRows((prev) =>
          prev.map((row) => {
            if (row.id === rowId) {
              const updatedRow = {
                ...row,
                sectionName: data.name || "",
                secWeight: data.wgt || 0,
              }

              // Calculate item weight and total item weight
              if (updatedRow.width && updatedRow.length) {
                const width = Number.parseFloat(updatedRow.width) || 0
                const length = Number.parseFloat(updatedRow.length) || 0
                const secWeight = Number.parseFloat(data.wgt) || 0
                const itemQty = Number.parseFloat(updatedRow.itemQty) || 0

                // Item Weight = (width/1000) * (length/1000) * secWeight (read-only)
                updatedRow.itemWeight = ((width / 1000) * (length / 1000) * secWeight).toFixed(3)

                // Total Item Weight = Item Weight * Item Qty
                updatedRow.totalItemWeight = (Number.parseFloat(updatedRow.itemWeight) * itemQty).toFixed(3)
              }

              return updatedRow
            }
            return row
          }),
        )
      } else {
        console.error("❌ Failed to fetch section code details")
        toast.error(`Failed to fetch details for section code ${sectionCode}`)
      }
    } catch (error) {
      console.error("❌ Error fetching section code details:", error)
      toast.error(`Error fetching section code details: ${error.message}`)
    }
  }

  // Handle search input for section codes
  const handleSectionCodeSearch = (rowId, term) => {
    setSearchTerms((prev) => ({ ...prev, [rowId]: term }))

    if (!term) {
      setFilteredSectionCodes((prev) => ({ ...prev, [rowId]: sectionCodeOptions }))
    } else {
      const filtered = sectionCodeOptions.filter((option) => option.value.toLowerCase().includes(term.toLowerCase()))
      setFilteredSectionCodes((prev) => ({ ...prev, [rowId]: filtered }))
    }
  }

  // Handle section code selection
  const handleSectionCodeSelect = (rowId, sectionCode) => {
    // Update the form data
    setBomEntryRows((prev) =>
      prev.map((row) => {
        if (row.id === rowId) {
          return { ...row, sectionCode: sectionCode }
        }
        return row
      }),
    )

    // Clear search term
    setSearchTerms((prev) => ({ ...prev, [rowId]: "" }))

    // Hide dropdown
    setShowDropdowns((prev) => ({ ...prev, [rowId]: false }))

    // Fetch section code details
    if (sectionCode) {
      fetchSectionCodeDetails(sectionCode, rowId)
    }
  }

  // Handle work order search
  const handleWorkOrderSearch = (term) => {
    setSearchTerms((prev) => ({ ...prev, workOrder: term }))

    if (!term) {
      setFilteredWorkOrders(workOrderOptions)
    } else {
      const filtered = workOrderOptions.filter((option) => option.value.toLowerCase().includes(term.toLowerCase()))
      setFilteredWorkOrders(filtered)
    }
  }

  // Handle work order selection
  const handleWorkOrderSelect = (workOrder) => {
    handleDrawingEntryInputChange({ target: { name: "workOrder", value: workOrder } })
    setShowDropdowns((prev) => ({ ...prev, workOrder: false }))
    setSearchTerms((prev) => ({ ...prev, workOrder: "" }))
  }

  // Enhanced dropdown toggle with positioning
  const toggleDropdown = (fieldId) => {
    setShowDropdowns((prev) => {
      const newState = { ...prev, [fieldId]: !prev[fieldId] }

      // If opening dropdown, calculate position
      if (newState[fieldId]) {
        setTimeout(() => updateDropdownPosition(fieldId), 10)
      }

      return newState
    })
  }

  // Generate unique ID for new rows
  const generateUniqueId = () => {
    return `row_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  const createNewBomRow = () => {
    const newId = generateUniqueId()
    // Initialize search state for new row
    setSearchTerms((prev) => ({ ...prev, [newId]: "" }))
    setFilteredSectionCodes((prev) => ({ ...prev, [newId]: sectionCodeOptions }))
    setShowDropdowns((prev) => ({ ...prev, [newId]: false }))

    return {
      id: newId,
      itemNo: "",
      sectionCode: "",
      sectionName: "",
      secWeight: "",
      width: "",
      length: "",
      itemQty: "",
      itemWeight: "",
      totalItemWeight: "",
    }
  }

  const handleDrawingEntryInputChange = (e) => {
    const { name, value } = e.target
    setDrawingEntryData((prev) => {
      const updatedData = { ...prev, [name]: value }

      // If work order is changed, fetch the related details
      if (name === "workOrder" && value) {
        fetchWorkOrderDetails(value)
      }

      // If line number is changed, update display value
      if (name === "lineNumber") {
        const selectedLine = lineNumberOptions.find((option) => option.value.toString() === value)
        if (selectedLine) {
          updatedData.lineNumberDisplay = selectedLine.label
          console.log("Selected line:", selectedLine)
        } else {
          updatedData.lineNumberDisplay = ""
        }
      }

      // Calculate Total Mark Weight when Mark Qty changes
      if (name === "markQty") {
        const markWeight = Number.parseFloat(updatedData.markWeight) || 0
        const markQty = Number.parseFloat(value) || 0
        updatedData.totalMarkWeight = (markWeight * markQty).toFixed(3)
      }

      return updatedData
    })
  }

  const handleBomInputChange = (rowId, e) => {
    const { name, value } = e.target
    setBomEntryRows((prev) =>
      prev.map((row) => {
        if (row.id === rowId) {
          const updatedRow = { ...row, [name]: value }

          // Calculate item weight and total item weight
          if (name === "width" || name === "length" || name === "itemQty" || name === "secWeight") {
            const width = Number.parseFloat(name === "width" ? value : updatedRow.width) || 0
            const length = Number.parseFloat(name === "length" ? value : updatedRow.length) || 0
            const itemQty = Number.parseFloat(name === "itemQty" ? value : updatedRow.itemQty) || 0
            const secWeight = Number.parseFloat(name === "secWeight" ? value : updatedRow.secWeight) || 0

            // Item Weight = (width/1000) * (length/1000) * secWeight (read-only)
            updatedRow.itemWeight = ((width / 1000) * (length / 1000) * secWeight).toFixed(3)

            // Total Item Weight = Item Weight * Item Qty
            updatedRow.totalItemWeight = (Number.parseFloat(updatedRow.itemWeight) * itemQty).toFixed(3)
          }

          return updatedRow
        }
        return row
      }),
    )
  }

  const handleAddBomRow = () => {
    setBomEntryRows((prev) => [...prev, createNewBomRow()])
  }

  const showSuccessToast = (message) => {
    toast.success(
      <div className="drAOsuccessToastgi">
        <FaCheck className="drAOtoastIcongi" />
        <span className="drAOtoastTextgi">{message}</span>
      </div>,
      {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        className: "drAOcustomToastgi",
      },
    )
  }

  // Save data to bits_drawing_entry table
  const saveToBitsDrawingEntry = async (bomRow) => {
    try {
      // Parse markQty as integer and ensure it's a valid number
      const markQty = Number.parseInt(drawingEntryData.markQty, 10)

      // Validate markQty
      if (isNaN(markQty) || markQty <= 0) {
        throw new Error(`Invalid Mark Qty: ${drawingEntryData.markQty}. Must be a positive number.`)
      }

      console.log(`Processing Mark Qty: ${markQty} (type: ${typeof markQty})`)
      console.log("Current drawingEntryData.orderId:", drawingEntryData.orderId) // Debug log

      // Validate that we have an orderId
      if (!drawingEntryData.orderId) {
        console.warn("No orderId found in drawingEntryData. Work order might not be selected properly.")
      }

      const drawingEntryDataToSave = {
        drawingNo: drawingEntryData.drawingNo || "",
        markNo: drawingEntryData.markNo || "",
        markedQty: markQty,
        totalMarkedWgt: Number.parseFloat(drawingEntryData.totalMarkWeight) || 0,
        sessionCode: bomRow?.sectionCode || "",
        sessionName: bomRow?.sectionName || "",
        sessionWeight: Number.parseFloat(bomRow?.secWeight) || 0,
        width: Number.parseFloat(bomRow?.width) || 0,
        length: Number.parseFloat(bomRow?.length) || 0,
        itemQty: Number.parseFloat(bomRow?.itemQty) || 0,
        itemWeight: Number.parseFloat(bomRow?.itemWeight) || 0,
        totalItemWeight: Number.parseFloat(bomRow?.totalItemWeight) || 0,
        orderId: drawingEntryData.orderId, // This should now contain the correct order_id
        tenantId: "DEFAULT",
        createdBy: "system",
        lastUpdatedBy: "system",
        poLineReferenceId: drawingEntryData.lineNumber ? Number.parseInt(drawingEntryData.lineNumber, 10) : null,
        attribute1V: drawingEntryData.workOrder || "",
        attribute2V: drawingEntryData.plantLocation || "",
        attribute3V: drawingEntryData.department || "",
        attribute4V: drawingEntryData.workLocation || "",
        attribute5V: drawingEntryData.lineNumberDisplay || "",
        attribute1N: Number.parseFloat(bomRow?.itemNo) || null,
        attribute2N: null,
        attribute3N: null,
        attribute4N: null,
        attribute5N: null,
        attribute1D: null,
        attribute2D: null,
        attribute3D: null,
        attribute4D: null,
        attribute5D: null,
        drawingWeight: null,
        markWeight: Number.parseFloat(drawingEntryData.markWeight) || null,
        drawingReceivedDate: drawingEntryData.drawingReceivedDate || null,
        targetDate: drawingEntryData.targetDate || null,
        // Initialize fabrication stages to 'N'
        cuttingStage: "N",
        fitUpStage: "N",
        weldingStage: "N",
        finishingStage: "N",
      }

      console.log("Sending data to API (with orderId):", drawingEntryDataToSave)

      const response = await fetch(`${API_BASE_URL}/createBitsDrawingEntry/details`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(drawingEntryDataToSave),
      })

      if (response.ok) {
        const result = await response.json()
        console.log("API Response:", result)

        // Validate the response
        if (Array.isArray(result)) {
          if (result.length !== markQty) {
            console.warn(`Expected ${markQty} entries, but got ${result.length} entries`)
          }

          // Check if orderId was saved correctly
          if (result.length > 0 && result[0].orderId) {
            console.log("✅ Order ID successfully saved:", result[0].orderId)
          } else {
            console.warn("⚠️ Order ID might not have been saved correctly")
          }
        }

        return result
      } else {
        const errorText = await response.text()
        console.error("API Error Response:", errorText)
        throw new Error(`Failed to save to database: ${response.status} - ${errorText}`)
      }
    } catch (error) {
      console.error("Error saving to bits_drawing_entry:", error)
      throw error
    }
  }

  const handleSaveAll = async () => {
    try {
      setLoading(true)
      let totalSavedEntries = 0

      // Validate Drawing Entry data
      if (!drawingEntryData.drawingNo || !drawingEntryData.markNo || !drawingEntryData.markQty) {
        toast.error(`Please fill in Drawing No, Mark No, and Mark Qty`)
        return
      }

      // Validate markQty is a positive integer
      const markQty = Number.parseInt(drawingEntryData.markQty, 10)
      if (isNaN(markQty) || markQty <= 0) {
        toast.error(`Mark Qty must be a positive number. Current value: ${drawingEntryData.markQty}`)
        return
      }

      // Validate that we have BOM entries
      if (bomEntryRows.length === 0) {
        toast.error("Please add at least one BOM entry")
        return
      }

      // Save each BOM row as separate entries in the database
      for (const bomRow of bomEntryRows) {
        try {
          // Save to bits_drawing_entry table
          const savedEntries = await saveToBitsDrawingEntry(bomRow)

          // Count the number of entries created (based on markQty)
          const entriesCount = Array.isArray(savedEntries) ? savedEntries.length : 1
          totalSavedEntries += entriesCount

          console.log(`Successfully saved ${entriesCount} entries for BOM row ${bomRow.itemNo}`)
        } catch (error) {
          console.error(`Error saving BOM row:`, error)
          toast.error(`Failed to save BOM entry: ${error.message}`)
          return
        }
      }

      // Add to saved entries for display
      const newSavedEntry = {
        ...drawingEntryData,
        id: generateUniqueId(),
        bomEntries: bomEntryRows.length,
        totalEntries: totalSavedEntries,
      }
      setSavedEntries((prev) => [newSavedEntry, ...prev])

      // Clear form data
      setDrawingEntryData({
        id: "drawing_entry_1",
        workOrder: "",
        orderId: null,
        plantLocation: "",
        department: "",
        workLocation: "",
        lineNumber: "",
        lineNumberDisplay: "",
        drawingNo: "",
        markWeight: "",
        totalMarkWeight: "",
        drawingReceivedDate: "",
        targetDate: "",
        markNo: "",
        markQty: "",
      })

      // Reset BOM entries to one empty row
      setBomEntryRows([createNewBomRow()])

      // Show success message
      if (totalSavedEntries > 0) {
        showSuccessToast(`${totalSavedEntries} database record(s) successfully saved!`)
      }
    } catch (error) {
      console.error("Error in handleSaveAll:", error)
      toast.error("Failed to save data: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  // Enhanced delete handler - shows confirmation modal instead of window.confirm
  const handleRemoveBomRowClick = (rowId) => {
    if (bomEntryRows.length <= 1) {
      toast.warning("At least one BOM entry is required")
      return
    }

    setItemToDelete(rowId)
    setShowDeleteModal(true)
    // Prevent body scroll when modal is open
    document.body.classList.add("modal-open")
  }

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    if (!itemToDelete) return

    setBomEntryRows((prev) => prev.filter((row) => row.id !== itemToDelete))

    // Clean up search state for removed row
    setSearchTerms((prev) => {
      const newState = { ...prev }
      delete newState[itemToDelete]
      return newState
    })
    setFilteredSectionCodes((prev) => {
      const newState = { ...prev }
      delete newState[itemToDelete]
      return newState
    })
    setShowDropdowns((prev) => {
      const newState = { ...prev }
      delete newState[itemToDelete]
      return newState
    })

    setShowDeleteModal(false)
    setItemToDelete(null)
    document.body.classList.remove("modal-open")
    toast.success("BOM entry removed successfully")
  }

  // Handle delete cancellation
  const handleDeleteCancel = () => {
    setShowDeleteModal(false)
    setItemToDelete(null)
    document.body.classList.remove("modal-open")
  }

  // Check if save button should be enabled
  const isSaveEnabled =
    drawingEntryData.drawingNo && drawingEntryData.markNo && drawingEntryData.markQty && bomEntryRows.length > 0

  // Enhanced Dropdown Component
  const EnhancedDropdown = ({
    fieldId,
    value,
    placeholder,
    options,
    filteredOptions,
    onSelect,
    onSearch,
    searchPlaceholder,
  }) => {
    const position = dropdownPositions[fieldId] || {}

    return (
      <div className="drAOenhancedDropdownContainer">
        <div
          ref={(el) => (fieldRefs.current[fieldId] = el)}
          className="drAOenhancedDropdownField"
          onClick={() => toggleDropdown(fieldId)}
        >
          <input
            type="text"
            value={value || placeholder}
            readOnly
            className="drAOenhancedDropdownInput"
            style={{ cursor: "pointer" }}
          />
          <button
            type="button"
            className="drAOenhancedDropdownArrow"
            onClick={(e) => {
              e.stopPropagation()
              toggleDropdown(fieldId)
            }}
          >
            {showDropdowns[fieldId] ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />}
          </button>
        </div>

        {showDropdowns[fieldId] && (
          <div
            className="drAOenhancedDropdownPanel"
            style={{
              position: "fixed",
              top: position.top,
              left: position.left,
              width: position.width,
              maxWidth: position.maxWidth,
              zIndex: 999999,
            }}
          >
            <div className="drAOenhancedDropdownSearch">
              <FaSearch className="drAOenhancedDropdownSearchIcon" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerms[fieldId] || ""}
                onChange={(e) => onSearch(e.target.value)}
                className="drAOenhancedDropdownSearchInput"
                autoFocus
              />
            </div>
            <div className="drAOenhancedDropdownOptions">
              {(filteredOptions || options).map((option, index) => (
                <div
                  key={`${fieldId}_${option.value}_${index}`}
                  className="drAOenhancedDropdownOption"
                  onClick={() => onSelect(option.value)}
                >
                  {option.label}
                </div>
              ))}
              {(filteredOptions || options).length === 0 && (
                <div className="drAOenhancedDropdownEmpty">Search your section in the above search field</div>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="drAOelephantgi">
      {/* Header */}
      <div className="drAOliongi">
        <div className="drAOtigergi">
          <h3></h3>
        </div>
        <button className="drAOgiraffeги drAOsaveBtngi" onClick={handleSaveAll} disabled={!isSaveEnabled || loading}>
          {loading ? (
            <>
              <AiOutlineLoading3Quarters className="drAOspinIcongi" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <MdSave className="drAOrefreshIcongi" />
              <span>Save All Drawing Entries</span>
            </>
          )}
        </button>
      </div>

      {/* Drawing Entry Table */}
      <div className="drAOzebragi">
        <div className="drAOhippogi">
          <div className="drAOrhinogi">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
              <h4 style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: "black" }}>DRAWING ENTRY</h4>
            </div>
          </div>
        </div>
      </div>

      <div className="drAOleopardgi">
        {loading && (
          <div className="drAOpanthergi">
            <div className="drAOjaguargi">
              <AiOutlineLoading3Quarters />
            </div>
            <div className="drAOcougargi">Saving data...</div>
          </div>
        )}

        <div className="drAOtableWrappergi">
          <table className="drAOlynxgi">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Work Order</th>
                <th>Building Name</th>
                <th>Department</th>
                <th>Work Location</th>
                <th>Drawing No</th>
                <th>Drawing Received Date</th>
                <th>Target Date</th>
                <th>Mark No</th>
                <th>Mark Wgt</th>
                <th>Mark Qty</th>
                <th>Total Mark Weight</th>
              </tr>
            </thead>
            <tbody>
              {/* Single Drawing Entry Row */}
              <tr className="drAObeargi">
                <td>
                  <div className="drAOwolfgi">
                    <IoMdOpen />
                  </div>
                </td>
                <td className="drAOdropdownCellgi">
                  <EnhancedDropdown
                    fieldId="workOrder"
                    value={drawingEntryData.workOrder}
                    placeholder="Select Work Order..."
                    options={workOrderOptions}
                    filteredOptions={filteredWorkOrders}
                    onSelect={handleWorkOrderSelect}
                    onSearch={handleWorkOrderSearch}
                    searchPlaceholder="Search work orders..."
                  />
                </td>
                <td>
                  <input
                    type="text"
                    name="plantLocation"
                    value={drawingEntryData.plantLocation}
                    onChange={handleDrawingEntryInputChange}
                    className="drAOfoxgi readonly"
                    placeholder="Plant Location"
                    readOnly
                  />
                </td>
                <td>
                  <input
                    type="text"
                    name="department"
                    value={drawingEntryData.department}
                    onChange={handleDrawingEntryInputChange}
                    className="drAOfoxgi readonly"
                    placeholder="Department"
                    readOnly
                  />
                </td>
                <td>
                  <input
                    type="text"
                    name="workLocation"
                    value={drawingEntryData.workLocation}
                    onChange={handleDrawingEntryInputChange}
                    className="drAOfoxgi readonly"
                    placeholder="Work Location"
                    readOnly
                  />
                </td>
                <td>
                  <input
                    type="text"
                    name="drawingNo"
                    value={drawingEntryData.drawingNo}
                    onChange={handleDrawingEntryInputChange}
                    className="drAOfoxgi"
                    placeholder="Drawing No"
                    required
                  />
                </td>
                <td>
                  <input
                    type="date"
                    name="drawingReceivedDate"
                    value={drawingEntryData.drawingReceivedDate || ""}
                    onChange={handleDrawingEntryInputChange}
                    className="drAOfoxgi"
                    placeholder="Received Date"
                  />
                </td>
                <td>
                  <input
                    type="date"
                    name="targetDate"
                    value={drawingEntryData.targetDate || ""}
                    onChange={handleDrawingEntryInputChange}
                    className="drAOfoxgi"
                    placeholder="Target Date"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    name="markNo"
                    value={drawingEntryData.markNo}
                    onChange={handleDrawingEntryInputChange}
                    className="drAOfoxgi"
                    placeholder="Mark No"
                    required
                  />
                </td>
                <td>
                  <input
                    type="number"
                    step="0.001"
                    name="markWeight"
                    value={drawingEntryData.markWeight || ""}
                    className="drAOfoxgi readonly"
                    placeholder="Mark Weight"
                    readOnly
                  />
                </td>
                <td>
                  <input
                    type="number"
                    name="markQty"
                    value={drawingEntryData.markQty}
                    onChange={handleDrawingEntryInputChange}
                    className="drAOfoxgi"
                    placeholder="Mark Qty"
                    min="1"
                    max="1000"
                    required
                  />
                </td>
                <td>
                  <input
                    type="number"
                    step="0.001"
                    name="totalMarkWeight"
                    value={drawingEntryData.totalMarkWeight || ""}
                    className="drAOfoxgi readonly"
                    placeholder="Total Mark Weight"
                    readOnly
                  />
                </td>
              </tr>

              {/* Display saved entries */}
              {savedEntries.map((row) => (
                <tr key={`saved_${row.id}`} className="drAOantelopegi">
                  <td>
                    <div className="drAOwolfgi">
                      <IoMdOpen />
                    </div>
                  </td>
                  <td className="drAOgazellegi">{row.workOrder}</td>
                  <td>{row.plantLocation}</td>
                  <td>{row.department}</td>
                  <td>{row.workLocation}</td>
                  <td>{row.drawingNo}</td>
                  <td>{row.drawingReceivedDate}</td>
                  <td>{row.targetDate}</td>
                  <td>{row.markNo}</td>
                  <td>{row.markWeight}</td>
                  <td>{row.markQty}</td>
                  <td>{row.totalMarkWeight}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* BOM Entry Table */}
      <div className="drAOzebragi drAOserviceSectiongi">
        <div className="drAOhippogi">
          <div className="drAOrhinogi">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
              <h4 style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: "black" }}>B.O.M ENTRY</h4>
              <div style={{ display: "flex", gap: "10px" }}>
                <button className="drAOcheetahgi drAOaddBtngi" onClick={handleAddBomRow}>
                  <MdAdd className="drAObuttonIcongi" />
                  <span>Add</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="drAOleopardgi">
        <div className="drAOtableWrappergi">
          <table className="drAOlynxgi drAOserviceTablegi">
            <thead>
              <tr>
                <th>Service #</th>
                <th>Item No</th>
                <th>Section Code</th>
                <th>Section Name</th>
                <th>Width</th>
                <th>Length</th>
                <th>Section Weight</th>
                <th>Item Qty</th>
                <th>Item Weight</th>
                <th>Total Item Weight</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {bomEntryRows.map((formData) => (
                <tr key={formData.id} className="drAObeargi">
                  <td>
                    <div className="drAOwolfgi">
                      <IoMdOpen />
                    </div>
                  </td>
                  <td>
                    <input
                      type="text"
                      name="itemNo"
                      value={formData.itemNo}
                      onChange={(e) => handleBomInputChange(formData.id, e)}
                      className="drAOfoxgi drAOserviceInputgi"
                      placeholder="Item No"
                    />
                  </td>
                  <td className="drAOdropdownCellgi">
                    <EnhancedDropdown
                      fieldId={formData.id}
                      value={formData.sectionCode}
                      placeholder="Select Section Code..."
                      options={sectionCodeOptions}
                      filteredOptions={filteredSectionCodes[formData.id]}
                      onSelect={(value) => handleSectionCodeSelect(formData.id, value)}
                      onSearch={(term) => handleSectionCodeSearch(formData.id, term)} 
                      searchPlaceholder="Search section codes..."
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      name="sectionName"
                      value={formData.sectionName}
                      onChange={(e) => handleBomInputChange(formData.id, e)}
                      className="drAOfoxgi drAOserviceInputgi readonly"
                      placeholder="Section Name"
                      readOnly
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      step="0.01"
                      name="width"
                      value={formData.width}
                      onChange={(e) => handleBomInputChange(formData.id, e)}
                      className="drAOfoxgi drAOserviceInputgi"
                      placeholder="Width"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      step="0.01"
                      name="length"
                      value={formData.length}
                      onChange={(e) => handleBomInputChange(formData.id, e)}
                      className="drAOfoxgi drAOserviceInputgi"
                      placeholder="Length"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      step="0.01"
                      name="secWeight"
                      value={formData.secWeight}
                      onChange={(e) => handleBomInputChange(formData.id, e)}
                      className="drAOfoxgi drAOserviceInputgi readonly"
                      placeholder="Sec. Weight"
                      readOnly
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      name="itemQty"
                      value={formData.itemQty}
                      onChange={(e) => handleBomInputChange(formData.id, e)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault()
                          handleAddBomRow()
                        }
                      }}
                      className="drAOfoxgi drAOserviceInputgi"
                      placeholder="Item Qty"
                      min="1"
                      max="1000"
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      step="0.001"
                      name="itemWeight"
                      value={formData.itemWeight}
                      className="drAOfoxgi drAOserviceInputgi readonly"
                      placeholder="Item Weight"
                      readOnly
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      step="0.001"
                      name="totalItemWeight"
                      value={formData.totalItemWeight}
                      className="drAOfoxgi drAOserviceInputgi readonly"
                      placeholder="Total Item Weight"
                      readOnly
                    />
                  </td>
                  <td>
                    <button onClick={() => handleRemoveBomRowClick(formData.id)} className="drAOremoveBtngi">
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
              {bomEntryRows.length === 0 && (
                <tr className="drAOyakgi">
                  <td colSpan="11">
                    <div className="drAOcamelgi">
                      <div className="drAOllamagi">No BOM records found.</div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirm
        isOpen={showDeleteModal}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        title="Confirm BOM Entry Removal"
        message="Are you sure you want to remove this BOM entry? This action cannot be undone."
      />

      <ToastContainer />
    </div>
  )
}

export default DrawingEntry;
