import { useAuth } from '../../context/AuthContext';
import {
    ArrowUpRight, ArrowDownRight, Users, CheckCircle,
    Clock, Briefcase, Activity, ChevronRight
} from 'lucide-react';

const Overview = () => {
    const { user } = useAuth();

    // Dummy data for the UI (We will connect this to backend later)
    const stats = [
        { label: 'Active Clients', value: '12', icon: <Briefcase size={20} />, trend: '+2 this month', positive: true },
        { label: 'Tasks Completed', value: '84%', icon: <CheckCircle size={20} />, trend: '+12% from last week', positive: true },
        { label: 'Pending Invoices', value: '₹ 45,000', icon: <Clock size={20} />, trend: '-₹10,000', positive: false },
        { label: 'Team Members', value: '8', icon: <Users size={20} />, trend: 'All active', positive: true },
    ];

    return (
        <div className="text-white max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">Welcome back, {user?.name ? user.name.split(' ')[0] : 'User'}</h1>
                    <p className="text-gray-400">Here is what is happening at JM Creations today.</p>
                </div>
                <div className="text-sm text-gray-400 bg-surface border border-border px-4 py-2 rounded-lg">
                    {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-surface border border-border p-6 rounded-xl hover:border-primary/50 transition-colors group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-background rounded-lg text-primary group-hover:bg-primary/10 transition-colors">
                                {stat.icon}
                            </div>
                        </div>
                        <h3 className="text-gray-400 text-sm mb-1">{stat.label}</h3>
                        <p className="text-2xl font-bold text-white mb-2">{stat.value}</p>
                        <p className={`text-xs flex items-center gap-1 ${stat.positive ? 'text-green-400' : 'text-red-400'}`}>
                            {stat.positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                            {stat.trend}
                        </p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column: Recent Activity */}
                <div className="lg:col-span-2 bg-surface border border-border rounded-xl p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-semibold flex items-center gap-2">
                            <Activity size={20} className="text-accent" /> Recent Activity
                        </h2>
                        <button className="text-sm text-primary hover:underline">View All</button>
                    </div>

                    <div className="space-y-6">
                        {[1, 2, 3].map((_, i) => (
                            <div key={i} className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-background flex items-center justify-center border border-border">
                                    <CheckCircle size={16} className="text-primary" />
                                </div>
                                <div className="flex-1 border-b border-border pb-4">
                                    <p className="text-sm text-white"><span className="font-semibold">Nirmal</span> completed the task <span className="text-accent">"Design Homepage"</span></p>
                                    <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right Column: Quick Tasks */}
                <div className="bg-surface border border-border rounded-xl p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-semibold">My Tasks</h2>
                        <ChevronRight size={20} className="text-gray-500" />
                    </div>

                    <div className="space-y-3">
                        {['Review Website Mockup', 'Call Client ABC Corp', 'Update Invoice #1042'].map((task, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 bg-background border border-border rounded-lg hover:border-primary/50 cursor-pointer transition-colors">
                                <div className="w-5 h-5 rounded border border-gray-500 flex items-center justify-center">
                                    {/* Checkbox placeholder */}
                                </div>
                                <span className="text-sm text-gray-300">{task}</span>
                            </div>
                        ))}
                    </div>

                    <button className="w-full mt-4 bg-background border border-border py-2 rounded-lg text-sm text-gray-400 hover:text-white hover:border-primary transition-colors">
                        + Add New Task
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Overview;