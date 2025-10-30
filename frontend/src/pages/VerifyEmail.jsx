import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import authAPI from "../api/auth";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import { MailCheck, RotateCw } from "lucide-react";

const VerifyEmail = () => {
  const [verificationStatus, setVerificationStatus] = useState("pending"); // 'pending', 'success', 'error'
  const { token } = useParams(); // Reads the token from the URL path
  const navigate = useNavigate();

  useEffect(() => {
    // Only proceed if a token is present
    if (token) {
      const handleVerification = async () => {
        try {
          // 1. Call the backend API endpoint
          await authAPI.verifyEmail(token);

          // 2. Success state
          setVerificationStatus("success");

          // 3. Optional: Redirect to login after a delay
          setTimeout(() => {
            navigate("/login");
          }, 4000);
        } catch (error) {
          // 4. Error handling (Backend sends specific error message)
          console.error("Verification failed:", error);
          setVerificationStatus("error");
          const message =
            error.response?.data?.message ||
            "Invalid or expired verification link.";
          toast.error(message);
        }
      };

      handleVerification();
    } else {
      // No token found in URL
      setVerificationStatus("error");
      toast.error("Verification token missing from URL.");
      navigate("/login"); // Redirect quickly if no token
    }
  }, [token, navigate]);

  // --- Rendering Logic ---

  let icon, title, message;

  if (verificationStatus === "pending") {
    icon = <RotateCw className="w-12 h-12 text-accent animate-spin" />;
    title = "Verifying your account...";
    message = "Please wait, we are confirming your email address.";
  } else if (verificationStatus === "success") {
    icon = <MailCheck className="w-12 h-12 text-green-500" />;
    title = "Verification Successful!";
    message =
      "Your email is now verified. Redirecting you to the login page...";
  } else {
    // 'error'
    icon = <MailCheck className="w-12 h-12 text-red-500" />;
    title = "Verification Failed";
    message =
      "The link is invalid, expired, or the email is already verified. Please try logging in.";
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-md w-full space-y-8 p-10 bg-white rounded-lg shadow-xl text-center">
        {icon}
        <h2 className="mt-6 text-3xl font-extrabold text-gray-900">{title}</h2>
        <p className="mt-2 text-sm text-gray-600">{message}</p>

        {verificationStatus !== "pending" && (
          <button
            onClick={() => navigate("/login")}
            className="mt-6 w-full btn-luxury btn-luxury-primary"
          >
            Go to Login
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default VerifyEmail;
