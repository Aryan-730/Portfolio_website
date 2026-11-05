(() => {
  "use strict";

  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];


  const burger = $("#hamburger");
  const menu = $("#mobileMenu");

  function setMenu(open) {
    menu.classList.toggle("open", open);
    burger.classList.toggle("active", open);
    burger.setAttribute("aria-expanded", open);
  }

  burger.addEventListener("click", () => setMenu(!menu.classList.contains("open")));
  $$("a", menu).forEach((a) => a.addEventListener("click", () => setMenu(false)));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });
  window.matchMedia("(min-width: 1024px)").addEventListener("change", (e) => {
    if (e.matches) setMenu(false);               // close the panel if the window grows to desktop
  });


  const themeToggle = $("#themeToggle");

  function syncToggle() {
    themeToggle.setAttribute("aria-pressed", root.dataset.theme === "dark");
  }

  themeToggle.addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch (e) {}
    syncToggle();
  });
  syncToggle();

  $("#year").textContent = new Date().getFullYear();

  const progress = $("#scrollProgress");
  const toTop = $("#toTop");
  let ticking = false;

  function onScroll() {
    const max = root.scrollHeight - window.innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
    toTop.classList.toggle("show", window.scrollY > 400);
    ticking = false;
  }

  window.addEventListener("scroll", () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  toTop.addEventListener("click", () => window.scrollTo({ top: 0 })); // CSS handles the smooth scroll


  const revealEls = $$(".section-title, .panel");

  // Stagger cards that sit side by side in a grid
  $$(".skills-grid, .projects-grid").forEach((grid) => {
    [...grid.children].forEach((card, i) => {
      card.style.setProperty("--d", `${(i % 3) * 90}ms`);
    });
  });

  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach((el) => el.classList.add("in-view"));
  } else {
    const revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          obs.unobserve(entry.target);            // animate once
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -8% 0px" });

    revealEls.forEach((el) => revealObserver.observe(el));
  }


  const navLinks = $$(".nav-links a, .mobile-menu ul a");
  const sections = $$("main section[id]");

  if ("IntersectionObserver" in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = `#${entry.target.id}`;
        navLinks.forEach((a) => {
          const on = a.getAttribute("href") === id;
          a.classList.toggle("active", on);
          if (on) a.setAttribute("aria-current", "true");
          else a.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });      // a thin band across the middle of the screen

    sections.forEach((s) => spy.observe(s));
  }

 
  const typed = $("#typed");
  const words = ["React", "Node.js and Express", "MongoDB", "DSA on LeetCode"];

  if (typed && !reduceMotion) {
    let word = 0;
    let chars = words[0].length;     
    let deleting = true;

    (function tick() {
      const current = words[word];
      chars += deleting ? -1 : 1;
      typed.textContent = current.slice(0, chars);

      let wait = deleting ? 40 : 80;
      if (!deleting && chars === current.length) {        
        wait = 1400;
        deleting = true;
      } else if (deleting && chars === 0) {               
        deleting = false;
        word = (word + 1) % words.length;
        wait = 300;
      }
      setTimeout(tick, wait);
    })();
  }
})();