const jwt = require('jsonwebtoken');

function authenticate(req, res, next) {
  const auth = req.headers.authorization || '';
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ message: 'Token manquant' });
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { sub, role, email }
    next();
  } catch (e) {
    return res.status(401).json({ message: 'Token invalide' });
  }
}

function authorize(roles = []) {
  const allowed = Array.isArray(roles) ? roles : [roles];
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ message: 'Non authentifié' });
    
    if (allowed.length) {
      // Vérifier le rôle unique (backward compatibility)
      const hasRoleMatch = allowed.includes(req.user.role);
      
      // Vérifier les rôles multiples (nouveau système)
      const hasRolesMatch = req.user.roles && Array.isArray(req.user.roles) 
        ? req.user.roles.some(r => allowed.includes(r))
        : false;
      
      if (!hasRoleMatch && !hasRolesMatch) {
        return res.status(403).json({ message: 'Accès refusé' });
      }
    }
    next();
  };
}

module.exports = { authenticate, authorize };
