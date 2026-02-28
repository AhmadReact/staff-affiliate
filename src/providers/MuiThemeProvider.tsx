"use client";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#2563eb",
      light: "#3b82f6",
      dark: "#1d4ed8",
      contrastText: "#ffffff",
    },
    secondary: {
      main: "#64748b",
      light: "#94a3b8",
      dark: "#475569",
      contrastText: "#ffffff",
    },
    success: {
      main: "#16a34a",
      light: "#22c55e",
      dark: "#15803d",
    },
    warning: {
      main: "#d97706",
      light: "#f59e0b",
      dark: "#b45309",
    },
    error: {
      main: "#dc2626",
      light: "#ef4444",
      dark: "#b91c1c",
    },
    background: {
      default: "#f4f6f9",
      paper: "#ffffff",
    },
    text: {
      primary: "#1e293b",
      secondary: "#64748b",
      disabled: "#94a3b8",
    },
    divider: "#e2e8f0",
    grey: {
      50: "#f8fafc",
      100: "#f1f5f9",
      200: "#e2e8f0",
      300: "#cbd5e1",
      400: "#94a3b8",
      500: "#64748b",
    },
  },
  typography: {
    fontFamily: "var(--font-geist-sans), Inter, Arial, sans-serif",
    h1: { fontWeight: 700 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 700 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    subtitle1: { fontWeight: 600 },
    subtitle2: { fontWeight: 600, fontSize: "0.8125rem" },
    body2: { fontSize: "0.8125rem" },
    caption: { fontSize: "0.6875rem" },
  },
  shape: {
    borderRadius: 10,
  },
  shadows: [
    "none",
    "0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)",
    "0 4px 6px -1px rgb(0 0 0 / 0.07), 0 2px 4px -2px rgb(0 0 0 / 0.07)",
    "0 10px 15px -3px rgb(0 0 0 / 0.07), 0 4px 6px -4px rgb(0 0 0 / 0.07)",
    "0 20px 25px -5px rgb(0 0 0 / 0.07), 0 8px 10px -6px rgb(0 0 0 / 0.07)",
    "0 25px 50px -12px rgb(0 0 0 / 0.15)",
    "none", "none", "none", "none", "none",
    "none", "none", "none", "none", "none",
    "none", "none", "none", "none", "none",
    "none", "none", "none", "none",
  ],
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.06)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: "none",
          fontWeight: 600,
          fontSize: "0.8125rem",
        },
        contained: {
          boxShadow: "none",
          "&:hover": { boxShadow: "none" },
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          fontWeight: 600,
          fontSize: "0.6875rem",
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderColor: "#f1f5f9",
          fontSize: "0.75rem",
          padding: "10px 16px",
        },
        head: {
          fontWeight: 600,
          fontSize: "0.6875rem",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          color: "#94a3b8",
          backgroundColor: "#f8fafc",
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: "none",
          fontWeight: 500,
          fontSize: "0.8125rem",
          minHeight: 36,
          padding: "6px 12px",
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: { minHeight: 36 },
        indicator: { borderRadius: 2 },
      },
    },
    MuiLinearProgress: {
      styleOverrides: {
        root: { borderRadius: 8 },
        bar: { borderRadius: 8 },
      },
    },
    MuiPagination: {
      styleOverrides: {
        root: { "& .MuiPaginationItem-root": { borderRadius: 6, fontSize: "0.75rem" } },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: { fontWeight: 700 },
      },
    },
  },
});

interface MuiThemeProviderProps {
  children: React.ReactNode;
}

export default function MuiThemeProvider({ children }: MuiThemeProviderProps) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      {children}
    </ThemeProvider>
  );
}
