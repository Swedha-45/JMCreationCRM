import { useState } from 'react';
import { Plus, AlertCircle, Clock, CheckCircle2, MoreHorizontal } from 'lucide-react';

const INITIAL_TICKETS = {
  open: [
    { id: 'T-101', title: 'Login page crashes on mobile', priority: 'High', client: 'Waymax Global', date: 'Today' },
    { id: 'T-102', title: 'Invoice PDF missing logo', priority: 'Medium', client: 'A M Jain College', date: 'Yesterday' },
  ],
  inProgress: [
    { id: 'T-103', title: 'WhatsApp API integration failing', priority: 'High', client: 'Internal', date: '2 days ago' },
  ],
  resolved: [
    { id: 'T-104', title: 'Typo on pricing page', priority: 'Low', client: 'The Vibetides', date: '3 days ago' },
  ]
};

const Tickets = () => {
  const [tickets, setTickets] = useState(INITIAL_TICKETS);

  const getPriorityColor = (priority) => {
    if (priority === 'High') return 'text-red-400 bg-red-400/10 border-red-400/20';
    if (priority === 'Medium') return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
    return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
  };

  return (
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Support Tickets</h1>
          <p className="text-gray-400 text-sm mt-1">Manage internal QA and client support requests.</p>
        </div>
        <button className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-white font-medium text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-primary/20 transition-all">
          <Plus size={18} /> Create Ticket
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-1 overflow-hidden">
        {/* Columns */}
        {['open', 'inProgress', 'resolved'].map((status) => (
          <div key={status} className="bg-surface border border-border rounded-2xl flex flex-col overflow-hidden">
            <div className="p-4 border-b border-border bg-background/50 flex justify-between items-center">
              <h3 className="font-bold text-white capitalize flex items-center gap-2">
                {status === 'open' && <AlertCircle size={16} className="text-red-400" />}
                {status === 'inProgress' && <Clock size={16} className="text-amber-400" />}
                {status === 'resolved' && <CheckCircle2 size={16} className="text-emerald-400" />}
                {status === 'inProgress' ? 'In Progress' : status}
              </h3>
              <span className="px-2 py-0.5 bg-background rounded-full text-xs font-bold text-gray-400">
                {tickets[status].length}
              </span>
            </div>

            <div className="p-4 space-y-3 overflow-y-auto flex-1">
              {tickets[status].map((ticket) => (
                <div key={ticket.id} className="bg-background border border-border p-4 rounded-xl hover:border-gray-600 cursor-grab transition-colors">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-mono text-gray-500">{ticket.id}</span>
                    <button className="text-gray-500 hover:text-white"><MoreHorizontal size={16} /></button>
                  </div>
                  <h4 className="text-sm font-semibold text-white mb-3">{ticket.title}</h4>
                  <div className="flex justify-between items-center text-xs">
                    <span className={`px-2 py-1 rounded border font-medium ${getPriorityColor(ticket.priority)}`}>
                      {ticket.priority}
                    </span>
                    <span className="text-gray-400">{ticket.client}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tickets;