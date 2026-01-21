import React, { useState } from 'react';
import * as XLSX from 'xlsx';

function FileUpload({ onFilesReady }) {
  const [status, setStatus] = useState("Waiting for file...");
  const [error, setError] = useState(null);

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setStatus("Processing file...");
    setError(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });

        console.log("Sheet Names Found:", wb.SheetNames); // Check your console (F12) if this fails

        // 1. Robust Sheet Search (Case Insensitive)
        const sheetNames = wb.SheetNames;
        
        // Looks for any sheet containing "emp" (e.g., "employees", "Employees", "Emp_Data")
        const empSheetName = sheetNames.find(n => n.toLowerCase().includes('emp')); 
        
        // Looks for any sheet containing "veh" (e.g., "vehicles", "Vehicles", "Fleet")
        const vehSheetName = sheetNames.find(n => n.toLowerCase().includes('veh')); 

        if (!empSheetName || !vehSheetName) {
            throw new Error(`Missing sheets! Found: [${sheetNames.join(", ")}]. Need sheets containing 'emp' and 'veh'.`);
        }

        // 2. Create Separate Virtual Files (Blobs) for Backend
        // The backend expects two distinct Excel files, so we create them here.
        
        // -- Create Demand File (Employees) --
        const demandWB = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(demandWB, wb.Sheets[empSheetName], "employees");
        const demandBlob = writeWorkbookToBlob(demandWB);

        // -- Create Supply File (Vehicles) --
        const supplyWB = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(supplyWB, wb.Sheets[vehSheetName], "vehicles");
        const supplyBlob = writeWorkbookToBlob(supplyWB);

        // 3. Pass ready files up to App.jsx
        setStatus("✓ File processed & split successfully!");
        if (onFilesReady) {
            onFilesReady({ demand: demandBlob, supply: supplyBlob });
        }

      } catch (err) {
        console.error("File Processing Error:", err);
        setError(err.message);
        setStatus("Error processing file");
      }
    };
    reader.readAsBinaryString(file);
  };

  // Helper to convert SheetJS Workbook to Blob
  const writeWorkbookToBlob = (wb) => {
    const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    return new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  };

  return (
    <div className="input-field-wrapper">
      <label className="input-label" style={{ color: 'var(--primary-blue)', fontSize: '0.8rem', fontWeight: 'bold' }}>
        UPLOAD MASTER EXCEL FILE
      </label>
      
      <input 
        type="file" 
        accept=".xlsx, .xls" 
        onChange={handleFile} 
        style={{
          marginTop: '10px',
          background: 'rgba(59, 130, 246, 0.1)',
          border: '1px solid var(--primary-blue)',
          padding: '12px',
          borderRadius: '8px',
          color: 'white',
          width: '100%',
          cursor: 'pointer'
        }}
      />

      <div style={{marginTop: '10px', fontSize: '0.8rem'}}>
        {error ? (
            <span style={{color: '#ef4444'}}>❌ {error}</span>
        ) : (
            <span style={{color: '#10b981'}}>{status}</span>
        )}
      </div>
    </div>
  );
}

export default FileUpload;