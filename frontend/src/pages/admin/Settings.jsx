import React from "react";
import { Helmet } from "react-helmet-async";

const Settings = () => {
  return (
    <>
      <Helmet>
        <title>Admin Settings - Luxe Heritage</title>
      </Helmet>

      <div className="p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Settings</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Admin Settings
          </h2>
          <p className="text-gray-700">
            Settings interface will be implemented here.
          </p>
        </div>
      </div>
    </>
  );
};

export default Settings;
