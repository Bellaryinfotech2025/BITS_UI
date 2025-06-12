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
  const [serviceFormRows, setServiceFormRows] = useState([])
  const [serviceLoading, setServiceLoading] = useState(false)

  // Initialize with one form row
  useEffect(() => {
    setFormRows([createNewFormRow()])
  }, [])

  const createNewFormRow = () => ({
    id: Date.now() + Math.random(),
    workOrder: "",
    plantLocation: "",
    department: "",
    workLocation: "",
    workOrderDate: "",
    completionDate: "",
    ldApplicable: false,
    scrapAllowanceVisiblePercent: "",
    scrapAllowanceInvisiblePercent: "",
    materialIssueType: "",
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

  // Combined save function for both Work Order and Service Order
  const handleSaveBoth = async () => {
    try {
      setLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // First save the work order header
      const savedHeaders = []
      for (const formData of formRows) {
        const { id, ...dataToSave } = formData
        console.log("Saving work order:", dataToSave);
        
        const response = await axios.post(`${API_BASE_URL}/createBitsHeader/details`, dataToSave, {
          headers: {
            "Content-Type": "application/json",
          },
        })
        
        if (response.data) {
          console.log("Saved work order response:", response.data);
          savedHeaders.push(response.data)
        }
      }

      // If we have service rows to save and we successfully saved a header
      if (serviceFormRows.length > 0 && savedHeaders.length > 0) {
        const workOrderId = savedHeaders[0]?.orderId
        const workOrderNo = savedHeaders[0]?.workOrder

        console.log("Work Order ID:", workOrderId, "Work Order No:", workOrderNo);

        // Only proceed if we have a valid workOrderNo
        if (workOrderNo) {
          // Save each service row with reference to the work order
          for (const formData of serviceFormRows) {
            const { id, ...dataToSave } = formData
            const processedData = {
              ...dataToSave,
              qty: dataToSave.qty ? Number.parseFloat(dataToSave.qty) : null,
              rate: dataToSave.rate ? Number.parseFloat(dataToSave.rate) : null,
              amount: dataToSave.amount ? Number.parseFloat(dataToSave.amount) : null,
              workOrderRef: workOrderNo, // Set the work order reference properly
            }

            console.log("Saving service order with data:", processedData);

            const serviceResponse = await axios.post(`${API_BASE_URL}/createBitsLine/details`, processedData, {
              headers: {
                "Content-Type": "application/json",
              },
            })
            
            console.log("Saved service order response:", serviceResponse.data);
          }
        }
      }

      // Reset forms
      setFormRows([createNewFormRow()])
      setServiceFormRows([])
      
      showSuccessToast("Work Order and Service Order data successfully saved!")
    } catch (error) {
      console.error("Error saving data:", error)
      toast.error("Failed to save data")
    } finally {
      setLoading(false)
      setServiceLoading(false)
    }
  }

  const handleRemoveServiceRow = (rowId) => {
    setServiceFormRows((prev) => prev.filter((row) => row.id !== rowId))
  }

  const handleCancel = () => {
    if (onClose) {
      onClose()
    }
  }

  // Check if formRows has elements before accessing workOrder
  const isSaveDisabled = () => {
    return loading || 
           serviceLoading || 
           formRows.length === 0 || 
           !formRows[0] || 
           !formRows[0].workOrder;
  }

  return (
    <div className="AOelephantKI">
      {/* Header with Save and Cancel Buttons */}
      <div className="AOlionKI">
        <div className="AOtigerKI">
          <h3>Work Order Entry Form</h3>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          <button 
            className="AOcheetahKI AOsaveBtnKI" 
            onClick={handleSaveBoth} 
            disabled={isSaveDisabled()}
          >
            {loading || serviceLoading ? (
              <>
                <AiOutlineLoading3Quarters className="AOspinIconKI" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <MdSave className="AObuttonIconKI" />
                <span>Save All</span>
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
                <label className="AOformLabelKI">Building Name</label>
                <input
                  type="text"
                  name="plantLocation"
                  value={formData.plantLocation}
                  onChange={(e) => handleFormInputChange(formData.id, e)}
                  className="AOformInputKI"
                  placeholder="Enter Building Name"
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
                <label className="AOformLabelKI">Scrap Allowance Visible %</label>
                <input
                  type="text"
                  name="scrapAllowanceVisiblePercent"
                  value={formData.scrapAllowanceVisiblePercent}
                  onChange={(e) => handleFormInputChange(formData.id, e)}
                  className="AOformInputKI"
                  placeholder="Enter Visible Scrap %"
                />
              </div>
              <div className="AOformFieldKI">
                <label className="AOformLabelKI">Scrap Allowance Invisible %</label>
                <input
                  type="text"
                  name="scrapAllowanceInvisiblePercent"
                  value={formData.scrapAllowanceInvisiblePercent}
                  onChange={(e) => handleFormInputChange(formData.id, e)}
                  className="AOformInputKI"
                  placeholder="Enter Invisible Scrap %"
                />
              </div>
            </div>
            <div className="AOformRowKI">
              <div className="AOformFieldKI">
                <label className="AOformLabelKI">Material Issue Type</label>
                <select
                  name="materialIssueType"
                  value={formData.materialIssueType}
                  onChange={(e) => handleFormInputChange(formData.id, e)}
                  className="AOformInputKI"
                >
                  <option value="">Select Type</option>
                  <option value="with_material">With Material</option>
                  <option value="without_material">Without Material</option>
                </select>
              </div>
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
            </div>
          </div>
        ))}
      </div>

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
              <th>Service #</th>
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
            {serviceFormRows.length === 0 && (
              <tr className="AOyakKI">
                <td colSpan="10">
                  <div className="AOcamelKI">
                    <div className="AOllamaKI">No service records. Click "Add" to create a new service order.</div>
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