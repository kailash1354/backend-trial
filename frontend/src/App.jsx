import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "react-query";
import { ReactQueryDevtools } from "react-query/devtools";
import { Toaster } from "react-hot-toast";
import { HelmetProvider } from "react-helmet-async";
import { CookiesProvider } from "react-cookie";

// Context providers
import { AuthProvider } from "./contexts/AuthContext";
import { CartProvider } from "./contexts/CartContext";
import { WishlistProvider } from "./contexts/WishlistContext";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext"; // Import useTheme

// MUI Theme
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles"; // Rename to avoid conflict
import CssBaseline from "@mui/material/CssBaseline";
import { lightTheme, darkTheme } from "./muiTheme"; // Import the themes

// Layout components
import Layout from "./components/Layout/Layout";
import AdminLayout from "./components/Layout/AdminLayout";

// Pages
import Home from "./pages/Home.jsx";
import Shop from "./pages/Shop.jsx";
//import ProductDetail from './pages/ProductDetail.jsx';
import Cart from "./pages/Cart.jsx";
import Wishlist from "./pages/Wishlist.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
//import Account from './pages/Account.jsx';
import About from "./pages/About.jsx";
import Checkout from "./pages/Checkout.jsx";
import OrderConfirmation from "./pages/OrderConfirmation.jsx";
import OrderHistory from "./pages/OrderHistory.jsx";
import VerifyEmail from "./pages/VerifyEmail";
import ResendVerification from "./pages/ResendVerification.jsx";
import ForgotPassword from "./pages/ForgotPassword.jsx";
import ResetPassword from "./pages/ResetPassword.jsx";


// Admin Pages
import AdminDashboard from "./pages/admin/Dashboard.jsx";
import AdminProducts from "./pages/admin/Products.jsx";
import AdminOrders from "./pages/admin/Orders.jsx";
import AdminUsers from "./pages/admin/Users.jsx";
import AdminCategories from "./pages/admin/Categories.jsx";
import AdminSettings from "./pages/admin/Settings.jsx";

// Protected Route component
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

// Styles
import "./index.css"; // Base Tailwind
import "./theme.css"; // Theme variables and overrides
import "./App.css"; // Remaining App styles / components

// Create a react-query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Wrapper component to apply MUI theme based on custom ThemeContext
function AppWithThemeProviders() {
  const { darkMode } = useTheme(); // Get darkMode state from your context

  return (
    <MuiThemeProvider theme={darkMode ? darkTheme : lightTheme}>
      {" "}
      {/* Apply correct MUI theme */}
      <CssBaseline enableColorScheme />{" "}
      {/* MUI CSS Reset + Syncs with OS preference */}
      <CartProvider>
        <WishlistProvider>
          <div className="App">
            {" "}
            {/* Main App container */}
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Layout />}>
                <Route index element={<Home />} />
                <Route path="shop" element={<Shop />} />
                <Route path="shop/:category" element={<Shop />} />
                {/* <Route path="product/:slug" element={<ProductDetail />} /> */}
                <Route path="cart" element={<Cart />} />
                <Route path="wishlist" element={<Wishlist />} />
                <Route path="about" element={<About />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="resend-verification" element={<ResendVerification />} />
                <Route path="forgot-password" element={<ForgotPassword />} />
                <Route path="reset-password/:token" element={<ResetPassword />} />
                <Route path="verify-email/:token" element={<VerifyEmail />} />

                {/* Protected Routes */}
                {/* <Route path="account" element={<ProtectedRoute><Account /></ProtectedRoute>} /> */}
                <Route
                  path="checkout"
                  element={
                    <ProtectedRoute>
                      <Checkout />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="order-confirmation/:orderId"
                  element={
                    <ProtectedRoute>
                      <OrderConfirmation />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="orders"
                  element={
                    <ProtectedRoute>
                      <OrderHistory />
                    </ProtectedRoute>
                  }
                />
                {/* Consider a 404 component within the main layout */}
                {/* <Route path="*" element={<NotFound />} /> */}
              </Route>
              {/* Admin Routes */}
              <Route
                path="/admin"
                element={
                  <AdminRoute>
                    <AdminLayout />
                  </AdminRoute>
                }
              >
                <Route index element={<AdminDashboard />} />
                <Route path="products" element={<AdminProducts />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="categories" element={<AdminCategories />} />
                <Route path="settings" element={<AdminSettings />} />
                {/* Consider an Admin 404 component */}
                {/* <Route path="*" element={<AdminNotFound />} /> */}
              </Route>
              {/* Global Fallback Route */}
              <Route path="*" element={<Home />} />{" "}
              {/* Or a dedicated 404 page */}
            </Routes>
            {/* Toaster styled using theme variables */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  // Explicitly use CSS vars for Toaster style
                  background: "rgb(var(--card))", // Use card background
                  color: "rgb(var(--text))",
                  border: "1px solid rgb(var(--border))",
                  boxShadow: "var(--shadow-lg)", // Use CSS var
                },
              }}
            />
          </div>
        </WishlistProvider>
      </CartProvider>
    </MuiThemeProvider>
  );
}

// Main App component initializes providers
function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <CookiesProvider>
          <Router>
            <AuthProvider>
              <ThemeProvider>
                {" "}
                {/* Your Custom Theme Provider */}
                {/* Component applying MUI Theme based on context */}
                <AppWithThemeProviders />
              </ThemeProvider>
            </AuthProvider>
          </Router>
        </CookiesProvider>
        {/* React Query DevTools */}
        <ReactQueryDevtools initialIsOpen={false} position="bottom-left" />
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
