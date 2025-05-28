import React, { useState, useRef } from "react";
import "../Fabrication Design/Importclallstyle.css";
import { FiUpload, FiX } from "react-icons/fi";
import ConfirmPopup from "../Fabrication Component/Confirm";

const ImportPopup = ({ isOpen, onClose, onImportSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleSave = () => {
    if (selectedFile) {
      setShowConfirm(true);
    } else {
      alert("Please select a file first");
    }
  };

  const handleConfirmImport = async () => {
    setShowConfirm(false);
    
    // Create form data for file upload
    const formData = new FormData();
    formData.append("file", selectedFile);
    
    try {
      const response = await fetch(`${API_BASE_URL_V2}/imports`, {
        method: "POST",
        body: formData,
      });
      
      const result = await response.json();
      
      if (result.status === "success") {
        onImportSuccess(result.data);
        onClose();
      } else {
        alert(`Import failed: ${result.message}`);
      }
    } catch (error) {
      console.error("Error importing file:", error);
      alert("Failed to import file. Please try again.");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="leopard-overlay">
      <div className="leopard-modal">
        <div className="leopard-modal-header">
          <h3>Import Excel File</h3>
          <button className="leopard-close-button" onClick={onClose}>
            <FiX />
          </button>
        </div>
        <div className="leopard-modal-body">
          <div 
            className="leopard-upload-area" 
            onClick={handleUploadClick}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".xlsx,.xls"
              style={{ display: "none" }}
            />
            <div className="leopard-upload-icon">
              <FiUpload size={40} />
            </div>
            <div className="leopard-upload-text">
              {selectedFile ? selectedFile.name : "Click to upload Excel file"}
            </div>
          </div>
        </div>
        <div className="leopard-modal-footer">
          <button className="leopard-cancel-button" onClick={onClose}>
            Cancel
          </button>
          <button className="leopard-save-button" onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
      
      {showConfirm && (
        <ConfirmPopup
          message="Are you sure you want to import this file?"
          onConfirm={handleConfirmImport}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </div>
  );
};

export default ImportPopup;