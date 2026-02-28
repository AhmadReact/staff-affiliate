"use client";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { MessageSquare, Bell, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";

interface HeaderProps {
  onMenuClick?: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up("lg"));
  const dispatch = useAppDispatch();
  const router = useRouter();

  const user = useAppSelector((state) => state.auth.user);
  const displayName = user
    ? `${user.fname}${user.lname ? ` ${user.lname}` : ""}`
    : "Guest";
  const initials = user
    ? `${user.fname?.[0] ?? ""}${user.lname?.[0] ?? ""}`.toUpperCase() || "U"
    : "G";

  const handleLogout = () => {
    dispatch(logout());
    router.replace("/");
  };

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        bgcolor: "background.paper",
        borderBottom: "1px solid",
        borderColor: "divider",
        color: "text.primary",
        height: 56,
        justifyContent: "center",
      }}
    >
      <Toolbar
        variant="dense"
        sx={{ justifyContent: "space-between", gap: 1, minHeight: 56 }}
      >
        {/* Hamburger — rendered only when sidebar is not permanently visible */}
        {!isDesktop && (
          <IconButton
            size="small"
            onClick={onMenuClick}
            sx={{ color: "text.secondary" }}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </IconButton>
        )}

        {/* Spacer to push right-side content to the end on desktop */}
        <Box sx={{ flex: 1 }} />

        {/* Right-side actions */}
        <Stack direction="row" alignItems="center" spacing={0.5}>
          <IconButton size="small" sx={{ color: "text.secondary" }}>
            <MessageSquare size={18} />
          </IconButton>

          <IconButton size="small" sx={{ color: "text.secondary" }}>
            <Badge
              badgeContent="9+"
              color="error"
              sx={{
                "& .MuiBadge-badge": {
                  fontSize: 9,
                  minWidth: 16,
                  height: 16,
                  fontWeight: 700,
                },
              }}
            >
              <Bell size={18} />
            </Badge>
          </IconButton>

          <Stack
            direction="row"
            alignItems="center"
            spacing={1}
            sx={{ ml: 0.5 }}
          >
            <Typography
              variant="subtitle2"
              sx={{ color: "text.primary", display: { xs: "none", sm: "block" } }}
            >
              {displayName}
            </Typography>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                fontSize: 12,
                background: "linear-gradient(135deg, #60a5fa, #2563eb)",
              }}
            >
              {initials}
            </Avatar>
            <Button
              size="small"
              variant="outlined"
              onClick={handleLogout}
              sx={{
                ml: 0.5,
                textTransform: "none",
                fontSize: 12,
                paddingInline: 1.25,
                paddingBlock: 0.25,
              }}
            >
              Logout
            </Button>
          </Stack>
        </Stack>
      </Toolbar>
    </AppBar>
  );
}
