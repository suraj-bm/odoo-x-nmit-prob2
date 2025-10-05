"use client";

import { useState } from "react";
import { fetchHSN } from "../utils/hsnApi"; // utility
import { apiFetch} from "../utils/api" // assuming you have this

type ProductForm = {
  name: string;
  type: "goods" | "service";
  salesPrice: number;
  purchasePrice: number;
  saleTaxPercent: number;
  purchaseTaxPercent: number;
  hsnCode: string;
};

export default function ProductsPage() {
  const [form, setForm] = useState<ProductForm>({
    name: "",
    type: "goods",
    salesPrice: 0,
    purchasePrice: 0,
    saleTaxPercent: 0,
    purchaseTaxPercent: 0,
    hsnCode: "",
  });

  const [hsnSuggestions, setHsnSuggestions] = useState<
    { c: string; n: string; r?: { taxrate: string }[] }[]
  >([]);
  const [loadingHSN, setLoadingHSN] = useState(false);

  // Fetch HSN suggestions when user types
  const handleHSNSearch = async (input: string) => {
    if (!input) return setHsnSuggestions([]);
    setLoadingHSN(true);
    const suggestions = await fetchHSN(input, "byDesc", "P");
    setHsnSuggestions(suggestions);
    setLoadingHSN(false);
  };

  const handleSelectHSN = (hsn: { c: string; n: string; r?: { taxrate: string }[] }) => {
    // Try to extract GST % from the response
    const gstRate = hsn.r && hsn.r.length > 0 ? parseFloat(hsn.r[0].taxrate) : 18;

    setForm({
      ...form,
      hsnCode: hsn.c,
      purchaseTaxPercent: gstRate,
      saleTaxPercent: gstRate,
    });
    setHsnSuggestions([]);
  };

  const handleChange = (field: keyof ProductForm, value: any) => {
    setForm({ ...form, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const payload = {
    name: form.name,
    type: form.type,
    sales_price: form.salesPrice,
    purchase_price: form.purchasePrice,
    sale_tax_percent: form.saleTaxPercent,
    purchase_tax_percent: form.purchaseTaxPercent,
    hsn_code: form.hsnCode,
  };

  try {
    const res = await apiFetch("http://127.0.0.1:8000/api/master/products/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload), // send snake_case to Django
    });

    if (res.ok) {
      console.log("✅ Product saved");
      setForm({
        name: "",
        type: "goods",
        salesPrice: 0,
        purchasePrice: 0,
        saleTaxPercent: 0,
        purchaseTaxPercent: 0,
        hsnCode: "",
      });
    } else {
      const err = await res.json();
      console.error("❌ Failed:", err);
    }
  } catch (err) {
    console.error("⚠️ Error saving product:", err);
  }
};


  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Add Product</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label>Name</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className="border px-3 py-2 rounded w-full"
          />
        </div>

        <div>
          <label>Type</label>
          <select
            value={form.type}
            onChange={(e) => handleChange("type", e.target.value as "goods" | "service")}
            className="border px-3 py-2 rounded w-full"
          >
            <option value="goods">Goods</option>
            <option value="service">Service</option>
          </select>
        </div>

        <div className="relative">
          <label>HSN Code</label>
          <input
            type="text"
            value={form.hsnCode}
            onChange={(e) => {
              handleChange("hsnCode", e.target.value);
              handleHSNSearch(e.target.value);
            }}
            className="border px-3 py-2 rounded w-full"
          />
          {loadingHSN && <p>Loading...</p>}
          {hsnSuggestions.length > 0 && (
            <ul className="border rounded mt-1 max-h-40 overflow-auto bg-white z-50 absolute w-full">
              {hsnSuggestions.map((hsn) => (
                <li
                  key={hsn.c}
                  className="px-2 py-1 hover:bg-gray-200 cursor-pointer"
                  onClick={() => handleSelectHSN(hsn)}
                >
                  {hsn.c} - {hsn.n}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <label>Purchase Price</label>
          <input
            type="number"
            value={form.purchasePrice}
            onChange={(e) => handleChange("purchasePrice", parseFloat(e.target.value))}
            className="border px-3 py-2 rounded w-full"
          />
        </div>

        <div>
          <label>Sales Price</label>
          <input
            type="number"
            value={form.salesPrice}
            onChange={(e) => handleChange("salesPrice", parseFloat(e.target.value))}
            className="border px-3 py-2 rounded w-full"
          />
        </div>

        <div className="flex gap-2">
          <div>
            <label>Purchase Tax %</label>
            <input
              type="number"
              value={form.purchaseTaxPercent}
              onChange={(e) => handleChange("purchaseTaxPercent", parseFloat(e.target.value))}
              className="border px-3 py-2 rounded w-32"
            />
          </div>
          <div>
            <label>Sales Tax %</label>
            <input
              type="number"
              value={form.saleTaxPercent}
              onChange={(e) => handleChange("saleTaxPercent", parseFloat(e.target.value))}
              className="border px-3 py-2 rounded w-32"
            />
          </div>
        </div>

        <button
          type="submit"
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Add Product
        </button>
      </form>
    </div>
  );
}
