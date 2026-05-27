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
  notificationId?: string;
  tasks: Task[];
  focusSessions: FocusSession[];
}

export interface CheckIn {
  id: string;
  date: Date;
  progress: 1 | 2 | 3 | 4 | 5;
  journal: string;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  dueDate: Date;
}

export interface FocusSession {
  id: string;
  date: Date;
  duration: number;
  goalId?: string; // undefined = free session
  label?: string;
}

interface GoalStore {
  goals: Goal[];
  freeSessions: FocusSession[];
  addGoal: (goal: Goal) => void;
  deleteGoal: (id: string) => void;
  completeGoal: (id: string) => void;
  addCheckIn: (goalId: string, checkIn: CheckIn) => void;
  updateGoal: (id: string, data: Partial<Goal>) => void;
  addTask: (goalId: string, task: Task) => void;
  toggleTask: (goalId: string, taskId: string) => void;
  deleteTask: (goalId: string, taskId: string) => void;
  addFocusSession: (session: FocusSession) => void;
}

export const useGoalStore = create<GoalStore>()(
  persist(
    (set) => ({
      goals: [],
      freeSessions: [],
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
      updateGoal: (id, data) =>
        set((state) => ({
          goals: state.goals.map((g) => (g.id === id ? { ...g, ...data } : g)),
        })),
      addTask: (goalId, task) =>
        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === goalId ? { ...g, tasks: [...g.tasks, task] } : g
          ),
        })),
      toggleTask: (goalId, taskId) =>
        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === goalId
              ? {
                  ...g,
                  tasks: g.tasks.map((t) =>
                    t.id === taskId ? { ...t, completed: !t.completed } : t
                  ),
                }
              : g
          ),
        })),
      deleteTask: (goalId, taskId) =>
        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === goalId
              ? { ...g, tasks: g.tasks.filter((t) => t.id !== taskId) }
              : g
          ),
        })),
      addFocusSession: (session) =>
        set((state) => {
          if (session.goalId) {
            return {
              goals: state.goals.map((g) =>
                g.id === session.goalId
                  ? {
                      ...g,
                      focusSessions: [...(g.focusSessions ?? []), session],
                    }
                  : g
              ),
            };
          }
          return { freeSessions: [...state.freeSessions, session] };
        }),
    }),
    {
      name: "goal-storage",
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
