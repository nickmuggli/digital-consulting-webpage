# Website integration status

The public site remains static HTML/CSS/JavaScript on the existing hosting workflow.
No production integration is enabled by this change. Never add private credentials to
`site-config.js`, browser JavaScript, HTML, or the Git repository.

## Booking

`site-config.js` preserves the site's existing Cal.com URL. Replace `bookingUrl` with
an approved HTTPS Cal.com or Calendly scheduling link when needed. UTM parameters and
available click IDs are preserved between pages in tab-scoped storage and appended to
booking links. After a confirmed receipt only, the form's booking CTA prefills name
and email on the existing HTTPS Cal.com link. These values remain in page memory,
not browser storage or analytics. Other booking links stay unprefilled. The booking
URL contains these values when clicked; Privacy Policy now discloses that handoff.
Booking-link clicks are not
reported as completed bookings. Actual booking attribution and CRM linkage require a
verified provider webhook on the server and a shared server-side lead reference.

## Contact and Application

Until `formEndpoint` contains a verified HTTPS receiver, submit buttons stay disabled
and read "Online Sending Unavailable". The old large disconnected banner was removed
at the owner's request; it is not shown again. Fields are not saved or transmitted.
The Contact form is visible immediately, with working email, phone and booking links.
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

Application fields now include required `service_radius` (whole miles, 1-500) and
`start_timeframe` (As soon as possible / Within 30 days / Within 1-3 months /
Just exploring). Existing `full_name`, `company`, `email`, `phone`, `website`,
`specialty`, `service_area`, `monthly_revenue`, `ad_budget`, `project_value`,
`growth_goals`, `capacity`, `challenge`, and `sms_consent` names are preserved.
Option values are stable English CRM values even when displayed in Spanish.

The approved receiver must also upsert an opportunity in the intended pipeline/stage,
link it to the contact, save qualification answers and attribution, notify the agency,
and send the approved confirmation. Contact/opportunity deduplication and retryable
notifications must be handled server-side; do not turn an email/SMS failure into a
second contact. No GHL location, token, field IDs, opportunity pipeline/stage, or
workflow/notification settings have been provided. No backend host exists in this
GitHub Pages repository. A verified external receiver is still required; none is
invented or activated by this refinement.

## Confirmed bookings (external setup pending)

Configure a Cal.com webhook on the approved backend. Validate its signature, dedupe
by booking UID, and handle created/cancelled/rescheduled events. Associate the booking
with the GHL contact using verified server-side records (for example normalized
email plus the saved lead reference); update the existing opportunity and notify
the agency. Only provider-confirmed bookings may fire a booking conversion. Define
the provider metadata/lead reference contract and consent propagation before enabling
server-side ads events. The site does not treat a link click or page visit as a booking.

Cal.com supports name/email prefill in booking links:
https://cal.com/embed . Prefill URL formation was tested with synthetic data locally;
no appointment or real CRM record was created.

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
The October 20 plain-language edits keep that pending status visible, retain STOP,
HELP, rates, frequency, optional consent and mobile opt-in sharing restrictions, and
update the privacy inventory for radius/timeframe and Cal.com prefill. They do not
verify business identity or register a sender. Provider references reviewed:
https://www.twilio.com/docs/messaging/compliance/a2p-10dlc/collect-business-info
https://www.twilio.com/en-us/legal/messaging-policy?view=Schedule

## Proof claims and service scope

The $500K+ figure was supplied by the owner and has not been independently verified.
The owner requested removal of the extra public proof-bar notes. Evidence remains
pending internally. The 5s figure is an automated lead
acknowledgment target, not a human calling guarantee or measured current performance.
One contractor per trade / 30-mile-radius coverage is subject to availability and
written area/terms confirmation. Human qualification and estimate booking are the
offer; the contractor closes renovation sales. The $100/five-introduction proposal
stays inactive pending written conditions, client approval and rules review.

No commit, push or deployment is authorized for these refinement changes. The live
site still runs c0937ba2 until a new production push is approved.

## Local verification

`python scripts/preview-test-server.py` serves a loopback-only mock at port 8766,
overriding the config in its HTTP response only. It returns synthetic receipts and
never contacts GHL. `/test-failure/contact/` simulates HTTP failure. Do not use this
server as the production receiver or present its mock receipts as CRM verification.
The ordinary preview on port 8765 continues using the unconfigured production config.
The mock server suppresses input autofill hints in its HTTP responses to keep
password-manager overlays out of synthetic QA. Production autocomplete attributes
remain unchanged.


## Latest proof-bar wording override

The owner explicitly requested the Launchpad screenshot captions: Revenue closed for one client in under a year; Average speed-to-lead. A rep contacts every new opt-in; Proven system: Ads -> Rep Contact -> Follow-Up. Added the green LIVE badge and retained $500K+ / 5s / 3-Step. These requested marketing claims supersede the earlier target-caption description above; no revenue evidence or measured response-time evidence was supplied, and no CRM, SMS or response service was activated. The badge is display copy, not an integration status check. Changes remain local and undeployed.
