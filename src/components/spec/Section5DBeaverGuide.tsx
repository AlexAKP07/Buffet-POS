import React, { useState } from 'react';
import { 
  Terminal, 
  Database, 
  ExternalLink, 
  CheckCircle2, 
  AlertTriangle, 
  Copy, 
  Check, 
  HardDrive, 
  Layers, 
  HelpCircle,
  Play
} from 'lucide-react';
import { DBEAVER_SETUP_STEPS, TROUBLESHOOTING_TIPS } from '../../data/logicMatrixData';
import { Language } from '../../types';

interface Section5DBeaverGuideProps {
  language: Language;
}

export const Section5DBeaverGuide: React.FC<Section5DBeaverGuideProps> = ({ language }) => {
  const isLao = language === 'la';

  const [copiedQuery, setCopiedQuery] = useState<string | null>(null);

  const copyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedQuery(id);
    setTimeout(() => setCopiedQuery(null), 2000);
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
            <Terminal className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">
              {isLao ? 'SECTION 5: ຄູ່ມືການຕິດຕັ້ງ PostgreSQL & ເຊື່ອມຕໍ່ຜ່ານ DBeaver' : 'SECTION 5: PostgreSQL Database & DBeaver GUI Setup Guide'}
            </h2>
            <p className="text-xs text-slate-400">
              {isLao ? 'ຂັ້ນຕອນການສ້າງຖານຂໍ້ມູນ, Run DDL Script, ຕັ້ງຄ່າ Port 5432, SSL, ແລະ ແກ້ໄຂບັນຫາ Connection' : 'Production Guide: Database Provisioning, DDL Initialization, DBeaver Driver Config & Troubleshooting'}
            </p>
          </div>
        </div>
      </div>

      {/* QUICK CONNECTION PARAMETERS CARD */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <h3 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
          <Database className="w-4 h-4 text-amber-500" />
          <span>{isLao ? 'ພາຣາມິເຕີສຳລັບການເຊື່ອມຕໍ່ DBeaver (Standard Connection Parameters)' : 'DBeaver Standard Connection Parameters'}</span>
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="text-[10px] text-slate-400 font-bold uppercase">Host / Server</div>
            <div className="font-mono font-bold text-slate-900 dark:text-white mt-1">localhost</div>
            <div className="text-[10px] text-slate-400">or db.laobuffet.la</div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="text-[10px] text-slate-400 font-bold uppercase">Port</div>
            <div className="font-mono font-bold text-emerald-600 dark:text-emerald-400 mt-1">5432</div>
            <div className="text-[10px] text-slate-400">Standard TCP</div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="text-[10px] text-slate-400 font-bold uppercase">Database</div>
            <div className="font-mono font-bold text-amber-600 dark:text-amber-400 mt-1">lao_buffet_pos_db</div>
            <div className="text-[10px] text-slate-400">UTF-8 / Lao_LA</div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="text-[10px] text-slate-400 font-bold uppercase">Username</div>
            <div className="font-mono font-bold text-slate-900 dark:text-white mt-1">postgres</div>
            <div className="text-[10px] text-slate-400">or pos_admin</div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="text-[10px] text-slate-400 font-bold uppercase">Password</div>
            <div className="font-mono font-bold text-slate-900 dark:text-white mt-1">••••••••••</div>
            <div className="text-[10px] text-slate-400">Env Secret</div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-700">
            <div className="text-[10px] text-slate-400 font-bold uppercase">SSL Mode</div>
            <div className="font-mono font-bold text-blue-600 dark:text-blue-400 mt-1">prefer / require</div>
            <div className="text-[10px] text-slate-400">Cloud Enforced</div>
          </div>
        </div>
      </div>

      {/* STEP BY STEP SETUP WALKTHROUGH */}
      <div className="space-y-4">
        <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">
          {isLao ? 'ຂັ້ນຕອນການຕິດຕັ້ງລະອຽດ (Step-by-Step Walkthrough)' : 'Step-by-Step Walkthrough (PostgreSQL & DBeaver)'}
        </h3>

        <div className="space-y-4">
          {DBEAVER_SETUP_STEPS.map((step) => (
            <div
              key={step.stepNumber}
              className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-2xl bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center shadow-md">
                    {step.stepNumber}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {isLao ? step.titleLao : step.titleEn}
                    </h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {isLao ? step.instructionsLao : step.instructionsEn}
                    </p>
                  </div>
                </div>
              </div>

              {step.codeSnippet && (
                <div className="relative mt-2">
                  <div className="absolute right-3 top-3">
                    <button
                      onClick={() => copyText(step.codeSnippet!, `step-${step.stepNumber}`)}
                      className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white text-xs flex items-center gap-1"
                    >
                      {copiedQuery === `step-${step.stepNumber}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <pre className="p-4 bg-slate-950 text-amber-300 font-mono text-xs rounded-2xl overflow-x-auto border border-slate-800 leading-relaxed">
                    {step.codeSnippet}
                  </pre>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* TROUBLESHOOTING & DIAGNOSTICS */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <h3 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-500" />
          <span>{isLao ? 'ການແກ້ໄຂບັນຫາການເຊື່ອມຕໍ່ (Troubleshooting & Connection Issues)' : 'Troubleshooting & Connection Fixes'}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {TROUBLESHOOTING_TIPS.map((tip, idx) => (
            <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
              <div className="font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>{isLao ? tip.errorLao : tip.errorEn}</span>
              </div>
              <div className="text-slate-600 dark:text-slate-300 leading-relaxed">
                <span className="font-semibold">{isLao ? 'ວິທີແກ້ໄຂ: ' : 'Solution: '}</span>
                {isLao ? tip.solutionLao : tip.solutionEn}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
