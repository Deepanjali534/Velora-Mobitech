import React from 'react';
import * as XLSX from 'xlsx';

function FileUpload({ onDataUpload }) {
  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const wb = XLSX.read(bstr, { type: 'binary' });

      const fullTestData = {
        employees: XLSX.utils.sheet_to_json(wb.Sheets['employees']),
        vehicles: XLSX.utils.sheet_to_json(wb.Sheets['vehicles']),
        metadata: XLSX.utils.sheet_to_json(wb.Sheets['metadata']),
        baseline: XLSX.utils.sheet_to_json(wb.Sheets['baseline'])
      };

      if (fullTestData.employees.length > 0) {
        onDataUpload(fullTestData);
      } else {
        alert("Invalid file structure.");
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="input-field-wrapper">
      <label className="input-label" style={{ color: 'var(--primary-blue)', fontSize: '0.8rem' }}>
        INPUT THE FILE
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
    </div>
  );
}

export default FileUpload;