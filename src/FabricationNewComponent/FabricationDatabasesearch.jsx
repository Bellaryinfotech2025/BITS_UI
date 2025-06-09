import { useState, useEffect } from "react"
import { IoMdOpen } from "react-icons/io"
import { AiOutlineLoading3Quarters } from "react-icons/ai"
import { MdSave, MdEdit, MdDelete } from "react-icons/md"
import { toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { ToastContainer } from "react-toastify"
import '../FabricationNewComponent/FabricationDatabasesearch.css'

const FabricationDatabasesearch = () => {
  // API Base URL
  const API_BASE_URL = "http://195.35.45.56:5522/api/V2.0"

  // State management
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [tableData, setTableData] = useState([])
  const [filteredData, setFilteredData] = useState([])
  const [drawingNumbers, setDrawingNumbers] = useState([])
  const [markNumbers, setMarkNumbers] = useState([])

  // Filter states
  const [selectedDrawingNo, setSelectedDrawingNo] = useState("")
  const [selectedMarkNo, setSelectedMarkNo] = useState("")

  // Move to Erection popup states
  const [showMoveToErectionPopup, setShowMoveToErectionPopup] = useState(false)
  const [selectedMarkNosForErection, setSelectedMarkNosForErection] = useState([])
  const [availableMarkNosForErection, setAvailableMarkNosForErection] = useState([])

  // Edit states
  const [editingRow, setEditingRow] = useState(null)
  const [editFormData, setEditFormData] = useState({})

  // Fabrication process states - tracks checkbox states for each row
  const [fabricationStages, setFabricationStages] = useState({})

  // Fabrication stages in order
  const FABRICATION_STAGES = ["cutting", "fitUp", "welding", "finishing"]
  const STAGE_LABELS = {
    cutting: "Cutting",
    fitUp: "Fit Up",
    welding: "Welding",
    finishing: "Finishing",
  }

  // Backend field mapping
  const STAGE_FIELD_MAPPING = {
    cutting: "cuttingStage",
    fitUp: "fitUpStage",
    welding: "weldingStage",
    finishing: "finishingStage",
  }

  // Initialize fabrication stages for a row from backend data
  const initializeFabricationStagesFromData = (lineId, rowData) => {
    setFabricationStages((prev) => ({
      ...prev,
      [lineId]: {
        cutting: rowData.cuttingStage === "Y",
        fitUp: rowData.fitUpStage === "Y",
        welding: rowData.weldingStage === "Y",
        finishing: rowData.finishingStage === "Y",
      },
    }))
  }

  // Handle fabrication stage checkbox change with sequential logic
  const handleStageChange = (lineId, stage, checked) => {
    setFabricationStages((prev) => {
      const currentStages = prev[lineId] || {
        cutting: false,
        fitUp: false,
        welding: false,
        finishing: false,
      }

      const newStages = { ...currentStages }
      const stageIndex = FABRICATION_STAGES.indexOf(stage)

      if (checked) {
        // If checking a stage, automatically check all previous stages
        for (let i = 0; i <= stageIndex; i++) {
          newStages[FABRICATION_STAGES[i]] = true
        }
      } else {
        // If unchecking a stage, automatically uncheck all subsequent stages
        for (let i = stageIndex; i < FABRICATION_STAGES.length; i++) {
          newStages[FABRICATION_STAGES[i]] = false
        }
      }

      return {
        ...prev,
        [lineId]: newStages,
      }
    })
  }

  // Save fabrication stages to backend
  const handleSaveFabricationStages = async () => {
    try {
      setSaving(true)

      // Prepare fabrication stage updates
      const fabricationUpdates = Object.keys(fabricationStages).map((lineId) => {
        const stages = fabricationStages[lineId]
        return {
          lineId: lineId,
          cuttingStage: stages.cutting ? "Y" : "N",
          fitUpStage: stages.fitUp ? "Y" : "N",
          weldingStage: stages.welding ? "Y" : "N",
          finishingStage: stages.finishing ? "Y" : "N",
        }
      })

      if (fabricationUpdates.length === 0) {
        toast.warning("No fabrication stages to save")
        return
      }

      console.log("Saving fabrication stages:", fabricationUpdates)

      const response = await fetch(`${API_BASE_URL}/updateFabricationStages/details`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fabricationStages: fabricationUpdates,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(`Successfully updated fabrication stages for ${result.updatedCount} entries!`)

        // Refresh data to get updated values
        fetchAllData()
      } else {
        const errorText = await response.text()
        console.error("Save fabrication stages failed:", errorText)
        toast.error(`Failed to save fabrication stages: ${errorText}`)
      }
    } catch (error) {
      console.error("Error saving fabrication stages:", error)
      toast.error("Error saving fabrication stages: " + error.message)
    } finally {
      setSaving(false)
    }
  }

  // Fetch all data on component mount
  useEffect(() => {
    fetchAllData()
  }, [])

  // Filter data when filters change
  useEffect(() => {
    filterData()
  }, [selectedDrawingNo, selectedMarkNo, tableData])

  // Initialize fabrication stages when filtered data changes
  useEffect(() => {
    filteredData.forEach((row) => {
      initializeFabricationStagesFromData(row.lineId, row)
    })
  }, [filteredData])

  // Fetch unique drawing entries and populate dropdowns
  const fetchAllData = async () => {
    try {
      setLoading(true)

      // Use the new unique entries endpoint
      const response = await fetch(`${API_BASE_URL}/getUniqueBitsDrawingEntries/details`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const contentType = response.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Response is not JSON")
      }

      const data = await response.json()

      console.log("Fetched unique data:", data)

      // Set table data
      setTableData(data)
      setFilteredData(data)

      // Extract unique drawing numbers and mark numbers for dropdowns
      const uniqueDrawingNos = [...new Set(data.map((item) => item.drawingNo).filter(Boolean))]
      const uniqueMarkNos = [...new Set(data.map((item) => item.markNo).filter(Boolean))]

      setDrawingNumbers(uniqueDrawingNos.sort())
      setMarkNumbers(uniqueMarkNos.sort())
      setAvailableMarkNosForErection(uniqueMarkNos.sort())

      console.log("Drawing Numbers:", uniqueDrawingNos)
      console.log("Mark Numbers:", uniqueMarkNos)
    } catch (error) {
      console.error("Error fetching data:", error)
      toast.error(`Error fetching data: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Filter data based on selected criteria
  const filterData = () => {
    let filtered = tableData

    if (selectedDrawingNo) {
      filtered = filtered.filter((item) => item.drawingNo === selectedDrawingNo)
    }

    if (selectedMarkNo) {
      filtered = filtered.filter((item) => item.markNo === selectedMarkNo)
    }

    setFilteredData(filtered)
  }

  // Handle search button click
  const handleSearch = () => {
    filterData()
    toast.info(`Found ${filteredData.length} records`)
  }

  // Handle edit button click
  const handleEdit = (row) => {
    setEditingRow(row.lineId)
    setEditFormData({
      drawingNo: row.drawingNo || "",
      markNo: row.markNo || "",
      markedQty: row.markedQty || "",
      sessionCode: row.sessionCode || "",
      sessionName: row.sessionName || "",
      width: row.width || "",
      length: row.length || "",
      itemQty: row.itemQty || "",
      itemWeight: row.itemWeight || "",
    })
  }

  // Handle save edit
  const handleSaveEdit = async () => {
    try {
      setLoading(true)

      // Prepare the update data with only the fields that can be updated
      const updateData = {
        drawingNo: editFormData.drawingNo,
        markNo: editFormData.markNo,
        markedQty: Number.parseFloat(editFormData.markedQty) || 0,
        sessionCode: editFormData.sessionCode,
        sessionName: editFormData.sessionName,
        width: Number.parseFloat(editFormData.width) || 0,
        length: Number.parseFloat(editFormData.length) || 0,
        itemQty: Number.parseFloat(editFormData.itemQty) || 0,
        itemWeight: Number.parseFloat(editFormData.itemWeight) || 0,
        lastUpdatedBy: "system",
        // Don't send datetime fields - let backend handle them
      }

      console.log("Sending update data:", updateData)

      const response = await fetch(`${API_BASE_URL}/updateBitsDrawingEntry/details?lineId=${editingRow}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      })

      if (response.ok) {
        toast.success("Record updated successfully!")
        setEditingRow(null)
        setEditFormData({})
        fetchAllData() // Refresh data
      } else {
        const errorText = await response.text()
        console.error("Update failed:", errorText)
        toast.error(`Failed to update record: ${errorText}`)
      }
    } catch (error) {
      console.error("Error updating record:", error)
      toast.error("Error updating record: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  // Handle cancel edit
  const handleCancelEdit = () => {
    setEditingRow(null)
    setEditFormData({})
  }

  // Handle delete
  const handleDelete = async (lineId) => {
    if (window.confirm("Are you sure you want to delete this record?")) {
      try {
        setLoading(true)

        const response = await fetch(`${API_BASE_URL}/deleteBitsDrawingEntry/details?lineId=${lineId}`, {
          method: "DELETE",
        })

        if (response.ok) {
          toast.success("Record deleted successfully!")
          fetchAllData() // Refresh data
        } else {
          toast.error("Failed to delete record")
        }
      } catch (error) {
        console.error("Error deleting record:", error)
        toast.error("Error deleting record")
      } finally {
        setLoading(false)
      }
    }
  }

  // Handle Move to Erection button click
  const handleMoveToErection = () => {
    setShowMoveToErectionPopup(true)
  }

  // Handle mark number selection in popup
  const handleMarkNoSelection = (markNo) => {
    setSelectedMarkNosForErection((prev) => {
      if (prev.includes(markNo)) {
        return prev.filter((m) => m !== markNo)
      } else {
        return [...prev, markNo]
      }
    })
  }

  // Handle save to erection
  const handleSaveToErection = async () => {
    if (selectedMarkNosForErection.length === 0) {
      toast.warning("Please select at least one Mark No.")
      return
    }

    try {
      setLoading(true)

      // Get all entries for selected mark numbers - only one entry per mark number
      const entriesToMove = []

      // For each selected mark number, find the first entry with that mark number
      for (const markNo of selectedMarkNosForErection) {
        const entry = tableData.find((item) => item.markNo === markNo)
        if (entry) {
          entriesToMove.push(entry)
        }
      }

      if (entriesToMove.length === 0) {
        toast.error("No entries found for selected Mark Numbers")
        return
      }

      // Create erection entries with proper data format
      const erectionEntries = entriesToMove.map((item) => ({
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
        tenantId: item.tenantId || "DEFAULT_TENANT",
        createdBy: "system",
        lastUpdatedBy: "system",
        status: "erection",
        // Copy attributes
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
      }))

      console.log("Moving to erection:", erectionEntries)

      // Call the new erection API with duplicate checking
      const response = await fetch(`${API_BASE_URL}/createBulkErectionDrawingEntriesWithDuplicateCheck/details`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(erectionEntries),
      })

      if (response.ok) {
        const result = await response.json()

        // Show detailed feedback
        if (result.skippedCount > 0) {
          toast.warning(
            `${result.createdCount} entries created, ${result.skippedCount} skipped as duplicates. Skipped: ${result.skippedDuplicates.join(", ")}`,
          )
        } else {
          toast.success(`${result.createdCount} Mark No(s) moved to Erection successfully!`)
        }

        setShowMoveToErectionPopup(false)
        setSelectedMarkNosForErection([])
      } else {
        const errorText = await response.text()
        console.error("Move to erection failed:", errorText)
        toast.error(`Failed to move to erection: ${errorText}`)
      }
    } catch (error) {
      console.error("Error moving to erection:", error)
      toast.error("Error moving to Erection: " + error.message)
    } finally {
      setLoading(false)
    }
  }

  // Handle input change in edit form
  const handleEditInputChange = (field, value) => {
    setEditFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  return (
    <div className="fab-container-mammoth">
      {/* Header */}
      <div className="fab-header-elephant">
        <div className="fab-title-tiger">
          <h3>Search for Fabrication Details</h3>
        </div>
        <div className="fab-header-buttons">
          <button 
            className="fab-button-giraffe fab-save-stages-btn" 
            onClick={handleSaveFabricationStages}
            disabled={saving || loading}
          >
            {saving ? (
              <>
                <AiOutlineLoading3Quarters className="fab-spin-icon-polar" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <MdSave />
                <span>Save</span>
              </>
            )}
          </button>
          <button className="fab-button-giraffe fab-move-to-erection-btn" onClick={handleMoveToErection}>
            <span>Completed</span>
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="fab-filter-section-zebra">
        <div className="fab-filter-container-hippo">
          <div className="fab-filter-row-rhino">
            {/* Drawing No Dropdown */}
            <select
              value={selectedDrawingNo}
              onChange={(e) => setSelectedDrawingNo(e.target.value)}
              className="fab-dropdown-cheetah"
            >
              <option value="">Select Drawing No</option>
              {drawingNumbers.map((drawingNo, index) => (
                <option key={`drawing_${index}`} value={drawingNo}>
                  {drawingNo}
                </option>
              ))}
            </select>

            {/* Mark No Dropdown */}
            <select
  value={selectedMarkNo}
  onChange={(e) => setSelectedMarkNo(e.target.value)}
  className="fab-dropdown-cheetah"
>
  <option value="">Select Mark No</option>
  {markNumbers?.map((markNo, index) => (
    <option key={`mark_${index}`} value={markNo}>
      {markNo}
    </option>
  ))}
</select>


            {/* Search Button */}
            <button className="fab-search-button-leopard" onClick={handleSearch} disabled={loading}>
              <span>Search</span>
            </button>
          </div>
        </div>
      </div>

      {/* Table Section */}
      <div className="fab-table-container-lynx">
        {loading && (
          <div className="fab-loading-overlay-panther">
            <div className="fab-loading-spinner-jaguar">
              <AiOutlineLoading3Quarters />
            </div>
            <div className="fab-loading-text-cougar">Loading...</div>
          </div>
        )}

        <div className="fab-table-wrapper-bear">
          <table className="fab-table-wolf">
            <thead>
              <tr>
                <th>Order #</th>
                <th>Work Order</th>
                <th>Plant Location</th>
                <th>Department</th>
                <th>Work Location</th>
                <th>Line Number</th>
                <th>Drawing No</th>
                <th>Mark No</th>
                <th>Mark Qty</th>
                <th>Item No</th>
                <th>Section Code</th>
                <th>Section Name</th>
                <th>Section Weight</th>
                <th>Width</th>
                <th>Length</th>
                <th>Item Qty</th>
                <th>Item Weight</th>
                <th>Status</th>
                {/* New Fabrication Process Columns */}
                <th className="fab-process-header">Cutting</th>
                <th className="fab-process-header">Fit Up</th>
                <th className="fab-process-header">Welding</th>
                <th className="fab-process-header">Finishing</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, index) => (
                <tr key={`row_${index}`} className="fab-table-row-fox">
                  <td>
                    <div className="fab-order-icon-rabbit">
                      <IoMdOpen />
                    </div>
                  </td>
                  <td>{row.attribute1V || "-"}</td>
                  <td>{row.attribute2V || "-"}</td>
                  <td>{row.attribute3V || "-"}</td>
                  <td>{row.attribute4V || "-"}</td>
                  <td>{row.attribute5V || "-"}</td>
                  <td>
                    {editingRow === row.lineId ? (
                      <input
                        type="text"
                        value={editFormData.drawingNo}
                        onChange={(e) => handleEditInputChange("drawingNo", e.target.value)}
                        className="fab-edit-input-deer"
                      />
                    ) : (
                      row.drawingNo || "-"
                    )}
                  </td>
                  <td>
                    {editingRow === row.lineId ? (
                      <input
                        type="text"
                        value={editFormData.markNo}
                        onChange={(e) => handleEditInputChange("markNo", e.target.value)}
                        className="fab-edit-input-deer"
                      />
                    ) : (
                      row.markNo || "-"
                    )}
                  </td>
                  <td>
                    {editingRow === row.lineId ? (
                      <input
                        type="number"
                        value={editFormData.markedQty}
                        onChange={(e) => handleEditInputChange("markedQty", e.target.value)}
                        className="fab-edit-input-deer"
                      />
                    ) : (
                      row.markedQty || "-"
                    )}
                  </td>
                  <td>{row.attribute1N || "-"}</td>
                  <td>
                    {editingRow === row.lineId ? (
                      <input
                        type="text"
                        value={editFormData.sessionCode}
                        onChange={(e) => handleEditInputChange("sessionCode", e.target.value)}
                        className="fab-edit-input-deer"
                      />
                    ) : (
                      row.sessionCode || "-"
                    )}
                  </td>
                  <td>
                    {editingRow === row.lineId ? (
                      <input
                        type="text"
                        value={editFormData.sessionName}
                        onChange={(e) => handleEditInputChange("sessionName", e.target.value)}
                        className="fab-edit-input-deer"
                      />
                    ) : (
                      row.sessionName || "-"
                    )}
                  </td>
                  <td>{row.sessionWeight || "-"}</td>
                  <td>
                    {editingRow === row.lineId ? (
                      <input
                        type="number"
                        value={editFormData.width}
                        onChange={(e) => handleEditInputChange("width", e.target.value)}
                        className="fab-edit-input-deer"
                      />
                    ) : (
                      row.width || "-"
                    )}
                  </td>
                  <td>
                    {editingRow === row.lineId ? (
                      <input
                        type="number"
                        value={editFormData.length}
                        onChange={(e) => handleEditInputChange("length", e.target.value)}
                        className="fab-edit-input-deer"
                      />
                    ) : (
                      row.length || "-"
                    )}
                  </td>
                  <td>
                    {editingRow === row.lineId ? (
                      <input
                        type="number"
                        value={editFormData.itemQty}
                        onChange={(e) => handleEditInputChange("itemQty", e.target.value)}
                        className="fab-edit-input-deer"
                      />
                    ) : (
                      row.itemQty || "-"
                    )}
                  </td>
                  <td>
                    {editingRow === row.lineId ? (
                      <input
                        type="number"
                        value={editFormData.itemWeight}
                        onChange={(e) => handleEditInputChange("itemWeight", e.target.value)}
                        className="fab-edit-input-deer"
                      />
                    ) : (
                      row.itemWeight || "-"
                    )}
                  </td>
                  <td>
                    <span className="fab-status-badge-moose">Fabrication</span>
                  </td>

                  {/* New Fabrication Process Columns */}
                  {FABRICATION_STAGES.map((stage) => (
                    <td key={`${row.lineId}_${stage}`} className="fab-process-cell">
                      <div className="fab-checkbox-container">
                        <input
                          type="checkbox"
                          id={`${row.lineId}_${stage}`}
                          checked={fabricationStages[row.lineId]?.[stage] || false}
                          onChange={(e) => handleStageChange(row.lineId, stage, e.target.checked)}
                          className="fab-process-checkbox"
                          aria-label={`${STAGE_LABELS[stage]} for ${row.markNo || "item"}`}
                        />
                        <label
                          htmlFor={`${row.lineId}_${stage}`}
                          className="fab-checkbox-label"
                          title={`Mark ${STAGE_LABELS[stage]} as ${fabricationStages[row.lineId]?.[stage] ? "incomplete" : "complete"}`}
                        />
                      </div>
                    </td>
                  ))}

                  <td>
                    <div className="fab-actions-container-yak">
                      {editingRow === row.lineId ? (
                        <>
                          <button
                            onClick={handleSaveEdit}
                            className="fab-action-button-elk fab-save-button-impala"
                            title="Save"
                          >
                            <MdSave />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="fab-action-button-elk fab-cancel-button-bison"
                            title="Cancel"
                          >
                            ✕
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleEdit(row)}
                            className="fab-action-button-elk fab-edit-button-impala"
                            title="Modify"
                          >
                            <MdEdit />
                          </button>
                          <button
                            onClick={() => handleDelete(row.lineId)}
                            className="fab-action-button-elk fab-delete-button-bison"
                            title="Delete"
                          >
                            <MdDelete />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filteredData.length === 0 && !loading && (
                <tr className="fab-empty-row-camel">
                  <td colSpan="23">
                    <div className="fab-empty-state-llama">
                      <div className="fab-empty-text-alpaca">No records found.</div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Move to Erection Popup */}
      {showMoveToErectionPopup && (
        <div className="fab-popup-overlay-shark">
          <div className="fab-popup-container-whale">
            <div className="fab-popup-header-dolphin">
              <h3>Mark No.</h3>
              <button onClick={() => setShowMoveToErectionPopup(false)} className="fab-popup-close-octopus">
                ✕
              </button>
            </div>
            <div className="fab-popup-content-squid">
              <div className="fab-multiselect-container-jellyfish">
                <div className="fab-multiselect-label-starfish">Select Mark No(s):</div>
                <div className="fab-multiselect-options-seahorse">
                  {availableMarkNosForErection.map((markNo, index) => (
                    <label key={`popup_mark_${index}`} className="fab-checkbox-label-crab">
                      <input
                        type="checkbox"
                        checked={selectedMarkNosForErection.includes(markNo)}
                        onChange={() => handleMarkNoSelection(markNo)}
                        className="fab-checkbox-input-lobster"
                      />
                      <span className="fab-checkbox-text-shrimp">{markNo}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="fab-popup-actions-turtle">
              <button
                onClick={() => setShowMoveToErectionPopup(false)}
                className="fab-popup-button-seal fab-cancel-button-walrus"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveToErection}
                className="fab-popup-button-seal fab-save-button-penguin"
                disabled={loading || selectedMarkNosForErection.length === 0}
              >
                {loading ? (
                  <>
                    <AiOutlineLoading3Quarters className="fab-spin-icon-polar" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <MdSave />
                    <span>Save</span>
                  </>
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

export default FabricationDatabasesearch;