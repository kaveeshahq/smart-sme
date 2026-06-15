"use client";

import { X, Printer } from "lucide-react";
import type { Sale } from "@/types";
import { formatCurrency, formatDateTime } from "@/lib/utils";

interface Props {
  sale: Sale;
  onClose: () => void;
}

export default function SaleDetailModal({ sale, onClose }: Props) {
  function handlePrint() {
    window.print();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Invoice Details</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
              title="Print"
            >
              <Printer size={16} />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Invoice Info */}
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-blue-600 font-medium">INVOICE</p>
                <p className="text-lg font-bold text-blue-900">{sale.invoiceNo}</p>
                <p className="text-xs text-blue-600 mt-1">
                  {formatDateTime(sale.soldAt)}
                </p>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                sale.status === "COMPLETED"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-600"
              }`}>
                {sale.status}
              </span>
            </div>
          </div>

          {/* Customer */}
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">
              Customer
            </p>
            <p className="text-sm font-medium text-gray-800">
              {sale.customer
                ? `${sale.customer.firstName} ${sale.customer.lastName}`
                : "Walk-in Customer"}
            </p>
            {sale.customer?.phone && (
              <p className="text-xs text-gray-400">{sale.customer.phone}</p>
            )}
          </div>

          {/* Items */}
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              Items
            </p>
            <div className="space-y-2">
              {sale.items.map((item, i) => (
                <div key={i} className="flex justify-between items-center py-2 border-b border-gray-50">
                  <div>
                    <p className="text-sm text-gray-700">{item.product?.name}</p>
                    <p className="text-xs text-gray-400">
                      {item.quantity} × {formatCurrency(item.unitPrice)}
                    </p>
                  </div>
                  <span className="text-sm font-medium text-gray-800">
                    {formatCurrency(item.total)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="space-y-1.5 pt-2">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span>
              <span>{formatCurrency(sale.subtotal)}</span>
            </div>
            {sale.discount > 0 && (
              <div className="flex justify-between text-sm text-green-600">
                <span>Discount</span>
                <span>− {formatCurrency(sale.discount)}</span>
              </div>
            )}
            {sale.tax > 0 && (
              <div className="flex justify-between text-sm text-gray-500">
                <span>Tax</span>
                <span>{formatCurrency(sale.tax)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-gray-800 text-base border-t border-gray-100 pt-2">
              <span>Total</span>
              <span className="text-blue-600">{formatCurrency(sale.total)}</span>
            </div>
          </div>

          {/* Payment */}
          <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
            <span className="text-sm text-gray-600">Payment Method</span>
            <span className="text-sm font-semibold text-gray-800">
              {sale.paymentMethod.replace("_", " ")}
            </span>
          </div>

          {sale.note && (
            <div className="bg-yellow-50 rounded-lg p-3">
              <p className="text-xs text-yellow-700 font-medium mb-1">Note</p>
              <p className="text-sm text-yellow-800">{sale.note}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}