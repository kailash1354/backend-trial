import React from "react";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import Grid from "@mui/material/Grid";
import { Box, Typography } from "@mui/material";
import {
  DollarSign,
  ShoppingCart,
  Users,
  Activity,
  Download,
  Settings,
} from "lucide-react";
import { Link } from "react-router-dom";

// Import the components
import StatCard from "./admincomponents/StatCard";
import SalesLineChart from "./admincomponents/SalesLineChart";
import TopProductsList from "./admincomponents/TopProductsList";
import RecentOrders from "./admincomponents/RecentOrders";
import QuickActions from "./admincomponents/QuickActions";
import CategoryPieChart from "./admincomponents/CategoryPieChart";
import DailyOrdersBarChart from "./admincomponents/DailyOrdersBarChart";
import PeakTimeGrid from "./admincomponents/PeakTimeGrid";

// Placeholder Data (Keep as is)
const statsData = [
  {
    title: "Total Revenue",
    value: "$45,678",
    change: "+12.5%",
    changeType: "increase",
    icon: DollarSign,
    color: "rgb(var(--chart-color-5))",
    iconBg: "rgba(var(--chart-color-5), 0.1)",
  },
  {
    title: "Total Orders",
    value: "1,234",
    change: "+8.2%",
    changeType: "increase",
    icon: ShoppingCart,
    color: "rgb(var(--chart-color-2))",
    iconBg: "rgba(var(--chart-color-2), 0.1)",
  },
  {
    title: "Total Customers",
    value: "892",
    change: "+15.3%",
    changeType: "increase",
    icon: Users,
    color: "rgb(var(--chart-color-3))",
    iconBg: "rgba(var(--chart-color-3), 0.1)",
  },
  {
    title: "Conversion Rate",
    value: "3.4%",
    change: "+0.5%",
    changeType: "increase",
    icon: Activity,
    color: "rgb(var(--chart-color-4))",
    iconBg: "rgba(var(--chart-color-4), 0.1)",
  },
];

const Dashboard = () => {
  return (
    <>
      <Helmet>
        <title>Admin Dashboard - Luxe Heritage</title>
      </Helmet>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="admin-layout"
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", md: "center" },
            mb: 4,
          }}
        >
          <Box>
            <Typography
              variant="h5"
              component="h1"
              sx={{ fontWeight: 600, color: "rgb(var(--text))", mb: 0.5 }}
            >
              Admin Dashboard
            </Typography>
            <Typography
              sx={{ color: "rgb(var(--muted))", fontSize: "0.95rem" }}
            >
              Welcome back! Here's what's happening with your store today.
            </Typography>
          </Box>
          <Box sx={{ display: "flex", gap: 1.5, mt: { xs: 2, md: 0 } }}>
            <button className="btn-luxury-primary !py-2 !px-4 !text-sm inline-flex items-center space-x-1.5">
              <Download className="w-4 h-4" /> <span>Export Report</span>
            </button>
            <button className="btn-luxury-secondary !py-2 !px-4 !text-sm inline-flex items-center space-x-1.5">
              <Settings className="w-4 h-4" /> <span>Settings</span>
            </button>
          </Box>
        </Box>

        {/* Stat Cards Row (FIXED: xs=6 for 2x2 layout on mobile) */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {statsData.map((stat, index) => (
            <Grid item xs={6} sm={6} md={3} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
                style={{ height: "100%" }}
              >
                <StatCard {...stat} />
              </motion.div>
            </Grid>
          ))}
        </Grid>

        {/* ========================================================= */}
        {/* ROW 2: SALES CHART, TOP PRODUCTS, CATEGORY PIE (FIXED: xs=6 for 2x2 layout on mobile) */}
        {/* ========================================================= */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Sales Chart: FIX xs=6 */}
          <Grid item xs={6} lg={6}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.5 }}
              style={{ height: "100%" }}
            >
              <SalesLineChart />
            </motion.div>
          </Grid>
          {/* Top Products List: FIX xs=6 */}
          <Grid item xs={6} lg={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              style={{ height: "100%" }}
            >
              <TopProductsList />
            </motion.div>
          </Grid>
          {/* Sales by Category Pie Chart: FIX xs=6 */}
          <Grid item xs={6} lg={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              style={{ height: "100%" }}
            >
              <CategoryPieChart />
            </motion.div>
          </Grid>
        </Grid>

        {/* ========================================================= */}
        {/* ROW 3: RECENT ORDERS & QUICK ACTIONS (FIXED: xs=6 for 2x2 layout on mobile) */}
        {/* ========================================================= */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={6} lg={8}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              style={{ height: "100%" }}
            >
              <RecentOrders />
            </motion.div>
          </Grid>
          <Grid item xs={6} lg={4}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              style={{ height: "100%" }}
            >
              <QuickActions />
            </motion.div>
          </Grid>
        </Grid>

        {/* ========================================================= */}
        {/* ROW 4: DAILY ORDERS & PEAK TIME (FIXED: xs=6 for 2x2 layout on mobile) */}
        {/* ========================================================= */}
        <Grid container spacing={3}>
          <Grid item xs={6} lg={8}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              style={{ height: "100%" }}
            >
              <DailyOrdersBarChart />
            </motion.div>
          </Grid>
          <Grid item xs={6} lg={4}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              style={{ height: "100%" }}
            >
              <PeakTimeGrid />
            </motion.div>
          </Grid>
        </Grid>
      </motion.div>
    </>
  );
};

export default Dashboard;
