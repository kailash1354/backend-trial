import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../contexts/AuthContext";
import { Mail, Key } from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { forgotPassword } = useAuth(); // Assuming this function is in AuthContext
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const result = await forgotPassword(data.email);
      if (result.success) {
        toast.success("Check your email for password reset instructions.");
        navigate("/login");
      }
    } catch (error) {
      console.error("Forgot Password error:", error);
      // The backend should return a generic success message even if the email doesn't exist for security.
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
            Reset Your Password
          </h2>
          <p className="mt-2 text-sm text-muted">
            Enter your email address and we'll send you a link to reset your
            password.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-luxury p-8"
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
                  className="input-luxury pl-12"
                  placeholder="Enter your email"
                />
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-red-600">
                  {errors.email.message}
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
                  Sending Request...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Key className="w-5 h-5 mr-2" /> Send Reset Link
                </div>
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

export default ForgotPassword;
