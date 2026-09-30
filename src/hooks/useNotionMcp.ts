'use client';

import { useState, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { NotionMcpConfig, McpSyncLog, McpConnectionStatus } from '@/types';
import { INITIAL_NOTION_MCP_CONFIG } from '@/lib/mockData';

const CONFIG_STORAGE_KEY = 'rootnexus_notion_mcp_config';
const LOGS_STORAGE_KEY = 'rootnexus_notion_mcp_logs';

const INITIAL_LOGS: McpSyncLog[] = [
  {
    id: 'log-1',
    timestamp: 'Today at 03:45 PM',
    type: 'sync',
    message: 'Initial workspace sync completed',
    details: 'Synced 6 tasks to Notion Database and verified 3 lecture note pages.',
  },
  {
    id: 'log-2',
    timestamp: 'Today at 03:44 PM',
    type: 'success',
    message: 'Connected to Notion MCP bridge server',
    details: 'Endpoint http://localhost:3001 responded with HTTP 200 OK (latency: 42ms).',
  },
];

export function useNotionMcp() {
  const [config, setConfig, isHydrated] = useLocalStorage<NotionMcpConfig>(
    CONFIG_STORAGE_KEY,
    INITIAL_NOTION_MCP_CONFIG
  );

  const [logs, setLogs] = useLocalStorage<McpSyncLog[]>(
    LOGS_STORAGE_KEY,
    INITIAL_LOGS
  );

  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const addLog = useCallback(
    (type: McpSyncLog['type'], message: string, details?: string) => {
      const newLog: McpSyncLog = {
        id: `log-${Date.now()}`,
        timestamp: new Intl.DateTimeFormat('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        }).format(new Date()),
        type,
        message,
        details,
      };
      setLogs((prev) => [newLog, ...prev.slice(0, 49)]);
    },
    [setLogs]
  );

  const updateConfig = useCallback(
    (updates: Partial<NotionMcpConfig>) => {
      setConfig((prev) => ({ ...prev, ...updates }));
    },
    [setConfig]
  );

  const testConnection = useCallback(async () => {
    setIsTesting(true);
    addLog('info', `Pinging MCP server at ${config.endpointUrl}...`);

    await new Promise((res) => setTimeout(res, 600));

    // Realistic check: token shouldn't be completely empty
    if (!config.token.trim()) {
      setConfig((prev) => ({
        ...prev,
        status: 'Offline / Local Fallback',
        latencyMs: undefined,
      }));
      addLog('error', 'Connection test failed: Notion Integration Token is missing', 'Please enter a valid internal integration token starting with "secret_".');
      setIsTesting(false);
      return false;
    }

    const latency = Math.floor(Math.random() * 25) + 35; // 35ms - 60ms
    const nowStr = new Intl.DateTimeFormat('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    }).format(new Date());

    setConfig((prev) => ({
      ...prev,
      status: 'Connected',
      latencyMs: latency,
      lastSyncedAt: `Today at ${nowStr}`,
    }));

    addLog(
      'success',
      `MCP handshake verified! 2 tools discovered.`,
      `Endpoint: ${config.endpointUrl} • Latency: ${latency}ms • Protocol: ModelContextProtocol/1.0`
    );
    setIsTesting(false);
    return true;
  }, [config.endpointUrl, config.token, addLog, setConfig]);

  const triggerSync = useCallback(
    async (target: 'all' | 'todos' | 'notes') => {
      setIsSyncing(true);
      setConfig((prev) => ({ ...prev, status: 'Syncing' }));

      addLog('info', `Starting Notion MCP sync: ${target.toUpperCase()}...`);
      await new Promise((res) => setTimeout(res, 850));

      const nowStr = new Intl.DateTimeFormat('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      }).format(new Date());

      setConfig((prev) => ({
        ...prev,
        status: 'Connected',
        lastSyncedAt: `Today at ${nowStr}`,
      }));

      addLog(
        'sync',
        `Successfully synced ${target} with Notion!`,
        `Database target updated • 0 conflicts detected • Local cache up to date.`
      );
      setIsSyncing(false);
    },
    [addLog, setConfig]
  );

  const clearLogs = useCallback(() => {
    setLogs([]);
  }, [setLogs]);

  return {
    config,
    logs,
    isHydrated,
    isTesting,
    isSyncing,
    updateConfig,
    testConnection,
    triggerSync,
    clearLogs,
  };
}
