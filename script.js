/* ── Smooth scroll helper ─────────────────────────────────── */
function smoothTo(id) {
  document.getElementById(id).scrollIntoView({ behavior: "smooth" });
}

/* ── Dynamic Card Carousel Handler ────────────────────────── */
let carouselState = {
  container: null,
  cards: [],
  currentIndex: 0,
  totalCards: 0,
  isAnimating: false,
};

function initCarousel() {
  carouselState.container = document.getElementById("carouselContainer");
  if (!carouselState.container) return;

  carouselState.cards = Array.from(
    carouselState.container.querySelectorAll(".carousel-slide"),
  );
  carouselState.totalCards = carouselState.cards.length;

  // Initialize active classes
  updateCarouselDisplay();
}

function updateCarouselDisplay() {
  const { cards, currentIndex, totalCards } = carouselState;
  const isMobile = window.innerWidth <= 900;

  cards.forEach((card, index) => {
    card.classList.remove("active", "forward");

    if (isMobile) {
      // Mobile view - show only center card more prominently
      if (index === currentIndex) {
        // Current left card
        card.style.transform =
          "translateX(-60px) rotateY(-8deg) rotateZ(2deg) scale(0.85)";
        card.style.zIndex = "8";
        card.style.opacity = "0.7";
        card.style.pointerEvents = "auto";
      } else if (index === (currentIndex + 1) % totalCards) {
        // Current center card
        card.style.transform =
          "translateX(0) rotateY(0deg) rotateZ(0deg) scale(1)";
        card.style.zIndex = "10";
        card.style.opacity = "1";
        card.style.pointerEvents = "auto";
      } else if (index === (currentIndex + 2) % totalCards) {
        // Current right card
        card.style.transform =
          "translateX(60px) rotateY(8deg) rotateZ(-2deg) scale(0.85)";
        card.style.zIndex = "8";
        card.style.opacity = "0.7";
        card.style.pointerEvents = "auto";
      } else {
        // Hidden cards
        card.style.transform = "scale(0.8) translateZ(-100px) translateX(0)";
        card.style.zIndex = "1";
        card.style.opacity = "0";
        card.style.pointerEvents = "none";
      }
    } else {
      // Desktop view - original positioning
      // Position cards in a trio (left, center, right)
      if (index === currentIndex) {
        // Current left card
        card.style.transform =
          "translateX(-120px) rotateY(-12deg) rotateZ(3deg) scale(0.95)";
        card.style.zIndex = "8";
        card.style.opacity = "1";
        card.style.pointerEvents = "auto";
      } else if (index === (currentIndex + 1) % totalCards) {
        // Current center card
        card.style.transform =
          "translateX(0) rotateY(0deg) rotateZ(0deg) scale(1)";
        card.style.zIndex = "10";
        card.style.opacity = "1";
        card.style.pointerEvents = "auto";
      } else if (index === (currentIndex + 2) % totalCards) {
        // Current right card
        card.style.transform =
          "translateX(120px) rotateY(12deg) rotateZ(-3deg) scale(0.95)";
        card.style.zIndex = "8";
        card.style.opacity = "1";
        card.style.pointerEvents = "auto";
      } else {
        // Hidden cards
        card.style.transform = "scale(0.8) translateZ(-100px) translateX(0)";
        card.style.zIndex = "1";
        card.style.opacity = "0";
        card.style.pointerEvents = "none";
      }
    }
  });
}

function flipCard(card) {
  if (carouselState.isAnimating) return;
  carouselState.isAnimating = true;

  // Move to next set of 3 cards (advance by 1)
  carouselState.currentIndex =
    (carouselState.currentIndex + 1) % carouselState.totalCards;

  // Animate the cards out
  const { cards, totalCards } = carouselState;
  cards.forEach((card) => {
    card.style.transition = "none";
  });

  // Reset animation class
  setTimeout(() => {
    cards.forEach((card) => {
      card.classList.remove("forward");
      card.style.transition =
        "transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)";
    });
    updateCarouselDisplay();
    carouselState.isAnimating = false;
  }, 50);
}

// Initialize UI on page load
document.addEventListener("DOMContentLoaded", () => {
  initCarousel();
  initProjectGalleries();
});

// Update carousel on window resize (for mobile orientation changes)
let resizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    updateCarouselDisplay();
  }, 250);
});

/* ── Project gallery modal ───────────────────────────────── */
function initProjectGalleries() {
  const galleries = document.querySelectorAll(".project-gallery");
  const modal = document.getElementById("projectModal");
  const modalImage = document.getElementById("projectModalImage");
  const closeButton = document.getElementById("projectModalClose");
  const prevButton = document.getElementById("projectModalPrev");
  const nextButton = document.getElementById("projectModalNext");

  if (!modal || !modalImage || !closeButton || !prevButton || !nextButton) {
    return;
  }

  let activeGalleryImages = [];
  let activeGalleryIndex = 0;

  function openModal(images, index) {
    activeGalleryImages = images;
    activeGalleryIndex = index;
    updateModal();
    modal.classList.add("open");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    modal.classList.remove("open");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function updateModal() {
    if (!activeGalleryImages.length) return;
    const safeIndex = Math.max(
      0,
      Math.min(activeGalleryIndex, activeGalleryImages.length - 1),
    );
    activeGalleryIndex = safeIndex;
    modalImage.src = activeGalleryImages[safeIndex];
    modalImage.alt = `Project preview ${safeIndex + 1}`;
  }

  function changeModal(step) {
    if (!activeGalleryImages.length) return;
    activeGalleryIndex =
      (activeGalleryIndex + step + activeGalleryImages.length) %
      activeGalleryImages.length;
    updateModal();
  }

  galleries.forEach((gallery) => {
    const mainImage = gallery.querySelector(".project-main-image");
    const allThumbs = Array.from(
      gallery.querySelectorAll(".project-thumb-btn"),
    );
    const thumbButtons = allThumbs.filter((button) =>
      button.hasAttribute("data-src"),
    );
    const openButton = gallery
      .closest(".project-card")
      .querySelector(".project-link");

    if (!mainImage || !thumbButtons.length) return;

    const images = thumbButtons.map((button) => button.dataset.src);
    let activeIndex = 0;

    const setActiveImage = (index) => {
      activeIndex = index;
      thumbButtons.forEach((thumb) => thumb.classList.remove("active"));
      thumbButtons[index].classList.add("active");
      mainImage.src = images[index];
      mainImage.alt = `Project preview ${index + 1}`;
    };

    thumbButtons.forEach((button, index) => {
      button.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        setActiveImage(index);
        openModal(images, index);
      });
    });

    mainImage.addEventListener("click", (event) => {
      const linkWrapper = mainImage.closest("a[href]");
      if (linkWrapper) {
        event.preventDefault();
        event.stopPropagation();
        window.open(linkWrapper.href, "_blank", "noopener,noreferrer");
        return;
      }

      event.preventDefault();
      openModal(images, activeIndex);
    });

    if (openButton) {
      openButton.addEventListener("click", (event) => {
        event.preventDefault();
        openModal(images, activeIndex);
      });
    }
  });

  closeButton.addEventListener("click", closeModal);
  prevButton.addEventListener("click", () => changeModal(-1));
  nextButton.addEventListener("click", () => changeModal(1));

  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal();
  });

  document.addEventListener("keydown", (event) => {
    if (!modal.classList.contains("open")) return;
    if (event.key === "Escape") closeModal();
    if (event.key === "ArrowRight") changeModal(1);
    if (event.key === "ArrowLeft") changeModal(-1);
  });
}

/* ── Mobile nav ───────────────────────────────────────────── */
const hamburger = document.getElementById("hamburger");
const mobileMenu = document.getElementById("mobileMenu");

hamburger.addEventListener("click", () => {
  hamburger.classList.toggle("open");
  mobileMenu.classList.toggle("open");
});

function closeMobile() {
  hamburger.classList.remove("open");
  mobileMenu.classList.remove("open");
}

/* ── Scroll reveal ────────────────────────────────────────── */
const revealEls = document.querySelectorAll(".reveal");

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 },
);

revealEls.forEach((el) => revealObserver.observe(el));

/* ── Count-up animation ───────────────────────────────────── */
const countEls = document.querySelectorAll("[data-count]");

const countObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.getAttribute("data-count"), 10);
      const suffix = el.getAttribute("data-suffix") || "+";
      let current = 0;
      const step = Math.ceil(target / 40);
      const timer = setInterval(() => {
        current += step;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        el.textContent = current + suffix;
      }, 35);
      countObserver.unobserve(el);
    });
  },
  { threshold: 0.5 },
);

countEls.forEach((el) => countObserver.observe(el));

/* ── Active nav link on scroll ────────────────────────────── */
const sections = document.querySelectorAll("section[id]");
const navLinks = document.querySelectorAll(".nav-links a");

const navObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        navLinks.forEach((link) => {
          link.style.color =
            link.getAttribute("href") === "#" + entry.target.id
              ? "var(--accent)"
              : "";
        });
      }
    });
  },
  { rootMargin: "-40% 0px -55% 0px" },
);

sections.forEach((s) => navObserver.observe(s));
