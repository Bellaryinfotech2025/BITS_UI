import { useState, useEffect } from "react"
import { PenTool, Package2, TrendingUp, ChevronDown, Search, X, Calendar, Filter, ArrowLeft } from "lucide-react"
import { VscListUnordered } from "react-icons/vsc"
import { FcInspection } from "react-icons/fc"
import { FaRupeeSign } from "react-icons/fa"
import axios from "axios"
import '../ReportsNewComponent/ReportsDesign.css'

// API Base URL
const API_BASE_URL = "http://195.35.45.56:5522/api/V2.0"

const ReportTemplate = () => {
  const [currentView, setCurrentView] = useState("home")
  const [selectedReport, setSelectedReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showTable, setShowTable] = useState(false)
  const [tableLoading, setTableLoading] = useState(false)

  // API Data States
  const [workOrders, setWorkOrders] = useState([])
  const [plantLocations, setPlantLocations] = useState([])
  const [departments, setDepartments] = useState([])
  const [drawingNumbers, setDrawingNumbers] = useState([])

  // Order Status states
  const [selectedWorkOrder, setSelectedWorkOrder] = useState([])
  // const [selectedOrderServiceDescription, setSelectedOrderServiceDescription] = useState([]) // Commented as requested

  // Drawing Status states
  const [selectedBuildingName, setSelectedBuildingName] = useState([])
  const [selectedProjectName, setSelectedProjectName] = useState([])
  const [selectedServiceDescription, setSelectedServiceDescription] = useState([])

  // Material Requirement states
  const [selectedDrawingNo, setSelectedDrawingNo] = useState([])

  // Material Reconciliation states
  const [selectedRANo, setSelectedRANo] = useState([])

  // Inspection Reports states
  const [selectedMarkNo, setSelectedMarkNo] = useState([])
  const [selectedContractor, setSelectedContractor] = useState([])

  // Table data states
  const [tableData, setTableData] = useState([])
  const [totalData, setTotalData] = useState({})

  const reportBoxes = [
    {
      id: "order-status",
      title: "Order Status",
      icon: <VscListUnordered />,
      color: "blue",
    },
    {
      id: "drawings-status",
      title: "Drawings Status",
      icon: <PenTool />,
      color: "green",
    },
    {
      id: "material-requirement",
      title: "Material Requirement",
      icon: <Package2 />,
      color: "orange",
    },
    {
      id: "material-reconciliation",
      title: "Material Reconciliation",
      icon: <TrendingUp />,
      color: "purple",
    },
    {
      id: "billing-reports",
      title: "Billing Reports",
      icon: <FaRupeeSign />,
      color: "red",
    },
    {
      id: "inspection-reports",
      title: "Inspection Reports",
      icon: <FcInspection />,
      color: "red",
    },
  ]

  const serviceDescriptionOptions = [
    { value: "fabrication", label: "Fabrication Status" },
    { value: "erection", label: "Erection Status" },
    { value: "alignment", label: "Alignment Status" },
    { value: "painting", label: "Painting Status" },
  ]

  // API Functions
  const fetchWorkOrders = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/getworkorder/number`)
      setWorkOrders(response.data || [])
    } catch (error) {
      console.error("Error fetching work orders:", error)
      setWorkOrders([])
    }
  }

  const fetchWorkOrderDetails = async (workOrderNumber) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/getworkorder/number/${workOrderNumber}`)
      return response.data
    } catch (error) {
      console.error("Error fetching work order details:", error)
      return null
    }
  }

  const fetchDrawingEntries = async (orderId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/getAllBitsDrawingEntries/details`)
      const allEntries = response.data.content || response.data || []
      // Filter entries where attribute1V matches the work order (stored as orderId mapping)
      return allEntries.filter((entry) => entry.orderId === orderId)
    } catch (error) {
      console.error("Error fetching drawing entries:", error)
      return []
    }
  }

  const fetchServiceLines = async (orderId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/getBitsLinesByOrderId/details?orderId=${orderId}`)
      return response.data || []
    } catch (error) {
      console.error("Error fetching service lines:", error)
      return []
    }
  }

  // Load initial data
  useEffect(() => {
    fetchWorkOrders()
  }, [])

  // Handle work order selection and filter dependent dropdowns
  const handleWorkOrderSelection = async (workOrderNumbers) => {
    setSelectedWorkOrder(workOrderNumbers)

    if (workOrderNumbers.length > 0) {
      const uniquePlantLocations = new Set()
      const uniqueDepartments = new Set()
      const uniqueDrawingNumbers = new Set()

      for (const workOrder of workOrderNumbers) {
        const details = await fetchWorkOrderDetails(workOrder)
        if (details) {
          if (details.plantLocation) uniquePlantLocations.add(details.plantLocation)
          if (details.department) uniqueDepartments.add(details.department)

          // Fetch drawing numbers for this work order
          const drawingEntries = await fetchDrawingEntries(details.orderId)
          drawingEntries.forEach((entry) => {
            if (entry.drawingNo) uniqueDrawingNumbers.add(entry.drawingNo)
          })
        }
      }

      setPlantLocations(Array.from(uniquePlantLocations))
      setDepartments(Array.from(uniqueDepartments))
      setDrawingNumbers(Array.from(uniqueDrawingNumbers))
    } else {
      setPlantLocations([])
      setDepartments([])
      setDrawingNumbers([])
    }
  }

  const handleReportClick = (reportId) => {
    setLoading(true)
    setTimeout(() => {
      setCurrentView(reportId)
      setSelectedReport(reportId)
      setLoading(false)
      setShowTable(false)
      resetAllStates()
    }, 500)
  }

  const handleBackToHome = () => {
    setCurrentView("home")
    setSelectedReport(null)
    setShowTable(false)
    resetAllStates()
    setTableLoading(false)
  }

  const resetAllStates = () => {
    setSelectedWorkOrder([])
    // setSelectedOrderServiceDescription([]) // Commented
    setSelectedBuildingName([])
    setSelectedProjectName([])
    setSelectedServiceDescription([])
    setSelectedRANo([])
    setSelectedDrawingNo([])
    setSelectedMarkNo([])
    setSelectedContractor([])
    setTableData([])
    setTotalData({})
  }

  const handleMultiSelectChange = (value, currentValues, setter, type) => {
    if (value === "select-all") {
      const options = getOptionsForDropdown(type)
      if (currentValues.length === options.length) {
        setter([])
      } else {
        setter(options.map((opt) => opt.value))
      }
    } else {
      if (currentValues.includes(value)) {
        setter(currentValues.filter((v) => v !== value))
      } else {
        setter([...currentValues, value])
      }
    }
  }

  const getOptionsForDropdown = (type) => {
    switch (type) {
      case "workOrder":
        return workOrders.map((wo) => ({ value: wo, label: wo }))
      case "building":
        return plantLocations.map((pl) => ({ value: pl, label: pl }))
      case "project":
        return departments.map((dept) => ({ value: dept, label: dept }))
      case "service":
        return serviceDescriptionOptions
      case "drawing":
        return drawingNumbers.map((dn) => ({ value: dn, label: dn }))
      case "mark":
        return [
          { value: "MRK-001", label: "MRK-001" },
          { value: "MRK-002", label: "MRK-002" },
          { value: "MRK-003", label: "MRK-003" },
          { value: "MRK-004", label: "MRK-004" },
        ]
      case "contractor":
        return [
          { value: "ABC-Construction", label: "ABC Construction" },
          { value: "XYZ-Builders", label: "XYZ Builders" },
          { value: "DEF-Engineering", label: "DEF Engineering" },
          { value: "GHI-Contractors", label: "GHI Contractors" },
        ]
      case "ra":
        return [
          { value: "RA1", label: "RA1" },
          { value: "RA2", label: "RA2" },
          { value: "RA3", label: "RA3" },
          { value: "RA4", label: "RA4" },
        ]
      default:
        return []
    }
  }

  const handleShowTable = async () => {
    if (!canShowSearchButton()) return

    setTableLoading(true)
    setShowTable(true)

    try {
      if (selectedReport === "order-status") {
        await fetchOrderStatusData()
      } else if (selectedReport === "drawings-status") {
        await fetchDrawingsStatusData()
      } else if (selectedReport === "material-requirement") {
        await fetchMaterialRequirementData()
      }
    } catch (error) {
      console.error("Error fetching table data:", error)
    }

    setTimeout(() => {
      setTableLoading(false)
    }, 1000)
  }

  const fetchOrderStatusData = async () => {
    const data = []
    let totalCompletionQty = 0

    for (const workOrder of selectedWorkOrder) {
      const workOrderDetails = await fetchWorkOrderDetails(workOrder)
      if (!workOrderDetails) continue

      const serviceLines = await fetchServiceLines(workOrderDetails.orderId)
      const drawingEntries = await fetchDrawingEntries(workOrderDetails.orderId)

      // Calculate total marked weight from drawing entries
      const totalMarkedWeight = drawingEntries.reduce((sum, entry) => {
        return sum + (Number.parseFloat(entry.totalMarkedWgt) || 0)
      }, 0)

      const completionQty = totalMarkedWeight / 1000 // Divide by 1000 as requested

      for (const line of serviceLines) {
        const balanceQty = (Number.parseFloat(line.qty) || 0) - completionQty

        data.push({
          slNo: line.serNo || "",
          serviceCode: line.serviceCode || "",
          serviceDesc: line.serviceDesc || "",
          uom: line.uom || "",
          workOrderQty: line.qty || 0,
          completionQty: completionQty.toFixed(3),
          balanceQty: balanceQty.toFixed(3),
        })

        totalCompletionQty += completionQty
      }
    }

    setTableData(data)
    setTotalData({ totalCompletionQty: totalCompletionQty.toFixed(3) })
  }

  const fetchDrawingsStatusData = async () => {
    const data = []
    let totalMarkWeight = 0

    for (const workOrder of selectedWorkOrder) {
      const workOrderDetails = await fetchWorkOrderDetails(workOrder)
      if (!workOrderDetails) continue

      const drawingEntries = await fetchDrawingEntries(workOrderDetails.orderId)

      for (const entry of drawingEntries) {
        data.push({
          drawingNo: entry.drawingNo || "",
          markNo: entry.markNo || "",
          markQty: entry.markedQty || 0,
          markWeight: entry.markWeight || 0,
          totalMarkWeight: entry.totalMarkedWgt || 0,
        })

        totalMarkWeight += Number.parseFloat(entry.totalMarkedWgt) || 0
      }
    }

    setTableData(data)
    setTotalData({ totalMarkWeight: totalMarkWeight.toFixed(3) })
  }

  const fetchMaterialRequirementData = async () => {
    const data = []
    let totalMarkWeight = 0

    for (const workOrder of selectedWorkOrder) {
      const workOrderDetails = await fetchWorkOrderDetails(workOrder)
      if (!workOrderDetails) continue

      const drawingEntries = await fetchDrawingEntries(workOrderDetails.orderId)

      // Group by session name
      const sessionGroups = {}
      drawingEntries.forEach((entry) => {
        const sessionName = entry.sessionName || "Unknown"
        if (!sessionGroups[sessionName]) {
          sessionGroups[sessionName] = {
            sessionName,
            totalDrawingWeight: 0,
            scrapAllowanceVisible: Number.parseFloat(workOrderDetails.scrapAllowanceVisiblePercent) || 0,
            scrapAllowanceInvisible: Number.parseFloat(workOrderDetails.scrapAllowanceInvisiblePercent) || 0,
          }
        }
        sessionGroups[sessionName].totalDrawingWeight += Number.parseFloat(entry.totalMarkedWgt) || 0
      })

      Object.values(sessionGroups).forEach((group) => {
        const total = group.totalDrawingWeight + group.scrapAllowanceVisible + group.scrapAllowanceInvisible
        data.push({
          ...group,
          total: total.toFixed(3),
        })
        totalMarkWeight += group.totalDrawingWeight
      })
    }

    setTableData(data)
    setTotalData({ totalMarkWeight: totalMarkWeight.toFixed(3) })
  }

  const handleClearSearch = () => {
    setShowTable(false)
    resetAllStates()
    setTableLoading(false)
  }

  const canShowSearchButton = () => {
    if (selectedReport === "order-status") {
      return selectedWorkOrder.length > 0
    }
    if (selectedReport === "drawings-status") {
      return (
        selectedWorkOrder.length > 0 &&
        selectedBuildingName.length > 0 &&
        selectedProjectName.length > 0 &&
        selectedServiceDescription.length > 0
      )
    }
    if (selectedReport === "material-requirement") {
      return (
        selectedWorkOrder.length > 0 &&
        selectedBuildingName.length > 0 &&
        selectedProjectName.length > 0 &&
        selectedDrawingNo.length > 0
      )
    }
    return false
  }

  const getActiveFilters = () => {
    const filters = []
    if (selectedWorkOrder.length > 0) filters.push({ label: "Work Order", value: selectedWorkOrder.join(", ") })
    if (selectedBuildingName.length > 0)
      filters.push({ label: "Building Name", value: selectedBuildingName.join(", ") })
    if (selectedProjectName.length > 0) filters.push({ label: "Project Name", value: selectedProjectName.join(", ") })
    if (selectedServiceDescription.length > 0) {
      const serviceLabels = selectedServiceDescription
        .map((val) => serviceDescriptionOptions.find((opt) => opt.value === val)?.label)
        .join(", ")
      filters.push({ label: "Service", value: serviceLabels })
    }
    if (selectedDrawingNo.length > 0) filters.push({ label: "Drawing No", value: selectedDrawingNo.join(", ") })
    return filters
  }

  const currentReport = selectedReport ? reportBoxes.find((box) => box.id === selectedReport) : null

  // Home Page View
  if (currentView === "home") {
    return (
      <div className="tiger-reports-container">
        <div className="simple-header-text">
          <p>
            Search your priority orders above by selecting the Order Status, Drawing Status, Material Requirement,
            Material Reconciliation, Billing Reports, Inspection Reports
          </p>
        </div>

        <div className="bear-reports-grid-compressed">
          <div className="reports-grid-row">
            {reportBoxes.slice(0, 4).map((box) => (
              <div
                key={box.id}
                className={`fox-report-box-compressed ${box.color}`}
                onClick={() => handleReportClick(box.id)}
              >
                <div className={`deer-report-icon-compressed ${box.color}`}>{box.icon}</div>
                <div className="rabbit-report-content-compressed">
                  <span className="rabbit-report-title-compressed">{box.title}</span>
                </div>
                <ChevronDown className="eagle-report-arrow-compressed" />
              </div>
            ))}
          </div>
          <div className="reports-grid-row">
            {reportBoxes.slice(4, 6).map((box) => (
              <div
                key={box.id}
                className={`fox-report-box-compressed ${box.color}`}
                onClick={() => handleReportClick(box.id)}
              >
                <div className={`deer-report-icon-compressed ${box.color}`}>{box.icon}</div>
                <div className="rabbit-report-content-compressed">
                  <span className="rabbit-report-title-compressed">{box.title}</span>
                </div>
                <ChevronDown className="eagle-report-arrow-compressed" />
              </div>
            ))}
          </div>
        </div>

        {loading && (
          <div className="shark-loading-section">
            <div className="whale-loading-spinner"></div>
            <span>Loading {currentReport?.title}...</span>
          </div>
        )}
      </div>
    )
  }

  // Report Detail View
  return (
    <div className="tiger-reports-container">
      <div className="report-detail-view">
        <div className="report-detail-header">
          <button className="back-button" onClick={handleBackToHome}>
            <ArrowLeft size={20} />
            <span>Back to Reports</span>
          </button>
          <div className="report-detail-title">
            <div className={`deer-report-icon ${currentReport?.color}`}>{currentReport?.icon}</div>
            <h2>{currentReport?.title}</h2>
          </div>
        </div>

        <div className="panther-detail-section">
          <div className="zebra-filter-section">
            {/* Work Order Multi-Select Dropdown - Common for all */}
            <div className="giraffe-work-order-group">
              <label htmlFor="workOrder">Select Work Order</label>
              <div className="multi-select-wrapper">
                <div className="multi-select-display">
                  {selectedWorkOrder.length === 0 ? "Choose work order..." : `${selectedWorkOrder.length} selected`}
                  <ChevronDown className="monkey-select-icon" />
                </div>
                <div className="multi-select-dropdown">
                  <label className="multi-select-option">
                    <input
                      type="checkbox"
                      checked={selectedWorkOrder.length === getOptionsForDropdown("workOrder").length}
                      onChange={() =>
                        handleMultiSelectChange(
                          "select-all",
                          selectedWorkOrder,
                          (values) => {
                            setSelectedWorkOrder(values)
                            handleWorkOrderSelection(values)
                          },
                          "workOrder",
                        )
                      }
                    />
                    <span>Select All</span>
                  </label>
                  {getOptionsForDropdown("workOrder").map((option) => (
                    <label key={option.value} className="multi-select-option">
                      <input
                        type="checkbox"
                        checked={selectedWorkOrder.includes(option.value)}
                        onChange={() =>
                          handleMultiSelectChange(
                            option.value,
                            selectedWorkOrder,
                            (values) => {
                              setSelectedWorkOrder(values)
                              handleWorkOrderSelection(values)
                            },
                            "workOrder",
                          )
                        }
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Building Name Dropdown - For Drawings Status and Material Requirement */}
            {(selectedReport === "drawings-status" || selectedReport === "material-requirement") && (
              <div className="giraffe-work-order-group">
                <label htmlFor="buildingName">Select Building Name</label>
                <div className="multi-select-wrapper">
                  <div className="multi-select-display">
                    {selectedBuildingName.length === 0
                      ? "Choose building..."
                      : `${selectedBuildingName.length} selected`}
                    <ChevronDown className="monkey-select-icon" />
                  </div>
                  <div className="multi-select-dropdown">
                    <label className="multi-select-option">
                      <input
                        type="checkbox"
                        checked={selectedBuildingName.length === getOptionsForDropdown("building").length}
                        onChange={() =>
                          handleMultiSelectChange(
                            "select-all",
                            selectedBuildingName,
                            setSelectedBuildingName,
                            "building",
                          )
                        }
                      />
                      <span>Select All</span>
                    </label>
                    {getOptionsForDropdown("building").map((option) => (
                      <label key={option.value} className="multi-select-option">
                        <input
                          type="checkbox"
                          checked={selectedBuildingName.includes(option.value)}
                          onChange={() =>
                            handleMultiSelectChange(
                              option.value,
                              selectedBuildingName,
                              setSelectedBuildingName,
                              "building",
                            )
                          }
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Project Name Dropdown - For multiple reports */}
            {(selectedReport === "drawings-status" || selectedReport === "material-requirement") && (
              <div className="giraffe-work-order-group">
                <label htmlFor="projectName">Select Project Name</label>
                <div className="multi-select-wrapper">
                  <div className="multi-select-display">
                    {selectedProjectName.length === 0 ? "Choose project..." : `${selectedProjectName.length} selected`}
                    <ChevronDown className="monkey-select-icon" />
                  </div>
                  <div className="multi-select-dropdown">
                    <label className="multi-select-option">
                      <input
                        type="checkbox"
                        checked={selectedProjectName.length === getOptionsForDropdown("project").length}
                        onChange={() =>
                          handleMultiSelectChange("select-all", selectedProjectName, setSelectedProjectName, "project")
                        }
                      />
                      <span>Select All</span>
                    </label>
                    {getOptionsForDropdown("project").map((option) => (
                      <label key={option.value} className="multi-select-option">
                        <input
                          type="checkbox"
                          checked={selectedProjectName.includes(option.value)}
                          onChange={() =>
                            handleMultiSelectChange(
                              option.value,
                              selectedProjectName,
                              setSelectedProjectName,
                              "project",
                            )
                          }
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Service Description Dropdown - Only for Drawings Status */}
            {selectedReport === "drawings-status" && (
              <div className="giraffe-work-order-group">
                <label htmlFor="serviceDescription">Select Service Description</label>
                <div className="multi-select-wrapper">
                  <div className="multi-select-display">
                    {selectedServiceDescription.length === 0
                      ? "Choose service..."
                      : `${selectedServiceDescription.length} selected`}
                    <ChevronDown className="monkey-select-icon" />
                  </div>
                  <div className="multi-select-dropdown">
                    <label className="multi-select-option">
                      <input
                        type="checkbox"
                        checked={selectedServiceDescription.length === getOptionsForDropdown("service").length}
                        onChange={() =>
                          handleMultiSelectChange(
                            "select-all",
                            selectedServiceDescription,
                            setSelectedServiceDescription,
                            "service",
                          )
                        }
                      />
                      <span>Select All</span>
                    </label>
                    {getOptionsForDropdown("service").map((option) => (
                      <label key={option.value} className="multi-select-option">
                        <input
                          type="checkbox"
                          checked={selectedServiceDescription.includes(option.value)}
                          onChange={() =>
                            handleMultiSelectChange(
                              option.value,
                              selectedServiceDescription,
                              setSelectedServiceDescription,
                              "service",
                            )
                          }
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Drawing No Dropdown - For Material Requirement */}
            {selectedReport === "material-requirement" && (
              <div className="giraffe-work-order-group">
                <label htmlFor="drawingNo">Select Drawing No</label>
                <div className="multi-select-wrapper">
                  <div className="multi-select-display">
                    {selectedDrawingNo.length === 0 ? "Choose drawing..." : `${selectedDrawingNo.length} selected`}
                    <ChevronDown className="monkey-select-icon" />
                  </div>
                  <div className="multi-select-dropdown">
                    <label className="multi-select-option">
                      <input
                        type="checkbox"
                        checked={selectedDrawingNo.length === getOptionsForDropdown("drawing").length}
                        onChange={() =>
                          handleMultiSelectChange("select-all", selectedDrawingNo, setSelectedDrawingNo, "drawing")
                        }
                      />
                      <span>Select All</span>
                    </label>
                    {getOptionsForDropdown("drawing").map((option) => (
                      <label key={option.value} className="multi-select-option">
                        <input
                          type="checkbox"
                          checked={selectedDrawingNo.includes(option.value)}
                          onChange={() =>
                            handleMultiSelectChange(option.value, selectedDrawingNo, setSelectedDrawingNo, "drawing")
                          }
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="snake-button-group">
              {canShowSearchButton() && (
                <button className="snake-search-btn" onClick={handleShowTable}>
                  <Search size={14} />
                  Search
                </button>
              )}
              {showTable && (
                <button className="snake-clear-btn" onClick={handleClearSearch}>
                  <X size={14} />
                  Clear
                </button>
              )}
            </div>
          </div>

          {/* Active Filters Display */}
          {showTable && getActiveFilters().length > 0 && (
            <div className="lion-active-filters">
              <div className="elephant-filters-header">
                <Filter size={16} />
                <span>Active Filters</span>
              </div>
              <div className="wolf-filters-list">
                {getActiveFilters().map((filter, index) => (
                  <div key={index} className="leopard-filter-tag">
                    <span className="cheetah-filter-label">{filter.label}:</span>
                    <span className="jaguar-filter-value">{filter.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Table/Data Display Section */}
          {showTable && (
            <div className="crocodile-table-section">
              {tableLoading ? (
                <div className="octopus-loading">
                  <div className="jellyfish-loading-spinner"></div>
                  <span>Loading data...</span>
                </div>
              ) : (
                <div className="kangaroo-table-wrapper">
                  <table className="koala-data-table">
                    <thead>
                      <tr>
                        {selectedReport === "order-status" ? (
                          <>
                            <th>SL.NO</th>
                            <th>Service Code</th>
                            <th>Service Description</th>
                            <th>UOM</th>
                            <th>Work Order Qty</th>
                            <th>Completion Qty</th>
                            <th>Balance Quantity</th>
                          </>
                        ) : selectedReport === "drawings-status" ? (
                          <>
                            <th>Drawing No</th>
                            <th>Mark No</th>
                            <th>Mark Qty</th>
                            <th>Mark Weight</th>
                            <th>Total Mark Weight</th>
                          </>
                        ) : selectedReport === "material-requirement" ? (
                          <>
                            <th>Section Name</th>
                            <th>Total Drawing Weight</th>
                            <th>Scrap Allowance Visible</th>
                            <th>Scrap Allowance Invisible</th>
                            <th>Total</th>
                          </>
                        ) : null}
                      </tr>
                    </thead>
                    <tbody>
                      {tableData.length > 0 ? (
                        tableData.map((row, index) => (
                          <tr key={index}>
                            {selectedReport === "order-status" ? (
                              <>
                                <td>{row.slNo}</td>
                                <td>{row.serviceCode}</td>
                                <td>{row.serviceDesc}</td>
                                <td>{row.uom}</td>
                                <td>{row.workOrderQty}</td>
                                <td>{row.completionQty}</td>
                                <td>{row.balanceQty}</td>
                              </>
                            ) : selectedReport === "drawings-status" ? (
                              <>
                                <td>{row.drawingNo}</td>
                                <td>{row.markNo}</td>
                                <td>{row.markQty}</td>
                                <td>{row.markWeight}</td>
                                <td>{row.totalMarkWeight}</td>
                              </>
                            ) : selectedReport === "material-requirement" ? (
                              <>
                                <td>{row.sessionName}</td>
                                <td>{row.totalDrawingWeight}</td>
                                <td>{row.scrapAllowanceVisible}</td>
                                <td>{row.scrapAllowanceInvisible}</td>
                                <td>{row.total}</td>
                              </>
                            ) : null}
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="7" className="panda-no-data">
                            <div className="flamingo-no-data-content">
                              <Calendar className="peacock-no-data-icon" />
                              <span>No data available for the selected criteria.</span>
                            </div>
                          </td>
                        </tr>
                      )}
                      {/* Total Row */}
                      {tableData.length > 0 && (
                        <tr className="total-row" style={{ backgroundColor: "#f8fafc", fontWeight: "bold" }}>
                          {selectedReport === "drawings-status" ? (
                            <>
                              <td colSpan="4" style={{ textAlign: "right" }}>
                                Total:
                              </td>
                              <td>{totalData.totalMarkWeight}</td>
                            </>
                          ) : selectedReport === "material-requirement" ? (
                            <>
                              <td colSpan="4" style={{ textAlign: "right" }}>
                                Total:
                              </td>
                              <td>{totalData.totalMarkWeight}</td>
                            </>
                          ) : null}
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ReportTemplate
