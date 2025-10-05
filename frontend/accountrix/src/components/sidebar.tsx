"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, ClipboardList, ShoppingCart, Users, CreditCard, LogIn, Contact, GalleryHorizontalEnd } from "lucide-react";
import { apiFetch } from "@/app/utils/api";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<"owner" | "accountant" | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

useEffect(() => {
  if (!mounted) return;

  const storedToken = localStorage.getItem("accessToken");
  setToken(storedToken);

  if (!storedToken) {
    setLoading(false);
    return;
  }

  const fetchRole = async () => {
    try {
      const res = await apiFetch("http://127.0.0.1:8000/api/accounts/users/me/", {
        headers: {
          Authorization: `Bearer ${storedToken}`, // use storedToken here
        },
      });
console.log('fetchRole status:', res.status);
      if (!res.ok) {
        setToken(null);
        setUserRole(null);
      } else {
        const data = await res.json();
        setUserRole(data.role);
      }
    } catch (err) {
      console.error(err);
      setToken(null);
      setUserRole(null);
    } finally {
      setLoading(false);
    }
  };

  fetchRole();
}, [mounted]);


  if (!mounted || loading) return null; // wait until we know if user is logged in

  const menuItems = userRole
    ? [
        { name: "Dashboard", path: "/dashboard", icon: <Home size={18} /> },
        { name: "Purchases", path: "/purchases", icon: <ShoppingCart size={18} /> },
        { name: "Sales", path: "/sales", icon: <ClipboardList size={18} /> },
        { name: "Payments", path: "/payments", icon: <CreditCard size={18} /> },
        { name: "Contacts", path: "/contacts", icon: <Contact size={18} /> },
        { name: "Products", path: "/products", icon: <GalleryHorizontalEnd size={18} /> },


        ...(userRole === "owner" ? [{ name: "Users", path: "/users", icon: <Users size={18} /> }] : []),
      ]
    : [];

  return (
    <div className={`bg-gray-800 text-white h-screen p-4 flex flex-col ${isCollapsed ? "w-20" : "w-64"} transition-width duration-300`}>
      <div className="flex items-center justify-between mb-8">
        {!isCollapsed && <h1 className="text-xl font-bold">InventoryApp</h1>}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 hover:bg-gray-700 rounded"
        >
          {isCollapsed ? "→" : "←"}
        </button>
      </div>

      {token && userRole ? (
        <nav className="flex flex-col gap-2">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              href={item.path}
              className={`flex items-center gap-2 px-3 py-2 rounded hover:bg-gray-700 ${
                pathname === item.path ? "bg-gray-700 font-semibold" : ""
              }`}
            >
              {item.icon}
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          ))}
        </nav>
      ) : (
        <div className="mt-auto">
          <button
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded hover:bg-blue-700 bg-blue-500"
            onClick={() => router.push("/login")}
          >
            <LogIn size={18} />
            {!isCollapsed && <span>Sign In</span>}
          </button>
        </div>
      )}

      {token && userRole && !isCollapsed && (
        <div className="mt-auto">
          <button
            className="w-full px-3 py-2 rounded hover:bg-red-600 bg-red-500"
            onClick={() => {
              localStorage.removeItem("accessToken");
              setUserRole(null);
              setToken(null);
              router.push("/login");
            }}
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
