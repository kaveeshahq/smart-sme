"use client";

import { useEffect, useState, useCallback } from "react";
import {
  UserCircle, Plus, Search, Eye,
  Edit, Trash2, Calendar, Clock, FileText,
} from "lucide-react";
import { formatCurrency, formatDate, getInitials, DEPARTMENTS } from "@/lib/utils";
import type { Employee } from "@/types";
import EmployeeModal from "@/components/employees/EmployeeModal";
import AttendanceModal from "@/components/employees/AttendanceModal";
import LeaveModal from "@/components/employees/LeaveModal";
import EmployeeDetailModal from "@/components/employees/EmployeeDetailModal";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"employees" | "attendance" | "leaves">("employees");
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [leaves, setLeaves] = useState<{
    id: number;
    type: string;
    startDate: string;
    endDate: string;
    reason?: string;
    status: string;
    employee: { firstName: string; lastName: string; department?: string };
  }[]>([]);
  const [leaveFilter, setLeaveFilter] = useState("PENDING");

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (department) params.set("department", department);
    const res = await fetch(`/api/employees?${params}`);
    const data = await res.json();
    if (data.success) setEmployees(data.data);
    setLoading(false);
  }, [search, department]);

  const fetchLeaves = useCallback(async () => {
    const params = new URLSearchParams();
    if (leaveFilter) params.set("status", leaveFilter);
    const res = await fetch(`/api/leaves?${params}`);
    const data = await res.json();
    if (data.success) setLeaves(data.data);
  }, [leaveFilter]);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);
  useEffect(() => { fetchLeaves(); }, [fetchLeaves]);

  async function handleLeaveAction(id: number, status: string) {
    await fetch(`/api/leaves/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, approvedBy: "Admin" }),
    });
    fetchLeaves();
  }

  async function handleDelete(id: number) {
    if (!confirm("Deactivate this employee?")) return;
    await fetch(`/api/employees/${id}`, { method: "DELETE" });
    fetchEmployees();
  }

  const roleColor: Record<string, string> = {
    ADMIN: "bg-yellow-100 text-yellow-700",
    MANAGER: "bg-blue-100 text-blue-700",
    EMPLOYEE: "bg-gray-100 text-gray-600",
  };

  const leaveStatusColor: Record<string, string> = {
    PENDING: "bg-yellow-100 text-yellow-700",
    APPROVED: "bg-green-100 text-green-700",
    REJECTED: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Employees</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage staff, attendance and leave requests
          </p>
        </div>
        <div className="flex gap-2">
          {activeTab === "attendance" && (
            <button
              onClick={() => setShowAttendanceModal(true)}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Clock size={16} />
              Mark Attendance
            </button>
          )}
          {activeTab === "leaves" && (
            <button
              onClick={() => setShowLeaveModal(true)}
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <FileText size={16} />
              New Leave Request
            </button>
          )}
          {activeTab === "employees" && (
            <button
              onClick={() => { setSelectedEmployee(null); setShowEmployeeModal(true); }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Plus size={16} />
              Add Employee
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Staff", value: employees.length, color: "bg-blue-500" },
          { label: "Active", value: employees.filter((e) => e.isActive).length, color: "bg-emerald-500" },
          { label: "Pending Leaves", value: leaves.filter((l) => l.status === "PENDING").length, color: "bg-yellow-500" },
          {
            label: "Total Payroll",
            value: formatCurrency(employees.reduce((s, e) => s + e.salary, 0)),
            color: "bg-violet-500",
            small: true,
          },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 flex items-center gap-3">
            <div className={`${s.color} text-white p-2.5 rounded-lg shrink-0`}>
              <UserCircle size={20} />
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

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {(["employees", "attendance", "leaves"] as const).map((tab) => (
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

      {/* Employees Tab */}
      {activeTab === "employees" && (
        <>
          <div className="flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-48">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search employees..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Departments</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Employee</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Department</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Position</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Contact</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">Salary</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-600">Role</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Hired</th>
                    <th className="text-center px-4 py-3 font-medium text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-gray-400">
                        Loading employees...
                      </td>
                    </tr>
                  ) : employees.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-12 text-gray-400">
                        No employees found
                      </td>
                    </tr>
                  ) : (
                    employees.map((emp) => (
                      <tr key={emp.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                              {getInitials(emp.firstName, emp.lastName)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-800">
                                {emp.firstName} {emp.lastName}
                              </p>
                              <p className="text-xs text-gray-400">{emp.user?.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-500">{emp.department || "—"}</td>
                        <td className="px-4 py-3 text-gray-500">{emp.position || "—"}</td>
                        <td className="px-4 py-3 text-gray-500 text-xs">{emp.phone || "—"}</td>
                        <td className="px-4 py-3 text-right font-medium text-gray-700">
                          {formatCurrency(emp.salary)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${roleColor[emp.user?.role || "EMPLOYEE"]}`}>
                            {emp.user?.role}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500 text-xs">
                          {formatDate(emp.hiredAt)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => { setSelectedEmployee(emp); setShowDetailModal(true); }}
                              className="p-1.5 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                              title="View"
                            >
                              <Eye size={14} />
                            </button>
                            <button
                              onClick={() => { setSelectedEmployee(emp); setShowEmployeeModal(true); }}
                              className="p-1.5 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => handleDelete(emp.id)}
                              className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                              title="Deactivate"
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
        </>
      )}

      {/* Attendance Tab */}
      {activeTab === "attendance" && (
        <AttendanceTab employees={employees} />
      )}

      {/* Leaves Tab */}
      {activeTab === "leaves" && (
        <>
          <div className="flex gap-2">
            {["PENDING", "APPROVED", "REJECTED", ""].map((s) => (
              <button
                key={s}
                onClick={() => setLeaveFilter(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  leaveFilter === s
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
              >
                {s || "All"}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Employee</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Type</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">From</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">To</th>
                  <th className="text-left px-4 py-3 font-medium text-gray-600">Reason</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="text-center px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {leaves.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-400">
                      No leave requests found
                    </td>
                  </tr>
                ) : (
                  leaves.map((leave) => (
                    <tr key={leave.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-800">
                        {leave.employee.firstName} {leave.employee.lastName}
                        <p className="text-xs text-gray-400">{leave.employee.department}</p>
                      </td>
                      <td className="px-4 py-3 text-gray-500">{leave.type}</td>
                      <td className="px-4 py-3 text-gray-500">{formatDate(leave.startDate)}</td>
                      <td className="px-4 py-3 text-gray-500">{formatDate(leave.endDate)}</td>
                      <td className="px-4 py-3 text-gray-500 text-xs max-w-32 truncate">
                        {leave.reason || "—"}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${leaveStatusColor[leave.status] || "bg-gray-100 text-gray-600"}`}>
                          {leave.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {leave.status === "PENDING" && (
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleLeaveAction(leave.id, "APPROVED")}
                              className="px-2 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded text-xs font-medium transition-colors"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleLeaveAction(leave.id, "REJECTED")}
                              className="px-2 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-xs font-medium transition-colors"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Modals */}
      {showEmployeeModal && (
        <EmployeeModal
          employee={selectedEmployee}
          onClose={() => { setShowEmployeeModal(false); setSelectedEmployee(null); fetchEmployees(); }}
        />
      )}
      {showAttendanceModal && (
        <AttendanceModal
          employees={employees}
          onClose={() => setShowAttendanceModal(false)}
        />
      )}
      {showLeaveModal && (
        <LeaveModal
          employees={employees}
          onClose={() => { setShowLeaveModal(false); fetchLeaves(); }}
        />
      )}
      {showDetailModal && selectedEmployee && (
        <EmployeeDetailModal
          employee={selectedEmployee}
          onClose={() => { setShowDetailModal(false); setSelectedEmployee(null); }}
        />
      )}
    </div>
  );
}

// ── Attendance Tab Component ──────────────────
function AttendanceTab({ employees }: { employees: Employee[] }) {
  const today = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(today);
  const [attendances, setAttendances] = useState<{
    id: number;
    status: string;
    checkIn?: string;
    checkOut?: string;
    employee: { firstName: string; lastName: string; department?: string };
  }[]>([]);

  useEffect(() => {
    fetch(`/api/attendance?date=${date}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setAttendances(d.data); });
  }, [date]);

  const statusColor: Record<string, string> = {
    PRESENT: "bg-green-100 text-green-700",
    ABSENT: "bg-red-100 text-red-700",
    LATE: "bg-yellow-100 text-yellow-700",
    HALF_DAY: "bg-orange-100 text-orange-700",
  };

  const presentCount = attendances.filter((a) => a.status === "PRESENT").length;
  const absentCount = attendances.filter((a) => a.status === "ABSENT").length;
  const lateCount = attendances.filter((a) => a.status === "LATE").length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-gray-400" />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex gap-3 text-sm">
          <span className="text-green-600 font-medium">✓ Present: {presentCount}</span>
          <span className="text-red-600 font-medium">✗ Absent: {absentCount}</span>
          <span className="text-yellow-600 font-medium">⚠ Late: {lateCount}</span>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-4 py-3 font-medium text-gray-600">Employee</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Department</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Check In</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Check Out</th>
              <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {employees.map((emp) => {
              const record = attendances.find((a) =>
                a.employee.firstName === emp.firstName &&
                a.employee.lastName === emp.lastName
              );
              return (
                <tr key={emp.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">
                        {getInitials(emp.firstName, emp.lastName)}
                      </div>
                      <span className="font-medium text-gray-800">
                        {emp.firstName} {emp.lastName}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{emp.department || "—"}</td>
                  <td className="px-4 py-3 text-gray-500">
                    {record?.checkIn
                      ? new Date(record.checkIn).toLocaleTimeString("en-LK", { hour: "2-digit", minute: "2-digit" })
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    {record?.checkOut
                      ? new Date(record.checkOut).toLocaleTimeString("en-LK", { hour: "2-digit", minute: "2-digit" })
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {record ? (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColor[record.status]}`}>
                        {record.status}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-400">
                        Not Marked
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}