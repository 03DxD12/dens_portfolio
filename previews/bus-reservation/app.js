document.addEventListener("DOMContentLoaded", () => {
  installStaticDemoApi();

  const originSelect = document.getElementById("origin");
  const destinationSelect = document.getElementById("destination");
  const searchForm = document.getElementById("search-form");
  const resultsSection = document.getElementById("results-section");
  const resultsContainer = document.getElementById("results-container");
  const resultCount = document.getElementById("result-count");
  const bookingModal = document.getElementById("booking-modal");
  const bookingForm = document.getElementById("booking-form");
  const seatMap = document.getElementById("seat-map");
  const seatHelp = document.getElementById("seat-help");
  const modalTotal = document.getElementById("modal-total");
  const selectedSeatLabel = document.getElementById("selected-seat-label");
  const lookupResult = document.getElementById("lookup-result");

  let currentTrip = null;
  let selectedSeats = [];
  let currentUser = null;

  init();

  async function init() {
    document.getElementById("date").min = new Date().toISOString().slice(0, 10);
    await loadCurrentUser();
    await fetchTerminals();
  }

  async function loadCurrentUser() {
    const res = await fetch("/api/auth/me");
    const data = await res.json();
    currentUser = data.user;
    const chip = document.getElementById("auth-chip");
    if (!currentUser) {
      chip.innerHTML = '<a class="btn ghost small" href="login.html">Login</a>';
      return;
    }
    chip.innerHTML = `
      <span>${escapeHtml(currentUser.username)}</span>
      <button class="btn ghost small" id="logout-btn" type="button">Logout</button>
    `;
    document.getElementById("logout-btn").addEventListener("click", async () => {
      await fetch("/api/auth/logout", { method: "POST" });
      location.reload();
    });
  }

  async function fetchTerminals() {
    try {
      const res = await fetch("/api/terminals");
      const terminals = await res.json();
      const options = terminals
        .map((terminal) => `<option value="${terminal.id}">${terminal.name} (${terminal.city})</option>`)
        .join("");
      originSelect.insertAdjacentHTML("beforeend", options);
      destinationSelect.insertAdjacentHTML("beforeend", options);
    } catch (error) {
      showInline(resultsContainer, "Failed to load terminals.");
    }
  }

  document.getElementById("swap-route").addEventListener("click", () => {
    const origin = originSelect.value;
    originSelect.value = destinationSelect.value;
    destinationSelect.value = origin;
  });

  searchForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    const originId = originSelect.value;
    const destinationId = destinationSelect.value;
    const date = document.getElementById("date").value;

    if (originId === destinationId) {
      alert("Origin and destination cannot be the same.");
      return;
    }

    resultsSection.classList.remove("hidden");
    resultCount.textContent = "";
    showInline(resultsContainer, "Searching trips...");

    try {
      const res = await fetch(`/api/trips?originId=${originId}&destinationId=${destinationId}&date=${date}`);
      const trips = await res.json();
      if (!res.ok) throw new Error(trips.error || "Unable to search trips");
      displayTrips(trips);
    } catch (error) {
      showInline(resultsContainer, error.message);
    }
  });

  function displayTrips(trips) {
    resultsContainer.innerHTML = "";
    resultCount.textContent = `${trips.length} trip${trips.length === 1 ? "" : "s"} found`;

    if (trips.length === 0) {
      showInline(resultsContainer, "No trips found for this route and date.");
      return;
    }

    for (const trip of trips) {
      const departure = new Date(trip.departureTime);
      const arrival = new Date(trip.arrivalTime);
      const duration = Math.abs(arrival - departure) / 36e5;
      const card = document.createElement("article");
      card.className = "trip-card";
      card.innerHTML = `
        <div class="trip-card-top">
          <span class="bus-pill">${trip.busType}</span>
          <strong>${formatCurrency(trip.price)}</strong>
        </div>
        <h3>${escapeHtml(trip.route.origin.name)} <i class="ri-arrow-right-line"></i> ${escapeHtml(
        trip.route.destination.name
      )}</h3>
        <div class="trip-meta">
          <span><i class="ri-time-line"></i> ${formatTime(departure)}</span>
          <span><i class="ri-route-line"></i> ${duration}h</span>
          <span><i class="ri-armchair-fill"></i> ${trip.seatsAvailable}/${trip.capacity}</span>
        </div>
        <button class="btn secondary full" type="button">Select Seats</button>
      `;
      card.querySelector("button").addEventListener("click", () => openBookingModal(trip));
      resultsContainer.appendChild(card);
    }

    resultsSection.scrollIntoView({ behavior: "smooth" });
  }

  async function openBookingModal(trip) {
    if (!currentUser) {
      location.href = "login.html";
      return;
    }

    currentTrip = trip;
    selectedSeats = [];
    document.getElementById("modal-trip-id").value = trip.id;
    document.getElementById("modal-route").textContent = `${trip.route.origin.name} to ${trip.route.destination.name}`;
    document.getElementById("modal-details").textContent = `${formatTime(
      new Date(trip.departureTime)
    )} • ${trip.busType} • ${formatCurrency(trip.price)} per seat`;
    document.getElementById("passenger-name").value = currentUser.username || "";
    document.getElementById("contact-email").value = currentUser.email || "";
    document.getElementById("contact-phone").value = currentUser.phone || "";
    bookingModal.classList.remove("hidden");
    await renderSeatMap(trip.id);
    updateTotal();
  }

  async function renderSeatMap(tripId) {
    seatMap.innerHTML = "";
    seatHelp.textContent = "Loading seat map...";
    const res = await fetch(`/api/trips/${tripId}/seats`);
    const data = await res.json();
    if (!res.ok) {
      seatHelp.textContent = data.error || "Unable to load seats";
      return;
    }

    const taken = new Set(data.takenSeats);
    for (let seat = 1; seat <= data.capacity; seat += 1) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "seat";
      button.textContent = seat;
      button.disabled = taken.has(seat);
      if (button.disabled) button.classList.add("taken");
      button.addEventListener("click", () => toggleSeat(button, seat));
      seatMap.appendChild(button);
    }
    seatHelp.textContent = `${data.seatsAvailable} seats available`;
  }

  function toggleSeat(button, seat) {
    if (selectedSeats.includes(seat)) {
      selectedSeats = selectedSeats.filter((item) => item !== seat);
      button.classList.remove("selected");
    } else {
      if (selectedSeats.length >= 10) {
        alert("You can reserve up to 10 seats per booking.");
        return;
      }
      selectedSeats.push(seat);
      button.classList.add("selected");
    }
    selectedSeats.sort((a, b) => a - b);
    updateTotal();
  }

  function updateTotal() {
    const total = (currentTrip?.price || 0) * selectedSeats.length;
    selectedSeatLabel.textContent =
      selectedSeats.length === 0 ? "No seats selected" : `Seats ${selectedSeats.join(", ")}`;
    modalTotal.textContent = formatCurrency(total);
  }

  document.querySelector(".close-modal").addEventListener("click", closeModal);
  bookingModal.addEventListener("click", (event) => {
    if (event.target === bookingModal) closeModal();
  });

  function closeModal() {
    bookingModal.classList.add("hidden");
  }

  bookingForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (selectedSeats.length === 0) {
      alert("Select at least one seat.");
      return;
    }

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tripId: document.getElementById("modal-trip-id").value,
          passengerName: document.getElementById("passenger-name").value,
          contactEmail: document.getElementById("contact-email").value,
          contactPhone: document.getElementById("contact-phone").value,
          paymentMethod: document.getElementById("payment-method").value,
          seatNumbers: selectedSeats,
        }),
      });
      const booking = await res.json();
      if (!res.ok) throw new Error(booking.error || "Booking failed");

      closeModal();
      searchForm.dispatchEvent(new Event("submit"));
      renderBookingResult(booking, true);
      lookupResult.scrollIntoView({ behavior: "smooth" });
    } catch (error) {
      alert(error.message);
    }
  });

  document.getElementById("lookup-form").addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      const res = await fetch("/api/bookings/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference: document.getElementById("lookup-reference").value,
          contact: document.getElementById("lookup-contact").value,
        }),
      });
      const booking = await res.json();
      if (!res.ok) throw new Error(booking.error || "Booking not found");
      renderBookingResult(booking);
    } catch (error) {
      lookupResult.classList.remove("hidden");
      lookupResult.innerHTML = `<div class="notice">${escapeHtml(error.message)}</div>`;
    }
  });

  function renderBookingResult(booking, isNew = false) {
    lookupResult.classList.remove("hidden");
    lookupResult.innerHTML = `
      <article class="ticket-card">
        <div>
          <p class="eyebrow">${isNew ? "Reservation confirmed" : "Booking details"}</p>
          <h2>${booking.reference}</h2>
          <p class="muted">${booking.tripDetails.route} • ${booking.tripDetails.date} ${booking.tripDetails.time}</p>
        </div>
        <div class="ticket-grid">
          <div><span>Passenger</span><strong>${escapeHtml(booking.passengerName)}</strong></div>
          <div><span>Seats</span><strong>${booking.seatNumbers.join(", ")}</strong></div>
          <div><span>Total</span><strong>${formatCurrency(booking.totalPrice)}</strong></div>
          <div><span>Status</span><strong>${booking.status}</strong></div>
          <div><span>Payment</span><strong>${booking.paymentStatus}</strong></div>
        </div>
        ${booking.ticketQrData ? `<img class="ticket-qr" src="${booking.ticketQrData}" alt="Ticket QR code" />` : ""}
        <div class="ticket-actions">
          <button class="btn ghost" type="button" onclick="window.print()">Print</button>
          ${
            booking.status !== "CANCELLED"
              ? '<button class="btn danger" id="cancel-booking" type="button">Cancel Booking</button>'
              : ""
          }
        </div>
      </article>
    `;

    const cancelButton = document.getElementById("cancel-booking");
    if (cancelButton) {
      cancelButton.addEventListener("click", () => cancelBooking(booking.reference));
    }
  }

  async function cancelBooking(reference) {
    const contact =
      document.getElementById("lookup-contact").value ||
      document.getElementById("contact-email").value ||
      document.getElementById("contact-phone").value;
    if (!confirm("Cancel this booking and release the selected seats?")) return;

    const res = await fetch(`/api/bookings/${encodeURIComponent(reference)}/cancel`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contact }),
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Cancellation failed");
      return;
    }
    renderBookingResult(data);
  }

  function showInline(container, message) {
    container.innerHTML = `<div class="notice">${escapeHtml(message)}</div>`;
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat("en-PH", {
      style: "currency",
      currency: "PHP",
    }).format(value);
  }

  function formatTime(date) {
    return date.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => {
      const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
      return map[char];
    });
  }

  function installStaticDemoApi() {
    const terminals = [
      { id: "manila", name: "Cubao Terminal", city: "Manila" },
      { id: "baguio", name: "Gov. Pack Road", city: "Baguio" },
      { id: "la-union", name: "San Fernando Terminal", city: "La Union" },
      { id: "batangas", name: "Batangas Grand Terminal", city: "Batangas" },
      { id: "naga", name: "Naga Central Terminal", city: "Naga" },
    ];
    const buses = ["Deluxe", "Aircon", "Sleeper"];
    const storageKey = "voyage-demo-bookings";
    const originalFetch = window.fetch.bind(window);

    window.fetch = async (resource, options = {}) => {
      const url = typeof resource === "string" ? resource : resource.url;
      if (!url.startsWith("/api/")) return originalFetch(resource, options);

      if (url === "/api/auth/me") {
        return jsonResponse({ user: { username: "Demo Passenger", email: "demo@voyage.test", phone: "09171234567" } });
      }
      if (url === "/api/auth/logout") {
        return jsonResponse({ ok: true });
      }
      if (url === "/api/terminals") {
        return jsonResponse(terminals);
      }
      if (url.startsWith("/api/trips?")) {
        const params = new URLSearchParams(url.split("?")[1]);
        const origin = terminals.find((item) => item.id === params.get("originId"));
        const destination = terminals.find((item) => item.id === params.get("destinationId"));
        if (!origin || !destination || origin.id === destination.id) {
          return jsonResponse([]);
        }
        const date = params.get("date") || new Date().toISOString().slice(0, 10);
        const trips = buses.map((busType, index) => {
          const departure = new Date(`${date}T${String(7 + index * 4).padStart(2, "0")}:30:00`);
          const arrival = new Date(departure.getTime() + (5 + index) * 60 * 60 * 1000);
          const id = [origin.id, destination.id, date, index + 1].join("|");
          return {
            id,
            busType,
            price: 520 + index * 180,
            capacity: 32,
            seatsAvailable: 32 - takenSeats(id).length,
            departureTime: departure.toISOString(),
            arrivalTime: arrival.toISOString(),
            route: { origin, destination },
          };
        });
        return jsonResponse(trips);
      }
      const seatMatch = url.match(/^\/api\/trips\/(.+)\/seats$/);
      if (seatMatch) {
        const tripId = decodeURIComponent(seatMatch[1]);
        const taken = takenSeats(tripId);
        return jsonResponse({ capacity: 32, takenSeats: taken, seatsAvailable: 32 - taken.length });
      }
      if (url === "/api/bookings" && options.method === "POST") {
        const payload = JSON.parse(options.body || "{}");
        const booking = makeBooking(payload);
        const bookings = readBookings();
        bookings.push(booking);
        writeBookings(bookings);
        return jsonResponse(booking, 201);
      }
      if (url === "/api/bookings/lookup" && options.method === "POST") {
        const payload = JSON.parse(options.body || "{}");
        const booking = readBookings().find(
          (item) =>
            item.reference.toLowerCase() === String(payload.reference || "").toLowerCase() &&
            [item.contactEmail, item.contactPhone].some((contact) =>
              String(contact || "").toLowerCase() === String(payload.contact || "").toLowerCase()
            )
        );
        return booking ? jsonResponse(booking) : jsonResponse({ error: "Booking not found" }, 404);
      }
      const cancelMatch = url.match(/^\/api\/bookings\/(.+)\/cancel$/);
      if (cancelMatch && options.method === "POST") {
        const reference = decodeURIComponent(cancelMatch[1]);
        const bookings = readBookings();
        const booking = bookings.find((item) => item.reference === reference);
        if (!booking) return jsonResponse({ error: "Booking not found" }, 404);
        booking.status = "CANCELLED";
        writeBookings(bookings);
        return jsonResponse(booking);
      }
      return jsonResponse({ error: "Demo endpoint not available" }, 404);
    };

    function makeBooking(payload) {
      const [originId, destinationId, date] = String(payload.tripId || "").split("|");
      const origin = terminals.find((item) => item.id === originId) || terminals[0];
      const destination = terminals.find((item) => item.id === destinationId) || terminals[1];
      const seatNumbers = Array.isArray(payload.seatNumbers) ? payload.seatNumbers : [];
      const price = 620;
      return {
        reference: `VYG-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
        passengerName: payload.passengerName || "Demo Passenger",
        contactEmail: payload.contactEmail || "demo@voyage.test",
        contactPhone: payload.contactPhone || "09171234567",
        seatNumbers,
        totalPrice: price * seatNumbers.length,
        status: "CONFIRMED",
        paymentStatus: payload.paymentMethod === "MOCK_GCASH" ? "PAID" : "PAY ON BOARD",
        tripId: payload.tripId,
        tripDetails: {
          route: `${origin.name} to ${destination.name}`,
          date: date || new Date().toISOString().slice(0, 10),
          time: "07:30 AM",
        },
      };
    }

    function takenSeats(tripId) {
      return readBookings()
        .filter((booking) => booking.tripId === tripId && booking.status !== "CANCELLED")
        .flatMap((booking) => booking.seatNumbers);
    }

    function readBookings() {
      try {
        return JSON.parse(localStorage.getItem(storageKey) || "[]");
      } catch {
        return [];
      }
    }

    function writeBookings(bookings) {
      localStorage.setItem(storageKey, JSON.stringify(bookings));
    }

    function jsonResponse(data, status = 200) {
      return new Response(JSON.stringify(data), {
        status,
        headers: { "Content-Type": "application/json" },
      });
    }
  }
});
