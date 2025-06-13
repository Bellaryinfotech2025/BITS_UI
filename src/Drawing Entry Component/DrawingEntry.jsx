import { useState, useEffect, useCallback, useMemo } from "react"
import { IoMdOpen } from "react-icons/io"
import { AiOutlineLoading3Quarters } from "react-icons/ai"
import { MdSave, MdAdd } from "react-icons/md"
import { FaCheck } from "react-icons/fa"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import "../Drawing Entry Component/DrawingEntry.css"

const DrawingEntry = () => {
  // API Base URL
  const API_BASE_URL = "http://195.35.45.56:5522/api/V2.0"

  // Work Order Header Table State
  const [headerRows, setHeaderRows] = useState([])
  const [formRows, setFormRows] = useState([])
  const [loading, setLoading] = useState(false)

  // Service Details Table State
  const [serviceRows, setServiceRows] = useState([])
  const [serviceFormRows, setServiceFormRows] = useState([])
  const [serviceLoading, setServiceLoading] = useState(false)

  // API Data State
  const [workOrderOptions, setWorkOrderOptions] = useState([])
  const [sectionCodeOptions, setSectionCodeOptions] = useState([])
  const [lineNumberOptions, setLineNumberOptions] = useState([])
  const [searchTerms, setSearchTerms] = useState({})
  const [filteredSectionCodes, setFilteredSectionCodes] = useState({})
  const [showDropdowns, setShowDropdowns] = useState({})

  // Fetch work orders, section codes, and line numbers on component mount
  useEffect(() => {
    fetchWorkOrders()
    fetchSectionCodes()
    fetchLineNumbers()
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".drAOsearchableSelectgi")) {
        setShowDropdowns({})
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Calculate total item weight from all service rows and update work order Mark Wgt
  // Use useMemo to prevent infinite re-renders
  const totalItemWeight = useMemo(() => {
    return serviceFormRows.reduce((sum, row) => {
      const totalWeight = Number.parseFloat(row.totalItemWeight) || 0
      return sum + totalWeight
    }, 0)
  }, [serviceFormRows])

  // Update Mark Wgt when totalItemWeight changes
  const updateMarkWeight = useCallback(() => {
    if (totalItemWeight > 0 && formRows.length > 0) {
      setFormRows((prev) =>
        prev.map((row, index) => {
          if (index === 0) {
            // Update only the first row
            const markQty = Number.parseFloat(row.markQty) || 0
            const totalMarkWeight = totalItemWeight * markQty
            return {
              ...row,
              markWeight: totalItemWeight.toFixed(3),
              totalMarkWeight: totalMarkWeight.toFixed(3),
            }
          }
          return row
        }),
      )
    }
  }, [totalItemWeight, formRows])

  // Use useEffect with proper dependencies to avoid infinite loop
  useEffect(() => {
    updateMarkWeight()
  }, [totalItemWeight]) // Only depend on totalItemWeight, not formRows

  // Fetch work orders from bits_po_entry_header table
  const fetchWorkOrders = async () => {
    try {
      console.log("Fetching work orders from bits_po_entry_header table...")
      const response = await fetch(`${API_BASE_URL}/getworkorder/number`)

      if (response.ok) {
        const data = await response.json()
        console.log("Raw work order data from database:", data)

        if (Array.isArray(data) && data.length > 0) {
          const formattedOptions = data.map((workOrder) => ({
            value: workOrder,
            label: workOrder,
          }))
          setWorkOrderOptions(formattedOptions)
          console.log("Successfully fetched work orders from database:", formattedOptions)
        } else {
          console.warn("No work orders found in database")
          setWorkOrderOptions([])
          toast.warning("No work orders found in database. Please add some work orders first.")
        }
      } else {
        console.error("Failed to fetch work orders, status:", response.status)
        const errorText = await response.text()
        console.error("Error response:", errorText)
        setWorkOrderOptions([])
        toast.error(`Failed to fetch work orders: ${response.status} - ${errorText}`)
      }
    } catch (error) {
      console.error("Error fetching work orders:", error)
      setWorkOrderOptions([])
      toast.error(`Error connecting to server: ${error.message}`)
    }
  }

  // Fetch section codes from API with error handling
  const fetchSectionCodes = async () => {
    try {
      console.log("Fetching section codes...")
      const response = await fetch(`${API_BASE_URL}/service_code_entry/codes`)

      if (response.ok) {
        const data = await response.json()
        console.log("Raw section code data:", data)

        if (Array.isArray(data) && data.length > 0) {
          const formattedOptions = data.map((code) => ({
            value: code,
            label: code,
          }))
          setSectionCodeOptions(formattedOptions)
          console.log("Successfully fetched section codes:", formattedOptions)
        } else {
          console.warn("No section codes found")
          setSectionCodeOptions([])
          toast.warning("No section codes found in database")
        }
      } else {
        console.error("Failed to fetch section codes, status:", response.status)
        setSectionCodeOptions([])
        toast.error("Failed to fetch section codes from server")
      }
    } catch (error) {
      console.error("Error fetching section codes:", error)
      setSectionCodeOptions([])
      toast.error(`Error fetching section codes: ${error.message}`)
    }
  }

  // Fetch line numbers from bits_po_entry_lines table with error handling
  const fetchLineNumbers = async () => {
    try {
      console.log("Fetching line numbers...")
      const response = await fetch(`${API_BASE_URL}/getAllBitsLines/details`)

      if (response.ok) {
        const data = await response.json()
        console.log("Raw line number data:", data)

        if (Array.isArray(data) && data.length > 0) {
          const formattedOptions = data.map((line) => ({
            value: line.lineId,
            label: line.lineNumber ? line.lineNumber.toString() : `${line.lineId}`,
            lineData: line,
          }))
          setLineNumberOptions(formattedOptions)
          console.log("Successfully fetched line numbers:", formattedOptions)
        } else {
          console.warn("No line numbers found")
          setLineNumberOptions([])
          toast.warning("No line numbers found in database")
        }
      } else {
        console.error("Failed to fetch line numbers, status:", response.status)
        setLineNumberOptions([])
        toast.error("Failed to fetch line numbers from server")
      }
    } catch (error) {
      console.error("Error fetching line numbers:", error)
      setLineNumberOptions([])
      toast.error(`Error fetching line numbers: ${error.message}`)
    }
  }

  // Fetch work order details when a work order is selected
  const fetchWorkOrderDetails = async (workOrder, rowId) => {
    try {
      console.log(`Fetching details for work order: ${workOrder}`)
      const response = await fetch(`${API_BASE_URL}/getworkorder/number/${workOrder}`)

      if (response.ok) {
        const data = await response.json()
        console.log("Work order details from database:", data)

        setFormRows((prev) =>
          prev.map((row) => {
            if (row.id === rowId) {
              return {
                ...row,
                plantLocation: data.plantLocation || "",
                department: data.department || "",
                workLocation: data.workLocation || "",
              }
            }
            return row
          }),
        )
        toast.success(`Loaded details for work order ${workOrder}`)
      } else {
        console.error("Failed to fetch work order details")
        toast.error(`Failed to fetch details for work order ${workOrder}`)
      }
    } catch (error) {
      console.error("Error fetching work order details:", error)
      toast.error(`Error fetching work order details: ${error.message}`)
    }
  }

  // Fetch section code details when a section code is selected
  const fetchSectionCodeDetails = async (sectionCode, rowId) => {
    try {
      console.log(`Fetching details for section code: ${sectionCode}`)
      const response = await fetch(`${API_BASE_URL}/service_code_entry/code/${sectionCode}`)

      if (response.ok) {
        const data = await response.json()
        console.log("Section code details:", data)

        setServiceFormRows((prev) =>
          prev.map((row) => {
            if (row.id === rowId) {
              const updatedRow = {
                ...row,
                sectionName: data.name || "",
                secWeight: data.wgt || 0,
              }

              // NEW FORMULA: Calculate item weight (read-only) and total item weight
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
        console.error("Failed to fetch section code details")
        toast.error(`Failed to fetch details for section code ${sectionCode}`)
      }
    } catch (error) {
      console.error("Error fetching section code details:", error)
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

    // Show dropdown when typing
    setShowDropdowns((prev) => ({ ...prev, [rowId]: true }))
  }

  // Handle section code selection
  const handleSectionCodeSelect = (rowId, sectionCode) => {
    // Update the form data
    setServiceFormRows((prev) =>
      prev.map((row) => {
        if (row.id === rowId) {
          return { ...row, sectionCode: sectionCode }
        }
        return row
      }),
    )

    // Update search term to show selected value
    setSearchTerms((prev) => ({ ...prev, [rowId]: sectionCode }))

    // Hide dropdown
    setShowDropdowns((prev) => ({ ...prev, [rowId]: false }))

    // Fetch section code details
    if (sectionCode) {
      fetchSectionCodeDetails(sectionCode, rowId)
    }
  }

  // Generate unique ID for new rows
  const generateUniqueId = () => {
    return `row_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  const createNewFormRow = () => ({
    id: generateUniqueId(),
    workOrder: "",
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

  const createNewServiceRow = () => {
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

  const handleFormInputChange = (rowId, e) => {
    const { name, value } = e.target
    setFormRows((prev) =>
      prev.map((row) => {
        if (row.id === rowId) {
          const updatedRow = { ...row, [name]: value }

          // If work order is changed, fetch the related details
          if (name === "workOrder" && value) {
            fetchWorkOrderDetails(value, rowId)
          }

          // If line number is changed, update display value
          if (name === "lineNumber") {
            const selectedLine = lineNumberOptions.find((option) => option.value.toString() === value)
            if (selectedLine) {
              updatedRow.lineNumberDisplay = selectedLine.label
              console.log("Selected line:", selectedLine)
            } else {
              updatedRow.lineNumberDisplay = ""
            }
          }

          // Calculate Total Mark Weight when Mark Qty changes
          if (name === "markQty") {
            const markWeight = Number.parseFloat(updatedRow.markWeight) || 0
            const markQty = Number.parseFloat(value) || 0
            updatedRow.totalMarkWeight = (markWeight * markQty).toFixed(3)
          }

          return updatedRow
        }
        return row
      }),
    )
  }

  const handleServiceInputChange = (rowId, e) => {
    const { name, value } = e.target
    setServiceFormRows((prev) =>
      prev.map((row) => {
        if (row.id === rowId) {
          const updatedRow = { ...row, [name]: value }

          // NEW FORMULA: Calculate item weight and total item weight
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

  const handleAddHeader = () => {
    setFormRows((prev) => [...prev, createNewFormRow()])
  }

  const handleAddService = () => {
    setServiceFormRows((prev) => [...prev, createNewServiceRow()])
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
  const saveToBitsDrawingEntry = async (formData, serviceData) => {
    try {
      // Parse markQty as integer and ensure it's a valid number
      const markQty = Number.parseInt(formData.markQty, 10)

      // Validate markQty
      if (isNaN(markQty) || markQty <= 0) {
        throw new Error(`Invalid Mark Qty: ${formData.markQty}. Must be a positive number.`)
      }

      console.log(`Processing Mark Qty: ${markQty} (type: ${typeof markQty})`)

      const drawingEntryData = {
        drawingNo: formData.drawingNo || "",
        markNo: formData.markNo || "",
        markedQty: markQty,
        totalMarkedWgt: Number.parseFloat(formData.totalMarkWeight) || 0,
        sessionCode: serviceData?.sectionCode || "",
        sessionName: serviceData?.sectionName || "",
        sessionWeight: Number.parseFloat(serviceData?.secWeight) || 0,
        width: Number.parseFloat(serviceData?.width) || 0,
        length: Number.parseFloat(serviceData?.length) || 0,
        itemQty: Number.parseFloat(serviceData?.itemQty) || 0,
        itemWeight: Number.parseFloat(serviceData?.itemWeight) || 0,
        totalItemWeight: Number.parseFloat(serviceData?.totalItemWeight) || 0, // NEW FIELD
        tenantId: "DEFAULT",
        createdBy: "system",
        lastUpdatedBy: "system",
        poLineReferenceId: formData.lineNumber ? Number.parseInt(formData.lineNumber, 10) : null,
        attribute1V: formData.workOrder || "",
        attribute2V: formData.plantLocation || "",
        attribute3V: formData.department || "",
        attribute4V: formData.workLocation || "",
        attribute5V: formData.lineNumberDisplay || "",
        attribute1N: Number.parseFloat(serviceData?.itemNo) || null,
        attribute2N: null,
        attribute3N: null,
        attribute4N: null,
        attribute5N: null,
        attribute1D: null,
        attribute2D: null,
        attribute3D: null,
        attribute4D: null,
        attribute5D: null,
        // Add new fields with proper date formatting
        drawingWeight: null, // Removed drawing weight
        markWeight: Number.parseFloat(formData.markWeight) || null,
        drawingReceivedDate: formData.drawingReceivedDate || null,
        targetDate: formData.targetDate || null,
        // Initialize fabrication stages to 'N'
        cuttingStage: "N",
        fitUpStage: "N",
        weldingStage: "N",
        finishingStage: "N",
      }

      console.log("Sending data to API:", drawingEntryData)

      const response = await fetch(`${API_BASE_URL}/createBitsDrawingEntry/details`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(drawingEntryData),
      })

      if (response.ok) {
        const result = await response.json()
        console.log("API Response:", result)

        // Validate the response
        if (Array.isArray(result)) {
          if (result.length !== markQty) {
            console.warn(`Expected ${markQty} entries, but got ${result.length} entries`)
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
      const savedHeaderRows = []

      // Validate that we have data to save
      if (formRows.length === 0 && serviceFormRows.length === 0) {
        toast.info("No new records to save")
        return
      }

      // Process each form row
      for (const formRow of formRows) {
        // Validate required fields
        if (!formRow.drawingNo || !formRow.markNo || !formRow.markQty) {
          toast.error(`Please fill in Drawing No, Mark No, and Mark Qty for all rows`)
          return
        }

        // Validate markQty is a positive integer
        const markQty = Number.parseInt(formRow.markQty, 10)
        if (isNaN(markQty) || markQty <= 0) {
          toast.error(`Mark Qty must be a positive number. Current value: ${formRow.markQty}`)
          return
        }

        // Find corresponding service row (if any)
        const correspondingServiceRow =
          serviceFormRows.find(
            (serviceRow) => serviceRow.itemNo === formRow.lineNumber || serviceFormRows.length === 1,
          ) ||
          serviceFormRows[0] ||
          {}

        try {
          // Save to bits_drawing_entry table
          const savedEntries = await saveToBitsDrawingEntry(formRow, correspondingServiceRow)

          // Count the number of entries created (based on markQty)
          const entriesCount = Array.isArray(savedEntries) ? savedEntries.length : 1
          totalSavedEntries += entriesCount

          // Add to saved header rows for display
          savedHeaderRows.push({
            ...formRow,
            id: generateUniqueId(),
          })

          console.log(`Successfully saved ${entriesCount} entries for drawing ${formRow.drawingNo}`)
        } catch (error) {
          console.error(`Error saving form row:`, error)
          toast.error(`Failed to save drawing entry: ${error.message}`)
          return
        }
      }

      // Update the display tables
      if (savedHeaderRows.length > 0) {
        setHeaderRows((prev) => [...savedHeaderRows, ...prev])
        setFormRows([])
      }

      // Clear service form rows
      setServiceFormRows([])

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

  const handleRemoveFormRow = (rowId) => {
    setFormRows((prev) => prev.filter((row) => row.id !== rowId))
  }

  const handleRemoveServiceRow = (rowId) => {
    setServiceFormRows((prev) => prev.filter((row) => row.id !== rowId))
    // Clean up search state for removed row
    setSearchTerms((prev) => {
      const newState = { ...prev }
      delete newState[rowId]
      return newState
    })
    setFilteredSectionCodes((prev) => {
      const newState = { ...prev }
      delete newState[rowId]
      return newState
    })
    setShowDropdowns((prev) => {
      const newState = { ...prev }
      delete newState[rowId]
      return newState
    })
  }

  // Check if save button should be enabled
  const isSaveEnabled = formRows.length > 0 || serviceFormRows.length > 0

  return (
    <div className="drAOelephantgi">
      {/* Header */}
      <div className="drAOliongi">
        <div className="drAOtigergi">
          <h3>Work Order Entry</h3>
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
              <span>Save All</span>
            </>
          )}
        </button>
      </div>

      {/* Work Order Details Table */}
      <div className="drAOzebragi">
        <div className="drAOhippogi">
          <div className="drAOrhinogi">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
              <h4 style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: "black" }}>Work Order Entry</h4>
              <div style={{ display: "flex", gap: "10px" }}>
                <button className="drAOcheetahgi drAOaddBtngi" onClick={handleAddHeader}>
                  <MdAdd className="drAObuttonIcongi" />
                  <span>Add</span>
                </button>
              </div>
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
                <th>Total Mark Weight</th>
                <th>Mark Wgt</th>
                <th>Drawing Received Date</th>
                <th>Target Date</th>
                <th>Mark No</th>
                <th>Mark Qty</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {formRows.map((formData) => (
                <tr key={formData.id} className="drAObeargi">
                  <td>
                    <div className="drAOwolfgi">
                      <IoMdOpen />
                    </div>
                  </td>
                  <td>
                    <select
                      name="workOrder"
                      value={formData.workOrder}
                      onChange={(e) => handleFormInputChange(formData.id, e)}
                      className="drAOfoxgi drAOworkOrderSelectgi"
                    >
                      <option value="">Select Work Order</option>
                      {workOrderOptions.map((option) => (
                        <option key={`wo_${option.value}_${formData.id}`} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      type="text"
                      name="plantLocation"
                      value={formData.plantLocation}
                      onChange={(e) => handleFormInputChange(formData.id, e)}
                      className="drAOfoxgi readonly"
                      placeholder="Plant Location"
                      readOnly
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      name="department"
                      value={formData.department}
                      onChange={(e) => handleFormInputChange(formData.id, e)}
                      className="drAOfoxgi readonly"
                      placeholder="Department"
                      readOnly
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      name="workLocation"
                      value={formData.workLocation}
                      onChange={(e) => handleFormInputChange(formData.id, e)}
                      className="drAOfoxgi readonly"
                      placeholder="Work Location"
                      readOnly
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      name="drawingNo"
                      value={formData.drawingNo}
                      onChange={(e) => handleFormInputChange(formData.id, e)}
                      className="drAOfoxgi"
                      placeholder="Drawing No"
                      required
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      step="0.001"
                      name="totalMarkWeight"
                      value={formData.totalMarkWeight || ""}
                      className="drAOfoxgi readonly"
                      placeholder="Total Mark Weight"
                      readOnly
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      step="0.001"
                      name="markWeight"
                      value={formData.markWeight || ""}
                      className="drAOfoxgi readonly"
                      placeholder="Mark Weight"
                      readOnly
                    />
                  </td>
                  <td>
                    <input
                      type="date"
                      name="drawingReceivedDate"
                      value={formData.drawingReceivedDate || ""}
                      onChange={(e) => handleFormInputChange(formData.id, e)}
                      className="drAOfoxgi"
                      placeholder="Received Date"
                    />
                  </td>
                  <td>
                    <input
                      type="date"
                      name="targetDate"
                      value={formData.targetDate || ""}
                      onChange={(e) => handleFormInputChange(formData.id, e)}
                      className="drAOfoxgi"
                      placeholder="Target Date"
                    />
                  </td>
                  <td>
                    <input
                      type="text"
                      name="markNo"
                      value={formData.markNo}
                      onChange={(e) => handleFormInputChange(formData.id, e)}
                      className="drAOfoxgi"
                      placeholder="Mark No"
                      required
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      name="markQty"
                      value={formData.markQty}
                      onChange={(e) => handleFormInputChange(formData.id, e)}
                      className="drAOfoxgi"
                      placeholder="Mark Qty"
                      min="1"
                      max="1000"
                      required
                    />
                  </td>
                  <td>
                    <button onClick={() => handleRemoveFormRow(formData.id)} className="drAOremoveBtngi">
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
              {headerRows.map((row) => (
                <tr key={`header_${row.id}`} className="drAOantelopegi">
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
                  <td>{row.totalMarkWeight}</td>
                  <td>{row.markWeight}</td>
                  <td>{row.drawingReceivedDate}</td>
                  <td>{row.targetDate}</td>
                  <td>{row.markNo}</td>
                  <td>{row.markQty}</td>
                  <td></td>
                </tr>
              ))}
              {headerRows.length === 0 && formRows.length === 0 && (
                <tr className="drAOyakgi">
                  <td colSpan="13">
                    <div className="drAOcamelgi">
                      <div className="drAOllamagi">No work order records found.</div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Service Details Table */}
      <div className="drAOzebragi drAOserviceSectiongi">
        <div className="drAOhippogi">
          <div className="drAOrhinogi">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
              <h4 style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: "black" }}>Service Entry</h4>
              <div style={{ display: "flex", gap: "10px" }}>
                <button className="drAOcheetahgi drAOaddBtngi" onClick={handleAddService}>
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
              {serviceFormRows.map((formData) => (
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
                      onChange={(e) => handleServiceInputChange(formData.id, e)}
                      className="drAOfoxgi drAOserviceInputgi"
                      placeholder="Item No"
                    />
                  </td>
                  <td className="drAOdropdownCellgi">
                    <div className="drAOsearchableSelectgi">
                      <input
                        type="text"
                        placeholder="Search or select section code..."
                        value={searchTerms[formData.id] || ""}
                        onChange={(e) => handleSectionCodeSearch(formData.id, e.target.value)}
                        onFocus={() => setShowDropdowns((prev) => ({ ...prev, [formData.id]: true }))}
                        className="drAOsearchInputgi"
                      />
                      {showDropdowns[formData.id] && (
                        <div className="drAOdropdownListgi">
                          {(filteredSectionCodes[formData.id] || sectionCodeOptions).map((option, index) => (
                            <div
                              key={`${formData.id}_${option.value}_${index}`}
                              className="drAOdropdownItemgi"
                              onClick={() => handleSectionCodeSelect(formData.id, option.value)}
                            >
                              {option.label}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <input
                      type="text"
                      name="sectionName"
                      value={formData.sectionName}
                      onChange={(e) => handleServiceInputChange(formData.id, e)}
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
                      onChange={(e) => handleServiceInputChange(formData.id, e)}
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
                      onChange={(e) => handleServiceInputChange(formData.id, e)}
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
                      onChange={(e) => handleServiceInputChange(formData.id, e)}
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
                      onChange={(e) => handleServiceInputChange(formData.id, e)}
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
                    <button onClick={() => handleRemoveServiceRow(formData.id)} className="drAOremoveBtngi">
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
              {serviceRows.map((row) => (
                <tr key={`service_${row.id}`} className="drAOantelopegi">
                  <td>
                    <div className="drAOwolfgi">
                      <IoMdOpen />
                    </div>
                  </td>
                  <td>{row.itemNo}</td>
                  <td className="drAOgazellegi">{row.sectionCode}</td>
                  <td>{row.sectionName}</td>
                  <td>{row.width}</td>
                  <td>{row.length}</td>
                  <td>{row.secWeight}</td>
                  <td>{row.itemQty}</td>
                  <td>{row.itemWeight}</td>
                  <td>{row.totalItemWeight}</td>
                  <td></td>
                </tr>
              ))}
              {serviceRows.length === 0 && serviceFormRows.length === 0 && (
                <tr className="drAOyakgi">
                  <td colSpan="11">
                    <div className="drAOcamelgi">
                      <div className="drAOllamagi">No service records found.</div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ToastContainer />
    </div>
  )
}

export default DrawingEntry;
