import React, { useState } from 'react';
import { 
  Database, 
  Code2, 
  Copy, 
  Check, 
  Layers, 
  Key, 
  CheckCircle2, 
  FileText,
  Table as TableIcon
} from 'lucide-react';
import { POSTGRESQL_DDL_SCRIPT } from '../../data/specData';
import { Language } from '../../types';

interface Section4DatabaseDDLProps {
  language: Language;
}

export const Section4DatabaseDDL: React.FC<Section4DatabaseDDLProps> = ({ language }) => {
  const isLao = language === 'la';
  const [copied, setCopied] = useState<boolean>(false);

  const copyScript = () => {
    navigator.clipboard.writeText(POSTGRESQL_DDL_SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const tableSummaries = [
    { name: 'branches', rows: 'Multi-branch restaurants (Vientiane, LPB, Pakse)', pk: 'id VARCHAR(50)' },
    { name: 'users', rows: 'Staff authentication, bcrypt passwords, RBAC roles', pk: 'id UUID' },
    { name: 'restaurant_tables', rows: 'Floor plan tables, coordinates, zones, capacity, extra chairs', pk: 'id UUID' },
    { name: 'table_sessions', rows: 'Active dining sessions, package tier, timer duration, status', pk: 'id UUID' },
    { name: 'session_guests', rows: 'Individual guest entries (Full/Half/Free) with arrival timestamps', pk: 'id UUID' },
    { name: 'menu_categories', rows: 'Catalog categories (Meats, Seafood, Veggies, Desserts)', pk: 'id VARCHAR(50)' },
    { name: 'menu_items', rows: 'Buffet dishes, required package tiers, prep time SLA', pk: 'id UUID' },
    { name: 'orders', rows: 'Kitchen order tickets, table associations, delayed flags', pk: 'id UUID' },
    { name: 'order_items', rows: 'Line items per order ticket with cooking statuses', pk: 'id UUID' },
    { name: 'promotions', rows: 'Promo codes, percentage/fixed discounts, date validity range', pk: 'id UUID' },
    { name: 'bills_invoices', rows: 'Final settled checkout bills, LAO QR references, VAT, Service charge', pk: 'id UUID' },
    { name: 'table_reservations', rows: 'Advance customer table bookings, party size, deposit amount', pk: 'id UUID' },
  ];

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-xl">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">
                {isLao ? 'SECTION 4: ໂຄງສ້າງຖານຂໍ້ມູນ PostgreSQL DDL Schema Script' : 'SECTION 4: Complete Production PostgreSQL DDL Schema'}
              </h2>
              <p className="text-xs text-slate-400">
                {isLao ? '12 ຕາຕະລາງພ້ອມ Foreign Keys, UUIDs, Indexes, Enums, Constraints ສຳລັບລະບົບ POS ບຸບເຟ່' : '12 Normalized Relational Tables with Composite Indexes, UUID Primary Keys, Foreign Keys & Triggers'}
              </p>
            </div>
          </div>

          <button
            onClick={copyScript}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 text-slate-950 font-black text-xs hover:bg-amber-400 shadow-lg shadow-amber-500/20 transition"
          >
            {copied ? <Check className="w-4 h-4 text-slate-950" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? (isLao ? 'ຄັດລອກ SQL ແລ້ວ!' : 'SQL Copied to Clipboard!') : (isLao ? 'ຄັດລອກ DDL SQL ທັງໝົດ' : 'Copy Full PostgreSQL DDL')}</span>
          </button>
        </div>
      </div>

      {/* Relational Entity Dictionary */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        <h3 className="font-extrabold text-slate-900 dark:text-white text-sm flex items-center gap-2">
          <TableIcon className="w-4 h-4 text-amber-500" />
          <span>{isLao ? 'ລາຍຊື່ຕາຕະລາງຖານຂໍ້ມູນ (12 Production Tables Schema Summary)' : 'Database Entity Dictionary (12 Production Tables)'}</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {tableSummaries.map(t => (
            <div key={t.name} className="p-3.5 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-amber-600 dark:text-amber-400">
                  {t.name}
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded text-slate-600 dark:text-slate-300">
                  PK: {t.pk}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                {t.rows}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Code Viewer Container */}
      <div className="bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
            <span className="text-xs font-mono text-slate-400 ml-2">schema_lao_buffet_pos_v2.sql</span>
          </div>

          <button
            onClick={copyScript}
            className="text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1.5"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>{copied ? 'Copied!' : 'Copy Script'}</span>
          </button>
        </div>

        <pre className="p-6 text-xs font-mono text-emerald-400 overflow-x-auto max-h-[560px] leading-relaxed select-all">
          {POSTGRESQL_DDL_SCRIPT}
        </pre>
      </div>

    </div>
  );
};
