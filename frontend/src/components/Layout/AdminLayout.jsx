import { Outlet, Link, NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Users,
  List,
  FileText,
  Settings,
  Menu,
  X,
  LogOut,
  ChevronDown,
} from "lucide-react";
import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";

const EXPANDED_WIDTH = "16rem";
const COLLAPSED_WIDTH = "4.5rem";

const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Mobile overlay state
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() =>
    window.innerWidth >= 1024 ? true : false
  );
  const sidebarCollapseTimerRef = useRef(null);
  const { user, logout } = useAuth();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  // --- Resizing and Mobile/Desktop State Management ---
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (mobile) {
        setIsSidebarOpen(false); // Mobile uses overlay, always closed initially
        setIsSidebarCollapsed(false); // Disable collapse state on mobile
      } else {
        // Desktop uses collapsed state on load
        setIsSidebarCollapsed(true);
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // --- Desktop Hover Logic (Open on Enter, Collapse on Leave) ---
  const handleMouseEnterSidebar = () => {
    clearTimeout(sidebarCollapseTimerRef.current);
    if (isSidebarCollapsed) setIsSidebarCollapsed(false);
  };
  const handleMouseLeaveSidebar = () => {
    clearTimeout(sidebarCollapseTimerRef.current);
    if (!isMobile) {
      setIsSidebarCollapsed(true); // Collapse instantly on desktop leave
    }
  };

  const handleLogout = async () => {
    await logout();
  };

  // --- Sidebar Link Definitions ---
  const sidebarLinks = [
    { path: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
    { path: "/admin/products", icon: Package, label: "Products" },
    { path: "/admin/orders", icon: FileText, label: "Orders" },
    { path: "/admin/users", icon: Users, label: "Customers" },
    { path: "/admin/categories", icon: List, label: "Categories" },
    { path: "/admin/settings", icon: Settings, label: "Settings" }, // Added Settings route
  ];

  const headerNavLinks = [
    { path: "/admin", label: "Dashboard", end: true },
    { path: "/admin/products", label: "Products" },
    { path: "/admin/orders", label: "Orders" },
    { path: "/admin/users", label: "Customers" },
  ];

  const activeSidebarLinkClasses = "sidebar-active";
  const defaultSidebarLinkClasses =
    "text-muted hover:text-primary hover:bg-highlight";
  const activeHeaderLinkClasses =
    "bg-highlight text-accent font-semibold border-highlight";
  const defaultHeaderLinkClasses =
    "border-transparent text-muted hover:text-primary";

  return (
    <div className="min-h-screen flex bg-primary relative overflow-x-hidden admin-layout">
      {/* --- 1. Sidebar --- */}
      <motion.div
        // Use width based on state
        animate={{
          width: isMobile
            ? isSidebarOpen
              ? EXPANDED_WIDTH
              : "0rem"
            : isSidebarCollapsed
            ? COLLAPSED_WIDTH
            : EXPANDED_WIDTH,
          // CRITICAL FIX: Use 'x' to translate the sidebar completely off-screen when mobile and closed.
          x: isMobile ? (isSidebarOpen ? 0 : -300) : 0,
        }}
        transition={{ duration: 0.25, ease: "circOut" }}
        className={`z-50 bg-surface border-r border-[rgb(var(--border))] flex flex-col transition-transform duration-300
                    lg:sticky lg:top-0 lg:h-screen lg:transform-none lg:transition-[width] 
                    ${isMobile ? `fixed inset-y-0 left-0 shadow-xl` : ""}`}
        onMouseEnter={isMobile ? undefined : handleMouseEnterSidebar}
        onMouseLeave={isMobile ? undefined : handleMouseLeaveSidebar}
      >
        {/* Sidebar Header */}
        <div
          className={`flex items-center p-4 h-20 border-b border-[rgb(var(--border))] flex-shrink-0 overflow-hidden ${
            isSidebarCollapsed && !isMobile
              ? "justify-center pl-3"
              : "justify-between"
          }`}
        >
          {/* Expanded Logo */}
          <Link
            to="/"
            className={`text-xl font-bold font-display text-primary transition-opacity duration-200 whitespace-nowrap 
              ${
                isSidebarCollapsed && !isMobile
                  ? "opacity-0 absolute invisible"
                  : "opacity-100"
              }`}
          >
            {" "}
            Luxe<span className="logo-secondary font-semibold">
              Heritage
            </span>{" "}
            <span className="ml-1 text-xs font-medium text-muted align-middle">
              Admin
            </span>{" "}
          </Link>
          {/* Collapsed Logo */}
          <Link
            to="/admin"
            className={`text-2xl font-bold font-display text-primary transition-opacity duration-200 
              ${
                !isSidebarCollapsed || isMobile
                  ? "opacity-0 absolute invisible"
                  : "opacity-100"
              }`}
          >
            {" "}
            LH{" "}
          </Link>
          {/* Mobile Close Button */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className={`lg:hidden p-1 text-muted hover:text-primary hover:bg-highlight rounded-full 
              ${!isMobile && isSidebarCollapsed ? "!hidden" : ""}`}
            aria-label="Close sidebar"
          >
            {" "}
            <X className="w-5 h-5" />{" "}
          </button>
        </div>

        {/* Sidebar Navigation */}
        <nav
          className={`overflow-y-auto flex-grow overflow-x-hidden ${
            isSidebarCollapsed && !isMobile ? "px-2 pt-4" : "px-3 pt-4"
          }`}
        >
          <ul className="space-y-1">
            {sidebarLinks.map((link) => (
              <li
                key={link.path}
                title={isSidebarCollapsed && !isMobile ? link.label : undefined}
              >
                <NavLink
                  to={link.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-3 rounded-md transition-all duration-200 ease-in-out group ${
                      isActive
                        ? activeSidebarLinkClasses
                        : defaultSidebarLinkClasses
                    } ${
                      isSidebarCollapsed && !isMobile
                        ? "justify-center !px-2 py-3"
                        : "px-3 py-2.5"
                    }`
                  }
                  end={link.end}
                  onClick={() => isMobile && setIsSidebarOpen(false)}
                >
                  {({ isActive }) => (
                    <>
                      <link.icon
                        className={`w-5 h-5 flex-shrink-0 transition-colors duration-200 ${
                          isActive
                            ? "text-accent"
                            : "text-muted group-hover:text-primary"
                        }`}
                      />
                      <span
                        className={`text-sm font-medium ${
                          isSidebarCollapsed && !isMobile
                            ? "opacity-0 absolute left-full ml-2 pointer-events-none invisible"
                            : "opacity-100 visible"
                        }`}
                      >
                        {link.label}
                      </span>
                    </>
                  )}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Info & Logout (Hidden when collapsed/mobile) */}
        <div
          className={`p-3 border-t border-[rgb(var(--border))] bg-surface flex-shrink-0 mt-auto transition-opacity duration-200 ease-in-out 
            ${
              isSidebarCollapsed && !isMobile
                ? "opacity-0 pointer-events-none invisible h-0 overflow-hidden"
                : "opacity-100 visible h-auto"
            }`}
        >
          <div className="flex items-center space-x-3 mb-3 p-2 rounded-lg">
            <div className="w-8 h-8 bg-highlight border border-[rgb(var(--border))] rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-semibold text-muted uppercase">
                {user?.firstName?.[0]}
                {user?.lastName?.[0]}
              </span>
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-primary truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-muted capitalize truncate">
                {user?.role}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center w-full space-x-2 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors duration-200 focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--surface))]"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>
      </motion.div>{" "}
      {/* End Sidebar */}
      {/* --- 2. Main Content Area --- */}
      <motion.div
        // Margin logic only applies to desktop (lg:), ensuring mobile uses full width (0rem margin)
        animate={{
          marginLeft: isMobile
            ? "0rem"
            : isSidebarCollapsed
            ? COLLAPSED_WIDTH
            : EXPANDED_WIDTH,
        }}
        transition={{ duration: 0.25, ease: "circOut" }}
        className="flex-1 flex flex-col bg-primary min-w-0"
      >
        {/* Header Bar */}
        <header className="sticky top-0 z-30 h-20 bg-surface border-b border-[rgb(var(--border))] flex items-center px-6 flex-shrink-0 shadow-sm">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="lg:hidden p-2 -ml-2 mr-4 text-muted hover:text-primary"
                aria-label="Open sidebar"
              >
                <Menu className="w-6 h-6" />
              </button>
              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-1">
                {" "}
                {headerNavLinks.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    className={({ isActive }) =>
                      `px-3 py-1.5 rounded-md text-sm font-medium border-2 transition-colors duration-200 ease-in-out ${
                        isActive
                          ? activeHeaderLinkClasses
                          : defaultHeaderLinkClasses
                      }`
                    }
                    end={link.end}
                  >
                    {" "}
                    {link.label}{" "}
                  </NavLink>
                ))}{" "}
              </nav>
            </div>
            {/* User Avatar/Role Display */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 cursor-pointer group relative">
                {" "}
                <span className="flex items-center justify-center w-8 h-8 rounded-full bg-accent text-btn-text text-sm font-semibold uppercase">
                  {" "}
                  {user?.firstName?.[0]}
                  {user?.lastName?.[0]}{" "}
                </span>{" "}
                <span className="text-sm font-medium text-primary hidden md:inline">
                  {user?.role === "admin" ? "Admin" : user?.firstName}
                </span>{" "}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-grow p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="p-4 text-center text-xs text-muted border-t border-[rgb(var(--border))] bg-surface mt-auto flex-shrink-0">
          © {new Date().getFullYear()} Luxe Heritage Admin Panel. All rights
          reserved.
        </footer>
      </motion.div>
      {/* 3. Mobile Overlay Backdrop */}
      <AnimatePresence>
        {" "}
        {isSidebarOpen && isMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}{" "}
      </AnimatePresence>
    </div>
  );
};

export default AdminLayout;
