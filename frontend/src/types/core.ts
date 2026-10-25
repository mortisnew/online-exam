
export type UserRole = "admin" | "teacher" | "student";

export interface SchoolSummary {
  id: number;
  name: string;
  logo: string | null;
  created_at: string;
}

export interface School {
  id: number;
  name: string;
  owner: number;
  logo: string | null;
  created_at: string;
  teachers: number[];
}

export interface Classroom {
  id: number;
  name: string;
  teacher: number;
  school: number;
  created_at: string;
  students: number[];
}

export interface Exam {
  id: number;
  classroom: number;
  name: string;
  created_at: string;
}

export type CorrectAnswer = 1 | 2 | 3 | 4;

export interface Question {
  id: number;
  exam: number;
  question: string;
  option_1: string;
  option_2: string;
  option_3: string;
  option_4: string;
  score: string;
  correct_answer: CorrectAnswer;
  created_at: string;
}

export interface ExamAttempt {
  id: number;
  student: number;
  exam: number;
  start_at: string | null;
  end_at: string | null;
  active: boolean;
  total_score: string;
}

export interface AnswerAttempt {
  id: number;
  attempt: number;
  question: number;
  answer: CorrectAnswer;
}

export interface CreateSchoolData {
  name: string;
}

export interface CreateClassroomData {
  name: string;
  school: number;
}

export interface CreateExamData {
  name: string;
  classroom: number;
}

export interface CreateQuestionData {
  exam: number;
  question: string;
  option_1: string;
  option_2: string;
  option_3: string;
  option_4: string;
  score: string;
  correct_answer: CorrectAnswer;
}

export interface AddStudentData {
  user_code: string;
}
