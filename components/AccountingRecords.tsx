"use client";

import { motion } from "framer-motion";
import { AccountingEntry } from "@/lib/api";
import { formatCurrency } from "@/lib/formatters";

interface AccountingRecordsProps {
  records: AccountingEntry[];
}

export default function AccountingRecords({ records }: AccountingRecordsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-strong rounded-xl overflow-hidden border border-gray-200"
    >
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-xl font-bold text-gray-900">Accounting Records</h3>
        <p className="text-sm text-gray-600 mt-1">Journal entries for the simulation</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Account
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                Debit
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                Credit
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {records.map((record, index) => (
              <motion.tr
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.05 }}
                className="hover:bg-gray-50 transition-colors"
              >
                <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                  {record.account}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {record.description}
                </td>
                <td className="px-6 py-4 text-sm text-right font-mono">
                  {record.debit ? (
                    <span className="text-blue-600">{formatCurrency(record.debit)}</span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
                <td className="px-6 py-4 text-sm text-right font-mono">
                  {record.credit ? (
                    <span className="text-green-600">{formatCurrency(record.credit)}</span>
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </td>
              </motion.tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-100 font-semibold">
            <tr>
              <td colSpan={2} className="px-6 py-4 text-sm text-gray-900">
                Total
              </td>
              <td className="px-6 py-4 text-sm text-right text-blue-600 font-mono">
                {formatCurrency(
                  records
                    .reduce((sum, r) => sum + (r.debit ? parseFloat(r.debit) : 0), 0)
                    .toFixed(2)
                )}
              </td>
              <td className="px-6 py-4 text-sm text-right text-green-600 font-mono">
                {formatCurrency(
                  records
                    .reduce((sum, r) => sum + (r.credit ? parseFloat(r.credit) : 0), 0)
                    .toFixed(2)
                )}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </motion.div>
  );
}
