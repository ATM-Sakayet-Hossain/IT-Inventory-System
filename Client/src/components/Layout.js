import React, { useContext } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  IconButton,
  Chip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Inventory as InventoryIcon,
  People as PeopleIcon,
  Category as CategoryIcon,
  Storefront as BusinessIcon,
  Assignment as AssignmentIcon,
  Build as BuildIcon,
  VpnKey as LicenseIcon,
  Assessment as AssessmentIcon,
  Logout as LogoutIcon,
  AccountCircle as AccountCircleIcon,
} from '@mui/icons-material';
import { AuthContext } from '../context/AuthContext';

const drawerWidth = 240;

// Define menu items with required roles
const allMenuItems = [
  { text: 'Dashboard', icon: DashboardIcon, path: '/dashboard', roles: ['Admin', 'IT Staff'] },
  { text: 'Assets', icon: InventoryIcon, path: '/assets', roles: ['Admin', 'IT Staff'] },
  { text: 'Users', icon: PeopleIcon, path: '/users', roles: ['Admin', 'IT Staff'] },
  { text: 'Categories', icon: CategoryIcon, path: '/categories', roles: ['Admin', 'IT Staff'] },
  { text: 'Vendors', icon: BusinessIcon, path: '/vendors', roles: ['Admin', 'IT Staff'] },
  { text: 'Assignments', icon: AssignmentIcon, path: '/assignments', roles: ['Admin', 'IT Staff'] },
  { text: 'Maintenance', icon: BuildIcon, path: '/maintenance', roles: ['Admin', 'IT Staff', 'Employee'] },
  { text: 'Licenses', icon: LicenseIcon, path: '/licenses', roles: ['Admin', 'IT Staff'] },
  { text: 'Reports', icon: AssessmentIcon, path: '/reports', roles: ['Admin', 'IT Staff'] },
];

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useContext(AuthContext);
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
    handleMenuClose();
  };

  // Filter menu items based on user role and permissions
  const menuItems = allMenuItems.filter(item => {
    // Check role-based access first
    if (!item.roles.includes(user?.role)) {
      return false;
    }
    
    // For Reports - check both module and resource permissions
    if (item.path === '/reports') {
      // If user has no permissions data, show it anyway (permissions might be loading)
      if (!user?.permissions) {
        return true;
      }
      
      const hasReportsModuleAccess = user?.permissions?.modules?.reports === true;
      const canViewReports = user?.permissions?.resources?.canViewReports === true;
      return hasReportsModuleAccess && canViewReports;
    }
    
    // All other items - just check role
    return true;
  });

  // Debug: Log which items are visible
  console.log('User:', user?.email, 'Role:', user?.role, 'Permissions:', user?.permissions, 'Visible Modules:', menuItems.map(m => m.text));

  // Get role color
  const getRoleColor = (role) => {
    switch(role) {
      case 'Admin':
        return 'error';
      case 'IT Staff':
        return 'warning';
      case 'Employee':
        return 'info';
      default:
        return 'default';
    }
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            IT Inventory Management System
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Chip 
              label={user?.role} 
              color={getRoleColor(user?.role)}
              size="small"
            />
            <Typography variant="body2">{user?.name}</Typography>
            <IconButton onClick={handleMenuOpen} color="inherit">
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                {user?.name?.charAt(0)}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
            >
              <MenuItem
                onClick={() => {
                  handleMenuClose();
                  navigate('/profile');
                }}
              >
                <ListItemIcon>
                  <AccountCircleIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Profile" />
              </MenuItem>
              <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
      >
        <Toolbar />
        <Box sx={{ overflow: 'auto' }}>
          <List>
            {menuItems.map((item) => {
              const IconComponent = item.icon;
              if (!IconComponent) {
                console.error(`Icon not found for: ${item.text}`);
                return null;
              }
              return (
                <ListItem key={item.text} disablePadding>
                  <ListItemButton
                    selected={location.pathname === item.path}
                    onClick={() => navigate(item.path)}
                  >
                    <ListItemIcon><IconComponent /></ListItemIcon>
                    <ListItemText primary={item.text} />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Box>
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          bgcolor: 'background.default',
          p: 3,
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
}
