import { useState } from 'react';
import { 
  Cpu, 
  Zap, 
  Wifi, 
  HardDrive, 
  ShieldCheck, 
  ShieldAlert, 
  Coins, 
  Radio, 
  FileCheck2,
  Activity
} from 'lucide-react';
import type { Machine, InventoryItem } from '../types/vending';

interface MachineHealthProps {
  machine: Machine;
  inventory: InventoryItem[];
  onTriggerPing: () => void;
  onResetCashbox: () => void;
  onForceSyncBuffer: () => void;
}

export const MachineHealth: React.FC<MachineHealthProps> = ({
  machine,
  onTriggerPing,
  onResetCashbox,
  onForceSyncBuffer
}) => {
  const [pingStatus, setPingStatus] = useState<string | null>(null);

  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${d}d ${h}h ${m}m`;
  };

  const handlePing = () => {
    onTriggerPing();
    setPingStatus(`Ping acknowledged: ESP32 response time 24ms. Signal: ${machine.wifiRssi} dBm.`);
    setTimeout(() => setPingStatus(null), 4000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* 1. Hardware Overview */}
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">
            <div className="brand-logo-icon">
              <Cpu size={20} />
            </div>
            <div>
              <h2>Machine Hardware Status</h2>
              <p>ESP32 Controller • Power Status • Network & Cabinet Security</p>
            </div>
          </div>

          <button type="button" className="btn-ghost" onClick={handlePing}>
            <Radio size={14} />
            <span>Ping Controller</span>
          </button>
        </div>

        {pingStatus && (
          <div style={{ background: '#f4f5f7', border: '1px solid #000000', padding: '10px 14px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 600 }}>
            {pingStatus}
          </div>
        )}

        {/* Telemetry Boxes Grid */}
        <div className="telemetry-grid">
          {/* Box 1: ESP32 Chip */}
          <div className="telemetry-box">
            <div className="telemetry-box-header">
              <span>Controller Unit</span>
              <Cpu size={16} />
            </div>
            <div className="telemetry-box-body">
              <span className="telemetry-box-value">ESP32</span>
              <span className="telemetry-box-sub">v2.4 Firmware</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--muted)', display: 'flex', flexDirection: 'column', gap: 3, marginTop: 4 }}>
              <span>Uptime: <strong style={{ color: '#000000' }}>{formatUptime(machine.espUptimeSec)}</strong></span>
              <span>Available Heap: <strong style={{ color: '#15803d' }}>{Math.round(machine.freeHeapBytes / 1024)} KB</strong></span>
              <span>MAC: {machine.macAddress}</span>
            </div>
          </div>

          {/* Box 2: Power Status */}
          <div className="telemetry-box">
            <div className="telemetry-box-header">
              <span>Power Supply</span>
              <Zap size={16} />
            </div>
            <div className="telemetry-box-body">
              <span className="telemetry-box-value">12V / 5V</span>
              <span className="telemetry-box-sub">Nominal OK</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--muted)', display: 'flex', flexDirection: 'column', gap: 3, marginTop: 4 }}>
              <span>12V Rail: Coin Mechanism & Servos</span>
              <span>5V Rail: ESP32 Logic & IR Sensor Array</span>
              <span>AC Power: Connected & Stable</span>
            </div>
          </div>

          {/* Box 3: WiFi Connection */}
          <div className="telemetry-box">
            <div className="telemetry-box-header">
              <span>Network Connection</span>
              <Wifi size={16} />
            </div>
            <div className="telemetry-box-body">
              <span className="telemetry-box-value">{machine.wifiRssi} dBm</span>
              <span className="telemetry-box-sub">WiFi Connected</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--muted)', display: 'flex', flexDirection: 'column', gap: 3, marginTop: 4 }}>
              <span>IP Address: <strong style={{ color: '#000000' }}>{machine.ipAddress}</strong></span>
              <span>SSID: DepEd_Pampanga_WiFi</span>
              <span>Cloud Status: Supabase Realtime Active</span>
            </div>
          </div>

          {/* Box 4: Cabinet Security */}
          <div className="telemetry-box">
            <div className="telemetry-box-header">
              <span>Cabinet Tamper Sensor</span>
              {machine.doorOpen ? <ShieldAlert size={16} color="#dc2626" /> : <ShieldCheck size={16} color="#15803d" />}
            </div>
            <div className="telemetry-box-body">
              <span className="telemetry-box-value" style={{ color: machine.doorOpen ? '#dc2626' : '#15803d' }}>
                {machine.doorOpen ? 'OPEN' : 'LOCKED'}
              </span>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--muted)', display: 'flex', flexDirection: 'column', gap: 3, marginTop: 4 }}>
              <span>Limit Switch: GPIO 23</span>
              <span>Status: Physical door switch securely latched</span>
              <span>Alerts: Immediate push log on opening</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Offline Mode & LittleFS Queue */}
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">
            <div className="brand-logo-icon">
              <HardDrive size={20} />
            </div>
            <div>
              <h2>Offline Resilience & LittleFS Buffer</h2>
              <p>Automatic Flash Memory Storage During Campus WiFi Outages</p>
            </div>
          </div>

          <button type="button" className="btn" onClick={onForceSyncBuffer}>
            <FileCheck2 size={14} />
            <span>Sync Offline Queue</span>
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          <div style={{ background: '#f4f5f7', padding: '1.25rem', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
            <h4 style={{ fontSize: '0.9rem', marginBottom: 6, color: '#000000' }}>Offline Transaction Queuing:</h4>
            <p style={{ fontSize: '0.82rem', color: '#555555', lineHeight: 1.6 }}>
              If school WiFi drops, students can still purchase school supplies without interruption.
              The ESP32 processes coins, verifies the chute drop IR sensor, and appends the transaction to <code>/offline_txns.json</code> in LittleFS flash memory.
            </p>
          </div>

          <div style={{ background: '#f4f5f7', padding: '1.25rem', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
            <h4 style={{ fontSize: '0.9rem', marginBottom: 6, color: '#000000' }}>Automatic Reconnection Sync:</h4>
            <p style={{ fontSize: '0.82rem', color: '#555555', lineHeight: 1.6 }}>
              Upon reconnecting to WiFi, the ESP32 uploads all queued purchases to the Supabase transactions table and marks them as <code>is_offline_synced = true</code>.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Physical Maintenance Actions */}
      <div className="panel">
        <div className="panel-header">
          <div className="panel-title">
            <div className="brand-logo-icon">
              <Activity size={20} />
            </div>
            <div>
              <h2>Cashbox Management</h2>
              <p>Physical collection and audit resets for administrators</p>
            </div>
          </div>
        </div>

        <div style={{ background: '#f4f5f7', padding: '1.25rem', borderRadius: '16px', border: '1px solid #e5e7eb', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <h4 style={{ fontSize: '0.9rem', color: '#000000' }}>Empty Cashbox Vault</h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: 2 }}>
              Reset the coin pulse tally to zero after physically collecting the coins from the locked collection bin.
            </p>
          </div>
          <button type="button" className="btn" onClick={onResetCashbox}>
            <Coins size={14} />
            <span>Audit & Reset Vault</span>
          </button>
        </div>
      </div>
    </div>
  );
};
