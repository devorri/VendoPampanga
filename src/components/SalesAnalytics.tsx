import { BarChart3, TrendingUp, PieChart, Clock, Award } from 'lucide-react';
import type { Transaction, InventoryItem } from '../types/vending';

interface SalesAnalyticsProps {
  transactions: Transaction[];
  inventory: InventoryItem[];
}

export const SalesAnalytics: React.FC<SalesAnalyticsProps> = ({ transactions, inventory }) => {
  const completed = transactions.filter(t => t.status === 'completed');
  const totalSales = completed.reduce((sum, t) => sum + t.itemPrice, 0);

  // Group by item
  const itemCounts: Record<string, { count: number; revenue: number; slot: number }> = {};
  completed.forEach(t => {
    if (!itemCounts[t.itemName]) {
      itemCounts[t.itemName] = { count: 0, revenue: 0, slot: t.slot };
    }
    itemCounts[t.itemName].count += 1;
    itemCounts[t.itemName].revenue += t.itemPrice;
  });

  const sortedItems = Object.entries(itemCounts).sort((a, b) => b[1].revenue - a[1].revenue);
  const bestSeller = sortedItems[0] ? sortedItems[0][0] : 'HBW Matrix Ballpen';

  // Group by category
  const categorySales: Record<string, number> = {
    Writing: 0,
    Paper: 0,
    Correction: 0,
    Accessories: 0
  };

  completed.forEach(t => {
    const invItem = inventory.find(i => i.slot === t.slot);
    const cat = invItem?.category || 'Writing';
    categorySales[cat] = (categorySales[cat] || 0) + t.itemPrice;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top 3 Metric Cards */}
      <div className="stat-grid">
        <div className="stat">
          <div>
            <div className="label">Top selling supply</div>
            <div className="value" style={{ fontSize: '1.4rem' }}>{bestSeller}</div>
          </div>
          <div className="sub">
            <span>Highest student demand during morning quiz rush</span>
          </div>
          <div className="stat-icon-wrap">
            <Award size={20} />
          </div>
        </div>

        <div className="stat">
          <div>
            <div className="label">Campus peak rush</div>
            <div className="value" style={{ fontSize: '1.4rem' }}>11:30 AM - 1:00 PM</div>
          </div>
          <div className="sub">
            <span>Secondary surge at 7:15 AM (Before homeroom)</span>
          </div>
          <div className="stat-icon-wrap">
            <Clock size={20} />
          </div>
        </div>

        <div className="stat">
          <div>
            <div className="label">Average purchase</div>
            <div className="value" style={{ fontSize: '1.4rem' }}>
              ₱{completed.length > 0 ? (totalSales / completed.length).toFixed(2) : '0.00'}
            </div>
          </div>
          <div className="sub">
            <span>Typically 1-2 coins inserted per student</span>
          </div>
          <div className="stat-icon-wrap">
            <TrendingUp size={20} />
          </div>
        </div>
      </div>

      {/* Breakdown by Category & Per Item */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {/* Category Share */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">
              <PieChart size={18} />
              <h3>Revenue Share by Category</h3>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {Object.entries(categorySales).map(([cat, rev]) => {
              const pct = totalSales > 0 ? Math.round((rev / totalSales) * 100) : 0;
              return (
                <div key={cat} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                    <span style={{ fontWeight: 800, textTransform: 'uppercase' }}>{cat}</span>
                    <span style={{ fontWeight: 800 }}>₱{rev.toFixed(2)} ({pct}%)</span>
                  </div>
                  <div className="stock-track">
                    <div 
                      className="stock-fill" 
                      style={{ 
                        width: `${Math.max(5, pct)}%`,
                        background: '#000000'
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Item Ranking */}
        <div className="panel">
          <div className="panel-header">
            <div className="panel-title">
              <BarChart3 size={18} />
              <h3>School Supplies Ranking</h3>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {sortedItems.map(([name, data], idx) => (
              <div 
                key={name}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  background: '#f4f5f7',
                  borderRadius: '12px',
                  fontSize: '0.86rem'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ 
                    fontFamily: 'var(--font-display)', 
                    fontWeight: 900, 
                    color: '#000000',
                    width: 22
                  }}>
                    #{idx + 1}
                  </span>
                  <div>
                    <strong style={{ display: 'block', color: '#000000' }}>{name}</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>Slot #{data.slot}</span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ color: '#000000', fontWeight: 900 }}>₱{data.revenue.toFixed(2)}</span>
                  <span style={{ display: 'block', fontSize: '0.72rem', color: 'var(--muted)' }}>{data.count} dispensed</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
