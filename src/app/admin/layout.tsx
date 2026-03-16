"use client";

import { usePathname } from "next/navigation";
import { AdminGuard } from "@/components/admin/layout/admin-guard";
import { AdminSidebar } from "@/components/admin/layout/admin-sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  return (
    <AdminGuard>
      {isLoginPage ? (
        children
      ) : (
        <div className="min-h-screen bg-gray-50">
          <AdminSidebar />
          <main className="ml-60 p-6">{children}</main>
        </div>
      )}
    </AdminGuard>
  );
}
