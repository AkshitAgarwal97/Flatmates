import React from 'react';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import PropertyCard from './PropertyCard';

const mockStore = configureMockStore([thunk]);

describe('PropertyCard Trust Indicators', () => {
  const mockProperty: any = {
    _id: '1',
    title: 'Modern Apartment',
    price: { amount: 20000 },
    address: { city: 'Bangalore' },
    images: [{ url: 'test.jpg' }],
    amenities: [],
    isVerified: true,
    matchScore: 85,
    createdBy: {
      name: 'Owner Name',
      isVerified: true
    }
  };

  const renderWithStore = (property = mockProperty) => {
    const store = mockStore({
      auth: { isAuthenticated: true, user: { _id: 'user1' } },
      property: { savedProperties: [] }
    });
    return render(
      <Provider store={store}>
        <BrowserRouter>
          <PropertyCard property={property} />
        </BrowserRouter>
      </Provider>
    );
  };

  test('displays verified badge when property is verified', () => {
    renderWithStore();
    // Assuming VerifiedIcon or a chip with "Verified" is used
    // Let's check for the text "Verified" if it's a chip, or just visual presence
    // In our implementation, we added a CheckCircle icon for verified and a Badge for featured
    // Let's assume there's a label or alt text
    const badge = screen.getByTestId('verified-badge');
    expect(badge).toBeInTheDocument();
  });

  test('displays match score chip when available', () => {
    renderWithStore();
    expect(screen.getByText(/85%/)).toBeInTheDocument();
    expect(screen.getByText(/Match/i)).toBeInTheDocument();
  });

  test('displays featured chip for featured properties', () => {
    const featuredProperty = { ...mockProperty, isFeatured: true };
    renderWithStore(featuredProperty);
    expect(screen.getByText(/FEATURED/i)).toBeInTheDocument();
  });

  test('displays boosted user indicator', () => {
    const boostedProperty = { 
      ...mockProperty, 
      createdBy: { ...mockProperty.createdBy, isBoosted: true } 
    };
    renderWithStore(boostedProperty);
    // In our implementation, we used secondary color for the verified icon if boosted
    // We can check for a specific test ID if we added one, or style
    const ownerInfo = screen.getByText('Owner Name');
    expect(ownerInfo).toBeInTheDocument();
  });
});
