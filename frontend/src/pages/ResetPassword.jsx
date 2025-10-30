import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../contexts/AuthContext";
import { Lock, Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const ResetPassword = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { resetPassword } = useAuth(); // Assuming this function is in AuthContext
  const { token } = useParams(); // Reads the reset token from the URL

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const newPassword = watch("password", "");

  const onSubmit = async (data) => {
    if (!token) {
      toast.error("Reset token is missing.");
      return;
    }
    setIsLoading(true);
    try {
      // CRITICAL: Call the context function with the URL token and the new password
      const result = await resetPassword(token, data.password);
      // The context function handles success toast and navigation to /login
    } catch (error) {
      console.error("Reset Password error:", error);
      // The context function already handles the toast
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-luxury-gradient"
    >
      <div className="max-w-md w-full space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h2 className="mt-6 text-3xl font-extrabold text-primary">
            Set New Password
          </h2>
          <p className="mt-2 text-sm text-muted">
            Enter your new secure password below.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-luxury p-8"
        >
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* New Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-primary mb-2"
              >
                New Password
              </label>
              <div className="relative">
                <span className="input-icon-wrapper">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  {...register("password", {
                    required: "New password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                    // You might add stricter regex rules here
                  })}
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className="input-luxury pl-12 pr-12"
                  placeholder="Enter new password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="input-action-button"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-semibold text-primary mb-2"
              >
                Confirm Password
              </label>
              <div className="relative">
                <span className="input-icon-wrapper">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  {...register("confirmPassword", {
                    required: "Confirmation is required",
                    validate: (value) =>
                      value === newPassword || "Passwords do not match",
                  })}
                  type="password" // Always hide confirm password
                  id="confirmPassword"
                  className="input-luxury pl-12"
                  placeholder="Confirm new password"
                />
              </div>
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-luxury btn-luxury-primary py-3"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="spinner-luxury w-5 h-5 mr-3"></div>
                  Submitting...
                </div>
              ) : (
                "Reset Password"
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t border-[rgb(var(--border))] text-center text-sm">
            <Link
              to="/login"
              className="font-medium text-accent hover:text-accent-2"
            >
              Back to Login
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ResetPassword;
