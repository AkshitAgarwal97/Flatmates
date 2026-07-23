import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI, extractResponseData } from '../../services/api';

interface PasswordResetState {
    loading: boolean;
    error: string | null;
    step: 'email' | 'otp' | 'password' | 'success';
    email: string | null;
    message: string | null;
}

const initialState: PasswordResetState = {
    loading: false,
    error: null,
    step: 'email',
    email: null,
    message: null
};

// Send OTP to email
export const sendOTP = createAsyncThunk(
    'passwordReset/sendOTP',
    async (email: string, { rejectWithValue }) => {
        try {
            const res = await authAPI.forgotPassword(email);
            // Support both old generic standard response and the new { success: true, data: ... }
            return { email, message: extractResponseData(res).message };
        } catch (err: any) {
            return rejectWithValue(
                err.response?.data?.errors?.[0]?.msg ||
                err.response?.data?.msg ||
                'Failed to send OTP'
            );
        }
    }
);

// Verify OTP
export const verifyOTP = createAsyncThunk(
    'passwordReset/verifyOTP',
    async ({ email, otp }: { email: string; otp: string }, { rejectWithValue }) => {
        try {
            const res = await authAPI.verifyOtp(email, otp);
            return extractResponseData(res).message;
        } catch (err: any) {
            return rejectWithValue(
                err.response?.data?.errors?.[0]?.msg ||
                err.response?.data?.msg ||
                'Invalid or expired OTP'
            );
        }
    }
);

// Reset password
export const resetPassword = createAsyncThunk(
    'passwordReset/resetPassword',
    async ({ email, otp, password }: { email: string; otp: string; password: string }, { rejectWithValue }) => {
        try {
            const res = await authAPI.resetPassword({ email, otp, password });
            return extractResponseData(res).message;
        } catch (err: any) {
            return rejectWithValue(
                err.response?.data?.errors?.[0]?.msg ||
                err.response?.data?.msg ||
                'Failed to reset password'
            );
        }
    }
);

const passwordResetSlice = createSlice({
    name: 'passwordReset',
    initialState,
    reducers: {
        resetState: (state) => {
            state.loading = false;
            state.error = null;
            state.step = 'email';
            state.email = null;
            state.message = null;
        },
        clearError: (state) => {
            state.error = null;
        }
    },
    extraReducers: (builder) => {
        builder
            // Send OTP
            .addCase(sendOTP.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(sendOTP.fulfilled, (state, action) => {
                state.loading = false;
                state.email = action.payload.email;
                state.message = action.payload.message;
                state.step = 'otp';
            })
            .addCase(sendOTP.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Verify OTP
            .addCase(verifyOTP.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(verifyOTP.fulfilled, (state, action) => {
                state.loading = false;
                state.message = action.payload;
                state.step = 'password';
            })
            .addCase(verifyOTP.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            // Reset password
            .addCase(resetPassword.pending, (state) => {
                state.loading = false;
                state.error = null;
            })
            .addCase(resetPassword.fulfilled, (state, action) => {
                state.loading = false;
                state.message = action.payload;
                state.step = 'success';
            })
            .addCase(resetPassword.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            });
    }
});

export const { resetState, clearError } = passwordResetSlice.actions;
export default passwordResetSlice.reducer;
