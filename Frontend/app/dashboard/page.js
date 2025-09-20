"use client";

import React, { useState } from "react";
import {
    AreaChart,
    Area,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    PieChart,
    Pie,
    Cell,
} from "recharts";
import { Search, Bell, LogOut, Menu } from "lucide-react";

// Mock data (you can replace with real API data)
const kpis = [
    { id: 1, title: "Users", value: "128.4k", change: "+6.2%" },
    { id: 2, title: "Revenue", value: "₫3.2B", change: "+2.8%" },
    { id: 3, title: "New Orders", value: "3.2k", change: "-1.1%" },
    { id: 4, title: "Churn", value: "1.8%", change: "-0.2%" },
];

const areaData = [
    { name: "Jan", uv: 4000 },
    { name: "Feb", uv: 3000 },
    { name: "Mar", uv: 5000 },
    { name: "Apr", uv: 4000 },
    { name: "May", uv: 6000 },
    { name: "Jun", uv: 7000 },
    { name: "Jul", uv: 8000 },
    { name: "Aug", uv: 7500 },
    { name: "Sep", uv: 8200 },
];

const barData = [
    { name: "FPT", uv: 400 },
    { name: "MBB", uv: 300 },
    { name: "VMEF", uv: 500 },
    { name: "BTC", uv: 200 },
];

const pieData = [
    { name: "Equity", value: 55 },
    { name: "Bonds", value: 25 },
    { name: "Cash", value: 20 },
];
const COLORS = ["#4F46E5", "#06B6D4", "#F59E0B"];

export default function AdminDashboard() {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [query, setQuery] = useState("");
    const [rows] = useState([
        { id: 1, name: "Nguyen Van A", email: "a@example.com", role: "Admin", status: "Active" },
        { id: 2, name: "Tran Thi B", email: "b@example.com", role: "User", status: "Pending" },
        { id: 3, name: "Le Van C", email: "c@example.com", role: "User", status: "Active" },
    ]);

    const filtered = rows.filter(
        (r) => r.name.toLowerCase().includes(query.toLowerCase()) || r.email.toLowerCase().includes(query.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <div className="flex">
                {/* Sidebar */}
                <aside
                    className={`transition-all duration-300 ease-in-out bg-white border-r shadow-sm ${sidebarOpen ? "w-64" : "w-16"
                        }`}
                >
                    <div className="h-16 flex items-center px-4 gap-3">
                        <button
                            className="p-2 rounded-md hover:bg-slate-100"
                            onClick={() => setSidebarOpen((s) => !s)}
                            aria-label="Toggle sidebar"
                        >
                            <Menu size={20} />
                        </button>
                        {sidebarOpen && <h1 className="text-lg font-semibold">Admin</h1>}
                    </div>

                    <nav className="px-2 py-4 space-y-1">
                        {[
                            { name: "Dashboard", icon: "🏠" },
                            { name: "Portfolio", icon: "📊" },
                            { name: "Users", icon: "👥" },
                            { name: "Reports", icon: "📁" },
                            { name: "Settings", icon: "⚙️" },
                        ].map((item) => (
                            <div
                                key={item.name}
                                className="flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-slate-100 cursor-pointer"
                            >
                                <span className="text-lg">{item.icon}</span>
                                {sidebarOpen && <span>{item.name}</span>}
                            </div>
                        ))}
                    </nav>

                    <div className="mt-auto p-4">
                        <button className="w-full py-2 rounded-md bg-red-50 text-red-600 flex items-center justify-center gap-2">
                            <LogOut size={16} />
                            {sidebarOpen && <span>Sign out</span>}
                        </button>
                    </div>
                </aside>

                {/* Main */}
                <main className="flex-1 p-6">
                    {/* Header */}
                    <header className="flex items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-4">
                            <h2 className="text-2xl font-bold">Overview</h2>
                            <div className="text-sm text-slate-500">Welcome back — here is your portfolio overview.</div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <input
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    placeholder="Search users, portfolios..."
                                    className="pl-10 pr-4 h-10 rounded-md border bg-white shadow-sm focus:outline-none"
                                />
                                <div className="absolute left-3 top-2.5 text-slate-400">
                                    <Search size={16} />
                                </div>
                            </div>

                            <button className="p-2 rounded-md hover:bg-slate-100">
                                <Bell size={18} />
                            </button>

                            <div className="flex items-center gap-2 px-3 py-2 rounded-md bg-white shadow-sm">
                                <div className="h-8 w-8 rounded-full bg-indigo-500 flex items-center justify-center text-white">D</div>
                                <div className="text-sm">
                                    <div className="font-medium">Dang</div>
                                    <div className="text-xs text-slate-500">Admin</div>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* KPI cards */}
                    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                        {kpis.map((kpi) => (
                            <div key={kpi.id} className="p-4 bg-white rounded-2xl shadow-sm">
                                <div className="text-xs text-slate-400">{kpi.title}</div>
                                <div className="mt-2 flex items-center justify-between">
                                    <div className="text-2xl font-semibold">{kpi.value}</div>
                                    <div className={`text-sm ${kpi.change.startsWith("+") ? "text-green-600" : "text-red-600"}`}>
                                        {kpi.change}
                                    </div>
                                </div>
                                <div className="mt-3 text-xs text-slate-400">vs last month</div>
                            </div>
                        ))}
                    </section>

                    <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                        <div className="lg:col-span-2 bg-white p-4 rounded-2xl shadow-sm">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold">Portfolio Value (12 months)</h3>
                                <div className="text-sm text-slate-500">Updated 2 hours ago</div>
                            </div>

                            <div style={{ width: "100%", height: 280 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={areaData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8} />
                                                <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="name" />
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <Tooltip />
                                        <Area type="monotone" dataKey="uv" stroke="#4F46E5" fillOpacity={1} fill="url(#colorUv)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="mt-4 grid grid-cols-3 gap-2 text-sm text-slate-500">
                                <div>Allocation: Equity 55%</div>
                                <div>Risk: High</div>
                                <div>Return (YTD): +11.9%</div>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-2xl shadow-sm">
                            <h3 className="font-semibold mb-3">Allocation</h3>
                            <div style={{ width: "100%", height: 220 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={70} innerRadius={35}>
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                    </PieChart>
                                </ResponsiveContainer>

                                <div className="mt-4 text-sm">
                                    {pieData.map((p, i) => (
                                        <div key={p.name} className="flex items-center gap-2">
                                            <div style={{ width: 10, height: 10, background: COLORS[i], borderRadius: 3 }} />
                                            <div>{p.name}</div>
                                            <div className="ml-auto text-slate-500">{p.value}%</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="mt-6 bg-white rounded-2xl p-4 shadow-sm">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold">Top Holdings</h3>
                            <div className="text-sm text-slate-500">Updated Sep 7, 2025</div>
                        </div>

                        <div className="overflow-auto">
                            <table className="w-full text-sm table-auto">
                                <thead className="text-slate-500 text-left border-b">
                                    <tr>
                                        <th className="py-2">Name</th>
                                        <th className="py-2">Ticker</th>
                                        <th className="py-2">Weight</th>
                                        <th className="py-2">Price</th>
                                        <th className="py-2">Change</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {barData.map((b) => (
                                        <tr key={b.name} className="odd:bg-slate-50">
                                            <td className="py-3">{b.name} Corp</td>
                                            <td>{b.name}</td>
                                            <td>{Math.round((b.uv / 1400) * 100)}%</td>
                                            <td>—</td>
                                            <td className="text-green-600">+{Math.round(b.uv / 10)}%</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="bg-white p-4 rounded-2xl shadow-sm">
                            <h3 className="font-semibold mb-3">Market Snapshot</h3>
                            <div style={{ width: "100%", height: 200 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={barData} margin={{ left: 0, right: 20 }}>
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip />
                                        <Bar dataKey="uv" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        <div className="bg-white p-4 rounded-2xl shadow-sm">
                            <h3 className="font-semibold mb-3">Users</h3>
                            <div className="overflow-auto">
                                <table className="w-full text-sm table-auto">
                                    <thead className="text-slate-500 text-left border-b">
                                        <tr>
                                            <th className="py-2">Name</th>
                                            <th className="py-2">Email</th>
                                            <th className="py-2">Role</th>
                                            <th className="py-2">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filtered.map((r) => (
                                            <tr key={r.id} className="odd:bg-slate-50">
                                                <td className="py-3">{r.name}</td>
                                                <td>{r.email}</td>
                                                <td>{r.role}</td>
                                                <td>
                                                    <span
                                                        className={`px-2 py-1 rounded-full text-xs ${r.status === "Active" ? "bg-green-50 text-green-600" : "bg-yellow-50 text-yellow-600"
                                                            }`}
                                                    >
                                                        {r.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </section>

                    <footer className="mt-8 text-sm text-slate-500">© {new Date().getFullYear()} Admin Dashboard — built with Next.js + Tailwind + Recharts</footer>
                </main>
            </div>
        </div>
    );
}
