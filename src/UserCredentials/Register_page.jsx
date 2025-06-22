"use client"

import { useState, useEffect } from "react"
import "../UserCredentialsDesign/register-page.css"
import axios from "axios"
import { Link, useNavigate } from "react-router-dom"
import logo from "../assets/logo.jpg"

const RegisterPage = () => {
  // Add loading state
  const [loading, setLoading] = useState(true)

  // Current step state
  const [currentStep, setCurrentStep] = useState(0)

  const [user, setUser] = useState({
    fullname: "",
    username: "",
    email: "",
    password: "",
    phoneNumber: "",
  })

  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const [errors, setErrors] = useState({})
  const [showPassword, setShowPassword] = useState(false)
  const [isStrongPassword, setIsStrongPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)

  // Toast state
  const [toast, setToast] = useState({
    show: false,
    type: "success",
    title: "",
    message: "",
  })

  // Add loading effect
  useEffect(() => {
    // Simulate loading for 1 second
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    // Clean up the timer
    return () => clearTimeout(timer)
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setUser({
      ...user,
      [name]: value,
    })

    if (name === "password") {
      checkPasswordStrength(value)
    }

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      })
    }
  }

  const checkPasswordStrength = (password) => {
    setIsStrongPassword(password.length >= 8)
  }

  const validateCurrentField = () => {
    const tempErrors = {}
    let isValid = true

    switch (currentStep) {
      case 1: // Full Name
        if (!user.fullname.trim()) {
          tempErrors.fullname = "Full name is required"
          isValid = false
        }
        break
      case 2: // Username
        if (!user.username.trim()) {
          tempErrors.username = "Username is required"
          isValid = false
        }
        break
      case 3: // Email
        if (!user.email.trim()) {
          tempErrors.email = "Email is required"
          isValid = false
        } else if (!/\S+@\S+\.\S+/.test(user.email)) {
          tempErrors.email = "Email is invalid"
          isValid = false
        }
        break
      case 4: // Password
        if (!user.password) {
          tempErrors.password = "Password is required"
          isValid = false
        } else if (!isStrongPassword) {
          tempErrors.password = "Password must be at least 8 characters"
          isValid = false
        }
        break
      case 5: // Phone Number
        if (!user.phoneNumber.trim()) {
          tempErrors.phoneNumber = "Phone number is required"
          isValid = false
        } else if (!/^\d{10}$/.test(user.phoneNumber.replace(/[^0-9]/g, ""))) {
          tempErrors.phoneNumber = "Phone number is invalid"
          isValid = false
        }
        break
      default:
        break
    }

    setErrors(tempErrors)
    return isValid
  }

  const validateForm = () => {
    const tempErrors = {}
    let isValid = true

    if (!user.fullname.trim()) {
      tempErrors.fullname = "Full name is required"
      isValid = false
    }

    if (!user.username.trim()) {
      tempErrors.username = "Username is required"
      isValid = false
    }

    if (!user.email.trim()) {
      tempErrors.email = "Email is required"
      isValid = false
    } else if (!/\S+@\S+\.\S+/.test(user.email)) {
      tempErrors.email = "Email is invalid"
      isValid = false
    }

    if (!user.password) {
      tempErrors.password = "Password is required"
      isValid = false
    } else if (!isStrongPassword) {
      tempErrors.password = "Password must be at least 8 characters"
      isValid = false
    }

    if (!user.phoneNumber.trim()) {
      tempErrors.phoneNumber = "Phone number is required"
      isValid = false
    } else if (!/^\d{10}$/.test(user.phoneNumber.replace(/[^0-9]/g, ""))) {
      tempErrors.phoneNumber = "Phone number is invalid"
      isValid = false
    }

    if (!termsAccepted) {
      tempErrors.terms = "You must accept the terms and conditions"
      isValid = false
    }

    setErrors(tempErrors)
    return isValid
  }

  const handleNextStep = () => {
    if (validateCurrentField()) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1)
  }

  const handleSubmit = async (e) => {
    if (e) e.preventDefault()

    if (validateForm()) {
      setIsSubmitting(true)

      try {
        const response = await axios.post("http://195.35.45.56:5522/api/register", user)

        // Reset form fields
        setUser({
          fullname: "",
          username: "",
          email: "",
          password: "",
          phoneNumber: "",
        })
        setTermsAccepted(false)

        // Show success toast after 3 seconds
        setTimeout(() => {
          setIsSubmitting(false)

          // Show success toast
          setToast({
            show: true,
            type: "success",
            title: "Registration Successful!",
            message: `Welcome to Bellary Billing Solutions, ${user.username}! You'll be redirected to login.`,
          })

          // Navigate after toast is shown
          setTimeout(() => {
            // Force navigation to login page
            window.location.href = "/login/billing"
          }, 5000)
        }, 3000)
      } catch (err) {
        setTimeout(() => {
          setIsSubmitting(false)
          setError("Registration failed. Please try again!")

          // Reset form fields on error too
          setUser({
            fullname: "",
            username: "",
            email: "",
            password: "",
            phoneNumber: "",
          })
          setTermsAccepted(false)

          // Show error toast
          setToast({
            show: true,
            type: "error",
            title: "Registration Failed",
            message: "Something went wrong. Please try again later.",
          })
        }, 3000)
      }
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const handleGoogleSignIn = (e) => {
    e.preventDefault()
    // Show coming soon popup
    setToast({
      show: true,
      type: "info",
      title: "Coming Soon",
      message: "Google sign-in integration will be available soon!",
    })
  }

  const handleCloseToast = () => {
    setToast({ ...toast, show: false })
  }

  const navigateToLogin = () => {
    navigate("/login/billing")
  }

  // Render the current step
  const renderStep = () => {
    switch (currentStep) {
      case 0: // Initial screen with "Continue with Email" button
        return (
          <form
            className="vercel-step"
            onSubmit={(e) => {
              e.preventDefault()
              handleNextStep()
            }}
          >
            <h1 className="vercel-title">Sign up to BellaryInfotech Billing Solutions</h1>
            <p className="vercel-welcome-text">Create an account to get started with BellaryInfotech Billing Application</p>

            <button type="button" className="vercel-google-btn" onClick={handleGoogleSignIn}>
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48">
                <path
                  fill="#FFC107"
                  d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                />
                <path
                  fill="#FF3D00"
                  d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                />
                <path
                  fill="#4CAF50"
                  d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                />
                <path
                  fill="#1976D2"
                  d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="vercel-divider">
              <span>OR</span>
            </div>

            <button type="submit" className="vercel-email-btn">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
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
              <span>Continue with Email</span>
            </button>

            <div className="vercel-footer">
              <p>
                Already have an account? <Link to="/login/billing">Log In</Link>
              </p>
            </div>
          </form>
        )

      case 1: // Full Name
        return (
          <form
            className="vercel-step"
            onSubmit={(e) => {
              e.preventDefault()
              handleNextStep()
            }}
          >
            <div className="vercel-back-link" onClick={handlePrevStep}>
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
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              <span>Back</span>
            </div>

            <h1 className="vercel-title">What's your name?</h1>

            <div className="vercel-form-group">
              <input
                type="text"
                id="fullname"
                name="fullname"
                placeholder="Full Name"
                value={user.fullname}
                onChange={handleChange}
                className={errors.fullname ? "vercel-input-error" : ""}
                autoFocus
              />
              {errors.fullname && <div className="vercel-error">{errors.fullname}</div>}
            </div>

            <button type="submit" className="vercel-continue-btn">
              Continue
            </button>
          </form>
        )

      case 2: // Username
        return (
          <form
            className="vercel-step"
            onSubmit={(e) => {
              e.preventDefault()
              handleNextStep()
            }}
          >
            <div className="vercel-back-link" onClick={handlePrevStep}>
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
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              <span>Back</span>
            </div>

            <h1 className="vercel-title">Choose a username</h1>

            <div className="vercel-form-group">
              <input
                type="text"
                id="username"
                name="username"
                placeholder="Username"
                value={user.username}
                onChange={handleChange}
                className={errors.username ? "vercel-input-error" : ""}
                autoFocus
              />
              {errors.username && <div className="vercel-error">{errors.username}</div>}
            </div>

            <button type="submit" className="vercel-continue-btn">
              Continue
            </button>
          </form>
        )

      case 3: // Email
        return (
          <form
            className="vercel-step"
            onSubmit={(e) => {
              e.preventDefault()
              handleNextStep()
            }}
          >
            <div className="vercel-back-link" onClick={handlePrevStep}>
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
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              <span>Back</span>
            </div>

            <h1 className="vercel-title">What's your email?</h1>

            <div className="vercel-form-group">
              <input
                type="email"
                id="email"
                name="email"
                placeholder="Email"
                value={user.email}
                onChange={handleChange}
                className={errors.email ? "vercel-input-error" : ""}
                autoFocus
              />
              {errors.email && <div className="vercel-error">{errors.email}</div>}
            </div>

            <button type="submit" className="vercel-continue-btn">
              Continue
            </button>
          </form>
        )

      case 4: // Password
        return (
          <form
            className="vercel-step"
            onSubmit={(e) => {
              e.preventDefault()
              handleNextStep()
            }}
          >
            <div className="vercel-back-link" onClick={handlePrevStep}>
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
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              <span>Back</span>
            </div>

            <h1 className="vercel-title">Create a password</h1>

            <div className="vercel-form-group">
              <div className="vercel-password-input">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="Password (min. 8 characters)"
                  value={user.password}
                  onChange={handleChange}
                  className={errors.password ? "vercel-input-error" : ""}
                  autoFocus
                />
                <button type="button" className="vercel-password-toggle" onClick={togglePasswordVisibility}>
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
              {errors.password && <div className="vercel-error">{errors.password}</div>}
            </div>

            <button type="submit" className="vercel-continue-btn">
              Continue
            </button>
          </form>
        )

      case 5: // Phone Number
        return (
          <form
            className="vercel-step"
            onSubmit={(e) => {
              e.preventDefault()
              handleNextStep()
            }}
          >
            <div className="vercel-back-link" onClick={handlePrevStep}>
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
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              <span>Back</span>
            </div>

            <h1 className="vercel-title">What's your phone number?</h1>

            <div className="vercel-form-group">
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                placeholder="Phone Number"
                value={user.phoneNumber}
                onChange={handleChange}
                maxLength={10}
                className={errors.phoneNumber ? "vercel-input-error" : ""}
                autoFocus
              />
              {errors.phoneNumber && <div className="vercel-error">{errors.phoneNumber}</div>}
            </div>

            <button type="submit" className="vercel-continue-btn">
              Continue
            </button>
          </form>
        )

      case 6: // Final step with terms and register button
        return (
          <form
            className="vercel-step"
            onSubmit={(e) => {
              e.preventDefault()
              handleSubmit()
            }}
          >
            <div className="vercel-back-link" onClick={handlePrevStep}>
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
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
              <span>Back</span>
            </div>

            <h1 className="vercel-title">Complete your registration</h1>

            <div className="vercel-user-summary">
              <div className="vercel-user-info">
                <div className="vercel-user-name">{user.fullname}</div>
                <div className="vercel-user-email">{user.email}</div>
              </div>
            </div>

            <div className="vercel-terms">
              <label className="vercel-checkbox-label">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={() => setTermsAccepted(!termsAccepted)}
                  className="vercel-checkbox"
                />
                <span>
                  I accept the{" "}
                  <a href="#" className="vercel-link">
                    Terms and Conditions
                  </a>
                </span>
              </label>
              {errors.terms && <div className="vercel-error">{errors.terms}</div>}
            </div>

            <button
              type="submit"
              className={`vercel-register-btn ${!termsAccepted ? "vercel-btn-disabled" : ""}`}
              disabled={!termsAccepted || isSubmitting}
            >
              {isSubmitting ? (
                <div className="vercel-btn-spinner">
                  <div className="vercel-spinner"></div>
                  <span>Registering...</span>
                </div>
              ) : (
                "Register"
              )}
            </button>
          </form>
        )

      default:
        return null
    }
  }

  // Update the return statement to include the loading spinner
  return (
    <>
      {/* Loading Spinner */}
      {loading && (
        <div className="loading-overlay">
          <div className="spinner-container">
            <div className="spinner"></div>
            <div className="spinner-text">Loading...</div>
          </div>
        </div>
      )}

      <div className={`vercel-container ${loading ? "content-blur" : "content-visible"}`}>
        {/* Material Toast Notification */}
        {toast.show && (
          <div className={`material-toast material-toast-${toast.type}`}>
            <div className="material-toast-icon">
              {toast.type === "success" && (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"></path>
                </svg>
              )}
              {toast.type === "error" && (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"></path>
                </svg>
              )}
              {toast.type === "info" && (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"></path>
                </svg>
              )}
              {toast.type === "warning" && (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                  <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"></path>
                </svg>
              )}
            </div>
            <div className="material-toast-content">
              <div className="material-toast-title">{toast.title}</div>
              <div className="material-toast-message">{toast.message}</div>
            </div>
            <button className="material-toast-close" onClick={handleCloseToast}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
              </svg>
            </button>
            <div className="material-toast-progress"></div>
          </div>
        )}

        {/* Header with navigation */}
        <div className="vercel-header">
          <div className="vercel-logo">
            <img src={logo} alt="terri" style={{width:'50px',height:'50px'}}/>
          </div>
          <div className="vercel-nav">
            <a href="#" className="vercel-nav-link">
              Contact
            </a>
            <button onClick={navigateToLogin} className="vercel-nav-link">
              Log In
            </button>
            <button className="vercel-nav-button">Sign Up</button>
          </div>
        </div>

        <div className="vercel-content">{renderStep()}</div>

         
      </div>
    </>
  )
}

export default RegisterPage;
