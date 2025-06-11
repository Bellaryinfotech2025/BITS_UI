import React, { useState } from "react";
import VendorProfile from "../VendorComponent/VendorProfile";
import LedgerCreation from "../VendorComponent/LedgerCreation";
import "../VendorComponent/UserTabs.css";

const UserTabs = () => {
  const [activeTab, setActiveTab] = useState("vendor");

  return (
    <div className="tabs-main-container">
      <h1 className="tabs-app-heading">Bellary Infotech Billing Software</h1>
      <div className="tabs-bar">
        <button
          className={activeTab === "vendor" ? "tab-btn active" : "tab-btn"}
          onClick={() => setActiveTab("vendor")}
        >
          Vendor
        </button>
        <button
          className={activeTab === "customer" ? "tab-btn active" : "tab-btn"}
          onClick={() => setActiveTab("customer")}
        >
          Customer
        </button>
      </div>
      <div className="tabs-content">
        {activeTab === "vendor" && <VendorProfile />}
        {activeTab === "customer" && <LedgerCreation />}
      </div>
    </div>
  );
};

export default UserTabs;
