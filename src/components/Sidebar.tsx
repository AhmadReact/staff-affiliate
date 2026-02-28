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
  Users,
  Network,
  DollarSign,
  Megaphone,
  Settings,
  ChevronLeft,
  LucideIcon,
} from "lucide-react";

interface NavItem {
  label: string;
  icon: LucideIcon;
  href?: string;
  disabled?: boolean;
}

const navItems: NavItem[] = [
  { label: "Dashboard", icon: LayoutDashboard, href: "/customer-dashboard" },
  {
    label: "Referrals",
    icon: Users,
    href: "/customer-dashboard/referrals",
  },
  { label: "Network", icon: Network, href: "/network", disabled: true },
  { label: "Earnings", icon: DollarSign, href: "/customer-dashboard/earnings" },
  {
    label: "Marketing Tools",
    icon: Megaphone,
    href: "/marketing-tools",
    disabled: true,
  },
  { label: "Settings", icon: Settings, href: "/settings", disabled: true },
];

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ open = false, onClose }: SidebarProps) {
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
          Kosher
          <Box component="span" sx={{ color: "primary.main" }}>
            Phone
          </Box>
        </Typography>
      </Box>

      <Divider />

      {/* Nav */}
      <List sx={{ flex: 1, py: 1.5, px: 1 }}>
        {navItems.map(({ label, icon: Icon, href, disabled }) => {
          const isDashboard = href === "/customer-dashboard";
          const isActive =
            !disabled &&
            (isDashboard
              ? pathname === "/customer-dashboard" ||
                pathname === "/customer-dashboard/"
              : href
              ? pathname.startsWith(href)
              : false);
          return (
            <ListItem key={label} disablePadding sx={{ mb: 0.5 }}>
              <ListItemButton
                {...(!disabled && href
                  ? {
                      component: Link,
                      href,
                      onClick: !isDesktop ? onClose : undefined,
                    }
                  : {})}
                disabled={disabled}
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
                  ...(disabled && {
                    opacity: 0.5,
                    cursor: "not-allowed",
                    "&:hover": { bgcolor: "transparent" },
                  }),
                }}
              >
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <Icon size={18} />
                </ListItemIcon>
                <ListItemText
                  primary={label}
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
