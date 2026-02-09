import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Onboarding } from './pages/Onboarding';
import { Dashboard } from './pages/Dashboard';
import { WorkoutPlan } from './pages/WorkoutPlan';
import { ActiveWorkout } from './pages/ActiveWorkout';
import { Progress } from './pages/Progress';
import { Profile } from './pages/Profile';
import { SettingsPage } from './pages/Settings';
import { StorageService } from './services/storage';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuth = StorageService.isAuthenticated();
  if (!isAuth) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const ProfileCheck = ({ children }: { children: React.ReactNode }) => {
    const profile = StorageService.getProfile();
    if (!profile) {
        return <Navigate to="/onboarding" replace />;
    }
    return <>{children}</>;
};

// AnimatedRoutes wrapper to handle AnimatePresence with useLocation
const AnimatedRoutes = () => {
    const location = useLocation();
    
    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                <Route path="/login" element={<Login />} />
                
                <Route path="/onboarding" element={
                    <ProtectedRoute>
                        <Onboarding />
                    </ProtectedRoute>
                } />
                
                <Route path="/" element={
                    <ProtectedRoute>
                        <ProfileCheck>
                            <Dashboard />
                        </ProfileCheck>
                    </ProtectedRoute>
                } />
                
                <Route path="/plan" element={
                    <ProtectedRoute>
                        <ProfileCheck>
                             <WorkoutPlan />
                        </ProfileCheck>
                    </ProtectedRoute>
                } />
                
                <Route path="/workout/:dayIndex" element={
                    <ProtectedRoute>
                        <ProfileCheck>
                            <ActiveWorkout />
                        </ProfileCheck>
                    </ProtectedRoute>
                } />
                
                <Route path="/progress" element={
                    <ProtectedRoute>
                        <ProfileCheck>
                            <Progress />
                        </ProfileCheck>
                    </ProtectedRoute>
                } />

                <Route path="/profile" element={
                    <ProtectedRoute>
                        <ProfileCheck>
                            <Profile />
                        </ProfileCheck>
                    </ProtectedRoute>
                } />

                <Route path="/settings" element={
                    <ProtectedRoute>
                        <ProfileCheck>
                            <SettingsPage />
                        </ProfileCheck>
                    </ProtectedRoute>
                } />

                {/* Fallback Route */}
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </AnimatePresence>
    );
};

const App: React.FC = () => {
  useEffect(() => {
      // Initialize theme preference
      const settings = StorageService.getSettings();
      StorageService.saveSettings(settings);
  }, []);

  return (
    <HashRouter>
      <Layout>
        <AnimatedRoutes />
      </Layout>
    </HashRouter>
  );
};

export default App;