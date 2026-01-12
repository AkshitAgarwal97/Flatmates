import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import Onboarding from './Onboarding';

const mockStore = configureMockStore([thunk]);

describe('Onboarding Component', () => {
  const initialState = {
    auth: {
      user: { _id: '123', email: 'test@example.com' },
      loading: false,
      error: null
    }
  };

  const renderWithStore = () => {
    const store = mockStore(initialState);
    return render(
      <Provider store={store}>
        <BrowserRouter>
          <Onboarding />
        </BrowserRouter>
      </Provider>
    );
  };

  test('renders step 1 (Personal Info) by default', () => {
    renderWithStore();
    expect(screen.getByText(/Personal Info/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
  });

  test('navigation to step 2 requires field input', async () => {
    renderWithStore();
    const nextButton = screen.getByText(/Next/i);
    
    // Attempt to go next without filling name
    fireEvent.click(nextButton);
    
    // Note: Since we use Formik/Yup, we might need to wait for validation errors
    // or check if the title still shows Step 1
    expect(screen.getByText(/Personal Info/i)).toBeInTheDocument();
  });

  test('navigates to next step after filling required fields', async () => {
     renderWithStore();
     
     // Fill Name
     const nameInput = screen.getByLabelText(/Full Name/i);
     fireEvent.change(nameInput, { target: { value: 'John Doe' } });
     
     // Fill Phone
     const phoneInput = screen.getByLabelText(/Phone Number/i);
     fireEvent.change(phoneInput, { target: { value: '9876543210' } });

     // Fill Gender (assuming it's a select or radio)
     const genderInput = screen.getByLabelText(/Gender/i);
     fireEvent.mouseDown(genderInput);
     const option = screen.getByRole('option', { name: 'Male' });
     fireEvent.click(option);

     const nextButton = screen.getByText(/Next/i);
     fireEvent.click(nextButton);

     // Wait for Step 2 title
     await waitFor(() => {
       expect(screen.getByText(/Search Preferences/i)).toBeInTheDocument();
     }, { timeout: 2000 });
  });
});
