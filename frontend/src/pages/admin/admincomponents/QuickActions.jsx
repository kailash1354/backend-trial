import React from "react";
import { Paper, Typography, Box } from "@mui/material";
import { Link } from "react-router-dom";
import {
  Plus,
  Settings as StoreSettings,
  MessageSquare,
  BarChart2,
  Edit,
} from "lucide-react";

const defaultQuickActionsData = [
  { label: "Add New Product", icon: Plus, path: "/admin/products/new" },
  { label: "Manage Orders", icon: Edit, path: "/admin/orders" },
  { label: "Customer Support", icon: MessageSquare, path: "#" },
  { label: "View Analytics", icon: BarChart2, path: "/admin/analytics" },
  { label: "Store Settings", icon: StoreSettings, path: "/admin/settings" },
];

const QuickActions = ({ actions = defaultQuickActionsData }) => {
  return (
    <Paper
      sx={{
        bgcolor: "rgb(var(--card))",
        p: 2.5,
        borderRadius: "8px",
        border: "1px solid rgb(var(--border))",
        boxShadow: "var(--shadow-lg)",
        height: "100%",
      }}
      className="admin-card"
    >
      <Typography
        variant="h6"
        sx={{
          fontWeight: "600",
          color: "rgb(var(--text))",
          mb: 2,
          px: 1,
          fontSize: "1.1rem",
          borderBottom: "1px solid rgb(var(--border))",
          pb: 2,
        }}
      >
        Quick Actions
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, mt: 2.5 }}>
        {actions.map((action, index) => (
          <Link
            key={index}
            to={action.path}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors duration-200 group ${
              index === 0
                ? "btn-luxury-primary !justify-start !font-medium" // Use main gold button
                : "btn-luxury-secondary !text-primary !border-transparent hover:!bg-highlight !justify-start !shadow-none !font-medium" // Use standard secondary
            }`}
          >
            <action.icon
              className={`w-4 h-4 flex-shrink-0 ${
                index === 0
                  ? "text-inherit"
                  : "text-muted group-hover:text-primary"
              }`}
            />
            <span className="text-sm font-medium">{action.label}</span>
          </Link>
        ))}
      </Box>
    </Paper>
  );
};

export default QuickActions;
