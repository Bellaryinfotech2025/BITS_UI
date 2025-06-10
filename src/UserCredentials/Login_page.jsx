"use client"

import { useState } from "react"
import "../UserCredentialsDesign/login-page.css"
import "../UserCredentialsDesign/toast-notification.css"
import "../UserCredentialsDesign/loading-spinner.css"
import logo from "../assets/blogo.jpg"
import axios from "axios"
import { Link, useNavigate } from "react-router-dom"
import Toast from "../UserCredentials/Toast"

// Add this at the top of your component, after the imports
const passwordStarStyle = `
  input[type="password"] {
    -webkit-text-security: disc;
    -moz-text-security: disc;
    text-security: disc;
    font-size: 16px;
    letter-spacing: 2px;
  }
`

const LoginPage = () => {
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
    rememberMe: false,
  })
  const [error, setError] = useState(null)
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  // Toast state
  const [toast, setToast] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
  })

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setCredentials({
      ...credentials,
      [name]: type === "checkbox" ? checked : value,
    })

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      })
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!credentials.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(credentials.email)) {
      newErrors.email = "Email is invalid"
    }

    if (!credentials.password) {
      newErrors.password = "Password is required"
    } else if (credentials.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Update the handleSubmit function to store the username in localStorage
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await axios.post("http://195.35.45.56:5522/api/login", credentials)

      // Extract username from response or use email as fallback
      const username = response.data?.user?.username || credentials.email.split("@")[0]

      // Store user data in localStorage
      localStorage.setItem(
        "user",
        JSON.stringify({
          username: username,
          email: credentials.email,
        }),
      )

      // Reset form fields
      setCredentials({
        email: "",
        password: "",
        rememberMe: false,
      })

      // Show success toast after 3 seconds
      setTimeout(() => {
        setIsSubmitting(false)

        // Show success toast
        setToast({
          show: true,
          type: "success",
          title: "Login Successful!",
          message: `Login successful redirecting to Your Dashboard ${username}`,
        })

        // Navigate after toast is shown
        setTimeout(() => {
          navigate("/software/bellarybillingapplication/user/dashboard/details/")
        }, 3000)
      }, 3000)
    } catch (err) {
      // Show error after 3 seconds
      setTimeout(() => {
        setIsSubmitting(false)
        setError("Invalid email or password! Please try again")

        // Reset form fields on error too
        setCredentials({
          email: "",
          password: "",
          rememberMe: false,
        })

        // Show error toast
        setToast({
          show: true,
          type: "error",
          title: "Login Failed",
          message: "Invalid email or password! Please try again",
        })
      }, 3000)
    }
  }

  const handleCloseToast = () => {
    setToast({ ...toast, show: false })
  }

  return (
    <div className="bodyokok">
      {/* Add the style for password stars */}
      {/* <style>{passwordStarStyle}</style> */}

      {/* Toast Notification */}
      {toast.show && <Toast type={toast.type} title={toast.title} message={toast.message} onClose={handleCloseToast} />}

      <div className="login-container">
        <div className="login-card">
          <div className="login-left">
            <div className="logo-container">
              <div className="logo-wrapper">
                <center>
                  <img
                    src={logo || "/placeholder.svg"}
                    alt="logo of company"
                    style={{ width: "30px", height: "30px" }}
                  />
                </center>
                <h3>BellaryInfotech Billing Application</h3>
              </div>
            </div>
            <div className="stylish-divider"></div>

            <div className="form-container">
              <h2>Sign In</h2>

              {error && <div className="error-alert">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <div className={`input-wrapper ${errors.email ? "error" : ""}`}>
                    <span className="input-icon">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                      </svg>
                    </span>
                    <input
                      type="email"
                      name="email"
                      placeholder="Email"
                      value={credentials.email}
                      onChange={handleChange}
                      required
                      style={{ paddingLeft: "40px" }}
                    />
                  </div>
                  {errors.email && <span className="error-message">{errors.email}</span>}
                </div>

                <div className="form-group">
                  {/* Password input with custom masking */}
                  <div className={`input-wrapper ${errors.password ? "error" : ""}`}>
                    <span className="input-icon">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                      </svg>
                    </span>
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Password"
                      value={credentials.password}
                      onChange={handleChange}
                      style={{
                        paddingLeft: "40px",
                        paddingRight: "40px",
                        letterSpacing: showPassword ? "normal" : "4px",
                        fontFamily: showPassword ? "inherit" : "monospace",
                      }}
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ position: "absolute", right: "10px" }}
                    >
                      {showPassword ? (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                          <line x1="1" y1="1" x2="23" y2="23"></line>
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      )}
                    </button>
                  </div>
                  {errors.password && <span className="error-message">{errors.password}</span>}
                </div>

                <div className="remember-me">
                  <label>
                    <input type="checkbox" name="rememberMe" checked={credentials.rememberMe} onChange={handleChange} />
                    &nbsp;&nbsp;&nbsp;&nbsp;<span>Remember me</span>
                  </label>
                </div>

                <button type="submit" className="signin-button" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <div className="button-spinner-container">
                      <div className="button-spinner"></div>
                      <span>Please wait redirecting to Dashboard...</span>
                    </div>
                  ) : (
                    "Submit"
                  )}
                </button>
              </form>

              <div className="help-link">
                <Link to="/">Dont have an Account ? Register or Sign Up?</Link>
                <br />
                <br />
              </div>
            </div>

            <div className="footer-links">
              <a href="#">about us</a>
              <span className="divider">|</span>
              <a href="#">Privacy Policy</a>
              <span className="divider">|</span>
              <span className="copyright">© 2025 bellaryinfotech.com</span>
            </div>
          </div>

          <div className="login-right">
            <div className="welcome-message">
              <h1>Welcome to BellaryInfotech Billing App</h1>
              <p>Your complete billing and revenue management solution</p>
              <div className="welcome-divider"></div>
            </div>

            <div className="hexagon-diagram">
              <div className="hexagon-container">
                <div className="hexagon center">
                  <div className="hex-content">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 3a9 9 0 0 0-9 9v7.5a1.5 1.5 0 0 0 1.5 1.5H6a1.5 1.5 0 0 0 1.5-1.5V12a4.5 4.5 0 1 1 9 0v7.5a1.5 1.5 0 0 0 1.5 1.5h1.5a1.5 1.5 0 0 0 1.5-1.5V12a9 9 0 0 0-9-9z"></path>
                    </svg>
                    <span>CONTRACT</span>
                  </div>
                </div>

                <div className="hexagon top">
                  <div className="hex-content">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                      <circle cx="9" cy="7" r="4"></circle>
                      <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                    </svg>
                    <span>Customers</span>
                  </div>
                </div>

                <div className="hexagon top-right">
                  <div className="hex-content">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                      <line x1="7" y1="7" x2="7.01" y2="7"></line>
                    </svg>
                    <span>Products</span>
                  </div>
                </div>

                <div className="hexagon right">
                  <div className="hex-content">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="12" y1="1" x2="12" y2="23"></line>
                      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                    </svg>
                    <span>Pricing</span>
                  </div>
                </div>

                <div className="hexagon bottom-right">
                  <div className="hex-content">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                      <line x1="8" y1="21" x2="16" y2="21"></line>
                      <line x1="12" y1="17" x2="12" y2="21"></line>
                    </svg>
                    <span>Invoices</span>
                  </div>
                </div>

                <div className="hexagon bottom">
                  <div className="hex-content">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
                    </svg>
                    <span>Analytics</span>
                  </div>
                </div>

                <div className="hexagon bottom-left">
                  <div className="hex-content">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <span>Schedule</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="insights-section">
              <h2>On-Demand Insights</h2>
              <p>
                bellaryinfotech's billing technology gives you the instant knowledge and insights you need to maintain
                financial rigor in this evolving economy.
              </p>
              <p>
                Streamline your billing processes, manage complex revenue models, and gain actionable insights with our
                comprehensive platform.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage;
