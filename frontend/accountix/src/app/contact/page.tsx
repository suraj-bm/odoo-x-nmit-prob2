'use client';

import React from 'react';

// Mock data for contacts
const contacts = [
    {
        id: 1,
        name: 'Nimesh Pathak',
        type: 'Customer',
        email: 'nimesh.p@example.com',
        phone: '9876543210',
        img: 'https://i.pravatar.cc/150?u=a042581f4e29026704a'
    },
    {
        id: 2,
        name: 'Azure Furniture',
        type: 'Vendor',
        email: 'contact@azurefurniture.com',
        phone: '8765432109',
        img: 'https://i.pravatar.cc/150?u=a042581f4e29026704b'
    },
    {
        id: 3,
        name: 'Rohan Sharma',
        type: 'Customer',
        email: 'rohan.s@example.com',
        phone: '7654321098',
        img: 'https://i.pravatar.cc/150?u=a042581f4e29026704c'
    },
    {
        id: 4,
        name: 'Royal Oak',
        type: 'Vendor',
        email: 'sales@royaloak.com',
        phone: '6543210987',
        img: 'https://i.pravatar.cc/150?u=a042581f4e29026704d'
    },
    {
        id: 5,
        name: 'Greenwood Inc.',
        type: 'Both',
        email: 'support@greenwood.com',
        phone: '5432109876',
        img: 'https://i.pravatar.cc/150?u=a042581f4e29026704e'
    }
];

// This is the main component for the contacts page.
const ContactsPage = () => {
    return (
        <div className="flex h-screen bg-gray-100 font-sans">

            {/* Main content */}
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="flex items-center justify-between pb-6 border-b">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Contacts</h1>
                        <p className="text-gray-600">Manage your customers and vendors</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <input type="text" placeholder="Search contacts..." className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                        </div>
                         <button className="px-4 py-2 font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700">
                            + New Contact
                        </button>
                    </div>
                </header>

                {/* Contacts Table */}
                <div className="mt-8 bg-white rounded-lg shadow-md">
                     <div className="p-6">
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
                                {contacts.map((contact, index) => (
                                    <tr key={contact.id} className={index % 2 === 0 ? '' : 'bg-gray-50'}>
                                        <td className="py-4 px-4 flex items-center">
                                            <img src={contact.img} alt={contact.name} className="w-10 h-10 rounded-full mr-4" />
                                            <span className="font-medium">{contact.name}</span>
                                        </td>
                                        <td className="py-4 px-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                contact.type === 'Customer' ? 'bg-blue-100 text-blue-700' :
                                                contact.type === 'Vendor' ? 'bg-purple-100 text-purple-700' :
                                                'bg-gray-200 text-gray-800'
                                            }`}>
                                                {contact.type}
                                            </span>
                                        </td>
                                        <td className="py-4 px-4">{contact.email}</td>
                                        <td className="py-4 px-4">{contact.phone}</td>
                                        <td className="py-4 px-4">
                                            <button className="text-indigo-600 hover:text-indigo-900 mr-4">Edit</button>
                                            <button className="text-red-600 hover:text-red-900">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ContactsPage;

