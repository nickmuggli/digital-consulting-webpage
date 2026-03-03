/**
 * Deploy as a Google Apps Script Web App.
 * 1) Create script at https://script.google.com
 * 2) Paste this file and set your calendar ID.
 * 3) Deploy > New deployment > Web app
 *    Execute as: Me
 *    Who has access: Anyone
 * 4) Copy web app URL and set BOT_CONFIG.bookingWebhookUrl in js/main.js
 */

const CALENDAR_ID = "primary";

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || "{}");
    if (payload.action !== "book_appointment") {
      return jsonResponse({ ok: false, error: "Invalid action." }, 400);
    }

    const name = String(payload.name || "").trim();
    const email = String(payload.email || "").trim();
    const date = String(payload.date || "").trim();
    const time = String(payload.time || "").trim();
    const timezone = String(payload.timezone || Session.getScriptTimeZone());

    if (!name || !email || !date || !time) {
      return jsonResponse({ ok: false, error: "Missing required fields." }, 400);
    }

    const start = new Date(`${date}T${time}:00`);
    const end = new Date(start.getTime() + 30 * 60 * 1000);

    const calendar = CalendarApp.getCalendarById(CALENDAR_ID);
    const event = calendar.createEvent(
      `Discovery Call - ${name}`,
      start,
      end,
      {
        description: `Booked via website chatbot\nName: ${name}\nEmail: ${email}\nTimezone: ${timezone}`,
        guests: email,
        sendInvites: true
      }
    );

    return jsonResponse({
      ok: true,
      eventId: event.getId(),
      eventLink: event.getHtmlLink()
    }, 200);
  } catch (error) {
    return jsonResponse({ ok: false, error: error.message }, 500);
  }
}

function jsonResponse(payload, statusCode) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
