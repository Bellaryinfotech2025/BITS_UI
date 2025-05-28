"use client"

import { useState } from "react"
import { X } from "lucide-react"
import "../Mech Lines Design/selectpopuphere.css"

const SelectParentPopup = ({ parentLines, onSelect, onCancel }) => {
  const [selectedParent, setSelectedParent] = useState(null)

  const handleSelect = () => {
    if (selectedParent) {
      onSelect(selectedParent)
    }
  }

  return (
    <div className="popup-overlay">
      <div className="popup-container">
        <div className="popup-header">
          <h2>Select Parent Line</h2>
          <button className="close-button" onClick={onCancel}>
            <X size={18} />
          </button>
        </div>
        <div className="popup-content">
          {parentLines.length === 0 ? (
            <div className="no-parents-message">No parent lines available</div>
          ) : (
            <>
              <div className="parent-list">
                <table className="parent-table">
                  <thead>
                    <tr>
                      <th>Select</th>
                      <th>Line Number</th>
                      <th>Service Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parentLines.map((line) => (
                      <tr
                        key={line.lineId}
                        className={selectedParent?.lineId === line.lineId ? "selected-row" : ""}
                        onClick={() => setSelectedParent(line)}
                      >
                        <td>
                          <input
                            type="radio"
                            name="parentLine"
                            checked={selectedParent?.lineId === line.lineId}
                            onChange={() => setSelectedParent(line)}
                          />
                        </td>
                        <td>{line.lineNumber}</td>
                        <td>{line.serviceName || "No description"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="popup-actions">
                <button
                  className="select-button"
                  onClick={handleSelect}
                  disabled={!selectedParent}
                  style={{
                    opacity: selectedParent ? 1 : 0.5,
                    cursor: selectedParent ? "pointer" : "not-allowed",
                  }}
                >
                  Select
                </button>
                <button className="cancel-button" onClick={onCancel}>
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default SelectParentPopup
