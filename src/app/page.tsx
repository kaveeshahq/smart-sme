import Link from "next/link";
import {
  BarChart3, Package, Users, ShoppingCart,
  DollarSign, Shield, Zap, Globe, ArrowRight,
  CheckCircle, TrendingUp, UserCircle,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">

      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <BarChart3 size={18} className="text-white" />
            </div>
            <span className="font-bold text-gray-900 text-lg">Smart SME</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-gray-600 hover:text-gray-900 font-medium px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/login"
              className="text-sm bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="pt-32 pb-20 px-6 bg-gradient-to-br from-blue-950 via-blue-900 to-indigo-900 relative overflow-hidden">
        {/* Animated blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-96 h-96 bg-blue-500 rounded-full blur-3xl opacity-20 animate-pulse" />
          <div className="absolute bottom-10 right-10 w-80 h-80 bg-indigo-400 rounded-full blur-3xl opacity-20 animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-violet-500 rounded-full blur-3xl opacity-10 animate-pulse delay-500" />
        </div>

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-800/50 border border-blue-700 text-blue-200 text-xs font-medium px-4 py-1.5 rounded-full mb-8">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            Built for Sri Lankan SMEs 🇱🇰
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
            Run Your Business
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-blue-300 to-violet-300">
              Smarter & Faster
            </span>
          </h1>

          <p className="text-blue-100 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            One platform to manage your inventory, sales, customers, employees, and finances.
            Replace Excel sheets and paper records forever.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/login"
              className="flex items-center gap-2 bg-white text-blue-900 font-semibold px-8 py-3.5 rounded-xl hover:bg-blue-50 transition-colors shadow-lg text-sm"
            >
              Start Managing Now
              <ArrowRight size={16} />
            </Link>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 border border-blue-400 text-blue-100 font-medium px-8 py-3.5 rounded-xl hover:bg-blue-800/50 transition-colors text-sm"
            >
              View Dashboard Demo
            </Link>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-6 mt-16 max-w-lg mx-auto">
            {[
              { value: "6+", label: "Modules" },
              { value: "100%", label: "Cloud Based" },
              { value: "LKR", label: "Local Currency" },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-3xl font-bold text-white">{s.value}</p>
                <p className="text-blue-300 text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MODULES GRID ── */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Everything Your Business Needs
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Six powerful modules working together to streamline every aspect of your operations.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: <Package size={28} />,
                color: "bg-orange-500",
                light: "bg-orange-50",
                title: "Inventory Management",
                desc: "Track stock levels in real-time, get low stock alerts, manage suppliers, and record every stock movement automatically.",
                features: ["Product catalog", "Stock in/out tracking", "Low stock alerts", "Supplier management"],
              },
              {
                icon: <ShoppingCart size={28} />,
                color: "bg-blue-500",
                light: "bg-blue-50",
                title: "Sales Management",
                desc: "Create sales transactions, generate professional invoices, and track daily, monthly, and yearly performance.",
                features: ["POS system", "Invoice generation", "Sales history", "Payment tracking"],
              },
              {
                icon: <Users size={28} />,
                color: "bg-emerald-500",
                light: "bg-emerald-50",
                title: "Customer Management",
                desc: "Build customer profiles, track purchase history, manage loyalty points, and search your customer base instantly.",
                features: ["Customer profiles", "Purchase history", "Loyalty points", "Smart search"],
              },
              {
                icon: <UserCircle size={28} />,
                color: "bg-violet-500",
                light: "bg-violet-50",
                title: "Employee Management",
                desc: "Manage employee records, track attendance, handle leave requests, and control system access by role.",
                features: ["Employee records", "Attendance tracking", "Leave management", "Role-based access"],
              },
              {
                icon: <DollarSign size={28} />,
                color: "bg-teal-500",
                light: "bg-teal-50",
                title: "Financial Dashboard",
                desc: "Monitor revenue, track expenses by category, view profit & loss at a glance, and make data-driven decisions.",
                features: ["Revenue tracking", "Expense management", "Profit & loss", "Monthly reports"],
              },
              {
                icon: <BarChart3 size={28} />,
                color: "bg-rose-500",
                light: "bg-rose-50",
                title: "Analytics Dashboard",
                desc: "Visualize business trends, identify best-selling products, monitor customer growth, and forecast performance.",
                features: ["Sales trends", "Best sellers", "Customer growth", "Inventory insights"],
              },
            ].map((module) => (
              <div
                key={module.title}
                className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow group"
              >
                <div className={`${module.light} w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform`}>
                  <span className={`${module.color} bg-clip-text`} style={{ color: "inherit" }}>
                    <div className={`${module.color} text-white p-2 rounded-lg`}>
                      {module.icon}
                    </div>
                  </span>
                </div>
                <h3 className="font-semibold text-gray-800 mb-2">{module.title}</h3>
                <p className="text-gray-500 text-sm mb-4 leading-relaxed">{module.desc}</p>
                <ul className="space-y-1">
                  {module.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs text-gray-500">
                      <CheckCircle size={12} className="text-green-500 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY US ── */}
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">
              Why Smart SME?
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Designed specifically for small and medium enterprises in Sri Lanka.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Zap size={24} />,
                color: "text-yellow-500",
                bg: "bg-yellow-50",
                title: "Fast & Lightweight",
                desc: "Built with Next.js for blazing fast performance on any device.",
              },
              {
                icon: <Shield size={24} />,
                color: "text-blue-500",
                bg: "bg-blue-50",
                title: "Secure by Default",
                desc: "JWT authentication with role-based access control keeps your data safe.",
              },
              {
                icon: <Globe size={24} />,
                color: "text-emerald-500",
                bg: "bg-emerald-50",
                title: "Cloud Based",
                desc: "Access your business data from anywhere, anytime, on any device.",
              },
              {
                icon: <TrendingUp size={24} />,
                color: "text-violet-500",
                bg: "bg-violet-50",
                title: "Real-time Insights",
                desc: "Make smart decisions with live dashboards and business analytics.",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="text-center p-6 rounded-2xl border border-gray-100 hover:shadow-sm transition-shadow"
              >
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

      {/* ── CTA ── */}
      <section className="py-20 px-6 bg-gradient-to-br from-blue-950 to-indigo-900">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Transform Your Business?
          </h2>
          <p className="text-blue-200 mb-8 text-lg">
            Join hundreds of Sri Lankan SMEs already using Smart SME to run smarter operations.
          </p>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-white text-blue-900 font-semibold px-8 py-3.5 rounded-xl hover:bg-blue-50 transition-colors shadow-lg"
          >
            Get Started Free
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="py-8 px-6 bg-gray-900 text-center">
        <p className="text-gray-400 text-sm">
          © 2026 Smart SME Management System · Built for Sri Lanka 🇱🇰
        </p>
      </footer>
    </div>
  );
}