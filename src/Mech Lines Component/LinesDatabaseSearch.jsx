"use client"

import { useState, useEffect } from "react"
import { CheckCircle, Download } from 'lucide-react'
import { IoIosAddCircle } from "react-icons/io"
import "../Mech Lines Design/linesdatabasedesign.css"
import axios from "axios"
import SelectParentPopup from "../Mech Lines Component/selectpopup"
import { IoOpen } from "react-icons/io5"
import { FaPlay } from "react-icons/fa"
import EditLinesAddParent from "../Mech Lines Component/EditLinesAddParent" // Import the EditLinesAddParent component

const LinesDatabaseSearch = ({
  onAddParentClick,
  onAddChildClick,
  onLineClick,
  selectedOrder,
  refreshData = false,
  onDataRefreshed = () => {},
}) => {
  // State for orders
  const [orderLines, setOrderLines] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [dataFetched, setDataFetched] = useState(false)
  const [showSelectParentPopup, setShowSelectParentPopup] = useState(false)
  const [selectedParentLine, setSelectedParentLine] = useState(null)
  
  // New state for edit functionality
  const [showEditParent, setShowEditParent] = useState(false)
  const [selectedLineForEdit, setSelectedLineForEdit] = useState(null)

  // API base URL
  const API_URL = "http://195.35.45.56:5522/api"

  // Fetch order lines from the backend based on selected order
  const fetchOrderLines = async () => {
    if (!selectedOrder || !selectedOrder.orderId) {
      setOrderLines([])
      setLoading(false)
      setDataFetched(false)
      return
    }

    try {
      setLoading(true)
      console.log("Fetching lines for order:", selectedOrder.orderId)
      const response = await axios.get(`${API_URL}/lines/fetchLinesByOrder/${selectedOrder.orderId}`)

      if (response.data && response.data.status === "success") {
        console.log("Lines fetched successfully:", response.data)
        // Get all lines data
        const linesData = response.data.lines || []
        console.log("All lines data:", linesData)

        // Filter to only show parent lines
        const parentLines = linesData.filter((line) => line.isParent === true)
        console.log("Filtered parent lines:", parentLines)

        setOrderLines(parentLines)
        setDataFetched(true)
        setError(null) // Clear any previous errors
      } else {
        console.error("Error in response:", response.data)
        throw new Error(response.data.message || "Failed to fetch lines")
      }
    } catch (err) {
      console.error("Error fetching order lines:", err)
      setError(`Failed to load order lines: ${err.message || "Unknown error"}`)
      setOrderLines([])
    } finally {
      setLoading(false)
    }
  }

  // Fetch lines whenever the selected order changes
  useEffect(() => {
    fetchOrderLines()
  }, [selectedOrder])

  // Add a useEffect to handle the refreshData prop
  useEffect(() => {
    if (refreshData && selectedOrder) {
      console.log("Refresh flag detected, fetching lines data...")
      fetchOrderLines()
      onDataRefreshed() // Reset the refresh flag
    }
  }, [refreshData, selectedOrder])

  // Add a useEffect to refetch data when the component becomes visible
  useEffect(() => {
    // This will ensure data is refreshed when the component is shown
    if (selectedOrder) {
      console.log("Component visible, refreshing lines data for order:", selectedOrder.orderId)
      fetchOrderLines()
    }
  }, [selectedOrder])

  // Check if there are any parent lines
  const hasParentLines = orderLines.length > 0

  // Handle Add Parent button click
  const handleAddParent = () => {
    console.log("Add Parent clicked")
    if (onAddParentClick) {
      onAddParentClick()
    }
  }

  // Handle Add Child button click
  const handleAddChild = () => {
    console.log("Add Child clicked")
    if (hasParentLines) {
      // Always show the select parent popup first
      setShowSelectParentPopup(true)
    } else {
      console.log("Cannot add child: No parent lines available")
    }
  }

  // Handle parent selection from popup
  const handleParentSelected = (parentLine) => {
    console.log("Parent selected:", parentLine)
    setSelectedParentLine(parentLine)
    setShowSelectParentPopup(false)

    if (onAddChildClick) {
      onAddChildClick(parentLine)
    }
  }

  // Handle popup close
  const handleClosePopup = () => {
    setShowSelectParentPopup(false)
  }

  // Handle line number click to view child lines
  const handleLineNumberClick = (line) => {
    console.log("Line number clicked:", line)
    if (onLineClick) {
      onLineClick(line)
    }
  }

  // Handle service description click to edit parent line
  const handleServiceDescriptionClick = (line) => {
    console.log("Service description clicked for editing:", line)
    
    // Set the selected line for editing
    setSelectedLineForEdit(line)
    
    // Show the edit component
    setShowEditParent(true)
  }
  
  // Handle cancel from edit component
  const handleEditCancel = () => {
    setShowEditParent(false)
    setSelectedLineForEdit(null)
    
    // Refresh the data after editing
    fetchOrderLines()
  }

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "-"
    const date = new Date(dateString)
    return date.toLocaleDateString()
  }

  // If edit component is shown, render it instead of the search table
  if (showEditParent && selectedLineForEdit) {
    return (
      <EditLinesAddParent
        selectedOrder={selectedOrder}
        lineData={selectedLineForEdit}
        onCancel={handleEditCancel}
      />
    )
  }

  return (
    <div className="order-search-containerlineskh">
      <header className="order-search-headerlineskh">
        <h1 className="header-titlelineskh">Lines Search</h1>
        <div className="header-actionslineskh">
          <button
            className="add-parent-btnlineskh"
            onClick={handleAddParent}
            disabled={!selectedOrder}
            style={{ opacity: selectedOrder ? 1 : 0.5, cursor: selectedOrder ? "pointer" : "not-allowed" }}
          >
            <IoIosAddCircle size={16} />
            Add Parent
          </button>
          <button
            className="add-child-btnlineskh"
            onClick={handleAddChild}
            disabled={!hasParentLines}
            style={{ opacity: hasParentLines ? 1 : 0.5, cursor: hasParentLines ? "pointer" : "not-allowed" }}
          >
            <IoIosAddCircle size={16} />
            Add Child
          </button>
        </div>
      </header>

      <div className="order-number-sectionlineskh">
        <div className="order-number-displaylineskh">
          <span>Order Number: {selectedOrder ? selectedOrder.orderNumber : "No order selected"}</span>
        </div>
        <div className="table-actionslineskh">
          <button className="table-action-btnlineskh" title="Download">
            <Download size={14} />
          </button>
        </div>
      </div>

      <div className="table-wrapperlineskh">
        <div className="table-containerlineskh">
          <table className="orders-tablelineskh">
            <thead>
              <tr>
                <th>Actions</th>
                <th>
                  LineNumber
                  <FaPlay />{" "}
                </th>
                <th>Service Description</th>
                <th>UOM</th>
                <th>Quantity</th>
                <th>Total</th>
                <th>Completion</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="loading-celllineskh">
                    Loading data...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="error-celllineskh">
                    {error}
                  </td>
                </tr>
              ) : !selectedOrder ? (
                <tr className="no-records-rowlineskh">
                  <td colSpan={7}>
                    <div className="no-records-toastlineskh">
                      <CheckCircle size={16} />
                      <span>Please select an order to view lines.</span>
                    </div>
                  </td>
                </tr>
              ) : !dataFetched || orderLines.length === 0 ? (
                <tr className="no-records-rowlineskh">
                  <td colSpan={7}>
                    <div className="no-records-toastlineskh">
                      <CheckCircle size={16} />
                      <span>No parent lines created for this order. Create parent lines data now.</span>
                    </div>
                  </td>
                </tr>
              ) : (
                orderLines.map((line, index) => (
                  <tr key={line.lineId} className={index % 2 === 0 ? "table-row-evenlineskh" : ""}>
                    <td>
                      <div className="action-buttonslineskh">
                        <button className="action-btnlineskh" onClick={() => handleLineNumberClick(line)}>
                          <IoOpen size={15} className="edit-iconlineskh" />
                        </button>
                      </div>
                    </td>
                    <td>
                      <a
                        href="#"
                        className="line-number-linklineskh"
                        onClick={(e) => {
                          e.preventDefault()
                          handleLineNumberClick(line)
                        }}
                      >
                        {line.lineNumber}
                      </a>
                    </td>
                    <td className="service-description-celllineskh">
                      <button
                        onClick={() => handleServiceDescriptionClick(line)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#2193b0",
                          textDecoration: "underline",
                          cursor: "pointer",
                          padding: 0,
                          font: "inherit",
                          textAlign: "left",
                        }}
                      >
                        {line.serviceName || "No description available"}
                      </button>
                    </td>
                    <td>{line.uom || "-"}</td>
                    <td>{line.orderedQuantity || "-"}</td>
                    <td>&#8377;{line.totalPrice ? Number.parseFloat(line.totalPrice).toFixed(2) : "-"}</td>
                    <td>{formatDate(line.effectiveEndDate)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Parent Selection Popup - Make sure it's always rendered when showSelectParentPopup is true */}
      {showSelectParentPopup && (
        <SelectParentPopup parentLines={orderLines} onSelect={handleParentSelected} onCancel={handleClosePopup} />
      )}
    </div>
  )
}

export default LinesDatabaseSearch;