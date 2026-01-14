import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../store';

const selectPropertyState = (state: RootState) => state.property;

export const selectAllProperties = createSelector(
    [selectPropertyState],
    (property) => property.properties
);

export const selectCurrentProperty = createSelector(
    [selectPropertyState],
    (property) => property.property
);

export const selectPropertyLoading = createSelector(
    [selectPropertyState],
    (property) => property.loading
);

export const selectPropertyError = createSelector(
    [selectPropertyState],
    (property) => property.error
);

export const selectPropertiesPagination = createSelector(
    [selectPropertyState],
    (property) => property.pagination
);

export const selectSavedProperties = createSelector(
    [selectPropertyState],
    (property) => property.savedProperties
);
