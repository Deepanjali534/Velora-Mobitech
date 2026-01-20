import { Distance } from './distanceCalculator';

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
  // Build list of pickup points
  const pickups = employees.map(e => ({
    lat: e.pickup_lat,
    lng: e.pickup_lng,
    user_id: e.user_id,
    type: 'pickup'
  }));

  const drops = employees.map(e => ({
    lat: e.dest_lat,
    lng: e.dest_lng,
    user_id: e.user_id,
    type: 'drop'
  }));

  // For brute force: if ≤5 employees, try all permutations
  // Otherwise use nearest neighbor
  if (employees.length <= 5) {
    const allPerms = permutations(pickups);
    let bestRoute = null;
    let bestDist = Infinity;

    for (const perm of allPerms) {
      const route = [vehicleStart, ...perm, ...drops];
      const dist = routeDistance(route);
      if (dist < bestDist) {
        bestDist = dist;
        bestRoute = route;
      }
    }
    return { route: bestRoute, distance: bestDist };
  } else {
    // Nearest neighbor fallback
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

export default { findBestRoute, routeDistance };
