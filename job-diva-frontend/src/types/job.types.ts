export interface JobFormData {
  title: string;
  description: string;
  companyName: string;
  location: string;
  applyLink: string;
}

export interface JobState {
  loading: boolean;
  error: string | null;
  success: boolean;
  linkedInStatus: LinkedInStatus;
}
interface LinkedInStatus {
  isConnected: boolean;
  linkedInId: string | null;
  name: string | null;
}