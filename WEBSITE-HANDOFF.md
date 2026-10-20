# Digital Consulting USA - current refinement handoff

Local refinement snapshot: October 20, 2026. Live site: https://www.digitalconsultingusa.com/ . Repository nickmuggli/digital-consulting-webpage. The last deployed commit is c0937ba2; this refinement is LOCAL ONLY. No commit, push or deployment was performed. Main pushes automatically deploy.

## Implemented in this refinement

- Compared the public Launchpad homepage and supplied zip before editing. Reused the existing static architecture and original branding/SVGs.
- Restored the yellow hero eyebrow and replaced the headline/paragraph with the owner's latest exact wording. Third line stays blue. No extra hero paragraphs or lists.
- Three-column proof bar now shows $500K+, 5s and 3-Step, with one-time viewport-entry count animations. The $500K+ figure is owner-supplied and evidence is pending internally. At the owner's request, extra public notes under the proof captions were removed. The 5s caption still identifies an automated acknowledgment target.
- Home, About and Bathroom copy now makes the offer explicit: leads, human calls/qualification/follow-up, booked estimates; the contractor sells and performs the jobs. Proprietary names remain small secondary labels.
- Shortened problem/benefit cards and qualifications. Positive list: quality work, capacity, marketing budget, attendance at estimates. Negative list: no budget, no capacity, cannot attend. Removed the demand that contractors personally follow up with new leads.
- Made the 30-mile policy conditional on availability and written area/terms confirmation. Kept the proposed $100/five-introduction concept on Bathroom with consent, approval, written eligibility/payment/limits, rules-review and inactive-program conditions.
- Added required service_radius in whole miles (1-500) and start_timeframe to the existing three-step application. Existing CRM field names retained. Contact form remains visible immediately.
- Simplified form feedback; errors never imply receipt. A confirmed receipt reveals booking CTA, which now prefills name/email on the existing Cal.com link. Other booking links contain no prefill; no PII goes to analytics or storage. Privacy disclosure updated.
- Unified footer promise across eight pages and contact.html fallback. Added Spanish equivalents for revised text. Legal wording simplified without inventing identity/address/registration status or enabling SMS.
- Existing galaxy script.js, particle configuration, entrance burst and drift were not edited. Dark/light, language controls, SVGs, process animations, scroll progress, responsive grids and Cal.com destination preserved. Only small spacing/alignment refinements were needed.

## External setup still required

- formEndpoint remains blank. Production Contact/Application send buttons read Online Sending Unavailable and are disabled. Old disconnected banner remains removed. Nothing is sent to a real CRM. A local mock receiver is only for synthetic QA.
- Need approved HTTPS receiver hosting, GHL location and server-side credential, contact/custom-field mappings, opportunity pipeline/stage, agency notifications and confirmation workflows. No credential goes in browser code.
- Receiver must durably store/upsert and dedupe contacts/opportunities, keep attribution/consent evidence, and return success plus submissionId only on actual receipt. See INTEGRATION.md.
- Confirmed booking attribution requires signed Cal.com webhooks, dedupe, contact matching and opportunity updates. Prefill/link click is not booking confirmation. Provider webhook credentials and approved metadata contract remain pending.
- GTM, GA4, Meta Pixel and Google Ads identifiers/label remain blank. Consent/deduplication loaders are preserved; no real tracking activation is claimed.
- SMS remains false/unchecked/disabled pending registration and operational testing. Business legal structure, mailing address, sender eligibility, retention schedule and vendor practices are unverified. Nicolas Muggli is supplied owner/contact; no legal structure is inferred. Legal pages remain drafts requiring final review.
- Owner must substantiate $500K+ before treating it as a proven result. Do not borrow Launchpad client claims. Review service fulfillment, the 5s target and written territory/referral conditions.
- Existing external Sara voice widget remains; operational/vendor review still pending. Legacy routes and old package metadata remain outside this refinement scope.

## Files and architecture

Pages: index.html, about/index.html, bathroom-remodeling/index.html, contact/index.html (+ contact.html), apply/index.html, privacy-policy/index.html, terms-and-conditions/index.html, sms-consent/index.html.
Styles: styles.css (legacy foundation), contractor.css, experience.css. Behavior: script.js (original galaxy and base UI), contractor.js (nav/reveals/counters), site-experience.js (theme/language/forms/consent/booking), translations-es.js, site-config.js. No framework added.

Public contact: Nicolas Muggli; team@digitalconsultingusa.com; +1 (612) 398-5577. Cal.com: https://cal.com/bookings-appointments-ooxy15/15min . Geography retained: Minnesota, Texas, Florida.

## Exact current English page copy

Extracted from main content, including later form steps, static fallback button text, and hidden post-submit booking text. Animated figures are listed at their final values. Navigation/footer repetition is excluded. Dynamic messages and QA results follow the copy.

## index.html

DONE-FOR-YOU GROWTH FOR CONTRACTORS

More Leads. Higher Close Rates. Zero Lead-Chasing.

We generate the leads, call and qualify homeowners, and book estimates directly on your calendar. You show up, sell the job, and get back to running your business.

Apply to Work With Us

See How It Works

$500K+ Client Revenue Generated

5s Automated Lead Acknowledgment Target

3-Step Ads → Human Follow-Up → Booked Estimates

THE PROBLEM

Good Jobs Slip Away.

Built for established bathroom remodelers and roofers. More leads only help when someone answers and books the estimate.

Your ads bring in price shoppers.

Too many people want the cheapest quote. You need homeowners who value good work.

Nobody calls the new lead.

You’re busy on a job. The homeowner books with someone who answers first.

Follow-up gets missed.

One call or text is not always enough. Good leads get lost when nobody checks back.

Old quotes get forgotten.

Some homeowners need more time. Without another call, the quote goes nowhere.

HOW IT WORKS

We Bring the Leads. We Book the Estimates.

You handle the sale and the work. We handle the calls and follow-up.

NEW LEAD BOOKED ESTIMATE NEXT JOB

01 — ATTRACT

Get Better Leads.

Homeowner Demand Engine™

We run ads that bring in homeowners looking for the work you do.

02 — CONVERT

We Call. We Qualify. We Book.

Speed-to-Estimate System™

We call your leads, ask the right questions, follow up, and book estimates on your calendar.

You show up, sell the job, and do the work.

03 — MULTIPLY

Turn One Job Into More.

Neighborhood Referral Flywheel™

We help you get referrals and reach about 25 nearby homes after a finished project.

WHY WE'RE DIFFERENT

More Than Ads.

Real Follow-Up.

We call, qualify, and follow up with homeowners. Your team gets estimates to attend.

You focus on selling and doing good work.

One Contractor Per Trade. Per 30-Mile Radius.

We work with one contractor per trade in a 30-mile radius. We check availability and confirm your area in writing before work starts.

See What Makes Us Different →

BEFORE YOU APPLY

Is Your Company a Good Fit?

This is for established contractors who:

Do quality work.

Have room for more jobs.

Can invest in marketing.

Can attend booked estimates.

We're probably not the right fit if:

You have no marketing budget.

You can't handle additional jobs.

You can't attend scheduled estimates.

Check Your Territory

WHAT CHANGES

Less Chasing. More Selling.

Spend your time with homeowners who are ready for an estimate.

Better Leads

Homeowners looking for your kind of work.

More Booked Estimates

We make the calls and book the visit.

Clear Results

See your leads, estimates, and ad spend.

Fewer Missed Leads

We keep in touch when a homeowner needs more time.

More Referrals

Help happy customers send more work your way.

LET'S BUILD WHAT'S NEXT

Ready to Get More Jobs?

One contractor per trade, within 30 miles. Apply to check availability; your area and terms are confirmed in writing before work starts.

Apply to Work With Us

Book a Strategy Call

## about/index.html

ABOUT DIGITAL CONSULTING USA

We Bring the Leads.

We Make the Calls.

We help established bathroom remodelers and roofers get leads and booked estimates. Your team handles the sale and the work.

WHY IT MATTERS

Busy on a Job?

We Answer the Leads.

A lead comes in while you’re working. We call so you don’t have to stop the job.

We ask what the homeowner needs and book the estimate. We follow up when they need more time.

You attend the estimate and close the job.

HOW WE DO IT

Three Steps. One Clear Goal.

01 — ATTRACT

Get Better Leads.

Homeowner Demand Engine™

We run ads that bring in homeowners looking for the work you do.

02 — CONVERT

We Call. We Qualify. We Book.

Speed-to-Estimate System™

We call your leads, ask the right questions, follow up, and book estimates on your calendar.

You show up, sell the job, and do the work.

03 — MULTIPLY

Turn One Job Into More.

Neighborhood Referral Flywheel™

We help you get referrals and reach about 25 nearby homes after a finished project.

BEFORE YOU APPLY

Is Your Company a Good Fit?

This is for established contractors who:

Do quality work.

Have room for more jobs.

Can invest in marketing.

Can attend booked estimates.

We're probably not the right fit if:

You have no marketing budget.

You can't handle additional jobs.

You can't attend scheduled estimates.

Check Your Territory

LET'S BUILD WHAT'S NEXT

Ready to Get More Jobs?

One contractor per trade, within 30 miles. Apply to check availability; your area and terms are confirmed in writing before work starts.

Apply to Work With Us

Book a Strategy Call

## bathroom-remodeling/index.html

BATHROOM REMODELING PIPELINE SYSTEM™

More Bathroom Jobs.

Less Chasing Leads.

We bring in bathroom leads, call homeowners, and book estimates. You visit the home, sell the job, and do the work.

BUILT AROUND YOUR SPECIALTY

Bring Them In. Get Them Booked.

01 — ATTRACT

Get Better Bathroom Leads.

Ads for the work you want: full remodels, walk-in showers, and tub-to-shower conversions.

02 — CONVERT

We Call. We Qualify. We Book.

We ask about the home, the project, and the timing. Then we book the estimate and follow up.

03 — MULTIPLY

Turn One Job Into More.

With your approval, we reach about 25 nearby homes after a finished job. Neighbors see your work and know how to call.

PERMISSION-BASED REFERRALS

Good Work Travels.

Give It a Clear Path.

A proposed program gives a customer $100 for five introductions. Each person must agree before their contact details are shared.

The program needs your approval and a rules review before use. Written terms must explain who qualifies, when rewards are paid, and any limits; no reward program is active on this site.

An introduction does not give permission to send marketing texts.

LET'S BUILD WHAT'S NEXT

Ready for More Bathroom Jobs?

One contractor per trade, within 30 miles. Apply to check availability; your area and terms are confirmed in writing before work starts.

Apply to Work With Us

Book a Strategy Call

## contact/index.html

LET’S TALK GROWTH

Want More Jobs?

Let’s Talk.

Tell us about your business below. To reach us now, book a call or use our email or phone.

Nicolas Muggli

Digital Consulting USA

team@digitalconsultingusa.com

+1 (612) 398-5577

Prefer to talk? Book a Strategy Call

Serving Minnesota, Texas & Florida.

START A CONVERSATION

Tell Us About Your Business.

Fields marked * are required.

Full name *

Business name *

Email address *

Phone number *

Contractor specialty *

Select an option

Roofing

Bathroom remodeling

Kitchen remodeling

Home renovations

Other

City and state *

What would you like help with? *

Select an option

More qualified leads

Faster follow-up

More booked estimates

More referrals

A connected system

Additional information (optional)

SMS updates (optional)

I agree to receive text messages from Digital Consulting USA about my inquiry, application, and appointment scheduling, including automated messages. Message frequency varies. Message and data rates may apply. Reply STOP to opt out or HELP for help. Consent is not required to purchase services.

SMS enrollment is pending sender approval and is not active. Mobile opt-in information is not shared with third parties or affiliates for their marketing purposes.

Privacy Policy

· Terms & Conditions

· SMS Consent

Online Sending Unavailable

Your next step: book a call.

Book a Strategy Call

## apply/index.html

TERRITORY APPLICATION

Check If Your Territory

Is Still Available.

We work with one contractor per trade in a 30-mile radius. Apply to check availability; we confirm your area and terms in writing before work starts.

BEFORE YOU APPLY

Good Work.

Room for More Jobs.

You do good work, can invest in marketing, and can attend more estimates. Tell us about your business.

What happens next

We check your territory. Is your territory available? Is there enough local demand for the jobs you want?

We look at your business. The jobs you want, your budget, and room for more work.

We get on a call. We explain the service and answer your questions.

You decide. If it fits, we agree on your area and terms in writing. No pressure.

Or email team@digitalconsultingusa.com

.

1 About Your Business

2 Your Current Business

3 Your Goals

Three short steps. Fields marked * are required.

About Your Business

Full name *

Company name *

Email *

Phone *

Website (optional)

What kind of work do you do? *

Select an option

Roofing

Bathroom remodeling

Kitchen remodeling

Other home improvement

Primary service area *

Service radius in miles *

Your Current Business

How much does your business make each month? *

Select an option

Under $25,000

$25,000–$50,000

$50,000–$100,000

$100,000–$250,000

Over $250,000

How much do you spend on ads each month? *

Select an option

$0

Under $1,000

$1,000–$3,000

$3,000–$5,000

Over $5,000

What is a typical job worth? *

Select an option

Under $5,000

$5,000–$10,000

$10,000–$20,000

$20,000–$50,000

Over $50,000

Your Goals

When would you like to start? *

Select an option

As soon as possible

Within 30 days

Within 1–3 months

Just exploring

What do you want to achieve? *

How many more projects can you take on each month? *

Select an option

1–2 projects

3–5 projects

6–10 projects

11+ projects

What's your biggest challenge right now? (optional)

SMS updates (optional)

I agree to receive text messages from Digital Consulting USA about my inquiry, application, and appointment scheduling, including automated messages. Message frequency varies. Message and data rates may apply. Reply STOP to opt out or HELP for help. Consent is not required to purchase services.

SMS enrollment is pending sender approval and is not active. Mobile opt-in information is not shared with third parties or affiliates for their marketing purposes.

Privacy Policy

· Terms & Conditions

· SMS Consent

Back

Continue

Online Sending Unavailable

Your next step: book a call.

Book a Strategy Call

## privacy-policy/index.html

DIGITAL CONSULTING USA

Privacy Policy

Updated October 20, 2026. Draft pending business and service details.

Draft for review before publication. Legal business structure, registered sender eligibility, and business mailing address are pending confirmation. Digital Consulting USA is the business name supplied for this site; Nicolas Muggli is the owner/contact. No legal entity status or A2P approval is represented.

Who to contact

For privacy questions or requests, contact Nicolas Muggli at Digital Consulting USA: team@digitalconsultingusa.com

or +1 (612) 398-5577

. A business mailing address has not yet been confirmed.

Information we collect

When you contact us or book a call, we may receive your name, company, website, email, phone number, trade, service area, service radius, project value, budget, start timeframe, and goals. Do not submit sensitive personal information or homeowner records. Contact and application details are sent only when a verified submission service is configured. Until then, field values are not sent or saved by this site.

Hosting and external service providers may process technical information such as IP address, browser, device information, requested pages, and access times. Existing legacy site pages may save display preferences or inquiry information locally in your browser. You can clear this through browser settings.

Display and language preferences are stored in your browser. When available, campaign parameters and advertising click IDs may be kept for the current tab to preserve inquiry attribution and booking context. Choosing Essential Only clears that attribution. Optional analytics providers remain inactive until accepted; you can change your choice through Privacy Settings in the footer. Analytics identifiers and final vendor settings remain pending configuration.

How information is used

We use information to respond to inquiries, assess service fit, schedule appointments, provide agreed services, manage business records, secure our systems, and meet applicable obligations. Marketing messages require the appropriate separate permission. We do not infer SMS consent from an inquiry or referral.

Service providers and external links

This site is configured for GitHub Pages hosting, Google Fonts, a Cal.com booking link, a WhatsApp contact link, and an externally hosted Sara voice widget. These services may process data when they load or when you use them under their own policies. After a confirmed form submission, the booking link may include your name and email to fill in the Cal.com form. Using the voice widget may send voice or conversation information to its operator; avoid sharing sensitive information. Vendor processing, any recording practices, and the final vendor inventory require confirmation before publication.

Providers may receive information needed to perform services such as hosting, scheduling, communications, and security. We may also disclose information when legally required or necessary to protect rights and safety. We do not authorize providers to use mobile opt-in information for their own marketing.

SMS privacy

Mobile opt-in information, telephone numbers collected for messaging, and SMS consent records are not shared with third parties or affiliates for their marketing or promotional purposes. This restriction applies notwithstanding any other sharing described here. Necessary messaging service providers may process this information solely to deliver and manage the authorized program.

The proposed messaging program covers application follow-up, scheduling, and related service inquiries. SMS enrollment remains inactive pending sender approval and a verified consent-recording workflow. An approved sender and operational consent record are required before activation.

Retention

We plan to keep inquiry and service information only as long as needed to provide services, meet recordkeeping duties, resolve disputes, and keep consent or opt-out records. Retention periods and deletion steps still need to be confirmed.

Security

No online service can promise complete security. Access controls and connected providers must be checked before online form delivery is enabled.

Your choices and requests

You can decline optional SMS consent, stop using optional external tools, clear browser storage, and contact us to request access, correction, or deletion of your information. We may need to verify your identity and retain records where required. Available rights depend on applicable law. Reply STOP to an active messaging program to opt out; reply HELP or contact us for support.

Children, international processing, and changes

The site is intended for business users and is not directed to children under 13. Service providers may process information in the United States or other countries. We will update this notice when our practices change and ask for new consent when required.

## terms-and-conditions/index.html

DIGITAL CONSULTING USA

Terms & Conditions

Updated October 20, 2026. Draft pending business and service details.

Draft for review before publication. Legal business structure, registered sender eligibility, and business mailing address are pending confirmation. Digital Consulting USA is the business name supplied for this site; Nicolas Muggli is the owner/contact. No legal entity status or A2P approval is represented.

Website use

These draft terms cover use of the Digital Consulting USA website. Use it lawfully; do not disrupt the site, send unlawful material, try to access restricted systems, or give false identity or business details.

Information and services

Website information describes possible services and is not a binding offer. An application or strategy call does not create a client relationship. Scope, pricing, service coverage, performance targets, cancellation, payment, and ownership of client deliverables are established in a separate written agreement.

No guaranteed outcomes

Results depend on market conditions, budget, project margins, sales execution, and operational capacity. We do not guarantee lead volumes, appointment counts, revenue, response times, or exclusive territory unless expressly agreed in writing. Referral and neighborhood campaigns require client approval and review of applicable rules.

Intellectual property and external services

Site content and branding belong to their respective owners. You may use the site to evaluate our services; you may not reproduce or redistribute protected material without permission. External booking, messaging, and voice services have their own terms and availability. We do not control those services.

SMS program terms — pending activation

The proposed Digital Consulting USA program covers application updates, appointment scheduling, and related service inquiries. Legal sender eligibility and sending number are pending verification. SMS enrollment remains inactive pending sender approval and verified operational controls.

SMS consent is optional, separate, and unchecked by default. Consent is not required to purchase services.

Messages may use automated technology. Message frequency varies with your inquiry and appointments. Message and data rates may apply.

Reply STOP to opt out. After an active program processes your request, only an opt-out confirmation may be sent; no further program messages will be sent unless you consent again.

Reply HELP for help, or email team@digitalconsultingusa.com

or call +1 (612) 398-5577

.

Delivery depends on carrier and network availability. Carriers are not liable for delayed or undelivered messages.

Only provide a number you control. Tell us if your number changes. Mobile opt-in information is not shared with third parties or affiliates for their marketing purposes.

See our Privacy Policy

and SMS Consent

disclosures. SMS stays off until sender details, consent records, opt-out handling, and support are ready and match the approved program.

Availability and liability

The website is provided as available without a promise of uninterrupted or error-free access. To the extent permitted by applicable law, Digital Consulting USA is not responsible for indirect losses arising from website use or reliance on general website information. These terms do not exclude rights or liabilities that cannot lawfully be excluded.

Privacy, changes, and contact

Our Privacy Policy

explains the draft information practices. Website terms may be updated with a revised date. Questions may be directed to Nicolas Muggli, Digital Consulting USA, at team@digitalconsultingusa.com. Legal structure, business mailing address, and any governing-law clause remain pending verification; none is assumed here.

## sms-consent/index.html

DIGITAL CONSULTING USA

SMS Consent

Updated October 20, 2026. Draft pending business and service details.

Draft for review before publication. Legal business structure, registered sender eligibility, and business mailing address are pending confirmation. Digital Consulting USA is the business name supplied for this site; Nicolas Muggli is the owner/contact. No legal entity status or A2P approval is represented.

What you may receive

The proposed Digital Consulting USA SMS program covers contractor applications, appointments, and related service questions. It is not active; the sender and sending number must be confirmed first.

How consent will be collected

The SMS checkbox is separate, optional, and unchecked. It stays disabled until sender approval and consent recording are ready. Before SMS starts, we must record the phone number, your choice, the disclosure version, the page, and the time of consent; marketing texts require the right permission.

Your choice

Consent is not required to purchase services. Message frequency varies. Message and data rates may apply. Messages may be automated. Reply STOP to an active program to unsubscribe or HELP for assistance. Contact team@digitalconsultingusa.com or +1 (612) 398-5577 for support.

Your information

Mobile opt-in information is not shared with third parties or affiliates for their marketing purposes. Providers may process it only as needed to deliver and manage authorized messages.

Read the Privacy Policy

and Terms & Conditions

. Owner/contact: Nicolas Muggli. Possible sole-proprietor registration remains subject to confirmation; this page is not evidence of A2P approval.
## Dynamic form messages

Disconnected: Online Sending Unavailable (disabled).
Connected: Send your details for review. / Send My Details.
Sending: Sending...
Confirmed: Thanks. We received your details. Book a call below. / Details Received.
Error: We could not confirm your submission. Try again, or call or email us. / Try Again.
Post-receipt CTA: Your next step: book a call. / Book a Strategy Call.

Spanish dictionaries are in translations-es.js. All revised text must retain equally clear translations. Marketing names and brand names remain unchanged.

## QA boundaries

See test-results/redesign/refinement-verification.md for current checks. Synthetic local test receipts are not real CRM integration. No real booking, SMS enrollment, or ad tracking activation is claimed. Test screenshots/reports and scripts/preview-test-server.py remain local and untracked. No production push is authorized for this refinement.


## Latest proof-bar wording override

The owner explicitly requested the Launchpad screenshot captions: Revenue closed for one client in under a year; Average speed-to-lead. A rep contacts every new opt-in; Proven system: Ads -> Rep Contact -> Follow-Up. Added the green LIVE badge and retained $500K+ / 5s / 3-Step. These requested marketing claims supersede the earlier target-caption description above; no revenue evidence or measured response-time evidence was supplied, and no CRM, SMS or response service was activated. The badge is display copy, not an integration status check. Changes remain local and undeployed.
