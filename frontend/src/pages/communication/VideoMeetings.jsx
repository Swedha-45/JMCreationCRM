import { Video, Calendar, Clock, Plus, Link as LinkIcon } from 'lucide-react';

const MOCK_MEETINGS = [
  { id: 1, title: 'Weekly CRM Sync', time: 'Today at 3:00 PM', duration: '45 mins', host: 'Abniya' },
  { id: 2, title: 'Waymax Project Kickoff', time: 'Tomorrow at 10:00 AM', duration: '1 hour', host: 'Director' },
  { id: 3, title: 'Design Review', time: 'Friday at 2:30 PM', duration: '30 mins', host: 'Saran' },
];

const VideoMeetings = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Video Meetings</h1>
        <p className="text-gray-400">Start a new meeting or join a scheduled one.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-surface border border-border p-8 rounded-2xl flex flex-col items-center justify-center text-center shadow-lg hover:border-primary/50 transition-colors">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
            <Video size={32} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Start Instant Meeting</h2>
          <p className="text-sm text-gray-400 mb-6">Create a secure room and invite your team.</p>
          <button className="px-6 py-3 bg-primary hover:bg-primary/90 text-white font-medium rounded-xl flex items-center gap-2 w-full justify-center">
            <Plus size={18} /> New Meeting
          </button>
        </div>

        <div className="bg-surface border border-border p-8 rounded-2xl shadow-lg">
          <h2 className="text-xl font-bold text-white mb-4">Join a Meeting</h2>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <LinkIcon className="absolute left-3 top-3 text-gray-500" size={18} />
              <input type="text" placeholder="Paste meeting link..." className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-white focus:border-primary" />
            </div>
            <button className="px-6 py-2.5 bg-surface border border-border text-white font-medium rounded-xl hover:bg-white/5">Join</button>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Calendar size={20} className="text-accent" /> Upcoming Meetings</h3>
        <div className="bg-surface border border-border rounded-2xl overflow-hidden shadow-lg">
          {MOCK_MEETINGS.map((meeting, i) => (
            <div key={meeting.id} className={`p-5 flex justify-between items-center ${i !== 0 ? 'border-t border-border' : ''}`}>
              <div>
                <h4 className="font-semibold text-white">{meeting.title}</h4>
                <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
                  <span className="flex items-center gap-1"><Clock size={12} /> {meeting.time} ({meeting.duration})</span>
                  <span>Host: {meeting.host}</span>
                </div>
              </div>
              <button className="px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-lg text-sm font-semibold hover:bg-primary/20 transition-colors">Join</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VideoMeetings;