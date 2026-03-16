"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import TransactionBuilder from "./TransactionBuilder";
import { SimulationFormData } from "@/hooks/useSimulation";
import {
  Transaction,
  validateInitialBalance,
  validateDateRange,
  validateRequiredField,
  validateTransactions,
} from "@/lib/validation";
import { Account, fetchAccounts } from "@/lib/api";

interface SimulationFormProps {
  formData: SimulationFormData;
  onChange: (data: SimulationFormData) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export default function SimulationForm({
  formData,
  onChange,
  onSubmit,
  isLoading,
}: SimulationFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isAccountsLoading, setIsAccountsLoading] = useState(true);
  const [accountsError, setAccountsError] = useState<string | null>(null);
  const [qaAccessToken, setQaAccessToken] = useState(() => {
    if (typeof window === "undefined") {
      return "";
    }

    return localStorage.getItem("accessToken") || "";
  });
  const [tokenMessage, setTokenMessage] = useState<string | null>(null);

  const loadAccounts = useCallback(async () => {
    setIsAccountsLoading(true);
    setAccountsError(null);

    const response = await fetchAccounts();
    if (response.success) {
      setAccounts(response.data);
    } else {
      setAccountsError(response.error || "Failed to load accounts.");
    }

    setIsAccountsLoading(false);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadAccounts();
    }, 0);

    return () => {
      window.clearTimeout(timer);
    };
  }, [loadAccounts]);

  const handleSaveToken = () => {
    if (typeof window === "undefined") {
      return;
    }

    if (!qaAccessToken.trim()) {
      setTokenMessage("Please paste a valid access token before saving.");
      return;
    }

    localStorage.setItem("accessToken", qaAccessToken.trim());
    setTokenMessage("Access token saved. Reloading accounts...");
    loadAccounts();
  };

  const handleClearToken = () => {
    if (typeof window === "undefined") {
      return;
    }

    localStorage.removeItem("accessToken");
    setQaAccessToken("");
    setTokenMessage("Access token cleared.");
  };

  const updateField = (field: keyof SimulationFormData, value: string | Transaction[]) => {
    onChange({
      ...formData,
      [field]: value,
    });
    
    const newErrors = { ...errors };
    delete newErrors[field];
    setErrors(newErrors);
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    const accountValidation = validateRequiredField(formData.accountId);
    if (!accountValidation.isValid) {
      newErrors.accountId = "Account number is required";
    }

    const balanceValidation = validateInitialBalance(formData.initialBalance);
    if (!balanceValidation.isValid) {
      newErrors.initialBalance = balanceValidation.error || "";
    }

    if (!formData.startDate) {
      newErrors.startDate = "Start date is required";
    }

    if (!formData.endDate) {
      newErrors.endDate = "End date is required";
    }

    if (formData.startDate && formData.endDate) {
      const dateValidation = validateDateRange(formData.startDate, formData.endDate);
      if (!dateValidation.isValid) {
        newErrors.dateRange = dateValidation.error || "";
      }

      const transactionsValidation = validateTransactions(
        formData.transactions,
        formData.startDate,
        formData.endDate
      );
      if (!transactionsValidation.isValid) {
        newErrors.transactions = transactionsValidation.error || "";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-strong rounded-2xl p-8 shadow-lg"
    >
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Interest Simulation
      </h2>

      <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 p-4">
        <p className="text-sm font-semibold text-amber-900">QA Access Token</p>
        <p className="mt-1 text-xs text-amber-800">
          No login page is configured in this app. Paste a valid access token to authorize account loading.
        </p>
        <div className="mt-3 space-y-2">
          <textarea
            value={qaAccessToken}
            onChange={(e) => {
              setQaAccessToken(e.target.value);
              setTokenMessage(null);
            }}
            placeholder="Paste Bearer access token"
            rows={3}
            className="w-full rounded-lg border border-amber-300 bg-white px-3 py-2 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-amber-400"
            disabled={isLoading}
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleSaveToken}
              className="rounded-md bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700"
              disabled={isLoading}
            >
              Save Token
            </button>
            <button
              type="button"
              onClick={handleClearToken}
              className="rounded-md border border-amber-400 bg-white px-3 py-1.5 text-xs font-medium text-amber-800 hover:bg-amber-100"
              disabled={isLoading}
            >
              Clear Token
            </button>
            <button
              type="button"
              onClick={loadAccounts}
              className="rounded-md border border-amber-400 bg-white px-3 py-1.5 text-xs font-medium text-amber-800 hover:bg-amber-100"
              disabled={isLoading || isAccountsLoading}
            >
              Reload Accounts
            </button>
          </div>
          {tokenMessage && <p className="text-xs text-amber-900">{tokenMessage}</p>}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="accountId" className="block text-sm font-medium text-gray-700 mb-2">
            Select Account <span className="text-red-600">*</span>
          </label>
          <select
            id="accountId"
            value={formData.accountId}
            onChange={(e) => updateField("accountId", e.target.value)}
            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-action focus:border-transparent transition-all"
            disabled={isLoading || isAccountsLoading}
          >
            <option value="">
              {isAccountsLoading ? "Loading accounts..." : "Choose an account"}
            </option>
            {accounts.map((account) => (
              <option key={account.id} value={account.account_number}>
                {account.account_number}
                {account.customer_name ? ` - ${account.customer_name}` : ""}
              </option>
            ))}
          </select>
          {accountsError && (
            <p className="mt-1 text-sm text-red-600">{accountsError}</p>
          )}
          {errors.accountId && (
            <p className="mt-1 text-sm text-red-600">{errors.accountId}</p>
          )}
        </div>

        <div>
          <label htmlFor="initialBalance" className="block text-sm font-medium text-gray-700 mb-2">
            Initial Balance (ETB) <span className="text-red-600">*</span>
          </label>
          <input
            id="initialBalance"
            type="number"
            step="0.01"
            min="0"
            value={formData.initialBalance}
            onChange={(e) => updateField("initialBalance", e.target.value)}
            placeholder="10000.00"
            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-action focus:border-transparent transition-all"
            disabled={isLoading}
          />
          {errors.initialBalance && (
            <p className="mt-1 text-sm text-red-600">{errors.initialBalance}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
              Start Date <span className="text-red-600">*</span>
            </label>
            <input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => updateField("startDate", e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-action focus:border-transparent transition-all"
              disabled={isLoading}
            />
            {errors.startDate && (
              <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
            )}
          </div>

          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
              End Date <span className="text-red-600">*</span>
            </label>
            <input
              id="endDate"
              type="date"
              value={formData.endDate}
              onChange={(e) => updateField("endDate", e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-action focus:border-transparent transition-all"
              disabled={isLoading}
            />
            {errors.endDate && (
              <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
            )}
          </div>
        </div>

        {errors.dateRange && (
          <p className="text-sm text-red-600">{errors.dateRange}</p>
        )}

        <TransactionBuilder
          transactions={formData.transactions}
          onChange={(transactions) => updateField("transactions", transactions)}
          startDate={formData.startDate}
          endDate={formData.endDate}
        />

        {errors.transactions && (
          <p className="text-sm text-red-600">{errors.transactions}</p>
        )}

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-action to-action-hover hover:from-action-hover hover:to-action text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Running Simulation...
              </span>
            ) : (
              "Run Simulation"
            )}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
