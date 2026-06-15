"use client";

import { useEffect, useState } from "react";
import { X, Mail, Phone, MapPin, Briefcase, Calendar } from "lucide-react";
import type { Employee } from "@/types";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";

interface EmployeeDetail extends Employee {
  attendances?: { status: string; date: string }[];
  leaves?: { type: string; status: string; startDate: string; endDate: string }[];
}

interface Props {
  employee: Employee;
  onClose: () => void;
}

export default function EmployeeDetailModal({ employee, onClose }: Props) {
  const [detail, setDetail] = useState<EmployeeDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/employees/${employee.id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setDetail(d.data);
        setLoading(false);
      });
  }, [employee.id]);

  const presentDays = detail?.attendances?.filter((a) => a.status === "PRESENT").length || 0;
  const absentDays = detail?.attendances?.filter((a) => a.status === "ABSENT").length || 0;

  const roleColor: Record<string, string> = {
    ADMIN: "bg-yellow-100 text-yellow-700",
    MANAGER: "bg-blue-100 text-blue-700",
    EMPLOYEE: "bg-gray-100 text-gray-600",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Employee Profile</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading...</div>
        ) : detail ? (
          <div className="p-6 space-y-5">
            {/* Header */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-lg font-bold shrink-0">
                {getInitials(detail.firstName, detail.lastName)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-800">
                  {detail.firstName} {detail.lastName}
                </h3>
                <p className="text-sm text-gray-500">{detail.position || "No position"}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-1 inline-block ${roleColor[detail.user?.role || "EMPLOYEE"]}`}>
                  {detail.user?.role}
                </span>
              </div>
            </div>

            {/* Info Grid */}
            <div className="bg-gray-50 rounded-xl p-4 space-y-2.5">
              {detail.user?.email && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail size={14} className="text-gray-400 shrink-0" />
                  {detail.user.email}
                </div>
              )}
              {detail.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone size={14} className="text-gray-400 shrink-0" />
                  {detail.phone}
                </div>
              )}
              {detail.address && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin size={14} className="text-gray-400 shrink-0" />
                  {detail.address}
                </div>
              )}
              {detail.department && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Briefcase size={14} className="text-gray-400 shrink-0" />
                  {detail.department}
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar size={14} className="text-gray-400 shrink-0" />
                Hired: {formatDate(detail.hiredAt)}
              </div>
            </div>

            {/* Salary */}
            <div className="bg-emerald-50 rounded-xl p-4 flex justify-between items-center">
              <span className="text-sm text-emerald-700 font-medium">Monthly Salary</span>
              <span className="text-lg font-bold text-emerald-800">
                {formatCurrency(detail.salary)}
              </span>
            </div>

            {/* Attendance Summary */}
            <div>
              <h4 className="font-medium text-gray-700 mb-3">
                Attendance (Last 30 Days)
              </h4>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Present", value: presentDays, color: "bg-green-50 text-green-700" },
                  { label: "Absent", value: absentDays, color: "bg-red-50 text-red-700" },
                  { label: "Total", value: detail.attendances?.length || 0, color: "bg-blue-50 text-blue-700" },
                ].map((s) => (
                  <div key={s.label} className={`${s.color} rounded-xl p-3 text-center`}>
                    <p className="text-2xl font-bold">{s.value}</p>
                    <p className="text-xs mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Leave History */}
            {detail.leaves && detail.leaves.length > 0 && (
              <div>
                <h4 className="font-medium text-gray-700 mb-3">Leave History</h4>
                <div className="space-y-2">
                  {detail.leaves.map((leave, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-gray-700">{leave.type}</p>
                        <p className="text-xs text-gray-400">
                          {formatDate(leave.startDate)} → {formatDate(leave.endDate)}
                        </p>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        leave.status === "APPROVED" ? "bg-green-100 text-green-700"
                          : leave.status === "REJECTED" ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}>
                        {leave.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}