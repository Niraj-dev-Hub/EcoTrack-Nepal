export interface User {
  id: string;
  name: string;
  email: string;
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

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message: string;
}
