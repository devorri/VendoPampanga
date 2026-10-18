import { useState } from 'react';
import { X, Package, Check } from 'lucide-react';
import type { InventoryItem } from '../types/vending';

interface RestockModalProps {
  isOpen: boolean;
  item: InventoryItem | null;
  onClose: () => void;
  onSave: (updatedItem: InventoryItem) => void;
}

export const RestockModal: React.FC<RestockModalProps> = ({
  isOpen,
  item,
  onClose,
  onSave
}) => {
  if (!isOpen || !item) return null;

  const [currentStock, setCurrentStock] = useState<number>(item.currentStock);
  const [maxCapacity, setMaxCapacity] = useState<number>(item.maxCapacity);
  const [price, setPrice] = useState<number>(item.price);
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(item.lowStockThreshold);
  const [name, setName] = useState<string>(item.name);

  const handleFillMax = () => {
    setCurrentStock(maxCapacity);
  };

  const handleSave = () => {
    onSave({
      ...item,
      name,
      currentStock,
      maxCapacity,
      price,
      lowStockThreshold,
      irSensorState: currentStock > 0 ? 'ok' : 'empty',
      lastRefillTime: new Date().toISOString()
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="brand-logo-icon">
              <Package size={18} />
            </div>
            <div>
              <h3>Slot #{item.slot}: Restock & Pricing</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                Update school supplies inventory and retail price
              </p>
            </div>
          </div>
          <button type="button" className="btn-ghost btn-icon-only" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#000000', textTransform: 'uppercase', marginBottom: 6 }}>
              School Supply Name:
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#000000', textTransform: 'uppercase', marginBottom: 6 }}>
                Retail Price (PHP ₱):
              </label>
              <input
                type="number"
                step="1"
                min="1"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#000000', textTransform: 'uppercase', marginBottom: 6 }}>
                Tray Capacity (Units):
              </label>
              <input
                type="number"
                min="5"
                max="50"
                value={maxCapacity}
                onChange={(e) => setMaxCapacity(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 800, color: '#000000', textTransform: 'uppercase' }}>
                  Current Stock:
                </label>
                <button 
                  type="button"
                  onClick={handleFillMax}
                  style={{ color: '#000000', fontSize: '0.75rem', fontWeight: 800, textDecoration: 'underline' }}
                >
                  Fill Max ({maxCapacity})
                </button>
              </div>
              <input
                type="number"
                min="0"
                max={maxCapacity}
                value={currentStock}
                onChange={(e) => setCurrentStock(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#000000', textTransform: 'uppercase', marginBottom: 6 }}>
                Low Stock Alert Threshold:
              </label>
              <input
                type="number"
                min="1"
                max="15"
                value={lowStockThreshold}
                onChange={(e) => setLowStockThreshold(Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn" onClick={handleSave}>
            <Check size={16} />
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};
