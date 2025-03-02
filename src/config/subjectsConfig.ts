export const subjects = [
  'Mathematics',
  'English',
  'Physics',
  'Chemistry',
  'Biology',
  'Chinese Language',
  'Chinese Literature',
  'Geography',
  'History',
  'Civics',
  'Programming',
  'Business Studies',
  'Japanese Language',
  'Korean Language',
  'Art & Design',
  'Music Theory',
  'Test Preparation',
  'Supplementary'
];

export const subjectAreas = {
  Mathematics: [
    "Algebra",
    "Calculus",
    "Geometry",
    "Statistics",
    "Trigonometry",
    "Number Theory",
    "Discrete Mathematics",
    "Linear Algebra"
  ],
  English: [
    "Grammar",
    "Vocabulary",
    "Reading Comprehension",
    "Writing",
    "Speaking",
    "Listening",
    "Business English",
    "Academic Writing"
  ],
  Physics: [
    "Mechanics",
    "Electromagnetism",
    "Quantum Physics",
    "Thermodynamics",
    "Optics",
    "Modern Physics",
    "Applied Physics"
  ],
  Chemistry: [
    "Organic Chemistry",
    "Inorganic Chemistry",
    "Physical Chemistry",
    "Analytical Chemistry",
    "Biochemistry",
    "Industrial Chemistry"
  ],
  Biology: [
    "Anatomy",
    "Botany",
    "Zoology",
    "Genetics",
    "Microbiology",
    "Ecology",
    "Cell Biology",
    "Evolution"
  ],
  "Chinese Language": [
    "Literature",
    "Composition",
    "Classical Chinese",
    "Modern Chinese",
    "Reading",
    "Writing",
    "Speaking",
    "Grammar"
  ],
  "Chinese Literature": [
    "Poetry",
    "Classical Essays",
    "Modern Literature",
    "Literary Analysis",
    "Composition Writing",
    "Classical Texts",
    "Contemporary Literature"
  ],
  Geography: [
    "Physical Geography",
    "Human Geography",
    "Taiwan Geography",
    "World Geography",
    "Environmental Studies",
    "Economic Geography",
    "Urban Geography"
  ],
  History: [
    "Taiwan History",
    "Chinese History",
    "World History",
    "Modern History",
    "Historical Analysis",
    "Ancient Civilizations",
    "Contemporary History"
  ],
  Civics: [
    "Government",
    "Economics",
    "Society",
    "Law",
    "Ethics",
    "Citizenship",
    "International Relations"
  ],
  Programming: [
    "Web Development",
    "App Development",
    "Python",
    "Java",
    "Scratch",
    "JavaScript",
    "Database",
    "Algorithms"
  ],
  "Business Studies": [
    "Accounting",
    "Marketing",
    "Management",
    "Economics",
    "Business English",
    "Finance",
    "International Business"
  ],
  "Japanese Language": [
    "JLPT N5",
    "JLPT N4",
    "JLPT N3",
    "JLPT N2",
    "JLPT N1",
    "Conversation",
    "Business Japanese",
    "Reading and Writing"
  ],
  "Korean Language": [
    "TOPIK I",
    "TOPIK II",
    "Beginner",
    "Intermediate",
    "Advanced",
    "Conversation",
    "Reading and Writing",
    "Business Korean"
  ],
  "Art & Design": [
    "Drawing",
    "Painting",
    "Digital Art",
    "Graphic Design",
    "Art History",
    "Sculpture",
    "Photography"
  ],
  "Music Theory": [
    "Basic Theory",
    "Harmony",
    "Composition",
    "Ear Training",
    "Music History",
    "Instrument Training",
    "Music Analysis"
  ],
  "Test Preparation": [
    "GSAT",
    "AST",
    "TOEFL",
    "IELTS",
    "TOEIC",
    "SAT",
    "ACT",
    "TOCFL",
    "JLPT",
    "TOPIK",
    "University Entrance Exam",
    "Exam Strategies",
    "Time Management",
    "Problem Solving"
  ],
  Supplementary: [
    "Coding",
    "Music",
    "Art",
    "Public Speaking",
    "Study Skills",
    "Research Methods",
    "Critical Thinking",
    "Project Management"
  ]
} as const;

export type SubjectType = keyof typeof subjectAreas;
export type AreaType<T extends SubjectType> = typeof subjectAreas[T][number];