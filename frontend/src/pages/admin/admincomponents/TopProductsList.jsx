import React from "react";
import {
  Paper,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Box,
} from "@mui/material";
import { Link } from "react-router-dom";

const defaultTopProductsData = [
  {
    id: 1,
    name: "Classic Navy Blazer",
    sales: 45,
    price: 299.0,
    image: "/images/placeholder-thumb.jpg",
  },
  {
    id: 2,
    name: "Silk Evening Dress",
    sales: 32,
    price: 459.0,
    image: "/images/placeholder-thumb.jpg",
  },
  {
    id: 3,
    name: "Leather Oxford Shoes",
    sales: 28,
    price: 189.0,
    image: "/images/placeholder-thumb.jpg",
  },
];

const TopProductsList = ({ products = defaultTopProductsData }) => {
  return (
    <Paper
      sx={{
        bgcolor: "rgb(var(--card))",
        p: 3,
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
          px: 0,
          fontSize: "1.1rem",
          fontFamily: "Inter, sans-serif",
        }}
      >
        Top Products
      </Typography>
      <List disablePadding>
        {products.map((product) => (
          <ListItem
            key={product.id}
            disableGutters
            // Aligns the price text to the right, using secondaryAction
            secondaryAction={
              <Typography
                sx={{
                  fontWeight: 600,
                  color: "rgb(var(--accent))",
                  fontSize: "0.95rem",
                  // Ensure the price is positioned correctly within the reserved space
                  textAlign: "right",
                }}
              >
                ${product.price.toFixed(2)}
              </Typography>
            }
            // *** CRITICAL FIX: Ensure List Item reserves enough right padding (pr) ***
            sx={{
              py: 1.5,
              pl: 1.5,
              pr: 10, // <-- INCREASED PR TO 10 (80px) to prevent price overlap
              "&:hover": { bgcolor: "rgba(var(--highlight), 0.7)" },
              borderRadius: "6px",
            }}
          >
            <ListItemAvatar sx={{ minWidth: 50 }}>
              <Avatar
                variant="rounded"
                src={product.image}
                alt={product.name}
                sx={{
                  width: 40,
                  height: 40,
                  bgcolor: "rgb(var(--highlight))",
                  border: "1px solid rgb(var(--border))",
                  color: "rgb(var(--text))",
                  fontWeight: 500,
                  fontSize: "0.9rem",
                }}
              >
                {product.name ? product.name.charAt(0) : "P"}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Typography
                  component={Link}
                  to={`/admin/products/${product.id}`}
                  sx={{
                    fontWeight: 500,
                    color: "rgb(var(--text))",
                    fontSize: "0.9rem",
                    textDecoration: "none",
                    "&:hover": { color: "rgb(var(--accent))" },
                  }}
                >
                  {product.name}
                </Typography>
              }
              secondary={
                <Typography
                  sx={{ fontSize: "0.75rem", color: "rgb(var(--muted))" }}
                >
                  {product.sales} sales this month
                </Typography>
              }
              sx={{ m: 0, p: 0, pl: 1, overflow: "hidden" }}
            />
          </ListItem>
        ))}
      </List>
    </Paper>
  );
};

export default TopProductsList;
