import { FileText, Download, CheckCircle2, Clock, Search, Plus } from 'lucide-react';

const MOCK_CONTRACTS = [
  { id: 'CTR-001', client: 'Waymax Global', title: 'Website Redesign SLA', date: 'Oct 12, 2026', status: 'Signed' },
  { id: 'CTR-002', client: 'A M Jain College', title: 'Event Management Agreement', date: 'Nov 01, 2026', status: 'Pending' },
  { id: 'CTR-003', client: 'The Vibetides', title: 'Monthly Retainer Contract', date: 'Sep 15, 2026', status: 'Signed' },
];

const Contracts = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Contracts & E-Sign</h1>
          <p className="text-gray-400 text-sm mt-1">Manage client agreements and digital signatures.</p>
        </div>
        <button className="px-5 py-2.5 bg-surface border border-border text-white font-medium text-sm rounded-xl flex items-center gap-2 hover:bg-white/5 transition-all">
          <Plus size={18} /> New Contract
        </button>
      </div>

      <div className="bg-surface border border-border rounded-2xl shadow-xl overflow-hidden">
        <div className="p-4 border-b border-border flex justify-between items-center bg-background/50">
          <div className="relative w-72">
            <Search className="absolute left-3 top-2.5 text-gray-500" size={16} />
            <input type="text" placeholder="Search contracts..." className="w-full pl-9 pr-3 py-2 bg-surface border border-border rounded-lg text-sm text-white focus:border-primary" />
          </div>
        </div>

        <table className="w-full text-left text-sm">
          <thead className="bg-background text-gray-400 text-xs uppercase border-b border-border">
            <tr>
              <th className="p-4 font-semibold">Contract ID</th>
              <th className="p-4 font-semibold">Title</th>
              <th className="p-4 font-semibold">Client</th>
              <th className="p-4 font-semibold">Date</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {MOCK_CONTRACTS.map((contract) => (
              <tr key={contract.id} className="hover:bg-white/[0.02]">
                <td className="p-4 font-mono text-primary">{contract.id}</td>
                <td className="p-4 font-medium text-white flex items-center gap-2"><FileText size={16} className="text-gray-400" /> {contract.title}</td>
                <td className="p-4 text-gray-300">{contract.client}</td>
                <td className="p-4 text-gray-400">{contract.date}</td>
                <td className="p-4">
                  {contract.status === 'Signed' ? (
                    <span className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold"><CheckCircle2 size={14} /> Signed</span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-amber-400 text-xs font-semibold"><Clock size={14} /> Pending</span>
                  )}
                </td>
                <td className="p-4 text-right">
                  <button className="p-2 text-gray-400 hover:text-white bg-background border border-border rounded-lg transition-colors">
                    <Download size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Contracts;