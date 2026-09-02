/* Great Sky AI — interaction choreography */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Scroll reveal ---------------------------------------------------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !prefersReduced) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.05 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("revealed"); });
  }

  /* ---- Header: blur on scroll, hide on scroll-down ----------------------- */
  var header = document.getElementById("site-header");
  var progress = document.getElementById("progress-line");
  var lastY = 0;
  var ticking = false;

  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle("scrolled", y > 24);
    if (y > 500 && y > lastY + 4 && !document.body.classList.contains("menu-open")) {
      header.classList.add("hidden");
    } else if (y < lastY - 4 || y < 500) {
      header.classList.remove("hidden");
    }
    if (progress) {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.transform = "scaleX(" + (max > 0 ? Math.min(y / max, 1) : 0) + ")";
    }
    lastY = y;
    ticking = false;
  }

  window.addEventListener("scroll", function () {
    if (!ticking) {
      window.requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });
  onScroll();

  /* ---- Overlay menu ------------------------------------------------------ */
  var toggle = document.getElementById("menu-toggle");
  var overlay = document.getElementById("overlay-menu");

  function setMenu(open) {
    document.body.classList.toggle("menu-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    overlay.setAttribute("aria-hidden", String(!open));
  }

  toggle.addEventListener("click", function () {
    setMenu(!document.body.classList.contains("menu-open"));
  });

  overlay.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () { setMenu(false); });
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && document.body.classList.contains("menu-open")) {
      setMenu(false);
    }
  });

  /* ---- News: category filters ------------------------------------------- */
  var filterBtns = document.querySelectorAll(".filter-btn");
  if (filterBtns.length) {
    var newsCards = document.querySelectorAll(".news-card");
    filterBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        filterBtns.forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        var filter = btn.getAttribute("data-filter");
        newsCards.forEach(function (card) {
          var show = filter === "all" || card.getAttribute("data-category") === filter;
          card.classList.toggle("hidden-card", !show);
        });
      });
    });
  }

  /* ---- News: bordered card deck filters ---------------------------------- */
  var nsv4FilterBtns = document.querySelectorAll(".nsv4-filter-btn");
  if (nsv4FilterBtns.length) {
    var nsv4Cards = document.querySelectorAll(".nsv4-card");
    nsv4FilterBtns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        nsv4FilterBtns.forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        var filter = btn.getAttribute("data-filter");
        nsv4Cards.forEach(function (card) {
          var show = filter === "all" || card.getAttribute("data-category") === filter;
          card.classList.toggle("nsv4-hidden", !show);
        });
      });
    });
  }

  /* ---- Form submission (Formspree) ---------------------------------------
     SETUP: create two forms at formspree.io, then paste their IDs below.
     A Formspree endpoint looks like  https://formspree.io/f/xnqkldwr
     — you only need the last part ("xnqkldwr").
     Note: formspree.io must also stay allowed in the Content-Security-Policy
     "connect-src" directive in vercel.json.                                  */
  var FORMSPREE = {
    contact:   "YOUR_CONTACT_FORM_ID",
    subscribe: "YOUR_SUBSCRIBE_FORM_ID"
  };

  function endpointFor(key) {
    var id = FORMSPREE[key];
    if (!id || id.indexOf("YOUR_") === 0) return null;
    return "https://formspree.io/f/" + id;
  }

  function postForm(url, formData) {
    return fetch(url, {
      method: "POST",
      body: formData,
      headers: { Accept: "application/json" }
    }).then(function (res) {
      if (res.ok) return true;
      return res.json().catch(function () { return {}; }).then(function (data) {
        var msg = (data && data.errors && data.errors.length)
          ? data.errors.map(function (er) { return er.message; }).join(", ")
          : "Something went wrong. Please try again, or email us directly.";
        throw new Error(msg);
      });
    });
  }

  function setBusy(btn, busy, busyLabel, idleLabel) {
    if (!btn) return;
    var label = btn.querySelector("span");
    btn.disabled = busy;
    btn.setAttribute("aria-busy", busy ? "true" : "false");
    if (label) label.textContent = busy ? busyLabel : idleLabel;
  }

  function showError(el, message) {
    if (!el) return;
    el.textContent = message;
    el.classList.add("visible");
  }

  function clearError(el) {
    if (!el) return;
    el.textContent = "";
    el.classList.remove("visible");
  }

  /* ---- News: subscribe form ---------------------------------------------- */
  var subscribeForm = document.getElementById("subscribe-form");
  if (subscribeForm) {
    var subBtn = subscribeForm.querySelector('button[type="submit"]');
    var subError = document.getElementById("subscribe-error");

    subscribeForm.addEventListener("submit", function (e) {
      e.preventDefault();
      clearError(subError);

      var input = subscribeForm.querySelector(".subscribe-input");
      if (!input.value || !input.checkValidity()) { input.focus(); return; }

      var url = endpointFor("subscribe");
      if (!url) {
        showError(subError, "Subscriptions are not connected yet. Please check back soon.");
        return;
      }

      setBusy(subBtn, true, "Sending", "Subscribe");
      postForm(url, new FormData(subscribeForm))
        .then(function () {
          subscribeForm.innerHTML =
            '<p class="lede" style="text-align:center; width:100%; color: var(--cream-1);">' +
            'Thank you — you’re on the list.</p>';
        })
        .catch(function (err) {
          setBusy(subBtn, false, "Sending", "Subscribe");
          showError(subError, err.message);
        });
    });
  }

  /* ---- Contact form ------------------------------------------------------- */
  var contactForm = document.getElementById("contact-form");
  if (contactForm) {
    var contactBtn = contactForm.querySelector('button[type="submit"]');
    var contactError = document.getElementById("form-error");

    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      clearError(contactError);

      var honeypot = contactForm.querySelector('[name="website"]');
      if (honeypot && honeypot.value) return;           /* silently drop bots */

      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }

      var url = endpointFor("contact");
      if (!url) {
        showError(contactError,
          "This form is not connected yet. Please email us directly in the meantime.");
        return;
      }

      setBusy(contactBtn, true, "Sending", "Send Message");
      postForm(url, new FormData(contactForm))
        .then(function () {
          contactForm.style.display = "none";
          document.getElementById("form-success").classList.add("visible");
        })
        .catch(function (err) {
          setBusy(contactBtn, false, "Sending", "Send Message");
          showError(contactError, err.message);
        });
    });
  }

  /* ---- Hardware showcase: tab switching ----------------------------------- */
  var tabs = document.querySelectorAll(".showcase-tab");
  var layouts = document.querySelectorAll(".hw-layout-wrapper");
  if (tabs.length) {
    tabs.forEach(function (tab) {
      tab.addEventListener("click", function () {
        tabs.forEach(function (t) {
          t.classList.remove("active");
          t.setAttribute("aria-selected", "false");
        });
        layouts.forEach(function (l) {
          l.classList.remove("active");
        });
        
        tab.classList.add("active");
        tab.setAttribute("aria-selected", "true");
        var targetId = tab.getAttribute("data-target");
        var targetLayout = document.getElementById(targetId);
        if (targetLayout) {
          targetLayout.classList.add("active");
          
          // Re-trigger scroll reveal for any revealed elements in the newly active layout
          var nestedReveals = targetLayout.querySelectorAll(".reveal");
          nestedReveals.forEach(function (el) {
            el.classList.add("revealed");
          });
        }
      });
    });
  }

})();
