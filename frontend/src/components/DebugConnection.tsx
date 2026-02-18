// frontend/src/components/DebugConnection.tsx
import React, { useEffect, useState } from 'react';
import { interviewService } from '../services/interviewService';

interface DebugData {
  status: string;
  connected: boolean;
  ai_client_enabled: boolean;
  use_azure: boolean;
  model?: string;
  azure_status?: string;
  test_result?: string;
  error?: string;
  env_vars?: Record<string, any>;
}

export const DebugConnection: React.FC = () => {
  const [status, setStatus] = useState<string>('Checking...');
  const [debugData, setDebugData] = useState<DebugData | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const check = async () => {
      try {
        const connected = await interviewService.testConnection();
        setStatus(connected ? '✅ Connected to AI Service' : '❌ Not Connected to AI Service');
        
        const debug = await interviewService.debugConnection();
        setDebugData(debug);
      } catch (error) {
        setStatus('❌ Connection check failed');
      }
    };
    
    check();
    
    // Check every 30 seconds
    const interval = setInterval(check, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-slate-800 p-3 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 text-xs z-50 max-w-md">
      <div 
        className="cursor-pointer flex items-center justify-between"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${status.includes('✅') ? 'bg-green-500' : 'bg-red-500'}`} />
          <span className="font-medium">{status}</span>
        </div>
        <button className="text-slate-500 hover:text-slate-700">
          {expanded ? '▼' : '▲'}
        </button>
      </div>
      
      {expanded && debugData && (
        <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-700">
          <pre className="bg-slate-100 dark:bg-slate-900 p-2 rounded overflow-auto max-h-60 text-[10px]">
            {JSON.stringify(debugData, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
};