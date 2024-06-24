import { createSlice } from "@reduxjs/toolkit";
import Utils from "../utils";

export const reducer = createSlice({
  name: "appReducer",
  initialState: {
    user: null,
    isLogged: false,
    openMenu: false,
    loader: false,
    toast: { message: "", open: false, type: "success" },
    timezone: "America/New_York",
  },

  reducers: {
    setUser: (state, { payload }) => {
      state.isLogged = true;
      state.user = payload;
    },
    setTimezone: (state, { payload }) => {
      state.timezone = payload;
    },
    setLogged: (state) => {
      state.isLogged = true;
    },
    toggleMenu: (state) => {
      state.openMenu = !state.openMenu;
    },
    setToast: (state, { payload }) => {
      state.toast = { ...payload, open: true };
    },
    handleLoader: (state, { payload }) => {
      state.loader = payload;
    },
    removeToast: (state, { payload }) => {
      state.toast = { message: "", open: false, type: "success" };
    },
    logoutUser: (state) => {
      state.user = null;
      state.isLogged = false;
    },
  },
});

export const { setLogged, setToast, setUser, logoutUser, handleLoader, removeToast, toggleMenu, setTimezone } = reducer.actions;

export default reducer.reducer;
