import { useState } from "react"
import { IoMdOpen } from "react-icons/io"
import { FiRefreshCw, FiSearch } from "react-icons/fi"
import { AiOutlineLoading3Quarters } from "react-icons/ai"
import { TiEdit } from "react-icons/ti"
import { MdDelete, MdSave, MdAdd } from "react-icons/md"
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

  // Search State
  const [searchTerm, setSearchTerm] = useState("")
  const [searchType, setSearchType] = useState("sectioncode")

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
    drawingNo: "",
    markNo: "",
    markQty: "",
    drawingIssueDate: "",
    status: "Pending",
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
    status: "Pending",
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

          // Auto-populate section name based on section code
          if (name === "sectionCode") {
            const selectedOption = sectionCodeOptions.find((option) => option.value === value)
            if (selectedOption) {
              updatedRow.sectionName = selectedOption.label.split(" - ")[1]
            }
          }

          // Auto calculate item weight based on dimensions and quantity
          if (name === "width" || name === "length" || name === "itemQty" || name === "secWeight") {
            const width = Number.parseFloat(name === "width" ? value : updatedRow.width) || 0
            const length = Number.parseFloat(name === "length" ? value : updatedRow.length) || 0
            const itemQty = Number.parseFloat(name === "itemQty" ? value : updatedRow.itemQty) || 0
            const secWeight = Number.parseFloat(name === "secWeight" ? value : updatedRow.secWeight) || 0

            // Simple calculation: width * length * secWeight * itemQty
            updatedRow.itemWeight = (width * length * secWeight * itemQty).toFixed(2)
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

  const handleSaveHeader = async () => {
    try {
      setLoading(true)

      // Simulate saving process
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Add form rows to header rows with generated IDs
      const savedRows = formRows.map((row) => ({
        ...row,
        id: Date.now() + Math.random(),
        status: "Completed",
      }))

      setHeaderRows((prev) => [...savedRows, ...prev])
      setFormRows([])

      showSuccessToast(`${savedRows.length} Work Order(s) successfully saved!`)
    } catch (error) {
      console.error("Error saving header:", error)
      toast.error("Failed to save work orders")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveService = async () => {
    try {
      setServiceLoading(true)

      // Simulate saving process
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Add form rows to service rows with generated IDs
      const savedRows = serviceFormRows.map((row) => ({
        ...row,
        id: Date.now() + Math.random(),
        status: "Completed",
      }))

      setServiceRows((prev) => [...savedRows, ...prev])
      setServiceFormRows([])

      showSuccessToast(`${savedRows.length} Service Detail(s) successfully saved!`)
    } catch (error) {
      console.error("Error saving service details:", error)
      toast.error("Failed to save service details")
    } finally {
      setServiceLoading(false)
    }
  }

  const handleRemoveFormRow = (rowId) => {
    setFormRows((prev) => prev.filter((row) => row.id !== rowId))
  }

  const handleRemoveServiceRow = (rowId) => {
    setServiceFormRows((prev) => prev.filter((row) => row.id !== rowId))
  }

  const handleDeleteHeader = (rowId) => {
    setHeaderRows((prev) => prev.filter((row) => row.id !== rowId))
    showSuccessToast("Work order deleted successfully!")
  }

  const handleDeleteService = (rowId) => {
    setServiceRows((prev) => prev.filter((row) => row.id !== rowId))
    showSuccessToast("Service detail deleted successfully!")
  }

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      return
    }

    const filteredRows = serviceRows.filter((row) => {
      switch (searchType) {
        case "itemno":
          return row.itemNo.toLowerCase().includes(searchTerm.toLowerCase())
        case "sectioncode":
          return row.sectionCode.toLowerCase().includes(searchTerm.toLowerCase())
        case "sectionname":
          return row.sectionName.toLowerCase().includes(searchTerm.toLowerCase())
        default:
          return true
      }
    })

    // For demo purposes, just show a toast
    toast.info(`Found ${filteredRows.length} matching records`)
  }

  const handleRefresh = () => {
    setHeaderRows([])
    setFormRows([])
    setServiceRows([])
    setServiceFormRows([])
    setSearchTerm("")
    toast.info("Data refreshed")
  }

  return (
    <div className="drAOelephantgi">
      {/* Header */}
      <div className="drAOliongi">
        <div className="drAOtigergi">
          <h3>Drawing Entry</h3>
        </div>
         
      </div>

      {/* Search Bar */}
      <div className="drAOsearchSectiongi">
        <div className="drAOsearchContainergi">
           
          <input
            type="text"
            placeholder={`Search by ${searchType === "itemno" ? "Item No" : searchType === "sectioncode" ? "Section Code" : "Section Name"}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="drAOsearchInputgi"
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
          <button onClick={handleSearch} className="drAOsearchButtongi">
            <FiSearch className="drAOsearchIcongi" />
            <span>Search</span>
          </button>
        </div>
      </div>

      {/* Work Order Details Table */}
      <div className="drAOzebragi">
        <div className="drAOhippogi">
          <div className="drAOrhinogi">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
              <h4 style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: "Black" }}>Work Order Entry</h4>
              <div style={{ display: "flex", gap: "10px" }}>
                <button className="drAOcheetahgi drAOaddBtngi" onClick={handleAddHeader}>
                  <MdAdd className="drAObuttonIcongi" />
                  <span>Add</span>
                </button>
                {formRows.length > 0 && (
                  <button className="drAOcheetahgi drAOsaveBtngi" onClick={handleSaveHeader} disabled={loading}>
                    {loading ? (
                      <>
                        <AiOutlineLoading3Quarters className="drAOspinIcongi" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <MdSave className="drAObuttonIcongi" />
                        <span>Save</span>
                      </>
                    )}
                  </button>
                )}
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
              <th>Drawing No</th>
              <th>Mark No</th>
              <th>Mark Qty</th>
              <th>Drawing Issue Date</th>
              <th>Status</th>
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
                  <input
                    type="text"
                    name="workOrder"
                    value={formData.workOrder}
                    onChange={(e) => handleFormInputChange(formData.id, e)}
                    className="drAOfoxgi"
                    placeholder="Work Order"
                  />
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
                  <input
                    type="date"
                    name="drawingIssueDate"
                    value={formData.drawingIssueDate}
                    onChange={(e) => handleFormInputChange(formData.id, e)}
                    className="drAOfoxgi"
                  />
                </td>
                <td>
                  <span className="drAOdeergi">Pending</span>
                </td>
                <td>
                  <div className="drAOmoosegi">
                    <button
                      className="drAOelkgi drAObisongi"
                      onClick={() => handleRemoveFormRow(formData.id)}
                      title="Remove"
                      disabled={loading}
                    >
                      <MdDelete />
                    </button>
                  </div>
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
                <td>{row.drawingNo}</td>
                <td>{row.markNo}</td>
                <td>{row.markQty}</td>
                <td>{row.drawingIssueDate}</td>
                <td>
                  <span className="drAOdeergi" style={{ backgroundColor: "#c6f6d5", color: "#22543d" }}>
                    Completed
                  </span>
                </td>
                <td>
                  <div className="drAOmoosegi">
                    <button className="drAOelkgi drAOimpalagi" title="Edit">
                      <TiEdit />
                    </button>
                    <button className="drAOelkgi drAObisongi" title="Delete" onClick={() => handleDeleteHeader(row.id)}>
                      <MdDelete />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {headerRows.length === 0 && formRows.length === 0 && (
              <tr className="drAOyakgi">
                <td colSpan="11">
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
              <h4 style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: "Black" }}>
                Service Entry
              </h4>
              <div style={{ display: "flex", gap: "10px" }}>
                <button className="drAOcheetahgi drAOaddBtngi" onClick={handleAddService}>
                  <MdAdd className="drAObuttonIcongi" />
                  <span>Add</span>
                </button>
                {serviceFormRows.length > 0 && (
                  <button className="drAOcheetahgi drAOsaveBtngi" onClick={handleSaveService} disabled={serviceLoading}>
                    {serviceLoading ? (
                      <>
                        <AiOutlineLoading3Quarters className="drAOspinIcongi" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <MdSave className="drAObuttonIcongi" />
                        <span>Save</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="drAOleopardgi">
        {serviceLoading && (
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
              <th>Item No</th>
              <th>Section Code</th>
              <th>Section Name</th>
              <th>Sec. Wty</th>
              <th>Width</th>
              <th>Length</th>
              <th>Item Qty</th>
              <th>Item Weight</th>
              <th>Status</th>
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
                    <option value="">Select Section Code</option>
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
                    className="drAOfoxgi readonly"
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
                    step="0.01"
                    name="itemWeight"
                    value={formData.itemWeight}
                    className="drAOfoxgi readonly"
                    placeholder="Item Weight"
                    readOnly
                  />
                </td>
                <td>
                  <span className="drAOdeergi">Pending</span>
                </td>
                <td>
                  <div className="drAOmoosegi">
                    <button
                      className="drAOelkgi drAObisongi"
                      onClick={() => handleRemoveServiceRow(formData.id)}
                      title="Remove"
                      disabled={serviceLoading}
                    >
                      <MdDelete />
                    </button>
                  </div>
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
                <td>
                  <span className="drAOdeergi" style={{ backgroundColor: "#c6f6d5", color: "#22543d" }}>
                    Completed
                  </span>
                </td>
                <td>
                  <div className="drAOmoosegi">
                    <button className="drAOelkgi drAOimpalagi" title="Edit">
                      <TiEdit />
                    </button>
                    <button
                      className="drAOelkgi drAObisongi"
                      title="Delete"
                      onClick={() => handleDeleteService(row.id)}
                    >
                      <MdDelete />
                    </button>
                  </div>
                </td>
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

      <ToastContainer />
    </div>
  )
}

export default DrawingEntry;
