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

  /* ---- News: subscribe form ----------------------------------------------- */
  /* Front-end only: shows a success state. Wire to the email service
     (Supabase + Resend on the current production stack) before launch. */
  var subscribeForm = document.getElementById("subscribe-form");
  if (subscribeForm) {
    subscribeForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var input = subscribeForm.querySelector(".subscribe-input");
      if (!input.value || !input.checkValidity()) { input.focus(); return; }
      subscribeForm.innerHTML =
        '<p class="lede" style="text-align:center; width:100%; color: var(--cream-1);">Thank you — you’re on the list.</p>';
    });
  }

  /* ---- Contact form -------------------------------------------------------- */
  /* Front-end only: shows a success state. Wire to the form backend
     (Supabase on the current production stack) before launch. */
  var contactForm = document.getElementById("contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var honeypot = contactForm.querySelector('[name="website"]');
      if (honeypot && honeypot.value) return;
      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }
      contactForm.style.display = "none";
      document.getElementById("form-success").classList.add("visible");
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
