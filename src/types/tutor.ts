export interface TutorProfile {
  id: string;
  user_id: string;
  fullName: string;
  bio: string;
  hourlyRate: number;
  subjects: string[];
  education: string;
  experience: string;
  rating: number;
  totalStudents: number;
  created_at: string;
  updated_at: string;
}

export interface TutorSchedule {
  id: string;
  tutor_id: string;
  student_id: string;
  subject: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  created_at: string;
}

export interface TutorMessage {
  id: string;
  tutor_id: string;
  student_id: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface TutorStats {
  weeklyEarnings: number;
  totalStudents: number;
  upcomingLessons: number;
  rating: number;
  totalSessions: number;
  completionRate: number;
}
