import { useState, useRef, useEffect } from "react"
import { Calendar, Save, X, ChevronDown, ChevronLeft, ChevronRight, CheckCircle } from 'lucide-react'
import "../Design Component/OrderDetails.css"
 
import axios from "axios"

const OrderDetails = ({ onCancel }) => {
  const [activeTab, setActiveTab] = useState("order-details")
  const [showDatePicker, setShowDatePicker] = useState(null)
  const [dates, setDates] = useState({
    startDate: "",
    endDate: "",
  })
  const [ldApplicable, setLdApplicable] = useState(false)
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState("")
  const datePickerRef = useRef(null)
  const categoryDropdownRef = useRef(null)

  // Toast notification state
  const [showToast, setShowToast] = useState(false)

  // Calendar state
  const [calendarDate, setCalendarDate] = useState(new Date())
  const [calendarView, setCalendarView] = useState("date") // "date", "month", "year"

  // Lookup values state
  const [lookupValues, setLookupValues] = useState({
    orderTypes: [],
    orderCategories: [],
    billingFrequencies: [],
    billingCycles: [],
  })
  const [loadingLookupValues, setLoadingLookupValues] = useState(true)

  // Customer details dropdown states
  const [showBillToCustomerDropdown, setShowBillToCustomerDropdown] = useState(false)
  const [showBillToSiteDropdown, setShowBillToSiteDropdown] = useState(false)
  const [showBillToContactDropdown, setShowBillToContactDropdown] = useState(false)
  const billToCustomerRef = useRef(null)
  const billToSiteRef = useRef(null)
  const billToContactRef = useRef(null)

  // API base URL
  const API_URL = "http://195.35.45.56:5522/api/V2.0"
  
  // Customer data states
  const [customers, setCustomers] = useState([])
  const [customerSites, setCustomerSites] = useState([])
  const [customerContacts, setCustomerContacts] = useState([])
  const [selectedCustomerName, setSelectedCustomerName] = useState("")
  const [selectedSiteName, setSelectedSiteName] = useState("")
  const [selectedContactName, setSelectedContactName] = useState("")
  const [loadingCustomerData, setLoadingCustomerData] = useState(false)
 
  // Initial order state for form reset
  const initialOrderState = {
    orderId: "",
    orderNumber: "",
    orderType: "",
    orderCategory: "",
    effectiveStartDate: null,
    effectiveEndDate: null,
    ldApplicable: "N", // Default to "N"
    billToCustomerId: "",
    billToSiteId: "",
    billToContactId: "",
    salesrep: "",
    billingFrequency: "",
    billingCycle: "",
    attribute1V: "",
    attribute2V: "",
    attribute3V: "",
    attribute4V: "",
    attribute5V: "",
    attribute1N: "",
    attribute2N: "",
    attribute3N: "",
    attribute4N: "",
    attribute5N: "",
    // Required fields for the backend
    orderVersion: 1,
    status: "Draft",
    version: 1,
    source: 1,
  }

  // Add order state for backend submission
  const [order, setOrder] = useState({ ...initialOrderState })

  // Auto-hide toast after 2 seconds
  useEffect(() => {
    let toastTimer
    if (showToast) {
      toastTimer = setTimeout(() => {
        setShowToast(false)
      }, 2000)
    }
    return () => {
      clearTimeout(toastTimer)
    }
  }, [showToast])

  // Fetch lookup values from the backend
  useEffect(() => {
    const fetchLookupValues = async () => {
      try {
        setLoadingLookupValues(true)
        const response = await axios.get(`${API_URL}/order-lookup-values`)

        if (response.data) {
          setLookupValues(response.data)
        }
      } catch (error) {
        console.error("Error fetching lookup values:", error)
      } finally {
        setLoadingLookupValues(false)
      }
    }

    fetchLookupValues()
  }, [])

  // Fetch customer accounts data
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setLoadingCustomerData(true)
        const response = await axios.get(`${API_URL}/getallcustomeraccount/details`)
        
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
      if (!order.billToCustomerId) return
      
      try {
        setLoadingCustomerData(true)
        const response = await axios.get(`${API_URL}/getallaccountsitesall/details`, {
          params: { customerId: order.billToCustomerId }
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
  }, [order.billToCustomerId])

  // Fetch customer contacts when a customer is selected
  useEffect(() => {
    const fetchCustomerContacts = async () => {
      if (!order.billToCustomerId) return
      
      try {
        setLoadingCustomerData(true)
        const response = await axios.get(`${API_URL}/getallcustomercontacts/details`, {
          params: { customerId: order.billToCustomerId }
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
  }, [order.billToCustomerId])

  const handleTabClick = (tab) => {
    setActiveTab(tab)
  }

  const handleDateSelect = (field, date) => {
    const formattedDate = formatDate(date)
    setDates({ ...dates, [field]: formattedDate })

    // Update the order state with ISO date format for backend
    const isoDate = date.toISOString().split("T")[0]
    if (field === "startDate") {
      setOrder({ ...order, effectiveStartDate: isoDate })
    } else if (field === "endDate") {
      setOrder({ ...order, effectiveEndDate: isoDate })
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

  // Reset form to initial state
  const resetForm = () => {
    setOrder({ ...initialOrderState })
    setDates({ startDate: "", endDate: "" })
    setLdApplicable(false)
    setSelectedCategory("")
    setSelectedOrderType("")
    setSelectedBillingFrequency("")
    setSelectedBillingCycle("")
    setSelectedCustomerName("")
    setSelectedSiteName("")
    setSelectedContactName("")
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
      days.push(<div key={`empty-${i}`} className="calendar-day empty"></div>)
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i)
      const isToday = new Date().getDate() === i && new Date().getMonth() === month && new Date().getFullYear() === year

      days.push(
        <div
          key={`day-${i}`}
          className={`calendar-day ${isToday ? "today" : ""}`}
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
      <div className="calendar-months">
        {months.map((month, index) => (
          <div key={month} className="calendar-month" onClick={() => handleMonthSelect(index)}>
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
        <div key={year} className="calendar-year" onClick={() => handleYearSelect(year)}>
          {year}
        </div>,
      )
    }

    return <div className="calendar-years">{years}</div>
  }

  // Handle dropdown selection for Order Type
  const [showOrderTypeDropdown, setShowOrderTypeDropdown] = useState(false)
  const orderTypeDropdownRef = useRef(null)
  const [selectedOrderType, setSelectedOrderType] = useState("")

  const handleOrderTypeSelect = (option) => {
    setSelectedOrderType(option.meaning)
    setOrder({ ...order, orderType: option.lookupCode })
    setShowOrderTypeDropdown(false)
  }

  // Handle dropdown selection for Order Category
  const handleCategorySelect = (option) => {
    setSelectedCategory(option.meaning)
    setOrder({ ...order, orderCategory: option.lookupCode })
    setShowCategoryDropdown(false)
  }

  // Handle dropdown selection for Billing Frequency
  const [showBillingFrequencyDropdown, setShowBillingFrequencyDropdown] = useState(false)
  const billingFrequencyDropdownRef = useRef(null)
  const [selectedBillingFrequency, setSelectedBillingFrequency] = useState("")

  const handleBillingFrequencySelect = (option) => {
    setSelectedBillingFrequency(option.meaning)
    setOrder({ ...order, billingFrequency: option.lookupCode })
    setShowBillingFrequencyDropdown(false)
  }

  // Handle dropdown selection for Billing Cycle
  const [showBillingCycleDropdown, setShowBillingCycleDropdown] = useState(false)
  const billingCycleDropdownRef = useRef(null)
  const [selectedBillingCycle, setSelectedBillingCycle] = useState("")

  const handleBillingCycleSelect = (option) => {
    setSelectedBillingCycle(option.meaning)
    setOrder({ ...order, billingCycle: option.lookupCode })
    setShowBillingCycleDropdown(false)
  }

  // Handle input changes for order state
  const handleChange = (field, value) => {
    setOrder({ ...order, [field]: value })
  }

  // Handle checkbox change for LD Applicable
  const handleLdApplicableChange = (checked) => {
    setLdApplicable(checked)
    // Set "Y" if checked, "N" if unchecked
    setOrder({ ...order, ldApplicable: checked ? "Y" : "N" })
    console.log("LD Applicable changed to:", checked ? "Y" : "N")
  }

  // Handle customer details dropdown selections
  const handleBillToCustomerSelect = (customer) => {
    setSelectedCustomerName(customer.accountName)
    setOrder({ ...order, billToCustomerId: customer.custAccountId })
    setShowBillToCustomerDropdown(false)
    
    // Reset site and contact selections when customer changes
    setSelectedSiteName("")
    setSelectedContactName("")
    setOrder({ ...order, billToCustomerId: customer.custAccountId, billToSiteId: "", billToContactId: "" })
  }

  const handleBillToSiteSelect = (site) => {
    setSelectedSiteName(site.siteName)
    setOrder({ ...order, billToSiteId: site.custAcctSiteId })
    setShowBillToSiteDropdown(false)
  }

  const handleBillToContactSelect = (contact) => {
    setSelectedContactName(contact.roleType || `Contact ${contact.contactId}`)
    setOrder({ ...order, billToContactId: contact.contactId })
    setShowBillToContactDropdown(false)
  }

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      // Create a copy of the order data for submission
      const orderData = { ...order }

      // Convert empty strings to null for numeric fields
      Object.keys(orderData).forEach((key) => {
        // If it's a numeric field and empty string, set to null
        if (
          (key.endsWith("Id") || key.includes("Amount") || key.includes("Price") || key.endsWith("N")) &&
          orderData[key] === ""
        ) {
          orderData[key] = null
        }

        // Convert string values to numbers for numeric attributes
        if (key.endsWith("N") && orderData[key] !== null && orderData[key] !== "") {
          // Try to convert to number
          const numValue = Number.parseFloat(orderData[key])
          if (!isNaN(numValue)) {
            orderData[key] = numValue
          } else {
            // If conversion fails, set to null
            orderData[key] = null
          }
        }
      })

      console.log("Submitting order data:", orderData)

      const response = await axios.post(`${API_URL}/post-orders`, orderData)
      console.log("Server response:", response.data)

      if (response.data.status === "success") {
        // Show success toast
        setShowToast(true)

        // Reset form
        resetForm()
      } else {
        alert(response.data.message || "Failed to save order")
      }
    } catch (error) {
      console.error("Error saving order:", error)

      // Show more detailed error information
      let errorMessage = "Failed to save order"

      if (error.response) {
        // The server responded with an error status
        console.error("Server error data:", error.response.data)
        errorMessage += `: ${error.response.status} ${error.response.statusText}`

        if (error.response.data && error.response.data.message) {
          errorMessage += ` - ${error.response.data.message}`
        }
      } else if (error.request) {
        // The request was made but no response was received
        errorMessage += ": No response from server"
      } else {
        // Something else caused the error
        errorMessage += `: ${error.message}`
      }

      alert(errorMessage)
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
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
        setShowCategoryDropdown(false)
      }
      if (orderTypeDropdownRef.current && !orderTypeDropdownRef.current.contains(event.target)) {
        setShowOrderTypeDropdown(false)
      }
      if (billingFrequencyDropdownRef.current && !billingFrequencyDropdownRef.current.contains(event.target)) {
        setShowBillingFrequencyDropdown(false)
      }
      if (billingCycleDropdownRef.current && !billingCycleDropdownRef.current.contains(event.target)) {
        setShowBillingCycleDropdown(false)
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
    categoryDropdownRef,
    orderTypeDropdownRef,
    billingFrequencyDropdownRef,
    billingCycleDropdownRef,
    billToCustomerRef,
    billToSiteRef,
    billToContactRef,
  ])

  return (
    
    <div className="order-details-container">
      {/* Success Toast */}
      {showToast && (
        <div className="toast-container">
          <div className="toast success-toast">
            <CheckCircle size={20} />
            <span>Order created successfully</span>
          </div>
        </div>
      )}

      <div className="order-header">
        <h1>Add Order</h1>
        <div className="order-actions">
          <button className="save-btn" onClick={handleSubmit}>
            <Save size={16} />
            <span>Save</span>
          </button>
          <button className="cancel-btn" onClick={handleCancelClick}>
            <X size={16} />
            <span>Cancel</span>
          </button>
        </div>
      </div>

      <div className="order-tabs">
        <div
          className={`tab ${activeTab === "order-details" ? "active" : ""}`}
          onClick={() => handleTabClick("order-details")}
        >
          Order Details
        </div>
        <div
          className={`tab ${activeTab === "customer-details" ? "active" : ""}`}
          onClick={() => handleTabClick("customer-details")}
        >
          Customer Details
        </div>
        <div className={`tab ${activeTab === "billing" ? "active" : ""}`} onClick={() => handleTabClick("billing")}>
          Billing
        </div>
        <div
          className={`tab ${activeTab === "additional-attributes" ? "active" : ""}`}
          onClick={() => handleTabClick("additional-attributes")}
        >
          Additional Attributes
        </div>
      </div>

      {/* Order Details Tab */}
      {activeTab === "order-details" && (
        <div className="order-form">
          <div className="form-section">
            <h2 className="section-title"></h2>

            <div className="form-row">
              <div className="form-field-container">
                <label>Order Number</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    placeholder="Enter order number"
                    value={order.orderNumber}
                    onChange={(e) => handleChange("orderNumber", e.target.value)}
                  />
                </div>
              </div>

              <div className="form-field-container">
                <label>Order Type</label>
                <div className="custom-dropdown-wrapper" ref={orderTypeDropdownRef}>
                  <div
                    className="custom-dropdown-trigger"
                    onClick={() => setShowOrderTypeDropdown(!showOrderTypeDropdown)}
                  >
                    <span>{selectedOrderType || "Select Order Type"}</span>
                    <ChevronDown size={16} />
                  </div>

                  {showOrderTypeDropdown && (
                    <div className="custom-dropdown-menu">
                      <div className="custom-dropdown-content">
                        {lookupValues.orderTypes &&
                          lookupValues.orderTypes.map((option, index) => (
                            <div
                              key={index}
                              className="custom-dropdown-item"
                              onClick={() => handleOrderTypeSelect(option)}
                            >
                              {option.meaning}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-field-container wide-field">
                <label>Order Categories</label>
                <div className="custom-dropdown-wrapper" ref={categoryDropdownRef}>
                  <div
                    className="custom-dropdown-trigger"
                    onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                  >
                    <span>{selectedCategory || "Select Category"}</span>
                    <ChevronDown size={16} />
                  </div>

                  {showCategoryDropdown && (
                    <div className="custom-dropdown-menu">
                      <div className="custom-dropdown-content">
                        {lookupValues.orderCategories &&
                          lookupValues.orderCategories.map((option, index) => (
                            <div
                              key={index}
                              className="custom-dropdown-item"
                              onClick={() => handleCategorySelect(option)}
                            >
                              {option.meaning}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-field-container">
                <label> Effective Start Date</label>
                <div className="input-wrapper date-input-wrapper">
                  <input
                    type="text"
                    placeholder="Select date"
                    value={dates.startDate}
                    readOnly
                    onClick={() => setShowDatePicker(showDatePicker === "startDate" ? null : "startDate")}
                  />
                  <button
                    className="calendar-btn"
                    onClick={(e) => {
                      e.stopPropagation()
                      setShowDatePicker(showDatePicker === "startDate" ? null : "startDate")
                    }}
                  >
                    <Calendar size={14} />
                  </button>
                </div>
              </div>

              <div className="form-field-container">
                <label>Effective End Date</label>
                <div className="input-wrapper date-input-wrapper">
                  <input
                    type="text"
                    placeholder="Select date"
                    value={dates.endDate}
                    readOnly
                    onClick={() => setShowDatePicker(showDatePicker === "endDate" ? null : "endDate")}
                  />
                  <button
                    className="calendar-btn"
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

            <div className="form-row">
              <div className="form-field-container">
                <label>LD Applicable</label>
                <div className="checkbox-wrapper">
                  <input
                    type="checkbox"
                    id="ldApplicable"
                    checked={ldApplicable}
                    onChange={(e) => handleLdApplicableChange(e.target.checked)}
                  />
                  
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customer Details Tab */}
      {activeTab === "customer-details" && (
        <div className="order-form">
          <div className="form-section">
            <h2 className="section-title"></h2>

            <div className="form-row">
              <div className="form-field-container">
                <label>Customer Name</label>
                <div className="custom-dropdown-wrapper" ref={billToCustomerRef}>
                  <div
                    className="custom-dropdown-trigger"
                    onClick={() => setShowBillToCustomerDropdown(!showBillToCustomerDropdown)}
                  >
                    <span>{selectedCustomerName || "Select Customer"}</span>
                    <ChevronDown size={16} />
                  </div>

                  {showBillToCustomerDropdown && (
                    <div className="custom-dropdown-menu">
                      <div className="custom-dropdown-content">
                        {loadingCustomerData ? (
                          <div className="custom-dropdown-item">Loading...</div>
                        ) : customers.length > 0 ? (
                          customers.map((customer, index) => (
                            <div
                              key={index}
                              className="custom-dropdown-item"
                              onClick={() => handleBillToCustomerSelect(customer)}
                            >
                              {customer.accountName}
                            </div>
                          ))
                        ) : (
                          <div className="custom-dropdown-item">No customers found</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-field-container">
                <label>Bill to Site</label>
                <div className="custom-dropdown-wrapper" ref={billToSiteRef}>
                  <div
                    className="custom-dropdown-trigger"
                    onClick={() => setShowBillToSiteDropdown(!showBillToSiteDropdown)}
                  >
                    <span>{selectedSiteName || "Select Site"}</span>
                    <ChevronDown size={16} />
                  </div>

                  {showBillToSiteDropdown && (
                    <div className="custom-dropdown-menu">
                      <div className="custom-dropdown-content">
                        {!order.billToCustomerId ? (
                          <div className="custom-dropdown-item">Select a customer first</div>
                        ) : loadingCustomerData ? (
                          <div className="custom-dropdown-item">Loading...</div>
                        ) : customerSites.length > 0 ? (
                          customerSites.map((site, index) => (
                            <div
                              key={index}
                              className="custom-dropdown-item"
                              onClick={() => handleBillToSiteSelect(site)}
                            >
                              {site.siteName || `Site ${site.custAcctSiteId}`}
                            </div>
                          ))
                        ) : (
                          <div className="custom-dropdown-item">No sites found</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-field-container">
                <label>Bill to Contact</label>
                <div className="custom-dropdown-wrapper" ref={billToContactRef}>
                  <div
                    className="custom-dropdown-trigger"
                    onClick={() => setShowBillToContactDropdown(!showBillToContactDropdown)}
                  >
                    <span>{selectedContactName || "Select Contact"}</span>
                    <ChevronDown size={16} />
                  </div>

                  {showBillToContactDropdown && (
                    <div className="custom-dropdown-menu">
                      <div className="custom-dropdown-content">
                        {!order.billToCustomerId ? (
                          <div className="custom-dropdown-item">Select a customer first</div>
                        ) : loadingCustomerData ? (
                          <div className="custom-dropdown-item">Loading...</div>
                        ) : customerContacts.length > 0 ? (
                          customerContacts.map((contact, index) => (
                            <div
                              key={index}
                              className="custom-dropdown-item"
                              onClick={() => handleBillToContactSelect(contact)}
                            >
                              {contact.roleType || `Contact ${contact.contactId}`}
                            </div>
                          ))
                        ) : (
                          <div className="custom-dropdown-item">No contacts found</div>
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
        <div className="order-form">
          <div className="form-section">
            <h2 className="section-title"></h2>

            <div className="form-row">
              <div className="form-field-container">
                <label>Billing Frequency</label>
                <div className="custom-dropdown-wrapper" ref={billingFrequencyDropdownRef}>
                  <div
                    className="custom-dropdown-trigger"
                    onClick={() => setShowBillingFrequencyDropdown(!showBillingFrequencyDropdown)}
                  >
                    <span>{selectedBillingFrequency || "Select Billing Frequency"}</span>
                    <ChevronDown size={16} />
                  </div>

                  {showBillingFrequencyDropdown && (
                    <div className="custom-dropdown-menu">
                      <div className="custom-dropdown-content">
                        {lookupValues.billingFrequencies &&
                          lookupValues.billingFrequencies.map((option, index) => (
                            <div
                              key={index}
                              className="custom-dropdown-item"
                              onClick={() => handleBillingFrequencySelect(option)}
                            >
                              {option.meaning}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-field-container">
                <label>Billing Cycle</label>
                <div className="custom-dropdown-wrapper" ref={billingCycleDropdownRef}>
                  <div
                    className="custom-dropdown-trigger"
                    onClick={() => setShowBillingCycleDropdown(!showBillingCycleDropdown)}
                  >
                    <span>{selectedBillingCycle || "Select Billing Cycle"}</span>
                    <ChevronDown size={16} />
                  </div>

                  {showBillingCycleDropdown && (
                    <div className="custom-dropdown-menu">
                      <div className="custom-dropdown-content">
                        {lookupValues.billingCycles &&
                          lookupValues.billingCycles.map((option, index) => (
                            <div
                              key={index}
                              className="custom-dropdown-item"
                              onClick={() => handleBillingCycleSelect(option)}
                            >
                              {option.meaning}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Additional Attributes Tab */}
      {activeTab === "additional-attributes" && (
        <div className="order-form">
          <div className="form-section">
            <h2 className="section-title"></h2>
            <div className="form-row">
              <div className="form-field-container">
                <label>Attribute 1</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    placeholder="Enter attribute value"
                    value={order.attribute1V}
                    onChange={(e) => handleChange("attribute1V", e.target.value)}
                  />
                </div>
              </div>

              <div className="form-field-container">
                <label>Attribute 2</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    placeholder="Enter attribute value"
                    value={order.attribute2V}
                    onChange={(e) => handleChange("attribute2V", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-field-container">
                <label>Attribute 3</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    placeholder="Enter attribute value"
                    value={order.attribute3V}
                    onChange={(e) => handleChange("attribute3V", e.target.value)}
                  />
                </div>
              </div>

              <div className="form-field-container">
                <label>Attribute 4</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    placeholder="Enter attribute value"
                    value={order.attribute4V}
                    onChange={(e) => handleChange("attribute4V", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-field-container">
                <label>Attribute 5</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    placeholder="Enter attribute value"
                    value={order.attribute5V}
                    onChange={(e) => handleChange("attribute5V", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <h2 className="section-title">Numeric Attributes</h2>
            <div className="form-row">
              <div className="form-field-container">
                <label>Attribute 1</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    placeholder="Enter numeric value"
                    value={order.attribute1N}
                    onChange={(e) => handleChange("attribute1N", e.target.value)}
                  />
                </div>
              </div>

              <div className="form-field-container">
                <label>Attribute 2</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    placeholder="Enter numeric value"
                    value={order.attribute2N}
                    onChange={(e) => handleChange("attribute2N", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-field-container">
                <label>Attribute 3</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    placeholder="Enter numeric value"
                    value={order.attribute3N}
                    onChange={(e) => handleChange("attribute3N", e.target.value)}
                  />
                </div>
              </div>

              <div className="form-field-container">
                <label>Attribute 4</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    placeholder="Enter numeric value"
                    value={order.attribute4N}
                    onChange={(e) => handleChange("attribute4N", e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-field-container">
                <label>Attribute 5</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    placeholder="Enter numeric value"
                    value={order.attribute5N}
                    onChange={(e) => handleChange("attribute5N", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Date Picker Popup */}
      {showDatePicker && (
        <div className="date-picker-overlay">
          <div className="date-picker-modal" ref={datePickerRef}>
            <div className="calendar-header">
              {calendarView === "date" && (
                <>
                  <button className="calendar-nav-btn" onClick={handlePrevMonth}>
                    <ChevronLeft size={16} />
                  </button>
                  <span onClick={handleMonthClick}>{calendarDate.toLocaleString("default", { month: "long" })}</span>
                  <span onClick={handleYearClick}>{calendarDate.getFullYear()}</span>
                  <button className="calendar-nav-btn" onClick={handleNextMonth}>
                    <ChevronRight size={16} />
                  </button>
                </>
              )}

              {calendarView === "month" && (
                <>
                  <button className="calendar-nav-btn" onClick={handlePrevYear}>
                    <ChevronLeft size={16} />
                  </button>
                  <span onClick={handleYearClick}>{calendarDate.getFullYear()}</span>
                  <button className="calendar-nav-btn" onClick={handleNextYear}>
                    <ChevronRight size={16} />
                  </button>
                </>
              )}

              {calendarView === "year" && (
                <>
                  <button
                    className="calendar-nav-btn"
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
                    className="calendar-nav-btn"
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
              <div className="calendar-days">
                <div className="weekday">Su</div>
                <div className="weekday">Mo</div>
                <div className="weekday">Tu</div>
                <div className="weekday">We</div>
                <div className="weekday">Th</div>
                <div className="weekday">Fr</div>
                <div className="weekday">Sa</div>
                {generateCalendar(showDatePicker)}
              </div>
            )}

            {(calendarView === "month" || calendarView === "year") && (
              <div className="calendar-grid">{generateCalendar(showDatePicker)}</div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default OrderDetails;




