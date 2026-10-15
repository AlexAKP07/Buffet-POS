import React, { useState } from 'react';
import { 
  GitBranch, 
  ShieldAlert, 
  Clock, 
  Users, 
  Merge, 
  Percent, 
  CheckCircle2, 
  AlertTriangle, 
  Search, 
  Layers 
} from 'lucide-react';
import { BUSINESS_LOGIC_RULES, BusinessLogicRule } from '../../data/logicMatrixData';
import { Language } from '../../types';

interface Section3BusinessLogicProps {
  language: Language;
}

export const Section3BusinessLogic: React.FC<Section3BusinessLogicProps> = ({ language }) => {
  const isLao = language === 'la';

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [activeRule, setActiveRule] = useState<BusinessLogicRule>(BUSINESS_LOGIC_RULES[0]);

  const categories = [
    { id: 'ALL', nameLao: 'ທຸກເງື່ອນໄຂ (All Rules)', nameEn: 'All Rules' },
    { id: 'SEAT_MANAGEMENT', nameLao: 'ການຈັດການບ່ອນນັ່ງ & ຕັ່ງເສີມ', nameEn: 'Seat & Chairs' },
    { id: 'MID_MEAL_GUEST', nameLao: 'ແຂກມາເພີ່ມກາງຄັນ', nameEn: 'Mid-Meal Guests' },
    { id: 'TABLE_MERGE', nameLao: 'ການຮວມໂຕະ & ຍ້າຍໂຕະ', nameEn: 'Table Merge' },
    { id: 'DELAYED_CARE', nameLao: 'ແຈ້ງເຕືອນອາຫານຊັກຊ້າ', nameEn: 'Delayed Care Alerts' },
    { id: 'CHECKOUT_GUARDRAIL', nameLao: 'ລະບົບປ້ອງກັນ Check-out', nameEn: 'Checkout Guardrail' },
    { id: 'PROMOTION_ENGINE', nameLao: 'ໂປຣໂມຊັ່ນ & ສ່ວນຫຼຸດ', nameEn: 'Promotions' },
  ];

  const filteredRules = BUSINESS_LOGIC_RULES.filter(rule => {
    const matchesCat = selectedCategory === 'ALL' || rule.category === selectedCategory;
    const matchesSearch = 
      rule.ruleId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.nameEn.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.nameLao.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rule.descriptionEn.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
            <GitBranch className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">
              {isLao ? 'SECTION 3: ຕາຕະລາງ Business Logic Matrix ລະອຽດ' : 'SECTION 3: Comprehensive Business Logic Matrix & Edge Case Rules'}
            </h2>
            <p className="text-xs text-slate-400">
              {isLao ? 'ກົດລະບຽບການຄຳນວນບຸບເຟ່, ເວລາ, ບ່ອນນັ່ງເສີມ, ແຂກມາເພີ່ມກາງຄັນ, ຮວມບິນ, ອາຫານຊັກຊ້າ ແລະ ລະບົບ Guardrail' : 'Operational Business Rules: Formulas, Database Constraints, State Machine Validations & Fallbacks'}
            </p>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-800 p-4 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={isLao ? 'ຄົ້ນຫາ Rule ID, ຊື່ເງື່ອນໄຂ...' : 'Search Rule ID, name, description...'}
                className="w-full pl-9 pr-3 py-2 rounded-xl text-xs border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-bold">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition ${
                  selectedCategory === cat.id
                    ? 'bg-amber-500 text-slate-950 shadow-sm'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                }`}
              >
                {isLao ? cat.nameLao : cat.nameEn}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RULE MATRIX CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {filteredRules.map(rule => {
          return (
            <div
              key={rule.ruleId}
              className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200 dark:border-slate-700 shadow-sm space-y-4 hover:shadow-md transition"
            >
              
              {/* Header */}
              <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-slate-700 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-black text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-300/40">
                      {rule.ruleId}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-500">
                      {rule.category}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mt-1">
                    {isLao ? rule.nameLao : rule.nameEn}
                  </h3>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {isLao ? rule.descriptionLao : rule.descriptionEn}
              </p>

              {/* Formula / Logic Specification */}
              <div className="p-3 bg-slate-50 dark:bg-slate-850 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 text-xs space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  {isLao ? 'ສູດຄຳນວນ & ເງື່ອນໄຂລະບົບ (Formula / Logic):' : 'System Formula / Execution Logic:'}
                </div>
                <div className="font-mono text-xs font-bold text-blue-700 dark:text-blue-300">
                  {isLao ? rule.formulaOrConstraintLao : rule.formulaOrConstraintEn}
                </div>
              </div>

              {/* Edge Cases & Guardrail Action */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
                
                <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-300">
                  <div className="font-bold flex items-center gap-1 mb-0.5">
                    <AlertTriangle className="w-3 h-3 text-amber-600" />
                    <span>{isLao ? 'ກໍລະນີພິເສດ (Edge Case):' : 'Edge Case:'}</span>
                  </div>
                  <span>{isLao ? rule.edgeCasesLao : rule.edgeCasesEn}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-900 dark:text-emerald-300">
                  <div className="font-bold flex items-center gap-1 mb-0.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>{isLao ? 'ການຈັດການ (System Action):' : 'System Action:'}</span>
                  </div>
                  <span>{isLao ? rule.systemActionLao : rule.systemActionEn}</span>
                </div>

              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
