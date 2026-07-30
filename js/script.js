"use strict";

document.documentElement.classList.add("js");

/*
 * CONTATOS DO WHATSAPP
 * Para trocar os números no futuro, altere apenas os valores abaixo.
 * Use somente números, com código do país (55) e DDD (92).
 */
const whatsappContacts = {
  sales: {
    label: "Vendas",
    display: "+55 92 9125-4707",
    value: "559291254707"
  },
  support: {
    label: "Suporte",
    display: "+55 92 9425-2524",
    value: "559294252524"
  }
};

const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");
const siteHeader = document.querySelector(".site-header");
const galleryDialog = document.querySelector("#gallery-dialog");
const galleryImage = document.querySelector("#gallery-image");
const galleryCaption = document.querySelector("#gallery-caption");

function closeMenu() {
  if (!menuToggle || !mainNav) return;
  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Abrir menu");
  mainNav.classList.remove("is-open");
  document.body.classList.remove("menu-open");
}

function openMenu() {
  if (!menuToggle || !mainNav) return;
  menuToggle.setAttribute("aria-expanded", "true");
  menuToggle.setAttribute("aria-label", "Fechar menu");
  mainNav.classList.add("is-open");
  document.body.classList.add("menu-open");
}

if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    isOpen ? closeMenu() : openMenu();
  });

  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 1180) closeMenu();
  });
}

function setHeaderState() {
  siteHeader?.classList.toggle("scrolled", window.scrollY > 28);
}

setHeaderState();
window.addEventListener("scroll", setHeaderState, { passive: true });

function buildWhatsappUrl(number, message) {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

function showDialog(dialog) {
  if (!dialog) return;

  if (typeof dialog.showModal === "function") {
    dialog.showModal();
  } else {
    dialog.setAttribute("open", "");
  }
}

function closeDialog(dialog) {
  if (!dialog) return;

  if (typeof dialog.close === "function") {
    dialog.close();
  } else {
    dialog.removeAttribute("open");
  }
}

document.querySelectorAll("[data-whatsapp]").forEach((button) => {
  button.addEventListener("click", () => {
    const contactKey = button.dataset.contact || "sales";
    const contact = whatsappContacts[contactKey] || whatsappContacts.sales;
    const message =
      button.dataset.message ||
      "Olá! Vim pelo site da Amazonas Máquinas e gostaria de mais informações.";

    const link = document.createElement("a");
    link.href = buildWhatsappUrl(contact.value, message);
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", `Abrir conversa com ${contact.label} pelo WhatsApp`);
    link.click();
  });
});

function moveRail(control, direction) {
  const selector = control.dataset.railPrev || control.dataset.railNext;
  const rail = selector ? document.querySelector(selector) : null;
  if (!rail) return;

  const distance = Math.min(rail.clientWidth * 0.82, 430);
  rail.scrollBy({ left: distance * direction, behavior: "smooth" });
}

document.querySelectorAll("[data-rail-prev]").forEach((button) => {
  button.addEventListener("click", () => moveRail(button, -1));
});

document.querySelectorAll("[data-rail-next]").forEach((button) => {
  button.addEventListener("click", () => moveRail(button, 1));
});

document.querySelectorAll("[data-drag-rail]").forEach((rail) => {
  let isDragging = false;
  let startX = 0;
  let startScroll = 0;
  let suppressClick = false;

  rail.addEventListener("pointerdown", (event) => {
    if (event.pointerType !== "mouse" || event.button !== 0) return;
    isDragging = true;
    startX = event.clientX;
    startScroll = rail.scrollLeft;
    suppressClick = false;
    rail.classList.add("is-dragging");
    rail.setPointerCapture(event.pointerId);
  });

  rail.addEventListener("pointermove", (event) => {
    if (!isDragging) return;
    const movement = event.clientX - startX;
    if (Math.abs(movement) > 6) suppressClick = true;
    rail.scrollLeft = startScroll - movement;
    event.preventDefault();
  });

  const finishDrag = (event) => {
    if (!isDragging) return;
    isDragging = false;
    rail.classList.remove("is-dragging");
    if (rail.hasPointerCapture(event.pointerId)) rail.releasePointerCapture(event.pointerId);
    window.setTimeout(() => {
      suppressClick = false;
    }, 80);
  };

  rail.addEventListener("pointerup", finishDrag);
  rail.addEventListener("pointercancel", finishDrag);

  rail.addEventListener(
    "click",
    (event) => {
      if (!suppressClick) return;
      event.preventDefault();
      event.stopPropagation();
    },
    true
  );

  rail.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const direction = event.key === "ArrowLeft" ? -1 : 1;
    rail.scrollBy({ left: Math.min(rail.clientWidth * 0.82, 430) * direction, behavior: "smooth" });
  });
});

document.querySelectorAll("[data-gallery]").forEach((item) => {
  item.addEventListener("click", () => {
    const image = item.querySelector("img");
    const caption = item.dataset.caption || image?.alt || "Foto de cliente";

    if (!image || !galleryImage || !galleryCaption) return;

    galleryImage.src = image.src;
    galleryImage.alt = image.alt;
    galleryCaption.textContent = caption;
    showDialog(galleryDialog);
  });
});

document.querySelector("[data-close-gallery]")?.addEventListener("click", () => {
  closeDialog(galleryDialog);
});

galleryDialog?.addEventListener("click", (event) => {
  if (event.target === galleryDialog) closeDialog(galleryDialog);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});

const revealObserver = "IntersectionObserver" in window
  ? new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -30px" }
    )
  : null;

document.querySelectorAll("[data-reveal]").forEach((element) => {
  if (revealObserver) {
    revealObserver.observe(element);
  } else {
    element.classList.add("is-visible");
  }
});

const currentYear = document.querySelector("#current-year");
if (currentYear) currentYear.textContent = String(new Date().getFullYear());
