import propertyReducer, { clearProperty, clearError, setPage, getProperties } from './propertySlice';
import { PropertyState } from '../../types';

describe('propertySlice', () => {
    const initialState: PropertyState = {
        properties: [],
        property: null,
        savedProperties: [],
        userListings: [],
        loading: false,
        error: null,
        pagination: {
            total: 0,
            page: 1,
            limit: 10,
            pages: 0
        }
    };

    it('should handle initial state', () => {
        expect(propertyReducer(undefined, { type: 'unknown' })).toEqual(initialState);
    });

    it('should handle clearProperty', () => {
        const stateWithProperty = { ...initialState, property: { _id: '1' } as any };
        expect(propertyReducer(stateWithProperty, clearProperty())).toEqual(initialState);
    });

    it('should handle clearError', () => {
        const stateWithError = { ...initialState, error: 'Some error' };
        expect(propertyReducer(stateWithError, clearError())).toEqual(initialState);
    });

    it('should handle setPage', () => {
        const actual = propertyReducer(initialState, setPage(2));
        expect(actual.pagination.page).toBe(2);
    });

    it('should handle getProperties.pending', () => {
        const actual = propertyReducer(initialState, { type: getProperties.pending.type });
        expect(actual.loading).toBe(true);
    });

    it('should handle getProperties.fulfilled', () => {
        const payload = {
            properties: [{ _id: '1', title: 'Test Property' }],
            pagination: { total: 1, page: 1, limit: 10, pages: 1 }
        };
        const actual = propertyReducer(initialState, {
            type: getProperties.fulfilled.type,
            payload
        });
        expect(actual.loading).toBe(false);
        expect(actual.properties).toEqual(payload.properties);
        expect(actual.pagination).toEqual(payload.pagination);
    });

    it('should handle getProperties.rejected', () => {
        const actual = propertyReducer(initialState, {
            type: getProperties.rejected.type,
            payload: 'Error loading properties'
        });
        expect(actual.loading).toBe(false);
        expect(actual.error).toBe('Error loading properties');
    });
});
