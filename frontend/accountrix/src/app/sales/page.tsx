"use client";

import { useState, useEffect } from "react";
import { apiFetch } from "../utils/api";

type SalesOrderItem = {
  product: number;
  quantity: number;
  unit_price: number;      // ✅ rename
  tax_percent: number; 
};

type SalesOrderForm = {
  customer: number;
  order_date: string;
  status: string;
  items: SalesOrderItem[];
};

type Customer = { id: number; name: string };
type Product = { id: number; name: string; sales_price: number; sale_tax_percent: number };

export default function SalesPage() {
  const [form, setForm] = useState<SalesOrderForm>({
    customer: 0,
    order_date: new Date().toISOString().split("T")[0],
    status: "draft",
    items: [{ product: 0, quantity: 1, unit_price: 0, tax_percent: 0 }],
  });

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch customers & only service-type products
  useEffect(() => {
    apiFetch("http://127.0.0.1:8000/api/master/contacts/")
      .then(res => res.json())
      .then((data: any[]) => {
        const customersOnly = data.filter(c => c.type === "customer" || c.type === "both");
        setCustomers(customersOnly);
      });

    apiFetch("http://127.0.0.1:8000/api/master/products/")
      .then(res => res.json())
      .then((data) => {
        const services = data.filter((p: any) => p.type === "service");
        setProducts(services);
      });
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    index?: number
  ) => {
    const { name, value } = e.target;

    if (index !== undefined) {
      const newItems = [...form.items];

      if (name === "product") {
        const selectedProduct = products.find(p => p.id === parseInt(value));
        if (selectedProduct) {
          newItems[index].product = selectedProduct.id;
          newItems[index].unit_price = selectedProduct.sales_price; // ✅ auto fill
          newItems[index].tax_percent = selectedProduct.sale_tax_percent; // ✅ auto fill
        }
      } else {
        newItems[index][name as keyof SalesOrderItem] = parseFloat(value);
      }
      setForm({ ...form, items: newItems });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const addItem = () => {
    setForm({
      ...form,
      items: [...form.items, { product: 0, quantity: 1, unit_price: 0, tax_percent: 0 }],
    });
  };

  const removeItem = (index: number) => {
    const newItems = [...form.items];
    newItems.splice(index, 1);
    setForm({ ...form, items: newItems });
  };

  // ✅ Calculate total for each row
  const calculateItemTotal = (item: SalesOrderItem) => {
    return item.quantity * item.unit_price * (1 + item.tax_percent / 100);
  };

  // ✅ Calculate grand total
  const totalAmount = form.items.reduce((sum, item) => sum + calculateItemTotal(item), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.customer === 0) return alert("Select a customer");
    if (form.items.some(i => i.product === 0)) return alert("Select all products");

    setLoading(true);
    try {
      const res = await apiFetch("http://127.0.0.1:8000/api/transactions/sales-orders/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Error response:", errorData);
        alert("Error creating sales order");
      } else {
        alert("Sales Order created successfully!");
        setForm({
          customer: 0,
          order_date: new Date().toISOString().split("T")[0],
          status: "draft",
          items: [{ product: 0, quantity: 1, unit_price: 0, tax_percent: 0 }],
        });
      }
    } catch (err) {
      console.error(err);
      alert("Error creating sales order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">🧾 Create Sales Order</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Customer Dropdown */}
        <div>
          <label>Customer</label>
          <select name="customer" value={form.customer} onChange={handleChange} className="border p-2 w-full">
            <option value={0}>Select Customer</option>
            {customers.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Order Date */}
        <div>
          <label>Order Date</label>
          <input type="date" name="order_date" value={form.order_date} onChange={handleChange} className="border p-2 w-full" />
        </div>

        {/* Status */}
        <div>
          <label>Status</label>
          <select name="status" value={form.status} onChange={handleChange} className="border p-2 w-full">
            <option value="draft">Draft</option>
            <option value="confirmed">Confirmed</option>
            <option value="delivered">Delivered</option>
          </select>
        </div>

        {/* Items */}
        <div className="space-y-4">
          <h2 className="font-bold">Items</h2>
          {form.items.map((item, index) => (
            <div key={index} className="grid grid-cols-6 gap-4 items-end border p-2 rounded">
              {/* Product */}
              <div className="flex flex-col">
                <label>Service</label>
                <select name="product" value={item.product} onChange={e => handleChange(e, index)} className="border p-2">
                  <option value={0}>Select Service</option>
                  {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>

              {/* Quantity */}
              <div className="flex flex-col">
                <label>Qty</label>
                <input type="number" name="quantity" value={item.quantity} onChange={e => handleChange(e, index)} className="border p-2" />
              </div>

              {/* Unit Price */}
              <div className="flex flex-col">
                <label>Unit Price</label>
                <input type="number" name="unit_price" value={item.unit_price} className="border p-2 bg-gray-100" readOnly />
              </div>

              {/* Tax */}
              <div className="flex flex-col">
                <label>Tax %</label>
                <input type="number" name="tax_percent" value={item.tax_percent} className="border p-2 bg-gray-100" readOnly />
              </div>

              {/* Total (readonly) */}
              <div className="flex flex-col">
                <label>Total</label>
                <input
                  type="text"
                  value={calculateItemTotal(item).toFixed(2)}
                  readOnly
                  className="border p-2 bg-gray-100"
                />
              </div>

              {/* Remove */}
              <div className="flex flex-col items-center">
                <button type="button" onClick={() => removeItem(index)} className="bg-red-500 text-white px-2 py-1 mt-6">Remove</button>
              </div>
            </div>
          ))}

          <button type="button" onClick={addItem} className="bg-blue-500 text-white px-4 py-2 mt-2">Add Item</button>
        </div>

        {/* ✅ Grand Total */}
        <div className="text-right font-bold text-lg">
          Total Amount: ₹{totalAmount.toFixed(2)}
        </div>

        <button type="submit" disabled={loading} className="bg-green-500 text-white px-6 py-2 mt-4">
          {loading ? "Submitting..." : "Create Sales Order"}
        </button>
      </form>
    </div>
  );
}
