import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "send-appointment-reminders",
  { hours: 1 }, // Check every hour
  internal.appointments.sendReminders
);

crons.interval(
  "send-low-stock-alerts",
  { hours: 24 }, // Check daily
  internal.inventory.sendLowStockAlerts
);
crons.interval(
  "fetch-live-rates",
  { hours: 6 },
  internal.currency.fetchLiveRates
);

crons.interval(
  "cleanup-staff-sessions",
  { hours: 1 },
  internal.staffAuth.cleanupSessions
);

crons.interval(
  "cleanup-expired-reserves",
  { hours: 1 },
  internal.inventory.cleanupExpiredReserves
);
crons.interval("cleanup-old-checkout-sessions", { hours: 1 }, internal.maintenance.cleanupPendingCheckoutSessions);
crons.interval("cleanup-old-rate-limits", { hours: 1 }, internal.maintenance.cleanupRateLimits);
crons.interval("expire-appointment-payments", { minutes: 10 }, internal.appointments.expireAwaitingPayments);
crons.interval("cleanup-sms-records", { hours: 24 }, internal.smsCleanup.cleanupSmsRecords);

export default crons;
