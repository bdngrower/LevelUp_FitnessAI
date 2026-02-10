import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
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
import { Landing } from './pages/Landing';
import { StorageService } from './services/storage';
import { DbService } from './services/db';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoadingScreen } from './components/LoadingScreen';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { session, loading } = useAuth();

    if (loading) return <LoadingScreen />;

    if (!session) {
        return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
};

const ProfileCheck = ({ children }: { children: React.ReactNode }) => {
    const [loading, setLoading] = useState(true);
    const [authorized, setAuthorized] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const check = async () => {
            const profile = await DbService.getProfile();
            if (!profile) {
                navigate('/onboarding', { replace: true });
            } else {
                setAuthorized(true);
            }
            setLoading(false);
        };
        check();
    }, [navigate]);

    if (loading) return <LoadingScreen />;

    return authorized ? <>{children}</> : null;
};

// Home route: shows Landing for unauthenticated, redirects to Dashboard for authenticated
const HomeRoute = () => {
    const { session, loading } = useAuth();
    if (loading) return <LoadingScreen />;
    if (session) return <Navigate to="/dashboard" replace />;
    return <Landing />;
};

// AnimatedRoutes wrapper to handle AnimatePresence with useLocation
const AnimatedRoutes = () => {
    const location = useLocation();

    return (
        <AnimatePresence mode="wait">
            {/* @ts-ignore - Key is required for AnimatePresence to work with Routes */}
            <Routes location={location} key={location.pathname}>
                <Route path="/login" element={<Login />} />

                <Route path="/onboarding" element={
                    <ProtectedRoute>
                        <Onboarding />
                    </ProtectedRoute>
                } />

                <Route path="/" element={
                    <HomeRoute />
                } />

                <Route path="/dashboard" element={
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
            <AuthProvider>
                <Layout>
                    <AnimatedRoutes />
                </Layout>
            </AuthProvider>
        </HashRouter>
    );
};

export default App;