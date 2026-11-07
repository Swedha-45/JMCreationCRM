import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { User, Shield, Key, Save, Loader2, CheckCircle2, AlertCircle, Phone } from 'lucide-react';

const MyProfile = () => {
  const { user } = useAuth();

  // Profile State
  const [name, setName] = useState(user?.name || '');
  const [whatsappNumber, setWhatsappNumber] = useState(user?.whatsappNumber || '');

  // Password State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // UI State
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    setMessage({ type: '', text: '' });

    try {
      // FIXED: Pointing to /auth/profile
      const res = await api.put('/auth/profile', { name, whatsappNumber });

      // Update local storage so sidebar reflects the new name
      const updatedUser = { ...user, name: res.data.data.name, whatsappNumber: res.data.data.whatsappNumber };
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setMessage({ type: 'success', text: 'Profile updated successfully!' });

      // Force a reload to update the sidebar name instantly
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update profile' });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setIsChangingPassword(true);
    setMessage({ type: '', text: '' });

    try {
      // FIXED: Pointing to /auth/change-password
      await api.put('/auth/change-password', { currentPassword, newPassword });
      setMessage({ type: 'success', text: 'Password changed successfully!' });
      setCurrentPassword('');
      setNewPassword('');
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to change password' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-bold text-white">My Profile</h1>
        <p className="text-gray-400 mt-1">Manage your personal information and security settings.</p>
      </div>

      {message.text && (
        <div className={`p-4 rounded-xl flex items-center gap-2 ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
          {message.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* PROFILE DETAILS */}
        <div className="bg-surface border border-border p-6 rounded-2xl shadow-lg">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <User className="text-primary" size={20} /> Profile Details
          </h2>

          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold text-2xl">
              {name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-white font-medium">{user?.email}</p>
              <span className="px-2 py-1 bg-indigo-500/10 text-indigo-400 rounded text-xs uppercase font-bold mt-1 inline-block">
                {user?.role}
              </span>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-gray-500" size={18} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-white focus:border-primary"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">WhatsApp Number (For Alerts)</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 text-gray-500" size={18} />
                <input
                  type="text"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="+91 9876543210"
                  className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-white focus:border-primary"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2.5 rounded-xl flex justify-center items-center gap-2 mt-2 transition-colors disabled:opacity-50"
            >
              {isUpdatingProfile ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Save Changes</>}
            </button>
          </form>
        </div>

        {/* SECURITY / PASSWORD */}
        <div className="bg-surface border border-border p-6 rounded-2xl shadow-lg">
          <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <Shield className="text-emerald-400" size={20} /> Security
          </h2>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1">Current Password</label>
              <div className="relative">
                <Key className="absolute left-3 top-3 text-gray-500" size={18} />
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-white focus:border-primary"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-400 mb-1">New Password</label>
              <div className="relative">
                <Key className="absolute left-3 top-3 text-gray-500" size={18} />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-white focus:border-primary"
                  required
                  minLength="6"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isChangingPassword}
              className="w-full bg-surface hover:bg-white/5 border border-border text-white font-medium py-2.5 rounded-xl flex justify-center items-center gap-2 mt-2 transition-colors disabled:opacity-50"
            >
              {isChangingPassword ? <Loader2 className="animate-spin" size={18} /> : <><Key size={18} /> Update Password</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MyProfile;