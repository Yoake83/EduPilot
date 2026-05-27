import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface QuestionTypeConfig {
  id: string;
  type: string;
  count: number;
  marks: number;
}

export interface AssignmentFormState {
  title: string;
  subject: string;
  grade: string;
  dueDate: string;
  questionTypes: QuestionTypeConfig[];
  additionalInstructions: string;
  file: File | null;
}

export interface Assignment {
  _id: string;
  title: string;
  subject: string;
  grade: string;
  dueDate: string;
  questionTypes: QuestionTypeConfig[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  jobId?: string;
  result?: GeneratedPaper;
  createdAt: string;
}

export interface GeneratedPaper {
  schoolName: string;
  subject: string;
  grade: string;
  timeAllowed: string;
  totalMarks: number;
  sections: Section[];
}

export interface Section {
  title: string;
  instruction: string;
  questions: Question[];
}

export interface Question {
  id: string;
  text: string;
  difficulty: 'easy' | 'moderate' | 'hard';
  marks: number;
  answerKey?: string;
}

interface AssignmentStore {
  // List
  assignments: Assignment[];
  isLoading: boolean;
  fetchAssignments: () => Promise<void>;
  deleteAssignment: (id: string) => Promise<void>;

  // Create form
  form: AssignmentFormState;
  setForm: (update: Partial<AssignmentFormState>) => void;
  addQuestionType: () => void;
  removeQuestionType: (id: string) => void;
  updateQuestionType: (id: string, update: Partial<QuestionTypeConfig>) => void;
  resetForm: () => void;

  // Generation
  currentAssignment: Assignment | null;
  generationProgress: number;
  setCurrentAssignment: (a: Assignment | null) => void;
  updateAssignmentResult: (id: string, result: GeneratedPaper) => void;
  updateAssignmentStatus: (id: string, status: Assignment['status']) => void;
  setGenerationProgress: (p: number) => void;
}

const defaultForm: AssignmentFormState = {
  title: '',
  subject: '',
  grade: '',
  dueDate: '',
  questionTypes: [
    { id: crypto.randomUUID(), type: 'Multiple Choice Questions', count: 4, marks: 1 },
    { id: crypto.randomUUID(), type: 'Short Questions', count: 5, marks: 2 },
  ],
  additionalInstructions: '',
  file: null,
};

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export const useAssignmentStore = create<AssignmentStore>()(
  devtools((set, get) => ({
    assignments: [],
    isLoading: false,
    currentAssignment: null,
    generationProgress: 0,
    form: { ...defaultForm },

    fetchAssignments: async () => {
      set({ isLoading: true });
      try {
        const res = await fetch(`${API}/api/assignments`);
        const data = await res.json();
        set({ assignments: data.assignments });
      } finally {
        set({ isLoading: false });
      }
    },

    deleteAssignment: async (id) => {
      await fetch(`${API}/api/assignments/${id}`, { method: 'DELETE' });
      set((s) => ({ assignments: s.assignments.filter((a) => a._id !== id) }));
    },

    setForm: (update) => set((s) => ({ form: { ...s.form, ...update } })),

    addQuestionType: () =>
      set((s) => ({
        form: {
          ...s.form,
          questionTypes: [
            ...s.form.questionTypes,
            { id: crypto.randomUUID(), type: '', count: 1, marks: 1 },
          ],
        },
      })),

    removeQuestionType: (id) =>
      set((s) => ({
        form: {
          ...s.form,
          questionTypes: s.form.questionTypes.filter((qt) => qt.id !== id),
        },
      })),

    updateQuestionType: (id, update) =>
      set((s) => ({
        form: {
          ...s.form,
          questionTypes: s.form.questionTypes.map((qt) =>
            qt.id === id ? { ...qt, ...update } : qt
          ),
        },
      })),

    resetForm: () => set({ form: { ...defaultForm } }),

    setCurrentAssignment: (a) => set({ currentAssignment: a, generationProgress: 0 }),

    updateAssignmentResult: (id, result) =>
      set((s) => ({
        assignments: s.assignments.map((a) =>
          a._id === id ? { ...a, status: 'completed', result } : a
        ),
        currentAssignment:
          s.currentAssignment?._id === id
            ? { ...s.currentAssignment, status: 'completed', result }
            : s.currentAssignment,
      })),

    updateAssignmentStatus: (id, status) =>
      set((s) => ({
        assignments: s.assignments.map((a) => (a._id === id ? { ...a, status } : a)),
      })),

    setGenerationProgress: (p) => set({ generationProgress: p }),
  }))
);
