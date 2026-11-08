export interface QuestionOption {
  id: string; // e.g., 'A', 'B', 'C', 'D'
  text: string;
}

export interface Question {
  id: string;
  questionNumber?: number;
  question: string;
  options: QuestionOption[];
  correctOptionId: string;
  explanation?: string;
  markedConfidence?: 'detected_mark' | 'inferred_correct' | 'custom';
}

export interface QuizSet {
  id: string;
  title: string;
  description?: string;
  createdAt: number;
  updatedAt: number;
  questions: Question[];
  bestScore?: {
    score: number;
    total: number;
    percentage: number;
    date: number;
  };
  thumbnail?: string;
  sourceNote?: string;
}

export interface TestConfig {
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  questionCount: number; // 0 = all
  timeLimitMinutes: number; // 0 = unlimited
  mode: 'exam' | 'practice'; // exam: score at end; practice: instant feedback
}

export interface SessionQuestion {
  originalQuestionId: string;
  index: number;
  questionNumber: number;
  question: string;
  options: QuestionOption[];
  correctOptionId: string;
  explanation?: string;
}

export interface TestResultDetail {
  questionIndex: number;
  questionNumber: number;
  question: string;
  options: QuestionOption[];
  userChoice?: string;
  correctChoice: string;
  isCorrect: boolean;
  explanation?: string;
}

export interface TestResult {
  quizSetId: string;
  quizTitle: string;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  unanswered: number;
  scorePercentage: number;
  timeSpentSeconds: number;
  answersDetail: TestResultDetail[];
  date: number;
  mode: 'exam' | 'practice';
}
