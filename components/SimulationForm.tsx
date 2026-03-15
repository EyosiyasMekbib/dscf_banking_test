"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import TransactionBuilder from "./TransactionBuilder";
import { SimulationFormData } from "@/hooks/useSimulation";
import { Transaction, validateInitialBalance, validateDateRange, validateRequiredField } from "@/lib/validation";

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

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="accountId" className="block text-sm font-medium text-gray-700 mb-2">
            Account Number <span className="text-red-600">*</span>
          </label>
          <input
            id="accountId"
            type="text"
            value={formData.accountId}
            onChange={(e) => updateField("accountId", e.target.value)}
            placeholder="Enter account number"
            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
            disabled={isLoading}
          />
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
            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
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
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
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
              className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
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

        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-600 to-accent-600 hover:from-primary-700 hover:to-accent-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
