import { useState, useRef, useEffect } from "react"
import "../VendorComponent/VendorProfile.css"

const VendorProfile = () => {
  const [profileImage, setProfileImage] = useState("/placeholder.svg?height=120&width=120")
  const [backgroundImage, setBackgroundImage] = useState(
    "https://images.unsplash.com/photo-1557804506-669a67965ba0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1974&q=80",
  )
  const [isEditing, setIsEditing] = useState(true)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [focusedField, setFocusedField] = useState("")
  const [loading, setLoading] = useState(false)
  const [vendorId, setVendorId] = useState(null)
  const [activeTab, setActiveTab] = useState("company")
  const [vendorDetails, setVendorDetails] = useState({
    companyName: "",
    housePlotNo: "",
    floor: "",
    buildingName: "",
    street: "",
    area: "",
    villagePost: "",
    mandalTq: "",
    district: "",
    state: "",
    pinCode: "",
    contactPerson: "",
    contactNumber: "",
    email: "",
    bankAccount: "",
    ifscCode: "",
    branchName: "",
    gstNo: "",
    panNo: "",
  })

  const profileInputRef = useRef(null)
  const backgroundInputRef = useRef(null)

  // API Base URL
  const API_BASE_URL = "http://195.35.45.56:5522/api/vendor-profile"

  useEffect(() => {
    // Load vendor data if editing existing vendor
    const urlParams = new URLSearchParams(window.location.search)
    const id = urlParams.get("id")
    if (id) {
      setVendorId(id)
      loadVendorData(id)
    }
  }, [])

  const checkExistingVendor = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}`)
      if (response.ok) {
        const vendors = await response.json()
        console.log("Existing vendors:", vendors)
      }
    } catch (error) {
      console.error("Error fetching vendors:", error)
    }
  }

  useEffect(() => {
    // Load saved vendor data from localStorage if no ID is provided in URL
    const urlParams = new URLSearchParams(window.location.search)
    const id = urlParams.get("id")

    if (!id && !vendorId) {
      const savedVendorData = localStorage.getItem("vendorProfileDetails")
      if (savedVendorData) {
        const parsedData = JSON.parse(savedVendorData)
        setVendorDetails(parsedData)
        if (parsedData.id) {
          setVendorId(parsedData.id)
          setIsEditing(false)
          // Load logo if exists
          loadProfileImage(parsedData.id)
        }
      }
      // Check existing vendors for debugging
      checkExistingVendor()
    }
  }, [vendorId])

  const loadVendorData = async (id) => {
    try {
      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/${id}`)
      if (response.ok) {
        const data = await response.json()
        setVendorDetails(data)
        setIsEditing(false)
        // Load logo if exists
        loadProfileImage(id)
      } else {
        showToastMessage("Failed to load vendor data")
      }
    } catch (error) {
      console.error("Error loading vendor data:", error)
      showToastMessage("Error loading vendor data")
    } finally {
      setLoading(false)
    }
  }

  const loadProfileImage = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}/logo`)
      if (response.ok) {
        const blob = await response.blob()
        const imageUrl = URL.createObjectURL(blob)
        setProfileImage(imageUrl)
      }
    } catch (error) {
      console.error("Error loading profile image:", error)
    }
  }

  const handleProfileImageClick = () => {
    profileInputRef.current?.click()
  }

  const handleBackgroundImageClick = () => {
    backgroundInputRef.current?.click()
  }

  const handleImageUpload = async (event, type) => {
    const file = event.target.files?.[0]
    if (file && vendorId) {
      const formData = new FormData()
      formData.append(type === "profile" ? "logo" : "letterhead", file)

      try {
        const endpoint = type === "profile" ? "logo" : "letterhead"
        const response = await fetch(`${API_BASE_URL}/${vendorId}/${endpoint}`, {
          method: "POST",
          body: formData,
        })

        if (response.ok) {
          const reader = new FileReader()
          reader.onload = (e) => {
            const result = e.target?.result
            if (type === "profile") {
              setProfileImage(result)
            } else {
              setBackgroundImage(result)
            }
          }
          reader.readAsDataURL(file)
          showToastMessage(`${type === "profile" ? "Logo" : "Letter head"} uploaded successfully!`)
        } else {
          showToastMessage(`Failed to upload ${type === "profile" ? "logo" : "letter head"}`)
        }
      } catch (error) {
        console.error("Error uploading image:", error)
        showToastMessage("Error uploading image")
      }
    } else if (file && !vendorId) {
      // If no vendor ID, just preview the image
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result
        if (type === "profile") {
          setProfileImage(result)
        } else {
          setBackgroundImage(result)
        }
      }
      reader.readAsDataURL(file)
    }
  }

  const handleInputChange = (field, value) => {
    setVendorDetails((prev) => ({
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
    if (!vendorDetails.companyName.trim()) {
      showToastMessage("Company name is required")
      return false
    }

    // Validate email format if provided
    if (vendorDetails.email && vendorDetails.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(vendorDetails.email.trim())) {
        showToastMessage("Please enter a valid email address")
        return false
      }
    }

    // Validate contact number format if provided
    if (vendorDetails.contactNumber && vendorDetails.contactNumber.trim()) {
      const phoneDigits = vendorDetails.contactNumber.replace(/\D/g, "")
      if (phoneDigits.length < 10 || phoneDigits.length > 15) {
        showToastMessage("Please enter a valid contact number (10-15 digits)")
        return false
      }
    }

    // Validate PIN code format if provided
    if (vendorDetails.pinCode && vendorDetails.pinCode.trim()) {
      const pinRegex = /^[0-9]{6}$/
      if (!pinRegex.test(vendorDetails.pinCode.trim())) {
        showToastMessage("Please enter a valid PIN code (6 digits)")
        return false
      }
    }

    // Validate PAN format if provided
    if (vendorDetails.panNo && vendorDetails.panNo.trim()) {
      const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/
      if (!panRegex.test(vendorDetails.panNo.trim())) {
        showToastMessage("Please enter a valid PAN number (e.g., AAICB6129Q)")
        return false
      }
    }

    // Validate GST format if provided
    if (vendorDetails.gstNo && vendorDetails.gstNo.trim()) {
      const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/
      if (!gstRegex.test(vendorDetails.gstNo.trim())) {
        showToastMessage("Please enter a valid GST number (e.g., 29AAICB6129Q1ZY)")
        return false
      }
    }

    // Validate IFSC code format if provided
    if (vendorDetails.ifscCode && vendorDetails.ifscCode.trim()) {
      const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/
      if (!ifscRegex.test(vendorDetails.ifscCode.trim())) {
        showToastMessage("Please enter a valid IFSC code (e.g., SBIN0001234)")
        return false
      }
    }

    return true
  }

  const handleSave = async () => {
    if (!validateForm()) return

    try {
      setLoading(true)

      // Prepare the data payload - REMOVE any binary data fields
      const payload = {
        companyName: vendorDetails.companyName.trim(),
        housePlotNo: vendorDetails.housePlotNo?.trim() || "",
        floor: vendorDetails.floor?.trim() || "",
        buildingName: vendorDetails.buildingName?.trim() || "",
        street: vendorDetails.street?.trim() || "",
        area: vendorDetails.area?.trim() || "",
        villagePost: vendorDetails.villagePost?.trim() || "",
        mandalTq: vendorDetails.mandalTq?.trim() || "",
        district: vendorDetails.district?.trim() || "",
        state: vendorDetails.state?.trim() || "",
        pinCode: vendorDetails.pinCode?.trim() || "",
        contactPerson: vendorDetails.contactPerson?.trim() || "",
        contactNumber: vendorDetails.contactNumber?.trim() || "",
        email: vendorDetails.email?.trim() || "",
        bankAccount: vendorDetails.bankAccount?.trim() || "",
        ifscCode: vendorDetails.ifscCode?.trim() || "",
        branchName: vendorDetails.branchName?.trim() || "",
        gstNo: vendorDetails.gstNo?.trim() || "",
        panNo: vendorDetails.panNo?.trim() || "",
        status: "ACTIVE",
      }

      // Remove any binary data fields that might be causing issues
      delete payload.logoData
      delete payload.letterHeadData
      delete payload.logoBase64
      delete payload.letterHeadBase64

      const url = vendorId ? `${API_BASE_URL}/${vendorId}` : API_BASE_URL
      const method = vendorId ? "PUT" : "POST"

      const response = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        const data = await response.json()
        if (!vendorId) {
          setVendorId(data.id)

          // If we have a profile image to upload, do it now that we have an ID
          if (profileImage && profileImage !== "/placeholder.svg?height=120&width=120") {
            // Convert base64 to blob and upload
            await uploadProfileImageToServer(data.id, profileImage)
          }
        }

        // Save the vendor data to localStorage
        localStorage.setItem(
          "vendorProfileDetails",
          JSON.stringify({
            ...data,
            // Don't store binary data in localStorage
          }),
        )

        setIsEditing(false)
        showToastMessage(vendorId ? "Profile updated successfully!" : "Profile created successfully!")
      } else {
        // Handle error
        let errorMessage = "Failed to save profile details"

        try {
          const errorData = await response.json()
          errorMessage = errorData.message || "Invalid data provided. Please check all fields."
        } catch (e) {
          errorMessage = "Invalid data provided. Please check all fields."
        }

        showToastMessage(errorMessage)
      }
    } catch (error) {
      console.error("Error saving profile:", error)
      showToastMessage("Network error. Please check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  // Add a helper function to upload profile image
  const uploadProfileImageToServer = async (id, base64Image) => {
    if (!base64Image || base64Image === "/placeholder.svg?height=120&width=120") return

    try {
      // Convert base64 to blob
      const response = await fetch(base64Image)
      const blob = await response.blob()

      // Create a file from the blob
      const file = new File([blob], "profile-image.jpg", { type: "image/jpeg" })

      // Create FormData
      const formData = new FormData()
      formData.append("logo", file)

      // Upload to server
      await fetch(`${API_BASE_URL}/${id}/logo`, {
        method: "POST",
        body: formData,
      })
    } catch (error) {
      console.error("Error uploading profile image:", error)
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
    return focusedField === field || vendorDetails[field] !== ""
  }

  const handleClear = () => {
    // Clear form data
    setVendorDetails({
      companyName: "",
      housePlotNo: "",
      floor: "",
      buildingName: "",
      street: "",
      area: "",
      villagePost: "",
      mandalTq: "",
      district: "",
      state: "",
      pinCode: "",
      contactPerson: "",
      contactNumber: "",
      email: "",
      bankAccount: "",
      ifscCode: "",
      branchName: "",
      gstNo: "",
      panNo: "",
    })

    // Reset state
    setVendorId(null)
    setIsEditing(true)
    setActiveTab("company")

    // Clear localStorage
    localStorage.removeItem("vendorProfileDetails")

    // Reset profile image
    setProfileImage("/placeholder.svg?height=120&width=120")

    // Show confirmation message
    showToastMessage("Form cleared successfully")
  }

  const renderCompanyInfoTab = () => (
    <div className="ven-form-layout">
      <div className="ven-form-row">
        <div className="ven-floating-input-group">
          <input
            type="text"
            id="companyName"
            value={vendorDetails.companyName}
            onChange={(e) => handleInputChange("companyName", e.target.value)}
            onFocus={() => handleFocus("companyName")}
            onBlur={handleBlur}
            className="ven-floating-input"
            disabled={loading}
          />
          <label
            htmlFor="companyName"
            className={`ven-floating-label ${isFieldActive("companyName") ? "ven-active" : ""}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M3 21H21V8L12 2L3 8V21Z" stroke="currentColor" strokeWidth="2" />
            </svg>
            Company Name *
          </label>
        </div>

        <div className="ven-floating-input-group">
          <input
            type="text"
            id="housePlotNo"
            value={vendorDetails.housePlotNo}
            onChange={(e) => handleInputChange("housePlotNo", e.target.value)}
            onFocus={() => handleFocus("housePlotNo")}
            onBlur={handleBlur}
            className="ven-floating-input"
            disabled={loading}
          />
          <label
            htmlFor="housePlotNo"
            className={`ven-floating-label ${isFieldActive("housePlotNo") ? "ven-active" : ""}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
            House / Plot No
          </label>
        </div>
      </div>

      <div className="ven-form-row">
        <div className="ven-floating-input-group">
          <input
            type="text"
            id="floor"
            value={vendorDetails.floor}
            onChange={(e) => handleInputChange("floor", e.target.value)}
            onFocus={() => handleFocus("floor")}
            onBlur={handleBlur}
            className="ven-floating-input"
            disabled={loading}
          />
          <label htmlFor="floor" className={`ven-floating-label ${isFieldActive("floor") ? "ven-active" : ""}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 7V17C3 17.5304 3.21071 18.0391 3.58579 18.4142C3.96086 18.7893 4.46957 19 5 19H19C19.5304 19 20.0391 18.7893 20.4142 18.4142C20.7893 18.0391 21 17.5304 21 17V7"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path d="M3 7L12 2L21 7" stroke="currentColor" strokeWidth="2" />
            </svg>
            Floor
          </label>
        </div>

        <div className="ven-floating-input-group">
          <input
            type="text"
            id="buildingName"
            value={vendorDetails.buildingName}
            onChange={(e) => handleInputChange("buildingName", e.target.value)}
            onFocus={() => handleFocus("buildingName")}
            onBlur={handleBlur}
            className="ven-floating-input"
            disabled={loading}
          />
          <label
            htmlFor="buildingName"
            className={`ven-floating-label ${isFieldActive("buildingName") ? "ven-active" : ""}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M6 2L3 6V20C3 20.5304 3.21071 21.0391 3.58579 21.4142C3.96086 21.7893 4.46957 22 5 22H19C19.5304 22 20.0391 21.7893 20.4142 21.4142C20.7893 21.0391 21 20.5304 21 20V6L18 2H6Z"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
            Building Name
          </label>
        </div>
      </div>

      <div className="ven-form-row">
        <div className="ven-floating-input-group">
          <input
            type="text"
            id="street"
            value={vendorDetails.street}
            onChange={(e) => handleInputChange("street", e.target.value)}
            onFocus={() => handleFocus("street")}
            onBlur={handleBlur}
            className="ven-floating-input"
            disabled={loading}
          />
          <label htmlFor="street" className={`ven-floating-label ${isFieldActive("street") ? "ven-active" : ""}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M21 10C21 17 12 23 12 23S3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.3639 3.63604C20.0518 5.32387 21 7.61305 21 10Z"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
            Street
          </label>
        </div>

        <div className="ven-floating-input-group">
          <input
            type="text"
            id="area"
            value={vendorDetails.area}
            onChange={(e) => handleInputChange("area", e.target.value)}
            onFocus={() => handleFocus("area")}
            onBlur={handleBlur}
            className="ven-floating-input"
            disabled={loading}
          />
          <label htmlFor="area" className={`ven-floating-label ${isFieldActive("area") ? "ven-active" : ""}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
            </svg>
            Area
          </label>
        </div>
      </div>

      <div className="ven-form-row">
        <div className="ven-floating-input-group">
          <input
            type="text"
            id="villagePost"
            value={vendorDetails.villagePost}
            onChange={(e) => handleInputChange("villagePost", e.target.value)}
            onFocus={() => handleFocus("villagePost")}
            onBlur={handleBlur}
            className="ven-floating-input"
            disabled={loading}
          />
          <label
            htmlFor="villagePost"
            className={`ven-floating-label ${isFieldActive("villagePost") ? "ven-active" : ""}`}
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

        <div className="ven-floating-input-group">
          <input
            type="text"
            id="mandalTq"
            value={vendorDetails.mandalTq}
            onChange={(e) => handleInputChange("mandalTq", e.target.value)}
            onFocus={() => handleFocus("mandalTq")}
            onBlur={handleBlur}
            className="ven-floating-input"
            disabled={loading}
          />
          <label htmlFor="mandalTq" className={`ven-floating-label ${isFieldActive("mandalTq") ? "ven-active" : ""}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" />
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" />
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" />
            </svg>
            Mandal / Tq
          </label>
        </div>
      </div>

      <div className="ven-form-row">
        <div className="ven-floating-input-group">
          <input
            type="text"
            id="district"
            value={vendorDetails.district}
            onChange={(e) => handleInputChange("district", e.target.value)}
            onFocus={() => handleFocus("district")}
            onBlur={handleBlur}
            className="ven-floating-input"
            disabled={loading}
          />
          <label htmlFor="district" className={`ven-floating-label ${isFieldActive("district") ? "ven-active" : ""}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M21 10C21 17 12 23 12 23S3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.3639 3.63604C20.0518 5.32387 21 7.61305 21 10Z"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
            District
          </label>
        </div>

        <div className="ven-floating-input-group">
          <input
            type="text"
            id="state"
            value={vendorDetails.state}
            onChange={(e) => handleInputChange("state", e.target.value)}
            onFocus={() => handleFocus("state")}
            onBlur={handleBlur}
            className="ven-floating-input"
            disabled={loading}
          />
          <label htmlFor="state" className={`ven-floating-label ${isFieldActive("state") ? "ven-active" : ""}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M21 10C21 17 12 23 12 23S3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.3639 3.63604C20.0518 5.32387 21 7.61305 21 10Z"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
            State
          </label>
        </div>
      </div>

      <div className="ven-form-row">
        <div className="ven-floating-input-group">
          <input
            type="text"
            id="pinCode"
            value={vendorDetails.pinCode}
            onChange={(e) => handleInputChange("pinCode", e.target.value)}
            onFocus={() => handleFocus("pinCode")}
            onBlur={handleBlur}
            className="ven-floating-input"
            disabled={loading}
            maxLength="6"
          />
          <label htmlFor="pinCode" className={`ven-floating-label ${isFieldActive("pinCode") ? "ven-active" : ""}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M21 10C21 17 12 23 12 23S3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.3639 3.63604C20.0518 5.32387 21 7.61305 21 10Z"
                stroke="currentColor"
                strokeWidth="2"
              />
              <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" />
            </svg>
            PIN Code
          </label>
        </div>

        <div className="ven-floating-input-group">
          <input
            type="text"
            id="contactPerson"
            value={vendorDetails.contactPerson}
            onChange={(e) => handleInputChange("contactPerson", e.target.value)}
            onFocus={() => handleFocus("contactPerson")}
            onBlur={handleBlur}
            className="ven-floating-input"
            disabled={loading}
          />
          <label
            htmlFor="contactPerson"
            className={`ven-floating-label ${isFieldActive("contactPerson") ? "ven-active" : ""}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21"
                stroke="currentColor"
                strokeWidth="2"
              />
              <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" />
            </svg>
            Contact Person
          </label>
        </div>
      </div>

      <div className="ven-form-row">
        <div className="ven-floating-input-group">
          <input
            type="tel"
            id="contactNumber"
            value={vendorDetails.contactNumber}
            onChange={(e) => handleInputChange("contactNumber", e.target.value)}
            onFocus={() => handleFocus("contactNumber")}
            onBlur={handleBlur}
            className="ven-floating-input"
            disabled={loading}
          />
          <label
            htmlFor="contactNumber"
            className={`ven-floating-label ${isFieldActive("contactNumber") ? "ven-active" : ""}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M22 16.92V19.92C22.0011 20.1985 21.9441 20.4742 21.8325 20.7293C21.7209 20.9845 21.5573 21.2136 21.3521 21.4019C21.1468 21.5901 20.9046 21.7335 20.6407 21.8227C20.3769 21.9119 20.0974 21.9451 19.82 21.92C16.7428 21.5856 13.787 20.5341 11.19 18.85C8.77382 17.3147 6.72533 15.2662 5.18999 12.85C3.49997 10.2412 2.44824 7.27099 2.11999 4.18C2.095 3.90347 2.12787 3.62476 2.21649 3.36162C2.30512 3.09849 2.44756 2.85669 2.63476 2.65162C2.82196 2.44655 3.0498 2.28271 3.30379 2.17052C3.55777 2.05833 3.83233 2.00026 4.10999 2H7.10999C7.59531 1.99522 8.06579 2.16708 8.43376 2.48353C8.80173 2.79999 9.04207 3.23945 9.10999 3.72C9.23662 4.68007 9.47144 5.62273 9.80999 6.53C9.94454 6.88792 9.97366 7.27691 9.8939 7.65088C9.81415 8.02485 9.62886 8.36811 9.35999 8.64L8.08999 9.91C9.51355 12.4135 11.5865 14.4864 14.09 15.91L15.36 14.64C15.6319 14.3711 15.9751 14.1858 16.3491 14.1061C16.7231 14.0263 17.1121 14.0555 17.47 14.19C18.3773 14.5286 19.3199 14.7634 20.28 14.89C20.7658 14.9585 21.2094 15.2032 21.5265 15.5775C21.8437 15.9518 22.0122 16.4296 22 16.92Z"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
            Contact Number
          </label>
        </div>

        <div className="ven-floating-input-group">
          <input
            type="email"
            id="email"
            value={vendorDetails.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            onFocus={() => handleFocus("email")}
            onBlur={handleBlur}
            className="ven-floating-input"
            disabled={loading}
          />
          <label htmlFor="email" className={`ven-floating-label ${isFieldActive("email") ? "ven-active" : ""}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4Z"
                stroke="currentColor"
                strokeWidth="2"
              />
              <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2" />
            </svg>
            E-mail
          </label>
        </div>
      </div>
    </div>
  )

  const renderStandardInfoTab = () => (
    <div className="ven-form-layout">
      <div className="ven-form-row">
        <div className="ven-floating-input-group">
          <input
            type="text"
            id="gstNo"
            value={vendorDetails.gstNo}
            onChange={(e) => handleInputChange("gstNo", e.target.value)}
            onFocus={() => handleFocus("gstNo")}
            onBlur={handleBlur}
            className="ven-floating-input"
            disabled={loading}
            maxLength="15"
          />
          <label htmlFor="gstNo" className={`ven-floating-label ${isFieldActive("gstNo") ? "ven-active" : ""}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z"
                stroke="currentColor"
                strokeWidth="2"
              />
              <polyline points="14,2 14,8 20,8" stroke="currentColor" strokeWidth="2" />
            </svg>
            GST No (15 digits)
          </label>
        </div>

        <div className="ven-floating-input-group">
          <input
            type="text"
            id="panNo"
            value={vendorDetails.panNo}
            onChange={(e) => handleInputChange("panNo", e.target.value)}
            onFocus={() => handleFocus("panNo")}
            onBlur={handleBlur}
            className="ven-floating-input"
            disabled={loading}
            maxLength="10"
          />
          <label htmlFor="panNo" className={`ven-floating-label ${isFieldActive("panNo") ? "ven-active" : ""}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="currentColor" strokeWidth="2" />
              <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" strokeWidth="2" />
              <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" strokeWidth="2" />
            </svg>
            PAN No (10 digits)
          </label>
        </div>
      </div>

      <div className="ven-form-row">
        <div className="ven-floating-input-group">
          <input
            type="text"
            id="bankAccount"
            value={vendorDetails.bankAccount}
            onChange={(e) => handleInputChange("bankAccount", e.target.value)}
            onFocus={() => handleFocus("bankAccount")}
            onBlur={handleBlur}
            className="ven-floating-input"
            disabled={loading}
          />
          <label
            htmlFor="bankAccount"
            className={`ven-floating-label ${isFieldActive("bankAccount") ? "ven-active" : ""}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" stroke="currentColor" strokeWidth="2" />
              <line x1="1" y1="10" x2="23" y2="10" stroke="currentColor" strokeWidth="2" />
            </svg>
            Bank Account
          </label>
        </div>

        <div className="ven-floating-input-group">
          <input
            type="text"
            id="ifscCode"
            value={vendorDetails.ifscCode}
            onChange={(e) => handleInputChange("ifscCode", e.target.value)}
            onFocus={() => handleFocus("ifscCode")}
            onBlur={handleBlur}
            className="ven-floating-input"
            disabled={loading}
            maxLength="11"
          />
          <label htmlFor="ifscCode" className={`ven-floating-label ${isFieldActive("ifscCode") ? "ven-active" : ""}`}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
                stroke="currentColor"
                strokeWidth="2"
              />
              <polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" strokeWidth="2" />
            </svg>
            IFSC CODE
          </label>
        </div>
      </div>

      <div className="ven-floating-input-group ven-full-width">
        <input
          type="text"
          id="branchName"
          value={vendorDetails.branchName}
          onChange={(e) => handleInputChange("branchName", e.target.value)}
          onFocus={() => handleFocus("branchName")}
          onBlur={handleBlur}
          className="ven-floating-input"
          disabled={loading}
        />
        <label htmlFor="branchName" className={`ven-floating-label ${isFieldActive("branchName") ? "ven-active" : ""}`}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z"
              stroke="currentColor"
              strokeWidth="2"
            />
          </svg>
          BRANCH name
        </label>
      </div>
    </div>
  )

  const renderDetailsView = () => (
    <div className="ven-details-container">
      <div className="ven-section-header">
        <h3>Company Profile Details</h3>
        <button className="ven-edit-btn" onClick={handleEdit}>
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

      <div className="ven-details-layout">
        <div className="ven-detail-card">
          <span className="ven-detail-title">Company Name</span>
          <span className="ven-detail-text">{vendorDetails.companyName || "-"}</span>
        </div>
        <div className="ven-detail-card">
          <span className="ven-detail-title">House/Plot No</span>
          <span className="ven-detail-text">{vendorDetails.housePlotNo || "-"}</span>
        </div>
        <div className="ven-detail-card">
          <span className="ven-detail-title">Floor</span>
          <span className="ven-detail-text">{vendorDetails.floor || "-"}</span>
        </div>
        <div className="ven-detail-card">
          <span className="ven-detail-title">Building Name</span>
          <span className="ven-detail-text">{vendorDetails.buildingName || "-"}</span>
        </div>
        <div className="ven-detail-card">
          <span className="ven-detail-title">Street</span>
          <span className="ven-detail-text">{vendorDetails.street || "-"}</span>
        </div>
        <div className="ven-detail-card">
          <span className="ven-detail-title">Area</span>
          <span className="ven-detail-text">{vendorDetails.area || "-"}</span>
        </div>
        <div className="ven-detail-card">
          <span className="ven-detail-title">Village/Post</span>
          <span className="ven-detail-text">{vendorDetails.villagePost || "-"}</span>
        </div>
        <div className="ven-detail-card">
          <span className="ven-detail-title">Mandal/Tq</span>
          <span className="ven-detail-text">{vendorDetails.mandalTq || "-"}</span>
        </div>
        <div className="ven-detail-card">
          <span className="ven-detail-title">District</span>
          <span className="ven-detail-text">{vendorDetails.district || "-"}</span>
        </div>
        <div className="ven-detail-card">
          <span className="ven-detail-title">State</span>
          <span className="ven-detail-text">{vendorDetails.state || "-"}</span>
        </div>
        <div className="ven-detail-card">
          <span className="ven-detail-title">PIN Code</span>
          <span className="ven-detail-text">{vendorDetails.pinCode || "-"}</span>
        </div>
        <div className="ven-detail-card">
          <span className="ven-detail-title">Contact Person</span>
          <span className="ven-detail-text">{vendorDetails.contactPerson || "-"}</span>
        </div>
        <div className="ven-detail-card">
          <span className="ven-detail-title">Contact Number</span>
          <span className="ven-detail-text">{vendorDetails.contactNumber || "-"}</span>
        </div>
        <div className="ven-detail-card">
          <span className="ven-detail-title">E-mail</span>
          <span className="ven-detail-text">{vendorDetails.email || "-"}</span>
        </div>
        <div className="ven-detail-card">
          <span className="ven-detail-title">GST No</span>
          <span className="ven-detail-text">{vendorDetails.gstNo || "-"}</span>
        </div>
        <div className="ven-detail-card">
          <span className="ven-detail-title">PAN No</span>
          <span className="ven-detail-text">{vendorDetails.panNo || "-"}</span>
        </div>
        <div className="ven-detail-card">
          <span className="ven-detail-title">Bank Account</span>
          <span className="ven-detail-text">{vendorDetails.bankAccount || "-"}</span>
        </div>
        <div className="ven-detail-card">
          <span className="ven-detail-title">IFSC Code</span>
          <span className="ven-detail-text">{vendorDetails.ifscCode || "-"}</span>
        </div>
        <div className="ven-detail-card ven-full-width">
          <span className="ven-detail-title">Branch Name</span>
          <span className="ven-detail-text">{vendorDetails.branchName || "-"}</span>
        </div>
      </div>
    </div>
  )

  return (
    <div className="ven-main-wrapper">
      <div className="ven-scrollable-container">
        <div className="ven-container">
          <div className="ven-header-section">
            <h1 className="ven-app-title">Bellary Infotech Solutions</h1>
            <p className="ven-app-subtitle">Billing Software - Company Profile Management</p>
          </div>

          <div className="ven-card">
            {/* Cover Photo with Default Image */}
            <div
              className="ven-card-header"
              style={{ backgroundImage: `url(${backgroundImage})` }}
              onClick={handleBackgroundImageClick}
            >
              <div className="ven-header-overlay">
                <span className="ven-upload-text">Click to change letter head</span>
              </div>
            </div>

            {/* Profile Section */}
            <br />
            <br />
            <div className="ven-profile-section">
              <div className="ven-profile-avatar" onClick={handleProfileImageClick}>
                <img src={profileImage || "/placeholder.svg"} alt="Logo" className="ven-avatar-image" />
                <div className="ven-avatar-overlay">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
                      stroke="white"
                      strokeWidth="2"
                    />
                    <circle cx="12" cy="13" r="4" stroke="white" strokeWidth="2" />
                  </svg>
                </div>
              </div>

              <div className="ven-profile-details">
                <h2 className="ven-vendor-name">{vendorDetails.companyName || "Company Name"}</h2>
                <p className="ven-vendor-code">#{vendorDetails.gstNo || "GST-Number"}</p>
                <div className="ven-status-indicator">
                  <span className="ven-status-dot"></span>
                  <span>Active</span>
                </div>
              </div>

              <div className="ven-quick-stats">
                <div className="ven-stat">
                  <span className="ven-stat-value">{vendorDetails.gstNo ? "GST" : "No GST"}</span>
                  <span className="ven-stat-label">Registration</span>
                </div>
                <div className="ven-stat">
                  <span className="ven-stat-value">{vendorDetails.panNo ? "PAN" : "No PAN"}</span>
                  <span className="ven-stat-label">Verified</span>
                </div>
                <div className="ven-stat">
                  <span className="ven-stat-value">{vendorDetails.bankAccount ? "Bank" : "No Bank"}</span>
                  <span className="ven-stat-label">Account</span>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="ven-content-area">
              {isEditing ? (
                <div className="ven-form-container">
                  <div className="ven-section-header">
                    <h3>Company Profile Information</h3>
                  </div>

                  {/* Tab Navigation */}
                  <div className="ven-tab-navigation">
                    <button
                      className={`ven-tab-btn ${activeTab === "company" ? "ven-tab-active" : ""}`}
                      onClick={() => setActiveTab("company")}
                    >
                      Company Info
                    </button>
                    <button
                      className={`ven-tab-btn ${activeTab === "standard" ? "ven-tab-active" : ""}`}
                      onClick={() => setActiveTab("standard")}
                    >
                      Standard Info
                    </button>
                  </div>

                  {/* Tab Content */}
                  {activeTab === "company" ? renderCompanyInfoTab() : renderStandardInfoTab()}

                  <div className="ven-button-group">
                    <button className="ven-save-btn" onClick={handleSave} disabled={loading}>
                      {loading ? "Saving..." : vendorId ? "Update Profile" : "Save Profile"}
                    </button>
                    <button className="ven-clear-btn" onClick={handleClear} disabled={loading}>
                      Clear
                    </button>
                  </div>
                </div>
              ) : (
                renderDetailsView()
              )}
            </div>

            {/* Hidden file inputs */}
            <input
              type="file"
              ref={profileInputRef}
              onChange={(e) => handleImageUpload(e, "profile")}
              accept="image/*"
              style={{ display: "none" }}
            />
            <input
              type="file"
              ref={backgroundInputRef}
              onChange={(e) => handleImageUpload(e, "background")}
              accept="image/*"
              style={{ display: "none" }}
            />
          </div>

          {/* Toast Notification */}
          {showToast && (
            <div className="ven-toast-notification">
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

export default VendorProfile;
