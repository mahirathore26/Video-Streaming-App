import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    user: null,
    isAuthenticated: false,
};

const authSlice = createSlice({
    name: "auth",

    initialState,

    reducers: {
        loginSuccess: (state, action) => {
            state.user = action.payload;
            state.isAuthenticated = true;
        },

        logoutSuccess: (state) => {
            state.user = null;
            state.isAuthenticated = false;
        },

        updateUser: (state, action) => {
            if (state.user) {
                state.user = { ...state.user, ...action.payload };
            }
        },
    },
});

export const { loginSuccess, logoutSuccess, updateUser } =
    authSlice.actions;

export default authSlice.reducer;