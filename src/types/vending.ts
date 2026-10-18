export type MachineStatus = 'online' | 'offline' | 'warning';

export interface Machine {
  id: string;
  name: string;
  location: string;
  status: MachineStatus;
  lastPing: string;
  wifiRssi: number; // e.g. -58 dBm
  espUptimeSec: number;
  freeHeapBytes: number;
  power12VRail: number; // 12V rail for coin acceptor & motors
  power5VRail: number;  // 5V logic rail for ESP32 & sensors
  doorOpen: boolean;
  cashboxCoins: number;
  cashboxTotal: number;
  firmwareVersion: string;
  offlineQueueCount: number;
  ipAddress: string;
  macAddress: string;
}

export type SupplyCategory = 'Writing' | 'Paper' | 'Correction' | 'Accessories';

export interface InventoryItem {
  id: string;
  slot: number;
  name: string;
  category: SupplyCategory;
  price: number;
  currentStock: number;
  maxCapacity: number;
  irSensorState: 'ok' | 'empty' | 'jammed';
  servoPin: number;
  irSensorPin: number;
  lowStockThreshold: number;
  lastRefillTime: string;
  description: string;
}

export type TransactionStatus = 'completed' | 'failed_jam' | 'cancelled_refunded' | 'offline_synced';

export interface Transaction {
  id: string;
  refCode: string;
  timestamp: string;
  slot: number;
  itemName: string;
  amountInserted: number;
  itemPrice: number;
  changeDispensed: number;
  status: TransactionStatus;
  isOfflineSynced: boolean;
  offlineSyncedAt?: string;
  chuteSensorConfirmed: boolean;
}

export type LogSeverity = 'info' | 'warning' | 'alert' | 'success';

export interface MaintenanceLog {
  id: string;
  timestamp: string;
  type: 'refill' | 'cash_collection' | 'door_event' | 'jam_cleared' | 'firmware_reboot' | 'offline_sync';
  severity: LogSeverity;
  title: string;
  details: string;
  operator: string;
}

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  isConnected: boolean;
  isCustom: boolean;
}

export type ActiveTab = 'overview' | 'inventory' | 'transactions' | 'logs';
