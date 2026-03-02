"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import {
  LayoutDashboard,
  DollarSign,
  Settings,
  ChevronLeft,
  Users,
  LucideIcon,
} from "lucide-react";

type AdminNavItem =
  | {
      type: "item";
      label: string;
      icon: LucideIcon;
      href: string;
    }
  | {
      type: "section";
      label: string;
    };

const navItems: AdminNavItem[] = [
  {
    type: "item",
    label: "Customers",
    icon: Users,
    href: "/admin-dashboard/customers",
  },
  {
    type: "item",
    label: "Balances",
    icon: LayoutDashboard,
    href: "/admin-dashboard",
  },
  {
    type: "item",
    label: "Payouts",
    icon: DollarSign,
    href: "/admin-dashboard/payouts",
  },
  {
    type: "section",
    label: "Planes Rates",
  },
  {
    type: "item",
    label: "Customer Rates",
    icon: DollarSign,
    href: "/admin-dashboard/planes-rates/customer-rates",
  },
  {
    type: "item",
    label: "Setting",
    icon: Settings,
    href: "/admin-dashboard/planes-rates/settings",
  },
];

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export default function AdminSidebar({ open = false, onClose }: SidebarProps) {
  const pathname = usePathname();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));

  const content = (
    <Box
      sx={{
        width: 208,
        display: "flex",
        flexDirection: "column",
        height: "100%",
      }}
    >
      {/* Logo */}
      <Box
        sx={{ display: "flex", alignItems: "center", gap: 1, px: 2.5, py: 2.5 }}
      >
        <Box
          sx={{
            width: 32,
            height: 32,
            bgcolor: "primary.main",
            borderRadius: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            flexShrink: 0,
          }}
        >
          <ChevronLeft size={16} />
        </Box>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 700, color: "text.primary" }}
        >
          Admin
          <Box component="span" sx={{ color: "primary.main" }}>
            Panel
          </Box>
        </Typography>
      </Box>

      <Divider />

      {/* Nav */}
      <List sx={{ flex: 1, py: 1.5, px: 1 }}>
        {navItems.map((item) => {
          if (item.type === "section") {
            return (
              <ListItem
                key={item.label}
                disablePadding
                sx={{ mt: 1.5, mb: 0.5, px: 1 }}
              >
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    textTransform: "uppercase",
                    color: "text.disabled",
                  }}
                />
              </ListItem>
            );
          }

          const isRootBalances = item.href === "/admin-dashboard";
          const isActive = isRootBalances
            ? pathname === "/admin-dashboard" ||
              pathname === "/admin-dashboard/"
            : pathname.startsWith(item.href);

          const Icon = item.icon;

          return (
            <ListItem key={item.label} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                component={Link}
                href={item.href}
                onClick={!isDesktop ? onClose : undefined}
                selected={isActive}
                sx={{
                  borderRadius: 2,
                  py: 1,
                  px: 1.5,
                  "&.Mui-selected": {
                    bgcolor: "primary.50",
                    color: "primary.main",
                    "&:hover": { bgcolor: "primary.50" },
                  },
                  "&.Mui-selected .MuiListItemIcon-root": {
                    color: "primary.main",
                  },
                  "&:not(.Mui-selected)": {
                    color: "text.secondary",
                  },
                  "&:not(.Mui-selected) .MuiListItemIcon-root": {
                    color: "text.disabled",
                  },
                }}
              >
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <Icon size={18} />
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: "0.8125rem",
                    fontWeight: 500,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );

  if (isDesktop) {
    return (
      <Box
        component="aside"
        sx={{
          width: 208,
          minHeight: "100vh",
          bgcolor: "background.paper",
          borderRight: "1px solid",
          borderColor: "divider",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          boxShadow: 1,
        }}
      >
        {content}
      </Box>
    );
  }

  return (
    <Drawer
      anchor="left"
      open={open}
      onClose={onClose}
      sx={{ "& .MuiDrawer-paper": { width: 208 } }}
    >
      {content}
    </Drawer>
  );
}

