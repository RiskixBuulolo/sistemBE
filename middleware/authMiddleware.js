const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  // 1. Ambil token dari header (Format: Bearer <token>)
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Ambil kata kedua

  if (!token) {
    return res.status(401).json({ message: 'Akses ditolak. Token tidak ditemukan.' });
  }

  try {
    // 2. Verifikasi Token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Simpan data user ke dalam request agar bisa dipakai di controller
    req.user = decoded; 
    
    next(); // Lanjut ke controller
  } catch (error) {
    return res.status(403).json({ message: 'Token tidak valid atau kadaluarsa.' });
  }
};

module.exports = verifyToken;