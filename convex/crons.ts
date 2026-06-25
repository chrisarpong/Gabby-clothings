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

export default crons;
