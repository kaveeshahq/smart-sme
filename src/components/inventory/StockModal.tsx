"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { Product } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface Props {
  product: Product;
  onClose: () => void;
}

export default function StockModal({ product, onClose }: Props) {
  const [form, setForm] = useState({
    type: "IN",
    quantity: "",
    reference: "",
    note: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/inventory/stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId: product.id, ...form }),
    });

    const data = await res.json();
    if (!data.success) {
      setError(data.error || "Failed to update stock");
    } else {
      onClose();
    }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Update Stock</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={18} />
          </button>
        </div>

        <div className="px-6 pt-4">
          <div className="bg-gray-50 rounded-lg p-3 mb-4">
            <p className="text-sm font-medium text-gray-800">{product.name}</p>
            <p className="text-xs text-gray-500">
              SKU: {product.sku} · Current Stock:{" "}
              <span className="font-semibold text-gray-700">
                {product.stockQty} {product.unit}
              </span>
            </p>
            <p className="text-xs text-gray-500">
              Selling Price: {formatCurrency(product.sellingPrice)}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Movement Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: "IN", label: "Stock In", color: "green" },
                { value: "OUT", label: "Stock Out", color: "red" },
                { value: "RETURN", label: "Return", color: "blue" },
                { value: "ADJUSTMENT", label: "Adjustment", color: "orange" },
              ].map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setForm({ ...form, type: t.value })}
                  className={`px-3 py-2 rounded-lg text-sm font-medium border-2 transition-colors ${
                    form.type === t.value
                      ? t.color === "green"
                        ? "border-green-500 bg-green-50 text-green-700"
                        : t.color === "red"
                        ? "border-red-500 bg-red-50 text-red-700"
                        : t.color === "blue"
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-orange-500 bg-orange-50 text-orange-700"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Quantity *
            </label>
            <input
              required
              type="number"
              min="1"
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter quantity"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Reference
            </label>
            <input
              value={form.reference}
              onChange={(e) => setForm({ ...form, reference: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. PO-2024-001"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Note
            </label>
            <textarea
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              placeholder="Optional note"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg text-sm font-medium transition-colors"
            >
              {loading ? "Updating..." : "Update Stock"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}