import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Leaf, 
  PlusCircle, 
  History, 
  ListFilter, 
  ClipboardCheck, 
  Wallet, 
  BadgeCheck, 
  FileText, 
  MapPin, 
  Gauge, 
  ArrowRight, 
  Check, 
  X, 
  HelpCircle, 
  Phone, 
  Mail, 
  Truck, 
  Compass, 
  Bell, 
  AlertCircle, 
  Navigation,
  Clock,
  ArrowUpRight,
  Calendar
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../api';
import { User, Report, Collection } from '../types';
import LoadingSpinner from '../components/LoadingSpinner';
import TruckSchedule from '../components/TruckSchedule';
import RealTimeVehicleTracker from '../components/RealTimeVehicleTracker';

interface UserDashboardProps {
  user: User | null;
  onRefreshUser: () => Promise<void>;
}

export default function UserDashboard({ user, onRefreshUser }: UserDashboardProps) {
  const [reports, setReports] = useState<Report[]>([]);
  const [history, setHistory] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [wasteType, setWasteType] = useState<'Plastic' | 'Paper' | 'Metal' | 'Organic' | 'E-waste'>('Plastic');
  const [estimatedWeight, setEstimatedWeight] = useState('');
  const [location, setLocation] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Tabs for the list: reports, history, withdrawals, tracking, or schedules
  const [activeTab, setActiveTab ] = useState<'reports' | 'history' | 'withdrawals' | 'tracking' | 'schedules'>('reports');

  const routeLocation = useLocation();

  useEffect(() => {
    if (routeLocation.pathname === '/create-report') {
      setActiveTab('reports');
      // Scroll to report input form smooth on screen
      setTimeout(() => {
        const formEl = document.querySelector('form');
        if (formEl) {
          formEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          formEl.classList.add('ring-2', 'ring-emerald-500', 'ring-offset-2');
          setTimeout(() => {
            formEl.classList.remove('ring-2', 'ring-emerald-500', 'ring-offset-2');
          }, 2000);
        }
      }, 150);
    } else if (routeLocation.pathname === '/my-reports') {
      setActiveTab('reports');
    } else if (routeLocation.pathname === '/collection-history') {
      setActiveTab('history');
    } else if (routeLocation.pathname === '/dashboard') {
      setActiveTab('reports');
    }
  }, [routeLocation.pathname]);

  // Withdraw Modal States
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawMethod, setWithdrawMethod] = useState('eSewa');
  const [withdrawAccount, setWithdrawAccount] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawList, setWithdrawList] = useState<any[]>([]);

  // Notification / Tracking configuration states
  const [phoneNo, setPhoneNo] = useState(user?.phone || '+977-9841999999');
  const [gmailAddress, setGmailAddress] = useState(user?.email || 'alexgupta609@gmail.com');
  const [enableSms, setEnableSms] = useState(true);
  const [enableGmail, setEnableGmail] = useState(true);
  const [notificationsList, setNotificationsList] = useState<any[]>([]);

  // Transit Simulation states
  const [selectedReportForTracking, setSelectedReportForTracking] = useState<Report | null>(null);
  const [trackingActive, setTrackingActive] = useState(false);
  const [simulatedDistance, setSimulatedDistance] = useState(5.4); // ranges from 5.4 down to 0
  const [alertTriggered, setAlertTriggered] = useState(false);
  const [apiActiveTrips, setApiActiveTrips] = useState<any[]>([]);

  const handleCallDriverSim = (driverName: string) => {
    toast(`📞 Live cellular call simulator to ${driverName} (+977-9841883299) initiated...\n"Namaste citizen! I am navigating the Thapathali-Kalimati underpass. On my way towards your site!"`, {
      icon: '📞',
      duration: 5000,
      style: {
        background: '#047857',
        color: '#ffffff',
        fontSize: '12px'
      }
    });
  };

  const handleMessageDriverSim = (driverName: string) => {
    toast.success(`💬 Automatic SMS sent to ${driverName}: "Hello driver, my segregated ${selectedReportForTracking ? selectedReportForTracking.wasteType : 'waste'} bag is ready near the curb. Please signal your arrival."`, {
      icon: '💬',
      duration: 5000
    });
  };

  // Poll driver traveling GPS states persistently
  const fetchApiActiveTrips = async () => {
    try {
      const res = await api.get('/trips/active');
      if (res.data.success) {
        setApiActiveTrips(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching API active trips:', err);
    }
  };

  useEffect(() => {
    fetchApiActiveTrips();
    const interval = setInterval(() => {
      fetchApiActiveTrips();
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Poll alert logs persistently
  useEffect(() => {
    const notifyPoll = setInterval(() => {
      fetchNotifications();
    }, 3000);
    return () => clearInterval(notifyPoll);
  }, []);

  // Live countdown ticker simulator
  useEffect(() => {
    let timer: any;
    if (trackingActive && simulatedDistance > 0) {
      timer = setInterval(() => {
        setSimulatedDistance((prev) => {
          const next = parseFloat((prev - 0.1).toFixed(1));
          if (next <= 0) {
            clearInterval(timer);
            setTrackingActive(false);
            toast.success('🚛 Vehicle has arrived at your reported location!');
            return 0;
          }
          return next;
        });
      }, 1000); // represents moving 0.1 km every 1 second
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [trackingActive, simulatedDistance]);

  // Handle 5-Min Alert trigger point (2.5 km represents exactly 5 minutes out assuming 30 km/h)
  useEffect(() => {
    if (simulatedDistance <= 2.5 && simulatedDistance > 0 && !alertTriggered && selectedReportForTracking) {
      setAlertTriggered(true);
      
      const fireSimulationAlerts = async () => {
        try {
          if (enableSms) {
            await api.post('/notifications/log', {
              type: 'sms',
              recipient: phoneNo,
              title: 'EcoTrack - 5 Mins Warning',
              message: `[SMS Alert] Dear Citizen, EcoTrack municipal waste truck is exactly 5 minutes (2.5 km) away from '${selectedReportForTracking.location}'. Please consolidate your garbage bag near the curb.`
            });
          }

          if (enableGmail) {
            await api.post('/notifications/log', {
              type: 'email',
              recipient: gmailAddress,
              title: 'EcoTrack Nepal - 5 Minutes to Collection Arrival',
              message: `[Gmail Notification] Driver Ram Bahadur is en-route and approximately 5 minutes away from your waste accumulation site in '${selectedReportForTracking.location}'. Thank you for supporting ward cleanliness!`
            });
          }

          toast('📢 SMS Warning & Gmail Arrival alerts dispatched (5 Min Warning)!', {
            icon: '🔔',
            duration: 6000,
            style: {
              background: '#047857',
              color: '#ffffff'
            }
          });

          // Reload notifications list
          fetchNotifications();
        } catch (err) {
          console.error('Failed to trigger arrival alerts:', err);
        }
      };

      fireSimulationAlerts();
    }
  }, [simulatedDistance, alertTriggered, selectedReportForTracking]);

  // Data fetching
  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications/my-notifications');
      if (res.data.success) {
        setNotificationsList(res.data.data);
      }
    } catch (err) {
      console.error('Error loading SMS/Gmail notification events:', err);
    }
  };

  const fetchWithdrawals = async () => {
    try {
      const res = await api.get('/wallet/withdrawals');
      if (res.data.success) {
        setWithdrawList(res.data.data);
      }
    } catch (err) {
      console.error('Error loading withdrawal history:', err);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const [reportsRes, historyRes] = await Promise.all([
        api.get('/reports/my-reports'),
        api.get('/collections/user-history')
      ]);

      if (reportsRes.data.success) {
        setReports(reportsRes.data.data);
        // Preselect first pending report for tracking if available
        const pending = reportsRes.data.data.find((r: Report) => r.status === 'Pending');
        if (pending) {
          setSelectedReportForTracking(pending);
        }
      }
      if (historyRes.data.success) {
        setHistory(historyRes.data.data);
      }

      await Promise.all([fetchNotifications(), fetchWithdrawals()]);
    } catch (err: any) {
      toast.error('Could not download history records. Check connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim() || !location.trim() || !estimatedWeight) {
      toast.error('All report fields are required.');
      return;
    }

    const weightNum = parseFloat(estimatedWeight);
    if (isNaN(weightNum) || weightNum <= 0) {
      toast.error('Please input a valid positive estimated weight.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/reports/create', {
        title,
        description,
        wasteType,
        estimatedWeight: weightNum,
        location
      });

      if (res.data.success) {
        toast.success(res.data.message || 'Report submitted to municipal drivers!');
        // Reset form
        setTitle('');
        setDescription('');
        setEstimatedWeight('');
        setLocation('');
        setWasteType('Plastic');
        
        // Refresh data & wallet balance
        fetchData();
        await onRefreshUser();
      } else {
        toast.error(res.data.message || 'Could not register report.');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error processing report form.');
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Cash-out Submit
  const handleWithdrawalRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(withdrawAmount);

    if (isNaN(amountNum) || amountNum <= 0) {
      toast.error('Please specify a positive cash amount to withdraw.');
      return;
    }

    if (!user || user.walletBalance < amountNum) {
      toast.error('Incorrect amount: limit exceeds your active Kathmandu Wallet balance.');
      return;
    }

    if (!withdrawAccount.trim()) {
      toast.error('Provide payee mobile identification or wallet username.');
      return;
    }

    try {
      setIsWithdrawing(true);
      const res = await api.post('/wallet/withdraw', {
        amount: amountNum,
        method: withdrawMethod,
        accountDetails: withdrawAccount
      });

      if (res.data.success) {
        toast.success(`Withdrawn successfully! Rs. ${amountNum} transferred to your ${withdrawMethod}.`);
        setIsWithdrawModalOpen(false);
        setWithdrawAmount('');
        setWithdrawAccount('');
        
        // Reload wallet profile & local history records
        await onRefreshUser();
        fetchData();
      } else {
        toast.error(res.data.message || 'Transfer failed.');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error executing wallet pay-out.');
    } finally {
      setIsWithdrawing(false);
    }
  };

  const startTrackingSimulation = (report: Report) => {
    setSelectedReportForTracking(report);
    setSimulatedDistance(5.4);
    setAlertTriggered(false);
    setTrackingActive(true);
    setActiveTab('tracking');
    toast.success(`Dispatched municipal truck to track collection point in '${report.location}'!`);
  };

  // Aggregated KPIs
  const totalContributedKg = history.reduce((sum, c) => sum + c.weightKg, 0);
  const totalRewardsCash = history.reduce((sum, c) => sum + c.rewardAmount, 0);
  const collectionsCount = history.length;
  const pendingCount = reports.filter(r => r.status === 'Pending').length;

  return (
    <div className="max-w-screen-2xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* Greeting Header */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-sans text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Citizen Dashboard
          </h1>
          <p className="text-gray-500 dark:text-slate-400 font-light mt-1">
            Welcome back, <span className="font-semibold text-emerald-700 dark:text-emerald-400">{user?.name}</span>. Thank you for making Kathmandu cleaner!
          </p>
        </div>

        {/* Dynamic Wallet Box with Withdraw Option */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-4 flex items-center justify-between gap-4 w-full md:w-auto md:min-w-[320px] transition-colors">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 p-2.5 rounded-xl">
              <Wallet className="h-6 w-6 text-emerald-600 dark:text-emerald-400 animate-pulse" />
            </div>
            <div>
              <span className="text-xs text-gray-400 dark:text-slate-400 block font-semibold uppercase">Wallet Balance</span>
              <span className="text-2xl font-mono font-bold text-gray-950 dark:text-white">
                Rs. {user?.walletBalance.toLocaleString() || '0'}
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsWithdrawModalOpen(true)}
            id="wallet-withdraw-btn"
            className="bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white font-bold text-xs py-2 px-4 rounded-xl transition-all shadow-sm shadow-emerald-100 dark:shadow-none hover:shadow active:scale-95 flex items-center gap-1 cursor-pointer"
          >
            Withdraw <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-900/60 p-5 rounded-2xl border border-gray-150 dark:border-slate-800 shadow-sm transition-colors">
          <span className="text-gray-400 dark:text-slate-400 text-xs font-semibold uppercase block">Contributed Weight</span>
          <span className="text-3xl font-mono font-bold text-slate-900 dark:text-white mt-1 block">
            {totalContributedKg.toFixed(1)} <span className="text-xs text-gray-500 dark:text-slate-400 font-sans">KG</span>
          </span>
        </div>
        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-900/60 p-5 rounded-2xl border border-gray-150 dark:border-slate-800 shadow-sm transition-colors">
          <span className="text-gray-400 dark:text-slate-400 text-xs font-semibold uppercase block">Total Cash Earned</span>
          <span className="text-3xl font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
            Rs. {totalRewardsCash.toLocaleString()}
          </span>
        </div>
        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-900/60 p-5 rounded-2xl border border-gray-150 dark:border-slate-800 shadow-sm transition-colors">
          <span className="text-gray-400 dark:text-slate-400 text-xs font-semibold uppercase block">Closed Pickups</span>
          <span className="text-3xl font-mono font-bold text-blue-600 dark:text-blue-400 mt-1 block">
            {collectionsCount}
          </span>
        </div>
        <div className="bg-gradient-to-br from-white to-gray-50 dark:from-slate-900 dark:to-slate-900/60 p-5 rounded-2xl border border-gray-150 dark:border-slate-800 shadow-sm transition-colors">
          <span className="text-gray-400 dark:text-slate-400 text-xs font-semibold uppercase block">Pending Pickups</span>
          <span className="text-3xl font-mono font-bold text-amber-500 dark:text-amber-400 mt-1 block">
            {pendingCount}
          </span>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner message="Syncing environmental records..." />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Create Report Form: Card Container */}
          <div className="lg:col-span-1 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-md h-fit transition-colors">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              Report Waste Accumulation
            </h2>
            <form onSubmit={handleCreateReport} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">Incident Title / Brief</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="block w-full py-2 px-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 bg-gray-50 dark:bg-slate-800 text-sm dark:text-slate-150 outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  placeholder="e.g. Pile of plastics by New Road corner"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">Detailed Description</label>
                <textarea
                  required
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="block w-full py-2 px-3 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 bg-gray-50 dark:bg-slate-800 text-sm dark:text-slate-150 outline-none transition-all resize-none placeholder:text-gray-400 dark:placeholder:text-gray-500"
                  placeholder="Tell drivers about accessibility, size, bags, or notes..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">Waste Category</label>
                  <select
                    value={wasteType}
                    onChange={(e: any) => setWasteType(e.target.value)}
                    className="block w-full py-2 px-3 border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800 text-sm dark:text-slate-150 focus:ring-2 focus:ring-emerald-500/25 outline-none transition-all"
                  >
                    <option value="Plastic">Plastic</option>
                    <option value="Paper">Paper</option>
                    <option value="Metal">Metal</option>
                    <option value="Organic">Organic</option>
                    <option value="E-waste">E-waste</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1">Est. Weight (KG)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={estimatedWeight}
                    onChange={(e) => setEstimatedWeight(e.target.value)}
                    className="block w-full py-2 px-3 border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800 text-sm dark:text-slate-150 focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    placeholder="e.g. 4.5"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-slate-400 mb-1"> Kathmandu Location / Ward / Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-4 w-4 text-gray-400 dark:text-slate-500" />
                  </div>
                  <input
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="block w-full pl-9 pr-3 py-2 border border-gray-200 dark:border-slate-700 rounded-xl bg-gray-50 dark:bg-slate-800 text-sm dark:text-slate-150 focus:ring-2 focus:ring-emerald-500/25 focus:border-emerald-500 outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500"
                    placeholder="e.g. New Baneshwor near block C"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 inline-flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-2.5 px-4 rounded-xl shadow-sm transition-colors cursor-pointer"
              >
                {submitting ? 'Lodging report...' : 'Submit Garbage Report'}
              </button>
            </form>
          </div>

          {/* List and Tabs panel: Card Container */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-md overflow-hidden transition-colors">
            <div className="flex border-b border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50 flex-wrap select-none">
              <button
                onClick={() => setActiveTab('reports')}
                className={`flex-1 py-4 px-3 text-center text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'reports'
                    ? 'border-emerald-600 dark:border-emerald-500 text-emerald-850 dark:text-emerald-400 bg-white dark:bg-slate-900'
                    : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'
                }`}
              >
                <FileText className="h-4 w-4" /> Submitted ({reports.length})
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`flex-1 py-4 px-3 text-center text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'history'
                    ? 'border-emerald-600 dark:border-emerald-500 text-emerald-850 dark:text-emerald-400 bg-white dark:bg-slate-900'
                    : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'
                }`}
              >
                <History className="h-4 w-4" /> Earnings ({history.length})
              </button>
              <button
                onClick={() => setActiveTab('tracking')}
                className={`flex-1 py-4 px-3 text-center text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'tracking'
                    ? 'border-emerald-600 dark:border-emerald-500 text-emerald-850 dark:text-emerald-400 bg-white dark:bg-slate-900 animate-pulse'
                    : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'
                }`}
              >
                <Compass className="h-4 w-4 text-emerald-600 dark:text-emerald-400" /> Route Tracking
              </button>
              <button
                onClick={() => setActiveTab('withdrawals')}
                className={`flex-1 py-4 px-3 text-center text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'withdrawals'
                    ? 'border-emerald-600 dark:border-emerald-500 text-emerald-850 dark:text-emerald-400 bg-white dark:bg-slate-900'
                    : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'
                }`}
              >
                <Wallet className="h-4 w-4" /> Withdrawals ({withdrawList.length})
              </button>
              <button
                onClick={() => setActiveTab('schedules')}
                className={`flex-1 py-4 px-3 text-center text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'schedules'
                    ? 'border-emerald-600 dark:border-emerald-500 text-emerald-850 dark:text-emerald-400 bg-white dark:bg-slate-900'
                    : 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-200'
                }`}
              >
                <Calendar className="h-4 w-4" /> Truck Schedules
              </button>
            </div>

            <div className="p-6">
              {activeTab === 'reports' && (
                /* Submitted Reports List */
                reports.length === 0 ? (
                  <div className="text-center py-12">
                    <ClipboardCheck className="h-10 w-10 text-gray-300 dark:text-slate-700 mx-auto mb-2 animate-bounce" />
                    <p className="text-sm text-gray-500 dark:text-slate-400 font-bold">No active reports</p>
                    <p className="text-xs text-gray-400 dark:text-slate-500 mt-1 max-w-sm mx-auto">
                      Any waste accumulation piles you log will show up here. Report some trash outside to kickstart collection!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reports.map((report) => (
                      <div
                        key={report.id}
                        className="border border-gray-100 dark:border-slate-800 rounded-xl p-4 shadow-sm bg-gradient-to-r from-white to-gray-50 dark:from-slate-900 dark:to-slate-900/60 flex items-start justify-between flex-wrap gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                report.status === 'Pending'
                                  ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                  : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              }`}
                            >
                              {report.status}
                            </span>
                            <span className="text-[10px] bg-slate-100 border border-slate-200 text-slate-700 px-2.5 py-0.5 rounded-full font-semibold font-mono">
                              {report.wasteType}
                            </span>
                          </div>
                          <h3 className="font-bold text-gray-900 text-sm sm:text-base">{report.title}</h3>
                          <p className="text-xs text-gray-500 line-clamp-2">{report.description}</p>
                          <div className="flex items-center gap-1.5 text-[11px] text-gray-400 font-medium">
                            <MapPin className="h-3 w-3 text-gray-400" />
                            <span>{report.location}</span>
                          </div>
                        </div>

                        <div className="text-right sm:self-center flex flex-col items-end gap-2">
                          <div>
                            <p className="text-xs text-gray-400">Estimated</p>
                            <p className="text-sm font-mono font-extrabold text-gray-800">{report.estimatedWeight} KG</p>
                          </div>
                          {report.status === 'Pending' ? (
                            <button
                              onClick={() => startTrackingSimulation(report)}
                              className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-[11px] font-bold py-1 px-2.5 rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                            >
                              <Compass className="h-3 w-3 text-emerald-600 shrink-0" /> Track Truck
                            </button>
                          ) : (
                            <p className="text-[10px] text-emerald-600 font-semibold font-mono bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                              Cleared
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

              {activeTab === 'history' && (
                /* Wallet Earnings History List */
                history.length === 0 ? (
                  <div className="text-center py-12">
                    <BadgeCheck className="h-10 w-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 font-bold">No collections processed yet</p>
                    <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                      Once a municipal driver weighs and cleans up your reported waste piles, your virtual wallet updates and receipts register here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {history.map((col) => (
                      <div
                        key={col.id}
                        className="border border-emerald-100 bg-emerald-50/10 rounded-xl p-4 shadow-sm flex items-start justify-between flex-wrap gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] bg-slate-100 border border-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono font-bold">
                              {col.garbageType}
                            </span>
                            <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-100/50 border border-emerald-100 px-2 py-0.5 rounded">
                              Collected & Paid
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 font-medium mt-1">
                            Driver: <span className="text-slate-800 font-bold">{col.driverName}</span>
                          </p>
                          <div className="text-[11px] text-slate-400 flex items-center gap-1">
                            <BadgeCheck className="h-3 w-3 text-emerald-500" />
                            <span>Weighed: <span className="font-mono font-semibold text-slate-700">{col.weightKg} KG</span></span>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-xs text-gray-400">Total Reward</p>
                          <p className="text-sm font-mono font-black text-emerald-600">+ Rs. {col.rewardAmount}</p>
                          <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                            {new Date(col.collectedAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

              {activeTab === 'tracking' && (() => {
                const activeServerTrip = selectedReportForTracking 
                  ? apiActiveTrips.find(t => t.reportId === selectedReportForTracking.id)
                  : null;
                const genericServerTrip = apiActiveTrips.length > 0 ? apiActiveTrips[0] : null;
                const resolvedDistance = activeServerTrip 
                  ? activeServerTrip.distanceKm 
                  : (genericServerTrip ? genericServerTrip.distanceKm : simulatedDistance);
                const isServerDriven = !!(activeServerTrip || genericServerTrip);
                const activeDriverName = activeServerTrip 
                  ? activeServerTrip.driverName 
                  : (genericServerTrip ? `${genericServerTrip.driverName} (Active Cargo)` : 'Ram Bahadur');
                const resolvedStatusMsg = activeServerTrip
                  ? (activeServerTrip.status === 'arrived' ? 'ARRIVED at Site' : 'EN ROUTE (GPS live)')
                  : (genericServerTrip ? `EN ROUTE (closer destination)` : (trackingActive ? 'EN ROUTE' : 'DISPATCH HQ'));
                return (
                /* Interactive Driver Vehicle Tracking Panel */
                <div className="space-y-6">
                  {/* Select Report to track */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Target Pickup Event</h4>
                      {selectedReportForTracking ? (
                        <div className="mt-1 flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-emerald-600 shrink-0" />
                          <div>
                            <p className="text-sm font-bold text-slate-900">{selectedReportForTracking.title}</p>
                            <p className="text-xs text-slate-500">{selectedReportForTracking.location}</p>
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 mt-1">Select one of your Pending reports to begin logistics trace.</p>
                      )}
                    </div>

                    <div className="w-full sm:w-auto shrink-0">
                      <select
                        onChange={(e) => {
                          const r = reports.find((item) => item.id === e.target.value);
                          if (r) {
                            setSelectedReportForTracking(r);
                            setSimulatedDistance(5.4);
                            setAlertTriggered(false);
                            setTrackingActive(false);
                          }
                        }}
                        value={selectedReportForTracking?.id || ''}
                        className="w-full sm:w-auto text-xs font-bold border border-gray-300 rounded-lg p-2 bg-white"
                      >
                        <option value="">-- Choose Live Report --</option>
                        {reports.filter((r) => r.status === 'Pending').map((r) => (
                          <option key={r.id} value={r.id}>{r.title} ({r.location})</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Tracking Animation State Map */}
                  {selectedReportForTracking ? (
                    <div className="space-y-6">
                        {/* Active status alerts banner */}
                        {isServerDriven && (
                          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-blue-950 p-4 rounded-xl text-xs font-semibold flex items-center gap-2.5 shadow-sm">
                            <span className="relative flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                            {apiActiveTrips.some(t => t.reportId === selectedReportForTracking.id) ? (
                              <span>Dynamic GPS radar locked on driver '{activeDriverName}' en-route to your site! Email alerts dispatched automatically.</span>
                            ) : (
                              <span>EcoTrack dispatch truck en-route in Kathmandu (heading to closer destination). Showing live transit radar coordinates.</span>
                            )}
                          </div>
                        )}

                        {/* Active Status Header */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-900 rounded-2xl p-4 border border-slate-800 text-white shadow-md">
                          <div className="border-r border-slate-800 pr-2">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Tracking Status</span>
                            <span className={`text-xs mt-1 font-extrabold flex items-center gap-1 ${resolvedDistance <= 0.1 ? 'text-green-400' : 'text-blue-400 animate-pulse'}`}>
                              <Truck className="h-3.5 w-3.5" />
                              {resolvedDistance <= 0.1 ? 'ARRIVED at Site' : resolvedStatusMsg}
                            </span>
                          </div>
                          <div className="border-r border-slate-800 px-2">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Odometer Distance</span>
                            <span className="text-sm font-mono font-bold mt-1 block">
                              {resolvedDistance.toFixed(1)} km
                            </span>
                          </div>
                          <div className="border-r border-slate-800 px-2 font-mono">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Est. Arrival Time (ETA)</span>
                            <span className="text-sm font-bold mt-1 text-amber-400 block">
                              {(resolvedDistance * 2).toFixed(1)} mins
                            </span>
                          </div>
                          <div className="pl-2">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Assigned Driver</span>
                            <span className="text-xs font-bold mt-1 block truncate">
                              {activeDriverName}
                            </span>
                          </div>
                        </div>

                        {/* Interactive Logistics Stage Stepper */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition-colors">
                          <h5 className="text-[10px] font-extrabold uppercase text-slate-400 dark:text-slate-500 block tracking-widest mb-4">
                            Collection Phase Timeline Status
                          </h5>
                          
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-4 relative">
                            {/* Running Background Line */}
                            <div className="hidden md:block absolute left-6 right-6 top-4.5 h-0.5 bg-gray-155 dark:bg-slate-850 z-0" />
                            {/* Running Active Line based on progress */}
                            <div 
                              className="hidden md:block absolute left-6 top-4.5 h-0.5 bg-emerald-500 z-0 transition-all duration-300"
                              style={{ 
                                width: resolvedDistance <= 0.1 
                                  ? '91%' 
                                  : resolvedDistance <= 2.5 
                                  ? '60%' 
                                  : resolvedDistance < 6.0 
                                  ? '30%' 
                                  : '0%' 
                              }}
                            />

                            {/* Step 1: Logged */}
                            <div className="flex md:flex-col items-center gap-3 md:gap-1.5 z-10 w-full md:w-1/4">
                              <div className="h-9 w-9 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold text-xs ring-4 ring-emerald-50 dark:ring-emerald-950/40 shadow-sm shrink-0">
                                ✓
                              </div>
                              <div className="md:text-center">
                                <p className="text-xs font-bold text-slate-850 dark:text-slate-200">Report Logged</p>
                                <p className="text-[10px] text-slate-400 dark:text-slate-500">Submitted to Municipality</p>
                              </div>
                            </div>

                            {/* Step 2: Traveling */}
                            <div className="flex md:flex-col items-center gap-3 md:gap-1.5 z-10 w-full md:w-1/4">
                              <div className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-all ${
                                resolvedDistance < 6.0
                                  ? 'bg-emerald-500 text-white ring-4 ring-emerald-50 dark:ring-emerald-950/40'
                                  : 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-600'
                              }`}>
                                {resolvedDistance <= 0.1 ? '✓' : '2'}
                              </div>
                              <div className="md:text-center">
                                <p className={`text-xs font-bold ${resolvedDistance < 6.0 ? 'text-slate-850 dark:text-slate-200' : 'text-slate-400 dark:text-slate-600'}`}>
                                  Driver Dispatched
                                </p>
                                <p className="text-[10px] text-slate-405 dark:text-slate-500">En-route GPS lock</p>
                              </div>
                            </div>

                            {/* Step 3: En route near site */}
                            <div className="flex md:flex-col items-center gap-3 md:gap-1.5 z-10 w-full md:w-1/4">
                              <div className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-all ${
                                resolvedDistance <= 2.5
                                  ? 'bg-emerald-500 text-white ring-4 ring-emerald-50 dark:ring-emerald-950/40 animate-pulse'
                                  : 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-600'
                              }`}>
                                {resolvedDistance <= 0.1 ? '✓' : '3'}
                              </div>
                              <div className="md:text-center">
                                <p className={`text-xs font-bold ${resolvedDistance <= 2.5 ? 'text-slate-850 dark:text-slate-200' : 'text-slate-400 dark:text-slate-600'}`}>
                                  5-Min Warning
                                </p>
                                <p className="text-[10px] text-slate-405 dark:text-slate-500">Alert relays active</p>
                              </div>
                            </div>

                            {/* Step 4: Arrived */}
                            <div className="flex md:flex-col items-center gap-3 md:gap-1.5 z-10 w-full md:w-1/4">
                              <div className={`h-9 w-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-all ${
                                resolvedDistance <= 0.1
                                  ? 'bg-emerald-600 text-white ring-4 ring-emerald-50 dark:ring-emerald-950/40 font-mono text-[14px]'
                                  : 'bg-gray-100 dark:bg-slate-800 text-gray-400 dark:text-slate-600'
                              }`}>
                                {resolvedDistance <= 0.1 ? '🏁' : '4'}
                              </div>
                              <div className="md:text-center">
                                <p className={`text-xs font-bold ${resolvedDistance <= 0.1 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-600'}`}>
                                  Arrived closely
                                </p>
                                <p className="text-[10px] text-slate-405 dark:text-slate-500">Awaiting direct load</p>
                              </div>
                            </div>
                          </div>
                        </div>

                      {/* Real-time Vehicle Tracking Map */}
                      <RealTimeVehicleTracker 
                        selectedLocation={selectedReportForTracking.location}
                        distance={simulatedDistance}
                        onDistanceChange={setSimulatedDistance}
                        onTrackingStateChange={setTrackingActive}
                      />

                      {/* Driver Details & Life GPS HUD Overlay Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Driver Card */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition-colors">
                          <h4 className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider mb-3">
                            Assigned Logistics Crew
                          </h4>

                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold text-lg select-none uppercase shadow-sm">
                              {activeDriverName ? activeDriverName.charAt(0) : 'R'}
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-sans font-extrabold text-slate-800 dark:text-white flex items-center gap-1.5 leading-snug">
                                {activeDriverName}
                                <span className="bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wider scale-95 border border-emerald-100 dark:border-emerald-900">
                                  Verified Cargo
                                </span>
                              </p>
                              <p className="text-[11px] text-gray-400 mt-0.5 font-sans">
                                Truck ID: <span className="font-mono text-slate-600 dark:text-slate-300 font-bold">BA-3-PA 8021</span> • Ratings: ⭐ 4.9
                              </p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-3 mt-4">
                            <button
                              onClick={() => handleCallDriverSim(activeDriverName)}
                              className="bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 border border-gray-150 dark:border-slate-800 font-sans text-xs font-bold py-2 px-3 rounded-xl transition-all text-slate-705 dark:text-slate-300 cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <Phone className="h-3.5 w-3.5 text-emerald-600" />
                              Dial Call
                            </button>
                            <button
                              onClick={() => handleMessageDriverSim(activeDriverName)}
                              className="bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-800 border border-gray-150 dark:border-slate-800 font-sans text-xs font-bold py-2 px-3 rounded-xl transition-all text-slate-705 dark:text-slate-300 cursor-pointer flex items-center justify-center gap-1.5"
                            >
                              <Mail className="h-3.5 w-3.5 text-teal-600" />
                              Send SMS
                            </button>
                          </div>
                        </div>

                        {/* Impact HUD Card */}
                        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition-colors">
                          <h4 className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 tracking-wider mb-2">
                            Eco-Impact & Speed HUD
                          </h4>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Est. Speed</span>
                              <span className="text-xl font-mono font-black text-slate-800 dark:text-white flex items-baseline gap-1 mt-0.5 leading-none">
                                {trackingActive ? '28.4' : '0'}
                                <span className="text-[10px] text-gray-400 font-sans font-semibold uppercase">km/h</span>
                              </span>
                              <span className="text-[10px] text-slate-400 font-sans font-medium mt-1 block">
                                {trackingActive ? 'Active transit' : 'Crew idling'}
                              </span>
                            </div>

                            <div>
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Carbon Offset</span>
                              <span className="text-xl font-mono font-black text-emerald-600 dark:text-emerald-400 flex items-baseline gap-1 mt-0.5 leading-none">
                                {selectedReportForTracking ? (selectedReportForTracking.estimatedWeight * 2.3).toFixed(1) : "0.0"}
                                <span className="text-[10px] text-emerald-500 font-sans font-semibold uppercase">kg CO₂</span>
                              </span>
                              <span className="text-[10px] text-slate-405 dark:text-slate-500 font-sans font-medium mt-1 block line-clamp-1 truncate">
                                {selectedReportForTracking?.wasteType === 'Plastic'
                                  ? 'Saves plastic oil CO₂.'
                                  : selectedReportForTracking?.wasteType === 'Paper'
                                  ? 'Saves local forests.'
                                  : selectedReportForTracking?.wasteType === 'Metal'
                                  ? 'Avoids smelting CO₂.'
                                  : selectedReportForTracking?.wasteType === 'Organic'
                                  ? 'Prevents land gas decay.'
                                  : 'Mitigates toxic leakage.'}
                              </span>
                            </div>
                          </div>

                          <div className="mt-4 pt-3 border-t border-gray-100 dark:border-slate-800 flex items-center justify-between text-[10px] font-semibold text-slate-400">
                            <span className="flex items-center gap-1">
                              <Compass className="h-3 w-3 text-sky-500 animate-spin" style={{ animationDuration: '6s' }} /> GPS Connected
                            </span>
                            <span className="font-mono bg-slate-50 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[9px] font-black text-emerald-705 dark:text-emerald-350">
                              HD 3D FIX
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Notification preferences and alerts history split */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Preferences card */}
                        <div className="bg-slate-50 p-5 rounded-2xl border border-gray-150">
                          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 mb-2">
                            <Bell className="h-4.5 w-4.5 text-amber-600" />
                            Alert Messaging Options
                          </h3>
                          <p className="text-xs text-gray-400 leading-normal mb-4">
                            Configure active SMS / email targets. A simulated broadcast triggers automatically 5 minutes before the vehicle drives into your area.
                          </p>

                          <div className="space-y-4">
                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                                <span className="flex items-center gap-1"><Phone className="h-3 w-3 text-emerald-600" /> Phone Number (SMS Target)</span>
                              </label>
                              <input
                                type="text"
                                value={phoneNo}
                                onChange={(e) => setPhoneNo(e.target.value)}
                                className="block w-full text-xs font-mono p-2 border border-gray-300 bg-white rounded-lg focus:ring-1 focus:ring-emerald-500 outline-none"
                                placeholder="+977-9841..."
                              />
                              <label className="flex items-center gap-2 mt-1.5 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={enableSms}
                                  onChange={(e) => setEnableSms(e.target.checked)}
                                  className="accent-emerald-600"
                                />
                                <span className="text-[11px] text-slate-500 font-medium">Activate simulated SMS messaging services</span>
                              </label>
                            </div>

                            <hr className="border-slate-200" />

                            <div>
                              <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                                <span className="flex items-center gap-1"><Mail className="h-3 w-3 text-red-600" /> Google Gmail Address</span>
                              </label>
                              <input
                                type="email"
                                value={gmailAddress}
                                onChange={(e) => setGmailAddress(e.target.value)}
                                className="block w-full text-xs font-mono p-2 border border-gray-300 bg-white rounded-lg focus:ring-1 focus:ring-emerald-500 outline-none"
                                placeholder="name@gmail.com"
                              />
                              <label className="flex items-center gap-2 mt-1.5 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={enableGmail}
                                  onChange={(e) => setEnableGmail(e.target.checked)}
                                  className="accent-emerald-600"
                                />
                                <span className="text-[11px] text-slate-500 font-medium">Activate simulated Gmail/email messaging services</span>
                              </label>
                            </div>
                          </div>
                        </div>

                        {/* Logs list box */}
                        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-xs max-h-[295px] overflow-y-auto">
                          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5 mb-2 border-b border-gray-150 pb-2">
                            <AlertCircle className="h-4.5 w-4.5 text-blue-500" />
                            Transmission Activity Feed
                          </h3>
                          {notificationsList.length === 0 ? (
                            <p className="text-xs text-gray-400 italic text-center py-10">No alert logs registered. Start the route to trigger proximity warnings!</p>
                          ) : (
                            <div className="space-y-3">
                              {notificationsList.map((notif: any) => (
                                <div key={notif.id} className="text-xs border border-gray-100 p-2.5 rounded-lg bg-slate-50">
                                  <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1">
                                    <span className="font-black font-mono uppercase bg-emerald-100 text-emerald-800 px-1 py-0.5 rounded">
                                      {notif.type}
                                    </span>
                                    <span>{new Date(notif.createdAt).toLocaleTimeString()}</span>
                                  </div>
                                  <p className="font-bold text-slate-800">{notif.title}</p>
                                  <p className="text-slate-500 mt-0.5 text-[11px] leading-relaxed select-all bg-white p-1.5 rounded border border-gray-150">
                                    {notif.message}
                                  </p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                      <Truck className="h-12 w-12 text-slate-300 mx-auto mb-2 animate-bounce" />
                      <p className="text-sm text-slate-600 font-bold">Select an Active Pickup Point first</p>
                      <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                        In order to track the driver's arrival distance, select or submit one of your active municipal reports above.
                      </p>
                    </div>
                  )}
                </div>
              ); })()}

              {activeTab === 'withdrawals' && (
                /* Withdrawal requests list */
                withdrawList.length === 0 ? (
                  <div className="text-center py-12">
                    <Wallet className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                    <p className="text-xs text-slate-500 font-bold">No withdrawals processed cash-out yet</p>
                    <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                      Whenever you submit a withdrawal request near the wallet balance, those completed bank slips record right here!
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {withdrawList.map((w: any) => (
                      <div
                        key={w.id}
                        className="border border-red-100 bg-red-50/5 rounded-xl p-4 shadow-sm flex items-start justify-between flex-wrap gap-4"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] bg-red-100 text-red-800 border border-red-200 px-2 py-0.5 rounded font-mono font-bold">
                              {w.method}
                            </span>
                            <span className="text-[10px] text-slate-500 font-semibold bg-gray-100 border border-gray-200 px-2 py-0.5 rounded">
                              Paid Account: {w.accountDetails}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 font-medium pt-1">
                            Status: <span className="text-emerald-700 font-extrabold">{w.status}</span>
                          </p>
                          <p className="text-[10px] text-gray-400 font-mono">
                            ID: {w.id}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className="text-xs text-red-600 font-bold">Debit Transfer</p>
                          <p className="text-sm font-mono font-black text-red-600">- Rs. {w.amount}</p>
                          <p className="text-[10px] text-gray-400 font-mono mt-0.5">
                            {new Date(w.createdAt).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

              {activeTab === 'schedules' && (
                <TruckSchedule />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cash Withdrawal Modal dialog screen */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[9999] animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-gray-150 relative">
            <button
              onClick={() => setIsWithdrawModalOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 bg-gray-50 border border-gray-100 rounded-full"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-2xl">
                <Wallet className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">Cash-out Wallet Balance</h3>
                <p className="text-[11px] text-gray-400">Available: Rs. {user?.walletBalance.toLocaleString() || '0'}</p>
              </div>
            </div>

            <form onSubmit={handleWithdrawalRequest} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Withdrawal Method
                </label>
                <select
                  required
                  value={withdrawMethod}
                  onChange={(e) => setWithdrawMethod(e.target.value)}
                  className="w-full text-xs font-bold p-3 border border-gray-200 rounded-xl bg-gray-50"
                >
                  <option value="eSewa">eSewa Mobile Wallet</option>
                  <option value="Khalti">Khalti Digital Wallet</option>
                  <option value="ConnectIPS">Connect IPS Gateway</option>
                  <option value="Nepal Bank Transfer">Nepal Co-operative Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Cash Amount (NPR)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-xs font-mono text-slate-400">
                    Rs.
                  </div>
                  <input
                    type="number"
                    min="1"
                    max={user?.walletBalance || 0}
                    required
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    className="w-full text-base font-mono font-bold pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800"
                    placeholder="e.g. 100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                  Recipient Account No. / Mobile Wallet ID
                </label>
                <input
                  type="text"
                  required
                  value={withdrawAccount}
                  onChange={(e) => setWithdrawAccount(e.target.value)}
                  className="w-full text-xs font-mono p-3 border border-gray-200 rounded-xl bg-gray-50 outline-none focus:ring-2 focus:ring-emerald-500/20 text-slate-800"
                  placeholder="e.g. +977-9841..."
                />
              </div>

              <div className="bg-slate-55 p-3 rounded-xl border border-gray-100 text-[11px] text-gray-500">
                ✔️ Balance is transferred directly within Kathmandu municipality clearing network. Gateway transfer fees: **Rs. 0 (Free)**.
              </div>

              <button
                type="submit"
                disabled={isWithdrawing}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-3 px-4 rounded-xl transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                {isWithdrawing ? 'Transferring NPR...' : 'Submit Cash-out Transfer'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
