import React from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Eye,
  Plus,
  Settings as StoreSettings,
  MessageSquare,
  BarChart2,
  Edit,
} from "lucide-react";

// Placeholder Data
const recentOrdersData = [
  {
    id: "ORD-2024-001",
    customer: "John Doe",
    total: 299.0,
    status: "Delivered",
    statusColor:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-300 dark:border-green-700",
  }, // Added border
  {
    id: "ORD-2024-002",
    customer: "Jane Smith",
    total: 189.0,
    status: "Processing",
    statusColor:
      "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 border border-yellow-300 dark:border-yellow-700",
  },
  {
    id: "ORD-2024-003",
    customer: "Mike Johnson",
    total: 458.0,
    status: "Shipped",
    statusColor:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-300 dark:border-blue-700",
  },
  {
    id: "ORD-2024-004",
    customer: "Sarah Lee",
    total: 75.5,
    status: "Delivered",
    statusColor:
      "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border border-green-300 dark:border-green-700",
  },
  {
    id: "ORD-2024-005",
    customer: "David Chen",
    total: 550.0,
    status: "Cancelled",
    statusColor:
      "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-300 dark:border-red-700",
  }, // Added Cancelled
];

const quickActionsData = [
  { label: "Add New Product", icon: Plus, path: "/admin/products/new" },
  { label: "Manage Orders", icon: Edit, path: "/admin/orders" }, // Should link to a more detailed orders page
  { label: "Customer Support", icon: MessageSquare, path: "#" }, // Placeholder path
  { label: "View Analytics", icon: BarChart2, path: "#" }, // Placeholder path
  { label: "Store Settings", icon: StoreSettings, path: "/admin/settings" },
];

// Reusable Status Badge
const StatusBadge = ({ text, colorClasses }) => (
  <span
    className={`px-2.5 py-1 rounded-full text-xs font-semibold ${colorClasses}`}
  >
    {" "}
    {/* Increased py */}
    {text}
  </span>
);

const Orders = () => {
  return (
    <>
      <Helmet>
        <title>Admin Orders - Luxe Heritage</title>
      </Helmet>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header can be removed if using AdminLayout header */}
        {/* <h1 className="text-3xl font-bold text-primary mb-8">Order Management</h1> */}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-start">
          {/* Recent Orders Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="lg:col-span-2 bg-card p-6 rounded-xl border border-[rgb(var(--border))]" // Increased padding
          >
            <div className="flex justify-between items-center mb-5">
              {" "}
              {/* Increased margin */}
              <h2 className="text-xl font-semibold text-primary">
                Recent Orders
              </h2>{" "}
              {/* Increased size */}
              <Link
                to="/admin/orders/all"
                className="text-sm font-medium text-accent hover:text-accent-2"
              >
                View All
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[rgb(var(--border))]">
                <thead className="bg-transparent">
                  {" "}
                  {/* Removed highlight bg */}
                  <tr>
                    <th
                      scope="col"
                      className="px-4 py-3.5 text-left text-xs font-semibold text-muted uppercase tracking-wider"
                    >
                      Order ID
                    </th>{" "}
                    {/* Increased py */}
                    <th
                      scope="col"
                      className="px-4 py-3.5 text-left text-xs font-semibold text-muted uppercase tracking-wider"
                    >
                      Customer
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3.5 text-left text-xs font-semibold text-muted uppercase tracking-wider"
                    >
                      Total
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3.5 text-left text-xs font-semibold text-muted uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-4 py-3.5 text-left text-xs font-semibold text-muted uppercase tracking-wider"
                    >
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-card divide-y divide-[rgb(var(--border))]">
                  {recentOrdersData.map((order) => (
                    <tr
                      key={order.id}
                      className="hover:bg-highlight transition-colors duration-150"
                    >
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-primary">
                        {order.id}
                      </td>{" "}
                      {/* Increased py */}
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-muted">
                        {order.customer}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-primary font-medium">
                        ${order.total.toFixed(2)}
                      </td>{" "}
                      {/* Bolder price */}
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <StatusBadge
                          text={order.status}
                          colorClasses={order.statusColor}
                        />
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm">
                        <Link
                          to={`/admin/orders/${order.id}`}
                          className="text-accent hover:text-accent-2 inline-flex items-center font-medium"
                        >
                          {" "}
                          {/* Bolder link */}
                          <Eye className="w-4 h-4 mr-1.5" /> View
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Add Pagination if needed */}
            </div>
          </motion.div>

          {/* Quick Actions Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="bg-card p-6 rounded-xl border border-[rgb(var(--border))]" // Increased padding
          >
            <h2 className="text-xl font-semibold text-primary mb-5 border-b border-[rgb(var(--border))] pb-3">
              Quick Actions
            </h2>{" "}
            {/* Increased size/margin */}
            <div className="space-y-3">
              {quickActionsData.map((action, index) => (
                <Link
                  key={index}
                  to={action.path}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 group ${
                    // Added group
                    index === 0
                      ? "bg-accent text-btn-text hover:bg-accent-2 shadow-sm"
                      : "bg-highlight hover:bg-[rgba(var(--border),0.5)] text-primary"
                  }`}
                >
                  <action.icon
                    className={`w-5 h-5 flex-shrink-0 transition-colors duration-200 ${
                      index === 0
                        ? "text-inherit"
                        : "text-muted group-hover:text-primary"
                    }`}
                  />{" "}
                  {/* Icon color change on hover */}
                  <span className="text-sm font-medium">{action.label}</span>
                </Link>
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
};

export default Orders;
