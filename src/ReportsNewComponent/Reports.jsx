"use client"
import { useState } from "react"
import { PenTool, Package2, TrendingUp, ChevronDown, Search, X, Calendar, Filter, ArrowLeft } from "lucide-react"
import "../ReportsNewComponent/ReportsDesign.css"
import { FaRupeeSign } from "react-icons/fa"
import { VscListUnordered } from "react-icons/vsc"
import { FcInspection } from "react-icons/fc"

const ReportTemplate = () => {
  const [currentView, setCurrentView] = useState("home") // "home" or specific report ID
  const [selectedReport, setSelectedReport] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showTable, setShowTable] = useState(false)
  const [tableLoading, setTableLoading] = useState(false)

  // Order Status states - add service description
  const [selectedWorkOrder, setSelectedWorkOrder] = useState([])
  const [selectedOrderServiceDescription, setSelectedOrderServiceDescription] = useState([])

  // Drawing Status states - convert to arrays
  const [selectedBuildingName, setSelectedBuildingName] = useState([])
  const [selectedProjectName, setSelectedProjectName] = useState([])
  const [selectedServiceDescription, setSelectedServiceDescription] = useState([])

  // Billing Reports states - convert to arrays
  const [selectedRANo, setSelectedRANo] = useState([])

  // Material Requirement states - convert to arrays
  const [selectedDrawingNo, setSelectedDrawingNo] = useState([])

  // Inspection Reports states - convert to arrays
  const [selectedMarkNo, setSelectedMarkNo] = useState([])
  const [selectedContractor, setSelectedContractor] = useState([])

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
    setSelectedOrderServiceDescription([])
    setSelectedBuildingName([])
    setSelectedProjectName([])
    setSelectedServiceDescription([])
    setSelectedRANo([])
    setSelectedDrawingNo([])
    setSelectedMarkNo([])
    setSelectedContractor([])
  }

  const handleMultiSelectChange = (value, currentValues, setter, type) => {
    const options = getOptionsForDropdown(type)

    if (value === "select-all") {
      // Toggle select all
      if (currentValues.length === options.length) {
        setter([])
      } else {
        setter(options.map((opt) => opt.value))
      }
    } else {
      // Toggle individual option
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
        return [
          { value: "WO-001", label: "WO-001 - Project Alpha" },
          { value: "WO-002", label: "WO-002 - Project Beta" },
          { value: "WO-003", label: "WO-003 - Project Gamma" },
          { value: "WO-004", label: "WO-004 - Project Delta" },
        ]
      case "building":
        return [
          { value: "Building-A", label: "Building A" },
          { value: "Building-B", label: "Building B" },
          { value: "Building-C", label: "Building C" },
          { value: "Building-D", label: "Building D" },
        ]
      case "project":
        return [
          { value: "Project-Alpha", label: "Project Alpha" },
          { value: "Project-Beta", label: "Project Beta" },
          { value: "Project-Gamma", label: "Project Gamma" },
          { value: "Project-Delta", label: "Project Delta" },
          { value: "Project-Omega", label: "Project Omega" },
        ]
      case "service":
        return serviceDescriptionOptions
      case "drawing":
        return [
          { value: "DWG-001", label: "DWG-001" },
          { value: "DWG-002", label: "DWG-002" },
          { value: "DWG-003", label: "DWG-003" },
          { value: "DWG-004", label: "DWG-004" },
        ]
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

  const handleWorkOrderChange = (e) => {
    setSelectedWorkOrder(e.target.value)
  }

  const handleBuildingNameChange = (e) => {
    setSelectedBuildingName(e.target.value)
  }

  const handleProjectNameChange = (e) => {
    setSelectedProjectName(e.target.value)
  }

  const handleServiceDescriptionChange = (e) => {
    setSelectedServiceDescription(e.target.value)
  }

  const handleRANoChange = (e) => {
    setSelectedRANo(e.target.value)
  }

  const handleDrawingNoChange = (e) => {
    setSelectedDrawingNo(e.target.value)
  }

  const handleMarkNoChange = (e) => {
    setSelectedMarkNo(e.target.value)
  }

  const handleContractorChange = (e) => {
    setSelectedContractor(e.target.value)
  }

  const handleShowTable = () => {
    if (selectedReport === "order-status" && selectedWorkOrder.length === 0) return

    if (
      selectedReport === "drawings-status" &&
      (selectedWorkOrder.length === 0 ||
        selectedBuildingName.length === 0 ||
        selectedProjectName.length === 0 ||
        selectedServiceDescription.length === 0)
    )
      return

    if (
      selectedReport === "billing-reports" &&
      (selectedWorkOrder.length === 0 || selectedProjectName.length === 0 || selectedRANo.length === 0)
    )
      return

    if (
      selectedReport === "material-requirement" &&
      (selectedWorkOrder.length === 0 ||
        selectedProjectName.length === 0 ||
        selectedBuildingName.length === 0 ||
        selectedDrawingNo.length === 0)
    )
      return

    if (
      selectedReport === "material-reconciliation" &&
      (selectedWorkOrder.length === 0 || selectedProjectName.length === 0 || selectedRANo.length === 0)
    )
      return

    if (
      selectedReport === "inspection-reports" &&
      (selectedWorkOrder.length === 0 ||
        selectedProjectName.length === 0 ||
        selectedDrawingNo.length === 0 ||
        selectedMarkNo.length === 0 ||
        selectedContractor.length === 0)
    )
      return

    setTableLoading(true)
    setShowTable(true)
    setTimeout(() => {
      setTableLoading(false)
    }, 1000)
  }

  const handleClearSearch = () => {
    setShowTable(false)
    resetAllStates()
    setTableLoading(false)
  }

  const getStatusColumns = () => {
    const statusMap = {
      fabrication: {
        completedQty: "Fabrication Completed (Mark Qty)",
        completedWeight: "Fabrication Completed (Mark Weight)",
        balanceQty: "Fabrication Balance (Mark Qty)",
        balanceWeight: "Fabrication Balance (Mark Weight)",
      },
      erection: {
        completedQty: "Erection Completed (Mark Qty)",
        completedWeight: "Erection Completed (Mark Weight)",
        balanceQty: "Erection Balance (Mark Qty)",
        balanceWeight: "Erection Balance (Mark Weight)",
      },
      alignment: {
        completedQty: "Alignment Completed (Mark Qty)",
        completedWeight: "Alignment Balance (Mark Weight)",
        balanceQty: "Alignment Balance (Mark Qty)",
        balanceWeight: "Alignment Balance (Mark Weight)",
      },
      painting: {
        completedQty: "Painting Completed (Mark Qty)",
        completedWeight: "Painting Balance (Mark Weight)",
        balanceQty: "Painting Balance (Mark Qty)",
        balanceWeight: "Painting Balance (Mark Weight)",
      },
    }
    return statusMap[selectedServiceDescription] || null
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
    if (selectedReport === "billing-reports") {
      return selectedWorkOrder.length > 0 && selectedProjectName.length > 0 && selectedRANo.length > 0
    }
    if (selectedReport === "material-requirement") {
      return (
        selectedWorkOrder.length > 0 &&
        selectedProjectName.length > 0 &&
        selectedBuildingName.length > 0 &&
        selectedDrawingNo.length > 0
      )
    }
    if (selectedReport === "material-reconciliation") {
      return selectedWorkOrder.length > 0 && selectedProjectName.length > 0 && selectedRANo.length > 0
    }
    if (selectedReport === "inspection-reports") {
      return (
        selectedWorkOrder.length > 0 &&
        selectedProjectName.length > 0 &&
        selectedDrawingNo.length > 0 &&
        selectedMarkNo.length > 0 &&
        selectedContractor.length > 0
      )
    }
    return false
  }

  const getActiveFilters = () => {
    const filters = []
    if (selectedWorkOrder.length > 0) filters.push({ label: "Work Order", value: selectedWorkOrder.join(", ") })
    if (selectedOrderServiceDescription.length > 0) {
      const serviceLabels = selectedOrderServiceDescription
        .map((val) => serviceDescriptionOptions.find((opt) => opt.value === val)?.label)
        .join(", ")
      filters.push({ label: "Order Service", value: serviceLabels })
    }
    if (selectedBuildingName.length > 0)
      filters.push({ label: "Building Name", value: selectedBuildingName.join(", ") })
    if (selectedProjectName.length > 0) filters.push({ label: "Project Name", value: selectedProjectName.join(", ") })
    if (selectedServiceDescription.length > 0) {
      const serviceLabels = selectedServiceDescription
        .map((val) => serviceDescriptionOptions.find((opt) => opt.value === val)?.label)
        .join(", ")
      filters.push({ label: "Service", value: serviceLabels })
    }
    if (selectedRANo.length > 0) filters.push({ label: "RA No", value: selectedRANo.join(", ") })
    if (selectedDrawingNo.length > 0) filters.push({ label: "Drawing No", value: selectedDrawingNo.join(", ") })
    if (selectedMarkNo.length > 0) filters.push({ label: "Mark No", value: selectedMarkNo.join(", ") })
    if (selectedContractor.length > 0) filters.push({ label: "Contractor", value: selectedContractor.join(", ") })
    return filters
  }

  const currentReport = selectedReport ? reportBoxes.find((box) => box.id === selectedReport) : null

  // Mock data for inspection reports horizontal layout
  const inspectionData = [
    {
      date: "DD-MM-YYYY",
      rev: "Rev-XX",
      drawingMarkWeight: "XXX.X kg",
      asPerDrawingQty: "XX units",
      additionalOrLessWeight: "±X.X kg",
      offeredQty: "XX units",
      cumulativeQtyCleared: "XX units",
      total: "XXX.X kg",
    },
  ]

  // Home Page View
  if (currentView === "home") {
    return (
      <div className="tiger-reports-container">
        {/* Simple Header Text */}
        <div className="simple-header-text">
          <p>
            Search your priority orders above by selecting the Order Status, Drawing Status, Material Requirement,
            Material Reconciliation, Billing Reports, Inspection Reports
          </p>
        </div>

        {/* Reports Grid - Compressed Layout */}
        <div className="bear-reports-grid-compressed">
          {/* First Row - 4 boxes */}
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

          {/* Second Row - 2 boxes */}
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
        {/* Back Button and Header */}
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

        {/* Filter Section */}
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
                        handleMultiSelectChange("select-all", selectedWorkOrder, setSelectedWorkOrder, "workOrder")
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
                          handleMultiSelectChange(option.value, selectedWorkOrder, setSelectedWorkOrder, "workOrder")
                        }
                      />
                      <span>{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Service Description Dropdown - Only for Order Status */}
            {selectedReport === "order-status" && (
              <div className="giraffe-work-order-group">
                <label htmlFor="orderServiceDescription">Select Service Description</label>
                <div className="multi-select-wrapper">
                  <div className="multi-select-display">
                    {selectedOrderServiceDescription.length === 0
                      ? "Choose service..."
                      : `${selectedOrderServiceDescription.length} selected`}
                    <ChevronDown className="monkey-select-icon" />
                  </div>
                  <div className="multi-select-dropdown">
                    <label className="multi-select-option">
                      <input
                        type="checkbox"
                        checked={selectedOrderServiceDescription.length === serviceDescriptionOptions.length}
                        onChange={() =>
                          handleMultiSelectChange(
                            "select-all",
                            selectedOrderServiceDescription,
                            setSelectedOrderServiceDescription,
                            "service",
                          )
                        }
                      />
                      <span>Select All</span>
                    </label>
                    {serviceDescriptionOptions.map((option) => (
                      <label key={option.value} className="multi-select-option">
                        <input
                          type="checkbox"
                          checked={selectedOrderServiceDescription.includes(option.value)}
                          onChange={() =>
                            handleMultiSelectChange(
                              option.value,
                              selectedOrderServiceDescription,
                              setSelectedOrderServiceDescription,
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
            {(selectedReport === "drawings-status" ||
              selectedReport === "billing-reports" ||
              selectedReport === "material-requirement" ||
              selectedReport === "material-reconciliation" ||
              selectedReport === "inspection-reports") && (
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

            {/* Drawing No Dropdown - For Material Requirement and Inspection Reports */}
            {(selectedReport === "material-requirement" || selectedReport === "inspection-reports") && (
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

            {/* Mark No Dropdown - Only for Inspection Reports */}
            {selectedReport === "inspection-reports" && (
              <div className="giraffe-work-order-group">
                <label htmlFor="markNo">Select Mark No</label>
                <div className="multi-select-wrapper">
                  <div className="multi-select-display">
                    {selectedMarkNo.length === 0 ? "Choose mark..." : `${selectedMarkNo.length} selected`}
                    <ChevronDown className="monkey-select-icon" />
                  </div>
                  <div className="multi-select-dropdown">
                    <label className="multi-select-option">
                      <input
                        type="checkbox"
                        checked={selectedMarkNo.length === getOptionsForDropdown("mark").length}
                        onChange={() =>
                          handleMultiSelectChange("select-all", selectedMarkNo, setSelectedMarkNo, "mark")
                        }
                      />
                      <span>Select All</span>
                    </label>
                    {getOptionsForDropdown("mark").map((option) => (
                      <label key={option.value} className="multi-select-option">
                        <input
                          type="checkbox"
                          checked={selectedMarkNo.includes(option.value)}
                          onChange={() =>
                            handleMultiSelectChange(option.value, selectedMarkNo, setSelectedMarkNo, "mark")
                          }
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Contractor Dropdown - Only for Inspection Reports */}
            {selectedReport === "inspection-reports" && (
              <div className="giraffe-work-order-group">
                <label htmlFor="contractor">Select Contractor</label>
                <div className="multi-select-wrapper">
                  <div className="multi-select-display">
                    {selectedContractor.length === 0 ? "Choose contractor..." : `${selectedContractor.length} selected`}
                    <ChevronDown className="monkey-select-icon" />
                  </div>
                  <div className="multi-select-dropdown">
                    <label className="multi-select-option">
                      <input
                        type="checkbox"
                        checked={selectedContractor.length === getOptionsForDropdown("contractor").length}
                        onChange={() =>
                          handleMultiSelectChange("select-all", selectedContractor, setSelectedContractor, "contractor")
                        }
                      />
                      <span>Select All</span>
                    </label>
                    {getOptionsForDropdown("contractor").map((option) => (
                      <label key={option.value} className="multi-select-option">
                        <input
                          type="checkbox"
                          checked={selectedContractor.includes(option.value)}
                          onChange={() =>
                            handleMultiSelectChange(
                              option.value,
                              selectedContractor,
                              setSelectedContractor,
                              "contractor",
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

            {/* RA No Dropdown - For Billing Reports and Material Reconciliation */}
            {(selectedReport === "billing-reports" || selectedReport === "material-reconciliation") && (
              <div className="giraffe-work-order-group">
                <label htmlFor="raNo">Select RA No</label>
                <div className="multi-select-wrapper">
                  <div className="multi-select-display">
                    {selectedRANo.length === 0 ? "Choose RA No..." : `${selectedRANo.length} selected`}
                    <ChevronDown className="monkey-select-icon" />
                  </div>
                  <div className="multi-select-dropdown">
                    <label className="multi-select-option">
                      <input
                        type="checkbox"
                        checked={selectedRANo.length === getOptionsForDropdown("ra").length}
                        onChange={() => handleMultiSelectChange("select-all", selectedRANo, setSelectedRANo, "ra")}
                      />
                      <span>Select All</span>
                    </label>
                    {getOptionsForDropdown("ra").map((option) => (
                      <label key={option.value} className="multi-select-option">
                        <input
                          type="checkbox"
                          checked={selectedRANo.includes(option.value)}
                          onChange={() => handleMultiSelectChange(option.value, selectedRANo, setSelectedRANo, "ra")}
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
              ) : selectedReport === "inspection-reports" ? (
                <div className="inspection-horizontal-layout">
                  {inspectionData.map((item, index) => (
                    <div key={index} className="inspection-card">
                      <div className="inspection-row">
                        <div className="inspection-field">
                          <span className="inspection-label">DATE</span>
                          <span className="inspection-value">{item.date}</span>
                        </div>
                        <div className="inspection-field">
                          <span className="inspection-label">REV</span>
                          <span className="inspection-value">{item.rev}</span>
                        </div>
                        <div className="inspection-field">
                          <span className="inspection-label">DRAWING MARK WEIGHT</span>
                          <span className="inspection-value">{item.drawingMarkWeight}</span>
                        </div>
                        <div className="inspection-field">
                          <span className="inspection-label">AS PER DRAWING QTY</span>
                          <span className="inspection-value">{item.asPerDrawingQty}</span>
                        </div>
                      </div>
                      <div className="inspection-row">
                        <div className="inspection-field">
                          <span className="inspection-label">ADDITIONAL OR LESS IN WEIGHT</span>
                          <span className="inspection-value">{item.additionalOrLessWeight}</span>
                        </div>
                        <div className="inspection-field">
                          <span className="inspection-label">OFFERED QTY</span>
                          <span className="inspection-value">{item.offeredQty}</span>
                        </div>
                        <div className="inspection-field">
                          <span className="inspection-label">CUMULATIVE QTY CLEARED</span>
                          <span className="inspection-value">{item.cumulativeQtyCleared}</span>
                        </div>
                        <div className="inspection-field">
                          <span className="inspection-label">TOTAL</span>
                          <span className="inspection-value">{item.total}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="kangaroo-table-wrapper">
                  {selectedReport === "billing-reports" ? (
                    <>
                      <table className="koala-billing-table">
                        <thead>
                          <tr>
                            <th colSpan="3" className="description-header">
                              Description
                            </th>
                            <th colSpan="7" className="main-header fabrication-header">
                              BUILDING STRUCTURE FABRICATION
                            </th>
                            <th colSpan="6" className="main-header erection-header">
                              BUILDING STRUCTURE ERECTION
                            </th>
                            <th colSpan="6" className="main-header alignment-header">
                              BUILDING STRUCTURE ALIGNMENT
                            </th>
                            <th colSpan="6" className="main-header painting-header">
                              PAINTING
                            </th>
                          </tr>
                          <tr>
                            <th className="basic-header">Sl. No</th>
                            <th className="basic-header">Drawing No</th>
                            <th className="basic-header">Mark No</th>
                            <th className="basic-header">Indv Wgt (Kgs)</th>
                            <th colSpan="2" className="sub-header upto-previous-header">
                              Upto Previous
                            </th>
                            <th colSpan="2" className="sub-header present-header">
                              Present
                            </th>
                            <th colSpan="3" className="sub-header cumulative-header">
                              Cumulative
                            </th>
                            <th colSpan="2" className="sub-header upto-previous-header">
                              Upto Previous
                            </th>
                            <th colSpan="2" className="sub-header present-header">
                              Present
                            </th>
                            <th colSpan="2" className="sub-header cumulative-header">
                              Cumulative
                            </th>
                            <th colSpan="2" className="sub-header upto-previous-header">
                              Upto Previous
                            </th>
                            <th colSpan="2" className="sub-header present-header">
                              Present
                            </th>
                            <th colSpan="2" className="sub-header cumulative-header">
                              Cumulative
                            </th>
                            <th colSpan="2" className="sub-header upto-previous-header">
                              Upto Previous
                            </th>
                            <th colSpan="2" className="sub-header present-header">
                              Present
                            </th>
                            <th colSpan="2" className="sub-header cumulative-header">
                              Cumulative
                            </th>
                          </tr>
                          <tr>
                            <th className="detail-header"></th>
                            <th className="detail-header"></th>
                            <th className="detail-header"></th>
                            <th className="detail-header"></th>
                            <th className="detail-header upto-previous-cell">Qty</th>
                            <th className="detail-header upto-previous-cell">Total Wgt (Kgs)</th>
                            <th className="detail-header present-cell">Qty</th>
                            <th className="detail-header present-cell">Total Wgt (Kgs)</th>
                            <th className="detail-header cumulative-cell">Qty</th>
                            <th className="detail-header cumulative-cell">Total Wgt (Kgs)</th>
                            <th className="detail-header cumulative-cell">RA NO</th>
                            <th className="detail-header upto-previous-cell">Qty</th>
                            <th className="detail-header upto-previous-cell">Total Wgt (Kgs)</th>
                            <th className="detail-header present-cell">Qty</th>
                            <th className="detail-header present-cell">Total Wgt (Kgs)</th>
                            <th className="detail-header cumulative-cell">Qty</th>
                            <th className="detail-header cumulative-cell">Total Wgt (Kgs)</th>
                            <th className="detail-header cumulative-cell">RA NO</th>
                            <th className="detail-header upto-previous-cell">Qty</th>
                            <th className="detail-header upto-previous-cell">Total Wgt (Kgs)</th>
                            <th className="detail-header present-cell">Qty</th>
                            <th className="detail-header present-cell">Total Wgt (Kgs)</th>
                            <th className="detail-header cumulative-cell">Qty</th>
                            <th className="detail-header cumulative-cell">Total Wgt (Kgs)</th>
                            <th className="detail-header cumulative-cell">RA NO</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td colSpan="29" className="panda-no-data">
                              <div className="flamingo-no-data-content">
                                <Calendar className="peacock-no-data-icon" />
                                <span>No data available. Connect to backend to load actual data.</span>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                      {/* Color Legend */}
                      <div className="color-legend">
                        <h4 className="legend-title">Color Legend</h4>
                        <div className="legend-items">
                          <div className="legend-item">
                            <div className="legend-color upto-previous-legend"></div>
                            <span>Upto Previous</span>
                          </div>
                          <div className="legend-item">
                            <div className="legend-color present-legend"></div>
                            <span>Present</span>
                          </div>
                          <div className="legend-item">
                            <div className="legend-color cumulative-legend"></div>
                            <span>Cumulative</span>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
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
                              {selectedOrderServiceDescription.includes("fabrication") && (
                                <>
                                  <th>Fabrication Completed (Mark Qty)</th>
                                  <th>Fabrication Completed (Mark Weight)</th>
                                  <th>Fabrication Balance (Mark Qty)</th>
                                  <th>Fabrication Balance (Mark Weight)</th>
                                </>
                              )}
                              {selectedOrderServiceDescription.includes("erection") && (
                                <>
                                  <th>Erection Completed (Mark Qty)</th>
                                  <th>Erection Completed (Mark Weight)</th>
                                  <th>Erection Balance (Mark Qty)</th>
                                  <th>Erection Balance (Mark Weight)</th>
                                </>
                              )}
                              {selectedOrderServiceDescription.includes("alignment") && (
                                <>
                                  <th>Alignment Completed (Mark Qty)</th>
                                  <th>Alignment Completed (Mark Weight)</th>
                                  <th>Alignment Balance (Mark Qty)</th>
                                  <th>Alignment Balance (Mark Weight)</th>
                                </>
                              )}
                              {selectedOrderServiceDescription.includes("painting") && (
                                <>
                                  <th>Painting Completed (Mark Qty)</th>
                                  <th>Painting Completed (Mark Weight)</th>
                                  <th>Painting Balance (Mark Qty)</th>
                                  <th>Painting Balance (Mark Weight)</th>
                                </>
                              )}
                            </>
                          ) : selectedReport === "drawings-status" ? (
                            <>
                              <th>Drawing No</th>
                              <th>Mark No</th>
                              <th>Mark Qty</th>
                              <th>Mark Weight</th>
                              <th>Total Mark Weight</th>
                              {getStatusColumns() && (
                                <>
                                  <th>{getStatusColumns().completedQty}</th>
                                  <th>{getStatusColumns().completedWeight}</th>
                                  <th>{getStatusColumns().balanceQty}</th>
                                  <th>{getStatusColumns().balanceWeight}</th>
                                </>
                              )}
                            </>
                          ) : selectedReport === "material-requirement" ? (
                            <>
                              <th>Section Name</th>
                              <th>Total Drawing Weight</th>
                              <th>Scrap Allowance Visible</th>
                              <th>Scrap Allowance Invisible</th>
                              <th>Total</th>
                            </>
                          ) : selectedReport === "material-reconciliation" ? (
                            <>
                              <th>Section Name</th>
                              <th>Material Code</th>
                              <th>Total Received</th>
                              <th>Consumption</th>
                              <th>Visible Scrap</th>
                              <th>Invisible Scrap</th>
                              <th>Total Consumption</th>
                              <th>Balance Qty</th>
                            </>
                          ) : null}
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td
                            colSpan={
                              selectedReport === "order-status"
                                ? selectedOrderServiceDescription.length > 0
                                  ? 7 + selectedOrderServiceDescription.length * 4
                                  : "7"
                                : selectedReport === "drawings-status"
                                  ? "9"
                                  : selectedReport === "material-requirement"
                                    ? "5"
                                    : selectedReport === "material-reconciliation"
                                      ? "8"
                                      : "6"
                            }
                            className="panda-no-data"
                          >
                            <div className="flamingo-no-data-content">
                              <Calendar className="peacock-no-data-icon" />
                              <span>No data available. Connect to backend to load actual data.</span>
                            </div>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ReportTemplate;
