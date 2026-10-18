import { useState } from 'react';
import { 
  X, 
  Database, 
  Check, 
  Copy, 
  FileText, 
  Cpu 
} from 'lucide-react';
import type { SupabaseConfig } from '../types/vending';
import { SUPABASE_SQL_SCHEMA, ESP32_ARDUINO_FIRMWARE_CODE } from '../services/supabaseClient';

interface SupabaseSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SupabaseConfig;
  onSaveConfig: (url: string, key: string) => void;
  onResetToDemo: () => void;
}

export const SupabaseSetupModal: React.FC<SupabaseSetupModalProps> = ({
  isOpen,
  onClose,
  config,
  onSaveConfig,
  onResetToDemo
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'config' | 'sql' | 'arduino'>('config');
  const [url, setUrl] = useState(config.url);
  const [anonKey, setAnonKey] = useState(config.anonKey);
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveConfig(url, anonKey);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const copyToClipboard = (text: string, type: 'sql' | 'code') => {
    navigator.clipboard.writeText(text);
    if (type === 'sql') {
      setCopiedSql(true);
      setTimeout(() => setCopiedSql(false), 2000);
    } else {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 820 }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div className="brand-logo-icon">
              <Database size={20} />
            </div>
            <div>
              <h3>Supabase Backend & Firmware Code</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                PostgreSQL schema, REST endpoints & LittleFS offline buffering
              </p>
            </div>
          </div>
          <button type="button" className="btn-ghost btn-icon-only" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        {/* Modal Sub-Tabs */}
        <div style={{ display: 'flex', gap: 6, borderBottom: '1px solid #efefef', paddingBottom: 10 }}>
          <button
            type="button"
            className={activeTab === 'config' ? 'btn' : 'btn-ghost'}
            onClick={() => setActiveTab('config')}
            style={{ fontSize: '0.78rem', padding: '0.45rem 0.9rem' }}
          >
            <Database size={14} />
            <span>Project Credentials</span>
          </button>

          <button
            type="button"
            className={activeTab === 'sql' ? 'btn' : 'btn-ghost'}
            onClick={() => setActiveTab('sql')}
            style={{ fontSize: '0.78rem', padding: '0.45rem 0.9rem' }}
          >
            <FileText size={14} />
            <span>SQL Schema Migration</span>
          </button>

          <button
            type="button"
            className={activeTab === 'arduino' ? 'btn' : 'btn-ghost'}
            onClick={() => setActiveTab('arduino')}
            style={{ fontSize: '0.78rem', padding: '0.45rem 0.9rem' }}
          >
            <Cpu size={14} />
            <span>Arduino ESP32 Firmware</span>
          </button>
        </div>

        {/* Tab 1: Config */}
        {activeTab === 'config' && (
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{
              background: config.isCustom ? '#dcfce7' : '#f4f5f7',
              border: `1px solid ${config.isCustom ? '#bbf7d0' : '#e5e7eb'}`,
              padding: 14,
              borderRadius: '16px',
              fontSize: '0.84rem'
            }}>
              <strong style={{ color: config.isCustom ? '#15803d' : '#000000', textTransform: 'uppercase' }}>
                Status: {config.isCustom ? 'Connected to Custom Supabase Project' : 'Running in Interactive Demo Mode'}
              </strong>
              <p style={{ color: '#555555', marginTop: 4 }}>
                {config.isCustom 
                  ? 'Your dashboard is reading and writing directly to your Supabase PostgreSQL database.'
                  : 'You are using simulated local real-time storage. You can enter your Supabase project credentials below to connect to your live database!'}
              </p>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#000000', textTransform: 'uppercase', marginBottom: 6 }}>
                Supabase Project URL:
              </label>
              <input
                type="text"
                placeholder="https://your-project.supabase.co"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                style={{ width: '100%', fontFamily: 'var(--font-mono)' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 800, color: '#000000', textTransform: 'uppercase', marginBottom: 6 }}>
                Supabase Anon / Public API Key:
              </label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                style={{ width: '100%', fontFamily: 'var(--font-mono)' }}
              />
              <span style={{ fontSize: '0.75rem', color: 'var(--muted)', marginTop: 4, display: 'block' }}>
                Found in Supabase Dashboard &gt; Project Settings &gt; API &gt; anon public key.
              </span>
            </div>

            {saveSuccess && (
              <div style={{ color: '#15803d', fontSize: '0.84rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Check size={16} /> Credentials saved successfully!
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
              <button 
                type="button" 
                className="btn-ghost"
                onClick={onResetToDemo}
              >
                Reset Demo Mode
              </button>

              <button type="submit" className="btn">
                <Check size={16} />
                <span>Save & Connect Supabase</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: SQL Migration */}
        {activeTab === 'sql' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.82rem', color: '#555555' }}>
                Run this script in your <strong>Supabase SQL Editor</strong> to create tables, RLS security policies & realtime publications:
              </span>
              <button 
                type="button"
                className="btn" 
                style={{ fontSize: '0.78rem' }}
                onClick={() => copyToClipboard(SUPABASE_SQL_SCHEMA, 'sql')}
              >
                {copiedSql ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedSql ? 'Copied SQL!' : 'Copy SQL Script'}</span>
              </button>
            </div>

            <pre className="code-box">
              <code>{SUPABASE_SQL_SCHEMA}</code>
            </pre>
          </div>
        )}

        {/* Tab 3: ESP32 Arduino Firmware */}
        {activeTab === 'arduino' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.82rem', color: '#555555' }}>
                Full Arduino C++ code for ESP32 with <strong>LittleFS Offline Queueing</strong> and Supabase REST API:
              </span>
              <button 
                type="button"
                className="btn" 
                style={{ fontSize: '0.78rem' }}
                onClick={() => copyToClipboard(ESP32_ARDUINO_FIRMWARE_CODE, 'code')}
              >
                {copiedCode ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedCode ? 'Copied Code!' : 'Copy ESP32 Firmware'}</span>
              </button>
            </div>

            <pre className="code-box">
              <code>{ESP32_ARDUINO_FIRMWARE_CODE}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
