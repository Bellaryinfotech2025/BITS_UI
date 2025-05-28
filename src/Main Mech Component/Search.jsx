"use client"

import { Search } from "lucide-react"
import { useState } from "react"

const StylishSearch = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState("")

  const handleSearch = (e) => {
    e.preventDefault()
    onSearch(searchTerm)
  }

  return (
    <div className="stylish-search-container">
      <form onSubmit={handleSearch} className="stylish-search-form">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search..."
          className="stylish-search-input"
        />
        <button type="submit" className="stylish-search-button">
          <Search size={18} />
        </button>
      </form>
    </div>
  )
}

export default StylishSearch;
