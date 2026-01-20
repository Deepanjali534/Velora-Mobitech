import { parseExcel } from '../utils/excelParser';
import { assignEmployeesToVehicles } from '../utils/employeeAssignment';
import { findBestRoute } from '../utils/routing';
import { Distance } from '../utils/distanceCalculator';

const BASELINE_COST_PER_KM = 15; // Market rate (Ola/Uber avg)

async function runOptimization(demandBuffer, supplyBuffer) {
  // 1. Parse Excel files
  const employees = parseExcel(demandBuffer);
  const vehicles = parseExcel(supplyBuffer);

  // 2. Assign employees to vehicles
  const assignments = assignEmployeesToVehicles(employees, vehicles);

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

    const { route, distance } = findBestRoute(vehicleStart, vehicle.assigned);
    
    const cost = distance * vehicle.cost_per_km;
    const time = (distance / vehicle.avg_speed) * 60; // minutes

    totalDistance += distance;
    totalCost += cost;
    totalTime += time;

    // Build polyline coordinates for frontend
    const polylineCoords = route.map(p => [p.lat, p.lng]);

    vehicleResults.push({
      vehicle_id: vehicle.vehicle_id,
      assigned_users: vehicle.assigned.map(e => e.user_id),
      route_nodes: route,
      polyline_coords: polylineCoords,
      total_distance_km: distance.toFixed(2),
      cost: cost.toFixed(2),
      travel_time_mins: time.toFixed(1)
    });
  }

  // 4. Calculate baseline cost (each employee travels alone)
  let baselineCost = 0;
  for (const emp of employees) {
    const directDist = Distance(
      emp.pickup_lat, emp.pickup_lng,
      emp.dest_lat, emp.dest_lng
    );
    baselineCost += directDist * BASELINE_COST_PER_KM;
  }

  // 5. Build response
  const savings = baselineCost - totalCost;
  const savingsPercent = ((savings / baselineCost) * 100).toFixed(1);

  return {
    vehicles: vehicleResults,
    metrics: {
      total_distance_km: totalDistance.toFixed(2),
      total_operational_cost: totalCost.toFixed(2),
      baseline_cost: baselineCost.toFixed(2),
      savings_absolute: savings.toFixed(2),
      savings_percent: savingsPercent,
      total_travel_time_mins: totalTime.toFixed(1)
    },
    employee_count: employees.length,
    vehicle_count: assignments.length
  };
}

export default { runOptimization };
