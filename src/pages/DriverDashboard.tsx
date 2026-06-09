import React, { useState, useEffect } from 'react';
import { Truck, Users, Trash2, Award, ClipboardCheck, History, UserCheck, Calendar, Scale } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../api';
import { User, Report, Collection } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import TruckSchedule from '../components/TruckSchedule';

const REWARD_RATES: Record<string, number> = {
  'Plastic': 5,
  'Paper': 4,
  'Metal': 8,
  'Organic': 2,
  'E-waste': 10
};

interface DriverDashboardProps {
  user?: User | null;
}

export default function DriverDashboard({ user }: DriverDashboardProps) {
  const [pendingReports, setPendingReports] = useState<Report[]>([]);
  const [citizens, setCitizens] = useState<Omit<User, 'passwordHash'>[]>([]);
  const [myCollections, setMyCollections] = useState<Collection[]>([]);
  const [activeTrips, setActiveTrips] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedReportId, setSelectedReportId] = useState('');
  const [garbageType, setGarbageType] = useState<'Plastic' | 'Paper' | 'Metal' | 'Organic' | 'E-waste'>('Plastic');
  const [weightKg, setWeightKg] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Tab views on the right panel
  const [activeTab, setActiveTab ] = useState<'pending' | 'history' | 'schedules'>('pending');

  const fetchActiveTrips = async () => {
    try {
      const res = await api.get('/trips/active');
      if (res.data.success) {
        setActiveTrips(res.data.data);
      }
    } catch (err) {
      console.error('Error loading active trips:', err);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reportsRes, citizensRes, collectionsRes] = await Promise.all([
        api.get('/reports/pending'),
        api.get('/auth/citizens'),
        api.get('/collections/my-collections')
      ]);

      if (reportsRes.data.success) {
        setPendingReports(reportsRes.data.data);
      }
      if (citizensRes.data.success) {
        setCitizens(citizensRes.data.data);
      }
      if (collectionsRes.data.success) {
        setMyCollections(collectionsRes.data.data);
      }
      await fetchActiveTrips();
    } catch (err: any) {
      toast.error('Could not fetch logistics records. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Setup active trip polling
    const timer = setInterval(() => {
      fetchActiveTrips();
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  const handleProcessCollection = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUserId) {
      toast.error('Please select a citizen user from the dropdown.');
      return;
    }

    const weightNum = parseFloat(weightKg);
    if (isNaN(weightNum) || weightNum < 0.1) {
      toast.error('Weight collected must be at least 0.1 KG.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/collections/create', {
        reportId: selectedReportId || undefined,
        userId: selectedUserId,
        garbageType,
        weightKg: weightNum
      });

      if (res.data.success) {
        toast.success(res.data.message || 'Waste logged, reward transferred!');
        
        // Clear active GPS simulation since collection is processed
        try {
          await api.post('/trips/stop');
        } catch (colErr) {
          // ignore
        }

        // Reset form
        setSelectedUserId('');
        setSelectedReportId('');
        setWeightKg('');
        setGarbageType('Plastic');
        
        // Refresh data
        fetchData();
      } else {
        toast.error(res.data.message || 'Failed log attempt.');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error executing pick up transaction.');
    } finally {
      setSubmitting(false);
    }
  };

  // Pre-fill collection form when clicking a pending report
  const handleFulfillReport = (report: Report) => {
    setSelectedUserId(report.userId);
    setSelectedReportId(report.id);
    setGarbageType(report.wasteType);
    setWeightKg(report.estimatedWeight.toString());
    toast.success(`Pre-filled from Sita's report: "${report.title}"`);
  };

  const handleStartTraveling = async (reportId: string) => {
    try {
      const res = await api.post('/trips/start', { reportId });
      if (res.data.success) {
        toast.success(res.data.message || 'GPS Navigation traveling session started!');
        await fetchActiveTrips();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error tracking GPS.');
    }
  };

  const handleStopTraveling = async () => {
    try {
      const res = await api.post('/trips/stop');
      if (res.data.success) {
        toast.success('GPS navigation traveling paused.');
        await fetchActiveTrips();
      }
    } catch (err) {
      toast.error('Failed to clear traveling route.');
    }
  };

  // Live reward preview calculation
  const calculatedReward = parseFloat(weightKg) ? parseFloat(weightKg) * (REWARD_RATES[garbageType] || 0) : 0;

  // Driver metrics
  const totalWeightCleared = myCollections.reduce((sum, c) => sum + c.weightKg, 0);
  const totalRewardsDistributed = myCollections.reduce((sum, c) => sum + c.rewardAmount, 0);

  const myActiveTrip = activeTrips.find(t => t.driverId === (user?.id || 'driver-1'));

  return (
    <div className="max-w-screen-2xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-0">
        <h1 className="font-sans text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
          <Truck className="h-8 w-8 text-emerald-600" />
          Driver Control Dashboard
        </h1>
        <p className="text-gray-500 font-light mt-1">
          Authorized garbage crews log. Collect reported waste piles across Kathmandu and dispense instant digital rewards.
        </p>
      </div>

      {/* Active Transit GPS Widget */}
      {myActiveTrip && (
        <div className="mt-6 mb-8 p-6 bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-2xl shadow-lg border border-emerald-500 relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/25 text-[10px] font-bold uppercase tracking-wider mb-2">
                <span className="h-2 w-2 rounded-full bg-green-400 animate-ping"></span>
                GPS Travel Active
              </div>
              <h2 className="text-lg font-bold font-sans">
                Routing to: "{pendingReports.find(r => r.id === myActiveTrip.reportId)?.title || "Citizen Site"}"
              </h2>
              <p className="text-xs opacity-90 mt-1">
                📍 Location: <span className="font-semibold">{pendingReports.find(r => r.id === myActiveTrip.reportId)?.location || "New Baneshwor"}</span>
              </p>
              <p className="text-[11px] opacity-75 mt-0.5">
                Client Citizen: <span className="font-semibold text-white">{myActiveTrip.citizenName}</span> ({myActiveTrip.citizenEmail})
              </p>
            </div>
            
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-[10px] uppercase font-extrabold tracking-wider text-emerald-200">GPS Distance</p>
                <p className="text-3xl font-mono font-black">{myActiveTrip.distanceKm} <span className="text-xs">KM</span></p>
                <p className="text-[10px] text-emerald-200 font-medium">
                  {myActiveTrip.distanceKm <= 0 ? '⚠️ Arrived at Target Pile' : `~5 Mins alert sent at 2.5 km`}
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => {
                    const report = pendingReports.find(r => r.id === myActiveTrip.reportId);
                    if (report) handleFulfillReport(report);
                  }}
                  className="bg-white hover:bg-emerald-50 text-emerald-850 font-bold text-[11px] py-1.5 px-3 rounded-lg shadow transition-all animate-pulse"
                >
                  Fill Reward Form
                </button>
                <button
                  onClick={handleStopTraveling}
                  className="bg-white/10 hover:bg-white/20 text-white font-bold text-[10px] py-1 px-2 rounded-md transition-colors"
                >
                  Cancel GPS Trip
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="mb-8"></div>

      {loading ? (
        <LoadingSpinner message="Querying municipality routes & citizen rosters..." />
      ) : (
        <>
          {/* Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-150 p-6 rounded-2xl shadow-sm">
              <span className="text-xs uppercase font-extrabold tracking-wider text-gray-400">Total Collected Weight</span>
              <p className="mt-2 text-3xl font-mono font-bold text-slate-900">
                {totalWeightCleared.toFixed(1)} <span className="text-sm text-gray-500 font-sans">KG</span>
              </p>
            </div>
            <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-150 p-6 rounded-2xl shadow-sm">
              <span className="text-xs uppercase font-extrabold tracking-wider text-gray-400">Rewards Distributed</span>
              <p className="mt-2 text-3xl font-mono font-bold text-emerald-600">
                Rs. {totalRewardsDistributed.toLocaleString()}
              </p>
            </div>
            <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-150 p-6 rounded-2xl shadow-sm">
              <span className="text-xs uppercase font-extrabold tracking-wider text-gray-400">Pickups Completed</span>
              <p className="mt-2 text-3xl font-mono font-bold text-blue-600">
                {myCollections.length} <span className="text-sm text-gray-500 font-sans">Trips</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Log Intake Form */}
            <div className="lg:col-span-1 bg-white p-6 rounded-2xl border border-gray-150 shadow-md h-fit">
              <div className="mb-5">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <ClipboardCheck className="h-5 w-5 text-emerald-600" />
                  Submit Garbage Collection
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Physically examine the pile, weigh the categories, and record the true output.
                </p>
              </div>

              <form onSubmit={handleProcessCollection} className="space-y-4">
                {/* User Dropdown Selection */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Citizen (Username)</label>
                  <select
                    required
                    value={selectedUserId}
                    onChange={(e) => {
                      setSelectedUserId(e.target.value);
                      if (!e.target.value) setSelectedReportId('');
                    }}
                    className="block w-full py-2.5 px-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:ring-2 focus:ring-emerald-500/25 outline-none transition-all"
                  >
                    <option value="">-- Choose Citizen Client --</option>
                    {citizens.map(( citizen ) => (
                      <option key={citizen.id} value={citizen.id}>
                        {citizen.name} ({citizen.email})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Selected Report display note */}
                {selectedReportId && (
                  <div className="bg-emerald-50 border border-emerald-100 p-2.5 rounded-lg flex items-center justify-between text-xs text-emerald-800">
                    <div>
                      <p className="font-semibold">Fulfilling Field Report</p>
                      <p className="opacity-80 font-mono mt-0.5">{selectedReportId}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedReportId('')}
                      className="text-red-500 hover:text-red-700 font-bold"
                    >
                      Detach
                    </button>
                  </div>
                )}

                {/* Garbage Type selection */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Garbage Category</label>
                  <select
                    value={garbageType}
                    onChange={(e: any) => setGarbageType(e.target.value)}
                    className="block w-full py-2.5 px-3 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:ring-2 focus:ring-emerald-500/25 outline-none transition-all"
                  >
                    <option value="Plastic">Plastic (Rs. 5/KG)</option>
                    <option value="Paper">Paper (Rs. 4/KG)</option>
                    <option value="Metal">Metal (Rs. 8/KG)</option>
                    <option value="Organic">Organic (Rs. 2/KG)</option>
                    <option value="E-waste">E-waste (Rs. 10/KG)</option>
                  </select>
                </div>

                {/* Actual Weight KG input */}
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Actual Weight (KG)</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <Scale className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={weightKg}
                      onChange={(e) => setWeightKg(e.target.value)}
                      className="block w-full pr-10 pl-3 py-2 border border-gray-200 rounded-xl bg-gray-50 text-sm focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 outline-none transition-all"
                      placeholder="e.g. 10.4"
                    />
                  </div>
                </div>

                {/* Auto Reward preview box */}
                <div className="bg-slate-50 border border-gray-150 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gray-400 font-semibold block uppercase">Auto-Reward Estimate</span>
                    <span className="text-xl font-mono font-black text-emerald-600 mt-1 block">
                      Rs. {calculatedReward.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-gray-400 font-semibold block uppercase">Active Rate</span>
                    <span className="text-xs font-bold text-slate-700 bg-white shadow-sm border border-gray-100 rounded px-2 py-0.5 mt-1 block font-mono">
                      Rs. {REWARD_RATES[garbageType]}/KG
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full inline-flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-2.5 px-4 rounded-xl shadow-sm transition-all"
                >
                  {submitting ? 'Registering collection...' : 'Verify & Disburse Reward'}
                </button>
              </form>
            </div>

            {/* Right Column: List & Tabs */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-150 shadow-md overflow-hidden">
              <div className="flex border-b border-gray-100 bg-gray-50/50">
                <button
                  onClick={() => setActiveTab('pending')}
                  className={`flex-1 py-4 px-4 text-center text-sm font-bold border-b-2 transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'pending'
                      ? 'border-emerald-600 text-emerald-800 bg-white'
                      : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <Trash2 className="h-4 w-4" /> Pending Field Reports ({pendingReports.length})
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`flex-1 py-4 px-4 text-center text-sm font-bold border-b-2 transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'history'
                      ? 'border-emerald-600 text-emerald-800 bg-white'
                      : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <History className="h-4 w-4" /> My Completed Pickups ({myCollections.length})
                </button>
                <button
                  onClick={() => setActiveTab('schedules')}
                  className={`flex-1 py-4 px-4 text-center text-sm font-bold border-b-2 transition-all flex items-center justify-center gap-2 ${
                    activeTab === 'schedules'
                      ? 'border-emerald-600 text-emerald-800 bg-white'
                      : 'border-transparent text-gray-500 hover:text-gray-800'
                  }`}
                >
                  <Calendar className="h-4 w-4" /> Truck Schedules
                </button>
              </div>

              <div className="p-6">
                {activeTab === 'pending' ? (
                  /* Pending Reports List */
                  pendingReports.length === 0 ? (
                    <div className="text-center py-12">
                      <Award className="h-10 w-10 text-emerald-200 mx-auto mb-2 animate-pulse" />
                      <p className="text-sm text-gray-500 font-bold">No pending reports in Kathmandu</p>
                      <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                        Amazing progress! All citizen reported waste has been cleared and collected successfully.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {pendingReports.map((report) => (
                        <div
                          key={report.id}
                          className="border border-amber-100 bg-amber-50/5 hover:border-amber-200 rounded-xl p-4 shadow-sm flex items-start justify-between flex-wrap gap-4 transition-all"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full font-bold">
                                Pending
                              </span>
                              <span className="text-[10px] bg-slate-100 border border-slate-200 text-slate-700 font-mono font-semibold px-2 py-0.5 rounded">
                                {report.wasteType}
                              </span>
                            </div>
                            <h3 className="font-bold text-slate-900 text-sm sm:text-base">{report.title}</h3>
                            <p className="text-xs text-slate-500 line-clamp-1">{report.description}</p>
                            <p className="text-[11px] text-slate-400 flex items-center gap-1">
                              <UserCheck className="h-3 w-3" /> Reported by: <span className="text-slate-600 font-bold">{report.userName}</span>
                            </p>
                            <p className="text-[11px] text-slate-400 font-medium">
                              📍 Location: <span className="text-slate-600 font-semibold">{report.location}</span>
                            </p>
                          </div>

                          <div className="text-right flex flex-col items-end justify-between h-full min-h-[70px]">
                            <div>
                              <p className="text-[10px] text-gray-400 font-semibold font-mono">Est. Weight</p>
                              <p className="text-sm font-mono font-black text-slate-700">{report.estimatedWeight} KG</p>
                            </div>
                            
                            <div className="flex flex-col sm:flex-row gap-2 mt-3 justify-end items-center">
                              {activeTrips.some(t => t.reportId === report.id) ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                                  Enroute ({activeTrips.find(t => t.reportId === report.id)?.distanceKm} KM)
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleStartTraveling(report.id)}
                                  disabled={!!myActiveTrip}
                                  title={myActiveTrip ? "Finish your active routing first" : "Dispatch GPS Navigation"}
                                  className={`inline-flex items-center gap-1 font-bold text-[11px] py-1.5 px-2.5 rounded-lg shadow-sm transition-colors ${
                                    myActiveTrip 
                                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                      : "bg-blue-650 hover:bg-blue-700 text-white"
                                  }`}
                                >
                                  🚚 Start GPS Travel
                                </button>
                              )}

                              <button
                                onClick={() => handleFulfillReport(report)}
                                className="inline-flex items-center gap-1 bg-emerald-650 hover:bg-emerald-700 text-white font-bold text-[11px] py-1.5 px-2.5 rounded-lg shadow-sm transition-colors"
                              >
                                Fulfill Pick Up
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                ) : activeTab === 'history' ? (
                    myCollections.length === 0 ? (
                      <div className="text-center py-12">
                        <Truck className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm text-gray-500 font-bold">No collections processed by you yet</p>
                        <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                          Use the left form to document incoming citizen waste drops and award digital Rupiahs.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {myCollections.map((col) => (
                          <div
                            key={col.id}
                            className="border border-gray-100 bg-slate-50/20 rounded-xl p-4 shadow-sm flex items-start justify-between flex-wrap gap-4"
                          >
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 font-mono">
                                <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded font-bold">
                                  {col.garbageType}
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  {new Date(col.collectedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                                </span>
                              </div>
                              <p className="text-xs text-slate-500 font-medium pt-1">
                                Citizen: <span className="text-slate-800 font-bold">{col.userName}</span>
                              </p>
                              <div className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                                <Scale className="h-3.5 w-3.5 text-gray-400" />
                                <span>Actual Weight: <span className="font-extrabold text-slate-700">{col.weightKg} KG</span></span>
                              </div>
                            </div>

                            <div className="text-right">
                              <p className="text-xs text-gray-400 font-semibold font-mono">Paid Disbursed</p>
                              <p className="text-sm font-mono font-black text-emerald-600">Rs. {col.rewardAmount}</p>
                              <p className="text-[9px] text-gray-400 font-mono mt-0.5">{col.id}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  ) : (
                    <TruckSchedule />
                  )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
