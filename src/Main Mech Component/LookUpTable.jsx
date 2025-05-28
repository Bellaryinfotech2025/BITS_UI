import { useEffect, useState } from "react";
import axios from "axios";
import {
  Search,
  Plus,
  RefreshCw,
  FileSpreadsheet,
  FileText,
  Edit,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
  Check,
} from "lucide-react";
import "../Design Component/LookupTable.css";
import { IoSearchCircle } from "react-icons/io5";

const LookupTable = () => {
  const [search, setSearch] = useState("")
  const [lookupValues, setLookupValues] = useState([])
  const [page, setPage] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [showAddPopup, setShowAddPopup] = useState(false)
  const [newLookup, setNewLookup] = useState({
    lookupType: "",
    lookupName: "",
    purpose: "",
    editable: false,
  })

  const fetchData = () => {
    axios
  
      .get("http://195.35.45.56:5522/api/lookup-values", {
 
 
        params: {
          search: search,
          page: page,
          size: 100,
        },
      })
      .then((res) => {
        setLookupValues(res.data.content)
        setTotalPages(res.data.totalPages)
      })
      .catch((error) => {
        console.error("Error fetching data:", error)
      })
  }

  useEffect(() => {
    fetchData()
  }, [page])

  const handleSearch = () => {
    setPage(0)
    fetchData()
  }

  const handleRefreshCache = () => {
    fetchData()
  }

  const handleAddNew = () => {
    setShowAddPopup(true)
  }

  const handleClosePopup = () => {
    setShowAddPopup(false)
    setNewLookup({
      lookupType: "",
      lookupName: "",
      purpose: "",
      editable: false,
    })
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setNewLookup({
      ...newLookup,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleSubmit = () => {
    console.log("Submitting new lookup:", newLookup)
    // Add your API call to save the new lookup
    // After successful save:
    handleClosePopup()
    fetchData()
  }

  const handleExcelExport = () => {
    console.log("Excel export clicked")
    // Add your logic for Excel export
  }

  const handleCSVExport = () => {
    console.log("CSV export clicked")
    // Add your logic for CSV export
  }

  return (
    <div className="lookup-container">
      <div className="lookup-header">
        <div className="action-buttons">
          <button className="action-btn add-btn" onClick={handleAddNew}>
            <Plus size={16} />
            <span>Add</span>
          </button>
          <button className=" refresh-btn" onClick={handleRefreshCache}>
            <IoSearchCircle size={16} />
            <span>Search</span>
          </button>
          {/* <button className="action-btn excel-btn" onClick={handleExcelExport}>
            <FileSpreadsheet size={16} />
            <span>Excel</span>
          </button>
          <button className="action-btn csv-btn" onClick={handleCSVExport}>
            <FileText size={16} />
            <span>CSV</span>
          </button> */}
        </div>
      </div>

      <div className="lookup-search-section">
        <h2 className="lookup-title">Search Lookup Type</h2>
        <div className="search-box">
          <input
            type="text"
            placeholder="Lookup Type"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
           
        </div>
      </div>

      <div className="table-wrapper">
        <table className="lookup-table">
          <thead>
            <tr>
              <th className="actions-col">Actions</th>
              <th className="lookup-type-col">
                <div className="sortable-header">
                  <span>Lookup Type</span>
                  <ChevronUp size={14} />
                </div>
              </th>
              <th>Lookup Code</th>
              <th>Meaning</th>
              <th>Description</th>
              <th className="editable-col">Editable</th>
              <th>Purpose</th>
            </tr>
          </thead>
          <tbody>
            {lookupValues.length === 0 ? (
              <tr>
                <td colSpan="7" className="no-data">
                  No data found.
                </td>
              </tr>
            ) : (
              lookupValues.map((val, index) => (
                <tr key={index}>
                  <td className="actions-col">
                    <button className="edit-btn">
                      <Edit size={14} />
                    </button>
                  </td>
                  <td className="lookup-type-col">
                    <a href="#" className="lookup-link">
                      {val.lookupType}
                    </a>
                  </td>
                  <td>{val.lookupCode}</td>
                  <td>{val.meaning}</td>
                  <td>{val.description}</td>
                  <td className="editable-col">
                    {val.editableFlag === "Y" ? (
                      <div className="blue-checkmark">✓</div>
                    ) : (
                      <span className="cross-mark">✕</span>
                    )}
                  </td>
                  <td>{val.lookupTypePurpose}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="pagination-container">
        <div className="records-info">
          Showing 1 to {Math.min(10, lookupValues.length)} of {lookupValues.length * totalPages} records
        </div>
        <div className="pagination-controls">
          <button className="page-btn first" onClick={() => setPage(0)} disabled={page === 0}>
            <ChevronsLeft size={14} />
          </button>
          <button className="page-btn prev" onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}>
            <ChevronLeft size={14} />
          </button>

          {[...Array(totalPages)].map((_, i) => (
            <button key={i} className={`page-btn number ${i === page ? "active" : ""}`} onClick={() => setPage(i)}>
              {i + 1}
            </button>
          ))}

          <button
            className="page-btn next"
            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            disabled={page === totalPages - 1}
          >
            <ChevronRight size={14} />
          </button>
          <button className="page-btn last" onClick={() => setPage(totalPages - 1)} disabled={page === totalPages - 1}>
            <ChevronsRight size={14} />
          </button>
        </div>
      </div>

      {/* Add Lookup Popup */}
      {showAddPopup && (
        <div className="popup-overlay">
          <div className="popup-container">
            <div className="popup-header">
              <h2>New Lookup Type</h2>
              <button className="close-btn" onClick={handleClosePopup}>
                <X size={18} />
              </button>
            </div>
            <div className="popup-divider"></div>
            <div className="popup-content">
              <div className="popup-section-title">Lookup Type</div>
              <div className="popup-section-underline"></div>

              <div className="popup-form">
                <div className="form-row">
                  <label>Lookup Type</label>
                  <div className="input-container">
                    <input
                      type="text"
                      name="lookupType"
                      placeholder="Lookup Type"
                      value={newLookup.lookupType}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <label>Lookup Name</label>
                  <div className="input-container">
                    <input
                      type="text"
                      name="lookupName"
                      placeholder="Lookup Name"
                      value={newLookup.lookupName}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <label>Purpose</label>
                  <div className="input-container">
                    <input
                      type="text"
                      name="purpose"
                      placeholder="Purpose"
                      value={newLookup.purpose}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>

                <div className="form-row">
                  <label>Editable</label>
                  <div className="checkbox-container">
                    <input
                      type="checkbox"
                      id="editable"
                      name="editable"
                      checked={newLookup.editable}
                      onChange={handleInputChange}
                    />
                    <label htmlFor="editable" className="checkbox-label"></label>
                  </div>
                </div>
              </div>
            </div>
            <div className="popup-footer">
              <button className="next-btn" onClick={handleSubmit}>
                <Check size={16} />
                <span>Next</span>
              </button>
              <button className="cancel-btn" onClick={handleClosePopup}>
                <X size={16} />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LookupTable;
