import { useState } from "react";
import { FaStar, FaTimes } from "react-icons/fa";
import "../InvoiceComponent/RatingPopup.css";

const RatingPopup = ({ isOpen, onClose, onSubmit }) => {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [feedback, setFeedback] = useState("")

  const handleSubmit = () => {
    if (rating === 0) {
      alert("Please select a rating before submitting")
      return
    }

    onSubmit({
      rating,
      feedback,
      timestamp: new Date().toISOString(),
    })

    // Reset form
    setRating(0)
    setHover(0)
    setFeedback("")
    onClose()
  }

  const handleClose = () => {
    setRating(0)
    setHover(0)
    setFeedback("")
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="rating-overlay">
      <div className="rating-popup">
        <div className="rating-header">
          <h3>Rate Your Experience</h3>
          <button className="rating-close-btn" onClick={handleClose}>
            <FaTimes />
          </button>
        </div>

        <div className="rating-body">
          <p>How was your invoice generation experience?</p>

          <div className="stars-container">
            {[...Array(5)].map((star, index) => {
              const ratingValue = index + 1

              return (
                <label key={index}>
                  <input
                    type="radio"
                    name="rating"
                    value={ratingValue}
                    onClick={() => setRating(ratingValue)}
                    style={{ display: "none" }}
                  />
                  <FaStar
                    className="star"
                    color={ratingValue <= (hover || rating) ? "#ffc107" : "#e4e5e9"}
                    size={30}
                    onMouseEnter={() => setHover(ratingValue)}
                    onMouseLeave={() => setHover(0)}
                  />
                </label>
              )
            })}
          </div>

          <div className="rating-text">
            {rating === 1 && "Poor"}
            {rating === 2 && "Fair"}
            {rating === 3 && "Good"}
            {rating === 4 && "Very Good"}
            {rating === 5 && "Excellent"}
          </div>

          <textarea
            className="feedback-textarea"
            placeholder="Share your feedback (optional)"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={3}
          />
        </div>

        <div className="rating-footer">
          <button className="rating-cancel-btn" onClick={handleClose}>
            Skip
          </button>
          <button className="rating-submit-btn" onClick={handleSubmit}>
            Submit Your Review 
          </button>
        </div>
      </div>
    </div>
  )
}

export default RatingPopup;
