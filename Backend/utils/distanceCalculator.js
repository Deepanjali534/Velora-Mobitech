function degToRad(deg) {
  return (deg * Math.PI) / 180;
}

function Distance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in km
  const dLat = degToRad(lat2 - lat1);
  const dLng = degToRad(lng2 - lng1);
  
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(degToRad(lat1)) * Math.cos(degToRad(lat2)) *
            Math.sin(dLng / 2) ** 2;
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
}

export default { Distance };
