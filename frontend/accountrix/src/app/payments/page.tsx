"use client";

import { ReactNode, useEffect, useState } from "react";
import { apiFetch } from "../utils/api";

interface Transaction {
  order_date: ReactNode;
  customer: ReactNode;
  total_amount: number;
  paid_amount(paid_amount: any): any;
  status: ReactNode;
  id: number;
  transaction_type: string;
  date: string;
  amount: number;
  related_object?: {
    id: number;
    name?: string;
  };
}

export default function PaymentsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("all");
const fetchTransactions = async () => {
  try {
    const purchaseRes = await apiFetch("http://127.0.0.1:8000/api/transactions/purchase-orders/");
    const salesRes = await apiFetch("http://127.0.0.1:8000/api/transactions/sales-orders/");

    const purchaseData = purchaseRes.ok ? await purchaseRes.json() : [];
    const salesData = salesRes.ok ? await salesRes.json() : [];

    const allTransactions = [...purchaseData, ...salesData];
    console.log("Merged transactions:", allTransactions); // <-- DEBUG

    setTransactions(allTransactions);
  } catch (err) {
    console.error("Error fetching transactions:", err);
  } finally {
    setLoading(false); // <-- THIS WAS MISSING!
  }
};




  useEffect(() => {
    fetchTransactions();
  }, []);

  const filteredTransactions =
    filterType === "all"
      ? transactions
      : transactions.filter((t) => t.transaction_type === filterType);

  const totalAmount = filteredTransactions.reduce(
    (acc, t) => acc + t.amount,
    0
  );

  if (loading) return <p>Loading transactions...</p>;

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Payments</h1>

      {/* Filters */}
      <div className="flex items-center gap-4 mb-4">
        <label>Filter by Type:</label>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="border px-3 py-2 rounded"
        >
          <option value="all">All</option>
          <option value="purchase_order">Purchase Orders</option>
          <option value="vendor_bill">Vendor Bills</option>
          <option value="sales_order">Sales Orders</option>
          <option value="customer_invoice">Customer Invoices</option>
        </select>
      </div>

      {/* Total */}
      <div className="mb-4">
        <p className="text-lg font-semibold">
          Total Amount: <span className="text-blue-600">{totalAmount.toFixed(2)}</span>
        </p>
      </div>

      {/* Transactions Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2 text-left">ID</th>
              <th className="border px-4 py-2 text-left">Type</th>
              <th className="border px-4 py-2 text-left">Date</th>
              <th className="border px-4 py-2 text-left">Amount</th>
              <th className="border px-4 py-2 text-left">Related Object</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((t) => (
              <tr key={t.id} className="border-t">
  <td>{t.id}</td>
  <td>{t.order_date}</td>
  <td>{("vendor" in t ? t.vendor : t.customer) as ReactNode}</td>
  <td>{"vendor" in t ? "Purchase" : "Sales"}</td>
  <td>
    {(() => {
      const amount = t.total_amount ?? Number(t.paid_amount) ?? 0;
      return Number(amount).toFixed(2);
    })()}
  </td>
  <td>{t.status}</td>
</tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
