"use client";

import { useState } from "react";
import { X, Plus, Trash2, Search } from "lucide-react";
import type { Customer, Product } from "@/types";
import { formatCurrency } from "@/lib/utils";

interface CartItem {
  productId: number;
  name: string;
  unitPrice: number;
  quantity: number;
  discount: number;
  total: number;
}

interface Props {
  customers: Customer[];
  products: Product[];
  onClose: () => void;
  onSuccess: () => void;
}

export default function NewSaleModal({ customers, products, onClose, onSuccess }: Props) {
  const [customerId, setCustomerId] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [productSearch, setProductSearch] = useState("");
  const [discount, setDiscount] = useState("0");
  const [tax, setTax] = useState("0");
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const filteredProducts = products.filter(
    (p) =>
      p.isActive &&
      p.stockQty > 0 &&
      (p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.sku.toLowerCase().includes(productSearch.toLowerCase()))
  );

  function addToCart(product: Product) {
    const existing = cart.find((i) => i.productId === product.id);
    if (existing) {
      setCart(
        cart.map((i) =>
          i.productId === product.id
            ? { ...i, quantity: i.quantity + 1, total: (i.quantity + 1) * i.unitPrice - i.discount }
            : i
        )
      );
    } else {
      setCart([
        ...cart,
        {
          productId: product.id,
          name: product.name,
          unitPrice: product.sellingPrice,
          quantity: 1,
          discount: 0,
          total: product.sellingPrice,
        },
      ]);
    }
    setProductSearch("");
  }

  function updateQuantity(productId: number, qty: number) {
    if (qty <= 0) {
      setCart(cart.filter((i) => i.productId !== productId));
      return;
    }
    setCart(
      cart.map((i) =>
        i.productId === productId
          ? { ...i, quantity: qty, total: qty * i.unitPrice - i.discount }
          : i
      )
    );
  }

  function removeFromCart(productId: number) {
    setCart(cart.filter((i) => i.productId !== productId));
  }

  const subtotal = cart.reduce((sum, i) => sum + i.total, 0);
  const discountAmt = parseFloat(discount) || 0;
  const taxAmt = parseFloat(tax) || 0;
  const grandTotal = subtotal - discountAmt + taxAmt;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (cart.length === 0) {
      setError("Add at least one product");
      return;
    }
    setError("");
    setLoading(true);

    const res = await fetch("/api/sales", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        customerId: customerId || null,
        items: cart.map((i) => ({
          productId: i.productId,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          discount: i.discount,
        })),
        discount: discountAmt,
        tax: taxAmt,
        paymentMethod,
        note,
      }),
    });

    const data = await res.json();
    if (!data.success) {
      setError(data.error || "Failed to create sale");
    } else {
      onSuccess();
    }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 shrink-0">
          <h2 className="text-lg font-semibold text-gray-800">New Sale</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={18} />
          </button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left — Product Search */}
          <div className="w-1/2 border-r border-gray-100 p-4 flex flex-col overflow-hidden">
            <div className="relative mb-3">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products to add..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-1">
              {filteredProducts.slice(0, 20).map((p) => (
                <button
                  key={p.id}
                  onClick={() => addToCart(p)}
                  className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-blue-50 rounded-lg text-left transition-colors group"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-700 group-hover:text-blue-700">
                      {p.name}
                    </p>
                    <p className="text-xs text-gray-400">
                      {p.sku} · Stock: {p.stockQty} {p.unit}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-800">
                      {formatCurrency(p.sellingPrice)}
                    </p>
                    <Plus size={14} className="ml-auto text-blue-500 opacity-0 group-hover:opacity-100" />
                  </div>
                </button>
              ))}
              {filteredProducts.length === 0 && (
                <p className="text-center text-gray-400 text-sm py-8">No products found</p>
              )}
            </div>
          </div>

          {/* Right — Cart + Summary */}
          <div className="w-1/2 p-4 flex flex-col overflow-hidden">
            {error && (
              <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs">
                {error}
              </div>
            )}

            {/* Customer */}
            <div className="mb-3">
              <label className="block text-xs font-medium text-gray-600 mb-1">Customer</label>
              <select
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Walk-in Customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.firstName} {c.lastName} {c.phone ? `· ${c.phone}` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto space-y-2 mb-3">
              {cart.length === 0 ? (
                <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
                  Search and add products on the left
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.productId} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-start justify-between mb-2">
                      <p className="text-sm font-medium text-gray-700 flex-1 mr-2">
                        {item.name}
                      </p>
                      <button
                        onClick={() => removeFromCart(item.productId)}
                        className="text-red-400 hover:text-red-600 transition-colors shrink-0"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="w-6 h-6 rounded bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 text-xs font-bold"
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="w-6 h-6 rounded bg-white border border-gray-200 text-gray-600 hover:bg-gray-100 text-xs font-bold"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-xs text-gray-400">×</span>
                      <span className="text-xs text-gray-600">
                        {formatCurrency(item.unitPrice)}
                      </span>
                      <span className="ml-auto text-sm font-semibold text-gray-800">
                        {formatCurrency(item.total)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Totals */}
            <div className="border-t border-gray-100 pt-3 space-y-2 shrink-0">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Discount (LKR)</span>
                <input
                  type="number"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="w-28 px-2 py-1 border border-gray-200 rounded text-right text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  min="0"
                />
              </div>

              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Tax (LKR)</span>
                <input
                  type="number"
                  value={tax}
                  onChange={(e) => setTax(e.target.value)}
                  className="w-28 px-2 py-1 border border-gray-200 rounded text-right text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  min="0"
                />
              </div>

              <div className="flex justify-between font-bold text-gray-800 text-base border-t border-gray-100 pt-2">
                <span>Total</span>
                <span className="text-blue-600">{formatCurrency(grandTotal)}</span>
              </div>

              {/* Payment Method */}
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                {["CASH", "CARD", "BANK_TRANSFER", "CHEQUE"].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setPaymentMethod(m)}
                    className={`px-2 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                      paymentMethod === m
                        ? "border-blue-500 bg-blue-50 text-blue-700"
                        : "border-gray-200 text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    {m.replace("_", " ")}
                  </button>
                ))}
              </div>

              <input
                type="text"
                placeholder="Note (optional)"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="w-full px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-blue-500"
              />

              <button
                onClick={handleSubmit}
                disabled={loading || cart.length === 0}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
              >
                {loading ? "Processing..." : `Complete Sale · ${formatCurrency(grandTotal)}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}