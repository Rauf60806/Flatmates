import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { AppLayout } from './components/layout/AppLayout';
import { ProtectedRoute, AdminRoute } from './components/layout/RouteGuards';
import { Login } from './pages/Login';
import { Home } from './pages/Home';
import { AddItem } from './pages/AddItem';
import { Flatmates } from './pages/Flatmates';
import { Stats } from './pages/Stats';
import { Admin } from './pages/Admin';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />

          {/* Protected routes wrapped in app layout */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route index path="/" element={<Home />} />
            <Route path="/add" element={<AddItem />} />
            <Route path="/flatmates" element={<Flatmates />} />
            <Route path="/stats" element={<Stats />} />
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <Admin />
                </AdminRoute>
              }
            />
          </Route>

          {/* Catch-all fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </ThemeProvider>
  );
};
