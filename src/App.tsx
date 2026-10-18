import { useState, useEffect } from 'react';
import { 
  INITIAL_MACHINE, 
  INITIAL_INVENTORY, 
  INITIAL_TRANSACTIONS, 
  INITIAL_LOGS 
} from './services/mockData';
import type { 
  Machine, 
  InventoryItem, 
  Transaction, 
  MaintenanceLog, 
  ActiveTab, 
  SupabaseConfig 
} from './types/vending';
import { 
  getStoredSupabaseConfig, 
  saveSupabaseConfig 
} from './services/supabaseClient';

// Components
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { MetricCards } from './components/MetricCards';
import { InventoryGrid } from './components/InventoryGrid';
import { TransactionTable } from './components/TransactionTable';
import { MachineHealth } from './components/MachineHealth';
import { SalesAnalytics } from './components/SalesAnalytics';
import { MaintenanceSection } from './components/MaintenanceSection';

// Modals
import { RestockModal } from './components/RestockModal';
import { SupabaseSetupModal } from './components/SupabaseSetupModal';
import { CashboxModal } from './components/CashboxModal';

// Styles
import './styles/dashboard.css';

export function App() {
  // Primary State
  const [machine, setMachine] = useState<Machine>(INITIAL_MACHINE);
  const [inventory, setInventory] = useState<InventoryItem[]>(INITIAL_INVENTORY);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [logs, setLogs] = useState<MaintenanceLog[]>(INITIAL_LOGS);
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  
  // UI State
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Modals State
  const [isRestockModalOpen, setIsRestockModalOpen] = useState<boolean>(false);
  const [selectedRestockItem, setSelectedRestockItem] = useState<InventoryItem | null>(null);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState<boolean>(false);
  const [isCashboxModalOpen, setIsCashboxModalOpen] = useState<boolean>(false);

  // Supabase Config State
  const [supabaseConfig, setSupabaseConfig] = useState<SupabaseConfig>(getStoredSupabaseConfig());

  // Show Toast Helper
  const showToast = (message: string) => {
    setNotification(message);
    setTimeout(() => {
      setNotification((curr) => (curr === message ? null : curr));
    }, 4000);
  };

  // Uptime ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setMachine(prev => ({
        ...prev,
        espUptimeSec: prev.espUptimeSec + 1
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Handle Refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      showToast('Machine telemetry and cloud database refreshed.');
    }, 500);
  };

  // Synchronize Offline LittleFS Queue to Supabase
  const handleSyncOfflineQueue = () => {
    if (machine.offlineQueueCount > 0) {
      const syncCount = machine.offlineQueueCount;
      const nowIso = new Date().toISOString();

      setTransactions(prev =>
        prev.map(t => (t.isOfflineSynced && !t.offlineSyncedAt ? { ...t, offlineSyncedAt: nowIso } : t))
      );

      setMachine(prev => ({ ...prev, offlineQueueCount: 0 }));

      const syncLog: MaintenanceLog = {
        id: `log-${Date.now()}`,
        timestamp: nowIso,
        type: 'offline_sync',
        severity: 'success',
        title: `Offline LittleFS Buffer Synced (${syncCount} items)`,
        details: `WiFi reconnected. Uploaded ${syncCount} queued offline transactions to Supabase REST endpoint successfully.`,
        operator: 'ESP32 LittleFS Auto-Sync'
      };
      setLogs(prev => [syncLog, ...prev]);
      showToast(`${syncCount} offline purchase(s) synced to Supabase.`);
    } else {
      showToast('Offline buffer is clear. All transactions are up to date.');
    }
  };

  // Handle Restock Item
  const handleSaveRestock = (updatedItem: InventoryItem) => {
    setInventory(prev =>
      prev.map(item => (item.id === updatedItem.id ? updatedItem : item))
    );

    const log: MaintenanceLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'refill',
      severity: 'info',
      title: `Slot #${updatedItem.slot} Restocked (${updatedItem.name})`,
      details: `Stock level updated to ${updatedItem.currentStock} / ${updatedItem.maxCapacity} units. Retail price set to ₱${updatedItem.price.toFixed(2)}.`,
      operator: 'Admin (K. Cruz)'
    };
    setLogs(prev => [log, ...prev]);
    showToast(`Slot #${updatedItem.slot} updated: ${updatedItem.currentStock} units available.`);
  };

  // Handle Cashbox Collection
  const handleConfirmCashboxCollection = (operatorName: string, collectedAmount: number) => {
    setMachine(prev => ({
      ...prev,
      cashboxCoins: 0,
      cashboxTotal: 0
    }));

    const log: MaintenanceLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: 'cash_collection',
      severity: 'info',
      title: 'Cashbox Vault Collected & Audited',
      details: `Physically collected ₱${collectedAmount.toFixed(2)} in coin pulses. Coin counter reset to 0.`,
      operator: operatorName
    };
    setLogs(prev => [log, ...prev]);
    showToast(`Cashbox audited: ₱${collectedAmount.toFixed(2)} collected by ${operatorName}.`);
  };

  // Handle Supabase Credentials Save
  const handleSaveSupabaseConfig = (url: string, key: string) => {
    saveSupabaseConfig(url, key);
    setSupabaseConfig(getStoredSupabaseConfig());
    showToast('Supabase project credentials saved.');
  };

  const handleResetToDemo = () => {
    saveSupabaseConfig('', '');
    setSupabaseConfig(getStoredSupabaseConfig());
    showToast('Reset to Built-in Interactive Demo Mode.');
  };

  const lowStockCount = inventory.filter(item => item.currentStock <= item.lowStockThreshold).length;

  return (
    <div className="app-container">
      {/* Toast Notification */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: 20,
          right: 20,
          background: '#000000',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
          padding: '12px 18px',
          borderRadius: '12px',
          color: '#ffffff',
          fontSize: '13px',
          fontWeight: 700,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          animation: 'rise 0.25s ease-out'
        }}>
          <span>{notification}</span>
        </div>
      )}

      {/* Header */}
      <Header
        machine={machine}
        onRefresh={handleRefresh}
        isRefreshing={isRefreshing}
      />

      {/* Dashboard Main Workspace */}
      <main className="dashboard-main">
        {/* Navigation Bar (Tabs on Desktop, Bottom Bar on Mobile) */}
        <Navigation
          activeTab={activeTab}
          onSelectTab={setActiveTab}
          lowStockCount={lowStockCount}
          offlineCount={machine.offlineQueueCount}
        />

        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <>
            {/* TrackErentory Editorial Hero Strip */}
            <div className="hero-strip">
              <div>
                <h1>School Supplies Vending Admin</h1>
                <p>Real-time machine monitoring, offline LittleFS buffering, and Supabase integration.</p>
              </div>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <button 
                  type="button" 
                  className="btn" 
                  onClick={() => {
                    setSelectedRestockItem(inventory[0]);
                    setIsRestockModalOpen(true);
                  }}
                >
                  <span>Restock Supplies</span>
                </button>
                <button type="button" className="btn-ghost" onClick={() => setIsCashboxModalOpen(true)}>
                  <span>Audit Cashbox</span>
                </button>
              </div>
            </div>

            {/* Metric Stat Cards */}
            <MetricCards
              machine={machine}
              inventory={inventory}
              transactions={transactions}
              onOpenCashboxModal={() => setIsCashboxModalOpen(true)}
              onGoToInventory={() => setActiveTab('inventory')}
            />

            {/* Supplies Inventory Grid */}
            <InventoryGrid
              inventory={inventory}
              onOpenRestock={(item) => {
                setSelectedRestockItem(item);
                setIsRestockModalOpen(true);
              }}
            />

            {/* Sales Breakdown & Rankings */}
            <SalesAnalytics
              transactions={transactions}
              inventory={inventory}
            />

            {/* Recent Transactions Feed */}
            <TransactionTable
              transactions={transactions}
            />
          </>
        )}

        {/* Tab 2: School Supplies Inventory */}
        {activeTab === 'inventory' && (
          <InventoryGrid
            inventory={inventory}
            onOpenRestock={(item) => {
              setSelectedRestockItem(item);
              setIsRestockModalOpen(true);
            }}
          />
        )}

        {/* Tab 3: Transactions */}
        {activeTab === 'transactions' && (
          <TransactionTable
            transactions={transactions}
          />
        )}

        {/* Tab 4: ESP32 & Hardware Telemetry */}
        {activeTab === 'hardware' && (
          <MachineHealth
            machine={machine}
            inventory={inventory}
            onTriggerPing={() => showToast(`Hardware Ping: ESP32 response in 24ms (Signal ${machine.wifiRssi} dBm)`)}
            onResetCashbox={() => setIsCashboxModalOpen(true)}
            onForceSyncBuffer={handleSyncOfflineQueue}
          />
        )}

        {/* Tab 5: Audit & Maintenance Logs */}
        {activeTab === 'logs' && (
          <MaintenanceSection
            logs={logs}
            onOpenCashboxModal={() => setIsCashboxModalOpen(true)}
            onOpenRestockModal={() => {
              setSelectedRestockItem(inventory[0]);
              setIsRestockModalOpen(true);
            }}
          />
        )}

        {/* Tab 6: Supabase & Firmware Code */}
        {activeTab === 'supabase' && (
          <div className="panel">
            <div className="panel-header">
              <div className="panel-title">
                <h2>Supabase Configuration & Arduino Firmware</h2>
                <p>Manage Database Connection, SQL Migrations & ESP32 LittleFS Code</p>
              </div>
              <button type="button" className="btn" onClick={() => setIsSupabaseModalOpen(true)}>
                Configure Project
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              <div style={{ background: '#f4f5f7', padding: '1.25rem', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
                <h4 style={{ color: '#000000', marginBottom: 6, fontSize: '0.9rem' }}>Supabase SQL Migration</h4>
                <p style={{ fontSize: '0.82rem', color: '#555555', lineHeight: 1.5 }}>
                  Your schema includes <code>machines</code>, <code>inventory</code>, <code>transactions</code>, and <code>maintenance_logs</code> with real-time websocket replication.
                </p>
                <button 
                  type="button"
                  className="btn-ghost" 
                  style={{ marginTop: 12, fontSize: '0.78rem' }}
                  onClick={() => setIsSupabaseModalOpen(true)}
                >
                  View SQL Script
                </button>
              </div>

              <div style={{ background: '#f4f5f7', padding: '1.25rem', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
                <h4 style={{ color: '#000000', marginBottom: 6, fontSize: '0.9rem' }}>ESP32 Offline LittleFS Logic</h4>
                <p style={{ fontSize: '0.82rem', color: '#555555', lineHeight: 1.5 }}>
                  The firmware writes purchase events to <code>/offline_txns.json</code> during campus WiFi outages and syncs immediately when connection returns.
                </p>
                <button 
                  type="button"
                  className="btn" 
                  style={{ marginTop: 12, fontSize: '0.78rem' }}
                  onClick={() => setIsSupabaseModalOpen(true)}
                >
                  View Arduino C++ Code
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Modals */}
      <RestockModal
        isOpen={isRestockModalOpen}
        item={selectedRestockItem}
        onClose={() => setIsRestockModalOpen(false)}
        onSave={handleSaveRestock}
      />

      <CashboxModal
        isOpen={isCashboxModalOpen}
        onClose={() => setIsCashboxModalOpen(false)}
        machine={machine}
        onConfirmCollection={handleConfirmCashboxCollection}
      />

      <SupabaseSetupModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
        config={supabaseConfig}
        onSaveConfig={handleSaveSupabaseConfig}
        onResetToDemo={handleResetToDemo}
      />
    </div>
  );
}

export default App;
