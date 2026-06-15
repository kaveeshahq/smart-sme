"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Package, Plus, Search, AlertTriangle,
  Edit, Trash2, ArrowUpDown, Filter,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { Product, Category, Supplier } from "@/types";
import ProductModal from "@/components/inventory/ProductModal";
import StockModal from "@/components/inventory/StockModal";

export default function InventoryPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [showLowStock, setShowLowStock] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showProductModal, setShowProductModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeTab, setActiveTab] = useState<"products" | "suppliers">("products");

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (selectedCategory) params.set("categoryId", selectedCategory);
    if (showLowStock) params.set("lowStock", "true");

    const res = await fetch(`/api/inventory/products?${params}`);
    const data = await res.json();
    if (data.success) setProducts(data.data);
    setLoading(false);
  }, [search, selectedCategory, showLowStock]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    fetch("/api/inventory/categories")
      .then((r) => r.json())
      .then((d) => { if (d.success) setCategories(d.data); });
    fetch("/api/inventory/suppliers")
      .then((r) => r.json())
      .then((d) => { if (d.success) setSuppliers(d.data); });
  }, []);

  const lowStockCount = products.filter(
    (p) => p.stockQty <= p.lowStockAlert
  ).length;

  function handleEdit(product: Product) {
    setSelectedProduct(product);
    setShowProductModal(true);
  }

  function handleStockUpdate(product: Product) {
    setSelectedProduct(product);
    setShowStockModal(true);
  }

  function handleModalClose() {
    setShowProductModal(false);
    setSelectedProduct(null);
    fetchProducts();
  }

  function handleStockClose() {
    setShowStockModal(false);
    setSelectedProduct(null);
    fetchProducts();
  }

  async function handleDelete(id: number) {
    if (!confirm("Deactivate this product?")) return;
    await fetch(`/api/inventory/products/${id}`, { method: "DELETE" });
    fetchProducts();
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Inventory</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage products, stock levels and suppliers
          </p>
        </div>
        <button
          onClick={() => { setSelectedProduct(null); setShowProductModal(true); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Add Product
        </button>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Products", value: products.length, color: "bg-blue-500", icon: <Package size={20} /> },
          { label: "Low Stock", value: lowStockCount, color: "bg-red-500", icon: <AlertTriangle size={20} /> },
          { label: "Categories", value: categories.length, color: "bg-violet-500", icon: <Filter size={20} /> },
          { label: "Suppliers", value: suppliers.length, color: "bg-emerald-500", icon: <ArrowUpDown size={20} /> },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
            <div className={`${s.color} text-white p-2.5 rounded-lg`}>{s.icon}</div>
            <div>
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className="text-xl font-bold text-gray-800">{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {(["products", "suppliers"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
              activeTab === tab
                ? "bg-white text-gray-800 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === "products" && (
        <>
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <button
              onClick={() => setShowLowStock(!showLowStock)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
                showLowStock
                  ? "bg-red-50 border-red-300 text-red-700"
                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
              }`}
            >
              <AlertTriangle size={14} />
              Low Stock Only
            </button>
          </div>

          {/* Low stock alert banner */}
          {lowStockCount > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2">
              <AlertTriangle size={16} className="text-red-500 shrink-0" />
              <p className="text-sm text-red-700">
                <span className="font-semibold">{lowStockCount} product(s)</span> are running low on stock and need restocking.
              </p>
            </div>
          )}

          {/* Products Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Product</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">SKU</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Category</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">Cost</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">Price</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-600">Stock</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-gray-400">
                        Loading products...
                      </td>
                    </tr>
                  ) : products.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-gray-400">
                        No products found
                      </td>
                    </tr>
                  ) : (
                    products.map((product) => {
                      const isLow = product.stockQty <= product.lowStockAlert;
                      return (
                        <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-4 py-3">
                            <div>
                              <p className="font-medium text-gray-800">{product.name}</p>
                              {product.description && (
                                <p className="text-xs text-gray-400 truncate max-w-48">
                                  {product.description}
                                </p>
                              )}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                            {product.sku}
                          </td>
                          <td className="px-4 py-3 text-gray-500">
                            {product.category?.name || "—"}
                          </td>
                          <td className="px-4 py-3 text-right text-gray-600">
                            {formatCurrency(product.costPrice)}
                          </td>
                          <td className="px-4 py-3 text-right font-medium text-gray-800">
                            {formatCurrency(product.sellingPrice)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                              isLow
                                ? "bg-red-100 text-red-700"
                                : "bg-green-100 text-green-700"
                            }`}>
                              {isLow && <AlertTriangle size={10} />}
                              {product.stockQty} {product.unit}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              product.isActive
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-500"
                            }`}>
                              {product.isActive ? "Active" : "Inactive"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => handleStockUpdate(product)}
                                className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors text-xs font-medium"
                                title="Update Stock"
                              >
                                Stock
                              </button>
                              <button
                                onClick={() => handleEdit(product)}
                                className="p-1.5 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors"
                                title="Edit"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                onClick={() => handleDelete(product.id)}
                                className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                                title="Delete"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === "suppliers" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Supplier</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Contact</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Phone</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">City</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Products</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {suppliers.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-800">{s.name}</td>
                    <td className="px-4 py-3 text-gray-500">{s.contactName || "—"}</td>
                    <td className="px-4 py-3 text-gray-500">{s.email || "—"}</td>
                    <td className="px-4 py-3 text-gray-500">{s.phone || "—"}</td>
                    <td className="px-4 py-3 text-gray-500">{s.city || "—"}</td>
                    <td className="px-4 py-3 text-center text-gray-500">
                      {(s as Supplier & { _count?: { products: number } })._count?.products ?? 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      {showProductModal && (
        <ProductModal
          product={selectedProduct}
          categories={categories}
          suppliers={suppliers}
          onClose={handleModalClose}
        />
      )}
      {showStockModal && selectedProduct && (
        <StockModal product={selectedProduct} onClose={handleStockClose} />
      )}
    </div>
  );
}