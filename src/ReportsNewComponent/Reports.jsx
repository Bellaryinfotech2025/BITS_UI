import React, { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const mockData = [
  {
    attribute1V: "WO-001",
    attribute2V: "Plant A",
    attribute3V: "Dept 1",
    attribute4V: "Loc 1",
    lineId: "L-001",
    drawingNo: "DRG-1234",
    markNo: "M-01",
    markedQty: 10,
    attribute1N: "IT-001",
    sessionCode: "SC-01",
    sessionName: "Section 1",
    totalMarkedWgt: 120,
    width: 100,
    length: 200,
    itemQty: 5,
    itemWeight: 24,
    status: "Billing"
  },
  {
    attribute1V: "WO-002",
    attribute2V: "Plant B",
    attribute3V: "Dept 2",
    attribute4V: "Loc 2",
    lineId: "L-002",
    drawingNo: "DRG-1234",
    markNo: "M-02",
    markedQty: 15,
    attribute1N: "IT-002",
    sessionCode: "SC-02",
    sessionName: "Section 2",
    totalMarkedWgt: 180,
    width: 120,
    length: 210,
    itemQty: 8,
    itemWeight: 22.5,
    status: "Billing"
  }
];

const Reports = () => {
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    setTableData(mockData);
  }, []);

  const handleDownloadPDF = () => {
    if (!tableData.length) {
      alert("No data to download!");
      return;
    }

    const doc = new jsPDF();
    const drawingNo = tableData[0]?.drawingNo || "N/A";
    doc.setFontSize(16);
    doc.text(`Drawing No: ${drawingNo}`, 14, 20);

    const headers = [
      [
        "Work Order",
        "Plant Location",
        "Department",
        "Work Location",
        "Line Number",
        "Drawing No",
        "Mark No",
        "Mark Qty",
        "Item No",
        "Section Code",
        "Section Name",
        "Section Weight",
        "Width",
        "Length",
        "Item Qty",
        "Item Weight",
        "Status"
      ]
    ];

    const rows = tableData.map(row => [
      row.attribute1V || "",
      row.attribute2V || "",
      row.attribute3V || "",
      row.attribute4V || "",
      row.lineId || "",
      row.drawingNo || "",
      row.markNo || "",
      row.markedQty || "",
      row.attribute1N || "",
      row.sessionCode || "",
      row.sessionName || "",
      row.totalMarkedWgt || "",
      row.width || "",
      row.length || "",
      row.itemQty || "",
      row.itemWeight || "",
      row.status || "Billing"
    ]);

    autoTable(doc, {
      startY: 30,
      head: headers,
      body: rows,
      styles: { fontSize: 8 }
    });

    doc.save(`drawing_${drawingNo}_data.pdf`);
  };

  const handleMoveToCompletion = () => {
    alert("Move to Completed clicked!");
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
        <h3 style={{ flex: 1 }}>Reports</h3>
        <button onClick={handleMoveToCompletion} style={{ marginRight: 8 }}>
          Completed
        </button>
        <button onClick={handleDownloadPDF}>Download</button>
      </div>
      <table border="1" cellPadding="8" cellSpacing="0" width="100%">
        <thead>
          <tr>
            <th>Work Order</th>
            <th>Plant Location</th>
            <th>Department</th>
            <th>Work Location</th>
            <th>Line Number</th>
            <th>Drawing No</th>
            <th>Mark No</th>
            <th>Mark Qty</th>
            <th>Item No</th>
            <th>Section Code</th>
            <th>Section Name</th>
            <th>Section Weight</th>
            <th>Width</th>
            <th>Length</th>
            <th>Item Qty</th>
            <th>Item Weight</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((row, idx) => (
            <tr key={idx}>
              <td>{row.attribute1V}</td>
              <td>{row.attribute2V}</td>
              <td>{row.attribute3V}</td>
              <td>{row.attribute4V}</td>
              <td>{row.lineId}</td>
              <td>{row.drawingNo}</td>
              <td>{row.markNo}</td>
              <td>{row.markedQty}</td>
              <td>{row.attribute1N}</td>
              <td>{row.sessionCode}</td>
              <td>{row.sessionName}</td>
              <td>{row.totalMarkedWgt}</td>
              <td>{row.width}</td>
              <td>{row.length}</td>
              <td>{row.itemQty}</td>
              <td>{row.itemWeight}</td>
              <td>{row.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Reports;
