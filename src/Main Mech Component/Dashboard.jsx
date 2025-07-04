import { useState, useRef, useEffect } from "react";
import {
  LayoutDashboard,
  CreditCard,
  TrendingUp,
  Sliders,
  FileText,
  FileQuestion,
  Bell,
  Settings,
  LogOut,
  User,
  Menu,
  X,
  AlertTriangle,
  UserCircle,
  Edit,
  Package,
  Upload,
  Clipboard,
  PenTool,
  BarChart,
} from "lucide-react"
import { Link } from "react-router-dom"
import { MdAccountCircle } from "react-icons/md";
import { GiCardDraw } from "react-icons/gi";

import "../Design Component/Dashboard.css"
import DrawingEntry from "../Drawing Entry Component/DrawingEntry"
import PoentrydatabseseTable from "../POEntry Component/POentryDatabaseTable"


import SettingsPopup from "../Main Mech Component/Settings"
import LookupTable from "../Main Mech Component/LookUpTable"
 
import FabricationDatabasesearch from "../FabricationNewComponent/FabricationDatabasesearch"
import ErectionDatabasesearch from "../ErectionNewComponent/ErectionDatabasesearch"
 
 
import AlignmentDatabasesearch from "../AlignmentNewComponent/AlignmentDatabasesearch"
import PaintingDatabasesearch from "../PaintingComponent/Painting";

 
// import BillingDatabasesearch from "../BillingNewComponent/BillingDatabasesearch"

import ReportTemplate from "../ReportsNewComponent/Reports";
import Invoice from "../InvoiceComponent/Invoice";
import RawMaterialEntry from "../RawMeterialEntry Component/RawMaterialEntry";


import LedgerCreation from "../VendorComponent/LedgerCreation"

import logo from "../assets/blogo.jpg"
import "../Design Component/logout-popup.css"
import "../Design Component/user-dropdown.css"
import "../Design Component/order-database-search.css"
import "../Design Component/dashboard-fix.css"

const MainDashboard = () => {
  // loading state aata idhar
  const [isLoading, setIsLoading] = useState(true)

  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [activeMenu, setActiveMenu] = useState("home")
  const [activeSubmenu, setActiveSubmenu] = useState("")
  const [showLogoutPopup, setShowLogoutPopup] = useState(false)
  const [logoImage, setLogoImage] = useState(logo)
  const [showUserDropdown, setShowUserDropdown] = useState(false)
  const [showCoreLookup, setShowCoreLookup] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showOrderDetails, setShowOrderDetails] = useState(false)
  const fileInputRef = useRef(null)
  const userDropdownRef = useRef(null)
  const [showLinesAddParent, setShowLinesAddParent] = useState(false)
  const [showLinesAddChild, setShowLinesAddChild] = useState(false)
  const [selectedParentLine, setSelectedParentLine] = useState(null)
  const [username, setUsername] = useState("")
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showContent, setShowContent] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showSecondSidebar, setShowSecondSidebar] = useState(false)
  const [showOrderNumberDetails, setShowOrderNumberDetails] = useState(false)

  // Add state for showing child lines
  const [showChildLines, setShowChildLines] = useState(false)

  // Add refreshLinesData state to track when lines data should be refreshed
  const [refreshLinesData, setRefreshLinesData] = useState(false)

  // Add refreshChildLinesData state to track when child lines data should be refreshed
  const [refreshChildLinesData, setRefreshChildLinesData] = useState(false)

  // Initial loading effect - show loading spinner for 1 second when page loads
  useEffect(() => {
    setIsLoading(true)
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500)

    return () => clearTimeout(timer)
  }, [])

  // Make handleAddChildClick available globally for direct access from child components
  useEffect(() => {
    // Expose the function to the window object for access from other components
    window.handleAddChildClick = handleAddChildClick

    // Cleanup function to remove the global reference when component unmounts
    return () => {
      delete window.handleAddChildClick
    }
  }, [])

  // Submenu definitions for each main menu
  const submenus = {
    home: [],
    poentry: [], // No submenus for PO Entry
    drawingentry: [], // No submenus for Drawing Entry
    // orders: ["Orders", "Lines", "Fabrication", "Erection", "Alignment", "Billing"],
    rawmaterialentry:[], //for raw material entry
    fabrication: [], //   for Fabrication
    erection: [], //   for Fabrication
    alignment: [], //   for Fabrication
    painting :[],//for the painting page 
    // billing: [], //   for Fabrication
    reports: [], //   for Fabrication
    invoices: [], //   for Fabrication
    
    LedgerCreation: [], // No submenus for Fabrication
  }

  // Add this useEffect to get the username when the component mounts
  useEffect(() => {
    // Try to get username from localStorage or sessionStorage
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser)
        setUsername(userData.username || "")
      } catch (error) {
        console.error("Error parsing user data:", error)
      }
    }
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Prevent default on link clicks to avoid page refresh
  const handleLinkClick = (e, menu) => {
    e.preventDefault()

    // Show loading spinner for 1 second when menu is clicked
    setIsLoading(true)

    // Use setTimeout to delay the menu change by 1 second
    setTimeout(() => {
      if (menu === "logout") {
        setShowLogoutPopup(true)
      } else {
        // Handle all menus the same way - no secondary sidebar
        setActiveMenu(menu)
        setSidebarCollapsed(false)
        setActiveSubmenu("")
        setShowContent(true)
        setShowCoreLookup(false)
        setShowOrderDetails(false)
        setShowLinesAddParent(false)
        setShowLinesAddChild(false)
        setSelectedOrder(null)
        setShowSecondSidebar(false) // Always hide secondary sidebar
        setShowOrderNumberDetails(false)
        setShowChildLines(false)
      }

      // Hide loading spinner after menu change
      setIsLoading(false)
    }, 500)
  }

  const handleSubmenuClick = (e, submenu) => {
    e.preventDefault()

    // Show loading spinner for 1 second when submenu is clicked
    setIsLoading(true)

    // Use setTimeout to delay the submenu change by 1 second
    setTimeout(() => {
      setActiveSubmenu(submenu)
      setShowContent(true)

      // Reset all content states
      setShowOrderDetails(false)
      setShowLinesAddParent(false)
      setShowLinesAddChild(false)
      setShowCoreLookup(false)
      setShowOrderNumberDetails(false)
      setShowChildLines(false)

      // Hide loading spinner after submenu change
      setIsLoading(false)
    }, 500)
  }

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const toggleSettings = () => {
    setSettingsOpen(!settingsOpen)
  }

  const toggleUserDropdown = () => {
    setShowUserDropdown(!showUserDropdown)
  }

  const handleStay = () => {
    setShowLogoutPopup(false)
  }

  const handleLogout = () => {
    // Redirect to landing page
    window.location.href = "/" // Change this to your landing page URL
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      // Create a URL for the selected image
      const imageUrl = URL.createObjectURL(file)
      setLogoImage(imageUrl)
    }
  }

  const handleProfileAction = (action) => {
    if (action === "logout") {
      setShowLogoutPopup(true)
    } else if (action === "edit-profile") {
      console.log("Edit profile clicked")
      // Add your edit profile logic here
    } else if (action === "my-profile") {
      console.log("My profile clicked")
      // Add your my profile logic here
    }
    setShowUserDropdown(false)
  }

  const handleCoreLookupClick = () => {
    setShowCoreLookup(true)
    setSettingsOpen(false) // Close settings popup
  }

  const handleSearch = (query) => {
    setSearchQuery(query)
    console.log("Searching for:", query)
    // You can implement search functionality here
  }

  // Handler for Add Order button click
  const handleAddOrderClick = () => {
    console.log("Add Order clicked")
    setShowOrderDetails(true)
  }

  // Handler to go back to order search
  const handleBackToOrderSearch = () => {
    setShowOrderDetails(false)
  }

  const handleAddParentClick = () => {
    setShowLinesAddParent(true)
  }

  // Updated handler for LinesAddParent cancel with refresh functionality
  const handleLinesAddParentCancel = () => {
    setShowLinesAddParent(false)
    console.log("Setting refreshLinesData to true after adding parent")
    setRefreshLinesData(true) // Set flag to refresh lines data
  }

  // Updated handler for showing LinesAddChild with parent line info
  const handleAddChildClick = (parentLine) => {
    console.log("Parent line selected for child:", parentLine)
    setSelectedParentLine(parentLine)
    setShowLinesAddChild(true)
  }

  // Updated handler for canceling from LinesAddChild with refresh functionality
  const handleLinesAddChildCancel = () => {
    setShowLinesAddChild(false)

    // If we were viewing child lines before adding a new child, refresh the child lines data
    if (showChildLines) {
      console.log("Setting refreshChildLinesData to true after adding child")
      setRefreshChildLinesData(true)
    } else {
      console.log("Setting refreshLinesData to true after adding child")
      setRefreshLinesData(true) // Otherwise refresh the parent lines data
    }

    // Only reset the selected parent line if we're not viewing child lines
    if (!showChildLines) {
      setSelectedParentLine(null)
    }
  }

  // Handler for order number click
  const handleOrderNumberClick = (order) => {
    // Show loading spinner for 1 second when order number is clicked
    setIsLoading(true)

    setTimeout(() => {
      setSelectedOrder(order)
      setActiveMenu("orders")
      setActiveSubmenu("Orders")
      setSidebarCollapsed(true)
      setShowSecondSidebar(true)
      setShowOrderNumberDetails(true)

      // Hide loading spinner after order details are loaded
      setIsLoading(false)
    }, 500)
  }

  // Handler for line click to view child lines
  const handleLineClick = (line) => {
    // Show loading spinner for 1 second when line is clicked
    setIsLoading(true)

    setTimeout(() => {
      console.log("Line clicked to view children:", line)
      setSelectedParentLine(line)
      setShowChildLines(true)
      // Force refresh of child lines data when a line is clicked
      setTimeout(() => {
        setRefreshChildLinesData(true)
      }, 100)

      // Hide loading spinner after child lines are loaded
      setIsLoading(false)
    }, 500)
  }

  // Handler to go back from child lines to parent lines
  const handleBackToParentLines = () => {
    // Show loading spinner for 1 second when going back to parent lines
    setIsLoading(true)

    setTimeout(() => {
      setShowChildLines(false)
      setSelectedParentLine(null)
      // Refresh parent lines data when going back
      setRefreshLinesData(true)

      // Hide loading spinner after parent lines are loaded
      setIsLoading(false)
    }, 500)
  }

  // Handler for when data has been refreshed in LinesDatabaseSearch
  const handleDataRefreshed = () => {
    console.log("Parent lines data refreshed")
    setRefreshLinesData(false)
  }

  // Handler for when data has been refreshed in LinesChildDatabaseSearch
  const handleChildDataRefreshed = () => {
    console.log("Child lines data refreshed")
    setRefreshChildLinesData(false)
  }

  // Get the icon for a menu item
  const getMenuIcon = (menu) => {
    switch (menu) {
      case "home":
        return <LayoutDashboard size={20} />
      case "poentry":
        return <Clipboard size={20} />
      case "drawingentry":
        return <PenTool size={20} />
        case "rawmaterialentry":
          return <GiCardDraw size={20}/>
      case "orders":
        return <BarChart size={20} />
      case "fabrication":
        return <Package size={20} />
      case "erection":
        return <TrendingUp size={20} />
      case "alignment":
        return <Sliders size={20} />
      // case "billing":
      //   return <CreditCard size={20} />
        case "painting":
          return <CreditCard size={20}/>
      case "reports":
        return <FileText size={20} />
      case "invoices":
        return <FileQuestion size={20} />
      case "notifications":
        return <Bell size={20} />
      case "settings":
        return <Settings size={20} />
      case "logout":
        return <LogOut size={20} />
      case "LedgerCreation":
        return <MdAccountCircle size={20} />
      default:
        return <FileText size={20} />
    }
  }

  // Determine which content to render based on active menu and submenu
  const renderContent = () => {
    if (!showContent) return null

    if (showCoreLookup) return <LookupTable />

    // Handle PO Entry
    if (activeMenu === "poentry") {
      return <PoentrydatabseseTable />
    }

    // Handle Drawing Entry
    if (activeMenu === "drawingentry") {
      return <DrawingEntry />
    }

    if (activeMenu ==="rawmaterialentry"){
      return  <RawMaterialEntry/>
    }

    // Handle Fabrication
    if (activeMenu === "fabrication") {
      return <FabricationDatabasesearch />
    }

    // Handle Erection
    if (activeMenu === "erection") {
      return <ErectionDatabasesearch />
    }

    // Handle Alignment
    if (activeMenu === "alignment") {
      return <ErectionDatabasesearch />
    }

    if(activeMenu ==="painting"){
      return <ErectionDatabasesearch/>
    }

    // Handle Billing
    // if (activeMenu === "billing") {
    //   return <BillingDatabasesearch />
    // }

    // Handle Reports
     
      if (activeMenu === "reports") {
      return <ReportTemplate />
    }
    

    // Handle Requests
    if (activeMenu === "invoices") {
         return <Invoice />
    }

    // Handle Import
    if (activeMenu === "LedgerCreation") {
     return <LedgerCreation />
    }

    // Handle Notifications
    if (activeMenu === "notifications") {
      return (
        <div className="empty-state">
          <p>Hi Viewers, Notifications content will be displayed here.</p>
        </div>
      )
    }

    // Default content for home and other menus
    return (
      <div className="empty-state">
        <p>Hi Viewers, {activeMenu} content will be displayed here.</p>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      {/* Loading Spinner */}
      {isLoading && (
        <div className="dashboard-loading-overlay">
          <div className="dashboard-spinner-container">
            <div className="dashboard-spinner"></div>
            <div className="dashboard-spinner-text">Loading...</div>
          </div>
        </div>
      )}

      {/* Main Sidebar */}
      <div className={`sidebar ${sidebarOpen ? "open" : ""} ${sidebarCollapsed ? "collapsed" : ""}`}>
        <div className="logo-container">
          {/* Company Logo - Clickable and Editable */}
          <div className="company-logo">
            <div className="logo-image-container">
              <img src={logoImage || "/placeholder.svg"} alt="company logo" className="logo-image" />
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                style={{ display: "none" }}
              />
            </div>
            {!sidebarCollapsed && (
              <div className="logo-text">
                <span className="company-name" style={{color:'#ffffff'}}>Bellary Infotech Billing</span>
                <span className="company-tagline">Smart Software</span>
              </div>
            )}
          </div>

          <button className="close-sidebar" onClick={toggleSidebar}>
            <X size={24} />
          </button>
        </div>

        <nav className="nav-menu">
          <ul>
            <li>
              <a
                href="#"
                className={`nav-link ${activeMenu === "home" ? "active" : ""}`}
                onClick={(e) => handleLinkClick(e, "home")}
              >
                {getMenuIcon("home")}
                {!sidebarCollapsed && <span>Home</span>}
              </a>
            </li>

            <li>
              <a
                href="#"
                className={`nav-link ${activeMenu === "poentry" ? "active" : ""}`}
                onClick={(e) => handleLinkClick(e, "poentry")}
              >
                {getMenuIcon("poentry")}
                {!sidebarCollapsed && <span>PO Entry</span>}
              </a>
            </li>

            <li>
              <a
                href="#"
                className={`nav-link ${activeMenu === "drawingentry" ? "active" : ""}`}
                onClick={(e) => handleLinkClick(e, "drawingentry")}
              >
                {getMenuIcon("drawingentry")}
                {!sidebarCollapsed && <span>Drawing Entry</span>}
              </a>
            </li>

            <li>
              <a
                href="#"
                className={`nav-link ${activeMenu === "rawmaterialentry" ? "active" : ""}`}
                onClick={(e) => handleLinkClick(e, "rawmaterialentry")}
              >
                {getMenuIcon("rawmaterialentry")}
                {!sidebarCollapsed && <span>Raw Material Entry</span>}
              </a>
            </li>

            {/* Orders menu is commented out */}
            {/* <li>
              <a
                href="#"
                className={`nav-link ${activeMenu === "orders" ? "active" : ""}`}
                onClick={(e) => handleLinkClick(e, "orders")}
              >
                {getMenuIcon("orders")}
                {!sidebarCollapsed && <span>Orders</span>}
              </a>
            </li> */}

            <li>
              <a
                href="#"
                className={`nav-link ${activeMenu === "fabrication" ? "active" : ""}`}
                onClick={(e) => handleLinkClick(e, "fabrication")}
              >
                {getMenuIcon("fabrication")}
                {!sidebarCollapsed && <span>Fabrication</span>}
              </a>
            </li>
            <li>
              <a
                href="#"
                className={`nav-link ${activeMenu === "erection" ? "active" : ""}`}
                onClick={(e) => handleLinkClick(e, "erection")}
              >
                {getMenuIcon("erection")}
                {!sidebarCollapsed && <span>Erection</span>}
              </a>
            </li>
            <li>
              <a
                href="#"
                className={`nav-link ${activeMenu === "alignment" ? "active" : ""}`}
                onClick={(e) => handleLinkClick(e, "alignment")}
              >
                {getMenuIcon("alignment")}
                {!sidebarCollapsed && <span>Alignment</span>}
              </a>
            </li>
            <li>
              <a
                href="#"
                className={`nav-link ${activeMenu === "painting" ? "active" : ""}`}
                onClick={(e) => handleLinkClick(e, "painting")}
              >
                {getMenuIcon("alignment")}
                {!sidebarCollapsed && <span>Painting</span>}
              </a>
            </li>

            {/* <li>
              <a
                href="#"
                className={`nav-link ${activeMenu === "billing" ? "active" : ""}`}
                onClick={(e) => handleLinkClick(e, "billing")}
              >
                {getMenuIcon("billing")}
                {!sidebarCollapsed && <span>Billing</span>}
              </a>
            </li> */}
            <li>
              <a
                href="#"
                className={`nav-link ${activeMenu === "reports" ? "active" : ""}`}
                onClick={(e) => handleLinkClick(e, "reports")}
              >
                {getMenuIcon("reports")}
                {!sidebarCollapsed && <span>Reports</span>}
              </a>
            </li>
            <li>
              <a
                href="#"
                className={`nav-link ${activeMenu === "invoices" ? "active" : ""}`}
                onClick={(e) => handleLinkClick(e, "invoices")}
              >
                {getMenuIcon("invoices")}
                {!sidebarCollapsed && <span>Invoices</span>}
              </a>
            </li>
            <li>
              <a
                href="#"
                className={`nav-link ${activeMenu === "LedgerCreation" ? "active" : ""}`}
                onClick={(e) => handleLinkClick(e, "LedgerCreation")}
              >
                {getMenuIcon("LedgerCreation")}
                {!sidebarCollapsed && <span>Ledger Creation</span>}
              </a>
            </li>
          </ul>
        </nav>

        <div className="bottom-menu">
          <ul>
            <li>
              <a
                href="#"
                className={`nav-link ${activeMenu === "notifications" ? "active" : ""}`}
                onClick={(e) => handleLinkClick(e, "notifications")}
              >
                {getMenuIcon("notifications")}
                {!sidebarCollapsed && <span>Notifications</span>}
              </a>
            </li>

            <li>
              <a href="#" className="nav-link" onClick={(e) => handleLinkClick(e, "logout")}>
                {getMenuIcon("logout")}
                {!sidebarCollapsed && <span>Logout</span>}
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Secondary Sidebar - Hidden */}
      {/* {showSecondSidebar && (
        <div className="secondary-sidebar">
          <div className="secondary-sidebar-header">
            <h2>{activeMenu.charAt(0).toUpperCase() + activeMenu.slice(1)}</h2>
          </div>
          <nav className="secondary-sidebar-menu">
            <ul>
              {submenus[activeMenu] &&
                submenus[activeMenu].map((submenu) => (
                  <li key={submenu}>
                    <a
                      href="#"
                      className={`secondary-nav-link ${activeSubmenu === submenu ? "active" : ""}`}
                      onClick={(e) => handleSubmenuClick(e, submenu)}
                    >
                      <span>{submenu}</span>
                    </a>
                  </li>
                ))}
            </ul>
          </nav>
        </div>
      )} */}

      {/* Content Area */}
      <div className="content-wrapper">
        {/* Header */}
        <header className="header">
          <div className="header-left">
            <button className="hamburger-menu" onClick={toggleSidebar}>
              <Menu size={24} />
            </button>
            <h1 style={{ color: "white", fontWeight: "bold" }}>
              {activeMenu === "home" && (username ? `Hi ${username}` : "Welcome")}
              {activeMenu === "poentry" && "PO Entry"}
              {activeMenu === "drawingentry" && "Drawing Entry"}
              {activeMenu === "rawmaterialentry" && "Raw Material Entry"}
              {activeMenu === "fabrication" && "Fabrication"}
              {activeMenu === "erection" && "Erection"}
              {activeMenu === "alignment" && "Alignment"}
              {activeMenu === "painting" && "Painting"}
              {/* {activeMenu === "billing" && "Billing"} */}
              {activeMenu === "reports" && "Reports"}
              {activeMenu === "invoices" && "Invoices"}
              {activeMenu === "ledgerCreation" && "LedgerCreation"}
              {activeMenu === "notifications" && "Notifications"}
            </h1>
          </div>
          <div className="header-right">
            <button className="header-btn" onClick={toggleSettings}>
              <Settings size={20} />
            </button>
            <div className="user-dropdown-container" ref={userDropdownRef}>
              <button className="header-btn profile-btn" onClick={toggleUserDropdown}>
                <User size={20} />
              </button>
              {showUserDropdown && (
                <div className="user-dropdown">
                  <div className="user-dropdown-item" onClick={() => handleProfileAction("my-profile")}>
                    <UserCircle size={18} />
                    <Link to="/vendor/user/profile/details" style={{textDecoration:'none'}}>
                    <span>My Profile</span>
                    </Link>
                  </div>
                  <div className="user-dropdown-item" onClick={() => handleProfileAction("edit-profile")}>
                    <Edit size={18} />
                    <span>Edit Profile</span>
                  </div>
                  <div className="dropdown-divider"></div>
                  <div className="user-dropdown-item logout-item" onClick={() => handleProfileAction("logout")}>
                    <LogOut size={18} />
                    <span>Log out</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="main-content">{renderContent()}</main>
      </div>

      {/* Settings Popup */}
      {settingsOpen && (
        <SettingsPopup
          isOpen={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          onCoreLookupClick={handleCoreLookupClick}
        />
      )}

      {/* Logout Confirmation Popup */}
      {showLogoutPopup && (
        <div className="logout-popup-overlay">
          <div className="logout-popup">
            <div className="logout-popup-header">
              <AlertTriangle size={28} className="logout-icon" />
              <h3>Sign Out</h3>
            </div>
            <div className="logout-popup-content">
              <p>Are you sure you want to sign out of Mech Billing App?</p>
            </div>
            <div className="logout-popup-actions">
              <button className="stay-btn" onClick={handleStay}>
                No, Stay
              </button>
              <button className="logout-btn" onClick={handleLogout}>
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default MainDashboard;
