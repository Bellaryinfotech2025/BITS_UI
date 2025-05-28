import { useState, useEffect, useRef } from "react"
import axios from "axios"
import { IoMdOpen } from "react-icons/io"
import { FiEdit2, FiTrash2, FiSearch, FiChevronDown, FiChevronUp, FiPlus, FiUpload, FiX } from "react-icons/fi"
import { AiOutlineLoading3Quarters } from "react-icons/ai"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { GoCopy } from "react-icons/go"
import { MdOutlineDriveFileMove } from "react-icons/md"
import "../Fabrication Design/TabFabricationTable.css"
import "../Fabrication Design/ImportStyles.css"
import "../Fabrication Design/AddServiceStyles.css"
import "../Fabrication Design/MoveCopyPopups.css"

// API endpoints for different services
const API_BASE_URL_V3 = "http://localhost:5522/api/v3.0" // For OrderFabricationDetails
const API_BASE_URL_V2 = "http://localhost:5522/api/V2.0" // For OrderFabricationImport
const API_ERECTION_URL = "http://localhost:5522/api/v3.0/erection" // For OrderFabricationErection

const TabFabricationTable = () => {
  const [serviceType, setServiceType] = useState("") // Empty by default to show "Select Service Type"
  const [lineNumbers, setLineNumbers] = useState([])
  const [erectionMkds, setErectionMkds] = useState([])
  const [selectedLineNumber, setSelectedLineNumber] = useState("")
  const [selectedErectionMkd, setSelectedErectionMkd] = useState("")
  const [fabricationDetails, setFabricationDetails] = useState([])
  const [loading, setLoading] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentDetail, setCurrentDetail] = useState(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [isServiceTypeOpen, setIsServiceTypeOpen] = useState(false)
  const [isLineDropdownOpen, setIsLineDropdownOpen] = useState(false)
  const [isMarkDropdownOpen, setIsMarkDropdownOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  // Track the current line number sequence
  const [currentLineNumberSequence, setCurrentLineNumberSequence] = useState(1)

  // Import popup states
  const [isImportPopupOpen, setIsImportPopupOpen] = useState(false)
  const [isConfirmPopupOpen, setIsConfirmPopupOpen] = useState(false)
  const [isLoadingPopupOpen, setIsLoadingPopupOpen] = useState(false)
  const [selectedFile, setSelectedFile] = useState(null)
  const fileInputRef = useRef(null)
  let originalContent = "" // Declare originalContent variable

  // Add Service popup states
  const [isAddServicePopupOpen, setIsAddServicePopupOpen] = useState(false)

  // Updated Move to Erection popup states
  const [isMoveToErectionPopupOpen, setIsMoveToErectionPopupOpen] = useState(false)
  const [isMultiSelectOpen, setIsMultiSelectOpen] = useState(false)
  const [selectedMarkNos, setSelectedMarkNos] = useState([])
  const [markNoSearchQuery, setMarkNoSearchQuery] = useState("")
  const [allAvailableErectionMkds, setAllAvailableErectionMkds] = useState([]) // Combined erection mkds from both tables
  const [moveToErectionLoading, setMoveToErectionLoading] = useState(false)

  // New Copy popup states
  const [isCopyPopupOpen, setIsCopyPopupOpen] = useState(false)
  const [copySourceMarkNo, setCopySourceMarkNo] = useState("")
  const [copyTargetMarkNo, setCopyTargetMarkNo] = useState("")
  const [allErectionMkds, setAllErectionMkds] = useState([]) // Combined erection mkds from both tables
  const [copyLoading, setCopyLoading] = useState(false)

  // Add a state for multiple service entries
  const [serviceEntries, setServiceEntries] = useState([
    {
      id: 1,
      erectionMkd: "",
      itemNo: "",
      section: "",
      length: "",
      lengthUom: "MM",
      quantity: "",
      unitPrice: "",
      unitPriceUom: "KG",
      totalQuantity: "",
      totalQuantityUom: "KG",
      repeatedQty: "",
      remark: "Completed",
      lineNumber: "1", // Default to "1"
      lineId: "101", // Default to "101"
    },
  ])

  // Function to format UOM to lowercase for display
  const formatUomForDisplay = (uom) => {
    if (!uom) return ""
    return uom.toLowerCase()
  }

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".orderfabDropdowndetimp")) {
        setIsServiceTypeOpen(false)
        setIsLineDropdownOpen(false)
        setIsMarkDropdownOpen(false)
      }

      // Close multi-select dropdown when clicking outside
      if (!event.target.closest(".multi-select-container")) {
        setIsMultiSelectOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Fetch line numbers and erection marks when service type changes
  useEffect(() => {
    setSelectedLineNumber("")
    setSelectedErectionMkd("")
    // Don't clear fabrication details here to maintain session data
    fetchDistinctLineNumbers()
    fetchDistinctErectionMkds()
  }, [serviceType])

  // Fetch all erection mkds from both tables when component mounts
  useEffect(() => {
    fetchAllErectionMkds()
    fetchAllAvailableErectionMkds()
  }, [])

  // Function to fetch all erection mkds from both OrderFabricationDetails and OrderFabricationImport tables
  const fetchAllErectionMkds = async () => {
    try {
      setLoading(true)

      // Fetch from both tables simultaneously
      const [fabricationDetailsResponse, fabricationImportResponse] = await Promise.all([
        axios.get(`${API_BASE_URL_V3}/loadingfabricatiodetail`).catch(() => ({ data: [] })),
        axios.get(`${API_BASE_URL_V2}/fabrication-by-line`).catch(() => ({ data: { data: [] } })),
      ])

      const combinedErectionMkds = new Set()

      // Extract erection mkds from OrderFabricationDetails
      if (fabricationDetailsResponse.data && Array.isArray(fabricationDetailsResponse.data)) {
        fabricationDetailsResponse.data.forEach((item) => {
          if (item.erectionMkd && item.erectionMkd.trim()) {
            combinedErectionMkds.add(item.erectionMkd.trim())
          }
        })
      }

      // Extract erection mkds from OrderFabricationImport
      const importData = fabricationImportResponse.data?.data || fabricationImportResponse.data || []
      if (Array.isArray(importData)) {
        importData.forEach((item) => {
          if (item.erectionMkd && item.erectionMkd.trim()) {
            combinedErectionMkds.add(item.erectionMkd.trim())
          }
        })
      }

      // Convert Set to sorted array
      const sortedErectionMkds = Array.from(combinedErectionMkds).sort()
      setAllErectionMkds(sortedErectionMkds)

      console.log(`Fetched ${sortedErectionMkds.length} unique erection mkds from both tables`)
    } catch (error) {
      console.error("Error fetching all erection mkds:", error)
      toast.error("Failed to fetch erection mark numbers", {
        position: "top-right",
        autoClose: 3000,
      })
    } finally {
      setLoading(false)
    }
  }

  // Function to fetch available erection mkds for Move to Erection using the backend API
  const fetchAllAvailableErectionMkds = async () => {
    try {
      setLoading(true)

      // Use the existing GET API endpoint to fetch erection mkds from both tables
      const [detailsResponse, importResponse] = await Promise.all([
        axios.get(`${API_ERECTION_URL}/mkds?source=details`).catch(() => ({ data: [] })),
        axios.get(`${API_ERECTION_URL}/mkds?source=import`).catch(() => ({ data: [] })),
      ])

      const combinedErectionMkds = new Set()

      // Add erection mkds from details table
      if (detailsResponse.data && Array.isArray(detailsResponse.data)) {
        detailsResponse.data.forEach((mkd) => {
          if (mkd && mkd.trim()) {
            combinedErectionMkds.add(mkd.trim())
          }
        })
      }

      // Add erection mkds from import table
      if (importResponse.data && Array.isArray(importResponse.data)) {
        importResponse.data.forEach((mkd) => {
          if (mkd && mkd.trim()) {
            combinedErectionMkds.add(mkd.trim())
          }
        })
      }

      // Convert Set to sorted array
      const sortedErectionMkds = Array.from(combinedErectionMkds).sort()
      setAllAvailableErectionMkds(sortedErectionMkds)

      console.log(`Fetched ${sortedErectionMkds.length} available erection mkds for Move to Erection`)
    } catch (error) {
      console.error("Error fetching available erection mkds:", error)
      toast.error("Failed to fetch available erection mark numbers", {
        position: "top-right",
        autoClose: 3000,
      })
    } finally {
      setLoading(false)
    }
  }

  // Function to fetch copied records by erection mkd from both tables
  const fetchCopiedRecords = async (targetMarkNo) => {
    try {
      console.log(`Fetching copied records for mark: ${targetMarkNo}`)
      const copiedRecords = []

      // Fetch from OrderFabricationDetails
      try {
        const fabricationDetailsResponse = await axios.get(
          `${API_BASE_URL_V3}/loadingfabricatiodetail/erection/${targetMarkNo}`,
        )

        console.log("OrderFabricationDetails fetch response:", fabricationDetailsResponse.data)

        if (fabricationDetailsResponse.data) {
          // Handle different response structures
          let records = []
          if (
            fabricationDetailsResponse.data.status === "success" &&
            fabricationDetailsResponse.data.fabricationDetails
          ) {
            records = fabricationDetailsResponse.data.fabricationDetails
          } else if (Array.isArray(fabricationDetailsResponse.data)) {
            records = fabricationDetailsResponse.data
          }

          if (records.length > 0) {
            copiedRecords.push(...records)
            console.log(`Found ${records.length} records in OrderFabricationDetails`)
          }
        }
      } catch (error) {
        console.error("Error fetching from OrderFabricationDetails:", error)
      }

      // Fetch from OrderFabricationImport
      try {
        const fabricationImportResponse = await axios.get(`${API_BASE_URL_V2}/fabrication/erection/${targetMarkNo}`)

        console.log("OrderFabricationImport fetch response:", fabricationImportResponse.data)

        if (
          fabricationImportResponse.data &&
          fabricationImportResponse.data.status === "success" &&
          fabricationImportResponse.data.data
        ) {
          copiedRecords.push(...fabricationImportResponse.data.data)
          console.log(`Found ${fabricationImportResponse.data.data.length} records in OrderFabricationImport`)
        }
      } catch (error) {
        console.error("Error fetching from OrderFabricationImport:", error)
      }

      // Sort by ID descending to show newest first
      copiedRecords.sort((a, b) => {
        const aId = a.id || a.ifaceId || 0
        const bId = b.id || b.ifaceId || 0
        return bId - aId
      })

      console.log(`Total copied records found: ${copiedRecords.length}`)
      return copiedRecords
    } catch (error) {
      console.error("Error fetching copied records:", error)
      return []
    }
  }

  // Fetch distinct line numbers based on selected service type
  const fetchDistinctLineNumbers = async () => {
    try {
      setLoading(true)
      let response

      if (serviceType === "add") {
        // Fetch from OrderFabricationDetails
        response = await axios.get(`${API_BASE_URL_V3}/loadingfabricatiodetail`)
      } else if (serviceType === "import") {
        // Fetch from OrderFabricationImport
        response = await axios.get(`${API_BASE_URL_V2}/fabrication-by-line`)
      } else {
        // If no service type is selected, don't fetch anything
        setLoading(false)
        return
      }

      if (response.data) {
        let data = response.data

        // Handle different response structures
        if (serviceType === "import" && response.data.data) {
          data = response.data.data
        }

        // Extract unique line numbers
        const uniqueLineNumbers = [
          ...new Set(data.filter((item) => item.lineNumber).map((item) => item.lineNumber.toString())),
        ].sort((a, b) => Number.parseFloat(a) - Number.parseFloat(b))

        setLineNumbers(uniqueLineNumbers)
      }
      setLoading(false)
    } catch (error) {
      console.error("Error fetching line numbers:", error)
      toast.error("Failed to fetch line numbers", {
        position: "top-right",
        autoClose: 3000,
      })
      setLoading(false)
    }
  }

  // Fetch distinct erection marks based on selected service type
  const fetchDistinctErectionMkds = async () => {
    try {
      setLoading(true)
      let response

      if (serviceType === "add") {
        // Fetch from OrderFabricationDetails
        response = await axios.get(`${API_BASE_URL_V3}/loadingfabricatiodetail`)
      } else if (serviceType === "import") {
        // Fetch from OrderFabricationImport
        response = await axios.get(`${API_BASE_URL_V2}/fabrication-by-line`)
      } else {
        // If no service type is selected, don't fetch anything
        setLoading(false)
        return
      }

      if (response.data) {
        let data = response.data

        // Handle different response structures
        if (serviceType === "import" && response.data.data) {
          data = response.data.data
        }

        // Extract unique erection marks
        const uniqueErectionMkds = [
          ...new Set(data.filter((item) => item.erectionMkd).map((item) => item.erectionMkd)),
        ].sort()

        setErectionMkds(uniqueErectionMkds)
      }
      setLoading(false)
    } catch (error) {
      console.error("Error fetching erection marks:", error)
      toast.error("Failed to fetch erection marks", {
        position: "top-right",
        autoClose: 3000,
      })
      setLoading(false)
    }
  }

  // Fetch latest imported data
  const fetchLatestImportedData = async () => {
    try {
      setLoading(true)
      console.log("Fetching latest imported data...")

      // Use the latest-imported endpoint to get the most recent imports
      const response = await axios.get(`${API_BASE_URL_V2}/latest-imported`)
      console.log("Latest imported data response:", response.data)

      if (response.data && response.data.data && response.data.data.length > 0) {
        // Set the fabrication details with the latest imported data
        // Always add the new data at the top
        setFabricationDetails((prevData) => [...response.data.data, ...prevData])

        toast.success(`Loaded ${response.data.data.length} recently imported records`, {
          position: "top-right",
          autoClose: 3000,
        })
      } else {
        toast.info("No imported data found", {
          position: "top-right",
          autoClose: 3000,
        })
      }
    } catch (error) {
      console.error("Error fetching latest imported data:", error)
      toast.error("Failed to fetch latest imported data", {
        position: "top-right",
        autoClose: 3000,
      })
    } finally {
      setLoading(false)
    }
  }

  // Handle search button click
  const handleSearch = async () => {
    if (!selectedLineNumber || !selectedErectionMkd) {
      toast.warning("Please select both Line No and Mark No to search", {
        position: "top-right",
        autoClose: 3000,
      })
      return
    }

    setLoading(true)

    try {
      let response

      // Determine which API to call based on service type and available parameters
      if (serviceType === "add") {
        // Search in OrderFabricationDetails
        if (selectedLineNumber && selectedErectionMkd) {
          // Search by both line and erection
          response = await axios.get(
            `${API_BASE_URL_V3}/loadingfabricatiodetail/line/${selectedLineNumber}/erection/${selectedErectionMkd}`,
          )
        } else if (selectedErectionMkd) {
          // Search by erection only
          response = await axios.get(`${API_BASE_URL_V3}/loadingfabricatiodetail/erection/${selectedErectionMkd}`)
        } else if (selectedLineNumber) {
          // Search by line only
          response = await axios.get(`${API_BASE_URL_V3}/loadingfabricatiodetail/line/${selectedLineNumber}`)
        }

        if (response.data && response.data.status === "success") {
          // Add a small delay to show loading state
          await new Promise((resolve) => setTimeout(resolve, 800))

          // Sort the data to show the latest added records first
          const sortedData = response.data.fabricationDetails
            ? [...response.data.fabricationDetails].sort((a, b) => b.id - a.id)
            : []

          setFabricationDetails(sortedData)

          if (sortedData.length > 0) {
            toast.success(`Found ${sortedData.length} fabrication details`, {
              position: "top-right",
              autoClose: 3000,
            })
          } else {
            toast.info("No fabrication details found", {
              position: "top-right",
              autoClose: 3000,
            })
          }
        } else {
          toast.error(response.data?.message || "Failed to load data", {
            position: "top-right",
            autoClose: 3000,
          })
          setFabricationDetails([])
        }
      } else if (serviceType === "import") {
        // Search in OrderFabricationImport
        if (selectedLineNumber && selectedErectionMkd) {
          // Search by both line and erection
          response = await axios.get(
            `${API_BASE_URL_V2}/fabrication/line/${selectedLineNumber}/erection/${selectedErectionMkd}`,
          )
        } else if (selectedErectionMkd) {
          // Search by erection only
          response = await axios.get(`${API_BASE_URL_V2}/fabrication/erection/${selectedErectionMkd}`)
        } else if (selectedLineNumber) {
          // Search by line only
          response = await axios.get(`${API_BASE_URL_V2}/fabrication/line/${selectedLineNumber}`)
        }

        if (response.data && response.data.status === "success") {
          // Add a small delay to show loading state
          await new Promise((resolve) => setTimeout(resolve, 800))

          // Sort the data to show the latest added records first
          const sortedData = response.data.data ? [...response.data.data].sort((a, b) => b.id - a.id) : []

          setFabricationDetails(sortedData)

          if (sortedData.length > 0) {
            toast.success(`Found ${sortedData.length} fabrication details`, {
              position: "top-right",
              autoClose: 3000,
            })
          } else {
            toast.info("No fabrication details found", {
              position: "top-right",
              autoClose: 3000,
            })
          }
        } else {
          toast.error(response.data?.message || "Failed to load data", {
            position: "top-right",
            autoClose: 3000,
          })
          setFabricationDetails([])
        }
      } else {
        toast.warning("Please select a service type first", {
          position: "top-right",
          autoClose: 3000,
        })
      }
    } catch (error) {
      console.error("Error fetching fabrication details:", error)
      toast.error("Failed to fetch fabrication details", {
        position: "top-right",
        autoClose: 3000,
      })
      setFabricationDetails([])
    } finally {
      setLoading(false)
      setCurrentPage(1)
    }
  }

  // Handle refresh button click
  const handleRefresh = () => {
    setFabricationDetails([])
    setSelectedLineNumber("")
    setSelectedErectionMkd("")
    setSearchQuery("")
    toast.info("Data cleared", {
      position: "top-right",
      autoClose: 2000,
    })
  }

  // Handle edit button click
  const handleEdit = (detail) => {
    setCurrentDetail({ ...detail })
    setIsEditDialogOpen(true)
  }

  // Handle delete button click
  const handleDelete = (detail) => {
    setCurrentDetail(detail)
    setIsDeleteDialogOpen(true)
  }

  // Handle confirm delete
  const confirmDelete = async () => {
    if (!currentDetail) return

    setLoading(true)

    try {
      if (serviceType === "add") {
        // Delete from OrderFabricationDetails
        await axios.delete(`${API_BASE_URL_V3}/deletefabricationdetails/${currentDetail.id}`)
      } else {
        // Delete from OrderFabricationImport
        await axios.delete(`${API_BASE_URL_V2}/fabrication/${currentDetail.ifaceId || currentDetail.id}`)
      }

      // Remove the deleted item from the local state
      setFabricationDetails(
        fabricationDetails.filter((detail) =>
          serviceType === "add" ? detail.id !== currentDetail.id : detail.ifaceId !== currentDetail.ifaceId,
        ),
      )

      // Show success message
      toast.success("Fabrication detail deleted successfully", {
        position: "top-right",
        autoClose: 3000,
      })
    } catch (error) {
      console.error("Error deleting fabrication detail:", error)
      toast.error("Failed to delete fabrication detail", {
        position: "top-right",
        autoClose: 3000,
      })
    } finally {
      setIsDeleteDialogOpen(false)
      setCurrentDetail(null)
      setLoading(false)
    }
  }

  // Handle save edited detail
  const saveEditedDetail = async () => {
    if (!currentDetail) return

    setLoading(true)

    try {
      let response

      if (serviceType === "add") {
        // Update OrderFabricationDetails
        response = await axios.put(`${API_BASE_URL_V3}/updatefabricationdetails/${currentDetail.id}`, currentDetail)

        // Update the local state with the edited detail
        setFabricationDetails(
          fabricationDetails.map((detail) => (detail.id === currentDetail.id ? response.data : detail)),
        )
      } else {
        // For OrderFabricationImport, we would need a different endpoint
        response = await axios.put(
          `${API_BASE_URL_V2}/update-fabrication/${currentDetail.ifaceId || currentDetail.id}`,
          currentDetail,
        )

        // Update the local state with the edited detail
        setFabricationDetails(
          fabricationDetails.map((detail) =>
            detail.ifaceId === currentDetail.ifaceId || detail.id === currentDetail.id ? response.data : detail,
          ),
        )
      }

      // Show success message
      toast.success("Fabrication detail updated successfully", {
        position: "top-right",
        autoClose: 3000,
      })
    } catch (error) {
      console.error("Error updating fabrication detail:", error)
      toast.error("Failed to update fabrication detail", {
        position: "top-right",
        autoClose: 3000,
      })
    } finally {
      setIsEditDialogOpen(false)
      setCurrentDetail(null)
      setLoading(false)
    }
  }

  // Handle input change in edit form
  const handleInputChange = (e) => {
    if (!currentDetail) return

    const { name, value } = e.target

    // Handle numeric fields
    if (["length", "quantity", "unitPrice", "totalQuantity", "repeatedQty"].includes(name)) {
      setCurrentDetail({
        ...currentDetail,
        [name]: value === "" ? "" : Number.parseFloat(value),
      })
    } else {
      setCurrentDetail({
        ...currentDetail,
        [name]: value,
      })
    }
  }

  // Handle select change in edit form
  const handleSelectChange = (name, value) => {
    if (!currentDetail) return

    setCurrentDetail({
      ...currentDetail,
      [name]: value,
    })
  }

  // Handle service type change
  const handleServiceTypeChange = (type) => {
    setServiceType(type)
    setIsServiceTypeOpen(false)

    // Remove the automatic data fetching when switching to import type
    // If switching to import type, fetch the latest imported data
    // if (type === "import") {
    //   fetchLatestImportedData()
    // }
  }

  // Import functionality
  const handleImportClick = () => {
    setIsImportPopupOpen(true)
  }

  // Calculate line ID based on line number
  const calculateLineId = (lineNumber) => {
    // Convert lineNumber to a number, add 100, and return as string
    return (Number(lineNumber) + 100).toString()
  }

  // Add Service functionality
  const handleAddServiceClick = () => {
    // Use the current sequence number for the line number
    const lineNumber = currentLineNumberSequence.toString()
    const lineId = calculateLineId(lineNumber)

    // Reset the service entries to a single empty entry
    setServiceEntries([
      {
        id: 1,
        erectionMkd: "",
        itemNo: "",
        section: "",
        length: "",
        lengthUom: "MM",
        quantity: "",
        unitPrice: "",
        unitPriceUom: "KG",
        totalQuantity: "",
        totalQuantityUom: "KG",
        repeatedQty: "",
        remark: "Completed",
        lineNumber: lineNumber,
        lineId: lineId,
      },
    ])

    // Open the popup
    setIsAddServicePopupOpen(true)
  }

  // Function to add more service entries
  const addMoreServices = () => {
    const newId = serviceEntries.length > 0 ? Math.max(...serviceEntries.map((e) => e.id)) + 1 : 1

    // Use the current sequence number for the line number
    const lineNumber = currentLineNumberSequence.toString()
    const lineId = calculateLineId(lineNumber)

    setServiceEntries((prev) => [
      ...prev,
      {
        id: newId,
        erectionMkd: "",
        itemNo: "",
        section: "",
        length: "",
        lengthUom: "MM",
        quantity: "",
        unitPrice: "",
        unitPriceUom: "KG",
        totalQuantity: "",
        totalQuantityUom: "KG",
        repeatedQty: "",
        remark: "Completed",
        lineNumber: lineNumber,
        lineId: lineId,
      },
    ])
  }

  // Function to handle input changes in the add service popup
  const handleAddServiceInputChange = (e, id) => {
    const { name, value } = e.target
    setServiceEntries((prev) =>
      prev.map((entry) => {
        if (entry.id === id) {
          // Handle numeric fields
          if (["length", "quantity", "unitPrice", "totalQuantity", "repeatedQty"].includes(name)) {
            return { ...entry, [name]: value === "" ? "" : Number.parseFloat(value) }
          } else {
            return { ...entry, [name]: value }
          }
        }
        return entry
      }),
    )
  }

  // Function to handle select changes in the add service popup
  const handleAddServiceSelectChange = (e, id) => {
    const { name, value } = e.target
    setServiceEntries((prev) => prev.map((entry) => (entry.id === id ? { ...entry, [name]: value } : entry)))
  }

  // Function to handle line number changes in the add service popup
  const handleLineNumberChange = (e, id) => {
    const { value } = e.target
    const calculatedLineId = calculateLineId(value)
    setServiceEntries((prev) =>
      prev.map((entry) => (entry.id === id ? { ...entry, lineNumber: value, lineId: calculatedLineId } : entry)),
    )
  }

  // Function to fetch a specific record by ID
  const fetchRecordById = async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL_V3}/loadingfabricatiodetail/${id}`)
      if (response.data) {
        return response.data
      }
      return null
    } catch (error) {
      console.error(`Error fetching record with ID ${id}:`, error)
      return null
    }
  }

  // Function to handle saving the added service
  const handleAddServiceSave = async () => {
    // Validate required fields
    const invalidEntries = serviceEntries.filter((entry) => !entry.erectionMkd || !entry.itemNo || !entry.section)

    if (invalidEntries.length > 0) {
      toast.warning("Please fill in all required fields (Erection Mkd, Item No, Section) for all entries", {
        position: "top-right",
        autoClose: 3000,
      })
      return
    }

    setLoading(true)

    try {
      // Use the current sequence number for the line number
      const lineNumber = currentLineNumberSequence.toString()
      // Calculate line ID as lineNumber + 100
      const lineId = calculateLineId(lineNumber)

      // Track newly added records
      const newlyAddedRecords = []

      // If there's only one entry, send it directly as an object
      if (serviceEntries.length === 1) {
        const entry = serviceEntries[0]
        // Format the data for the API - send as a single object
        const formattedEntry = {
          erectionMkd: entry.erectionMkd,
          itemNo: entry.itemNo,
          section: entry.section,
          length: entry.length ? Number.parseFloat(entry.length) : null,
          lengthUom: entry.lengthUom,
          quantity: entry.quantity ? Number.parseFloat(entry.quantity) : null,
          unitPrice: entry.unitPrice ? Number.parseFloat(entry.unitPrice) : null,
          unitPriceUom: entry.unitPriceUom,
          totalQuantity: entry.totalQuantity ? Number.parseFloat(entry.totalQuantity) : null,
          totalQuantityUom: entry.totalQuantityUom,
          repeatedQty: entry.repeatedQty ? Number.parseFloat(entry.repeatedQty) : null,
          remark: entry.remark,
          // Add line number and IDs with the new format
          lineNumber: lineNumber,
          lineId: lineId,
          origLineNumber: lineNumber, // Original line number
          origLineId: lineId, // Original line ID
        }

        // Make API call to save the single service
        const response = await axios.post(`${API_BASE_URL_V3}/sendfabricationdetails`, formattedEntry)

        if (response.status === 200 || response.status === 201) {
          // Get the newly added record
          if (response.data && response.data.id) {
            const newRecord = await fetchRecordById(response.data.id)
            if (newRecord) {
              newlyAddedRecords.push(newRecord)
            }
          }

          // Close the popup
          setIsAddServicePopupOpen(false)

          // Show success message
          toast.success("Service added successfully and stored in database", {
            position: "top-right",
            autoClose: 3000,
          })

          // Increment the line number sequence for the next service
          setCurrentLineNumberSequence((prev) => prev + 1)

          // Add the newly added record to the fabrication details at the top
          if (newlyAddedRecords.length > 0) {
            setFabricationDetails((prev) => [...newlyAddedRecords, ...prev])
          }

          // Refresh the erection mkds list to include the new one
          fetchAllErectionMkds()
          fetchAllAvailableErectionMkds()
        } else {
          toast.error("Failed to add service to database", {
            position: "top-right",
            autoClose: 3000,
          })
        }
      } else {
        // For multiple entries, we need to send them one by one
        let successCount = 0

        // Process each entry individually
        for (const entry of serviceEntries) {
          // Format the data for the API - send as a single object
          const formattedEntry = {
            erectionMkd: entry.erectionMkd,
            itemNo: entry.itemNo,
            section: entry.section,
            length: entry.length ? Number.parseFloat(entry.length) : null,
            lengthUom: entry.lengthUom,
            quantity: entry.quantity ? Number.parseFloat(entry.quantity) : null,
            unitPrice: entry.unitPrice ? Number.parseFloat(entry.unitPrice) : null,
            unitPriceUom: entry.unitPriceUom,
            totalQuantity: entry.totalQuantity ? Number.parseFloat(entry.totalQuantity) : null,
            totalQuantityUom: entry.totalQuantityUom,
            repeatedQty: entry.repeatedQty ? Number.parseFloat(entry.repeatedQty) : null,
            remark: entry.remark,
            // Add line number and IDs with the new format
            lineNumber: lineNumber,
            lineId: lineId,
            origLineNumber: lineNumber, // Original line number
            origLineId: lineId, // Original line ID
          }

          try {
            // Make API call to save each service individually
            const response = await axios.post(`${API_BASE_URL_V3}/sendfabricationdetails`, formattedEntry)

            if (response.status === 200 || response.status === 201) {
              successCount++

              // Get the newly added record
              if (response.data && response.data.id) {
                const newRecord = await fetchRecordById(response.data.id)
                if (newRecord) {
                  newlyAddedRecords.push(newRecord)
                }
              }
            }
          } catch (entryError) {
            console.error(`Error adding service entry ${entry.id}:`, entryError)
            // Continue with the next entry even if this one fails
          }
        }

        if (successCount > 0) {
          // Close the popup
          setIsAddServicePopupOpen(false)

          // Show success message
          toast.success(`${successCount} out of ${serviceEntries.length} service(s) added successfully`, {
            position: "top-right",
            autoClose: 3000,
          })

          // Increment the line number sequence for the next service
          setCurrentLineNumberSequence((prev) => prev + 1)

          // Add the newly added records to the fabrication details at the top
          if (newlyAddedRecords.length > 0) {
            setFabricationDetails((prev) => [...newlyAddedRecords, ...prev])
          }

          // Refresh the erection mkds list to include the new ones
          fetchAllErectionMkds()
          fetchAllAvailableErectionMkds()
        } else {
          toast.error("Failed to add any services to database", {
            position: "top-right",
            autoClose: 3000,
          })
        }
      }
    } catch (error) {
      console.error("Error adding services:", error)
      toast.error(`Failed to add services: ${error.response?.data?.message || error.message}`, {
        position: "top-right",
        autoClose: 5000,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0])
    }
  }

  const handleUploadClick = () => {
    fileInputRef.current.click()
  }

  const handleImportSave = () => {
    if (selectedFile) {
      setIsImportPopupOpen(false)
      setIsConfirmPopupOpen(true)
    } else {
      toast.warning("Please select a file first", {
        position: "top-right",
        autoClose: 3000,
      })
    }
  }

  // Modify the handleImportConfirm function to only display the newly imported records
  const handleImportConfirm = async () => {
    // Don't close the confirm popup, just show loading inside it
    // setIsConfirmPopupOpen(false);
    // setIsLoadingPopupOpen(true);

    // Instead, show loading state inside the confirm popup
    const confirmPopup = document.querySelector(".tiger-modal-body")
    if (confirmPopup) {
      // Save the original content
      originalContent = confirmPopup.innerHTML

      // Replace with loading indicator
      confirmPopup.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
        <div style="font-size: 50px; color: #007bff; animation: panda-spin 1s linear infinite; margin-bottom: 24px;">
          <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
          </svg>
        </div>
        <div style="font-size: 18px; color: #333; text-align: center; font-weight: 500;">
          Importing data from Excel file...
        </div>
      </div>
    `
    }

    // Create form data for file upload
    const formData = new FormData()
    formData.append("file", selectedFile)

    try {
      // Simulate loading for 3 seconds as requested
      await new Promise((resolve) => setTimeout(resolve, 3000))

      // Make API call to import the Excel file
      const response = await axios.post(`${API_BASE_URL_V2}/imports`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      // Handle the response
      if (response.data && response.data.status === "success") {
        // Close the confirm popup
        setIsConfirmPopupOpen(false)

        // Add this line to show a message instructing the user to search:
        toast.info("Import successful. Please select Line No and Mark No to view the imported data.", {
          position: "top-right",
          autoClose: 5000,
        })

        // Refresh the erection mkds list to include newly imported ones
        fetchAllErectionMkds()
        fetchAllAvailableErectionMkds()

        // And remove or comment out the code that automatically displays data:
        // if (response.data.data && response.data.data.length > 0) {
        //   console.log("Displaying newly imported records:", response.data.data.length)
        //   setFabricationDetails((prevData) => [...response.data.data, ...prevData])
        //   ...
        // } else {
        //   console.log("API didn't return imported data, fetching latest batch...")
        //   await fetchLatestImportBatch()
        // }
      } else {
        // Restore the original content of the confirm popup
        if (confirmPopup) {
          confirmPopup.innerHTML = originalContent
        }

        toast.error(response.data?.message || "Failed to import file", {
          position: "top-right",
          autoClose: 5000,
        })
      }
    } catch (error) {
      // Restore the original content of the confirm popup
      if (confirmPopup) {
        confirmPopup.innerHTML = originalContent
      }

      console.error("Error importing Excel file:", error)
      toast.error(`Failed to import file: ${error.response?.data?.message || error.message}`, {
        position: "top-right",
        autoClose: 5000,
      })
    } finally {
      // Close the confirm popup if it's still open
      setIsConfirmPopupOpen(false)
      setSelectedFile(null)
    }
  }

  // Add a new function to fetch only the latest batch of imported records
  const fetchLatestImportBatch = async () => {
    try {
      setLoading(true)
      console.log("Fetching latest import batch...")

      // Use the latest-imported endpoint but we'll only take the most recent batch
      // (records with the same timestamp or batch ID)
      const response = await axios.get(`${API_BASE_URL_V2}/latest-imported`)
      console.log("Latest imported data response received:", response.data)

      if (response.data && response.data.data && response.data.data.length > 0) {
        // The backend should return records sorted by newest first
        // We'll identify the latest batch by looking at the first record's timestamp
        // and only include records from that same batch
        const latestRecords = response.data.data
        console.log("Latest records count:", latestRecords.length)

        // Assuming records from the same import batch have the same createdAt timestamp
        // or some other identifier like batchId
        if (latestRecords[0].createdAt) {
          const latestTimestamp = latestRecords[0].createdAt
          const latestBatch = latestRecords.filter((record) => record.createdAt === latestTimestamp)

          console.log(`Found ${latestBatch.length} records in the latest import batch`)

          // Add the new data at the top of the existing data
          setFabricationDetails((prevData) => {
            // Filter out any duplicates that might already exist
            const existingData = prevData.filter(
              (item) =>
                !latestBatch.some(
                  (newItem) =>
                    (newItem.id && newItem.id === item.id) || (newItem.ifaceId && newItem.ifaceId === item.ifaceId),
                ),
            )
            return [...latestBatch, ...existingData]
          })

          // Force a DOM update with a small delay
          setTimeout(() => {
            console.log("Forcing re-render after timeout")
            // Use a functional update to ensure we're working with the latest state
            setFabricationDetails((prevData) => {
              console.log("Previous data in timeout:", prevData.length)
              // Create a new array reference to ensure React detects the change
              return [...prevData]
            })

            // Force browser reflow
            document.body.offsetHeight

            // Update UI by triggering a state change that will cause a re-render
            setCurrentPage(1)
          }, 100)

          toast.success(`Displaying ${latestBatch.length} recently imported records`, {
            position: "top-right",
            autoClose: 3000,
          })
        } else {
          // If there's no timestamp to identify the batch, just take the first 20 records
          // as they should be the most recent ones
          const latestBatch = latestRecords.slice(0, 20)
          console.log(`No timestamp found, displaying the ${latestBatch.length} most recent records`)

          // Add the new data at the top of the existing data
          setFabricationDetails((prevData) => {
            // Filter out any duplicates that might already exist
            const existingData = prevData.filter(
              (item) =>
                !latestBatch.some(
                  (newItem) =>
                    (newItem.id && newItem.id === item.id) || (newItem.ifaceId && newItem.ifaceId === item.ifaceId),
                ),
            )
            return [...latestBatch, ...existingData]
          })

          // Force a DOM update with a small delay
          setTimeout(() => {
            // Use functional update to ensure we're working with the latest state
            setFabricationDetails((prevData) => {
              // Create a new array reference to ensure React detects the change
              return [...prevData]
            })

            // Force browser reflow
            document.body.offsetHeight

            // Update UI by triggering a state change that will cause a re-render
            setCurrentPage(1)
          }, 100)

          toast.success(`Displaying ${latestBatch.length} recently imported records`, {
            position: "top-right",
            autoClose: 3000,
          })
        }
      } else {
        toast.info("No imported data found", {
          position: "top-right",
          autoClose: 3000,
        })
      }
    } catch (error) {
      console.error("Error fetching latest import batch:", error)
      toast.error("Failed to fetch latest imported data", {
        position: "top-right",
        autoClose: 3000,
      })
    } finally {
      setLoading(false)
    }
  }

  // Add this useEffect to ensure the table updates when fabricationDetails changes
  // Add this near the top of the component with the other useEffect hooks
  useEffect(() => {
    console.log("fabricationDetails changed, length:", fabricationDetails.length)
    // Force a re-render when fabricationDetails changes
    if (fabricationDetails.length > 0) {
      // Force browser reflow
      document.body.offsetHeight
    }
  }, [fabricationDetails])

  // Filter fabrication details based on search query
  const filteredDetails = fabricationDetails.filter((detail) => {
    if (!searchQuery) return true

    const query = searchQuery.toLowerCase()
    return (
      (detail.erectionMkd && detail.erectionMkd.toLowerCase().includes(query)) ||
      (detail.itemNo && detail.itemNo.toLowerCase().includes(query)) ||
      (detail.section && detail.section.toLowerCase().includes(query)) ||
      (detail.remark && detail.remark.toLowerCase().includes(query))
    )
  })

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredDetails.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredDetails.length / itemsPerPage)

  // Get remark style based on content
  const getRemarkStyle = (remark) => {
    if (!remark) return ""

    const lowerRemark = remark.toLowerCase()
    if (lowerRemark.includes("completed")) {
      return "orderfabRemarkCompleteddetimp"
    } else if (lowerRemark.includes("not completed")) {
      return "orderfabRemarkNotCompleteddetimp"
    } else {
      return "orderfabRemarkCompleteddetimp" // Default to completed for any other text
    }
  }

  // Handle Move to Erection button click
  const handleMoveToErectionClick = () => {
    // Reset selected mark numbers
    setSelectedMarkNos([])
    setMarkNoSearchQuery("")
    // Refresh available erection mkds before opening popup
    fetchAllAvailableErectionMkds()
    setIsMoveToErectionPopupOpen(true)
  }

  // Handle Copy button click
  const handleCopyClick = () => {
    setCopySourceMarkNo("")
    setCopyTargetMarkNo("")
    setIsCopyPopupOpen(true)
  }

  // Handle multi-select toggle
  const toggleMultiSelect = () => {
    setIsMultiSelectOpen(!isMultiSelectOpen)
  }

  // Handle mark no selection in multi-select
  const handleMarkNoSelect = (markNo) => {
    if (selectedMarkNos.includes(markNo)) {
      setSelectedMarkNos(selectedMarkNos.filter((item) => item !== markNo))
    } else {
      setSelectedMarkNos([...selectedMarkNos, markNo])
    }
  }

  // Handle remove mark no from selection
  const handleRemoveMarkNo = (markNo) => {
    setSelectedMarkNos(selectedMarkNos.filter((item) => item !== markNo))
  }

  // Filter mark nos for multi-select dropdown
  const filteredMarkNos = allAvailableErectionMkds.filter((markNo) =>
    markNo.toLowerCase().includes(markNoSearchQuery.toLowerCase()),
  )

  // Updated Handle save for Move to Erection with proper API integration
  const handleMoveToErectionSave = async () => {
    if (selectedMarkNos.length === 0) {
      toast.warning("Please select at least one Mark No.", {
        position: "top-right",
        autoClose: 3000,
      })
      return
    }

    setMoveToErectionLoading(true)

    try {
      // Determine the source based on current service type
      let source = "details" // Default to details
      if (serviceType === "import") {
        source = "import"
      } else if (serviceType === "add") {
        source = "details"
      }

      // Prepare the request payload
      const requestPayload = {
        source: source,
        erectionMkds: selectedMarkNos,
      }

      console.log("Moving to erection with payload:", requestPayload)

      // Call the POST API to store erection mkds
      const response = await axios.post(`${API_ERECTION_URL}/mkds`, requestPayload)

      console.log("Move to erection response:", response.data)

      if (response.status === 200 || response.status === 201) {
        // Show success message
        toast.success(`Successfully moved ${selectedMarkNos.length} mark(s) to erection`, {
          position: "top-right",
          autoClose: 3000,
        })

        // Close the popup
        setIsMoveToErectionPopupOpen(false)

        // Reset selected mark numbers
        setSelectedMarkNos([])

        // Refresh the available erection mkds list
        fetchAllAvailableErectionMkds()

        // Optional: Refresh the current fabrication details if needed
        if (selectedLineNumber && selectedErectionMkd) {
          setTimeout(() => {
            handleSearch()
          }, 1000)
        }

        // Notify parent component or trigger erection table refresh
        // You can add a callback here to notify the dashboard to refresh erection table
        if (window.refreshErectionTable) {
          window.refreshErectionTable()
        }
      } else {
        toast.error("Failed to move marks to erection", {
          position: "top-right",
          autoClose: 3000,
        })
      }
    } catch (error) {
      console.error("Error moving to erection:", error)
      toast.error(`Failed to move to erection: ${error.response?.data?.message || error.message}`, {
        position: "top-right",
        autoClose: 5000,
      })
    } finally {
      setMoveToErectionLoading(false)
    }
  }

  // Handle save for Copy - Updated with proper error handling and frontend display
  const handleCopySave = async () => {
    if (!copySourceMarkNo) {
      toast.warning("Please select a source Mark No.", {
        position: "top-right",
        autoClose: 3000,
      })
      return
    }

    if (!copyTargetMarkNo) {
      toast.warning("Please enter a target Mark No.", {
        position: "top-right",
        autoClose: 3000,
      })
      return
    }

    if (copySourceMarkNo === copyTargetMarkNo) {
      toast.warning("Source and target Mark No. cannot be the same.", {
        position: "top-right",
        autoClose: 3000,
      })
      return
    }

    setCopyLoading(true)

    try {
      let totalCopiedCount = 0
      const copyResults = []
      let copySuccessful = false

      // Copy from OrderFabricationDetails table
      try {
        console.log(`Attempting to copy from OrderFabricationDetails: ${copySourceMarkNo} -> ${copyTargetMarkNo}`)
        const fabricationDetailsResponse = await axios.post(`${API_BASE_URL_V3}/copyerectionmkd`, null, {
          params: {
            sourceMarkNo: copySourceMarkNo,
            newMarkNo: copyTargetMarkNo,
          },
        })

        console.log("OrderFabricationDetails copy response:", fabricationDetailsResponse.data)

        if (fabricationDetailsResponse.data) {
          const message = fabricationDetailsResponse.data
          // Extract count from message like "Successfully copied 5 records from A-11 to A-12"
          const countMatch = message.match(/Successfully copied (\d+) records/)
          if (countMatch) {
            const count = Number.parseInt(countMatch[1])
            totalCopiedCount += count
            copyResults.push(`OrderFabricationDetails: ${count} records`)
            if (count > 0) copySuccessful = true
          } else if (message.toLowerCase().includes("success")) {
            // If message contains success but no count, assume at least 1 record
            copyResults.push("OrderFabricationDetails: Success")
            copySuccessful = true
          }
        }
      } catch (error) {
        console.error("Error copying from OrderFabricationDetails:", error)
        copyResults.push("OrderFabricationDetails: Failed to copy")
      }

      // Copy from OrderFabricationImport table
      try {
        console.log(`Attempting to copy from OrderFabricationImport: ${copySourceMarkNo} -> ${copyTargetMarkNo}`)
        const fabricationImportResponse = await axios.post(`${API_BASE_URL_V2}/copyimporterectionmkd`, null, {
          params: {
            sourceMarkNo: copySourceMarkNo,
            newMarkNo: copyTargetMarkNo,
          },
        })

        console.log("OrderFabricationImport copy response:", fabricationImportResponse.data)

        if (fabricationImportResponse.data) {
          const message = fabricationImportResponse.data
          // Extract count from message like "Successfully copied 3 records from A-11 to A-12"
          const countMatch = message.match(/Successfully copied (\d+) records/)
          if (countMatch) {
            const count = Number.parseInt(countMatch[1])
            totalCopiedCount += count
            copyResults.push(`OrderFabricationImport: ${count} records`)
            if (count > 0) copySuccessful = true
          } else if (message.toLowerCase().includes("success")) {
            // If message contains success but no count, assume at least 1 record
            copyResults.push("OrderFabricationImport: Success")
            copySuccessful = true
          }
        }
      } catch (error) {
        console.error("Error copying from OrderFabricationImport:", error)
        copyResults.push("OrderFabricationImport: Failed to copy")
      }

      // Show results based on whether copy was successful
      if (copySuccessful || totalCopiedCount > 0) {
        // Show success message
        const successMessage =
          totalCopiedCount > 0
            ? `Successfully copied ${totalCopiedCount} total records from ${copySourceMarkNo} to ${copyTargetMarkNo}`
            : `Successfully copied records from ${copySourceMarkNo} to ${copyTargetMarkNo}`

        toast.success(successMessage, {
          position: "top-right",
          autoClose: 5000,
        })

        // Refresh the erection mkds list to include the new copied mark
        fetchAllErectionMkds()
        fetchAllAvailableErectionMkds()

        // Wait a moment for the database to be updated, then fetch the copied records
        console.log("Waiting for database update before fetching copied records...")
        await new Promise((resolve) => setTimeout(resolve, 1500))

        // Fetch and display the newly copied records in the frontend table
        console.log("Fetching copied records to display in table...")
        const copiedRecords = await fetchCopiedRecords(copyTargetMarkNo)

        if (copiedRecords.length > 0) {
          console.log(`Found ${copiedRecords.length} copied records to display`)

          // Add the copied records to the top of the existing fabrication details
          setFabricationDetails((prevData) => {
            // Filter out any duplicates that might already exist
            const existingData = prevData.filter(
              (item) =>
                !copiedRecords.some(
                  (newItem) =>
                    (newItem.id && newItem.id === item.id) ||
                    (newItem.ifaceId && newItem.ifaceId === item.ifaceId) ||
                    (item.ifaceId && newItem.id === item.ifaceId) ||
                    (item.id && newItem.ifaceId === item.id),
                ),
            )
            return [...copiedRecords, ...existingData]
          })

          // Reset to first page to show the new records
          setCurrentPage(1)

          // Show additional success message about displaying records
          setTimeout(() => {
            toast.info(`Displaying ${copiedRecords.length} copied records in the table`, {
              position: "top-right",
              autoClose: 3000,
            })
          }, 1000)

          console.log(`Successfully added ${copiedRecords.length} copied records to the frontend table`)
        } else {
          console.log("No copied records found to display, but copy operation was successful")
          // Even if we can't fetch the records immediately, the copy was successful
          toast.info("Copy operation completed successfully. Records may take a moment to appear.", {
            position: "top-right",
            autoClose: 4000,
          })
        }

        // If we're currently viewing data that matches the source mark, refresh the view
        if (selectedErectionMkd === copySourceMarkNo && selectedLineNumber) {
          setTimeout(() => {
            console.log("Refreshing current search view...")
            handleSearch()
          }, 2000)
        }
      } else {
        // Only show "no records found" if both operations explicitly failed
        toast.warning(`No records found to copy for mark number: ${copySourceMarkNo}`, {
          position: "top-right",
          autoClose: 4000,
        })
      }

      // Close the popup
      setIsCopyPopupOpen(false)
    } catch (error) {
      console.error("Error during copy operation:", error)
      toast.error(`Failed to copy records: ${error.response?.data?.message || error.message}`, {
        position: "top-right",
        autoClose: 5000,
      })
    } finally {
      setCopyLoading(false)
    }
  }

  return (
    <div className="orderfabContainerdetimp">
      <div className="orderfabHeaderdetimp">
        <div className="orderfabHeaderTitledetimp">
          <h3>Search for Fabrication Details</h3>
        </div>
        <div className="orderfabHeaderActionsdetimp">
          <button className="orderfabImportButtondetimp" onClick={handleImportClick}>
            <FiUpload />
            <span>Import</span>
          </button>
          &nbsp;&nbsp;&nbsp;
          <button className="orderfabAddButtondetimp" onClick={handleAddServiceClick}>
            <FiPlus />
            <span>Add Service</span>
          </button>
        </div>
      </div>

      <div className="orderfabSearchSectiondetimp">
        <div className="orderfabSearchControlsdetimp">
          <div className="orderfabSearchFiltersdetimp">
            {/* Service Type Dropdown - Moved to first position */}
            <div className="orderfabDropdowndetimp">
              <div className="orderfabDropdownContainerdetimp">
                <div
                  className="orderfabDropdownSelecteddetimp"
                  onClick={() => setIsServiceTypeOpen(!isServiceTypeOpen)}
                >
                  <span>
                    {serviceType ? (serviceType === "add" ? "Add Service" : "Import") : "Select Service Type"}
                  </span>
                  {isServiceTypeOpen ? <FiChevronUp /> : <FiChevronDown />}
                </div>
                {isServiceTypeOpen && (
                  <div className="orderfabDropdownOptionsdetimp">
                    <div
                      className={`orderfabDropdownOptiondetimp ${serviceType === "add" ? "selected" : ""}`}
                      onClick={() => handleServiceTypeChange("add")}
                    >
                      Add Service
                    </div>
                    <div
                      className={`orderfabDropdownOptiondetimp ${serviceType === "import" ? "selected" : ""}`}
                      onClick={() => handleServiceTypeChange("import")}
                    >
                      Import
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mark No Dropdown */}
            <div className="orderfabDropdowndetimp">
              <div className="orderfabDropdownContainerdetimp">
                <div
                  className="orderfabDropdownSelecteddetimp"
                  onClick={() => setIsMarkDropdownOpen(!isMarkDropdownOpen)}
                >
                  <span>{selectedErectionMkd || "Select Mark No"}</span>
                  {isMarkDropdownOpen ? <FiChevronUp /> : <FiChevronDown />}
                </div>
                {isMarkDropdownOpen && (
                  <div className="orderfabDropdownOptionsdetimp">
                    {erectionMkds.length > 0 ? (
                      erectionMkds.map((mark) => (
                        <div
                          key={mark}
                          className={`orderfabDropdownOptiondetimp ${selectedErectionMkd === mark ? "selected" : ""}`}
                          onClick={() => {
                            setSelectedErectionMkd(mark)
                            setIsMarkDropdownOpen(false)
                          }}
                        >
                          {mark}
                        </div>
                      ))
                    ) : (
                      <div className="orderfabDropdownOptiondetimp disabled">No mark numbers available</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Line No Dropdown */}
            <div className="orderfabDropdowndetimp">
              <div className="orderfabDropdownContainerdetimp">
                <div
                  className="orderfabDropdownSelecteddetimp"
                  onClick={() => setIsLineDropdownOpen(!isLineDropdownOpen)}
                >
                  <span>{selectedLineNumber || "Select Line No"}</span>
                  {isLineDropdownOpen ? <FiChevronUp /> : <FiChevronDown />}
                </div>
                {isLineDropdownOpen && (
                  <div className="orderfabDropdownOptionsdetimp">
                    {lineNumbers.length > 0 ? (
                      lineNumbers.map((line) => (
                        <div
                          key={line}
                          className={`orderfabDropdownOptiondetimp ${selectedLineNumber === line ? "selected" : ""}`}
                          onClick={() => {
                            setSelectedLineNumber(line)
                            setIsLineDropdownOpen(false)
                          }}
                        >
                          {line}
                        </div>
                      ))
                    ) : (
                      <div className="orderfabDropdownOptiondetimp disabled">No line numbers available</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="orderfabSearchInputWrapperdetimp">
            <div className="orderfabSearchInputContainerdetimp">
              <FiSearch className="orderfabSearchIcondetimp" />
              <input
                type="text"
                placeholder="Search by Mark No..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="orderfabSearchInputdetimp"
              />
            </div>
            <button className="orderfabSearchButtondetimp" onClick={handleSearch} disabled={loading}>
              <FiSearch />
              <span>Search</span>
            </button>{" "}
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <button className="orderfabSearchButtondetimp-copy" onClick={handleCopyClick}>
              <GoCopy />
              <span>Copy</span>
            </button>
            <button className="orderfabSearchButtondetimp-copy" onClick={handleMoveToErectionClick}>
              <MdOutlineDriveFileMove />
              <span>Move to Erection</span>
            </button>
          </div>
        </div>
      </div>

      <div className="orderfabTableContainerdetimp">
        {loading && (
          <div className="orderfabLoadingOverlaydetimp">
            <div className="orderfabSpinnerdetimp">
              <AiOutlineLoading3Quarters />
            </div>
            <div className="orderfabLoadingTextdetimp">Loading data...</div>
          </div>
        )}

        <table className="orderfabTabledetimp">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Erection Mkd</th>
              <th>Item No</th>
              <th>Section</th>
              <th>Length</th>
              <th>Length(mm)</th>
              <th>Qty</th>
              <th>Unit</th>
              <th>Unit(Kgs)</th>
              <th>Total Wt</th>
              <th>Total Wt(Kgs)</th>
              <th>Qty Reqd</th>
              <th>Erec Mkd Wt</th>
              <th>Erec Mkd Wt(kgs)</th>
              <th>Remarks</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.length > 0 ? (
              currentItems.map((detail, index) => (
                <tr key={`${detail.id || detail.ifaceId}-${index}`}>
                  <td>
                    <div className="orderfabOrderIcondetimp">
                      <IoMdOpen />
                    </div>
                  </td>
                  <td className="orderfabErectionMkddetimp">{detail.erectionMkd}</td>
                  <td>{detail.itemNo}</td>
                  <td>{detail.section}</td>
                  <td>{detail.length}</td>
                  <td>{formatUomForDisplay(detail.lengthUom)}</td>
                  <td>{detail.quantity}</td>
                  <td>{detail.unitPrice}</td>
                  <td>{formatUomForDisplay(detail.unitPriceUom)}</td>
                  <td>{detail.totalQuantity}</td>
                  <td>{formatUomForDisplay(detail.totalQuantityUom)}</td>
                  <td>{detail.repeatedQty}</td>
                  <td>{detail.quantity && detail.unitPrice ? (detail.quantity * detail.unitPrice).toFixed(2) : ""}</td>
                  <td>{formatUomForDisplay(detail.totalQuantityUom)}</td>
                  <td>
                    <span className={`orderfabRemarkBadgedetimp ${getRemarkStyle(detail.remark)}`}>
                      {detail.remark || "N/A"}
                    </span>
                  </td>
                  <td>
                    <span className="orderfabStatusBadgedetimp">
                      {detail.ifaceStatus || detail.status || "Completed"}
                    </span>
                  </td>
                  <td>
                    <div className="orderfabRowActionsdetimp">
                      <button
                        className="orderfabActionButtondetimp orderfabEditButtondetimp"
                        onClick={() => handleEdit(detail)}
                      >
                        <FiEdit2 />
                      </button>
                      <button
                        className="orderfabActionButtondetimp orderfabDeleteButtondetimp"
                        onClick={() => handleDelete(detail)}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr className="orderfabEmptyRowdetimp">
                <td colSpan={17}>
                  <div className="orderfabNoDatadetimp">
                    <div className="orderfabNoDataMessagedetimp">No records found.</div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {filteredDetails.length > 0 && (
        <div className="orderfabPaginationdetimp">
          <div className="orderfabPaginationInfodetimp">
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredDetails.length)} of{" "}
            {filteredDetails.length} entries
          </div>
          <div className="orderfabPaginationControlsdetimp">
            <button
              className="orderfabPaginationButtondetimp"
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
            >
              First
            </button>
            <button
              className="orderfabPaginationButtondetimp"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            <div className="orderfabPaginationPagesdetimp">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i
                if (pageNum <= totalPages) {
                  return (
                    <button
                      key={pageNum}
                      className={`orderfabPaginationPagedetimp ${currentPage === pageNum ? "active" : ""}`}
                      onClick={() => setCurrentPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  )
                }
                return null
              })}
            </div>
            <button
              className="orderfabPaginationButtondetimp"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
            <button
              className="orderfabPaginationButtondetimp"
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
            >
              Last
            </button>
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      {isEditDialogOpen && (
        <div className="orderfabModalOverlaydetimp">
          <div className="orderfabModalContainerdetimp">
            <div className="orderfabModalHeaderdetimp">
              <h3>Edit Fabrication Detail</h3>
              <button className="orderfabCloseButtondetimp" onClick={() => setIsEditDialogOpen(false)}>
                &times;
              </button>
            </div>
            <div className="orderfabModalBodydetimp">
              {currentDetail && (
                <div className="orderfabEditFormdetimp">
                  <div className="orderfabFormRowdetimp">
                    <div className="orderfabFormGroupdetimp">
                      <label>Mark No</label>
                      <input
                        type="text"
                        name="erectionMkd"
                        value={currentDetail.erectionMkd || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="orderfabFormGroupdetimp">
                      <label>Item No</label>
                      <input
                        type="text"
                        name="itemNo"
                        value={currentDetail.itemNo || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="orderfabFormRowdetimp">
                    <div className="orderfabFormGroupdetimp">
                      <label>Section</label>
                      <input
                        type="text"
                        name="section"
                        value={currentDetail.section || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="orderfabFormGroupdetimp">
                      <label>Length</label>
                      <input
                        type="number"
                        name="length"
                        value={currentDetail.length || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="orderfabFormRowdetimp">
                    <div className="orderfabFormGroupdetimp">
                      <label>Length UOM</label>
                      <select name="lengthUom" value={currentDetail.lengthUom || ""} onChange={handleInputChange}>
                        <option value="">Select UOM</option>
                        <option value="MM">MM</option>
                        <option value="CM">CM</option>
                        <option value="M">M</option>
                      </select>
                    </div>
                    <div className="orderfabFormGroupdetimp">
                      <label>Quantity</label>
                      <input
                        type="number"
                        name="quantity"
                        value={currentDetail.quantity || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  <div className="orderfabFormRowdetimp">
                    <div className="orderfabFormGroupdetimp">
                      <label>Unit WT</label>
                      <input
                        type="number"
                        name="unitPrice"
                        value={currentDetail.unitPrice || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="orderfabFormGroupdetimp">
                      <label>Unit Price UOM</label>
                      <select name="unitPriceUom" value={currentDetail.unitPriceUom || ""} onChange={handleInputChange}>
                        <option value="">Select UOM</option>
                        <option value="KG">KG</option>
                        <option value="TON">TON</option>
                        <option value="LB">LB</option>
                      </select>
                    </div>
                  </div>
                  <div className="orderfabFormRowdetimp">
                    <div className="orderfabFormGroupdetimp">
                      <label>Total Weight</label>
                      <input
                        type="number"
                        name="totalQuantity"
                        value={currentDetail.totalQuantity || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="orderfabFormGroupdetimp">
                      <label>Total Weight UOM</label>
                      <select
                        name="totalQuantityUom"
                        value={currentDetail.totalQuantityUom || ""}
                        onChange={handleInputChange}
                      >
                        <option value="">Select UOM</option>
                        <option value="KG">KG</option>
                        <option value="TON">TON</option>
                        <option value="LB">LB</option>
                      </select>
                    </div>
                  </div>
                  <div className="orderfabFormRowdetimp">
                    <div className="orderfabFormGroupdetimp">
                      <label>Qty Reqd</label>
                      <input
                        type="number"
                        name="repeatedQty"
                        value={currentDetail.repeatedQty || ""}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="orderfabFormGroupdetimp">
                      <label>Remarks</label>
                      <select name="remark" value={currentDetail.remark || ""} onChange={handleInputChange}>
                        <option value="Completed">Completed</option>
                        <option value="Not Completed">Not Completed</option>
                        <option value="In Progress">In Progress</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="orderfabModalFooterdetimp">
              <button className="orderfabCancelButtondetimp" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </button>
              <button className="orderfabSaveButtondetimp" onClick={saveEditedDetail}>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {isDeleteDialogOpen && (
        <div className="orderfabModalOverlaydetimp">
          <div className="orderfabModalContainerdetimp orderfabDeleteModaldetimp">
            <div className="orderfabModalHeaderdetimp">
              <h3>Confirm Delete</h3>
              <button className="orderfabCloseButtondetimp" onClick={() => setIsDeleteDialogOpen(false)}>
                &times;
              </button>
            </div>
            <div className="orderfabModalBodydetimp">
              <p>Are you sure you want to delete this fabrication detail?</p>
              {currentDetail && (
                <div className="orderfabDeleteDetailsdetimp">
                  <p>
                    <strong>Mark No:</strong> {currentDetail.erectionMkd}
                  </p>
                  <p>
                    <strong>Item No:</strong> {currentDetail.itemNo}
                  </p>
                </div>
              )}
              <p className="orderfabDeleteWarningdetimp">This action cannot be undone.</p>
            </div>
            <div className="orderfabModalFooterdetimp">
              <button className="orderfabCancelButtondetimp" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </button>
              <button className="orderfabDeleteButtondetimp" onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Popup */}
      {isImportPopupOpen && (
        <div className="leopard-overlay">
          <div className="leopard-modal">
            <div className="leopard-modal-header">
              <h3>Import Excel File</h3>
              <button className="leopard-close-button" onClick={() => setIsImportPopupOpen(false)}>
                <FiX />
              </button>
            </div>
            <div className="leopard-modal-body">
              <div className={`leopard-upload-area ${selectedFile ? "has-file" : ""}`} onClick={handleUploadClick}>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".xlsx,.xls"
                  style={{ display: "none" }}
                />
                <div className="leopard-upload-icon">
                  <FiUpload />
                </div>
                <div className="leopard-upload-text">
                  {selectedFile ? selectedFile.name : "Click to upload Excel file"}
                </div>
              </div>
            </div>
            <div className="leopard-modal-footer">
              <button className="leopard-cancel-button" onClick={() => setIsImportPopupOpen(false)}>
                Cancel
              </button>
              <button className="leopard-save-button" onClick={handleImportSave} disabled={!selectedFile}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Popup */}
      {isConfirmPopupOpen && (
        <div className="tiger-overlay">
          <div className="tiger-modal">
            <div className="tiger-modal-header">
              <h3>Confirm Import</h3>
              <button className="tiger-close-button" onClick={() => setIsConfirmPopupOpen(false)}>
                <FiX />
              </button>
            </div>
            <div className="tiger-modal-body">
              <div className="tiger-warning-icon">
                <FiUpload />
              </div>
              <p>Are you sure you want to import this Excel file?</p>
              <p>This action will add new records to the database.</p>
            </div>
            <div className="tiger-modal-footer">
              <button className="tiger-cancel-button" onClick={() => setIsConfirmPopupOpen(false)}>
                No
              </button>
              <button className="tiger-confirm-button" onClick={handleImportConfirm}>
                Yes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Service Popup */}
      {isAddServicePopupOpen && (
        <div className="add-service-overlay">
          <div className="add-service-modal">
            <div className="add-service-header">
              <h3>Add Service</h3>
              <div className="add-service-actions">
                <button className="add-more-services-button" onClick={addMoreServices}>
                  <FiPlus />
                  <span>Add More Services</span>
                </button>
                <button className="add-service-close-button" onClick={() => setIsAddServicePopupOpen(false)}>
                  <FiX />
                </button>
              </div>
            </div>
            <div className="add-service-body">
              {serviceEntries.map((entry, index) => (
                <div key={entry.id} className="add-service-entry">
                  {index > 0 && <div className="add-service-entry-divider"></div>}
                  <div className="add-service-entry-header">
                    <h4>Service Entry #{index + 1}</h4>
                    {serviceEntries.length > 1 && (
                      <button
                        className="remove-service-entry-button"
                        onClick={() => setServiceEntries((prev) => prev.filter((e) => e.id !== entry.id))}
                      >
                        <FiTrash2 />
                      </button>
                    )}
                  </div>
                  <div className="add-service-grid">
                    <div className="add-service-row">
                      <div className="add-service-field">
                        <label>Erection Mkd</label>
                        <input
                          type="text"
                          name="erectionMkd"
                          value={entry.erectionMkd}
                          onChange={(e) => handleAddServiceInputChange(e, entry.id)}
                          placeholder="Enter marked"
                        />
                      </div>
                      <div className="add-service-field">
                        <label>Item No</label>
                        <input
                          type="text"
                          name="itemNo"
                          value={entry.itemNo}
                          onChange={(e) => handleAddServiceInputChange(e, entry.id)}
                          placeholder="Enter item"
                        />
                      </div>
                    </div>
                    <div className="add-service-row">
                      <div className="add-service-field">
                        <label>Section</label>
                        <input
                          type="text"
                          name="section"
                          value={entry.section}
                          onChange={(e) => handleAddServiceInputChange(e, entry.id)}
                          placeholder="Enter section"
                        />
                      </div>
                      <div className="add-service-field">
                        <label>Length</label>
                        <div className="add-service-input-group">
                          <input
                            type="number"
                            name="length"
                            value={entry.length}
                            onChange={(e) => handleAddServiceInputChange(e, entry.id)}
                            placeholder="Enter length"
                          />
                          <select
                            name="lengthUom"
                            value={entry.lengthUom}
                            onChange={(e) => handleAddServiceSelectChange(e, entry.id)}
                          >
                            <option value="MM">MM</option>
                            <option value="CM">CM</option>
                            <option value="M">M</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="add-service-row">
                      <div className="add-service-field">
                        <label>Line Number</label>
                        <input
                          type="text"
                          name="lineNumber"
                          value={entry.lineNumber}
                          onChange={(e) => handleLineNumberChange(e, entry.id)}
                          placeholder="Enter line number"
                          readOnly
                        />
                      </div>
                      <div className="add-service-field">
                        <label>Quantity</label>
                        <input
                          type="number"
                          name="quantity"
                          value={entry.quantity}
                          onChange={(e) => handleAddServiceInputChange(e, entry.id)}
                          placeholder="Enter quantity"
                        />
                      </div>
                    </div>
                    <div className="add-service-row">
                      <div className="add-service-field">
                        <label>Unit WT</label>
                        <div className="add-service-input-group">
                          <input
                            type="number"
                            name="unitPrice"
                            value={entry.unitPrice}
                            onChange={(e) => handleAddServiceInputChange(e, entry.id)}
                            placeholder="Enter unit price"
                          />
                          <select
                            name="unitPriceUom"
                            value={entry.unitPriceUom}
                            onChange={(e) => handleAddServiceSelectChange(e, entry.id)}
                          >
                            <option value="KG">KG</option>
                            <option value="TON">TON</option>
                            <option value="LB">LB</option>
                          </select>
                        </div>
                      </div>
                      <div className="add-service-field">
                        <label>Total Weight</label>
                        <div className="add-service-input-group">
                          <input
                            type="number"
                            name="totalQuantity"
                            value={entry.totalQuantity}
                            onChange={(e) => handleAddServiceInputChange(e, entry.id)}
                            placeholder="Enter total weight"
                          />
                          <select
                            name="totalQuantityUom"
                            value={entry.totalQuantityUom}
                            onChange={(e) => handleAddServiceSelectChange(e, entry.id)}
                          >
                            <option value="KG">KG</option>
                            <option value="TON">TON</option>
                            <option value="LB">LB</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    <div className="add-service-row">
                      <div className="add-service-field">
                        <label>Qty Reqd</label>
                        <input
                          type="number"
                          name="repeatedQty"
                          value={entry.repeatedQty}
                          onChange={(e) => handleAddServiceInputChange(e, entry.id)}
                          placeholder="Enter quantity required"
                        />
                      </div>
                      <div className="add-service-field">
                        <label>Remarks</label>
                        <select
                          name="remark"
                          value={entry.remark}
                          onChange={(e) => handleAddServiceSelectChange(e, entry.id)}
                        >
                          <option value="Completed">Completed</option>
                          <option value="Not Completed">Not Completed</option>
                          <option value="In Progress">In Progress</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="add-service-footer">
              <button className="add-service-cancel-button" onClick={() => setIsAddServicePopupOpen(false)}>
                Cancel
              </button>
              <button className="add-service-save-button" onClick={handleAddServiceSave}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Move to Erection Popup */}
      {isMoveToErectionPopupOpen && (
        <div className="modern-popup-overlay">
          <div className="modern-popup">
            <div className="modern-popup-header">
              <h3>Move to Erection</h3>
              <button className="modern-popup-close" onClick={() => setIsMoveToErectionPopupOpen(false)}>
                <FiX />
              </button>
            </div>
            <div className="modern-popup-body">
              <div className="modern-popup-field">
                <label>Mark No.</label>
                <div className="multi-select-container">
                  <div
                    className={`multi-select-header ${isMultiSelectOpen ? "active" : ""}`}
                    onClick={toggleMultiSelect}
                  >
                    {selectedMarkNos.length === 0 ? (
                      <div className="multi-select-placeholder">Select Mark No(s)</div>
                    ) : (
                      <div className="multi-select-selected">
                        {selectedMarkNos.map((markNo) => (
                          <div key={markNo} className="multi-select-tag">
                            {markNo}
                            <span
                              className="multi-select-tag-remove"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleRemoveMarkNo(markNo)
                              }}
                            >
                              ×
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                    {isMultiSelectOpen ? <FiChevronUp /> : <FiChevronDown />}
                  </div>
                  {isMultiSelectOpen && (
                    <div className="multi-select-dropdown">
                      <div className="multi-select-search">
                        <input
                          type="text"
                          placeholder="Search Mark No..."
                          value={markNoSearchQuery}
                          onChange={(e) => setMarkNoSearchQuery(e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      {filteredMarkNos.length > 0 ? (
                        filteredMarkNos.map((markNo) => (
                          <div
                            key={markNo}
                            className={`multi-select-option ${selectedMarkNos.includes(markNo) ? "selected" : ""}`}
                            onClick={(e) => {
                              e.stopPropagation()
                              handleMarkNoSelect(markNo)
                            }}
                          >
                            {markNo}
                          </div>
                        ))
                      ) : (
                        <div className="multi-select-option">No mark numbers found</div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="modern-popup-footer">
              <button className="modern-popup-cancel" onClick={() => setIsMoveToErectionPopupOpen(false)}>
                Cancel
              </button>
              <button className="modern-popup-save" onClick={handleMoveToErectionSave} disabled={moveToErectionLoading}>
                {moveToErectionLoading ? (
                  <>
                    <AiOutlineLoading3Quarters style={{ animation: "spin 1s linear infinite", marginRight: "8px" }} />
                    Moving...
                  </>
                ) : (
                  "Save"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Copy Popup */}
      {isCopyPopupOpen && (
        <div className="modern-popup-overlay">
          <div className="modern-popup">
            <div className="modern-popup-header">
              <h3>Copy Mark</h3>
              <button className="modern-popup-close" onClick={() => setIsCopyPopupOpen(false)}>
                <FiX />
              </button>
            </div>
            <div className="modern-popup-body">
              <div className="modern-popup-field">
                <label>Mark No.</label>
                <select
                  value={copySourceMarkNo}
                  onChange={(e) => setCopySourceMarkNo(e.target.value)}
                  disabled={copyLoading}
                >
                  <option value="">Select Mark No</option>
                  {allErectionMkds.map((markNo) => (
                    <option key={markNo} value={markNo}>
                      {markNo}
                    </option>
                  ))}
                </select>
              </div>
              <div className="modern-popup-field">
                <label>Select New Mark No.</label>
                <input
                  type="text"
                  value={copyTargetMarkNo}
                  onChange={(e) => setCopyTargetMarkNo(e.target.value)}
                  placeholder="Enter new mark number"
                  disabled={copyLoading}
                />
              </div>
            </div>
            <div className="modern-popup-footer">
              <button className="modern-popup-cancel" onClick={() => setIsCopyPopupOpen(false)} disabled={copyLoading}>
                Cancel
              </button>
              <button className="modern-popup-copy" onClick={handleCopySave} disabled={copyLoading}>
                {copyLoading ? (
                  <>
                    <AiOutlineLoading3Quarters style={{ animation: "spin 1s linear infinite", marginRight: "8px" }} />
                    Copying...
                  </>
                ) : (
                  "Copy"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  )
}

export default TabFabricationTable;
