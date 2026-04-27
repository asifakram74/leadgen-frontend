import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface UserProfile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  profile_picture_url?: string;
  role: string;
  status: string;
  is_verified: boolean;
  verification_token?: string;
  verification_token_expiry?: string;
  verified_at?: string;
  created_at: string;
  updated_at: string;
}

interface UserState {
  profile: UserProfile | null;
  loading: boolean;
}

const initialState: UserState = {
  profile: null,
  loading: false,
};

import { logout } from "./authSlice";

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setProfile: (state, action: PayloadAction<UserProfile>) => {
      state.profile = action.payload;
    },
    clearProfile: (state) => {
      state.profile = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addCase(logout, (state) => {
      state.profile = null;
    });
  },
});

export const { setProfile, clearProfile, setLoading } = userSlice.actions;
export default userSlice.reducer;
