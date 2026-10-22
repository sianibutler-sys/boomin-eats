(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var root = document.documentElement;

  /* ---------- Toast ---------- */
  var toastTimer;
  function toast(msg) {
    var t = $("#toast");
    t.hidden = true; void t.offsetWidth;
    t.textContent = msg; t.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.hidden = true; }, 3200);
  }

  /* ---------- The boom (first visit per session) ----------
     1. Her logo's bomb drops in and the fuse burns down, spark riding it
     2. Boom: three-color burst, smoke puffs and stars, the screen shakes
     3. The Boomin Eats logo slams in, then flies up and lands in the header */
  function boom() {
    var el = $("#boom");
    if (!root.classList.contains("boom-on") || !el || !Element.prototype.animate) { root.classList.remove("boom-on"); return; }

    var bomb = $(".boom__bomb", el), fuse = $(".boom__fuse", el), spark = $(".boom__spark", el);
    var burst = $(".boom__burst", el), logo = $(".boom__logo", el), stage = $(".boom__stage", el);
    var head = $("#headLogo");
    var done = false, timers = [], raf;
    var later = function (fn, ms) { timers.push(setTimeout(fn, ms)); };

    function finish() {
      if (done) return; done = true;
      timers.forEach(clearTimeout); cancelAnimationFrame(raf);
      var fade = el.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 380, easing: "ease-out", fill: "forwards" });
      fade.onfinish = function () {
        el.remove(); $$(".puff,.shard").forEach(function (n) { n.remove(); });
        root.classList.remove("boom-on");
        if (head) { head.classList.add("landed"); setTimeout(function () { head.classList.remove("landed"); }, 900); }
      };
    }
    el.addEventListener("click", finish);
    document.addEventListener("keydown", function k(e) { if (!done) { finish(); } document.removeEventListener("keydown", k); });

    /* 1. drop in */
    bomb.animate([
      { transform: "translateY(-70vh) rotate(-25deg)" },
      { transform: "translateY(0) rotate(4deg)", offset: .7 },
      { transform: "translateY(-6%) rotate(-2deg)", offset: .85 },
      { transform: "translateY(0) rotate(0)" }
    ], { duration: 560, easing: "cubic-bezier(.5,0,.5,1)", fill: "both" });

    /* fuse burns from the tip toward the cap; the spark rides the burning end */
    var len = fuse.getTotalLength ? fuse.getTotalLength() : 100;
    var t0 = 0, burnMs = 950, burnFrom = 560;
    function burnStep(ts) {
      if (!t0) t0 = ts;
      var p = Math.min(1, (ts - t0) / burnMs);
      var left = 100 * (1 - p);
      fuse.style.strokeDasharray = left + " 200";
      var pt = fuse.getPointAtLength(len * (1 - p));
      var m = fuse.getScreenCTM(), sr = stage.getBoundingClientRect();
      if (m) {
        spark.style.left = (m.a * pt.x + m.c * pt.y + m.e - sr.left) + "px";
        spark.style.top = (m.b * pt.x + m.d * pt.y + m.f - sr.top) + "px";
      }
      spark.style.opacity = 1;
      if (p < 1) raf = requestAnimationFrame(burnStep);
    }
    later(function () { raf = requestAnimationFrame(burnStep); }, burnFrom);

    /* 2. boom */
    var T = burnFrom + burnMs;
    later(function () {
      bomb.animate([{ transform: "translate(0,0)" }, { transform: "translate(-3px,2px)" }, { transform: "translate(3px,-2px)" }, { transform: "translate(-2px,-1px)" }, { transform: "translate(0,0)" }], { duration: 160, iterations: 1 });
    }, T - 170);

    later(function () {
      spark.style.opacity = 0;
      bomb.animate([{ transform: "scale(1)", opacity: 1 }, { transform: "scale(1.35)", opacity: 0 }], { duration: 140, fill: "forwards" });
      el.animate([{ backgroundColor: "#fff6d8" }, { backgroundColor: getComputedStyle(root).getPropertyValue("--char").trim() || "#2D2A26" }], { duration: 260, easing: "ease-out" });
      burst.animate([
        { transform: "scale(0) rotate(-30deg)", opacity: 1 },
        { transform: "scale(1.12) rotate(6deg)", opacity: 1, offset: .55 },
        { transform: "scale(1) rotate(0deg)", opacity: 1 }
      ], { duration: 520, easing: "cubic-bezier(.2,1.4,.4,1)", fill: "forwards" });
      $$("polygon", burst).forEach(function (p, i) {
        p.animate([{ transform: "rotate(0deg)" }, { transform: "rotate(" + (i % 2 ? -8 : 8) + "deg)" }], { duration: 1400, easing: "ease-out", fill: "forwards" });
        p.style.transformOrigin = "50% 50%"; p.style.transformBox = "fill-box";
      });
      document.body.animate([
        { transform: "translate(0,0)" }, { transform: "translate(-8px,5px)" }, { transform: "translate(7px,-6px)" },
        { transform: "translate(-5px,-3px)" }, { transform: "translate(4px,4px)" }, { transform: "translate(0,0)" }
      ], { duration: 380, easing: "ease-out" });
      debris();
    }, T);

    /* 3. logo slams in */
    later(function () {
      logo.animate([
        { transform: "scale(2.6) rotate(-8deg)", opacity: 0 },
        { transform: "scale(.92) rotate(2deg)", opacity: 1, offset: .6 },
        { transform: "scale(1) rotate(0)", opacity: 1 }
      ], { duration: 420, easing: "cubic-bezier(.3,1.5,.5,1)", fill: "forwards" });
    }, T + 120);

    /* 4. logo flies to the header, the burst folds away, the page shows */
    later(function () {
      var from = logo.getBoundingClientRect();
      var to = head ? head.getBoundingClientRect() : { left: 20, top: 12, width: 80, height: 50 };
      var sx = to.width / from.width;
      var dx = (to.left + to.width / 2) - (from.left + from.width / 2);
      var dy = (to.top + to.height / 2) - (from.top + from.height / 2);
      logo.animate([
        { transform: "translate(0,0) scale(1)" },
        { transform: "translate(" + dx * .4 + "px," + (dy * .55 - 30) + "px) scale(" + (.5 + sx * .5) + ") rotate(-6deg)", offset: .5 },
        { transform: "translate(" + dx + "px," + dy + "px) scale(" + sx + ")" }
      ], { duration: 720, easing: "cubic-bezier(.55,0,.25,1)", fill: "forwards" });
      burst.animate([{ transform: "scale(1)", opacity: 1 }, { transform: "scale(0) rotate(40deg)", opacity: 0 }], { duration: 480, easing: "cubic-bezier(.6,0,.8,.4)", fill: "forwards" });
      el.animate([{ backgroundColor: "rgba(45,42,38,1)" }, { backgroundColor: "rgba(45,42,38,0)" }], { duration: 600, delay: 160, fill: "forwards" });
    }, T + 1250);

    later(finish, T + 1950);

    function debris() {
      var sr = stage.getBoundingClientRect(), cx = sr.left + sr.width / 2, cy = sr.top + sr.height / 2;
      var cols = ["#F7C331", "#EE8A2E", "#F4E7D3"];
      var span = Math.hypot(innerWidth, innerHeight) * .55;
      for (var i = 0; i < 16; i++) {
        var isPuff = i % 2 === 0;
        var n = document.createElement("span");
        n.className = isPuff ? "puff" : "shard";
        var size = isPuff ? 26 + Math.random() * 46 : 14 + Math.random() * 16;
        n.style.width = n.style.height = size + "px";
        n.style.left = (cx - size / 2) + "px"; n.style.top = (cy - size / 2) + "px";
        if (isPuff) n.style.background = "radial-gradient(circle at 35% 35%, " + cols[i % 3] + ", " + cols[(i + 1) % 3] + ")";
        document.body.appendChild(n);
        var a = (i / 16) * Math.PI * 2 + Math.random() * .4, d = span * (.45 + Math.random() * .55);
        n.animate([
          { transform: "translate(0,0) scale(.3) rotate(0deg)", opacity: 1 },
          { transform: "translate(" + Math.cos(a) * d + "px," + Math.sin(a) * d + "px) scale(1) rotate(" + (Math.random() * 240 - 120) + "deg)", opacity: 0 }
        ], { duration: 900 + Math.random() * 500, easing: "cubic-bezier(.1,.7,.3,1)", fill: "forwards" });
      }
    }
  }
  boom();

  /* ---------- Fuse: scroll progress ---------- */
  var fuseBurn = $("#fuseBurn"), fuseBar = $(".fuse"), dock = $(".dock"), heroEl = $("#hero"), bookEl = $("#book");
  function onScroll() {
    var h = document.documentElement.scrollHeight - innerHeight;
    var p = h > 0 ? Math.min(1, scrollY / h) : 0;
    fuseBurn.style.width = (p * 100) + "%";
    fuseBar.classList.toggle("is-lit", p > 0.005 && p < 0.995);
    if (dock) {
      var pastHero = heroEl.getBoundingClientRect().bottom < 0;
      var atBook = bookEl.getBoundingClientRect().top < innerHeight * .6;
      dock.classList.toggle("is-on", pastHero && !atBook);
    }
    burnTimeline();
  }

  /* ---------- Timeline: the fuse burns through six years ---------- */
  var tl = $("#timeline"), tlItems = tl ? $$("li", tl) : [];
  if (tl) { var sp = document.createElement("span"); sp.className = "timeline__spark"; sp.setAttribute("aria-hidden", "true"); tl.appendChild(sp); }
  function burnTimeline() {
    if (!tl) return;
    var r = tl.getBoundingClientRect(), line = innerHeight * .6;
    var p = Math.max(0, Math.min(1, (line - r.top) / r.height));
    if (reduce) p = 1;
    tl.style.setProperty("--burn", p.toFixed(4));
    tlItems.forEach(function (li) { li.classList.toggle("is-lit", li.getBoundingClientRect().top + 10 < line || reduce); });
  }
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);
  onScroll();

  /* ---------- Hero video ---------- */
  var hv = $(".hero__vid"), hp = $(".hero__pause");
  if (hv) {
    if (reduce) { hv.removeAttribute("autoplay"); hv.pause(); hp.setAttribute("aria-pressed", "true"); hp.setAttribute("aria-label", "Play video"); }
    hp.addEventListener("click", function () {
      var paused = hp.getAttribute("aria-pressed") === "true";
      if (paused) { hv.play(); } else { hv.pause(); }
      hp.setAttribute("aria-pressed", String(!paused));
      hp.setAttribute("aria-label", paused ? "Pause video" : "Play video");
    });
  }

  /* ---------- Countdown to the menu drop ---------- */
  var clock = $("#clock");
  if (clock) {
    var target = new Date(clock.dataset.target).getTime();
    var u = { d: $("[data-u=d]", clock), h: $("[data-u=h]", clock), m: $("[data-u=m]", clock), s: $("[data-u=s]", clock) };
    var pad = function (n) { return n < 10 ? "0" + n : "" + n; };
    var tick = function () {
      var ms = target - Date.now();
      if (ms <= 0) {
        clock.innerHTML = "<span><b>Live</b>now</span>";
        clock.classList.add("is-live");
        $("#drop-title").textContent = "The new truck menu just dropped";
        return clearInterval(iv);
      }
      var s = Math.floor(ms / 1000);
      u.d.textContent = Math.floor(s / 86400);
      u.h.textContent = pad(Math.floor(s % 86400 / 3600));
      u.m.textContent = pad(Math.floor(s % 3600 / 60));
      u.s.textContent = pad(s % 60);
    };
    var iv = setInterval(tick, 1000); tick();
  }

  /* ---------- Build a truck plate ---------- */
  var builder = $("#builder");
  if (builder) {
    var lines = $("#ticketLines"), totalEl = $("#ticketTotal"), go = $("#ticketGo"), sideCount = $("#sideCount");
    var lastTotal = 0;
    var money = function (n) { return "$" + n; };

    /* tapping a chosen entrée again clears it */
    $$("input[name=entree]", builder).forEach(function (r) {
      r.addEventListener("click", function () {
        if (r.dataset.was === "1") { r.checked = false; r.dataset.was = "0"; update(); return; }
        $$("input[name=entree]", builder).forEach(function (o) { o.dataset.was = "0"; });
        r.dataset.was = "1";
      });
    });
    builder.addEventListener("change", update);

    function update() {
      var entree = $("input[name=entree]:checked", builder);
      var extra = $("input[value='Extra side']", builder);
      var maxSides = 2 + (extra && extra.checked ? 1 : 0);
      var sides = $$("input[name=side]", builder);
      var picked = sides.filter(function (s) { return s.checked; });
      if (!entree) { sides.forEach(function (s) { s.checked = false; s.disabled = true; }); picked = []; }
      else {
        while (picked.length > maxSides) { picked.pop().checked = false; }
        sides.forEach(function (s) { s.disabled = !s.checked && picked.length >= maxSides; });
      }
      $$("input[name=addon]", builder).forEach(function (a) { a.disabled = !entree; if (!entree) a.checked = false; });
      var left = maxSides - picked.length;
      sideCount.textContent = !entree ? "pick an entrée first" : left > 0 ? "pick " + left + " more" : "all set";

      var html = "", total = 0, text = [];
      if (entree) {
        var ep = +entree.dataset.price; total += ep;
        html += "<li><span>" + entree.value + "</span><span>" + money(ep) + "</span></li>";
        html += "<li class='sub'><span>Yellow rice" + (picked.length ? ", " + picked.map(function (p) { return p.value.toLowerCase(); }).join(", ") : "") + "</span></li>";
        text.push("- " + entree.value + " with yellow rice" + (picked.length ? ", " + picked.map(function (p) { return p.value.toLowerCase(); }).join(" and ") : ""));
        $$("input[name=addon]:checked", builder).forEach(function (a) {
          var ap = +a.dataset.price; total += ap;
          html += "<li class='sub'><span>+ " + a.value + "</span><span>+" + money(ap) + "</span></li>";
          text.push("  + " + a.value);
        });
      }
      var sp = $("input[name=special]:checked", builder);
      if (sp) {
        total += +sp.dataset.price;
        html += "<li><span>" + sp.value + "</span><span>" + money(+sp.dataset.price) + "</span></li>";
        text.push("- " + sp.value);
      }
      lines.innerHTML = html || "<li class='ticket__empty'>Pick an entrée or the special to start.</li>";
      totalEl.textContent = money(total);
      if (total !== lastTotal && !reduce) { totalEl.classList.remove("bump"); void totalEl.offsetWidth; totalEl.classList.add("bump"); }
      lastTotal = total;
      var ready = (entree && picked.length >= 2) || (!!sp && !entree) || (entree && picked.length >= 2 && sp);
      go.disabled = !ready;
      go.dataset.order = "Hey Chef Lo! Preorder for pickup:\n" + text.join("\n") + "\nTotal: " + money(total) + "\nPickup time: ";
    }
    update();

    go.addEventListener("click", function () {
      var order = go.dataset.order;
      var open = function () { window.open("https://ig.me/m/boomineats", "_blank", "noopener"); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(order).then(function () { toast("Order copied. Paste it in the DM with your pickup time."); open(); }, function () { toast("Copy didn’t work. Your order is below the button."); showOrder(order); });
      } else { showOrder(order); open(); }
    });
    function showOrder(order) {
      var hint = $(".ticket__hint");
      hint.textContent = order.replace(/\n/g, " / ");
    }
  }

  /* ---------- Services: book this ---------- */
  var form = $("#inquiry");
  var labels = {
    "Private dining": ["Date", "Guests", "The occasion, dishes you love, allergies, budget"],
    "Catering": ["Event date", "Guest count", "The event, the crowd, platters or plated, allergies, budget"],
    "Meal prep": ["Start date", "Meals per week", "Your goals, what you can’t stand, what you could eat every day"],
    "Food truck or pop-up": ["Event date", "Expected crowd", "The event, location, hours, and whether it’s public or private"]
  };
  function setService(v) {
    var l = labels[v]; if (!l) return;
    $("#dateLabel").textContent = l[0];
    $("#guestLabel").textContent = l[1];
    $("#details").placeholder = l[2];
  }
  if (form) {
    form.addEventListener("change", function (e) { if (e.target.name === "service") setService(e.target.value); });
    $$(".menu__book").forEach(function (a) {
      a.addEventListener("click", function () {
        var r = $("input[name=service][value='" + a.dataset.service + "']", form);
        if (r) { r.checked = true; setService(r.value); }
        setTimeout(function () { var n = $("input[name=name]", form); if (n) n.focus({ preventScroll: true }); }, 600);
      });
    });
  }

  /* ---------- Reels: play while on screen ---------- */
  var ext = (function () { var v = document.createElement("video"); return v.canPlayType && v.canPlayType('video/webm; codecs="vp9"') ? "webm" : "mp4"; })();
  var reels = $$(".reel");
  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var v = $("video", en.target);
        if (en.isIntersecting) {
          if (!v.src) { v.src = "vid/" + en.target.dataset.vid + "." + ext; }
          var pr = v.play(); if (pr && pr.catch) pr.catch(function () {});
        } else { v.pause(); }
      });
    }, { threshold: .55 });
    reels.forEach(function (r) { io.observe(r); });
  }
  $$(".reels__btn").forEach(function (b) {
    b.addEventListener("click", function () {
      var list = $("#reels");
      list.scrollBy({ left: +b.dataset.dir * list.clientWidth * .8, behavior: reduce ? "auto" : "smooth" });
    });
  });

  /* ---------- Viewer: reels and photos ---------- */
  var viewer = $("#viewer"), vMedia = $("#viewerMedia"), vCap = $("#viewerCap");
  function openViewer(node, caption, link) {
    vMedia.innerHTML = ""; vMedia.appendChild(node);
    vCap.innerHTML = "";
    vCap.appendChild(document.createTextNode(caption));
    if (link) { var a = document.createElement("a"); a.href = link; a.target = "_blank"; a.rel = "noopener"; a.textContent = "Watch on Instagram"; vCap.appendChild(a); }
    if (viewer.showModal) viewer.showModal(); else viewer.setAttribute("open", "");
  }
  reels.forEach(function (r) {
    r.addEventListener("click", function () {
      var v = document.createElement("video");
      v.src = "vid/" + r.dataset.vid + "." + ext; v.poster = "vid/" + r.dataset.vid + ".webp";
      v.muted = true; v.loop = true; v.playsInline = true; v.controls = true; v.autoplay = !reduce;
      v.setAttribute("aria-label", r.dataset.title);
      openViewer(v, r.dataset.title, r.dataset.ig);
    });
  });
  $$(".zoom").forEach(function (z) {
    z.addEventListener("click", function () {
      var img = $("img", z), big = document.createElement("img");
      big.src = z.dataset.full; big.alt = img.alt;
      var cap = z.parentNode.querySelector("figcaption");
      openViewer(big, cap ? cap.textContent : img.alt);
    });
  });
  function closeViewer() { if (viewer.close) viewer.close(); else viewer.removeAttribute("open"); }
  $(".viewer__close").addEventListener("click", closeViewer);
  viewer.addEventListener("click", function (e) { if (e.target === viewer) closeViewer(); });
  viewer.addEventListener("close", function () { vMedia.innerHTML = ""; });

  /* ---------- Booking form ---------- */
  if (form) {
    var status = $(".form__status", form), button = $("button[type=submit]", form);
    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      status.classList.remove("is-error");
      var data = Object.fromEntries(new FormData(form));
      if (!data.service) return fail("Pick what you need so I can send the right menu.");
      if (!data.name || !data.email) return fail("Add your name and email so I can reply.");
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return fail("That email looks off. Check it and send again.");

      button.disabled = true; button.textContent = "Sending…";
      try {
        var res = await fetch("/api/inquiry", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
        if (!res.ok) throw new Error("Request failed");
        form.reset(); setService("Private dining");
        status.textContent = "Sent. I’ll reply by email with a menu and a quote.";
        button.textContent = "Sent";
        pop(button);
      } catch (err) {
        button.disabled = false; button.textContent = "Send my request";
        var body = encodeURIComponent("Service: " + data.service + "\nName: " + data.name + "\nPhone: " + (data.phone || "") + "\nDate: " + (data.date || "") + "\nGuests: " + (data.guests || "") + "\nLocation: " + (data.location || "") + "\n\n" + (data.details || ""));
        status.classList.add("is-error");
        status.innerHTML = "The form didn’t go through. <a href=\"mailto:hello@boomineats.com?subject=" + encodeURIComponent("Booking request: " + data.service) + "&body=" + body + "\">Send it by email instead</a>.";
      }
    });
    function fail(msg) { status.classList.add("is-error"); status.textContent = msg; }
  }

  /* a small boom when a request lands */
  function pop(anchor) {
    if (reduce || !Element.prototype.animate) return;
    var NS = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 200 200"); svg.setAttribute("class", "form__burst"); svg.setAttribute("aria-hidden", "true");
    svg.innerHTML = '<polygon points="100,0 113,49 156,13 142,70 200,66 154,101 198,138 141,132 158,190 113,152 100,200 87,152 42,190 59,132 2,138 46,101 0,66 58,70 44,13 87,49"/>';
    anchor.parentNode.appendChild(svg);
    svg.style.left = (anchor.offsetLeft + anchor.offsetWidth / 2 - 80) + "px";
    svg.style.top = (anchor.offsetTop + anchor.offsetHeight / 2 - 80) + "px";
    svg.style.zIndex = "-1";
    svg.animate([{ transform: "scale(0) rotate(-30deg)", opacity: 1 }, { transform: "scale(1.1) rotate(10deg)", opacity: 1, offset: .5 }, { transform: "scale(1.3) rotate(20deg)", opacity: 0 }], { duration: 800, easing: "ease-out" }).onfinish = function () { svg.remove(); };
  }
})();
