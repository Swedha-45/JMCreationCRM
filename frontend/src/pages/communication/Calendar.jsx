import { useState, useEffect, useMemo } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/react/daygrid';
import timeGridPlugin from '@fullcalendar/react/timegrid';
import interactionPlugin from '@fullcalendar/react/interaction';
import themePlugin from '@fullcalendar/react/themes/classic';

// CSS for v7
import '@fullcalendar/react/skeleton.css';
import '@fullcalendar/react/themes/classic/theme.css';
import '@fullcalendar/react/themes/classic/palette.css';

import api from '../../api/axios';
import { Calendar as CalendarIcon, Plus, X, Users, Clock, AlertCircle, Loader2 } from 'lucide-react';
const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [interns, setInterns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    reminderMins: 10,
    attendees: []
  });

  // Fetch all data on mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoading(true);
    setError('');
    try {
      const [eventsRes, tasksRes, attendanceRes, internsRes] = await Promise.all([
        api.get('/events').catch(() => ({ data: { data: [] } })),
        api.get('/tasks').catch(() => ({ data: { data: [] } })),
        api.get('/attendance/all').catch(() => ({ data: { data: [] } })),
        api.get('/users?role=intern').catch(() => ({ data: { data: [] } }))
      ]);

      setEvents(eventsRes.data.data || []);
      setTasks(tasksRes.data.data || []);
      setAttendance(attendanceRes.data.data || []);
      setInterns(internsRes.data.data || []);
    } catch (err) {
      setError('Failed to load calendar data.');
    } finally {
      setLoading(false);
    }
  };

  // Merge all data into FullCalendar format
  const calendarEvents = useMemo(() => {
    const formatted = [];

    // 1. Manual Events (Teal)
    events.forEach((ev) => {
      formatted.push({
        id: `ev-${ev._id}`,
        title: ev.title,
        start: `${ev.date.split('T')[0]}T${ev.time}:00`,
        backgroundColor: '#14B8A6',
        borderColor: '#0d9488',
        extendedProps: { type: 'Meeting', description: ev.description, attendees: ev.attendees }
      });
    });

    // 2. Tasks (Purple)
    tasks.forEach((task) => {
      if (task.dueDate) {
        formatted.push({
          id: `task-${task._id}`,
          title: `Task: ${task.title}`,
          start: task.dueDate,
          allDay: true,
          backgroundColor: '#6366F1',
          borderColor: '#4f46e5',
          extendedProps: { type: 'Task Deadline' }
        });
      }
    });

    // 3. Attendance (Green)
    attendance.forEach((att) => {
      if (att.date) {
        formatted.push({
          id: `att-${att._id}`,
          title: `Attendance: ${att.user?.name || 'User'}`,
          start: att.date,
          allDay: true,
          backgroundColor: '#10B981',
          borderColor: '#059669',
          extendedProps: { type: 'Attendance' }
        });
      }
    });

    return formatted;
  }, [events, tasks, attendance]);

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Combine date and time into a single ISO string for the backend
      const dateTimeString = `${formData.date}T${formData.time}:00.000Z`;

      await api.post('/events', {
        ...formData,
        date: dateTimeString
      });

      setIsModalOpen(false);
      setFormData({ title: '', description: '', date: '', time: '', reminderMins: 10, attendees: [] });
      fetchAllData(); // Refresh calendar
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create event.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAttendeeToggle = (internId) => {
    setFormData(prev => ({
      ...prev,
      attendees: prev.attendees.includes(internId)
        ? prev.attendees.filter(id => id !== internId)
        : [...prev.attendees, internId]
    }));
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <CalendarIcon className="text-primary" size={28} /> Workspace Calendar
          </h1>
          <p className="text-sm text-gray-400 mt-1">Unified view of Meetings, Task Deadlines, and Attendance.</p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-medium bg-surface p-3 rounded-xl border border-border">
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#14B8A6]"></span> Meetings</div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#6366F1]"></span> Tasks</div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-[#10B981]"></span> Attendance</div>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-white font-medium text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-primary/20 transition-all"
        >
          <Plus size={18} /> Create Event
        </button>
      </div>

      {error && <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center gap-2"><AlertCircle size={18} /> {error}</div>}

      {/* Calendar Container */}
      <div className="bg-surface border border-border rounded-2xl p-6 shadow-xl calendar-dark-theme">
        {loading ? (
          <div className="h-96 flex items-center justify-center text-primary">
            <Loader2 className="animate-spin" size={32} />
          </div>
        ) : (
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin, themePlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            events={calendarEvents}
            editable={true}
            selectable={true}
            height="auto"
            eventClick={(info) => {
              alert(`Type: ${info.event.extendedProps.type}\nTitle: ${info.event.title}\nTime: ${info.event.start}`);
            }}
          />
        )}
      </div>

      {/* Create Event Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-surface border border-border w-full max-w-lg rounded-2xl shadow-2xl my-auto">
            <div className="flex justify-between items-center p-5 border-b border-border">
              <h2 className="text-lg font-bold text-white">Create New Event</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white"><X size={20} /></button>
            </div>

            <form onSubmit={handleCreateEvent} className="p-5 space-y-4">
              <div>
                <label className="block text-xs text-gray-400 mb-1">Event Title</label>
                <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-white" placeholder="Client Meeting" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Date</label>
                  <input type="date" required value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-white" />
                </div>
                <div>
                  <label className="block text-xs text-gray-400 mb-1">Time</label>
                  <input type="time" required value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-white" />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Description (Optional)</label>
                <textarea rows="2" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-white" placeholder="Agenda..." />
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-1">Reminder Alarm</label>
                <select value={formData.reminderMins} onChange={e => setFormData({ ...formData, reminderMins: Number(e.target.value) })} className="w-full px-3 py-2 bg-background border border-border rounded-lg text-white">
                  <option value={10}>10 Minutes Before (Email + WhatsApp)</option>
                  <option value={20}>20 Minutes Before (Email + WhatsApp)</option>
                  <option value={60}>1 Hour Before (Email + WhatsApp)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs text-gray-400 mb-2">Invite Attendees</label>
                <div className="flex flex-wrap gap-2">
                  {interns.map(intern => (
                    <button
                      key={intern._id}
                      type="button"
                      onClick={() => handleAttendeeToggle(intern._id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${formData.attendees.includes(intern._id)
                        ? 'bg-primary/20 border-primary text-primary'
                        : 'bg-background border-border text-gray-400 hover:text-white'
                        }`}
                    >
                      {intern.name}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-border flex justify-end gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm text-gray-400 hover:text-white">Cancel</button>
                <button type="submit" disabled={isSubmitting} className="px-5 py-2 bg-primary text-white font-medium text-sm rounded-lg flex items-center gap-2">
                  {isSubmitting ? <Loader2 className="animate-spin" size={16} /> : 'Schedule Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;