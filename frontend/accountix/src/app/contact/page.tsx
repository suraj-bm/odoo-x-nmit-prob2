'use client';

import React, { useEffect, useState } from "react";
import Sidebar from "@/components/sidebar";
import api from "../lib/api"; // Axios instance

interface Contact {
  id: number;
  name: string;
  contact_type: string;
  email: string;
  phone?: string;
}

const ContactsPage = () => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [form, setForm] = useState({
    name: "",
    contact_type: "customer",
    email: "",
    phone: "",
  });

  // Fetch contacts from API
  const fetchContacts = async () => {
  try {
    const res = await api.get("/master/contacts/");
    if (Array.isArray(res.data)) {
      // Non-paginated response
      setContacts(res.data);
    } else if (res.data.results && Array.isArray(res.data.results)) {
      // Paginated response
      setContacts(res.data.results);
    } else {
      console.warn("Unexpected API response:", res.data);
      setContacts([]);
    }
  } catch (err) {
    console.error("Error fetching contacts:", err);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchContacts();
  }, []);

  // Handle form input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Create or Update contact
  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    if (editingContact) {
      await api.put(`/master/contacts/${editingContact.id}/`, form);
    } else {
      await api.post("/master/contacts/", form);
    }
    setForm({ name: "", contact_type: "customer", email: "", phone: "" });
    setEditingContact(null);
    setShowForm(false);
    fetchContacts();
  } catch (err: any) {
    console.error("Error saving contact:", err.response?.data || err.message);
    alert("Error: " + JSON.stringify(err.response?.data || err.message));
  }
};


  // Delete contact
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this contact?")) return;
    try {
      await api.delete(`/master/contacts/${id}/`);
      fetchContacts();
    } catch (err) {
      console.error("Error deleting contact:", err);
    }
  };

  // Edit contact
  const handleEdit = (contact: Contact) => {
    setForm({
      name: contact.name,
      contact_type: contact.contact_type,
      email: contact.email,
      phone: contact.phone || "",
    });
    setEditingContact(contact);
    setShowForm(true);
  };

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-100 font-sans">
      <Sidebar activePage="contact" />

      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex items-center justify-between pb-6 border-b">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Contacts</h1>
            <p className="text-gray-600">Manage your customers and vendors</p>
          </div>
          <div className="flex items-center space-x-4">
            <input
              type="text"
              placeholder="Search contacts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={() => {
                setShowForm(true);
                setEditingContact(null);
                setForm({ name: "", contact_type: "customer", email: "", phone: "" });
              }}
              className="px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              + New Contact
            </button>
          </div>
        </header>

        {/* Contact Form Modal */}
        {showForm && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
            <div className="bg-white p-6 rounded-lg shadow-lg w-96">
              <h2 className="text-lg font-semibold mb-4">
                {editingContact ? "Edit Contact" : "New Contact"}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Name"
                  value={form.name}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded"
                  required
                />
                <select
                  name="contact_type"
                  value={form.contact_type}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded"
                >
                  <option value="customer">Customer</option>
                  <option value="vendor">Vendor</option>
                  <option value="both">Both</option>
                </select>
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded"
                  required
                />
                <input
                  type="text"
                  name="phone"
                  placeholder="Phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full border px-3 py-2 rounded"
                />
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 bg-gray-200 rounded"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded"
                  >
                    {editingContact ? "Update" : "Save"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Contacts Table */}
        <div className="mt-8 bg-white rounded-lg shadow-md">
          <div className="p-6">
            {loading ? (
              <p>Loading...</p>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="text-gray-600">
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Phone</th>
                    <th className="py-3 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-gray-700">
                  {filteredContacts.map((contact, index) => (
                    <tr
                      key={contact.id}
                      className={index % 2 === 0 ? "" : "bg-gray-50"}
                    >
                      <td className="py-4 px-4 font-medium">{contact.name}</td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            contact.contact_type === "customer"
                              ? "bg-blue-100 text-blue-700"
                              : contact.contact_type === "vendor"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-gray-200 text-gray-800"
                          }`}
                        >
                          {contact.contact_type}
                        </span>
                      </td>
                      <td className="py-4 px-4">{contact.email}</td>
                      <td className="py-4 px-4">{contact.phone}</td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => handleEdit(contact)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(contact.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredContacts.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-4 px-4 text-center text-gray-500">
                        No contacts found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ContactsPage;
