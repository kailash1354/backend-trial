import React from "react";
import { Helmet } from "react-helmet-async";

const OrderConfirmation = () => {
  return (
    <>
      <Helmet>
        <title>Order Confirmation - Luxe Heritage</title>
        <meta name="description" content="Your order has been confirmed" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            Order Confirmed
          </h1>
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-green-600 mb-4">
              Thank You!
            </h2>
            <p className="text-gray-700">
              Your order has been successfully placed and confirmed.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderConfirmation;
