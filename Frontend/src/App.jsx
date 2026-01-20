import { useState, useEffect } from "react";
import "./styles/main.css";
import "./styles/Dashboard.css";
import FileUpload from "./components/FileUpload";
import MapView from "./components/MapView";

function App() {

  const [res, setRes] = useState("");
  //Backend Connection
  useEffect(() => {
  const fetchData = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/hello");
      const data = await res.json();
      setRes(data);
    } catch (err) {
      console.error(err);
    }
  };

  fetchData();
}, []);


  const [testCase, setTestCase] = useState({
    employees: [],
    vehicles: [],
    baseline: [],
    metadata: [],
  });

  const [isOptimized, setIsOptimized] = useState(false);
  const [results, setResults] = useState(null);

  const handleDataUpload = (fullData) => {
    setTestCase(fullData);
    setIsOptimized(false);
    setResults(null);
  };

  const handleRunOptimization = () => {
    if (testCase.employees.length === 0) {
      return alert("Please upload the Excel file first!");
    }

    // MOCK BACKEND RESPONSE
    setIsOptimized(true);
    setResults({
      baselineCost: "15,200",
      optimizedCost: "12,450",
      savingsAbs: "4500",
      savingsPct: "18.1",
      assignments: [
        {
          id: "V01",
          type: "EV Sedan",
          employees: 4,
          route: "Route A - Koramangala",
        },
        {
          id: "V02",
          type: "CNG XL",
          employees: 6,
          route: "Route B - Indiranagar",
        },
        {
          id: "V03",
          type: "EV SUV",
          employees: 3,
          route: "Route C - Whitefield",
        },
      ],
    });
  };

  return (
    <div className="dashboard-container">
      <header className="header">
        <div className="logo">
          <h1>
            VELORA <span className="blue-text">MOBITECH</span>
          </h1>
        </div>

        {isOptimized && results && (
          <div className="header-results">
            <div className="header-stat">Baseline: ₹{results.baselineCost}</div>
            <div className="header-stat">
              Optimized: ₹{results.optimizedCost}
            </div>
            <div className="header-stat savings-text">
              Savings: ₹{results.savingsAbs} ({results.savingsPct}%)
            </div>
          </div>
        )}

        <nav>
          <a href="#about" className="nav-link">
            About Project
          </a>
        </nav>
      </header>

      <aside className="sidebar left-panel">
        <div className="input-group">
          <h3>Input Data</h3>
          <div className="inner-div">
            <FileUpload onDataUpload={handleDataUpload} />
          </div>
        </div>

        <div className="action-area">
          <button className="optimize-btn" onClick={handleRunOptimization}>
            {isOptimized ? "Re-Run Optimization" : "Run Optimization"}
          </button>
        </div>
      </aside>

      <main className="map-section">
        <MapView employees={testCase.employees} isOptimized={isOptimized} />
      </main>

      {/* VEHICLE ASSIGNMENTS */}
      {isOptimized && results && (
        <aside className="assignments-sidebar">
          <h3>Vehicle Assignments</h3>
          <div className="vehicle-list">
            {results.assignments.map((veh) => (
              <div key={veh.id} className="vehicle-card">
                <div className="card-header">
                  <span className="veh-id">{veh.id}</span>
                  <span className="veh-type">{veh.type}</span>
                </div>
                <p>
                  <strong>Capacity:</strong> {veh.employees} Pax
                </p>
                <p>
                  <strong>Route:</strong> {veh.route}
                </p>
              </div>
            ))}
          </div>
        </aside>
      )}
    </div>
  );
}

export default App;
