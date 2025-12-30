import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../utils/api';

// Async thunk to fetch applications with filters
export const fetchApplications = createAsyncThunk(
    'applications/fetchAll',
    async (params = {}, { rejectWithValue }) => {
        try {
            const { search, status, country, page, limit } = params;
            const queryParams = new URLSearchParams();
            if (search) queryParams.append('search', search);
            if (status && status !== 'All') queryParams.append('status', status);
            if (country && country !== 'All') queryParams.append('country', country);
            if (page) queryParams.append('page', page);
            if (limit) queryParams.append('limit', limit);

            const { data } = await api.get(`/applications?${queryParams.toString()}`);
            return data;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to fetch applications');
        }
    }
);

// Async thunk to update application status (Admin)
export const updateApplicationStatus = createAsyncThunk(
    'applications/updateStatus',
    async ({ id, status, rejectionReason, visaDocument }, { rejectWithValue }) => {
        try {
            const formData = new FormData();
            formData.append('status', status);
            if (rejectionReason) formData.append('rejectionReason', rejectionReason);
            if (visaDocument) formData.append('visaDocument', visaDocument);

            const config = {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            };

            const { data } = await api.put(`/applications/${id}/status`, formData, config);
            return data.application;
        } catch (error) {
            return rejectWithValue(error.response?.data?.message || 'Failed to update status');
        }
    }
);

const initialState = {
    list: [],
    pagination: {
        currentPage: 1,
        totalPages: 1,
        totalCount: 0
    },
    loading: false,
    error: null,
};

const applicationsSlice = createSlice({
    name: 'applications',
    initialState,
    reducers: {
        clearApplications: (state) => {
            state.list = [];
            state.pagination = { currentPage: 1, totalPages: 1, totalCount: 0 };
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchApplications.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchApplications.fulfilled, (state, action) => {
                state.loading = false;
                // Handle both old array format (just in case) and new object format
                if (Array.isArray(action.payload)) {
                    state.list = action.payload;
                } else {
                    state.list = action.payload.applications;
                    state.pagination = {
                        currentPage: action.payload.currentPage,
                        totalPages: action.payload.totalPages,
                        totalCount: action.payload.totalCount
                    };
                }
            })
            .addCase(fetchApplications.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            // Update Status
            .addCase(updateApplicationStatus.fulfilled, (state, action) => {
                const index = state.list.findIndex(app => app._id === action.payload._id);
                if (index !== -1) {
                    state.list[index] = action.payload;
                }
            });
    },
});

export const { clearApplications } = applicationsSlice.actions;
export default applicationsSlice.reducer;
