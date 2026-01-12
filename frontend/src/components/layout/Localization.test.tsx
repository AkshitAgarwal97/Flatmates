import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '../../i18n'; // Assuming i18n is exported from here
import Header from './Header';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import configureMockStore from 'redux-mock-store';

const mockStore = configureMockStore([]);

describe('Localization Features', () => {
  const store = mockStore({
    auth: { user: null },
    message: { unreadCount: 0 }
  });

  const renderHeader = () => {
    return render(
      <Provider store={store}>
        <BrowserRouter>
          <I18nextProvider i18n={i18n}>
            <Header />
          </I18nextProvider>
        </BrowserRouter>
      </Provider>
    );
  };

  test('toggles between English and Hinglish', async () => {
    renderHeader();
    
    // Default should be English
    expect(screen.getByText(/Find Room/i)).toBeInTheDocument();

    // Open language menu and switch to Hinglish
    const langSwitch = screen.getByTestId('language-switcher');
    fireEvent.click(langSwitch);
    
    const hinglishOption = screen.getByText('Hinglish');
    fireEvent.click(hinglishOption);

    // Verify translated text (e.g., "Kamra Dhundo" for "Find Room")
    // Note: This requires i18n to actually change state in the test environment
    expect(await screen.findByText(/Kamra Dhundo/i)).toBeInTheDocument();
  });
});
