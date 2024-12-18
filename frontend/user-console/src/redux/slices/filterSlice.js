import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  filter: {
    province: null,
    category: null,
    status: null,
    date: null,
    page: 1,
    size: 10,
  },
};

const filterSlice = createSlice({
  name: "filter",
  initialState,
  reducers: {
    setProvince: (state, { payload }) => {
      state.filter = {
        ...state.filter,
        province: payload,
        page: 1
      };
    },
    setCategoryId: (state, { payload }) => {
      state.filter.category = payload;
      state.filter.page = 1;
    },
    setStatus: (state, { payload }) => {
      state.filter.status = payload;
    },
    setDateType: (state, { payload }) => {
      state.filterByDateType = payload;
    },
    setStartDate: (state, { payload }) => {
      state.dateRange.start = payload;
    },
    setEndDate: (state, { payload }) => {
      state.dateRange.end = payload;
    },
    setDate: (state, { payload }) => {
      state.filter.date = payload;
    },
  },
});

export const { setProvince, setCategoryId, setStatus, setDate } =
  filterSlice.actions;
export const filterSelector = (state) => state.filter.filter;
export default filterSlice.reducer;
