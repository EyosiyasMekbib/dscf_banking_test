import { afterEach, describe, expect, it, vi } from "vitest";
import { runSimulation } from "./api";

describe("runSimulation", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("surfaces backend 422 error when payload contains a top-level string", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          error: "Start date must be before end date",
        }),
        {
          status: 422,
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
    );

    const response = await runSimulation({
      account_number: "100001",
      initial_balance: 1000,
      start_date: "2026-03-10",
      end_date: "2026-03-01",
    });

    expect(response.success).toBe(false);
    if (response.success) {
      throw new Error("Expected a failed response");
    }

    expect(response.error).toBe("Start date must be before end date");
  });

  it("surfaces backend 422 errors when payload contains an errors array", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          errors: ["start_date is invalid", "end_date is invalid"],
        }),
        {
          status: 422,
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
    );

    const response = await runSimulation({
      account_number: "100001",
      initial_balance: 1000,
      start_date: "invalid",
      end_date: "invalid",
    });

    expect(response.success).toBe(false);
    if (response.success) {
      throw new Error("Expected a failed response");
    }

    expect(response.error).toBe("start_date is invalid; end_date is invalid");
  });

  it("surfaces backend 422 validation details in a user-readable message", async () => {
    vi.spyOn(global, "fetch").mockResolvedValue(
      new Response(
        JSON.stringify({
          errors: {
            transactions: ["date is out of simulation range"],
            base: ["Invalid transaction payload"],
          },
        }),
        {
          status: 422,
          headers: {
            "Content-Type": "application/json",
          },
        }
      )
    );

    const response = await runSimulation({
      account_number: "100001",
      initial_balance: 1000,
      start_date: "2026-03-01",
      end_date: "2026-03-10",
      transactions: [
        {
          date: "2026-03-20",
          amount: 100,
          type: "deposit",
        },
      ],
    });

    expect(response.success).toBe(false);
    if (response.success) {
      throw new Error("Expected a failed response");
    }

    expect(response.error).toContain("transactions: date is out of simulation range");
    expect(response.error).toContain("base: Invalid transaction payload");
  });
});
