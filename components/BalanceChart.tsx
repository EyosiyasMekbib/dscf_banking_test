"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  ChartOptions,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { DailyBreakdown } from "@/lib/api";
import { formatDate, formatCurrency } from "@/lib/formatters";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface BalanceChartProps {
  data: DailyBreakdown[];
}

export default function BalanceChart({ data }: BalanceChartProps) {
  const chartRef = useRef<ChartJS<"line">>(null);

  const chartData = {
    labels: data.map((day) => formatDate(day.date)),
    datasets: [
      {
        label: "Balance",
        data: data.map((day) => parseFloat(day.closing_balance)),
        borderColor: "rgb(239, 68, 68)",
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 400);
          gradient.addColorStop(0, "rgba(239, 68, 68, 0.3)");
          gradient.addColorStop(1, "rgba(239, 68, 68, 0)");
          return gradient;
        },
        borderWidth: 3,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6,
        pointHoverBackgroundColor: "rgb(239, 68, 68)",
        pointHoverBorderColor: "white",
        pointHoverBorderWidth: 2,
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: "index",
      intersect: false,
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        backgroundColor: "rgba(255, 255, 255, 0.98)",
        titleColor: "#1f2937",
        bodyColor: "#1f2937",
        borderColor: "rgba(239, 68, 68, 0.3)",
        borderWidth: 1,
        padding: 12,
        displayColors: false,
        callbacks: {
          title: (context) => {
            return context[0].label;
          },
          label: (context) => {
            return `Balance: ${formatCurrency(context.parsed.y ?? 0)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
          drawTicks: false,
        },
        ticks: {
          color: "rgba(0, 0, 0, 0.6)",
          maxRotation: 45,
          minRotation: 45,
          font: {
            size: 11,
          },
          maxTicksLimit: 10,
        },
        border: {
          display: false,
        },
      },
      y: {
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
          drawTicks: false,
        },
        ticks: {
          color: "rgba(0, 0, 0, 0.6)",
          font: {
            size: 11,
          },
          callback: (value) => {
            return `ETB ${(value as number).toLocaleString()}`;
          },
        },
        border: {
          display: false,
        },
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-strong rounded-xl p-6 border border-gray-200"
    >
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900">Balance Over Time</h3>
        <p className="text-sm text-gray-600 mt-1">
          Visual representation of balance changes throughout the simulation period
        </p>
      </div>

      <div className="h-80 md:h-96">
        <Line ref={chartRef} data={chartData} options={options} />
      </div>
    </motion.div>
  );
}
