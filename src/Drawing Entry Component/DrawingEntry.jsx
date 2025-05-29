import { useState, useEffect } from "react"
import { IoMdOpen } from "react-icons/io"
import { AiOutlineLoading3Quarters } from "react-icons/ai"
import { MdSave, MdAdd } from "react-icons/md"
import { FaCheck } from "react-icons/fa"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import '../Drawing Entry Component/DrawingEntry.css'

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
  const [searchTerms, setSearchTerms] = useState({}) // Store search terms per row
  const [filteredSectionCodes, setFilteredSectionCodes] = useState({}) // Store filtered codes per row
  const [showDropdowns, setShowDropdowns] = useState({}) // Control dropdown visibility per row

  // Fetch work orders and section codes on component mount
  useEffect(() => {
    fetchWorkOrders()
    fetchSectionCodes()
  }, [])

  // Fetch work orders from API
  const fetchWorkOrders = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/getworkorder/number`)
      if (response.ok) {
        const data = await response.json()
        const formattedOptions = data.map(workOrder => ({
          value: workOrder,
          label: workOrder
        }))
        setWorkOrderOptions(formattedOptions)
      } else {
        console.error('Failed to fetch work orders')
        toast.error('Failed to fetch work orders')
      }
    } catch (error) {
      console.error('Error fetching work orders:', error)
      toast.error('Error fetching work orders')
    }
  }

  // Fetch section codes from API
  const fetchSectionCodes = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/service_code_entry/codes`)
      if (response.ok) {
        const data = await response.json()
        const formattedOptions = data.map(code => ({
          value: code,
          label: code
        }))
        setSectionCodeOptions(formattedOptions)
      } else {
        console.error('Failed to fetch section codes')
        toast.error('Failed to fetch section codes')
      }
    } catch (error) {
      console.error('Error fetching section codes:', error)
      toast.error('Error fetching section codes')
    }
  }

  // Fetch work order details when a work order is selected
  const fetchWorkOrderDetails = async (workOrder, rowId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/getworkorder/number/${workOrder}`)
      if (response.ok) {
        const data = await response.json()
        setFormRows(prev => prev.map(row => {
          if (row.id === rowId) {
            return {
              ...row,
              plantLocation: data.plantLocation || "",
              department: data.department || "",
              workLocation: data.workLocation || ""
            }
          }
          return row
        }))
      } else {
        console.error('Failed to fetch work order details')
        toast.error('Failed to fetch work order details')
      }
    } catch (error) {
      console.error('Error fetching work order details:', error)
      toast.error('Error fetching work order details')
    }
  }

  // Fetch section code details when a section code is selected
  const fetchSectionCodeDetails = async (sectionCode, rowId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/service_code_entry/code/${sectionCode}`)
      if (response.ok) {
        const data = await response.json()
        setServiceFormRows(prev => prev.map(row => {
          if (row.id === rowId) {
            const updatedRow = {
              ...row,
              sectionName: data.name || "",
              secWeight: data.wgt || 0
            }
            
            // Recalculate item weight if all required fields are present
            if (updatedRow.width && updatedRow.length && updatedRow.itemQty) {
              const width = Number.parseFloat(updatedRow.width) || 0
              const length = Number.parseFloat(updatedRow.length) || 0
              const itemQty = Number.parseFloat(updatedRow.itemQty) || 0
              const secWeight = Number.parseFloat(data.wgt) || 0
              
              updatedRow.itemWeight = ((width / 1000) * (length / 1000) * secWeight * itemQty).toFixed(3)
            }
            
            return updatedRow
          }
          return row
        }))
      } else {
        console.error('Failed to fetch section code details')
        toast.error('Failed to fetch section code details')
      }
    } catch (error) {
      console.error('Error fetching section code details:', error)
      toast.error('Error fetching section code details')
    }
  }

  // Handle search input for section codes
  const handleSectionCodeSearch = (rowId, term) => {
    setSearchTerms(prev => ({ ...prev, [rowId]: term }))
    
    if (!term) {
      setFilteredSectionCodes(prev => ({ ...prev, [rowId]: sectionCodeOptions }))
    } else {
      const filtered = sectionCodeOptions.filter(option => 
        option.value.toLowerCase().includes(term.toLowerCase())
      )
      setFilteredSectionCodes(prev => ({ ...prev, [rowId]: filtered }))
    }
    
    // Show dropdown when typing
    setShowDropdowns(prev => ({ ...prev, [rowId]: true }))
  }

  // Handle section code selection
  const handleSectionCodeSelect = (rowId, sectionCode) => {
    // Update the form data
    setServiceFormRows(prev => prev.map(row => {
      if (row.id === rowId) {
        return { ...row, sectionCode: sectionCode }
      }
      return row
    }))
    
    // Update search term to show selected value
    setSearchTerms(prev => ({ ...prev, [rowId]: sectionCode }))
    
    // Hide dropdown
    setShowDropdowns(prev => ({ ...prev, [rowId]: false }))
    
    // Fetch section code details
    if (sectionCode) {
      fetchSectionCodeDetails(sectionCode, rowId)
    }
  }

  const createNewFormRow = () => ({
    id: Date.now() + Math.random(),
    workOrder: "",
    plantLocation: "",
    department: "",
    workLocation: "",
    lineNumber: "",
    drawingNo: "",
    markNo: "",
    markQty: "",
  })

  const createNewServiceRow = () => {
    const newId = Date.now() + Math.random()
    // Initialize search state for new row
    setSearchTerms(prev => ({ ...prev, [newId]: "" }))
    setFilteredSectionCodes(prev => ({ ...prev, [newId]: sectionCodeOptions }))
    setShowDropdowns(prev => ({ ...prev, [newId]: false }))
    
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
    }
  }

  const handleFormInputChange = (rowId, e) => {
    const { name, value } = e.target
    setFormRows((prev) => prev.map((row) => {
      if (row.id === rowId) {
        // If work order is changed, fetch the related details
        if (name === "workOrder" && value) {
          fetchWorkOrderDetails(value, rowId)
        }
        return { ...row, [name]: value }
      }
      return row
    }))
  }

  const handleServiceInputChange = (rowId, e) => {
    const { name, value } = e.target
    setServiceFormRows((prev) =>
      prev.map((row) => {
        if (row.id === rowId) {
          const updatedRow = { ...row, [name]: value }

          // Calculate item weight using the formula: (width/1000)*(length/1000)*Sec. Wty*item qty
          if (name === "width" || name === "length" || name === "itemQty" || name === "secWeight") {
            const width = Number.parseFloat(name === "width" ? value : updatedRow.width) || 0
            const length = Number.parseFloat(name === "length" ? value : updatedRow.length) || 0
            const itemQty = Number.parseFloat(name === "itemQty" ? value : updatedRow.itemQty) || 0
            const secWeight = Number.parseFloat(name === "secWeight" ? value : updatedRow.secWeight) || 0

            // Formula: (width/1000)*(length/1000)*Sec. Wty*item qty
            updatedRow.itemWeight = ((width / 1000) * (length / 1000) * secWeight * itemQty).toFixed(3)
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

  const handleSaveAll = async () => {
    try {
      setLoading(true)

      // Simulate saving process
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Save header rows if any
      if (formRows.length > 0) {
        const savedHeaderRows = formRows.map((row) => ({
          ...row,
          id: Date.now() + Math.random(),
        }))
        setHeaderRows((prev) => [...savedHeaderRows, ...prev])
        setFormRows([])
      }

      // Save service rows if any
      if (serviceFormRows.length > 0) {
        const savedServiceRows = serviceFormRows.map((row) => ({
          ...row,
          id: Date.now() + Math.random(),
        }))
        setServiceRows((prev) => [...savedServiceRows, ...prev])
        setServiceFormRows([])
      }

      const totalSaved = formRows.length + serviceFormRows.length
      if (totalSaved > 0) {
        showSuccessToast(`${totalSaved} record(s) successfully saved!`)
      } else {
        toast.info("No new records to save")
      }
    } catch (error) {
      console.error("Error saving data:", error)
      toast.error("Failed to save data")
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
    setSearchTerms(prev => {
      const newState = { ...prev }
      delete newState[rowId]
      return newState
    })
    setFilteredSectionCodes(prev => {
      const newState = { ...prev }
      delete newState[rowId]
      return newState
    })
    setShowDropdowns(prev => {
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

        <table className="drAOlynxgi">
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
                      <option key={option.value} value={option.value}>
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
                    name="lineNumber"
                    value={formData.lineNumber}
                    onChange={(e) => handleFormInputChange(formData.id, e)}
                    className="drAOfoxgi"
                    placeholder="Line Number"
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
                  />
                </td>
                <td>
                  <button 
                    onClick={() => handleRemoveFormRow(formData.id)}
                    className="drAOremoveBtngi"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
            {headerRows.map((row) => (
              <tr key={row.id} className="drAOantelopegi">
                <td>
                  <div className="drAOwolfgi">
                    <IoMdOpen />
                  </div>
                </td>
                <td className="drAOgazellegi">{row.workOrder}</td>
                <td>{row.plantLocation}</td>
                <td>{row.department}</td>
                <td>{row.workLocation}</td>
                <td>{row.lineNumber}</td>
                <td>{row.drawingNo}</td>
                <td>{row.markNo}</td>
                <td>{row.markQty}</td>
                <td></td>
              </tr>
            ))}
            {headerRows.length === 0 && formRows.length === 0 && (
              <tr className="drAOyakgi">
                <td colSpan="10">
                  <div className="drAOcamelgi">
                    <div className="drAOllamagi">No work order records found.</div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Service Details Table */}
      <div className="drAOzebragi drAOserviceSectiongi">
        <div className="drAOhippogi">
          <div className="drAOrhinogi">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
              <h4 style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: "black" }}>
                Service Entry
              </h4>
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
        <table className="drAOlynxgi drAOserviceTablegi">
          <thead>
            <tr>
              <th>Service #</th>
              <th>Item No</th>
              <th>Section Code</th>
              <th>Section Name</th>
              <th>Section Weight</th>
              <th>Width</th>
              <th>Length</th>
              <th>Item Qty</th>
              <th>Item Weight</th>
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
                <td>
                  <div className="drAOsearchableSelectgi">
                    <input
                      type="text"
                      placeholder="Search or select section code..."
                      value={searchTerms[formData.id] || ""}
                      onChange={(e) => handleSectionCodeSearch(formData.id, e.target.value)}
                      onFocus={() => setShowDropdowns(prev => ({ ...prev, [formData.id]: true }))}
                      className="drAOsearchInputgi"
                    />
                    {showDropdowns[formData.id] && (
                      <div className="drAOdropdownListgi">
                        {(filteredSectionCodes[formData.id] || sectionCodeOptions).map((option) => (
                          <div
                            key={option.value}
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
                    name="itemQty"
                    value={formData.itemQty}
                    onChange={(e) => handleServiceInputChange(formData.id, e)}
                    className="drAOfoxgi drAOserviceInputgi"
                    placeholder="Item Qty"
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
                  <button 
                    onClick={() => handleRemoveServiceRow(formData.id)}
                    className="drAOremoveBtngi"
                  >
                    Remove
                  </button>
                </td>
              </tr>
            ))}
            {serviceRows.map((row) => (
              <tr key={row.id} className="drAOantelopegi">
                <td>
                  <div className="drAOwolfgi">
                    <IoMdOpen />
                  </div>
                </td>
                <td>{row.itemNo}</td>
                <td className="drAOgazellegi">{row.sectionCode}</td>
                <td>{row.sectionName}</td>
                <td>{row.secWeight}</td>
                <td>{row.width}</td>
                <td>{row.length}</td>
                <td>{row.itemQty}</td>
                <td>{row.itemWeight}</td>
                <td></td>
              </tr>
            ))}
            {serviceRows.length === 0 && serviceFormRows.length === 0 && (
              <tr className="drAOyakgi">
                <td colSpan="10">
                  <div className="drAOcamelgi">
                    <div className="drAOllamagi">No service records found.</div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ToastContainer />
    </div>
  )
}

export default DrawingEntry;