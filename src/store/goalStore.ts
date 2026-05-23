import AsyncStorage from "@react-native-async-storage/async-storage";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
export interface Goal {
  id: string;
  title: string;
  description: string;
  message: string;
  deadline: Date;
  reminder: string;
  reminderInterval?: number;
  createdAt: Date;
  status: "active" | "completed";
  completedAt?: Date;
  checkIns: CheckIn[];
}

export interface CheckIn {
  id: string;
  date: Date;
  progress: 1 | 2 | 3 | 4 | 5;
  journal: string;
}

interface GoalStore {
  goals: Goal[];
  addGoal: (goal: Goal) => void;
  deleteGoal: (id: string) => void;
  completeGoal: (id: string) => void;
  addCheckIn: (goalId: string, checkIn: CheckIn) => void;
}

export const useGoalStore = create<GoalStore>()(
  persist(
    (set) => ({
      goals: [],
      addGoal: (goal) => set((state) => ({ goals: [...state.goals, goal] })),
      deleteGoal: (id) =>
        set((state) => ({ goals: state.goals.filter((g) => g.id !== id) })),
      completeGoal: (id) =>
        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === id
              ? { ...g, status: "completed", completedAt: new Date() }
              : g
          ),
        })),
      addCheckIn: (goalId, checkIn) =>
        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === goalId ? { ...g, checkIns: [...g.checkIns, checkIn] } : g
          ),
        })),
    }),
    {
      name: "goal-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
