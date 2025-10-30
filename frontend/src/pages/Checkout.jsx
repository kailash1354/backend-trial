import React from "react";
import { Helmet } from "react-helmet-async";

const Checkout = () => {
  return (
    <>
      <Helmet>
        <title>Checkout - Luxe Heritage</title>
        <meta
          name="description"
          content="Complete your luxury fashion purchase"
        />
      </Helmet>

      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Checkout</h1>
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Checkout Process
            </h2>
            <p className="text-gray-700">
              This is the checkout page. The full checkout functionality will be
              implemented here.
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default Checkout;
