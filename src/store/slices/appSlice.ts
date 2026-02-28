import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface AppState {
  sidebarOpen: boolean;
}

const initialState: AppState = {
  sidebarOpen: false,
};

const appSlice = createSlice({
  name: "app",
  initialState,
  reducers: {
    setSidebarOpen(state, action: PayloadAction<boolean>) {
      state.sidebarOpen = action.payload;
    },
    toggleSidebar(state) {
      state.sidebarOpen = !state.sidebarOpen;
    },
  },
});

export const { setSidebarOpen, toggleSidebar } = appSlice.actions;
export default appSlice.reducer;
