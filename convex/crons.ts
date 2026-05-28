import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

crons.interval(
  "send-appointment-reminders",
  { hours: 1 }, // Check every hour
  internal.appointments.sendReminders
);

export default crons;
