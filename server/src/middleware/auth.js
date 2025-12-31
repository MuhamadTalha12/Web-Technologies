import { unauthorized, forbidden } from '../lib/http-error.js';
import { verifyToken } from '../lib/auth.js';
import { User } from '../models/User.js';

export async function requireAuth(req, _res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;

    if (!token) return next(unauthorized('Missing bearer token'));

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.sub).lean();

    if (!user) return next(unauthorized('User not found'));

    req.auth = {
      userId: String(user._id),
      roles: user.roles || [],
      email: user.email,
    };

    return next();
  } catch {
    return next(unauthorized('Invalid or expired token'));
  }
}

export function requireRole(...roles) {
  return (req, _res, next) => {
    const current = req.auth?.roles || [];
    const ok = roles.some((r) => current.includes(r));
    if (!ok) return next(forbidden('Insufficient permissions'));
    return next();
  };
}
