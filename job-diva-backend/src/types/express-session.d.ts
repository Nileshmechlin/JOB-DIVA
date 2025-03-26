import 'express-session';

interface LinkedInOAuthState {
  state: string;
  codeVerifier: string;
  timestamp: number;
}

declare module 'express-session' {
  interface SessionData {
    linkedin_oauth_states?: {
      [key: string]: LinkedInOAuthState;
    };
    codeVerifier?: string;
    state?: string;
  }
} 