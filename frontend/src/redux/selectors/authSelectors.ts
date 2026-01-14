import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';

const selectAuth = (state: RootState) => state.auth;

export const selectUser = createSelector(
    [selectAuth],
    (auth) => auth.user
);

export const selectIsAuthenticated = createSelector(
    [selectAuth],
    (auth) => auth.isAuthenticated
);

export const selectAuthLoading = createSelector(
    [selectAuth],
    (auth) => auth.loading
);

export const selectAuthError = createSelector(
    [selectAuth],
    (auth) => auth.error
);

export const selectNeedsProfileCompletion = createSelector(
    [selectAuth],
    (auth) => auth.needsProfileCompletion
);
