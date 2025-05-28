"use client"
import { useState } from "react"
import axios from "axios"
import { IoMdOpen } from "react-icons/io"
import { FiSearch } from "react-icons/fi"
import { MdAdd } from "react-icons/md"
import { ToastContainer, toast } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import POEntry from "../POEntry Component/PoEntry"
import UpdatePoentryTable from "../POEntry Component/UpdatePoentryTable"
import "../POEntry Component/PoentrydatabseseTable.css"

const API_BASE_URL = "http://195.35.45.56:5522/api/V2.0"

const PoentrydatabseseTable = () => {
  const [workOrders, setWorkOrders] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(false)
  const [showAddOrder, setShowAddOrder] = useState(false)
  const [showUpdateOrder, setShowUpdateOrder] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [hasSearched, setHasSearched] = useState(false)
  const [searchHighlight, setSearchHighlight] = useState("")

  const loadWorkOrders = async () => {
    try {
      setLoading(true)
      // Add 1 second delay for loading spinner
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const response = await axios.get(`${API_BASE_URL}/getAllBitsHeaders/details`)
      // Sort by creation date/id descending (latest first)
      const sortedOrders = response.data.sort((a, b) => {
        if (a.orderId && b.orderId) return b.orderId - a.orderId
        return new Date(b.workOrderDate || 0) - new Date(a.workOrderDate || 0)
      })
      setWorkOrders(sortedOrders)
    } catch (error) {
      console.error("Error loading work orders:", error)
      toast.error("Failed to load work orders")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      setLoading(true)
      setHasSearched(true)
      // Add 1 second delay for loading spinner
      await new Promise((resolve) => setTimeout(resolve, 1000))
      await loadWorkOrders()
      return
    }

    try {
      setLoading(true)
      setHasSearched(true)

      // Add 1 second delay for loading spinner
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Show search highlight
      setSearchHighlight(searchTerm)
      setTimeout(() => setSearchHighlight(""), 3000)

      // Try multiple search endpoints
      const searchPromises = [
        axios.get(`${API_BASE_URL}/searchBitsHeadersByWorkOrder/details?workOrder=${encodeURIComponent(searchTerm)}`),
        axios.get(
          `${API_BASE_URL}/searchBitsHeadersByPlantLocation/details?plantLocation=${encodeURIComponent(searchTerm)}`,
        ),
        axios.get(`${API_BASE_URL}/searchBitsHeadersByDepartment/details?department=${encodeURIComponent(searchTerm)}`),
        axios.get(
          `${API_BASE_URL}/searchBitsHeadersByWorkLocation/details?workLocation=${encodeURIComponent(searchTerm)}`,
        ),
      ]

      const results = await Promise.allSettled(searchPromises)
      let allResults = []

      results.forEach((result) => {
        if (result.status === "fulfilled" && result.value.data) {
          allResults = [...allResults, ...result.value.data]
        }
      })

      // Remove duplicates based on orderId
      const uniqueResults = allResults.filter(
        (order, index, self) => index === self.findIndex((o) => o.orderId === order.orderId),
      )

      // Sort latest first
      const sortedResults = uniqueResults.sort((a, b) => {
        if (a.orderId && b.orderId) return b.orderId - a.orderId
        return new Date(b.workOrderDate || 0) - new Date(a.workOrderDate || 0)
      })

      setWorkOrders(sortedResults)
    } catch (error) {
      console.error("Error searching work orders:", error)
      toast.error("Search failed")
    } finally {
      setLoading(false)
    }
  }

  const handleAddOrderClick = () => {
    setShowAddOrder(true)
  }

  const handleCloseAddOrder = () => {
    setShowAddOrder(false)
    // Refresh the table data when closing the form
    if (hasSearched) {
      loadWorkOrders()
    }
  }

  const handleWorkOrderClick = (order) => {
    setSelectedOrder(order)
    setShowUpdateOrder(true)
  }

  const handleCloseUpdateOrder = () => {
    setShowUpdateOrder(false)
    setSelectedOrder(null)
    // Refresh the table data when closing the update form
    if (hasSearched) {
      loadWorkOrders()
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "-"
    const date = new Date(dateString)
    const day = date.getDate()
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const month = monthNames[date.getMonth()]
    const year = date.getFullYear()
    return `${day}-${month}-${year}`
  }

  if (showAddOrder) {
    return <POEntry onClose={handleCloseAddOrder} />
  }

  if (showUpdateOrder && selectedOrder) {
    return <UpdatePoentryTable order={selectedOrder} onClose={handleCloseUpdateOrder} />
  }

  return (
    <div className="KiPoentrydatabseseTableJi">
      {/* Header Section */}
      <div className="KiHeaderSectionJi">
        <h2 className="KiPageTitleJi">Work Order Search</h2>
        <div className="KiHeaderButtonsJi">
          <button className="KiAddOrderButtonJi" onClick={handleAddOrderClick}>
            <MdAdd className="KiButtonIconJi" />
            Add Order
          </button>
        </div>
      </div>

      {/* Search Section */}
      <div className="KiSearchSectionJi">
        <div className="KiSearchContainerJi">
          <input
            type="text"
            placeholder="Search Your Work Order Here..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="KiSearchInputJi"
            onKeyPress={(e) => e.key === "Enter" && handleSearch()}
          />
          <button onClick={handleSearch} className="KiSearchButtonJi">
            <FiSearch className="KiSearchIconJi" />
          </button>
        </div>
      </div>

      {/* Search Highlight */}
      {searchHighlight && <div className="KiSearchHighlightJi">Search results for: "{searchHighlight}"</div>}

      {/* Table Section */}
      <div className="KiTableContainerJi">
        <table className="KiWorkOrderTableJi">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Work Order</th>
              <th>Plant Location</th>
              <th>Department</th>
              <th>Work Location</th>
              <th>Work Order Date</th>
              <th>Completion Date</th>
              <th>LD Applicable</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="KiLoadingCellJi">
                  <div className="KiLoadingContentJi">
                    <div className="KiLoadingSpinnerJi">⟳</div>
                    <span>Loading...</span>
                  </div>
                </td>
              </tr>
            ) : hasSearched && workOrders.length > 0 ? (
              workOrders.map((order, index) => (
                <tr key={order.orderId || index} className="KiTableRowJi">
                  <td>
                    <div className="KiOrderIconJi">
                      <IoMdOpen />
                    </div>
                  </td>
                  <td>
                    <button className="KiWorkOrderLinkJi" onClick={() => handleWorkOrderClick(order)}>
                      {order.workOrder}
                    </button>
                  </td>
                  <td>{order.plantLocation || "-"}</td>
                  <td>{order.department || "-"}</td>
                  <td>{order.workLocation || "-"}</td>
                  <td>{formatDate(order.workOrderDate)}</td>
                  <td>{formatDate(order.completionDate)}</td>
                  <td>
                    <span className="KiLdApplicableJi">{order.ldApplicable ? "Yes" : "No"}</span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="KiNoDataCellJi">
                  <div className="KiNoDataContentJi">
                    <div className="KiNoDataMessageJi">
                      {hasSearched
                        ? "No Work Order Details Found"
                        : "No Work Order Details Found - Click on search button to show your work orders"}
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <ToastContainer />
    </div>
  )
}

export default PoentrydatabseseTable;
