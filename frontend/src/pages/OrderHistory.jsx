import React from "react";
import { Helmet } from "react-helmet-async";

const OrderHistory = () => {
  return (
    <>
      <Helmet>
        <title>Order History - Luxe Heritage</title>
        <meta name="description" content="View your past orders" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            Order History
          </h1>
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Your Orders
            </h2>
            <p className="text-gray-700">
              Your order history will be displayed here.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderHistory;
