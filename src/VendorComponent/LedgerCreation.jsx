import { useState, useEffect } from "react"
import "../VendorComponent/LedgerCreation.css"

const LedgerCreation = () => {
  const [backgroundImage, setBackgroundImage] = useState(
    "https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80",
  )
  const [isEditing, setIsEditing] = useState(true)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [focusedField, setFocusedField] = useState("")
  const [loading, setLoading] = useState(false)
  const [ledgerId, setLedgerId] = useState(null)
  const [ledgerDetails, setLedgerDetails] = useState({
    ledgerName: "",
    groupName: "",
    debtorCreditor: "",
    housePlotNo: "",
    street: "",
    villagePost: "",
    mandalTaluq: "",
    district: "",
    state: "",
    pinCode: "",
    contactPersonName: "",
    mobileNo: "",
    email: "",
    website: "",
    gstin: "",
    pan: "",
    bankAccountNo: "",
    ifscCode: "",
    branchName: "",
    serviceType: "",
  })

  // API Base URL
  const API_BASE_URL = "http://195.35.45.56:5522/api/ledgers"

  useEffect(() => {
    // Load ledger data if editing existing ledger
    const urlParams = new URLSearchParams(window.location.search)
    const id = urlParams.get("id")
    if (id) {
      setLedgerId(id)
      loadLedgerData(id)
    }
  }, [])

  const checkExistingLedger = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}`)
      if (response.ok) {
        const ledgers = await response.json()
        console.log("Existing ledgers:", ledgers)
      }
    } catch (error) {
      console.error("Error fetching ledgers:", error)
    }
  }

  useEffect(() => {
    // Load saved ledger data from localStorage if no ID is provided in URL
    const urlParams = new URLSearchParams(window.location.search)
    const id = urlParams.get("id")

    if (!id && !ledgerId) {
      const savedLedgerData = localStorage.getItem("ledgerDetails")
      if (savedLedgerData) {
        const parsedData = JSON.parse(savedLedgerData)
        setLedgerDetails(parsedData)
        if (parsedData.id) {
          setLedgerId(parsedData.id)
          setIsEditing(false)
        }
      }
      // Check existing ledgers for debugging
      checkExistingLedger()
    }
  }, [ledgerId])

  const loadLedgerData = async (id) => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/${id}`)
      if (response.ok) {
        const data = await response.json()
        setLedgerDetails(data)
        setIsEditing(false)
      } else {
        showToastMessage("Failed to load ledger data")
      }
    } catch (error) {
      console.error("Error loading ledger data:", error)
      showToastMessage("Error loading ledger data")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setLedgerDetails((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleFocus = (field) => {
    setFocusedField(field)
  }

  const handleBlur = () => {
    setFocusedField("")
  }

  const validateForm = () => {
    // Check required fields
    if (!ledgerDetails.ledgerName.trim()) {
      showToastMessage("Ledger Name is required")
      return false
    }

    // Validate email format if provided
    if (ledgerDetails.email && ledgerDetails.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(ledgerDetails.email.trim())) {
        showToastMessage("Please enter a valid email address")
        return false
      }
    }

    // Validate mobile format if provided
    if (ledgerDetails.mobileNo && ledgerDetails.mobileNo.trim()) {
      const mobileDigits = ledgerDetails.mobileNo.replace(/\D/g, "")
      if (mobileDigits.length < 10 || mobileDigits.length > 15) {
        showToastMessage("Please enter a valid mobile number (10-15 digits)")
        return false
      }
    }

    // Validate PAN format if provided
    if (ledgerDetails.pan && ledgerDetails.pan.trim()) {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/
      if (!panRegex.test(ledgerDetails.pan.trim()) || ledgerDetails.pan.length !== 10) {
        showToastMessage("Please enter a valid PAN number (10 characters, e.g., AAICB6129Q)")
        return false
      }
    }

    // Validate GSTIN format if provided
    if (ledgerDetails.gstin && ledgerDetails.gstin.trim()) {
      const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
      if (!gstRegex.test(ledgerDetails.gstin.trim()) || ledgerDetails.gstin.length !== 15) {
        showToastMessage("Please enter a valid GSTIN (15 characters, e.g., 29AAICB6129Q1ZY)")
        return false
      }
    }

    // Validate IFSC format if provided
    if (ledgerDetails.ifscCode && ledgerDetails.ifscCode.trim()) {
      const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/
      if (!ifscRegex.test(ledgerDetails.ifscCode.trim()) || ledgerDetails.ifscCode.length !== 11) {
        showToastMessage("Please enter a valid IFSC code (11 characters, e.g., SBIN0001234)")
        return false
      }
    }

    // Validate Pin Code format if provided
    if (ledgerDetails.pinCode && ledgerDetails.pinCode.trim()) {
      const pinRegex = /^[0-9]{6}$/
      if (!pinRegex.test(ledgerDetails.pinCode.trim())) {
        showToastMessage("Please enter a valid Pin Code (6 digits)")
        return false
      }
    }

    return true
  }

  const handleSave = async () => {
    if (!validateForm()) return

    try {
      setLoading(true)

      // Check for duplicate ledger name before saving (only for new ledgers)
      if (!ledgerId) {
        const nameCheckResponse = await fetch(`${API_BASE_URL}/exists/ledger-name/${ledgerDetails.ledgerName}`)
        if (nameCheckResponse.ok) {
          const nameExists = await nameCheckResponse.json()
          if (nameExists) {
            showToastMessage("Ledger name already exists. Please use a different name.")
            return
          }
        }
      }

      // Check for duplicate email if email is provided
      if (ledgerDetails.email && ledgerDetails.email.trim()) {
        const emailCheckResponse = await fetch(
          `${API_BASE_URL}/exists/email/${encodeURIComponent(ledgerDetails.email)}`,
        )
        if (emailCheckResponse.ok) {
          const emailExists = await emailCheckResponse.json()
          if (emailExists && !ledgerId) {
            showToastMessage("Email already exists. Please use a different email.")
            return
          }
        }
      }

      // Check for duplicate GSTIN if provided
      if (ledgerDetails.gstin && ledgerDetails.gstin.trim()) {
        const gstinCheckResponse = await fetch(`${API_BASE_URL}/exists/gstin/${ledgerDetails.gstin}`)
        if (gstinCheckResponse.ok) {
          const gstinExists = await gstinCheckResponse.json()
          if (gstinExists && !ledgerId) {
            showToastMessage("GSTIN already exists. Please use a different GSTIN.")
            return
          }
        }
      }

      // Check for duplicate PAN if provided
      if (ledgerDetails.pan && ledgerDetails.pan.trim()) {
        const panCheckResponse = await fetch(`${API_BASE_URL}/exists/pan/${ledgerDetails.pan}`)
        if (panCheckResponse.ok) {
          const panExists = await panCheckResponse.json()
          if (panExists && !ledgerId) {
            showToastMessage("PAN already exists. Please use a different PAN.")
            return
          }
        }
      }

      const url = ledgerId ? `${API_BASE_URL}/${ledgerId}` : API_BASE_URL
      const method = ledgerId ? "PUT" : "POST"

      // Prepare the data payload
      const payload = {
        ledgerName: ledgerDetails.ledgerName.trim(),
        groupName: ledgerDetails.groupName?.trim() || "",
        debtorCreditor: ledgerDetails.debtorCreditor?.trim() || "",
        housePlotNo: ledgerDetails.housePlotNo?.trim() || "",
        street: ledgerDetails.street?.trim() || "",
        villagePost: ledgerDetails.villagePost?.trim() || "",
        mandalTaluq: ledgerDetails.mandalTaluq?.trim() || "",
        district: ledgerDetails.district?.trim() || "",
        state: ledgerDetails.state?.trim() || "",
        pinCode: ledgerDetails.pinCode?.trim() || "",
        contactPersonName: ledgerDetails.contactPersonName?.trim() || "",
        mobileNo: ledgerDetails.mobileNo?.trim() || "",
        email: ledgerDetails.email?.trim() || "",
        website: ledgerDetails.website?.trim() || "",
        gstin: ledgerDetails.gstin?.trim() || "",
        pan: ledgerDetails.pan?.trim() || "",
        bankAccountNo: ledgerDetails.bankAccountNo?.trim() || "",
        ifscCode: ledgerDetails.ifscCode?.trim() || "",
        branchName: ledgerDetails.branchName?.trim() || "",
        serviceType: ledgerDetails.serviceType?.trim() || "",
        status: "ACTIVE",
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        const data = await response.json()
        if (!ledgerId) {
          setLedgerId(data.id)
          // Update URL to include the new ledger ID
          const newUrl = `${window.location.pathname}?id=${data.id}`
          window.history.pushState({ path: newUrl }, "", newUrl)
        }

        // Save the ledger data to localStorage
        const updatedLedgerDetails = { ...data }
        localStorage.setItem("ledgerDetails", JSON.stringify(updatedLedgerDetails))

        setIsEditing(false)
        showToastMessage(ledgerId ? "Ledger updated successfully!" : "Ledger created successfully!")
      } else {
        // Handle different error status codes
        let errorMessage = "Failed to save ledger details"

        if (response.status === 400) {
          try {
            const errorData = await response.json()
            errorMessage = errorData.message || "Invalid data provided. Please check all fields."
          } catch (e) {
            errorMessage = "Invalid data provided. Please check all fields."
          }
        } else if (response.status === 409) {
          errorMessage = "Ledger name or email already exists."
        } else if (response.status === 500) {
          errorMessage = "Server error. Please try again later."
        }

        showToastMessage(errorMessage)
      }
    } catch (error) {
      console.error("Error saving ledger:", error)
      showToastMessage("Network error. Please check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
    showToastMessage("Edit mode enabled")
  }

  const showToastMessage = (message) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const isFieldActive = (field) => {
    return focusedField === field || ledgerDetails[field] !== ""
  }

  const handleClear = () => {
    // Clear form data
    setLedgerDetails({
      ledgerName: "",
      groupName: "",
      debtorCreditor: "",
      housePlotNo: "",
      street: "",
      villagePost: "",
      mandalTaluq: "",
      district: "",
      state: "",
      pinCode: "",
      contactPersonName: "",
      mobileNo: "",
      email: "",
      website: "",
      gstin: "",
      pan: "",
      bankAccountNo: "",
      ifscCode: "",
      branchName: "",
      serviceType: "",
    })

    // Reset state
    setLedgerId(null)
    setIsEditing(true)

    // Clear localStorage
    localStorage.removeItem("ledgerDetails")

    // Show confirmation message
    showToastMessage("Form cleared successfully")
  }

  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  return (
    <div className="ledger-main-wrapper">
      <div className="ledger-scrollable-container">
        <div className="ledger-container">
          <div className="ledger-header-section">
            <h1 className="ledger-app-title">Bellary Infotech</h1>
            <p className="ledger-app-subtitle">Billing Software - Ledger Creation</p>
          </div>

          <div className="ledger-card">
            {/* Cover Photo with Default Gradient */}
            <div className="ledger-card-header" style={{ backgroundImage: `url(${backgroundImage})` }}></div>

            {/* Profile Section */}
            <br />
            <br />
            <div className="ledger-profile-section">
              <div className="ledger-profile-avatar">
                <div className="ledger-avatar-image">
                  {ledgerDetails.ledgerName ? getInitials(ledgerDetails.ledgerName) : "L"}
                </div>
              </div>

              <div className="ledger-profile-details">
                <h2 className="ledger-ledger-name">{ledgerDetails.ledgerName || "Ledger Name"}</h2>
                <p className="ledger-ledger-code">#{ledgerDetails.groupName || "group-name"}</p>
                <div className="ledger-status-indicator">
                  <span className="ledger-status-dot"></span>
                  <span>Active</span>
                </div>
              </div>

              <div className="ledger-quick-stats">
                <div className="ledger-stat">
                  <span className="ledger-stat-value">{ledgerDetails.gstin ? "GST" : "No GST"}</span>
                  <span className="ledger-stat-label">Registration</span>
                </div>
                <div className="ledger-stat">
                  <span className="ledger-stat-value">{ledgerDetails.pan ? "PAN" : "No PAN"}</span>
                  <span className="ledger-stat-label">Verified</span>
                </div>
                <div className="ledger-stat">
                  <span className="ledger-stat-value">{ledgerDetails.bankAccountNo ? "Bank" : "No Bank"}</span>
                  <span className="ledger-stat-label">Account</span>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="ledger-content-area">
              {isEditing ? (
                <div className="ledger-form-container">
                  <div className="ledger-section-header">
                    <h3>Ledger Information</h3>
                  </div>

                  <div className="ledger-form-layout">
                    <div className="ledger-form-row">
                      <div className="ledger-floating-input-group">
                        <input
                          type="text"
                          id="ledgerName"
                          value={ledgerDetails.ledgerName}
                          onChange={(e) => handleInputChange("ledgerName", e.target.value)}
                          onFocus={() => handleFocus("ledgerName")}
                          onBlur={handleBlur}
                          className="ledger-floating-input"
                          disabled={loading}
                        />
                        <label
                          htmlFor="ledgerName"
                          className={`ledger-floating-label ${isFieldActive("ledgerName") ? "ledger-active" : ""}`}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path
                              d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
                              stroke="currentColor"
                              strokeWidth="2"
                            />
                            <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
                          </svg>
                          Ledger Name *
                        </label>
                      </div>

                      <div className="ledger-floating-input-group">
                        <input
                          type="text"
                          id="groupName"
                          value={ledgerDetails.groupName}
                          onChange={(e) => handleInputChange("groupName", e.target.value)}
                          onFocus={() => handleFocus("groupName")}
                          onBlur={handleBlur}
                          className="ledger-floating-input"
                          disabled={loading}
                        />
                        <label
                          htmlFor="groupName"
                          className={`ledger-floating-label ${isFieldActive("groupName") ? "ledger-active" : ""}`}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path
                              d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21"
                              stroke="currentColor"
                              strokeWidth="2"
                            />
                            <circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
                            <path
                              d="M23 21V19C23 18.1645 22.7155 17.3541 22.1911 16.7007C21.6667 16.0473 20.9323 15.5859 20.12 15.39"
                              stroke="currentColor"
                              strokeWidth="2"
                            />
                            <path
                              d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 18.9018 6.11683 18.7967 6.96975C18.6917 7.82266 18.2991 8.61052 17.6835 9.21863C17.0679 9.82674 16.2653 10.2389 15.4 10.39"
                              stroke="currentColor"
                              strokeWidth="2"
                            />
                          </svg>
                          Group Name
                        </label>
                      </div>
                    </div>

                    <div className="ledger-form-row">
                      <div className="ledger-floating-input-group">
                        <select
                          id="debtorCreditor"
                          value={ledgerDetails.debtorCreditor}
                          onChange={(e) => handleInputChange("debtorCreditor", e.target.value)}
                          onFocus={() => handleFocus("debtorCreditor")}
                          onBlur={handleBlur}
                          className="ledger-floating-select"
                          disabled={loading}
                        >
                          <option value="">Select Type</option>
                          <option value="Debtor">Debtor (Service Reciever)</option>
                          <option value="Creditor">Creditor (Service Provider)</option>
                        </select>
                        <label
                          htmlFor="debtorCreditor"
                          className={`ledger-floating-label ${isFieldActive("debtorCreditor") ? "ledger-active" : ""}`}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" />
                            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" />
                            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" />
                          </svg>
                          Debtor / Creditor
                        </label>
                      </div>

                      <div className="ledger-floating-input-group">
                        <input
                          type="text"
                          id="housePlotNo"
                          value={ledgerDetails.housePlotNo}
                          onChange={(e) => handleInputChange("housePlotNo", e.target.value)}
                          onFocus={() => handleFocus("housePlotNo")}
                          onBlur={handleBlur}
                          className="ledger-floating-input"
                          disabled={loading}
                        />
                        <label
                          htmlFor="housePlotNo"
                          className={`ledger-floating-label ${isFieldActive("housePlotNo") ? "ledger-active" : ""}`}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path
                              d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
                              stroke="currentColor"
                              strokeWidth="2"
                            />
                            <polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" strokeWidth="2" />
                          </svg>
                          House/Plot No
                        </label>
                      </div>
                    </div>

                    <div className="ledger-form-row">
                      <div className="ledger-floating-input-group">
                        <input
                          type="text"
                          id="street"
                          value={ledgerDetails.street}
                          onChange={(e) => handleInputChange("street", e.target.value)}
                          onFocus={() => handleFocus("street")}
                          onBlur={handleBlur}
                          className="ledger-floating-input"
                          disabled={loading}
                        />
                        <label
                          htmlFor="street"
                          className={`ledger-floating-label ${isFieldActive("street") ? "ledger-active" : ""}`}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path
                              d="M21 10C21 17 12 23 12 23S3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.3639 3.63604C20.0518 5.32387 21 7.61305 21 10Z"
                              stroke="currentColor"
                              strokeWidth="2"
                            />
                            <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" />
                          </svg>
                          Street
                        </label>
                      </div>

                      <div className="ledger-floating-input-group">
                        <input
                          type="text"
                          id="villagePost"
                          value={ledgerDetails.villagePost}
                          onChange={(e) => handleInputChange("villagePost", e.target.value)}
                          onFocus={() => handleFocus("villagePost")}
                          onBlur={handleBlur}
                          className="ledger-floating-input"
                          disabled={loading}
                        />
                        <label
                          htmlFor="villagePost"
                          className={`ledger-floating-label ${isFieldActive("villagePost") ? "ledger-active" : ""}`}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path
                              d="M21 10C21 17 12 23 12 23S3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.3639 3.63604C20.0518 5.32387 21 7.61305 21 10Z"
                              stroke="currentColor"
                              strokeWidth="2"
                            />
                            <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" />
                          </svg>
                          Village / Post
                        </label>
                      </div>
                    </div>

                    <div className="ledger-form-row-three">
                      <div className="ledger-floating-input-group">
                        <input
                          type="text"
                          id="mandalTaluq"
                          value={ledgerDetails.mandalTaluq}
                          onChange={(e) => handleInputChange("mandalTaluq", e.target.value)}
                          onFocus={() => handleFocus("mandalTaluq")}
                          onBlur={handleBlur}
                          className="ledger-floating-input"
                          disabled={loading}
                        />
                        <label
                          htmlFor="mandalTaluq"
                          className={`ledger-floating-label ${isFieldActive("mandalTaluq") ? "ledger-active" : ""}`}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path
                              d="M21 10C21 17 12 23 12 23S3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.3639 3.63604C20.0518 5.32387 21 7.61305 21 10Z"
                              stroke="currentColor"
                              strokeWidth="2"
                            />
                            <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" />
                          </svg>
                          Mandal / Taluq
                        </label>
                      </div>

                      <div className="ledger-floating-input-group">
                        <input
                          type="text"
                          id="district"
                          value={ledgerDetails.district}
                          onChange={(e) => handleInputChange("district", e.target.value)}
                          onFocus={() => handleFocus("district")}
                          onBlur={handleBlur}
                          className="ledger-floating-input"
                          disabled={loading}
                        />
                        <label
                          htmlFor="district"
                          className={`ledger-floating-label ${isFieldActive("district") ? "ledger-active" : ""}`}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path
                              d="M21 10C21 17 12 23 12 23S3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.3639 3.63604C20.0518 5.32387 21 7.61305 21 10Z"
                              stroke="currentColor"
                              strokeWidth="2"
                            />
                            <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" />
                          </svg>
                          District
                        </label>
                      </div>

                      <div className="ledger-floating-input-group">
                        <input
                          type="text"
                          id="state"
                          value={ledgerDetails.state}
                          onChange={(e) => handleInputChange("state", e.target.value)}
                          onFocus={() => handleFocus("state")}
                          onBlur={handleBlur}
                          className="ledger-floating-input"
                          disabled={loading}
                        />
                        <label
                          htmlFor="state"
                          className={`ledger-floating-label ${isFieldActive("state") ? "ledger-active" : ""}`}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path
                              d="M21 10C21 17 12 23 12 23S3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.3639 3.63604C20.0518 5.32387 21 7.61305 21 10Z"
                              stroke="currentColor"
                              strokeWidth="2"
                            />
                            <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" />
                          </svg>
                          State
                        </label>
                      </div>
                    </div>

                    <div className="ledger-form-row">
                      <div className="ledger-floating-input-group">
                        <input
                          type="text"
                          id="pinCode"
                          value={ledgerDetails.pinCode}
                          onChange={(e) => handleInputChange("pinCode", e.target.value)}
                          onFocus={() => handleFocus("pinCode")}
                          onBlur={handleBlur}
                          className="ledger-floating-input"
                          maxLength="6"
                          disabled={loading}
                        />
                        <label
                          htmlFor="pinCode"
                          className={`ledger-floating-label ${isFieldActive("pinCode") ? "ledger-active" : ""}`}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path
                              d="M21 10C21 17 12 23 12 23S3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.3639 3.63604C20.0518 5.32387 21 7.61305 21 10Z"
                              stroke="currentColor"
                              strokeWidth="2"
                            />
                            <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" />
                          </svg>
                          Pin Code
                        </label>
                      </div>

                      <div className="ledger-floating-input-group">
                        <input
                          type="text"
                          id="contactPersonName"
                          value={ledgerDetails.contactPersonName}
                          onChange={(e) => handleInputChange("contactPersonName", e.target.value)}
                          onFocus={() => handleFocus("contactPersonName")}
                          onBlur={handleBlur}
                          className="ledger-floating-input"
                          disabled={loading}
                        />
                        <label
                          htmlFor="contactPersonName"
                          className={`ledger-floating-label ${isFieldActive("contactPersonName") ? "ledger-active" : ""}`}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path
                              d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
                              stroke="currentColor"
                              strokeWidth="2"
                            />
                            <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
                          </svg>
                          Contact Person Name
                        </label>
                      </div>
                    </div>

                    <div className="ledger-form-row">
                      <div className="ledger-floating-input-group">
                        <input
                          type="tel"
                          id="mobileNo"
                          value={ledgerDetails.mobileNo}
                          onChange={(e) => handleInputChange("mobileNo", e.target.value)}
                          onFocus={() => handleFocus("mobileNo")}
                          onBlur={handleBlur}
                          className="ledger-floating-input"
                          disabled={loading}
                        />
                        <label
                          htmlFor="mobileNo"
                          className={`ledger-floating-label ${isFieldActive("mobileNo") ? "ledger-active" : ""}`}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path
                              d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4742 21.8325 20.7293C21.7209 20.9845 21.5573 21.2136 21.3521 21.4019C21.1468 21.5901 20.9046 21.7335 20.6407 21.8227C20.3769 21.9119 20.0974 21.9451 19.82 21.92C16.7428 21.5856 13.787 20.5341 11.19 18.85C8.77382 17.3147 6.72533 15.2662 5.18999 12.85C3.49997 10.2412 2.44824 7.27099 2.11999 4.18C2.095 3.90347 2.12787 3.62476 2.21649 3.36162C2.30512 3.09849 2.44756 2.85669 2.63476 2.65162C2.82196 2.44655 3.0498 2.28271 3.30379 2.17052C3.55777 2.05833 3.83233 2.00026 4.10999 2H7.10999C7.59531 1.99522 8.06579 2.16708 8.43376 2.48353C8.80173 2.79999 9.04207 3.23945 9.10999 3.72C9.23662 4.68007 9.47144 5.62273 9.80999 6.53C9.94454 6.88792 9.97366 7.27691 9.8939 7.65088C9.81415 8.02485 9.62886 8.36811 9.35999 8.64L8.08999 9.91C9.51355 12.4135 11.5865 14.4864 14.09 15.91L15.36 14.64C15.6319 14.3711 15.9751 14.1858 16.3491 14.1061C16.7231 14.0263 17.1121 14.0555 17.47 14.19C18.3773 14.5286 19.3199 14.7634 20.28 14.89C20.7658 14.9585 21.2094 15.2032 21.5265 15.5775C21.8437 15.9518 22.0122 16.4296 22 16.92Z"
                              stroke="currentColor"
                              strokeWidth="2"
                            />
                          </svg>
                          Mobile No
                        </label>
                      </div>

                      <div className="ledger-floating-input-group">
                        <input
                          type="email"
                          id="email"
                          value={ledgerDetails.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          onFocus={() => handleFocus("email")}
                          onBlur={handleBlur}
                          className="ledger-floating-input"
                          disabled={loading}
                        />
                        <label
                          htmlFor="email"
                          className={`ledger-floating-label ${isFieldActive("email") ? "ledger-active" : ""}`}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path
                              d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z"
                              stroke="currentColor"
                              strokeWidth="2"
                            />
                            <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" />
                          </svg>
                          Email I'd
                        </label>
                      </div>
                    </div>

                    <div className="ledger-floating-input-group ledger-full-width">
                      <input
                        type="url"
                        id="website"
                        value={ledgerDetails.website}
                        onChange={(e) => handleInputChange("website", e.target.value)}
                        onFocus={() => handleFocus("website")}
                        onBlur={handleBlur}
                        className="ledger-floating-input"
                        disabled={loading}
                      />
                      <label
                        htmlFor="website"
                        className={`ledger-floating-label ${isFieldActive("website") ? "ledger-active" : ""}`}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                          <line x1="2" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="2" />
                          <path
                            d="M12 2C13.5 4.5 14 7.5 14 12S13.5 19.5 12 22C10.5 19.5 10 16.5 10 12S10.5 4.5 12 2Z"
                            stroke="currentColor"
                            strokeWidth="2"
                          />
                        </svg>
                        Website
                      </label>
                    </div>

                    <div className="ledger-form-row">
                      <div className="ledger-floating-input-group">
                        <input
                          type="text"
                          id="gstin"
                          value={ledgerDetails.gstin}
                          onChange={(e) => handleInputChange("gstin", e.target.value.toUpperCase())}
                          onFocus={() => handleFocus("gstin")}
                          onBlur={handleBlur}
                          className="ledger-floating-input"
                          maxLength="15"
                          disabled={loading}
                        />
                        <label
                          htmlFor="gstin"
                          className={`ledger-floating-label ${isFieldActive("gstin") ? "ledger-active" : ""}`}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <path
                              d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
                              stroke="currentColor"
                              strokeWidth="2"
                            />
                            <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" />
                          </svg>
                          GSTIN (15 digits mandatory)
                        </label>
                      </div>

                      <div className="ledger-floating-input-group">
                        <input
                          type="text"
                          id="pan"
                          value={ledgerDetails.pan}
                          onChange={(e) => handleInputChange("pan", e.target.value.toUpperCase())}
                          onFocus={() => handleFocus("pan")}
                          onBlur={handleBlur}
                          className="ledger-floating-input"
                          maxLength="10"
                          disabled={loading}
                        />
                        <label
                          htmlFor="pan"
                          className={`ledger-floating-label ${isFieldActive("pan") ? "ledger-active" : ""}`}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <rect
                              x="2"
                              y="3"
                              width="20"
                              height="14"
                              rx="2"
                              ry="2"
                              stroke="currentColor"
                              strokeWidth="2"
                            />
                            <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" strokeWidth="2" />
                            <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" strokeWidth="2" />
                          </svg>
                          PAN (10 digits mandatory)
                        </label>
                      </div>
                    </div>

                    {ledgerDetails.debtorCreditor === "Creditor" && (
                      <>
                        <div className="ledger-form-row">
                          <div className="ledger-floating-input-group">
                            <input
                              type="text"
                              id="bankAccountNo"
                              value={ledgerDetails.bankAccountNo}
                              onChange={(e) => handleInputChange("bankAccountNo", e.target.value)}
                              onFocus={() => handleFocus("bankAccountNo")}
                              onBlur={handleBlur}
                              className="ledger-floating-input"
                              disabled={loading}
                            />
                            <label
                              htmlFor="bankAccountNo"
                              className={`ledger-floating-label ${isFieldActive("bankAccountNo") ? "ledger-active" : ""}`}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <rect
                                  x="1"
                                  y="4"
                                  width="22"
                                  height="16"
                                  rx="2"
                                  ry="2"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                />
                                <line x1="1" y1="10" x2="23" y2="10" stroke="currentColor" strokeWidth="2" />
                              </svg>
                              Bank Account No
                            </label>
                          </div>

                          <div className="ledger-floating-input-group">
                            <input
                              type="text"
                              id="ifscCode"
                              value={ledgerDetails.ifscCode}
                              onChange={(e) => handleInputChange("ifscCode", e.target.value.toUpperCase())}
                              onFocus={() => handleFocus("ifscCode")}
                              onBlur={handleBlur}
                              className="ledger-floating-input"
                              maxLength="11"
                              disabled={loading}
                            />
                            <label
                              htmlFor="ifscCode"
                              className={`ledger-floating-label ${isFieldActive("ifscCode") ? "ledger-active" : ""}`}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <rect
                                  x="1"
                                  y="4"
                                  width="22"
                                  height="16"
                                  rx="2"
                                  ry="2"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                />
                                <line x1="1" y1="10" x2="23" y2="10" stroke="currentColor" strokeWidth="2" />
                              </svg>
                              IFSC Code (11 digits mandatory)
                            </label>
                          </div>
                        </div>

                        <div className="ledger-floating-input-group ledger-full-width">
                          <input
                            type="text"
                            id="branchName"
                            value={ledgerDetails.branchName}
                            onChange={(e) => handleInputChange("branchName", e.target.value)}
                            onFocus={() => handleFocus("branchName")}
                            onBlur={handleBlur}
                            className="ledger-floating-input"
                            disabled={loading}
                          />
                          <label
                            htmlFor="branchName"
                            className={`ledger-floating-label ${isFieldActive("branchName") ? "ledger-active" : ""}`}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                              <path
                                d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
                                stroke="currentColor"
                                strokeWidth="2"
                              />
                              <polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" strokeWidth="2" />
                            </svg>
                            Branch Name
                          </label>
                        </div>
                      </>
                    )}

                    <div className="ledger-floating-input-group ledger-full-width">
                      <select
                        id="serviceType"
                        value={ledgerDetails.serviceType}
                        onChange={(e) => handleInputChange("serviceType", e.target.value)}
                        onFocus={() => handleFocus("serviceType")}
                        onBlur={handleBlur}
                        className="ledger-floating-select"
                        disabled={loading}
                      >
                        <option value="">Select Service Type</option>
                        <option value="Trader">Trader</option>
                        <option value="Manufacturer">Manufacturer</option>
                        <option value="Service Provider">Service Provider</option>
                      </select>
                      <label
                        htmlFor="serviceType"
                        className={`ledger-floating-label ${isFieldActive("serviceType") ? "ledger-active" : ""}`}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                          <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" />
                          <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" />
                          <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" />
                        </svg>
                        Service Type
                      </label>
                    </div>
                  </div>

                  <div className="ledger-button-group">
                    <button className="ledger-save-btn" onClick={handleSave} disabled={loading}>
                      {loading ? "Saving..." : ledgerId ? "Update Ledger Details" : "Save Ledger Details"}
                    </button>
                    <button className="ledger-clear-btn" onClick={handleClear} disabled={loading}>
                      Clear
                    </button>
                  </div>
                </div>
              ) : (
                <div className="ledger-details-container">
                  <div className="ledger-section-header">
                    <h3>Ledger Details</h3>
                    <button className="ledger-edit-btn" onClick={handleEdit}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path
                          d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                        <path
                          d="M18.5 2.5C18.8978 2.10217 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10217 21.5 2.5C21.8978 2.89782 22.1213 3.43739 22.1213 4C22.1213 4.56261 21.8978 5.10217 21.5 5.5L12 15L8 16L9 12L18.5 2.5Z"
                          stroke="currentColor"
                          strokeWidth="2"
                        />
                      </svg>
                      Edit
                    </button>
                  </div>

                  <div className="ledger-details-layout">
                    <div className="ledger-detail-card">
                      <span className="ledger-detail-title">Ledger Name</span>
                      <span className="ledger-detail-text">{ledgerDetails.ledgerName}</span>
                    </div>
                    <div className="ledger-detail-card">
                      <span className="ledger-detail-title">Group Name</span>
                      <span className="ledger-detail-text">{ledgerDetails.groupName}</span>
                    </div>
                    <div className="ledger-detail-card">
                      <span className="ledger-detail-title">Debtor / Creditor</span>
                      <span className="ledger-detail-text">{ledgerDetails.debtorCreditor}</span>
                    </div>
                    <div className="ledger-detail-card">
                      <span className="ledger-detail-title">House/Plot No</span>
                      <span className="ledger-detail-text">{ledgerDetails.housePlotNo}</span>
                    </div>
                    <div className="ledger-detail-card">
                      <span className="ledger-detail-title">Street</span>
                      <span className="ledger-detail-text">{ledgerDetails.street}</span>
                    </div>
                    <div className="ledger-detail-card">
                      <span className="ledger-detail-title">Village / Post</span>
                      <span className="ledger-detail-text">{ledgerDetails.villagePost}</span>
                    </div>
                    <div className="ledger-detail-card">
                      <span className="ledger-detail-title">Mandal / Taluq</span>
                      <span className="ledger-detail-text">{ledgerDetails.mandalTaluq}</span>
                    </div>
                    <div className="ledger-detail-card">
                      <span className="ledger-detail-title">District</span>
                      <span className="ledger-detail-text">{ledgerDetails.district}</span>
                    </div>
                    <div className="ledger-detail-card">
                      <span className="ledger-detail-title">State</span>
                      <span className="ledger-detail-text">{ledgerDetails.state}</span>
                    </div>
                    <div className="ledger-detail-card">
                      <span className="ledger-detail-title">Pin Code</span>
                      <span className="ledger-detail-text">{ledgerDetails.pinCode}</span>
                    </div>
                    <div className="ledger-detail-card">
                      <span className="ledger-detail-title">Contact Person Name</span>
                      <span className="ledger-detail-text">{ledgerDetails.contactPersonName}</span>
                    </div>
                    <div className="ledger-detail-card">
                      <span className="ledger-detail-title">Mobile No</span>
                      <span className="ledger-detail-text">{ledgerDetails.mobileNo}</span>
                    </div>
                    <div className="ledger-detail-card">
                      <span className="ledger-detail-title">Email I'd</span>
                      <span className="ledger-detail-text">{ledgerDetails.email}</span>
                    </div>
                    <div className="ledger-detail-card">
                      <span className="ledger-detail-title">Website</span>
                      <span className="ledger-detail-text">{ledgerDetails.website}</span>
                    </div>
                    <div className="ledger-detail-card">
                      <span className="ledger-detail-title">GSTIN</span>
                      <span className="ledger-detail-text">{ledgerDetails.gstin}</span>
                    </div>
                    <div className="ledger-detail-card">
                      <span className="ledger-detail-title">PAN</span>
                      <span className="ledger-detail-text">{ledgerDetails.pan}</span>
                    </div>
                    {ledgerDetails.debtorCreditor === "Creditor" && (
                      <>
                        <div className="ledger-detail-card">
                          <span className="ledger-detail-title">Bank Account No</span>
                          <span className="ledger-detail-text">{ledgerDetails.bankAccountNo}</span>
                        </div>
                        <div className="ledger-detail-card">
                          <span className="ledger-detail-title">IFSC Code</span>
                          <span className="ledger-detail-text">{ledgerDetails.ifscCode}</span>
                        </div>
                        <div className="ledger-detail-card">
                          <span className="ledger-detail-title">Branch Name</span>
                          <span className="ledger-detail-text">{ledgerDetails.branchName}</span>
                        </div>
                      </>
                    )}
                    <div className="ledger-detail-card">
                      <span className="ledger-detail-title">Service Type</span>
                      <span className="ledger-detail-text">{ledgerDetails.serviceType}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Toast Notification */}
          {showToast && (
            <div className="ledger-toast-notification">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2" />
              </svg>
              {toastMessage}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LedgerCreation;
