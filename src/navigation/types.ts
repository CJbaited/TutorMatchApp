export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  SignUp: undefined;
  RoleSelection: undefined;
  SubjectSelection: { role: string; name: string };
  AreaSelection: { role: string; name: string; subject: string[] };
  FormatSelection: { role: string; name: string; subject: string[]; area: string };
  LocationSelection: { role: string; name: string; subject: string[]; area: string; format: string };
  FrequencySelection: { role: string; name: string; subject: string[]; area: string; format: string; location?: string };
  DurationSelection: { role: string; name: string; subject: string[]; area: string; format: string; location?: string; frequency: string };
  RegistrationComplete: { role: string };
  Home: { role: string };
  DevHome: undefined;
  TutorProfile: {
    tutor: {
      id: string;
      user_id: string;
      name: string;
      image_url: string;
      affiliation: string;
      specialization: string[];
      rating: number;
      reviews: number;
      price: number;
    };
  };
  Chat: {
    conversationId: string;
    participantId: string;
    participantName: string;
  };
  TutorDashboard: undefined;
  MainApp: undefined;
  StudentProfile: {
    studentId: string;
  };
};