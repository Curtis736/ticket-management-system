import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Logout as LogoutIcon,
  AdminPanelSettings as AdminIcon,
  Person as PersonIcon,
  Build as BuildIcon,
  Business as BusinessIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin':
        return <AdminIcon />;
      case 'technicien':
        return <BuildIcon />;
      case 'collaborateur':
        return <BusinessIcon />;
      default:
        return <PersonIcon />;
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'technicien':
        return 'warning';
      case 'collaborateur':
        return 'primary';
      default:
        return 'default';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin':
        return 'Administrateur';
      case 'technicien':
        return 'Développeur';
      case 'collaborateur':
        return 'Collaborateur';
      default:
        return role;
    }
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Système de Tickets
        </Typography>
        
        <Box display="flex" alignItems="center" gap={2}>
          <Box display="flex" alignItems="center" gap={1}>
            {getRoleIcon(user.role)}
            <Chip
              label={getRoleLabel(user.role)}
              color={getRoleColor(user.role)}
              size="small"
              variant="outlined"
            />
          </Box>
          
          <Typography variant="body2" sx={{ color: 'white' }}>
            {user.username}
          </Typography>
          
          <Tooltip title="Déconnexion">
            <IconButton
              color="inherit"
              onClick={logout}
              size="small"
            >
              <LogoutIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 