async function loadSharedPartial(selector, path, label) {
  const placeholder = document.querySelector(selector);
  if (!placeholder) return;

  try {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`);
    }

    const markup = await response.text();
    if (!markup.trim()) {
      throw new Error("The shared layout file is empty");
    }

    placeholder.insertAdjacentHTML("beforebegin", markup);
    placeholder.remove();
  } catch (error) {
    console.error(`Unable to load the shared ${label}.`, error);
    const message = document.createElement("p");
    message.className = "partial-error";
    message.setAttribute("role", "status");
    message.textContent =
      `The ${label} could not be loaded. Open the site through a local web server or hosted URL.`;
    placeholder.replaceChildren(message);
  }
}

function initializeNavigation() {
  const menuToggle = document.querySelector(".menu-toggle");
  const navigation = document.querySelector("#primary-navigation");
  if (!menuToggle || !navigation) return;

  const currentPage = window.location.pathname.split("/").pop() || "index.html";
  navigation.querySelectorAll("a[href]").forEach((link) => {
    const linkedPage = new URL(link.href, window.location.href).pathname.split("/").pop();
    if (linkedPage === currentPage) {
      link.setAttribute("aria-current", "page");
    }
  });

  function closeMenu() {
    menuToggle.setAttribute("aria-expanded", "false");
    navigation.classList.remove("is-open");
  }

  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    navigation.classList.toggle("is-open", !isOpen);
  });

  navigation.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && menuToggle.getAttribute("aria-expanded") === "true") {
      closeMenu();
      menuToggle.focus();
    }
  });

  document.addEventListener("click", (event) => {
    if (!navigation.contains(event.target) && !menuToggle.contains(event.target)) {
      closeMenu();
    }
  });
}

async function loadSharedLayout() {
  await Promise.all([
    loadSharedPartial("[data-site-header]", "partials/header.html", "site header"),
    loadSharedPartial("[data-site-footer]", "partials/footer.html", "site footer"),
  ]);
  initializeNavigation();
}

loadSharedLayout();

const shareText = "I'm taking part in KathRUN – Miles for Motor Neuron Disease. Every mile matters. [#HASHTAG]";
const pageUrl = window.location.href;
const shareLinks = {
  whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${pageUrl}`)}`,
  facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`,
  x: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(pageUrl)}`,
};

document.querySelectorAll("[data-share]").forEach((control) => {
  const service = control.dataset.share;
  if (service in shareLinks) control.href = shareLinks[service];
});

const copyButton = document.querySelector(".share-copy");
const copyStatus = document.querySelector(".copy-status");

if (copyButton && copyStatus) {
  copyButton.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      copyStatus.textContent = "Link copied. Share it with your community.";
    } catch (error) {
      copyStatus.textContent = "Copy isn't available in this browser. You can copy the page address from your browser bar.";
    }
  });
}

const revealElements = document.querySelectorAll(
  ".section-heading, .principle-card, .story-copy, .story-photo, .impact-card, " +
  ".movement-grid li, .challenge-details > div, .steps-list li, .solidarity-points p, " +
  ".product-card, .help-card, .share-copy, .gallery-placeholder, .home-next-card, " +
  ".movement-photo-card, .family-photo-grid figure, .wide-photo, .family-story-copy, " +
  ".family-feature-photo, .kath-quote, .movement-about-intro, .movement-purpose-layout > div"
);
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (revealElements.length && "IntersectionObserver" in window && !reduceMotion) {
  document.body.classList.add("motion-ready");
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealElements.forEach((element) => {
    element.classList.add("reveal");
    revealObserver.observe(element);
  });
}
