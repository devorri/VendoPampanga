import { useState } from 'react';
import { 
  ReceiptText, 
  Download, 
  Search, 
  CheckCircle2, 
  XCircle, 
  CloudCheck
} from 'lucide-react';
import type { Transaction } from '../types/vending';

interface TransactionTableProps {
  transactions: Transaction[];
}

export const TransactionTable: React.FC<TransactionTableProps> = ({ transactions }) => {
  const [filterType, setFilterType] = useState<'all' | 'completed' | 'offline_synced' | 'refunded'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = transactions.filter(t => {
    if (filterType === 'completed' && t.status !== 'completed') return false;
    if (filterType === 'offline_synced' && !t.isOfflineSynced) return false;
    if (filterType === 'refunded' && t.status !== 'cancelled_refunded' && t.status !== 'failed_jam') return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        t.refCode.toLowerCase().includes(q) ||
        t.itemName.toLowerCase().includes(q) ||
        `slot ${t.slot}`.includes(q)
      );
    }
    return true;
  });

  const exportCSV = () => {
    const headers = ['Ref Code', 'Date/Time', 'Slot', 'School Supply', 'Amount Paid', 'Price', 'Change Given', 'Status', 'Offline Synced', 'Chute Verified'];
    const rows = transactions.map(t => [
      t.refCode,
      new Date(t.timestamp).toLocaleString(),
      t.slot,
      `"${t.itemName.replace(/"/g, '""')}"`,
      t.amountInserted,
      t.itemPrice,
      t.changeDispensed,
      t.status,
      t.isOfflineSynced ? 'Yes (Buffered)' : 'No (Live)',
      t.chuteSensorConfirmed ? 'Yes' : 'No'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `VendoPampanga_Transactions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatRelativeTime = (isoString: string) => {
    const diffSec = Math.floor((Date.now() - new Date(isoString).getTime()) / 1000);
    if (diffSec < 60) return `${diffSec}s ago`;
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)}m ago`;
    if (diffSec < 86400) return `${Math.floor(diffSec / 3600)}h ago`;
    return new Date(isoString).toLocaleDateString();
  };

  return (
    <div className="panel">
      {/* Header and Controls */}
      <div className="panel-header">
        <div className="panel-title">
          <div className="brand-logo-icon">
            <ReceiptText size={20} />
          </div>
          <div>
            <h2>Transaction Records</h2>
            <p>Live Purchases • LittleFS Offline Sync Records • Chute Drop Verification</p>
          </div>
        </div>

        <div className="table-controls">
          {/* Quick Filters */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <button
              type="button"
              className={filterType === 'all' ? 'btn' : 'btn-ghost'}
              style={{ padding: '0.45rem 0.9rem', fontSize: '0.78rem' }}
              onClick={() => setFilterType('all')}
            >
              All ({transactions.length})
            </button>
            <button
              type="button"
              className={filterType === 'offline_synced' ? 'btn' : 'btn-ghost'}
              style={{ padding: '0.45rem 0.9rem', fontSize: '0.78rem' }}
              onClick={() => setFilterType('offline_synced')}
            >
              Offline Synced ({transactions.filter(t => t.isOfflineSynced).length})
            </button>
            <button
              type="button"
              className={filterType === 'refunded' ? 'btn' : 'btn-ghost'}
              style={{ padding: '0.45rem 0.9rem', fontSize: '0.78rem' }}
              onClick={() => setFilterType('refunded')}
            >
              Refunds / Jams
            </button>
          </div>

          <div className="search-input-wrap">
            <Search size={14} color="var(--muted)" />
            <input
              type="text"
              placeholder="Search reference or item..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <button type="button" className="btn-ghost" onClick={exportCSV} title="Export CSV for auditing">
            <Download size={14} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* TrackErentory Table Wrap */}
      <div className="table-wrap">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Time</th>
                <th>Item & Slot</th>
                <th>Amount / Price</th>
                <th>Change</th>
                <th>Drop IR</th>
                <th>Sync Source</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '30px', color: 'var(--muted)' }}>
                    No transactions match the selected criteria.
                  </td>
                </tr>
              ) : (
                filtered.map(txn => {
                  const isSuccess = txn.status === 'completed';
                  return (
                    <tr key={txn.id}>
                      <td>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: '#000000' }}>
                          {txn.refCode}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#000000' }}>
                            {formatRelativeTime(txn.timestamp)}
                          </span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>
                            {new Date(txn.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div>
                          <strong style={{ display: 'block', color: '#000000' }}>{txn.itemName}</strong>
                          <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>
                            Dispensed from Slot #{txn.slot}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div>
                          <span style={{ color: '#000000', fontWeight: 800 }}>₱{txn.itemPrice.toFixed(2)}</span>
                          <span style={{ fontSize: '0.72rem', color: 'var(--muted)', display: 'block' }}>
                            Inserted ₱{txn.amountInserted.toFixed(2)}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: txn.changeDispensed > 0 ? '#b45309' : 'var(--muted)' }}>
                          ₱{txn.changeDispensed.toFixed(2)}
                        </span>
                      </td>
                      <td>
                        {txn.chuteSensorConfirmed ? (
                          <span title="Drop confirmed by IR beam sensor at dispenser chute" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#15803d', fontSize: '0.78rem', fontWeight: 700 }}>
                            <CheckCircle2 size={13} /> Verified
                          </span>
                        ) : (
                          <span title="Chute sensor did not trigger - Coin refunded" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, color: '#dc2626', fontSize: '0.78rem', fontWeight: 700 }}>
                            <XCircle size={13} /> Not Detected
                          </span>
                        )}
                      </td>
                      <td>
                        {txn.isOfflineSynced ? (
                          <span 
                            className="sync-badge offline-buffer"
                            title={`Buffered locally on ESP32 LittleFS during internet outage, synced at ${txn.offlineSyncedAt ? new Date(txn.offlineSyncedAt).toLocaleTimeString() : 'reconnection'}`}
                          >
                            <CloudCheck size={12} />
                            <span>LittleFS Synced</span>
                          </span>
                        ) : (
                          <span className="sync-badge realtime" title="Direct live cloud synchronization">
                            <span>Cloud Live</span>
                          </span>
                        )}
                      </td>
                      <td>
                        {isSuccess ? (
                          <span style={{ color: '#15803d', fontWeight: 800, fontSize: '0.78rem', textTransform: 'uppercase' }}>
                            Completed
                          </span>
                        ) : (
                          <span style={{ color: '#dc2626', fontWeight: 800, fontSize: '0.78rem', textTransform: 'uppercase' }}>
                            Refunded
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
