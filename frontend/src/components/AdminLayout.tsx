import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';

export interface AdminLayoutContextType {
  toggleSidebar: () => void;
}

export default function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100">
      <AdminSidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <Outlet context={{ toggleSidebar } satisfies AdminLayoutContextType} />
    </div>
  );
}
