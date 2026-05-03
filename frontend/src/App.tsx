import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import Dashboard from './pages/Dashboard';
import PaperPage from './pages/PaperPage';
import LevelSelector from './pages/LevelSelector';
import SubjectsPage from './pages/SubjectsPage';
import SubjectPapersPage from './pages/SubjectPapersPage';
import CommunityPage from './pages/CommunityPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import { AuthProvider } from './context/AuthContext';

import { ProtectedRoute, GuestRoute } from './components/Auth/AuthRoutes';

// Admin Imports
import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminSubjects from './pages/admin/AdminSubjects';
import AdminPapers from './pages/admin/AdminPapers';

const queryClient = new QueryClient();

// Public Layout Wrapper
const PublicLayout = () => (
  <div className="min-h-screen bg-background flex flex-col">
    <Navbar />
    <main className="flex-1 flex flex-col">
      <Outlet />
    </main>
    <Footer />
  </div>
);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Admin Routes - Protected with AdminLayout (role check is inside) */}
            <Route path="/admin_dashboard" element={<ProtectedRoute roles={['admin']}><AdminLayout /></ProtectedRoute>}>
              <Route index element={<AdminDashboard />} />
              <Route path="subjects" element={<AdminSubjects />} />
          <Route path="subjects/:subjectId/papers" element={<AdminPapers />} />
            </Route>

            {/* Main Application Layout */}
            <Route element={<PublicLayout />}>
              {/* Publicly Accessible Pages */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />

              {/* Guest-only Pages (Login/Register) */}
              <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
              <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />

              {/* Protected Student/User Pages */}
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/levels" element={<ProtectedRoute><LevelSelector /></ProtectedRoute>} />
              <Route path="/subjects" element={<ProtectedRoute><SubjectsPage /></ProtectedRoute>} />
              <Route path="/subjects/:id/papers" element={<ProtectedRoute><SubjectPapersPage /></ProtectedRoute>} />
              <Route path="/paper/:id" element={<ProtectedRoute><PaperPage /></ProtectedRoute>} />
              <Route path="/community" element={<ProtectedRoute><CommunityPage /></ProtectedRoute>} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
