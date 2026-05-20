export type Grade = 1 | 2 | 3 | 4 | 5;

export type Subject = "Toán" | "Tiếng Việt" | "Tiếng Anh" | "Tin học";

export type QuestionType = "multiple_choice" | "fill_in_blank" | "drag_drop" | "matching";

export type PracticeMode = "normal" | "semester_review" | "topic_focus" | "mock_exam" | "midterm_review" | "final_review";

export interface PracticeConfig {
  grade: Grade;
  subject: Subject;
  mode: PracticeMode;
  topic?: string;
  count: number;
  difficulty: string;
  duration?: number; // In minutes
}

export interface Question {
  id: string;
  type: QuestionType;
  questionText: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
  image?: string;
  section?: string;
  points?: number;
  readingPassage?: {
    title: string;
    content: string;
  };
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  grade: Grade;
  totalPoints: number;
  badges: string[];
  createdAt: number;
  lastSession?: PracticeConfig;
  membership?: 'regular' | 'diamond';
  role?: 'admin' | 'user';
}

export interface ExamResult {
  id: string;
  userId: string;
  subject: Subject;
  grade: Grade;
  score: number;
  totalQuestions: number;
  correctCount: number;
  timeSpent: number;
  completedAt: number;
}
