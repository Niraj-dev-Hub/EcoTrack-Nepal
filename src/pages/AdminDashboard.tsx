import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { LayoutDashboard, FileText, ClipboardList, Users, Download, ShieldCheck, Search, Filter, RefreshCw, Trophy, Globe, Coins, Trash2, Calendar } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../api';
import { User, Report, Collection } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import TruckSchedule from '../components/TruckSchedule';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ef4444'];

interface Metrics {
  totalUsers: number;
  totalReports: number;
  totalWeight: number;
  totalRewards: number;
}

interface StatsData {
  metrics: Metrics;
  wasteDistribution: Array<{ name: string; value: number }>;
  topUsers: Array<{ name: string; weight: number; rewards: number }>;
  monthlyTrends: Array<{ month: string; weight: number }>;
  users: Array<Omit<User, 'passwordHash'>>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [allReports, setAllReports] = useState<Report[]>([]);
  const [allCollections, setAllCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter and search states
  const [reportsSearch, setReportsSearch] = useState('');
  const [reportsStatusFilter, setReportsStatusFilter] = useState('');
  const [reportsTypeFilter, setReportsTypeFilter] = useState('');

  // Page tab inside admin dashboard
  const [adminTab, setAdminTab] = useState<'analytics' | 'reports' | 'collections' | 'users' | 'schedules'>('analytics');

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [statsRes, reportsRes, collectionsRes] = await Promise.all([
        api.get('/collections/stats'),
        api.get('/reports/all'),
        api.get('/collections/all')
      ]);

      if (statsRes.data.success) {
        setStats(statsRes.data.data);
      }
      if (reportsRes.data.success) {
        setAllReports(reportsRes.data.data);
      }
      if (collectionsRes.data.success) {
        setAllCollections(collectionsRes.data.data);
      }
    } catch (err: any) {
      toast.error('Municipal analytics sync failed. Authenticate as Admin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  // CSV Exporter Utility
  const handleExportCSV = () => {
    if (allCollections.length === 0) {
      toast.error('No collections available to export yet.');
      return;
    }

    // CSV header row
    const headers = ['Collection ID', 'Report ID', 'Citizen Name', 'Citizen ID', 'Driver Name', 'Driver ID', 'Garbage Type', 'Weight (KG)', 'Rewards Paid (Rs)', 'Collected Date'];
    
    // CSV content rows
    const rows = allCollections.map(col => [
      col.id,
      col.reportId || 'Direct Pickup',
      col.userName.replace(/,/g, ' '),
      col.userId,
      col.driverName.replace(/,/g, ' '),
      col.driverId,
      col.garbageType,
      col.weightKg,
      col.rewardAmount,
      new Date(col.collectedAt).toISOString()
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ecotrack_nepal_collections_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Downloaded CSV spreadsheet successfully!');
  };

  // Filtered reports calculation
  const filteredReports = allReports.filter(report => {
    const searchMatch = 
      report.title.toLowerCase().includes(reportsSearch.toLowerCase()) ||
      report.location.toLowerCase().includes(reportsSearch.toLowerCase()) ||
      report.userName.toLowerCase().includes(reportsSearch.toLowerCase());
    
    const statusMatch = reportsStatusFilter === '' || report.status === reportsStatusFilter;
    const typeMatch = reportsTypeFilter === '' || report.wasteType === reportsTypeFilter;

    return searchMatch && statusMatch && typeMatch;
  });

  return (
    <div className="max-w-screen-2xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="font-sans text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-8 w-8 text-emerald-600" />
            Municipality Executive Panel
          </h1>
          <p className="text-gray-500 font-light mt-1">
            Real-time Kathmandu City waste statistics, logistics coordination, and user ledger auditing.
          </p>
        </div>
        <button
          onClick={fetchAdminData}
          className="inline-flex items-center gap-1.5 bg-white hover:bg-gray-50 border border-gray-150 rounded-xl px-4 py-2 text-sm text-gray-600 font-bold shadow-sm transition-all active:scale-95"
        >
          <RefreshCw className="h-4 w-4" /> Sync Stats
        </button>
      </div>

      {loading ? (
        <LoadingSpinner message="Auditing ledger transactions and charts..." />
      ) : (
        <>
          {/* Main Top Metrics (System overview cards) */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-gradient-to-br from-emerald-650 via-emerald-600 to-teal-500 text-white p-5 rounded-2xl shadow-md">
              <span className="text-[10px] text-emerald-100 font-extrabold uppercase tracking-wider block">Total Citizens & Drivers</span>
              <span className="text-3xl font-mono font-black mt-1 block">
                {stats?.metrics.totalUsers} <span className="text-xs font-sans font-light">Users</span>
              </span>
            </div>
            <div className="bg-gradient-to-br from-slate-800 to-slate-900 text-white p-5 rounded-2xl shadow-md">
              <span className="text-[10px] text-slate-300 font-extrabold uppercase tracking-wider block">Reported Waste Hotspots</span>
              <span className="text-3xl font-mono font-black mt-1 block">
                {stats?.metrics.totalReports} <span className="text-xs font-sans font-light">Incidents</span>
              </span>
            </div>
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white p-5 rounded-2xl shadow-md">
              <span className="text-[10px] text-blue-100 font-extrabold uppercase tracking-wider block">Total Recycled Weight</span>
              <span className="text-3xl font-mono font-black mt-1 block">
                {stats?.metrics.totalWeight.toLocaleString()} <span className="text-xs font-sans font-light">KG</span>
              </span>
            </div>
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white p-5 rounded-2xl shadow-md">
              <span className="text-[10px] text-amber-150 font-extrabold uppercase tracking-wider block">Total Paid Rewards</span>
              <span className="text-3xl font-mono font-black mt-1 block">
                Rs. {stats?.metrics.totalRewards.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Tab Selection */}
          <div className="flex border-b border-gray-200 mb-8 overflow-x-auto gap-2">
            <button
              onClick={() => setAdminTab('analytics')}
              className={`py-3 px-4 font-bold text-sm border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                adminTab === 'analytics' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-gray-400 hover:text-gray-700'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" /> Analytical Graphs
            </button>
            <button
              onClick={() => setAdminTab('reports')}
              className={`py-3 px-4 font-bold text-sm border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                adminTab === 'reports' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-gray-400 hover:text-gray-700'
              }`}
            >
              <FileText className="h-4 w-4" /> Reports Manager ({allReports.length})
            </button>
            <button
              onClick={() => setAdminTab('collections')}
              className={`py-3 px-4 font-bold text-sm border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                adminTab === 'collections' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-gray-400 hover:text-gray-700'
              }`}
            >
              <ClipboardList className="h-4 w-4" /> Collections log ({allCollections.length})
            </button>
            <button
              onClick={() => setAdminTab('schedules')}
              className={`py-3 px-4 font-bold text-sm border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                adminTab === 'schedules' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-gray-400 hover:text-gray-700'
              }`}
            >
              <Calendar className="h-4 w-4" /> Truck Schedules
            </button>
            <button
              onClick={() => setAdminTab('users')}
              className={`py-3 px-4 font-bold text-sm border-b-2 transition-all flex items-center gap-1.5 whitespace-nowrap ${
                adminTab === 'users' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-gray-400 hover:text-gray-700'
              }`}
            >
              <Users className="h-4 w-4" /> Citizens & Crews Directory
            </button>
          </div>

          {/* Tab Views */}
          {adminTab === 'analytics' && (
            <div className="space-y-8">
              {/* Charts grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Chart 1: Monthly Trend Bar Chart */}
                <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm">
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-gray-400 mb-4">
                    Monthly Waste Collection Trends (KG)
                  </h3>
                  <div className="h-[300px] w-full">
                    {stats?.monthlyTrends && stats.monthlyTrends.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.monthlyTrends}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                          <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} unit="kg" />
                          <Tooltip contentStyle={{ borderRadius: '12px', borderColor: '#e2e8f0' }} />
                          <Bar dataKey="weight" fill="#10b981" radius={[8, 8, 0, 0]} barSize={40} />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-xs text-gray-400 font-bold">
                        No monthly milestones recorded yet.
                      </div>
                    )}
                  </div>
                </div>

                {/* Chart 2: Waste Type Pie Chart */}
                <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm">
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-gray-400 mb-4">
                    Waste Type Distribution Weight (KG Proportion)
                  </h3>
                  <div className="h-[300px] w-full flex flex-col md:flex-row items-center justify-between">
                    <div className="h-full w-full md:w-3/5">
                      {stats?.wasteDistribution && stats.wasteDistribution.reduce((s, d) => s + d.value, 0) > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={stats.wasteDistribution}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={90}
                              paddingAngle={3}
                              dataKey="value"
                            >
                              {stats.wasteDistribution.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip contentStyle={{ borderRadius: '12px', borderColor: '#e2e8f0' }} />
                          </PieChart>
                        </ResponsiveContainer>
                      ) : (
                        <div className="h-full flex items-center justify-center text-xs text-gray-400 font-bold">
                          No category weights distributed. Log a collection!
                        </div>
                      )}
                    </div>
                    {/* legend panels */}
                    <div className="w-full md:w-2/5 p-4 space-y-2 text-xs">
                      {stats?.wasteDistribution.map((item, idx) => (
                        <div key={item.name} className="flex justify-between items-center bg-gray-50 p-2 rounded-lg border border-gray-100">
                          <span className="flex items-center gap-1.5 font-bold">
                            <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                            {item.name}
                          </span>
                          <span className="font-mono font-bold text-gray-700">{item.value} kg</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Leaderboard Champion Citizens */}
              <div className="bg-white p-6 rounded-2xl border border-gray-150 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <div className="bg-amber-100 p-2 rounded-xl text-amber-600">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">
                      Top Contributing Citizens Leaderboard
                    </h3>
                    <p className="text-xs text-slate-400">Citizens recycling the highest tonnage of waste.</p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-150 text-slate-800">
                    <thead>
                      <tr className="text-left text-xs font-bold uppercase text-gray-400 bg-gray-50/55 rounded-xl">
                        <th className="py-3 px-4">Rank</th>
                        <th className="py-3 px-4">Citizen Name</th>
                        <th className="py-3 px-4">Total Recycled Weight</th>
                        <th className="py-3 px-4 text-right">Cash Rewards Received</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                      {stats?.topUsers && stats.topUsers.length > 0 ? (
                        stats.topUsers.map((champ, index) => (
                          <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                            <td className="py-3 px-4 font-mono font-bold">#{index + 1}</td>
                            <td className="py-3 px-4 font-semibold text-gray-900">{champ.name}</td>
                            <td className="py-3 px-4 font-mono font-medium text-emerald-800 bg-emerald-50/40 w-fit rounded px-2.5 py-1">
                              {champ.weight} KG
                            </td>
                            <td className="py-3 px-4 text-right font-mono font-bold text-emerald-600">
                              Rs. {champ.rewards.toLocaleString()}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={4} className="py-10 text-center text-xs font-bold text-gray-400 uppercase">
                            No citizen recycling achievements logged yet.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {adminTab === 'reports' && (
            /* Reports Management Panel with robust Filtering tools */
            <div className="bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden">
              <div className="bg-gray-50/50 p-4 border-b border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:max-w-md">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    value={reportsSearch}
                    onChange={(e) => setReportsSearch(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-550/25 outline-none transition-all"
                    placeholder="Search titles, streets, or author names..."
                  />
                </div>

                <div className="flex gap-2 w-full md:w-auto justify-end">
                  <select
                    value={reportsStatusFilter}
                    onChange={(e) => setReportsStatusFilter(e.target.value)}
                    className="py-1.5 px-3 border border-gray-250 rounded-xl bg-white text-xs outline-none focus:ring-2 focus:focus-ring-emerald-500"
                  >
                    <option value="">-- All Statuses --</option>
                    <option value="Pending">Pending</option>
                    <option value="Collected">Collected</option>
                  </select>

                  <select
                    value={reportsTypeFilter}
                    onChange={(e) => setReportsTypeFilter(e.target.value)}
                    className="py-1.5 px-3 border border-gray-250 rounded-xl bg-white text-xs outline-none focus:ring-2 focus:focus-ring-emerald-500"
                  >
                    <option value="">-- All Waste Types --</option>
                    <option value="Plastic">Plastic</option>
                    <option value="Paper">Paper</option>
                    <option value="Metal">Metal</option>
                    <option value="Organic">Organic</option>
                    <option value="E-waste">E-waste</option>
                  </select>
                </div>
              </div>

              <div className="p-6">
                {filteredReports.length === 0 ? (
                  <div className="text-center py-12">
                    <Trash2 className="h-10 w-10 text-gray-300 mx-auto mb-2 animate-bounce" />
                    <p className="text-sm text-gray-500 font-bold">No filtering report matches</p>
                    <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                      Adjust your search parameters/filters, or prompt Kathmandu citizens to register reports.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-150 text-left text-sm text-gray-800">
                      <thead>
                        <tr className="bg-gray-50 text-xs font-bold uppercase text-gray-400">
                          <th className="py-3 px-4">Title & Description</th>
                          <th className="py-3 px-4">Reporter Name</th>
                          <th className="py-3 px-4">Category</th>
                          <th className="py-3 px-4">Location/Ward</th>
                          <th className="py-3 px-4">Est. Weight</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-4">Submitted Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredReports.map((report) => (
                          <tr key={report.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="py-4 px-4 max-w-xs">
                              <p className="font-bold text-gray-900 leading-tight">{report.title}</p>
                              <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">{report.description}</p>
                            </td>
                            <td className="py-4 px-4 font-semibold text-gray-700">{report.userName}</td>
                            <td className="py-4 px-4">
                              <span className="text-[10px] bg-slate-100 border border-slate-200 text-slate-800 px-2 py-0.5 rounded font-mono font-semibold">
                                {report.wasteType}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-xs text-gray-500">{report.location}</td>
                            <td className="py-4 px-4 font-mono font-medium">{report.estimatedWeight} kg</td>
                            <td className="py-4 px-4">
                              <span
                                className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                                  report.status === 'Pending'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-emerald-100 text-emerald-800'
                                }`}
                              >
                                {report.status}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-xs text-gray-400 font-mono">
                              {new Date(report.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {adminTab === 'collections' && (
            /* Collection logs with EXPORT capability */
            <div className="bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden">
              <div className="bg-gray-50/50 p-4 border-b border-gray-105 flex justify-between items-center gap-4 flex-wrap">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">Historical Waste Pickups & Reward Deliveries</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Auditable records matching cash transactions automatically paid out to wallets.</p>
                </div>
                <button
                  onClick={handleExportCSV}
                  className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-sm transition-all focus:ring-2 focus:ring-emerald-500"
                >
                  <Download className="h-4 w-4" /> Export Ledger (CSV)
                </button>
              </div>

              <div className="p-6">
                {allCollections.length === 0 ? (
                  <div className="text-center py-12">
                    <ClipboardList className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 font-bold">No collections processed yet</p>
                    <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                      Crews and drivers have not processed nor closed any pickup reports.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-150 text-left text-sm text-gray-800">
                      <thead>
                        <tr className="bg-gray-50 text-xs font-bold uppercase text-gray-400">
                          <th className="py-3 px-4">Collection Run ID</th>
                          <th className="py-3 px-4">Citizen Name</th>
                          <th className="py-3 px-4">Authorized driver</th>
                          <th className="py-3 px-4">Recycled Category</th>
                          <th className="py-3 px-4">Verified weight</th>
                          <th className="py-3 px-4">Cash reward issued</th>
                          <th className="py-3 px-4">Processed Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-sans">
                        {allCollections.map((col) => (
                          <tr key={col.id} className="hover:bg-gray-50/50 transition-all font-sans">
                            <td className="py-4 px-4 font-mono text-xs font-bold text-slate-400">{col.id}</td>
                            <td className="py-4 px-4 font-bold text-gray-900">{col.userName}</td>
                            <td className="py-4 px-4 font-semibold text-gray-700">{col.driverName}</td>
                            <td className="py-4 px-4">
                              <span className="text-[10px] bg-slate-100 border border-slate-200 text-slate-700 px-2 py-0.5 rounded font-bold font-mono">
                                {col.garbageType}
                              </span>
                            </td>
                            <td className="py-4 px-4 font-mono font-semibold text-gray-800">{col.weightKg} kg</td>
                            <td className="py-4 px-4 font-mono font-extrabold text-emerald-600">Rs. {col.rewardAmount}</td>
                            <td className="py-4 px-4 text-xs text-gray-400 font-mono">
                              {new Date(col.collectedAt).toLocaleDateString(undefined, { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {adminTab === 'users' && (
            /* Users view only */
            <div className="bg-white rounded-2xl border border-gray-150 shadow-sm overflow-hidden animate-fade-in">
              <div className="bg-gray-50/50 p-4 border-b border-gray-100">
                <h3 className="text-sm font-extrabold text-slate-900">Roster & Digital Balance Directory</h3>
                <p className="text-xs text-slate-400 mt-0.5">Review accounts registered in Kathmandu municipality. Accounts are view-only audit profiles.</p>
              </div>

              <div className="p-6">
                {!stats?.users || stats.users.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 font-bold">No users registered</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-155 text-left text-sm text-gray-850">
                      <thead>
                        <tr className="bg-gray-50 text-xs font-bold uppercase text-gray-300">
                          <th className="py-3 px-4">Full Name</th>
                          <th className="py-3 px-4">E-mail Address</th>
                          <th className="py-3 px-4">Internal Role</th>
                          <th className="py-3 px-4">Address/Ward</th>
                          <th className="py-3 px-4">Phone contact</th>
                          <th className="py-3 px-4 text-right">Account Created</th>
                          <th className="py-3 px-4 text-right">Wallet Balance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 font-sans">
                        {stats.users.map((profile) => (
                          <tr key={profile.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="py-4 px-4 font-bold text-gray-900 flex items-center gap-2">
                              <span className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center font-extrabold text-xs">
                                {profile.name.charAt(0)}
                              </span>
                              {profile.name}
                            </td>
                            <td className="py-4 px-4 font-mono text-xs text-gray-650">{profile.email}</td>
                            <td className="py-4 px-4">
                              <span
                                className={`text-[10px] font-extrabold px-2.5 py-1 rounded ${
                                  profile.role === 'admin'
                                    ? 'bg-red-50 text-red-700 border border-red-150'
                                    : profile.role === 'driver'
                                    ? 'bg-blue-50 text-blue-700 border border-blue-150'
                                    : 'bg-emerald-50 text-emerald-800 border border-emerald-150'
                                }`}
                              >
                                {profile.role.toUpperCase()}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-xs text-gray-500">{profile.address || '-'}</td>
                            <td className="py-4 px-4 text-xs font-mono text-gray-500">{profile.phone || '-'}</td>
                            <td className="py-4 px-4 text-right text-xs text-gray-400 font-mono">
                              {new Date(profile.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                            </td>
                            <td className="py-4 px-4 text-right font-mono font-black text-slate-800">
                              Rs. {profile.walletBalance.toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
