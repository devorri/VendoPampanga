import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { SupabaseConfig } from '../types/vending';

const STORAGE_KEY_URL = 'vendopampanga_supabase_url';
const STORAGE_KEY_KEY = 'vendopampanga_supabase_anon_key';

let supabaseInstance: SupabaseClient | null = null;

export const getStoredSupabaseConfig = (): SupabaseConfig => {
  const url = localStorage.getItem(STORAGE_KEY_URL) || '';
  const anonKey = localStorage.getItem(STORAGE_KEY_KEY) || '';
  const isCustom = Boolean(url && anonKey);
  
  return {
    url,
    anonKey,
    isConnected: isCustom,
    isCustom
  };
};

export const saveSupabaseConfig = (url: string, anonKey: string): boolean => {
  try {
    if (url && anonKey) {
      localStorage.setItem(STORAGE_KEY_URL, url.trim());
      localStorage.setItem(STORAGE_KEY_KEY, anonKey.trim());
      supabaseInstance = createClient(url.trim(), anonKey.trim());
      return true;
    } else {
      localStorage.removeItem(STORAGE_KEY_URL);
      localStorage.removeItem(STORAGE_KEY_KEY);
      supabaseInstance = null;
      return false;
    }
  } catch (err) {
    console.error('Failed to save Supabase config', err);
    return false;
  }
};

export const getSupabaseClient = (): SupabaseClient | null => {
  if (supabaseInstance) return supabaseInstance;
  
  const config = getStoredSupabaseConfig();
  if (config.url && config.anonKey) {
    try {
      supabaseInstance = createClient(config.url, config.anonKey);
      return supabaseInstance;
    } catch (e) {
      console.warn('Could not initialize Supabase client:', e);
      return null;
    }
  }
  return null;
};

// Ready-to-run PostgreSQL schema script for user's Supabase project
export const SUPABASE_SQL_SCHEMA = `-- ===================================================
-- VendoPampanga: School Supplies Vending Machine Schema
-- Optimized for ESP32 REST API & Supabase Realtime
-- ===================================================

-- 1. Machines Telemetry Table
CREATE TABLE IF NOT EXISTS machines (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    location TEXT NOT NULL,
    status TEXT DEFAULT 'online', -- 'online', 'offline', 'warning'
    last_ping TIMESTAMPTZ DEFAULT NOW(),
    wifi_rssi INT DEFAULT -60,
    esp_uptime_sec BIGINT DEFAULT 0,
    free_heap_bytes BIGINT DEFAULT 190000,
    power_12v_rail NUMERIC(4,2) DEFAULT 12.10,
    power_5v_rail NUMERIC(4,2) DEFAULT 5.04,
    door_open BOOLEAN DEFAULT FALSE,
    cashbox_coins INT DEFAULT 0,
    cashbox_total NUMERIC(10,2) DEFAULT 0.00,
    firmware_version TEXT DEFAULT 'v2.4.1-Supabase-LittleFS',
    offline_queue_count INT DEFAULT 0,
    ip_address TEXT DEFAULT '192.168.1.182',
    mac_address TEXT DEFAULT '30:AE:A4:7F:5B:12',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. School Supplies Inventory Table
CREATE TABLE IF NOT EXISTS inventory (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    machine_id TEXT REFERENCES machines(id) ON DELETE CASCADE,
    slot INT NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL, -- 'Writing', 'Paper', 'Correction', 'Accessories'
    price NUMERIC(6,2) NOT NULL,
    current_stock INT NOT NULL DEFAULT 0,
    max_capacity INT NOT NULL DEFAULT 20,
    ir_sensor_state TEXT DEFAULT 'ok', -- 'ok', 'empty', 'jammed'
    servo_pin INT NOT NULL,
    ir_sensor_pin INT NOT NULL,
    low_stock_threshold INT DEFAULT 4,
    last_refill_time TIMESTAMPTZ DEFAULT NOW(),
    description TEXT,
    CONSTRAINT unique_machine_slot UNIQUE(machine_id, slot)
);

-- 3. Transactions Table (supports offline sync indicator)
CREATE TABLE IF NOT EXISTS transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    machine_id TEXT REFERENCES machines(id) ON DELETE CASCADE,
    ref_code TEXT NOT NULL,
    slot INT NOT NULL,
    item_name TEXT NOT NULL,
    amount_inserted NUMERIC(6,2) NOT NULL,
    item_price NUMERIC(6,2) NOT NULL,
    change_dispensed NUMERIC(6,2) DEFAULT 0.00,
    status TEXT NOT NULL, -- 'completed', 'failed_jam', 'cancelled_refunded'
    is_offline_synced BOOLEAN DEFAULT FALSE,
    offline_synced_at TIMESTAMPTZ,
    chute_sensor_confirmed BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Maintenance and Audit Logs
CREATE TABLE IF NOT EXISTS maintenance_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    machine_id TEXT REFERENCES machines(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'refill', 'cash_collection', 'door_event', 'jam_cleared', 'offline_sync'
    severity TEXT DEFAULT 'info', -- 'info', 'warning', 'alert', 'success'
    title TEXT NOT NULL,
    details TEXT,
    operator TEXT DEFAULT 'Admin',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE maintenance_logs ENABLE ROW LEVEL SECURITY;

-- Allow public read/write for Admin & ESP32 with Anon Key (Adjust as needed for strict policies)
CREATE POLICY "Public Read All" ON machines FOR SELECT USING (true);
CREATE POLICY "Public Upsert All" ON machines FOR ALL USING (true);

CREATE POLICY "Public Read Inventory" ON inventory FOR SELECT USING (true);
CREATE POLICY "Public Upsert Inventory" ON inventory FOR ALL USING (true);

CREATE POLICY "Public Read Transactions" ON transactions FOR SELECT USING (true);
CREATE POLICY "Public Insert Transactions" ON transactions FOR INSERT WITH CHECK (true);

CREATE POLICY "Public Read Logs" ON maintenance_logs FOR SELECT USING (true);
CREATE POLICY "Public Insert Logs" ON maintenance_logs FOR INSERT WITH CHECK (true);

-- Enable Realtime for live updates on administrator phone
ALTER PUBLICATION supabase_realtime ADD TABLE machines;
ALTER PUBLICATION supabase_realtime ADD TABLE inventory;
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE maintenance_logs;
`;

// Arduino ESP32 C++ Code template with offline buffering via LittleFS & Supabase REST API
export const ESP32_ARDUINO_FIRMWARE_CODE = `/*
 * =====================================================================
 *  VendoPampanga - ESP32 Vending Machine Firmware with Supabase & LittleFS
 * =====================================================================
 *  Hardware Features:
 *  - Multi-Coin Acceptor (Pulse interrupt pin)
 *  - 16x2 / 20x4 I2C LCD Display
 *  - 8 Slot Push Buttons (Input Pullup)
 *  - 8 IR Stock Sensors (High when clear, Low when empty)
 *  - 1 IR Drop Chute Sensor (Beam interrupter to confirm drop)
 *  - 8 Continuous / Positional Servos for dispensing spirals
 *  - Door Tamper Switch (GPIO)
 *  - WiFi + LittleFS Offline Transaction Buffer
 *  - Supabase REST API Direct Integration
 * =====================================================================
 */

#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <LittleFS.h>
#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <ESP32Servo.h>

// --- WiFi Credentials ---
const char* WIFI_SSID     = "DepEd_Pampanga_WiFi";
const char* WIFI_PASSWORD = "SchoolSupplies2026";

// --- Supabase Config ---
const char* SUPABASE_URL      = "https://your-project.supabase.co";
const char* SUPABASE_ANON_KEY = "eyJhbGciOi..."; // Your Anon Public Key
const char* MACHINE_ID        = "ESP32-VENDO-PAM-01";

// --- Pin Definitions ---
const int PIN_COIN_PULSE   = 19; // Interrupt pin from coin acceptor
const int PIN_CHUTE_IR     = 22; // Drop verification IR sensor
const int PIN_DOOR_SWITCH  = 23; // Door tamper limit switch

// Servos & Buttons & Stock IR arrays for 8 slots
const int SERVO_PINS[8] = { 13, 14, 27, 26, 25, 33, 32, 21 };
const int BUTTON_PINS[8] = { 4, 16, 17, 5, 18, 19, 21, 22 };
const int IR_PINS[8]     = { 34, 35, 32, 33, 23, 19, 18, 5 };

Servo servos[8];
LiquidCrystal_I2C lcd(0x27, 20, 4);

volatile int pulseCount = 0;
volatile unsigned long lastPulseTime = 0;
int currentBalance = 0;
bool isOnline = false;

// Offline buffer file path in LittleFS
const char* OFFLINE_BUFFER_FILE = "/offline_txns.json";

void IRAM_ATTR onCoinPulse() {
  pulseCount++;
  lastPulseTime = millis();
}

void setup() {
  Serial.begin(115200);
  Wire.begin();
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("VendoPampanga v2.4");
  lcd.setCursor(0, 1);
  lcd.print("Initializing...");

  // Initialize LittleFS for offline queuing
  if(!LittleFS.begin(true)){
    Serial.println("LittleFS Mount Failed!");
  } else {
    Serial.println("LittleFS Buffer Ready.");
  }

  // Pin setup
  pinMode(PIN_COIN_PULSE, INPUT_PULLUP);
  attachInterrupt(digitalPinToInterrupt(PIN_COIN_PULSE), onCoinPulse, FALLING);
  pinMode(PIN_CHUTE_IR, INPUT);
  pinMode(PIN_DOOR_SWITCH, INPUT_PULLUP);

  connectWiFi();
  syncOfflineQueueIfOnline();
  updateLCDStandby();
}

void loop() {
  handleCoinPulses();
  checkProductButtons();
  checkNetworkStatus();
  sendHeartbeatTelemetry();
}

// Check coin pulses (e.g. 1 pulse = ₱1, 5 = ₱5, 10 = ₱10, 20 = ₱20)
void handleCoinPulses() {
  if (pulseCount > 0 && (millis() - lastPulseTime > 200)) {
    int inserted = pulseCount; // calibrated for coin acceptor pulses
    currentBalance += inserted;
    pulseCount = 0;
    
    lcd.clear();
    lcd.setCursor(0, 0);
    lcd.print("Coin Inserted!");
    lcd.setCursor(0, 1);
    lcd.printf("Balance: PHP %d.00", currentBalance);
  }
}

// Trigger dispensing and handle offline fallback if WiFi is down
void dispenseSlot(int slotIndex, const char* itemName, int price) {
  if (currentBalance < price) {
    lcd.clear();
    lcd.print("Insufficient Funds");
    lcd.setCursor(0, 1);
    lcd.printf("Need: PHP %d.00", price);
    delay(1500);
    return;
  }

  // 1. Check stock IR sensor
  if (digitalRead(IR_PINS[slotIndex]) == LOW) { // Empty
    lcd.clear();
    lcd.print("Slot Empty! Refund");
    refundBalance();
    return;
  }

  // 2. Rotate Servo to push item
  lcd.clear();
  lcd.print("Dispensing...");
  servos[slotIndex].attach(SERVO_PINS[slotIndex]);
  servos[slotIndex].write(180); // Rotate spiral coil
  delay(1200);
  servos[slotIndex].write(90);  // Stop
  servos[slotIndex].detach();

  // 3. Verify drop via chute IR sensor
  bool dropped = false;
  unsigned long startWait = millis();
  while(millis() - startWait < 2000) {
    if(digitalRead(PIN_CHUTE_IR) == LOW) {
      dropped = true;
      break;
    }
  }

  int change = currentBalance - price;
  currentBalance = 0;

  // 4. Record transaction (Send to Supabase or save to LittleFS offline queue)
  recordTransaction(slotIndex + 1, itemName, price, change, dropped);
  
  lcd.clear();
  lcd.print("Thank You!");
  if(change > 0) {
    lcd.setCursor(0, 1);
    lcd.printf("Change: PHP %d", change);
  }
  delay(2000);
  updateLCDStandby();
}

// Record to Supabase directly, or queue to LittleFS if offline
void recordTransaction(int slot, const char* item, int price, int change, bool dropConfirmed) {
  JsonDocument doc;
  doc["machine_id"] = MACHINE_ID;
  doc["ref_code"] = "TXN-" + String(random(10000, 99999));
  doc["slot"] = slot;
  doc["item_name"] = item;
  doc["amount_inserted"] = price + change;
  doc["item_price"] = price;
  doc["change_dispensed"] = change;
  doc["status"] = dropConfirmed ? "completed" : "failed_jam";
  doc["chute_sensor_confirmed"] = dropConfirmed;
  doc["is_offline_synced"] = (WiFi.status() != WL_CONNECTED);

  String payload;
  serializeJson(doc, payload);

  if (WiFi.status() == WL_CONNECTED) {
    HTTPClient http;
    String endpoint = String(SUPABASE_URL) + "/rest/v1/transactions";
    http.begin(endpoint);
    http.addHeader("apikey", SUPABASE_ANON_KEY);
    http.addHeader("Authorization", String("Bearer ") + SUPABASE_ANON_KEY);
    http.addHeader("Content-Type", "application/json");
    
    int httpCode = http.POST(payload);
    if (httpCode >= 200 && httpCode < 300) {
      Serial.println("Transaction posted to Supabase successfully.");
      http.end();
      return;
    }
    http.end();
  }

  // If WiFi is disconnected or HTTP failed, buffer to LittleFS
  Serial.println("Offline! Buffering transaction to LittleFS...");
  File file = LittleFS.open(OFFLINE_BUFFER_FILE, FILE_APPEND);
  if(file) {
    file.println(payload);
    file.close();
  }
}

// When internet is restored, sync buffered transactions
void syncOfflineQueueIfOnline() {
  if (WiFi.status() != WL_CONNECTED) return;
  if (!LittleFS.exists(OFFLINE_BUFFER_FILE)) return;

  File file = LittleFS.open(OFFLINE_BUFFER_FILE, FILE_READ);
  if (!file) return;

  Serial.println("Syncing offline transactions to Supabase...");
  while(file.available()) {
    String line = file.readStringUntil('\\n');
    line.trim();
    if(line.length() > 0) {
      HTTPClient http;
      http.begin(String(SUPABASE_URL) + "/rest/v1/transactions");
      http.addHeader("apikey", SUPABASE_ANON_KEY);
      http.addHeader("Authorization", String("Bearer ") + SUPABASE_ANON_KEY);
      http.addHeader("Content-Type", "application/json");
      http.POST(line);
      http.end();
      delay(100);
    }
  }
  file.close();
  LittleFS.remove(OFFLINE_BUFFER_FILE); // Clear buffer after upload
  Serial.println("Offline queue sync completed!");
}
`;
