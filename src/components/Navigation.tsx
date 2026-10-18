import { 
  LayoutDashboard, 
  Package, 
  ReceiptText, 
  Cpu, 
  ClipboardList, 
  Database 
} from 'lucide-react';
import type { ActiveTab } from '../types/vending';

interface NavigationProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  lowStockCount: number;
  offlineCount: number;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onSelectTab,
  lowStockCount,
  offlineCount
}) => {
  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'inventory', label: 'School Supplies', icon: Package, badge: lowStockCount > 0 ? lowStockCount : undefined },
    { id: 'transactions', label: 'Transactions', icon: ReceiptText, offlineBadge: offlineCount > 0 ? offlineCount : undefined },
    { id: 'hardware', label: 'ESP32 & Hardware', icon: Cpu },
    { id: 'logs', label: 'Audit & Logs', icon: ClipboardList },
    { id: 'supabase', label: 'Supabase & Code', icon: Database }
  ];

  return (
    <>
      {/* Desktop / Tablet Tab Bar */}
      <nav className="nav-tabs-bar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              className={`tab-btn ${isActive ? 'active' : ''}`}
              onClick={() => onSelectTab(tab.id as ActiveTab)}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className="tab-badge" title={`${tab.badge} slots low or out of stock`}>
                  {tab.badge}
                </span>
              )}
              {tab.offlineBadge !== undefined && (
                <span className="tab-badge" style={{ background: '#f59e0b' }} title={`${tab.offlineBadge} offline synced`}>
                  {tab.offlineBadge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Mobile Floating Bottom Bar */}
      <div className="mobile-bottom-nav">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <div
              key={tab.id}
              className={`mobile-nav-item ${isActive ? 'active' : ''}`}
              onClick={() => onSelectTab(tab.id as ActiveTab)}
            >
              <div style={{ position: 'relative' }}>
                <Icon size={20} />
                {tab.badge !== undefined && (
                  <span
                    style={{
                      position: 'absolute',
                      top: -4,
                      right: -6,
                      background: 'var(--accent-rose)',
                      color: 'white',
                      fontSize: '9px',
                      padding: '1px 4px',
                      borderRadius: '999px',
                      fontWeight: 700
                    }}
                  >
                    {tab.badge}
                  </span>
                )}
              </div>
              <span>{tab.label}</span>
            </div>
          );
        })}
      </div>
    </>
  );
};
