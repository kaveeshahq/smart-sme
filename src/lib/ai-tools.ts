import { prisma } from "@/lib/prisma";
import type { FunctionDeclaration, Type } from "@google/genai";

export const aiTools: FunctionDeclaration[] = [
  {
    name: "get_business_summary",
    description: "Get an overview of revenue, expenses, profit and sales count for the current month and last month.",
    parameters: { type: "object" as Type, properties: {} },
  },
  {
    name: "search_products",
    description: "Search inventory products by name or SKU, or list low stock products.",
    parameters: {
      type: "object" as Type,
      properties: {
        query: { type: "string" as Type, description: "Product name or SKU to search for. Leave empty to list all." },
        lowStockOnly: { type: "boolean" as Type, description: "If true, only return products at or below their low stock threshold." },
      },
    },
  },
  {
    name: "search_customers",
    description: "Search customers by name, phone or email, and get their purchase history and loyalty points.",
    parameters: {
      type: "object" as Type,
      properties: {
        query: { type: "string" as Type, description: "Customer name, phone or email to search for." },
      },
    },
  },
  {
    name: "get_recent_sales",
    description: "Get the most recent sales transactions with totals and items.",
    parameters: {
      type: "object" as Type,
      properties: {
        limit: { type: "number" as Type, description: "How many recent sales to return. Default 5." },
      },
    },
  },
  {
    name: "get_employee_info",
    description: "Search employees by name or department, and check pending leave requests.",
    parameters: {
      type: "object" as Type,
      properties: {
        query: { type: "string" as Type, description: "Employee name or department to search for." },
      },
    },
  },
  {
    name: "get_top_selling_products",
    description: "Get the best selling products by quantity sold in the last N days.",
    parameters: {
      type: "object" as Type,
      properties: {
        days: { type: "number" as Type, description: "How many days back to look. Default 30." },
      },
    },
  },
];

export async function executeAiTool(name: string, args: Record<string, unknown>) {
  switch (name) {
    case "get_business_summary": {
      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

      const [thisMonthRev, lastMonthRev, expenses] = await Promise.all([
        prisma.sale.aggregate({
          where: { soldAt: { gte: thisMonth }, status: "COMPLETED" },
          _sum: { total: true },
          _count: true,
        }),
        prisma.sale.aggregate({
          where: { soldAt: { gte: lastMonth, lte: lastMonthEnd }, status: "COMPLETED" },
          _sum: { total: true },
        }),
        prisma.expense.aggregate({
          where: { date: { gte: thisMonth } },
          _sum: { amount: true },
        }),
      ]);

      const revenue = thisMonthRev._sum.total || 0;
      const expenseTotal = expenses._sum.amount || 0;

      return {
        revenueThisMonth: revenue,
        revenueLastMonth: lastMonthRev._sum.total || 0,
        salesCountThisMonth: thisMonthRev._count,
        expensesThisMonth: expenseTotal,
        netProfit: revenue - expenseTotal,
        currency: "LKR",
      };
    }

    case "search_products": {
      const query = (args.query as string) || "";
      const lowStockOnly = args.lowStockOnly as boolean;

      const products = await prisma.product.findMany({
        where: {
          isActive: true,
          ...(query && {
            OR: [
              { name: { contains: query } },
              { sku: { contains: query } },
            ],
          }),
        },
        select: {
          name: true, sku: true, stockQty: true,
          lowStockAlert: true, sellingPrice: true, unit: true,
        },
        take: 15,
      });

      const filtered = lowStockOnly
        ? products.filter((p) => p.stockQty <= p.lowStockAlert)
        : products;

      return { products: filtered, count: filtered.length, currency: "LKR" };
    }

    case "search_customers": {
      const query = (args.query as string) || "";
      const customers = await prisma.customer.findMany({
        where: {
          isActive: true,
          ...(query && {
            OR: [
              { firstName: { contains: query } },
              { lastName: { contains: query } },
              { phone: { contains: query } },
              { email: { contains: query } },
            ],
          }),
        },
        select: {
          firstName: true, lastName: true, phone: true,
          email: true, loyaltyPts: true,
          _count: { select: { sales: true } },
        },
        take: 10,
      });

      return { customers, count: customers.length };
    }

    case "get_recent_sales": {
      const limit = (args.limit as number) || 5;
      const sales = await prisma.sale.findMany({
        where: { status: "COMPLETED" },
        orderBy: { soldAt: "desc" },
        take: Math.min(limit, 20),
        include: {
          customer: { select: { firstName: true, lastName: true } },
          items: { select: { quantity: true, product: { select: { name: true } } } },
        },
      });

      return {
        sales: sales.map((s) => ({
          invoiceNo: s.invoiceNo,
          customer: s.customer ? `${s.customer.firstName} ${s.customer.lastName}` : "Walk-in",
          total: s.total,
          paymentMethod: s.paymentMethod,
          soldAt: s.soldAt,
          itemCount: s.items.length,
        })),
        currency: "LKR",
      };
    }

    case "get_employee_info": {
      const query = (args.query as string) || "";
      const [employees, pendingLeaves] = await Promise.all([
        prisma.employee.findMany({
          where: {
            isActive: true,
            ...(query && {
              OR: [
                { firstName: { contains: query } },
                { lastName: { contains: query } },
                { department: { contains: query } },
              ],
            }),
          },
          select: {
            firstName: true, lastName: true, department: true,
            position: true, salary: true,
            user: { select: { role: true } },
          },
          take: 15,
        }),
        prisma.leave.count({ where: { status: "PENDING" } }),
      ]);

      return { employees, pendingLeaveRequests: pendingLeaves, currency: "LKR" };
    }

    case "get_top_selling_products": {
      const days = (args.days as number) || 30;
      const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const grouped = await prisma.saleItem.groupBy({
        by: ["productId"],
        where: { sale: { soldAt: { gte: since }, status: "COMPLETED" } },
        _sum: { quantity: true, total: true },
        orderBy: { _sum: { quantity: "desc" } },
        take: 5,
      });

      const withNames = await Promise.all(
        grouped.map(async (g) => {
          const product = await prisma.product.findUnique({
            where: { id: g.productId },
            select: { name: true },
          });
          return {
            name: product?.name || "Unknown",
            quantitySold: g._sum.quantity || 0,
            revenue: g._sum.total || 0,
          };
        })
      );

      return { topProducts: withNames, periodDays: days, currency: "LKR" };
    }

    default:
      return { error: `Unknown tool: ${name}` };
  }
}