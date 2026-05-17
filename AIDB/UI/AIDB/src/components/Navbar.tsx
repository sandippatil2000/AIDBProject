import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Avatar,
  Tooltip,
  Menu,
  MenuItem,
  Divider,
  Badge,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Notifications as NotificationsIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { DRAWER_WIDTH, MINI_DRAWER_WIDTH, navItems, type NavItem } from './Sidebar';

interface NavbarProps {
  onMenuClick: () => void;
  sidebarOpen: boolean;
}

/**
 * Recursively find the NavItem whose path matches the current pathname,
 * including nested children.
 */
const findActiveNavItem = (items: NavItem[], pathname: string): NavItem | undefined => {
  for (const item of items) {
    if (item.path && item.path === pathname) return item;
    if (item.children) {
      const found = findActiveNavItem(item.children, pathname);
      if (found) return found;
    }
  }
  return undefined;
};

export const Navbar = ({ onMenuClick, sidebarOpen }: NavbarProps) => {
  const theme = useTheme();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  // Derive current page label from the active nav item
  const activeItem = findActiveNavItem(navItems, location.pathname);
  const pageTitle = activeItem?.label ?? 'AIDB Platform';

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => setAnchorEl(null);

  const handleLogout = () => {
    handleMenuClose();
    logout();
  };

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        // Raise above the MUI Drawer so the hamburger is always visible
        zIndex: theme.zIndex.drawer + 1,
        // When open: offset by full width; when mini (closed on desktop): offset by mini width
        width: { md: sidebarOpen ? `calc(100% - ${DRAWER_WIDTH}px)` : `calc(100% - ${MINI_DRAWER_WIDTH}px)` },
        ml: { md: sidebarOpen ? `${DRAWER_WIDTH}px` : `${MINI_DRAWER_WIDTH}px` },
        transition: theme.transitions.create(['width', 'margin'], {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.leavingScreen,
        }),
        backgroundColor: 'primary.main',
        color: 'primary.contrastText',
      }}
    >
      <Toolbar sx={{ gap: 1 }}>
        {/* Hamburger — always rendered on top of the sidebar */}
        <IconButton
          id="nav-menu-toggle"
          color="inherit"
          edge="start"
          onClick={onMenuClick}
          sx={{ color: 'inherit' }}
        >
          <MenuIcon />
        </IconButton>

        {/* Active page title derived from the same navItems used in Sidebar */}
        <Typography variant="h6" fontWeight={600} sx={{ flexGrow: 1, color: 'inherit' }}>
          {pageTitle}
        </Typography>

        {/* Notifications */}
        <Tooltip title="Notifications">
          <IconButton id="nav-notifications" sx={{ color: 'inherit' }}>
            <Badge badgeContent={3} color="primary">
              <NotificationsIcon />
            </Badge>
          </IconButton>
        </Tooltip>

        {/* Avatar / User Menu */}
        <Tooltip title="Account">
          <IconButton id="nav-user-avatar" onClick={handleAvatarClick} sx={{ p: 0.5 }}>
            <Avatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: 'primary.light',
                fontSize: 14,
                fontWeight: 700,
              }}
            >
              {user?.name?.charAt(0).toUpperCase() ?? 'U'}
            </Avatar>
          </IconButton>
        </Tooltip>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
          transformOrigin={{ horizontal: 'right', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          PaperProps={{ sx: { mt: 1, minWidth: 200 } }}
        >
          <Box sx={{ px: 2, py: 1.5 }}>
            <Typography variant="subtitle2" fontWeight={600}>
              {user?.name ?? 'User'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.email ?? ''}
            </Typography>
          </Box>
          <Divider />
          <MenuItem id="nav-profile" onClick={handleMenuClose}>
            <PersonIcon fontSize="small" sx={{ mr: 1.5, color: 'text.secondary' }} />
            Profile
          </MenuItem>
          <MenuItem id="nav-logout" onClick={handleLogout}>
            <LogoutIcon fontSize="small" sx={{ mr: 1.5, color: 'text.secondary' }} />
            Logout
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};
