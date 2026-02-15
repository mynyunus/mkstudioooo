const INSTAGRAM_EMBED_SCRIPT = "https://www.instagram.com/embed.js";
let instagramScriptPromise = null;

document.addEventListener("DOMContentLoaded", () => {
  const isLiteMode = initPerformanceMode();
  initHeroVideo(isLiteMode);
  initScrollUI();
  initMobileMenu();
  initRevealObserver(isLiteMode);
  initShowcaseTabs();
  initInstagramFallbacks(isLiteMode);
});

function initPerformanceMode() {
  const lowMemory = Number(navigator.deviceMemory || 8) <= 4;
  const lowCpu = Number(navigator.hardwareConcurrency || 8) <= 4;
  const saveData = navigator.connection?.saveData === true;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isLiteMode = lowMemory || lowCpu || saveData || prefersReducedMotion;

  if (isLiteMode) {
    document.body.classList.add("lite-mode");
  }
  return isLiteMode;
}

function initHeroVideo(isLiteMode) {
  const video = document.getElementById("heroVideo");
  const source = document.getElementById("heroVideoSource");
  if (!video || !source) return;

  const desktopSrc = "assets/mkstudiooo.mp4";
  const mobileSrc = "assets/0216.mp4";
  const mobileQuery = window.matchMedia("(max-width: 767px)");

  const setSource = () => {
    const nextSrc = mobileQuery.matches ? mobileSrc : desktopSrc;
    const currentSrc = source.getAttribute("src");
    if (currentSrc === nextSrc) return;

    source.setAttribute("src", nextSrc);
    video.load();
    if (!isLiteMode) {
      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(() => {});
      }
    }
  };

  if (isLiteMode) {
    video.removeAttribute("autoplay");
  }

  setSource();

  if (typeof mobileQuery.addEventListener === "function") {
    mobileQuery.addEventListener("change", setSource);
  } else if (typeof mobileQuery.addListener === "function") {
    mobileQuery.addListener(setSource);
  }

  if (isLiteMode || !("IntersectionObserver" in window)) return;

  const heroSection = document.getElementById("home");
  if (!heroSection) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const playPromise = video.play();
          if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(() => {});
          }
        } else {
          video.pause();
        }
      });
    },
    { threshold: 0.08 }
  );
  observer.observe(heroSection);
}

function initScrollUI() {
  const header = document.querySelector(".site-header");
  const backToTop = document.getElementById("backToTop");

  if (!header && !backToTop) return;

  const applyState = () => {
    const y = window.scrollY;
    if (header) {
      header.classList.toggle("is-scrolled", y > 18);
    }
    if (backToTop) {
      backToTop.classList.toggle("is-visible", y > 420);
    }
  };

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      applyState();
      ticking = false;
    });
  };

  applyState();
  window.addEventListener("scroll", onScroll, { passive: true });

  if (backToTop) {
    backToTop.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  }
}

function initMobileMenu() {
  const nav = document.querySelector(".nav-pill");
  const toggle = document.querySelector(".menu-toggle");
  const menu = document.querySelector(".mobile-menu");
  if (!nav || !toggle || !menu) return;

  const setMenuState = (isOpen) => {
    toggle.setAttribute("aria-expanded", String(isOpen));
    menu.hidden = !isOpen;
    menu.setAttribute("aria-hidden", String(!isOpen));
  };

  setMenuState(false);

  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    setMenuState(!isOpen);
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setMenuState(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setMenuState(false);
    }
  });

  document.addEventListener("click", (event) => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    if (!isOpen) return;
    if (!nav.contains(event.target)) {
      setMenuState(false);
    }
  });

  const desktopQuery = window.matchMedia("(min-width: 768px)");
  const resetMenuOnDesktop = () => {
    if (desktopQuery.matches) {
      setMenuState(false);
    }
  };
  if (typeof desktopQuery.addEventListener === "function") {
    desktopQuery.addEventListener("change", resetMenuOnDesktop);
  } else if (typeof desktopQuery.addListener === "function") {
    desktopQuery.addListener(resetMenuOnDesktop);
  }
}

function initRevealObserver(isLiteMode) {
  const items = document.querySelectorAll(".reveal");
  if (!items.length) return;

  if (isLiteMode || !("IntersectionObserver" in window)) {
    items.forEach((item) => item.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.16 }
  );

  items.forEach((item) => observer.observe(item));
}

function initShowcaseTabs() {
  const tabList = document.querySelector('[role="tablist"]');
  if (!tabList) return;

  const tabs = Array.from(tabList.querySelectorAll('[role="tab"]'));
  const panels = Array.from(document.querySelectorAll('[role="tabpanel"]'));
  if (!tabs.length || !panels.length) return;

  const activate = (tab, shouldFocus = false) => {
    tabs.forEach((item) => {
      const selected = item === tab;
      item.setAttribute("aria-selected", String(selected));
      item.setAttribute("tabindex", selected ? "0" : "-1");
    });

    panels.forEach((panel) => {
      panel.hidden = panel.id !== tab.getAttribute("aria-controls");
    });

    if (shouldFocus) tab.focus();
    loadInstagramEmbeds();
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => activate(tab));
  });

  tabList.addEventListener("keydown", (event) => {
    const currentIndex = tabs.findIndex((tab) => tab.getAttribute("aria-selected") === "true");
    if (currentIndex < 0) return;

    let nextIndex = null;
    if (event.key === "ArrowRight") nextIndex = (currentIndex + 1) % tabs.length;
    if (event.key === "ArrowLeft") nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    if (event.key === "Home") nextIndex = 0;
    if (event.key === "End") nextIndex = tabs.length - 1;
    if (nextIndex === null) return;

    event.preventDefault();
    activate(tabs[nextIndex], true);
  });
}

function initInstagramFallbacks(isLiteMode) {
  const blocks = Array.from(document.querySelectorAll("[data-embed-block]"));
  if (!blocks.length) return;

  blocks.forEach((block) => {
    const fallback = block.querySelector("[data-fallback-grid]");
    if (fallback) fallback.hidden = false;
  });

  if (isLiteMode) return;

  const showcase = document.getElementById("showcase");
  if (!showcase || !("IntersectionObserver" in window)) {
    loadInstagramEmbeds();
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      loadInstagramEmbeds();
      observer.disconnect();
    },
    { rootMargin: "220px 0px", threshold: 0.01 }
  );
  observer.observe(showcase);
}

function loadInstagramEmbeds() {
  ensureInstagramScript()
    .then(() => {
      if (!window.instgrm?.Embeds?.process) return;
      window.instgrm.Embeds.process();
      window.setTimeout(syncEmbedFallbacks, 1400);
      window.setTimeout(syncEmbedFallbacks, 4500);
    })
    .catch(() => {
      // Fallback grids remain visible by default.
    });
}

function ensureInstagramScript() {
  if (window.instgrm?.Embeds?.process) {
    return Promise.resolve();
  }

  if (instagramScriptPromise) {
    return instagramScriptPromise;
  }

  instagramScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${INSTAGRAM_EMBED_SCRIPT}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Instagram script load failed")), { once: true });
      return;
    }

    const script = document.createElement("script");
    script.src = INSTAGRAM_EMBED_SCRIPT;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Instagram script load failed"));
    document.body.appendChild(script);
  });

  return instagramScriptPromise;
}

function syncEmbedFallbacks() {
  const blocks = Array.from(document.querySelectorAll("[data-embed-block]"));
  blocks.forEach((block) => {
    const fallback = block.querySelector("[data-fallback-grid]");
    if (!fallback) return;
    const rendered =
      Boolean(block.querySelector("iframe")) ||
      Boolean(block.querySelector(".instagram-media-rendered"));
    fallback.hidden = rendered;
  });
}
