"use client";

import { useEffect, useState } from "react";
import { X, ShoppingBag, Star, Phone, Mail, MapPin } from "lucide-react";
import type { Customer, Sale } from "@/types";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";

interface CustomerWithSales extends Customer {
  sales?: Sale[];
}

interface Props {
  customer: Customer;
  onClose: () => void;
}

export default function CustomerDetailModal({ customer, onClose }: Props) {
  const [detail, setDetail] = useState<CustomerWithSales | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/customers/${customer.id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setDetail(d.data);
        setLoading(false);
      });
  }, [customer.id]);

  const totalSpent = detail?.sales?.reduce((s, sale) => s + sale.total, 0) || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Customer Profile</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading...</div>
        ) : detail ? (
          <div className="p-6 space-y-5">
            {/* Profile Header */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-lg font-bold shrink-0">
                {getInitials(detail.firstName, detail.lastName)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  {detail.firstName} {detail.lastName}
                </h3>
                <div className="flex items-center gap-1 mt-0.5">
                  <Star size={12} className="text-yellow-500 fill-yellow-500" />
                  <span className="text-xs text-gray-500">
                    {detail.loyaltyPts} loyalty points
                  </span>
                </div>
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-2">
              {detail.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone size={14} className="text-gray-400 shrink-0" />
                  {detail.phone}
                </div>
              )}
              {detail.email && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail size={14} className="text-gray-400 shrink-0" />
                  {detail.email}
                </div>
              )}
              {(detail.address || detail.city) && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin size={14} className="text-gray-400 shrink-0" />
                  {[detail.address, detail.city].filter(Boolean).join(", ")}
                </div>
              )}
              {detail.nic && (
                <div className="text-sm text-gray-600">
                  <span className="text-gray-400">NIC: </span>
                  {detail.nic}
                </div>
              )}
              <div className="text-sm text-gray-600">
                <span className="text-gray-400">Member since: </span>
                {formatDate(detail.createdAt)}
              </div>
            </div>

            {/* Purchase Summary */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold text-blue-700">
                  {detail.sales?.length || 0}
                </p>
                <p className="text-xs text-blue-600 mt-0.5">Total Orders</p>
              </div>
              <div className="bg-emerald-50 rounded-xl p-3 text-center">
                <p className="text-lg font-bold text-emerald-700">
                  {formatCurrency(totalSpent)}
                </p>
                <p className="text-xs text-emerald-600 mt-0.5">Total Spent</p>
              </div>
            </div>

            {/* Purchase History */}
            <div>
              <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                <ShoppingBag size={16} />
                Purchase History
              </h4>
              {detail.sales && detail.sales.length > 0 ? (
                <div className="space-y-2">
                  {detail.sales.map((sale) => (
                    <div
                      key={sale.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-700">
                          {sale.invoiceNo}
                        </p>
                        <p className="text-xs text-gray-400">
                          {formatDate(sale.soldAt)} · {sale.items.length} item(s) · {sale.paymentMethod}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-800">
                          {formatCurrency(sale.total)}
                        </p>
                        <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                          sale.status === "COMPLETED"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}>
                          {sale.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-400 text-sm py-6">
                  No purchase history yet
                </p>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}