"use client"
import { useState, useEffect } from "react"
import axios from "axios"
import { MdSave, MdClose, MdEdit } from "react-icons/md"
import { AiOutlineLoading3Quarters } from "react-icons/ai"
import { FaCheck } from "react-icons/fa"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import "../POEntry Component/UpdatePoentryTable.css"

const API_BASE_URL = "http://195.35.45.56:5522/api/V2.0"

const UpdatePoentryTable = ({ order, onClose }) => {
  const [formData, setFormData] = useState({
    workOrder: "",
    plantLocation: "",
    department: "",
    workLocation: "",
    workOrderDate: "",
    completionDate: "",
    ldApplicable: false,
  })
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (order) {
      setFormData({
        workOrder: order.workOrder || "",
        plantLocation: order.plantLocation || "",
        department: order.department || "",
        workLocation: order.workLocation || "",
        workOrderDate: order.workOrderDate || "",
        completionDate: order.completionDate || "",
        ldApplicable: order.ldApplicable || false,
      })
    }
  }, [order])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }))
  }

  const showSuccessToast = (message) => {
    toast.success(
      <div className="piSuccessToastol">
        <FaCheck className="piToastIconol" />
        <span className="piToastTextol">{message}</span>
      </div>,
      {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        className: "piCustomToastol",
      },
    )
  }

  const handleUpdate = async () => {
    try {
      setLoading(true)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Use orderId instead of id
      const response = await axios.put(`${API_BASE_URL}/updateBitsHeader/details?id=${order.orderId}`, formData, {
        headers: {
          "Content-Type": "application/json",
        },
      })

      showSuccessToast("Work Order updated successfully!")

      // Wait for toast to show, then redirect
      setTimeout(() => {
        onClose()
      }, 1500)
    } catch (error) {
      console.error("Error updating work order:", error)
      toast.error("Failed to update work order")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    onClose()
  }

  const handleEdit = () => {
    setIsEditing(true)
  }

  return (
    <div className="piUpdateContainerol">
      {/* Header */}
      <div className="piHeaderSectionol">
        <div className="piTitleSectionol">
          <h2 className="piPageTitleol">Update Work Order</h2>
          <p className="piSubtitleol">Work Order: {order?.workOrder}</p>
        </div>
        <div className="piHeaderButtonsol">
          {!isEditing ? (
            <button className="piEditButtonol" onClick={handleEdit}>
              <MdEdit className="piButtonIconol" />
              Edit
            </button>
          ) : (
            <button className="piUpdateButtonol" onClick={handleUpdate} disabled={loading}>
              {loading ? (
                <>
                  <AiOutlineLoading3Quarters className="piSpinIconol" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <MdSave className="piButtonIconol" />
                  <span>Update</span>
                </>
              )}
            </button>
          )}
          <button className="piCancelButtonol" onClick={handleCancel}>
            <MdClose className="piButtonIconol" />
            Cancel
          </button>
        </div>
      </div>

      {/* Form Grid */}
      <div className="piFormContainerol">
        <div className="piFormHeaderol">
          <h4>Work Order Details</h4>
        </div>
        <div className="piFormGridol">
          <div className="piFormRowol">
            <div className="piFormFieldol">
              <label className="piFormLabelol">Work Order</label>
              <input
                type="text"
                name="workOrder"
                value={formData.workOrder}
                onChange={handleInputChange}
                className={`piFormInputol ${!isEditing ? "piReadonlyol" : ""}`}
                readOnly={!isEditing}
                placeholder="Enter Work Order"
              />
            </div>
            <div className="piFormFieldol">
              <label className="piFormLabelol">Plant Location</label>
              <input
                type="text"
                name="plantLocation"
                value={formData.plantLocation}
                onChange={handleInputChange}
                className={`piFormInputol ${!isEditing ? "piReadonlyol" : ""}`}
                readOnly={!isEditing}
                placeholder="Enter Plant Location"
              />
            </div>
          </div>

          <div className="piFormRowol">
            <div className="piFormFieldol">
              <label className="piFormLabelol">Department</label>
              <input
                type="text"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                className={`piFormInputol ${!isEditing ? "piReadonlyol" : ""}`}
                readOnly={!isEditing}
                placeholder="Enter Department"
              />
            </div>
            <div className="piFormFieldol">
              <label className="piFormLabelol">Work Location</label>
              <input
                type="text"
                name="workLocation"
                value={formData.workLocation}
                onChange={handleInputChange}
                className={`piFormInputol ${!isEditing ? "piReadonlyol" : ""}`}
                readOnly={!isEditing}
                placeholder="Enter Work Location"
              />
            </div>
          </div>

          <div className="piFormRowol">
            <div className="piFormFieldol">
              <label className="piFormLabelol">Work Order Date</label>
              <input
                type="date"
                name="workOrderDate"
                value={formData.workOrderDate}
                onChange={handleInputChange}
                className={`piFormInputol ${!isEditing ? "piReadonlyol" : ""}`}
                readOnly={!isEditing}
              />
            </div>
            <div className="piFormFieldol">
              <label className="piFormLabelol">Completion Date</label>
              <input
                type="date"
                name="completionDate"
                value={formData.completionDate}
                onChange={handleInputChange}
                className={`piFormInputol ${!isEditing ? "piReadonlyol" : ""}`}
                readOnly={!isEditing}
              />
            </div>
          </div>

          <div className="piFormRowol">
            <div className="piFormFieldol">
              <label className="piFormLabelol">LD Applicable</label>
              <div className="piCheckboxContainerol">
                <input
                  type="checkbox"
                  name="ldApplicable"
                  checked={formData.ldApplicable}
                  onChange={handleInputChange}
                  className="piFormCheckboxol"
                  disabled={!isEditing}
                />
                <span className="piCheckboxLabelol">Yes</span>
              </div>
            </div>
            <div className="piFormFieldol">{/* Empty field for layout */}</div>
          </div>
        </div>
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="piLoadingOverlayol">
          <div className="piLoadingContentol">
            <AiOutlineLoading3Quarters className="piLoadingSpinnerol" />
            <div className="piLoadingTextol">Updating work order...</div>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  )
}

export default UpdatePoentryTable;
