"use client";

import { useSimulation } from "@/hooks/useSimulation";
import SimulationForm from "@/components/SimulationForm";
import ResultsDisplay from "@/components/ResultsDisplay";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const {
    formData,
    setFormData,
    result,
    isLoading,
    error,
    submitSimulation,
    resetSimulation,
  } = useSimulation();

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Interest Simulation
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Run what-if scenarios for interest calculations using existing account data
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div>
            <SimulationForm
              formData={formData}
              onChange={setFormData}
              onSubmit={submitSimulation}
              isLoading={isLoading}
            />
          </div>

          <div className="flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass rounded-2xl p-8 text-center max-w-md"
            >
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Interactive Simulation Tool
              </h3>
              <p className="text-gray-600 text-sm">
                Enter your account number to simulate interest calculations with different scenarios.
                Add transactions to see how deposits and withdrawals affect your interest
                earnings over time.
              </p>
              <div className="mt-6 space-y-2 text-left">
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-primary-600">✓</span>
                  <span>Real-time validation</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-primary-600">✓</span>
                  <span>Detailed daily breakdown</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-primary-600">✓</span>
                  <span>Visual charts and reports</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <span className="text-primary-600">✓</span>
                  <span>Accounting records</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              <div className="glass-strong rounded-xl p-6 border-l-4 border-red-500">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">⚠️</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-red-600 mb-1">
                      Simulation Error
                    </h3>
                    <p className="text-gray-700">{error}</p>
                    <button
                      onClick={submitSimulation}
                      className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {result && (
            <motion.div
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="mb-6 flex justify-between items-center">
                <div />
                <button
                  onClick={resetSimulation}
                  className="px-6 py-2 bg-white hover:bg-gray-50 text-gray-900 rounded-lg text-sm font-medium transition-colors border border-gray-300 shadow-sm"
                >
                  ← New Simulation
                </button>
              </div>
              <ResultsDisplay result={result} />
            </motion.div>
          )}

          {!result && !error && !isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16"
            >
              <div className="text-6xl mb-4">🎯</div>
              <p className="text-gray-600">
                Enter your account number and simulation details, then click &quot;Run Simulation&quot; to see results
              </p>
            </motion.div>
          )}

          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16"
            >
              <div className="inline-block">
                <svg
                  className="animate-spin h-16 w-16 text-primary-500"
                  viewBox="0 0 24 24"
                >
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
              </div>
              <p className="text-gray-700 mt-4 text-lg">Running simulation...</p>
              <p className="text-gray-500 text-sm mt-2">
                This may take a few moments depending on the date range
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

