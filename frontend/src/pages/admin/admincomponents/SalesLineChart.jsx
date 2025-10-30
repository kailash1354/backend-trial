import React from "react";
import { LineChart } from "@mui/x-charts/LineChart";
import { Box, Typography, Select, MenuItem, Paper } from "@mui/material";

const pData = [
  2400, 1398, 9800, 3908, 4800, 3800, 4300, 3200, 4100, 5000, 4500, 6000,
];
const revenueData = [
  1500, 2300, 2000, 2780, 1890, 2390, 3490, 2900, 3100, 4000, 3800, 4200,
];
const xLabels = [
  "Jul 24",
  "Aug 24",
  "Sep 24",
  "Oct 24",
  "Nov 24",
  "Dec 24",
  "Jan 25",
  "Feb 25",
  "Mar 25",
  "Apr 25",
  "May 25",
  "Jun 25",
];

const primaryLineColor = "rgb(var(--chart-color-1))"; // Gold
const secondaryLineColor = "rgb(var(--chart-color-2))"; // Blue

const SalesLineChart = () => {
  const [timeRange, setTimeRange] = React.useState("12M");

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
          Sales Overview
        </Typography>
        <Select
          value={timeRange}
          onChange={(e) => setTimeRange(e.target.value)}
          size="small"
          variant="outlined"
          className="input-luxury !py-1 !px-2 !text-xs !rounded-md !bg-highlight !border-transparent focus:!border-[rgb(var(--border))] focus:!ring-0"
          sx={{
            ".MuiSelect-select": { py: "4px", px: "10px" },
            ".MuiSvgIcon-root": { color: "rgb(var(--muted))" },
            minWidth: "120px",
          }}
        >
          <MenuItem value="30D">Last 30 Days</MenuItem>
          <MenuItem value="3M">Last 3 Months</MenuItem>
          <MenuItem value="12M">Last 12 Months</MenuItem>
        </Select>
      </Box>
      <Box sx={{ height: 350 }}>
        <LineChart
          height={350}
          series={[
            {
              data: pData,
              label: "Sales Volume",
              yAxisKey: "leftAxisId",
              color: primaryLineColor,
              showMark: false,
            },
            {
              data: revenueData,
              label: "Revenue",
              yAxisKey: "rightAxisId",
              color: secondaryLineColor,
              showMark: false,
            },
          ]}
          xAxis={[{ scaleType: "point", data: xLabels }]}
          yAxis={[
            { id: "leftAxisId" },
            // FIX: Defined the right axis properties directly here
            { id: "rightAxisId", position: "right" },
          ]}
          // FIX: Removed the problematic 'rightAxis="rightAxisId"' prop
          sx={{
            ".MuiChartsAxis-line": { stroke: "transparent" },
            ".MuiChartsAxis-tickLabel": {
              fill: "rgb(var(--muted))",
              fontSize: "0.75rem",
            },
            ".MuiChartsAxis-tick": { stroke: "transparent" },
            ".MuiLineElement-root": { strokeWidth: 2.5 },
            ".MuiCharts-tooltip-line": { stroke: "rgb(var(--border))" },
            ".MuiChartsLegend-label": {
              fill: "rgb(var(--muted))",
              fontSize: "0.8rem",
            },
          }}
          grid={{
            horizontal: true,
            strokeDasharray: "2 4",
            stroke: "rgba(var(--chart-grid), 0.6)",
          }}
          tooltip={{ trigger: "axis" }}
          slotProps={{
            legend: {
              position: { vertical: "top", horizontal: "start" },
              padding: { top: -10 },
            },
            tooltip: {
              contentStyle: {
                backgroundColor: "rgb(var(--surface))",
                borderColor: "rgb(var(--border))",
                borderRadius: "8px",
                padding: "8px 12px",
              },
              labelStyle: {
                color: "rgb(var(--text))",
                fontWeight: "600",
                fontSize: "12px",
                marginBottom: "4px",
              },
              itemStyle: { color: "rgb(var(--text))", fontSize: "12px" },
            },
          }}
        />
      </Box>
    </Paper>
  );
};

export default SalesLineChart;
