import {
  pgTable, uuid, varchar, text, boolean, integer, smallint,
  numeric, timestamp, time, date, unique, index
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

const now = () => sql`NOW()`;

// ============================================================
// BARBEARIAS
// ============================================================
export const barbershops = pgTable('barbershops', {
  id:          uuid('id').primaryKey().default(sql`uuid_generate_v4()`),
  name:        varchar('name', { length: 150 }).notNull(),
  slug:        varchar('slug', { length: 100 }).unique().notNull(),
  phone:       varchar('phone', { length: 30 }),
  email:       varchar('email', { length: 150 }),
  address:     text('address'),
  city:        varchar('city', { length: 100 }),
  state:       varchar('state', { length: 50 }),
  zipCode:     varchar('zip_code', { length: 20 }),
  logoUrl:     text('logo_url'),
  coverUrl:    text('cover_url'),
  description: text('description'),
  timezone:    varchar('timezone', { length: 60 }).default('America/Sao_Paulo'),
  isActive:    boolean('is_active').default(true),
  createdAt:   timestamp('created_at', { withTimezone: true }).default(now()),
  updatedAt:   timestamp('updated_at', { withTimezone: true }).default(now()),
});

// ============================================================
// USUÁRIOS
// ============================================================
export const users = pgTable('users', {
  id:            uuid('id').primaryKey().default(sql`uuid_generate_v4()`),
  barbershopId:  uuid('barbershop_id').references(() => barbershops.id, { onDelete: 'cascade' }),
  name:          varchar('name', { length: 150 }).notNull(),
  email:         varchar('email', { length: 150 }).unique().notNull(),
  passwordHash:  text('password_hash').notNull(),
  phone:         varchar('phone', { length: 30 }),
  avatarUrl:     text('avatar_url'),
  role:          varchar('role', { length: 30 }).default('barber'),
  isActive:      boolean('is_active').default(true),
  lastLoginAt:   timestamp('last_login_at', { withTimezone: true }),
  createdAt:     timestamp('created_at', { withTimezone: true }).default(now()),
  updatedAt:     timestamp('updated_at', { withTimezone: true }).default(now()),
});

// ============================================================
// CONFIG. SISTEMA
// ============================================================
export const systemSettings = pgTable('system_settings', {
  id:                uuid('id').primaryKey().default(sql`uuid_generate_v4()`),
  barbershopId:      uuid('barbershop_id').unique().references(() => barbershops.id, { onDelete: 'cascade' }),
  notifyNewBooking:  boolean('notify_new_booking').default(true),
  notifyCancellation: boolean('notify_cancellation').default(true),
  notifyReminder:    boolean('notify_reminder').default(true),
  reminderHoursBefore: integer('reminder_hours_before').default(24),
  whatsappEnabled:   boolean('whatsapp_enabled').default(false),
  whatsappNumber:    varchar('whatsapp_number', { length: 30 }),
  emailEnabled:      boolean('email_enabled').default(true),
  emailFrom:         varchar('email_from', { length: 150 }),
  primaryColor:      varchar('primary_color', { length: 10 }).default('#6366F1'),
  language:          varchar('language', { length: 10 }).default('pt-BR'),
  createdAt:         timestamp('created_at', { withTimezone: true }).default(now()),
  updatedAt:         timestamp('updated_at', { withTimezone: true }).default(now()),
});

// ============================================================
// CONFIG. AGENDAMENTO
// ============================================================
export const schedulingSettings = pgTable('scheduling_settings', {
  id:                       uuid('id').primaryKey().default(sql`uuid_generate_v4()`),
  barbershopId:             uuid('barbershop_id').unique().references(() => barbershops.id, { onDelete: 'cascade' }),
  bookingWindowDays:        integer('booking_window_days').default(30),
  minAdvanceMinutes:        integer('min_advance_minutes').default(60),
  allowClientCancel:        boolean('allow_client_cancel').default(true),
  cancelLimitHours:         integer('cancel_limit_hours').default(2),
  requireConfirmation:      boolean('require_confirmation').default(false),
  autoConfirmMinutes:       integer('auto_confirm_minutes').default(0),
  slotDurationMinutes:      integer('slot_duration_minutes').default(30),
  breakBetweenMinutes:      integer('break_between_minutes').default(0),
  maxBookingsPerDay:        integer('max_bookings_per_day'),
  maxBookingsPerSlot:       integer('max_bookings_per_slot').default(1),
  onlineBookingEnabled:     boolean('online_booking_enabled').default(true),
  onlineBookingUrlSlug:     varchar('online_booking_url_slug', { length: 100 }),
  requirePaymentOnline:     boolean('require_payment_online').default(false),
  depositPercent:           numeric('deposit_percent', { precision: 5, scale: 2 }).default('0'),
  waitlistEnabled:          boolean('waitlist_enabled').default(false),
  allowReschedule:          boolean('allow_reschedule').default(true),
  rescheduleLimitHours:     integer('reschedule_limit_hours').default(2),
  askClientNotes:           boolean('ask_client_notes').default(true),
  requireClientPhone:       boolean('require_client_phone').default(true),
  createdAt:                timestamp('created_at', { withTimezone: true }).default(now()),
  updatedAt:                timestamp('updated_at', { withTimezone: true }).default(now()),
});

// ============================================================
// HORÁRIOS DE FUNCIONAMENTO
// ============================================================
export const workingHours = pgTable('working_hours', {
  id:           uuid('id').primaryKey().default(sql`uuid_generate_v4()`),
  barbershopId: uuid('barbershop_id').references(() => barbershops.id, { onDelete: 'cascade' }),
  userId:       uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  dayOfWeek:    smallint('day_of_week').notNull(),
  isOpen:       boolean('is_open').default(true),
  openTime:     time('open_time').notNull().default('08:00'),
  closeTime:    time('close_time').notNull().default('18:00'),
  hasBreak:     boolean('has_break').default(false),
  breakStart:   time('break_start'),
  breakEnd:     time('break_end'),
  createdAt:    timestamp('created_at', { withTimezone: true }).default(now()),
});

// ============================================================
// BLOQUEIOS
// ============================================================
export const blockedTimes = pgTable('blocked_times', {
  id:           uuid('id').primaryKey().default(sql`uuid_generate_v4()`),
  barbershopId: uuid('barbershop_id').references(() => barbershops.id, { onDelete: 'cascade' }),
  userId:       uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  title:        varchar('title', { length: 150 }),
  startAt:      timestamp('start_at', { withTimezone: true }).notNull(),
  endAt:        timestamp('end_at', { withTimezone: true }).notNull(),
  allDay:       boolean('all_day').default(false),
  reason:       text('reason'),
  createdAt:    timestamp('created_at', { withTimezone: true }).default(now()),
});

// ============================================================
// CATEGORIAS DE SERVIÇO
// ============================================================
export const serviceCategories = pgTable('service_categories', {
  id:           uuid('id').primaryKey().default(sql`uuid_generate_v4()`),
  barbershopId: uuid('barbershop_id').references(() => barbershops.id, { onDelete: 'cascade' }),
  name:         varchar('name', { length: 100 }).notNull(),
  sortOrder:    integer('sort_order').default(0),
  isActive:     boolean('is_active').default(true),
  createdAt:    timestamp('created_at', { withTimezone: true }).default(now()),
});

// ============================================================
// SERVIÇOS
// ============================================================
export const services = pgTable('services', {
  id:                  uuid('id').primaryKey().default(sql`uuid_generate_v4()`),
  barbershopId:        uuid('barbershop_id').references(() => barbershops.id, { onDelete: 'cascade' }),
  categoryId:          uuid('category_id').references(() => serviceCategories.id, { onDelete: 'set null' }),
  name:                varchar('name', { length: 150 }).notNull(),
  description:         text('description'),
  price:               numeric('price', { precision: 10, scale: 2 }).notNull().default('0'),
  durationMinutes:     integer('duration_minutes').notNull().default(30),
  imageUrl:            text('image_url'),
  isActive:            boolean('is_active').default(true),
  isOnlineAvailable:   boolean('is_online_available').default(true),
  sortOrder:           integer('sort_order').default(0),
  createdAt:           timestamp('created_at', { withTimezone: true }).default(now()),
  updatedAt:           timestamp('updated_at', { withTimezone: true }).default(now()),
});

// ============================================================
// USER x SERVICES
// ============================================================
export const userServices = pgTable('user_services', {
  id:                     uuid('id').primaryKey().default(sql`uuid_generate_v4()`),
  userId:                 uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  serviceId:              uuid('service_id').references(() => services.id, { onDelete: 'cascade' }),
  customPrice:            numeric('custom_price', { precision: 10, scale: 2 }),
  customDurationMinutes:  integer('custom_duration_minutes'),
});

// ============================================================
// CLIENTES
// ============================================================
export const clients = pgTable('clients', {
  id:           uuid('id').primaryKey().default(sql`uuid_generate_v4()`),
  barbershopId: uuid('barbershop_id').references(() => barbershops.id, { onDelete: 'cascade' }),
  name:         varchar('name', { length: 150 }).notNull(),
  phone:        varchar('phone', { length: 30 }),
  email:        varchar('email', { length: 150 }),
  birthDate:    date('birth_date'),
  notes:        text('notes'),
  avatarUrl:    text('avatar_url'),
  isBlocked:    boolean('is_blocked').default(false),
  totalVisits:  integer('total_visits').default(0),
  lastVisitAt:  timestamp('last_visit_at', { withTimezone: true }),
  createdAt:    timestamp('created_at', { withTimezone: true }).default(now()),
  updatedAt:    timestamp('updated_at', { withTimezone: true }).default(now()),
});

// ============================================================
// AGENDAMENTOS
// ============================================================
export const appointments = pgTable('appointments', {
  id:             uuid('id').primaryKey().default(sql`uuid_generate_v4()`),
  barbershopId:   uuid('barbershop_id').references(() => barbershops.id, { onDelete: 'cascade' }),
  clientId:       uuid('client_id').references(() => clients.id, { onDelete: 'set null' }),
  userId:         uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  serviceId:      uuid('service_id').references(() => services.id, { onDelete: 'set null' }),
  startAt:        timestamp('start_at', { withTimezone: true }).notNull(),
  endAt:          timestamp('end_at', { withTimezone: true }).notNull(),
  status:         varchar('status', { length: 30 }).default('pending'),
  price:          numeric('price', { precision: 10, scale: 2 }),
  discount:       numeric('discount', { precision: 10, scale: 2 }).default('0'),
  finalPrice:     numeric('final_price', { precision: 10, scale: 2 }),
  paymentMethod:  varchar('payment_method', { length: 50 }),
  paymentStatus:  varchar('payment_status', { length: 30 }).default('pending'),
  paidAt:         timestamp('paid_at', { withTimezone: true }),
  source:         varchar('source', { length: 30 }).default('manual'),
  clientNotes:    text('client_notes'),
  internalNotes:  text('internal_notes'),
  cancelledAt:    timestamp('cancelled_at', { withTimezone: true }),
  cancelledBy:    varchar('cancelled_by', { length: 30 }),
  cancelReason:   text('cancel_reason'),
  reminderSentAt: timestamp('reminder_sent_at', { withTimezone: true }),
  createdAt:      timestamp('created_at', { withTimezone: true }).default(now()),
  updatedAt:      timestamp('updated_at', { withTimezone: true }).default(now()),
});

// ============================================================
// TRANSAÇÕES FINANCEIRAS
// ============================================================
export const transactions = pgTable('transactions', {
  id:             uuid('id').primaryKey().default(sql`uuid_generate_v4()`),
  barbershopId:   uuid('barbershop_id').references(() => barbershops.id, { onDelete: 'cascade' }),
  appointmentId:  uuid('appointment_id').references(() => appointments.id, { onDelete: 'set null' }),
  userId:         uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  type:           varchar('type', { length: 20 }),
  category:       varchar('category', { length: 100 }),
  description:    text('description'),
  amount:         numeric('amount', { precision: 10, scale: 2 }).notNull(),
  paymentMethod:  varchar('payment_method', { length: 50 }),
  transactionAt:  timestamp('transaction_at', { withTimezone: true }).default(now()),
  createdAt:      timestamp('created_at', { withTimezone: true }).default(now()),
});

// ============================================================
// AVALIAÇÕES
// ============================================================
export const reviews = pgTable('reviews', {
  id:            uuid('id').primaryKey().default(sql`uuid_generate_v4()`),
  barbershopId:  uuid('barbershop_id').references(() => barbershops.id, { onDelete: 'cascade' }),
  appointmentId: uuid('appointment_id').references(() => appointments.id, { onDelete: 'set null' }),
  clientId:      uuid('client_id').references(() => clients.id, { onDelete: 'set null' }),
  userId:        uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  rating:        smallint('rating'),
  comment:       text('comment'),
  isPublic:      boolean('is_public').default(true),
  repliedAt:     timestamp('replied_at', { withTimezone: true }),
  replyText:     text('reply_text'),
  createdAt:     timestamp('created_at', { withTimezone: true }).default(now()),
});

// ============================================================
// SESSIONS
// ============================================================
export const sessions = pgTable('sessions', {
  id:         uuid('id').primaryKey().default(sql`uuid_generate_v4()`),
  userId:     uuid('user_id').references(() => users.id, { onDelete: 'cascade' }),
  token:      text('token').unique().notNull(),
  expiresAt:  timestamp('expires_at', { withTimezone: true }).notNull(),
  ipAddress:  varchar('ip_address', { length: 50 }),
  userAgent:  text('user_agent'),
  createdAt:  timestamp('created_at', { withTimezone: true }).default(now()),
});
