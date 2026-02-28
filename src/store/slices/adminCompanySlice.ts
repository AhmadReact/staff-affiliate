import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface AdminCompanyState {
  selectedCompanyId: string | null;
}

const initialState: AdminCompanyState = {
  selectedCompanyId: null,
};

const adminCompanySlice = createSlice({
  name: "adminCompany",
  initialState,
  reducers: {
    setSelectedCompanyId(state, action: PayloadAction<string | null>) {
      state.selectedCompanyId = action.payload;
    },
    resetSelectedCompanyId(state) {
      state.selectedCompanyId = null;
    },
  },
});

export const { setSelectedCompanyId, resetSelectedCompanyId } =
  adminCompanySlice.actions;

export default adminCompanySlice.reducer;

