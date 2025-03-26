export interface Job {
  id: number;
  title: string;
  description: string;
  companyName: string;
  location: string;
  applyLink: string;
}

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
} 