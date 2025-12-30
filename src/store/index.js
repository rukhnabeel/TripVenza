import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import applicationsReducer from './slices/applicationsSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        applications: applicationsReducer,
    },
});
