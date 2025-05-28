import { useState, useEffect } from "react"
import axios from "axios"
import { IoMdOpen } from "react-icons/io"
import { FiRefreshCw, FiSearch } from "react-icons/fi"
import { AiOutlineLoading3Quarters } from "react-icons/ai"
import { TiEdit } from "react-icons/ti"
import { MdDelete, MdSave, MdAdd } from "react-icons/md"
import { FaCheck } from "react-icons/fa"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import '../POEntry Component/PoEntry.css'

const API_BASE_URL = "http://195.35.45.56:5522/api/V2.0"

const POEntry = () => {
  // Bits Header Table State
  const [headerRows, setHeaderRows] = useState([])
  const [formRows, setFormRows] = useState([])
  const [loading, setLoading] = useState(false)

  // Service Details Table State
  const [serviceRows, setServiceRows] = useState([])
  const [serviceFormRows, setServiceFormRows] = useState([])
  const [serviceLoading, setServiceLoading] = useState(false)

  // Search State
  const [searchTerm, setSearchTerm] = useState("")
  const [searchType, setSearchType] = useState("servicecode")

  // Load service data on component mount
  useEffect(() => {
    loadServiceData()
  }, [])

  const loadServiceData = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/getAllBitsLines/details`)
      setServiceRows(response.data)
    } catch (error) {
      console.error("Error loading service data:", error)
    }
  }

  const createNewFormRow = () => ({
    id: Date.now() + Math.random(),
    workOrder: "",
    plantLocation: "",
    department: "",
    workLocation: "",
    workOrderDate: "",
    completionDate: "",
    ldApplicable: false,
  })

  const createNewServiceRow = () => ({
    id: Date.now() + Math.random(),
    serNo: "",
    serviceCode: "",
    serviceDesc: "",
    qty: "",
    uom: "",
    rate: "", // Changed from unitPrice to rate
    amount: "", // Changed from totalPrice to amount
  })

  const handleFormInputChange = (rowId, e) => {
    const { name, value, type, checked } = e.target
    setFormRows((prev) =>
      prev.map((row) => (row.id === rowId ? { ...row, [name]: type === "checkbox" ? checked : value } : row)),
    )
  }

  const handleServiceInputChange = (rowId, e) => {
    const { name, value } = e.target
    setServiceFormRows((prev) =>
      prev.map((row) => {
        if (row.id === rowId) {
          const updatedRow = { ...row, [name]: value }
          // Auto calculate total price (amount)
          if (name === "qty" || name === "rate") {
            const qty = Number.parseFloat(name === "qty" ? value : updatedRow.qty) || 0
            const rate = Number.parseFloat(name === "rate" ? value : updatedRow.rate) || 0
            updatedRow.amount = (qty * rate).toFixed(2)
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
      <div className="AOsuccessToastKI">
        <FaCheck className="AOtoastIconKI" />
        <span className="AOtoastTextKI">{message}</span>
      </div>,
      {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        className: "AOcustomToastKI",
      },
    )
  }

  const handleSaveHeader = async () => {
    try {
      setLoading(true)

      // Simulate 1 second loading
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const savedRows = []

      for (const formData of formRows) {
        const { id, ...dataToSave } = formData
        const response = await axios.post(`${API_BASE_URL}/createBitsHeader/details`, dataToSave, {
          headers: {
            "Content-Type": "application/json",
          },
        })
        savedRows.push(response.data)
      }

      // Add the new records to the beginning of the array to show latest first
      setHeaderRows((prev) => [...savedRows, ...prev])

      // Clear form rows
      setFormRows([])

      showSuccessToast(`${savedRows.length} Bits Header(s) successfully stored!`)
    } catch (error) {
      console.error("Error saving header:", error)
      toast.error("Failed to save header")
    } finally {
      setLoading(false)
    }
  }

  const handleSaveService = async () => {
    try {
      setServiceLoading(true)

      // Simulate 1 second loading
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const savedRows = []

      for (const formData of serviceFormRows) {
        const { id, ...dataToSave } = formData

        // Convert string values to numbers for qty, rate, and amount
        const processedData = {
          ...dataToSave,
          qty: dataToSave.qty ? Number.parseFloat(dataToSave.qty) : null,
          rate: dataToSave.rate ? Number.parseFloat(dataToSave.rate) : null,
          amount: dataToSave.amount ? Number.parseFloat(dataToSave.amount) : null,
        }

        const response = await axios.post(`${API_BASE_URL}/createBitsLine/details`, processedData, {
          headers: {
            "Content-Type": "application/json",
          },
        })
        savedRows.push(response.data)
      }

      // Add the new records to the beginning of the array to show latest first
      setServiceRows((prev) => [...savedRows, ...prev])

      // Clear form rows
      setServiceFormRows([])

      showSuccessToast(`${savedRows.length} Service Detail(s) successfully stored!`)
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

  const handleDeleteService = async (lineId) => {
    try {
      await axios.delete(`${API_BASE_URL}/deleteBitsLine/details?id=${lineId}`)
      setServiceRows((prev) => prev.filter((row) => row.lineId !== lineId))
      showSuccessToast("Service deleted successfully!")
    } catch (error) {
      console.error("Error deleting service:", error)
      toast.error("Failed to delete service")
    }
  }

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      loadServiceData()
      return
    }

    try {
      let endpoint = ""
      switch (searchType) {
        case "serno":
          endpoint = `${API_BASE_URL}/searchBitsLinesBySerNo/details?serNo=${encodeURIComponent(searchTerm)}`
          break
        case "servicecode":
          endpoint = `${API_BASE_URL}/searchBitsLinesByServiceCode/details?serviceCode=${encodeURIComponent(searchTerm)}`
          break
        case "servicedesc":
          endpoint = `${API_BASE_URL}/searchBitsLinesByServiceDesc/details?serviceDesc=${encodeURIComponent(searchTerm)}`
          break
        default:
          endpoint = `${API_BASE_URL}/getAllBitsLines/details`
      }

      const response = await axios.get(endpoint)
      setServiceRows(response.data)
    } catch (error) {
      console.error("Error searching:", error)
      toast.error("Search failed")
    }
  }

  const handleRefresh = () => {
    // Reset to initial state - clear all data
    setHeaderRows([])
    setFormRows([])
    setServiceFormRows([])
    setSearchTerm("")
    loadServiceData()
    toast.info("Data refreshed")
  }

  return (
    <div className="AOelephantKI">
      {/* Header */}
      <div className="AOlionKI">
        <div className="AOtigerKI">
          <h3>Bits Header Entry</h3>
        </div>
        <button className="AOgiraffeKI" onClick={handleRefresh}>
          <FiRefreshCw className="AOrefreshIconKI" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="AOsearchSectionKI">
        <div className="AOsearchContainerKI">
          
          <input
            type="text"
            placeholder={`Search by ${searchType === "serno" ? "Serial No" : searchType === "servicecode" ? "Service Code" : "Service Description"}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="AOsearchInputKI"
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
          <button onClick={handleSearch} className="AOsearchButtonKI">
            <FiSearch className="AOsearchIconKI" />
            <span>Search</span>
          </button>
        </div>
      </div>

      {/* Bits Header Table */}
      <div className="AOzebraKI">
        <div className="AOhippoKI">
          <div className="AOrhinoKI">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
              <h4 style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: "white" }}>Work Order Details</h4>
              <div style={{ display: "flex", gap: "10px" }}>
                <button className="AOcheetahKI AOaddBtnKI" onClick={handleAddHeader}>
                  <MdAdd className="AObuttonIconKI" />
                  <span>Add</span>
                </button>
                {formRows.length > 0 && (
                  <button className="AOcheetahKI AOsaveBtnKI" onClick={handleSaveHeader} disabled={loading}>
                    {loading ? (
                      <>
                        <AiOutlineLoading3Quarters className="AOspinIconKI" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <MdSave className="AObuttonIconKI" />
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

      <div className="AOleopardKI">
        {loading && (
          <div className="AOpantherKI">
            <div className="AOjaguarKI">
              <AiOutlineLoading3Quarters />
            </div>
            <div className="AOcougarKI">Saving data...</div>
          </div>
        )}

        <table className="AOlynxKI">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Work Order</th>
              <th>Plant Location</th>
              <th>Department</th>
              <th>Work Location</th>
              <th>Work Order Date</th>
              <th>Completion Date</th>
              <th>LD Applicable</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {formRows.map((formData, index) => (
              <tr key={formData.id} className="AObearKI">
                <td>
                  <div className="AOwolfKI">
                    <IoMdOpen />
                  </div>
                </td>
                <td>
                  <input
                    type="text"
                    name="workOrder"
                    value={formData.workOrder}
                    onChange={(e) => handleFormInputChange(formData.id, e)}
                    className="AOfoxKI"
                    placeholder="Work Order"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    name="plantLocation"
                    value={formData.plantLocation}
                    onChange={(e) => handleFormInputChange(formData.id, e)}
                    className="AOfoxKI"
                    placeholder="Plant Location"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={(e) => handleFormInputChange(formData.id, e)}
                    className="AOfoxKI"
                    placeholder="Department"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    name="workLocation"
                    value={formData.workLocation}
                    onChange={(e) => handleFormInputChange(formData.id, e)}
                    className="AOfoxKI"
                    placeholder="Work Location"
                  />
                </td>
                <td>
                  <input
                    type="date"
                    name="workOrderDate"
                    value={formData.workOrderDate}
                    onChange={(e) => handleFormInputChange(formData.id, e)}
                    className="AOfoxKI"
                  />
                </td>
                <td>
                  <input
                    type="date"
                    name="completionDate"
                    value={formData.completionDate}
                    onChange={(e) => handleFormInputChange(formData.id, e)}
                    className="AOfoxKI"
                  />
                </td>
                <td>
                  <input
                    type="checkbox"
                    name="ldApplicable"
                    checked={formData.ldApplicable}
                    onChange={(e) => handleFormInputChange(formData.id, e)}
                    className="AOrabbitKI"
                  />
                </td>
                <td>
                  <span className="AOdeerKI">Pending</span>
                </td>
                <td>
                  <div className="AOmooseKI">
                    <button
                      className="AOelkKI AObisonKI"
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
            {headerRows.map((row, index) => (
              <tr key={row.id || index} className="AOantelopeKI">
                <td>
                  <div className="AOwolfKI">
                    <IoMdOpen />
                  </div>
                </td>
                <td className="AOgazelleKI">{row.workOrder}</td>
                <td>{row.plantLocation}</td>
                <td>{row.department}</td>
                <td>{row.workLocation}</td>
                <td>{row.workOrderDate}</td>
                <td>{row.completionDate}</td>
                <td>{row.ldApplicable ? "Yes" : "No"}</td>
                <td>
                  <span className="AOdeerKI" style={{ backgroundColor: "#c6f6d5", color: "#22543d" }}>
                    Completed
                  </span>
                </td>
                <td>
                  <div className="AOmooseKI">
                    <button className="AOelkKI AOimpalaKI" title="Edit">
                      <TiEdit />
                    </button>
                    <button className="AOelkKI AObisonKI" title="Delete">
                      <MdDelete />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {headerRows.length === 0 && formRows.length === 0 && (
              <tr className="AOyakKI">
                <td colSpan="10">
                  <div className="AOcamelKI">
                    <div className="AOllamaKI">No records found.</div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Service Details Table */}
      <div className="AOzebraKI AOserviceSectionKI">
        <div className="AOhippoKI">
          <div className="AOrhinoKI">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
              <h4 style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: "white" }}>
                Service Details Management
              </h4>
              <div style={{ display: "flex", gap: "10px" }}>
                <button className="AOcheetahKI AOaddBtnKI" onClick={handleAddService}>
                  <MdAdd className="AObuttonIconKI" />
                  <span>Add</span>
                </button>
                {serviceFormRows.length > 0 && (
                  <button className="AOcheetahKI AOsaveBtnKI" onClick={handleSaveService} disabled={serviceLoading}>
                    {serviceLoading ? (
                      <>
                        <AiOutlineLoading3Quarters className="AOspinIconKI" />
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <MdSave className="AObuttonIconKI" />
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

      <div className="AOleopardKI">
        {serviceLoading && (
          <div className="AOpantherKI">
            <div className="AOjaguarKI">
              <AiOutlineLoading3Quarters />
            </div>
            <div className="AOcougarKI">Saving data...</div>
          </div>
        )}

        <table className="AOlynxKI">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Serial No</th>
              <th>Service Code</th>
              <th>Service Description</th>
              <th>QTY</th>
              <th>UOM</th>
              <th>Unit Price</th>
              <th>Total Price</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {serviceFormRows.map((formData, index) => (
              <tr key={formData.id} className="AObearKI">
                <td>
                  <div className="AOwolfKI">
                    <IoMdOpen />
                  </div>
                </td>
                <td>
                  <input
                    type="text"
                    name="serNo"
                    value={formData.serNo}
                    onChange={(e) => handleServiceInputChange(formData.id, e)}
                    className="AOfoxKI"
                    placeholder="Serial No"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    name="serviceCode"
                    value={formData.serviceCode}
                    onChange={(e) => handleServiceInputChange(formData.id, e)}
                    className="AOfoxKI"
                    placeholder="Service Code"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    name="serviceDesc"
                    value={formData.serviceDesc}
                    onChange={(e) => handleServiceInputChange(formData.id, e)}
                    className="AOfoxKI"
                    placeholder="Service Description"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    name="qty"
                    value={formData.qty}
                    onChange={(e) => handleServiceInputChange(formData.id, e)}
                    className="AOfoxKI"
                    placeholder="QTY"
                  />
                </td>
                <td>
                  <input
                    type="text"
                    name="uom"
                    value={formData.uom}
                    onChange={(e) => handleServiceInputChange(formData.id, e)}
                    className="AOfoxKI"
                    placeholder="UOM"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    step="0.01"
                    name="rate"
                    value={formData.rate}
                    onChange={(e) => handleServiceInputChange(formData.id, e)}
                    className="AOfoxKI"
                    placeholder="Unit Price"
                  />
                </td>
                <td>
                  <input
                    type="number"
                    step="0.01"
                    name="amount"
                    value={formData.amount}
                    className="AOfoxKI readonly"
                    placeholder="Total Price"
                    readOnly
                  />
                </td>
                <td>
                  <span className="AOdeerKI">Pending</span>
                </td>
                <td>
                  <div className="AOmooseKI">
                    <button
                      className="AOelkKI AObisonKI"
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
            {serviceRows.map((row, index) => (
              <tr key={row.lineId || index} className="AOantelopeKI">
                <td>
                  <div className="AOwolfKI">
                    <IoMdOpen />
                  </div>
                </td>
                <td>{row.serNo}</td>
                <td className="AOgazelleKI">{row.serviceCode}</td>
                <td>{row.serviceDesc}</td>
                <td>{row.qty}</td>
                <td>{row.uom}</td>
                <td>{row.rate}</td>
                <td>{row.amount}</td>
                <td>
                  <span className="AOdeerKI" style={{ backgroundColor: "#c6f6d5", color: "#22543d" }}>
                    Completed
                  </span>
                </td>
                <td>
                  <div className="AOmooseKI">
                    <button className="AOelkKI AOimpalaKI" title="Edit">
                      <TiEdit />
                    </button>
                    <button
                      className="AOelkKI AObisonKI"
                      title="Delete"
                      onClick={() => handleDeleteService(row.lineId)}
                    >
                      <MdDelete />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {serviceRows.length === 0 && serviceFormRows.length === 0 && (
              <tr className="AOyakKI">
                <td colSpan="10">
                  <div className="AOcamelKI">
                    <div className="AOllamaKI">No service records found.</div>
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

export default POEntry;
