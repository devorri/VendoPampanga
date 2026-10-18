import { 
  Cpu, 
  RefreshCw, 
  ShieldCheck, 
  ShieldAlert
} from 'lucide-react';
import type { Machine } from '../types/vending';

interface HeaderProps {
  machine: Machine;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  machine,
  onRefresh,
  isRefreshing
}) => {
  return (
    <header className="app-header">
      <div className="header-content">
        {/* Brand / Logo */}
        <div className="brand-section">
          <div className="brand-logo-icon">
            <Cpu size={20} />
          </div>
          <div className="brand-titles">
            <h1>VendoPampanga</h1>
            <p>School Supplies Vending Machine • Admin Console</p>
          </div>
        </div>

        {/* Clean, Simple Status Badges */}
        <div className="header-actions">
          {/* Machine Online / Offline Status */}
          <div 
            className={`connection-badge ${machine.status === 'online' ? 'ok' : 'warn'}`}
            title={`Machine ID: ${machine.id}`}
          >
            <span className={`status-dot ${machine.status === 'online' ? 'live-pulse' : ''}`} />
            <span>ESP32 {machine.status === 'online' ? 'Online' : 'Offline'}</span>
          </div>

          {/* Cabinet Door Security Switch */}
          <div 
            className={`connection-badge ${machine.doorOpen ? 'bad' : 'ok'}`}
            title="Cabinet Security Limit Switch"
          >
            {machine.doorOpen ? <ShieldAlert size={13} /> : <ShieldCheck size={13} />}
            <span>{machine.doorOpen ? 'Cabinet Open' : 'Cabinet Locked'}</span>
          </div>

          {/* Refresh Data */}
          <button 
            type="button"
            className="btn-ghost btn-icon-only" 
            onClick={onRefresh}
            title="Refresh Data"
          >
            <RefreshCw size={15} className={isRefreshing ? "spin-animation" : ""} />
          </button>
        </div>
      </div>
    </header>
  );
};
