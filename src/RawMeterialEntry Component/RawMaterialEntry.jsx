import { useState, useEffect } from "react"
import { IoMdOpen } from "react-icons/io"
import { AiOutlineLoading3Quarters } from "react-icons/ai"
import { MdSave, MdAdd, MdDelete } from "react-icons/md"
import { FaCheck } from "react-icons/fa"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import '../RawMeterialEntry Component/RawMaterialEntry.css'

const RawMaterialEntry = () => {
  // API Base URL - Updated to match your server
  const API_BASE_URL = "http://195.35.45.56:5522/api/V2.0"

  // Work Order State
  const [workOrderRows, setWorkOrderRows] = useState([])
  const [workOrderOptions, setWorkOrderOptions] = useState([])

  // Service Entry State
  const [serviceRows, setServiceRows] = useState([])
  const [savedServiceRows, setSavedServiceRows] = useState([])

  // Loading State
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

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
    fetchWorkOrders()
    fetchSavedServiceEntries()
  }, [])

  // Fetch work orders from backend
  const fetchWorkOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/getworkorder/number`)

      if (response.ok) {
        const data = await response.json()
        if (Array.isArray(data) && data.length > 0) {
          const formattedOptions = data.map((workOrder) => ({
            value: workOrder,
            label: workOrder,
          }))
          setWorkOrderOptions(formattedOptions)
        } else {
          setWorkOrderOptions([])
          toast.warning("No work orders found in database.")
        }
      } else {
        setWorkOrderOptions([])
        toast.error("Failed to fetch work orders from server")
      }
    } catch (error) {
      console.error("Error fetching work orders:", error)
      setWorkOrderOptions([])
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

  // Create new work order row
  const createNewWorkOrderRow = () => ({
    id: generateUniqueId(),
    workOrder: "",
  })

  // Create new service row
  const createNewServiceRow = () => ({
    id: generateUniqueId(),
    section: "",
    width: "",
    length: "",
    qty: "",
    uom: "KG",
    totalWeight: "",
  })

  // Handle work order input change
  const handleWorkOrderChange = (rowId, value) => {
    setWorkOrderRows((prev) => prev.map((row) => (row.id === rowId ? { ...row, workOrder: value } : row)))
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
              // Simple calculation - you can modify this formula as needed
              updatedRow.totalWeight = (width * qty).toFixed(3)
            }
          }

          return updatedRow
        }
        return row
      }),
    )
  }

  // Add new work order row
  const handleAddWorkOrder = () => {
    setWorkOrderRows((prev) => [...prev, createNewWorkOrderRow()])
  }

  // Add new service row
  const handleAddService = () => {
    setServiceRows((prev) => [...prev, createNewServiceRow()])
  }

  // Remove work order row
  const handleRemoveWorkOrder = (rowId) => {
    setWorkOrderRows((prev) => prev.filter((row) => row.id !== rowId))
  }

  // Remove service row
  const handleRemoveService = (rowId) => {
    setServiceRows((prev) => prev.filter((row) => row.id !== rowId))
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

  // Save raw material entry
  const handleSaveRawMaterialEntry = async () => {
    try {
      setSaving(true)

      // Validate data
      if (workOrderRows.length === 0) {
        toast.error("Please add at least one work order")
        return
      }

      if (serviceRows.length === 0) {
        toast.error("Please add at least one service entry")
        return
      }

      // Prepare data for backend - Fixed format to match your Postman test
      const rawMaterialData = {
        workOrders: workOrderRows
          .filter((row) => row.workOrder)
          .map((row) => ({
            id: row.id,
            workOrder: row.workOrder,
          })),
        serviceEntries: serviceRows
          .filter((row) => row.section && row.width && row.length && row.qty)
          .map((row) => ({
            section: row.section,
            width: row.width,
            length: row.length,
            qty: row.qty,
            uom: row.uom,
            totalWeight: row.totalWeight,
          })),
        createdBy: "system",
        createdDate: new Date().toISOString(),
      }

      console.log("Sending data to backend:", rawMaterialData)

      // Save to backend
      const response = await fetch(`${API_BASE_URL}/rawmaterialentry`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(rawMaterialData),
      })

      console.log("Response status:", response.status)
      console.log("Response headers:", response.headers)

      if (response.ok) {
        const savedData = await response.json()
        console.log("Saved data:", savedData)

        toast.success(
          <div className="raw">
            <FaCheck className="kkk" />
            <span className="material">Raw Material Entry saved successfully!</span>
          </div>,
        )

        // Clear forms and refresh saved data
        setWorkOrderRows([])
        setServiceRows([])
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
    <div className="jj">
      {/* Header with Save Button */}
      <div className="entry">
        <div className="raw-header">
          <h3>Raw Material Entry</h3>
        </div>
        <button
          className="kkk material-save-btn"
          onClick={handleSaveRawMaterialEntry}
          disabled={saving || (workOrderRows.length === 0 && serviceRows.length === 0)}
        >
          {saving ? (
            <>
              <AiOutlineLoading3Quarters className="jj-spin" />
              <span>Saving...</span>
            </>
          ) : (
            <>
              <MdSave className="entry-icon" />
              <span>Save Raw Material New Entry</span>
            </>
          )}
        </button>
      </div>

      {/* Main Content Area */}
      <div className="raw-content">
        {/* Work Order Table */}
        <div className="kkk-table-section">
          <div className="material-table-header">
            <h4>Work Order Entry</h4>
            <button className="jj-add-btn" onClick={handleAddWorkOrder}>
              <MdAdd className="entry-add-icon" />
              <span>Add</span>
            </button>
          </div>

          <div className="raw-table-wrapper">
            <table className="kkk-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Work Order</th>
                </tr>
              </thead>
              <tbody>
                {workOrderRows.map((row) => (
                  <tr key={row.id} className="material-row">
                    <td>
                      <div className="jj-order-icon">
                        <IoMdOpen />
                      </div>
                    </td>
                    <td>
                      <select
                        value={row.workOrder}
                        onChange={(e) => handleWorkOrderChange(row.id, e.target.value)}
                        className="entry-select"
                      >
                        <option value="">Select Work Order</option>
                        {workOrderOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
                {workOrderRows.length === 0 && (
                  <tr className="kkk-empty">
                    <td colSpan="2">
                      <div className="material-empty">
                        <div className="jj-empty-text">No work orders added.</div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Service Entry Table */}
        <div className="entry-table-section">
          <div className="raw-table-header">
            <button className="kkk-add-btn" onClick={handleAddService}>
              <MdAdd className="material-add-icon" />
              <span>Add</span>
            </button>
          </div>

          <div className="jj-table-wrapper">
            <table className="entry-table">
              <thead>
                <tr>
                  <th>Section</th>
                  <th>Width</th>
                  <th>Length</th>
                  <th>Qty</th>
                  <th>UOM</th>
                  <th>Total Weight</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {/* Saved Service Rows */}
                {savedServiceRows.map((row) => (
                  <tr key={`saved_${row.id}`} className="raw-saved-row">
                    <td>{row.section || "-"}</td>
                    <td>{row.width || "-"}</td>
                    <td>{row.length || "-"}</td>
                    <td>{row.qty || "-"}</td>
                    <td>{row.uom || "-"}</td>
                    <td>{row.totalWeight || "-"}</td>
                    <td>
                      <button onClick={() => handleDeleteSavedService(row.id)} className="jj-remove-btn">
                        <MdDelete />
                      </button>
                    </td>
                  </tr>
                ))}

                {/* New Service Rows */}
                {serviceRows.map((row) => (
                  <tr key={row.id} className="raw-service-row">
                    <td>
                      <input
                        type="text"
                        value={row.section}
                        onChange={(e) => handleServiceInputChange(row.id, "section", e.target.value)}
                        className="material-input"
                        placeholder="Section"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        value={row.width}
                        onChange={(e) => handleServiceInputChange(row.id, "width", e.target.value)}
                        className="jj-input"
                        placeholder="Width"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        value={row.length}
                        onChange={(e) => handleServiceInputChange(row.id, "length", e.target.value)}
                        className="entry-input"
                        placeholder="Length"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        step="0.01"
                        value={row.qty}
                        onChange={(e) => handleServiceInputChange(row.id, "qty", e.target.value)}
                        className="raw-input"
                        placeholder="Qty"
                      />
                    </td>
                    <td>
                      <select
                        value={row.uom}
                        onChange={(e) => handleServiceInputChange(row.id, "uom", e.target.value)}
                        className="kkk-uom-select"
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
                        className="material-weight-input"
                        placeholder="Auto calculated"
                      />
                    </td>
                    <td>
                      <button onClick={() => handleRemoveService(row.id)} className="jj-remove-btn">
                        <MdDelete />
                      </button>
                    </td>
                  </tr>
                ))}
                {savedServiceRows.length === 0 && serviceRows.length === 0 && (
                  <tr className="entry-empty">
                    <td colSpan="7">
                      <div className="raw-empty">
                        <div className="kkk-empty-text">No service entries added.</div>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ToastContainer />
    </div>
  )
}

export default RawMaterialEntry;
