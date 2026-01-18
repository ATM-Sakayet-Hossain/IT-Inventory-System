import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import RoleBasedRoute from './components/RoleBasedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Assets from './pages/Assets';
import AssetForm from './pages/AssetForm';
import AssetDetail from './pages/AssetDetail';
import Users from './pages/Users';
import UserForm from './pages/UserForm';
import Categories from './pages/Categories';
import CategoryForm from './pages/CategoryForm';
import Vendors from './pages/Vendors';
import VendorForm from './pages/VendorForm';
import Assignments from './pages/Assignments';
import AssignmentForm from './pages/AssignmentForm';
import Maintenance from './pages/Maintenance';
import MaintenanceForm from './pages/MaintenanceForm';
import MaintenanceAssign from './pages/MaintenanceAssign';
import Licenses from './pages/Licenses';
import LicenseForm from './pages/LicenseForm';
import Reports from './pages/Reports';
import Profile from './pages/Profile';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route 
                path="dashboard" 
                element={
                  <RoleBasedRoute requiredRoles={['Admin', 'IT Staff']}>
                    <Dashboard />
                  </RoleBasedRoute>
                } 
              />
              <Route 
                path="assets" 
                element={
                  <RoleBasedRoute requiredRoles={['Admin', 'IT Staff']}>
                    <Assets />
                  </RoleBasedRoute>
                } 
              />
              <Route 
                path="assets/new" 
                element={
                  <RoleBasedRoute requiredRoles={['Admin', 'IT Staff']}>
                    <AssetForm />
                  </RoleBasedRoute>
                } 
              />
              <Route 
                path="assets/:id" 
                element={
                  <RoleBasedRoute requiredRoles={['Admin', 'IT Staff']}>
                    <AssetDetail />
                  </RoleBasedRoute>
                } 
              />
              <Route 
                path="assets/:id/edit" 
                element={
                  <RoleBasedRoute requiredRoles={['Admin', 'IT Staff']}>
                    <AssetForm />
                  </RoleBasedRoute>
                } 
              />
              <Route 
                path="users" 
                element={
                  <RoleBasedRoute requiredRoles={['Admin', 'IT Staff']}>
                    <Users />
                  </RoleBasedRoute>
                } 
              />
              <Route 
                path="users/new" 
                element={
                  <RoleBasedRoute requiredRoles={['Admin']}>
                    <UserForm />
                  </RoleBasedRoute>
                } 
              />
              <Route 
                path="users/:id/edit" 
                element={
                  <RoleBasedRoute requiredRoles={['Admin']}>
                    <UserForm />
                  </RoleBasedRoute>
                } 
              />
              <Route 
                path="categories" 
                element={
                  <RoleBasedRoute requiredRoles={['Admin', 'IT Staff']}>
                    <Categories />
                  </RoleBasedRoute>
                } 
              />
              <Route 
                path="categories/new" 
                element={
                  <RoleBasedRoute requiredRoles={['Admin']}>
                    <CategoryForm />
                  </RoleBasedRoute>
                } 
              />
              <Route 
                path="categories/:id/edit" 
                element={
                  <RoleBasedRoute requiredRoles={['Admin']}>
                    <CategoryForm />
                  </RoleBasedRoute>
                } 
              />
              <Route 
                path="vendors" 
                element={
                  <RoleBasedRoute requiredRoles={['Admin', 'IT Staff']}>
                    <Vendors />
                  </RoleBasedRoute>
                } 
              />
              <Route 
                path="vendors/new" 
                element={
                  <RoleBasedRoute requiredRoles={['Admin']}>
                    <VendorForm />
                  </RoleBasedRoute>
                } 
              />
              <Route 
                path="vendors/:id/edit" 
                element={
                  <RoleBasedRoute requiredRoles={['Admin']}>
                    <VendorForm />
                  </RoleBasedRoute>
                } 
              />
              <Route 
                path="assignments" 
                element={
                  <RoleBasedRoute requiredRoles={['Admin', 'IT Staff']}>
                    <Assignments />
                  </RoleBasedRoute>
                } 
              />
              <Route 
                path="assignments/new" 
                element={
                  <RoleBasedRoute requiredRoles={['Admin', 'IT Staff']}>
                    <AssignmentForm />
                  </RoleBasedRoute>
                } 
              />
              <Route 
                path="maintenance" 
                element={
                  <RoleBasedRoute requiredRoles={['Admin', 'IT Staff', 'Employee']}>
                    <Maintenance />
                  </RoleBasedRoute>
                } 
              />
              <Route 
                path="maintenance/new" 
                element={
                  <RoleBasedRoute requiredRoles={['Admin', 'IT Staff']}>
                    <MaintenanceForm />
                  </RoleBasedRoute>
                } 
              />
              <Route 
                path="maintenance/:id/edit" 
                element={
                  <RoleBasedRoute requiredRoles={['Admin', 'IT Staff']}>
                    <MaintenanceForm />
                  </RoleBasedRoute>
                } 
              />
              <Route 
                path="maintenance/:id/assign" 
                element={
                  <RoleBasedRoute requiredRoles={['Admin', 'IT Staff']}>
                    <MaintenanceAssign />
                  </RoleBasedRoute>
                } 
              />
              <Route 
                path="licenses" 
                element={
                  <RoleBasedRoute requiredRoles={['Admin', 'IT Staff']}>
                    <Licenses />
                  </RoleBasedRoute>
                } 
              />
              <Route 
                path="licenses/new" 
                element={
                  <RoleBasedRoute requiredRoles={['Admin', 'IT Staff']}>
                    <LicenseForm />
                  </RoleBasedRoute>
                } 
              />
              <Route 
                path="licenses/:id/edit" 
                element={
                  <RoleBasedRoute requiredRoles={['Admin', 'IT Staff']}>
                    <LicenseForm />
                  </RoleBasedRoute>
                } 
              />
              <Route 
                path="reports" 
                element={
                  <RoleBasedRoute requiredRoles={['Admin', 'IT Staff']}>
                    <Reports />
                  </RoleBasedRoute>
                } 
              />
              <Route path="profile" element={<Profile />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
      <ToastContainer position="top-right" autoClose={3000} />
    </ThemeProvider>
  );
}

export default App;
