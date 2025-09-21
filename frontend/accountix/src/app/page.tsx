'use client';

import React from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import Link from 'next/link';

const Home= () => {
    const { isAuthenticated, user, logout, loading: authLoading } = useAuth();

    // Helper component for feature cards
    const Feature = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
        <div className="bg-white p-6 rounded-lg shadow-sm text-center">
            <div className="flex justify-center items-center mb-4 text-indigo-600">
                {icon}
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">{title}</h3>
            <p className="text-gray-600">{description}</p>
        </div>
    );

    return (
        <div className="bg-gray-50 font-sans">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-50">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-800">Shiv Accounts</h1>
                    <nav className="hidden md:flex space-x-8">
                        <a href="#features" className="text-gray-600 hover:text-indigo-600">Features</a>
                        <a href="#pricing" className="text-gray-600 hover:text-indigo-600">Pricing</a>
                        <a href="#contact" className="text-gray-600 hover:text-indigo-600">Contact</a>
                    </nav>
                    <div>
                        {authLoading ? (
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                        ) : isAuthenticated ? (
                            <div className="flex items-center space-x-4">
                                <span className="text-gray-600">Welcome, {user?.username || 'User'}</span>
                                <Link href="/dashboard" className="text-gray-600 hover:text-indigo-600 mr-4">
                                    Dashboard
                                </Link>
                                <button
                                    onClick={logout}
                                    className="bg-red-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                                >
                                    Logout
                                </button>
                            </div>
                        ) : (
                            <>
                                <Link href="/loginpage" className="text-gray-600 hover:text-indigo-600 mr-4">
                                    Login
                                </Link>
                                <Link href="/loginpage" className="bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors">
                                    Sign Up
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <main>
                <section className="text-center py-20 bg-white">
                    <div className="container mx-auto px-6">
                        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-4">
                            Modern Accounting, Simplified
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
                            Shiv Accounts helps you manage your finances effortlessly with intuitive tools for invoicing, expense tracking, and real-time reporting.
                        </p>
                        <Link 
                            href={isAuthenticated ? "/dashboard" : "/loginpage"} 
                            className="bg-indigo-600 text-white font-semibold py-3 px-8 rounded-lg hover:bg-indigo-700 transition-colors text-lg"
                        >
                            {isAuthenticated ? "Go to Dashboard" : "Get Started for Free"}
                        </Link>
                    </div>
                </section>

                {/* Features Section */}
                <section id="features" className="py-20">
                    <div className="container mx-auto px-6">
                        <div className="text-center mb-12">
                            <h2 className="text-3xl font-bold text-gray-800">Everything You Need to Run Your Business</h2>
                            <p className="text-gray-600">Powerful features to streamline your financial workflow.</p>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <Feature
                                icon={<svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>}
                                title="Easy Invoicing"
                                description="Create and send professional invoices in minutes. Track payments and send reminders automatically."
                            />
                            <Feature
                                icon={<svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
                                title="Real-Time Reports"
                                description="Generate balance sheets, profit & loss statements, and inventory reports with a single click."
                            />
                            <Feature
                                icon={<svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>}
                                title="Manage Purchases"
                                description="Easily create purchase orders, convert them to bills, and track your payables."
                            />
                        </div>
                    </div>
                </section>
                
                 {/* CTA Section */}
                <section className="bg-indigo-600 text-white">
                    <div className="container mx-auto px-6 py-16 text-center">
                        <h2 className="text-3xl font-bold mb-3">Ready to Take Control of Your Finances?</h2>
                        <p className="max-w-xl mx-auto mb-6">Join hundreds of businesses simplifying their accounting with Shiv Accounts.</p>
                         <a href="#" className="bg-white text-indigo-600 font-semibold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors text-lg">
                            Start Your Free Trial
                        </a>
                    </div>
                </section>

            </main>

            {/* Footer */}
            <footer className="bg-white">
                <div className="container mx-auto px-6 py-8">
                    <div className="flex justify-between items-center">
                        <p className="text-gray-600">&copy; 2025 Shiv Accounts. All rights reserved.</p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-600 hover:text-indigo-600">Privacy Policy</a>
                            <a href="#" className="text-gray-600 hover:text-indigo-600">Terms of Service</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Home;
