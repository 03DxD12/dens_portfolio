document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const navbar = document.querySelector(".navbar");
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");
  const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');
  const buttons = document.querySelectorAll(".btn");
  const revealTargets = document.querySelectorAll(
    ".section, .project-card, .timeline-item, .cert-card, .edu-card, .contact-box, .skill-badge-card"
  );

  const setMenuState = (isOpen) => {
    if (!navToggle || !navLinks) return;

    navToggle.classList.toggle("active", isOpen);
    navLinks.classList.toggle("active", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
    body.classList.toggle("menu-open", isOpen);
  };

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      const isOpen = !navLinks.classList.contains("active");
      setMenuState(isOpen);
    });

    navAnchors.forEach((link) => {
      link.addEventListener("click", () => setMenuState(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        setMenuState(false);
      }
    });

    document.addEventListener("click", (event) => {
      if (
        window.innerWidth > 900 ||
        !navLinks.classList.contains("active") ||
        navLinks.contains(event.target) ||
        navToggle.contains(event.target)
      ) {
        return;
      }

      setMenuState(false);
    });
  }

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      const targetId = anchor.getAttribute("href");
      if (!targetId || targetId === "#") return;

      const target = document.querySelector(targetId);
      if (!target) return;

      event.preventDefault();
      const navOffset = navbar ? navbar.offsetHeight : 0;
      const top =
        target.getBoundingClientRect().top + window.scrollY - navOffset + 1;

      window.scrollTo({
        top,
        behavior: "smooth",
      });
    });
  });

  revealTargets.forEach((element) => {
    element.setAttribute("data-reveal", "");
  });

  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        });
      },
      {
        threshold: 0.14,
        rootMargin: "0px 0px -60px 0px",
      }
    );

    revealTargets.forEach((element) => revealObserver.observe(element));
  } else {
    revealTargets.forEach((element) => element.classList.add("is-visible"));
  }

  buttons.forEach((button) => {
    const press = () => {
      button.classList.add("is-pressed");
      window.setTimeout(() => button.classList.remove("is-pressed"), 160);
    };

    button.addEventListener("pointerdown", press);
    button.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        press();
      }
    });
  });

  const certGrid = document.getElementById("certifications-grid");
  const toggleBtn = document.getElementById("cert-toggle-btn");
  const filterBtns = document.querySelectorAll(".filter-btn");

  if (certGrid && toggleBtn && filterBtns.length) {
    const certCards = Array.from(certGrid.querySelectorAll(".cert-card"));
    const initialLimit = 8;
    let currentFilter = "all";
    let isExpanded = false;

    const getMatchingCards = () =>
      certCards.filter((card) => {
        if (currentFilter === "all") return true;
        const categories = (card.getAttribute("data-categories") || "")
          .split(" ")
          .filter(Boolean);
        return categories.includes(currentFilter);
      });

    const renderCertifications = () => {
      const matchingCards = getMatchingCards();
      const visibleCount = isExpanded ? matchingCards.length : initialLimit;

      certCards.forEach((card) => {
        const cardIndex = matchingCards.indexOf(card);
        const showCard = cardIndex > -1 && cardIndex < visibleCount;
        card.classList.toggle("hidden", !showCard);
      });

      if (matchingCards.length > initialLimit) {
        toggleBtn.hidden = false;
        toggleBtn.textContent = isExpanded
          ? "Show Less"
          : `Show More (${matchingCards.length - initialLimit})`;
      } else {
        toggleBtn.hidden = true;
      }
    };

    filterBtns.forEach((button) => {
      button.addEventListener("click", () => {
        filterBtns.forEach((item) => item.classList.remove("active"));
        button.classList.add("active");
        currentFilter = button.dataset.filter || "all";
        isExpanded = false;
        renderCertifications();
      });
    });

    toggleBtn.addEventListener("click", () => {
      isExpanded = !isExpanded;
      renderCertifications();

      if (!isExpanded) {
        const certificationsSection = document.getElementById("certifications");
        if (!certificationsSection) return;

        const navOffset = navbar ? navbar.offsetHeight : 0;
        const top =
          certificationsSection.getBoundingClientRect().top +
          window.scrollY -
          navOffset +
          1;

        window.scrollTo({
          top,
          behavior: "smooth",
        });
      }
    });

    renderCertifications();
  }

  if (navbar) {
    const updateNavbarState = () => {
      const isScrolled = window.scrollY > 24;
      navbar.style.boxShadow = isScrolled
        ? "0 20px 40px -28px rgba(2, 11, 23, 0.95)"
        : "none";
      navbar.style.background = isScrolled
        ? "rgba(4, 16, 31, 0.86)"
        : "rgba(4, 16, 31, 0.74)";
    };

    updateNavbarState();
    window.addEventListener("scroll", updateNavbarState, { passive: true });
  }
});
