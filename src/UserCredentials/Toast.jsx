"use client"

import { useEffect, useState } from "react"
import { CheckCircle, X, AlertCircle } from "react-feather"
import "../UserCredentialsDesign/toast-notification.css"

const Toast = ({ type = "success", title, message, duration = 3000, onClose }) => {
  const [isClosing, setIsClosing] = useState(false)

  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      onClose && onClose()
    }, 300) // Match the animation duration
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration])

  return (
    <div className={`toast-notification ${type} ${isClosing ? "closing" : ""}`}>
      <div className="toast-header">
        <div className="toast-title-container">
          <div className="toast-icon">{type === "success" ? <CheckCircle size={18} /> : <AlertCircle size={18} />}</div>
          <div className="toast-title">{title}</div>
        </div>
        <button className="toast-close" onClick={handleClose}>
          <X size={16} />
        </button>
      </div>
      <div className="toast-body">
        <div className="toast-message">{message}</div>
      </div>
    </div>
  )
}

export default Toast;
