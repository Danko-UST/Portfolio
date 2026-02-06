const videoFrames = document.querySelectorAll(".video-frame");
const projectCards = document.querySelectorAll(".project-card");
const modal = document.getElementById("project-modal");
const modalTitle = modal?.querySelector("#project-modal-title");
const modalRole = modal?.querySelector("[data-modal-role]");
const modalDescription = modal?.querySelector("[data-modal-description]");
const modalTags = modal?.querySelector("[data-modal-tags]");
const modalDate = modal?.querySelector("[data-modal-date]");
const modalVideo = modal?.querySelector("[data-modal-video]");
const modalThumbnail = modal?.querySelector("[data-modal-thumbnail]");
const modalCloseTargets = modal?.querySelectorAll("[data-modal-close]") ?? [];

const getYouTubeId = (url) => {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtube.com")) {
      if (parsed.pathname.startsWith("/embed/")) {
        return parsed.pathname.split("/")[2] || null;
      }
      if (parsed.pathname.startsWith("/shorts/")) {
        return parsed.pathname.split("/")[2] || null;
      }
      return parsed.searchParams.get("v");
    }
    if (parsed.hostname === "youtu.be") {
      return parsed.pathname.replace("/", "");
    }
  } catch {
    const match = url.match(/(?:youtu\.be\/|v=|\/embed\/|\/shorts\/)([A-Za-z0-9_-]{6,})/);
    return match ? match[1] : null;
  }
  return null;
};

const openInNewTab = (url) => {
  window.open(url, "_blank", "noopener,noreferrer");
};

const openModal = (card) => {
  if (!modal) {
    return;
  }

  const title = card.dataset.modalTitle || card.querySelector("h3")?.textContent || "";
  const role = card.dataset.role || "";
  const description = card.dataset.description || "";
  const tags = (card.dataset.tags || "")
    .split("|")
    .map((item) => item.trim())
    .filter(Boolean);
  const date = card.dataset.date || "";
  const videoUrl = card.querySelector(".video-frame")?.dataset.video || "";
  const id = getYouTubeId(videoUrl);

  if (modalTitle) {
    modalTitle.textContent = title;
  }

  if (modalRole) {
    modalRole.textContent = role;
  }

  if (modalDescription) {
    modalDescription.textContent = description;
  }

  if (modalTags) {
    modalTags.innerHTML = "";
    tags.forEach((tag) => {
      const chip = document.createElement("span");
      chip.className = "tag";
      chip.textContent = tag;
      modalTags.appendChild(chip);
    });
  }

  if (modalDate) {
    modalDate.textContent = date ? `Publisert ${date}` : "";
  }

  if (modalVideo) {
    modalVideo.href = videoUrl || "#";
  }

  if (modalThumbnail && id) {
    modalThumbnail.src = `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
    modalThumbnail.alt = `Forhåndsvisning av ${title}`;
  }

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
};

const closeModal = () => {
  if (!modal) {
    return;
  }
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
};

videoFrames.forEach((frame) => {
  const videoUrl = frame.dataset.video || "";
  const id = getYouTubeId(videoUrl);
  const button = frame.querySelector(".video-frame__button");

  if (!id || !button) {
    return;
  }

  frame.style.backgroundImage = `url(https://i.ytimg.com/vi/${id}/hqdefault.jpg)`;

  button.addEventListener("click", (event) => {
    event.stopPropagation();
    openInNewTab(videoUrl);
  });
});

projectCards.forEach((card) => {
  const title = card.querySelector("h3")?.textContent?.trim();
  card.setAttribute("role", "button");
  card.setAttribute("tabindex", "0");
  if (title) {
    card.setAttribute("aria-label", `${title} – åpne prosjektinfo`);
  }

  card.addEventListener("click", (event) => {
    if (event.target.closest(".video-frame__button")) {
      return;
    }
    openModal(card);
  });

  card.addEventListener("keydown", (event) => {
    if (event.target.closest(".video-frame__button")) {
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openModal(card);
    }
  });
});

if (modal) {
  modalCloseTargets.forEach((button) => {
    button.addEventListener("click", closeModal);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) {
      closeModal();
    }
  });
}
