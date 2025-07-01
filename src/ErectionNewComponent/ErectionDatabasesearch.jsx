import { useState, useEffect, useRef } from "react"
import { AiOutlineLoading3Quarters } from "react-icons/ai"
import { MdSave, MdKeyboardArrowDown } from "react-icons/md"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { IoMdOpen } from "react-icons/io"
import { MdFileDownload } from "react-icons/md"
import "../ErectionNewComponent/erection-database-search.css"

const ErectionDatabasesearch = () => {
  // API Base URL
  const API_BASE_URL = "http://195.35.45.56:5522/api/V2.0"

  // State management
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [tableData, setTableData] = useState([])
  const [filteredData, setFilteredData] = useState([])

  // NEW: Dropdown data for cascading filters
  const [workOrders, setWorkOrders] = useState([])
  const [buildingNames, setBuildingNames] = useState([])
  const [departments, setDepartments] = useState([])
  const [vendorNames, setVendorNames] = useState([])

  // NEW: Multiple selection states for cascading dropdowns
  const [selectedWorkOrders, setSelectedWorkOrders] = useState([])
  const [selectedBuildingNames, setSelectedBuildingNames] = useState([])
  const [selectedDepartments, setSelectedDepartments] = useState([])
  const [selectedVendorName, setSelectedVendorName] = useState("")

  // Dropdown open states
  const [dropdownStates, setDropdownStates] = useState({
    workOrder: false,
    buildingName: false,
    department: false,
    vendor: false,
  })

  // RA NO state for filter section
  const [filterRaNo, setFilterRaNo] = useState("")
  const [savingFilterRaNo, setSavingFilterRaNo] = useState(false)
  const [raNoFieldEnabled, setRaNoFieldEnabled] = useState(false) // NEW: Control RA NO field

  // Selected filter values for display
  const [selectedFilters, setSelectedFilters] = useState({
    workOrders: [],
    buildingNames: [],
    departments: [],
    raNo: "",
    vendorName: "",
  })

  // Move to Alignment popup states
  const [showMoveToAlignmentPopup, setShowMoveToAlignmentPopup] = useState(false)
  const [selectedMarkNosForAlignment, setSelectedMarkNosForAlignment] = useState([])
  const [availableMarkNosForAlignment, setAvailableMarkNosForAlignment] = useState([])

  // Show search results flag
  const [showSearchResults, setShowSearchResults] = useState(false)

  // Remarks state for each row
  const [remarks, setRemarks] = useState({})

  // Refs for dropdown click outside detection
  const dropdownRefs = {
    workOrder: useRef(null),
    buildingName: useRef(null),
    department: useRef(null),
    vendor: useRef(null),
  }

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      Object.keys(dropdownRefs).forEach((key) => {
        if (dropdownRefs[key].current && !dropdownRefs[key].current.contains(event.target)) {
          setDropdownStates((prev) => ({ ...prev, [key]: false }))
        }
      })
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Fetch dropdown data on component mount
  useEffect(() => {
    fetchInitialDropdownData()
    fetchVendorNames()
  }, [])

  // NEW: Fetch initial dropdown data (Work Orders only)
  const fetchInitialDropdownData = async () => {
    try {
      setLoading(true)

      // Fetch work orders from erection entries (attribute1V)
      const workOrderResponse = await fetch(`${API_BASE_URL}/getDistinctErectionWorkOrders/details`)
      if (workOrderResponse.ok) {
        const workOrderData = await workOrderResponse.json()
        setWorkOrders(workOrderData || [])
      } else {
        console.error("Error fetching work orders:", workOrderResponse.statusText)
        toast.error(`Error fetching work orders: ${workOrderResponse.statusText}`)
      }
    } catch (error) {
      console.error("Error fetching initial dropdown data:", error)
      toast.error(`Error fetching dropdown data: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Fetch vendor names
  const fetchVendorNames = async () => {
    try {
      const response = await fetch("http://195.35.45.56:5522/api/vendor-profile")
      if (response.ok) {
        const vendorData = await response.json()
        const companyNames = vendorData
          .filter((vendor) => vendor.status === "ACTIVE")
          .map((vendor) => vendor.companyName)
          .sort()
        setVendorNames(companyNames)
      }
    } catch (error) {
      console.error("Error fetching vendor names:", error)
    }
  }

  // Toggle dropdown
  const toggleDropdown = (dropdownName) => {
    setDropdownStates((prev) => {
      const newState = { ...prev }
      // Close all other dropdowns
      Object.keys(newState).forEach((key) => {
        newState[key] = key === dropdownName ? !prev[dropdownName] : false
      })
      return newState
    })
  }

  // Handle checkbox selection
  const handleCheckboxChange = (value, currentSelections, setSelections) => {
    if (currentSelections.includes(value)) {
      setSelections(currentSelections.filter((item) => item !== value))
    } else {
      setSelections([...currentSelections, value])
    }
  }

  // Handle select all
  const handleSelectAll = (options, currentSelections, setSelections) => {
    if (currentSelections.length === options.length) {
      setSelections([])
    } else {
      setSelections([...options])
    }
  }

  // NEW: Handle Work Order selection changes (cascading effect)
  useEffect(() => {
    if (selectedWorkOrders.length > 0) {
      fetchBuildingNamesByWorkOrders()
    } else {
      // Reset dependent dropdowns when no work orders selected
      setSelectedBuildingNames([])
      setSelectedDepartments([])
      setBuildingNames([])
      setDepartments([])
    }
  }, [selectedWorkOrders])

  // NEW: Handle Building Name selection changes (cascading effect)
  useEffect(() => {
    if (selectedWorkOrders.length > 0 && selectedBuildingNames.length > 0) {
      fetchDepartmentsByWorkOrdersAndBuildingNames()
    } else {
      // Reset departments when no building names selected
      setSelectedDepartments([])
      setDepartments([])
    }
  }, [selectedWorkOrders, selectedBuildingNames])

  // NEW: Fetch building names based on selected work orders
  const fetchBuildingNamesByWorkOrders = async () => {
    try {
      // Get all erection entries
      const allEntriesResponse = await fetch(`${API_BASE_URL}/getAllErectionDrawingEntriesComplete/details`)
      if (allEntriesResponse.ok) {
        const allEntries = await allEntriesResponse.json()

        // Filter building names by selected work orders
        const filteredBuildingNames = [
          ...new Set(
            allEntries
              .filter((entry) => selectedWorkOrders.includes(entry.attribute1V))
              .map((entry) => entry.attribute2V)
              .filter((name) => name && name.trim() !== ""),
          ),
        ].sort()

        setBuildingNames(filteredBuildingNames || [])

        // Reset building name selections if they're no longer valid
        setSelectedBuildingNames((prev) => prev.filter((name) => filteredBuildingNames.includes(name)))
      }
    } catch (error) {
      console.error("Error fetching building names:", error)
      setBuildingNames([])
    }
  }

  // NEW: Fetch departments based on selected work orders and building names
  const fetchDepartmentsByWorkOrdersAndBuildingNames = async () => {
    try {
      // Get all erection entries
      const allEntriesResponse = await fetch(`${API_BASE_URL}/getAllErectionDrawingEntriesComplete/details`)
      if (allEntriesResponse.ok) {
        const allEntries = await allEntriesResponse.json()

        // Filter departments by selected work orders and building names
        const filteredDepartments = [
          ...new Set(
            allEntries
              .filter(
                (entry) =>
                  selectedWorkOrders.includes(entry.attribute1V) && selectedBuildingNames.includes(entry.attribute2V),
              )
              .map((entry) => entry.attribute3V)
              .filter((dept) => dept && dept.trim() !== ""),
          ),
        ].sort()

        setDepartments(filteredDepartments || [])

        // Reset department selections if they're no longer valid
        setSelectedDepartments((prev) => prev.filter((dept) => filteredDepartments.includes(dept)))
      }
    } catch (error) {
      console.error("Error fetching departments:", error)
      setDepartments([])
    }
  }

  // Handle vendor selection
  const handleVendorChange = (vendorName) => {
    setSelectedVendorName(vendorName)
    if (showSearchResults) {
      setSelectedFilters((prev) => ({
        ...prev,
        vendorName: vendorName,
      }))
    }
  }

  // NEW: Handle search button click with multiple selections
  const handleSearch = async () => {
    if (selectedWorkOrders.length === 0 || selectedBuildingNames.length === 0 || selectedDepartments.length === 0) {
      toast.warning("Please select at least one Work Order, Building Name, and Department to search")
      return
    }

    try {
      setLoading(true)

      // Get all erection entries and filter by selected criteria
      const allEntriesResponse = await fetch(`${API_BASE_URL}/getAllErectionDrawingEntriesComplete/details`)
      if (!allEntriesResponse.ok) {
        throw new Error(`HTTP error! status: ${allEntriesResponse.status}`)
      }

      const allEntries = await allEntriesResponse.json()

      // Filter entries based on multiple selections using AND logic
      const filteredResults = allEntries.filter(
        (entry) =>
          selectedWorkOrders.includes(entry.attribute1V) &&
          selectedBuildingNames.includes(entry.attribute2V) &&
          selectedDepartments.includes(entry.attribute3V),
      )

      setTableData(filteredResults)
      setFilteredData(filteredResults)
      setShowSearchResults(true)

      // Initialize remarks for new results
      const newRemarks = {}
      filteredResults.forEach((row, index) => {
        newRemarks[`row_${index}`] = ""
      })
      setRemarks(newRemarks)

      // Set selected filter values for display
      setSelectedFilters({
        workOrders: selectedWorkOrders,
        buildingNames: selectedBuildingNames,
        departments: selectedDepartments,
        raNo: filterRaNo,
        vendorName: selectedVendorName,
      })

      // NEW: Enable RA NO field after successful search
      setRaNoFieldEnabled(true)

      // Extract unique mark numbers for alignment popup
      const uniqueMarkNos = [...new Set(filteredResults.map((item) => item.markNo).filter((markNo) => markNo))]
      setAvailableMarkNosForAlignment(uniqueMarkNos)

      toast.info(`Found ${filteredResults.length} records`)
    } catch (error) {
      console.error("Error searching data:", error)
      toast.error(`Error searching data: ${error.message}`)
      setTableData([])
      setFilteredData([])
      setShowSearchResults(false)
      setRaNoFieldEnabled(false) // Disable RA NO field on error
    } finally {
      setLoading(false)
    }
  }

  // Handle remarks change
  const handleRemarksChange = (rowKey, value) => {
    setRemarks((prev) => ({
      ...prev,
      [rowKey]: value,
    }))
  }

  // Save RA NO for all selected entries
  const handleSaveFilterRaNo = async () => {
    if (!filterRaNo.trim()) {
      toast.warning("Please enter RA NO before saving")
      return
    }

    if (filteredData.length === 0) {
      toast.warning("No search results to update")
      return
    }

    try {
      setSavingFilterRaNo(true)

      let successCount = 0
      for (const row of filteredData) {
        try {
          const response = await fetch(
            `${API_BASE_URL}/saveErectionRaNo/details?lineId=${row.lineId}&raNo=${encodeURIComponent(filterRaNo)}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
            },
          )

          if (response.ok) {
            successCount++
          }
        } catch (error) {
          console.error(`Error updating RA NO for line ID ${row.lineId}:`, error)
        }
      }

      if (successCount > 0) {
        toast.success(`RA NO saved successfully for ${successCount} entries!`)
        // Update the filtered data to show the new RA NO
        const updatedData = filteredData.map((row) => ({
          ...row,
          raNo: filterRaNo,
        }))
        setFilteredData(updatedData)
        setTableData(updatedData)

        // Update selected filters
        setSelectedFilters((prev) => ({
          ...prev,
          raNo: filterRaNo,
        }))
      } else {
        toast.error("Failed to save RA NO for any entries")
      }
    } catch (error) {
      console.error("Error saving RA NO:", error)
      toast.error("Error saving RA NO: " + error.message)
    } finally {
      setSavingFilterRaNo(false)
    }
  }

  // Handle Move to Alignment button click
  const handleMoveToAlignment = () => {
    setShowMoveToAlignmentPopup(true)
  }

  // Handle mark number selection in popup
  const handleMarkNoSelection = (markNo) => {
    setSelectedMarkNosForAlignment((prev) => {
      if (prev.includes(markNo)) {
        return prev.filter((m) => m !== markNo)
      } else {
        return [...prev, markNo]
      }
    })
  }

  // Handle save to alignment
  const handleSaveToAlignment = async () => {
    if (selectedMarkNosForAlignment.length === 0) {
      toast.warning("Please select at least one Mark No.")
      return
    }

    try {
      setLoading(true)

      const entriesToMove = []
      for (const markNo of selectedMarkNosForAlignment) {
        const entries = tableData.filter((item) => item.markNo === markNo)
        entriesToMove.push(...entries)
      }

      if (entriesToMove.length === 0) {
        toast.error("No entries found for selected Mark Numbers")
        return
      }

      const alignmentEntries = entriesToMove.map((item) => ({
        lineId: item.lineId,
        drawingNo: item.drawingNo || "",
        markNo: item.markNo || "",
        markedQty: item.markedQty || 1,
        totalMarkedWgt: item.totalMarkedWgt || 0,
        sessionCode: item.sessionCode || "",
        sessionName: item.sessionName || "",
        sessionWeight: item.sessionWeight || 0,
        width: item.width || 0,
        length: item.length || 0,
        itemQty: item.itemQty || 0,
        itemWeight: item.itemWeight || 0,
        totalItemWeight: item.totalItemWeight || 0,
        orderId: item.orderId || null,
        raNo: item.raNo || "",
        tenantId: item.tenantId || "DEFAULT_TENANT",
        createdBy: "system",
        lastUpdatedBy: "system",
        status: "alignment",
        attribute1V: item.attribute1V || null,
        attribute2V: item.attribute2V || null,
        attribute3V: item.attribute3V || null,
        attribute4V: item.attribute4V || null,
        attribute5V: item.attribute5V || null,
        attribute1N: item.attribute1N || null,
        attribute2N: item.attribute2N || null,
        attribute3N: item.attribute3N || null,
        attribute4N: item.attribute4N || null,
        attribute5N: item.attribute5N || null,
        drawingWeight: item.drawingWeight || null,
        markWeight: item.markWeight || null,
        cuttingStage: item.cuttingStage || "N",
        fitUpStage: item.fitUpStage || "N",
        weldingStage: item.weldingStage || "N",
        finishingStage: item.finishingStage || "N",
      }))

      const response = await fetch(`${API_BASE_URL}/createBulkAlignmentDrawingEntries/details`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(alignmentEntries),
      })

      if (response.ok) {
        toast.success(`${entriesToMove.length} entries moved to Alignment successfully!`)
        setShowMoveToAlignmentPopup(false)
        setSelectedMarkNosForAlignment([])
      } else {
        const errorText = await response.text()
        console.error("Move to alignment failed:", errorText)
        toast.error(`Failed to move to alignment: ${errorText}`)
      }
    } catch (error) {
      console.error("Error moving to alignment:", error)
      toast.error("Error moving to Alignment: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  // Calculate total mark weight
  const calculateTotalMarkWeight = () => {
    const total = filteredData.reduce((sum, row) => {
      const weight = Number.parseFloat(row.totalMarkedWgt) || 0
      return sum + weight
    }, 0)
    return total
  }

  // Format number for display
  const formatNumber = (value) => {
    if (value === null || value === undefined) return "-"
    return Number.parseFloat(value).toFixed(3)
  }

  // Render custom dropdown with checkboxes
  const renderCustomDropdown = (dropdownName, options, selectedValues, setSelectedValues, placeholder) => {
    const isOpen = dropdownStates[dropdownName]
    const allSelected = selectedValues.length === options.length && options.length > 0

    return (
      <div className="dropdown-container" ref={dropdownRefs[dropdownName]}>
        <div className={`dropdown-select ${isOpen ? "open" : ""}`} onClick={() => toggleDropdown(dropdownName)}>
          <span className="dropdown-text">
            {selectedValues.length > 0 ? `${selectedValues.length} selected` : placeholder}
          </span>
          <MdKeyboardArrowDown className={`dropdown-arrow ${isOpen ? "rotated" : ""}`} />
        </div>

        {isOpen && (
          <div className="dropdown-menu">
            <div className="dropdown-option select-all">
              <label className="option-label">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={() => handleSelectAll(options, selectedValues, setSelectedValues)}
                  className="option-checkbox"
                />
                <span className="option-text">{allSelected ? "Deselect All" : "Select All"}</span>
              </label>
            </div>
            <div className="dropdown-separator"></div>
            <div className="options-list">
              {options.map((option, index) => (
                <div key={`${dropdownName}_${index}`} className="dropdown-option">
                  <label className="option-label">
                    <input
                      type="checkbox"
                      checked={selectedValues.includes(option)}
                      onChange={() => handleCheckboxChange(option, selectedValues, setSelectedValues)}
                      className="option-checkbox"
                    />
                    <span className="option-text">{option}</span>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="main-container">
      {/* Header */}
      <div className="header-section">
        <div className="header-title">
          <h1>Search for your entries</h1>
        </div>
        <div className="header-buttons">
          <button className="save-btn">
            <MdFileDownload />
            Download reports
          </button>
          <button className="completed-btn" onClick={handleMoveToAlignment} disabled={filteredData.length === 0}>
            Completed
          </button>
        </div>
      </div>

      {/* Filter Section - NEW: Multiple Selection Cascading Dropdowns */}
      <div className="filter-section">
        <div className="filter-grid">
          {/* Work Order Dropdown - Multiple Selection */}
          {renderCustomDropdown(
            "workOrder",
            workOrders,
            selectedWorkOrders,
            setSelectedWorkOrders,
            "Select Work Order(s)",
          )}

          {/* Building Name Dropdown - Multiple Selection */}
          {renderCustomDropdown(
            "buildingName",
            buildingNames,
            selectedBuildingNames,
            setSelectedBuildingNames,
            "Select Building Name(s)",
          )}

          {/* Department Dropdown - Multiple Selection */}
          {renderCustomDropdown(
            "department",
            departments,
            selectedDepartments,
            setSelectedDepartments,
            "Select Project(s)",
          )}
        </div>

        <div className="filter-row-2">
          {/* RA NO Field - NEW: Disabled until search */}
          <div className="ra-no-group">
            <label className="ra-no-label">RA NO:</label>
            <div className="ra-no-container">
              <input
                type="text"
                value={filterRaNo}
                onChange={(e) => setFilterRaNo(e.target.value)}
                className="ra-no-input"
                placeholder="Enter the RA NO"
                disabled={!raNoFieldEnabled}
              />
              <button
                onClick={handleSaveFilterRaNo}
                className="ra-no-save"
                disabled={savingFilterRaNo || !raNoFieldEnabled}
                title="Save RA NO"
              >
                {savingFilterRaNo ? <AiOutlineLoading3Quarters className="spinner" /> : <MdSave />}
              </button>
            </div>
          </div>

          {/* Search Button */}
          <button className="search-btn" onClick={handleSearch} disabled={loading}>
            {loading ? (
              <>
                <AiOutlineLoading3Quarters className="spinner" />
                Searching...
              </>
            ) : (
              "Search"
            )}
          </button>
        </div>
      </div>

      {/* Vendor Name Dropdown - Show only after search results */}
      {showSearchResults && filteredData.length > 0 && (
        <div className="vendor-section">
          <select
            value={selectedVendorName}
            onChange={(e) => handleVendorChange(e.target.value)}
            className="vendor-select"
          >
            <option value="">Select Vendor</option>
            {vendorNames.map((vendor, index) => (
              <option key={`vendor_${index}`} value={vendor}>
                {vendor}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Selected Filters Display */}
      {showSearchResults && (
        <div className="selected-filters-section">
          <div className="selected-filters-container">
            <h4>Applied Filters:</h4>
            <div className="selected-filters-grid">
              {selectedFilters.workOrders.length > 0 && (
                <div className="filter-item">
                  <span className="filter-label">Work Orders:</span>
                  <span className="filter-value">{selectedFilters.workOrders.join(", ")}</span>
                </div>
              )}
              {selectedFilters.buildingNames.length > 0 && (
                <div className="filter-item">
                  <span className="filter-label">Building Names:</span>
                  <span className="filter-value">{selectedFilters.buildingNames.join(", ")}</span>
                </div>
              )}
              {selectedFilters.departments.length > 0 && (
                <div className="filter-item">
                  <span className="filter-label">Departments:</span>
                  <span className="filter-value">{selectedFilters.departments.join(", ")}</span>
                </div>
              )}
              {selectedFilters.raNo && (
                <div className="filter-item">
                  <span className="filter-label">RA NO:</span>
                  <span className="filter-value">{selectedFilters.raNo}</span>
                </div>
              )}
              {selectedFilters.vendorName && (
                <div className="filter-item">
                  <span className="filter-label">Vendor Name:</span>
                  <span className="filter-value">{selectedFilters.vendorName}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Table Section */}
      <div className="table-section">
        {loading && (
          <div className="loading-overlay">
            <div className="loading-content">
              <AiOutlineLoading3Quarters className="loading-spinner" />
              <span>Loading...</span>
            </div>
          </div>
        )}
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Items #</th>
                <th>Drawing No</th>
                <th>Mark No</th>
                <th>Mark Weight</th>
                <th>Mark Qty</th>
                <th>Total Mark Weight</th>
                <th>Remarks</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, index) => (
                <tr key={`row_${index}`}>
                  <td>
                    <IoMdOpen className="order-icon" />
                  </td>
                  <td>{row.drawingNo || "-"}</td>
                  <td>{row.markNo || "-"}</td>
                  <td>{formatNumber(row.markWeight)}</td>
                  <td>{row.markedQty || "-"}</td>
                  <td>{formatNumber(row.totalMarkedWgt)}</td>
                  <td>
                    <input
                      type="text"
                      value={remarks[`row_${index}`] || ""}
                      onChange={(e) => handleRemarksChange(`row_${index}`, e.target.value)}
                      className="remarks-input"
                      placeholder="Enter remarks..."
                    />
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && !loading && (
                <tr>
                  <td colSpan="7" className="empty-message">
                    Please select Work Order(s), Building Name(s), and Department(s) and click Search to view records.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="progress-section">
        <div className="progress-bar"></div>
      </div>

      {/* Total Calculations */}
      {filteredData.length > 0 && (
        <div className="totals-section">
          <div className="total-item">
            <span>Total Mark Weight: {formatNumber(calculateTotalMarkWeight())} kg</span>
          </div>
          <div className="total-item">
            <span>Total Mark Weight (MT): {formatNumber(calculateTotalMarkWeight() / 1000)} MT</span>
          </div>
        </div>
      )}

      {/* Signature Section */}
      <div className="signature-section">
        <div className="signature-container">
          <div className="company-info">
            <h4>For Bellary Infotech Solutions</h4>
          </div>
          <div className="signature-space">
            <p>Authorized Signature</p>
          </div>
        </div>
      </div>

      {/* Move to Alignment Popup */}
      {showMoveToAlignmentPopup && (
        <div className="popup-overlay">
          <div className="popup-container">
            <div className="popup-header">
              <h3>Mark No.</h3>
              <button onClick={() => setShowMoveToAlignmentPopup(false)} className="popup-close">
                ✕
              </button>
            </div>
            <div className="popup-content">
              <div className="popup-label">Select Mark No(s):</div>
              <div className="popup-options">
                {availableMarkNosForAlignment.map((markNo, index) => (
                  <label key={`popup_mark_${index}`} className="popup-option">
                    <input
                      type="checkbox"
                      checked={selectedMarkNosForAlignment.includes(markNo)}
                      onChange={() => handleMarkNoSelection(markNo)}
                    />
                    <span>{markNo}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="popup-actions">
              <button onClick={() => setShowMoveToAlignmentPopup(false)} className="cancel-btn">
                Cancel
              </button>
              <button
                onClick={handleSaveToAlignment}
                className="save-popup-btn"
                disabled={loading || selectedMarkNosForAlignment.length === 0}
              >
                {loading ? (
                  <>
                    <AiOutlineLoading3Quarters className="spinner" />
                    Saving...
                  </>
                ) : (
                  <>
                    <MdSave />
                    Save
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  )
}

export default ErectionDatabasesearch;
