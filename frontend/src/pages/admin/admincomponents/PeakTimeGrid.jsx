import React from "react";
import { Box, Typography, Paper } from "@mui/material";

// Placeholder Data
const heatmapData = [
  [0.1, 0.2, 0.3, 0.2, 0.4, 0.5, 0.3],
  [0.3, 0.4, 0.5, 0.6, 0.8, 0.7, 0.4],
  [0.5, 0.6, 0.7, 0.8, 0.9, 0.8, 0.6],
  [0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 0.7],
  [0.2, 0.3, 0.4, 0.3, 0.5, 0.6, 0.4],
];
const days = ["M", "T", "W", "T", "F", "S", "S"];
const times = ["6am", "10am", "12pm", "5pm", "8pm"];

const PeakTimeGrid = () => {
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
        Peak Order Times
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <Box sx={{ display: "flex", ml: "45px", mb: 0.5 }}>
          {days.map((day, index) => (
            <Typography
              key={`${day}-${index}`}
              sx={{
                flex: 1,
                textAlign: "center",
                fontSize: "0.7rem",
                color: "rgb(var(--muted))",
                fontWeight: 500,
              }}
            >
              {day}
            </Typography>
          ))}
        </Box>
        {heatmapData.map((row, rowIndex) => (
          <Box
            key={times[rowIndex]}
            sx={{ display: "flex", alignItems: "center", mb: 0.5 }}
          >
            <Typography
              sx={{
                width: "45px",
                fontSize: "0.7rem",
                color: "rgb(var(--muted))",
                textAlign: "right",
                pr: 1.5,
                flexShrink: 0,
              }}
            >
              {times[rowIndex]}
            </Typography>
            {row.map((value, colIndex) => (
              <Box
                key={`${rowIndex}-${colIndex}-${value}`}
                sx={{
                  flex: 1,
                  aspectRatio: "1 / 1",
                  bgcolor: `rgba(var(--admin-accent), ${0.1 + value * 0.9})`, // Use admin accent for heatmap
                  borderRadius: "3px",
                  margin: "1px",
                  transition:
                    "transform 0.1s ease-out, box-shadow 0.1s ease-out",
                  "&:hover": {
                    transform: "scale(1.1)",
                    boxShadow: `0 0 0 1px rgba(var(--admin-accent), 0.7)`,
                    zIndex: 1,
                  },
                }}
                title={`Intensity: ${Math.round(value * 100)}%`}
              />
            ))}
          </Box>
        ))}
      </Box>
    </Paper>
  );
};

export default PeakTimeGrid;
