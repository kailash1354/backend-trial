import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../contexts/AuthContext";
import { Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm();

  const password = watch("password");

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const result = await registerUser({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
      });
      if (result.success) {
        // AuthContext handles navigation to /login after successful registration
      }
    } catch (error) {
      console.error("Register component error:", error);
      toast.error("An unexpected error occurred during registration.");
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
          <h2 className="text-4xl lg:text-5xl font-bold text-primary mb-3">
            {" "}
            {/* Larger heading */}
            Create Your Account
          </h2>
          <p className="text-lg text-muted">
            {" "}
            {/* Larger paragraph */}
            Join Luxe Heritage today
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="card-luxury p-8 md:p-10" // Increased padding
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label
                htmlFor="firstName"
                className="block text-sm font-semibold text-primary mb-2"
              >
                First Name
              </label>
              <div className="relative">
                <span className="input-icon-wrapper">
                  {" "}
                  {/* Icon wrapper */}
                  <User className="w-5 h-5" />
                </span>
                <input
                  {...register("firstName", {
                    required: "First name is required",
                    minLength: { value: 2, message: "Min 2 characters" },
                    maxLength: { value: 50, message: "Max 50 characters" },
                  })}
                  type="text"
                  id="firstName"
                  className="input-luxury pl-12"
                  placeholder="Enter your first name"
                  aria-invalid={errors.firstName ? "true" : "false"}
                />
              </div>
              {errors.firstName && (
                <p className="mt-2 text-sm text-red-600" role="alert">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="lastName"
                className="block text-sm font-semibold text-primary mb-2"
              >
                Last Name
              </label>
              <div className="relative">
                <span className="input-icon-wrapper">
                  {" "}
                  {/* Icon wrapper */}
                  <User className="w-5 h-5" />
                </span>
                <input
                  {...register("lastName", {
                    required: "Last name is required",
                    minLength: { value: 2, message: "Min 2 characters" },
                    maxLength: { value: 50, message: "Max 50 characters" },
                  })}
                  type="text"
                  id="lastName"
                  className="input-luxury pl-12"
                  placeholder="Enter your last name"
                  aria-invalid={errors.lastName ? "true" : "false"}
                />
              </div>
              {errors.lastName && (
                <p className="mt-2 text-sm text-red-600" role="alert">
                  {errors.lastName.message}
                </p>
              )}
            </div>

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
                  className="input-luxury pl-12"
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
                    // FIX 1: ADD CLIENT-SIDE PASSWORD PATTERN VALIDATION
                    pattern: {
                      value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).*$/, // Enforces one uppercase, one lowercase, one number
                      message:
                        "Password must contain a capital letter and a number.",
                    },
                  })}
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className="input-luxury pl-12 pr-12"
                  placeholder="Create a password"
                  aria-invalid={errors.password ? "true" : "false"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="input-action-button"
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

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-semibold text-primary mb-2"
              >
                Confirm Password
              </label>
              <div className="relative">
                <span className="input-icon-wrapper">
                  {" "}
                  {/* Icon wrapper */}
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (value) =>
                      value === password || "Passwords do not match",
                  })}
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  className="input-luxury pl-12 pr-12"
                  placeholder="Confirm your password"
                  aria-invalid={errors.confirmPassword ? "true" : "false"}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="input-action-button"
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirm password"
                      : "Show confirm password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-2 text-sm text-red-600" role="alert">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <div className="flex items-start pt-2">
              {" "}
              {/* Added padding */}
              <input
                id="agree-terms"
                name="agree-terms"
                type="checkbox"
                {...register("agreeTerms", {
                  // FIX 2: Explicitly set required message for checkbox
                  required: "You must agree to the Terms of Service.",
                })}
                className="h-4 w-4 text-accent focus:ring-accent border-[rgb(var(--border))] rounded mt-1" /* Adjusted margin */
                aria-invalid={errors.agreeTerms ? "true" : "false"}
              />
              <div className="ml-3 text-sm">
                {" "}
                {/* Wrap label text */}
                <label htmlFor="agree-terms" className="text-primary">
                  I agree to the{" "}
                  <Link
                    to="/terms"
                    className="font-semibold text-accent hover:text-accent-2"
                  >
                    Terms of Service
                  </Link>{" "}
                  &{" "}
                  <Link
                    to="/privacy"
                    className="font-semibold text-accent hover:text-accent-2"
                  >
                    Privacy Policy
                  </Link>
                </label>
              </div>
            </div>
            {/* Display error message directly below the checkbox group */}
            {errors.agreeTerms && (
              <p className="text-sm text-red-600 -mt-4 ml-7" role="alert">
                {errors.agreeTerms.message}
              </p>
            )}

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
                    Creating account...
                  </div>
                ) : (
                  "Create Account"
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 pt-6 border-t border-[rgb(var(--border))]">
            {" "}
            {/* Separator inside card */}
            <div className="text-center text-sm">
              <span className="text-muted">Already have an account? </span>
              <Link
                to="/login"
                className="font-semibold text-accent hover:text-accent-2"
              >
                Sign in
              </Link>
            </div>
            {/* NEW: RESEND VERIFICATION LINK (Crucial for user experience) */}
            <div className="text-center text-sm mt-2">
              <Link
                to="/resend-verification"
                className="font-medium text-muted hover:text-primary"
              >
                Lost your verification email? Resend link.
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Register;
