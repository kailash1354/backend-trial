import React from "react";
import { Paper, Typography, Box } from "@mui/material";
import { ArrowUpward, ArrowDownward } from "@mui/icons-material";

const StatCard = ({
  title,
  value,
  change,
  changeType,
  icon: Icon,
  color = "rgb(var(--accent))",
  iconBg = "rgba(var(--accent), 0.1)",
}) => {
  const changeColorClass =
    changeType === "increase"
      ? "text-[rgb(var(--success))]"
      : "text-[rgb(var(--error))]";

  return (
    <Paper
      sx={{
        bgcolor: "rgb(var(--card))",
        border: "1px solid rgb(var(--border))",
        boxShadow: "var(--shadow-lg)",
        borderRadius: "8px",
        p: 2,
        height: "100%",
      }}
      className="admin-card"
    >
      <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
        <Box
          sx={{
            bgcolor: iconBg,
            borderRadius: "6px",
            p: 1.5,
            display: "inline-flex",
          }}
        >
          <Icon sx={{ color: color, fontSize: "20px" }} />
        </Box>
        <Box>
          <Typography
            variant="body2"
            sx={{
              color: "rgb(var(--muted))",
              mb: 0.5,
              fontSize: "0.8rem",
              fontWeight: 500,
              fontFamily: "Inter, sans-serif",
            }}
          >
            {title}
          </Typography>
          <Typography
            component="p"
            sx={{
              fontWeight: "600",
              color: "rgb(var(--text))",
              mb: 0.5,
              fontSize: "1.25rem",
              fontFamily: "Inter, sans-serif",
            }}
          >
            {value}
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              typography: "caption",
            }}
          >
            {changeType === "increase" ? (
              <ArrowUpward
                className={`w-3.5 h-3.5 mr-0.5 ${changeColorClass}`}
              />
            ) : (
              <ArrowDownward
                className={`w-3.5 h-3.5 mr-0.5 ${changeColorClass}`}
              />
            )}
            <Typography
              component="span"
              className={`${changeColorClass} font-medium mr-1 text-xs`}
            >
              {change}
            </Typography>
            <Typography
              component="span"
              sx={{ color: "rgb(var(--muted))", fontSize: "0.75rem" }}
            >
              vs last month
            </Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
};

export default StatCard;
