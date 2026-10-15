/**
 * Detailed Business Logic Matrix and Setup Guide Data
 * For Sections 2, 3, and 5 of the Architecture Specification
 */

export interface BusinessLogicRule {
  ruleId: string;
  category: string;
  nameLao: string;
  nameEn: string;
  descriptionLao: string;
  descriptionEn: string;
  formulaOrConstraintLao: string;
  formulaOrConstraintEn: string;
  edgeCasesLao: string;
  edgeCasesEn: string;
  systemActionLao: string;
  systemActionEn: string;
}

export const BUSINESS_LOGIC_RULES: BusinessLogicRule[] = [
  {
    ruleId: 'BR-01',
    category: 'SEAT_MANAGEMENT',
    nameLao: 'ເງື່ອນໄຂການເພີ່ມເກົ້າອີ້ເສີມ (Dynamic Extra Chairs)',
    nameEn: 'Dynamic Extra Chair Allocation Logic',
    descriptionLao: 'ອະນຸຍາດໃຫ້ເພີ່ມຕັ່ງເສີມໃສ່ໂຕະທີ່ມີແຂກນັ່ງເກີນ Capacity ເດີມ ໂດຍມີຂອບເຂດຄວາມປອດໄພ ແລະ ພື້ນທີ່ທາງຍ່າງ.',
    descriptionEn: 'Allows adding extra chairs to an active table when guest count exceeds standard capacity, maintaining aisle safety limits.',
    formulaOrConstraintLao: 'extraChairs + delta <= maxExtraChairs (ສູງສຸດບໍ່ເກີນ 4 ຕັ່ງຕໍ່ໂຕະ, ທັງໝົດ <= 8-12 ບ່ອນນັ່ງ)',
    formulaOrConstraintEn: 'extraChairs + delta <= maxExtraChairs (Max 4 extra chairs per table, total capacity capped)',
    edgeCasesLao: 'ຖ້າພະຍາຍາມເພີ່ມເກີນ maxExtraChairs: ລະບົບຈະ Block ແລະ ແນະນຳໃຫ້ພະນັກງານເຮັດການ "Merge Table" ກັບໂຕະຂ້າງຄຽງ.',
    edgeCasesEn: 'If limit exceeded: System rejects chair allocation and prompts staff to initiate "Table Merge" with adjacent table.',
    systemActionLao: 'ອັບເດດ table_plans.extra_chairs, ສະແດງປ້າຍ "+N ຕັ່ງເສີມ" ເທິງຜັງໂຕະ, ແລະ ສົ່ງສັນຍານແຈ້ງພະນັກງານຍົກຕັ່ງມາວາງ.',
    systemActionEn: 'Updates table extra_chairs count, renders visual badge on floor plan, and notifies waitstaff to place physical chair.'
  },
  {
    ruleId: 'BR-02',
    category: 'MID_MEAL_GUEST',
    nameLao: 'ການຄິດໄລ່ເງິນ ແລະ ເວລາແຂກມາກາງຄັນ (Mid-Meal Guests)',
    nameEn: 'Mid-Meal Guest Addition & Pro-rating Logic',
    descriptionLao: 'ກຳນົດນະໂຍບາຍລາຄາ ແລະ ເວລາຮັບປະທານສຳລັບລູກຄ້າທີ່ມານັ່ງຮ່ວມໂຕະຫຼັງຈາກທີ່ໂຕະໄດ້ເປີດ Session ໄປແລ້ວ.',
    descriptionEn: 'Governs pricing rules and dining time constraints for guests arriving after a table session has already started.',
    formulaOrConstraintLao: 'ແຂກໃໝ່ໃຊ້ Package ດຽວກັບໂຕະ. ລາຄາ: Full = 100%, Half = 50%, Free = 0%. ເວລາສິ້ນສຸດ = plannedEndTime ຂອງໂຕະ.',
    formulaOrConstraintEn: 'New guests inherit the active table package. Price: Full=100%, Half=50%, Free=0%. Dining ends at table plannedEndTime.',
    edgeCasesLao: 'ຖ້າເວລາໂຕະເຫຼືອຕ່ຳກວ່າ 20 ນາທີ: ລະບົບຈະແຈ້ງເຕືອນພະນັກງານໃຫ້ແຈ້ງລູກຄ້າ ຫຼື ຂໍ Manager Override ເພື່ອຕໍ່ເວລາ 30 ນາທີ.',
    edgeCasesEn: 'If remaining table time < 20 mins: Warns staff to inform guest, or prompts for Manager PIN to extend table time by 30 mins.',
    systemActionLao: 'ເພີ່ມ SessionGuest ໃໝ່ພ້ອມ timestamp, ອັບເດດຍອດ Subtotal ໃນບິນ, ແລະ ປັບປຸງຈຳນວນແຂກເທິງ Floor Plan ທັນທີ.',
    systemActionEn: 'Appends guest with timestamp, recalculates running subtotal, and updates floor plan live occupancy counter.'
  },
  {
    ruleId: 'BR-03',
    category: 'TABLE_MERGE',
    nameLao: 'ການຮວມຫຼາຍໂຕະເປັນ 1 ບິນດຽວ (Table & Bill Merge)',
    nameEn: 'Consolidated Billing & Multi-Table Merge Logic',
    descriptionLao: 'ອະນຸຍາດໃຫ້ຮວມ 2 ໂຕະຂຶ້ນໄປທີ່ມານຳກັນ ໃຫ້ເປັນ Master Table ດຽວເພື່ອໃຫ້ງ່າຍຕໍ່ການສັ່ງອາຫານ ແລະ ຄິດໄລ່ເງິນ.',
    descriptionEn: 'Allows merging multiple tables into a single Master Table session for unified ordering and single-invoice checkout.',
    formulaOrConstraintLao: 'MasterTable.session.guests += SlaveTable.session.guests; SlaveTable.status = MERGED;',
    formulaOrConstraintEn: 'MasterTable.session.guests += SlaveTable.session.guests; SlaveTable.status = MERGED (linked);',
    edgeCasesLao: 'ຖ້າແຕ່ລະໂຕະເລືອກຄົນລະແພັກເກັດ: ລະບົບບິນຈະແຍກ Line Items ຕາມແພັກເກັດຈິງຂອງແຕ່ລະຄົນ ໂດຍບໍ່ບັງຄັບ Upgrade.',
    edgeCasesEn: 'If tables have mixed packages: The consolidated bill preserves individual package unit rates without forcing uniform tier.',
    systemActionLao: 'ລວມລາຍການ Order ແລະ ແຂກທັງໝົດເຂົ້າ Master Session, ປ່ຽນສະຖານະໂຕະຍ່ອຍເປັນ [Merged with A-01] ພ້ອມໄອຄອນໂສ້ເຊື່ອມ.',
    systemActionEn: 'Consolidates orders/guests into Master Session, displays linked badge on slave tables, and unifies mobile QR menu.'
  },
  {
    ruleId: 'BR-04',
    category: 'DELAYED_CARE',
    nameLao: 'ກວດຈັບ ແລະ ແຈ້ງເຕືອນອາຫານຊັກຊ້າ (Delayed Care Alerts)',
    nameEn: 'Kitchen SLA Monitoring & Delayed Care Dispatch',
    descriptionLao: 'ລະບົບອັດຕະໂນມັດກວດຈັບອໍເດີອາຫານທີ່ຢູ່ໃນຄົວດົນເກີນ SLA (10 ນາທີ) ເພື່ອສົ່ງພະນັກງານໄປດູແລລູກຄ້າກ່ອນເກີດຄວາມບໍ່ພໍໃຈ.',
    descriptionEn: 'Automated monitoring engine tracking orders exceeding SLA limit (>10 mins) to dispatch proactive table service.',
    formulaOrConstraintLao: 'NOW() - order.orderedAt > 10 mins (600s) AND status IN (\'PENDING\', \'COOKING\') -> isDelayed = TRUE;',
    formulaOrConstraintEn: 'NOW() - order.orderedAt > 10 mins (600s) AND status IN (\'PENDING\', \'COOKING\') -> isDelayed = TRUE;',
    edgeCasesLao: 'ຖ້າເປັນເມນູພິເສດ (Wagyu MB7+ ຫຼື Prawns): SLA ຂະຫຍາຍເປັນ 12 ນາທີ; ຖ້າອາຫານ READY ແຕ່ບໍ່ມີຄົນເສີບເກີນ 5 ນາທີ ຈະແຈ້ງເຕືອນຕ່າງຫາກ.',
    edgeCasesEn: 'Specialty items (Wagyu/Giant Prawns) have 12-min SLA; if marked READY but unserved >5 mins, triggers Waiter Pickup Alert.',
    systemActionLao: 'ປ່ຽນສີບັດໃນ KDS ເປັນສີແດງກະພິບ, ສະແດງໄອຄອນກະດິ່ງເຕືອນເທິງ Floor Plan, ແລະ ສົ່ງ Push Alert ຫາ Tablet ພະນັກງານເສີບ.',
    systemActionEn: 'Flashing red border in KDS, pulsing alert icon on Floor Plan, and instant push notification to waitstaff devices.'
  },
  {
    ruleId: 'BR-05',
    category: 'CHECKOUT_GUARDRAIL',
    nameLao: 'ລະບົບປ້ອງກັນການ Check-out ບິນເປົ່າ (Strict Checkout Guardrail)',
    nameEn: 'Zero-Item & Empty Session Checkout Guardrail',
    descriptionLao: 'ລະບົບຄວາມປອດໄພຂັ້ນສູງ ປ້ອງກັນບໍ່ໃຫ້ Cashier ກົດອອກບິນ ຫຼື ສ້າງ LAO QR ຖ້າໂຕະຍັງບໍ່ມີຂໍ້ມູນແຂກ ຫຼື ແພັກເກັດບຸບເຟ່.',
    descriptionEn: 'Strict financial safeguard blocking invoice and QR generation if a session lacks guest counts or valid package tier.',
    formulaOrConstraintLao: 'IF session.guests.length === 0 OR session.packageTier === NULL OR subtotal == 0 THEN BLOCK_CHECKOUT = TRUE;',
    formulaOrConstraintEn: 'IF session.guests.length === 0 OR session.packageTier === NULL OR subtotal == 0 THEN BLOCK_CHECKOUT = TRUE;',
    edgeCasesLao: 'ຖ້າລູກຄ້ານັ່ງໂຕະແລ້ວມີເຫດສຸກເສີນຕ້ອງອອກທັນທີ: ຕ້ອງໃຊ້ຟັງຊັນ "Cancel/Void Session" ພ້ອມໃສ່ເຫດຜົນ, ຫ້າມໃຊ້ປຸ່ມ Check-out.',
    edgeCasesEn: 'If guests leave before dining: Cashier must execute "Void / Cancel Table Session" with reason logging rather than Checkout.',
    systemActionLao: 'BLOCK ປຸ່ມ "ຢືນຢັນຊຳລະເງິນ", ປິດການສ້າງ QR Code BCEL OnePay, ແລະ ສະແດງ Modal ແຈ້ງເຕືອນສີແດງພ້ອມຄຳແນະນຳ.',
    systemActionEn: 'Disables checkout confirmation, blocks Lao QR generation, and displays actionable warning modal to cashier.'
  },
  {
    ruleId: 'BR-06',
    category: 'PROMOTION_ENGINE',
    nameLao: 'ການກວດສອບໂປຣໂມຊັ່ນ ແລະ ສ່ວນຫຼຸດ (Date-Range Promo Rules)',
    nameEn: 'Date-Range Promotion & Minimum Spend Validation',
    descriptionLao: 'ກວດສອບເງື່ອນໄຂໂປຣໂມຊັ່ນທັງໝົດ: ຊ່ວງວັນທີເລີ່ມ-ສິ້ນສຸດ, ຍອດຂັ້ນຕ່ຳ (Min Spend), ຈຳນວນສິດ, ແລະ ວິທີຊຳລະເງິນ.',
    descriptionEn: 'Validates promotional discounts against validity date windows, minimum invoice spend, usage quotas, and payment channels.',
    formulaOrConstraintLao: 'validFrom <= TODAY <= validTo AND is_active = TRUE AND subtotal >= minSpendLAK AND usageCount < maxUsage',
    formulaOrConstraintEn: 'validFrom <= TODAY <= validTo AND is_active = TRUE AND subtotal >= minSpendLAK AND usageCount < maxUsage',
    edgeCasesLao: 'ຖ້າລະຫັດໝົດອາຍຸ ຫຼື ຍອດບໍ່ເຖິງ: ສະແດງຂໍ້ຄວາມລະອຽດ ເຊັ່ນ "ລະຫັດນີ້ໝົດອາຍຸແລ້ວ (Expired on 2026-08-31)" ຫຼື "ຕ້ອງມາຍອດ 500,000 ກີບ".',
    edgeCasesEn: 'If expired or below spend threshold: Returns exact friendly error (e.g. "Expired on 2026-08-31" or "Minimum spend 500,000 LAK").',
    systemActionLao: 'ຄິດໄລ່ສ່ວນຫຼຸດ (Percentage ຫຼື Fixed LAK) ຫັກລົບກ່ອນຄິດໄລ່ Service Charge 5% ແລະ VAT 7%, ບັນທຶກ code ໃສ່ບິນ.',
    systemActionEn: 'Deducts discount from subtotal prior to 5% service charge and 7% VAT, stamps promo code on official receipt.'
  }
];

export interface DBeaverSetupStep {
  stepNumber: number;
  titleLao: string;
  titleEn: string;
  instructionsLao: string;
  instructionsEn: string;
  codeSnippet?: string;
}

export const DBEAVER_SETUP_STEPS: DBeaverSetupStep[] = [
  {
    stepNumber: 1,
    titleLao: 'ຕິດຕັ້ງ PostgreSQL 15/16 Database Server',
    titleEn: 'Install PostgreSQL 15/16 Server & Create Database',
    instructionsLao: 'ດາວໂຫຼດ ແລະ ຕິດຕັ້ງ PostgreSQL ຈາກ postgresql.org ດ້ວຍ Port 5432, ຈາກນັ້ນສ້າງ Database `lao_buffet_pos_db` ດ້ວຍ UTF-8 Encoding.',
    instructionsEn: 'Download and install PostgreSQL from postgresql.org on default port 5432, then create database `lao_buffet_pos_db` with UTF-8.',
    codeSnippet: 'CREATE DATABASE lao_buffet_pos_db WITH ENCODING = \'UTF8\' LC_COLLATE = \'en_US.UTF-8\' LC_CTYPE = \'en_US.UTF-8\';'
  },
  {
    stepNumber: 2,
    titleLao: 'ດາວໂຫຼດ ແລະ ຕິດຕັ້ງ DBeaver Community Edition',
    titleEn: 'Download & Install DBeaver Universal Database Tool',
    instructionsLao: 'ດາວໂຫຼດ DBeaver Community (Free/Open Source) ຈາກ dbeaver.io ຮອງຮັບ Windows, macOS, ແລະ Linux.',
    instructionsEn: 'Download DBeaver Community edition from dbeaver.io supporting Windows, macOS, and Linux platforms.'
  },
  {
    stepNumber: 3,
    titleLao: 'ສ້າງ Connection ໃໝ່ໃນ DBeaver ໄປຫາ PostgreSQL',
    titleEn: 'Configure New PostgreSQL Connection in DBeaver',
    instructionsLao: 'ກົດປຸ່ມ "New Connection" -> ເລືອກ PostgreSQL -> ໃສ່ Host: localhost, Port: 5432, Database: lao_buffet_pos_db, Username: postgres -> ກົດ "Test Connection".',
    instructionsEn: 'Click New Connection -> Choose PostgreSQL -> Set Host: localhost, Port: 5432, Database: lao_buffet_pos_db, User: postgres -> Click Test Connection.'
  },
  {
    stepNumber: 4,
    titleLao: 'Run SQL DDL Script (ສ້າງ 11 ຕາຕະລາງ ແລະ Seed Data)',
    titleEn: 'Execute Full DDL Script to Create 11 Tables & Seed Data',
    instructionsLao: 'ເປີດ SQL Editor ໃນ DBeaver (Ctrl+]), Copy SQL DDL ທັງໝົດຈາກ SECTION 4 ມາວາງ, ແລ້ວກົດ Execute Script (Alt+X) ເພື່ອສ້າງຕາຕະລາງທັງໝົດ.',
    instructionsEn: 'Open SQL Editor (Ctrl+]), paste full DDL from Section 4, and press Execute Script (Alt+X) to generate all tables and foreign keys.'
  },
  {
    stepNumber: 5,
    titleLao: 'ຕັ້ງຄ່າ Timezone & Lao Font Encoding (UTF-8 & UTC+7)',
    titleEn: 'Verify Lao Font Rendering (UTF-8) & Timezone (Asia/Vientiane)',
    instructionsLao: 'ກວດສອບ Encoding ແລະ Timezone ເພື່ອໃຫ້ຊື່ເມນູພາສາລາວ ແລະ ເວລາອໍເດີໃນຄົວຖືກຕ້ອງຕາມເວລານະຄອນຫຼວງວຽງຈັນ.',
    instructionsEn: 'Verify client encoding and timezone to ensure proper Lao script rendering and accurate Vientiane order timestamps.',
    codeSnippet: 'ALTER DATABASE lao_buffet_pos_db SET timezone TO \'Asia/Vientiane\';\nSHOW client_encoding;\nSHOW timezone;'
  }
];

export interface TroubleshootingTip {
  errorLao: string;
  errorEn: string;
  solutionLao: string;
  solutionEn: string;
}

export const TROUBLESHOOTING_TIPS: TroubleshootingTip[] = [
  {
    errorLao: 'Connection Refused / Port 5432 ບໍ່ສາມາດເຊື່ອມຕໍ່ໄດ້',
    errorEn: 'Connection Refused: Port 5432 Unreachable',
    solutionLao: 'ກວດສອບວ່າ PostgreSQL Service ກຳລັງ Run ຢູ່ (ໃນ Services.msc ຫຼື `sudo systemctl status postgresql`) ແລະ ກວດສອບ Firewall ບໍ່ໄດ້ Block Port 5432.',
    solutionEn: 'Check if PostgreSQL service is running (`systemctl status postgresql`) and ensure local firewall allows port 5432 traffic.'
  },
  {
    errorLao: 'Password Authentication Failed ສຳລັບ User `postgres`',
    errorEn: 'FATAL: Password Authentication Failed for User postgres',
    solutionLao: 'ກວດສອບລະຫັດຜ່ານທີ່ຕັ້ງຕອນ Install ຫຼື ແກ້ໄຂໄຟລ໌ `pg_hba.conf` ໂດຍປ່ຽນ method ຈາກ `scram-sha-256` ເປັນ `trust` ຊົ່ວຄາວເພື່ອ Reset Password.',
    solutionEn: 'Verify password or temporarily edit `pg_hba.conf` to set local connection method to `trust`, reload service, and reset password.'
  },
  {
    errorLao: 'ຕົວໜັງສືພາສາລາວສະແດງເປັນເຄື່ອງໝາຍຖາມ ??? ຫຼື ຕ່າງດ້າວ',
    errorEn: 'Lao Characters Displaying as Question Marks (???)',
    solutionLao: 'ກວດສອບວ່າ Database ຖືກສ້າງດ້ວຍ UTF8 Encoding: Run `SET client_encoding TO \'UTF8\';` ແລະ ຕັ້ງ Font ໃນ DBeaver ເປັນ "Saysettha OT" ຫຼື "Phetsarath OT".',
    solutionEn: 'Ensure database collation is UTF-8. Run `SET client_encoding TO \'UTF8\';` and configure DBeaver font to support Lao Unicode.'
  },
  {
    errorLao: 'SSL Connection Error ໃນ Cloud Hosted Database',
    errorEn: 'SSL Connection Error / Certificate Verification Failed',
    solutionLao: 'ໃນ DBeaver Connection Settings -> SSL Tab -> ເລືອກ SSL Mode ເປັນ `require` ຫຼື `prefer` ແລະ ຕິກເລືອກ "Non-validating / Trust Certificate".',
    solutionEn: 'In DBeaver Connection Settings -> SSL Tab -> select SSL Mode `require` or `prefer` and enable "Allow self-signed certificates".'
  }
];
