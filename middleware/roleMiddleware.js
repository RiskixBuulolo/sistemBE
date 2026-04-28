const checkRole = (allowedRoles) => {
    return (req, res, next) => {
      // req.user berasal dari authMiddleware sebelumnya
      if (!req.user || !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ 
          message: `Akses terlarang! Halaman ini hanya untuk role: ${allowedRoles.join(', ')}` 
        });
      }
      next();
    };
  };
  
  module.exports = checkRole;