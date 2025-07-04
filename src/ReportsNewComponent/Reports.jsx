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

  // Order Status states
  const [selectedWorkOrder, setSelectedWorkOrder] = useState("")
  const [showTable, setShowTable] = useState(false)
  const [tableLoading, setTableLoading] = useState(false)

  // Drawing Status states
  const [selectedBuildingName, setSelectedBuildingName] = useState("")
  const [selectedProjectName, setSelectedProjectName] = useState("")
  const [selectedServiceDescription, setSelectedServiceDescription] = useState("")

  // Billing Reports states
  const [selectedRANo, setSelectedRANo] = useState("")

  // Material Requirement states
  const [selectedDrawingNo, setSelectedDrawingNo] = useState("")

  // Inspection Reports states
  const [selectedMarkNo, setSelectedMarkNo] = useState("")
  const [selectedContractor, setSelectedContractor] = useState("")

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
    setSelectedWorkOrder("")
    setSelectedBuildingName("")
    setSelectedProjectName("")
    setSelectedServiceDescription("")
    setSelectedRANo("")
    setSelectedDrawingNo("")
    setSelectedMarkNo("")
    setSelectedContractor("")
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
    if (selectedReport === "order-status" && !selectedWorkOrder) return

    if (
      selectedReport === "drawings-status" &&
      (!selectedWorkOrder || !selectedBuildingName || !selectedProjectName || !selectedServiceDescription)
    )
      return

    if (selectedReport === "billing-reports" && (!selectedWorkOrder || !selectedProjectName || !selectedRANo)) return

    if (
      selectedReport === "material-requirement" &&
      (!selectedWorkOrder || !selectedProjectName || !selectedBuildingName || !selectedDrawingNo)
    )
      return

    if (selectedReport === "material-reconciliation" && (!selectedWorkOrder || !selectedProjectName || !selectedRANo))
      return

    if (
      selectedReport === "inspection-reports" &&
      (!selectedWorkOrder || !selectedProjectName || !selectedDrawingNo || !selectedMarkNo || !selectedContractor)
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
      return selectedWorkOrder
    }
    if (selectedReport === "drawings-status") {
      return selectedWorkOrder && selectedBuildingName && selectedProjectName && selectedServiceDescription
    }
    if (selectedReport === "billing-reports") {
      return selectedWorkOrder && selectedProjectName && selectedRANo
    }
    if (selectedReport === "material-requirement") {
      return selectedWorkOrder && selectedProjectName && selectedBuildingName && selectedDrawingNo
    }
    if (selectedReport === "material-reconciliation") {
      return selectedWorkOrder && selectedProjectName && selectedRANo
    }
    if (selectedReport === "inspection-reports") {
      return selectedWorkOrder && selectedProjectName && selectedDrawingNo && selectedMarkNo && selectedContractor
    }
    return false
  }

  const getActiveFilters = () => {
    const filters = []
    if (selectedWorkOrder) filters.push({ label: "Work Order", value: selectedWorkOrder })
    if (selectedBuildingName) filters.push({ label: "Building Name", value: selectedBuildingName })
    if (selectedProjectName) filters.push({ label: "Project Name", value: selectedProjectName })
    if (selectedServiceDescription) {
      const serviceLabel = serviceDescriptionOptions.find((opt) => opt.value === selectedServiceDescription)?.label
      filters.push({ label: "Service", value: serviceLabel })
    }
    if (selectedRANo) filters.push({ label: "RA No", value: selectedRANo })
    if (selectedDrawingNo) filters.push({ label: "Drawing No", value: selectedDrawingNo })
    if (selectedMarkNo) filters.push({ label: "Mark No", value: selectedMarkNo })
    if (selectedContractor) filters.push({ label: "Contractor", value: selectedContractor })
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
            Search your priority orders below by selecting the Order Status, Drawing Status, Material Requirement,
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
            {/* Work Order Dropdown - Common for all */}
            <div className="giraffe-work-order-group">
              <label htmlFor="workOrder">Select Work Order</label>
              <div className="hippo-select-wrapper">
                <select
                  id="workOrder"
                  value={selectedWorkOrder}
                  onChange={handleWorkOrderChange}
                  className="rhino-select"
                >
                  <option value="">Choose work order...</option>
                  <option value="WO-001">WO-001 - Project Alpha</option>
                  <option value="WO-002">WO-002 - Project Beta</option>
                  <option value="WO-003">WO-003 - Project Gamma</option>
                  <option value="WO-004">WO-004 - Project Delta</option>
                </select>
                <ChevronDown className="monkey-select-icon" />
              </div>
            </div>

            {/* Building Name Dropdown - For Drawings Status and Material Requirement */}
            {(selectedReport === "drawings-status" || selectedReport === "material-requirement") && (
              <div className="giraffe-work-order-group">
                <label htmlFor="buildingName">Select Building Name</label>
                <div className="hippo-select-wrapper">
                  <select
                    id="buildingName"
                    value={selectedBuildingName}
                    onChange={handleBuildingNameChange}
                    className="rhino-select"
                  >
                    <option value="">Choose building...</option>
                    <option value="Building-A">Building A</option>
                    <option value="Building-B">Building B</option>
                    <option value="Building-C">Building C</option>
                    <option value="Building-D">Building D</option>
                  </select>
                  <ChevronDown className="monkey-select-icon" />
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
                <div className="hippo-select-wrapper">
                  <select
                    id="projectName"
                    value={selectedProjectName}
                    onChange={handleProjectNameChange}
                    className="rhino-select"
                  >
                    <option value="">Choose project...</option>
                    <option value="Project-Alpha">Project Alpha</option>
                    <option value="Project-Beta">Project Beta</option>
                    <option value="Project-Gamma">Project Gamma</option>
                    <option value="Project-Delta">Project Delta</option>
                    <option value="Project-Omega">Project Omega</option>
                  </select>
                  <ChevronDown className="monkey-select-icon" />
                </div>
              </div>
            )}

            {/* Service Description Dropdown - Only for Drawings Status */}
            {selectedReport === "drawings-status" && (
              <div className="giraffe-work-order-group">
                <label htmlFor="serviceDescription">Select Service Description</label>
                <div className="hippo-select-wrapper">
                  <select
                    id="serviceDescription"
                    value={selectedServiceDescription}
                    onChange={handleServiceDescriptionChange}
                    className="rhino-select"
                  >
                    <option value="">Choose service...</option>
                    {serviceDescriptionOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="monkey-select-icon" />
                </div>
              </div>
            )}

            {/* Drawing No Dropdown - For Material Requirement and Inspection Reports */}
            {(selectedReport === "material-requirement" || selectedReport === "inspection-reports") && (
              <div className="giraffe-work-order-group">
                <label htmlFor="drawingNo">Select Drawing No</label>
                <div className="hippo-select-wrapper">
                  <select
                    id="drawingNo"
                    value={selectedDrawingNo}
                    onChange={handleDrawingNoChange}
                    className="rhino-select"
                  >
                    <option value="">Choose drawing...</option>
                    <option value="DWG-001">DWG-001</option>
                    <option value="DWG-002">DWG-002</option>
                    <option value="DWG-003">DWG-003</option>
                    <option value="DWG-004">DWG-004</option>
                  </select>
                  <ChevronDown className="monkey-select-icon" />
                </div>
              </div>
            )}

            {/* Mark No Dropdown - Only for Inspection Reports */}
            {selectedReport === "inspection-reports" && (
              <div className="giraffe-work-order-group">
                <label htmlFor="markNo">Select Mark No</label>
                <div className="hippo-select-wrapper">
                  <select id="markNo" value={selectedMarkNo} onChange={handleMarkNoChange} className="rhino-select">
                    <option value="">Choose mark...</option>
                    <option value="MRK-001">MRK-001</option>
                    <option value="MRK-002">MRK-002</option>
                    <option value="MRK-003">MRK-003</option>
                    <option value="MRK-004">MRK-004</option>
                  </select>
                  <ChevronDown className="monkey-select-icon" />
                </div>
              </div>
            )}

            {/* Contractor Dropdown - Only for Inspection Reports */}
            {selectedReport === "inspection-reports" && (
              <div className="giraffe-work-order-group">
                <label htmlFor="contractor">Select Contractor</label>
                <div className="hippo-select-wrapper">
                  <select
                    id="contractor"
                    value={selectedContractor}
                    onChange={handleContractorChange}
                    className="rhino-select"
                  >
                    <option value="">Choose contractor...</option>
                    <option value="ABC-Construction">ABC Construction</option>
                    <option value="XYZ-Builders">XYZ Builders</option>
                    <option value="DEF-Engineering">DEF Engineering</option>
                    <option value="GHI-Contractors">GHI Contractors</option>
                  </select>
                  <ChevronDown className="monkey-select-icon" />
                </div>
              </div>
            )}

            {/* RA No Dropdown - For Billing Reports and Material Reconciliation */}
            {(selectedReport === "billing-reports" || selectedReport === "material-reconciliation") && (
              <div className="giraffe-work-order-group">
                <label htmlFor="raNo">Select RA No</label>
                <div className="hippo-select-wrapper">
                  <select id="raNo" value={selectedRANo} onChange={handleRANoChange} className="rhino-select">
                    <option value="">Choose RA No...</option>
                    <option value="RA1">RA1</option>
                    <option value="RA2">RA2</option>
                    <option value="RA3">RA3</option>
                    <option value="RA4">RA4</option>
                  </select>
                  <ChevronDown className="monkey-select-icon" />
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
                                ? "7"
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
