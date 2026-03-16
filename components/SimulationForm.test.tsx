import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import SimulationForm from "./SimulationForm";
import type { SimulationFormData } from "@/hooks/useSimulation";

const { fetchAccountsMock } = vi.hoisted(() => ({
  fetchAccountsMock: vi.fn(),
}));

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");

  return {
    ...actual,
    fetchAccounts: fetchAccountsMock,
  };
});

describe("SimulationForm", () => {
  beforeEach(() => {
    fetchAccountsMock.mockResolvedValue({ success: true, data: [] });
    fetchAccountsMock.mockClear();
  });

  it("does not submit when a transaction row is invalid", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    const formData: SimulationFormData = {
      accountId: "100001",
      initialBalance: "1000",
      startDate: "2026-03-01",
      endDate: "2026-03-10",
      transactions: [
        {
          date: "2026-03-03",
          amount: 0,
          type: "deposit",
        },
      ],
    };

    render(
      <SimulationForm
        formData={formData}
        onChange={vi.fn()}
        onSubmit={onSubmit}
        isLoading={false}
      />
    );

    await waitFor(() => expect(fetchAccountsMock).toHaveBeenCalled());

    await user.click(screen.getByRole("button", { name: /run simulation/i }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText("Transaction 1: Amount must be greater than zero")).toBeInTheDocument();
  });

  it("shows out-of-range transaction date feedback", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    const formData: SimulationFormData = {
      accountId: "100001",
      initialBalance: "1000",
      startDate: "2026-03-05",
      endDate: "2026-03-10",
      transactions: [
        {
          date: "2026-03-03",
          amount: 100,
          type: "deposit",
        },
      ],
    };

    render(
      <SimulationForm
        formData={formData}
        onChange={vi.fn()}
        onSubmit={onSubmit}
        isLoading={false}
      />
    );

    await waitFor(() => expect(fetchAccountsMock).toHaveBeenCalled());

    await user.click(screen.getByRole("button", { name: /run simulation/i }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText("Transaction 1: Transaction date must be after simulation start date")).toBeInTheDocument();
  });
});
