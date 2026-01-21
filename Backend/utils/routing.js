// FIX: Import the default object, then extract Distance from it
import distanceUtils from './distanceCalculator.js';
const { Distance } = distanceUtils;

// Generate all permutations (for small arrays only!)
function permutations(arr) {
  if (arr.length <= 1) return [arr];
  const result = [];
  for (let i = 0; i < arr.length; i++) {
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
    for (const perm of permutations(rest)) {
      result.push([arr[i], ...perm]);
    }
  }
  return result;
}

// Calculate total route distance
function routeDistance(points) {
  let total = 0;
  for (let i = 0; i < points.length - 1; i++) {
    total += Distance(
      points[i].lat, points[i].lng,
      points[i + 1].lat, points[i + 1].lng
    );
  }
  return total;
}

// Find best route for a vehicle
function findBestRoute(vehicleStart, employees) {
  // 1. Map pickups using CORRECT CSV headers
  const pickups = employees.map(e => ({
    lat: e.pickup_lat,
    lng: e.pickup_lng,
    user_id: e.employee_id, 
    type: 'pickup'
  }));

  // 2. Map drops using CORRECT CSV headers
  const drops = employees.map(e => ({
    lat: e.drop_lat,       
    lng: e.drop_lng,       
    user_id: e.employee_id,
    type: 'drop'
  }));

  // SAFETY CHECK: If employees <= 5, use Brute Force Permutation
  if (employees.length <= 5) {
    const allPerms = permutations(pickups);
    let bestRoute = null;
    let bestDist = Infinity;

    for (const perm of allPerms) {
      // Logic: Start -> Pick everyone up (permuted) -> Drop everyone off (in order)
      const route = [vehicleStart, ...perm, ...drops];
      const dist = routeDistance(route);
      
      // Check for isNaN to prevent failures
      if (!isNaN(dist) && dist < bestDist) {
        bestDist = dist;
        bestRoute = route;
      }
    }
    
    // Fallback if math fails (NaN protection)
    return { 
        route: bestRoute || [vehicleStart, ...pickups, ...drops], 
        distance: bestDist === Infinity ? 0 : bestDist 
    };
  } else {
    // Fallback for large groups: Nearest Neighbor
    return nearestNeighborRoute(vehicleStart, [...pickups, ...drops]);
  }
}

function nearestNeighborRoute(start, points) {
  const route = [start];
  const remaining = [...points];
  let current = start;

  while (remaining.length > 0) {
    let nearestIdx = 0;
    let nearestDist = Infinity;
    
    for (let i = 0; i < remaining.length; i++) {
      const d = Distance(current.lat, current.lng, remaining[i].lat, remaining[i].lng);
      if (d < nearestDist) {
        nearestDist = d;
        nearestIdx = i;
      }
    }
    
    current = remaining.splice(nearestIdx, 1)[0];
    route.push(current);
  }

  return { route, distance: routeDistance(route) };
}

// Export as an object so the Controller can use routingUtils.findBestRoute
export default { findBestRoute, routeDistance };