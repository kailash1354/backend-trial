import React from "react";
import { PieChart } from "@mui/x-charts/PieChart";
import { Box, Typography, Paper } from "@mui/material";

// Use new chart color palette
const pieColors = [
  "rgb(var(--chart-color-1))",
  "rgb(var(--chart-color-2))",
  "rgb(var(--chart-color-3))",
  "rgb(var(--chart-color-4))",
];

const data = [
  { id: 0, value: 40, label: "Women" },
  { id: 1, value: 30, label: "Men" },
  { id: 2, value: 20, label: "Accessories" },
  { id: 3, value: 10, label: "Shoes" },
].map((item, index) => ({
  ...item,
  color: pieColors[index % pieColors.length],
}));

const CategoryPieChart = () => {
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
        }}
      >
        Sales by Category
      </Typography>
      <Box
        sx={{
          height: 250,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <PieChart
          series={[
            {
              data: data,
              innerRadius: 60,
              outerRadius: 90,
              paddingAngle: 2,
              cornerRadius: 5,
              startAngle: -90,
              endAngle: 270,
              highlightScope: { faded: "global", highlighted: "item" },
              faded: {
                innerRadius: 55,
                additionalRadius: -5,
                color: "rgba(var(--muted), 0.2)",
              },
            },
          ]}
          height={200}
          sx={{
            // Existing styles (targeting series text)
            ".MuiChartsLegend-series > text": {
              fill: "rgb(var(--muted)) !important",
              fontSize: "13px",
              fontFamily: "Inter, sans-serif",
            },
            // FIX: Target the legend labels directly using CSS selector
            ".MuiChartsLegend-label": {
              fontSize: 13,
              fill: "rgb(var(--muted))",
            },
            // FIX: Set explicit size for legend marks via selectors (optional, but ensures style)
            ".MuiChartsLegend-mark": {
              width: 10,
              height: 10,
            },
          }}
          slotProps={{
            legend: {
              hidden: false,
              position: { vertical: "middle", horizontal: "end" },
              direction: "vertical",
              // FIX: Removed leaking props (itemMarkWidth, itemMarkHeight, labelStyle)
            },
          }}
        />
      </Box>
    </Paper>
  );
};

export default CategoryPieChart;
