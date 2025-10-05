"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../utils/api"; // your custom fetch with JWT refresh

interface Vendor {
  id: number;
  name: string;
}

interface Product {
  id: number;
  name: string;
  purchase_price: number;
  purchase_tax_percent: number;
}

interface PurchaseItem {
  product: number | null; 
  quantity: number;
  unit_price: number;
  tax_percent: number;
}

export default function PurchasePage() {
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedVendor, setSelectedVendor] = useState<number | null>(null);
  const [orderDate, setOrderDate] = useState("");
  const [expectedDate, setExpectedDate] = useState("");
  const [items, setItems] = useState<PurchaseItem[]>([
    { product: null, quantity: 1, unit_price: 0, tax_percent: 0 },
  ]);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const PAYMENT_CHOICES = [
    { value: "cash", label: "Cash" },
    { value: "credit_card", label: "Credit Card" },
    { value: "bank_transfer", label: "Bank Transfer" },
  ];

  // Initialize order date
  useEffect(() => {
    setOrderDate(new Date().toISOString().split("T")[0]);
  }, []);

  // Fetch vendors and products
  useEffect(() => {
    const fetchData = async () => {
      try {
        const vendorsRes = await apiFetch(
          "http://127.0.0.1:8000/api/master/contacts/?type=vendor"
        );
        const productsRes = await apiFetch(
          "http://127.0.0.1:8000/api/master/products/"
        );
        if (vendorsRes.ok && productsRes.ok) {
          setVendors(await vendorsRes.json());
          setProducts(await productsRes.json());
        } else {
          setError("Failed to fetch vendors or products");
        }
      } catch (err) {
        console.error(err);
        setError("Error fetching data");
      }
    };
    fetchData();
  }, []);

  // Add/Remove items
  const addItem = () => {
    setItems([
      ...items,
      { product: null, quantity: 1, unit_price: 0, tax_percent: 0 },
    ]);
  };

  const removeItem = (index: number) => {
    const newItems = [...items];
    newItems.splice(index, 1);
    setItems(newItems);
  };

 const handleItemChange = (
  index: number,
  field: keyof PurchaseItem,
  value: any
) => {
  const newItems = [...items];

  if (field === "quantity" || field === "unit_price" || field === "tax_percent") {
    newItems[index][field] = parseFloat(value); // convert string to number
  } else {
    newItems[index][field] = value;
  }

  // Auto-fill unit_price and tax_percent when selecting product
  if (field === "product" && value) {
    const product = products.find((p) => p.id === parseInt(value));
    if (product) {
      newItems[index].unit_price = product.purchase_price;
      newItems[index].tax_percent = product.purchase_tax_percent;
    }
  }

  setItems(newItems);
};


  // Calculate total amount
  const totalAmount = items.reduce((acc, item) => {
    if (item.product) {
      return acc + item.quantity * item.unit_price * (1 + item.tax_percent / 100);
    }
    return acc;
  }, 0);

  // Submit purchase order
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVendor) {
      setError("Select a vendor");
      return;
    } 

    const payload = {
      vendor: selectedVendor,
      order_date: orderDate,
      expected_date: expectedDate || null,
      items: items.filter((i) => i.product),
      total_amount: totalAmount,
      paid: false,
      paid_amount: 0,
      payment_method: paymentMethod,
    };

    setLoading(true);
    setError("");
    setSuccess("");

    console.log("Submitting payload:", JSON.stringify(payload));

    try {
      const res = await apiFetch(
        "http://127.0.0.1:8000/api/transactions/purchase-orders/",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (res.ok) {
        setSuccess("Purchase order created successfully!");
        setSelectedVendor(null);
        setItems([{ product: null, quantity: 1, unit_price: 0, tax_percent: 0 }]);
        setExpectedDate("");
        setPaymentMethod("cash");
      } else {
        const data = await res.json();
        setError(JSON.stringify(data));
      }
    } catch (err) {
      console.error(err);
      setError("Error submitting purchase order");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Add Purchase Order</h1>

      {error && <div className="text-red-600 mb-4">{error}</div>}
      {success && <div className="text-green-600 mb-4">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Vendor */}
        <div>
          <label className="block font-medium mb-1">Vendor</label>
          <select
            value={selectedVendor ?? ""}
            onChange={(e) => setSelectedVendor(parseInt(e.target.value))}
            required
            className="w-full border px-3 py-2 rounded"
          >
            <option value="">Select Vendor</option>
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name}
              </option>
            ))}
          </select>
        </div>

        {/* Payment Method */}
        <div>
          <label className="block font-medium mb-1">Payment Method</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            className="w-full border px-3 py-2 rounded"
          >
            {PAYMENT_CHOICES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        {/* Dates */}
        <div className="flex gap-4">
          <div>
            <label className="block font-medium mb-1">Order Date</label>
            <input
              type="date"
              value={orderDate}
              onChange={(e) => setOrderDate(e.target.value)}
              required
              className="border px-3 py-2 rounded"
            />
          </div>
          <div>
            <label className="block font-medium mb-1">Expected Date</label>
            <input
              type="date"
              value={expectedDate}
              onChange={(e) => setExpectedDate(e.target.value)}
              className="border px-3 py-2 rounded"
            />
          </div>
        </div>

        {/* Items */}
        <div>
          <h2 className="font-semibold mb-2">Items</h2>
          {items.map((item, index) => (
            <div key={index} className="flex gap-2 mb-4 items-end">
              <div className="flex flex-col flex-1">
                <label className="text-sm font-medium mb-1">Product</label>
                <select
                  value={item.product ?? ""}
                  onChange={(e) =>
                    handleItemChange(index, "product", parseInt(e.target.value))
                  }
                  required
                  className="border px-2 py-1 rounded"
                >
                  <option value="">Select Product</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col w-24">
                <label className="text-sm font-medium mb-1">Quantity</label>
                <input
                  type="number"
                  value={item.quantity}
                  min={1}
                  onChange={(e) =>
                    handleItemChange(index, "quantity", parseInt(e.target.value))
                  }
                  className="border px-2 py-1 rounded"
                />
              </div>

              <div className="flex flex-col w-28">
                <label className="text-sm font-medium mb-1">Unit Price</label>
                <input
                  type="number"
                  value={item.unit_price}
                  step="0.01"
                  onChange={(e) =>
                    handleItemChange(index, "unit_price", parseFloat(e.target.value))
                  }
                  className="border px-2 py-1 rounded"
                />
              </div>

              <div className="flex flex-col w-24">
                <label className="text-sm font-medium mb-1">Tax %</label>
                <input
                  type="number"
                  value={item.tax_percent}
                  step="0.01"
                  onChange={(e) =>
                    handleItemChange(index, "tax_percent", parseFloat(e.target.value))
                  }
                  className="border px-2 py-1 rounded"
                />
              </div>

              <button
                type="button"
                onClick={() => removeItem(index)}
                className="bg-red-500 text-white px-2 h-8 rounded self-center"
              >
                X
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={addItem}
            className="bg-blue-500 text-white px-3 py-1 rounded mt-2"
          >
            Add Item
          </button>
        </div>

        {/* Total */}
        <div className="font-semibold text-right">
          Total: ₹{totalAmount.toFixed(2)}
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="bg-green-600 text-white px-4 py-2 rounded mt-4 hover:bg-green-700"
        >
          {loading ? "Submitting..." : "Submit Purchase Order"}
        </button>
      </form>
    </div>
  );
}
