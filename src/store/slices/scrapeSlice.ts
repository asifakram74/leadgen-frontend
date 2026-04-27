import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface ScrapeTask {
  id: string;
  status: "pending" | "running" | "completed" | "failed";
  progress: number;
  category: string;
  location: string;
  resultsCount: number;
}

interface ScrapeState {
  tasks: ScrapeTask[];
  currentTask: ScrapeTask | null;
}

const initialState: ScrapeState = {
  tasks: [],
  currentTask: null,
};

const scrapeSlice = createSlice({
  name: "scrape",
  initialState,
  reducers: {
    setTasks: (state, action: PayloadAction<ScrapeTask[]>) => {
      state.tasks = action.payload;
    },
    setCurrentTask: (state, action: PayloadAction<ScrapeTask | null>) => {
      state.currentTask = action.payload;
    },
    updateTaskStatus: (
      state,
      action: PayloadAction<{ id: string; status: ScrapeTask["status"]; progress: number }>
    ) => {
      const task = state.tasks.find((t) => t.id === action.payload.id);
      if (task) {
        task.status = action.payload.status;
        task.progress = action.payload.progress;
      }
      if (state.currentTask?.id === action.payload.id) {
        state.currentTask.status = action.payload.status;
        state.currentTask.progress = action.payload.progress;
      }
    },
  },
});

export const { setTasks, setCurrentTask, updateTaskStatus } = scrapeSlice.actions;
export default scrapeSlice.reducer;
