import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Box, Button, Card, Typography } from '@mui/material';

export function DashboardExample1() {
  const { user } = useContext(AuthContext);

  // Simple check: Does user have reports module access AND can view reports?
  const canViewReports =
    user?.permissions?.modules?.reports === true &&
    user?.permissions?.resources?.canViewReports === true;

  return (
    <Box>
      {canViewReports ? (
        <Card sx={{ p: 3 }}>
          <Typography variant="h6">Reports & Analytics</Typography>
          <Button variant="contained">View Reports Dashboard</Button>
        </Card>
      ) : (
        <Card sx={{ p: 3, bgcolor: 'info.light' }}>
          <Typography color="text.secondary">
            Reports & Analytics not available for your user role
          </Typography>
        </Card>
      )}
    </Box>
  );
}

import { 
  hasModulePermission, 
  hasResourcePermission,
  hasAllPermissions 
} from '../utils/permissionUtils';

export function DashboardExample2() {
  const { user } = useContext(AuthContext);

  return (
    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
      {/* Module check */}
      {hasModulePermission(user, 'reports') && (
        <Button variant="outlined">Reports Module</Button>
      )}

      {/* Resource check */}
      {hasResourcePermission(user, 'canViewReports') && (
        <Button variant="outlined">View Report Data</Button>
      )}

      {/* Multiple checks (both required) */}
      {hasAllPermissions(
        user,
        ['reports', 'canViewReports'],
        'mixed' // 'modules' and 'resources'
      ) && (
        <Button variant="contained" color="success">
          Full Reports Access
        </Button>
      )}
    </Box>
  );
}


export function ReportsCard() {
  const { user } = useContext(AuthContext);

  const canViewReports =
    user?.permissions?.modules?.reports === true &&
    user?.permissions?.resources?.canViewReports === true;

  if (!canViewReports) {
    return (
      <Card sx={{ p: 3, border: '2px solid #ff9800' }}>
        <Typography variant="body2" color="warning.main">
          🔒 Reports access restricted
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Contact administrator for access
        </Typography>
      </Card>
    );
  }

  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        📊 Reports & Analytics
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        View comprehensive reports and analytics for your IT assets
      </Typography>
      <Box sx={{ display: 'flex', gap: 1 }}>
        <Button size="small" variant="contained">
          View Dashboard
        </Button>
        <Button size="small" variant="outlined">
          Export Reports
        </Button>
      </Box>
    </Card>
  );
}


import { 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText 
} from '@mui/material';
import { Assessment, BarChart, TrendingUp } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const reportMenuItems = [
  {
    label: 'Dashboard Report',
    icon: Assessment,
    path: '/reports/dashboard',
    requiredModule: 'reports',
    requiredResource: 'canViewReports'
  },
  {
    label: 'Analytics Report',
    icon: BarChart,
    path: '/reports/analytics',
    requiredModule: 'reports',
    requiredResource: 'canViewReports'
  },
  {
    label: 'Trending Report',
    icon: TrendingUp,
    path: '/reports/trending',
    requiredModule: 'reports',
    requiredResource: 'canViewReports'
  }
];

export function ReportsMenu() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // Filter menu items based on permissions
  const visibleItems = reportMenuItems.filter(item => {
    const hasModule = user?.permissions?.modules?.[item.requiredModule] === true;
    const hasResource = user?.permissions?.resources?.[item.requiredResource] === true;
    return hasModule && hasResource;
  });

  // If user has no report access, show message
  if (visibleItems.length === 0) {
    return (
      <Box sx={{ p: 2, textAlign: 'center', color: 'text.secondary' }}>
        <Typography variant="body2">
          No reports available with your current permissions
        </Typography>
      </Box>
    );
  }

  return (
    <List>
      {visibleItems.map(item => {
        const IconComponent = item.icon;
        return (
          <ListItem key={item.label} disablePadding>
            <ListItemButton onClick={() => navigate(item.path)}>
              <ListItemIcon>
                <IconComponent />
              </ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          </ListItem>
        );
      })}
    </List>
  );
}


import { Table, TableBody, TableCell, TableHead, TableRow, IconButton } from '@mui/material';
import { Download, Share, Delete } from '@mui/icons-material';
import { toast } from 'react-toastify';

const sampleReports = [
  { id: 1, name: 'Q1 Asset Report', date: '2026-03-31' },
  { id: 2, name: 'Maintenance Summary', date: '2026-01-15' },
  { id: 3, name: 'License Expiry Report', date: '2026-01-10' }
];

export function ReportsTable() {
  const { user } = useContext(AuthContext);

  const canViewReports =
    user?.permissions?.modules?.reports === true &&
    user?.permissions?.resources?.canViewReports === true;

  const canDelete = user?.permissions?.actions?.canDelete === true;
  const canUpdate = user?.permissions?.actions?.canUpdate === true;

  if (!canViewReports) {
    return (
      <Typography color="error">
        You don't have permission to view reports
      </Typography>
    );
  }

  const handleDownload = (reportId) => {
    toast.info(`Downloading report ${reportId}...`);
    // Download logic here
  };

  const handleShare = (reportId) => {
    toast.info(`Sharing report ${reportId}...`);
    // Share logic here
  };

  const handleDelete = (reportId) => {
    if (!canDelete) {
      toast.error('You do not have permission to delete reports');
      return;
    }
    toast.success(`Report ${reportId} deleted`);
    // Delete logic here
  };

  return (
    <Table>
      <TableHead>
        <TableRow sx={{ backgroundColor: 'primary.light' }}>
          <TableCell>Report Name</TableCell>
          <TableCell>Date</TableCell>
          <TableCell align="right">Actions</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {sampleReports.map(report => (
          <TableRow key={report.id} hover>
            <TableCell>{report.name}</TableCell>
            <TableCell>{report.date}</TableCell>
            <TableCell align="right">
              {/* Download always available for viewing users */}
              <IconButton
                size="small"
                onClick={() => handleDownload(report.id)}
                title="Download Report"
              >
                <Download fontSize="small" />
              </IconButton>

              {/* Share only if update permission */}
              {canUpdate && (
                <IconButton
                  size="small"
                  onClick={() => handleShare(report.id)}
                  title="Share Report"
                >
                  <Share fontSize="small" />
                </IconButton>
              )}

              {/* Delete only if delete permission */}
              {canDelete && (
                <IconButton
                  size="small"
                  color="error"
                  onClick={() => handleDelete(report.id)}
                  title="Delete Report"
                >
                  <Delete fontSize="small" />
                </IconButton>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}


import { Alert, AlertTitle } from '@mui/material';

export function ReportsPageHeader() {
  const { user } = useContext(AuthContext);

  const hasReportModule = user?.permissions?.modules?.reports === true;
  const canViewReports = user?.permissions?.resources?.canViewReports === true;

  return (
    <Box sx={{ mb: 3 }}>
      <Typography variant="h4" gutterBottom>
        Reports & Analytics
      </Typography>

      {/* Warning if only has one permission */}
      {hasReportModule && !canViewReports && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <AlertTitle>Limited Access</AlertTitle>
          You have access to the Reports module but cannot view report data.
          Contact your administrator.
        </Alert>
      )}

      {!hasReportModule && canViewReports && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          <AlertTitle>Configuration Issue</AlertTitle>
          You have view permission but module access is restricted.
          Contact your administrator.
        </Alert>
      )}

      {!hasReportModule && !canViewReports && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <AlertTitle>Access Denied</AlertTitle>
          You do not have permission to access Reports & Analytics.
          Contact your administrator for access.
        </Alert>
      )}
    </Box>
  );
}


import { Chip, Box } from '@mui/material';

export function UserPermissionBadge() {
  const { user } = useContext(AuthContext);

  const canViewReports =
    user?.permissions?.modules?.reports === true &&
    user?.permissions?.resources?.canViewReports === true;

  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      <Chip
        label={user?.role}
        color="primary"
        variant="outlined"
        size="small"
      />
      
      {canViewReports && (
        <Chip
          icon={<Assessment />}
          label="Reports Access"
          color="success"
          variant="filled"
          size="small"
        />
      )}
      
      {!canViewReports && (
        <Chip
          label="No Reports"
          color="default"
          variant="outlined"
          size="small"
        />
      )}
    </Box>
  );
}


export function ReportsExportButton() {
  const { user } = useContext(AuthContext);
  const [exporting, setExporting] = React.useState(false);

  const canViewReports =
    user?.permissions?.modules?.reports === true &&
    user?.permissions?.resources?.canViewReports === true;

  const canUpdate = user?.permissions?.actions?.canUpdate === true;

  if (!canViewReports) {
    return (
      <Box>
        <Typography variant="caption" color="text.secondary">
          Export not available - view permission required
        </Typography>
      </Box>
    );
  }

  const handleExport = async () => {
    try {
      setExporting(true);

      // Check if user can export (update permission)
      if (!canUpdate) {
        toast.error('You do not have permission to export reports');
        return;
      }

      // Call API to generate export
      const response = await axios.get('/api/reports/export', {
        responseType: 'blob'
      });

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'reports.xlsx');
      document.body.appendChild(link);
      link.click();
      link.parentElement.removeChild(link);

      toast.success('Report exported successfully');
    } catch (error) {
      toast.error('Failed to export report');
    } finally {
      setExporting(false);
    }
  };

  return (
    <Button
      variant="contained"
      onClick={handleExport}
      disabled={exporting || !canUpdate}
      startIcon={<Download />}
    >
      {exporting ? 'Exporting...' : 'Export Report'}
    </Button>
  );
}


export function CompleteReportsPage() {
  const { user } = useContext(AuthContext);
  const [reports, setReports] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const canViewReports =
    user?.permissions?.modules?.reports === true &&
    user?.permissions?.resources?.canViewReports === true;

  React.useEffect(() => {
    if (canViewReports) {
      fetchReports();
    }
  }, [canViewReports]);

  const fetchReports = async () => {
    try {
      const response = await axios.get('/api/reports/dashboard');
      setReports(response.data.data);
    } catch (error) {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  // Permission denied view
  if (!canViewReports) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <Card sx={{ p: 4, maxWidth: 400, textAlign: 'center' }}>
          <Typography variant="h6" gutterBottom color="error">
            🔒 Access Denied
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            You do not have permission to view Reports & Analytics.
          </Typography>
          <Typography variant="caption" color="text.secondary">
            Contact your administrator to request access
          </Typography>
        </Card>
      </Box>
    );
  }

  // Granted access view
  return (
    <Box>
      <ReportsPageHeader />

      {loading ? (
        <Box display="flex" justifyContent="center">
          <CircularProgress />
        </Box>
      ) : (
        <>
          <ReportsExportButton />
          <ReportsTable />
        </>
      )}
    </Box>
  );
}


export {
  DashboardExample1,
  DashboardExample2,
  ReportsCard,
  ReportsMenu,
  ReportsTable,
  ReportsPageHeader,
  UserPermissionBadge,
  ReportsExportButton,
  CompleteReportsPage
};
