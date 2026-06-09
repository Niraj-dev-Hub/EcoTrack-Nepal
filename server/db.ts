import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'user' | 'driver' | 'admin';
  walletBalance: number;
  address?: string;
  phone?: string;
  createdAt: string;
}

export interface Report {
  id: string;
  title: string;
  description: string;
  wasteType: 'Plastic' | 'Paper' | 'Metal' | 'Organic' | 'E-waste';
  estimatedWeight: number;
  location: string;
  userName: string;
  userId: string;
  status: 'Pending' | 'Collected';
  createdAt: string;
  updatedAt: string;
}

export interface Collection {
  id: string;
  reportId: string;
  userName: string;
  userId: string;
  driverName: string;
  driverId: string;
  garbageType: 'Plastic' | 'Paper' | 'Metal' | 'Organic' | 'E-waste';
  weightKg: number;
  rewardAmount: number;
  collectedAt: string;
}

export interface Withdrawal {
  id: string;
  userId: string;
  amount: number;
  method: string;
  accountDetails: string;
  status: 'Pending' | 'Completed';
  createdAt: string;
}

export interface NotificationLog {
  id: string;
  userId: string;
  type: 'sms' | 'email' | 'system';
  recipient: string;
  title: string;
  message: string;
  createdAt: string;
}

export interface ActiveTrip {
  id: string;
  driverId: string;
  driverName: string;
  reportId: string;
  status: 'idle' | 'traveling' | 'arrived';
  distanceKm: number;
  citizenName: string;
  citizenEmail: string;
  alertSent: boolean;
  updatedAt: string;
}

interface DatabaseSchema {
  users: User[];
  reports: Report[];
  collections: Collection[];
  withdrawals?: Withdrawal[];
  notificationLogs?: NotificationLog[];
  activeTrips?: ActiveTrip[];
}

function ensureDbFile() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    const salt = bcrypt.genSaltSync(10);
    const adminPasswordHash = bcrypt.hashSync('admin123', salt);
    const driverPasswordHash = bcrypt.hashSync('driver123', salt);
    const testUserPasswordHash = bcrypt.hashSync('user123', salt);

    const initialDb: DatabaseSchema = {
      users: [
        {
          id: 'admin-1',
          name: 'Municipality Admin',
          email: 'admin@ecotrack.com',
          passwordHash: adminPasswordHash,
          role: 'admin',
          walletBalance: 10000,
          address: 'Ward 4, Kathmandu',
          phone: '+977-9801234567',
          createdAt: new Date().toISOString()
        },
        {
          id: 'driver-1',
          name: 'Ram Bahadur',
          email: 'driver@ecotrack.com',
          passwordHash: driverPasswordHash,
          role: 'driver',
          walletBalance: 0,
          address: 'Kalimati, Kathmandu',
          phone: '+977-9812345678',
          createdAt: new Date().toISOString()
        },
        {
          id: 'user-1',
          name: 'Sita Sharma',
          email: 'user@ecotrack.com',
          passwordHash: testUserPasswordHash,
          role: 'user',
          walletBalance: 120, // Pre-populated to show beautiful dashboards instantly
          address: 'New Baneshwor, Kathmandu',
          phone: '+977-9841999999',
          createdAt: new Date().toISOString()
        }
      ],
      reports: [
        {
          id: 'report-1',
          title: 'Plastic bottles beside river',
          description: 'A large pile of plastic drink bottles accumulated near Bagmati corridor.',
          wasteType: 'Plastic',
          estimatedWeight: 5,
          location: 'Bagmati Corridor, Tinkune',
          userName: 'Sita Sharma',
          userId: 'user-1',
          status: 'Collected',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
          updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'report-2',
          title: 'Discarded carton sheets',
          description: 'Corrugated paper and cardboard sheets from household shifting left out.',
          wasteType: 'Paper',
          estimatedWeight: 12,
          location: 'New Baneshwor, Marg 5',
          userName: 'Sita Sharma',
          userId: 'user-1',
          status: 'Pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'report-3',
          title: 'Metals from old storage shed',
          description: 'Broken window iron frames and metallic scrap bins.',
          wasteType: 'Metal',
          estimatedWeight: 8,
          location: 'Boudha, Kathmandu',
          userName: 'Sita Sharma',
          userId: 'user-1',
          status: 'Pending',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      collections: [
        {
          id: 'collection-1',
          reportId: 'report-1',
          userName: 'Sita Sharma',
          userId: 'user-1',
          driverName: 'Ram Bahadur',
          driverId: 'driver-1',
          garbageType: 'Plastic',
          weightKg: 6,
          rewardAmount: 30, // 6kg x 5 Rs = 30
          collectedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        }
      ],
      activeTrips: []
    };
    fs.writeFileSync(DB_FILE, JSON.stringify(initialDb, null, 2), 'utf-8');
  }
}

export function readDb(): DatabaseSchema {
  ensureDbFile();
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const db = JSON.parse(raw) as DatabaseSchema;
    if (!db.withdrawals) db.withdrawals = [];
    if (!db.notificationLogs) db.notificationLogs = [];
    if (!db.activeTrips) db.activeTrips = [];
    return db;
  } catch (error) {
    console.error('Error reading JSON DB, resetting to defaults.', error);
    // recreate
    fs.unlinkSync(DB_FILE);
    ensureDbFile();
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    const db = JSON.parse(raw) as DatabaseSchema;
    if (!db.withdrawals) db.withdrawals = [];
    if (!db.notificationLogs) db.notificationLogs = [];
    if (!db.activeTrips) db.activeTrips = [];
    return db;
  }
}

export function writeDb(db: DatabaseSchema) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing JSON DB:', error);
  }
}

// Global DB Operations
export const dbOps = {
  users: {
    findMany: (): User[] => {
      return readDb().users;
    },
    findOne: (filter: Partial<User>): User | undefined => {
      const users = readDb().users;
      return users.find(u => {
        return Object.entries(filter).every(([key, value]) => {
          return (u as any)[key] === value;
        });
      });
    },
    create: (user: Omit<User, 'id' | 'createdAt' | 'walletBalance'> & { id?: string }): User => {
      const db = readDb();
      const newUser: User = {
        ...user,
        id: user.id || `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        walletBalance: 0,
        createdAt: new Date().toISOString()
      };
      db.users.push(newUser);
      writeDb(db);
      return newUser;
    },
    updateWallet: (userId: string, amount: number): User | undefined => {
      const db = readDb();
      const idx = db.users.findIndex(u => u.id === userId);
      if (idx !== -1) {
        db.users[idx].walletBalance += amount;
        writeDb(db);
        return db.users[idx];
      }
      return undefined;
    },
    updateProfile: (userId: string, data: { name: string; address?: string; phone?: string }): User | undefined => {
      const db = readDb();
      const idx = db.users.findIndex(u => u.id === userId);
      if (idx !== -1) {
        db.users[idx].name = data.name;
        db.users[idx].address = data.address;
        db.users[idx].phone = data.phone;
        writeDb(db);
        return db.users[idx];
      }
      return undefined;
    }
  },

  reports: {
    findMany: (filter?: Partial<Report>): Report[] => {
      const db = readDb();
      if (!filter) return db.reports;
      return db.reports.filter(r => {
        return Object.entries(filter).every(([key, value]) => {
          return (r as any)[key] === value;
        });
      });
    },
    findOne: (filter: Partial<Report>): Report | undefined => {
      const reports = readDb().reports;
      return reports.find(r => {
        return Object.entries(filter).every(([key, value]) => {
          return (r as any)[key] === value;
        });
      });
    },
    create: (report: Omit<Report, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Report => {
      const db = readDb();
      const newReport: Report = {
        ...report,
        id: `report-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        status: 'Pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      db.reports.push(newReport);
      writeDb(db);
      return newReport;
    },
    updateStatus: (reportId: string, status: 'Pending' | 'Collected'): Report | undefined => {
      const db = readDb();
      const idx = db.reports.findIndex(r => r.id === reportId);
      if (idx !== -1) {
        db.reports[idx].status = status;
        db.reports[idx].updatedAt = new Date().toISOString();
        writeDb(db);
        return db.reports[idx];
      }
      return undefined;
    }
  },

  collections: {
    findMany: (filter?: Partial<Collection>): Collection[] => {
      const db = readDb();
      if (!filter) return db.collections;
      return db.collections.filter(c => {
        return Object.entries(filter).every(([key, value]) => {
          return (c as any)[key] === value;
        });
      });
    },
    create: (collection: Omit<Collection, 'id' | 'collectedAt'>): Collection => {
      const db = readDb();
      const newCollection: Collection = {
        ...collection,
        id: `col-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        collectedAt: new Date().toISOString()
      };
      db.collections.push(newCollection);
      writeDb(db);
      return newCollection;
    }
  },

  activeTrips: {
    findMany: (filter?: Partial<ActiveTrip>): ActiveTrip[] => {
      const db = readDb();
      const trips = db.activeTrips || [];
      if (!filter) return trips;
      return trips.filter(t => {
        return Object.entries(filter).every(([key, value]) => {
          return (t as any)[key] === value;
        });
      });
    },
    findOne: (filter: Partial<ActiveTrip>): ActiveTrip | undefined => {
      const db = readDb();
      const trips = db.activeTrips || [];
      return trips.find(t => {
        return Object.entries(filter).every(([key, value]) => {
          return (t as any)[key] === value;
        });
      });
    },
    createOrUpdate: (tripData: Omit<ActiveTrip, 'updatedAt'>): ActiveTrip => {
      const db = readDb();
      if (!db.activeTrips) db.activeTrips = [];
      const idx = db.activeTrips.findIndex(t => t.id === tripData.id);
      const trip: ActiveTrip = {
        ...tripData,
        updatedAt: new Date().toISOString()
      };
      if (idx !== -1) {
        db.activeTrips[idx] = trip;
      } else {
        db.activeTrips.push(trip);
      }
      writeDb(db);
      return trip;
    },
    updateDistance: (tripId: string, distanceKm: number, status?: 'idle' | 'traveling' | 'arrived'): ActiveTrip | undefined => {
      const db = readDb();
      const trips = db.activeTrips || [];
      const idx = trips.findIndex(t => t.id === tripId);
      if (idx !== -1) {
        trips[idx].distanceKm = distanceKm;
        if (status) trips[idx].status = status;
        trips[idx].updatedAt = new Date().toISOString();
        writeDb(db);
        return trips[idx];
      }
      return undefined;
    },
    setAlertSent: (tripId: string, alertSent: boolean): ActiveTrip | undefined => {
      const db = readDb();
      const trips = db.activeTrips || [];
      const idx = trips.findIndex(t => t.id === tripId);
      if (idx !== -1) {
        trips[idx].alertSent = alertSent;
        trips[idx].updatedAt = new Date().toISOString();
        writeDb(db);
        return trips[idx];
      }
      return undefined;
    },
    delete: (tripId: string): boolean => {
      const db = readDb();
      if (!db.activeTrips) return false;
      const initialLen = db.activeTrips.length;
      db.activeTrips = db.activeTrips.filter(t => t.id !== tripId);
      writeDb(db);
      return db.activeTrips.length < initialLen;
    }
  }
};
