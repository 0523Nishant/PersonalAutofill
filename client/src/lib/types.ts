// User data structure
export interface UserData {
  firstName: string;
  lastName: string;
  email: string;
  gender?: string;
  phone?: string;
  streetAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  resumeFile?: string; // Base64 encoded PDF
  coverLetter?: string;
  enablePayment: boolean;
  cardNumber?: string;
  expDate?: string;
  cvv?: string;
  cardholderName?: string;
  
  // Education
  school?: string;
  degree?: string;
  educationStartMonth?: string;
  educationStartYear?: string;
  educationEndMonth?: string;
  educationEndYear?: string;
  
  // Social profiles
  linkedinUrl?: string;
  githubUrl?: string;
}

// Extension settings
export interface Settings {
  enabled: boolean;
  autoFillOnLoad: boolean;
  showFillNotification: boolean;
  fillOnlyEmpty: boolean;
  fillDelay: number;
  mappingProfile: string;
  trackHistory: boolean;
}

// History item for tracking autofill operations
export interface AutofillHistoryItem {
  timestamp: number;
  domain: string;
  filledCount: number;
  status: 'success' | 'partial' | 'error';
  message?: string;
}

// Result of an autofill operation
export interface AutofillResult {
  status: 'success' | 'partial' | 'error';
  filledCount: number;
  failedFields: string[];
  message: string;
}
