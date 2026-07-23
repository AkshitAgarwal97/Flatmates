import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import PropertyList from './PropertyList';

const mockStore = configureMockStore([thunk]);

describe('PropertyList Component', () => {
  const initialState = {
    property: {
      properties: [
        {
          _id: '1',
          title: 'Test Apartment',
          description: 'A nice place',
          price: { amount: 5000, currency: 'INR' },
          address: { city: 'Mumbai', street: 'Bandra', country: 'India' },
          amenities: ['Wifi'],
          images: [{ url: 'test.jpg' }],
          createdAt: new Date().toISOString()
        }
      ],
      loading: false,
      error: null,
      pagination: { total: 1, page: 1, limit: 10, pages: 1 }
    },
    auth: {
      isAuthenticated: true,
      user: { _id: 'user1' }
    }
  };

  const renderWithStore = (state = initialState) => {
    const store = mockStore(state);
    return render(
      <Provider store={store}>
        <BrowserRouter>
          <PropertyList />
        </BrowserRouter>
      </Provider>
    );
  };

  test('renders property listings correctly', () => {
    renderWithStore();
    expect(screen.getByText('Test Apartment')).toBeInTheDocument();
    expect(screen.getByText(/Mumbai/)).toBeInTheDocument();
  });

  test('shows empty state when no properties found', () => {
    const emptyState = {
      ...initialState,
      property: { ...initialState.property, properties: [] }
    };
    renderWithStore(emptyState);
    expect(screen.getByText('No properties found matching your criteria.')).toBeInTheDocument();
    expect(screen.getByText('Reset Filters')).toBeInTheDocument();
  });

  test('shows loading indicator', () => {
    const loadingState = {
      ...initialState,
      property: { ...initialState.property, loading: true }
    };
    renderWithStore(loadingState);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  test('handles search input change', () => {
    renderWithStore();
    const searchInput = screen.getByPlaceholderText(/Search by title/i);
    fireEvent.change(searchInput, { target: { value: 'Mumbai' } });
    expect((searchInput as HTMLInputElement).value).toBe('Mumbai');
  });
});
