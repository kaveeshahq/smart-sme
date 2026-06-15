"use client";

import { useEffect, useState, useCallback } from "react";
import {
  ShoppingCart, Plus, Search, Eye,
  TrendingUp, Calendar, DollarSign, Receipt,
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Sale, Customer, Product } from "@/types";
import NewSaleModal from "@/components/sales/NewSaleModal";
import SaleDetailModal from "@/components/sales/SaleDetailModal";

interface Summary {
  today: { total: number; count: number };
  thisMonth: { total: number; count: number };
  thisYear: { total: number; count: number };
  allTime: { total: number; count: number };
}

export default function SalesPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [showNewSale, setShowNewSale] = useState(false);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const fetchSales = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (status) params.set("status", status);

    const res = await fetch(`/api/sales?${params}`);
    const data = await res.json();
    if (data.success) setSales(data.data);
    setLoading(false);
  }, [search, status]);

  useEffect(() => { fetchSales(); }, [fetchSales]);

  useEffect(() => {
    fetch("/api/sales/summary")
      .then((r) => r.json())
      .then((d) => { if (d.success) setSummary(d.data); });

    fetch("/api/customers")
      .then((r) => r.json())
      .then((d) => { if (d.success) setCustomers(d.data); });

    fetch("/api/inventory/products")
      .then((r) => r.json())
      .then((d) => { if (d.success) setProducts(d.data); });
  }, []);

  function handleSaleCreated() {
    setShowNewSale(false);
    fetchSales();
    fetch("/api/sales/summary")
      .then((r) => r.json())
      .then((d) => { if (d.success) setSummary(d.data); });
  }

  const statusColor: Record<string, string> = {
    COMPLETED: "bg-green-100 text-green-700",
    PENDING: "bg-yellow-100 text-yellow-700",
    CANCELLED: "bg-red-100 text-red-700",
    REFUNDED: "bg-gray-100 text-gray-600",
  };

  const paymentColor: Record<string, string> = {
    CASH: "bg-emerald-50 text-emerald-700",
    CARD: "bg-blue-50 text-blue-700",
    BANK_TRANSFER: "bg-violet-50 text-violet-700",
    CHEQUE: "bg-orange-50 text-orange-700",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Sales</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage transactions and track revenue
          </p>
        </div>
        <button
          onClick={() => setShowNewSale(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          New Sale
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Today",
            value: formatCurrency(summary?.today.total || 0),
            count: `${summary?.today.count || 0} sales`,
            icon: <Calendar size={20} />,
            color: "bg-blue-500",
          },
          {
            label: "This Month",
            value: formatCurrency(summary?.thisMonth.total || 0),
            count: `${summary?.thisMonth.count || 0} sales`,
            icon: <TrendingUp size={20} />,
            color: "bg-violet-500",
          },
          {
            label: "This Year",
            value: formatCurrency(summary?.thisYear.total || 0),
            count: `${summary?.thisYear.count || 0} sales`,
            icon: <DollarSign size={20} />,
            color: "bg-emerald-500",
          },
          {
            label: "All Time",
            value: formatCurrency(summary?.allTime.total || 0),
            count: `${summary?.allTime.count || 0} sales`,
            icon: <ShoppingCart size={20} />,
            color: "bg-orange-500",
          },
        ].map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3"
          >
            <div className={`${card.color} text-white p-2.5 rounded-lg shrink-0`}>
              {card.icon}
            </div>
            <div>
              <p className="text-xs text-gray-500">{card.label}</p>
              <p className="text-lg font-bold text-gray-800">{card.value}</p>
              <p className="text-xs text-gray-400">{card.count}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search invoice or customer..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">All Status</option>
          <option value="COMPLETED">Completed</option>
          <option value="PENDING">Pending</option>
          <option value="CANCELLED">Cancelled</option>
          <option value="REFUNDED">Refunded</option>
        </select>
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left px-4 py-3 font-medium text-gray-600">Invoice</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Customer</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Items</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Payment</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Total</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-400">
                    Loading sales...
                  </td>
                </tr>
              ) : sales.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-gray-400">
                    <Receipt size={32} className="mx-auto mb-2 opacity-30" />
                    No sales found
                  </td>
                </tr>
              ) : (
                sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-blue-600 font-medium">
                      {sale.invoiceNo}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {sale.customer
                        ? `${sale.customer.firstName} ${sale.customer.lastName}`
                        : <span className="text-gray-400 italic">Walk-in</span>
                      }
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {formatDate(sale.soldAt)}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-500">
                      {sale.items.length}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${paymentColor[sale.paymentMethod] || "bg-gray-100 text-gray-600"}`}>
                        {sale.paymentMethod.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-800">
                      {formatCurrency(sale.total)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[sale.status] || "bg-gray-100 text-gray-600"}`}>
                        {sale.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setSelectedSale(sale)}
                        className="p-1.5 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {showNewSale && (
        <NewSaleModal
          customers={customers}
          products={products}
          onClose={() => setShowNewSale(false)}
          onSuccess={handleSaleCreated}
        />
      )}
      {selectedSale && (
        <SaleDetailModal
          sale={selectedSale}
          onClose={() => setSelectedSale(null)}
        />
      )}
    </div>
  );
}