import React from "react";
import "../Fabrication Design/Importclallstyle.css";
import { AiOutlineLoading3Quarters } from "react-icons/ai";

const LoadingPopup = () => {
  return (
    <div className="panda-overlay">
      <div className="panda-loading-container">
        <div className="panda-spinner">
          <AiOutlineLoading3Quarters />
        </div>
        <div className="panda-loading-text">
          Processing your request...
        </div>
      </div>
    </div>
  );
};

export default LoadingPopup;