import React, { type ReactNode, useState } from 'react';
import {
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Collapse,
  Box,
  Typography,
  Divider,
  Tooltip,
  useTheme,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Storage as StorageIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  BarChart as BarChartIcon,
  ListAlt as ListAltIcon,
  ExpandLess,
  ExpandMore,
  Circle as CircleIcon,
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';

/** Full sidebar width when expanded */
export const DRAWER_WIDTH = 260;
/** Icon-only mini width when collapsed */
export const MINI_DRAWER_WIDTH = 64;

export interface NavItem {
  label: string;
  icon: ReactNode;
  path?: string;
  children?: NavItem[];
}

export const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    icon: <DashboardIcon />,
    path: '/dashboard',
  },
  {
    label: 'Data Management',
    icon: <StorageIcon />,
    children: [
      { label: 'Connections', icon: <CircleIcon sx={{ fontSize: 8 }} />, path: '/Connections' },
      { label: 'History', icon: <CircleIcon sx={{ fontSize: 8 }} />, path: '/History' },
      { label: 'Config', icon: <CircleIcon sx={{ fontSize: 8 }} />, path: '/Config' },
    ],
  },
  {
    label: 'Analytics',
    icon: <BarChartIcon />,
    children: [
      { label: 'Reports', icon: <CircleIcon sx={{ fontSize: 8 }} />, path: '/reports' },
      { label: 'Report List', icon: <ListAltIcon sx={{ fontSize: 16 }} />, path: '/report-list' },
      { label: 'Metrics', icon: <CircleIcon sx={{ fontSize: 8 }} />, path: '/metrics' },
    ],
  },
  {
    label: 'Users',
    icon: <PeopleIcon />,
    path: '/users',
  },
  {
    label: 'Settings',
    icon: <SettingsIcon />,
    path: '/settings',
  },
];

interface SidebarProps {
  open: boolean;
  onClose?: () => void;
  variant?: 'permanent' | 'temporary';
}

export const Sidebar = ({ open, onClose, variant = 'permanent' }: SidebarProps) => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [expandedItems, setExpandedItems] = useState<string[]>(['Data Management']);

  // In mini mode (desktop collapsed), children cannot be expanded inline
  const isMini = variant === 'permanent' && !open;

  const handleToggle = (label: string) => {
    setExpandedItems((prev) =>
      prev.includes(label) ? prev.filter((item) => item !== label) : [...prev, label]
    );
  };

  const handleNavigate = (path: string) => {
    navigate(path);
    if (variant === 'temporary' && onClose) onClose();
  };

  const isActive = (path?: string) => path && location.pathname === path;

  /** Returns the best "top-level" icon for a group in mini mode:
   *  if any child is active, still highlight the parent icon */
  const isGroupActive = (item: NavItem): boolean => {
    if (item.path && location.pathname === item.path) return true;
    if (item.children) {
      return item.children.some((c) => c.path && location.pathname === c.path);
    }
    return false;
  };

  const renderNavItem = (item: NavItem, depth = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.label);
    const active = isGroupActive(item);

    // ── MINI MODE: render icon-only button with tooltip ──────────────────────
    if (isMini) {
      // For groups in mini mode, navigate to the first child's path on click
      const miniPath = item.path ?? item.children?.[0]?.path;
      return (
        <Tooltip key={item.label} title={item.label} placement="right" arrow>
          <ListItemButton
            selected={active}
            onClick={() => miniPath && handleNavigate(miniPath)}
            sx={{
              justifyContent: 'center',
              px: 0,
              py: 1.25,
              mx: 0.75,
              borderRadius: 2,
              mb: 0.5,
              minHeight: 44,
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 0,
                justifyContent: 'center',
                color: active ? 'primary.main' : 'text.secondary',
              }}
            >
              {item.icon}
            </ListItemIcon>
          </ListItemButton>
        </Tooltip>
      );
    }

    // ── FULL MODE: label + expand/collapse for groups ────────────────────────
    return (
      <React.Fragment key={item.label}>
        <ListItemButton
          selected={!!isActive(item.path)}
          onClick={() =>
            hasChildren ? handleToggle(item.label) : item.path && handleNavigate(item.path)
          }
          sx={{
            pl: depth > 0 ? 4 : 2,
            py: 1,
            mx: 1,
            borderRadius: 2,
            mb: 0.5,
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 36,
              color: isActive(item.path) ? 'primary.main' : 'text.secondary',
            }}
          >
            {item.icon}
          </ListItemIcon>
          <ListItemText
            primary={item.label}
            primaryTypographyProps={{
              fontSize: depth > 0 ? 13 : 14,
              fontWeight: isActive(item.path) ? 600 : 500,
              color: isActive(item.path) ? 'primary.main' : 'text.primary',
            }}
          />
          {hasChildren &&
            (isExpanded ? <ExpandLess fontSize="small" /> : <ExpandMore fontSize="small" />)}
        </ListItemButton>

        {hasChildren && (
          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
            <List disablePadding>
              {item.children!.map((child) => renderNavItem(child, depth + 1))}
            </List>
          </Collapse>
        )}
      </React.Fragment>
    );
  };

  // ── Current effective drawer paper width ────────────────────────────────────
  const paperWidth = isMini ? MINI_DRAWER_WIDTH : DRAWER_WIDTH;

  const drawerContent = (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      {/* Logo / Brand */}
      <Box
        sx={{
          ...theme.mixins.toolbar, // matches AppBar height at every breakpoint
          display: 'flex',
          alignItems: 'center',
          justifyContent: isMini ? 'center' : 'flex-start',
          gap: 1.5,
          px: isMini ? 0 : 3,
          borderBottom: `1px solid ${theme.palette.divider}`,
          flexShrink: 0,
          transition: theme.transitions.create('padding', {
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: 2,
            background: 'linear-gradient(135deg, #1976d2, #63a4ff)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <StorageIcon sx={{ color: '#fff', fontSize: 20 }} />
        </Box>

        {/* Label fades out in mini mode */}
        <Typography
          variant="h6"
          color="primary.main"

          sx={{
            opacity: isMini ? 0 : 1,
            width: isMini ? 0 : 'auto',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
            transition: theme.transitions.create(['opacity', 'width'], {
              duration: theme.transitions.duration.enteringScreen,
            }),
            fontWeight: 700,
            letterSpacing: 0.5
          }}
        >
          AIDB
        </Typography>
      </Box>

      {/* Section label — hidden in mini mode */}
      <Box
        sx={{
          overflow: 'hidden',
          height: isMini ? 0 : 'auto',
          opacity: isMini ? 0 : 1,
          transition: theme.transitions.create(['height', 'opacity'], {
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Typography
          variant="caption"
          sx={{
            px: 3,
            pt: 2,
            pb: 0.5,
            display: 'block',
            color: 'text.secondary',
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: 1,
          }}
        >
          Main Menu
        </Typography>
      </Box>

      {/* Nav Items */}
      <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', py: 1 }}>
        <List disablePadding>
          {navItems.map((item) => renderNavItem(item))}
        </List>
      </Box>

      {/* Footer */}
      <Divider />
      <Box
        sx={{
          px: isMini ? 0 : 3,
          py: 1.5,
          display: 'flex',
          justifyContent: isMini ? 'center' : 'flex-start',
          transition: theme.transitions.create('padding', {
            duration: theme.transitions.duration.enteringScreen,
          }),
        }}
      >
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            opacity: isMini ? 0 : 1,
            transition: theme.transitions.create('opacity', {
              duration: theme.transitions.duration.enteringScreen,
            }),
          }}
        >
          AIDB v1.0.0
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      sx={{
        width: variant === 'permanent' ? paperWidth : DRAWER_WIDTH,
        flexShrink: 0,
        whiteSpace: 'nowrap',
        boxSizing: 'border-box',
        transition: theme.transitions.create('width', {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
        '& .MuiDrawer-paper': {
          width: paperWidth,
          boxSizing: 'border-box',
          overflowX: 'hidden',
          transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};
