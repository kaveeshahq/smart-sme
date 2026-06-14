// ─── Auth ───────────────────────────────────
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  userId: number;
  email: string;
  role: string;
  name: string;
  employeeId?: number;
}

// ─── Employee ────────────────────────────────
export interface Employee {
  id: number;
  userId: number;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  nic?: string;
  department?: string;
  position?: string;
  salary: number;
  hiredAt: string;
  isActive: boolean;
  user: {
    email: string;
    role: string;
  };
}

// ─── Product ─────────────────────────────────
export interface Product {
  id: number;
  name: string;
  sku: string;
  description?: string;
  categoryId?: number;
  supplierId?: number;
  costPrice: number;
  sellingPrice: number;
  stockQty: number;
  lowStockAlert: number;
  unit: string;
  isActive: boolean;
  category?: Category;
  supplier?: Supplier;
  createdAt: string;
}

// ─── Category ────────────────────────────────
export interface Category {
  id: number;
  name: string;
  description?: string;
}

// ─── Supplier ────────────────────────────────
export interface Supplier {
  id: number;
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  isActive: boolean;
}

// ─── Customer ────────────────────────────────
export interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  nic?: string;
  loyaltyPts: number;
  isActive: boolean;
  createdAt: string;
}

// ─── Sale ────────────────────────────────────
export interface SaleItem {
  id?: number;
  productId: number;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
  product?: Product;
}

export interface Sale {
  id: number;
  invoiceNo: string;
  customerId?: number;
  customer?: Customer;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: string;
  status: string;
  note?: string;
  soldAt: string;
}

// ─── Expense ─────────────────────────────────
export interface Expense {
  id: number;
  title: string;
  amount: number;
  category: string;
  description?: string;
  date: string;
}

// ─── Attendance ──────────────────────────────
export interface Attendance {
  id: number;
  employeeId: number;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: string;
  note?: string;
  employee?: Employee;
}

// ─── Leave ───────────────────────────────────
export interface Leave {
  id: number;
  employeeId: number;
  type: string;
  startDate: string;
  endDate: string;
  reason?: string;
  status: string;
  approvedBy?: string;
  employee?: Employee;
}

// ─── Dashboard Stats ─────────────────────────
export interface DashboardStats {
  totalRevenue: number;
  totalSales: number;
  totalCustomers: number;
  totalProducts: number;
  lowStockCount: number;
  totalExpenses: number;
  netProfit: number;
  revenueGrowth: number;
}

// ─── API Response ────────────────────────────
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// ─── Pagination ──────────────────────────────
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}