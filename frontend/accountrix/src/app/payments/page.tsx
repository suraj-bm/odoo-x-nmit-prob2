

"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";

interface Transaction {
  id: number;
  vendor?: number;
  customer?: number;
  order_date: string;
  status: string;
  total_amount?: number;
  paid_amount?: number;
}

export default function PaymentsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("all");

  const fetchTransactions = async () => {
    try {
      const purchaseRes = await apiFetch(
        "http://127.0.0.1:8000/api/transactions/purchase-orders/"
      );

      const salesRes = await apiFetch(
        "http://127.0.0.1:8000/api/transactions/sales-orders/"
      );

      const purchaseData = purchaseRes.ok
        ? await purchaseRes.json()
        : [];

      const salesData = salesRes.ok
        ? await salesRes.json()
        : [];

      // add transaction type manually
      const purchases = purchaseData.map((item: Transaction) => ({
        ...item,
        transaction_type: "purchase",
      }));

      const sales = salesData.map((item: Transaction) => ({
        ...item,
        transaction_type: "sales",
      }));

      const allTransactions = [...purchases, ...sales];

      console.log(allTransactions);

      setTransactions(allTransactions);
    } catch (err) {
      console.error("Error fetching transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const filteredTransactions =
    filterType === "all"
      ? transactions
      : transactions.filter(
          (t: any) => t.transaction_type === filterType
        );

  // FIXED TOTAL
  const totalAmount = filteredTransactions.reduce((acc: number, t: any) => {
    const amount =
      Number(t.total_amount) ||
      Number(t.paid_amount) ||
      0;

    return acc + amount;
  }, 0);

  if (loading) return <p>Loading transactions...</p>;

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        Payments
      </h1>

      {/* Filter */}
      <div className="flex items-center gap-4 mb-4">
        <label>Filter by Type:</label>

        <select
          value={filterType}
          onChange={(e) =>
            setFilterType(e.target.value)
          }
          className="border px-3 py-2 rounded"
        >
          <option value="all">All</option>
          <option value="purchase">Purchase</option>
          <option value="sales">Sales</option>
        </select>
      </div>

      {/* Total */}
      <div className="mb-4">
        <p className="text-lg font-semibold">
          Total Amount:{" "}
          <span className="text-blue-600">
            {totalAmount.toFixed(2)}
          </span>
        </p>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2 text-left">
                ID
              </th>

              <th className="border px-4 py-2 text-left">
                Date
              </th>

              <th className="border px-4 py-2 text-left">
                Party
              </th>

              <th className="border px-4 py-2 text-left">
                Type
              </th>

              <th className="border px-4 py-2 text-left">
                Amount
              </th>

              <th className="border px-4 py-2 text-left">
                Status
              </th>
            </tr>
          </thead>

          <tbody>
            {filteredTransactions.map((t: any) => {
              const amount =
                Number(t.total_amount) ||
                Number(t.paid_amount) ||
                0;

              return (
                <tr
                  key={`${t.transaction_type}-${t.id}`}
                  className="border-t"
                >
                  <td className="border px-4 py-2">
                    {t.id}
                  </td>

                  <td className="border px-4 py-2">
                    {t.order_date}
                  </td>

                  <td className="border px-4 py-2">
                    {t.vendor || t.customer}
                  </td>

                  <td className="border px-4 py-2">
                    {t.transaction_type === "purchase"
                      ? "Purchase"
                      : "Sales"}
                  </td>

                  <td className="border px-4 py-2">
                    {amount.toFixed(2)}
                  </td>

                  <td className="border px-4 py-2">
                    {t.status}
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