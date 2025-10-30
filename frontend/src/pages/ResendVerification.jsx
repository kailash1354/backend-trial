import { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import authAPI from "../api/auth";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { Mail, Send } from "lucide-react";

const ResendVerification = () => {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      // NOTE: We will need to implement a resend endpoint on the backend /api/auth/resend-verification
      const response = await authAPI.resendVerification(data.email);
      toast.success(response.message || "New verification email sent!");
    } catch (error) {
      console.error("Resend component error:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to resend email. Check your email address."
      );
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
            Resend Verification Email
          </h2>
          <p className="mt-2 text-sm text-muted">
            Enter your registered email to receive a new verification link.
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
                  Sending...
                </div>
              ) : (
                <div className="flex items-center justify-center">
                  <Send className="w-5 h-5 mr-2" /> Send Link
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

export default ResendVerification;
