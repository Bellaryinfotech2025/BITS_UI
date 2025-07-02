import { useState } from "react"
import "../InspectionReportComponent/InspectionReport.css"

const InspectionReport = () => {
  const [quantity, setQuantity] = useState(1)

  const handleQuantityChange = () => {
    if (increment) {
      setQuantity((prev) => prev + 1)
    } else {
      setQuantity((prev) => (prev > 1 ? prev - 1 : 1))
    }
  }

  const handleDownload = () => {
    const printWindow = window.open("", "_blank")
    const reportContent = document.getElementById("inspection-report-content")

    if (printWindow && reportContent) {
      let multipleReports = ""

      // Generate multiple copies based on quantity
      for (let i = 0; i < quantity; i++) {
        multipleReports += reportContent.innerHTML
        if (i < quantity - 1) {
          multipleReports += '<div style="page-break-after: always;"></div>'
        }
      }

      printWindow.document.write(`
        <html>
          <head>
            <title>Final Inspection Report</title>
            <style>
              * { margin: 0; padding: 0; box-sizing: border-box; }
              body { font-family: Arial, sans-serif; font-size: 10px; line-height: 1.2; }
              table { border-collapse: collapse; width: 100%; margin-bottom: 8px; }
              th, td { border: 1px solid #000; padding: 3px 4px; text-align: left; font-size: 9px; }
              .header-title { text-align: center; font-weight: bold; font-size: 12px; margin-bottom: 8px; text-decoration: underline; }
              .contractor-name { text-align: center; font-weight: bold; margin-bottom: 10px; font-size: 10px; }
              .stage-header { text-align: center; font-weight: bold; text-decoration: underline; font-size: 9px; margin: 8px 0 4px 0; }
              .label-cell { font-weight: bold; }
              th { font-weight: bold; text-align: center; }
              @page { margin: 0.5in; }
              @media print { body { margin: 0; } }
            </style>
          </head>
          <body>
            ${multipleReports}
          </body>
        </html>
      `)
      printWindow.document.close()
      printWindow.print()
    }
  }

  return (
    <div className="inspection-report-container">
      <div className="control-panel">
         
        <button className="download-btn" onClick={handleDownload}>
          Download Report
        </button>
      </div>

      <div className="report-wrapper">
        <div id="inspection-report-content" className="report-content">
          {/* Header Section */}
          <div className="header-title">FINAL INSPECTION REPORT</div>
          <div className="contractor-name">CONTRACTOR: </div>

          {/* Project Information Table */}
          <table className="project-info-table">
            <tbody>
              <tr>
                <td className="label-cell">PROJECT:</td>
                <td className="value-cell"></td>
                <td className="label-cell">Manually entry no label :</td>
                <td className="value-cell"></td>
                <td className="label-cell">DATE :</td>
                <td className="value-cell"></td>
              </tr>
              <tr>
                <td className="label-cell">DRAWING No :</td>
                <td className="value-cell"></td>
                  <td className="label-cell">AS PER DRG QTY:</td>
                <td className="value-cell"></td>
                <td className="label-cell">REV :</td>
                <td className="value-cell"></td>
              </tr>
              <tr>
                <td className="label-cell">LOCATION :</td>
                <td className="value-cell"></td>
                
                  <td className="label-cell">Drg Mark Wgt</td>
                <td className="value-cell"></td>
                <td className="label-cell">Mark No :</td>
                <td className="value-cell"></td>
              </tr>
              <tr>
                <td className="label-cell">WEIGHT'S ARE AS PER ( Kg's)</td>
                <td className="label-cell" style={{color:'#ffffff'}}>Drg Mark Wgt</td>
                <td className="value-cell"></td>
                <td className="label-cell">Additional / Less in Weight</td>
                <td className="value-cell"></td>
                <td className="label-cell">PREVIOUS CLEARED QTY:</td>
              </tr>
              <tr>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td className="label-cell">OFFERED QTY:-</td>
                <td className="value-cell"></td>
              </tr>
              <tr>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td className="label-cell">CUMULATIVE QTY CLEARED:-</td>
                <td className="value-cell"></td>
              </tr>
              <tr>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td className="label-cell">Total As made</td>
                <td className="value-cell"></td>
              </tr>
            </tbody>
          </table>

          {/* Stage 1 Table */}
          <div className="stage-header">STAGE - 1</div>
          <table className="stage-table">
            <thead>
              <tr>
                <th>SL NO.</th>
                <th>SECTION / DESCRIPTION</th>
                <th>REQUIRED DIMENSION IN MM</th>
                <th>ACTUAL DIMENSION IN MM</th>
                <th colspan="2">CHANGE OF SECTION : YES / NO</th>
              </tr>
              <tr>
                <th></th>
                <th></th>
                <th></th>
                <th></th>
                <th>AS PER DRG</th>
                <th>SECTION USED</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
              
                <td></td>
                 <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td>2</td>
             
                <td></td>
                 <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td>3</td>
               
                <td></td>
                 <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
              <tr>
                <td>4</td>
                
                
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
              </tr>
              <tr>
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
              </tr>
              <tr>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            </tbody>
          </table>

          {/* Stage 2 */}
          <div className="stage-header">STAGE-2</div>
          <table className="stage-table">
            <tbody>
              <tr>
                <td rowspan="3" className="label-cell">
                  CHANGE OF SECTIONS: YES/NO
                </td>
                <td className="label-cell">DESIGN / C.S. APPROVAL</td>
                <td className="label-cell">DRG REV NO:</td>
                <td className="label-cell">C.S. APPROVAL NO / DATE :</td>
              </tr>
              <tr>
                <td className="label-cell">SECTION AS PER DRG:</td>
                <td></td>
                <td className="label-cell">SECTION USED :</td>
              </tr>
              <tr>
                <td className="label-cell">DRG WT :</td>
                <td className="label-cell">ACTUAL WT:</td>
                <td className="label-cell">DIFF OF WT:</td>
              </tr>
            </tbody>
          </table>

          {/* Stage 3 */}
          <div className="stage-header">STAGE - 3</div>
          <table className="stage-table">
            <tbody>
              <tr>
                <td rowspan="2" className="label-cell">
                  WELDING
                </td>
                <td className="label-cell">FILLET SIZE</td>
                <td className="label-cell">AS PER DRG :</td>
                <td className="label-cell">ACTUAL:</td>
              </tr>
              <tr>
                <td className="label-cell">BUTT WELD</td>
                <td className="label-cell">AS PER DRG :</td>
                <td className="label-cell">ACTUAL:</td>
              </tr>
            </tbody>
          </table>

          {/* Stage 4 */}
          <div className="stage-header">STAGE - 4</div>
          <table className="stage-table">
            <tbody>
              <tr>
                <td className="label-cell">FINISHING</td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            </tbody>
          </table>

          {/* Stage 5 */}
          <div className="stage-header">STAGE - 5</div>
          <table className="stage-table">
            <tbody>
              <tr>
                <td className="label-cell">NDT: APPLICABLE/NOT APPLICABLE</td>
                <td className="label-cell">DP/UT/RT/PHASED ARRAY/MPT</td>
                <td className="label-cell">REPORT NO:</td>
                <td></td>
              </tr>
            </tbody>
          </table>

          {/* Stage 6 */}
          <div className="stage-header">STAGE - 6</div>
          <table className="stage-table">
            <tbody>
              <tr>
                <td className="label-cell">SURFACE CLEANING</td>
                <td className="label-cell">AS PER SPECN/P.O :</td>
                <td></td>
                <td className="label-cell">ACTUAL :</td>
              </tr>
            </tbody>
          </table>

          {/* Stage 7 - Painting */}
          <div className="stage-header">STAGE - 7</div>
          <div className="stage-header">PAINTING</div>
          <table className="stage-table">
            <tbody>
              <tr>
                <td className="label-cell">
                  As per Spicification
                  <br />
                  1st coat ( ) Micron
                </td>
                <td className="label-cell">As per Spicification 2nd coat ( ) Micron</td>
                <td className="label-cell">As per Spicification 3rd coat ( ) Micron</td>
                <td className="label-cell">
                  As per Spicification 4th coat
                  <br />( ) Micron
                </td>
                <td className="label-cell">Total DFT ( ) Micron</td>
              </tr>
              <tr>
                <td className="label-cell">
                  1 st coat
                  <br />
                  Acutal ( ) Micron
                </td>
                <td className="label-cell">2nd coat Acutal ( ) Micron</td>
                <td className="label-cell">3rd coat Acutal ( ) Micron</td>
                <td className="label-cell">
                  4th coat Acutal ( )<br />
                  Micron
                </td>
                <td className="label-cell">Acutal DFT ( ) Micron</td>
              </tr>
            </tbody>
          </table>

          {/* Bottom sections */}
          <table className="bottom-sections">
            <tbody>
              <tr>
                <td className="label-cell">1) DIMENSIONS:</td>
                <td className="label-cell">2) WELDING :</td>
                <td className="label-cell">3) FINISHING :</td>
                <td className="label-cell">4) PAINTING :</td>
              </tr>
            </tbody>
          </table>

          {/* Remarks and Conclusion */}
          <table className="remarks-table">
            <tbody>
              <tr>
                <td className="label-cell remarks-cell">REMARKS :</td>
              </tr>
              <tr>
                <td className="label-cell conclusion-cell">CONCLUSION :</td>
              </tr>
            </tbody>
          </table>

          {/* Signature Section */}
          <table className="signature-table">
            <thead>
              <tr>
                <th>SITE ENGINEER</th>
                <th>INTERNAL QC INCHARGE</th>
                <th>TPI</th>
                <th>JSW</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="label-cell">DATE :</td>
                <td className="label-cell">DATE :</td>
                <td className="label-cell">DATE :</td>
                <td className="label-cell">DATE :</td>
              </tr>
              <tr>
                <td className="label-cell">NAME:</td>
                <td className="label-cell">NAME:</td>
                <td className="label-cell">NAME:</td>
                <td className="label-cell">NAME:</td>
              </tr>
              <tr>
                <td className="label-cell">SIGNATURE :</td>
                <td className="label-cell">SIGNATURE :</td>
                <td className="label-cell">SIGNATURE :</td>
                <td className="label-cell">SIGNATURE :</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default InspectionReport;
