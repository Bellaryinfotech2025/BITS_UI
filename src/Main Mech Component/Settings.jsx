"use client"
import "../Design Component/Settings.css"

const SettingsPopup = ({ isOpen, onClose, onCoreLookupClick }) => {
  if (!isOpen) return null

  return (
    <div className="settings-overlay" onClick={onClose}>
      <div className="settings-popup" onClick={(e) => e.stopPropagation()}>
        <div className="settings-header">
          <h2>Settings</h2>
          <button className="close-settings" onClick={onClose}>
            ×
          </button>
        </div>

        <div className="settings-content">
          <div className="settings-columns">
            {/* Manage Users Column */}
            <div className="settings-column">
              <h3>Manage Users</h3>
              <ul>
                <li>
                  <a href="#">Users</a>
                </li>
                <li>
                  <a href="#">Profile</a>
                </li>
                <li>
                  <a href="#">User Role</a>
                </li>
                <li>
                  <a href="#">Assign Roles</a>
                </li>
              </ul>

              <h3 className="section-highlight">Master Data</h3>
              <ul>
                <li className="highlight">
                  <a href="#">Customers</a>
                </li>
                <li className="highlight">
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      onCoreLookupClick()
                    }}
                  >
                    Core Lookup Values
                  </a>
                </li>
                <li className="highlight">
                  <a href="#">Product Catalogs</a>
                </li>
                <li className="highlight">
                  <a href="#">Vendors</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SettingsPopup;
