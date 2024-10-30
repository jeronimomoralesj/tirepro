// SidebarLayout.js
import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import './SidebarLayout.css'; // Add any layout-specific styling if needed

const SidebarLayout = () => {
  return (
    <div className="sidebar-layout">
      <Sidebar />
      <main className="content">
        <Outlet /> {/* This will render the nested route content */}
      </main>
    </div>
  );
};

export default SidebarLayout;
