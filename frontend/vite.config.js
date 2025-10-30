import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite"; // Correct import

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(), // Use the imported plugin
  ],
  // Add other Vite configurations if needed
});