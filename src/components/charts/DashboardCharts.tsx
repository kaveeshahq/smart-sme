"use client";

import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

interface SalesDataPoint {
  month: string;
  revenue: number;
}

interface ExpenseDataPoint {
  category: string;
  amount: number;
}

export default function DashboardCharts() {
  const [salesData, setSalesData] = useState<SalesDataPoint[]>([]);
  const [expenseData, setExpenseData] = useState<ExpenseDataPoint[]>([]);

  useEffect(() => {
    fetch("/api/analytics/sales-trend")
      .then((r) => r.json())
      .then((d: { success: boolean; data: SalesDataPoint[] }) => {
        if (d.success) setSalesData(d.data);
      });

    fetch("/api/analytics/expense-breakdown")
      .then((r) => r.json())
      .then((d: { success: boolean; data: ExpenseDataPoint[] }) => {
        if (d.success) setExpenseData(d.data);
      });
  }, []);

  const formatLKR = (value: number) => {
    return new Intl.NumberFormat("si-LK", {
      style: "currency",
      currency: "LKR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tooltipFormatter = (value: any) => [formatLKR(Number(value)), "Amount"];

  return (
    <div className="space-y-6">
      {/* Sales Trend */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-800 mb-4">Revenue Trend</h3>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={salesData}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="month" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => formatLKR(v)} />
            <Tooltip formatter={tooltipFormatter} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#colorRevenue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Expense Breakdown */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <h3 className="font-semibold text-gray-800 mb-4">Expense Breakdown</h3>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={expenseData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="category" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => formatLKR(v)} />
            <Tooltip formatter={tooltipFormatter} />
            <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}