const cards = [...document.querySelectorAll(".project-card")];
const modal = document.querySelector("#project-modal");
const languageSwitch = document.querySelector(".language-switch");
const languageButtons = document.querySelectorAll("[data-language]");
const languageStorageKey = "portfolio-language";
const translations = [
  ...[...document.querySelectorAll("[data-nb]")].map(element => ({
    element, attribute: null, english: element.textContent, norwegian: element.dataset.nb,
  })),
  ...[...document.querySelectorAll("[data-label-nb]")].map(element => ({
    element, attribute: "aria-label", english: element.getAttribute("aria-label"), norwegian: element.dataset.labelNb,
  })),
  ...[...document.querySelectorAll("[data-alt-nb]")].map(element => ({
    element, attribute: "alt", english: element.alt, norwegian: element.dataset.altNb,
  })),
];
const labels = {
  en: { published: "Published", preview: "Preview of" },
  nb: { published: "Publisert", preview: "Forhåndsvisning av" },
};
let language = "en";
let activeProject = null;
let returnFocus = null;

function projectText(card, field) {
  return language === "nb" ? card.dataset[field + "Nb"] || card.dataset[field] : card.dataset[field];
}

function renderProject(card) {
  const title = card.dataset.modalTitle;
  modal.querySelector("#project-modal-title").textContent = title;
  modal.querySelector("[data-modal-role]").textContent = projectText(card, "role");
  modal.querySelector("[data-modal-description]").textContent = projectText(card, "description");
  const tags = projectText(card, "tags").split("|").filter(Boolean).map(text => {
    const tag = document.createElement("span");
    tag.className = "tag";
    tag.textContent = text;
    return tag;
  });
  modal.querySelector("[data-modal-tags]").replaceChildren(...tags);
  const date = new Intl.DateTimeFormat(language === "nb" ? "nb-NO" : "en-GB", {
    day: "numeric", month: "long", year: "numeric", timeZone: "UTC",
  }).format(new Date(card.dataset.date + "T00:00:00Z"));
  modal.querySelector("[data-modal-date]").textContent = labels[language].published + " " + date;
  modal.querySelector("[data-modal-video]").href = card.querySelector(".video-frame").href;
  const image = modal.querySelector("[data-modal-thumbnail]");
  image.src = card.querySelector(".video-frame img").src;
  image.alt = labels[language].preview + " " + title;
}

function setLanguage(value) {
  language = value === "nb" ? "nb" : "en";
  document.documentElement.lang = language;
  translations.forEach(({ element, attribute, english, norwegian }) => {
    const text = language === "nb" ? norwegian : english;
    if (attribute) element.setAttribute(attribute, text);
    else element.textContent = text;
  });
  languageButtons.forEach(button => {
    button.setAttribute("aria-pressed", String(button.dataset.language === language));
  });
  if (activeProject) renderProject(activeProject);
}

cards.forEach(card => {
  card.addEventListener("click", event => {
    // The image remains a real YouTube link; the title and card open project notes.
    if (event.target.closest("a")) return;
    // Selecting a line of text should not unexpectedly open a dialog.
    if (window.getSelection()?.toString()) return;
    activeProject = card;
    returnFocus = event.target.closest("[data-project-open]") || card.querySelector("[data-project-open]");
    renderProject(card);
    modal.showModal();
    modal.scrollTop = 0;
    document.body.classList.add("modal-open");
    modal.querySelector("[data-modal-close]").focus({ preventScroll: true });
  });
});

modal.querySelector("[data-modal-close]").addEventListener("click", () => modal.close());
modal.addEventListener("keydown", event => {
  if (event.key !== "Tab") return;
  const controls = [...modal.querySelectorAll("button:not([disabled]), a[href]")]
    .filter(element => element.getClientRects().length);
  const first = controls[0];
  const last = controls[controls.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});
modal.addEventListener("click", event => {
  if (event.target !== modal) return;
  const bounds = modal.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right ||
      event.clientY < bounds.top || event.clientY > bounds.bottom) modal.close();
});
modal.addEventListener("close", () => {
  document.body.classList.remove("modal-open");
  activeProject = null;
  returnFocus?.focus({ preventScroll: true });
});

languageButtons.forEach(button => {
  button.addEventListener("click", () => {
    setLanguage(button.dataset.language);
    try { localStorage.setItem(languageStorageKey, language); } catch {}
  });
});

let savedLanguage = "en";
try { savedLanguage = localStorage.getItem(languageStorageKey) || "en"; } catch {}
setLanguage(savedLanguage);
languageSwitch.hidden = false;
document.querySelector("#year").textContent = new Date().getFullYear();

// Content is visible by default, including without JavaScript or reduced-motion support.
if ("IntersectionObserver" in window && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08 });
  document.querySelectorAll(".project-card, .info-row, .about-intro").forEach(element => {
    if (element.getBoundingClientRect().top > window.innerHeight) {
      element.classList.add("reveal");
      observer.observe(element);
    }
  });
}
