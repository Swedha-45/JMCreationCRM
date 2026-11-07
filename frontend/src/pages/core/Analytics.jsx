import { useState, useEffect } from 'react';
import api from '../../api/axios';
import {
  IndianRupee,
  Clock,
  CheckSquare,
  AlertTriangle,
  RefreshCw,
  AlertCircle,
  Briefcase,
  Users,
  Activity,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const Analytics = () => {
  const [clients, setClients] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    setLoading(true);
    setError('');
    try {
      const [clientsRes, tasksRes] = await Promise.all([
        api.get('/clients'),
        api.get('/tasks'),
      ]);

      const clientsList =
        clientsRes.data?.data || (Array.isArray(clientsRes.data) ? clientsRes.data : []);
      const tasksList =
        tasksRes.data?.data || (Array.isArray(tasksRes.data) ? tasksRes.data : []);

      setClients(clientsList);
      setTasks(tasksList);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Failed to fetch analytics console data. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  // 1. Calculations from raw data
  // Total Revenue: Sum of all service.paidAmount in client services
  const totalRevenue = clients.reduce((acc, client) => {
    const paidSum = (client.services || []).reduce(
      (sum, s) => sum + (Number(s.paidAmount) || 0),
      0
    );
    return acc + paidSum;
  }, 0);

  // Pending Amount: Sum of (service.agreedPrice - service.paidAmount) across all client services
  const pendingAmount = clients.reduce((acc, client) => {
    const pendingSum = (client.services || []).reduce((sum, s) => {
      const agreed = Number(s.agreedPrice) || 0;
      const paid = Number(s.paidAmount) || 0;
      return sum + Math.max(0, agreed - paid);
    }, 0);
    return acc + pendingSum;
  }, 0);

  // Total Tasks: Length of tasks array
  const totalTasks = tasks.length;

  // Overdue Tasks: Tasks where dueDate is in the past and status !== 'completed'
  const overdueTasks = tasks.filter((t) => {
    if (!t.dueDate) return false;
    const statusLower = String(t.status || '').toLowerCase().trim();
    if (statusLower === 'completed' || statusLower === 'done') return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return new Date(t.dueDate) < today;
  }).length;

  // 2. Data for Team Workload (Bar Chart)
  // X-Axis: Intern names (from tasks.assignedTo.name), Y-Axis: Number of tasks
  const workloadMap = {};
  tasks.forEach((t) => {
    const name = t.assignedTo?.name || 'Unassigned';
    workloadMap[name] = (workloadMap[name] || 0) + 1;
  });
  const teamWorkloadData = Object.keys(workloadMap).map((name) => ({
    name,
    tasks: workloadMap[name],
  }));

  // 3. Data for Task Status Distribution (Pie Chart)
  const statusCounts = {
    todo: 0,
    'in-progress': 0,
    completed: 0,
  };
  tasks.forEach((t) => {
    const s = String(t.status || 'todo').toLowerCase().trim();
    if (s === 'completed' || s === 'done') {
      statusCounts.completed++;
    } else if (s === 'in-progress' || s === 'in progress' || s === 'inprogress') {
      statusCounts['in-progress']++;
    } else {
      statusCounts.todo++;
    }
  });

  const taskStatusData = [
    { name: 'To Do', value: statusCounts.todo, color: '#6366F1' },
    { name: 'In Progress', value: statusCounts['in-progress'], color: '#14B8A6' },
    { name: 'Completed', value: statusCounts.completed, color: '#10B981' },
  ];

  // Helper for Status Pill in Table (Green for Active, Gray for Completed)
  const getStatusPillClass = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'completed') {
      return 'bg-gray-500/10 text-gray-400 border border-gray-500/20';
    }
    return 'bg-green-500/10 text-green-400 border border-green-500/20';
  };

  // Check if any client has services
  const hasClientAssignments = clients.some(
    (client) => Array.isArray(client.services) && client.services.length > 0
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8 text-white">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            <Activity className="text-primary" size={28} />
            Analytics Console
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Director level operational metrics, team workload, and client financials.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchAnalyticsData}
          disabled={loading}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 bg-surface hover:bg-surface/80 border border-border rounded-xl text-sm text-gray-300 hover:text-white transition-colors disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Error State */}
      {error && (
        <div className="flex items-center justify-between p-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle size={18} className="shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={() => setError('')}
            className="text-xs underline hover:text-red-300 ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="bg-surface border border-border rounded-xl p-6 h-32 animate-pulse flex flex-col justify-between"
              >
                <div className="h-4 bg-border/60 rounded w-1/2"></div>
                <div className="h-8 bg-border/40 rounded w-3/4"></div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-surface border border-border rounded-xl p-6 h-80 animate-pulse"></div>
            <div className="bg-surface border border-border rounded-xl p-6 h-80 animate-pulse"></div>
          </div>
          <div className="bg-surface border border-border rounded-xl p-6 h-64 animate-pulse"></div>
        </div>
      ) : (
        <>
          {/* 2. Top Section (Stat Cards) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Total Revenue */}
            <div className="bg-surface border border-border rounded-xl p-6 hover:border-primary/40 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-400 text-sm font-medium">Total Revenue</span>
                <div className="p-3 bg-green-500/10 rounded-lg text-green-400">
                  <IndianRupee size={22} />
                </div>
              </div>
              <p className="text-3xl font-bold text-white tracking-tight">
                ₹{totalRevenue.toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-gray-500 mt-2">Collected across all active services</p>
            </div>

            {/* Pending Amount */}
            <div className="bg-surface border border-border rounded-xl p-6 hover:border-primary/40 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-400 text-sm font-medium">Pending Amount</span>
                <div className="p-3 bg-yellow-500/10 rounded-lg text-yellow-400">
                  <Clock size={22} />
                </div>
              </div>
              <p className="text-3xl font-bold text-white tracking-tight">
                ₹{pendingAmount.toLocaleString('en-IN')}
              </p>
              <p className="text-xs text-gray-500 mt-2">Outstanding receivables</p>
            </div>

            {/* Total Tasks */}
            <div className="bg-surface border border-border rounded-xl p-6 hover:border-primary/40 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-400 text-sm font-medium">Total Tasks</span>
                <div className="p-3 bg-primary/10 rounded-lg text-primary">
                  <CheckSquare size={22} />
                </div>
              </div>
              <p className="text-3xl font-bold text-white tracking-tight">{totalTasks}</p>
              <p className="text-xs text-gray-500 mt-2">Active & completed deliverables</p>
            </div>

            {/* Overdue Tasks */}
            <div className="bg-surface border border-border rounded-xl p-6 hover:border-primary/40 transition-colors">
              <div className="flex items-center justify-between mb-4">
                <span className="text-gray-400 text-sm font-medium">Overdue Tasks</span>
                <div className="p-3 bg-red-500/10 rounded-lg text-red-400">
                  <AlertTriangle size={22} />
                </div>
              </div>
              <p className="text-3xl font-bold text-white tracking-tight">{overdueTasks}</p>
              <p className="text-xs text-gray-500 mt-2">Past deadline & incomplete</p>
            </div>
          </div>

          {/* 3. Middle Section (Charts) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Chart: Team Workload (Bar Chart) */}
            <div className="bg-surface border border-border rounded-xl p-6 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Team Workload</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Tasks assigned per team member
                  </p>
                </div>
                <Users size={18} className="text-primary" />
              </div>

              {teamWorkloadData.length === 0 ? (
                <div className="h-64 flex items-center justify-center text-gray-500 text-sm">
                  No task assignment data available.
                </div>
              ) : (
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={teamWorkloadData}
                      margin={{ top: 10, right: 10, left: -20, bottom: 25 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
                      <XAxis
                        dataKey="name"
                        stroke="#9CA3AF"
                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                        interval={0}
                        angle={-20}
                        textAnchor="end"
                      />
                      <YAxis
                        stroke="#9CA3AF"
                        allowDecimals={false}
                        tick={{ fill: '#9CA3AF', fontSize: 12 }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#111827',
                          border: '1px solid #1F2937',
                          borderRadius: '0.75rem',
                          color: '#fff',
                        }}
                        cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                      />
                      <Bar dataKey="tasks" fill="#14B8A6" radius={[6, 6, 0, 0]} barSize={34} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* Right Chart: Task Status Distribution (Pie Chart) */}
            <div className="bg-surface border border-border rounded-xl p-6 flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Task Status Distribution</h3>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Current progress breakdown across all tasks
                  </p>
                </div>
                <Briefcase size={18} className="text-accent" />
              </div>

              {totalTasks === 0 ? (
                <div className="h-64 flex items-center justify-center text-gray-500 text-sm">
                  No task data available.
                </div>
              ) : (
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#111827',
                          border: '1px solid #1F2937',
                          borderRadius: '0.75rem',
                          color: '#fff',
                        }}
                        itemStyle={{ color: '#fff' }}
                      />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        formatter={(value) => (
                          <span className="text-gray-300 text-xs font-medium ml-1">
                            {value}
                          </span>
                        )}
                      />
                      <Pie
                        data={taskStatusData}
                        cx="50%"
                        cy="45%"
                        innerRadius={60}
                        outerRadius={95}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {taskStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </div>

          {/* 4. Bottom Section (Client Assignments Table) */}
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <div className="p-6 border-b border-border">
              <h3 className="text-lg font-bold text-white">Client Projects & Assignments</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Detailed view of client contracts, assigned person in charge, and collection status.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border bg-background/50 text-[11px] uppercase tracking-wider text-gray-400 font-semibold">
                    <th className="py-3.5 px-6">Client Name</th>
                    <th className="py-3.5 px-6">Service Name</th>
                    <th className="py-3.5 px-6">Person In Charge</th>
                    <th className="py-3.5 px-6">Financials</th>
                    <th className="py-3.5 px-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-sm">
                  {!hasClientAssignments ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-gray-400 text-sm">
                        No client assignments found.
                      </td>
                    </tr>
                  ) : (
                    clients.map((client) =>
                      (client.services || []).map((service, sIndex) => (
                        <tr
                          key={`${client._id || client.companyName}-${service._id || sIndex}`}
                          className="border-b border-border hover:bg-background/50 transition-colors"
                        >
                          {/* Client Name */}
                          <td className="py-4 px-6 font-medium text-white whitespace-nowrap">
                            {client.companyName}
                          </td>

                          {/* Service Name */}
                          <td className="py-4 px-6 text-gray-300 whitespace-nowrap">
                            {service.serviceName}
                          </td>

                          {/* Person In Charge */}
                          <td className="py-4 px-6 text-gray-400 whitespace-nowrap">
                            {service.personInCharge?.name || 'Unassigned'}
                          </td>

                          {/* Financials */}
                          <td className="py-4 px-6 font-medium text-white whitespace-nowrap">
                            ₹{Number(service.paidAmount || 0).toLocaleString('en-IN')} / ₹
                            {Number(service.agreedPrice || 0).toLocaleString('en-IN')}
                          </td>

                          {/* Status */}
                          <td className="py-4 px-6 whitespace-nowrap">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold inline-block ${getStatusPillClass(
                                service.status
                              )}`}
                            >
                              {service.status || 'Active'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Analytics;
