"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Users, Plus, Search, Eye,
  Edit, Trash2, Star, Phone, Mail, MapPin,
} from "lucide-react";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";
import type { Customer } from "@/types";
import CustomerModal from "@/components/customers/CustomerModal";
import CustomerDetailModal from "@/components/customers/CustomerDetailModal";

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [detailCustomer, setDetailCustomer] = useState<Customer | null>(null);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    const res = await fetch(`/api/customers?${params}`);
    const data = await res.json();
    if (data.success) setCustomers(data.data);
    setLoading(false);
  }, [search]);

  useEffect(() => { fetchCustomers(); }, [fetchCustomers]);

  function handleEdit(customer: Customer) {
    setSelectedCustomer(customer);
    setShowModal(true);
  }

  function handleView(customer: Customer) {
    setDetailCustomer(customer);
    setShowDetail(true);
  }

  async function handleDelete(id: number) {
    if (!confirm("Deactivate this customer?")) return;
    await fetch(`/api/customers/${id}`, { method: "DELETE" });
    fetchCustomers();
  }

  function handleModalClose() {
    setShowModal(false);
    setSelectedCustomer(null);
    fetchCustomers();
  }

  const totalLoyaltyPts = customers.reduce((s, c) => s + c.loyaltyPts, 0);
  const topCustomer = [...customers].sort((a, b) => b.loyaltyPts - a.loyaltyPts)[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Customers</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage customer profiles and purchase history
          </p>
        </div>
        <button
          onClick={() => { setSelectedCustomer(null); setShowModal(true); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={16} />
          Add Customer
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Total Customers",
            value: customers.length,
            icon: <Users size={20} />,
            color: "bg-blue-500",
          },
          {
            label: "Active Customers",
            value: customers.filter((c) => c.isActive).length,
            icon: <Star size={20} />,
            color: "bg-emerald-500",
          },
          {
            label: "Total Loyalty Pts",
            value: totalLoyaltyPts.toLocaleString(),
            icon: <Star size={20} />,
            color: "bg-yellow-500",
          },
          {
            label: "Top Customer",
            value: topCustomer
              ? `${topCustomer.firstName} ${topCustomer.lastName}`
              : "—",
            icon: <Users size={20} />,
            color: "bg-violet-500",
            small: true,
          },
        ].map((s) => (
          <div
            key={s.label}
            className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3"
          >
            <div className={`${s.color} text-white p-2.5 rounded-lg shrink-0`}>
              {s.icon}
            </div>
            <div className="min-w-0">
              <p className="text-xs text-gray-500">{s.label}</p>
              <p className={`font-bold text-gray-800 truncate ${s.small ? "text-sm" : "text-xl"}`}>
                {s.value}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Search + View Toggle */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-48">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, phone or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
          {(["table", "grid"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1 rounded text-xs font-medium capitalize transition-colors ${
                viewMode === mode
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Table View */}
      {viewMode === "table" && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Customer</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Contact</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">City</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Loyalty Pts</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Joined</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-400">
                      Loading customers...
                    </td>
                  </tr>
                ) : customers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-400">
                      No customers found
                    </td>
                  </tr>
                ) : (
                  customers.map((customer) => (
                    <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                            {getInitials(customer.firstName, customer.lastName)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">
                              {customer.firstName} {customer.lastName}
                            </p>
                            {customer.nic && (
                              <p className="text-xs text-gray-400">{customer.nic}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="space-y-0.5">
                          {customer.phone && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Phone size={10} />
                              {customer.phone}
                            </div>
                          )}
                          {customer.email && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Mail size={10} />
                              {customer.email}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-sm">
                        <div className="flex items-center gap-1">
                          {customer.city && <MapPin size={11} className="text-gray-400" />}
                          {customer.city || "—"}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full text-xs font-medium">
                          <Star size={10} />
                          {customer.loyaltyPts}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-500 text-sm">
                        {formatDate(customer.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          customer.isActive
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}>
                          {customer.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => handleView(customer)}
                            className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                            title="View History"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => handleEdit(customer)}
                            className="p-1.5 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(customer.id)}
                            className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Grid View */}
      {viewMode === "grid" && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {loading ? (
            <p className="col-span-full text-center text-gray-400 py-12">Loading...</p>
          ) : customers.length === 0 ? (
            <p className="col-span-full text-center text-gray-400 py-12">No customers found</p>
          ) : (
            customers.map((customer) => (
              <div
                key={customer.id}
                className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                    {getInitials(customer.firstName, customer.lastName)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-800 truncate">
                      {customer.firstName} {customer.lastName}
                    </p>
                    <p className="text-xs text-gray-400">{customer.city || "No city"}</p>
                  </div>
                </div>

                <div className="space-y-1.5 mb-3">
                  {customer.phone && (
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Phone size={11} className="shrink-0" />
                      {customer.phone}
                    </div>
                  )}
                  {customer.email && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 truncate">
                      <Mail size={11} className="shrink-0" />
                      {customer.email}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                  <span className="inline-flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-full text-xs font-medium">
                    <Star size={10} />
                    {customer.loyaltyPts} pts
                  </span>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleView(customer)}
                      className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg"
                    >
                      <Eye size={13} />
                    </button>
                    <button
                      onClick={() => handleEdit(customer)}
                      className="p-1.5 hover:bg-gray-100 text-gray-600 rounded-lg"
                    >
                      <Edit size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Modals */}
      {showModal && (
        <CustomerModal
          customer={selectedCustomer}
          onClose={handleModalClose}
        />
      )}
      {showDetail && detailCustomer && (
        <CustomerDetailModal
          customer={detailCustomer}
          onClose={() => { setShowDetail(false); setDetailCustomer(null); }}
        />
      )}
    </div>
  );
}