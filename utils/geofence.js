const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; // Jari-jari bumi dalam meter
    const toRad = (value) => (value * Math.PI) / 180;
  
    // Ubah koordinat ke Radian (pengganti φ1, φ2)
    const lat1Rad = toRad(lat1);
    const lat2Rad = toRad(lat2);
  
    // Hitung selisih koordinat (pengganti Δφ, Δλ)
    const deltaLat = toRad(lat2 - lat1);
    const deltaLon = toRad(lon2 - lon1);
  
    // Rumus Haversine (a = square of half the chord length)
    const a = Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
              Math.cos(lat1Rad) * Math.cos(lat2Rad) *
              Math.sin(deltaLon / 2) * Math.sin(deltaLon / 2);
    
    // Hitung jarak sudut (c = angular distance in radians)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    
    const distance = R * c; // Hasil akhir dalam meter
  
    return distance;
};
  
module.exports = calculateDistance;