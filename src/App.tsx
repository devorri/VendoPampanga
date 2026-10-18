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
  ActiveTab 
} from './types/vending';

// Components
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { MetricCards } from './components/MetricCards';
import { InventoryGrid } from './components/InventoryGrid';
import { TransactionTable } from './components/TransactionTable';
import { SalesAnalytics } from './components/SalesAnalytics';
import { MaintenanceSection } from './components/MaintenanceSection';

// Modals
import { RestockModal } from './components/RestockModal';
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
  const [isCashboxModalOpen, setIsCashboxModalOpen] = useState<boolean>(false);

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
        details: `WiFi reconnected. Uploaded ${syncCount} queued offline transactions to cloud database successfully.`,
        operator: 'ESP32 LittleFS Auto-Sync'
      };
      setLogs(prev => [syncLog, ...prev]);
      showToast(`${syncCount} offline purchase(s) synced to database.`);
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
              onSyncOfflineQueue={handleSyncOfflineQueue}
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

        {/* Tab 4: Audit & Maintenance Logs */}
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
    </div>
  );
}

export default App;
