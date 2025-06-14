import { useState, useEffect, useRef } from "react"
import "../ReportsNewComponent/ReportsDesign.css"
import { MdSearch } from "react-icons/md"
import { TfiTag } from "react-icons/tfi";
import { FiClipboard } from "react-icons/fi";
import { RxDrawingPin } from "react-icons/rx";
import { VscDiffRenamed } from "react-icons/vsc";
 
import { FiTag } from "react-icons/fi"

const ReportTemplate = () => {
  // State for dropdown options
  const [workOrderOptions, setWorkOrderOptions] = useState([])
  const [buildingNameOptions, setBuildingNameOptions] = useState([])
  const [drawingNoOptions, setDrawingNoOptions] = useState([])
  const [markNoOptions, setMarkNoOptions] = useState([])

  // State for filtered options (for search)
  const [filteredWorkOrderOptions, setFilteredWorkOrderOptions] = useState([])
  const [filteredBuildingNameOptions, setFilteredBuildingNameOptions] = useState([])
  const [filteredDrawingNoOptions, setFilteredDrawingNoOptions] = useState([])
  const [filteredMarkNoOptions, setFilteredMarkNoOptions] = useState([])

  // State for search terms
  const [searchTerms, setSearchTerms] = useState({
    workOrder: "",
    building: "",
    drawing: "",
    mark: "",
  })

  // State for selected values
  const [selectedWorkOrders, setSelectedWorkOrders] = useState([])
  const [selectedBuildingNames, setSelectedBuildingNames] = useState([])
  const [selectedDrawingNos, setSelectedDrawingNos] = useState([])
  const [selectedMarkNos, setSelectedMarkNos] = useState([])

  // State for dropdown visibility
  const [openDropdown, setOpenDropdown] = useState(null)

  // State for table data
  const [tableData, setTableData] = useState([])
  const [showTable, setShowTable] = useState(false)
  const [loading, setLoading] = useState(false)
  const [tableLoading, setTableLoading] = useState(false)
  const [dropdownLoading, setDropdownLoading] = useState(false)
  const [error, setError] = useState(null)

  // State for work order details
  const [workOrderDetails, setWorkOrderDetails] = useState({})

  // Refs for dropdown containers
  const dropdownRefs = {
    workOrder: useRef(null),
    building: useRef(null),
    drawing: useRef(null),
    mark: useRef(null),
  }

  // API base URL
  const API_BASE_URL = "http://195.35.45.56:5522/api/V2.0"

  // Fetch dropdown options on component mount
  useEffect(() => {
    fetchDropdownOptions()
  }, [])

  // Update filtered options when search terms change
  useEffect(() => {
    setFilteredWorkOrderOptions(
      workOrderOptions.filter((option) => option.toLowerCase().includes(searchTerms.workOrder.toLowerCase())),
    )
  }, [workOrderOptions, searchTerms.workOrder])

  useEffect(() => {
    setFilteredBuildingNameOptions(
      buildingNameOptions.filter((option) => option.toLowerCase().includes(searchTerms.building.toLowerCase())),
    )
  }, [buildingNameOptions, searchTerms.building])

  useEffect(() => {
    setFilteredDrawingNoOptions(
      drawingNoOptions.filter((option) => option.toLowerCase().includes(searchTerms.drawing.toLowerCase())),
    )
  }, [drawingNoOptions, searchTerms.drawing])

  useEffect(() => {
    setFilteredMarkNoOptions(
      markNoOptions.filter((option) => option.toLowerCase().includes(searchTerms.mark.toLowerCase())),
    )
  }, [markNoOptions, searchTerms.mark])

  // Show table when filters change
  useEffect(() => {
    if (
      selectedWorkOrders.length > 0 ||
      selectedBuildingNames.length > 0 ||
      selectedDrawingNos.length > 0 ||
      selectedMarkNos.length > 0
    ) {
      handleShowTable()
    }
  }, [selectedWorkOrders, selectedBuildingNames, selectedDrawingNos, selectedMarkNos])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const isClickInsideAnyDropdown = Object.values(dropdownRefs).some(
        (ref) => ref.current && ref.current.contains(event.target),
      )

      if (!isClickInsideAnyDropdown) {
        setOpenDropdown(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Fetch work order details when selected work orders change
  useEffect(() => {
    if (selectedWorkOrders.length > 0) {
      fetchWorkOrderDetails(selectedWorkOrders[0])
    }
  }, [selectedWorkOrders])

  const fetchWorkOrderDetails = async (workOrderNumber) => {
    try {
      const response = await fetch(`${API_BASE_URL}/getworkorder/number/${workOrderNumber}`)
      if (response.ok) {
        const data = await response.json()
        setWorkOrderDetails(data)
      } else {
        console.error("Failed to fetch work order details")
      }
    } catch (err) {
      console.error("Error fetching work order details:", err)
    }
  }

  const fetchDropdownOptions = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get all drawing entries
      const allEntriesResponse = await fetch(`${API_BASE_URL}/getAllBitsDrawingEntries/details?size=1000`)
      if (!allEntriesResponse.ok) throw new Error("Failed to fetch drawing entries")

      const allEntriesData = await allEntriesResponse.json()
      const entries = allEntriesData.content || allEntriesData

      // Extract unique values from the entries
      const workOrders = [...new Set(entries.map((entry) => entry.attribute1V).filter(Boolean))].sort()
      const buildings = [...new Set(entries.map((entry) => entry.attribute2V).filter(Boolean))].sort()
      const drawings = [...new Set(entries.map((entry) => entry.drawingNo).filter(Boolean))].sort()
      const marks = [...new Set(entries.map((entry) => entry.markNo).filter(Boolean))].sort()

      setWorkOrderOptions(workOrders)
      setBuildingNameOptions(buildings)
      setDrawingNoOptions(drawings)
      setMarkNoOptions(marks)

      // Initialize filtered options
      setFilteredWorkOrderOptions(workOrders)
      setFilteredBuildingNameOptions(buildings)
      setFilteredDrawingNoOptions(drawings)
      setFilteredMarkNoOptions(marks)

      console.log("Fetched options:", { workOrders, buildings, drawings, marks })
    } catch (err) {
      console.error("Error fetching dropdown options:", err)
      setError("Failed to load dropdown options: " + err.message)
    } finally {
      setLoading(false)
    }
  }

  const fetchTableData = async () => {
    try {
      setTableLoading(true)
      setError(null)

      // Get all drawing entries
      const allEntriesResponse = await fetch(`${API_BASE_URL}/getAllBitsDrawingEntries/details?size=1000`)
      if (!allEntriesResponse.ok) throw new Error("Failed to fetch drawing entries")

      const allEntriesData = await allEntriesResponse.json()
      let entries = allEntriesData.content || allEntriesData

      // Apply filters
      if (selectedWorkOrders.length > 0) {
        entries = entries.filter((entry) => selectedWorkOrders.includes(entry.attribute1V))
      }

      if (selectedBuildingNames.length > 0) {
        entries = entries.filter((entry) => selectedBuildingNames.includes(entry.attribute2V))
      }

      if (selectedDrawingNos.length > 0) {
        entries = entries.filter((entry) => selectedDrawingNos.includes(entry.drawingNo))
      }

      if (selectedMarkNos.length > 0) {
        entries = entries.filter((entry) => selectedMarkNos.includes(entry.markNo))
      }

      // Group by session name and sum weights
      const groupedData = {}
      entries.forEach((entry) => {
        const sessionName = entry.sessionName || "Unknown"
        const weight = Number.parseFloat(entry.itemWeight) || 0

        if (groupedData[sessionName]) {
          groupedData[sessionName] += weight
        } else {
          groupedData[sessionName] = weight
        }
      })

      // Convert to array format
      const tableData = Object.entries(groupedData)
        .map(([sessionName, totalWeight]) => {
          // Calculate scrap allowance
          const visiblePercent = Number.parseFloat(workOrderDetails.scrapAllowanceVisiblePercent || 0)
          const invisiblePercent = Number.parseFloat(workOrderDetails.scrapAllowanceInvisiblePercent || 0)
          const scrapAllowance = visiblePercent + invisiblePercent

          // Calculate total tild weight
          const totalTildWeight = totalWeight + (totalWeight * scrapAllowance) / 100

          return {
            session_name: sessionName,
            total_weight: totalWeight,
            scrap_allowance: scrapAllowance,
            material_issue_type: workOrderDetails.materialIssueType || "N/A",
            total_tild_weight: totalTildWeight,
          }
        })
        .sort((a, b) => a.session_name.localeCompare(b.session_name))

      setTableData(tableData)
    } catch (err) {
      console.error("Error fetching table data:", err)
      setError("Failed to fetch data: " + err.message)
    } finally {
      setTableLoading(false)
    }
  }

  const handleShowTable = async () => {
    setTableLoading(true)
    setShowTable(true)

    // Simulate loading for 1 second
    setTimeout(async () => {
      await fetchTableData()
    }, 1000)
  }

  const handleSearchIconClick = () => {
    handleShowTable()
  }

  const handleDropdownToggle = async (dropdownName) => {
    setDropdownLoading(true)

    // Simulate loading for less than 1 second
    setTimeout(() => {
      setOpenDropdown(openDropdown === dropdownName ? null : dropdownName)
      setDropdownLoading(false)
    }, 800)
  }

  const handleOptionSelect = (dropdownName, option) => {
    switch (dropdownName) {
      case "workOrder":
        setSelectedWorkOrders((prev) =>
          prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option],
        )
        break
      case "building":
        setSelectedBuildingNames((prev) =>
          prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option],
        )
        break
      case "drawing":
        setSelectedDrawingNos((prev) =>
          prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option],
        )
        break
      case "mark":
        setSelectedMarkNos((prev) =>
          prev.includes(option) ? prev.filter((item) => item !== option) : [...prev, option],
        )
        break
    }
  }

  const handleSelectAll = (dropdownName) => {
    const filteredOptions = getFilteredOptions(dropdownName)
    const selectedOptions = getSelectedOptions(dropdownName)

    switch (dropdownName) {
      case "workOrder":
        setSelectedWorkOrders(selectedOptions.length === filteredOptions.length ? [] : [...filteredOptions])
        break
      case "building":
        setSelectedBuildingNames(selectedOptions.length === filteredOptions.length ? [] : [...filteredOptions])
        break
      case "drawing":
        setSelectedDrawingNos(selectedOptions.length === filteredOptions.length ? [] : [...filteredOptions])
        break
      case "mark":
        setSelectedMarkNos(selectedOptions.length === filteredOptions.length ? [] : [...filteredOptions])
        break
    }
  }

  const handleSearchChange = (dropdownName, value) => {
    setSearchTerms((prev) => ({
      ...prev,
      [dropdownName]: value,
    }))
  }

  const getSelectedCount = (dropdownName) => {
    switch (dropdownName) {
      case "workOrder":
        return selectedWorkOrders.length
      case "building":
        return selectedBuildingNames.length
      case "drawing":
        return selectedDrawingNos.length
      case "mark":
        return selectedMarkNos.length
      default:
        return 0
    }
  }

  const getOptions = (dropdownName) => {
    switch (dropdownName) {
      case "workOrder":
        return workOrderOptions
      case "building":
        return buildingNameOptions
      case "drawing":
        return drawingNoOptions
      case "mark":
        return markNoOptions
      default:
        return []
    }
  }

  const getFilteredOptions = (dropdownName) => {
    switch (dropdownName) {
      case "workOrder":
        return filteredWorkOrderOptions
      case "building":
        return filteredBuildingNameOptions
      case "drawing":
        return filteredDrawingNoOptions
      case "mark":
        return filteredMarkNoOptions
      default:
        return []
    }
  }

  const getSelectedOptions = (dropdownName) => {
    switch (dropdownName) {
      case "workOrder":
        return selectedWorkOrders
      case "building":
        return selectedBuildingNames
      case "drawing":
        return selectedDrawingNos
      case "mark":
        return selectedMarkNos
      default:
        return []
    }
  }

  const clearSelection = (dropdownName) => {
    switch (dropdownName) {
      case "workOrder":
        setSelectedWorkOrders([])
        break
      case "building":
        setSelectedBuildingNames([])
        break
      case "drawing":
        setSelectedDrawingNos([])
        break
      case "mark":
        setSelectedMarkNos([])
        break
    }
  }

  // Calculate total weight
  const totalWeight = showTable
    ? tableData.reduce((sum, row) => sum + (Number.parseFloat(row.total_weight) || 0), 0)
    : 0

  // Calculate total scrap allowance
  const totalScrapAllowance = showTable ? (tableData.length > 0 ? tableData[0].scrap_allowance : 0) : 0

  // Calculate total tild weight
  const totalTildWeight = showTable
    ? tableData.reduce((sum, row) => sum + (Number.parseFloat(row.total_tild_weight) || 0), 0)
    : 0

  const getDropdownIcon = (name) => {
    switch (name) {
      case "workOrder":
        return <TfiTag />
      case "building":
        return <RxDrawingPin />
      case "drawing":
        return <FiClipboard />
      case "mark":
        return <VscDiffRenamed />
      default:
        return <TfiTag />
    }
  }

  const DropdownComponent = ({ name, label }) => {
    const options = getOptions(name)
    const filteredOptions = getFilteredOptions(name)
    const selectedOptions = getSelectedOptions(name)
    const selectedCount = getSelectedCount(name)
    const isOpen = openDropdown === name
    const searchTerm = searchTerms[name]

    return (
      <div className="modern-dropdown-container" ref={dropdownRefs[name]}>
        <div className="modern-dropdown-trigger" onClick={() => handleDropdownToggle(name)}>
          <div className="modern-dropdown-content">
            <span className="modern-dropdown-icon">{getDropdownIcon(name)}</span>
            <div className="modern-dropdown-text">
              <span className="modern-dropdown-label">{label}</span>
              <span className="modern-dropdown-count">
                {selectedCount > 0 ? `${selectedCount} selected` : "Select options"}
              </span>
            </div>
          </div>
          <span className={`modern-dropdown-arrow ${isOpen ? "open" : ""}`}>
            {dropdownLoading ? (
              <div className="modern-loading-spinner-small"></div>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M6 9L12 15L18 9"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </span>
        </div>

        {isOpen && (
          <div className="modern-dropdown-menu">
            <div className="modern-dropdown-search">
              <input
                type="text"
                placeholder={`Search ${label.toLowerCase()}...`}
                value={searchTerm}
                onChange={(e) => handleSearchChange(name, e.target.value)}
                className="modern-search-input"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
            <div className="modern-dropdown-header">
              <label className="modern-checkbox-container">
                <input
                  type="checkbox"
                  checked={selectedOptions.length === filteredOptions.length && filteredOptions.length > 0}
                  onChange={() => handleSelectAll(name)}
                />
                <span className="modern-checkbox-checkmark"></span>
                <span className="modern-checkbox-label">Select All ({filteredOptions.length})</span>
              </label>
              {selectedCount > 0 && (
                <button className="modern-clear-button" onClick={() => clearSelection(name)}>
                  Clear
                </button>
              )}
            </div>
            <div className="modern-dropdown-options">
              {filteredOptions.map((option) => (
                <label key={option} className="modern-checkbox-container">
                  <input
                    type="checkbox"
                    checked={selectedOptions.includes(option)}
                    onChange={() => handleOptionSelect(name, option)}
                  />
                  <span className="modern-checkbox-checkmark"></span>
                  <span className="modern-checkbox-label" title={option}>
                    {option}
                  </span>
                </label>
              ))}
              {filteredOptions.length === 0 && (
                <div className="modern-no-results">No results found for "{searchTerm}"</div>
              )}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="modern-report-container">
      <div className="modern-filter-section">
        <div className="modern-filter-grid">
          <DropdownComponent name="workOrder" label="Work Order No" />
          <DropdownComponent name="building" label="Building Name" />
          <DropdownComponent name="drawing" label="Drawing No" />
          <DropdownComponent name="mark" label="Mark No" />
        </div>

        {(selectedWorkOrders.length > 0 ||
          selectedBuildingNames.length > 0 ||
          selectedDrawingNos.length > 0 ||
          selectedMarkNos.length > 0) && (
          <div className="modern-selected-summary">
            <div className="modern-summary-header">
              <span className="modern-summary-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M3 6H21M3 12H21M3 18H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </span>
              <span>Active Filters</span>
            </div>
            <div className="modern-summary-tags">
              {selectedWorkOrders.map((item) => (
                <span key={`wo-${item}`} className="modern-summary-tag work-order">
                  <TfiTag /> {item}
                </span>
              ))}
              {selectedBuildingNames.map((item) => (
                <span key={`bn-${item}`} className="modern-summary-tag building">
                  <TfiTag /> {item}
                </span>
              ))}
              {selectedDrawingNos.map((item) => (
                <span key={`dn-${item}`} className="modern-summary-tag drawing">
                  <FiClipboard /> {item}
                </span>
              ))}
              {selectedMarkNos.map((item) => (
                <span key={`mn-${item}`} className="modern-summary-tag mark">
                  <FiTag /> {item}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="modern-table-section">
        <div className="modern-table-header">
          <div className="modern-table-title">
            <span className="modern-table-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 3H21C21.5523 3 22 3.44772 22 4V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path d="M8 3V21M16 3V21M2 12H22M2 8H22M2 16H22" stroke="currentColor" strokeWidth="1" />
              </svg>
            </span>
            <span>Material Requirements</span>
            <button
              className="modern-search-button"
              onClick={handleSearchIconClick}
              title="Load all material requirements"
            >
              <MdSearch />
            </button>
          </div>
          <div className="modern-table-stats">
            <span className="modern-stat">
              <span className="modern-stat-value">{showTable ? tableData.length : 0}</span>
              <span className="modern-stat-label">Sections</span>
            </span>
            <span className="modern-stat">
              <span className="modern-stat-value">{totalWeight.toFixed(2)}</span>
              <span className="modern-stat-label">Total Drawing Weight (kg)</span>
            </span>
            <span className="modern-stat">
              <span className="modern-stat-value">{totalTildWeight.toFixed(2)}</span>
              <span className="modern-stat-label">Total Weight (kg)</span>
            </span>
          </div>
        </div>

        {!showTable ? (
          <div className="modern-table-placeholder">
            <div className="modern-placeholder-content">
              <MdSearch size={48} />
              <p>Click the search icon to load material requirements</p>
            </div>
          </div>
        ) : tableLoading ? (
          <div className="modern-loading">
            <div className="modern-loading-spinner"></div>
            <span>Loading data...</span>
          </div>
        ) : error ? (
          <div className="modern-error">
            <span className="modern-error-icon">⚠️</span>
            <span>{error}</span>
          </div>
        ) : (
          <div className="modern-table-wrapper">
            <table className="modern-data-table">
              <thead>
                <tr>
                  <th>
                    <div className="modern-th-content">
                      <span>Section Name</span>
                      
                    </div>
                  </th>
                  <th>
                    <div className="modern-th-content">
                      <span>Total Drawing Weight (kg)</span>
                       
                    </div>
                  </th>
                  <th>
                    <div className="modern-th-content">
                      <span>Scrap Allowance (%)</span>
                      
                    </div>
                  </th>
                  <th>
                    <div className="modern-th-content">
                      <span>Material Issue Type</span>
                      
                    </div>
                  </th>
                  <th>
                    <div className="modern-th-content">
                      <span>Total Weight (kg)</span>
                      
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {tableData.length > 0 ? (
                  tableData.map((row, index) => (
                    <tr key={index}>
                      <td>
                        <div className="modern-cell-content">
                           
                          <span>{row.session_name || "N/A"}</span>
                        </div>
                      </td>
                      <td>
                        <div className="modern-weight-cell">
                          <span className="modern-weight-value">{Number.parseFloat(row.total_weight).toFixed(2)}</span>
                          <span className="modern-weight-unit">kg</span>
                        </div>
                      </td>
                      <td>
                        <div className="modern-weight-cell">
                          <span className="modern-weight-value">{row.scrap_allowance}</span>
                          <span className="modern-weight-unit">%</span>
                        </div>
                      </td>
                      <td>
                        <div className="modern-cell-content">
                          <span>{row.material_issue_type}</span>
                        </div>
                      </td>
                      <td>
                        <div className="modern-weight-cell">
                          <span className="modern-weight-value">
                            {Number.parseFloat(row.total_tild_weight).toFixed(2)}
                          </span>
                          <span className="modern-weight-unit">kg</span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="modern-no-data">
                      <div className="modern-no-data-content">
                        <span className="modern-no-data-icon">📊</span>
                        <span>No data available for the selected filters</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default ReportTemplate;
