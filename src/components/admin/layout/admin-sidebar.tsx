"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLogout } from "@/hooks/use-auth";

const navLinks = [
  { href: "/admin", label: "Дашборд" },
  { href: "/admin/orders", label: "Замовлення" },
  { href: "/admin/products", label: "Товари" },
  { href: "/admin/artists", label: "Артисти" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const logout = useLogout();

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <aside className="fixed left-0 top-0 w-60 h-screen bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-sm font-bold text-gray-900 tracking-wider">
          AFRICA ADMIN
        </h1>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={`block px-3 py-2 rounded-lg text-sm ${
              isActive(link.href)
                ? "bg-gray-100 font-semibold text-gray-900"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      <div className="p-3 border-t border-gray-200">
        <button
          type="button"
          onClick={logout}
          className="w-full text-left px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        >
          Вийти
        </button>
      </div>
    </aside>
  );
}
