import { useState, useEffect } from 'react';
import api from '../../api/axios';
import {
  Clock, Calendar, LogIn, LogOut, CheckCircle2, AlertCircle,
  CalendarPlus, History, Timer, X, RefreshCw, Loader2,
  Coffee, Trash2, Send
} from 'lucide-react';

const Attendance = () => {
  const [todayRecord, setTodayRecord] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [elapsedTime, setElapsedTime] = useState('00:00:00');
  const [currentClock, setCurrentClock] = useState('');

  // Leave Modal State
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [leaveForm, setLeaveForm] = useState({ fromDate: '', toDate: '', reason: '' });
  const [isLeaveSubmitting, setIsLeaveSubmitting] = useState(false);

  // Live clock
  useEffect(() => {
    const updateLiveClock = () => {
      setCurrentClock(new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }));
    };
    updateLiveClock();
    const interval = setInterval(updateLiveClock, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      const todayRes = await api.get('/attendance/today');
      setTodayRecord(todayRes.data.data);

      const historyRes = await api.get('/attendance/my');
      setHistory(historyRes.data.data || []);
    } catch (err) {
      setError('Failed to fetch attendance data.');
    } finally {
      setLoading(false);
    }
  };

  // Live timer for active session
  useEffect(() => {
    let timer;
    const activeSession = todayRecord?.sessions?.find(s => !s.punchOut);

    if (activeSession) {
      const updateTimer = () => {
        const start = new Date(activeSession.punchIn).getTime();
        const now = Date.now();
        const diffSecs = Math.max(0, Math.floor((now - start) / 1000));
        const hours = Math.floor(diffSecs / 3600);
        const minutes = Math.floor((diffSecs % 3600) / 60);
        const seconds = diffSecs % 60;
        setElapsedTime(`${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`);
      };
      updateTimer();
      timer = setInterval(updateTimer, 1000);
    } else {
      setElapsedTime('00:00:00');
    }
    return () => clearInterval(timer);
  }, [todayRecord]);

  const handlePunch = async (type) => {
    setActionLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const endpoint = type === 'in' ? '/attendance/punch-in' : '/attendance/punch-out';
      const response = await api.post(endpoint);
      setTodayRecord(response.data.data);
      await fetchAttendance();
      setSuccessMsg(type === 'in' ? 'Successfully punched in!' : 'Successfully punched out!');
    } catch (err) {
      setError(err.response?.data?.message || `Failed to punch ${type}.`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteRecord = async () => {
    if (!window.confirm("Are you sure you want to delete today's attendance record? This will reset your timer.")) return;

    setActionLoading(true);
    try {
      // Note: You will need to create this DELETE route in the backend
      await api.delete('/attendance/today');
      setTodayRecord(null);
      fetchAttendance();
      setSuccessMsg('Attendance record reset successfully.');
    } catch (err) {
      setError('Failed to delete record.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleLeaveSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // LOGIC CHECK: End date cannot be before Start date
    if (new Date(leaveForm.toDate) < new Date(leaveForm.fromDate)) {
      return setError("End date cannot be before the start date.");
    }

    setIsLeaveSubmitting(true);
    try {
      // Note: You will need to build the backend route to save this to the database
      // await api.post('/leaves', leaveForm); 

      // Simulating success for now
      setTimeout(() => {
        setIsLeaveSubmitting(false);
        setIsLeaveModalOpen(false);
        setLeaveForm({ fromDate: '', toDate: '', reason: '' });
        setSuccessMsg('Leave application submitted successfully for approval.');
      }, 1000);
    } catch (err) {
      setError('Failed to submit leave application.');
      setIsLeaveSubmitting(false);
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return '--:--';
    return new Date(isoString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  };

  const calculateDuration = (inTime, outTime) => {
    if (!inTime || !outTime) return '--';
    const diffSecs = Math.max(0, Math.floor((new Date(outTime) - new Date(inTime)) / 1000));
    const hrs = Math.floor(diffSecs / 3600);
    const mins = Math.floor((diffSecs % 3600) / 60);
    return `${hrs}h ${mins}m`;
  };

  const activeSession = todayRecord?.sessions?.find(s => !s.punchOut);
  const isPunchedIn = Boolean(activeSession);
  const totalMinutes = todayRecord?.totalMinutes || 0;

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-12">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Clock className="text-primary" size={32} /> Attendance & Time Tracker
          </h1>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchAttendance} className="p-2.5 bg-surface border border-border rounded-xl text-gray-400 hover:text-white">
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => setIsLeaveModalOpen(true)} className="px-4 py-2 bg-surface border border-border rounded-xl text-white text-sm font-semibold flex items-center gap-2 hover:bg-white/5">
            <CalendarPlus size={18} className="text-primary" /> Apply for Leave
          </button>
        </div>
      </div>

      {error && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex justify-between items-center"><span>{error}</span><X size={16} className="cursor-pointer" onClick={() => setError('')} /></div>}
      {successMsg && <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex justify-between items-center"><span>{successMsg}</span><X size={16} className="cursor-pointer" onClick={() => setSuccessMsg('')} /></div>}

      {/* Main Punch Card */}
      <div className="bg-surface border border-border rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">

          <div className="space-y-4 w-full lg:w-auto">
            <div className="text-sm text-gray-400 flex items-center gap-2">
              <Calendar size={16} /> {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })}
            </div>
            <h2 className="text-5xl font-extrabold text-white font-mono">{currentClock}</h2>

            <div className="flex items-center gap-4 pt-2">
              <div className="bg-background px-4 py-2 rounded-xl border border-border flex-1 text-center">
                <span className="text-xs text-gray-500 block">Total Worked</span>
                <span className="text-lg font-bold text-primary">{Math.floor(totalMinutes / 60)}h {totalMinutes % 60}m</span>
              </div>
              <div className="bg-background px-4 py-2 rounded-xl border border-border flex-1 text-center">
                <span className="text-xs text-gray-500 block">Sessions</span>
                <span className="text-lg font-bold text-white">{todayRecord?.sessions?.length || 0}</span>
              </div>
              {/* RESET BUTTON */}
              {todayRecord && (
                <button onClick={handleDeleteRecord} title="Reset Today's Record" className="bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 p-2 rounded-xl text-red-400 transition-colors">
                  <Trash2 size={20} />
                </button>
              )}
            </div>
          </div>

          <div className="w-full lg:w-96 bg-background/50 border border-border/50 p-6 rounded-2xl">
            {isPunchedIn ? (
              <div className="text-center space-y-4">
                <div>
                  <p className="text-xs text-emerald-400 font-medium mb-1 animate-pulse">● Active Session</p>
                  <div className="text-4xl font-mono font-bold text-white">{elapsedTime}</div>
                </div>
                <button onClick={() => handlePunch('out')} disabled={actionLoading} className="w-full py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-xl flex justify-center items-center gap-2">
                  {actionLoading ? <Loader2 className="animate-spin" /> : <><LogOut size={18} /> Punch Out (Take Break)</>}
                </button>
              </div>
            ) : (
              <div className="text-center space-y-4">
                <p className="text-sm text-gray-400">Currently Punched Out</p>
                <button onClick={() => handlePunch('in')} disabled={actionLoading} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl flex justify-center items-center gap-2">
                  {actionLoading ? <Loader2 className="animate-spin" /> : <><LogIn size={18} /> Punch In (Resume)</>}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Today's Sessions */}
      {todayRecord?.sessions?.length > 0 && (
        <div className="bg-surface border border-border rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Coffee size={20} className="text-accent" /> Today's Breakdown</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {todayRecord.sessions.map((session, i) => (
              <div key={i} className="bg-background border border-border p-4 rounded-xl flex justify-between items-center">
                <div>
                  <p className="text-xs text-gray-500 font-medium">Session {i + 1}</p>
                  <p className="text-sm text-white font-mono">{formatTime(session.punchIn)} - {session.punchOut ? formatTime(session.punchOut) : 'Active'}</p>
                </div>
                {session.punchOut && <span className="text-xs text-primary font-bold">{calculateDuration(session.punchIn, session.punchOut)}</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* History Table */}
      <div className="bg-surface border border-border rounded-2xl shadow-xl overflow-hidden">
        <div className="p-5 border-b border-border flex items-center gap-2">
          <History className="text-primary" />
          <h2 className="text-lg font-bold text-white">Attendance History</h2>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-background text-gray-400 text-xs uppercase border-b border-border">
            <tr>
              <th className="p-4">Date</th>
              <th className="p-4">Total Hours</th>
              <th className="p-4">Sessions</th>
              <th className="p-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {history.map(record => (
              <tr key={record._id} className="hover:bg-white/[0.02]">
                <td className="p-4 text-white font-medium">{record.date}</td>
                <td className="p-4 font-mono text-primary font-bold">{Math.floor((record.totalMinutes || 0) / 60)}h {(record.totalMinutes || 0) % 60}m</td>
                <td className="p-4 text-gray-400 text-xs">{record.sessions?.length || 0} sessions</td>
                <td className="p-4 text-right"><span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Present</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Leave Modal */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4">
          <div className="bg-surface border border-border w-full max-w-lg rounded-2xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2"><CalendarPlus size={20} className="text-primary" /> Apply for Leave</h2>
              <button onClick={() => setIsLeaveModalOpen(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>

            <form onSubmit={handleLeaveSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">From Date</label>
                  <input type="date" required value={leaveForm.fromDate} onChange={e => setLeaveForm({ ...leaveForm, fromDate: e.target.value })} className="w-full p-2 bg-background border border-border rounded-lg text-white" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">To Date</label>
                  <input type="date" required value={leaveForm.toDate} onChange={e => setLeaveForm({ ...leaveForm, toDate: e.target.value })} className="w-full p-2 bg-background border border-border rounded-lg text-white" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-400 mb-1">Reason</label>
                <textarea required rows={3} value={leaveForm.reason} onChange={e => setLeaveForm({ ...leaveForm, reason: e.target.value })} className="w-full p-2 bg-background border border-border rounded-lg text-white" placeholder="Reason for leave..." />
              </div>
              <button type="submit" disabled={isLeaveSubmitting} className="w-full py-2.5 bg-primary text-white font-bold rounded-lg flex justify-center items-center gap-2">
                {isLeaveSubmitting ? <Loader2 className="animate-spin" /> : <><Send size={18} /> Submit Application</>}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;