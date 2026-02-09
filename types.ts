
export enum UserRole {
  MEMBER = 'MEMBER',
  ADMIN = 'ADMIN'
}

export interface User {
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
}

export interface MeetingRecord {
  id: string;
  date: string;
  agenda: string;
  summary: string;
  transcript: string;
  audioUrl?: string;
  actionPoints: string[];
}

export interface Project {
  id: string;
  userId: string;
  // Added 'mockup' to the union type to support branding assets
  type: 'photo' | 'audio' | 'script' | 'mockup';
  name: string;
  createdAt: string;
  data: string; // Base64 for images/audio, text for scripts
  metadata?: {
    originalName?: string;
    tone?: string;
    productType?: string;
    mimeType?: string;
    background?: string;
  };
}

export interface AnalyticsData {
  activeUsers: number;
  imagesEnhanced: number;
  audioEnhanced: number;
  scriptsGenerated: number;
  voiceUsage: number;
}
