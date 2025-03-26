import { Session } from 'express-session';

declare global {
  namespace Express {
    interface User {
      id: string;
      name: string;
      email: string;
      linkedInId?: string;
      linkedInAccessToken?: string;
      role: string;
    }

    interface Request {
      user?: User;
      session: Session & {
        codeVerifier?: string;
        state?: string;
      }
    }
  }
} 