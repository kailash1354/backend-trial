import { createTheme } from "@mui/material/styles";

// Minimal themes just to set the mode for components like CssBaseline
export const lightTheme = createTheme({
  palette: {
    mode: "light",
    // We won't define specific colors here,
    // components will use CSS variables via sx props.
  },
  // Keep typography for font consistency if needed
  typography: {
    fontFamily: '"Inter", sans-serif',
    h1: { fontFamily: '"Playfair Display", serif' },
    h2: { fontFamily: '"Playfair Display", serif' },
    h3: { fontFamily: '"Playfair Display", serif' },
    h4: { fontFamily: '"Playfair Display", serif' },
    h5: { fontFamily: '"Playfair Display", serif' },
    h6: { fontFamily: '"Playfair Display", serif' },
  },
  // Minimal component overrides if necessary (e.g., remove card shadow)
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          boxShadow: "none", // Rely on theme.css or sx prop for shadow
          borderRadius: "12px", // Keep consistent radius
        },
      },
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
  typography: {
    // Ensure dark mode typography if needed (usually inherits)
    fontFamily: '"Inter", sans-serif',
    // ... heading font families ...
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          boxShadow: "none",
          borderRadius: "12px",
        },
      },
    },
  },
});
