const jwt = require('jsonwebtoken');

function portalAuthRequired(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Please sign in to continue.' });
  }

  try {
    const token = header.slice(7);
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.role !== 'PORTAL') {
      return res.status(403).json({ error: 'Portal access required.' });
    }
    req.portalUser = payload;
    next();
  } catch {
    return res.status(401).json({ error: 'Session expired. Please sign in again.' });
  }
}

function signPortalToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, name: user.name, role: 'PORTAL' },
    process.env.JWT_SECRET,
    { expiresIn: '30d' }
  );
}

module.exports = { portalAuthRequired, signPortalToken };
