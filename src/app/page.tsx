import Link from "next/link";
import {
  BarChart3, Package, Users, ShoppingCart,
  DollarSign, Shield, Zap, Globe, ArrowRight,
  CheckCircle, TrendingUp, UserCircle, LayoutDashboard,
  ChevronRight, Star,
} from "lucide-react";
import { getSession } from "@/lib/auth";
import HomeNavbar from "@/components/layout/HomeNavbar";

export default async function HomePage() {
  const session = await getSession();

  return (
    <div className="min-h-screen bg-white">

      {/* ── NAVBAR ── */}
      <HomeNavbar session={session} />

      {/* ── HERO ── */}
      <section className="pt-28 pb-24 px-6 bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-20 animate-pulse" />
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-400 rounded-full blur-3xl opacity-20 animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-violet-500 rounded-full blur-3xl opacity-10 animate-pulse" style={{ animationDelay: "0.5s" }} />
          <div
            className="absolute inset-0 opacity-5"
            style={{
              backgroundImage: "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
        </div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-800/50 border border-blue-700/50 text-blue-200 text-xs font-medium px-4 py-2 rounded-full mb-8 backdrop-blur-sm">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              Designed for Sri Lankan SMEs 🇱🇰
              <ChevronRight size={12} />
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
              Run Your Business
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-violet-300 to-indigo-300">
                Smarter & Faster
              </span>
            </h1>

            <p className="text-blue-100 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
              One centralized platform to manage inventory, sales, customers,
              employees and finances. Replace Excel sheets and paper records forever.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              {session ? (
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 bg-white text-blue-900 font-bold px-8 py-4 rounded-2xl hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl text-sm group"
                >
                  Go to Dashboard
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-2 bg-white text-blue-900 font-bold px-8 py-4 rounded-2xl hover:bg-blue-50 transition-all shadow-xl hover:shadow-2xl text-sm group"
                >
                  Start Managing Now
                  <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
              <Link
                href="/dashboard"
                className="flex items-center gap-2 border border-blue-400/50 text-blue-100 font-medium px-8 py-4 rounded-2xl hover:bg-blue-800/50 transition-colors text-sm backdrop-blur-sm"
              >
                <LayoutDashboard size={16} />
                View Live Dashboard
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { value: "6+", label: "Core Modules" },
              { value: "LKR", label: "Local Currency" },
              { value: "3", label: "Access Roles" },
              { value: "100%", label: "Cloud Based" },
            ].map((s) => (
              <div key={s.label} className="text-center bg-blue-800/30 backdrop-blur-sm border border-blue-700/30 rounded-2xl py-4 px-3">
                <p className="text-3xl font-bold text-white">{s.value}</p>
                <p className="text-blue-300 text-xs mt-1 font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── QUICK ACCESS TILES ── */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Everything in One Place
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Jump directly into any module or explore the full dashboard
            </p>
          </div>

          <Link href="/dashboard" className="block mb-4 group">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 flex items-center justify-between hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <LayoutDashboard size={24} className="text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-lg">Main Dashboard</p>
                  <p className="text-blue-200 text-sm">Revenue, sales overview, recent activity and key metrics</p>
                </div>
              </div>
              <ArrowRight size={20} className="text-white group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: <Package size={24} />,
                label: "Inventory",
                href: "/inventory",
                desc: "Products, stock levels, suppliers",
                light: "bg-orange-50",
                border: "border-orange-100",
                iconBg: "bg-orange-500",
                features: ["Product catalog", "Stock tracking", "Low stock alerts"],
              },
              {
                icon: <ShoppingCart size={24} />,
                label: "Sales",
                href: "/sales",
                desc: "Transactions, invoices, POS",
                light: "bg-blue-50",
                border: "border-blue-100",
                iconBg: "bg-blue-500",
                features: ["New sale / POS", "Invoice history", "Payment tracking"],
              },
              {
                icon: <Users size={24} />,
                label: "Customers",
                href: "/customers",
                desc: "Profiles, history, loyalty points",
                light: "bg-emerald-50",
                border: "border-emerald-100",
                iconBg: "bg-emerald-500",
                features: ["Customer profiles", "Purchase history", "Loyalty points"],
              },
              {
                icon: <UserCircle size={24} />,
                label: "Employees",
                href: "/employees",
                desc: "Staff, attendance, leave",
                light: "bg-violet-50",
                border: "border-violet-100",
                iconBg: "bg-violet-500",
                features: ["Employee records", "Attendance", "Leave management"],
              },
              {
                icon: <DollarSign size={24} />,
                label: "Finance",
                href: "/finance",
                desc: "Revenue, expenses, profit & loss",
                light: "bg-teal-50",
                border: "border-teal-100",
                iconBg: "bg-teal-500",
                features: ["Expense tracking", "P&L overview", "Monthly reports"],
              },
              {
                icon: <BarChart3 size={24} />,
                label: "Analytics",
                href: "/analytics",
                desc: "Trends, insights, performance",
                light: "bg-rose-50",
                border: "border-rose-100",
                iconBg: "bg-rose-500",
                features: ["Sales trends", "Best sellers", "Customer growth"],
              },
            ].map((module) => (
              <Link
                key={module.label}
                href={module.href}
                className={`group block ${module.light} border ${module.border} rounded-2xl p-5 hover:shadow-md transition-all`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`${module.iconBg} text-white w-11 h-11 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform`}>
                    {module.icon}
                  </div>
                  <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all mt-1" />
                </div>
                <h3 className="font-bold text-gray-800 text-base mb-1">{module.label}</h3>
                <p className="text-gray-500 text-xs mb-3">{module.desc}</p>
                <ul className="space-y-1">
                  {module.features.map((f) => (
                    <li key={f} className="flex items-center gap-1.5 text-xs text-gray-500">
                      <CheckCircle size={10} className="text-green-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY SMART SME ── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Why Smart SME?</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Built specifically for Sri Lankan small and medium enterprises
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Zap size={24} />,
                color: "text-yellow-500",
                bg: "bg-yellow-50",
                title: "Fast & Lightweight",
                desc: "Built with Next.js 16 for blazing fast performance on any device.",
              },
              {
                icon: <Shield size={24} />,
                color: "text-blue-500",
                bg: "bg-blue-50",
                title: "Secure by Default",
                desc: "JWT auth with role-based access — Admin, Manager, Employee.",
              },
              {
                icon: <Globe size={24} />,
                color: "text-emerald-500",
                bg: "bg-emerald-50",
                title: "Cloud Based",
                desc: "Access your business data from anywhere, anytime.",
              },
              {
                icon: <TrendingUp size={24} />,
                color: "text-violet-500",
                bg: "bg-violet-50",
                title: "Real-time Insights",
                desc: "Live dashboards and analytics to drive smart decisions.",
              },
            ].map((item) => (
              <div key={item.title} className="text-center p-6 rounded-2xl border border-gray-100 hover:shadow-md transition-shadow">
                <div className={`${item.bg} w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4`}>
                  <span className={item.color}>{item.icon}</span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ROLE ACCESS ── */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Role-Based Access Control</h2>
            <p className="text-gray-500">Every user sees exactly what they need</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                role: "Admin", icon: "👑",
                bg: "bg-yellow-50", border: "border-yellow-200",
                badge: "bg-yellow-100 text-yellow-800",
                access: ["Full system access", "Manage all employees", "View all reports", "Finance & expenses", "Analytics dashboard", "System settings"],
              },
              {
                role: "Manager", icon: "🎯",
                bg: "bg-blue-50", border: "border-blue-200",
                badge: "bg-blue-100 text-blue-800",
                access: ["Inventory management", "Sales & invoices", "Customer management", "Employee oversight", "Finance reports", "Analytics view"],
              },
              {
                role: "Employee", icon: "👤",
                bg: "bg-emerald-50", border: "border-emerald-200",
                badge: "bg-emerald-100 text-emerald-800",
                access: ["View inventory", "Create sales", "View customers", "Own attendance", "Leave requests", "Dashboard view"],
              },
            ].map((r) => (
              <div key={r.role} className={`${r.bg} border ${r.border} rounded-2xl p-6`}>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-2xl">{r.icon}</span>
                  <span className={`${r.badge} text-sm font-bold px-3 py-1 rounded-full`}>{r.role}</span>
                </div>
                <ul className="space-y-2">
                  {r.access.map((a) => (
                    <li key={a} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle size={13} className="text-green-500 shrink-0" />
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TESTIMONIAL ── */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={20} className="text-yellow-400 fill-yellow-400" />
            ))}
          </div>
          <blockquote className="text-xl text-gray-700 font-medium italic mb-6">
            &ldquo;Smart SME replaced all our Excel sheets and manual records.
            Now we can see our entire business at a glance.&rdquo;
          </blockquote>
          <p className="text-gray-500 text-sm">— Kavindu Perera, Business Owner · Colombo 🇱🇰</p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 px-6 bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 right-10 w-64 h-64 bg-blue-500 rounded-full blur-3xl opacity-20" />
          <div className="absolute bottom-10 left-10 w-64 h-64 bg-indigo-400 rounded-full blur-3xl opacity-20" />
        </div>
        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Transform Your Business?</h2>
          <p className="text-blue-200 mb-8 text-lg">
            Join smart Sri Lankan SMEs already running on Smart SME.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {session ? (
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center gap-2 bg-white text-blue-900 font-bold px-8 py-4 rounded-2xl hover:bg-blue-50 transition-all shadow-xl group"
              >
                Go to Dashboard
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 bg-white text-blue-900 font-bold px-8 py-4 rounded-2xl hover:bg-blue-50 transition-all shadow-xl group"
              >
                Get Started Free
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            )}
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 border border-blue-400/50 text-blue-100 font-medium px-8 py-4 rounded-2xl hover:bg-blue-800/50 transition-colors"
            >
              <LayoutDashboard size={16} />
              Explore Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-10 px-6 bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <BarChart3 size={16} className="text-white" />
              </div>
              <span className="font-bold text-white">Smart SME</span>
              <span className="text-gray-500 text-sm">· Management System</span>
            </div>
            <div className="flex gap-6">
              {[
                { label: "Dashboard", href: "/dashboard" },
                { label: "Inventory", href: "/inventory" },
                { label: "Sales", href: "/sales" },
                { label: "Finance", href: "/finance" },
                { label: "Analytics", href: "/analytics" },
              ].map((link) => (
                <Link key={link.label} href={link.href}
                  className="text-gray-400 hover:text-white text-sm transition-colors">
                  {link.label}
                </Link>
              ))}
            </div>
            <p className="text-gray-500 text-sm">© 2026 Smart SME · Sri Lanka 🇱🇰</p>
          </div>
        </div>
      </footer>
    </div>
  );
}