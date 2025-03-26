import { Request, Response, NextFunction } from 'express';

export const sessionLogger = (req: Request, res: Response, next: NextFunction) => {
  console.log('🔵 [Session] Current state:', {
    sessionID: req.sessionID,
    hasSession: !!req.session,
    sessionContent: req.session
  });
  next();
}; 