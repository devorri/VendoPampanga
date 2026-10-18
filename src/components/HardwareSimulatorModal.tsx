import { useState } from 'react';
import { 
  X, 
  Coins, 
  Wifi, 
  WifiOff 
} from 'lucide-react';
import type { InventoryItem } from '../types/vending';

interface HardwareSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: InventoryItem[];
  isWifiOutage: boolean;
  onToggleWifiOutage: () => void;
  onSimulatePurchase: (slotNumber: number, inserted: number) => { success: boolean; message: string; change: number };
  offlineQueueCount: number;
}

export const HardwareSimulatorModal: React.FC<HardwareSimulatorModalProps> = ({
  isOpen,
  onClose,
  inventory,
  isWifiOutage,
  onToggleWifiOutage,
  onSimulatePurchase,
  offlineQueueCount
}) => {
  const [balance, setBalance] = useState<number>(0);
  const [lcdLine1, setLcdLine1] = useState<string>('VendoPampanga v2.4');
  const [lcdLine2, setLcdLine2] = useState<string>('Insert Coins (₱1-20)');
  const [lcdLine3, setLcdLine3] = useState<string>('Balance: PHP 0.00');
  const [lcdLine4, setLcdLine4] = useState<string>('Select Supply (1-8)');
  const [isDispensing, setIsDispensing] = useState<boolean>(false);
  const [dispensingSlot, setDispensingSlot] = useState<number | null>(null);

  if (!isOpen) return null;

  const insertCoin = (value: number) => {
    const newBal = balance + value;
    setBalance(newBal);
    setLcdLine1('Coin Received!');
    setLcdLine2(`Pulse Count: ${value}`);
    setLcdLine3(`Balance: PHP ${newBal.toFixed(2)}`);
    setLcdLine4('Select Supply (1-8)');
  };

  const refundCoins = () => {
    if (balance <= 0) return;
    setLcdLine1('Refunding Coins...');
    setLcdLine2(`Returned: PHP ${balance.toFixed(2)}`);
    setLcdLine3('Balance: PHP 0.00');
    setLcdLine4('Insert Coins (₱1-20)');
    setBalance(0);
  };

  const handleSelectSlot = (item: InventoryItem) => {
    if (isDispensing) return;

    if (balance < item.price) {
      setLcdLine1('Insufficient Balance');
      setLcdLine2(`Price: PHP ${item.price.toFixed(2)}`);
      setLcdLine3(`Inserted: PHP ${balance.toFixed(2)}`);
      setLcdLine4(`Need: +PHP ${(item.price - balance).toFixed(2)}`);
      return;
    }

    if (item.currentStock <= 0 || item.irSensorState === 'empty') {
      setLcdLine1('Item Out of Stock!');
      setLcdLine2('IR Sensor: Beam Broken');
      setLcdLine3('Refunding credit...');
      setLcdLine4('Please choose another');
      setTimeout(() => {
        refundCoins();
      }, 1800);
      return;
    }

    // Begin simulated physical dispensing
    setIsDispensing(true);
    setDispensingSlot(item.slot);
    setLcdLine1(`Dispensing Slot #${item.slot}...`);
    setLcdLine2(item.name.slice(0, 20));
    setLcdLine3('Servo Rotating 180°');
    setLcdLine4('Waiting for Chute IR...');

    setTimeout(() => {
      const result = onSimulatePurchase(item.slot, balance);
      setIsDispensing(false);
      setDispensingSlot(null);

      if (result.success) {
        setLcdLine1('Item Dropped & Verified!');
        setLcdLine2('Chute IR Sensor: OK');
        setLcdLine3(result.change > 0 ? `Change: PHP ${result.change.toFixed(2)}` : 'Thank you!');
        setLcdLine4(isWifiOutage ? 'Buffered in LittleFS' : 'Supabase Synced ⚡');
        setBalance(0);
      } else {
        setLcdLine1('Dispense Alert');
        setLcdLine2(result.message);
        setLcdLine3('Coins Safe in Mech');
        setLcdLine4('Try again');
      }
    }, 1500);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 760 }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="brand-logo-icon">
              <Coins size={18} />
            </div>
            <div>
              <h3>ESP32 Hardware & Vendo Simulator</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                Simulate coin pulses, physical LCD, chute sensors & offline buffering
              </p>
            </div>
          </div>
          <button type="button" className="btn-ghost btn-icon-only" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Network State Banner */}
        <div style={{
          background: isWifiOutage ? '#fee2e2' : '#f4f5f7',
          border: `1px solid ${isWifiOutage ? '#fecaca' : '#e5e7eb'}`,
          padding: '12px 16px',
          borderRadius: '16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {isWifiOutage ? <WifiOff size={20} color="#dc2626" /> : <Wifi size={20} color="#15803d" />}
            <div>
              <div style={{ fontSize: '0.84rem', fontWeight: 900, color: isWifiOutage ? '#dc2626' : '#000000', textTransform: 'uppercase' }}>
                {isWifiOutage ? 'Campus WiFi Outage (ESP32 Offline)' : 'Online & Connected to Supabase'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#555555' }}>
                {isWifiOutage 
                  ? `Purchases are buffered in LittleFS flash memory (${offlineQueueCount} queued). Restoring WiFi triggers auto-sync!`
                  : 'Real-time telemetry and instant purchase syncing active.'}
              </div>
            </div>
          </div>

          <button 
            type="button"
            className="btn"
            style={{ fontSize: '0.8rem' }}
            onClick={onToggleWifiOutage}
          >
            {isWifiOutage ? 'Restore Campus WiFi' : 'Cut WiFi (Simulate Outage)'}
          </button>
        </div>

        {/* Machine Front Face Simulation */}
        <div style={{
          background: '#f4f5f7',
          border: '1px solid #e5e7eb',
          borderRadius: '20px',
          padding: 20,
          display: 'flex',
          flexDirection: 'column',
          gap: 16
        }}>
          {/* Virtual 20x4 I2C LCD Display (Monochrome High Contrast) */}
          <div style={{
            background: '#000000',
            border: '2px solid #222222',
            borderRadius: '10px',
            padding: '12px 18px',
            fontFamily: 'var(--font-mono)',
            fontSize: '13px',
            color: '#ffffff',
            boxShadow: 'inset 0 0 10px rgba(255, 255, 255, 0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
            letterSpacing: '0.05em'
          }}>
            <div>| {lcdLine1.padEnd(20, ' ')} |</div>
            <div>| {lcdLine2.padEnd(20, ' ')} |</div>
            <div>| {lcdLine3.padEnd(20, ' ')} |</div>
            <div>| {lcdLine4.padEnd(20, ' ')} |</div>
          </div>

          {/* Coin Acceptor Slot */}
          <div style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '16px',
            padding: 14,
            display: 'flex',
            flexDirection: 'column',
            gap: 10
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase' }}>
                Multi-Coin Acceptor (GPIO 19 Interrupt)
              </div>
              <div style={{ fontSize: '0.9rem', fontFamily: 'var(--font-display)', color: '#000000', fontWeight: 900 }}>
                Credit: ₱{balance.toFixed(2)}
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[1, 5, 10, 20].map(coin => (
                <button
                  key={coin}
                  type="button"
                  className="btn-ghost"
                  style={{ flex: 1, minWidth: 60, fontWeight: 900 }}
                  onClick={() => insertCoin(coin)}
                  disabled={isDispensing}
                >
                  <Coins size={14} />
                  <span>+₱{coin}</span>
                </button>
              ))}

              <button
                type="button"
                className="btn-ghost"
                style={{ fontSize: '0.8rem' }}
                onClick={refundCoins}
                disabled={balance <= 0 || isDispensing}
              >
                Coin Return
              </button>
            </div>
          </div>

          {/* 8 Product Push Buttons */}
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 800, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 8 }}>
              Dispensing Buttons (Press to buy):
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 10 }}>
              {inventory.map(item => {
                const isSelected = dispensingSlot === item.slot;
                const canAfford = balance >= item.price;
                const outOfStock = item.currentStock <= 0;

                return (
                  <button
                    key={item.slot}
                    type="button"
                    onClick={() => handleSelectSlot(item)}
                    disabled={isDispensing}
                    style={{
                      background: isSelected 
                        ? '#000000' 
                        : outOfStock 
                        ? '#fee2e2'
                        : canAfford 
                        ? '#ffffff' 
                        : '#ffffff',
                      color: isSelected ? '#ffffff' : '#000000',
                      border: `1.5px solid ${isSelected ? '#000000' : outOfStock ? '#fca5a5' : canAfford ? '#000000' : '#e5e7eb'}`,
                      borderRadius: '12px',
                      padding: '10px 8px',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      gap: 3,
                      cursor: isDispensing ? 'not-allowed' : 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <div style={{ fontSize: '0.7rem', color: isSelected ? '#ffffff' : 'var(--muted)', fontWeight: 800, textTransform: 'uppercase' }}>
                      BTN #{item.slot}
                    </div>
                    <div style={{ fontSize: '0.8rem', fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }}>
                      {item.name}
                    </div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 900, color: isSelected ? '#ffffff' : '#000000' }}>
                      ₱{item.price.toFixed(2)}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: outOfStock ? '#dc2626' : 'var(--muted)', fontWeight: 700 }}>
                      {outOfStock ? 'OUT OF STOCK' : `${item.currentStock} left`}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
