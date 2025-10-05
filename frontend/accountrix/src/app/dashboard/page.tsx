"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// --- Type Definitions ---
// A single type for both purchases and sales transactions
interface TransactionData {
  order_date: string;
  total_amount: number;
}

// Data structure for the monthly chart
interface MonthlyData {
  month: string;
  sales: number;
  purchases: number;
}

// Props for the reusable summary card component
interface SummaryCardProps {
  title: string;
  value: string | number;
  className?: string;
}

// --- Helper Components ---
/**
 * A reusable UI component to display a key metric.
 */
const SummaryCard = ({ title, value, className = "" }: SummaryCardProps) => (
  <div className={`p-6 rounded-lg shadow ${className}`}>
    <h2 className="text-lg font-semibold text-gray-600">{title}</h2>
    <p className="text-3xl font-bold mt-1">{value}</p>
  </div>
);

// --- Main Dashboard Component ---
export default function DashboardPage() {
  const [monthlyData, setMonthlyData] = useState<MonthlyData[]>([]);
  const [totalSalesAmount, setTotalSalesAmount] = useState(0);
  const [totalPurchaseAmount, setTotalPurchaseAmount] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Formats a number into the Indian Rupee currency format (e.g., ₹1,23,456.78).
   */
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await apiFetch(
          "http://127.0.0.1:8000/api/transactions/dashboard-data/"
        );
        if (!res.ok) {
          throw new Error(`Failed to fetch data. Status: ${res.status}`);
        }

        const data = await res.json();
        // Default to empty arrays to prevent errors if API response is missing data
        const purchases: TransactionData[] = data.purchases || [];
        const sales: TransactionData[] = data.sales || [];

        // --- Data Processing ---
        const monthlyTotals: Record<number, { purchases: number; sales: number }> = {};
        const monthNames = [
          "Jan", "Feb", "Mar", "Apr", "May", "Jun",
          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
        ];

        // Initialize all 12 months to ensure the chart is always complete
        for (let i = 0; i < 12; i++) {
          monthlyTotals[i] = { purchases: 0, sales: 0 };
        }

        let totalPurchases = 0;
        purchases.forEach((p) => {
          const monthIndex = new Date(p.order_date).getMonth(); // 0-11
          monthlyTotals[monthIndex].purchases += p.total_amount;
          totalPurchases += p.total_amount;
        });

        let totalSales = 0;
        sales.forEach((s) => {
          const monthIndex = new Date(s.order_date).getMonth();
          monthlyTotals[monthIndex].sales += s.total_amount;
          totalSales += s.total_amount;
        });

        // Prepare chart data with user-friendly month names
        const chartData = monthNames.map((name, index) => ({
          month: name,
          purchases: monthlyTotals[index].purchases,
          sales: monthlyTotals[index].sales,
        }));

        // --- Update State ---
        setMonthlyData(chartData);
        setTotalPurchaseAmount(totalPurchases);
        setTotalSalesAmount(totalSales);
        setTotalOrders(purchases.length + sales.length);

      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(err instanceof Error ? err.message : "An unknown error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []); // The empty dependency array ensures this effect runs only once on mount

  // --- Render Logic ---
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl">📊 Loading dashboard...</p>
        {/* For a better user experience, you could replace this with skeleton loaders */}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded" role="alert">
          <strong className="font-bold">Oops! </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      </div>
    );
  }

  const netProfit = totalSalesAmount - totalPurchaseAmount;

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Business Dashboard</h1>

      {/* --- Key Metric Summary Cards --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <SummaryCard
          title="Total Sales"
          value={formatCurrency(totalSalesAmount)}
          className="bg-green-100 border-l-4 border-green-500"
        />
        <SummaryCard
          title="Total Purchases"
          value={formatCurrency(totalPurchaseAmount)}
          className="bg-blue-100 border-l-4 border-blue-500"
        />
        <SummaryCard
          title="Net Profit"
          value={formatCurrency(netProfit)}
          className={netProfit >= 0 ? "bg-emerald-100 border-l-4 border-emerald-500" : "bg-red-100 border-l-4 border-red-500"}
        />
        <SummaryCard
          title="Total Orders"
          value={totalOrders}
          className="bg-yellow-100 border-l-4 border-yellow-500"
        />
      </div>

      {/* --- Monthly Performance Chart --- */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">Monthly Performance</h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
            <XAxis dataKey="month" stroke="#666" />
            <YAxis
              tickFormatter={(value) =>
                new Intl.NumberFormat("en-IN", { notation: "compact" }).format(value as number)
              }
              stroke="#666"
            />
            <Tooltip
              formatter={(value) => formatCurrency(value as number)}
              contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: '0.5rem' }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="sales"
              name="Sales"
              stroke="#22c55e"
              strokeWidth={2}
              activeDot={{ r: 8 }}
            />
            <Line
              type="monotone"
              dataKey="purchases"
              name="Purchases"
              stroke="#3b82f6"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}