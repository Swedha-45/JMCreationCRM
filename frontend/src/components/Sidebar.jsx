import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, MessageSquare, Inbox, CheckSquare, BarChart3,
  Calendar, Phone, Video, Clock, Users, Briefcase, Kanban,
  Ticket, FileText, UserCircle, LogOut, Star, ChevronDown
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();

  // The exact structure from your screenshot
  const menuItems = [
    // 1. TOP PRIORITY: TEAM & HUMAN RESOURCES
    { group: 'TEAM & HUMAN RESOURCES', roles: ['director'] },
    { name: 'Attendance & Time', path: '/attendance', icon: <Clock size={18} />, roles: ['director'] },
    { name: 'HR Directory', path: '/hr', icon: <Users size={18} />, roles: ['director'] },
    { name: 'Internship Hub', path: '/internships', icon: <Briefcase size={18} />, roles: ['director'] },

    // 2. TOP PRIORITY: CLIENT SUPPORT & FINANCE
    { group: 'CLIENT SUPPORT & FINANCE', roles: ['director'] },
    { name: 'Client Portal', path: '/client-portal', icon: <Users size={18} />, roles: ['director'] },
    { name: 'Support Tickets', path: '/tickets', icon: <Ticket size={18} />, roles: ['director'] },
    { name: 'Contracts & E-Sign', path: '/contracts', icon: <FileText size={18} />, roles: ['director'] },

    // 3. CORE WORKSPACE
    { group: 'CORE WORKSPACE', roles: ['director', 'intern'] },
    { name: 'Overview', path: '/overview', icon: <LayoutDashboard size={18} />, roles: ['director', 'intern'] },
    { name: 'Inbox & Alerts', path: '/inbox', icon: <Inbox size={18} />, roles: ['director', 'intern'] },
    { name: 'Personal ToDo', path: '/todo', icon: <CheckSquare size={18} />, roles: ['director', 'intern'] },
    { name: 'Analytics Console', path: '/analytics', icon: <BarChart3 size={18} />, roles: ['director'] },

    // 4. COMMUNICATION HUB
    { group: 'COMMUNICATION HUB', roles: ['director', 'intern'] },
    { name: 'Workspace Calendar', path: '/calendar', icon: <Calendar size={18} />, roles: ['director', 'intern'] },
    { name: 'Messaging Hub', path: '/messaging', icon: <MessageSquare size={18} />, roles: ['director', 'intern'] },
    { name: 'Outbound Calls', path: '/calls', icon: <Phone size={18} />, roles: ['director'] },
    { name: 'Video Meetings', path: '/video', icon: <Video size={18} />, roles: ['director'] },

    // 5. PROJECTS & OPERATIONS (Sprint Kanban removed)
    { group: 'PROJECTS & OPERATIONS', roles: ['director', 'intern'] },
    { name: 'Project Progress', path: '/projects', icon: <LayoutDashboard size={18} />, roles: ['director', 'intern'] },

    // 6. SYSTEM
    { group: 'SYSTEM & ADMINISTRATION', roles: ['director', 'intern'] },
    { name: 'My Profile', path: '/profile', icon: <UserCircle size={18} />, roles: ['director', 'intern'] },
  ];

  return (
    <div className="w-64 h-screen bg-surface border-r border-border flex flex-col fixed left-0 top-0 z-50">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-border">
        <h1 className="text-lg font-bold text-primary tracking-wider flex items-center gap-2">
          <Star size={18} className="text-accent" fill="currentColor" /> JM CREATIONS
        </h1>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
        {menuItems.map((item, index) => {
          if (item.group) {
            if (!item.roles.includes(user?.role)) return null;
            return (
              <div key={index} className="pt-5 pb-2 px-3 flex justify-between items-center">
                <span className="text-[10px] font-bold text-gray-500 tracking-wider">{item.group}</span>
                <ChevronDown size={14} className="text-gray-600" />
              </div>
            );
          }

          if (!item.roles.includes(user?.role)) return null;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm ${isActive
                  ? 'bg-primary/10 text-primary border-l-2 border-primary font-medium'
                  : 'text-gray-400 hover:bg-surface hover:text-white'
                }`
              }
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-border bg-surface">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-sm">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div>
              <p className="text-xs font-medium text-white truncate w-24">{user?.name}</p>
              <p className="text-[10px] text-gray-500 capitalize">{user?.role}</p>
            </div>
          </div>
          <button onClick={logout} className="text-gray-500 hover:text-red-400 transition-colors">
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;