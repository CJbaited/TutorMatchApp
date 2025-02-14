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
      id: number;
      name: string;
      subject: string;
      rating: number;
      price: number;
      image: any;
    };
  };
  Chat: {
    conversationId: number;
    participantId: number;
  };
  TutorDashboard: undefined;
  MainApp: undefined;
  StudentProfile: {
    studentId: string;
  };
};