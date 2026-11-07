import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Unauthorized from './pages/Unauthorized';

// Core Workspace
import Overview from './pages/core/Overview';
import InboxAlerts from './pages/core/InboxAlerts';
import PersonalTodo from './pages/core/PersonalTodo';
import Analytics from './pages/core/Analytics';

// Communication Hub
import Calendar from './pages/communication/Calendar';
import Messaging from './pages/communication/Messaging';
import Calls from './pages/communication/Calls';
import VideoMeetings from './pages/communication/VideoMeetings';

// HR & Team
import Attendance from './pages/hr/Attendance';
import HRDirectory from './pages/hr/HRDirectory';
import InternshipHub from './pages/hr/InternshipHub';

// Projects & Ops
import ProjectProgress from './pages/projects/ProjectProgress';


// Support & Finance
import Tickets from './pages/support/Tickets';
import Contracts from './pages/support/Contracts';
import ClientPortal from './pages/support/ClientPortal';

// System
import MyProfile from './pages/system/MyProfile';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/unauthorized" element={<Unauthorized />} />

          {/* Protected Area: Enforces authentication before mounting Layout and Sidebar */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              {/* Director & Intern Routes */}
              <Route element={<ProtectedRoute allowedRoles={['director', 'intern']} />}>
                <Route path="/overview" element={<Overview />} />
                <Route path="/inbox" element={<InboxAlerts />} />
                <Route path="/todo" element={<PersonalTodo />} />
                <Route path="/messaging" element={<Messaging />} />
                <Route path="/calendar" element={<Calendar />} />
                <Route path="/projects" element={<ProjectProgress />} />
                <Route path="/profile" element={<MyProfile />} />
              </Route>

              {/* Director ONLY Routes */}
              <Route element={<ProtectedRoute allowedRoles={['director']} />}>
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/calls" element={<Calls />} />
                <Route path="/video" element={<VideoMeetings />} />
                <Route path="/attendance" element={<Attendance />} />
                <Route path="/hr" element={<HRDirectory />} />
                <Route path="/internships" element={<InternshipHub />} />
                <Route path="/tickets" element={<Tickets />} />
                <Route path="/contracts" element={<Contracts />} />
                <Route path="/client-portal" element={<ClientPortal />} />
              </Route>

              {/* Default Redirect */}
              <Route path="/" element={<Navigate to="/overview" replace />} />
            </Route>
          </Route>

          {/* Catch-all Fallback */}
          <Route path="*" element={<Navigate to="/overview" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
