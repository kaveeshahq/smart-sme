"use client";

import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, PieChart, Pie,
  Cell, Legend, AreaChart, Area,
} from "recharts";
import {
  TrendingUp, TrendingDown, ShoppingCart,
  Package, Users, AlertTriangle, Award,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface AnalyticsData {
  kpis: {
    thisMonthRevenue: number;
    lastMonthRevenue: number;
    revenueGrowth: number;
    thisMonthSales: number;
    lastMonthSales: number;
    salesGrowth: number;
  };
  bestSellers: {
    productId: number;
    name: string;
    sku: string;
    quantitySold: number;
    revenue: number;
    orders: number;
  }[];
  customerGrowth: { month: string; customers: number }[];
  paymentMethods: { method: string; count: number; revenue: number }[];
  categoryData: { name: string; revenue: number }[];
  lowStock: {
    id: number;
    name: string;
    sku: string;
    stockQty: number;
    lowStockAlert: number;
    category: { name: string } | null;
  }[];
}

const COLORS = [
  "#3b82f6", "#8b5cf6", "#10b981", "#f59e0b",
  "#ef4444", "#06b6d4", "#ec4899", "#84cc16",
];

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics/overview")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setData(d.data);
        setLoading(false);
      });
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tooltipFormatter = (value: any) => [formatCurrency(Number(value)), ""];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const countFormatter = (value: any) => [Number(value), ""];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Analytics</h1>
        <p className="text-gray-500 text-sm mt-1">
          Business insights and performance metrics
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Revenue This Month",
            value: formatCurrency(data.kpis.thisMonthRevenue),
            growth: data.kpis.revenueGrowth,
            icon: <TrendingUp size={20} />,
            color: "bg-blue-500",
          },
          {
            label: "Sales This Month",
            value: data.kpis.thisMonthSales.toString(),
            growth: data.kpis.salesGrowth,
            icon: <ShoppingCart size={20} />,
            color: "bg-violet-500",
          },
          {
            label: "Best Seller",
            value: data.bestSellers[0]?.name || "—",
            sub: data.bestSellers[0]
              ? `${data.bestSellers[0].quantitySold} sold`
              : "",
            icon: <Award size={20} />,
            color: "bg-yellow-500",
            small: true,
          },
          {
            label: "Low Stock Items",
            value: data.lowStock.length.toString(),
            sub: "Need restocking",
            icon: <AlertTriangle size={20} />,
            color: data.lowStock.length > 0 ? "bg-red-500" : "bg-green-500",
          },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-gray-500">{card.label}</p>
              <div className={`${card.color} text-white p-2 rounded-lg`}>
                {card.icon}
              </div>
            </div>
            <p className={`font-bold text-gray-800 ${card.small ? "text-sm" : "text-xl"} truncate`}>
              {card.value}
            </p>
            {"growth" in card && card.growth !== undefined ? (
              <div className="flex items-center gap-1 mt-1">
                {card.growth >= 0 ? (
                  <TrendingUp size={12} className="text-emerald-500" />
                ) : (
                  <TrendingDown size={12} className="text-red-500" />
                )}
                <span className={`text-xs font-medium ${
                  card.growth >= 0 ? "text-emerald-500" : "text-red-500"
                }`}>
                  {Math.abs(card.growth)}% vs last month
                </span>
              </div>
            ) : (
              <p className="text-xs text-gray-400 mt-1">{card.sub}</p>
            )}
          </div>
        ))}
      </div>

      {/* Row 1 — Best Sellers + Category Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Best Selling Products */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Award size={18} className="text-yellow-500" />
            Best Selling Products
          </h3>
          <div className="space-y-3">
            {data.bestSellers.slice(0, 6).map((item, i) => (
              <div key={item.productId} className="flex items-center gap-3">
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                  i === 0 ? "bg-yellow-100 text-yellow-700"
                    : i === 1 ? "bg-gray-100 text-gray-600"
                    : i === 2 ? "bg-orange-100 text-orange-700"
                    : "bg-blue-50 text-blue-500"
                }`}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 truncate">
                    {item.name}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex-1 bg-gray-100 rounded-full h-1.5">
                      <div
                        className="bg-blue-500 h-1.5 rounded-full"
                        style={{
                          width: `${Math.min(
                            (item.quantitySold /
                              (data.bestSellers[0]?.quantitySold || 1)) * 100,
                            100
                          )}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 shrink-0">
                      {item.quantitySold} sold
                    </span>
                  </div>
                </div>
                <span className="text-sm font-semibold text-gray-800 shrink-0">
                  {formatCurrency(item.revenue)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Category Revenue */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">
            Revenue by Category
          </h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.categoryData} layout="vertical" barSize={16}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => formatCurrency(v)} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={90} />
              <Tooltip formatter={tooltipFormatter} />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[0, 4, 4, 0]}>
                {data.categoryData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2 — Customer Growth + Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Customer Growth */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Users size={18} className="text-emerald-500" />
            Customer Growth
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data.customerGrowth}>
              <defs>
                <linearGradient id="custGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip formatter={countFormatter} />
              <Area
                type="monotone"
                dataKey="customers"
                stroke="#10b981"
                strokeWidth={2}
                fill="url(#custGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Payment Method Distribution */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">
            Payment Methods
          </h3>
          <div className="flex items-center gap-4">
            <ResponsiveContainer width="50%" height={180}>
              <PieChart>
                <Pie
                  data={data.paymentMethods}
                  dataKey="count"
                  nameKey="method"
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                >
                  {data.paymentMethods.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={countFormatter} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {data.paymentMethods.map((pm, i) => (
                <div key={pm.method} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: COLORS[i % COLORS.length] }}
                    />
                    <span className="text-xs text-gray-600">{pm.method}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-semibold text-gray-700">
                      {pm.count} sales
                    </p>
                    <p className="text-xs text-gray-400">
                      {formatCurrency(pm.revenue)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3 — Sales Trend + Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <TrendingUp size={18} className="text-blue-500" />
            Revenue Trend
          </h3>
          <SalesTrendChart />
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <AlertTriangle size={18} className="text-red-500" />
            Low Stock Alerts
            {data.lowStock.length > 0 && (
              <span className="ml-auto bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full">
                {data.lowStock.length}
              </span>
            )}
          </h3>
          {data.lowStock.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-center">
              <div>
                <Package size={32} className="mx-auto text-green-400 mb-2" />
                <p className="text-sm text-gray-400">All products well stocked!</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {data.lowStock.map((product) => {
                const pct = Math.round(
                  (product.stockQty / product.lowStockAlert) * 100
                );
                return (
                  <div key={product.id} className="p-3 bg-red-50 rounded-lg border border-red-100">
                    <div className="flex items-start justify-between mb-1.5">
                      <div>
                        <p className="text-sm font-medium text-gray-800">
                          {product.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {product.sku} · {product.category?.name}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full shrink-0 ml-2">
                        {product.stockQty} left
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-red-100 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${
                            pct <= 25 ? "bg-red-500" : "bg-orange-400"
                          }`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-400">
                        Min: {product.lowStockAlert}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Sales Trend sub-component
function SalesTrendChart() {
  const [data, setData] = useState<{ month: string; revenue: number }[]>([]);

  useEffect(() => {
    fetch("/api/analytics/sales-trend")
      .then((r) => r.json())
      .then((d) => { if (d.success) setData(d.data); });
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tooltipFormatter = (value: any) => [formatCurrency(Number(value)), "Revenue"];

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="month" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => formatCurrency(v)} />
        <Tooltip formatter={tooltipFormatter} />
        <Line
          type="monotone"
          dataKey="revenue"
          stroke="#3b82f6"
          strokeWidth={2.5}
          dot={{ fill: "#3b82f6", r: 4 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}