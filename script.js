/**
 * DENMHAR DIMACULANGAN — PORTFOLIO CORE INTERACTION LOGIC
 * Includes: Hero Typing, Terminal Simulation, Project Filters,
 * Searchable Certifications, Live Preview Modal, and Toast Copy.
 */

document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const body = document.body;
  const navbar = document.querySelector(".navbar");
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.querySelector(".nav-links");
  const navAnchors = document.querySelectorAll('.nav-links a[href^="#"]');
  const toast = document.getElementById("toast");
  const toastMessage = document.getElementById("toast-message");

  // =========================================================================
  // 1. TOAST NOTIFICATION UTILITY
  // =========================================================================
  let toastTimer;
  const showToast = (message, duration = 3000) => {
    if (!toast || !toastMessage) return;
    toastMessage.textContent = message;
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.remove("show");
    }, duration);
  };

  // 1-Click Clipboard Copy Handler
  document.querySelectorAll(".copy-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const textToCopy = btn.getAttribute("data-copy");
      if (!textToCopy) return;

      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          showToast(`Copied to clipboard: ${textToCopy}`);
        }).catch(() => {
          fallbackCopyText(textToCopy);
        });
      } else {
        fallbackCopyText(textToCopy);
      }
    });
  });

  const fallbackCopyText = (text) => {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand("copy");
      showToast(`Copied to clipboard: ${text}`);
    } catch (err) {
      showToast("Unable to copy to clipboard.");
    }
    document.body.removeChild(textArea);
  };

  // =========================================================================
  // 2. HERO TYPING EFFECT
  // =========================================================================
  const typingElement = document.getElementById("typing-text");
  if (typingElement) {
    const roles = [
      "AI Process Improvement Specialist",
      "Prompting Engineer",
      "Full-Stack Web Developer",
      "Workflow Automation Specialist",
      "Python & Machine Learning Builder"
    ];

    let roleIndex = 0;
    let charIndex = roles[0].length;
    let isDeleting = true;
    let typingSpeed = 100;

    const typeRole = () => {
      const currentRole = roles[roleIndex];

      if (isDeleting) {
        charIndex--;
        typingSpeed = 40;
      } else {
        charIndex++;
        typingSpeed = 90;
      }

      typingElement.textContent = currentRole.substring(0, charIndex);

      if (!isDeleting && charIndex === currentRole.length) {
        isDeleting = true;
        typingSpeed = 2200; // Pause at end of word
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        roleIndex = (roleIndex + 1) % roles.length;
        typingSpeed = 450; // Pause before new word
      }

      setTimeout(typeRole, typingSpeed);
    };

    // Kick off typing after a brief delay
    setTimeout(typeRole, 2000);
  }

  // =========================================================================
  // 3. INTERACTIVE HERO AI TERMINAL
  // =========================================================================
  const terminalTriggers = document.querySelectorAll(".terminal-trigger-btn");
  const typedCommand = document.querySelector(".typed-command");
  const highlightLine = document.querySelector(".highlight-line span");

  const terminalCommands = {
    "optimize-workflow": {
      cmd: "run-pipeline --target='ClientOperations' --optimize-context",
      highlight: "Automation gain: +48% efficiency | 12 recurring tasks scheduled"
    },
    "yolo-detect": {
      cmd: "yolo-detect --model='yolov8-custom.pt' --stream=camera_0",
      highlight: "Inference: 18ms | 98.4% detection accuracy on weapon classes"
    },
    "audit-stack": {
      cmd: "inspect-system --env='production' --credentials=30",
      highlight: "Verified credentials: 30 active | Security posture: hardened"
    }
  };

  terminalTriggers.forEach((btn) => {
    btn.addEventListener("click", () => {
      const cmdKey = btn.getAttribute("data-cmd");
      const config = terminalCommands[cmdKey];
      if (!config || !typedCommand || !highlightLine) return;

      typedCommand.textContent = config.cmd;
      highlightLine.textContent = config.highlight;

      // Subtle flash feedback
      typedCommand.style.color = "var(--accent)";
      setTimeout(() => {
        typedCommand.style.color = "#f8fafc";
      }, 350);
    });
  });

  // =========================================================================
  // 4. NAVBAR SCROLL & MOBILE DRAWER
  // =========================================================================
  const setMenuState = (isOpen) => {
    if (!navToggle || !navLinks) return;
    navToggle.classList.toggle("active", isOpen);
    navLinks.classList.toggle("active", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
    body.classList.toggle("menu-open", isOpen);
  };

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      const isOpen = !navLinks.classList.contains("active");
      setMenuState(isOpen);
    });

    navAnchors.forEach((link) => {
      link.addEventListener("click", () => setMenuState(false));
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") setMenuState(false);
    });

    document.addEventListener("click", (event) => {
      if (
        window.innerWidth > 860 ||
        !navLinks.classList.contains("active") ||
        navLinks.contains(event.target) ||
        navToggle.contains(event.target)
      ) {
        return;
      }
      setMenuState(false);
    });
  }

  // Smooth Scroll with dynamic navbar offset
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (event) => {
      const targetId = anchor.getAttribute("href");
      if (!targetId || targetId === "#") return;

      const target = document.querySelector(targetId);
      if (!target) return;

      event.preventDefault();
      setMenuState(false);

      const navOffset = navbar ? navbar.offsetHeight : 70;
      const top = target.getBoundingClientRect().top + window.scrollY - navOffset + 2;

      window.scrollTo({
        top,
        behavior: "smooth"
      });
    });
  });

  // Scrollspy & Progress Bar
  const sections = document.querySelectorAll("section[id]");
  const updateScrollState = () => {
    const scrollY = window.scrollY;

    // Navbar Scrolled State
    if (navbar) {
      navbar.classList.toggle("scrolled", scrollY > 20);
    }

    // Scroll Progress Bar
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollable > 0 ? (scrollY / scrollable) * 100 : 0;
    document.documentElement.style.setProperty(
      "--scroll-progress",
      `${Math.min(100, Math.max(0, progress))}%`
    );

    // Active Nav Link Scrollspy
    const navOffset = (navbar ? navbar.offsetHeight : 74) + 60;
    sections.forEach((section) => {
      const top = section.offsetTop - navOffset;
      const height = section.offsetHeight;
      const id = section.getAttribute("id");

      if (scrollY >= top && scrollY < top + height) {
        document.querySelectorAll(".nav-link").forEach((link) => {
          link.classList.toggle("active", link.getAttribute("href") === `#${id}`);
        });
      }
    });
  };

  let scrollTicking = false;
  const onScroll = () => {
    if (!scrollTicking) {
      window.requestAnimationFrame(() => {
        updateScrollState();
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  };

  updateScrollState();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => {
    window.requestAnimationFrame(updateScrollState);
  }, { passive: true });

  // =========================================================================
  // 5. PROJECT CATEGORY FILTERING
  // =========================================================================
  const projectFilterBtns = document.querySelectorAll(".project-filter-btn");
  const projectCards = document.querySelectorAll(".project-card");

  projectFilterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      projectFilterBtns.forEach((b) => {
        b.classList.remove("active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("active");
      btn.setAttribute("aria-selected", "true");

      const filterValue = btn.getAttribute("data-project-filter");

      projectCards.forEach((card) => {
        const category = card.getAttribute("data-category") || "";
        if (filterValue === "all" || category === filterValue) {
          card.classList.remove("hidden");
        } else {
          card.classList.add("hidden");
        }
      });
    });
  });

  // =========================================================================
  // 6. CERTIFICATIONS: SEARCH & CATEGORY FILTERS & TOGGLE
  // =========================================================================
  const certGrid = document.getElementById("certifications-grid");
  const certSearchInput = document.getElementById("cert-search-input");
  const certSearchClear = document.getElementById("cert-search-clear");
  const certSearchStatus = document.getElementById("cert-search-status");
  const certFilterBtns = document.querySelectorAll(".cert-filters .filter-btn");
  const certToggleBtn = document.getElementById("cert-toggle-btn");

  if (certGrid) {
    const certCards = Array.from(certGrid.querySelectorAll(".cert-card"));
    const INITIAL_LIMIT = 8;
    let activeFilter = "all";
    let searchQuery = "";
    let isExpanded = false;

    const getMatchingCards = () => {
      return certCards.filter((card) => {
        // Category check
        const categories = (card.getAttribute("data-categories") || "").split(" ");
        const matchesCategory = activeFilter === "all" || categories.includes(activeFilter);

        // Search check
        const title = card.querySelector("h3") ? card.querySelector("h3").textContent.toLowerCase() : "";
        const issuer = card.querySelector(".cert-issuer-tag") ? card.querySelector(".cert-issuer-tag").textContent.toLowerCase() : "";
        const date = card.querySelector(".date") ? card.querySelector(".date").textContent.toLowerCase() : "";
        const cardText = `${title} ${issuer} ${date} ${categories.join(" ")}`;
        const matchesSearch = !searchQuery || cardText.includes(searchQuery);

        return matchesCategory && matchesSearch;
      });
    };

    const renderCertifications = () => {
      const matchingCards = getMatchingCards();
      const visibleCount = isExpanded || searchQuery ? matchingCards.length : INITIAL_LIMIT;

      certCards.forEach((card) => {
        const index = matchingCards.indexOf(card);
        const shouldShow = index > -1 && index < visibleCount;
        card.classList.toggle("hidden", !shouldShow);
      });

      // Update Search Status Text
      if (certSearchStatus) {
        if (searchQuery) {
          certSearchStatus.textContent = `Found ${matchingCards.length} matching credential${matchingCards.length === 1 ? "" : "s"}`;
        } else if (activeFilter !== "all") {
          certSearchStatus.textContent = `Showing ${matchingCards.length} credential${matchingCards.length === 1 ? "" : "s"} in selected category`;
        } else {
          certSearchStatus.textContent = `Showing ${isExpanded ? `all ${matchingCards.length}` : `featured ${Math.min(INITIAL_LIMIT, matchingCards.length)} of ${matchingCards.length}`} credentials`;
        }
      }

      // Update Toggle Button Visibility and Text
      if (certToggleBtn) {
        if (!searchQuery && matchingCards.length > INITIAL_LIMIT) {
          certToggleBtn.style.display = "inline-flex";
          const remaining = matchingCards.length - INITIAL_LIMIT;
          certToggleBtn.querySelector("span").textContent = isExpanded
            ? "Show Less Credentials"
            : `Show More Credentials (${remaining})`;
          certToggleBtn.querySelector("svg").style.transform = isExpanded ? "rotate(180deg)" : "rotate(0)";
        } else {
          certToggleBtn.style.display = "none";
        }
      }
    };

    // Filter Buttons
    certFilterBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        certFilterBtns.forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        activeFilter = btn.getAttribute("data-filter") || "all";
        isExpanded = false;
        renderCertifications();
      });
    });

    // Search Input
    if (certSearchInput) {
      certSearchInput.addEventListener("input", (e) => {
        searchQuery = e.target.value.trim().toLowerCase();
        if (certSearchClear) {
          certSearchClear.style.display = searchQuery ? "block" : "none";
        }
        renderCertifications();
      });

      if (certSearchClear) {
        certSearchClear.addEventListener("click", () => {
          certSearchInput.value = "";
          searchQuery = "";
          certSearchClear.style.display = "none";
          certSearchInput.focus();
          renderCertifications();
        });
      }
    }

    // Toggle Button
    if (certToggleBtn) {
      certToggleBtn.addEventListener("click", () => {
        isExpanded = !isExpanded;
        renderCertifications();

        if (!isExpanded) {
          const section = document.getElementById("certifications");
          if (section) {
            const navOffset = navbar ? navbar.offsetHeight : 0;
            const top = section.getBoundingClientRect().top + window.scrollY - navOffset;
            window.scrollTo({ top, behavior: "smooth" });
          }
        }
      });
    }

    renderCertifications();
  }

  // =========================================================================
  // 7. LIVE HOVER PREVIEW MODAL
  // =========================================================================
  const previewModal = document.getElementById("preview-modal");
  const previewIframe = document.getElementById("preview-iframe");
  const previewTitle = document.getElementById("preview-modal-title");
  const previewOpenBtn = document.getElementById("preview-open-btn");
  const previewLoading = document.getElementById("preview-loading");

  let hoverTimeout;
  let activePreviewUrl = "";

  const showHoverPreview = (url, title) => {
    if (!previewModal || !previewIframe || !previewTitle || !previewOpenBtn) return;

    clearTimeout(hoverTimeout);
    if (activePreviewUrl === url && previewModal.classList.contains("active")) return;

    activePreviewUrl = url;
    previewTitle.textContent = title;
    previewOpenBtn.href = url;
    previewIframe.src = url;

    previewModal.classList.add("active");
    if (previewLoading) previewLoading.style.display = "flex";

    previewIframe.onload = () => {
      if (previewLoading) previewLoading.style.display = "none";
    };
  };

  const hideHoverPreview = () => {
    clearTimeout(hoverTimeout);
    hoverTimeout = setTimeout(() => {
      closePreview();
    }, 450);
  };

  window.closePreview = () => {
    if (!previewModal || !previewIframe) return;
    previewModal.classList.remove("active");
    previewIframe.src = "";
    activePreviewUrl = "";
  };

  const previewLinks = document.querySelectorAll("[data-hover-preview]");
  previewLinks.forEach((link) => {
    const triggerPreview = () => {
      const url = link.getAttribute("data-hover-preview");
      const card = link.closest(".project-card");
      const title = card && card.querySelector(".project-title")
        ? card.querySelector(".project-title").textContent
        : "Project Preview";
      showHoverPreview(url, title);
    };

    link.addEventListener("mouseenter", () => {
      if (window.matchMedia("(hover: hover)").matches) {
        triggerPreview();
      }
    });

    link.addEventListener("mouseleave", hideHoverPreview);

    link.addEventListener("click", (e) => {
      const isMobile = !window.matchMedia("(hover: hover)").matches || window.innerWidth <= 860;
      if (isMobile) {
        e.preventDefault();
        triggerPreview();
      }
    });
  });

  if (previewModal) {
    previewModal.addEventListener("mouseenter", () => clearTimeout(hoverTimeout));
    previewModal.addEventListener("mouseleave", hideHoverPreview);

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && previewModal.classList.contains("active")) {
        closePreview();
      }
    });
  }

  // =========================================================================
  // 8. INTERACTIVE CONTACT FORM SUBMISSION
  // =========================================================================
  const contactForm = document.getElementById("contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = document.getElementById("form-name").value.trim();
      const email = document.getElementById("form-email").value.trim();
      const subject = document.getElementById("form-subject").value;
      const message = document.getElementById("form-message").value.trim();

      if (!name || !email || !message) {
        showToast("Please fill in all required fields.");
        return;
      }

      // Build Mailto String
      const mailtoSubject = encodeURIComponent(`[Portfolio Inquiry] ${subject} from ${name}`);
      const mailtoBody = encodeURIComponent(
        `Name: ${name}\nEmail: ${email}\nInquiry Type: ${subject}\n\nMessage:\n${message}\n\n---\nSent from dens-portfolio-den.vercel.app`
      );
      const mailtoUrl = `mailto:denmhardimaculangan12@gmail.com?subject=${mailtoSubject}&body=${mailtoBody}`;

      showToast("Opening email client... Thanks for connecting!", 4000);
      window.location.href = mailtoUrl;

      // Reset form
      contactForm.reset();
    });
  }

  // =========================================================================
  // 9. 3D DYNAMIC GEODESIC SKILL SPHERE & ORBIT SYSTEM
  // =========================================================================
  const init3DSkillSphere = () => {
    const container = document.getElementById("skill-sphere-container");
    const canvas = document.getElementById("skill-sphere-canvas");
    const tagsLayer = document.getElementById("orbit-tags-layer");
    if (!container || !canvas || !tagsLayer) return;

    const ctx = canvas.getContext("2d");
    let width = 0;
    let height = 0;
    let dpr = window.devicePixelRatio || 1;

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      width = rect.width;
      height = rect.height;
      dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Geodesic icosahedron wireframe (42 vertices, 120 edges)
    const phi = (1 + Math.sqrt(5)) / 2;
    const rawIcos = [
      [-1,  phi, 0], [ 1,  phi, 0], [-1, -phi, 0], [ 1, -phi, 0],
      [ 0, -1,  phi], [ 0,  1,  phi], [ 0, -1, -phi], [ 0,  1, -phi],
      [ phi, 0, -1], [ phi, 0,  1], [-phi, 0, -1], [-phi, 0,  1]
    ];
    const normalize = (v) => {
      const d = Math.hypot(v[0], v[1], v[2]) || 1;
      return [v[0] / d, v[1] / d, v[2] / d];
    };
    const vertices = rawIcos.map(normalize);

    const icosFaces = [
      [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
      [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
      [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
      [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1]
    ];

    const midpointMap = new Map();
    const getMidpoint = (i1, i2) => {
      const key = i1 < i2 ? `${i1}_${i2}` : `${i2}_${i1}`;
      if (midpointMap.has(key)) return midpointMap.get(key);
      const v1 = vertices[i1];
      const v2 = vertices[i2];
      const mid = normalize([(v1[0] + v2[0]) / 2, (v1[1] + v2[1]) / 2, (v1[2] + v2[2]) / 2]);
      const idx = vertices.length;
      vertices.push(mid);
      midpointMap.set(key, idx);
      return idx;
    };

    const subFaces = [];
    for (const [a, b, c] of icosFaces) {
      const ab = getMidpoint(a, b);
      const bc = getMidpoint(b, c);
      const ca = getMidpoint(c, a);
      subFaces.push([a, ab, ca]);
      subFaces.push([b, bc, ab]);
      subFaces.push([c, ca, bc]);
      subFaces.push([ab, bc, ca]);
    }

    const edgeSet = new Set();
    for (const [a, b, c] of subFaces) {
      edgeSet.add(a < b ? `${a}_${b}` : `${b}_${a}`);
      edgeSet.add(b < c ? `${b}_${c}` : `${c}_${b}`);
      edgeSet.add(c < a ? `${c}_${a}` : `${a}_${c}`);
    }
    const edges = Array.from(edgeSet).map((s) => s.split("_").map(Number));

    // 3 Tilted 3D Orbits around the sphere
    const orbits = [
      {
        radiusX: 1.48,
        radiusZ: 1.48,
        tiltX: (62 * Math.PI) / 180,
        tiltY: (18 * Math.PI) / 180,
        tiltZ: (-12 * Math.PI) / 180,
        speed: 0.005,
        color: "rgba(0, 245, 196, 0.45)",
        glowColor: "rgba(0, 245, 196, 0.25)",
        sparks: [0, 0.35, 0.7]
      },
      {
        radiusX: 1.68,
        radiusZ: 1.68,
        tiltX: (-48 * Math.PI) / 180,
        tiltY: (-28 * Math.PI) / 180,
        tiltZ: (38 * Math.PI) / 180,
        speed: -0.0042,
        color: "rgba(56, 189, 248, 0.45)",
        glowColor: "rgba(56, 189, 248, 0.25)",
        sparks: [0.15, 0.55, 0.85]
      },
      {
        radiusX: 1.88,
        radiusZ: 1.88,
        tiltX: (25 * Math.PI) / 180,
        tiltY: (55 * Math.PI) / 180,
        tiltZ: (-45 * Math.PI) / 180,
        speed: 0.0035,
        color: "rgba(129, 140, 248, 0.4)",
        glowColor: "rgba(129, 140, 248, 0.2)",
        sparks: [0.25, 0.75]
      }
    ];

    // Denmhar's 15 Key Skills Distributed Across Orbits (Frontend, Jamstack, Canva/Docs, AI)
    const skillsData = [
      // Orbit 0 (Inner-Mid) - Frontend & Design Core
      { name: "HTML5 / CSS3", orbit: 0, angle: 0 },
      { name: "JavaScript", orbit: 0, angle: (2 * Math.PI) / 5 },
      { name: "Jamstack", orbit: 0, angle: (4 * Math.PI) / 5 },
      { name: "Canva Design", orbit: 0, angle: (6 * Math.PI) / 5 },
      { name: "Word & PPT", orbit: 0, angle: (8 * Math.PI) / 5 },

      // Orbit 1 (Mid-Outer) - Modern Web & AI
      { name: "Next.js", orbit: 1, angle: 0.4 },
      { name: "Tailwind CSS", orbit: 1, angle: 0.4 + (2 * Math.PI) / 5 },
      { name: "TypeScript", orbit: 1, angle: 0.4 + (4 * Math.PI) / 5 },
      { name: "AI Prompting", orbit: 1, angle: 0.4 + (6 * Math.PI) / 5 },
      { name: "Python", orbit: 1, angle: 0.4 + (8 * Math.PI) / 5 },

      // Orbit 2 (Outer) - Systems & Workflows
      { name: "Full-Stack Web", orbit: 2, angle: 0.8 },
      { name: "UI/UX Design", orbit: 2, angle: 0.8 + (2 * Math.PI) / 5 },
      { name: "AI Automation", orbit: 2, angle: 0.8 + (4 * Math.PI) / 5 },
      { name: "Git & GitHub", orbit: 2, angle: 0.8 + (6 * Math.PI) / 5 },
      { name: "Electron", orbit: 2, angle: 0.8 + (8 * Math.PI) / 5 }
    ];

    tagsLayer.innerHTML = "";
    const tagElements = skillsData.map((item) => {
      const el = document.createElement("div");
      el.className = "orbit-skill-tag";
      el.textContent = item.name;
      el.setAttribute("data-orbit", String(item.orbit));
      tagsLayer.appendChild(el);
      return {
        ...item,
        el,
        currentAngle: item.angle,
        isHovered: false
      };
    });

    let isAnyTagHovered = false;
    tagElements.forEach((item) => {
      item.el.addEventListener("mouseenter", () => {
        item.isHovered = true;
        isAnyTagHovered = true;
      });
      item.el.addEventListener("mouseleave", () => {
        item.isHovered = false;
        isAnyTagHovered = false;
      });
    });

    // 3D rotation math functions
    const rotateX = (p, angle) => {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      return [p[0], p[1] * cos - p[2] * sin, p[1] * sin + p[2] * cos];
    };
    const rotateY = (p, angle) => {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      return [p[0] * cos + p[2] * sin, p[1], -p[0] * sin + p[2] * cos];
    };
    const rotateZ = (p, angle) => {
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      return [p[0] * cos - p[1] * sin, p[0] * sin + p[1] * cos, p[2]];
    };

    const transformPoint = (p, rx, ry, rz) => {
      let pt = rotateX(p, rx);
      pt = rotateY(pt, ry);
      pt = rotateZ(pt, rz);
      return pt;
    };

    // User Drag Rotation & Momentum State
    let rotX = -0.35;
    let rotY = 0.45;
    const rotZ = 0.08;
    let velX = 0;
    let velY = 0.004;
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    let isTouch = false;
    let startTouchX = 0;
    let startTouchY = 0;
    let hasDecidedGesture = false;

    container.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "mouse") {
        isDragging = true;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
        container.setPointerCapture(e.pointerId);
      } else {
        isTouch = true;
        hasDecidedGesture = false;
        startTouchX = e.clientX;
        startTouchY = e.clientY;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
      }
    });

    window.addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse") {
        if (!isTouch) return;
        const dx = e.clientX - prevMouseX;
        const dy = e.clientY - prevMouseY;
        const totalDx = Math.abs(e.clientX - startTouchX);
        const totalDy = Math.abs(e.clientY - startTouchY);

        if (!hasDecidedGesture) {
          if (totalDx > 8 && totalDx > totalDy) {
            hasDecidedGesture = true;
            isDragging = true;
            try { container.setPointerCapture(e.pointerId); } catch (_) {}
          } else if (totalDy > 8) {
            hasDecidedGesture = true;
            isDragging = false;
            return;
          }
        }

        if (!isDragging) return;
        prevMouseX = e.clientX;
        prevMouseY = e.clientY;
        rotY += dx * 0.008;
        rotX += dy * 0.008;
        velY = dx * 0.008;
        velX = dy * 0.008;
        return;
      }

      if (!isDragging) return;
      const dx = e.clientX - prevMouseX;
      const dy = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      rotY += dx * 0.008;
      rotX += dy * 0.008;
      velY = dx * 0.008;
      velX = dy * 0.008;
    });

    const endPointer = (e) => {
      if (isDragging) {
        isDragging = false;
        try {
          container.releasePointerCapture(e.pointerId);
        } catch (err) {}
      }
      isTouch = false;
      hasDecidedGesture = false;
    };

    window.addEventListener("pointerup", endPointer);
    window.addEventListener("pointercancel", endPointer);

    // Perspective Projection
    const FOV = 480;
    const project = (x, y, z, cx, cy) => {
      const scale = FOV / (FOV + z);
      return {
        x: cx + x * scale,
        y: cy + y * scale,
        scale,
        z
      };
    };

    // Animation Loop
    const render = (time) => {
      requestAnimationFrame(render);
      if (width === 0 || height === 0) return;

      // Inertia & automatic idle rotation
      if (!isDragging) {
        if (!isAnyTagHovered) {
          rotY += 0.0035;
          rotX += Math.sin(time * 0.0008) * 0.0006;
        }
        velX *= 0.92;
        velY = velY * 0.92 + 0.0035 * 0.08;
        rotX += velX;
        rotY += velY;
      }

      ctx.clearRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const isMobile = window.innerWidth <= 680 || width <= 360;
      const baseRadius = Math.min(width, height) * (isMobile ? 0.17 : 0.22);

      // Internal Sphere Glow
      const sphereGlow = ctx.createRadialGradient(cx, cy, baseRadius * 0.1, cx, cy, baseRadius * 1.05);
      sphereGlow.addColorStop(0, "rgba(0, 245, 196, 0.18)");
      sphereGlow.addColorStop(0.5, "rgba(56, 189, 248, 0.08)");
      sphereGlow.addColorStop(1, "rgba(4, 9, 20, 0)");
      ctx.fillStyle = sphereGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, baseRadius * 1.05, 0, Math.PI * 2);
      ctx.fill();

      // Transform Geodesic Vertices
      const projectedVertices = vertices.map((v) => {
        const scaled = [v[0] * baseRadius, v[1] * baseRadius, v[2] * baseRadius];
        const rotated = transformPoint(scaled, rotX, rotY, rotZ);
        return project(rotated[0], rotated[1], rotated[2], cx, cy);
      });

      // Render Geodesic Edges (back edges first, front edges bright)
      ctx.lineWidth = 0.8;
      ctx.strokeStyle = "rgba(0, 245, 196, 0.14)";
      ctx.beginPath();
      for (const [i1, i2] of edges) {
        const p1 = projectedVertices[i1];
        const p2 = projectedVertices[i2];
        if ((p1.z + p2.z) / 2 < 0) {
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
        }
      }
      ctx.stroke();

      ctx.lineWidth = 1.1;
      ctx.strokeStyle = "rgba(0, 245, 196, 0.42)";
      ctx.shadowBlur = 6;
      ctx.shadowColor = "rgba(0, 245, 196, 0.35)";
      ctx.beginPath();
      for (const [i1, i2] of edges) {
        const p1 = projectedVertices[i1];
        const p2 = projectedVertices[i2];
        if ((p1.z + p2.z) / 2 >= 0) {
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
        }
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Geodesic Vertex Points (front only)
      ctx.fillStyle = "#00f5c4";
      for (const p of projectedVertices) {
        if (p.z > 0) {
          const dotSize = Math.max(1, p.scale * 1.8);
          ctx.beginPath();
          ctx.arc(p.x, p.y, dotSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Render 3D Orbits & Sparks
      const orbitSteps = 90;
      orbits.forEach((orbit) => {
        const orbitPoints = [];
        for (let i = 0; i <= orbitSteps; i++) {
          const theta = (i / orbitSteps) * Math.PI * 2;
          const rX = baseRadius * orbit.radiusX;
          const rZ = baseRadius * orbit.radiusZ;
          let pt = [rX * Math.cos(theta), 0, rZ * Math.sin(theta)];

          pt = transformPoint(pt, orbit.tiltX, orbit.tiltY, orbit.tiltZ);
          pt = transformPoint(pt, rotX, rotY, rotZ);
          orbitPoints.push(project(pt[0], pt[1], pt[2], cx, cy));
        }

        // Back half of orbit
        ctx.lineWidth = 1.0;
        ctx.strokeStyle = orbit.color.replace("0.45", "0.18");
        ctx.beginPath();
        for (let i = 0; i < orbitSteps; i++) {
          const p1 = orbitPoints[i];
          const p2 = orbitPoints[i + 1];
          if ((p1.z + p2.z) / 2 < 0) {
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
          }
        }
        ctx.stroke();

        // Front half of orbit
        ctx.lineWidth = 1.4;
        ctx.strokeStyle = orbit.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = orbit.glowColor;
        ctx.beginPath();
        for (let i = 0; i < orbitSteps; i++) {
          const p1 = orbitPoints[i];
          const p2 = orbitPoints[i + 1];
          if ((p1.z + p2.z) / 2 >= 0) {
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
          }
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Orbit Sparks
        orbit.sparks.forEach((sparkOffset) => {
          const sparkAngle =
            (time * 0.0006 * (orbit.speed > 0 ? 1 : -1) + sparkOffset * Math.PI * 2) % (Math.PI * 2);
          const rX = baseRadius * orbit.radiusX;
          const rZ = baseRadius * orbit.radiusZ;
          let spt = [rX * Math.cos(sparkAngle), 0, rZ * Math.sin(sparkAngle)];
          spt = transformPoint(spt, orbit.tiltX, orbit.tiltY, orbit.tiltZ);
          spt = transformPoint(spt, rotX, rotY, rotZ);
          const sproj = project(spt[0], spt[1], spt[2], cx, cy);

          const sparkSize = Math.max(1.8, sproj.scale * 3);
          ctx.fillStyle = sproj.z > 0 ? "#00f5c4" : "rgba(0, 245, 196, 0.4)";
          ctx.shadowBlur = sproj.z > 0 ? 12 : 3;
          ctx.shadowColor = "#00f5c4";
          ctx.beginPath();
          ctx.arc(sproj.x, sproj.y, sparkSize, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        });
      });

      // Update Skill Badges ("all of it moving")
      tagElements.forEach((item) => {
        const orbit = orbits[item.orbit];

        if (!isAnyTagHovered) {
          item.currentAngle += orbit.speed;
        }

        const rX = baseRadius * orbit.radiusX;
        const rZ = baseRadius * orbit.radiusZ;
        let pt = [rX * Math.cos(item.currentAngle), 0, rZ * Math.sin(item.currentAngle)];

        pt = transformPoint(pt, orbit.tiltX, orbit.tiltY, orbit.tiltZ);
        pt = transformPoint(pt, rotX, rotY, rotZ);

        const proj = project(pt[0], pt[1], pt[2], cx, cy);
        const el = item.el;
        const tagW = el.offsetWidth || 80;
        const tagH = el.offsetHeight || 30;

        const baseScale = Math.max(0.68, Math.min(1.22, proj.scale));
        const effectiveScale = item.isHovered ? baseScale * 1.15 : baseScale;
        const isFront = proj.z > -10;

        el.style.transform = `translate3d(${proj.x - tagW / 2}px, ${proj.y - tagH / 2}px, 0px) scale(${effectiveScale})`;
        el.style.zIndex = item.isHovered ? 100 : Math.round((proj.z + 500) / 10);

        if (isFront) {
          el.classList.remove("behind");
          const depthAlpha = 0.75 + (proj.z / (baseRadius * 1.8)) * 0.25;
          el.style.opacity = Math.max(0.7, Math.min(1, depthAlpha));
        } else {
          el.classList.add("behind");
          const depthAlpha = 0.25 + ((proj.z + baseRadius * 1.8) / (baseRadius * 1.8)) * 0.35;
          el.style.opacity = Math.max(0.2, Math.min(0.5, depthAlpha));
        }
      });
    };

    requestAnimationFrame(render);
  };

  init3DSkillSphere();
});
