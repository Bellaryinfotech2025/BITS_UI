import { useState, useEffect, useRef } from "react"
import { AiOutlineLoading3Quarters } from "react-icons/ai"
import { MdSave, MdDelete, MdEdit, MdAdd, MdSearch } from "react-icons/md"
import { FaCheck } from "react-icons/fa"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import '../RawMeterialEntry Component/RawMaterialEntry.css'

const RawMaterialEntry = () => {
  // API Base URL
  const API_BASE_URL = "http://195.35.45.56:5522/api/V2.0"

  // State for dropdowns
  const [workOrderOptions, setWorkOrderOptions] = useState([])
  const [plantLocationOptions, setPlantLocationOptions] = useState([])
  const [selectedWorkOrder, setSelectedWorkOrder] = useState("")
  const [selectedPlantLocation, setSelectedPlantLocation] = useState("")

  // Service Entry State
  const [serviceRows, setServiceRows] = useState([])
  const [savedServiceRows, setSavedServiceRows] = useState([])
  const [editingRowId, setEditingRowId] = useState(null)
  const [showEntryRows, setShowEntryRows] = useState(false)

  // Search State
  const [searchWorkOrder, setSearchWorkOrder] = useState("")
  const [searchPlantLocation, setSearchPlantLocation] = useState("")

  // Loading State
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [searching, setSearching] = useState(false)

  // Delete Popup State
  const [deletePopup, setDeletePopup] = useState({
    show: false,
    rowId: null,
    isNewRow: false,
  })

  // Refs for dynamic row addition
  const documentNoRefs = useRef({})

  // UOM Options
  const uomOptions = [
    { value: "KG", label: "KG (Kilogram)" },
    { value: "G", label: "G (Gram)" },
    { value: "MT", label: "MT (Metric Tonne)" },
    { value: "LTR", label: "LTR (Litre)" },
    { value: "L", label: "L (Litre)" },
    { value: "ML", label: "ML (Millilitre)" },
    { value: "PC", label: "PC (Piece)" },
    { value: "M", label: "M (Meter)" },
    { value: "CM", label: "CM (Centimeter)" },
    { value: "MM", label: "MM (Millimeter)" },
    { value: "SQM", label: "SQM (Square Meter)" },
    { value: "CBM", label: "CBM (Cubic Meter)" },
    { value: "M³", label: "M³ (Cubic Meter)" },
    { value: "FT", label: "FT (Foot)" },
    { value: "IN", label: "IN (Inch)" },
    { value: "YD", label: "YD (Yard)" },
    { value: "BX", label: "BX (Box)" },
    { value: "BAG", label: "BAG (Bag)" },
    { value: "BND", label: "BND (Bundle)" },
    { value: "RL", label: "RL (Roll)" },
    { value: "SHT", label: "SHT (Sheet)" },
    { value: "SET", label: "SET (Set)" },
    { value: "GAL", label: "GAL (Gallon)" },
    { value: "LB", label: "LB (Pound)" },
    { value: "LTN", label: "LTN (Long Tonne)" },
  ]

  // Fetch data on component mount
  useEffect(() => {
    fetchWorkOrdersAndPlantLocations()
    fetchSavedServiceEntries()
  }, [])

  // Check if buttons should be enabled
  const isButtonsEnabled = selectedWorkOrder && selectedPlantLocation && !loading

  // Fetch work orders and plant locations from bits_po_entry_header
  const fetchWorkOrdersAndPlantLocations = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/getAllBitsHeaders/details`)

      if (response.ok) {
        const data = await response.json()
        if (Array.isArray(data) && data.length > 0) {
          // Extract unique work orders
          const uniqueWorkOrders = [...new Set(data.map((item) => item.workOrder).filter(Boolean))]
          const workOrderOptions = uniqueWorkOrders.map((workOrder) => ({
            value: workOrder,
            label: workOrder,
          }))
          setWorkOrderOptions(workOrderOptions)

          // Extract unique plant locations
          const uniquePlantLocations = [...new Set(data.map((item) => item.plantLocation).filter(Boolean))]
          const plantLocationOptions = uniquePlantLocations.map((location) => ({
            value: location,
            label: location,
          }))
          setPlantLocationOptions(plantLocationOptions)
        } else {
          setWorkOrderOptions([])
          setPlantLocationOptions([])
          toast.warning("No data found in bits_po_entry_header table.")
        }
      } else {
        setWorkOrderOptions([])
        setPlantLocationOptions([])
        toast.error("Failed to fetch data from server")
      }
    } catch (error) {
      console.error("Error fetching data:", error)
      setWorkOrderOptions([])
      setPlantLocationOptions([])
      toast.error(`Error connecting to server: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Fetch saved service entries
  const fetchSavedServiceEntries = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/rawmaterialentry`)
      if (response.ok) {
        const data = await response.json()
        setSavedServiceRows(data || [])
      }
    } catch (error) {
      console.error("Error fetching saved service entries:", error)
    }
  }

  // Generate unique ID for new rows
  const generateUniqueId = () => {
    return `row_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Create new service row
  const createNewServiceRow = () => ({
    id: generateUniqueId(),
    section: "",
    width: "",
    length: "",
    qty: "",
    uom: "KG",
    totalWeight: "",
    vehicleNumber: "",
    documentNo: "",
    documentDate: "",
    receivedDate: "",
  })

  // Handle + button click
  const handleAddEntryRows = () => {
    if (!isButtonsEnabled) return

    setShowEntryRows(true)
    if (serviceRows.length === 0) {
      setServiceRows([createNewServiceRow()])
    }
  }

  // Handle service input change
  const handleServiceInputChange = (rowId, field, value) => {
    setServiceRows((prev) =>
      prev.map((row) => {
        if (row.id === rowId) {
          const updatedRow = { ...row, [field]: value }

          // Auto-calculate total weight if width, length, and qty are provided
          if (field === "width" || field === "length" || field === "qty") {
            const width = Number.parseFloat(field === "width" ? value : updatedRow.width) || 0
            const length = Number.parseFloat(field === "length" ? value : updatedRow.length) || 0
            const qty = Number.parseFloat(field === "qty" ? value : updatedRow.qty) || 0

            if (width && length && qty) {
              updatedRow.totalWeight = (width * qty).toFixed(3)
            }
          }

          return updatedRow
        }
        return row
      }),
    )
  }

  // Handle Enter key press in Document No field
  const handleDocumentNoKeyPress = (e, rowId) => {
    if (e.key === "Enter") {
      e.preventDefault()
      const newRow = createNewServiceRow()
      setServiceRows((prev) => [...prev, newRow])

      // Focus on the new row's document no field after a short delay
      setTimeout(() => {
        if (documentNoRefs.current[newRow.id]) {
          documentNoRefs.current[newRow.id].focus()
        }
      }, 100)
    }
  }

  // Search function to filter service entries
  const handleSearch = async () => {
    try {
      setSearching(true)

      let searchResults = []

      // Search by work order if provided
      if (searchWorkOrder) {
        const workOrderResponse = await fetch(`${API_BASE_URL}/rawmaterialentry/workorder/${searchWorkOrder}`)
        if (workOrderResponse.ok) {
          const workOrderData = await workOrderResponse.json()
          searchResults = [...searchResults, ...workOrderData]
        }
      }

      // If no work order search, get all entries
      if (!searchWorkOrder && !searchPlantLocation) {
        const allResponse = await fetch(`${API_BASE_URL}/rawmaterialentry`)
        if (allResponse.ok) {
          const allData = await allResponse.json()
          searchResults = allData
        }
      }

      // Filter by plant location if provided (client-side filtering)
      if (searchPlantLocation) {
        searchResults = searchResults.filter((entry) =>
          entry.plantLocation?.toLowerCase().includes(searchPlantLocation.toLowerCase()),
        )
      }

      setSavedServiceRows(searchResults || [])

      if (searchResults && searchResults.length > 0) {
        toast.success(`Found ${searchResults.length} service entries`)
      } else {
        toast.info("No service entries found for the search criteria")
      }
    } catch (error) {
      console.error("Error searching service entries:", error)
      toast.error("Error searching service entries")
    } finally {
      setSearching(false)
    }
  }

  // Show delete confirmation popup
  const showDeleteConfirmation = (rowId, isNewRow = false) => {
    setDeletePopup({
      show: true,
      rowId,
      isNewRow,
    })
  }

  // Handle delete confirmation
  const handleDeleteConfirm = () => {
    const { rowId, isNewRow } = deletePopup

    if (isNewRow) {
      setServiceRows((prev) => prev.filter((row) => row.id !== rowId))
      toast.success("Row removed successfully!")
    } else {
      handleDeleteSavedService(rowId)
    }

    setDeletePopup({ show: false, rowId: null, isNewRow: false })
  }

  // Cancel delete
  const handleDeleteCancel = () => {
    setDeletePopup({ show: false, rowId: null, isNewRow: false })
  }

  // Delete saved service entry
  const handleDeleteSavedService = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/rawmaterialentry/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setSavedServiceRows((prev) => prev.filter((row) => row.id !== id))
        toast.success("Service entry deleted successfully!")
      } else {
        toast.error("Failed to delete service entry")
      }
    } catch (error) {
      console.error("Error deleting service entry:", error)
      toast.error("Error deleting service entry")
    }
  }

  // Handle edit functionality
  const handleEdit = (rowId) => {
    setEditingRowId(rowId)
  }

  const handleSaveEdit = async (rowId) => {
    try {
      const rowToUpdate = savedServiceRows.find((row) => row.id === rowId)
      if (!rowToUpdate) return

      const response = await fetch(`${API_BASE_URL}/rawmaterialentry/${rowId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(rowToUpdate),
      })

      if (response.ok) {
        setEditingRowId(null)
        toast.success("Service entry updated successfully!")
        await fetchSavedServiceEntries()
      } else {
        toast.error("Failed to update service entry")
      }
    } catch (error) {
      console.error("Error updating service entry:", error)
      toast.error("Error updating service entry")
    }
  }

  const handleCancelEdit = () => {
    setEditingRowId(null)
    fetchSavedServiceEntries() // Refresh to cancel changes
  }

  // Handle saved row input change
  const handleSavedRowInputChange = (rowId, field, value) => {
    setSavedServiceRows((prev) =>
      prev.map((row) => {
        if (row.id === rowId) {
          const updatedRow = { ...row, [field]: value }

          // Auto-calculate total weight if width, length, and qty are provided
          if (field === "width" || field === "length" || field === "qty") {
            const width = Number.parseFloat(field === "width" ? value : updatedRow.width) || 0
            const length = Number.parseFloat(field === "length" ? value : updatedRow.length) || 0
            const qty = Number.parseFloat(field === "qty" ? value : updatedRow.qty) || 0

            if (width && length && qty) {
              updatedRow.totalWeight = (width * qty).toFixed(3)
            }
          }

          return updatedRow
        }
        return row
      }),
    )
  }

  // Save raw material entry
  const handleSaveRawMaterialEntry = async () => {
    if (!isButtonsEnabled || serviceRows.length === 0) {
      toast.error("Please add at least one service entry")
      return
    }

    try {
      setSaving(true)

      // Prepare data for backend
      const rawMaterialData = {
        workOrders: selectedWorkOrder ? [{ workOrder: selectedWorkOrder }] : [],
        serviceEntries: serviceRows
          .filter((row) => row.section && row.width && row.length && row.qty)
          .map((row) => ({
            section: row.section,
            width: row.width,
            length: row.length,
            qty: row.qty,
            uom: row.uom,
            totalWeight: row.totalWeight,
            vehicleNumber: row.vehicleNumber,
            documentNo: row.documentNo,
            documentDate: row.documentDate,
            receivedDate: row.receivedDate,
          })),
        createdBy: "system",
        createdDate: new Date().toISOString(),
      }

      console.log("Sending data to backend:", rawMaterialData)

      const response = await fetch(`${API_BASE_URL}/rawmaterialentry`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(rawMaterialData),
      })

      if (response.ok) {
        const savedData = await response.json()
        console.log("Saved data:", savedData)

        toast.success(
          <div className="raw">
            <FaCheck className="kkk" />
            <span className="material">Raw Material Entry saved successfully!</span>
          </div>,
        )

        // Clear entry rows and refresh saved data
        setServiceRows([])
        setShowEntryRows(false)
        await fetchSavedServiceEntries()
      } else {
        const errorText = await response.text()
        console.error("Error response:", errorText)
        throw new Error(`Server responded with ${response.status}: ${errorText}`)
      }
    } catch (error) {
      console.error("Error saving raw material entry:", error)
      toast.error(`Failed to save: ${error.message}`)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="main-container">
      {/* Control Section - Half Width */}
      <div className="control-section">
        <div className="dropdowns-and-buttons">
          {/* Work Order Dropdown */}
          <div className="dropdown-group">
            <label htmlFor="workOrder">Work Order:</label>
            <select
              id="workOrder"
              value={selectedWorkOrder}
              onChange={(e) => setSelectedWorkOrder(e.target.value)}
              className="dropdown-select"
              disabled={loading}
            >
              <option value="">Select Work Order</option>
              {workOrderOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Plant Location Dropdown */}
          <div className="dropdown-group">
            <label htmlFor="plantLocation">Building Name:</label>
            <select
              id="plantLocation"
              value={selectedPlantLocation}
              onChange={(e) => setSelectedPlantLocation(e.target.value)}
              className="dropdown-select"
              disabled={loading}
            >
              <option value="">Select Building Name</option>
              {plantLocationOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Add Button */}
          <button
            className="add-button"
            onClick={handleAddEntryRows}
            disabled={!isButtonsEnabled}
            title="Add Entry Rows"
          >
            <MdAdd />
          </button>

          {/* Save Button */}
          <button
            className="save-button"
            onClick={handleSaveRawMaterialEntry}
            disabled={!isButtonsEnabled || !showEntryRows || serviceRows.length === 0 || saving}
          >
            {saving ? (
              <>
                <AiOutlineLoading3Quarters className="spin-icon" />
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

        {/* Search Section */}
        {showEntryRows && (
          <div className="search-section">
        
          </div>
        )}
      </div>

      {/* Service Entry Table */}
      {showEntryRows && (
        <div className="table-section">
          <div className="table-wrapper">
            <table className="service-table">
              <thead>
                <tr>
                  <th>Section</th>
                  <th>Width</th>
                  <th>Length</th>
                  <th>Qty</th>
                  <th>UOM</th>
                  <th>Total Weight</th>
                  <th>Vehicle Number</th>
                  <th>Document No</th>
                  <th>Document Date</th>
                  <th>Received Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {/* New Service Rows */}
                {serviceRows.map((row, index) => (
                  <tr key={row.id} className="new-service-row">
                    <td>
                      <input
                        type="text"
                        value={row.section}
                        onChange={(e) => handleServiceInputChange(row.id, "section", e.target.value)}
                        className="table-input"
                        placeholder="Section"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        value={row.width}
                        onChange={(e) => handleServiceInputChange(row.id, "width", e.target.value)}
                        className="table-input"
                        placeholder="Width"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        value={row.length}
                        onChange={(e) => handleServiceInputChange(row.id, "length", e.target.value)}
                        className="table-input"
                        placeholder="Length"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        value={row.qty}
                        onChange={(e) => handleServiceInputChange(row.id, "qty", e.target.value)}
                        className="table-input"
                        placeholder="Qty"
                      />
                    </td>
                    <td>
                      <select
                        value={row.uom}
                        onChange={(e) => handleServiceInputChange(row.id, "uom", e.target.value)}
                        className="table-select"
                      >
                        {uomOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="text"
                        value={row.totalWeight}
                        readOnly
                        className="table-input readonly"
                        placeholder="Auto calculated"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={row.vehicleNumber}
                        onChange={(e) => handleServiceInputChange(row.id, "vehicleNumber", e.target.value)}
                        className="table-input"
                        placeholder="Vehicle No"
                      />
                    </td>
                    <td>
                      <input
                        ref={(el) => (documentNoRefs.current[row.id] = el)}
                        type="text"
                        value={row.documentNo}
                        onChange={(e) => handleServiceInputChange(row.id, "documentNo", e.target.value)}
                        onKeyPress={(e) => handleDocumentNoKeyPress(e, row.id)}
                        className="table-input"
                        placeholder="Doc No (Press Enter to add new row)"
                      />
                    </td>
                    <td>
                      <input
                        type="date"
                        value={row.documentDate}
                        onChange={(e) => handleServiceInputChange(row.id, "documentDate", e.target.value)}
                        className="table-input"
                      />
                    </td>
                    <td>
                      <input
                        type="date"
                        value={row.receivedDate}
                        onChange={(e) => handleServiceInputChange(row.id, "receivedDate", e.target.value)}
                        className="table-input"
                      />
                    </td>
                    <td>
                      <button
                        onClick={() => showDeleteConfirmation(row.id, true)}
                        className="delete-button"
                        title="Delete"
                      >
                        <MdDelete />
                      </button>
                    </td>
                  </tr>
                ))}

                {/* Saved Service Rows */}
                {savedServiceRows.map((row) => (
                  <tr key={`saved_${row.id}`} className="saved-service-row">
                    <td>
                      {editingRowId === row.id ? (
                        <input
                          type="text"
                          value={row.section || ""}
                          onChange={(e) => handleSavedRowInputChange(row.id, "section", e.target.value)}
                          className="table-input"
                        />
                      ) : (
                        row.section || "-"
                      )}
                    </td>
                    <td>
                      {editingRowId === row.id ? (
                        <input
                          type="number"
                          step="0.01"
                          value={row.width || ""}
                          onChange={(e) => handleSavedRowInputChange(row.id, "width", e.target.value)}
                          className="table-input"
                        />
                      ) : (
                        row.width || "-"
                      )}
                    </td>
                    <td>
                      {editingRowId === row.id ? (
                        <input
                          type="number"
                          step="0.01"
                          value={row.length || ""}
                          onChange={(e) => handleSavedRowInputChange(row.id, "length", e.target.value)}
                          className="table-input"
                        />
                      ) : (
                        row.length || "-"
                      )}
                    </td>
                    <td>
                      {editingRowId === row.id ? (
                        <input
                          type="number"
                          step="0.01"
                          value={row.qty || ""}
                          onChange={(e) => handleSavedRowInputChange(row.id, "qty", e.target.value)}
                          className="table-input"
                        />
                      ) : (
                        row.qty || "-"
                      )}
                    </td>
                    <td>
                      {editingRowId === row.id ? (
                        <select
                          value={row.uom || "KG"}
                          onChange={(e) => handleSavedRowInputChange(row.id, "uom", e.target.value)}
                          className="table-select"
                        >
                          {uomOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      ) : (
                        row.uom || "-"
                      )}
                    </td>
                    <td>{row.totalWeight || "-"}</td>
                    <td>
                      {editingRowId === row.id ? (
                        <input
                          type="text"
                          value={row.vehicleNumber || ""}
                          onChange={(e) => handleSavedRowInputChange(row.id, "vehicleNumber", e.target.value)}
                          className="table-input"
                        />
                      ) : (
                        row.vehicleNumber || "-"
                      )}
                    </td>
                    <td>
                      {editingRowId === row.id ? (
                        <input
                          type="text"
                          value={row.documentNo || ""}
                          onChange={(e) => handleSavedRowInputChange(row.id, "documentNo", e.target.value)}
                          className="table-input"
                        />
                      ) : (
                        row.documentNo || "-"
                      )}
                    </td>
                    <td>
                      {editingRowId === row.id ? (
                        <input
                          type="date"
                          value={row.documentDate || ""}
                          onChange={(e) => handleSavedRowInputChange(row.id, "documentDate", e.target.value)}
                          className="table-input"
                        />
                      ) : (
                        row.documentDate || "-"
                      )}
                    </td>
                    <td>
                      {editingRowId === row.id ? (
                        <input
                          type="date"
                          value={row.receivedDate || ""}
                          onChange={(e) => handleSavedRowInputChange(row.id, "receivedDate", e.target.value)}
                          className="table-input"
                        />
                      ) : (
                        row.receivedDate || "-"
                      )}
                    </td>
                    <td>
                      <div className="action-buttons">
                        {editingRowId === row.id ? (
                          <>
                            <button onClick={() => handleSaveEdit(row.id)} className="save-edit-button" title="Save">
                              <FaCheck />
                            </button>
                            <button onClick={handleCancelEdit} className="cancel-edit-button" title="Cancel">
                              ✕
                            </button>
                          </>
                        ) : (
                          <>
                            <button onClick={() => handleEdit(row.id)} className="edit-button" title="Edit">
                              <MdEdit />
                            </button>
                            <button
                              onClick={() => showDeleteConfirmation(row.id, false)}
                              className="delete-button"
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

                {savedServiceRows.length === 0 && serviceRows.length === 0 && (
                  <tr className="empty-row">
                    <td colSpan="11">
                      <div className="empty-message">
                        <div className="empty-text">No service entries found.</div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Popup */}
      {deletePopup.show && (
        <div className="popup-overlay">
          <div className="popup-container">
            <div className="popup-header">
              <h3>Confirm Delete</h3>
            </div>
            <div className="popup-content">
              <div className="popup-icon">
                <MdDelete />
              </div>
              <div className="popup-message">
                <p>Are you sure you want to delete this entry?</p>
                <p className="popup-warning">Once deleted, this action cannot be undone.</p>
              </div>
            </div>
            <div className="popup-actions">
              <button onClick={handleDeleteCancel} className="popup-cancel-button">
                Cancel
              </button>
              <button onClick={handleDeleteConfirm} className="popup-confirm-button">
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

export default RawMaterialEntry;
