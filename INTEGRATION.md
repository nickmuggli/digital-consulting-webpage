# Website integration status

The public site remains static HTML/CSS/JavaScript on the existing hosting workflow.
No production integration is enabled by this change. Never add private credentials to
`site-config.js`, browser JavaScript, HTML, or the Git repository.

## Booking

`site-config.js` preserves the site's existing Cal.com URL. Replace `bookingUrl` with
an approved HTTPS Cal.com or Calendly scheduling link when needed. UTM parameters and
available click IDs are preserved between pages in tab-scoped storage and appended to
booking links. No contact data is placed in booking URLs. Booking-link clicks are not
reported as completed bookings. Actual booking attribution and CRM linkage require a
verified provider webhook on the server and a shared server-side lead reference.

## Contact and Application

Until `formEndpoint` contains a verified HTTPS receiver, submit buttons stay disabled
and the site explicitly states that nothing is transmitted. Fields are not saved.
Never point the browser directly at an authenticated GoHighLevel API.

Required receiver behavior:

1. Enforce HTTPS, accepted origins, body/field limits, server-side validation, rate
   limits and bot protection. Do not trust client timestamps, consent, or attribution.
2. Accept JSON containing `version`, `idempotencyKey`, `source` (`contact` or
   `application`), `fields`, `submittedAt`, `sourcePage`, `language`, `attribution`,
   `smsConsent` and `smsDisclosureVersion`.
3. Keep the GoHighLevel private integration token and location ID in server secrets.
   Normalize email/phone and upsert a contact in the intended location; do not create
   a new contact on each retry. Persist the idempotency key before processing. Store
   responses in mapped custom fields and record the source, consent disclosure and
   attribution. Use UTC server receipt time as the authoritative timestamp.
4. Trigger only the approved notification/follow-up workflows. Never start SMS from
   a phone field alone. Honor suppression/opt-out records independently of this form.
5. Return HTTP 2xx with `{ "success": true, "submissionId": "server-reference" }`
   only after durable receipt and successful contact processing. Return an error
   status otherwise, without exposing tokens or internal CRM responses.
6. Replaying the same key must return the same result. Handle uncertain client
   timeouts safely. The frontend keeps the same key for retries, prevents double
   clicks, retains fields on errors, and fires success tracking only once.

Needed before production: receiver URL/hosting, approved GHL location and credential,
field mapping, workflow IDs, rate limiting/bot controls, and a successful end-to-end
test against that GHL location. These are pending, not completed CRM integration.

## Analytics

IDs are blank. Optional vendor scripts do not load until analytics is accepted.
Preferences persist and can be reopened in the footer. Prefer one GTM container and
configure GA4, Google Ads and Meta inside it; when GTM is configured, the standalone
loaders are skipped. Alternatively supply the explicit individual IDs/Ads label.
The site emits no field answers, names, emails or phone numbers to analytics.

Events: `dc_application_open`, `dc_cta_click`, `dc_booking_click`, and
`dc_lead_confirmed` (includes `form_source`; only after server confirmation).
Do not configure both these events and generic form listeners as lead conversions.
There is no `booking_complete` event without verified booking-provider confirmation.
Declining analytics does not activate vendor scripts or success events. Withdrawing
an accepted preference reloads the page without loading optional analytics. Vendor
cookie deletion/consent mode settings should be finalized in the approved container.

## SMS and legal

`smsEnabled` stays false and the optional, unchecked checkbox is disabled. Enable it
only after legal sender eligibility, sending number, campaign registration, approved
disclosures, consent evidence storage, HELP support and STOP suppression are tested.
The owner/contact is Nicolas Muggli; the business name is Digital Consulting USA.
Legal structure, mailing address, retention schedule and vendor practices remain
pending. English/Spanish legal pages are drafts for review, not an A2P approval.

## Local verification

`python scripts/preview-test-server.py` serves a loopback-only mock at port 8766,
overriding the config in its HTTP response only. It returns synthetic receipts and
never contacts GHL. `/test-failure/contact/` simulates HTTP failure. Do not use this
server as the production receiver or present its mock receipts as CRM verification.
The ordinary preview on port 8765 continues using the unconfigured production config.
The mock server suppresses input autofill hints in its HTTP responses to keep
password-manager overlays out of synthetic QA. Production autocomplete attributes
remain unchanged.
