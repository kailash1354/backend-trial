import React from "react";
import { BarChart } from "@mui/x-charts/BarChart";
import { Box, Typography, Paper } from "@mui/material";
import { axisClasses } from "@mui/x-charts";

// Placeholder Data
const dataset = [
  { orders: 21, day: "Mon" },
  { orders: 28, day: "Tue" },
  { orders: 41, day: "Wed" },
  { orders: 32, day: "Thu" },
  { orders: 55, day: "Fri" },
  { orders: 38, day: "Sat" },
  { orders: 19, day: "Sun" },
];
const valueFormatter = (value) => `${value}`;

const chartSetting = {
  yAxis: [
    {
      label: "Orders",
      labelStyle: { fill: "rgb(var(--muted))", fontSize: "0.8rem" },
    },
  ],
  height: 200,
  sx: {
    [`.${axisClasses.left} .${axisClasses.label}`]: {
      transform: "translate(-15px, 0)",
      fill: "rgb(var(--muted))",
    },
    ".MuiChartsAxis-line": { stroke: "transparent" },
    ".MuiChartsAxis-tickLabel": {
      fill: "rgb(var(--muted))",
      fontSize: "0.75rem",
    },
    ".MuiChartsAxis-tick": { stroke: "transparent" },
    ".MuiBarElement-root": { rx: 3 },
  },
};

const DailyOrdersBarChart = () => {
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
        Orders Last 7 Days
      </Typography>
      <BarChart
        dataset={dataset}
        xAxis={[{ scaleType: "band", dataKey: "day" }]}
        series={[
          {
            dataKey: "orders",
            label: "Daily Orders",
            valueFormatter,
            color: "rgb(var(--chart-color-2))", // Use Indigo
          },
        ]}
        {...chartSetting}
        grid={{
          horizontal: true,
          strokeDasharray: "2 4",
          stroke: "rgba(var(--chart-grid), 0.6)",
        }}
        slotProps={{ legend: { hidden: true } }}
      />
    </Paper>
  );
};

export default DailyOrdersBarChart;
