import { useState } from "react"
import "../InvoiceComponent/InvoiceTemplate.css"

const Invoice = () => {
  const [showDropdown, setShowDropdown] = useState(false)

  const handleDownload = (format) => {
  
    const invoiceContent = document.querySelector(".invoice-wrapper")

    if (format === "PDF") {
      // Create PDF download
      const printWindow = window.open("", "_blank")
      if (printWindow) {
        printWindow.document.write(`
          <html>
            <head>
              <title>Invoice</title>
              <style>
                body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }
                .invoice-wrapper { border: 2px solid #000; }
                table { border-collapse: collapse; width: 100%; }
                th, td { border: 2px solid #000; padding: 8px; text-align: center; }
                .invoice-header { display: flex; justify-content: space-between; padding: 10px 20px; border-bottom: 2px solid #000; }
                .invoice-title { font-size: 24px; font-weight: bold; }
                .label { font-weight: bold; }
                .field-row { display: flex; margin-bottom: 5px; min-height: 20px; }
                .value { flex: 1; border-bottom: 2px solid #ccc; min-height: 18px; }
                .invoice-content { display: grid; grid-template-columns: 1fr 1fr 1fr; border-bottom: 2px solid #000; }
                .left-section, .middle-section, .right-section { border-right: 2px solid #000; padding: 10px; }
                .right-section { border-right: none; }
                .remarks-section { display: flex; border: 2px solid #000; min-height: 80px; }
                .remarks-left { flex: 1; padding: 10px; border-right: 2px solid #000; }
                .remarks-right { flex: 1; padding: 10px; }
              </style>
            </head>
            <body>
              ${invoiceContent?.outerHTML}
            </body>
          </html>
        `)
        printWindow.document.close()
        printWindow.print()
      }
    } else if (format === "Document") {
      // Create HTML file download
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Invoice Document</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .invoice-wrapper { border: 2px solid #000; }
              table { border-collapse: collapse; width: 100%; }
              th, td { border: 2px solid #000; padding: 8px; text-align: center; }
              .invoice-header { display: flex; justify-content: space-between; padding: 10px 20px; border-bottom: 2px solid #000; }
              .invoice-title { font-size: 24px; font-weight: bold; }
              .label { font-weight: bold; }
              .field-row { display: flex; margin-bottom: 5px; min-height: 20px; }
              .value { flex: 1; border-bottom: 2px solid #ccc; min-height: 18px; }
              .invoice-content { display: grid; grid-template-columns: 1fr 1fr 1fr; border-bottom: 2px solid #000; }
              .left-section, .middle-section, .right-section { border-right: 2px solid #000; padding: 10px; }
              .right-section { border-right: none; }
              .remarks-section { display: flex; border: 2px solid #000; min-height: 80px; }
              .remarks-left { flex: 1; padding: 10px; border-right: 2px solid #000; }
              .remarks-right { flex: 1; padding: 10px; }
            </style>
          </head>
          <body>
            ${invoiceContent?.outerHTML}
          </body>
        </html>
      `
      const blob = new Blob([htmlContent], { type: "text/html" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "invoice.html"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } else if (format === "Word") {
      // Create Word document download
      const wordContent = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
          <head>
            <meta charset='utf-8'>
            <title>Invoice</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              table { border-collapse: collapse; width: 100%; }
              th, td { border: 2px solid #000; padding: 8px; text-align: center; }
              .invoice-header { display: flex; justify-content: space-between; padding: 10px 20px; border-bottom: 2px solid #000; }
              .invoice-title { font-size: 24px; font-weight: bold; }
              .label { font-weight: bold; }
            </style>
          </head>
          <body>
            ${invoiceContent?.outerHTML}
          </body>
        </html>
      `
      const blob = new Blob([wordContent], { type: "application/msword" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = "invoice.doc"
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    }

    setShowDropdown(false)
  }

  return (
    <div className="invoice-container">
      <div className="invoice-wrapper">
        {/* Header */}
        <div className="invoice-header">
          <h1 className="invoice-title">TAX INVOICE</h1>
          <div className="original-text">ORIGINAL FOR RECEIPIENT</div>
        </div>

        {/* Main Content Grid */}
        <div className="invoice-content">
          {/* Left Section */}
          <div className="left-section">
            <div className="provider-section">
              <div className="field-row">
                <span className="label">Name of the Service Provider</span>
              </div>
              <div className="field-row">
                <span className="label">ADDRESS</span>
                 
              </div>
              <div className="field-row address-line">
                 
              </div>
              <div className="field-row">
                <span className="label">GST REGISTRATION NO</span>
                 
              </div>
              <div className="field-row">
                <span className="label">IT PAN No</span>
                 
              </div>
            </div>

            <div className="receiver-section">
              <div className="field-row">
                <span className="label">NAME OF THE SERVICE RECEIVER</span>
                 
              </div>
              <div className="field-row">
                <span className="label">ADDRESS</span>
                 
              </div>
              <div className="field-row address-line">
                 
              </div>
              <div className="field-row">
                <span className="label">GST REGISTRATION NO</span>
                 
              </div>
              <div className="field-row">
                <span className="label">IT PAN No</span>
                 
              </div>
            </div>
          </div>

          {/* Middle Section */}
          <div className="middle-section">
            <div className="contact-section">
              <div className="contact-header">CONTACT DETAILS</div>
              <div className="contact-name"></div>
              <div className="field-row">
                <span className="label">MOBILE NO</span>
                 
              </div>
              <div className="field-row">
                <span className="label">TELEPHONE NO.(RESI)</span>
              </div>
              <div className="field-row">
                <span className="label">TELEPHONE NO.(OFF)</span>
              </div>
              <div className="field-row">
                <span className="label">E MAIL ID</span>
                 
              </div>
            </div>

            <div className="reverse-charge-section">
              <div className="reverse-charge-header">Reverse Charge</div>
              <div className="reverse-charge-value">NO</div>
            </div>
          </div>

          {/* Right Section */}
          <div className="right-section">
            <div className="invoice-details">
              <div className="field-row">
                <span className="label">Invoice No</span>
                 
              </div>
              <div className="field-row">
                <span className="label">Invoice Date</span>
                 
              </div>
              <div className="field-row">
                <span className="label">RA Bill NO</span>
                 
              </div>
              <div className="field-row">
                <span className="label">SERVICE RENDERED PERIOD</span>
              </div>
              <div className="service-period">
                <span className="period-from"></span>
                <span className="period-to"></span>
              </div>
            </div>

            <div className="work-order-section">
              <div className="field-row">
                <span className="label">W.O No</span>
                 
              </div>
              <div className="field-row">
                <span className="label">W.O Date</span>
                 
              </div>
              <div className="field-row">
                <span className="label">Cost Centre</span>
                 
              </div>
              <div className="field-row">
                <span className="label">PLACE OF SERVICE RENDERED</span>
              </div>
              <div className="service-place"></div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="items-table">
          <table>
            <thead>
              <tr>
                <th>SL NO.</th>
                <th>DESCRIPTION OF SUPPLY.</th>
                <th>SAC CODE</th>
                <th>UOM</th>
                <th>Qty</th>
                <th>Rate/ Rs.</th>
                <th>AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Tax Calculation Section */}
        <div className="tax-section">
          <table>
            <tbody>
              <tr>
                <td className="tax-label">TOTAL AMOUNT BEFORE TAX</td>
                <td className="colon"></td>
                <td className="tax-amount"></td>
              </tr>
              <tr>
                <td className="tax-label">CGST @ 9 %</td>
                <td className="colon"></td>
                <td className="tax-amount"></td>
              </tr>
              <tr>
                <td className="tax-label">SGST @ 9 %</td>
                <td className="colon"></td>
                <td className="tax-amount"></td>
              </tr>
              <tr>
                <td className="tax-label">IGST</td>
                <td className="colon"></td>
                <td className="tax-amount"></td>
              </tr>
              <tr>
                <td className="tax-label">TAX AMOUNT GST</td>
                <td className="colon"></td>
                <td className="tax-amount"></td>
              </tr>
              <tr>
                <td className="tax-label">TOTAL AMOUNT AFTER TAX</td>
                <td className="colon"></td>
                <td className="tax-amount"></td>
              </tr>
              <tr>
                <td className="tax-label">ROUND OFF</td>
                <td className="colon"></td>
                <td className="tax-amount"></td>
              </tr>
              <tr>
                <td className="tax-label">TOTAL</td>
                <td className="colon"></td>
                <td className="tax-amount"></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Bottom Section */}
        <div className="bottom-section">
          <div className="rupees-section">
            <div className="field-row">
              <span className="label">Rupees in words</span>
               
            </div>
            <div className="field-row">
              <span className="label">TOTAL</span>
              <span className="total-amount"></span>
            </div>
          </div>

          <div className="remarks-section">
            <div className="remarks-left">
              <div className="remarks-header">Remarks</div>
              <div className="remarks-content"></div>
            </div>
            <div className="remarks-right">
              <div className="company-header">For Bellary Infrastructure Pvt Ltd</div>
              <div className="company-content"></div>
            </div>
          </div>

          <div className="signature-section">
            <table>
              <tbody>
                <tr>
                  <td className="signature-cell">
                    <div className="signature-label-small">Prepared by</div>
                    <div className="signature-space"></div>
                  </td>
                  <td className="signature-cell">
                    <div className="signature-label-small">Checked by</div>
                    <div className="signature-space"></div>
                  </td>
                  <td className="signature-cell">
                    <div className="signature-label">Signature of Authorised Agent</div>
                    <div className="signature-space"></div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Print Button at Bottom */}
      <div className="print-section">
        <button className="print-button" onClick={() => setShowDropdown(!showDropdown)}>
          Print Invoice 
        </button>
        {showDropdown && (
          <div className="dropdown-menu">
            <div className="dropdown-item" onClick={() => handleDownload("PDF")}>
               Download as PDF
            </div>
            <div className="dropdown-item" onClick={() => handleDownload("Document")}>
               Download as Document
            </div>
            <div className="dropdown-item" onClick={() => handleDownload("Word")}>
               Download as Word
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Invoice;
