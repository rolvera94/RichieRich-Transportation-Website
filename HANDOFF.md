# RichieRich Transportation LLC — Website Handoff Guide

This is a single-page website. Everything lives in `index.html` (text and
layout) and `site.js` (menu, motion, forms) plus an `images/` folder. There's no database, no monthly bill, and nothing to log
into day-to-day. This guide covers the few things you need to know.

---

## ✅ 1. Forms (quotes and job applications)

Both forms are sent through **FormSubmit** (free, unlimited submissions) to
**Richard's Gmail** (the address FormSubmit was activated with). Subject lines tell them apart: **"New Quote
Request"** and **"New Driver Application"**.

**Attachments:** visitors can drag in, or tap to choose, **load photos and
documents** on the quote form and a **résumé** on the job application. The
limit is 10 MB total per submission. Phone photos are shrunk automatically so
they fit.

**What visitors see:** after they press send, the page hops to FormSubmit for a
second and comes right back with a "Got it" message.

**Status: activated.** Both forms use FormSubmit's private code for the inbox
(`formsubmit.co/c03892670506c031e28539ce68d933c4`), so the email address
itself isn't visible in the page code.

**To send forms to a different inbox later:**
1. In `index.html`, put the new email address in both
   `action="https://formsubmit.co/..."` lines.
2. Submit one test on the live site. FormSubmit emails the new inbox an
   **Activate** link (check spam); click it. That first test isn't delivered.
3. FormSubmit gives a new private code for that inbox. Put it in both
   `action` lines in place of the email address.

The email **shown** on the site (contact panel,
`richierichtransportationllc@gmail.com`) is separate. It only controls what
visitors see, not where forms are delivered.

> Tip: The first few emails may land in spam. Mark them "Not spam" so future
> ones go to the inbox.

---

## 🌐 2. The live site (GitHub Pages, free)

Live address: **https://richierichtransportation.com**
(the old `rolvera94.github.io/...` address redirects there automatically).

- **Keep the repository public.** GitHub's free plan only publishes public
  repositories; making it private takes the site offline.
- Changes merged into `main` go live within a minute or two. Merges you click
  yourself on GitHub deploy automatically. If a merge doesn't show up, go to
  **Settings → Pages** and click **Save** to trigger a fresh deploy.

---

## 📇 3. Common edits (all in `index.html`)

Search the file for the current text and type over it:

| To change...          | Search for...                            |
|-----------------------|------------------------------------------|
| Phone number          | `281.468.2201` (3 visible spots + links) |
| Email shown on site   | `richierichtransportationllc@gmail.com`  |
| Availability wording  | `Scheduling Available 7 Days a Week`     |
| USDOT number          | `4024817`                                |
| TXDMV registration    | `009730224C`                             |
| Coverage wording      | `Moving freight across Texas`            |

The copyright year updates itself every year.

---

## 🚚 4. Photos and the fleet

- The site **never lists how many trucks or trailers** we run. It presents a
  modern, growing fleet by capability (48 ft flatbeds, air-ride, tarps,
  chains and binders).
- The **Fleet** section and the **"You call Richard"** section use our **real**
  trucks. Keep those real.
- The other six photo slots use AI images with no logos, lettering or people:
  the top image, the four service cards and the Houston skyline. One is still
  waiting: **"03 Across Texas"** (`service-regional.jpg`) uses an early
  sunset-road image. See **`IMAGE-PROMPTS.md`** for its prompt. Send the new
  image to Claude and it'll be compressed and swapped in.

---

## 🔗 5. The domain: richierichtransportation.com

Bought at **GoDaddy** (renews yearly, about $10–25; keep auto-renew on or the
site goes offline). Hosting stays free on GitHub Pages.

How it's connected (don't change these unless moving hosts):
- **GoDaddy → DNS:** four **A** records for `@` pointing to `185.199.108.153`,
  `185.199.109.153`, `185.199.110.153`, `185.199.111.153`, and a **CNAME**
  for `www` pointing to `rolvera94.github.io`. `www.` redirects to the main
  address.
- **The `CNAME` file** in this repository contains `richierichtransportation.com`.
  It tells GitHub which domain to serve. **Don't delete it.**
- **GitHub → Settings → Pages:** custom domain set, **Enforce HTTPS** checked
  (the padlock).
- The email-related DNS rows at GoDaddy (`_domainkey`, MX) are separate and
  should be left alone.

### If the site shows "too many redirects" or a 404

GoDaddy can replace the four GitHub **A** records with a single **A @ Parked**
record. Accepting a GoDaddy offer to set up a website, forwarding or parking
does this. Fix it in GoDaddy → DNS:
1. **Forwarding** tab: delete any domain forward.
2. **DNS Records**: edit the **Parked** row to `185.199.108.153`, then add
   **A** records for **@** with `185.199.109.153`, `185.199.110.153` and
   `185.199.111.153` (TTL 1 Hour).
3. GitHub → **Settings → Pages** shows "DNS Check in Progress", then "DNS check
   successful" within about an hour. Test in an Incognito window.

### If a company's network blocks the site

Some business networks show "Your connection is not private"
(`NET::ERR_CERT_AUTHORITY_INVALID`) or a block page instead of the site. That's
the company's web filter, not the website. To confirm, click **Not secure →
Certificate is not valid** and read **Issued By**:
- **Let's Encrypt** (R10, R11, E5…) is the real certificate. Anything else, such
  as **NetAlerts** (DNSFilter), FortiGate or Zscaler, is the filter's.
- Fix for that office: their IT allowlists `richierichtransportation.com`.
- Fix for everyone on that filter: ask the filter company to rate the site as
  **Business / Transportation**. Most have a free public form.

Filters often block any domain under about 30 days old, so new-domain blocks
also clear with time.

---

## 🔒 6. Security

**Built into the site**
- No logins, passwords, payments or database on the website, so there is
  nothing on it to break into. It's static files served by GitHub over HTTPS.
- A security policy in `index.html` (the `Content-Security-Policy` line)
  tells browsers to run only this site's own code, load fonts only from
  Google, and send forms only to FormSubmit. If an outside service is added
  later (chat widget, analytics, a map), its address has to be added to that
  line or the browser blocks it.
- The forms never ask for SSNs, license numbers or bank details. Keep it that
  way: those belong in a secure onboarding step, not a website form.
- Attachments are limited to photos, PDFs and Word/Excel files, 10 MB total.
  A determined sender can bypass any website check, so the inbox is the real
  safety net: open attachments only when they match a real quote or
  application, and never click "Enable editing" or "Enable macros" on a Word
  or Excel file from someone you don't know.
- Forms use a hidden spam trap. If spam starts arriving, change
  `_captcha` from `false` to `true` in both forms to add FormSubmit's
  "I'm not a robot" check.

**Accounts (this is where the real risk is)**
Anyone who gets into one of these accounts can change or take down the site.
Turn on **2-step verification** for all of them and use a unique password:
- **GitHub** (`rolvera94`): controls the website's content.
- **GoDaddy**: controls the domain. Also keep **Domain Lock** and
  **auto-renew** on, and keep the GoDaddy account's email and phone current.
- **Gmail** inboxes: Richard's (form submissions) and
  `richierichtransportationllc@gmail.com` (shown on the site).
- **Web3Forms** (old form service, no longer used): delete the form or the
  account. Its key is in this repository's history and could be used to send
  spam to Richard's inbox.

---

## 📁 File overview

```
index.html         ← the website's text, layout, forms and Texas map
site.js            ← menu, scroll motion, attachments, phone formatting
images/            ← logo, truck photos, photo-slot images, browser icons
404.html           ← "page not found" screen for mistyped addresses
IMAGE-PROMPTS.md   ← AI image prompts for each photo slot
robots.txt         ← helps Google find the site
sitemap.xml        ← helps Google index the site
HANDOFF.md         ← this guide
```
