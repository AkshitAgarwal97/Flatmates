import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import CityLandingPage from './CityLandingPage';

const mockStore = configureMockStore([thunk]);

describe('CityLandingPage Component', () => {
  const initialState = {
    property: {
      properties: [],
      loading: false,
      error: null,
      pagination: { total: 0, page: 1, limit: 10, pages: 0 }
    }
  };

  const renderWithRouter = (citySlug = 'delhi') => {
    const store = mockStore(initialState);
    return render(
      <Provider store={store}>
        <MemoryRouter initialEntries={[`/flats-in-${citySlug}`]}>
          <Routes>
            <Route path="/flats-in-:citySlug" element={<CityLandingPage />} />
          </Routes>
        </MemoryRouter>
      </Provider>
    );
  };

  test('renders correct city title from URL slug', async () => {
    renderWithRouter('mumbai');
    expect(screen.getByText(/Flats in Mumbai/i)).toBeInTheDocument();
  });

  test('applies SEO metadata to the document', async () => {
    renderWithRouter('bangalore');
    // Since we use react-helmet or similar, we check if title is updated
    await waitFor(() => {
      expect(document.title).toContain('Flats in Bangalore');
    });
  });

  test('shows local area guides sections', () => {
    renderWithRouter('delhi');
    expect(screen.getByText(/Local Area Guide/i)).toBeInTheDocument();
  });
});
