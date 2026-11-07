import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      {/* Main Content Area (Offset by sidebar width) */}
      <main className="ml-64 p-8 min-h-screen">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;