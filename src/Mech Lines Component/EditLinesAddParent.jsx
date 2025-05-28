"use client"

import { useState, useRef, useEffect } from "react"
import { Calendar, Save, X, ChevronDown, ChevronLeft, ChevronRight, CheckCircle, Edit, Eye } from "lucide-react"
import "../Mech Lines Design/linesaddparent.css"
 
import axios from "axios"

const EditLinesAddParent = ({ onCancel, selectedOrder, lineData }) => {
  const [activeTab, setActiveTab] = useState("product-details")
  const [showDatePicker, setShowDatePicker] = useState(null)
  const [dates, setDates] = useState({
    startDate: "",
    endDate: "",
  })
  const [showBillingFrequencyDropdown, setShowBillingFrequencyDropdown] = useState(false)
  const [showBillingChannelDropdown, setShowBillingChannelDropdown] = useState(false)
  const [selectedBillingFrequency, setSelectedBillingFrequency] = useState("")
  const [selectedBillingChannel, setSelectedBillingChannel] = useState("")
  const datePickerRef = useRef(null)
  const billingFrequencyDropdownRef = useRef(null)
  const billingChannelDropdownRef = useRef(null)

  // Toast notification state
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("Line updated successfully")
  const [isError, setIsError] = useState(false)

  // Calendar state
  const [calendarDate, setCalendarDate] = useState(new Date())
  const [calendarView, setCalendarView] = useState("date") // "date", "month", "year"

  // Billing calculation state
  const [quantity, setQuantity] = useState("")
  const [unitPrice, setUnitPrice] = useState("")
  const [total, setTotal] = useState("")

  // Customer details dropdown states
  const [showBillToCustomerDropdown, setShowBillToCustomerDropdown] = useState(false)
  const [showBillToSiteDropdown, setShowBillToSiteDropdown] = useState(false)
  const [showBillToContactDropdown, setShowBillToContactDropdown] = useState(false)
  const billToCustomerRef = useRef(null)
  const billToSiteRef = useRef(null)
  const billToContactRef = useRef(null)

  // NEW: Edit mode state
  const [isEditMode, setIsEditMode] = useState(false)

  // API base URL
  const API_URL = "http://195.35.45.56:5522/api"
  const CUSTOMER_API_URL = "http://195.35.45.56:5522/api/V2.0"

  // Lookup values state
  const [lookupValues, setLookupValues] = useState({
    billingFrequencies: [
      { lookupCode: "MONTHLY", meaning: "Monthly" },
      { lookupCode: "QUARTERLY", meaning: "Quarterly" },
      { lookupCode: "ANNUALLY", meaning: "Annually" },
      { lookupCode: "ONE_TIME", meaning: "One Time" },
    ],
    billingChannels: [],
    uomList: [
      { lookupCode: "EA", meaning: "Each" },
      { lookupCode: "HR", meaning: "Hour" },
      { lookupCode: "DAY", meaning: "Day" },
      { lookupCode: "MTH", meaning: "Month" },
    ],
  })
  const [loadingLookupValues, setLoadingLookupValues] = useState(false)

  // Customer data states
  const [customers, setCustomers] = useState([])
  const [customerSites, setCustomerSites] = useState([])
  const [customerContacts, setCustomerContacts] = useState([])
  const [selectedCustomerName, setSelectedCustomerName] = useState("")
  const [selectedSiteName, setSelectedSiteName] = useState("")
  const [selectedContactName, setSelectedContactName] = useState("")
  const [loadingCustomerData, setLoadingCustomerData] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // Initial line state
  const [line, setLine] = useState({
    lineId: null,
    orderId: selectedOrder ? selectedOrder.orderId : null,
    lineNumber: "",
    serviceName: "",
    effectiveStartDate: null,
    effectiveEndDate: null,
    isParent: true, // This is a parent line
    billToCustomerId: "",
    billToSiteId: "",
    billToContactId: "",
    orderedQuantity: "",
    unitPrice: "",
    uom: "",
    totalPrice: "",
    billingFrequency: "",
    status: "ACTIVE",
  })

  // Handle UOM selection
  const [showUOMDropdown, setShowUOMDropdown] = useState(false)
  const uomDropdownRef = useRef(null)
  const [selectedUOM, setSelectedUOM] = useState("")

  // NEW: Toggle edit mode
  const handleEditModeToggle = () => {
    setIsEditMode(!isEditMode)
  }

  // Populate the form with line data
  useEffect(() => {
    if (lineData) {
      console.log("Populating form with data:", lineData)

      // Set line state
      setLine((prevLine) => ({
        ...prevLine,
        ...lineData,
      }))

      // Set quantity and unit price for calculation
      if (lineData.orderedQuantity) {
        setQuantity(lineData.orderedQuantity.toString())
      }

      if (lineData.unitPrice) {
        setUnitPrice(lineData.unitPrice.toString())
      }

      // Format dates
      if (lineData.effectiveStartDate) {
        const startDate = new Date(lineData.effectiveStartDate)
        setDates((prev) => ({
          ...prev,
          startDate: formatDate(startDate),
        }))
      }

      if (lineData.effectiveEndDate) {
        const endDate = new Date(lineData.effectiveEndDate)
        setDates((prev) => ({
          ...prev,
          endDate: formatDate(endDate),
        }))
      }

      // Set dropdown selections
      if (lineData.billingFrequency) {
        const frequency = lookupValues.billingFrequencies.find((f) => f.lookupCode === lineData.billingFrequency)
        if (frequency) {
          setSelectedBillingFrequency(frequency.meaning)
        }
      }

      if (lineData.uom) {
        const uom = lookupValues.uomList.find((u) => u.lookupCode === lineData.uom)
        if (uom) {
          setSelectedUOM(uom.meaning)
        }
      }

      setIsLoading(false)
    }
  }, [lineData])

  // Update orderId when selectedOrder changes
  useEffect(() => {
    if (selectedOrder && selectedOrder.orderId) {
      setLine((prev) => ({
        ...prev,
        orderId: selectedOrder.orderId,
      }))
    }
  }, [selectedOrder])

  // Fetch billing frequencies from the backend
  useEffect(() => {
    const fetchBillingFrequencies = async () => {
      try {
        setLoadingLookupValues(true)

        // Try to fetch from V2.0 endpoint
        try {
          const response = await axios.get(`${CUSTOMER_API_URL}/order-lookup-values`)
          if (response.data && response.data.billingFrequencies) {
            console.log("Billing frequencies from V2.0:", response.data)
            setLookupValues((prev) => ({
              ...prev,
              billingFrequencies: response.data.billingFrequencies || prev.billingFrequencies,
            }))
          }
        } catch (error) {
          console.error("Error fetching from V2.0 endpoint:", error)
          // Continue with default values
        }

        // Try to fetch from lookup-values endpoint
        try {
          const response = await axios.get(`${API_URL}/lookup-values`, {
            params: {
              search: "BILLING_FREQUENCY",
            },
          })

          if (response.data && response.data.content) {
            const billingFrequencies = response.data.content
              .filter((item) => item.lookupType === "BILLING_FREQUENCY")
              .map((item) => ({
                lookupCode: item.lookupCode,
                meaning: item.meaning,
              }))

            if (billingFrequencies.length > 0) {
              console.log("Billing frequencies from lookup-values:", billingFrequencies)
              setLookupValues((prev) => ({
                ...prev,
                billingFrequencies: billingFrequencies,
              }))
            }
          }
        } catch (error) {
          console.error("Error fetching from lookup-values endpoint:", error)
          // Continue with default values
        }
      } catch (error) {
        console.error("Error in fetchBillingFrequencies:", error)
      } finally {
        setLoadingLookupValues(false)
      }
    }

    fetchBillingFrequencies()
  }, [])

  // Fetch customer accounts data
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoadingCustomerData(true)
        const response = await axios.get(`${CUSTOMER_API_URL}/getallcustomeraccount/details`)

        if (response.data) {
          // Assuming the API returns an array of customer accounts
          setCustomers(response.data)

          // Set selected customer name if we have billToCustomerId
          if (line.billToCustomerId) {
            const customer = response.data.find((c) => c.custAccountId === line.billToCustomerId)
            if (customer) {
              setSelectedCustomerName(customer.accountName)
            }
          }
        }
      } catch (error) {
        console.error("Error fetching customer accounts:", error)
      } finally {
        setLoadingCustomerData(false)
      }
    }

    fetchCustomers()
  }, [line.billToCustomerId])

  // Fetch customer sites when a customer is selected
  useEffect(() => {
    const fetchCustomerSites = async () => {
      if (!line.billToCustomerId) return

      try {
        setLoadingCustomerData(true)
        const response = await axios.get(`${CUSTOMER_API_URL}/getallaccountsitesall/details`, {
          params: { customerId: line.billToCustomerId },
        })

        if (response.data) {
          setCustomerSites(response.data)

          // Set selected site name if we have billToSiteId
          if (line.billToSiteId) {
            const site = response.data.find((s) => s.custAcctSiteId === line.billToSiteId)
            if (site) {
              setSelectedSiteName(site.siteName || `Site ${site.custAcctSiteId}`)
            }
          }
        }
      } catch (error) {
        console.error("Error fetching customer sites:", error)
      } finally {
        setLoadingCustomerData(false)
      }
    }

    fetchCustomerSites()
  }, [line.billToCustomerId, line.billToSiteId])

  // Fetch customer contacts when a customer is selected
  useEffect(() => {
    const fetchCustomerContacts = async () => {
      if (!line.billToCustomerId) return

      try {
        setLoadingCustomerData(true)
        const response = await axios.get(`${CUSTOMER_API_URL}/getallcustomercontacts/details`, {
          params: { customerId: line.billToCustomerId },
        })

        if (response.data) {
          setCustomerContacts(response.data)

          // Set selected contact name if we have billToContactId
          if (line.billToContactId) {
            const contact = response.data.find((c) => c.contactId === line.billToContactId)
            if (contact) {
              setSelectedContactName(contact.roleType || `Contact ${contact.contactId}`)
            }
          }
        }
      } catch (error) {
        console.error("Error fetching customer contacts:", error)
      } finally {
        setLoadingCustomerData(false)
      }
    }

    fetchCustomerContacts()
  }, [line.billToCustomerId, line.billToContactId])

  // Auto-hide toast after 2 seconds
  useEffect(() => {
    let toastTimer
    if (showToast) {
      toastTimer = setTimeout(() => {
        setShowToast(false)

        // If it was a successful save, navigate back to the search screen
        if (!isError) {
          setTimeout(() => onCancel && onCancel(), 500)
        }
      }, 2000)
    }
    return () => {
      clearTimeout(toastTimer)
    }
  }, [showToast, isError, onCancel])

  // Calculate total when quantity or unit price changes
  useEffect(() => {
    if (quantity && unitPrice) {
      const calculatedTotal = Number.parseFloat(quantity) * Number.parseFloat(unitPrice)
      setTotal(calculatedTotal.toFixed(2))
      setLine((prev) => ({ ...prev, totalPrice: calculatedTotal.toFixed(2) }))
    } else {
      setTotal("")
      setLine((prev) => ({ ...prev, totalPrice: "" }))
    }
  }, [quantity, unitPrice])

  const handleTabClick = (tab) => {
    setActiveTab(tab)
  }

  const handleDateSelect = (field, date) => {
    if (!isEditMode) return // Prevent date selection in view mode

    const formattedDate = formatDate(date)
    setDates({ ...dates, [field]: formattedDate })

    // Update the line state
    if (field === "startDate") {
      setLine({ ...line, effectiveStartDate: date.toISOString().split("T")[0] })
    } else if (field === "endDate") {
      setLine({ ...line, effectiveEndDate: date.toISOString().split("T")[0] })
    }

    setShowDatePicker(null)
  }

  const formatDate = (date) => {
    const day = date.getDate()
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const month = monthNames[date.getMonth()]
    const year = date.getFullYear().toString()
    return `${day < 10 ? "0" + day : day}-${month}-${year}`
  }

  // Enhanced calendar functions
  const handlePrevMonth = () => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1))
  }

  const handleNextMonth = () => {
    setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1))
  }

  const handlePrevYear = () => {
    setCalendarDate(new Date(calendarDate.getFullYear() - 1, calendarDate.getMonth(), 1))
  }

  const handleNextYear = () => {
    setCalendarDate(new Date(calendarDate.getFullYear() + 1, calendarDate.getMonth(), 1))
  }

  const handleMonthClick = () => {
    setCalendarView("month")
  }

  const handleYearClick = () => {
    setCalendarView("year")
  }

  const handleMonthSelect = (month) => {
    setCalendarDate(new Date(calendarDate.getFullYear(), month, 1))
    setCalendarView("date")
  }

  const handleYearSelect = (year) => {
    setCalendarDate(new Date(year, calendarDate.getMonth(), 1))
    setCalendarView("month")
  }

  const generateCalendar = (field) => {
    if (calendarView === "date") {
      return generateDateView(field)
    } else if (calendarView === "month") {
      return generateMonthView()
    } else if (calendarView === "year") {
      return generateYearView()
    }
  }

  const generateDateView = (field) => {
    const year = calendarDate.getFullYear()
    const month = calendarDate.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDay = new Date(year, month, 1).getDay()

    const days = []
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="calendar-day-kh-addparent empty-kh-addparent"></div>)
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i)
      const isToday = new Date().getDate() === i && new Date().getMonth() === month && new Date().getFullYear() === year

      days.push(
        <div
          key={`day-${i}`}
          className={`calendar-day-kh-addparent ${isToday ? "today-kh-addparent" : ""}`}
          onClick={() => handleDateSelect(field, date)}
        >
          {i}
        </div>,
      )
    }

    return days
  }

  const generateMonthView = () => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    return (
      <div className="calendar-months-kh-addparent">
        {months.map((month, index) => (
          <div key={month} className="calendar-month-kh-addparent" onClick={() => handleMonthSelect(index)}>
            {month}
          </div>
        ))}
      </div>
    )
  }

  const generateYearView = () => {
    const currentYear = calendarDate.getFullYear()
    const startYear = currentYear - 6
    const years = []

    for (let i = 0; i < 12; i++) {
      const year = startYear + i
      years.push(
        <div key={year} className="calendar-year-kh-addparent" onClick={() => handleYearSelect(year)}>
          {year}
        </div>,
      )
    }

    return <div className="calendar-years-kh-addparent">{years}</div>
  }

  // Handle dropdown selection for Billing Frequency
  const handleBillingFrequencySelect = (option) => {
    if (!isEditMode) return // Prevent selection in view mode

    console.log("Selected billing frequency:", option)
    // Display the meaning to the user
    setSelectedBillingFrequency(option.meaning)
    // Store the lookup_code in the line state for database storage
    setLine({ ...line, billingFrequency: option.lookupCode })
    setShowBillingFrequencyDropdown(false)
  }

  // Handle dropdown selection for Billing Channel
  const handleBillingChannelSelect = (option) => {
    if (!isEditMode) return // Prevent selection in view mode

    setSelectedBillingChannel(option.meaning)
    // Don't set billingChannel in the line state since it doesn't exist in the database
    setShowBillingChannelDropdown(false)
  }

  const handleUOMSelect = (option) => {
    if (!isEditMode) return // Prevent selection in view mode

    setSelectedUOM(option.meaning)
    setLine({ ...line, uom: option.lookupCode })
    setShowUOMDropdown(false)
  }

  // Handle input changes for line state
  const handleChange = (field, value) => {
    if (!isEditMode) return // Prevent changes in view mode

    setLine({ ...line, [field]: value })

    // Update quantity and unitPrice state for calculation
    if (field === "orderedQuantity") {
      setQuantity(value)
    } else if (field === "unitPrice") {
      setUnitPrice(value)
    }
  }

  // Handle customer details dropdown selections
  const handleBillToCustomerSelect = (customer) => {
    if (!isEditMode) return // Prevent selection in view mode

    setSelectedCustomerName(customer.accountName)
    setLine({ ...line, billToCustomerId: customer.custAccountId })
    setShowBillToCustomerDropdown(false)

    // Reset site and contact selections when customer changes
    setSelectedSiteName("")
    setSelectedContactName("")
    setLine((prev) => ({
      ...prev,
      billToCustomerId: customer.custAccountId,
      billToSiteId: "",
      billToContactId: "",
    }))
  }

  const handleBillToSiteSelect = (site) => {
    if (!isEditMode) return // Prevent selection in view mode

    setSelectedSiteName(site.siteName || `Site ${site.custAcctSiteId}`)
    setLine({ ...line, billToSiteId: site.custAcctSiteId })
    setShowBillToSiteDropdown(false)
  }

  const handleBillToContactSelect = (contact) => {
    if (!isEditMode) return // Prevent selection in view mode

    setSelectedContactName(contact.roleType || `Contact ${contact.contactId}`)
    setLine({ ...line, billToContactId: contact.contactId })
    setShowBillToContactDropdown(false)
  }

  // Handle form submission for updating
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!isEditMode) return // Prevent submission in view mode

    try {
      // Validate line number is provided
      if (!line.lineNumber) {
        setToastMessage("Line number is required")
        setIsError(true)
        setShowToast(true)
        return
      }

      // Prepare the data for submission
      const lineData = {
        ...line,
        orderedQuantity: quantity ? Number.parseFloat(quantity) : null,
        unitPrice: unitPrice ? Number.parseFloat(unitPrice) : null,
        totalPrice: total ? Number.parseFloat(total) : null,
        billToCustomerId: line.billToCustomerId ? Number.parseInt(line.billToCustomerId) : null,
        billToSiteId: line.billToSiteId ? Number.parseInt(line.billToSiteId) : null,
        billToContactId: line.billToContactId ? Number.parseInt(line.billToContactId) : null,
      }

      console.log("Sending update data to server:", lineData)

      // *** BACKEND INTEGRATION PLACEHOLDER ***
      // Replace this with actual API call when backend is available
      // const response = await axios.put(`${API_URL}/lines/update/${line.lineId}`, lineData)

      // Simulating successful update for demonstration
      const mockResponse = {
        data: {
          status: "success",
          message: "Line updated successfully",
        },
      }

      // Use this for actual implementation:
      // if (response.data && response.data.status === "success") {
      if (mockResponse.data && mockResponse.data.status === "success") {
        console.log("Line updated successfully:", mockResponse.data)
        setToastMessage("Line updated successfully")
        setIsError(false)
        setShowToast(true)

        // Redirect back to search page after a short delay
        setTimeout(() => {
          if (onCancel) {
            onCancel()
          }
        }, 1000)
      } else {
        throw new Error(mockResponse.data.message || "Unknown error occurred")
      }
    } catch (error) {
      console.error("Error updating line:", error)
      setToastMessage(`Error updating line: ${error.message || "Unknown error"}`)
      setIsError(true)
      setShowToast(true)
    }
  }

  // Handle cancel button click
  const handleCancelClick = () => {
    if (onCancel) {
      onCancel()
    }
  }

  // Close date picker and dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target)) {
        setShowDatePicker(null)
      }
      if (billingFrequencyDropdownRef.current && !billingFrequencyDropdownRef.current.contains(event.target)) {
        setShowBillingFrequencyDropdown(false)
      }
      if (billingChannelDropdownRef.current && !billingChannelDropdownRef.current.contains(event.target)) {
        setShowBillingChannelDropdown(false)
      }
      if (uomDropdownRef.current && !uomDropdownRef.current.contains(event.target)) {
        setShowUOMDropdown(false)
      }
      if (billToCustomerRef.current && !billToCustomerRef.current.contains(event.target)) {
        setShowBillToCustomerDropdown(false)
      }
      if (billToSiteRef.current && !billToSiteRef.current.contains(event.target)) {
        setShowBillToSiteDropdown(false)
      }
      if (billToContactRef.current && !billToContactRef.current.contains(event.target)) {
        setShowBillToContactDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [
    datePickerRef,
    billingFrequencyDropdownRef,
    billingChannelDropdownRef,
    uomDropdownRef,
    billToCustomerRef,
    billToSiteRef,
    billToContactRef,
  ])

  if (isLoading) {
    return (
      <div className="bodyoflines">
        <div className="order-details-container-kh-addparent">
          <div className="order-header-kh-addparent">
            <h1>View Parent</h1>
          </div>
          <div className="loading-container" style={{ display: "flex", justifyContent: "center", padding: "50px" }}>
            Loading line data...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bodyoflines">
      <div className="order-details-container-kh-addparent">
        {/* Success Toast */}
        {showToast && (
          <div className="toast-container-kh-addparent">
            <div
              className={`toast-kh-addparent ${isError ? "error-toast-kh-addparent" : "success-toast-kh-addparent"}`}
            >
              <CheckCircle size={20} />
              <span>{toastMessage}</span>
            </div>
          </div>
        )}

        <div className="order-header-kh-addparent">
          <div className="header-title-with-icon" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <h1>{isEditMode ? "Edit Parent" : "View Parent"}</h1>
            {isEditMode ? <Edit size={18} /> : <Eye size={18} />}
          </div>
          <div className="order-actions-kh-addparent">
            {!isEditMode ? (
              <button className="edit-btn-kh-addparent" onClick={handleEditModeToggle}>
                <Edit size={16} />
                <span>Edit</span>
              </button>
            ) : (
              <>
                <button className="save-btn-kh-addparent" onClick={handleSubmit}>
                  <Save size={16} />
                  <span>Save</span>
                </button>
                <button className="cancel-edit-btn-kh-addparent" onClick={handleEditModeToggle}>
                  <X size={16} />
                  <span>Cancel Edit</span>
                </button>
              </>
            )}
            <button className="cancel-btn-kh-addparent" onClick={handleCancelClick}>
              <X size={16} />
              <span>Close</span>
            </button>
          </div>
        </div>

        <div className="order-tabs-kh-addparent">
          <div
            className={`tab-kh-addparent ${activeTab === "product-details" ? "active-kh-addparent" : ""}`}
            onClick={() => handleTabClick("product-details")}
          >
            Product Details
          </div>
          <div
            className={`tab-kh-addparent ${activeTab === "customer-details" ? "active-kh-addparent" : ""}`}
            onClick={() => handleTabClick("customer-details")}
          >
            Customer Details
          </div>
          <div
            className={`tab-kh-addparent ${activeTab === "billing" ? "active-kh-addparent" : ""}`}
            onClick={() => handleTabClick("billing")}
          >
            Billing
          </div>
        </div>

        {/* Product Details Tab */}
        {activeTab === "product-details" && (
          <div className="order-form-kh-addparent">
            <div className="form-section-kh-addparent">
              <div className="form-row-kh-addparent">
                <div className="form-field-container-kh-addparent">
                  <label>Service Name</label>
                  <div className="input-wrapper-kh-addparent">
                    <input
                      type="text"
                      placeholder="Enter service name"
                      value={line.serviceName}
                      onChange={(e) => handleChange("serviceName", e.target.value)}
                      disabled={!isEditMode}
                      style={{
                        backgroundColor: !isEditMode ? "#f5f5f5" : "white",
                        cursor: !isEditMode ? "not-allowed" : "text",
                      }}
                    />
                  </div>
                </div>

                <div className="form-field-container-kh-addparent">
                  <label>Line Number</label>
                  <div className="input-wrapper-kh-addparent">
                    <input
                      type="text"
                      placeholder="Enter line number"
                      value={line.lineNumber}
                      onChange={(e) => handleChange("lineNumber", e.target.value)}
                      disabled={!isEditMode}
                      style={{
                        backgroundColor: !isEditMode ? "#f5f5f5" : "white",
                        cursor: !isEditMode ? "not-allowed" : "text",
                      }}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-row-kh-addparent">
                <div className="form-field-container-kh-addparent">
                  <label>Start Date</label>
                  <div className="input-wrapper-kh-addparent date-input-wrapper-kh-addparent">
                    <input
                      type="text"
                      placeholder="Select date"
                      value={dates.startDate}
                      readOnly
                      onClick={() =>
                        isEditMode && setShowDatePicker(showDatePicker === "startDate" ? null : "startDate")
                      }
                      style={{
                        backgroundColor: !isEditMode ? "#f5f5f5" : "white",
                        cursor: !isEditMode ? "not-allowed" : "pointer",
                      }}
                    />
                    <button
                      className="calendar-btn-kh-addparent"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (isEditMode) {
                          setShowDatePicker(showDatePicker === "startDate" ? null : "startDate")
                        }
                      }}
                      disabled={!isEditMode}
                      style={{
                        opacity: !isEditMode ? 0.5 : 1,
                        cursor: !isEditMode ? "not-allowed" : "pointer",
                      }}
                    >
                      <Calendar size={14} />
                    </button>
                  </div>
                </div>

                <div className="form-field-container-kh-addparent">
                  <label>End Date</label>
                  <div className="input-wrapper-kh-addparent date-input-wrapper-kh-addparent">
                    <input
                      type="text"
                      placeholder="Select date"
                      value={dates.endDate}
                      readOnly
                      onClick={() => isEditMode && setShowDatePicker(showDatePicker === "endDate" ? null : "endDate")}
                      style={{
                        backgroundColor: !isEditMode ? "#f5f5f5" : "white",
                        cursor: !isEditMode ? "not-allowed" : "pointer",
                      }}
                    />
                    <button
                      className="calendar-btn-kh-addparent"
                      onClick={(e) => {
                        e.stopPropagation()
                        if (isEditMode) {
                          setShowDatePicker(showDatePicker === "endDate" ? null : "endDate")
                        }
                      }}
                      disabled={!isEditMode}
                      style={{
                        opacity: !isEditMode ? 0.5 : 1,
                        cursor: !isEditMode ? "not-allowed" : "pointer",
                      }}
                    >
                      <Calendar size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Customer Details Tab */}
        {activeTab === "customer-details" && (
          <div className="order-form-kh-addparent">
            <div className="form-section-kh-addparent">
              <div className="form-row-kh-addparent">
                <div className="form-field-container-kh-addparent">
                  <label>Customer Name</label>
                  <div className="custom-dropdown-wrapper-kh-addparent" ref={billToCustomerRef}>
                    <div
                      className="custom-dropdown-trigger-kh-addparent"
                      onClick={() => isEditMode && setShowBillToCustomerDropdown(!showBillToCustomerDropdown)}
                      style={{
                        backgroundColor: !isEditMode ? "#f5f5f5" : "white",
                        cursor: !isEditMode ? "not-allowed" : "pointer",
                        opacity: !isEditMode ? 0.7 : 1,
                      }}
                    >
                      <span>{selectedCustomerName || "Select Customer"}</span>
                      <ChevronDown size={16} style={{ opacity: !isEditMode ? 0.5 : 1 }} />
                    </div>

                    {showBillToCustomerDropdown && isEditMode && (
                      <div className="custom-dropdown-menu-kh-addparent">
                        <div className="custom-dropdown-content-kh-addparent">
                          {loadingCustomerData ? (
                            <div className="custom-dropdown-item-kh-addparent">Loading...</div>
                          ) : customers.length > 0 ? (
                            customers.map((customer, index) => (
                              <div
                                key={index}
                                className="custom-dropdown-item-kh-addparent"
                                onClick={() => handleBillToCustomerSelect(customer)}
                              >
                                {customer.accountName}
                              </div>
                            ))
                          ) : (
                            <div className="custom-dropdown-item-kh-addparent">No customers found</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-field-container-kh-addparent">
                  <label>Bill to Site</label>
                  <div className="custom-dropdown-wrapper-kh-addparent" ref={billToSiteRef}>
                    <div
                      className="custom-dropdown-trigger-kh-addparent"
                      onClick={() => isEditMode && setShowBillToSiteDropdown(!showBillToSiteDropdown)}
                      style={{
                        backgroundColor: !isEditMode ? "#f5f5f5" : "white",
                        cursor: !isEditMode ? "not-allowed" : "pointer",
                        opacity: !isEditMode ? 0.7 : 1,
                      }}
                    >
                      <span>{selectedSiteName || "Select Site"}</span>
                      <ChevronDown size={16} style={{ opacity: !isEditMode ? 0.5 : 1 }} />
                    </div>

                    {showBillToSiteDropdown && isEditMode && (
                      <div className="custom-dropdown-menu-kh-addparent">
                        <div className="custom-dropdown-content-kh-addparent">
                          {!line.billToCustomerId ? (
                            <div className="custom-dropdown-item-kh-addparent">Select a customer first</div>
                          ) : loadingCustomerData ? (
                            <div className="custom-dropdown-item-kh-addparent">Loading...</div>
                          ) : customerSites.length > 0 ? (
                            customerSites.map((site, index) => (
                              <div
                                key={index}
                                className="custom-dropdown-item-kh-addparent"
                                onClick={() => handleBillToSiteSelect(site)}
                              >
                                {site.siteName || `Site ${site.custAcctSiteId}`}
                              </div>
                            ))
                          ) : (
                            <div className="custom-dropdown-item-kh-addparent">No sites found</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-row-kh-addparent">
                <div className="form-field-container-kh-addparent">
                  <label>Bill to Contact</label>
                  <div className="custom-dropdown-wrapper-kh-addparent" ref={billToContactRef}>
                    <div
                      className="custom-dropdown-trigger-kh-addparent"
                      onClick={() => isEditMode && setShowBillToContactDropdown(!showBillToContactDropdown)}
                      style={{
                        backgroundColor: !isEditMode ? "#f5f5f5" : "white",
                        cursor: !isEditMode ? "not-allowed" : "pointer",
                        opacity: !isEditMode ? 0.7 : 1,
                      }}
                    >
                      <span>{selectedContactName || "Select Contact"}</span>
                      <ChevronDown size={16} style={{ opacity: !isEditMode ? 0.5 : 1 }} />
                    </div>

                    {showBillToContactDropdown && isEditMode && (
                      <div className="custom-dropdown-menu-kh-addparent">
                        <div className="custom-dropdown-content-kh-addparent">
                          {!line.billToCustomerId ? (
                            <div className="custom-dropdown-item-kh-addparent">Select a customer first</div>
                          ) : loadingCustomerData ? (
                            <div className="custom-dropdown-item-kh-addparent">Loading...</div>
                          ) : customerContacts.length > 0 ? (
                            customerContacts.map((contact, index) => (
                              <div
                                key={index}
                                className="custom-dropdown-item-kh-addparent"
                                onClick={() => handleBillToContactSelect(contact)}
                              >
                                {contact.roleType || `Contact ${contact.contactId}`}
                              </div>
                            ))
                          ) : (
                            <div className="custom-dropdown-item-kh-addparent">No contacts found</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Billing Tab */}
        {activeTab === "billing" && (
          <div className="order-form-kh-addparent">
            <div className="form-section-kh-addparent">
              <div className="form-row-kh-addparent">
                <div className="form-field-container-kh-addparent">
                  <label>Quantity</label>
                  <div className="input-wrapper-kh-addparent">
                    <input
                      type="number"
                      placeholder="Enter quantity"
                      value={quantity}
                      onChange={(e) => handleChange("orderedQuantity", e.target.value)}
                      disabled={!isEditMode}
                      style={{
                        backgroundColor: !isEditMode ? "#f5f5f5" : "white",
                        cursor: !isEditMode ? "not-allowed" : "text",
                      }}
                    />
                  </div>
                </div>

                <div className="form-field-container-kh-addparent">
                  <label>Unit Price</label>
                  <div className="input-wrapper-kh-addparent">
                    <input
                      type="number"
                      placeholder="Enter unit price"
                      value={unitPrice}
                      onChange={(e) => handleChange("unitPrice", e.target.value)}
                      disabled={!isEditMode}
                      style={{
                        backgroundColor: !isEditMode ? "#f5f5f5" : "white",
                        cursor: !isEditMode ? "not-allowed" : "text",
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="form-row-kh-addparent">
                <div className="form-field-container-kh-addparent">
                  <label>UOM</label>
                  <div className="custom-dropdown-wrapper-kh-addparent" ref={uomDropdownRef}>
                    <div
                      className="custom-dropdown-trigger-kh-addparent"
                      onClick={() => isEditMode && setShowUOMDropdown(!showUOMDropdown)}
                      style={{
                        backgroundColor: !isEditMode ? "#f5f5f5" : "white",
                        cursor: !isEditMode ? "not-allowed" : "pointer",
                        opacity: !isEditMode ? 0.7 : 1,
                      }}
                    >
                      <span>{selectedUOM || "Select UOM"}</span>
                      <ChevronDown size={16} style={{ opacity: !isEditMode ? 0.5 : 1 }} />
                    </div>

                    {showUOMDropdown && isEditMode && (
                      <div className="custom-dropdown-menu-kh-addparent">
                        <div className="custom-dropdown-content-kh-addparent">
                          {loadingLookupValues ? (
                            <div className="custom-dropdown-item-kh-addparent">Loading...</div>
                          ) : (
                            lookupValues.uomList &&
                            lookupValues.uomList.map((option, index) => (
                              <div
                                key={index}
                                className="custom-dropdown-item-kh-addparent"
                                onClick={() => handleUOMSelect(option)}
                              >
                                {option.meaning}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-field-container-kh-addparent">
                  <label>Total</label>
                  <div className="input-wrapper-kh-addparent">
                    <input
                      type="text"
                      placeholder="Calculated total"
                      value={total}
                      readOnly
                      style={{
                        backgroundColor: "#f5f5f5",
                        cursor: "not-allowed",
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="form-row-kh-addparent">
                <div className="form-field-container-kh-addparent">
                  <label>Billing Frequency</label>
                  <div className="custom-dropdown-wrapper-kh-addparent" ref={billingFrequencyDropdownRef}>
                    <div
                      className="custom-dropdown-trigger-kh-addparent"
                      onClick={() => isEditMode && setShowBillingFrequencyDropdown(!showBillingFrequencyDropdown)}
                      style={{
                        backgroundColor: !isEditMode ? "#f5f5f5" : "white",
                        cursor: !isEditMode ? "not-allowed" : "pointer",
                        opacity: !isEditMode ? 0.7 : 1,
                      }}
                    >
                      <span>{selectedBillingFrequency || "Select Billing Frequency"}</span>
                      <ChevronDown size={16} style={{ opacity: !isEditMode ? 0.5 : 1 }} />
                    </div>

                    {showBillingFrequencyDropdown && isEditMode && (
                      <div className="custom-dropdown-menu-kh-addparent">
                        <div className="custom-dropdown-content-kh-addparent">
                          {loadingLookupValues ? (
                            <div className="custom-dropdown-item-kh-addparent">Loading...</div>
                          ) : (
                            lookupValues.billingFrequencies &&
                            lookupValues.billingFrequencies.map((option, index) => (
                              <div
                                key={index}
                                className="custom-dropdown-item-kh-addparent"
                                onClick={() => handleBillingFrequencySelect(option)}
                              >
                                {option.meaning}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-field-container-kh-addparent">
                  <label>Billing Channel</label>
                  <div className="custom-dropdown-wrapper-kh-addparent" ref={billingChannelDropdownRef}>
                    <div
                      className="custom-dropdown-trigger-kh-addparent"
                      onClick={() => isEditMode && setShowBillingChannelDropdown(!showBillingChannelDropdown)}
                      style={{
                        backgroundColor: !isEditMode ? "#f5f5f5" : "white",
                        cursor: !isEditMode ? "not-allowed" : "pointer",
                        opacity: !isEditMode ? 0.7 : 1,
                      }}
                    >
                      <span>{selectedBillingChannel || "Select Billing Channel"}</span>
                      <ChevronDown size={16} style={{ opacity: !isEditMode ? 0.5 : 1 }} />
                    </div>

                    {showBillingChannelDropdown && isEditMode && (
                      <div className="custom-dropdown-menu-kh-addparent">
                        <div className="custom-dropdown-content-kh-addparent">
                          {loadingLookupValues ? (
                            <div className="custom-dropdown-item-kh-addparent">Loading...</div>
                          ) : (
                            lookupValues.billingChannels &&
                            lookupValues.billingChannels.map((option, index) => (
                              <div
                                key={index}
                                className="custom-dropdown-item-kh-addparent"
                                onClick={() => handleBillingChannelSelect(option)}
                              >
                                {option.meaning}
                              </div>
                            ))
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Enhanced Date Picker Popup */}
        {showDatePicker && isEditMode && (
          <div className="date-picker-overlay-kh-addparent">
            <div className="date-picker-modal-kh-addparent" ref={datePickerRef}>
              <div className="calendar-header-kh-addparent">
                {calendarView === "date" && (
                  <>
                    <button className="calendar-nav-btn-kh-addparent" onClick={handlePrevMonth}>
                      <ChevronLeft size={16} />
                    </button>
                    <span onClick={handleMonthClick}>{calendarDate.toLocaleString("default", { month: "long" })}</span>
                    <span onClick={handleYearClick}>{calendarDate.getFullYear()}</span>
                    <button className="calendar-nav-btn-kh-addparent" onClick={handleNextMonth}>
                      <ChevronRight size={16} />
                    </button>
                  </>
                )}

                {calendarView === "month" && (
                  <>
                    <button className="calendar-nav-btn-kh-addparent" onClick={handlePrevYear}>
                      <ChevronLeft size={16} />
                    </button>
                    <span onClick={handleYearClick}>{calendarDate.getFullYear()}</span>
                    <button className="calendar-nav-btn-kh-addparent" onClick={handleNextYear}>
                      <ChevronRight size={16} />
                    </button>
                  </>
                )}

                {calendarView === "year" && (
                  <>
                    <button
                      className="calendar-nav-btn-kh-addparent"
                      onClick={() => {
                        setCalendarDate(new Date(calendarDate.getFullYear() - 12, calendarDate.getMonth(), 1))
                      }}
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span>
                      {calendarDate.getFullYear() - 6} - {calendarDate.getFullYear() + 5}
                    </span>
                    <button
                      className="calendar-nav-btn-kh-addparent"
                      onClick={() => {
                        setCalendarDate(new Date(calendarDate.getFullYear() + 12, calendarDate.getMonth(), 1))
                      }}
                    >
                      <ChevronRight size={16} />
                    </button>
                  </>
                )}
              </div>

              {calendarView === "date" && (
                <div className="calendar-days-kh-addparent">
                  <div className="weekday-kh-addparent">Su</div>
                  <div className="weekday-kh-addparent">Mo</div>
                  <div className="weekday-kh-addparent">Tu</div>
                  <div className="weekday-kh-addparent">We</div>
                  <div className="weekday-kh-addparent">Th</div>
                  <div className="weekday-kh-addparent">Fr</div>
                  <div className="weekday-kh-addparent">Sa</div>
                  {generateCalendar(showDatePicker)}
                </div>
              )}

              {(calendarView === "month" || calendarView === "year") && (
                <div className="calendar-grid-kh-addparent">{generateCalendar(showDatePicker)}</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default EditLinesAddParent;
