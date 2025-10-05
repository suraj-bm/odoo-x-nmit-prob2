"use client";
import React, { useEffect, useState } from "react";
import { apiFetch } from "../utils/api";

interface Contact {
  id: number;
  name: string;
  type: string;
  email?: string;
  mobile?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    type: "vendor",
    email: "",
    mobile: "",
    city: "",
    state: "",
    pincode: "",
  });

  // Fetch all contacts on load
  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    setLoading(true);
    const res = await apiFetch("http://127.0.0.1:8000/api/master/contacts/");
    if (res && res.ok) {
      const data = await res.json();
      setContacts(data);
    }
    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await apiFetch("http://127.0.0.1:8000/api/master/contacts/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    }).catch(() => {
      console.log("error");
    });
    if (res && res.ok) {
      setForm({
        name: "",
        type: "vendor",
        email: "",
        mobile: "",
        city: "",
        state: "",
        pincode: "",
      });
      fetchContacts();
    }
    setLoading(false);
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this contact?")) {
      const res = await apiFetch(`http://127.0.0.1:8000/api/master/contacts/${id}/`, {
        method: "DELETE",
      });
      if (res.ok) {
        setContacts(contacts.filter((c) => c.id !== id));
      }
    }
  };

  // Separate contacts by type
  const customerContacts = contacts.filter((c) => c.type === "customer" || c.type === "both");
  const vendorContacts = contacts.filter((c) => c.type === "vendor" || c.type === "both");

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Contacts</h1>

      {/* Add Contact Form */}
      <form onSubmit={handleSubmit} className="space-y-3 border p-4 rounded mb-6">
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Name"
          required
          className="border px-3 py-2 w-full rounded"
        />
        <select
          name="type"
          value={form.type}
          onChange={handleChange}
          className="border px-3 py-2 w-full rounded"
        >
          <option value="customer">Customer</option>
          <option value="vendor">Vendor</option>
          <option value="both">Both</option>
        </select>
        <input
          name="email"
          value={form.email}
          onChange={handleChange}
          placeholder="Email"
          className="border px-3 py-2 w-full rounded"
        />
        <input
          name="mobile"
          value={form.mobile}
          onChange={handleChange}
          placeholder="Mobile"
          className="border px-3 py-2 w-full rounded"
        />
        <div className="grid grid-cols-3 gap-2">
          <input
            name="city"
            value={form.city}
            onChange={handleChange}
            placeholder="City"
            className="border px-3 py-2 rounded"
          />
          <input
            name="state"
            value={form.state}
            onChange={handleChange}
            placeholder="State"
            className="border px-3 py-2 rounded"
          />
          <input
            name="pincode"
            value={form.pincode}
            onChange={handleChange}
            placeholder="Pincode"
            className="border px-3 py-2 rounded"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Saving..." : "Add Contact"}
        </button>
      </form>

      {loading ? (
        <p>Loading contacts...</p>
      ) : (
        <div className="grid grid-cols-2 gap-6">
          {/* Customers Table */}
          <div>
            <h2 className="text-xl font-semibold mb-2">Customers</h2>
            {customerContacts.length === 0 ? (
              <p>No customers found.</p>
            ) : (
              <table className="w-full border">
                <thead>
                  <tr className="bg-gray-200 text-left">
                    <th className="p-2">ID</th>
                    <th className="p-2">Name</th>
                    <th className="p-2">Email</th>
                    <th className="p-2">Mobile</th>
                    <th className="p-2">City</th>
                  </tr>
                </thead>
                <tbody>
                  {customerContacts.map((c) => (
                    <tr key={c.id} className="border-t">
                      <td className="p-2">{c.id}</td>  {/* ← show ID */}  
                      <td className="p-2">{c.name}</td>
                      <td className="p-2">{c.email || "-"}</td>
                      <td className="p-2">{c.mobile || "-"}</td>
                      <td className="p-2">{c.city || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Vendors Table */}
          <div>
            <h2 className="text-xl font-semibold mb-2">Vendors</h2>
            {vendorContacts.length === 0 ? (
              <p>No vendors found.</p>
            ) : (
              <table className="w-full border">
                <thead>
                  <tr className="bg-gray-200 text-left">
                    <th className="p-2">ID</th>  
                    <th className="p-2">Name</th>
                    <th className="p-2">Email</th>
                    <th className="p-2">Mobile</th>
                    <th className="p-2">City</th>
                  </tr>
                </thead>
                <tbody>
                  {vendorContacts.map((c) => (
                    <tr key={c.id} className="border-t">
                      <td className="p-2">{c.id}</td>  {/* ← show ID */}
                      <td className="p-2">{c.name}</td>
                      <td className="p-2">{c.email || "-"}</td>
                      <td className="p-2">{c.mobile || "-"}</td>
                      <td className="p-2">{c.city || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
