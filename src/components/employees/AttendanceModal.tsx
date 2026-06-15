"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { Employee } from "@/types";

interface Props {
  employees: Employee[];
  onClose: () => void;
}

export default function AttendanceModal({ employees, onClose }: Props) {
  const today = new Date().toISOString().split("T")[0];
  const [form, setForm] = useState({
    employeeId: "", date: today,
    checkIn: "08:30", checkOut: "17:30",
    status: "PRESENT", note: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setSuccess("");
    setLoading(true);

    const dateTime = (time: string) =>
      new Date(`${form.date}T${time}:00`).toISOString();

    const res = await fetch("/api/attendance", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        employeeId: form.employeeId,
        date: new Date(form.date).toISOString(),
        checkIn: form.status !== "ABSENT" ? dateTime(form.checkIn) : null,
        checkOut: form.status !== "ABSENT" ? dateTime(form.checkOut) : null,
        status: form.status,
        note: form.note,
      }),
    });

    const data = await res.json();
    if (!data.success) {
      setError(data.error || "Failed");
    } else {
      setSuccess("Attendance marked successfully!");
      setForm({ ...form, employeeId: "" });
    }
    setLoading(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Mark Attendance</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">{error}</div>}
          {success && <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">{success}</div>}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee *</label>
            <select required value={form.employeeId}
              onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select employee</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.firstName} {e.lastName}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
            <input type="date" value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { value: "PRESENT", color: "green" },
                { value: "ABSENT", color: "red" },
                { value: "LATE", color: "yellow" },
                { value: "HALF_DAY", color: "orange" },
              ].map((s) => (
                <button key={s.value} type="button"
                  onClick={() => setForm({ ...form, status: s.value })}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border-2 transition-colors ${
                    form.status === s.value
                      ? s.color === "green" ? "border-green-500 bg-green-50 text-green-700"
                        : s.color === "red" ? "border-red-500 bg-red-50 text-red-700"
                        : s.color === "yellow" ? "border-yellow-500 bg-yellow-50 text-yellow-700"
                        : "border-orange-500 bg-orange-50 text-orange-700"
                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}>
                  {s.value.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>

          {form.status !== "ABSENT" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Check In</label>
                <input type="time" value={form.checkIn}
                  onChange={(e) => setForm({ ...form, checkIn: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Check Out</label>
                <input type="time" value={form.checkOut}
                  onChange={(e) => setForm({ ...form, checkOut: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
            <input value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Optional note" />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50">
              Close
            </button>
            <button type="submit" disabled={loading}
              className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white rounded-lg text-sm font-medium transition-colors">
              {loading ? "Saving..." : "Mark Attendance"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}