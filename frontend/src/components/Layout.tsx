import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export type LayoutContextType = {
  toggleSidebar: () => void;
};

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display h-screen flex overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex-1 flex flex-col h-full overflow-hidden relative w-full">
        <Outlet context={{ toggleSidebar: () => setIsSidebarOpen(prev => !prev) } satisfies LayoutContextType} />
      </div>
    </div>
  );
}
