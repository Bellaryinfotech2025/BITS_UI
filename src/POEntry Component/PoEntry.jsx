import { useState, useEffect } from "react"
import axios from "axios"
import { IoMdOpen } from "react-icons/io"
import { AiOutlineLoading3Quarters } from "react-icons/ai"
import { TiEdit } from "react-icons/ti"
import { MdDelete, MdSave, MdAdd, MdClose } from "react-icons/md"
import { FaCheck } from "react-icons/fa"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import "../POEntry Component/PoEntry.css"

const API_BASE_URL = "http://195.35.45.56:5522/api/V2.0"

const POEntry = ({ onClose }) => {
  // Bits Header Table State
  const [headerRows, setHeaderRows] = useState([])
  const [formRows, setFormRows] = useState([])
  const [loading, setLoading] = useState(false)

  // Service Details Table State
  const [serviceRows, setServiceRows] = useState([])
  const [serviceFormRows, setServiceFormRows] = useState([])
  const [serviceLoading, setServiceLoading] = useState(false)

  // Initialize with one form row and load service data
  useEffect(() => {
    setFormRows([createNewFormRow()])
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
    rate: "",
    amount: "",
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

      setHeaderRows((prev) => [...savedRows, ...prev])
      setFormRows([createNewFormRow()]) // Reset to one empty form
      showSuccessToast(`${savedRows.length} Work Order Data successfully stored!`)
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
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const savedRows = []
      for (const formData of serviceFormRows) {
        const { id, ...dataToSave } = formData
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

      setServiceRows((prev) => [...savedRows, ...prev])
      setServiceFormRows([])
      showSuccessToast(`${savedRows.length} Service Data successfully stored!`)
    } catch (error) {
      console.error("Error saving service details:", error)
      toast.error("Failed to save service details")
    } finally {
      setServiceLoading(false)
    }
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

  const handleCancel = () => {
    if (onClose) {
      onClose()
    }
  }

  return (
    <div className="AOelephantKI">
      {/* Header with Cancel Button */}
      <div className="AOlionKI">
        <div className="AOtigerKI">
          <h3>Work Order Entry Form</h3>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
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
          <button className="AOcancelButtonKI" onClick={handleCancel}>
            <MdClose className="AOrefreshIconKI" />
            <span>Cancel</span>
          </button>
        </div>
      </div>

      {/* Work Order Form Section - Always show one form */}
      <div className="AOformSectionKI">
        <div className="AOformHeaderKI">
          <h4>Work Order Entry</h4>
          
        </div>

        {/* Form Grid Layout */}
        {formRows.map((formData) => (
          <div key={formData.id} className="AOformGridKI">
            <div className="AOformRowKI">
              <div className="AOformFieldKI">
                <label className="AOformLabelKI">Work Order</label>
                <input
                  type="text"
                  name="workOrder"
                  value={formData.workOrder}
                  onChange={(e) => handleFormInputChange(formData.id, e)}
                  className="AOformInputKI"
                  placeholder="Enter Work Order"
                />
              </div>
              <div className="AOformFieldKI">
                <label className="AOformLabelKI">Plant Location</label>
                <input
                  type="text"
                  name="plantLocation"
                  value={formData.plantLocation}
                  onChange={(e) => handleFormInputChange(formData.id, e)}
                  className="AOformInputKI"
                  placeholder="Enter Plant Location"
                />
              </div>
            </div>
            <div className="AOformRowKI">
              <div className="AOformFieldKI">
                <label className="AOformLabelKI">Department</label>
                <input
                  type="text"
                  name="department"
                  value={formData.department}
                  onChange={(e) => handleFormInputChange(formData.id, e)}
                  className="AOformInputKI"
                  placeholder="Enter Department"
                />
              </div>
              <div className="AOformFieldKI">
                <label className="AOformLabelKI">Work Location</label>
                <input
                  type="text"
                  name="workLocation"
                  value={formData.workLocation}
                  onChange={(e) => handleFormInputChange(formData.id, e)}
                  className="AOformInputKI"
                  placeholder="Enter Work Location"
                />
              </div>
            </div>
            <div className="AOformRowKI">
              <div className="AOformFieldKI">
                <label className="AOformLabelKI">Work Order Date</label>
                <input
                  type="date"
                  name="workOrderDate"
                  value={formData.workOrderDate}
                  onChange={(e) => handleFormInputChange(formData.id, e)}
                  className="AOformInputKI"
                />
              </div>
              <div className="AOformFieldKI">
                <label className="AOformLabelKI">Completion Date</label>
                <input
                  type="date"
                  name="completionDate"
                  value={formData.completionDate}
                  onChange={(e) => handleFormInputChange(formData.id, e)}
                  className="AOformInputKI"
                />
              </div>
            </div>
            <div className="AOformRowKI">
              <div className="AOformFieldKI">
                <label className="AOformLabelKI">LD Applicable</label>
                <div className="AOcheckboxContainerKI">
                  <input
                    type="checkbox"
                    name="ldApplicable"
                    checked={formData.ldApplicable}
                    onChange={(e) => handleFormInputChange(formData.id, e)}
                    className="AOformCheckboxKI"
                  />
                  <span className="AOcheckboxLabelKI">Yes</span>
                </div>
              </div>
              <div className="AOformFieldKI">{/* Empty field for layout */}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Bits Header Table */}
      {/* <div className="AOzebraKI">
        <div className="AOhippoKI">
          <div className="AOrhinoKI">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
              <h4 style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: "white" }}>Work Order Details</h4>
            </div>
          </div>
        </div>
      </div> */}

      {/* <div className="AOleopardKI">
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
            {headerRows.length === 0 && (
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
      </div> */}

      {/* Service Details Table */}
      <div className="AOzebraKI AOserviceSectionKI">
        <div className="AOhippoKI">
          <div className="AOrhinoKI">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
              <h4 style={{ margin: 0, fontSize: "18px", fontWeight: "600", color: "#2c3e50" }}>
                Service Order
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
