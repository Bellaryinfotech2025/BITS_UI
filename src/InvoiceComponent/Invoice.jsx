import { useState, useEffect } from "react"
import axios from "axios"
import { FaFileInvoice, FaTimes, FaSearch } from "react-icons/fa"
import { MdOutlineFileDownload } from "react-icons/md"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import "../InvoiceComponent/Invoice.css"

const API_BASE_URL = "http://195.35.45.56:5522/api/V2.0"
const VENDOR_API_BASE_URL = "http://195.35.45.56:5522/api/vendor-profile"

const Invoice = () => {
  const [workOrders, setWorkOrders] = useState([])
  const [filteredWorkOrders, setFilteredWorkOrders] = useState([])
  const [selectedWorkOrder, setSelectedWorkOrder] = useState("")
  const [selectedRaNo, setSelectedRaNo] = useState("")
  const [workOrderSearch, setWorkOrderSearch] = useState("")
  const [showWorkOrderDropdown, setShowWorkOrderDropdown] = useState(false)
  const [invoiceData, setInvoiceData] = useState([])
  const [loading, setLoading] = useState(false)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [invoiceNumber, setInvoiceNumber] = useState("")
  const [invoiceDate, setInvoiceDate] = useState("")
  const [invoiceDetails, setInvoiceDetails] = useState(null)
  const [serviceFromDate, setServiceFromDate] = useState("")
  const [serviceToDate, setServiceToDate] = useState("")
  const [placeOfServiceRendered, setPlaceOfServiceRendered] = useState("")

  // Customer Management State
  const [customers, setCustomers] = useState([])
  const [selectedCustomer, setSelectedCustomer] = useState("")
  const [customerSearch, setCustomerSearch] = useState("")
  const [showCustomerDropdown, setShowCustomerDropdown] = useState(false)
  const [filteredCustomers, setFilteredCustomers] = useState([])
  const [customerDetails, setCustomerDetails] = useState(null)
  const [workOrderDetails, setWorkOrderDetails] = useState(null)

  // Vendor Profile State
  const [vendorDetails, setVendorDetails] = useState(null)
  const [residenceTelephone, setResidenceTelephone] = useState("")
  const [officeTelephone, setOfficeTelephone] = useState("")

  // RA NO State
  const [raNumbers, setRaNumbers] = useState([])
  const [filteredRaNumbers, setFilteredRaNumbers] = useState([])
  const [raNoSearch, setRaNoSearch] = useState("")
  const [showRaNoDropdown, setShowRaNoDropdown] = useState(false)

  // Tax Summary State
  const [remarks, setRemarks] = useState("")
  const [preparedBy, setPreparedBy] = useState("")
  const [checkedBy, setCheckedBy] = useState("")

  // Download and Rating State
  const [showInvoiceTemplate, setShowInvoiceTemplate] = useState(false)
  const [showRatingPopup, setShowRatingPopup] = useState(false)
  const [mappedInvoiceData, setMappedInvoiceData] = useState(null)

  // Fetch work orders, customers, vendor profile, and RA numbers on component mount
  useEffect(() => {
    fetchWorkOrders()
    fetchCustomers()
    fetchLatestVendorProfile()
    fetchRaNumbers()
  }, [])

  // Filter work orders based on search
  useEffect(() => {
    if (workOrderSearch) {
      const filtered = workOrders.filter((order) => order.toLowerCase().includes(workOrderSearch.toLowerCase()))
      setFilteredWorkOrders(filtered)
    } else {
      setFilteredWorkOrders(workOrders)
    }
  }, [workOrderSearch, workOrders])

  // Filter customers based on search
  useEffect(() => {
    if (customerSearch) {
      const filtered = customers.filter(
        (customer) =>
          customer.ledgerName.toLowerCase().includes(customerSearch.toLowerCase()) ||
          (customer.gstin && customer.gstin.toLowerCase().includes(customerSearch.toLowerCase())) ||
          (customer.pan && customer.pan.toLowerCase().includes(customerSearch.toLowerCase())),
      )
      setFilteredCustomers(filtered)
    } else {
      setFilteredCustomers(customers)
    }
  }, [customerSearch, customers])

  // Filter RA numbers based on search
  useEffect(() => {
    if (raNoSearch) {
      const filtered = raNumbers.filter((raNo) => raNo.toLowerCase().includes(raNoSearch.toLowerCase()))
      setFilteredRaNumbers(filtered)
    } else {
      setFilteredRaNumbers(raNumbers)
    }
  }, [raNoSearch, raNumbers])

  const fetchWorkOrders = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/getworkorder/number`)
      setWorkOrders(response.data)
      setFilteredWorkOrders(response.data)
    } catch (error) {
      console.error("Error fetching work orders:", error)
    }
  }

  const fetchCustomers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/getAllCustomers/details`)
      console.log("Customers fetched:", response.data)
      setCustomers(response.data)
      setFilteredCustomers(response.data)
    } catch (error) {
      console.error("Error fetching customers:", error)
    }
  }

  // Fetch RA numbers from bits_drawing_entry table
  const fetchRaNumbers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/getDistinctBitsDrawingEntryRaNumbers/details`)
      console.log("RA Numbers fetched:", response.data)
      setRaNumbers(response.data)
      setFilteredRaNumbers(response.data)
    } catch (error) {
      console.error("Error fetching RA numbers:", error)
      setRaNumbers([])
      setFilteredRaNumbers([])
    }
  }

  // Fetch latest vendor profile
  const fetchLatestVendorProfile = async () => {
    try {
      const response = await axios.get(`${VENDOR_API_BASE_URL}/latest`)
      if (response.data) {
        setVendorDetails(response.data)
        console.log("Latest vendor profile fetched:", response.data)
      }
    } catch (error) {
      console.error("Error fetching latest vendor profile:", error)
    }
  }

  // Helper function to combine address fields
  const formatVendorAddress = (vendor) => {
    if (!vendor) return ""

    const addressParts = [
      vendor.street,
      vendor.area,
      vendor.villagePost,
      vendor.mandalTq,
      vendor.district,
      vendor.state,
      vendor.pinCode,
    ].filter((part) => part && part.trim() !== "")

    return addressParts.join(", ")
  }

  // Enhanced fetch work order and customer details
  const fetchWorkOrderAndCustomerDetails = async (workOrder, customerId) => {
    try {
      console.log("Fetching details for workOrder:", workOrder, "customerId:", customerId)

      const response = await axios.get(`${API_BASE_URL}/getWorkOrderWithCustomer/details`, {
        params: { workOrder: encodeURIComponent(workOrder), customerId },
      })

      console.log("API Response:", response.data)

      if (response.data) {
        setWorkOrderDetails(response.data)

        const customerDetailsFromAPI = response.data.customerDetails
        if (customerDetailsFromAPI) {
          const originalCustomer = customers.find((c) => c.id === customerId)
          const enhancedCustomerDetails = {
            ...customerDetailsFromAPI,
            gstin: customerDetailsFromAPI.gstin || originalCustomer?.gstin,
            pan: customerDetailsFromAPI.pan || originalCustomer?.pan,
            ledgerName: customerDetailsFromAPI.ledgerName || originalCustomer?.ledgerName,
          }

          console.log("Enhanced customer details:", enhancedCustomerDetails)
          setCustomerDetails(enhancedCustomerDetails)
        }
      }
    } catch (error) {
      console.error("Error fetching work order and customer details:", error)
    }
  }

  const handleSearch = async () => {
    if (!selectedWorkOrder) {
      alert("Please select a work order")
      return
    }

    setLoading(true)
    try {
      const workOrderResponse = await axios.get(
        `${API_BASE_URL}/getworkorder/number/${encodeURIComponent(selectedWorkOrder)}`,
      )
      const orderId = workOrderResponse.data.orderId

      const invoiceResponse = await axios.get(`${API_BASE_URL}/getInvoiceData/details?orderId=${orderId}`)
      setInvoiceData(invoiceResponse.data)

      if (selectedCustomer) {
        const selectedCustomerData = customers.find((c) => c.ledgerName === selectedCustomer)
        if (selectedCustomerData) {
          console.log("Selected customer data:", selectedCustomerData)
          await fetchWorkOrderAndCustomerDetails(selectedWorkOrder, selectedCustomerData.id)
        }
      }
    } catch (error) {
      console.error("Error fetching invoice data:", error)
      alert("Error fetching data. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleInvoiceClick = () => {
    setShowInvoiceModal(true)
  }

  const handleInvoiceSubmit = () => {
    if (!invoiceNumber || !invoiceDate) {
      alert("Please enter both invoice number and date")
      return
    }

    if (!serviceFromDate || !serviceToDate) {
      alert("Please select service rendered period (from and to dates)")
      return
    }

    const selectedCustomerData = customers.find((c) => c.ledgerName === selectedCustomer)

    setInvoiceDetails({
      invoiceNumber,
      invoiceDate,
      serviceFromDate,
      serviceToDate,
      placeOfServiceRendered,
      workOrder: selectedWorkOrder,
      raNo: selectedRaNo,
      customer: selectedCustomer,
      customerDetails: customerDetails || selectedCustomerData,
      workOrderDetails: workOrderDetails,
    })

    setShowInvoiceModal(false)
    setInvoiceNumber("")
    setInvoiceDate("")
    setServiceFromDate("")
    setServiceToDate("")
    setPlaceOfServiceRendered("")
  }

  // Number to words conversion function
  const numberToWords = (num) => {
    if (num === 0) return "Zero Rupees Only"

    const ones = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ]

    const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"]

    const convertHundreds = (n) => {
      let result = ""
      if (n > 99) {
        result += ones[Math.floor(n / 100)] + " Hundred "
        n %= 100
      }
      if (n > 19) {
        result += tens[Math.floor(n / 10)] + " "
        n %= 10
      }
      if (n > 0) {
        result += ones[n] + " "
      }
      return result
    }

    const convertThousands = (n) => {
      if (n >= 1000000) {
        return convertThousands(Math.floor(n / 1000000)) + "Million " + convertThousands(n % 1000000)
      }
      if (n >= 100000) {
        return convertHundreds(Math.floor(n / 100000)) + "Lakh " + convertThousands(n % 100000)
      }
      if (n >= 1000) {
        return convertHundreds(Math.floor(n / 1000)) + "Thousand " + convertHundreds(n % 1000)
      }
      return convertHundreds(n)
    }

    const rupees = Math.floor(num)
    const paise = Math.round((num - rupees) * 100)

    let result = convertThousands(rupees).trim() + " Rupees"

    if (paise > 0) {
      result += " and " + convertThousands(paise).trim() + " Paise"
    }

    return result + " Only"
  }

  // Enhanced Download Invoice Handler - Direct PDF Download
  const handleDownloadInvoice = () => {
    // Check if all required data is available
    if (!invoiceDetails) {
      toast.error("Please fill invoice details first!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })
      return
    }

    if (!invoiceData || invoiceData.length === 0) {
      toast.error("No invoice data available to download!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })
      return
    }

    // Show loading toast
    const loadingToast = toast.loading("Generating PDF invoice...", {
      position: "top-right",
    })

    try {
      // Calculate totals
      const total = calculateTotal()
      const totalAfterTax = calculateTotalAfterTax()
      const sgst = calculateSGST()
      const cgst = calculateCGST()
      const totalTax = calculateTotalTax()

      // Create PDF content directly
      const pdfContent = generateInvoicePDFContent({
        invoiceDetails: {
          ...invoiceDetails,
          placeOfServiceRendered: placeOfServiceRendered || invoiceDetails.placeOfServiceRendered,
        },
        customerDetails: customerDetails || invoiceDetails.customerDetails,
        vendorDetails: {
          ...vendorDetails,
          address: formatVendorAddress(vendorDetails),
          residenceTelephone: residenceTelephone,
          officeTelephone: officeTelephone,
        },
        workOrderDetails: workOrderDetails || invoiceDetails.workOrderDetails,
        tableData: invoiceData,
        amountInWords: numberToWords(totalAfterTax),
        remarks: remarks,
        preparedBy: preparedBy,
        checkedBy: checkedBy,
        totals: {
          subtotal: total,
          sgst: sgst,
          cgst: cgst,
          totalTax: totalTax,
          grandTotal: totalAfterTax,
        },
      })

      // Create and download PDF
      const blob = new Blob([pdfContent], { type: "text/html" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `Invoice-${invoiceDetails.invoiceNumber}-${invoiceDetails.customer.replace(/[^a-zA-Z0-9]/g, "_")}.html`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      // Dismiss loading toast and show success
      toast.dismiss(loadingToast)
      toast.success("Invoice downloaded successfully!", {
        position: "top-right",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })

      // Show rating popup after a short delay
      setTimeout(() => {
        setShowRatingPopup(true)
      }, 1500)
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast.dismiss(loadingToast)
      toast.error("Error generating PDF invoice!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      })
    }
  }

  // Function to generate PDF content
  const generateInvoicePDFContent = (data) => {
    const formatCurrency = (amount) => {
      return amount ? `${Number.parseFloat(amount).toFixed(2)}` : "0.00"
    }

    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Tax Invoice - ${data.invoiceDetails?.invoiceNumber || "Draft"}</title>
    <style>
        @page {
            size: A4;
            margin: 0.5in;
        }
        
        body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            font-size: 12px;
            line-height: 1.4;
            color: #000;
        }
        
        .invoice-container {
            width: 100%;
            max-width: 800px;
            margin: 0 auto;
            border: 2px solid #000;
        }
        
        .invoice-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 20px;
            border-bottom: 2px solid #000;
            background: #f8f9fa;
        }
        
        .invoice-title {
            font-size: 24px;
            font-weight: bold;
            margin: 0;
        }
        
        .original-text {
            font-size: 14px;
            font-weight: bold;
        }
        
        .invoice-content {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            border-bottom: 2px solid #000;
        }
        
        .left-section, .middle-section, .right-section {
            border-right: 2px solid #000;
            padding: 15px;
            min-height: 300px;
        }
        
        .right-section {
            border-right: none;
        }
        
        .field-row {
            display: flex;
            flex-direction: column;
            margin-bottom: 8px;
            min-height: 25px;
        }
        
        .label {
            font-weight: bold;
            font-size: 11px;
            margin-bottom: 3px;
        }
        
        .value {
            border-bottom: 1px solid #ccc;
            min-height: 18px;
            padding: 2px 0;
            font-size: 12px;
        }
        
        .address-line .value {
            min-height: 40px;
        }
        
        .contact-section {
            margin-bottom: 20px;
        }
        
        .contact-header {
            font-weight: bold;
            text-align: center;
            margin-bottom: 10px;
            font-size: 13px;
        }
        
        .contact-name {
            text-align: center;
            font-weight: bold;
            margin-bottom: 10px;
            font-size: 12px;
        }
        
        .reverse-charge-section {
            text-align: center;
            margin-top: 20px;
        }
        
        .reverse-charge-header {
            font-weight: bold;
            margin-bottom: 5px;
        }
        
        .reverse-charge-value {
            font-size: 16px;
            font-weight: bold;
        }
        
        .service-period {
            display: flex;
            justify-content: space-between;
            margin-top: 5px;
        }
        
        .service-place {
            margin-top: 5px;
            min-height: 20px;
            border-bottom: 1px solid #ccc;
            padding: 2px 0;
        }
        
        .items-table {
            border-bottom: 2px solid #000;
        }
        
        .items-table table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .items-table th, .items-table td {
            border: 1px solid #000;
            padding: 8px;
            text-align: center;
            font-size: 11px;
        }
        
        .items-table th {
            background: #f8f9fa;
            font-weight: bold;
        }
        
        .tax-section {
            padding: 15px;
            border-bottom: 2px solid #000;
        }
        
        .tax-section table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .tax-section td {
            padding: 5px;
            font-size: 12px;
        }
        
        .tax-label {
            text-align: left;
            font-weight: bold;
            width: 70%;
        }
        
        .colon {
            text-align: center;
            width: 5%;
        }
        
        .tax-amount {
            text-align: right;
            width: 25%;
            font-weight: bold;
        }
        
        .bottom-section {
            padding: 15px;
        }
        
        .rupees-section {
            margin-bottom: 20px;
        }
        
        .total-amount {
            float: right;
            font-weight: bold;
            font-size: 14px;
        }
        
        .remarks-section {
            display: flex;
            border: 2px solid #000;
            min-height: 80px;
            margin-bottom: 20px;
        }
        
        .remarks-left {
            flex: 1;
            padding: 10px;
            border-right: 2px solid #000;
        }
        
        .remarks-right {
            flex: 1;
            padding: 10px;
        }
        
        .remarks-header, .company-header {
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .signature-section table {
            width: 100%;
            border-collapse: collapse;
        }
        
        .signature-cell {
            border: 2px solid #000;
            padding: 15px;
            text-align: center;
            vertical-align: top;
            height: 80px;
        }
        
        .signature-label, .signature-label-small {
            font-weight: bold;
            margin-bottom: 10px;
        }
        
        .signature-space {
            min-height: 40px;
        }
        
        @media print {
            body { -webkit-print-color-adjust: exact; }
            .invoice-container { border: 2px solid #000 !important; }
        }
    </style>
</head>
<body>
    <div class="invoice-container">
        <!-- Header -->
        <div class="invoice-header">
            <h1 class="invoice-title">TAX INVOICE</h1>
            <div class="original-text">ORIGINAL FOR RECIPIENT</div>
        </div>

        <!-- Main Content Grid -->
        <div class="invoice-content">
            <!-- Left Section -->
            <div class="left-section">
                <div class="provider-section">
                    <div class="field-row">
                        <span class="label">Name of the Service Provider</span>
                        <div class="value">${data.vendorDetails?.companyName || ""}</div>
                    </div>
                    <div class="field-row">
                        <span class="label">ADDRESS</span>
                        <div class="value address-line">${data.vendorDetails?.address || ""}</div>
                    </div>
                    <div class="field-row">
                        <span class="label">GST REGISTRATION NO</span>
                        <div class="value">${data.vendorDetails?.gstNo || ""}</div>
                    </div>
                    <div class="field-row">
                        <span class="label">IT PAN No</span>
                        <div class="value">${data.vendorDetails?.panNo || ""}</div>
                    </div>
                </div>

                <div class="receiver-section" style="margin-top: 20px;">
                    <div class="field-row">
                        <span class="label">NAME OF THE SERVICE RECEIVER</span>
                        <div class="value">${data.customerDetails?.ledgerName || ""}</div>
                    </div>
                    <div class="field-row">
                        <span class="label">ADDRESS</span>
                        <div class="value address-line">${data.customerDetails?.fullAddress || ""}</div>
                    </div>
                    <div class="field-row">
                        <span class="label">GST REGISTRATION NO</span>
                        <div class="value">${data.customerDetails?.gstin || data.customerDetails?.gstIn || ""}</div>
                    </div>
                    <div class="field-row">
                        <span class="label">IT PAN No</span>
                        <div class="value">${data.customerDetails?.pan || data.customerDetails?.panNo || ""}</div>
                    </div>
                </div>
            </div>

            <!-- Middle Section -->
            <div class="middle-section">
                <div class="contact-section">
                    <div class="contact-header">CONTACT DETAILS</div>
                    <div class="contact-name">${data.vendorDetails?.contactPerson || ""}</div>
                    <div class="field-row">
                        <span class="label">MOBILE NO</span>
                        <div class="value">${data.vendorDetails?.contactNumber || ""}</div>
                    </div>
                    <div class="field-row">
                        <span class="label">TELEPHONE NO.(RESI)</span>
                        <div class="value">${data.vendorDetails?.residenceTelephone || ""}</div>
                    </div>
                    <div class="field-row">
                        <span class="label">TELEPHONE NO.(OFF)</span>
                        <div class="value">${data.vendorDetails?.officeTelephone || ""}</div>
                    </div>
                    <div class="field-row">
                        <span class="label">E MAIL ID</span>
                        <div class="value">${data.vendorDetails?.email || ""}</div>
                    </div>
                </div>

                <div class="reverse-charge-section">
                    <div class="reverse-charge-header">Reverse Charge</div>
                    <div class="reverse-charge-value">NO</div>
                </div>
            </div>

            <!-- Right Section -->
            <div class="right-section">
                <div class="invoice-details">
                    <div class="field-row">
                        <span class="label">Invoice No</span>
                        <div class="value">${data.invoiceDetails?.invoiceNumber || ""}</div>
                    </div>
                    <div class="field-row">
                        <span class="label">Invoice Date</span>
                        <div class="value">${data.invoiceDetails?.invoiceDate || ""}</div>
                    </div>
                    <div class="field-row">
                        <span class="label">RA Bill NO</span>
                        <div class="value">${data.invoiceDetails?.raNo || ""}</div>
                    </div>
                    <div class="field-row">
                        <span class="label">SERVICE RENDERED PERIOD</span>
                        <div class="service-period">
                            <span>${data.invoiceDetails?.serviceFromDate || ""}</span>
                            <span>${data.invoiceDetails?.serviceToDate || ""}</span>
                        </div>
                    </div>
                </div>

                <div class="work-order-section" style="margin-top: 20px;">
                    <div class="field-row">
                        <span class="label">W.O No</span>
                        <div class="value">${data.invoiceDetails?.workOrder || ""}</div>
                    </div>
                    <div class="field-row">
                        <span class="label">W.O Date</span>
                        <div class="value">${data.workOrderDetails?.workOrderDate || ""}</div>
                    </div>
                    <div class="field-row">
                        <span class="label">Cost Centre</span>
                        <div class="value">${data.workOrderDetails?.department || ""}</div>
                    </div>
                    <div class="field-row">
                        <span class="label">PLACE OF SERVICE RENDERED</span>
                        <div class="service-place">${data.invoiceDetails?.placeOfServiceRendered || ""}</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Items Table -->
        <div class="items-table">
            <table>
                <thead>
                    <tr>
                        <th>SL NO.</th>
                        <th>DESCRIPTION OF SUPPLY</th>
                        <th>UOM</th>
                        <th>Qty</th>
                        <th>Rate/ Rs.</th>
                        <th>AMOUNT</th>
                    </tr>
                </thead>
                <tbody>
                    ${
                      data.tableData && data.tableData.length > 0
                        ? data.tableData
                            .map(
                              (item, index) => `
                            <tr>
                                <td>${item.serNo || index + 1}</td>
                                <td>${item.serviceCode ? `(${item.serviceCode}) ` : ""}${item.serviceDesc || ""}</td>
                                <td>${item.uom || ""}</td>
                                <td>${item.qty || ""}</td>
                                <td>${formatCurrency(item.unitPrice)}</td>
                                <td>${formatCurrency(item.totalPrice)}</td>
                            </tr>
                        `,
                            )
                            .join("")
                        : Array.from(
                            { length: 4 },
                            (_, index) => `
                            <tr>
                                <td>&nbsp;</td>
                                <td>&nbsp;</td>
                                <td>&nbsp;</td>
                                <td>&nbsp;</td>
                                <td>&nbsp;</td>
                                <td>&nbsp;</td>
                            </tr>
                        `,
                          ).join("")
                    }
                </tbody>
            </table>
        </div>

        <!-- Tax Calculation Section -->
        <div class="tax-section">
            <table>
                <tbody>
                    <tr>
                        <td class="tax-label">TOTAL AMOUNT BEFORE TAX</td>
                        <td class="colon">:</td>
                        <td class="tax-amount">${formatCurrency(data.totals?.subtotal || 0)}</td>
                    </tr>
                    <tr>
                        <td class="tax-label">CGST @ 9 %</td>
                        <td class="colon">:</td>
                        <td class="tax-amount">${formatCurrency(data.totals?.cgst || 0)}</td>
                    </tr>
                    <tr>
                        <td class="tax-label">SGST @ 9 %</td>
                        <td class="colon">:</td>
                        <td class="tax-amount">${formatCurrency(data.totals?.sgst || 0)}</td>
                    </tr>
                    <tr>
                        <td class="tax-label">IGST</td>
                        <td class="colon">:</td>
                        <td class="tax-amount">-</td>
                    </tr>
                    <tr>
                        <td class="tax-label">TAX AMOUNT GST</td>
                        <td class="colon">:</td>
                        <td class="tax-amount">${formatCurrency(data.totals?.totalTax || 0)}</td>
                    </tr>
                    <tr>
                        <td class="tax-label">TOTAL AMOUNT AFTER TAX</td>
                        <td class="colon">:</td>
                        <td class="tax-amount">${formatCurrency(data.totals?.grandTotal || 0)}</td>
                    </tr>
                    <tr>
                        <td class="tax-label">ROUND OFF</td>
                        <td class="colon">:</td>
                        <td class="tax-amount">-</td>
                    </tr>
                    <tr>
                        <td class="tax-label">TOTAL</td>
                        <td class="colon">:</td>
                        <td class="tax-amount">${formatCurrency(data.totals?.grandTotal || 0)}</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Bottom Section -->
        <div class="bottom-section">
            <div class="rupees-section">
                <div class="field-row">
                    <span class="label">Rupees in words</span>
                    <div class="value">${data.amountInWords || ""}</div>
                </div>
                <div class="field-row">
                    <span class="label">TOTAL</span>
                    <span class="total-amount">${formatCurrency(data.totals?.grandTotal || 0)}</span>
                </div>
            </div>

            <div class="remarks-section">
                <div class="remarks-left">
                    <div class="remarks-header">Remarks</div>
                    <div class="remarks-content">${data.remarks || ""}</div>
                </div>
                <div class="remarks-right">
                    <div class="company-header">For Bellary InfoTech Solutions</div>
                    <div class="company-content"></div>
                </div>
            </div>

            <div class="signature-section">
                <table>
                    <tbody>
                        <tr>
                            <td class="signature-cell">
                                <div class="signature-label-small">Prepared by</div>
                                <div class="signature-space">${data.preparedBy || ""}</div>
                            </td>
                            <td class="signature-cell">
                                <div class="signature-label-small">Checked by</div>
                                <div class="signature-space">${data.checkedBy || ""}</div>
                            </td>
                            <td class="signature-cell">
                                <div class="signature-label">Signature of Authorised Agent</div>
                                <div class="signature-space"></div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </div>
    </div>

    <script>
        // Auto-print when document loads
        window.onload = function() {
            setTimeout(function() {
                window.print();
            }, 500);
        }
    </script>
</body>
</html>
  `
  }

  const handleWorkOrderSelect = (workOrder) => {
    setSelectedWorkOrder(workOrder)
    setShowWorkOrderDropdown(false)
  }

  const handleCustomerSelect = (customer) => {
    console.log("Customer selected:", customer)
    setSelectedCustomer(customer.ledgerName)
    setShowCustomerDropdown(false)
    setCustomerSearch("")
  }

  const handleRaNoSelect = (raNo) => {
    setSelectedRaNo(raNo)
    setShowRaNoDropdown(false)
    setRaNoSearch("")
  }

  const formatCurrency = (amount) => {
    return amount ? `${Number.parseFloat(amount).toFixed(2)}` : "0.00"
  }

  const formatServiceDescription = (serviceCode, serviceDesc) => {
    if (serviceCode && serviceDesc) {
      return `(${serviceCode}) ${serviceDesc}`
    } else if (serviceCode) {
      return `(${serviceCode})`
    } else if (serviceDesc) {
      return serviceDesc
    }
    return "-"
  }

  const calculateTotal = () => {
    return invoiceData.reduce((total, item) => {
      return total + (Number.parseFloat(item.totalPrice) || 0)
    }, 0)
  }

  const calculateSGST = () => {
    const total = calculateTotal()
    return (total * 9) / 100
  }

  const calculateCGST = () => {
    const total = calculateTotal()
    return (total * 9) / 100
  }

  const calculateTotalTax = () => {
    return calculateSGST() + calculateCGST()
  }

  const calculateTotalAfterTax = () => {
    return calculateTotal() + calculateTotalTax()
  }

  const handleRatingSubmit = (rating) => {
    console.log("Rating submitted:", rating)
    setShowRatingPopup(false)
  }

  return (
    <div className="modern-invoice-container">
      {/* New Header Design */}
      <div className="modern-header">
        <div className="header-content">
          <div className="title-section">
            <h1 className="main-title">Invoice Management System</h1>
            <p className="subtitle">Search and generate billing details</p>
          </div>
          <div className="action-buttons">
            <button className="btn-primary" onClick={handleInvoiceClick}>
              <span>📄</span> Invoice No
            </button>
            <button className="btn-secondary" onClick={handleDownloadInvoice}>
              <MdOutlineFileDownload /> Download Invoice
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Invoice Details Display */}
      {invoiceDetails && (
        <div className="invoice-details-card">
          <div className="card-header">
            <h3>Invoice Details</h3>
          </div>
          <div className="details-grid">
            <div className="detail-item">
              <span className="detail-label">Invoice No</span>
              <span className="detail-value">{invoiceDetails.invoiceNumber}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Invoice Date</span>
              <span className="detail-value">{invoiceDetails.invoiceDate}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Service Period</span>
              <span className="detail-value">
                {invoiceDetails.serviceFromDate} to {invoiceDetails.serviceToDate}
              </span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Work Order</span>
              <span className="detail-value">{invoiceDetails.workOrder}</span>
            </div>
            {invoiceDetails.workOrderDetails?.workOrderDate && (
              <div className="detail-item">
                <span className="detail-label">WO Date</span>
                <span className="detail-value">{invoiceDetails.workOrderDetails.workOrderDate}</span>
              </div>
            )}
            {invoiceDetails.workOrderDetails?.department && (
              <div className="detail-item">
                <span className="detail-label">Department</span>
                <span className="detail-value">{invoiceDetails.workOrderDetails.department}</span>
              </div>
            )}
            {invoiceDetails.placeOfServiceRendered && (
              <div className="detail-item">
                <span className="detail-label">Service Location</span>
                <span className="detail-value">{invoiceDetails.placeOfServiceRendered}</span>
              </div>
            )}
            {invoiceDetails.raNo && (
              <div className="detail-item">
                <span className="detail-label">RA Number</span>
                <span className="detail-value">{invoiceDetails.raNo}</span>
              </div>
            )}
          </div>

          {/* Vendor Details Section */}
          {vendorDetails && (
            <div className="vendor-section">
              <h4 className="section-title">Vendor Information</h4>
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">Service Provider</span>
                  <span className="detail-value">{vendorDetails.companyName || "N/A"}</span>
                </div>
                <div className="detail-item full-width">
                  <span className="detail-label">Address</span>
                  <span className="detail-value">{formatVendorAddress(vendorDetails) || "N/A"}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">GST Number</span>
                  <span className="detail-value">{vendorDetails.gstNo || "Not Available"}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">PAN Number</span>
                  <span className="detail-value">{vendorDetails.panNo || "Not Available"}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Contact Person</span>
                  <span className="detail-value">{vendorDetails.contactPerson || "N/A"}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Contact Number</span>
                  <span className="detail-value">{vendorDetails.contactNumber || "N/A"}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Email</span>
                  <span className="detail-value">{vendorDetails.email || "N/A"}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Residence Phone</span>
                  <input
                    type="text"
                    value={residenceTelephone}
                    onChange={(e) => setResidenceTelephone(e.target.value)}
                    placeholder="Enter residence telephone"
                    className="detail-input"
                  />
                </div>
                <div className="detail-item">
                  <span className="detail-label">Office Phone</span>
                  <input
                    type="text"
                    value={officeTelephone}
                    onChange={(e) => setOfficeTelephone(e.target.value)}
                    placeholder="Enter office telephone"
                    className="detail-input"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Customer Details Section */}
          {invoiceDetails.customerDetails && (
            <div className="customer-section">
              <h4 className="section-title">Customer Information</h4>
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">Service Receiver</span>
                  <span className="detail-value">{invoiceDetails.customerDetails.ledgerName || "N/A"}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">GST Number</span>
                  <span className="detail-value">
                    {invoiceDetails.customerDetails.gstin ||
                      invoiceDetails.customerDetails.gstIn ||
                      invoiceDetails.customerDetails.GSTIN ||
                      "Not Available"}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">PAN Number</span>
                  <span className="detail-value">
                    {invoiceDetails.customerDetails.pan ||
                      invoiceDetails.customerDetails.panNo ||
                      invoiceDetails.customerDetails.PAN ||
                      "Not Available"}
                  </span>
                </div>
                {invoiceDetails.customerDetails.fullAddress && (
                  <div className="detail-item full-width">
                    <span className="detail-label">Address</span>
                    <span className="detail-value">{invoiceDetails.customerDetails.fullAddress}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* New Search Controls Card */}
      <div className="search-card">
        <div className="card-header">
          <h3>Search Criteria</h3>
          <p>Select your search parameters</p>
        </div>
        <div className="search-form">
          {/* Work Order Dropdown */}
          <div className="form-field">
            <label className="field-label">Work Order Number</label>
            <div className="dropdown-wrapper">
              <div className="modern-dropdown">
                <div className="dropdown-trigger" onClick={() => setShowWorkOrderDropdown(!showWorkOrderDropdown)}>
                  <span className="selected-value">{selectedWorkOrder || "Select Work Order"}</span>
                  <span className={`dropdown-icon ${showWorkOrderDropdown ? "open" : ""}`}>▲</span>
                </div>
                {showWorkOrderDropdown && (
                  <div className="dropdown-panel upward">
                    <div className="dropdown-header">
                      <input
                        type="text"
                        placeholder="Search work orders..."
                        value={workOrderSearch}
                        onChange={(e) => setWorkOrderSearch(e.target.value)}
                        className="dropdown-search-input"
                        autoFocus
                      />
                    </div>
                    <div className="dropdown-list">
                      {filteredWorkOrders.map((workOrder, index) => (
                        <div key={index} className="dropdown-item" onClick={() => handleWorkOrderSelect(workOrder)}>
                          {workOrder}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Customer Dropdown */}
          <div className="form-field">
            <label className="field-label">Customer Name</label>
            <div className="dropdown-wrapper">
              <div className="modern-dropdown">
                <div className="dropdown-trigger" onClick={() => setShowCustomerDropdown(!showCustomerDropdown)}>
                  <span className="selected-value">{selectedCustomer || "Select Customer"}</span>
                  <span className={`dropdown-icon ${showCustomerDropdown ? "open" : ""}`}>▲</span>
                </div>
                {showCustomerDropdown && (
                  <div className="dropdown-panel upward">
                    <div className="dropdown-header">
                      <div className="search-input-wrapper">
                        <FaSearch className="search-icon" />
                        <input
                          type="text"
                          placeholder="Search customers, GSTIN, PAN..."
                          value={customerSearch}
                          onChange={(e) => setCustomerSearch(e.target.value)}
                          className="dropdown-search-input with-icon"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="dropdown-list">
                      {filteredCustomers.map((customer) => (
                        <div
                          key={customer.id}
                          className="dropdown-item customer-item"
                          onClick={() => handleCustomerSelect(customer)}
                        >
                          <div className="customer-name">{customer.ledgerName}</div>
                          <div className="customer-details">
                            {customer.gstin && <span>GSTIN: {customer.gstin}</span>}
                            {customer.pan && <span>PAN: {customer.pan}</span>}
                          </div>
                          {customer.state && customer.district && (
                            <div className="customer-location">
                              {customer.district}, {customer.state}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RA Number Dropdown */}
          <div className="form-field">
            <label className="field-label">RA Number</label>
            <div className="dropdown-wrapper">
              <div className="modern-dropdown">
                <div className="dropdown-trigger" onClick={() => setShowRaNoDropdown(!showRaNoDropdown)}>
                  <span className="selected-value">{selectedRaNo || "Select RA Number"}</span>
                  <span className={`dropdown-icon ${showRaNoDropdown ? "open" : ""}`}>▲</span>
                </div>
                {showRaNoDropdown && (
                  <div className="dropdown-panel upward">
                    <div className="dropdown-header">
                      <div className="search-input-wrapper">
                        <FaSearch className="search-icon" />
                        <input
                          type="text"
                          placeholder="Search RA numbers..."
                          value={raNoSearch}
                          onChange={(e) => setRaNoSearch(e.target.value)}
                          className="dropdown-search-input with-icon"
                          autoFocus
                        />
                      </div>
                    </div>
                    <div className="dropdown-list">
                      {filteredRaNumbers.length > 0 ? (
                        filteredRaNumbers.map((raNo, index) => (
                          <div key={index} className="dropdown-item" onClick={() => handleRaNoSelect(raNo)}>
                            {raNo}
                          </div>
                        ))
                      ) : (
                        <div className="dropdown-item no-results">No RA numbers found</div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Search Button */}
          <div className="form-field">
            <label className="field-label">&nbsp;</label>
            <button onClick={handleSearch} disabled={loading} className="search-button">
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Searching...
                </>
              ) : (
                <>
                  <FaSearch />
                  Search
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Modern Data Table */}
      <div className="data-table-card">
        <div className="table-header">
          <h3>Invoice Data</h3>
          {invoiceData.length > 0 && <span className="record-count">{invoiceData.length} records found</span>}
        </div>
        <div className="table-wrapper">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Invoice</th>
                <th>SL NO</th>
                <th>Service Description</th>
                <th>UOM</th>
                <th>QTY</th>
                <th>Rate (Rs)</th>
                <th>Amount Total</th>
              </tr>
            </thead>
            <tbody>
              {invoiceData.length > 0 ? (
                invoiceData.map((item, index) => (
                  <tr key={item.lineId || index} className="table-row">
                    <td className="icon-cell">
                      <FaFileInvoice className="invoice-icon" />
                    </td>
                    <td>{item.serNo || "-"}</td>
                    <td className="description-cell">{formatServiceDescription(item.serviceCode, item.serviceDesc)}</td>
                    <td>{item.uom || "-"}</td>
                    <td className="number-cell">{item.qty || 0}</td>
                    <td className="currency-cell">₹{formatCurrency(item.unitPrice)}</td>
                    <td className="currency-cell total-cell">₹{formatCurrency(item.totalPrice)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="empty-state">
                    <div className="empty-content">
                      <div className="empty-icon">📋</div>
                      <h4>No Data Available</h4>
                      <p>
                        {selectedWorkOrder
                          ? "No records found for the selected work order"
                          : "Please select Work Order and Customer, then click Search to view records"}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
            {invoiceData.length > 0 && (
              <tfoot>
                <tr className="subtotal-row">
                  <td colSpan="6" className="subtotal-label">
                    Subtotal (Before Tax):
                  </td>
                  <td className="subtotal-amount">₹{formatCurrency(calculateTotal())}</td>
                </tr>
                <tr className="tax-row">
                  <td colSpan="6" className="tax-label">
                    SGST @ 9%:
                  </td>
                  <td className="tax-amount">₹{formatCurrency(calculateSGST())}</td>
                </tr>
                <tr className="tax-row">
                  <td colSpan="6" className="tax-label">
                    CGST @ 9%:
                  </td>
                  <td className="tax-amount">₹{formatCurrency(calculateCGST())}</td>
                </tr>
                <tr className="tax-row">
                  <td colSpan="6" className="tax-label">
                    IGST:
                  </td>
                  <td className="tax-amount">-</td>
                </tr>
                <tr className="tax-total-row">
                  <td colSpan="6" className="tax-total-label">
                    Total Tax (GST):
                  </td>
                  <td className="tax-total-amount">₹{formatCurrency(calculateTotalTax())}</td>
                </tr>
                <tr className="grand-total-row">
                  <td colSpan="6" className="grand-total-label">
                    Grand Total:
                  </td>
                  <td className="grand-total-amount">₹{formatCurrency(calculateTotalAfterTax())}</td>
                </tr>
                <tr className="words-row">
                  <td colSpan="7" className="amount-words">
                    <strong>Amount in Words: </strong>
                    {numberToWords(calculateTotalAfterTax())}
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      {/* Invoice Summary Card */}
      {invoiceData.length > 0 && (
        <div className="summary-card">
          <div className="summary-form">
            <div className="form-row full-width">
              <div className="form-group">
                <label className="form-label">Remarks</label>
                <input
                  type="text"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Enter any remarks or notes..."
                  className="form-input"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Prepared By</label>
                <input
                  type="text"
                  value={preparedBy}
                  onChange={(e) => setPreparedBy(e.target.value)}
                  placeholder="Name of preparer"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Checked By</label>
                <input
                  type="text"
                  value={checkedBy}
                  onChange={(e) => setCheckedBy(e.target.value)}
                  placeholder="Name of checker"
                  className="form-input"
                />
              </div>
            </div>
            <div className="signature-area">
              <div className="signature-box">
                <div className="signature-label">Signature of Authorized Agent</div>
                <div className="signature-line"></div>
                <div className="company-name">For Bellary InfoTech Solutions</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Keep all existing modals unchanged */}
      {showInvoiceModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Invoice Details</h3>
              <button className="close-btn" onClick={() => setShowInvoiceModal(false)}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Invoice Number</label>
                <input
                  type="text"
                  placeholder="Enter invoice number"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="modal-input"
                />
              </div>
              <div className="form-group">
                <label>Invoice Date</label>
                <input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                  className="modal-input"
                />
              </div>
              <div className="form-group">
                <label>Service Rendered Period</label>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>From</label>
                    <input
                      type="date"
                      value={serviceFromDate}
                      onChange={(e) => setServiceFromDate(e.target.value)}
                      className="modal-input"
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: "12px", color: "#666", marginBottom: "4px" }}>To</label>
                    <input
                      type="date"
                      value={serviceToDate}
                      onChange={(e) => setServiceToDate(e.target.value)}
                      className="modal-input"
                    />
                  </div>
                </div>
              </div>
              <div className="form-group">
                <label>Place of Service Rendered</label>
                <input
                  type="text"
                  placeholder="Enter place of service rendered"
                  value={placeOfServiceRendered}
                  onChange={(e) => setPlaceOfServiceRendered(e.target.value)}
                  className="modal-input"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="cancel-btn" onClick={() => setShowInvoiceModal(false)}>
                Cancel
              </button>
              <button className="submit-btn" onClick={handleInvoiceSubmit}>
                Submit Invoice Details
              </button>
            </div>
          </div>
        </div>
      )}

      

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </div>
  )
}

export default Invoice;
