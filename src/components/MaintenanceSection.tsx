import { useState } from 'react';
import { 
  ClipboardList, 
  ShieldAlert, 
  Coins, 
  Package, 
  AlertTriangle, 
  CloudCheck, 
  Info 
} from 'lucide-react';
import type { MaintenanceLog } from '../types/vending';

interface MaintenanceSectionProps {
  logs: MaintenanceLog[];
  onOpenCashboxModal: () => void;
  onOpenRestockModal: () => void;
}

export const MaintenanceSection: React.FC<MaintenanceSectionProps> = ({
  logs,
  onOpenCashboxModal,
  onOpenRestockModal
}) => {
  const [filterType, setFilterType] = useState<string>('all');

  const filteredLogs = logs.filter(log => {
    if (filterType === 'all') return true;
    return log.type === filterType;
  });

  const getLogIcon = (type: MaintenanceLog['type']) => {
    switch (type) {
      case 'refill':
        return <Package size={16} />;
      case 'cash_collection':
        return <Coins size={16} />;
      case 'door_event':
        return <ShieldAlert size={16} color="#dc2626" />;
      case 'offline_sync':
        return <CloudCheck size={16} color="#15803d" />;
      case 'jam_cleared':
        return <AlertTriangle size={16} color="#b45309" />;
      default:
        return <Info size={16} />;
    }
  };

  const getSeverityBadgeClass = (sev: MaintenanceLog['severity']) => {
    switch (sev) {
      case 'success':
        return 'connection-badge ok';
      case 'alert':
        return 'connection-badge bad';
      case 'warning':
        return 'connection-badge warn';
      default:
        return 'connection-badge neutral';
    }
  };

  return (
    <div className="panel">
      {/* Header */}
      <div className="panel-header">
        <div className="panel-title">
          <div className="brand-logo-icon">
            <ClipboardList size={20} />
          </div>
          <div>
            <h2>Maintenance & System Audit Logs</h2>
            <p>Physical Door Tamper • Coin Audits • Restocking Records • Hardware Interlocks</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button type="button" className="btn" onClick={onOpenRestockModal}>
            <Package size={14} />
            <span>Record Restock</span>
          </button>
          <button type="button" className="btn-ghost" onClick={onOpenCashboxModal}>
            <Coins size={14} />
            <span>Collect Vault</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {[
          { id: 'all', label: 'All Logs' },
          { id: 'offline_sync', label: 'Offline Syncs' },
          { id: 'refill', label: 'Refills' },
          { id: 'cash_collection', label: 'Cash Audits' },
          { id: 'door_event', label: 'Door Events' },
          { id: 'jam_cleared', label: 'Safety Alerts' }
        ].map(item => (
          <button
            key={item.id}
            type="button"
            className={filterType === item.id ? 'btn' : 'btn-ghost'}
            style={{ padding: '0.45rem 0.9rem', fontSize: '0.78rem' }}
            onClick={() => setFilterType(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Logs Feed */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filteredLogs.map(log => (
          <div
            key={log.id}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 14,
              padding: '14px 16px',
              background: '#f4f5f7',
              border: '1px solid #e5e7eb',
              borderRadius: '16px'
            }}
          >
            <div style={{ 
              width: 36, 
              height: 36, 
              borderRadius: '10px', 
              background: '#ffffff', 
              border: '1px solid #e5e7eb',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              flexShrink: 0,
              color: '#000000'
            }}>
              {getLogIcon(log.type)}
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#000000' }}>
                  {log.title}
                </h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                  <span className={getSeverityBadgeClass(log.severity)} style={{ fontSize: '0.68rem' }}>
                    {log.severity.toUpperCase()}
                  </span>
                </div>
              </div>

              <p style={{ fontSize: '0.84rem', color: '#444444', marginTop: 4, lineHeight: 1.5 }}>
                {log.details}
              </p>

              <div style={{ marginTop: 6, fontSize: '0.75rem', color: 'var(--muted)', display: 'flex', gap: 6 }}>
                <span>Operator: <strong style={{ color: '#000000' }}>{log.operator}</strong></span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
