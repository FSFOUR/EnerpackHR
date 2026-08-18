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
import { Attendance } from './pages/Attendance';
import { Payroll } from './pages/Payroll';
import { Leave } from './pages/Leave';
import { Expenses } from './pages/Expenses';
import { Performance } from './pages/Performance';
import { Training } from './pages/Training';
import { Assets } from './pages/Assets';
import { Reports } from './pages/Reports';
import { Settings } from './pages/Settings';

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
            <Route path="contracts" element={<Contracts />} />
            <Route path="policies" element={<Policies />} />
            <Route path="performance" element={<Performance />} />
            <Route path="training" element={<Training />} />
            <Route path="assets" element={<Assets />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

