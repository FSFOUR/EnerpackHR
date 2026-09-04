import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Employees } from './pages/Employees';
import { EmployeeDetail } from './pages/EmployeeDetail';
import { Contracts } from './pages/Contracts';
import { Recruitment } from './pages/Recruitment';
import { Onboarding } from './pages/Onboarding';
import { Policies } from './pages/Policies';
import { Documents } from './pages/Documents';
import { ManagementDocuments } from './pages/ManagementDocuments';
import { FolderDocuments } from './pages/FolderDocuments';
import { Attendance } from './pages/Attendance';
import { Payroll } from './pages/Payroll';
import { Leave } from './pages/Leave';
import { Expenses } from './pages/Expenses';
import { Performance } from './pages/Performance';
import { Training } from './pages/Training';
import { Assets } from './pages/Assets';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';
import { UserManagement } from './pages/UserManagement';

import { VehicleTrackerLayout } from './pages/fleet/VehicleTrackerLayout';
import { FleetDashboard } from './pages/fleet/FleetDashboard';
import { Vehicles } from './pages/fleet/Vehicles';
import { Drivers } from './pages/fleet/Drivers';
import { Trips } from './pages/fleet/Trips';
import { Fuel } from './pages/fleet/Fuel';
import { Expenses as FleetExpenses } from './pages/fleet/Expenses';
import { Maintenance } from './pages/fleet/Maintenance';
import { Documents as FleetDocuments } from './pages/fleet/Documents';
import { Activities } from './pages/fleet/Activities';
import { Incidents } from './pages/fleet/Incidents';
import { Reports as FleetReports } from './pages/fleet/Reports';
import { Settings as FleetSettings } from './pages/fleet/Settings';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="employees" element={<Employees />} />
            <Route path="employees/:id" element={<EmployeeDetail />} />
            <Route path="recruitment" element={<Recruitment />} />
            <Route path="onboarding" element={<Onboarding />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="leave" element={<Leave />} />
            <Route path="payroll" element={<Payroll />} />
            <Route path="expenses" element={<Expenses />} />
            <Route path="documents" element={<Documents />} />
            <Route path="documents/management" element={<FolderDocuments />} />
            <Route path="documents/folder/:folderSlug" element={<FolderDocuments />} />
            <Route path="contracts" element={<Contracts />} />
            <Route path="policies" element={<Policies />} />
            <Route path="performance" element={<Performance />} />
            <Route path="training" element={<Training />} />
            <Route path="assets" element={<Assets />} />
            <Route path="reports" element={<Reports />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="settings" element={<Settings />} />
            
            <Route path="fleet" element={<VehicleTrackerLayout />}>
              <Route index element={<FleetDashboard />} />
              <Route path="vehicles" element={<Vehicles />} />
              <Route path="drivers" element={<Drivers />} />
              <Route path="trips" element={<Trips />} />
              <Route path="fuel" element={<Fuel />} />
              <Route path="expenses" element={<FleetExpenses />} />
              <Route path="maintenance" element={<Maintenance />} />
              <Route path="documents" element={<FleetDocuments />} />
              <Route path="activities" element={<Activities />} />
              <Route path="incidents" element={<Incidents />} />
              <Route path="reports" element={<FleetReports />} />
              <Route path="settings" element={<FleetSettings />} />
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

