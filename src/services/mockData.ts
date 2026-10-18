import type { Machine, InventoryItem, Transaction, MaintenanceLog } from '../types/vending';

export const INITIAL_MACHINE: Machine = {
  id: 'ESP32-VENDO-PAM-01',
  name: 'VendoPampanga — Station 1',
  location: 'Pampanga High School / Main Student Hall (Gate 2)',
  status: 'online',
  lastPing: new Date().toISOString(),
  wifiRssi: -54, // strong signal
  espUptimeSec: 184520, // ~2.1 days
  freeHeapBytes: 198420, // bytes
  power12VRail: 12.14, // 12V Coin Mech & Servos
  power5VRail: 5.04,   // 5V ESP32 & Logic
  doorOpen: false,
  cashboxCoins: 142,
  cashboxTotal: 1685.00,
  firmwareVersion: 'v2.4.1-Supabase-LittleFS',
  offlineQueueCount: 0,
  ipAddress: '192.168.1.182',
  macAddress: '30:AE:A4:7F:5B:12'
};

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'item-1',
    slot: 1,
    name: 'HBW Matrix Ballpen 0.7mm (Black)',
    category: 'Writing',
    price: 10,
    currentStock: 18,
    maxCapacity: 25,
    irSensorState: 'ok',
    servoPin: 13,
    irSensorPin: 34,
    lowStockThreshold: 5,
    lastRefillTime: '2026-10-18T14:30:00Z',
    description: 'Everyday black ballpoint pen for exams and note-taking'
  },
  {
    id: 'item-2',
    slot: 2,
    name: 'HBW Matrix Ballpen 0.7mm (Blue)',
    category: 'Writing',
    price: 10,
    currentStock: 14,
    maxCapacity: 25,
    irSensorState: 'ok',
    servoPin: 14,
    irSensorPin: 35,
    lowStockThreshold: 5,
    lastRefillTime: '2026-10-18T14:30:00Z',
    description: 'Blue ballpoint pen for daily school assignments'
  },
  {
    id: 'item-3',
    slot: 3,
    name: 'Mongol #2 Lead Pencil',
    category: 'Writing',
    price: 8,
    currentStock: 4, // Low stock warning!
    maxCapacity: 30,
    irSensorState: 'ok',
    servoPin: 27,
    irSensorPin: 32,
    lowStockThreshold: 6,
    lastRefillTime: '2026-10-17T09:15:00Z',
    description: 'Standard pencil for bubbling test sheets & drawing'
  },
  {
    id: 'item-4',
    slot: 4,
    name: 'Staedtler Vinyl Eraser (Medium)',
    category: 'Accessories',
    price: 6,
    currentStock: 2, // Critical low stock
    maxCapacity: 20,
    irSensorState: 'ok',
    servoPin: 26,
    irSensorPin: 33,
    lowStockThreshold: 4,
    lastRefillTime: '2026-10-16T11:00:00Z',
    description: 'Smudge-free pencil eraser for students'
  },
  {
    id: 'item-5',
    slot: 5,
    name: 'Correction Tape (5mm x 6m)',
    category: 'Correction',
    price: 20,
    currentStock: 9,
    maxCapacity: 15,
    irSensorState: 'ok',
    servoPin: 25,
    irSensorPin: 23,
    lowStockThreshold: 3,
    lastRefillTime: '2026-10-18T14:30:00Z',
    description: 'Instant dry whiteout tape with precision applicator'
  },
  {
    id: 'item-6',
    slot: 6,
    name: 'Intermediate Pad (80 Leaves)',
    category: 'Paper',
    price: 25,
    currentStock: 11,
    maxCapacity: 20,
    irSensorState: 'ok',
    servoPin: 33,
    irSensorPin: 19,
    lowStockThreshold: 5,
    lastRefillTime: '2026-10-18T14:30:00Z',
    description: 'Standard ruled pad for quizzes and essays'
  },
  {
    id: 'item-7',
    slot: 7,
    name: 'Yellow Pad Paper (Half Length)',
    category: 'Paper',
    price: 15,
    currentStock: 0, // Empty / IR sensor triggered!
    maxCapacity: 20,
    irSensorState: 'empty',
    servoPin: 32,
    irSensorPin: 18,
    lowStockThreshold: 4,
    lastRefillTime: '2026-10-15T08:20:00Z',
    description: 'Yellow legal-style writing pad for high school tests'
  },
  {
    id: 'item-8',
    slot: 8,
    name: 'Pilot G-Tech Gel Pen 0.3mm (Black)',
    category: 'Writing',
    price: 25,
    currentStock: 16,
    maxCapacity: 20,
    irSensorState: 'ok',
    servoPin: 21,
    irSensorPin: 5,
    lowStockThreshold: 4,
    lastRefillTime: '2026-10-18T14:30:00Z',
    description: 'Fine point micro-tip gel pen for precision drafting'
  }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-101',
    refCode: 'TXN-88421',
    timestamp: new Date(Date.now() - 3 * 60 * 1000).toISOString(), // 3 mins ago
    slot: 1,
    itemName: 'HBW Matrix Ballpen 0.7mm (Black)',
    amountInserted: 10,
    itemPrice: 10,
    changeDispensed: 0,
    status: 'completed',
    isOfflineSynced: false,
    chuteSensorConfirmed: true
  },
  {
    id: 'tx-102',
    refCode: 'TXN-88420',
    timestamp: new Date(Date.now() - 14 * 60 * 1000).toISOString(), // 14 mins ago
    slot: 5,
    itemName: 'Correction Tape (5mm x 6m)',
    amountInserted: 20,
    itemPrice: 20,
    changeDispensed: 0,
    status: 'completed',
    isOfflineSynced: false,
    chuteSensorConfirmed: true
  },
  {
    id: 'tx-103',
    refCode: 'TXN-88419',
    timestamp: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
    slot: 6,
    itemName: 'Intermediate Pad (80 Leaves)',
    amountInserted: 30, // 3x ₱10 coins
    itemPrice: 25,
    changeDispensed: 5, // ₱5 coin returned
    status: 'completed',
    isOfflineSynced: true, // Synced from offline buffer during network hiccup!
    offlineSyncedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    chuteSensorConfirmed: true
  },
  {
    id: 'tx-104',
    refCode: 'TXN-88418',
    timestamp: new Date(Date.now() - 58 * 60 * 1000).toISOString(),
    slot: 3,
    itemName: 'Mongol #2 Lead Pencil',
    amountInserted: 10,
    itemPrice: 8,
    changeDispensed: 2,
    status: 'completed',
    isOfflineSynced: true,
    offlineSyncedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    chuteSensorConfirmed: true
  },
  {
    id: 'tx-105',
    refCode: 'TXN-88417',
    timestamp: new Date(Date.now() - 95 * 60 * 1000).toISOString(),
    slot: 7,
    itemName: 'Yellow Pad Paper (Half Length)',
    amountInserted: 15,
    itemPrice: 15,
    changeDispensed: 15,
    status: 'cancelled_refunded', // Out of stock detected by IR sensor, coins refunded!
    isOfflineSynced: false,
    chuteSensorConfirmed: false
  },
  {
    id: 'tx-106',
    refCode: 'TXN-88416',
    timestamp: new Date(Date.now() - 140 * 60 * 1000).toISOString(),
    slot: 8,
    itemName: 'Pilot G-Tech Gel Pen 0.3mm (Black)',
    amountInserted: 50,
    itemPrice: 25,
    changeDispensed: 25,
    status: 'completed',
    isOfflineSynced: false,
    chuteSensorConfirmed: true
  },
  {
    id: 'tx-107',
    refCode: 'TXN-88415',
    timestamp: new Date(Date.now() - 190 * 60 * 1000).toISOString(),
    slot: 2,
    itemName: 'HBW Matrix Ballpen 0.7mm (Blue)',
    amountInserted: 10,
    itemPrice: 10,
    changeDispensed: 0,
    status: 'completed',
    isOfflineSynced: false,
    chuteSensorConfirmed: true
  }
];

export const INITIAL_LOGS: MaintenanceLog[] = [
  {
    id: 'log-1',
    timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    type: 'offline_sync',
    severity: 'success',
    title: 'Offline LittleFS Buffer Synced',
    details: 'WiFi connectivity re-established with AP "DepEd_Pampanga_WiFi". 2 offline purchases (TXN-88419, TXN-88418) were uploaded to Supabase.',
    operator: 'ESP32 Firmware Auto-Sync'
  },
  {
    id: 'log-2',
    timestamp: new Date(Date.now() - 65 * 60 * 1000).toISOString(),
    type: 'firmware_reboot',
    severity: 'warning',
    title: 'WiFi Outage Detected — Offline Mode Engaged',
    details: 'ESP32 ping failed to Supabase REST endpoint. Switched to local offline LittleFS transaction logging.',
    operator: 'ESP32 System Watchdog'
  },
  {
    id: 'log-3',
    timestamp: new Date(Date.now() - 95 * 60 * 1000).toISOString(),
    type: 'jam_cleared',
    severity: 'alert',
    title: 'Slot 7 Out of Stock (IR Sensor Active)',
    details: 'Slot 7 IR beam sensor detected tray empty. Machine safely refunded ₱15 to student and disabled Slot 7 button.',
    operator: 'Firmware Safety Interlock'
  },
  {
    id: 'log-4',
    timestamp: '2026-10-18T14:30:00Z',
    type: 'refill',
    severity: 'info',
    title: 'School Supplies Restocked',
    details: 'Slots 1, 2, 5, 6 refilled by operator. Door unlocked with physical key, door sensor triggered.',
    operator: 'Admin (K. Cruz)'
  },
  {
    id: 'log-5',
    timestamp: '2026-10-18T14:40:00Z',
    type: 'cash_collection',
    severity: 'info',
    title: 'Cashbox Audit & Reset',
    details: 'Collected ₱3,450.00 in coins. Cashbox counter reset to 0.',
    operator: 'Admin (K. Cruz)'
  }
];
