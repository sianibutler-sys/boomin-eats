# Boomin Eats

Website for Chef Lo (Lauryn), Boomin Eats: private dining, catering, meal prep and food truck pop-ups across DC, MD and VA.

Built by Siani Creates. Static HTML/CSS/JS on Cloudflare Pages, with one Pages Function for the booking form.

## Files

- `index.html` – the whole site, one page
- `styles.css`, `script.js`
- `images/` – logo and food photos (from @boomineats), WebP
- `vid/` – muted video loops cut from her reels: `hero` (rosemary butter lamb chops) and the `k-*` kitchen clips, each as WebM, MP4 and a poster frame
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

Prices and items live in the `#truck` section of `index.html`. The countdown date is the `data-target` value on `#clock`; when it passes, the banner switches to "just dropped" on its own.

## What moves on the page

- The boom: first visit per session, her logo's bomb drops in, the fuse burns, it blows, and the logo lands in the header. Tap or any key skips it. Visitors with reduced motion turned on never see it.
- The fuse across the top of the page burns as you scroll. The timeline fuse burns through her milestones.
- Build a truck plate: entrée, two sides, add-ons, the special. The ticket totals it, and the button copies the order and opens her Instagram DMs.
- Watch me cook: kitchen clips play only while on screen. Tapping one opens it large with a link to the full reel.
- The service links ("Book a private dinner", etc.) preselect that service in the booking form and adjust its fields.

## Adding a new reel clip

Cut a 4–8 second stretch with no text on screen, strip the audio (her reels use licensed music), and export:

    ffmpeg -ss START -t SECONDS -i reel.mp4 -an -vf "scale=432:768,fps=30" -c:v libx264 -crf 27 -movflags +faststart vid/k-NAME.mp4
    ffmpeg -ss START -t SECONDS -i reel.mp4 -an -vf "scale=432:768,fps=30" -c:v libvpx-vp9 -b:v 0 -crf 40 vid/k-NAME.webm
    ffmpeg -ss START -i reel.mp4 -vf "scale=432:768" -frames:v 1 vid/k-NAME.webp

Then copy one `<li>` in the `#reels` list and change `data-vid`, `data-title` and `data-ig`.

## At launch

`_headers`, `robots.txt` and the `robots` meta tag keep the preview out of Google. Remove all three when boomineats.com goes live.
