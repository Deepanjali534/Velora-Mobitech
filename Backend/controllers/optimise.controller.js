import excelParser from '../utils/excelParser.js';
import assignmentUtils from '../utils/employeeAssignment.js';
import routingUtils from '../utils/routing.js'; 
import distanceUtils from '../utils/distanceCalculator.js';

const BASELINE_COST_PER_KM = 15; 

async function runOptimization(demandBuffer, supplyBuffer) {
  // 1. Parse Excel files
  const employees = excelParser.parseExcel(demandBuffer);
  const vehicles = excelParser.parseExcel(supplyBuffer);

  // 2. Assign employees to vehicles
  const assignments = assignmentUtils.assignEmployeesToVehicles(employees, vehicles);

  // 3. Generate routes for each vehicle
  const vehicleResults = [];
  let totalDistance = 0;
  let totalCost = 0;
  let totalTime = 0;

  for (const vehicle of assignments) {
    const vehicleStart = {
      lat: vehicle.current_lat,
      lng: vehicle.current_lng
    };

    // Calculate best route
    const { route, distance } = routingUtils.findBestRoute(vehicleStart, vehicle.assigned);
    
    // FIX: Ensure cost_per_km exists, default to 10 if missing
    const costRate = vehicle.cost_per_km || 10;
    const cost = distance * costRate;

    // CRITICAL FIX: Use 'avg_speed_kmph' (from CSV) instead of 'avg_speed'
    // Also adding a fallback (|| 30) prevents NaN if data is missing
    const speed = vehicle.avg_speed_kmph || 30; 
    const time = (distance / speed) * 60; 

    totalDistance += distance;
    totalCost += cost;
    totalTime += time;

    const polylineCoords = route.map(p => [p.lat, p.lng]);

    vehicleResults.push({
      vehicle_id: vehicle.vehicle_id,
      assigned_users: vehicle.assigned.map(e => e.employee_id),
      route_nodes: route,
      polyline_coords: polylineCoords,
      total_distance_km: distance.toFixed(2),
      cost: cost.toFixed(2),
      travel_time_mins: time.toFixed(1)
    });
  }

  // 4. Calculate baseline cost
  let baselineCost = 0;
  for (const emp of employees) {
    const directDist = distanceUtils.Distance(
      emp.pickup_lat, emp.pickup_lng,
      emp.drop_lat, emp.drop_lng
    );
    baselineCost += directDist * BASELINE_COST_PER_KM;
  }

  // 5. Build response
  const savings = baselineCost - totalCost;
  const savingsPercent = baselineCost > 0 ? ((savings / baselineCost) * 100).toFixed(1) : "0.0";

  return {
    vehicles: vehicleResults,
    metrics: {
      total_distance_km: totalDistance.toFixed(2),
      total_travel_time_mins: totalTime.toFixed(1),
      total_operational_cost: totalCost.toFixed(2),
      baseline_cost: baselineCost.toFixed(2),
      savings_absolute: savings.toFixed(2),
      savings_percent: savingsPercent
    }
  };
}

export { runOptimization };