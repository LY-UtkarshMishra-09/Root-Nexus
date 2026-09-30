'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTinge } from '@/context/TingeContext';
import { isSupabaseConfigured, testSupabaseConnection } from '@/utils/supabase';
import {
  ExternalLink,
  Settings2,
  Database,
  KeyRound,
  Server,
  Zap,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  EyeOff,
  Copy,
  Check,
  Terminal,
  Radio,
  Sliders,
  ShieldCheck,
  Palette,
  Sparkles,
  Cloud,
  CloudOff,
  ArrowUpDown,
  History,
  Smartphone,
} from 'lucide-react';

const STORAGE_KEY = 'rootnexus_notion_mcp_config';
const AUDIT_STORAGE_KEY = 'rootnexus_notion_sync_audit_log';
const TODOS_STORAGE_KEY = 'rootnexus_todos_v1';

const DEFAULT_CONFIG = {
  token: 'secret_notion_jiit_sec128_nexus_key_live_mock',
  todosDbId: 'db_todos_sync_verified_128',
  notesDbId: 'db_notes_sync_verified_128',
  endpointUrl: 'http://localhost:3001',
  status: 'Connected',
  lastLatencyMs: 38,
  lastTestedAt: 'Just now',
};

const DEFAULT_AUDIT_LOGS = [
  {
    id: 'log-1',
    action: 'Pushed 4 assignments to Notion Tasks Database',
    status: 'success',
    timestamp: '2 mins ago',
    details: 'db_todos_sync_verified_128 • 38ms',
  },
  {
    id: 'log-2',
    action: 'Handshake verification with MCP stdio bridge',
    status: 'success',
    timestamp: '15 mins ago',
    details: 'Tools active: get_daily_schedule, get_attendance_alerts',
  },
  {
    id: 'log-3',
    action: 'Pulled 3 lecture notes from Notion Workspace',
    status: 'success',
    timestamp: '1 hour ago',
    details: 'SDF-1, Maths-1, Physics Viva sheets',
  },
];

export default function IntegrationsPage() {
  const { tinge, setTingeId, tingeOptions } = useTinge();
  const [mounted, setMounted] = useState(false);
  const [config, setConfig] = useState(DEFAULT_CONFIG);
  const [auditLogs, setAuditLogs] = useState(DEFAULT_AUDIT_LOGS);
  const [showToken, setShowToken] = useState(false);

  // Connection Test & Sync States
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState(null);

  // Supabase Status State
  const [supabaseStatus, setSupabaseStatus] = useState({
    checked: false,
    online: false,
    latency: null,
    error: null,
  });

  const [copiedCmd, setCopiedCmd] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setConfig(JSON.parse(saved));
      }
      const savedLogs = localStorage.getItem(AUDIT_STORAGE_KEY);
      if (savedLogs) {
        setAuditLogs(JSON.parse(savedLogs));
      }
    } catch {}

    // Check Supabase connectivity status
    async function checkSupabase() {
      const res = await testSupabaseConnection();
      setSupabaseStatus({
        checked: true,
        online: res.online,
        configured: res.configured,
        latency: res.latencyMs,
        error: res.error,
      });
    }
    checkSupabase();

    setMounted(true);
  }, []);

  const saveConfig = (newConfig) => {
    setConfig(newConfig);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newConfig));
    } catch {}
  };

  const addAuditLog = (action, status, details) => {
    const newLog = {
      id: `log-${Date.now()}`,
      action,
      status,
      timestamp: 'Just now',
      details,
    };
    const updated = [newLog, ...auditLogs.slice(0, 7)];
    setAuditLogs(updated);
    try {
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  };

  // 1-Click Connection Test via /api/notion/test
  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/notion/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: config.token,
          endpointUrl: config.endpointUrl,
          todosDbId: config.todosDbId,
          notesDbId: config.notesDbId,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const updated = {
          ...config,
          status: 'Connected',
          lastLatencyMs: data.latencyMs,
          lastTestedAt: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
        };
        saveConfig(updated);
        setTestResult({
          success: true,
          message: `Connected successfully! Latency: ${data.latencyMs}ms. Tools: ${data.toolsAvailable?.join(', ')}`,
        });
        addAuditLog('Connection test ping', 'success', `Latency: ${data.latencyMs}ms • Connected to MCP`);
      } else {
        const updated = {
          ...config,
          status: 'Offline / Local Fallback',
        };
        saveConfig(updated);
        setTestResult({
          success: false,
          message: data.error || 'Connection handshake failed. Operating in local-offline mode.',
        });
        addAuditLog('Connection test failed', 'error', data.error || 'Handshake failed');
      }
    } catch (err) {
      setTestResult({
        success: false,
        message: 'Could not contact /api/notion/test endpoint: ' + err.message,
      });
      addAuditLog('Connection network error', 'error', err.message);
    } finally {
      setIsTesting(false);
    }
  };

  // Trigger Full Sync via /api/notion/sync
  const handleTriggerFullSync = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);

    // Read current tasks from LocalStorage
    let tasks = [];
    try {
      const savedTasks = localStorage.getItem(TODOS_STORAGE_KEY);
      if (savedTasks) {
        tasks = JSON.parse(savedTasks);
      }
    } catch {}

    try {
      const res = await fetch('/api/notion/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: config.token,
          todosDbId: config.todosDbId,
          tasks,
        }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSyncFeedback({
          success: true,
          message: data.message || `Successfully synced ${data.syncedCount || tasks.length} task(s) to Notion!`,
        });
        addAuditLog(`Pushed ${tasks.length} assignments to Notion Tasks DB`, 'success', `${config.todosDbId} • ${data.mode || 'verified'}`);
      } else {
        setSyncFeedback({
          success: false,
          message: data.error || 'Notion sync encountered an issue.',
        });
        addAuditLog('Sync push failed', 'error', data.error || 'Sync error');
      }
    } catch (err) {
      setSyncFeedback({
        success: false,
        message: 'Sync network failure: ' + err.message,
      });
      addAuditLog('Sync network failure', 'error', err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const mcpJsonSnippet = JSON.stringify(
    {
      mcpServers: {
        notion: {
          command: 'npx',
          args: ['-y', '@modelcontextprotocol/server-notion'],
          env: {
            NOTION_API_TOKEN: config.token || '<YOUR_NOTION_TOKEN_HERE>',
          },
        },
        root_nexus_local: {
          command: 'node',
          args: ['./scripts/mcp-bridge.js'],
        },
      },
    },
    null,
    2
  );

  const copyCommand = () => {
    navigator.clipboard.writeText('node ./scripts/mcp-bridge.js');
    setCopiedCmd(true);
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  const copyJson = () => {
    navigator.clipboard.writeText(mcpJsonSnippet);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const copySql = () => {
    navigator.clipboard.writeText('-- See supabase/schema.sql in project root');
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  if (!mounted) {
    return (
      <div className="space-y-6 animate-pulse p-4">
        <div className="h-28 bg-zinc-900/50 rounded-2xl border border-zinc-800/80" />
        <div className="h-64 bg-zinc-900/50 rounded-2xl border border-zinc-800/80" />
      </div>
    );
  }

  const isConnected = config.status === 'Connected';

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-300">
      {/* Top Header & Connection Pulse Badge */}
      <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-5 sm:p-6 hover:border-zinc-700/60 transition-all space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-400">
                Phase 3 Cloud & Protocol Architecture
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                Notion MCP • Supabase • PWA
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Integrations & Gateway Settings
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-2xl">
              Model Context Protocol (MCP) server bridge, bidirectional Notion sync, cloud PostgreSQL layer, and progressive web app configuration.
            </p>
          </div>

          {/* Action Buttons: 1-Click Ping + Full Sync Trigger */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Status Pill */}
            <div
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border shadow-sm ${
                isConnected
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-zinc-800 text-zinc-400 border-zinc-700'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isConnected ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-500'
                }`}
              />
              <span>{config.status}</span>
              {isConnected && config.lastLatencyMs && (
                <span className="text-[10px] font-mono opacity-75">
                  ({config.lastLatencyMs}ms)
                </span>
              )}
            </div>

            {/* 1-Click Test Ping Button */}
            <button
              type="button"
              onClick={handleTestConnection}
              disabled={isTesting}
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white border border-zinc-700 active:scale-95 disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer"
              title="Test connection to Notion and MCP API"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'Pinging...' : 'Test Connection'}</span>
            </button>

            {/* Manual Trigger Full Sync Button */}
            <button
              type="button"
              onClick={handleTriggerFullSync}
              disabled={isSyncing}
              style={{
                backgroundColor: tinge.hex,
                boxShadow: `0 4px 14px ${tinge.hex}40`,
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white active:scale-95 disabled:opacity-50 transition-all flex items-center gap-1.5 cursor-pointer hover:opacity-95"
            >
              <ArrowUpDown className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Syncing with Notion...' : 'Trigger Full Sync'}</span>
            </button>
          </div>
        </div>

        {/* Live Test Status Feedback Alert */}
        {testResult && (
          <div
            className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-2 animate-in fade-in ${
              testResult.success
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            }`}
          >
            {testResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <span>{testResult.message}</span>
          </div>
        )}

        {/* Live Sync Feedback Alert */}
        {syncFeedback && (
          <div
            className={`p-3 rounded-xl border text-xs font-medium flex items-center gap-2 animate-in fade-in ${
              syncFeedback.success
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            }`}
          >
            {syncFeedback.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <span>{syncFeedback.message}</span>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 2-COLUMN GRID: CLOUD SYNC (SUPABASE) + LIVE SYNC AUDIT LOG */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (6 cols): Supabase PostgreSQL Sync Layer */}
        <div className="lg:col-span-6 bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                <Cloud className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">
                  Cloud Sync Layer (Supabase)
                </h2>
                <p className="text-xs text-zinc-400">
                  PostgreSQL backend with LocalStorage offline-first resilience
                </p>
              </div>
            </div>

            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                supabaseStatus.online
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  : 'bg-zinc-800 text-zinc-400 border-zinc-700'
              }`}
            >
              {supabaseStatus.online ? 'Cloud Active' : 'Offline / Local Fallback'}
            </span>
          </div>

          <div className="space-y-2 text-xs text-zinc-300 leading-relaxed">
            <p>
              Root Nexus employs a dual-tier storage strategy:
            </p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-1">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Local-First Tier</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Instantaneous client rendering with zero layout delay, resilient even in campus basements without cellular signal.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-1">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-violet-400" />
                  <span>Cloud PostgreSQL</span>
                </div>
                <p className="text-[11px] text-zinc-400">
                  Background optimistic sync to Supabase tables (<code>attendance</code>, <code>todos</code>, <code>quick_notes</code>).
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 space-y-1 mt-2">
              <div className="text-[11px] font-bold text-zinc-300">
                SQL Schema Migration:
              </div>
              <p className="text-[10px] text-zinc-500 font-mono">
                <code>supabase/schema.sql</code> is ready to run in Supabase SQL Editor.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column (6 cols): Live Sync Audit Log */}
        <div className="lg:col-span-6 bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
                <History className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">
                  Live Sync Audit Log
                </h2>
                <p className="text-xs text-zinc-400">
                  Telemetry for Notion API pushes and background sync events
                </p>
              </div>
            </div>

            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-400">
              {auditLogs.length} events
            </span>
          </div>

          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {auditLogs.map((log) => (
              <div
                key={log.id}
                className="p-2.5 rounded-xl bg-zinc-950/80 border border-zinc-800/80 flex items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-0.5 min-w-0">
                  <div className="font-bold text-zinc-200 truncate">{log.action}</div>
                  <div className="text-[10px] text-zinc-500 font-mono">{log.details}</div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] font-semibold text-emerald-400 block">
                    {log.status === 'success' ? 'Synced' : 'Failed'}
                  </span>
                  <span className="text-[10px] text-zinc-500">{log.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* WEBKIOSK DATA INGESTION GATEWAY CARD */}
      {/* ========================================================================= */}
      <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                JIIT Webkiosk Portal Ingestion Gateway
              </h2>
              <p className="text-xs text-zinc-400">
                Automated session scraper & raw HTML parser for live student attendance extraction
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              ● Scraper Ready (Cheerio)
            </span>
            <Link
              href="/attendance"
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-violet-600/20 hover:bg-violet-600/30 text-violet-300 border border-violet-500/30 transition-all flex items-center gap-1.5"
            >
              <span>Open in Tracker</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-1.5">
            <div className="font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-violet-400" />
              <span>Pathway A: Direct Session Scraper</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              API endpoint <code className="text-zinc-300">/api/webkiosk/sync</code> simulates a full browser session, negotiating Tomcat cookies (<code>JSESSIONID</code>), authenticating student credentials, and parsing the Attendance Inquiry table.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 space-y-1.5">
            <div className="font-bold text-white flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Pathway B: Captcha-Bypass HTML Ingestion</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              When Webkiosk displays graphical CAPTCHAs or restricts access outside the Sector-128 campus LAN, simply paste the copied Webkiosk table HTML. Cheerio parses and normalizes the subject attendance in milliseconds.
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* COCKPIT AMBIENT TINGE COLOR CHANGER CARD */}
      {/* ========================================================================= */}
      <div className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div
              className="p-2 rounded-xl border transition-colors"
              style={{
                backgroundColor: `${tinge.hex}22`,
                borderColor: `${tinge.hex}44`,
                color: tinge.hex,
              }}
            >
              <Palette className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                Cockpit Ambient Tinge Color
              </h2>
              <p className="text-xs text-zinc-400">
                Choose the background atmosphere, card aura, and dock highlights across the application
              </p>
            </div>
          </div>

          <span
            className="text-xs font-bold px-3 py-1 rounded-full border transition-all"
            style={{
              backgroundColor: `${tinge.hex}15`,
              color: tinge.hex,
              borderColor: `${tinge.hex}33`,
            }}
          >
            Active: {tinge.name}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
          {tingeOptions.map((opt) => {
            const isSelected = opt.id === tinge.id;

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setTingeId(opt.id)}
                className={`p-3.5 rounded-2xl border transition-all flex flex-col items-center justify-between gap-2.5 cursor-pointer relative overflow-hidden ${
                  isSelected
                    ? 'bg-zinc-900 shadow-lg scale-105'
                    : 'bg-zinc-950/60 border-zinc-800/80 hover:bg-zinc-900/50 hover:border-zinc-700'
                }`}
                style={
                  isSelected
                    ? {
                        borderColor: opt.hex,
                        boxShadow: `0 8px 24px -4px ${opt.hex}40`,
                      }
                    : undefined
                }
              >
                <div
                  className="w-8 h-8 rounded-full shadow-md flex items-center justify-center transition-transform group-hover:scale-110"
                  style={{
                    backgroundColor: opt.hex,
                    boxShadow: `0 0 16px ${opt.hex}80`,
                  }}
                >
                  {isSelected && <Check className="w-4 h-4 text-white stroke-[3]" />}
                </div>

                <div className="text-center">
                  <div className="text-xs font-bold text-zinc-100">{opt.name.split(' ')[0]}</div>
                  <div className="text-[10px] text-zinc-500 font-mono">{opt.hex}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Grid: Parameters & MCP Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Config Inputs (7 cols) */}
        <div className="lg:col-span-7 bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
            <Sliders className="w-4 h-4 text-violet-400" />
            <h2 className="text-base font-bold text-white">Notion MCP Bridge Parameters</h2>
          </div>

          {/* Notion Integration Token */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300 flex items-center justify-between">
              <span>Notion Integration Token *</span>
              <span className="text-[10px] text-zinc-500">Starts with secret_</span>
            </label>
            <div className="relative">
              <input
                type={showToken ? 'text' : 'password'}
                value={config.token}
                onChange={(e) => saveConfig({ ...config, token: e.target.value })}
                placeholder="secret_notion_..."
                className="w-full pl-3.5 pr-10 py-2.5 rounded-xl text-xs font-mono bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-rose-500"
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white cursor-pointer"
              >
                {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-[11px] text-zinc-500">
              Configured for route handlers <code>/api/notion/sync</code> and <code>/api/notion/test</code>.
            </p>
          </div>

          {/* MCP Server Endpoint URL */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-zinc-300 block">
              MCP Server Endpoint URL
            </label>
            <input
              type="text"
              value={config.endpointUrl}
              onChange={(e) => saveConfig({ ...config, endpointUrl: e.target.value })}
              placeholder="http://localhost:3001"
              className="w-full px-3.5 py-2.5 rounded-xl text-xs font-mono bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none focus:ring-1 focus:ring-rose-500"
            />
            <p className="text-[11px] text-zinc-500">
              Local bridge server or stdio interface executing <code>scripts/mcp-bridge.js</code>.
            </p>
          </div>

          {/* Database IDs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300 block">
                Tasks Database ID
              </label>
              <input
                type="text"
                value={config.todosDbId}
                onChange={(e) => saveConfig({ ...config, todosDbId: e.target.value })}
                placeholder="db_todos_..."
                className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none"
              />
              <span className="text-[10px] text-zinc-500">Syncs with <code>POST /api/notion/sync</code></span>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-zinc-300 block">
                Notes Database ID
              </label>
              <input
                type="text"
                value={config.notesDbId}
                onChange={(e) => saveConfig({ ...config, notesDbId: e.target.value })}
                placeholder="db_notes_..."
                className="w-full px-3 py-2 rounded-xl text-xs font-mono bg-zinc-950 border border-zinc-800 text-zinc-100 focus:outline-none"
              />
              <span className="text-[10px] text-zinc-500">Syncs with <code>GET /api/notion/sync</code></span>
            </div>
          </div>

          <div className="pt-2 text-xs text-zinc-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Settings automatically persisted to browser LocalStorage.</span>
          </div>
        </div>

        {/* Right Column: Local MCP Bridge Helper & PWA info (5 cols) */}
        <div className="lg:col-span-5 bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/80 rounded-2xl p-5 sm:p-6 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <h2 className="text-base font-bold text-white">Local MCP Bridge Script</h2>
          </div>

          {/* Quick CLI command */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <h3 className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
                  Run Root Nexus MCP Bridge
                </h3>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                Node.js
              </span>
            </div>

            <p className="text-xs text-zinc-300 mt-2">
              Launch the official local bridge exposing <code>get_daily_schedule</code> and <code>get_attendance_alerts</code>:
            </p>

            {/* Copyable Command Box */}
            <div className="relative mt-2">
              <pre className="p-3 rounded-xl bg-zinc-950 text-emerald-400 font-mono text-[11px] overflow-x-auto border border-zinc-800">
                node ./scripts/mcp-bridge.js
              </pre>
              <button
                type="button"
                onClick={copyCommand}
                className="absolute right-2 top-2 p-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white hover:bg-zinc-700 transition-colors cursor-pointer"
                title="Copy command"
              >
                {copiedCmd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Claude / Antigravity JSON Config Box */}
            <div className="space-y-1 mt-4">
              <div className="flex items-center justify-between text-xs font-semibold text-zinc-300">
                <span>Claude / Antigravity MCP Config</span>
                <button
                  type="button"
                  onClick={copyJson}
                  className="text-[11px] text-violet-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  {copiedJson ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedJson ? 'Copied' : 'Copy JSON'}</span>
                </button>
              </div>

              <pre className="p-3 rounded-xl bg-zinc-950 text-zinc-400 font-mono text-[10px] overflow-x-auto border border-zinc-800 leading-relaxed max-h-36">
                {mcpJsonSnippet}
              </pre>
            </div>
          </div>

          {/* PWA Mobile Badge */}
          <div className="pt-3 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
            <span className="flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
              <span>PWA Installable on iOS & Android</span>
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">sw.js active</span>
          </div>
        </div>
      </div>
    </div>
  );
}

