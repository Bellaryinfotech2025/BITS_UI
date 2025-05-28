import React from "react";
import "../Fabrication Design/Importclallstyle.css";
import { FiX } from "react-icons/fi";
import LoadingPopup from "../Fabrication Component/Loading";

const ConfirmPopup = ({ message, onConfirm, onCancel }) => {
  const [isLoading, setIsLoading] = React.useState(false);

  const handleConfirm = () => {
    setIsLoading(true);
    
    // Simulate loading for 3 seconds
    setTimeout(() => {
      setIsLoading(false);
      onConfirm();
    }, 3000);
  };

  return (
    <>
      <div className="tiger-overlay">
        <div className="tiger-modal">
          <div className="tiger-modal-header">
            <h3>Confirm Action</h3>
            <button className="tiger-close-button" onClick={onCancel}>
              <FiX />
            </button>
          </div>
          <div className="tiger-modal-body">
            <p>{message}</p>
          </div>
          <div className="tiger-modal-footer">
            <button className="tiger-cancel-button" onClick={onCancel}>
              No
            </button>
            <button className="tiger-confirm-button" onClick={handleConfirm}>
              Yes
            </button>
          </div>
        </div>
      </div>
      
      {isLoading && <LoadingPopup />}
    </>
  );
};

export default ConfirmPopup;