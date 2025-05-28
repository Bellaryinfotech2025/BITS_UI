import "../UserCredentialsDesign/loading-spinner.css"

const LoadingSpinner = ({ message = "LOADING" }) => {
  return (
    <div className="loading-overlay">
      <div className="spinner-container">
        <div className="spinner">
          <div className="spinner-dot"></div>
          <div className="spinner-dot"></div>
          <div className="spinner-dot"></div>
          <div className="spinner-dot"></div>
          <div className="spinner-dot"></div>
          <div className="spinner-dot"></div>
          <div className="spinner-dot"></div>
          <div className="spinner-dot"></div>
        </div>
        <div className="spinner-text">{message}</div>
      </div>
    </div>
  )
}

export default LoadingSpinner;
