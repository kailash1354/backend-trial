import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../contexts/AuthContext";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const result = await login(data);
      if (result.success) {
        navigate("/");
      }
    } catch (error) {
      console.error("Login component error:", error);
      toast.error("An unexpected error occurred during login.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen flex items-center justify-center bg-luxury-gradient py-16 px-4 sm:px-6 lg:px-8" // Increased py
    >
      <div className="max-w-md w-full space-y-10">
        {" "}
        {/* Increased space */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="text-center"
        >
          <h2 className="mt-6 text-4xl lg:text-5xl font-bold text-primary">
            {" "}
            {/* Larger heading */}
            Welcome Back
          </h2>
          <p className="mt-3 text-lg text-muted">
            {" "}
            {/* Larger paragraph */}
            Sign in to your account
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="card-luxury p-8 md:p-10" // Increased padding
        >
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-primary mb-2"
              >
                Email address
              </label>
              <div className="relative">
                <span className="input-icon-wrapper">
                  {" "}
                  {/* Icon wrapper */}
                  <Mail className="w-5 h-5" />
                </span>
                <input
                  {...register("email", {
                    required: "Email is required",
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: "Invalid email address",
                    },
                  })}
                  type="email"
                  id="email"
                  className="input-luxury pl-12" // Ensure padding matches icon wrapper
                  placeholder="Enter your email"
                  aria-invalid={errors.email ? "true" : "false"}
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-600" role="alert">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-primary mb-2"
              >
                Password
              </label>
              <div className="relative">
                <span className="input-icon-wrapper">
                  {" "}
                  {/* Icon wrapper */}
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className="input-luxury pl-12 pr-12" // Ensure padding matches icon wrapper + button
                  placeholder="Enter your password"
                  aria-invalid={errors.password ? "true" : "false"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="input-action-button" // Use specific class
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600" role="alert">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between pt-2">
              {" "}
              {/* Added padding */}
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-accent focus:ring-accent border-[rgb(var(--border))] rounded"
                />
                <label
                  htmlFor="remember-me"
                  className="ml-2 block text-sm text-primary"
                >
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <Link
                  to="/forgot-password"
                  className="font-medium text-accent hover:text-accent-2"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <div className="pt-4">
              {" "}
              {/* Added padding */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-luxury btn-luxury-primary text-base py-3" // Adjusted padding/text size
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="spinner-luxury w-5 h-5 mr-3"></div>
                    Signing in...
                  </div>
                ) : (
                  "Sign in"
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-[rgb(var(--border))]">
            {" "}
            {/* Separator moved inside card */}
            <div className="text-center text-sm">
              <span className="text-muted">New to Luxe Heritage? </span>
              <Link
                to="/register"
                className="font-semibold text-accent hover:text-accent-2"
              >
                Create an account
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Login;
