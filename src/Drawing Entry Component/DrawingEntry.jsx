
import { useState } from "react"
import { IoMdOpen } from "react-icons/io"
import { AiOutlineLoading3Quarters } from "react-icons/ai"
import { MdSave, MdAdd } from "react-icons/md"
import { FaCheck } from "react-icons/fa"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import '../Drawing Entry Component/DrawingEntry.css'

const DrawingEntry = () => {
  // Work Order Header Table State
  const [headerRows, setHeaderRows] = useState([])
  const [formRows, setFormRows] = useState([])
  const [loading, setLoading] = useState(false)

  // Service Details Table State
  const [serviceRows, setServiceRows] = useState([])
  const [serviceFormRows, setServiceFormRows] = useState([])
  const [serviceLoading, setServiceLoading] = useState(false)

  // Work Order options for dropdown
  const workOrderOptions = [
    { value: "WO001", label: "WO001 - Structural Work" },
    { value: "WO002", label: "WO002 - Mechanical Installation" },
    { value: "WO003", label: "WO003 - Electrical Work" },
    { value: "WO004", label: "WO004 - Piping Installation" },
    { value: "WO005", label: "WO005 - Civil Construction" },
    { value: "WO006", label: "WO006 - Equipment Installation" },
    { value: "WO007", label: "WO007 - Maintenance Work" },
    { value: "WO008", label: "WO008 - Inspection Work" },
  ]

  // Section Code options for dropdown
  const sectionCodeOptions = [
    { value: "SEC001", label: "SEC001 - Main Structure" },
    { value: "SEC002", label: "SEC002 - Support Beam" },
    { value: "SEC003", label: "SEC003 - Column Base" },
    { value: "SEC004", label: "SEC004 - Roof Truss" },
    { value: "SEC005", label: "SEC005 - Wall Panel" },
    { value: "SEC006", label: "SEC006 - Foundation" },
    { value: "SEC007", label: "SEC007 - Staircase" },
    { value: "SEC008", label: "SEC008 - Platform" },
  ]

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

  const createNewServiceRow = () => ({
    id: Date.now() + Math.random(),
    itemNo: "",
    sectionCode: "",
    sectionName: "",
    secWeight: "",
    width: "",
    length: "",
    itemQty: "",
    itemWeight: "",
  })

  const handleFormInputChange = (rowId, e) => {
    const { name, value } = e.target
    setFormRows((prev) => prev.map((row) => (row.id === rowId ? { ...row, [name]: value } : row)))
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
                    className="drAOfoxgi"
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
                    className="drAOfoxgi"
                    placeholder="Plant Location"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={(e) => handleFormInputChange(formData.id, e)}
                    className="drAOfoxgi"
                    placeholder="Department"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    name="workLocation"
                    value={formData.workLocation}
                    onChange={(e) => handleFormInputChange(formData.id, e)}
                    className="drAOfoxgi"
                    placeholder="Work Location"
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
              </tr>
            ))}
            {headerRows.length === 0 && formRows.length === 0 && (
              <tr className="drAOyakgi">
                <td colSpan="9">
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
        <table className="drAOlynxgi">
          <thead>
            <tr>
              <th>Service #</th>
              <th>Item No</th>
              <th>Section Code</th>
              <th>Section Name</th>
              <th>Section Weigth</th>
              <th>Width</th>
              <th>Length</th>
              <th>Item Qty</th>
              <th>Item Weight</th>
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
                    className="drAOfoxgi"
                    placeholder="Item No"
                  />
                </td>
                <td>
                  <select
                    name="sectionCode"
                    value={formData.sectionCode}
                    onChange={(e) => handleServiceInputChange(formData.id, e)}
                    className="drAOfoxgi"
                  >
                    <option value="">Section Code</option>
                    {sectionCodeOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </td>
                <td>
                  <input
                    type="text"
                    name="sectionName"
                    value={formData.sectionName}
                    onChange={(e) => handleServiceInputChange(formData.id, e)}
                    className="drAOfoxgi"
                    placeholder="Section Name"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    step="0.01"
                    name="secWeight"
                    value={formData.secWeight}
                    onChange={(e) => handleServiceInputChange(formData.id, e)}
                    className="drAOfoxgi"
                    placeholder="Sec. Weight"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    step="0.01"
                    name="width"
                    value={formData.width}
                    onChange={(e) => handleServiceInputChange(formData.id, e)}
                    className="drAOfoxgi"
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
                    className="drAOfoxgi"
                    placeholder="Length"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    name="itemQty"
                    value={formData.itemQty}
                    onChange={(e) => handleServiceInputChange(formData.id, e)}
                    className="drAOfoxgi"
                    placeholder="Item Qty"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    step="0.001"
                    name="itemWeight"
                    value={formData.itemWeight}
                    className="drAOfoxgi readonly"
                    placeholder="Item Weight"
                    readOnly
                  />
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
              </tr>
            ))}
            {serviceRows.length === 0 && serviceFormRows.length === 0 && (
              <tr className="drAOyakgi">
                <td colSpan="9">
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
