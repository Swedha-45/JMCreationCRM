import { Phone, PhoneOutgoing, PhoneIncoming, PhoneMissed, Search } from 'lucide-react';

const MOCK_CALLS = [
  { id: 1, client: 'Waymax Global', contact: 'Rahul Sharma', time: 'Today, 11:30 AM', duration: '12 mins', type: 'outgoing' },
  { id: 2, client: 'A M Jain College', contact: 'Admin Office', time: 'Yesterday, 4:15 PM', duration: '5 mins', type: 'incoming' },
  { id: 3, client: 'The Vibetides', contact: 'Sneha Patel', time: 'Yesterday, 10:00 AM', duration: '0 mins', type: 'missed' },
];

const Calls = () => {
  const getCallIcon = (type) => {
    if (type === 'outgoing') return <PhoneOutgoing size={16} className="text-emerald-400" />;
    if (type === 'incoming') return <PhoneIncoming size={16} className="text-blue-400" />;
    return <PhoneMissed size={16} className="text-red-400" />;
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Outbound Calls</h1>
          <p className="text-gray-400 text-sm mt-1">Call logs and client communication history.</p>
        </div>
        <button className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-white font-medium text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-primary/20 transition-all">
          <Phone size={18} /> Dial Number
        </button>
      </div>

      <div className="bg-surface border border-border rounded-2xl shadow-xl overflow-hidden">
        <div className="p-4 border-b border-border flex justify-between items-center bg-background/50">
          <div className="relative w-72">
            <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
            <input type="text" placeholder="Search call logs..." className="w-full pl-9 pr-3 py-2 bg-surface border border-border rounded-lg text-sm text-white focus:border-primary" />
          </div>
        </div>

        <div className="divide-y divide-border">
          {MOCK_CALLS.map((call) => (
            <div key={call.id} className="p-4 flex justify-between items-center hover:bg-white/[0.02]">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${call.type === 'missed' ? 'bg-red-500/10 border-red-500/20' : 'bg-background border-border'
                  }`}>
                  {getCallIcon(call.type)}
                </div>
                <div>
                  <h4 className="font-semibold text-white">{call.client}</h4>
                  <p className="text-xs text-gray-400">{call.contact} • {call.time}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-gray-400 font-mono">{call.duration}</span>
                <button className="block text-xs text-primary hover:underline mt-1">Call Back</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Calls;