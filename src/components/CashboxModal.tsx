import { useState } from 'react';
import { X, Coins, Check, ShieldCheck } from 'lucide-react';
import type { Machine } from '../types/vending';

interface CashboxModalProps {
  isOpen: boolean;
  onClose: () => void;
  machine: Machine;
  onConfirmCollection: (operatorName: string, collectedAmount: number) => void;
}

export const CashboxModal: React.FC<CashboxModalProps> = ({
  isOpen,
  onClose,
  machine,
  onConfirmCollection
}) => {
  if (!isOpen) return null;

  const [operator, setOperator] = useState('Admin (K. Cruz)');
  const [collectedAmount, setCollectedAmount] = useState(machine.cashboxTotal);

  const handleConfirm = () => {
    onConfirmCollection(operator, collectedAmount);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="brand-logo-icon">
              <Coins size={18} />
            </div>
            <div>
              <h3>Cashbox Collection & Audit</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                Empty coin collection vault and reset hardware tally
              </p>
            </div>
          </div>
          <button type="button" className="btn-ghost btn-icon-only" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Current Balance Summary */}
        <div style={{ 
          background: '#f4f5f7', 
          border: '1px solid #e5e7eb', 
          padding: 20, 
          borderRadius: '16px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--muted)', textTransform: 'uppercase', fontWeight: 800 }}>
            Current Cash in Vault
          </div>
          <div style={{ fontSize: '2.5rem', fontWeight: 900, color: '#000000', margin: '4px 0', fontFamily: 'var(--font-display)', letterSpacing: '-0.04em' }}>
            ₱{machine.cashboxTotal.toFixed(2)}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 600 }}>
            Total pulses recorded: {machine.cashboxCoins} coins
          </div>
        </div>

        {/* Form */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#000000', textTransform: 'uppercase', marginBottom: 6 }}>
              Amount Collected (PHP ₱):
            </label>
            <input
              type="number"
              step="1"
              value={collectedAmount}
              onChange={(e) => setCollectedAmount(Number(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#000000', textTransform: 'uppercase', marginBottom: 6 }}>
              Authorized Keyholder:
            </label>
            <input
              type="text"
              value={operator}
              onChange={(e) => setOperator(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ fontSize: '0.78rem', color: 'var(--muted)', display: 'flex', gap: 6, alignItems: 'center' }}>
            <ShieldCheck size={14} color="#15803d" />
            <span>This action will reset the coin counter to ₱0.00 and log an audit trail entry.</span>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn" onClick={handleConfirm}>
            <Check size={16} />
            <span>Confirm Collection & Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};
