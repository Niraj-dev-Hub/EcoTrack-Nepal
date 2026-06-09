import express, { Request, Response, NextFunction } from 'express';
import path from 'path';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { createServer as createViteServer } from 'vite';
import { dbOps, User, Report, Collection, readDb, writeDb, Withdrawal, NotificationLog, ActiveTrip } from './server/db';

// Define custom typings inline or extend Express Request directly
interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: 'user' | 'driver' | 'admin';
    name: string;
  };
}

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'ecotrack-kathmandu-secret-key-2026';

app.use(express.json());

// Logger middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Auth Middleware
function authenticateToken(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ success: false, message: 'Access denied. Token missing.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: 'user' | 'driver' | 'admin'; name: string };
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ success: false, message: 'Invalid or expired token.' });
  }
}

// Check Role Middleware
function requireRole(roles: Array<'user' | 'driver' | 'admin'>) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({ success: false, message: 'Unauthorized. Required role not found.' });
      return;
    }
    next();
  };
}

// ==========================================
// AUTH ROUTES
// ==========================================

// POST /api/auth/register
app.post('/api/auth/register', (req: Request, res: Response): void => {
  const { name, email, password, role, address, phone } = req.body;

  if (!name || !email || !password || !role) {
    res.status(400).json({ success: false, message: 'All fields (name, email, password, role) are required.' });
    return;
  }

  if (!['user', 'driver'].includes(role)) {
    res.status(400).json({ success: false, message: 'Invalid role selection.' });
    return;
  }

  // Check email redundancy
  const existing = dbOps.users.findOne({ email: email.toLowerCase() });
  if (existing) {
    res.status(400).json({ success: false, message: 'Email already registered.' });
    return;
  }

  try {
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const newUser = dbOps.users.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: role as 'user' | 'driver',
      address: address || '',
      phone: phone || ''
    });

    const token = jwt.sign(
      { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      data: {
        token,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          walletBalance: newUser.walletBalance,
          address: newUser.address,
          phone: newUser.phone,
          createdAt: newUser.createdAt
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: 'Registration failed: ' + error.message });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', (req: Request, res: Response): void => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ success: false, message: 'Email and password are required.' });
    return;
  }

  const user = dbOps.users.findOne({ email: email.toLowerCase() });
  if (!user) {
    res.status(401).json({ success: false, message: 'Invalid credentials.' });
    return;
  }

  const isMatch = bcrypt.compareSync(password, user.passwordHash);
  if (!isMatch) {
    res.status(401).json({ success: false, message: 'Invalid credentials.' });
    return;
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.status(200).json({
    success: true,
    message: 'Login successful.',
    data: {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        walletBalance: user.walletBalance,
        address: user.address,
        phone: user.phone,
        createdAt: user.createdAt
      }
    }
  });
});

// GET /api/auth/me
app.get('/api/auth/me', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated.' });
    return;
  }

  const user = dbOps.users.findOne({ id: req.user.id });
  if (!user) {
    res.status(404).json({ success: false, message: 'User profile not found.' });
    return;
  }

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        walletBalance: user.walletBalance,
        address: user.address,
        phone: user.phone,
        createdAt: user.createdAt
      }
    },
    message: 'Profile retrieved.'
  });
});

// PUT /api/auth/update-profile
app.put('/api/auth/update-profile', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Not authenticated.' });
    return;
  }

  const { name, address, phone } = req.body;
  if (!name) {
    res.status(400).json({ success: false, message: 'Name is required to update profile.' });
    return;
  }

  const updatedUser = dbOps.users.updateProfile(req.user.id, { name, address, phone });
  if (!updatedUser) {
    res.status(404).json({ success: false, message: 'User not found.' });
    return;
  }

  res.status(200).json({
    success: true,
    data: {
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        walletBalance: updatedUser.walletBalance,
        address: updatedUser.address,
        phone: updatedUser.phone,
        createdAt: updatedUser.createdAt
      }
    },
    message: 'Profile updated successfully.'
  });
});

// GET /api/auth/citizens (DRIVER or ADMIN)
app.get('/api/auth/citizens', authenticateToken, requireRole(['driver', 'admin']), (req: AuthenticatedRequest, res: Response): void => {
  const allUsers = dbOps.users.findMany();
  const citizens = allUsers
    .filter(u => u.role === 'user')
    .map(u => ({ id: u.id, name: u.name, email: u.email }));
    
  res.status(200).json({
    success: true,
    data: citizens,
    message: 'Registered citizens list retrieved.'
  });
});


// ==========================================
// REPORT ROUTES
// ==========================================

// POST /api/reports/create (USER ONLY)
app.post('/api/reports/create', authenticateToken, requireRole(['user']), (req: AuthenticatedRequest, res: Response): void => {
  const { title, description, wasteType, estimatedWeight, location } = req.body;

  if (!title || !description || !wasteType || !location) {
    res.status(400).json({ success: false, message: 'Missing required report fields.' });
    return;
  }

  const weightNum = parseFloat(estimatedWeight);
  if (isNaN(weightNum) || weightNum <= 0) {
    res.status(400).json({ success: false, message: 'Estimated weight must be a positive number.' });
    return;
  }

  const user = req.user!;
  const newReport = dbOps.reports.create({
    title,
    description,
    wasteType: wasteType as any,
    estimatedWeight: weightNum,
    location,
    userName: user.name,
    userId: user.id
  });

  res.status(201).json({
    success: true,
    data: newReport,
    message: 'Garbage report registry created successfully.'
  });
});

// GET /api/reports/my-reports (USER ONLY)
app.get('/api/reports/my-reports', authenticateToken, requireRole(['user']), (req: AuthenticatedRequest, res: Response): void => {
  const reports = dbOps.reports.findMany({ userId: req.user!.id });
  res.status(200).json({
    success: true,
    data: reports,
    message: 'Your reports retrieved.'
  });
});

// GET /api/reports/all (ADMIN ONLY)
app.get('/api/reports/all', authenticateToken, requireRole(['admin']), (req: AuthenticatedRequest, res: Response): void => {
  const reports = dbOps.reports.findMany();
  res.status(200).json({
    success: true,
    data: reports,
    message: 'All reports list retrieved.'
  });
});

// GET /api/reports/pending (DRIVER ONLY)
app.get('/api/reports/pending', authenticateToken, requireRole(['driver']), (req: AuthenticatedRequest, res: Response): void => {
  const reports = dbOps.reports.findMany({ status: 'Pending' });
  res.status(200).json({
    success: true,
    data: reports,
    message: 'All pending reports retrieved.'
  });
});

// PUT /api/reports/:id/status
app.put('/api/reports/:id/status', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['Pending', 'Collected'].includes(status)) {
    res.status(400).json({ success: false, message: 'Invalid status update.' });
    return;
  }

  const updatedReport = dbOps.reports.updateStatus(id, status as any);
  if (!updatedReport) {
    res.status(404).json({ success: false, message: 'Report not found.' });
    return;
  }

  res.status(200).json({
    success: true,
    data: updatedReport,
    message: 'Report status updated.'
  });
});


// ==========================================
// COLLECTION ROUTES
// ==========================================

// RATES MAP (Formula: Reward = Weight * Rate)
const REWARD_RATES: Record<string, number> = {
  'Plastic': 5,
  'Paper': 4,
  'Metal': 8,
  'Organic': 2,
  'E-waste': 10
};

// POST /api/collections/create (DRIVER ONLY)
app.post('/api/collections/create', authenticateToken, requireRole(['driver']), (req: AuthenticatedRequest, res: Response): void => {
  const { reportId, userId, garbageType, weightKg } = req.body;

  if (!userId || !garbageType || !weightKg) {
    res.status(400).json({ success: false, message: 'Missing user identification, waste type or weight in KG.' });
    return;
  }

  const weightNum = parseFloat(weightKg);
  if (isNaN(weightNum) || weightNum < 0.1) {
    res.status(400).json({ success: false, message: 'Weight collected must be at least 0.1 KG.' });
    return;
  }

  // Get user details
  const targetUser = dbOps.users.findOne({ id: userId });
  if (!targetUser) {
    res.status(404).json({ success: false, message: 'Target user citizen not found.' });
    return;
  }

  // Check rate
  const rate = REWARD_RATES[garbageType] || 0;
  const rewardCalculated = parseFloat((weightNum * rate).toFixed(2));

  // Update Citizen Wallet Balance
  dbOps.users.updateWallet(userId, rewardCalculated);

  let verifiedReportId = reportId || '';

  // If a legitimate report was handled, mark it as collected
  if (reportId) {
    dbOps.reports.updateStatus(reportId, 'Collected');
  } else {
    // Check if there is an existing pending report of this garbageType by this user, fulfill it if found
    const pendingReport = dbOps.reports.findOne({ userId, wasteType: garbageType, status: 'Pending' });
    if (pendingReport) {
      verifiedReportId = pendingReport.id;
      dbOps.reports.updateStatus(pendingReport.id, 'Collected');
    }
  }

  const driver = req.user!;
  // Create collection log
  const newCollection = dbOps.collections.create({
    reportId: verifiedReportId,
    userName: targetUser.name,
    userId: targetUser.id,
    driverName: driver.name,
    driverId: driver.id,
    garbageType: garbageType as any,
    weightKg: weightNum,
    rewardAmount: rewardCalculated
  });

  res.status(201).json({
    success: true,
    data: newCollection,
    message: `Waste collected successfully! Reward of Rs. ${rewardCalculated} credited to ${targetUser.name}'s wallet.`
  });
});

// GET /api/collections/my-collections (DRIVER ONLY)
app.get('/api/collections/my-collections', authenticateToken, requireRole(['driver']), (req: AuthenticatedRequest, res: Response): void => {
  const collections = dbOps.collections.findMany({ driverId: req.user!.id });
  res.status(200).json({
    success: true,
    data: collections,
    message: 'Your completed collections list.'
  });
});

// GET /api/collections/user-history (USER ONLY)
app.get('/api/collections/user-history', authenticateToken, requireRole(['user']), (req: AuthenticatedRequest, res: Response): void => {
  const collections = dbOps.collections.findMany({ userId: req.user!.id });
  res.status(200).json({
    success: true,
    data: collections,
    message: 'Your earnings and collections history retrieved.'
  });
});

// GET /api/wallet/withdrawals (USER ONLY)
app.get('/api/wallet/withdrawals', authenticateToken, requireRole(['user']), (req: AuthenticatedRequest, res: Response): void => {
  const db = readDb();
  const list = (db.withdrawals || []).filter(w => w.userId === req.user!.id);
  res.status(200).json({
    success: true,
    data: list,
    message: 'Withdrawal requests retrieved.'
  });
});

// POST /api/wallet/withdraw (USER ONLY)
app.post('/api/wallet/withdraw', authenticateToken, requireRole(['user']), (req: AuthenticatedRequest, res: Response): void => {
  const { amount, method, accountDetails } = req.body;
  const amountNum = parseFloat(amount);

  if (isNaN(amountNum) || amountNum <= 0) {
    res.status(400).json({ success: false, message: 'Withdrawal amount must be a positive number.' });
    return;
  }

  const user = dbOps.users.findOne({ id: req.user!.id });
  if (!user) {
    res.status(404).json({ success: false, message: 'User profile not found.' });
    return;
  }

  if (user.walletBalance < amountNum) {
    res.status(400).json({ success: false, message: `Insufficient wallet balance. You have Rs. ${user.walletBalance}.` });
    return;
  }

  // Deduct
  dbOps.users.updateWallet(req.user!.id, -amountNum);

  // Record withdrawal
  const db = readDb();
  const newWithdraw: Withdrawal = {
    id: `withdraw-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId: req.user!.id,
    amount: amountNum,
    method,
    accountDetails,
    status: 'Completed', // immediate simulated completion
    createdAt: new Date().toISOString()
  };

  if (!db.withdrawals) db.withdrawals = [];
  db.withdrawals.push(newWithdraw);
  writeDb(db);

  res.status(200).json({
    success: true,
    message: `Successfully withdrew Rs. ${amountNum} via ${method}.`,
    data: newWithdraw
  });
});

// GET /api/notifications/my-notifications (USER ONLY)
app.get('/api/notifications/my-notifications', authenticateToken, requireRole(['user']), (req: AuthenticatedRequest, res: Response): void => {
  const db = readDb();
  const logs = (db.notificationLogs || []).filter(n => n.userId === req.user!.id);
  res.status(200).json({
    success: true,
    data: logs,
    message: 'Notification logs retrieved.'
  });
});

// POST /api/notifications/log (USER ONLY)
app.post('/api/notifications/log', authenticateToken, requireRole(['user']), (req: AuthenticatedRequest, res: Response): void => {
  const { type, recipient, title, message } = req.body;

  if (!type || !recipient || !title || !message) {
    res.status(400).json({ success: false, message: 'Missing notification parameters.' });
    return;
  }

  const db = readDb();
  const newLog: NotificationLog = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId: req.user!.id,
    type,
    recipient,
    title,
    message,
    createdAt: new Date().toISOString()
  };

  if (!db.notificationLogs) db.notificationLogs = [];
  db.notificationLogs.push(newLog);
  writeDb(db);

  res.status(201).json({
    success: true,
    data: newLog,
    message: `Logged simulated ${type} alert successfully.`
  });
});

// ==========================================
// ACTIVE TRIP / VEHICLE GPS ROUTING ROUTES
// ==========================================

// POST /api/trips/start (DRIVER ONLY)
app.post('/api/trips/start', authenticateToken, requireRole(['driver']), (req: AuthenticatedRequest, res: Response): void => {
  const { reportId } = req.body;
  if (!reportId) {
    res.status(400).json({ success: false, message: 'Missing reportId to route.' });
    return;
  }

  const report = dbOps.reports.findOne({ id: reportId });
  if (!report) {
    res.status(404).json({ success: false, message: 'Field report not found.' });
    return;
  }

  // Get recipient information (citizen email)
  const citizen = dbOps.users.findOne({ id: report.userId });
  const citizenEmail = citizen?.email || 'alexgupta609@gmail.com';
  const citizenName = citizen?.name || report.userName;

  const driver = req.user!;
  
  // Start active trip at 6.0 km distance
  const newTrip = dbOps.activeTrips.createOrUpdate({
    id: driver.id, // Driver ID keeps the trip unique per driver
    driverId: driver.id,
    driverName: driver.name,
    reportId: report.id,
    status: 'traveling',
    distanceKm: 6.0,
    citizenName,
    citizenEmail,
    alertSent: false
  });

  console.log(`[GPS Dispatch] Driver '${driver.name}' has started traveling towards '${report.location}' (citizen: '${citizenName}', email: '${citizenEmail}')`);

  res.status(200).json({
    success: true,
    data: newTrip,
    message: `En-route GPS initialized. Traveling 6.0 KM to ${report.location}.`
  });
});

// GET /api/trips/active
app.get('/api/trips/active', authenticateToken, (req: AuthenticatedRequest, res: Response): void => {
  const trips = dbOps.activeTrips.findMany();
  res.status(200).json({
    success: true,
    data: trips,
    message: 'Active traveling vehicle routes retrieved.'
  });
});

// POST /api/trips/stop (DRIVER ONLY)
app.post('/api/trips/stop', authenticateToken, requireRole(['driver']), (req: AuthenticatedRequest, res: Response): void => {
  const driver = req.user!;
  dbOps.activeTrips.delete(driver.id);
  res.status(200).json({
    success: true,
    message: 'Active GPS travel stopped.'
  });
});

// ==========================================
// BACKGROUND AUTOMATED GPS TRAVEL SYSTEM (SERVER SCOPE)
// ==========================================
setInterval(() => {
  try {
    const db = readDb();
    const trips = db.activeTrips || [];
    let updated = false;

    trips.forEach((trip) => {
      if (trip.status === 'traveling') {
        const nextDist = parseFloat((trip.distanceKm - 0.2).toFixed(1));
        updated = true;

        if (nextDist <= 0) {
          trip.distanceKm = 0;
          trip.status = 'arrived';
          console.log(`[GPS Arrival] Driver '${trip.driverName}' has ARRIVED at report ID '${trip.reportId}'!`);
        } else {
          trip.distanceKm = nextDist;
        }

        // 5 Minutes arrival alert point (2.5 km represents exactly 5 minutes out assuming 30 km/h)
        if (trip.distanceKm <= 2.5 && !trip.alertSent) {
          trip.alertSent = true;
          
          const targetReport = db.reports.find(r => r.id === trip.reportId);
          const locationName = targetReport?.location || 'your location';

          // Construct SMS Alert log
          const smsLog = {
            id: `notif-${Date.now()}-sms-${Math.random().toString(36).substr(2, 5)}`,
            userId: targetReport?.userId || 'user-1',
            type: 'sms' as const,
            recipient: '+977-9841999999',
            title: 'EcoTrack - 5 Mins Warning',
            message: `[SMS Warning] EcoTrack municipal truck is 5 minutes (2.5 km) away from '${locationName}'. Please consolidate your sorted garbage bags!`,
            createdAt: new Date().toISOString()
          };

          // Construct Gmail Alert log
          const emailLog = {
            id: `notif-${Date.now()}-email-${Math.random().toString(36).substr(2, 5)}`,
            userId: targetReport?.userId || 'user-1',
            type: 'email' as const,
            recipient: trip.citizenEmail,
            title: 'EcoTrack arrival warning email - 5 minutes left',
            message: `Dear ${trip.citizenName},\n\nThis is an automated municipal alert from Kathmandu Waste Management.\n\nGarbage truck driven by '${trip.driverName}' is exactly 5 minutes (2.5 km) away from your reported location: '${locationName}'.\n\nPlease move your sorted garbage containers / bags near the pick up site so the crew can clean it instantly.\n\nThank you for working together to keep Kathmandu green!\n- EcoTrack Logistics HQ`,
            createdAt: new Date().toISOString()
          };

          if (!db.notificationLogs) db.notificationLogs = [];
          db.notificationLogs.push(smsLog);
          db.notificationLogs.push(emailLog);

          console.log(`\n=============================================================`);
          console.log(`📧  PUSH NOTIFICATION MAIL DISPATCHED (5-MIN ARRIVAL ALERT)  📧`);
          console.log(`TO: ${trip.citizenEmail}`);
          console.log(`SUBJECT: ${emailLog.title}`);
          console.log(`BODY:\n${emailLog.message}`);
          console.log(`=============================================================\n`);
        }
      }
    });

    if (updated) {
      writeDb(db);
    }
  } catch (err) {
    console.error('Error ticking background GPS system:', err);
  }
}, 5000); // Ticks every 5 seconds, decrements by 0.2 KM.

// GET /api/collections/all (ADMIN ONLY)
app.get('/api/collections/all', authenticateToken, requireRole(['admin']), (req: AuthenticatedRequest, res: Response): void => {
  const collections = dbOps.collections.findMany();
  res.status(200).json({
    success: true,
    data: collections,
    message: 'All collections retrieved.'
  });
});

// GET /api/collections/stats (ADMIN ONLY)
app.get('/api/collections/stats', authenticateToken, requireRole(['admin']), (req: AuthenticatedRequest, res: Response): void => {
  const users = dbOps.users.findMany();
  const reports = dbOps.reports.findMany();
  const collections = dbOps.collections.findMany();

  // Metrics
  const totalUsers = users.length;
  const totalReports = reports.length;
  const totalWeight = parseFloat(collections.reduce((sum, c) => sum + c.weightKg, 0).toFixed(1));
  const totalRewards = parseFloat(collections.reduce((sum, c) => sum + c.rewardAmount, 0).toFixed(2));

  // Pie chart waste type distribution
  const wasteDistributionMap: Record<string, number> = {
    'Plastic': 0,
    'Paper': 0,
    'Metal': 0,
    'Organic': 0,
    'E-waste': 0
  };
  collections.forEach(c => {
    if (c.garbageType in wasteDistributionMap) {
      wasteDistributionMap[c.garbageType] += c.weightKg;
    }
  });
  const wasteDistribution = Object.entries(wasteDistributionMap).map(([type, weight]) => ({
    name: type,
    value: parseFloat(weight.toFixed(1))
  }));

  // Top 5 contributing users
  const userContributionMap: Record<string, { name: string; weight: number; rewards: number }> = {};
  users.forEach(u => {
    if (u.role === 'user') {
      userContributionMap[u.id] = { name: u.name, weight: 0, rewards: 0 };
    }
  });
  collections.forEach(c => {
    if (!userContributionMap[c.userId]) {
      userContributionMap[c.userId] = { name: c.userName, weight: 0, rewards: 0 };
    }
    userContributionMap[c.userId].weight += c.weightKg;
    userContributionMap[c.userId].rewards += c.rewardAmount;
  });

  const topUsers = Object.values(userContributionMap)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, 5)
    .map(u => ({
      name: u.name,
      weight: parseFloat(u.weight.toFixed(1)),
      rewards: parseFloat(u.rewards.toFixed(2))
    }));

  // Collection trends (simulate monthly collections grouping by date)
  // Grouping collection logs to have dynamic charts
  const monthlyTrendsMap: Record<string, number> = {};
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  collections.forEach(c => {
    const d = new Date(c.collectedAt);
    const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
    monthlyTrendsMap[key] = (monthlyTrendsMap[key] || 0) + c.weightKg;
  });

  // Ensure current month is visible if there's no data
  const currentMonthName = `${monthNames[new Date().getMonth()]} ${new Date().getFullYear()}`;
  if (!monthlyTrendsMap[currentMonthName]) {
    monthlyTrendsMap[currentMonthName] = 0;
  }

  const monthlyTrends = Object.entries(monthlyTrendsMap).map(([month, weight]) => ({
    month,
    weight: parseFloat(weight.toFixed(1))
  }));

  // Filter out any active users list for viewing only (excluding passwords)
  const usersList = users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    walletBalance: u.walletBalance,
    address: u.address,
    phone: u.phone,
    createdAt: u.createdAt
  }));

  res.status(200).json({
    success: true,
    data: {
      metrics: {
        totalUsers,
        totalReports,
        totalWeight,
        totalRewards
      },
      wasteDistribution,
      topUsers,
      monthlyTrends,
      users: usersList
    },
    message: 'Dashboard stats and metadata loaded.'
  });
});


// ==========================================
// CLIENT BUILD HANDLERS (VITE MIDDLEWARE)
// ==========================================

async function setupAndStart() {
  if (process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'prod') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[EcoTrack Nepal Dev Server] Running at: http://localhost:${PORT}`);
  });
}

setupAndStart().catch(err => {
  console.error('Failed to launch fullstack server:', err);
});
