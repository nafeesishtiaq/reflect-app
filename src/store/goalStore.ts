import { supabase } from "@/src/lib/supabase";
import { create } from "zustand";

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
  goalId?: string;
  label?: string;
}

interface GoalStore {
  goals: Goal[];
  freeSessions: FocusSession[];
  fetchGoals: () => Promise<void>;
  addGoal: (goal: Omit<Goal, "id">) => Promise<Goal | null>;
  deleteGoal: (id: string) => Promise<void>;
  completeGoal: (id: string) => Promise<void>;
  addCheckIn: (goalId: string, checkIn: Omit<CheckIn, "id">) => Promise<void>;
  updateGoal: (id: string, data: Partial<Goal>) => Promise<void>;
  addTask: (goalId: string, task: Omit<Task, "id">) => Promise<void>;
  toggleTask: (goalId: string, taskId: string) => Promise<void>;
  deleteTask: (goalId: string, taskId: string) => Promise<void>;
  addFocusSession: (session: Omit<FocusSession, "id">) => Promise<void>;
}

export const useGoalStore = create<GoalStore>()((set) => ({
  goals: [],
  freeSessions: [],

  // Fetches all goals with their related tasks, check_ins, and focus_sessions
  // Called once when the app loads so the store is populated from Supabase
  fetchGoals: async () => {
    const { data, error } = await supabase
      .from("goals")
      .select(`*, tasks(*), check_ins(*), focus_sessions(*)`);
    if (error) console.error("fetchGoals error:", error);
    else set({ goals: data as unknown as Goal[] });
  },

  // Inserts a new goal into Supabase and adds it to local state
  // Returns the saved goal so CreateGoal.tsx can use the real UUID from Supabase
  addGoal: async (goal) => {
    const { data, error } = await supabase
      .from("goals")
      .insert({
        title: goal.title,
        description: goal.description,
        message: goal.message,
        deadline: goal.deadline,
        reminder: goal.reminder,
        reminder_interval: goal.reminderInterval,
        user_id: "temp-user", // replaced with real user id after auth
      })
      .select()
      .single();

    if (error) {
      console.error("addGoal error:", error);
      return null;
    }

    const newGoal = {
      ...data,
      checkIns: [],
      tasks: [],
      focusSessions: [],
    } as unknown as Goal;
    set((state) => ({ goals: [...state.goals, newGoal] }));
    return newGoal;
  },

  // Deletes the goal from Supabase — cascade handles tasks/checkins/sessions automatically
  deleteGoal: async (id) => {
    const { error } = await supabase.from("goals").delete().eq("id", id);
    if (error) console.error("deleteGoal error:", error);
    else set((state) => ({ goals: state.goals.filter((g) => g.id !== id) }));
  },

  // Updates status and completed_at in Supabase, mirrors change in local state
  completeGoal: async (id) => {
    const { error } = await supabase
      .from("goals")
      .update({ status: "completed", completed_at: new Date() })
      .eq("id", id);
    if (error) console.error("completeGoal error:", error);
    else
      set((state) => ({
        goals: state.goals.map((g) =>
          g.id === id
            ? { ...g, status: "completed", completedAt: new Date() }
            : g
        ),
      }));
  },

  // Inserts a check-in row linked to the goal, then updates local state
  addCheckIn: async (goalId, checkIn) => {
    const { data, error } = await supabase
      .from("check_ins")
      .insert({
        goal_id: goalId,
        progress: checkIn.progress,
        journal: checkIn.journal,
      })
      .select()
      .single();
    if (error) console.error("addCheckIn error:", error);
    else
      set((state) => ({
        goals: state.goals.map((g) =>
          g.id === goalId
            ? { ...g, checkIns: [...g.checkIns, data as unknown as CheckIn] }
            : g
        ),
      }));
  },

  // Updates any goal fields in Supabase and mirrors in local state
  updateGoal: async (id, data) => {
    const { error } = await supabase.from("goals").update(data).eq("id", id);
    if (error) console.error("updateGoal error:", error);
    else
      set((state) => ({
        goals: state.goals.map((g) => (g.id === id ? { ...g, ...data } : g)),
      }));
  },

  // Inserts a task linked to the goal, then updates local state
  addTask: async (goalId, task) => {
    const { data, error } = await supabase
      .from("tasks")
      .insert({ goal_id: goalId, title: task.title, due_date: task.dueDate })
      .select()
      .single();
    if (error) console.error("addTask error:", error);
    else
      set((state) => ({
        goals: state.goals.map((g) =>
          g.id === goalId
            ? { ...g, tasks: [...g.tasks, data as unknown as Task] }
            : g
        ),
      }));
  },

  // Reads current completed value from local state, flips it in Supabase and locally
  toggleTask: async (goalId, taskId) => {
    const goal = useGoalStore.getState().goals.find((g) => g.id === goalId);
    const task = goal?.tasks.find((t) => t.id === taskId);
    if (!task) return;

    const { error } = await supabase
      .from("tasks")
      .update({ completed: !task.completed })
      .eq("id", taskId);
    if (error) console.error("toggleTask error:", error);
    else
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
      }));
  },

  // Deletes task from Supabase, removes it from local state
  deleteTask: async (goalId, taskId) => {
    const { error } = await supabase.from("tasks").delete().eq("id", taskId);
    if (error) console.error("deleteTask error:", error);
    else
      set((state) => ({
        goals: state.goals.map((g) =>
          g.id === goalId
            ? { ...g, tasks: g.tasks.filter((t) => t.id !== taskId) }
            : g
        ),
      }));
  },

  // If session has a goalId it belongs to a goal, otherwise it's a free session
  // Inserts into focus_sessions table and updates the right place in local state
  addFocusSession: async (session) => {
    const { data, error } = await supabase
      .from("focus_sessions")
      .insert({
        goal_id: session.goalId ?? null,
        user_id: "temp-user", // replaced with real user id after auth
        duration: session.duration,
        label: session.label,
      })
      .select()
      .single();

    if (error) {
      console.error("addFocusSession error:", error);
      return;
    }

    if (session.goalId) {
      set((state) => ({
        goals: state.goals.map((g) =>
          g.id === session.goalId
            ? {
                ...g,
                focusSessions: [
                  ...(g.focusSessions ?? []),
                  data as unknown as FocusSession,
                ],
              }
            : g
        ),
      }));
    } else {
      set((state) => ({
        freeSessions: [...state.freeSessions, data as unknown as FocusSession],
      }));
    }
  },
}));
