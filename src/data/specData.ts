/**
 * Comprehensive Software Architecture Specification Data
 * Sections 1 - 5 in Lao and English
 */

export interface ApiEndpointSpec {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  path: string;
  category: 'Tables & Realtime' | 'KDS Kitchen' | 'Orders & Mobile' | 'Billing & LAO QR' | 'Auth & RBAC';
  summaryLao: string;
  summaryEn: string;
  descriptionLao: string;
  headers: Record<string, string>;
  sampleRequest?: object | string;
  sampleResponse: object;
  wsEvents?: string[];
}

export const API_SPECIFICATIONS: ApiEndpointSpec[] = [
  {
    method: 'GET',
    path: '/api/v1/branches/{branch_id}/floor-plan',
    category: 'Tables & Realtime',
    summaryLao: 'ດຶງຂໍ້ມູນສະຖານະແຜນຜັງໂຕະທັງໝົດໃນສາຂາແບບ Real-Time',
    summaryEn: 'Get real-time floor plan layout and table statuses',
    descriptionLao: 'ສົ່ງຄືນລາຍການໂຕະທຸກໂຕະ ພ້ອມສະຖານະປັດຈຸບັນ (VACANT, OCCUPIED, NEAR_LIMIT, DELAYED_ALERT, RESERVED), ຈຳນວນເກົ້າອີ້ເສີມ ແລະ ເວລາທີ່ເຫຼືອ.',
    headers: { 'Authorization': 'Bearer <jwt_token>', 'X-Branch-ID': 'BR-VTE-01' },
    sampleResponse: {
      success: true,
      data: {
        branchId: 'BR-VTE-01',
        timestamp: '2026-08-19T00:18:00Z',
        summary: { totalTables: 24, available: 12, occupied: 8, nearLimit: 2, delayedCare: 2 },
        tables: [
          { code: 'A-01', status: 'OCCUPIED', package: 'PREMIUM', guests: 5, remainingMinutes: 60, extraChairs: 1 },
          { code: 'A-02', status: 'NEAR_LIMIT', package: 'STANDARD', guests: 3, remainingMinutes: 10, extraChairs: 0 },
          { code: 'A-03', status: 'DELAYED_ALERT', package: 'VIP', guests: 4, delayedMinutes: 12, extraChairs: 0 }
        ]
      }
    },
    wsEvents: ['table.status_changed', 'table.extra_chair_updated', 'session.time_warning']
  },
  {
    method: 'POST',
    path: '/api/v1/sessions/open-table',
    category: 'Tables & Realtime',
    summaryLao: 'ເປີດໂຕະໃໝ່ ແລະ ກຳນົດແພັກເກັດບຸບເຟ່',
    summaryEn: 'Initialize buffet session for table with guest breakdown',
    descriptionLao: 'ກວດສອບສະຖານະໂຕະ ຖ້າຫວ່າງ ຈຶ່ງເປີດ Session ພ້ອມບັນທຶກປະເພດແຂກ (Full, Half 50%, Free) ແລະ ສ້າງ QR Code ສັ່ງອາຫານສຳລັບໂຕະ.',
    headers: { 'Authorization': 'Bearer <jwt_token>', 'Content-Type': 'application/json' },
    sampleRequest: {
      branchId: 'BR-VTE-01',
      tableCode: 'A-04',
      packageTier: 'PREMIUM',
      guests: [
        { type: 'FULL', count: 3, note: 'ຜູ້ໃຫຍ່ 3 ທ່ານ' },
        { type: 'HALF', count: 1, note: 'ເດັກນ້ອຍ 1 ທ່ານ (ສູງ 110cm)' },
        { type: 'FREE', count: 1, note: 'ເດັກນ້ອຍ 1 ທ່ານ (ຕ່ຳກວ່າ 90cm)' }
      ],
      extraChairs: 1
    },
    sampleResponse: {
      success: true,
      sessionId: 'SESS-104',
      tableCode: 'A-04',
      sessionQrToken: 'laobuffet://order?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      startTime: '2026-08-19T00:20:00Z',
      endTime: '2026-08-19T02:05:00Z',
      durationMinutes: 105,
      totalGuests: 5
    },
    wsEvents: ['session.opened', 'floor_plan.updated']
  },
  {
    method: 'PATCH',
    path: '/api/v1/sessions/{session_id}/add-guests',
    category: 'Tables & Realtime',
    summaryLao: 'ເພີ່ມແຂກກາງຄາບ (Mid-Meal Guest Addition) ພ້ອມຄິດໄລ່ລາຄາ',
    summaryEn: 'Add guests mid-meal with automatic package pricing and pro-rating',
    descriptionLao: 'ເພີ່ມຈຳນວນແຂກເຂົ້າມາໃນ Session ທີ່ກຳລັງດຳເນີນຢູ່ ພ້ອມບັນທຶກ Timestamp ທີ່ເພີ່ມ ແລະ ອັບເດດລາຄາລວມຂອງບິນ.',
    headers: { 'Authorization': 'Bearer <jwt_token>' },
    sampleRequest: {
      guests: [
        { type: 'FULL', count: 2, note: 'ມາເພີ່ມຕອນ 00:30' }
      ],
      addExtraChairs: 2
    },
    sampleResponse: {
      success: true,
      sessionId: 'SESS-101',
      addedGuestsCount: 2,
      updatedTotalGuests: 7,
      totalChairs: 6,
      newSubtotalLAK: 1204500
    },
    wsEvents: ['session.guests_updated', 'billing.recalculated']
  },
  {
    method: 'POST',
    path: '/api/v1/sessions/merge-bills',
    category: 'Billing & LAO QR',
    summaryLao: 'ລວມບິນຫຼາຍໂຕະເປັນ 1 ບິນດຽວ (Merge Tables / Combine Bills)',
    summaryEn: 'Merge multiple table sessions into a single master bill',
    descriptionLao: 'ລວມລາຍການອາຫານ, ຈຳນວນແຂກ ແລະ ອໍເດີຂອງຫຼາຍໂຕະເຂົ້າໃນ Master Session ເພື່ອຊຳລະເງິນຄັ້ງດຽວ.',
    headers: { 'Authorization': 'Bearer <jwt_token>' },
    sampleRequest: {
      masterTableCode: 'A-01',
      slaveTableCodes: ['A-02', 'A-03'],
      reason: 'ລູກຄ້າມາກຸ່ມດຽວກັນ ຂໍຮວມໂຕະຈ່າຍເງິນ'
    },
    sampleResponse: {
      success: true,
      masterSessionId: 'SESS-101',
      mergedTables: ['A-01', 'A-02', 'A-03'],
      totalGuests: 12,
      mergedSubtotalLAK: 2450000,
      status: 'MERGED_ACTIVE'
    },
    wsEvents: ['session.merged', 'table.status_changed']
  },
  {
    method: 'GET',
    path: '/api/v1/kds/tickets',
    category: 'KDS Kitchen',
    summaryLao: 'ດຶງລາຍການອໍເດີໃນຄົວ KDS ພ້ອມກວດສອບອໍເດີຊັກຊ້າ',
    summaryEn: 'Get real-time kitchen order tickets with delayed SLA triggers',
    descriptionLao: 'ສົ່ງຄືນອໍເດີຕາມສະຖານະ (PENDING, COOKING, READY, SERVED) ພ້ອມຄິດໄລ່ເວລາທີ່ລໍຖ້າ. ຖ້າເກີນ 10 ນາທີ ຈະສົ່ງສັນຍານ DELAYED CARE ALERT ໄປຫາພະນັກງານ.',
    headers: { 'Authorization': 'Bearer <jwt_token>', 'X-Branch-ID': 'BR-VTE-01' },
    sampleResponse: {
      success: true,
      pendingCount: 4,
      cookingCount: 6,
      delayedAlertCount: 2,
      tickets: [
        {
          orderId: 'ORD-103-1',
          tableCode: 'A-03',
          elapsedMinutes: 18,
          isDelayed: true,
          status: 'COOKING',
          items: [
            { nameLao: 'ຊີ້ນງົວວາກິວ A5', qty: 4, status: 'COOKING' },
            { nameLao: 'ຊາຊິມິແຊວມອນ', qty: 3, status: 'COOKING' }
          ]
        }
      ]
    },
    wsEvents: ['kds.ticket_created', 'kds.item_status_changed', 'kds.delayed_alert']
  },
  {
    method: 'POST',
    path: '/api/v1/billing/generate-lao-qr',
    category: 'Billing & LAO QR',
    summaryLao: 'ສ້າງ LAO QR / BCEL OnePay / LDB Dynamic QR ສຳລັບຊຳລະເງິນ',
    summaryEn: 'Generate dynamic Lao QR Code with BCEL OnePay payload',
    descriptionLao: 'ກວດສອບ Guardrail (ຫ້າມ Checkout ຖ້າ 0 ແຂກ ຫຼື ບໍ່ມີແພັກເກັດ). ຄິດໄລ່ສ່ວນຫຼຸດ Promo Code, VAT 7%, Service Charge 5% ແລ້ວສ້າງ EMVCo LAO QR ພ້ອມ webhook listener.',
    headers: { 'Authorization': 'Bearer <jwt_token>' },
    sampleRequest: {
      sessionId: 'SESS-101',
      paymentMethod: 'LAO_QR_BCEL',
      promoCode: 'BUFFET10',
      appliedDiscounts: []
    },
    sampleResponse: {
      success: true,
      billNumber: 'INV-20260819-0089',
      subtotalLAK: 985500,
      discountLAK: 98550,
      serviceChargeLAK: 44348,
      vatTaxLAK: 65191,
      netTotalLAK: 996489,
      qrString: '00020101021229370016A0000007270001010113000000000889053034185802LA5910LAO_BUFFET6010VIENTIANE62210817INV-20260819-00896304ABCD',
      bcelDeepLink: 'bcelone://pay?qr=00020101021229370016A000...',
      expiresAt: '2026-08-19T00:35:00Z'
    },
    wsEvents: ['billing.qr_generated', 'payment.completed']
  },
  {
    method: 'POST',
    path: '/api/v1/webhooks/bcel-onepay',
    category: 'Billing & LAO QR',
    summaryLao: 'Webhook ຮັບການແຈ້ງເຕືອນການຈ່າຍເງິນສຳເລັດຈາກ BCEL OnePay / LDB',
    summaryEn: 'Payment Gateway webhook for instant settlement & table clearing',
    descriptionLao: 'ເມື່ອລູກຄ້າສະແກນຈ່າຍເງິນສຳເລັດ, ທະນາຄານຈະຍິງ Webhook ມາຢືນຢັນ transaction_id, ລະບົບຈະປ່ຽນສະຖານະບິນເປັນ PAID ແລະ ປົດລັອກໂຕະເປັນ VACANT ທັນທີ.',
    headers: { 'X-Signature': 'sha256=9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08' },
    sampleRequest: {
      transactionId: 'BCEL-TXN-99882211',
      billNumber: 'INV-20260819-0089',
      amountLAK: 996489,
      currency: 'LAK',
      payerName: 'KHAMPHAY XAYASANE',
      payerAccount: '160-12-00-00123456-001',
      paidAt: '2026-08-19T00:23:45Z',
      status: 'SUCCESS'
    },
    sampleResponse: {
      code: '00',
      message: 'Transaction processed successfully',
      receiptUrl: 'https://api.laobuffet.la/receipts/INV-20260819-0089.pdf'
    }
  }
];

export const POSTGRESQL_DDL_SCRIPT = `-- ============================================================================
-- LAO BUFFET CLOUD POS - ENTERPRISE DATABASE SCHEMA (PostgreSQL 15+)
-- Schema: laobuffet_db
-- Description: Production-grade schema with UUIDs, Foreign Keys, Indexes,
-- Check Constraints, Timestamp Triggers, and Lao Multi-Branch Support.
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Set timezone to Asia/Vientiane (UTC+7)
SET timezone = 'Asia/Vientiane';

-- ----------------------------------------------------------------------------
-- 1. TABLE: branches (ຂໍ້ມູນສາຂາທັງໝົດ)
-- ----------------------------------------------------------------------------
CREATE TABLE branches (
    id VARCHAR(32) PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name_lao VARCHAR(255) NOT NULL,
    name_en VARCHAR(255) NOT NULL,
    address_lao TEXT,
    address_en TEXT,
    phone VARCHAR(30),
    manager_name VARCHAR(150),
    currency VARCHAR(10) DEFAULT 'LAK',
    vat_rate NUMERIC(5,4) DEFAULT 0.0700,         -- 7% VAT in Laos
    service_charge_rate NUMERIC(5,4) DEFAULT 0.0500, -- 5% Service Charge
    pricing_override_multiplier NUMERIC(4,2) DEFAULT 1.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 2. TABLE: users (ລະບົບຜູ້ໃຊ້, ພະນັກງານ ແລະ ບົດບາດ RBAC)
-- ----------------------------------------------------------------------------
CREATE TYPE user_role_enum AS ENUM (
    'SUPER_ADMIN', 
    'BRANCH_MANAGER', 
    'CASHIER', 
    'KITCHEN_CHEF', 
    'SERVICE_WAITER'
);

CREATE TABLE users (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    branch_id VARCHAR(32) REFERENCES branches(id) ON DELETE SET NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(120) UNIQUE,
    phone VARCHAR(30) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    role user_role_enum NOT NULL DEFAULT 'SERVICE_WAITER',
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_phone_lao CHECK (phone ~ '^\\+856[0-9]{8,11}$')
);

-- ----------------------------------------------------------------------------
-- 3. TABLE: table_plans (ແຜນຜັງ ແລະ ໂຕະໃນຮ້ານ)
-- ----------------------------------------------------------------------------
CREATE TYPE table_status_enum AS ENUM (
    'VACANT', 
    'OCCUPIED', 
    'RESERVED', 
    'NEAR_LIMIT', 
    'DELAYED_ALERT'
);

CREATE TABLE table_plans (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    branch_id VARCHAR(32) NOT NULL REFERENCES branches(id) ON DELETE CASCADE,
    code VARCHAR(20) NOT NULL,
    zone VARCHAR(50) NOT NULL DEFAULT 'Indoor Zone A',
    default_capacity INT NOT NULL CHECK (default_capacity > 0),
    extra_chairs INT DEFAULT 0 CHECK (extra_chairs >= 0),
    max_extra_chairs INT DEFAULT 4 CHECK (max_extra_chairs >= 0),
    status table_status_enum NOT NULL DEFAULT 'VACANT',
    current_session_id VARCHAR(36),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_branch_table_code UNIQUE (branch_id, code)
);

-- ----------------------------------------------------------------------------
-- 4. TABLE: buffet_packages (ແພັກເກັດບຸບເຟ່)
-- ----------------------------------------------------------------------------
CREATE TABLE buffet_packages (
    id VARCHAR(20) PRIMARY KEY, -- 'STANDARD', 'PREMIUM', 'VIP'
    name_lao VARCHAR(150) NOT NULL,
    name_en VARCHAR(150) NOT NULL,
    price_lak NUMERIC(12,2) NOT NULL CHECK (price_lak > 0),
    duration_minutes INT NOT NULL CHECK (duration_minutes >= 30),
    description_lao TEXT,
    description_en TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 5. TABLE: table_sessions (Session ການນັ່ງກິນບຸບເຟ່ຂອງໂຕະ)
-- ----------------------------------------------------------------------------
CREATE TYPE session_status_enum AS ENUM ('ACTIVE', 'MERGED', 'COMPLETED', 'CANCELLED');

CREATE TABLE table_sessions (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    branch_id VARCHAR(32) NOT NULL REFERENCES branches(id),
    table_id VARCHAR(36) NOT NULL REFERENCES table_plans(id),
    package_id VARCHAR(20) NOT NULL REFERENCES buffet_packages(id),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    planned_end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    actual_end_time TIMESTAMP WITH TIME ZONE,
    duration_minutes INT NOT NULL,
    status session_status_enum NOT NULL DEFAULT 'ACTIVE',
    master_session_id VARCHAR(36) REFERENCES table_sessions(id),
    session_qr_token VARCHAR(255) UNIQUE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 6. TABLE: session_guests (ລາຍລະອຽດແຂກໃນແຕ່ລະ Session: Full, Half, Free)
-- ----------------------------------------------------------------------------
CREATE TYPE guest_type_enum AS ENUM ('FULL', 'HALF', 'FREE');

CREATE TABLE session_guests (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    session_id VARCHAR(36) NOT NULL REFERENCES table_sessions(id) ON DELETE CASCADE,
    guest_type guest_type_enum NOT NULL DEFAULT 'FULL',
    discount_percent NUMERIC(5,2) NOT NULL DEFAULT 0.00, -- 0%, 50%, 100%
    price_charged_lak NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    is_mid_meal_added BOOLEAN DEFAULT FALSE,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    note VARCHAR(255)
);

-- ----------------------------------------------------------------------------
-- 7. TABLE: menu_items (ລາຍການອາຫານໃນຮ້ານບຸບເຟ່)
-- ----------------------------------------------------------------------------
CREATE TABLE menu_items (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    code VARCHAR(20) UNIQUE NOT NULL,
    name_lao VARCHAR(200) NOT NULL,
    name_en VARCHAR(200) NOT NULL,
    category VARCHAR(50) NOT NULL,
    min_package_tier VARCHAR(20) NOT NULL REFERENCES buffet_packages(id),
    prep_est_minutes INT DEFAULT 5 CHECK (prep_est_minutes >= 0),
    image_url TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 8. TABLE: orders & order_items (ລາຍການອໍເດີເຂົ້າສູ່ KDS)
-- ----------------------------------------------------------------------------
CREATE TYPE order_status_enum AS ENUM ('PENDING', 'COOKING', 'READY', 'SERVED', 'CANCELLED');

CREATE TABLE orders (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    order_number VARCHAR(30) NOT NULL,
    session_id VARCHAR(36) NOT NULL REFERENCES table_sessions(id) ON DELETE CASCADE,
    branch_id VARCHAR(32) NOT NULL REFERENCES branches(id),
    table_code VARCHAR(20) NOT NULL,
    status order_status_enum NOT NULL DEFAULT 'PENDING',
    is_delayed BOOLEAN DEFAULT FALSE,
    delayed_alert_sent BOOLEAN DEFAULT FALSE,
    ordered_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    served_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE order_items (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    order_id VARCHAR(36) NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id VARCHAR(36) NOT NULL REFERENCES menu_items(id),
    quantity INT NOT NULL CHECK (quantity > 0),
    status order_status_enum NOT NULL DEFAULT 'PENDING',
    prep_time_minutes INT DEFAULT 5,
    cooking_started_at TIMESTAMP WITH TIME ZONE,
    ready_at TIMESTAMP WITH TIME ZONE,
    served_at TIMESTAMP WITH TIME ZONE,
    special_note VARCHAR(255)
);

-- ----------------------------------------------------------------------------
-- 9. TABLE: promotions (ໂປຣໂມຊັ່ນ ແລະ ສ່ວນຫຼຸດ)
-- ----------------------------------------------------------------------------
CREATE TYPE promo_discount_type_enum AS ENUM ('PERCENTAGE', 'FIXED');

CREATE TABLE promotions (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    code VARCHAR(50) UNIQUE NOT NULL,
    title_lao VARCHAR(200) NOT NULL,
    title_en VARCHAR(200) NOT NULL,
    discount_type promo_discount_type_enum NOT NULL,
    discount_value NUMERIC(12,2) NOT NULL CHECK (discount_value > 0),
    valid_from DATE NOT NULL,
    valid_to DATE NOT NULL,
    min_spend_lak NUMERIC(12,2) DEFAULT 0,
    max_discount_lak NUMERIC(12,2),
    is_active BOOLEAN DEFAULT TRUE,
    usage_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_valid_dates CHECK (valid_to >= valid_from)
);

-- ----------------------------------------------------------------------------
-- 10. TABLE: bills & payments (ການຄິດໄລ່ເງິນ & LAO QR / BCEL OnePay)
-- ----------------------------------------------------------------------------
CREATE TYPE payment_method_enum AS ENUM ('LAO_QR_BCEL', 'LDB_TRUST', 'CASH', 'CREDIT_CARD');
CREATE TYPE payment_status_enum AS ENUM ('PENDING', 'PAID', 'FAILED', 'REFUNDED');

CREATE TABLE bills (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    bill_number VARCHAR(50) UNIQUE NOT NULL,
    branch_id VARCHAR(32) NOT NULL REFERENCES branches(id),
    session_id VARCHAR(36) NOT NULL REFERENCES table_sessions(id),
    cashier_id VARCHAR(36) REFERENCES users(id),
    subtotal_lak NUMERIC(12,2) NOT NULL CHECK (subtotal_lak >= 0),
    discount_lak NUMERIC(12,2) DEFAULT 0.00 CHECK (discount_lak >= 0),
    promo_code VARCHAR(50),
    service_charge_lak NUMERIC(12,2) DEFAULT 0.00,
    vat_tax_lak NUMERIC(12,2) DEFAULT 0.00,
    net_total_lak NUMERIC(12,2) NOT NULL CHECK (net_total_lak >= 0),
    payment_method payment_method_enum NOT NULL,
    payment_status payment_status_enum NOT NULL DEFAULT 'PENDING',
    lao_qr_string TEXT,
    bcel_ref VARCHAR(100),
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- 11. TABLE: reservations (ການຈອງໂຕະ)
-- ----------------------------------------------------------------------------
CREATE TYPE reservation_status_enum AS ENUM ('CONFIRMED', 'SEATED', 'CANCELLED', 'NO_SHOW');

CREATE TABLE reservations (
    id VARCHAR(36) PRIMARY KEY DEFAULT uuid_generate_v4()::text,
    branch_id VARCHAR(32) NOT NULL REFERENCES branches(id),
    table_id VARCHAR(36) REFERENCES table_plans(id),
    customer_name VARCHAR(150) NOT NULL,
    customer_phone VARCHAR(30) NOT NULL,
    pax INT NOT NULL CHECK (pax > 0),
    package_id VARCHAR(20) REFERENCES buffet_packages(id),
    reservation_date DATE NOT NULL,
    time_slot VARCHAR(10) NOT NULL,
    deposit_amount_lak NUMERIC(12,2) DEFAULT 0.00,
    status reservation_status_enum DEFAULT 'CONFIRMED',
    special_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ----------------------------------------------------------------------------
-- PERFORMANCE INDEXES
-- ----------------------------------------------------------------------------
CREATE INDEX idx_table_plans_branch_status ON table_plans(branch_id, status);
CREATE INDEX idx_sessions_active ON table_sessions(table_id, status) WHERE status = 'ACTIVE';
CREATE INDEX idx_orders_kds_status ON orders(branch_id, status, ordered_at);
CREATE INDEX idx_order_items_status ON order_items(status, cooking_started_at);
CREATE INDEX idx_bills_paid_at ON bills(branch_id, paid_at);
CREATE INDEX idx_promotions_lookup ON promotions(code, is_active, valid_from, valid_to);
`;
