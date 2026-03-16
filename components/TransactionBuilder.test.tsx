import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import TransactionBuilder from "./TransactionBuilder";
import type { Transaction } from "@/lib/validation";

vi.mock("framer-motion", () => ({
  motion: {
    div: ({ children, ...props }: React.HTMLAttributes<HTMLDivElement>) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

describe("TransactionBuilder", () => {
  it("blocks adding a row when simulation dates are missing and shows feedback", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <TransactionBuilder
        transactions={[]}
        onChange={onChange}
        startDate=""
        endDate=""
      />
    );

    await user.click(screen.getByRole("button", { name: /add transaction/i }));

    expect(onChange).not.toHaveBeenCalled();
    expect(
      screen.getByText("Set simulation start and end dates before adding transactions.")
    ).toBeInTheDocument();
  });

  it("adds a row with safe default values", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <TransactionBuilder
        transactions={[]}
        onChange={onChange}
        startDate="2026-03-01"
        endDate="2026-03-10"
      />
    );

    await user.click(screen.getByRole("button", { name: /add transaction/i }));

    expect(onChange).toHaveBeenCalledWith([
      {
        date: "2026-03-01",
        amount: 0.01,
        type: "deposit",
      },
    ] satisfies Transaction[]);
  });

  it("shows validation feedback before submit when amount becomes invalid", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <TransactionBuilder
        transactions={[
          {
            date: "2026-03-03",
            amount: 100,
            type: "deposit",
          },
        ]}
        onChange={onChange}
        startDate="2026-03-01"
        endDate="2026-03-10"
      />
    );

    const amountInput = screen.getByRole("spinbutton");
    await user.clear(amountInput);

    expect(screen.getByText("Amount must be greater than zero")).toBeInTheDocument();
  });
});
