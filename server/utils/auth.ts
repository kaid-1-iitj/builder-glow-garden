import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Request, Response, NextFunction } from 'express';
import User, { IUser } from '../models/User';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface AuthenticatedRequest extends Request {
  user?: IUser;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  societyId?: string;
}

export class AuthUtils {
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  static async comparePassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  static generateToken(payload: JWTPayload): string {
    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
  }

  static verifyToken(token: string): JWTPayload {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  }

  static async authenticateToken(
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

      if (!token) {
        res.status(401).json({ error: 'Access token required' });
        return;
      }

      const decoded = AuthUtils.verifyToken(token);
      const user = await User.findById(decoded.userId).populate('societyId');

      if (!user) {
        res.status(401).json({ error: 'Invalid token' });
        return;
      }

      // Update last login
      user.lastLogin = new Date();
      await user.save();

      req.user = user;
      next();
    } catch (error) {
      res.status(403).json({ error: 'Invalid or expired token' });
    }
  }

  static requireRole(roles: string[]) {
    return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
      if (!req.user) {
        res.status(401).json({ error: 'Authentication required' });
        return;
      }

      if (!roles.includes(req.user.role)) {
        res.status(403).json({ error: 'Insufficient permissions' });
        return;
      }

      next();
    };
  }

  static requireSocietyAccess(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Admins can access all societies
    if (req.user.role === 'admin') {
      next();
      return;
    }

    // For society users and agents, check if they have access to the requested society
    const requestedSocietyId = req.params.societyId || req.body.societyId;
    
    if (!req.user.societyId || req.user.societyId.toString() !== requestedSocietyId) {
      res.status(403).json({ error: 'Access denied to this society' });
      return;
    }

    next();
  }

  static requireWritePermission(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    if (!req.user.permissions.canWrite && req.user.role !== 'admin') {
      res.status(403).json({ error: 'Write permission required' });
      return;
    }

    next();
  }
}

export default AuthUtils;
