import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import LoginPage from "@/app/login/page";

const { pushMock, replaceMock, loginMock } = vi.hoisted(() => ({
  pushMock: vi.fn(),
  replaceMock: vi.fn(),
  loginMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
    replace: replaceMock,
  }),
}));

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");

  return {
    ...actual,
    loginWithCoreAuth: loginMock,
  };
});

describe("LoginPage", () => {
  beforeEach(() => {
    pushMock.mockReset();
    replaceMock.mockReset();
    loginMock.mockReset();
    localStorage.clear();
  });

  it("redirects authenticated users from /login to /", async () => {
    localStorage.setItem("accessToken", "existing-token");

    render(<LoginPage />);

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/");
    });

    expect(pushMock).not.toHaveBeenCalled();
    expect(loginMock).not.toHaveBeenCalled();
    expect(screen.queryByRole("button", { name: /sign in/i })).not.toBeInTheDocument();
  });

  it("stores token and redirects on successful login", async () => {
    loginMock.mockResolvedValue({
      success: true,
      data: {
        access_token: "test-access-token",
      },
    });

    const user = userEvent.setup();

    render(<LoginPage />);

    await user.type(await screen.findByLabelText(/email/i), "qa@example.com");
    await user.type(await screen.findByLabelText(/password/i), "secret123");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(localStorage.getItem("accessToken")).toBe("test-access-token");
      expect(pushMock).toHaveBeenCalledWith("/");
    });
  });

  it("shows an error when login fails", async () => {
    loginMock.mockResolvedValue({
      success: false,
      error: "Invalid credentials",
    });

    const user = userEvent.setup();

    render(<LoginPage />);

    await user.type(await screen.findByLabelText(/email/i), "qa@example.com");
    await user.type(await screen.findByLabelText(/password/i), "wrong-password");
    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(await screen.findByText("Invalid credentials")).toBeInTheDocument();
    expect(pushMock).not.toHaveBeenCalled();
    expect(localStorage.getItem("accessToken")).toBeNull();
  });
});
