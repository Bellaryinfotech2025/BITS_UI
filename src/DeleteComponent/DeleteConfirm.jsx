import React from 'react'
import { MdWarning } from 'react-icons/md'
import '../DeleteComponent/DeleteDesign.css'

const DeleteConfirm = ({
  isOpen,
  onConfirm,
  onCancel,
  title = "Confirm Deletion",
  message = "Are you sure you want to delete this item? Once deleted, the data cannot be recovered."
}) => {
  if (!isOpen) return null

  return (
    <div className="delete-modal-overlay">
      <div className="delete-modal-container">
        <div className="delete-modal-header">
          <div className="delete-modal-icon">
            <MdWarning />
          </div>
          <h3 className="delete-modal-title">{title}</h3>
        </div>
        
        <div className="delete-modal-content">
          <p className="delete-modal-message">{message}</p>
        </div>
        
        <div className="delete-modal-actions">
          <button 
            onClick={onCancel}
            className="delete-modal-button delete-modal-cancel"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="delete-modal-button delete-modal-delete"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

export default DeleteConfirm;
