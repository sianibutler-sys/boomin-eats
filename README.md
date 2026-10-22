# Boomin Eats

Website for Chef Lo (Lauryn), Boomin Eats: private dining, catering, meal prep and food truck pop-ups across DC, MD and VA.

Built by Siani Creates. Static HTML/CSS/JS on Cloudflare Pages, with one Pages Function for the booking form.

## Files

- `index.html` – the whole site, one page
- `styles.css`, `script.js`
- `images/` – logo and food photos (from @boomineats)
- `functions/api/inquiry.js` – receives the booking form and writes it to Airtable

## Deploy on Cloudflare Pages

1. Pages > Create > Connect to Git > `boomin-eats`, branch `main`
2. Framework preset: None. Build command: blank. Output directory: `/`
3. Settings > Variables and secrets (Production):
   - `AIRTABLE_TOKEN` – Airtable personal access token, scope `data.records:write`, access to the Boomin Eats base
   - `AIRTABLE_BASE` – base ID (`app…`)
   - `AIRTABLE_TABLE` – `Inquiries`
4. Custom domain: `boomineats.com` once it is registered in Lauryn's name

## Airtable table: Inquiries

| Field | Type |
| --- | --- |
| Name | Single line text |
| Email | Email |
| Phone | Phone |
| Service | Single select: Private dining, Catering, Meal prep, Food truck or pop-up |
| Event Date | Date |
| Guests | Number |
| Location | Single line text |
| Details | Long text |
| Status | Single select: New, Quoted, Booked, Passed |

Automation: when a record is created, send an email to Chef Lo with the request.

Until the variables are set, the form falls back to opening an email to hello@boomineats.com with the request filled in.

## Updating the truck menu

Prices and items live in the `#truck` section of `index.html`. The drop banner date is the `data-countdown` value.
