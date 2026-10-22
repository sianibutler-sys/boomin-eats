// Cloudflare Pages Function: POST /api/inquiry
// Writes a booking request to Airtable. Set these in Cloudflare Pages > Settings > Variables:
//   AIRTABLE_TOKEN  (personal access token with data.records:write on the base)
//   AIRTABLE_BASE   (base ID, starts with "app")
//   AIRTABLE_TABLE  (table name or ID, e.g. "Inquiries")
// An Airtable automation on new records sends the email notification to Chef Lo.

export async function onRequestPost({ request, env }) {
  let data;
  try {
    data = await request.json();
  } catch {
    return json({ error: 'Invalid request' }, 400);
  }

  // Honeypot: bots fill hidden fields
  if (data.company_site) return json({ ok: true });

  if (!data.service || !data.name || !data.email) {
    return json({ error: 'Service, name and email are required' }, 400);
  }

  if (!env.AIRTABLE_TOKEN || !env.AIRTABLE_BASE || !env.AIRTABLE_TABLE) {
    return json({ error: 'Form not configured' }, 503);
  }

  const fields = {
    Name: clip(data.name, 120),
    Email: clip(data.email, 160),
    Phone: clip(data.phone, 40),
    Service: clip(data.service, 60),
    Location: clip(data.location, 160),
    Details: clip(data.details, 4000),
    Status: 'New'
  };
  if (data.date) fields['Event Date'] = data.date;
  if (data.guests) fields.Guests = Number(data.guests) || undefined;

  const res = await fetch(
    `https://api.airtable.com/v0/${env.AIRTABLE_BASE}/${encodeURIComponent(env.AIRTABLE_TABLE)}`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.AIRTABLE_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ records: [{ fields }], typecast: true })
    }
  );

  if (!res.ok) return json({ error: 'Could not save request' }, 502);
  return json({ ok: true });
}

function clip(v, n) {
  return typeof v === 'string' ? v.trim().slice(0, n) : '';
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

