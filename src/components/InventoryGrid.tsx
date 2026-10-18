import { useState } from 'react';
import { 
  Package, 
  PlusCircle, 
  AlertCircle, 
  CheckCircle2 
} from 'lucide-react';
import type { InventoryItem } from '../types/vending';

interface InventoryGridProps {
  inventory: InventoryItem[];
  onOpenRestock: (item: InventoryItem) => void;
}

export const InventoryGrid: React.FC<InventoryGridProps> = ({
  inventory,
  onOpenRestock
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const categories = ['All', 'Writing', 'Paper', 'Correction', 'Accessories'];

  const filteredItems = inventory.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          `slot ${item.slot}`.includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="panel">
      {/* Header and Controls */}
      <div className="panel-header">
        <div className="panel-title">
          <div className="brand-logo-icon">
            <Package size={20} />
          </div>
          <div>
            <h2>School Supplies Inventory & Slots</h2>
            <p>8 Dispensing Slots • Infrared Stock Sensors & Pricing</p>
          </div>
        </div>

        {/* Filter and Search */}
        <div className="table-controls">
          {/* Category Tabs */}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                className={selectedCategory === cat ? 'btn' : 'btn-ghost'}
                style={{ padding: '0.45rem 0.9rem', fontSize: '0.78rem' }}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="search-input-wrap">
            <input
              type="text"
              placeholder="Search supplies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Grid of Slots */}
      <div className="slots-grid">
        {filteredItems.map(item => {
          const isLow = item.currentStock <= item.lowStockThreshold && item.currentStock > 0;
          const isEmpty = item.currentStock === 0 || item.irSensorState === 'empty';
          const stockPercent = Math.min(100, Math.round((item.currentStock / item.maxCapacity) * 100));

          let fillClass = 'healthy';
          if (isLow) fillClass = 'warning';
          if (isEmpty) fillClass = 'critical';

          return (
            <div 
              key={item.id} 
              className={`slot-card ${isEmpty ? 'empty-alert' : ''}`}
            >
              {/* Card Top */}
              <div className="slot-header">
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span className="slot-badge">SLOT #{item.slot}</span>
                  <span className="slot-category-tag">{item.category}</span>
                </div>
                <div className="slot-price-tag">₱{item.price.toFixed(2)}</div>
              </div>

              {/* Title & Desc */}
              <div>
                <h3 className="slot-name">{item.name}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginTop: 2 }}>
                  {item.description}
                </p>
              </div>

              {/* Stock Bar */}
              <div className="stock-bar-wrap">
                <div className="stock-bar-label">
                  <span>
                    Stock: <strong>{item.currentStock} / {item.maxCapacity} units</strong>
                  </span>
                  <span>{stockPercent}%</span>
                </div>
                <div className="stock-track">
                  <div 
                    className={`stock-fill ${fillClass}`} 
                    style={{ width: `${stockPercent}%` }}
                  />
                </div>
              </div>

              {/* IR Sensor Status */}
              <div className="slot-hardware-meta" style={{ justifyContent: 'center' }}>
                <div className={`ir-status-indicator ${isEmpty ? 'empty' : 'ok'}`}>
                  {isEmpty ? <AlertCircle size={13} /> : <CheckCircle2 size={13} />}
                  <span>{isEmpty ? 'Sensor: Out of Stock' : 'Sensor: Stock Detected'}</span>
                </div>
              </div>

              {/* Slot Actions */}
              <div className="slot-actions">
                <button 
                  type="button"
                  className="btn" 
                  style={{ width: '100%', fontSize: '0.8rem', padding: '0.55rem 0.85rem' }}
                  onClick={() => onOpenRestock(item)}
                >
                  <PlusCircle size={14} />
                  <span>Restock / Edit Slot</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
