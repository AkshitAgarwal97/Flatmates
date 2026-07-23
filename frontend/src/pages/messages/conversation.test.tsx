import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";
import Conversation from "./Conversation";

const mockStore = configureMockStore([thunk]);

describe("Conversation Component", () => {
  const initialState = {
    auth: {
      user: {
        _id: "123",
        name: "Test User",
        avatar: "test-avatar.jpg",
      },
    },
    message: {
      currentConversation: {
        _id: "456",
        participants: [
          {
            _id: "123",
            name: "Test User",
            avatar: "test-avatar.jpg",
          },
          {
            _id: "789",
            name: "Other User",
            avatar: "other-avatar.jpg",
          },
        ],
      },
      messages: [],
      loading: false,
    },
  };

  const store = mockStore(initialState);

  const renderComponent = () => {
    return render(
      <Provider store={store}>
        <BrowserRouter>
          <Conversation />
        </BrowserRouter>
      </Provider>
    );
  };

  it("renders without crashing", () => {
    renderComponent();
    expect(
      screen.getByText("No messages yet. Start the conversation!")
    ).toBeInTheDocument();
  });

  it("handles message input", () => {
    renderComponent();
    const input = screen.getByPlaceholderText("Type a message...");
    fireEvent.change(input, { target: { value: "Test message" } });
    expect((input as HTMLInputElement).value).toBe("Test message");
  });

  it("shows loading state", () => {
    const loadingState = {
      ...initialState,
      message: { ...initialState.message, loading: true },
    };
    const loadingStore = mockStore(loadingState);

    render(
      <Provider store={loadingStore}>
        <BrowserRouter>
          <Conversation />
        </BrowserRouter>
      </Provider>
    );

    expect(screen.getByRole("progressbar")).toBeInTheDocument();
  });
});
