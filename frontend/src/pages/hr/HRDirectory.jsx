import { useState, useEffect, useMemo } from 'react';
import api from '../../api/axios';
import {
  Users, UserPlus, Mail, Search, CheckCircle2, AlertCircle,
  Loader2, RefreshCw, Send, X, Clock, Copy, Check, Key, Trash2
} from 'lucide-react';

const HRDirectory = () => {
  // Tabs
  const [activeTab, setActiveTab] = useState('directory');

  // --- TAB 1: DIRECTORY STATE ---
  const [interns, setInterns] = useState([]);
  const [loadingInterns, setLoadingInterns] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Invite Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successBanner, setSuccessBanner] = useState('');
  const [errorBanner, setErrorBanner] = useState('');
  const [inviteCredentials, setInviteCredentials] = useState(null);
  const [copiedField, setCopiedField] = useState(null);

  // --- TAB 2: ATTENDANCE STATE ---
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [loadingAttendance, setLoadingAttendance] = useState(false);

  useEffect(() => {
    if (activeTab === 'directory') {
      fetchInterns();
    } else {
      fetchAttendance();
    }
  }, [activeTab]);

  const fetchInterns = async () => {
    setLoadingInterns(true);
    try {
      const response = await api.get('/users?role=intern');
      setInterns(response.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingInterns(false);
    }
  };

  const fetchAttendance = async () => {
    setLoadingAttendance(true);
    try {
      const response = await api.get('/attendance/all');
      setAttendanceLogs(response.data?.data || []);
    } catch (err) {
      console.error('Failed to load attendance', err);
    } finally {
      setLoadingAttendance(false);
    }
  };

  const handleDeleteIntern = async (id, internName) => {
    if (!window.confirm(`Are you sure you want to delete ${internName}? This action cannot be undone.`)) {
      return;
    }

    try {
      await api.delete(`/users/${id}`);
      // Remove from UI instantly
      setInterns((prev) => prev.filter((intern) => intern._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete intern');
    }
  };

  const handleCopy = (text, field) => {
    if (!text) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleInviteSubmit = async (e) => {
    e.preventDefault();
    setSuccessBanner('');
    setErrorBanner('');
    setInviteCredentials(null);
    setIsSubmitting(true);

    try {
      const response = await api.post('/users/invite', { name, email, role: 'intern' });
      const creds = response.data?.credentials;
      const isEmailFailed = response.data?.emailFailed ||
        (response.data?.message && /email (dispatch )?failed/i.test(response.data.message));

      if (creds?.tempPassword) {
        setInviteCredentials({
          email: creds.email || email,
          tempPassword: creds.tempPassword,
          emailFailed: isEmailFailed,
        });
      }

      if (!isEmailFailed) {
        setSuccessBanner(`Invitation sent successfully to ${email}.`);
      }

      setName('');
      setEmail('');
      fetchInterns();
    } catch (err) {
      const errorData = err.response?.data;
      const creds = errorData?.credentials;

      if (creds?.tempPassword) {
        setInviteCredentials({
          email: creds.email || email,
          tempPassword: creds.tempPassword,
          emailFailed: true,
        });
        setName('');
        setEmail('');
        fetchInterns();
      } else {
        setErrorBanner(errorData?.message || 'Failed to send invitation.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredInterns = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return interns;
    return interns.filter(i => i.name?.toLowerCase().includes(q) || i.email?.toLowerCase().includes(q));
  }, [interns, searchTerm]);

  const formatTime = (iso) => iso ? new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }) : '--:--';

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header & Tabs */}
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">HR & Team Directory</h1>
          <p className="text-gray-400 mt-1">Manage team access and monitor daily attendance.</p>
        </div>

        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab('directory')}
            className={`px-6 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'directory' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-white'}`}
          >
            <Users size={18} /> Directory & Access
          </button>
          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-6 py-3 font-medium text-sm flex items-center gap-2 border-b-2 transition-colors ${activeTab === 'attendance' ? 'border-primary text-primary' : 'border-transparent text-gray-400 hover:text-white'}`}
          >
            <Clock size={18} /> Attendance Logs
          </button>
        </div>
      </div>

      {/* --- TAB 1: DIRECTORY --- */}
      {activeTab === 'directory' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Invite Form */}
          <div className="bg-surface border border-border rounded-2xl p-6 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><UserPlus size={20} className="text-primary" /> Invite New Intern</h2>

            {successBanner && <div className="p-3 mb-4 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-sm">{successBanner}</div>}
            {errorBanner && <div className="p-3 mb-4 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg text-sm">{errorBanner}</div>}

            {inviteCredentials && (
              <div className="p-4 mb-5 rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-200 shadow-xl animate-in fade-in slide-in-from-top-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <Key className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
                    <div>
                      <h4 className="font-semibold text-white text-sm">
                        {inviteCredentials.emailFailed ? "Account created! Email dispatch failed, but here are the manual credentials:" : "Account created! Here are the generated credentials:"}
                      </h4>
                      <p className="text-xs text-blue-300/80 mt-0.5">Please copy and share these login credentials with the intern directly.</p>
                    </div>
                  </div>
                  <button onClick={() => setInviteCredentials(null)} className="text-blue-400 hover:text-white p-1 rounded-lg">
                    <X size={16} />
                  </button>
                </div>

                <div className="mt-3.5 grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-blue-500/20">
                  <div className="bg-surface/80 border border-blue-500/30 rounded-lg p-2.5 flex items-center justify-between">
                    <div className="min-w-0 pr-2">
                      <span className="block text-[10px] font-semibold uppercase text-blue-300">Email</span>
                      <span className="text-xs font-mono text-white truncate block">{inviteCredentials.email}</span>
                    </div>
                    <button onClick={() => handleCopy(inviteCredentials.email, 'email')} className="p-1.5 text-blue-300 hover:text-white">
                      {copiedField === 'email' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    </button>
                  </div>
                  <div className="bg-surface/80 border border-blue-500/30 rounded-lg p-2.5 flex items-center justify-between">
                    <div className="min-w-0 pr-2">
                      <span className="block text-[10px] font-semibold uppercase text-blue-300">Password</span>
                      <span className="text-xs font-mono text-emerald-400 font-bold truncate block">{inviteCredentials.tempPassword}</span>
                    </div>
                    <button onClick={() => handleCopy(inviteCredentials.tempPassword, 'password')} className="p-1.5 text-blue-300 hover:text-white">
                      {copiedField === 'password' ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <form onSubmit={handleInviteSubmit} className="flex flex-col md:flex-row gap-4 items-end">
              <div className="flex-1 w-full">
                <label className="block text-xs text-gray-400 mb-1">Full Name</label>
                <input type="text" required value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2 bg-background border border-border rounded-lg text-white" placeholder="John Doe" />
              </div>
              <div className="flex-1 w-full">
                <label className="block text-xs text-gray-400 mb-1">Email Address</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2 bg-background border border-border rounded-lg text-white" placeholder="john@jmcreation.com" />
              </div>
              <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 bg-primary text-white font-medium rounded-lg flex items-center gap-2 hover:bg-primary/90 transition-colors">
                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />} Send Invite
              </button>
            </form>
          </div>

          {/* Directory Table */}
          <div className="bg-surface border border-border rounded-2xl shadow-xl overflow-hidden">
            <div className="p-4 border-b border-border flex justify-between items-center bg-background/50">
              <h2 className="font-bold text-white">Registered Interns</h2>
              <input type="text" placeholder="Search interns..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="px-3 py-1.5 text-sm bg-surface border border-border rounded-lg text-white" />
            </div>
            <table className="w-full text-left text-sm">
              <thead className="bg-background text-gray-400 text-xs uppercase border-b border-border">
                <tr>
                  <th className="p-4">Intern</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {loadingInterns ? <tr><td colSpan={4} className="p-4 text-center">Loading...</td></tr> :
                  filteredInterns.map(intern => (
                    <tr key={intern._id} className="hover:bg-white/[0.02]">
                      <td className="p-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">{intern.name.charAt(0)}</div>
                        <div>
                          <div className="font-medium text-white">{intern.name}</div>
                          <div className="text-xs text-gray-500">{intern.email}</div>
                        </div>
                      </td>
                      <td className="p-4"><span className="px-2 py-1 bg-indigo-500/10 text-indigo-400 rounded text-xs capitalize">{intern.role}</span></td>
                      <td className="p-4"><span className="text-emerald-400 text-xs flex items-center gap-1"><div className="w-1.5 h-1.5 bg-emerald-400 rounded-full" /> Active</span></td>

                      {/* NEW ACTIONS COLUMN */}
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleDeleteIntern(intern._id, intern.name)}
                          className="p-2 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          title="Delete Intern"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* --- TAB 2: ATTENDANCE LOGS --- */}
      {activeTab === 'attendance' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="bg-surface border border-border rounded-2xl shadow-xl overflow-hidden">
            <div className="p-4 border-b border-border flex justify-between items-center bg-background/50">
              <h2 className="font-bold text-white flex items-center gap-2"><Clock size={18} className="text-primary" /> Company Attendance</h2>
              <button onClick={fetchAttendance} className="text-gray-400 hover:text-white"><RefreshCw size={16} className={loadingAttendance ? 'animate-spin' : ''} /></button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-background text-gray-400 text-xs uppercase border-b border-border">
                  <tr>
                    <th className="p-4">Date</th>
                    <th className="p-4">Employee</th>
                    <th className="p-4">Total Hours</th>
                    <th className="p-4">Sessions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loadingAttendance ? <tr><td colSpan={4} className="p-4 text-center">Loading logs...</td></tr> :
                    attendanceLogs.length === 0 ? <tr><td colSpan={4} className="p-4 text-center text-gray-500">No records found.</td></tr> :
                      attendanceLogs.map(log => (
                        <tr key={log._id} className="hover:bg-white/[0.02] align-top">
                          <td className="p-4 text-white font-medium">{log.date}</td>
                          <td className="p-4">
                            <div className="text-white">{log.user?.name || 'Unknown'}</div>
                            <div className="text-xs text-gray-500">{log.user?.email}</div>
                          </td>
                          <td className="p-4">
                            <span className="px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-lg font-bold font-mono">
                              {Math.floor((log.totalMinutes || 0) / 60)}h {(log.totalMinutes || 0) % 60}m
                            </span>
                          </td>
                          <td className="p-4 space-y-1">
                            {log.sessions?.map((session, idx) => (
                              <div key={idx} className="text-xs text-gray-400 flex items-center gap-2">
                                <Clock size={12} className="text-gray-500" />
                                <span>Session {idx + 1}:</span>
                                <span className="font-mono text-gray-300">{formatTime(session.punchIn)} - {session.punchOut ? formatTime(session.punchOut) : <span className="text-emerald-400 font-bold">Active</span>}</span>
                              </div>
                            ))}
                          </td>
                        </tr>
                      ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HRDirectory;