"use client"

import { useState, useRef, useEffect } from "react"
import { Calendar, Save, X, ChevronDown, ChevronLeft, ChevronRight, CheckCircle } from "lucide-react"
import "../Mech Lines Design/linesaddchild.css"
import axios from "axios"

const LinesAddChild = ({ onCancel, parentLine }) => {
  console.log("LinesAddChild component rendering with parentLine:", parentLine)

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
  const [toastMessage, setToastMessage] = useState("Child line created successfully")
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

  // Blinking effect state
  const [isBlinking, setIsBlinking] = useState(true)

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

  // Initial line state
  const [line, setLine] = useState({
    orderId: parentLine ? parentLine.orderId : null,
    lineNumber: "",
    serviceName: "",
    effectiveStartDate: null,
    effectiveEndDate: null,
    isParent: false, // This is a child line
    parentLineId: parentLine ? parentLine.lineId : null,
    parentLineNumber: parentLine ? parentLine.lineNumber : null,
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

  // Create blinking effect for parent line number field
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking((prev) => !prev)
    }, 500) // Toggle every 500ms

    return () => clearInterval(blinkInterval)
  }, [])

  // Log parentLine when it changes
  useEffect(() => {
    console.log("Selected parent line:", parentLine)
    if (parentLine) {
      // Make sure we're setting the parentLineNumber in state
      setLine((prev) => ({
        ...prev,
        parentLineId: parentLine.lineId,
        parentLineNumber: parentLine.lineNumber,
        orderId: parentLine.orderId || prev.orderId,
      }))
    }
  }, [parentLine])

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
        }
      } catch (error) {
        console.error("Error fetching customer accounts:", error)
      } finally {
        setLoadingCustomerData(false)
      }
    }

    fetchCustomers()
  }, [])

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
        }
      } catch (error) {
        console.error("Error fetching customer sites:", error)
      } finally {
        setLoadingCustomerData(false)
      }
    }

    fetchCustomerSites()
  }, [line.billToCustomerId])

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
        }
      } catch (error) {
        console.error("Error fetching customer contacts:", error)
      } finally {
        setLoadingCustomerData(false)
      }
    }

    fetchCustomerContacts()
  }, [line.billToCustomerId])

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

  // Add a function to fetch the current order ID when the component mounts
  useEffect(() => {
    // If we already have an order ID from the parent line, use that
    if (parentLine && parentLine.orderId) {
      setLine((prev) => ({ ...prev, orderId: parentLine.orderId }))
      return
    }

    // Try to get the orderId from URL parameters or context if available
    const urlParams = new URLSearchParams(window.location.search)
    const orderIdFromUrl = urlParams.get("orderId")

    if (orderIdFromUrl) {
      setLine((prev) => ({ ...prev, orderId: Number.parseInt(orderIdFromUrl) }))
    } else {
      // If no orderId is provided, fetch the latest order ID from the backend
      const fetchLatestOrderId = async () => {
        try {
          const response = await axios.get(`${API_URL}/V2.0/orders`)
          if (response.data && response.data.length > 0) {
            // Sort orders by ID to get the latest one
            const orders = [...response.data].sort((a, b) => b.orderId - a.orderId)
            const latestOrderId = orders[0].orderId
            setLine((prev) => ({ ...prev, orderId: latestOrderId }))
          }
        } catch (error) {
          console.error("Error fetching latest order ID:", error)
          // If we can't fetch the latest order ID, use a default value
          setLine((prev) => ({ ...prev, orderId: 1 }))
        }
      }

      fetchLatestOrderId()
    }
  }, [parentLine])

  const handleTabClick = (tab) => {
    setActiveTab(tab)
  }

  const handleDateSelect = (field, date) => {
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
      days.push(<div key={`empty-${i}`} className="calendar-day-kh-addchild empty-kh-addchild"></div>)
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i)
      const isToday = new Date().getDate() === i && new Date().getMonth() === month && new Date().getFullYear() === year

      days.push(
        <div
          key={`day-${i}`}
          className={`calendar-day-kh-addchild ${isToday ? "today-kh-addchild" : ""}`}
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
      <div className="calendar-months-kh-addchild">
        {months.map((month, index) => (
          <div key={month} className="calendar-month-kh-addchild" onClick={() => handleMonthSelect(index)}>
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
        <div key={year} className="calendar-year-kh-addchild" onClick={() => handleYearSelect(year)}>
          {year}
        </div>,
      )
    }

    return <div className="calendar-years-kh-addchild">{years}</div>
  }

  // Handle dropdown selection for Billing Frequency
  const handleBillingFrequencySelect = (option) => {
    console.log("Selected billing frequency:", option)
    // Display the meaning to the user
    setSelectedBillingFrequency(option.meaning)
    // Store the lookup_code in the line state for database storage
    setLine({ ...line, billingFrequency: option.lookupCode })
    setShowBillingFrequencyDropdown(false)
  }

  // Handle dropdown selection for Billing Channel
  const handleBillingChannelSelect = (option) => {
    setSelectedBillingChannel(option.meaning)
    // Don't set billingChannel in the line state since it doesn't exist in the database
    setShowBillingChannelDropdown(false)
  }

  // Handle UOM selection
  const [showUOMDropdown, setShowUOMDropdown] = useState(false)
  const uomDropdownRef = useRef(null)
  const [selectedUOM, setSelectedUOM] = useState("")

  const handleUOMSelect = (option) => {
    setSelectedUOM(option.meaning)
    setLine({ ...line, uom: option.lookupCode })
    setShowUOMDropdown(false)
  }

  // Handle input changes for line state
  const handleChange = (field, value) => {
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
    setSelectedSiteName(site.siteName || `Site ${site.custAcctSiteId}`)
    setLine({ ...line, billToSiteId: site.custAcctSiteId })
    setShowBillToSiteDropdown(false)
  }

  const handleBillToContactSelect = (contact) => {
    setSelectedContactName(contact.roleType || `Contact ${contact.contactId}`)
    setLine({ ...line, billToContactId: contact.contactId })
    setShowBillToContactDropdown(false)
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      // Validate line number is provided
      if (!line.lineNumber) {
        setToastMessage("Line number is required")
        setIsError(true)
        setShowToast(true)
        return
      }

      // Validate parent line is selected
      if (!line.parentLineId) {
        setToastMessage("Parent line is required")
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

      console.log("Sending data to server:", lineData)

      // Send the data to the backend
      const response = await axios.post(`${API_URL}/lines/createChildLine`, lineData)

      if (response.data && response.data.status === "success") {
        console.log("Child line created successfully:", response.data)
        setToastMessage("Child line created successfully")
        setIsError(false)
        setShowToast(true)

        // Notify the parent component that data has changed
        if (onCancel) {
          // We'll use setTimeout to ensure the toast is visible before navigating back
          setTimeout(() => onCancel(), 2000)
        }
      } else {
        throw new Error(response.data.message || "Unknown error occurred")
      }
    } catch (error) {
      console.error("Error creating child line:", error)
      setToastMessage(`Error creating child line: ${error.message || "Unknown error"}`)
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

  return (
    <div className="bodyoflines">
      <div className="order-details-container-kh-addchild">
        {/* Success Toast */}
        {showToast && (
          <div className="toast-container-kh-addchild">
            <div className={`toast-kh-addchild ${isError ? "error-toast-kh-addchild" : "success-toast-kh-addchild"}`}>
              <CheckCircle size={20} />
              <span>{toastMessage}</span>
            </div>
          </div>
        )}

        <div className="order-header-kh-addchild">
          <h1>Add Child</h1>
          <div className="order-actions-kh-addchild">
            <button className="save-btn-kh-addchild" onClick={handleSubmit}>
              <Save size={16} />
              <span>Save</span>
            </button>
            <button className="cancel-btn-kh-addchild" onClick={handleCancelClick}>
              <X size={16} />
              <span>Cancel</span>
            </button>
          </div>
        </div>

        <div className="order-tabs-kh-addchild">
          <div
            className={`tab-kh-addchild ${activeTab === "product-details" ? "active-kh-addchild" : ""}`}
            onClick={() => handleTabClick("product-details")}
          >
            Product Details
          </div>
          <div
            className={`tab-kh-addchild ${activeTab === "customer-details" ? "active-kh-addchild" : ""}`}
            onClick={() => handleTabClick("customer-details")}
          >
            Customer Details
          </div>
          <div
            className={`tab-kh-addchild ${activeTab === "billing" ? "active-kh-addchild" : ""}`}
            onClick={() => handleTabClick("billing")}
          >
            Billing
          </div>
        </div>

        {/* Product Details Tab */}
        {activeTab === "product-details" && (
          <div className="order-form-kh-addchild">
            <div className="form-section-kh-addchild">
              <div className="form-row-kh-addchild">
                <div className="form-field-container-kh-addchild">
                  <label>Parent Line Number</label>
                  <div className="input-wrapper-kh-addchild">
                    <input
                      type="text"
                      value={parentLine ? parentLine.lineNumber : ""}
                      readOnly
                      style={{
                        color: isBlinking ? "navy" : "transparent",
                        fontWeight: "600",
                        backgroundColor: "#f8fafc",
                        transition: "color 0.1s ease-in-out",
                      }}
                      className="parent-line-input"
                    />
                  </div>
                </div>

                <div className="form-field-container-kh-addchild">
                  <label>Child Line Number</label>
                  <div className="input-wrapper-kh-addchild">
                    <input
                      type="text"
                      placeholder="Enter line number"
                      value={line.lineNumber}
                      onChange={(e) => handleChange("lineNumber", e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="form-row-kh-addchild">
                <div className="form-field-container-kh-addchild">
                  <label>Service Name</label>
                  <div className="input-wrapper-kh-addchild">
                    <input
                      type="text"
                      placeholder="Enter service name"
                      value={line.serviceName}
                      onChange={(e) => handleChange("serviceName", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="form-row-kh-addchild">
                <div className="form-field-container-kh-addchild">
                  <label>Start Date</label>
                  <div className="input-wrapper-kh-addchild date-input-wrapper-kh-addchild">
                    <input
                      type="text"
                      placeholder="Select date"
                      value={dates.startDate}
                      readOnly
                      onClick={() => setShowDatePicker(showDatePicker === "startDate" ? null : "startDate")}
                    />
                    <button
                      className="calendar-btn-kh-addchild"
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowDatePicker(showDatePicker === "startDate" ? null : "startDate")
                      }}
                    >
                      <Calendar size={14} />
                    </button>
                  </div>
                </div>

                <div className="form-field-container-kh-addchild">
                  <label>End Date</label>
                  <div className="input-wrapper-kh-addchild date-input-wrapper-kh-addchild">
                    <input
                      type="text"
                      placeholder="Select date"
                      value={dates.endDate}
                      readOnly
                      onClick={() => setShowDatePicker(showDatePicker === "endDate" ? null : "endDate")}
                    />
                    <button
                      className="calendar-btn-kh-addchild"
                      onClick={(e) => {
                        e.stopPropagation()
                        setShowDatePicker(showDatePicker === "endDate" ? null : "endDate")
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
          <div className="order-form-kh-addchild">
            <div className="form-section-kh-addchild">
              <div className="form-row-kh-addchild">
                <div className="form-field-container-kh-addchild">
                  <label>Customer Name</label>
                  <div className="custom-dropdown-wrapper-kh-addchild" ref={billToCustomerRef}>
                    <div
                      className="custom-dropdown-trigger-kh-addchild"
                      onClick={() => setShowBillToCustomerDropdown(!showBillToCustomerDropdown)}
                    >
                      <span>{selectedCustomerName || "Select Customer"}</span>
                      <ChevronDown size={16} />
                    </div>

                    {showBillToCustomerDropdown && (
                      <div className="custom-dropdown-menu-kh-addchild">
                        <div className="custom-dropdown-content-kh-addchild">
                          {loadingCustomerData ? (
                            <div className="custom-dropdown-item-kh-addchild">Loading...</div>
                          ) : customers.length > 0 ? (
                            customers.map((customer, index) => (
                              <div
                                key={index}
                                className="custom-dropdown-item-kh-addchild"
                                onClick={() => handleBillToCustomerSelect(customer)}
                              >
                                {customer.accountName}
                              </div>
                            ))
                          ) : (
                            <div className="custom-dropdown-item-kh-addchild">No customers found</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-field-container-kh-addchild">
                  <label>Bill to Site</label>
                  <div className="custom-dropdown-wrapper-kh-addchild" ref={billToSiteRef}>
                    <div
                      className="custom-dropdown-trigger-kh-addchild"
                      onClick={() => setShowBillToSiteDropdown(!showBillToSiteDropdown)}
                    >
                      <span>{selectedSiteName || "Select Site"}</span>
                      <ChevronDown size={16} />
                    </div>

                    {showBillToSiteDropdown && (
                      <div className="custom-dropdown-menu-kh-addchild">
                        <div className="custom-dropdown-content-kh-addchild">
                          {!line.billToCustomerId ? (
                            <div className="custom-dropdown-item-kh-addchild">Select a customer first</div>
                          ) : loadingCustomerData ? (
                            <div className="custom-dropdown-item-kh-addchild">Loading...</div>
                          ) : customerSites.length > 0 ? (
                            customerSites.map((site, index) => (
                              <div
                                key={index}
                                className="custom-dropdown-item-kh-addchild"
                                onClick={() => handleBillToSiteSelect(site)}
                              >
                                {site.siteName || `Site ${site.custAcctSiteId}`}
                              </div>
                            ))
                          ) : (
                            <div className="custom-dropdown-item-kh-addchild">No sites found</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="form-row-kh-addchild">
                <div className="form-field-container-kh-addchild">
                  <label>Bill to Contact</label>
                  <div className="custom-dropdown-wrapper-kh-addchild" ref={billToContactRef}>
                    <div
                      className="custom-dropdown-trigger-kh-addchild"
                      onClick={() => setShowBillToContactDropdown(!showBillToContactDropdown)}
                    >
                      <span>{selectedContactName || "Select Contact"}</span>
                      <ChevronDown size={16} />
                    </div>

                    {showBillToContactDropdown && (
                      <div className="custom-dropdown-menu-kh-addchild">
                        <div className="custom-dropdown-content-kh-addchild">
                          {!line.billToCustomerId ? (
                            <div className="custom-dropdown-item-kh-addchild">Select a customer first</div>
                          ) : loadingCustomerData ? (
                            <div className="custom-dropdown-item-kh-addchild">Loading...</div>
                          ) : customerContacts.length > 0 ? (
                            customerContacts.map((contact, index) => (
                              <div
                                key={index}
                                className="custom-dropdown-item-kh-addchild"
                                onClick={() => handleBillToContactSelect(contact)}
                              >
                                {contact.roleType || `Contact ${contact.contactId}`}
                              </div>
                            ))
                          ) : (
                            <div className="custom-dropdown-item-kh-addchild">No contacts found</div>
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
          <div className="order-form-kh-addchild">
            <div className="form-section-kh-addchild">
              <div className="form-row-kh-addchild">
                <div className="form-field-container-kh-addchild">
                  <label>Quantity</label>
                  <div className="input-wrapper-kh-addchild">
                    <input
                      type="number"
                      placeholder="Enter quantity"
                      value={quantity}
                      onChange={(e) => handleChange("orderedQuantity", e.target.value)}
                    />
                  </div>
                </div>

                <div className="form-field-container-kh-addchild">
                  <label>Unit Price</label>
                  <div className="input-wrapper-kh-addchild">
                    <input
                      type="number"
                      placeholder="Enter unit price"
                      value={unitPrice}
                      onChange={(e) => handleChange("unitPrice", e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="form-row-kh-addchild">
                <div className="form-field-container-kh-addchild">
                  <label>UOM</label>
                  <div className="custom-dropdown-wrapper-kh-addchild" ref={uomDropdownRef}>
                    <div
                      className="custom-dropdown-trigger-kh-addchild"
                      onClick={() => setShowUOMDropdown(!showUOMDropdown)}
                    >
                      <span>{selectedUOM || "Select UOM"}</span>
                      <ChevronDown size={16} />
                    </div>

                    {showUOMDropdown && (
                      <div className="custom-dropdown-menu-kh-addchild">
                        <div className="custom-dropdown-content-kh-addchild">
                          {loadingLookupValues ? (
                            <div className="custom-dropdown-item-kh-addchild">Loading...</div>
                          ) : (
                            lookupValues.uomList &&
                            lookupValues.uomList.map((option, index) => (
                              <div
                                key={index}
                                className="custom-dropdown-item-kh-addchild"
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

                <div className="form-field-container-kh-addchild">
                  <label>Total</label>
                  <div className="input-wrapper-kh-addchild">
                    <input type="text" placeholder="Calculated total" value={total} readOnly />
                  </div>
                </div>
              </div>

              <div className="form-row-kh-addchild">
                <div className="form-field-container-kh-addchild">
                  <label>Billing Frequency</label>
                  <div className="custom-dropdown-wrapper-kh-addchild" ref={billingFrequencyDropdownRef}>
                    <div
                      className="custom-dropdown-trigger-kh-addchild"
                      onClick={() => setShowBillingFrequencyDropdown(!showBillingFrequencyDropdown)}
                    >
                      <span>{selectedBillingFrequency || "Select Billing Frequency"}</span>
                      <ChevronDown size={16} />
                    </div>

                    {showBillingFrequencyDropdown && (
                      <div className="custom-dropdown-menu-kh-addchild">
                        <div className="custom-dropdown-content-kh-addchild">
                          {loadingLookupValues ? (
                            <div className="custom-dropdown-item-kh-addchild">Loading...</div>
                          ) : (
                            lookupValues.billingFrequencies &&
                            lookupValues.billingFrequencies.map((option, index) => (
                              <div
                                key={index}
                                className="custom-dropdown-item-kh-addchild"
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

                <div className="form-field-container-kh-addchild">
                  <label>Billing Channel</label>
                  <div className="custom-dropdown-wrapper-kh-addchild" ref={billingChannelDropdownRef}>
                    <div
                      className="custom-dropdown-trigger-kh-addchild"
                      onClick={() => setShowBillingChannelDropdown(!showBillingChannelDropdown)}
                    >
                      <span>{selectedBillingChannel || "Select Billing Channel"}</span>
                      <ChevronDown size={16} />
                    </div>

                    {showBillingChannelDropdown && (
                      <div className="custom-dropdown-menu-kh-addchild">
                        <div className="custom-dropdown-content-kh-addchild">
                          {loadingLookupValues ? (
                            <div className="custom-dropdown-item-kh-addchild">Loading...</div>
                          ) : (
                            lookupValues.billingChannels &&
                            lookupValues.billingChannels.map((option, index) => (
                              <div
                                key={index}
                                className="custom-dropdown-item-kh-addchild"
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
        {showDatePicker && (
          <div className="date-picker-overlay-kh-addchild">
            <div className="date-picker-modal-kh-addchild" ref={datePickerRef}>
              <div className="calendar-header-kh-addchild">
                {calendarView === "date" && (
                  <>
                    <button className="calendar-nav-btn-kh-addchild" onClick={handlePrevMonth}>
                      <ChevronLeft size={16} />
                    </button>
                    <span onClick={handleMonthClick}>{calendarDate.toLocaleString("default", { month: "long" })}</span>
                    <span onClick={handleYearClick}>{calendarDate.getFullYear()}</span>
                    <button className="calendar-nav-btn-kh-addchild" onClick={handleNextMonth}>
                      <ChevronRight size={16} />
                    </button>
                  </>
                )}

                {calendarView === "month" && (
                  <>
                    <button className="calendar-nav-btn-kh-addchild" onClick={handlePrevYear}>
                      <ChevronLeft size={16} />
                    </button>
                    <span onClick={handleYearClick}>{calendarDate.getFullYear()}</span>
                    <button className="calendar-nav-btn-kh-addchild" onClick={handleNextYear}>
                      <ChevronRight size={16} />
                    </button>
                  </>
                )}

                {calendarView === "year" && (
                  <>
                    <button
                      className="calendar-nav-btn-kh-addchild"
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
                      className="calendar-nav-btn-kh-addchild"
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
                <div className="calendar-days-kh-addchild">
                  <div className="weekday-kh-addchild">Su</div>
                  <div className="weekday-kh-addchild">Mo</div>
                  <div className="weekday-kh-addchild">Tu</div>
                  <div className="weekday-kh-addchild">We</div>
                  <div className="weekday-kh-addchild">Th</div>
                  <div className="weekday-kh-addchild">Fr</div>
                  <div className="weekday-kh-addchild">Sa</div>
                  {generateCalendar(showDatePicker)}
                </div>
              )}

              {(calendarView === "month" || calendarView === "year") && (
                <div className="calendar-grid-kh-addchild">{generateCalendar(showDatePicker)}</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LinesAddChild;
