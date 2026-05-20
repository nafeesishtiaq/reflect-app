import { create } from "zustand";

export interface Goal {
  id: string;
  title: string;
  message: string;
  deadline: Date;
  reminder: string;
  createdAt: Date;
}

interface GoalStore {
  goals: Goal[];
  addGoal: (goal: Goal) => void;
  deleteGoal: (id: string) => void;
}

export const useGoalStore = create<GoalStore>((set) => ({
  goals: [],
  addGoal: (goal) => set((state) => ({ goals: [...state.goals, goal] })),
  deleteGoal: (id) =>
    set((state) => ({ goals: state.goals.filter((g) => g.id !== id) })),
}));
