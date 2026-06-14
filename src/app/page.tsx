import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";
import {
  TrendingUp,
  ShoppingCart,
  Users,
  Package,
  AlertTriangle,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import DashboardCharts from "@/components/charts/DashboardCharts";

async function getDashboardStats() {
  const now = new Date();
  const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  const allProducts = await prisma.product.findMany({
    where: { isActive: true },
    select: { stockQty: true, lowStockAlert: true },
  });

  const lowStockProducts = allProducts.filter(
    (p) => p.stockQty <= p.lowStockAlert
  ).length;

  const [
    totalSalesThisMonth,
    totalSalesLastMonth,
    totalCustomers,
    totalProducts,
    totalExpensesThisMonth,
    recentSales,
  ] = await Promise.all([
    prisma.sale.aggregate({
      where: { soldAt: { gte: thisMonth }, status: "COMPLETED" },
      _sum: { total: true },
      _count: true,
    }),
    prisma.sale.aggregate({
      where: {
        soldAt: { gte: lastMonth, lte: lastMonthEnd },
        status: "COMPLETED",
      },
      _sum: { total: true },
    }),
    prisma.customer.count({ where: { isActive: true } }),
    prisma.product.count({ where: { isActive: true } }),
    prisma.expense.aggregate({
      where: { date: { gte: thisMonth } },
      _sum: { amount: true },
    }),
    prisma.sale.findMany({
      take: 5,
      orderBy: { soldAt: "desc" },
      where: { status: "COMPLETED" },
      include: { customer: true, items: true },
    }),
  ]);

  const revenue = totalSalesThisMonth._sum.total || 0;
  const lastRevenue = totalSalesLastMonth._sum.total || 0;
  const expenses = totalExpensesThisMonth._sum.amount || 0;
  const growth =
    lastRevenue > 0 ? ((revenue - lastRevenue) / lastRevenue) * 100 : 0;

  return {
    revenue,
    salesCount: totalSalesThisMonth._count,
    totalCustomers,
    totalProducts,
    lowStockProducts,
    expenses,
    netProfit: revenue - expenses,
    growth,
    recentSales,
  };
}

interface StatCard {
  label: string;
  value: string;
  icon: React.ReactNode;
  color: string;
  growth?: number;
  showGrowth: boolean;
}

export default async function RootPage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const stats = await getDashboardStats();

  const statCards: StatCard[] = [
    {
      label: "Revenue This Month",
      value: formatCurrency(stats.revenue),
      icon: <TrendingUp size={22} />,
      color: "bg-blue-500",
      growth: stats.growth,
      showGrowth: true,
    },
    {
      label: "Sales This Month",
      value: stats.salesCount.toString(),
      icon: <ShoppingCart size={22} />,
      color: "bg-violet-500",
      showGrowth: false,
    },
    {
      label: "Total Customers",
      value: stats.totalCustomers.toString(),
      icon: <Users size={22} />,
      color: "bg-emerald-500",
      showGrowth: false,
    },
    {
      label: "Total Products",
      value: stats.totalProducts.toString(),
      icon: <Package size={22} />,
      color: "bg-orange-500",
      showGrowth: false,
    },
    {
      label: "Net Profit",
      value: formatCurrency(stats.netProfit),
      icon: <DollarSign size={22} />,
      color: "bg-teal-500",
      showGrowth: false,
    },
    {
      label: "Low Stock Alerts",
      value: stats.lowStockProducts.toString(),
      icon: <AlertTriangle size={22} />,
      color: "bg-red-500",
      showGrowth: false,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Welcome back, {session?.name?.split(" ")[0]} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Here&apos;s what&apos;s happening with your business today.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 flex items-center gap-4"
          >
            <div className={`${card.color} text-white p-3 rounded-xl shrink-0`}>
              {card.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-gray-500 text-xs font-medium truncate">
                {card.label}
              </p>
              <p className="text-xl font-bold text-gray-800 mt-0.5">
                {card.value}
              </p>
              {card.showGrowth && card.growth !== undefined && (
                <div className="flex items-center gap-1 mt-1">
                  {card.growth >= 0 ? (
                    <ArrowUpRight size={14} className="text-emerald-500" />
                  ) : (
                    <ArrowDownRight size={14} className="text-red-500" />
                  )}
                  <span
                    className={`text-xs font-medium ${
                      card.growth >= 0 ? "text-emerald-500" : "text-red-500"
                    }`}
                  >
                    {Math.abs(card.growth).toFixed(1)}% vs last month
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <DashboardCharts />
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-800 mb-4">Recent Sales</h3>
          <div className="space-y-3">
            {stats.recentSales.map((sale) => (
              <div key={sale.id} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">
                    {sale.customer
                      ? `${sale.customer.firstName} ${sale.customer.lastName}`
                      : "Walk-in Customer"}
                  </p>
                  <p className="text-xs text-gray-400">
                    {sale.invoiceNo} · {sale.items.length} item(s)
                  </p>
                </div>
                <span className="text-sm font-semibold text-gray-800">
                  {formatCurrency(sale.total)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}