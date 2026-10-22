// Countdown to the next menu drop
(function () {
  const el = document.querySelector('[data-countdown]');
  if (!el) return;
  const target = new Date(el.dataset.countdown);
  const days = Math.ceil((target - new Date()) / 86400000);
  if (days > 1) {
    const tag = document.createElement('span');
    tag.className = 'drop__count';
    tag.textContent = days + ' days out';
    el.prepend(tag);
  } else if (days >= 0) {
    const tag = document.createElement('span');
    tag.className = 'drop__count';
    tag.textContent = days === 1 ? 'Tomorrow' : 'Today';
    el.prepend(tag);
  }
})();

// Inquiry form: posts to the Cloudflare Pages Function, which writes to Airtable
(function () {
  const form = document.getElementById('inquiry');
  if (!form) return;
  const status = form.querySelector('.form__status');
  const button = form.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    status.classList.remove('is-error');

    const data = Object.fromEntries(new FormData(form));
    if (!data.service) return fail('Pick what you need so I can send the right menu.');
    if (!data.name || !data.email) return fail('Add your name and email so I can reply.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return fail('That email looks off. Check it and send again.');

    button.disabled = true;
    button.textContent = 'Sending…';

    try {
      const res = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Request failed');
      form.reset();
      status.textContent = 'Sent. I’ll reply by email with a menu and a quote.';
      button.textContent = 'Sent';
    } catch (err) {
      button.disabled = false;
      button.textContent = 'Send my request';
      const body = encodeURIComponent(
        `Service: ${data.service}\nName: ${data.name}\nPhone: ${data.phone || ''}\nDate: ${data.date || ''}\nGuests: ${data.guests || ''}\nLocation: ${data.location || ''}\n\n${data.details || ''}`
      );
      status.classList.add('is-error');
      status.innerHTML = `The form didn’t go through. <a href="mailto:hello@boomineats.com?subject=${encodeURIComponent('Booking request: ' + data.service)}&body=${body}">Send it by email instead</a>.`;
    }
  });

  function fail(msg) {
    status.classList.add('is-error');
    status.textContent = msg;
  }
})();
