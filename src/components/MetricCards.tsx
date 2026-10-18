import { Coins, ShoppingBag, AlertTriangle, CloudCheck, ArrowUpRight } from 'lucide-react';
import type { Machine, InventoryItem, Transaction } from '../types/vending';

interface MetricCardsProps {
  machine: Machine;
  inventory: InventoryItem[];
  transactions: Transaction[];
  onOpenCashboxModal: () => void;
  onGoToInventory: () => void;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  machine,
  inventory,
  transactions,
  onOpenCashboxModal,
  onGoToInventory
}) => {
  const completedTxns = transactions.filter(t => t.status === 'completed');
  const totalRevenue = completedTxns.reduce((sum, t) => sum + t.itemPrice, 0);
  const offlineSyncedCount = transactions.filter(t => t.isOfflineSynced).length;
  
  const lowStockCount = inventory.filter(item => item.currentStock <= item.lowStockThreshold).length;
  const totalStock = inventory.reduce((sum, item) => sum + item.currentStock, 0);
  const maxStock = inventory.reduce((sum, item) => sum + item.maxCapacity, 0);
  const stockPercentage = Math.round((totalStock / (maxStock || 1)) * 100);

  return (
    <div className="stat-grid">
      {/* 1. Cashbox Coins & Total Revenue */}
      <div className="stat">
        <div>
          <div className="label">Cashbox vault</div>
          <div className="value">₱{machine.cashboxTotal.toLocaleString('en-PH', { minimumFractionDigits: 2 })}</div>
        </div>
        <div className="sub">
          <span>{machine.cashboxCoins} coins collected</span>
          <button 
            type="button"
            onClick={onOpenCashboxModal}
            style={{ 
              color: '#000000', 
              fontSize: '11px', 
              fontWeight: 800, 
              textDecoration: 'underline',
              marginLeft: '6px',
              textTransform: 'uppercase'
            }}
          >
            Audit / Empty
          </button>
        </div>
        <div className="stat-icon-wrap">
          <Coins size={20} />
        </div>
      </div>

      {/* 2. Items Dispensed & Sales */}
      <div className="stat">
        <div>
          <div className="label">Supplies dispensed</div>
          <div className="value">{completedTxns.length} units</div>
        </div>
        <div className="sub">
          <span style={{ fontWeight: 800, color: '#000000' }}>₱{totalRevenue.toFixed(2)} sales</span>
          <span>• 98.4% drop success</span>
        </div>
        <div className="stat-icon-wrap">
          <ShoppingBag size={20} />
        </div>
      </div>

      {/* 3. Supplies Inventory Level */}
      <div 
        className="stat" 
        onClick={onGoToInventory}
        role="button"
        tabIndex={0}
        style={{ cursor: 'pointer' }}
      >
        <div>
          <div className="label">Inventory health</div>
          <div className="value">{stockPercentage}%</div>
        </div>
        <div className="sub">
          {lowStockCount > 0 ? (
            <span style={{ color: '#dc2626', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '4px' }}>
              <AlertTriangle size={12} /> {lowStockCount} slot{lowStockCount > 1 ? 's' : ''} need restock
            </span>
          ) : (
            <span style={{ color: '#16a34a', fontWeight: 800 }}>All 8 slots well-stocked</span>
          )}
          <ArrowUpRight size={12} style={{ marginLeft: 4 }} />
        </div>
        <div className="stat-icon-wrap">
          {lowStockCount > 0 ? <AlertTriangle size={20} color="#dc2626" /> : <ShoppingBag size={20} />}
        </div>
      </div>

      {/* 4. LittleFS Offline Buffer & Cloud Sync */}
      <div className="stat">
        <div>
          <div className="label">Offline queue</div>
          <div className="value">{machine.offlineQueueCount} pending</div>
        </div>
        <div className="sub">
          <span style={{ color: '#000000', fontWeight: 800 }}>{offlineSyncedCount} offline sales synced</span>
          <span>• LittleFS active</span>
        </div>
        <div className="stat-icon-wrap">
          <CloudCheck size={20} />
        </div>
      </div>
    </div>
  );
};
