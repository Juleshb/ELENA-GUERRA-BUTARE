import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { PortalAuthProvider } from './context/PortalAuthContext';
import Layout from './components/Layout';
import AdminLayout from './components/admin/AdminLayout';
import Home from './pages/Home';
import About from './pages/About';
import News from './pages/News';
import NewsDetail from './pages/NewsDetail';
import Events from './pages/Events';
import Staff from './pages/Staff';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';
import MyMessages from './pages/MyMessages';
import Admissions from './pages/Admissions';
import ApplyOnline from './pages/ApplyOnline';
import ApplicationSuccess from './pages/ApplicationSuccess';
import TrackApplication from './pages/TrackApplication';
import PageView from './pages/PageView';
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminSettings from './pages/admin/Settings';
import AdminPages from './pages/admin/Pages';
import AdminPosts from './pages/admin/Posts';
import AdminEvents from './pages/admin/Events';
import AdminStaff from './pages/admin/StaffAdmin';
import AdminGallery from './pages/admin/GalleryAdmin';
import AdminAdmissions from './pages/admin/AdmissionsAdmin';
import AdminApplications from './pages/admin/ApplicationsAdmin';
import AdminContactMessages from './pages/admin/ContactMessagesAdmin';

export default function App() {
  return (
    <AuthProvider>
      <PortalAuthProvider>
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="about" element={<About />} />
            <Route path="news" element={<News />} />
            <Route path="news/:slug" element={<NewsDetail />} />
            <Route path="events" element={<Events />} />
            <Route path="staff" element={<Staff />} />
            <Route path="gallery" element={<Gallery />} />
            <Route path="contact" element={<Contact />} />
            <Route path="my-messages" element={<MyMessages />} />
            <Route path="admissions" element={<Admissions />} />
            <Route path="apply" element={<ApplyOnline />} />
            <Route path="apply/success" element={<ApplicationSuccess />} />
            <Route path="apply/track" element={<TrackApplication />} />
            <Route path="page/:slug" element={<PageView />} />
          </Route>

          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="login" element={<AdminLogin />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="pages" element={<AdminPages />} />
            <Route path="posts" element={<AdminPosts />} />
            <Route path="events" element={<AdminEvents />} />
            <Route path="staff" element={<AdminStaff />} />
            <Route path="gallery" element={<AdminGallery />} />
            <Route path="admissions" element={<AdminAdmissions />} />
            <Route path="applications" element={<AdminApplications />} />
            <Route path="contact-messages" element={<AdminContactMessages />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      </PortalAuthProvider>
    </AuthProvider>
  );
}
