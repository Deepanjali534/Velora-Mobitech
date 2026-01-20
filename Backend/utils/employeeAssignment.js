function assignEmployeesToVehicles(employees, vehicles) {
  // Sort employees by priority (higher priority = lower number = first)
  const sortedEmployees = [...employees].sort((a, b) => a.priority_level - b.priority_level);
  
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
      const prefOk = emp.vehicle_preference === 'normal' || v.mode !== '2-wheeler';
      const sharingOk = v.assigned.length < getSharingLimit(emp.sharing_pref);
      return capacityOk && prefOk && sharingOk;
    });

    if (compatible) {
      compatible.assigned.push(emp);
      compatible.remainingCapacity -= 1;
    }
  }

  return vehicleState.filter(v => v.assigned.length > 0);
}

function getSharingLimit(pref) {
  const limits = { single: 1, double: 2, triple: 3 };
  return limits[pref] || 3;
}

export default { assignEmployeesToVehicles };
