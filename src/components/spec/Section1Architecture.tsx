import React, { useState } from 'react';
import { 
  Network, 
  Server, 
  Database, 
  Smartphone, 
  Monitor, 
  Send, 
  RefreshCw, 
  CheckCircle2, 
  Layers, 
  Radio, 
  ShieldCheck, 
  Code2, 
  Copy, 
  ExternalLink 
} from 'lucide-react';
import { API_SPECIFICATIONS, ApiEndpointSpec } from '../../data/specData';
import { Language } from '../../types';

interface Section1ArchitectureProps {
  language: Language;
}

export const Section1Architecture: React.FC<Section1ArchitectureProps> = ({ language }) => {
  const isLao = language === 'la';

  const [selectedApi, setSelectedApi] = useState<ApiEndpointSpec>(API_SPECIFICATIONS[0]);
  const [copied, setCopied] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState<boolean>(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestEndpoint = () => {
    setIsTesting(true);
    setTimeout(() => {
      setIsTesting(false);
      setTestResult(JSON.stringify(selectedApi.sampleResponse, null, 2));
    }, 600);
  };

  return (
    <div className="space-y-8">
      
      {/* Overview Banner */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">
              {isLao ? 'SECTION 1: ສະຖາປັດຕະຍະກຳລະບົບ Full-Stack & API Flow' : 'SECTION 1: Full-Stack System Architecture & API Flow'}
            </h2>
            <p className="text-xs text-slate-400">
              {isLao ? 'ໂຄງສ້າງການເຊື່ອມຕໍ່ລະຫວ່າງ Frontend, Real-time WebSocket Gateway, REST API, Payment Webhooks ແລະ PostgreSQL Database' : 'End-to-End Enterprise Architecture: Multi-Client Frontend, WebSocket Gateway, RESTful Microservices & PostgreSQL'}
            </p>
          </div>
        </div>
      </div>

      {/* ARCHITECTURE DIAGRAM / FLOW (VISUAL C4 CONTAINER VIEW) */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
          <h3 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
            <Layers className="w-4 h-4 text-amber-500" />
            <span>{isLao ? 'ແຜນວາດສະຖາປັດຕະຍະກຳລະບົບ (C4 Architecture Flow Diagram)' : 'C4 Container System Architecture Diagram'}</span>
          </h3>
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
            TLS 1.3 / WSS / REST
          </span>
        </div>

        {/* Multi-Tier Visual Architecture Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Tier 1: Client Applications */}
          <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Monitor className="w-3.5 h-3.5 text-blue-500" />
              <span>TIER 1: FRONTEND CLIENTS</span>
            </div>

            <div className="space-y-2">
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-blue-200 dark:border-blue-900/50 shadow-sm text-xs">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Monitor className="w-3.5 h-3.5 text-blue-500" />
                  <span>POS Desktop & Cashier Web</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">React + Tailwind + Motion (Floor Plan, Billing, RBAC)</div>
              </div>

              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-amber-200 dark:border-amber-900/50 shadow-sm text-xs">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Server className="w-3.5 h-3.5 text-amber-500" />
                  <span>KDS Kitchen Display Station</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Web Worker Timers + Real-time Delayed SLA Alerter</div>
              </div>

              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-emerald-200 dark:border-emerald-900/50 shadow-sm text-xs">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Customer Mobile QR WebApp</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Instant PWA (No app install required) + Live Session Clock</div>
              </div>
            </div>
          </div>

          {/* Tier 2: Backend API Services & Gateways */}
          <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-amber-500" />
              <span>TIER 2: API & WEBSOCKET GATEWAY</span>
            </div>

            <div className="space-y-2">
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm text-xs">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                  <span>Real-Time WebSocket Bus (Socket.io)</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Floor plan broadcast, KDS tickets & delayed care alerts</div>
              </div>

              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm text-xs">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-500" />
                  <span>Core POS Engine & Guardrails</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Seat management, Mid-meal additions, Merge rules</div>
              </div>

              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm text-xs">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Network className="w-3.5 h-3.5 text-teal-500" />
                  <span>LAO QR & BCEL OnePay Gateway</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Dynamic EMVCo generation & Instant Webhook Listener</div>
              </div>
            </div>
          </div>

          {/* Tier 3: Persistence & Database */}
          <div className="bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-emerald-500" />
              <span>TIER 3: DATABASE & MULTI-BRANCH SYNC</span>
            </div>

            <div className="space-y-2">
              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-emerald-300 dark:border-emerald-800 shadow-sm text-xs">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-emerald-500" />
                  <span>PostgreSQL 15+ Enterprise DB</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">11 Normalized tables, Foreign Keys, UUIDs & Indexes</div>
              </div>

              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm text-xs">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Central Cloud Master & Local Cache</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Multi-branch sync (Vientiane, LPB, Pakse)</div>
              </div>

              <div className="p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm text-xs">
                <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
                  <span>Managed with DBeaver Tool</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">Direct SQL execution, backup dumps & monitoring</div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* INTERACTIVE API ENDPOINT EXPLORER */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
          <div>
            <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">
              {isLao ? 'ລາຍການ REST API & Real-Time WebSocket Specifications' : 'RESTful API Endpoints & Real-time Webhook Contracts'}
            </h3>
            <p className="text-xs text-slate-400">
              {isLao ? 'ຄລິກເພື່ອທົດສອບ Payload, Request Headers, ແລະ Response Data' : 'Click on any API endpoint to inspect schemas and execute live test simulation'}
            </p>
          </div>
        </div>

        {/* API Selector Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
          {API_SPECIFICATIONS.map(api => {
            const isSelected = selectedApi.path === api.path && selectedApi.method === api.method;
            const isPost = api.method === 'POST';
            const isPatch = api.method === 'PATCH';
            const isGet = api.method === 'GET';

            return (
              <button
                key={`${api.method}-${api.path}`}
                onClick={() => {
                  setSelectedApi(api);
                  setTestResult(null);
                }}
                className={`p-3 rounded-2xl text-left border transition ${
                  isSelected
                    ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/20'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-black font-mono ${
                    isPost ? 'bg-blue-600 text-white' : isPatch ? 'bg-amber-600 text-white' : 'bg-emerald-600 text-white'
                  }`}>
                    {api.method}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 truncate">
                    {api.path}
                  </span>
                </div>
                <div className="text-[11px] font-medium text-slate-600 dark:text-slate-300 mt-1 truncate">
                  {isLao ? api.summaryLao : api.summaryEn}
                </div>
              </button>
            );
          })}
        </div>

        {/* Active API Details Viewer */}
        <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-md text-xs font-black font-mono ${
                selectedApi.method === 'POST' ? 'bg-blue-600' : selectedApi.method === 'PATCH' ? 'bg-amber-600' : 'bg-emerald-600'
              }`}>
                {selectedApi.method}
              </span>
              <span className="font-mono text-sm font-bold text-amber-400">{selectedApi.path}</span>
            </div>

            <button
              onClick={handleTestEndpoint}
              disabled={isTesting}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-amber-500 text-slate-950 rounded-xl text-xs font-bold hover:bg-amber-400 transition"
            >
              {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              <span>{isLao ? 'ທົດສອບ Request (Test API)' : 'Execute Test Request'}</span>
            </button>
          </div>

          <p className="text-xs text-slate-300">
            {isLao ? selectedApi.descriptionLao : selectedApi.summaryEn}
          </p>

          {/* WebSocket Broadcasted Events */}
          {selectedApi.wsEvents && (
            <div className="flex items-center gap-2 text-xs">
              <Radio className="w-3.5 h-3.5 text-red-400 animate-pulse" />
              <span className="text-slate-400">WebSocket Broadcast Events:</span>
              <div className="flex gap-1.5">
                {selectedApi.wsEvents.map(evt => (
                  <span key={evt} className="px-2 py-0.5 bg-slate-800 text-amber-400 rounded-md font-mono text-[10px] border border-slate-700">
                    {evt}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Request Payload */}
          {selectedApi.sampleRequest && (
            <div>
              <div className="text-xs font-bold text-slate-400 mb-1">Request Payload (JSON):</div>
              <pre className="p-3 bg-slate-950 rounded-xl font-mono text-xs text-emerald-400 overflow-x-auto border border-slate-800">
                {JSON.stringify(selectedApi.sampleRequest, null, 2)}
              </pre>
            </div>
          )}

          {/* Response Payload */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-1">
              <span>Response Payload (200 OK):</span>
              <button
                onClick={() => copyToClipboard(JSON.stringify(selectedApi.sampleResponse, null, 2))}
                className="text-[11px] text-amber-400 hover:underline flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
              </button>
            </div>
            <pre className="p-3 bg-slate-950 rounded-xl font-mono text-xs text-cyan-300 overflow-x-auto border border-slate-800 max-h-64">
              {testResult || JSON.stringify(selectedApi.sampleResponse, null, 2)}
            </pre>
          </div>

        </div>

      </div>

    </div>
  );
};
