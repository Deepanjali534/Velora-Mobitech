function assignEmployeesToVehicles(employees, vehicles) {
  // Sort employees by priority (higher priority = lower number = first)
  // CHANGED: 'priority_level' to 'priority' to match CSV
  const sortedEmployees = [...employees].sort((a, b) => a.priority - b.priority);
  
  // Track remaining capacity per vehicle
  const vehicleState = vehicles.map(v => ({
    ...v,
    assigned: [],
    remainingCapacity: v.capacity
  }));

  for (const emp of sortedEmployees) {
    // Find compatible vehicle
    const compatible = vehicleState.find(v => {
      const capacityOk = v.remainingCapacity >= 1;
      
      // CHANGED: 'mode' to 'vehicle_type' to match CSV
      const prefOk = emp.vehicle_preference === 'normal' || v.vehicle_type !== '2-wheeler';
      
      // CHANGED: 'sharing_pref' to 'sharing_preference' to match CSV
      const sharingOk = v.assigned.length < getSharingLimit(emp.sharing_preference);
      
      return capacityOk && prefOk && sharingOk;
    });

    if (compatible) {
      compatible.assigned.push(emp);
      compatible.remainingCapacity -= 1;
    }
  }

  // Filter out vehicles that have no one assigned
  return vehicleState.filter(v => v.assigned.length > 0);
}

function getSharingLimit(pref) {
  const limits = { single: 1, double: 2, triple: 3 };
  return limits[pref] || 3;
}

export default { assignEmployeesToVehicles };