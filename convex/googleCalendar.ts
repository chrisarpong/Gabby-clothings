"use node";
import { internalAction, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { v } from "convex/values";
import { google } from "googleapis";

export const createEvent = internalAction({
  args: {
    appointmentId: v.id("appointments"),
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    date: v.string(),
    time: v.optional(v.string()),
    garmentType: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const credentialsStr = process.env.GOOGLE_CALENDAR_CREDENTIALS;
    const calendarId = process.env.GOOGLE_CALENDAR_ID;
    
    if (!credentialsStr || !calendarId) {
      console.warn("Google Calendar integration not configured.");
      return null;
    }

    try {
      const credentials = JSON.parse(credentialsStr);
      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/calendar.events'],
      });

      const calendar = google.calendar({ version: 'v3', auth });

      let startDateTime;
      let endDateTime;

      if (args.time) {
        startDateTime = new Date(`${args.date}T${args.time}:00`);
        endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // 1 hour duration
      } else {
        startDateTime = new Date(`${args.date}T00:00:00`);
        endDateTime = new Date(startDateTime.getTime() + 24 * 60 * 60 * 1000); // All day
      }

      const event = {
        summary: `Fitting: ${args.name} - ${args.garmentType}`,
        description: `Client: ${args.name}\nEmail: ${args.email}\nPhone: ${args.phone}\nGarment: ${args.garmentType}\nNotes: ${args.notes || 'None'}\n\nBooked via Gabby Newluk Storefront.`,
        start: args.time ? {
          dateTime: startDateTime.toISOString(),
          timeZone: 'UTC', 
        } : {
          date: args.date,
        },
        end: args.time ? {
          dateTime: endDateTime.toISOString(),
          timeZone: 'UTC',
        } : {
          date: endDateTime.toISOString().split('T')[0],
        },
      };

      let conferenceData;
      if (args.garmentType === 'consultation') {
        conferenceData = {
          createRequest: {
            requestId: args.appointmentId,
            conferenceSolutionKey: {
              type: 'hangoutsMeet',
            },
          },
        };
      }

      const response = await calendar.events.insert({
        calendarId,
        requestBody: {
          ...event,
          ...(conferenceData ? { conferenceData } : {}),
        },
        conferenceDataVersion: conferenceData ? 1 : 0,
      });

      let meetLink;
      if (response.data.conferenceData?.entryPoints) {
        const videoEntryPoint = response.data.conferenceData.entryPoints.find(
          ep => ep.entryPointType === 'video'
        );
        if (videoEntryPoint) {
          meetLink = videoEntryPoint.uri;
        }
      }

      if (response.data.id) {
        await ctx.runMutation(internal.appointments.saveGoogleEventId, {
          appointmentId: args.appointmentId,
          googleEventId: response.data.id,
          meetLink,
        });
      }

      return response.data.id;
    } catch (e) {
      console.error("Failed to create Google Calendar event:", e);
      return null;
    }
  }
});



export const updateEventStatus = internalAction({
  args: {
    googleEventId: v.string(),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    const credentialsStr = process.env.GOOGLE_CALENDAR_CREDENTIALS;
    const calendarId = process.env.GOOGLE_CALENDAR_ID;
    
    if (!credentialsStr || !calendarId || !args.googleEventId) {
      return;
    }

    try {
      const credentials = JSON.parse(credentialsStr);
      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/calendar.events'],
      });

      const calendar = google.calendar({ version: 'v3', auth });
      
      if (args.status === 'cancelled') {
        const event = await calendar.events.get({ calendarId, eventId: args.googleEventId });
        if (event.data && !event.data.summary?.startsWith('[CANCELLED]')) {
          await calendar.events.patch({
            calendarId,
            eventId: args.googleEventId,
            requestBody: {
              summary: `[CANCELLED] ${event.data.summary}`,
              colorId: '11', // Red
            }
          });
        }
      } else if (args.status === 'confirmed') {
         await calendar.events.patch({
            calendarId,
            eventId: args.googleEventId,
            requestBody: {
              colorId: '10', // Green
            }
          });
      } else if (args.status === 'completed') {
        await calendar.events.patch({
          calendarId,
          eventId: args.googleEventId,
          requestBody: {
            colorId: '8', // Grey
          }
        });
      }
    } catch (e) {
      console.error("Failed to update Google Calendar event:", e);
    }
  }
});

export const updateEventTime = internalAction({
  args: {
    googleEventId: v.string(),
    date: v.string(),
    time: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const credentialsStr = process.env.GOOGLE_CALENDAR_CREDENTIALS;
    const calendarId = process.env.GOOGLE_CALENDAR_ID;
    
    if (!credentialsStr || !calendarId || !args.googleEventId) {
      return;
    }

    try {
      const credentials = JSON.parse(credentialsStr);
      const auth = new google.auth.GoogleAuth({
        credentials,
        scopes: ['https://www.googleapis.com/auth/calendar.events'],
      });

      const calendar = google.calendar({ version: 'v3', auth });
      
      let startDateTime;
      let endDateTime;

      if (args.time) {
        startDateTime = new Date(`${args.date}T${args.time}:00`);
        endDateTime = new Date(startDateTime.getTime() + 60 * 60 * 1000); // 1 hour duration
      } else {
        startDateTime = new Date(`${args.date}T00:00:00`);
        endDateTime = new Date(startDateTime.getTime() + 24 * 60 * 60 * 1000); // All day
      }

      await calendar.events.patch({
        calendarId,
        eventId: args.googleEventId,
        requestBody: {
          start: args.time ? {
            dateTime: startDateTime.toISOString(),
            timeZone: 'UTC', 
          } : {
            date: args.date,
          },
          end: args.time ? {
            dateTime: endDateTime.toISOString(),
            timeZone: 'UTC',
          } : {
            date: endDateTime.toISOString().split('T')[0],
          },
        }
      });
    } catch (e) {
      console.error("Failed to update Google Calendar event time:", e);
    }
  }
});
