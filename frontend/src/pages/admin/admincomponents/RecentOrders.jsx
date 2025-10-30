import React from "react";
import {
  Paper,
  Typography,
  Box,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
} from "@mui/material";
import { Link } from "react-router-dom";
import { Eye } from "lucide-react";

// Reusable Status Badge
const StatusBadge = ({ text, statusType = "default" }) => {
  let colorClasses = "";
  switch (statusType.toLowerCase()) {
    case "delivered":
      colorClasses =
        "bg-[rgba(var(--success),0.1)] text-[rgb(var(--success))] border border-transparent";
      break;
    case "processing":
      colorClasses =
        "bg-[rgba(var(--warning),0.1)] text-[rgb(var(--warning))] border border-transparent";
      break;
    case "shipped":
      colorClasses =
        "bg-[rgba(var(--info),0.1)] text-[rgb(var(--info))] border border-transparent";
      break;
    case "cancelled":
      colorClasses =
        "bg-[rgba(var(--error),0.1)] text-[rgb(var(--error))] border border-transparent";
      break;
    default:
      colorClasses = "bg-highlight text-muted border border-transparent";
  }
  return (
    <span
      className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${colorClasses}`}
    >
      {" "}
      {text}{" "}
    </span>
  );
};

// Placeholder Data
const defaultRecentOrdersData = [
  {
    id: "ORD-2024-001",
    customer: "John Doe",
    total: 299.0,
    status: "Delivered",
  },
  {
    id: "ORD-2024-002",
    customer: "Jane Smith",
    total: 189.0,
    status: "Processing",
  },
  {
    id: "ORD-2024-003",
    customer: "Mike Johnson",
    total: 458.0,
    status: "Shipped",
  },
];

const RecentOrders = ({
  orders = defaultRecentOrdersData,
  showViewAll = true,
}) => {
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
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
          px: 1,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            fontWeight: "600",
            color: "rgb(var(--text))",
            fontSize: "1.1rem",
          }}
        >
          Recent Orders
        </Typography>
        {showViewAll && (
          <Link
            to="/admin/orders"
            className="text-sm font-medium text-accent hover:text-accent-2"
          >
            {" "}
            View All{" "}
          </Link>
        )}
      </Box>
      <TableContainer>
        <Table sx={{ minWidth: "100%" }} aria-label="Recent orders table">
          <TableHead sx={{ bgcolor: "transparent" }}>
            <TableRow>
              <TableCell
                sx={{
                  color: "rgb(var(--muted))",
                  fontSize: "0.8rem",
                  fontWeight: 500,
                  borderBottom: "1px solid rgb(var(--border))",
                  py: 1.5,
                  px: 2,
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                }}
              >
                Order ID
              </TableCell>
              <TableCell
                sx={{
                  color: "rgb(var(--muted))",
                  fontSize: "0.8rem",
                  fontWeight: 500,
                  borderBottom: "1px solid rgb(var(--border))",
                  py: 1.5,
                  px: 2,
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                }}
              >
                Customer
              </TableCell>
              <TableCell
                sx={{
                  color: "rgb(var(--muted))",
                  fontSize: "0.8rem",
                  fontWeight: 500,
                  borderBottom: "1px solid rgb(var(--border))",
                  py: 1.5,
                  px: 2,
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                }}
              >
                Total
              </TableCell>
              <TableCell
                sx={{
                  color: "rgb(var(--muted))",
                  fontSize: "0.8rem",
                  fontWeight: 500,
                  borderBottom: "1px solid rgb(var(--border))",
                  py: 1.5,
                  px: 2,
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                }}
              >
                Status
              </TableCell>
              <TableCell
                sx={{
                  color: "rgb(var(--muted))",
                  fontSize: "0.8rem",
                  fontWeight: 500,
                  borderBottom: "1px solid rgb(var(--border))",
                  py: 1.5,
                  px: 2,
                  letterSpacing: "0.5px",
                  textTransform: "uppercase",
                }}
              >
                Action
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow
                key={order.id}
                sx={{
                  "&:last-child td, &:last-child th": { border: 0 },
                  "&:hover": { bgcolor: "rgb(var(--highlight))" },
                  transition: "background-color 0.15s ease-in-out",
                }}
              >
                <TableCell
                  sx={{
                    color: "rgb(var(--text))",
                    fontWeight: 500,
                    fontSize: "0.875rem",
                    borderBottom: "1px solid rgb(var(--border))",
                    py: 2,
                    px: 2,
                  }}
                >
                  {order.id}
                </TableCell>
                <TableCell
                  sx={{
                    color: "rgb(var(--muted))",
                    fontSize: "0.875rem",
                    borderBottom: "1px solid rgb(var(--border))",
                    py: 2,
                    px: 2,
                  }}
                >
                  {order.customer}
                </TableCell>
                <TableCell
                  sx={{
                    color: "rgb(var(--text))",
                    fontWeight: 500,
                    fontSize: "0.875rem",
                    borderBottom: "1px solid rgb(var(--border))",
                    py: 2,
                    px: 2,
                  }}
                >
                  ${order.total.toFixed(2)}
                </TableCell>
                <TableCell
                  sx={{
                    borderBottom: "1px solid rgb(var(--border))",
                    py: 2,
                    px: 2,
                  }}
                >
                  {" "}
                  <StatusBadge
                    text={order.status}
                    statusType={order.status}
                  />{" "}
                </TableCell>
                <TableCell
                  sx={{
                    borderBottom: "1px solid rgb(var(--border))",
                    py: 2,
                    px: 2,
                  }}
                >
                  <Link
                    to={`/admin/orders/${order.id}`}
                    className="text-accent hover:text-accent-2 inline-flex items-center text-sm font-medium"
                  >
                    {" "}
                    <Eye className="w-4 h-4 mr-1" /> View{" "}
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Paper>
  );
};

export default RecentOrders;
