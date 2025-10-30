import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, NavLink } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext";
import { useWishlist } from "../../contexts/WishlistContext";
import { useTheme } from "../../contexts/ThemeContext";
import {
  ShoppingBag,
  Heart,
  User,
  Menu,
  X,
  Search,
  Moon,
  Sun,
  ChevronDown,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);
  const inactivityTimerRef = useRef(null);

  const { user, logout } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const { darkMode, toggleTheme } = useTheme();
  const navigate = useNavigate();

  // --- Start: Hooks and Handlers (Removed for brevity, kept for context) ---
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
      resetInactivityTimer();
    } else {
      clearTimeout(inactivityTimerRef.current);
    }
    return () => clearTimeout(inactivityTimerRef.current);
  }, [isSearchOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        isSearchOpen &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target) &&
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSearchOpen]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const resetInactivityTimer = () => {
    clearTimeout(inactivityTimerRef.current);
    inactivityTimerRef.current = setTimeout(() => {
      if (isSearchOpen && searchValue === "") {
        setIsSearchOpen(false);
      }
    }, 3000);
  };

  const handleSearchInputChange = (event) => {
    setSearchValue(event.target.value);
    resetInactivityTimer();
  };

  const handleSearchToggle = () => {
    if (isSearchOpen) {
      setSearchValue("");
      clearTimeout(inactivityTimerRef.current);
    }
    setIsSearchOpen(!isSearchOpen);
    setIsMenuOpen(false);
  };

  const handleSearchBlur = () => {
    setTimeout(() => {
      if (
        searchValue === "" &&
        searchInputRef.current !== document.activeElement
      ) {
        if (!searchContainerRef.current?.contains(document.activeElement)) {
          setIsSearchOpen(false);
        }
      }
    }, 100);
  };
  // --- End: Hooks and Handlers ---

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/shop", label: "Shop" },
    { path: "/about", label: "About" },
  ];

  // Base icon button style
  const baseIconButtonClasses =
    "relative flex items-center justify-center p-2 rounded-full text-muted hover:text-accent focus-visible:text-accent focus-visible:bg-highlight active:bg-highlight transition-colors duration-200";

  // Navigation link style
  const navLinkClasses = ({ isActive }) =>
    `relative font-medium text-base text-primary transition-colors duration-200 after:content-[''] after:absolute after:left-0 after:bottom-[-4px] after:h-[2px] after:w-0 after:bg-accent after:transition-all after:duration-300 hover:after:w-full ${
      isActive ? "text-accent after:w-full" : "hover:text-accent-2"
    }`;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-shadow duration-300 ${
        isScrolled ? "shadow-md" : ""
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex items-center justify-between h-20">
          <Link
            to="/"
            className="text-3xl font-bold font-serif text-primary tracking-[-0.02em]"
          >
            Luxe<span className="logo-secondary font-semibold">Heritage</span>
          </Link>

          {/* Desktop Navigation */}
          {!isSearchOpen && (
            <nav className="hidden md:flex items-center space-x-10">
              {navLinks.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  className={navLinkClasses}
                  end={link.path === "/"}
                >
                  {link.label}
                </NavLink>
              ))}
            </nav>
          )}

          {/* Desktop Search Input */}
          <AnimatePresence>
            {isSearchOpen && (
              <motion.div
                key="search-input"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "40%" }}
                exit={{ opacity: 0, width: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 hidden md:block"
                ref={searchContainerRef}
              >
                <div className="relative">
                  <input
                    ref={searchInputRef}
                    type="search"
                    placeholder="Search products..."
                    className="w-full input-luxury !rounded-full !pl-10 !pr-4 !py-2"
                    value={searchValue}
                    onChange={handleSearchInputChange}
                    onBlur={handleSearchBlur}
                    onKeyDown={resetInactivityTimer}
                    onClick={resetInactivityTimer}
                  />
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted pointer-events-none">
                    {" "}
                    <Search className="w-5 h-5" />{" "}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ----- Action Buttons Container ----- */}
          <div className="flex items-center space-x-1">
            {/* Search Toggle (Visible on All Devices) */}
            <div ref={searchContainerRef}>
              <button
                onClick={handleSearchToggle}
                className={baseIconButtonClasses}
                aria-label="Toggle Search"
              >
                {isSearchOpen ? (
                  <X className="w-5 h-5" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Theme Toggle (Hidden on Small Screens) */}
            <button
              onClick={toggleTheme}
              className={`hidden sm:flex p-2 text-muted hover:text-accent focus-visible:text-accent focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--bg))] rounded-full transition-colors duration-200`}
              aria-label={
                darkMode ? "Switch to light mode" : "Switch to dark mode"
              }
            >
              {darkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>

            {/* Wishlist Icon (Hidden on Small Screens) */}
            <Link
              to="/wishlist"
              className={`${baseIconButtonClasses} ml-1 hidden sm:flex`}
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {wishlistCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-semibold rounded-full w-4 h-4 flex items-center justify-center border border-[rgb(var(--bg))]">
                  {" "}
                  {wishlistCount}{" "}
                </span>
              )}
            </Link>

            {/* Cart Icon (Hidden on Small Screens) */}
            <Link
              to="/cart"
              className={`${baseIconButtonClasses} hidden sm:flex`}
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-semibold rounded-full w-4 h-4 flex items-center justify-center border border-[rgb(var(--bg))]">
                  {" "}
                  {cartCount}{" "}
                </span>
              )}
            </Link>

            {/* Separator and Auth Links (Hidden on Small Screens) */}
            <div className="h-6 w-px bg-[rgb(var(--border))] hidden lg:block mx-3"></div>
            {user ? (
              <div className="relative group hidden sm:block">
                {" "}
                {/* Show dropdown on tablets/desktop */}
                <button className="flex items-center space-x-2 p-2 text-primary hover:text-accent transition-colors">
                  {" "}
                  <span className="flex items-center justify-center w-8 h-8 rounded-full bg-highlight border border-[rgb(var(--border))]">
                    {" "}
                    <User className="w-4 h-4 text-muted group-hover:text-accent transition-colors" />{" "}
                  </span>{" "}
                  <span className="hidden lg:block text-sm font-medium">
                    {user.firstName}
                  </span>{" "}
                  <ChevronDown className="w-4 h-4 text-muted hidden lg:block group-hover:rotate-180 transition-transform" />{" "}
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-card rounded-lg shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 border border-[rgb(var(--border))] z-50">
                  {" "}
                  <Link
                    to="/account"
                    className="block px-4 py-2 text-sm text-primary hover:bg-highlight hover:text-accent transition-colors"
                  >
                    {" "}
                    My Account{" "}
                  </Link>{" "}
                  {user.role === "admin" && (
                    <Link
                      to="/admin"
                      className="block px-4 py-2 text-sm text-primary hover:bg-highlight hover:text-accent transition-colors"
                    >
                      {" "}
                      Admin Panel{" "}
                    </Link>
                  )}{" "}
                  <div className="my-1 h-px bg-[rgb(var(--border))]"></div>{" "}
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-[rgba(255,0,0,0.1)] transition-colors"
                  >
                    {" "}
                    Logout{" "}
                  </button>{" "}
                </div>
              </div>
            ) : (
              <div className="hidden lg:flex items-center space-x-4">
                {" "}
                {/* Only show login/register buttons on large screens */}
                <NavLink to="/login" className={navLinkClasses}>
                  {" "}
                  Login{" "}
                </NavLink>
                <Link
                  to="/register"
                  className="btn-luxury btn-luxury-secondary !py-1.5 !px-5 !text-sm !rounded-md"
                >
                  {" "}
                  Register{" "}
                </Link>
              </div>
            )}

            {/* Mobile Menu Button (Visible on Small Screens) */}
            <button
              onClick={() => {
                setIsMenuOpen(!isMenuOpen);
                setIsSearchOpen(false);
              }}
              className={`md:hidden ${baseIconButtonClasses} ml-1`}
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Search Input */}
        <AnimatePresence>
          {" "}
          {isSearchOpen && (
            <motion.div
              key="search-mobile"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="sm:hidden pb-3 pt-1 border-t border-[rgb(var(--border))]" /* CRITICAL: Hidden only on devices larger than mobile (sm) */
            >
              {" "}
              <div className="relative px-4">
                {" "}
                <input
                  ref={searchInputRef}
                  type="search"
                  placeholder="Search products..."
                  className="w-full input-luxury !rounded-full !pl-10 !pr-4 !py-2"
                  value={searchValue}
                  onChange={handleSearchInputChange}
                  onBlur={handleSearchBlur}
                  onKeyDown={resetInactivityTimer}
                  onClick={resetInactivityTimer}
                />{" "}
                <span className="absolute left-7 top-1/2 transform -translate-y-1/2 text-muted pointer-events-none">
                  {" "}
                  <Search className="w-5 h-5" />{" "}
                </span>{" "}
              </div>{" "}
            </motion.div>
          )}{" "}
        </AnimatePresence>

        {/* Mobile Navigation Panel - (UPDATED FOR ALL COLLAPSED ITEMS) */}
        <AnimatePresence>
          {isMenuOpen && !isSearchOpen && (
            <motion.div
              key="mobile-nav"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="md:hidden py-4 border-t border-[rgb(var(--border))] bg-surface shadow-lg absolute top-full left-0 right-0 w-full z-40"
            >
              <nav className="flex flex-col space-y-1 px-2">
                {/* Main Nav Links (Home, Shop, About) */}
                {navLinks.map((link) => (
                  <NavLink
                    key={link.path}
                    to={link.path}
                    className="px-4 py-2 text-primary hover:text-accent font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                    end={link.path === "/"}
                  >
                    {link.label}
                  </NavLink>
                ))}

                {/* Separator */}
                <div className="pt-4 mt-4 border-t border-[rgb(var(--border))]">
                  {/* Collapsed Action Buttons */}
                  <div className="flex justify-around items-center px-4 py-2 mb-2">
                    {/* Theme Toggle */}
                    <button
                      onClick={toggleTheme}
                      className="p-2 text-muted hover:text-accent"
                      aria-label={
                        darkMode
                          ? "Switch to light mode"
                          : "Switch to dark mode"
                      }
                    >
                      {darkMode ? (
                        <Sun className="w-6 h-6" />
                      ) : (
                        <Moon className="w-6 h-6" />
                      )}
                    </button>

                    {/* Wishlist */}
                    <Link
                      to="/wishlist"
                      className="relative p-2 text-muted hover:text-accent"
                      onClick={() => setIsMenuOpen(false)}
                      aria-label="Wishlist"
                    >
                      <Heart className="w-6 h-6" />
                      {wishlistCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-semibold rounded-full w-4 h-4 flex items-center justify-center">
                          {" "}
                          {wishlistCount}{" "}
                        </span>
                      )}
                    </Link>

                    {/* Cart */}
                    <Link
                      to="/cart"
                      className="relative p-2 text-muted hover:text-accent"
                      onClick={() => setIsMenuOpen(false)}
                      aria-label="Shopping Cart"
                    >
                      <ShoppingBag className="w-6 h-6" />
                      {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] font-semibold rounded-full w-4 h-4 flex items-center justify-center">
                          {" "}
                          {cartCount}{" "}
                        </span>
                      )}
                    </Link>
                  </div>

                  {/* Authentication Links */}
                  {user ? (
                    <>
                      <Link
                        to="/account"
                        className="block px-4 py-2 text-sm text-primary hover:text-accent transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        My Account
                      </Link>
                      {user.role === "admin" && (
                        <Link
                          to="/admin"
                          className="block px-4 py-2 text-sm text-primary hover:text-accent transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Admin Panel
                        </Link>
                      )}
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                      >
                        Logout
                      </button>
                    </>
                  ) : (
                    <>
                      <NavLink
                        to="/login"
                        className="block px-4 py-2 text-sm text-primary hover:text-accent transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Login
                      </NavLink>
                      <Link
                        to="/register"
                        className="block px-4 py-2 text-sm text-primary hover:text-accent transition-colors"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        Register
                      </Link>
                    </>
                  )}
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

export default Header;
