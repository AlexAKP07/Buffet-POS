import React, { useState } from 'react';
import { 
  Layout, 
  Smartphone, 
  Monitor, 
  ChefHat, 
  Receipt, 
  UserCheck, 
  Eye, 
  FileCode,
  Layers,
  Sparkles
} from 'lucide-react';
import { Language } from '../../types';

interface Section2WireframesProps {
  language: Language;
}

export const Section2Wireframes: React.FC<Section2WireframesProps> = ({ language }) => {
  const isLao = language === 'la';

  const [activeScreen, setActiveScreen] = useState<'AUTH' | 'FLOORPLAN' | 'KDS' | 'BILLING' | 'MOBILE'>('FLOORPLAN');

  const screens = [
    {
      id: 'AUTH',
      nameLao: 'ໜ້າ 1: ເຂົ້າສູ່ລະບົບ, ໂປຣໄຟລ໌ & ສິດ RBAC',
      nameEn: 'Screen 1: Auth, Profile & RBAC Security',
      icon: UserCheck,
      descLao: 'ການພິສູດຕົວຕົນຫຼາຍຊ່ອງທາງ (Username/Phone/Email), ກວດສອບຄວາມປອດໄພລະຫັດຜ່ານ 4 ເງື່ອນໄຂ, Social Login & ຍ້າຍສາຂາ',
      descEn: 'Multi-identifier login, password security enforcement (8+ chars, uppercase, number, symbol), social logins & branch reassignment.',
      wireframe: `+-------------------------------------------------------------------------------+
| LAO BUFFET POS - ENTERPRISE AUTHENTICATION                                    |
+-------------------------------------------------------------------------------+
|                                                                               |
|   [ BRAND LOGO: LAO BUFFET RESTAURANT ]                                       |
|   "Enterprise Multi-Branch All-You-Can-Eat Cloud POS"                         |
|                                                                               |
|   +-----------------------------------------------------------------------+   |
|   | Login Identifier: [ mrsoukphac@gmail.com / +856 20 5555 8899        ] |   |
|   | Password:         [ ****************                          ] (Eye) |   |
|   | [x] Remember Me on this POS Terminal       [ Forgot Password? (OTP) ] |   |
|   |                                                                       |   |
|   |   [ >>> SIGN IN TO POS TERMINAL <<< ] (Gold CTA Button)               |   |
|   |                                                                       |   |
|   | ------------------- OR SIGN IN WITH SOCIAL AUTH --------------------  |   |
|   |   [ G  Sign in with Google ]      [ f  Sign in with Facebook ]        |   |
|   +-----------------------------------------------------------------------+   |
|                                                                               |
|   [ PASSWORD SECURITY CONSTRAINTS CHECKLIST (For New Registrations) ]         |
|   (✔) Min 8 Chars    (✔) 1 Uppercase (A-Z)   (✔) 1 Number   (✔) 1 Special    |
+-------------------------------------------------------------------------------+`
    },
    {
      id: 'FLOORPLAN',
      nameLao: 'ໜ້າ 2: ຜັງໂຕະແບບ Real-time & Dashboard ຄວບຄຸມ',
      nameEn: 'Screen 2: Floor Plan & Live Dashboard',
      icon: Monitor,
      descLao: 'ຕົວນັບສະຖິຕິ 4 ໃບ (ໂຕະຫວ່າງ, ໂຕະມີແຂກ, ໃກ້ໝົດເວລາ <15m, ອາຫານຊ້າ >10m), ຜັງໂຕະຕາມໂຊນ, ຈັດການຕັ່ງເສີມ, ແຂກມາເພີ່ມກາງຄັນ, ຮວມບິນ',
      descEn: '4 KPI Counter cards, zone filters (Indoor AC, VIP, Garden), extra chair adder, mid-meal additions, bill merger & timer ring indicators.',
      wireframe: `+-------------------------------------------------------------------------------+
| HEADER: [Branch: Vientiane Center v] | [Cashier: Noy K.] | [🌙/☀️] | [LA/EN]   |
+-------------------------------------------------------------------------------+
| TOP 4 COUNTER CARDS:                                                          |
| [ 🟢 12 AVAILABLE ]  [ 🔵 8 OCCUPIED ]  [ 🟡 3 NEAR LIMIT ]  [ 🔴 2 DELAYED ]  |
+-------------------------------------------------------------------------------+
| ZONES: [ (x) All Zones ] [ Indoor VIP Room ] [ Main Hall AC ] [ Garden Patio ]|
+-------------------------------------------------------------------------------+
| DYNAMIC FLOOR PLAN GRID:                                                      |
|                                                                               |
| +-------------------+  +-------------------+  +-------------------+           |
| | TABLE: A-01 [VIP] |  | TABLE: A-02       |  | TABLE: B-01       |           |
| | Status: OCCUPIED  |  | Status: NEAR LIMIT|  | Status: DELAYED   |           |
| | Tier: VIP (329k)  |  | Tier: PREMIUM     |  | Status: CARE REQ  |           |
| | ⏳ 42m remaining  |  | ⏳ 12m remaining  |  | 🚨 Food > 12m     |           |
| | Extra Chairs: [+1]|  | Extra Chairs: [0] |  | Extra Chairs: [0] |           |
| | [ Manage Chairs ] |  | [ Add Guests Mid ]|  | [ Notify Staff ]  |           |
| +-------------------+  +-------------------+  +-------------------+           |
|                                                                               |
| [ ACTION BAR: (Open Table) (Merge Bills) (Seat Reservation) (Table Transfer) ] |
+-------------------------------------------------------------------------------+`
    },
    {
      id: 'KDS',
      nameLao: 'ໜ້າ 3: ຈໍສະແດງຜົນໃນຄົວ KDS (Kitchen Display)',
      nameEn: 'Screen 3: Kitchen Display System (KDS)',
      icon: ChefHat,
      descLao: 'ຄິວອໍເດີຕາມເວລາ, ແຈ້ງເຕືອນອໍເດີຊັກຊ້າ (>10 ນາທີ) ກະພິບສີແດງ, ສະຖານະ PENDING -> COOKING -> READY -> SERVED, ປຸ່ມແຈ້ງພະນັກງານດູແລ',
      descEn: 'Ticket queue, SLA timer per item, automatic flashing alert for orders > 10m delayed, staff ping notification & item status progression.',
      wireframe: `+-------------------------------------------------------------------------------+
| KDS KITCHEN DISPLAY: [LIVE SYNC] | 🔴 2 Delayed | 🟡 4 Cooking | 🟢 5 Ready   |
+-------------------------------------------------------------------------------+
| FILTER: [ All Stations ] [ Meat & Pork ] [ Beef Wagyu ] [ Seafood ] [ Veggies]|
+-------------------------------------------------------------------------------+
| TICKET QUEUE:                                                                 |
|                                                                               |
| +--------------------------------+  +--------------------------------+        |
| | 🚨 DELAYED ALERT (+14m SLA)    |  | TICKET #ORD-2026-9042          |        |
| | TABLE: B-01  | Time: 19:10     |  | TABLE: A-03  | Time: 19:22     |        |
| |--------------------------------|  |--------------------------------|        |
| | [2x] 🥩 ວາກິວອົດສະຕຣາລີ A5 [COOKING] |  | [3x] 🥓 ໝູສາມຊັ້ນສະໄລ້ [PENDING]|        |
| | [1x] 🦐 ກຸ້ງແມ່ນ້ຳເຜົາ   [COOKING] |  | [2x] 🍄 ເຫັດເຂັມທອງ    [PENDING]|        |
| |--------------------------------|  |--------------------------------|        |
| | [ 🔔 Ping Waiter Care Alert ]  |  | [ Start Cooking Batch ]        |        |
| | [ ✔️ Mark All Items Served ]    |  | [ ✔️ Mark All Items Served ]    |        |
| +--------------------------------+  +--------------------------------+        |
+-------------------------------------------------------------------------------+`
    },
    {
      id: 'BILLING',
      nameLao: 'ໜ້າ 4: ໜ້າຄິດໄລ່ເງິນ & ຊຳລະເງິນ (Cashier POS Billing)',
      nameEn: 'Screen 4: Cashier POS & Billing Settlement',
      icon: Receipt,
      descLao: 'Strict Checkout Guardrail (ກວດສອບບິນເປົ່າ), ຄິດໄລ່ລາຄາແຂກ Full/Half/Free, ໂປຣໂມຊັ່ນສ່ວນຫຼຸດ, ຊຳລະຜ່ານ LAO QR (BCEL OnePay / LDB Trust)',
      descEn: 'Strict Checkout Guardrail, dynamic guest pricing breakdown (Full/Half/Free), date-ranged promo code engine, LAO QR Dynamic & thermal receipt.',
      wireframe: `+-------------------------------------------------------------------------------+
| BILLING: INVOICE TABLE A-01 | Cashier: Noy K. | Package: VIP BUFFET (329,000₭)|
+-------------------------------------------------------------------------------+
| LEFT: GUEST & CHARGE BREAKDOWN       | RIGHT: SETTLEMENT & LAO QR             |
|                                      |                                        |
| 1. Full Price Adults (100%):         | Buffet Subtotal:      1,151,500 ₭      |
|    3 Pax x 329,000 ₭ = 987,000 ₭     | Promo Discount:        -115,150 ₭      |
| 2. Half Price Children (50%):        | Service Charge (5%):    51,818 ₭      |
|    1 Pax x 164,500 ₭ = 164,500 ₭     | VAT Tax (7%):           75,821 ₭      |
| 3. Free Guests (<90cm / VIP):        | -------------------------------------- |
|    1 Pax x 0 ₭       =       0 ₭     | NET TOTAL DUE:        1,164,000 ₭      |
|                                      |                                        |
| [ PROMO CODE ENGINE ]                | [ PAYMENT SELECTION: ]                 |
| Promo: [ BUFFET10          ] [Apply] | [*] BCEL OnePay (LAO QR Dynamic)       |
| Status: Valid (10% Off applied)      | [ ] LDB TrustPay QR                    |
|                                      | [ ] Cash (Auto change calculation)     |
| [ STRICT CHECKOUT GUARDRAIL ACTIVE ] | [ ] Credit Card (Visa/Mastercard)      |
| (Blocks settlement if 0 guests/0 lak)|                                        |
|                                      | [ >>> CONFIRM & GENERATE LAO QR <<< ]  |
+-------------------------------------------------------------------------------+`
    },
    {
      id: 'MOBILE',
      nameLao: 'ໜ້າ 5: ມືຖືລູກຄ້າສະແກນ QR Code ສັ່ງອາຫານ',
      nameEn: 'Screen 5: Customer Mobile QR Self-Ordering',
      icon: Smartphone,
      descLao: 'UI ສຳລັບມືຖື: ສະແກນ QR ເຂົ້າເມນູ, ນັບຖອຍຫຼັງເວລາບຸບເຟ່, ແບ່ງໝວດໝູ່ອາຫານ, ກວດສອບສິດແພັກເກັດ, ຕິດຕາມສະຖານະອໍເດີໃນຄົວ',
      descEn: 'Mobile-first PWA: Live session countdown timer, package restriction lock, buffet item catalog, custom notes & live cooking status tracker.',
      wireframe: `+-----------------------------+
| [ TABLE A-01 ]  [ ⏳ 58:20 ]|  <-- Live Session Countdown Bar
| Package: VIP BUFFET         |
+-----------------------------+
| CATEGORIES:                 |
| [ Pork ] [ Beef ] [ Seafood]|
+-----------------------------+
| MENU CATALOG:               |
|                             |
| [IMG] 🥩 Wagyu Beef A5      |
|       Prep: 8m | Tier: VIP  |
|       [ - ] [ 2 ] [ + ]     |
|                             |
| [IMG] 🦐 River Prawn Giant  |
|       Prep: 10m | Tier: VIP |
|       [ + Add to Cart ]     |
|                             |
| [IMG] 🥓 Kurobuta Pork Neck |
|       Prep: 5m | Tier: STD  |
|       [ + Add to Cart ]     |
+-----------------------------+
| [🛒 VIEW CART (2 Items)]    |
| [ 📨 SEND ORDER TO KDS ]    |
+-----------------------------+
| FOOTER: [Menu] [Cart] [Hist]|
+-----------------------------+`
    }
  ];

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
            <Layout className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-white">
              {isLao ? 'SECTION 2: ສະເປັກໜ້າຈໍ UI/UX & ແຜນຜັງ Wireframe ລະອຽດ' : 'SECTION 2: UI/UX Screen Specifications & Wireframe Blueprints'}
            </h2>
            <p className="text-xs text-slate-400">
              {isLao ? 'ລາຍລະອຽດໜ້າຈໍທັງ 5 ໜ້າຫຼັກ: ໂຄງສ້າງ, ການໂຕ້ຕອບ, ເງື່ອນໄຂທຸລະກິດ ແລະ Wireframe Layout' : 'Comprehensive UI/UX Blueprints across 5 Core Screens: Information Architecture, Responsive Grids & Wireframes'}
            </p>
          </div>
        </div>
      </div>

      {/* Screen Selector Tabs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {screens.map(s => {
          const isSelected = activeScreen === s.id;
          const Icon = s.icon;

          return (
            <button
              key={s.id}
              onClick={() => setActiveScreen(s.id as any)}
              className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between ${
                isSelected
                  ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/20 text-amber-950 dark:text-amber-300'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <Icon className={`w-5 h-5 ${isSelected ? 'text-amber-500' : 'text-slate-400'}`} />
                <span className="text-[10px] font-mono font-bold">{s.id}</span>
              </div>
              <div className="text-xs font-bold mt-2 truncate">
                {isLao ? s.nameLao.split(':')[0] : s.nameEn.split(':')[0]}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Screen Wireframe Blueprint Viewer */}
      {(() => {
        const screen = screens.find(s => s.id === activeScreen)!;
        const Icon = screen.icon;

        return (
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-5">
            
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-700 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                  <Icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                    {isLao ? screen.nameLao : screen.nameEn}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {isLao ? screen.descLao : screen.descEn}
                  </p>
                </div>
              </div>
            </div>

            {/* Wireframe Box */}
            <div>
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                <span className="flex items-center gap-1.5">
                  <FileCode className="w-4 h-4 text-amber-500" />
                  <span>{isLao ? 'ແຜນຜັງໂຄງສ້າງ Wireframe (ASCII Visual Layout Blueprint):' : 'ASCII Architecture & Wireframe Layout Blueprint:'}</span>
                </span>
                <span className="font-mono text-[11px] text-slate-400">Pixel-Perfect Responsive Grid</span>
              </div>

              <pre className="p-4 bg-slate-950 text-amber-300 font-mono text-xs rounded-2xl overflow-x-auto border border-slate-800 leading-relaxed shadow-inner">
                {screen.wireframe}
              </pre>
            </div>

          </div>
        );
      })()}

    </div>
  );
};
