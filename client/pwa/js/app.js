/* ====================================================
   AURA WELLNESS PWA - CLIENT APP
   Versión móvil del FlowManager para clientas.
   ==================================================== */
const app = document.getElementById("app");
const AppState = {
    currentPage: "login",
    user: null,
    client: null,
    coach: null,
    schedules: [],
    assignedSchedules: [],
    reservations: [],
    attendances: [],
    managerDashboard: null,
    selectedDate: localDateKey(),
    selectedMembershipId: null,
    loading: false,
    coachAgendaTab: "agenda"
};

const SESSION_TIMEOUT = 10 * 60 * 1000;
let inactivityTimer = null;
let inactivityWatcherStarted = false;
let qrObjectUrl = null;

function localDateKey(date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}
function esc(value) {
    return String(value ?? "").replace(/[&<>'"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;","\"":"&quot;"}[c]));
}
function dateObj(value) {
    if (!value) return null;
    const s = String(value).split("T")[0];
    const [y,m,d] = s.split("-").map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
}
function formatDate(value, opts = { day:"numeric", month:"long", year:"numeric" }) {
    const d = dateObj(value); if (!d) return "—";
    return d.toLocaleDateString("es-MX", opts);
}
function shortDate(value) { return formatDate(value, { day:"numeric", month:"short" }); }
function formatTime(value) { return String(value || "").slice(0,5) || "—"; }
function weekday(date) { return date.toLocaleDateString("en-US", { weekday:"long" }); }
function initials(name) { return String(name || "Usuario").trim().split(/\s+/).slice(0,2).map(x => x[0]).join("").toUpperCase(); }
function showToast(message, type="info") {
    document.querySelector(".aura-toast")?.remove();
    const el = document.createElement("div"); el.className = `aura-toast ${type}`; el.textContent = message;
    document.body.appendChild(el); setTimeout(() => el.remove(), 3300);
}

function resetInactivityTimer() {
    if (AppState.currentPage === "login") return;
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(() => logoutUser(true), SESSION_TIMEOUT);
}
function startInactivityWatcher() {
    if (inactivityWatcherStarted) return resetInactivityTimer();
    ["click","touchstart","keydown","scroll","mousemove"].forEach(name => document.addEventListener(name, () => resetInactivityTimer(), true));
    inactivityWatcherStarted = true; resetInactivityTimer();
}
function stopInactivityWatcher() { clearTimeout(inactivityTimer); inactivityTimer = null; }

function isCoachUser() {
    return String(AppState.user?.role || "").trim().toLowerCase() === "coach";
}

function isManagerUser() {
    const role = String(AppState.user?.role || "").trim().toLowerCase();
    return Boolean(AppState.user?.isRoot) || [
        "manager",
        "gerente",
        "admin",
        "administrator"
    ].includes(role);
}

function persistUser() {
    if (!AppState.user) return;

    const userJson = JSON.stringify(AppState.user);

    // Conservamos al usuario en el mismo almacenamiento que contiene
    // el token de sesión.
    if (localStorage.getItem("auraToken")) {
        localStorage.setItem("auraUser", userJson);
        sessionStorage.removeItem("auraUser");
    } else {
        sessionStorage.setItem("auraUser", userJson);
    }
}

async function refreshSessionUser() {
    try {
        const data = await apiGet("/auth/me");
        if (data?.user) {
            AppState.user = { ...AppState.user, ...data.user };
            persistUser();
        }
    } catch (error) {
        console.warn("No fue posible actualizar la sesión:", error);
    }
}

async function loadCoachProfile() {
    const coachId = AppState.user?.coachId;
    if (!coachId) {
        AppState.coach = null;
        AppState.assignedSchedules = [];
        return;
    }

    let coach = null;
    try {
        coach = await apiGet(`/coaches/${encodeURIComponent(coachId)}`);
        if (coach?.coach) coach = coach.coach;
    } catch (error) {
        console.warn("/coaches/:coachId no disponible; intentando lista de coaches.", error);
    }

    if (!coach) {
        try {
            const coaches = await apiGet("/coaches");
            if (Array.isArray(coaches)) {
                coach = coaches.find(item => String(item.coachId) === String(coachId)) || null;
            }
        } catch (error) {
            console.warn("No fue posible obtener el perfil del coach.", error);
        }
    }

    AppState.coach = coach || {
        coachId,
        fullName: AppState.user?.fullName || "Coach",
        email: AppState.user?.email || "",
        isActive: 1
    };

    AppState.user = {
        ...AppState.user,
        coachId: AppState.coach.coachId || coachId,
        fullName: AppState.coach.fullName || AppState.user.fullName,
        email: AppState.coach.email || AppState.user.email
    };
    persistUser();

    try {
        const schedules = await apiGet("/schedules");
        AppState.schedules = Array.isArray(schedules)
            ? schedules.filter(item => Number(item.isActive) !== 0)
            : [];
        AppState.assignedSchedules = AppState.schedules.filter(item =>
            String(item.coachId || "") === String(AppState.coach.coachId || coachId)
        );
    } catch (error) {
        console.error("No fue posible cargar los horarios del coach:", error);
        AppState.schedules = [];
        AppState.assignedSchedules = [];
    }

    try {
        const reservations = await apiGet("/reservations/coach");
        AppState.reservations = Array.isArray(reservations) ? reservations : [];
    } catch (error) {
        console.error("No fue posible cargar las reservaciones del coach:", error);
        AppState.reservations = [];
    }
}

async function refreshManagerData() {
    try {
        AppState.managerDashboard = await apiGet("/dashboard");
    } catch (error) {
        console.error("No fue posible cargar el dashboard del gerente:", error);
        AppState.managerDashboard = null;
        throw error;
    }
}

async function refreshCurrentUserData() {
    await refreshSessionUser();
    if (isManagerUser()) {
        await refreshManagerData();
        if (AppState.currentPage !== "login") renderApp();
        return;
    }
    if (isCoachUser()) {
        await loadCoachProfile();
        if (AppState.currentPage !== "login") renderApp();
        return;
    }
    await refreshClientData();
}

async function loadCoachAvailabilityForDate(dateKey = AppState.selectedDate) {
    if (!isCoachUser()) return;
    AppState.selectedDate = dateKey;
    const target = dateObj(dateKey);
    const targetWeekday = target ? weekday(target).toLowerCase() : "";
    const assigned = AppState.assignedSchedules.filter(schedule =>
        String(schedule.weekday || "").toLowerCase() === targetWeekday
    );

    const results = await Promise.all(assigned.map(async schedule => {
        try {
            const data = await apiGet(`/reservations/coach/availability?${new URLSearchParams({
                scheduleId: schedule.scheduleId,
                from: dateKey,
                to: dateKey
            }).toString()}`);
            const info = data?.dates?.[dateKey] || {};
            return {
                ...schedule,
                remaining: Number(info.remaining ?? Math.max(0, Number(schedule.capacity || 0))),
                occupied: Number(info.occupied || 0),
                eligible: Boolean(info.eligible)
            };
        } catch (error) {
            console.warn("Coach availability error", schedule.scheduleId, error);
            return { ...schedule, remaining: 0, occupied: 0, eligible: false };
        }
    }));
    AppState.schedules = results.sort((a,b) => String(a.startTime).localeCompare(String(b.startTime)));
}

async function refreshClientData() {
    const clientId = AppState.user?.clientId;
    if (!clientId) return;
    try {
        const [client, reservations, attendances] = await Promise.all([
            apiGet(`/clients/${encodeURIComponent(clientId)}`),
            apiGet(`/reservations/client/${encodeURIComponent(clientId)}`),
            apiGet(`/attendance/client/${encodeURIComponent(clientId)}`)
        ]);
        AppState.client = client;
        AppState.reservations = Array.isArray(reservations) ? reservations : [];
        AppState.attendances = Array.isArray(attendances) ? attendances : [];
        AppState.user = { ...AppState.user, ...client, fullName: client.fullName || AppState.user.fullName, email: client.userEmail || client.email || AppState.user.email };
        persistUser();
        if (AppState.currentPage !== "login") renderApp();
    } catch (error) {
        console.error("Error actualizando cliente:", error);
        if (error.message?.toLowerCase().includes("sesión")) throw error;
    }
}

async function loadSchedulesForDate(dateKey = AppState.selectedDate) {
    AppState.selectedDate = dateKey;
    const schedules = await apiGet("/schedules");
    const target = dateObj(dateKey);
    const targetWeekday = target ? weekday(target).toLowerCase() : "";
    const active = (schedules || []).filter(s => String(s.weekday || "").toLowerCase() === targetWeekday && Number(s.isActive) === 1);
    const from = dateKey, to = dateKey;
    const results = await Promise.all(active.map(async schedule => {
        try {
            const data = await apiGet(`/reservations/availability?clientId=${encodeURIComponent(AppState.user.clientId)}&scheduleId=${encodeURIComponent(schedule.scheduleId)}&from=${from}&to=${to}`);
            const info = data?.dates?.[dateKey] || {};
            return { ...schedule, remaining: Number(info.remaining ?? Math.max(0, Number(schedule.capacity || 0))), occupied: Number(info.occupied || 0), eligible: Boolean(info.eligible) };
        } catch (error) {
            console.warn("Availability error", schedule.scheduleId, error);
            return { ...schedule, remaining: Number(schedule.capacity || 0), occupied: 0, eligible: true };
        }
    }));
    AppState.schedules = results.sort((a,b) => String(a.startTime).localeCompare(String(b.startTime)));
}

function navigateTo(page) {
    stopQrScanner();
    AppState.currentPage = page;
    renderApp();
    resetInactivityTimer();

    if (isManagerUser()) {
        if (page === "home" || page === "profile") {
            refreshManagerData().then(renderApp).catch(console.error);
        }
        return;
    }

    if (isCoachUser()) {
        if (page === "home" || page === "profile") {
            loadCoachProfile().then(renderApp).catch(console.error);
        }
        if (page === "reserve") {
            renderCoachReservePageAsync();
        }
        if (page === "qr") {
            setTimeout(startQrScanner, 50);
        }
        return;
    }

    if (page === "reservations") loadAndRenderReservations();
    if (page === "attendance") loadAndRenderAttendance();
    if (page === "home") refreshClientData().catch(console.error);
    if (page === "qr") loadQr();
}

function renderLoginPage() {
    return `<section class="login-page">
        <div class="login-brand"><img src="./assets/logo/logoaura.png" onerror="this.onerror=null;this.src='./assets/logo.png'" alt="Aura Wellness"></div>
        <div class="login-welcome"><h1>Bienvenido de nuevo</h1><p>Inicia sesión para continuar tu bienestar</p></div>
        <form class="login-form" onsubmit="loginUser(event)">
            <label class="input-wrap"><i class="fa-regular fa-envelope"></i><input id="loginEmail" type="email" placeholder="Correo electrónico" autocomplete="email"></label>
            <label class="input-wrap"><i class="fa-solid fa-lock"></i><input id="loginPassword" type="password" placeholder="Contraseña" autocomplete="current-password"><button type="button" onclick="togglePassword()"><i id="passwordIcon" class="fa-regular fa-eye"></i></button></label>
            <div class="login-options"><label><input id="rememberMe" type="checkbox"><span></span>Recordarme</label><button type="button" class="link-button">¿Olvidaste tu contraseña?</button></div>
            <button id="loginButton" class="primary-button" type="submit">Iniciar sesión</button>
        </form>
        <div class="login-divider"><span></span><em>o continúa con</em><span></span></div>
        <div class="login-footer-logo">♧ <b>AURA</b><small> WELLNESS</small></div>
    </section>`;
}
function togglePassword() {
    const input = document.getElementById("loginPassword"), icon = document.getElementById("passwordIcon");
    if (!input) return; input.type = input.type === "password" ? "text" : "password";
    if (icon) icon.className = input.type === "password" ? "fa-regular fa-eye" : "fa-regular fa-eye-slash";
}

function renderHeader(title) {
    return `<header class="topbar"><button class="icon-button" onclick="toggleUserMenu()"><i class="fa-solid fa-bars"></i></button><h2>${esc(title)}</h2><button class="icon-button"><i class="fa-regular fa-bell"></i></button><div id="userMenu" class="user-menu hidden"><button onclick="logoutUser()"><i class="fa-solid fa-right-from-bracket"></i>Cerrar sesión</button></div></header>`;
}
function renderBottomNavigation() {
    if (AppState.currentPage === "login") return "";
    const item = (page, icon, label) => `<button class="bottom-item ${AppState.currentPage === page ? "active" : ""}" onclick="navigateTo('${page}')"><i class="${icon}"></i><span>${label}</span></button>`;
    if (isManagerUser()) {
        return `<nav class="bottom-nav manager-bottom-nav">${item("home","fa-regular fa-house","Inicio")}${item("profile","fa-regular fa-user","Perfil")}</nav>`;
    }
    if (isCoachUser()) {
        return `<nav class="bottom-nav coach-bottom-nav">${item("home","fa-regular fa-house","Inicio")}${item("reserve","fa-regular fa-calendar","Mi agenda")}${item("qr","fa-solid fa-qrcode","Escanear QR")}${item("profile","fa-regular fa-user","Perfil")}</nav>`;
    }
    return `<nav class="bottom-nav">${item("home","fa-regular fa-house","Inicio")}${item("reserve","fa-regular fa-calendar","Reservar")}${item("reservations","fa-regular fa-calendar-check","Reservas")}${item("qr","fa-solid fa-qrcode","QR")}${item("profile","fa-regular fa-user","Perfil")}</nav>`;
}
function toggleUserMenu() { document.getElementById("userMenu")?.classList.toggle("hidden"); }

function membershipCard(client = AppState.client || {}) {
    const pkg = (client.packages || []).find(x => x.status === "ACTIVE") || (client.packages || []).find(x => x.status === "FROZEN") || (client.packages || [])[0];
    const name = pkg?.membershipName || client.membershipName || "Sin membresía";
    const remaining = pkg?.remainingClasses ?? client.remainingClasses;
    const unlimited = remaining === null || remaining === undefined;
    const expires = pkg?.expiresAt || client.endDate;
    const status = pkg?.status || client.membershipStatus || "—";
    const statusLabel = {ACTIVE:"Activa",FROZEN:"Congelada",PENDING_ACTIVATION:"Pendiente"}[status] || status;
    return `<div class="card membership-card"><div class="card-row"><div><span class="eyebrow">Tu membresía</span><h3 class="gold-text">${esc(name)}</h3><p>Vence ${expires ? `el ${formatDate(expires)}` : "—"}</p></div><span class="badge ${status === "ACTIVE" ? "success" : "warning"}">${esc(statusLabel)}</span></div><div class="metric-row"><div><strong>${unlimited ? "∞" : esc(remaining)}</strong><span>${unlimited ? "Ilimitado" : "Clases"}</span></div><div><strong>${expires ? shortDate(expires) : "—"}</strong><span>Vencimiento</span></div><div><strong><i class="fa-regular fa-circle-check"></i></strong><span>${esc(statusLabel)}</span></div></div></div>`;
}

function renderManagerHomePage() {
    const d = AppState.managerDashboard || {};
    const recent = Array.isArray(d.recentReservations) ? d.recentReservations.slice(0, 6) : [];
    const upcoming = Array.isArray(d.upcomingClasses) ? d.upcomingClasses.slice(0, 6) : [];
    const attendances = Array.isArray(d.recentAttendances) ? d.recentAttendances.slice(0, 6) : [];
    return `<div class="page"><div class="content">${renderHeader("Panel de Gerencia")}<section class="hero"><span class="eyebrow">AURA WELLNESS</span><h1>Hola, ${esc((AppState.user?.fullName || "Gerencia").split(" ")[0])} 👋</h1><p>Resumen operativo de Aura Wellness.</p></section><div class="metric-row card"><div><strong>${esc(d.activeClients ?? 0)}</strong><span>Clientes activos</span></div><div><strong>${esc(d.todayReservations ?? 0)}</strong><span>Reservas hoy</span></div><div><strong>${esc(d.todayAttendances ?? 0)}</strong><span>Asistencias hoy</span></div></div><div class="metric-row card"><div><strong>${esc(d.todayClasses ?? 0)}</strong><span>Clases hoy</span></div><div><strong>${esc(d.occupancy ?? 0)}%</strong><span>Ocupación</span></div><div><strong>${esc(d.activeCoaches ?? 0)}</strong><span>Coaches activos</span></div></div><h2 class="section-heading">Estado de clientes</h2><div class="metric-row card"><div><strong>${esc(d.expiredClients ?? 0)}</strong><span>Vencidos</span></div><div><strong>${esc(d.noClassesClients ?? 0)}</strong><span>Sin clases</span></div><div><strong>${esc(d.activeMemberships ?? 0)}</strong><span>Membresías activas</span></div></div><h2 class="section-heading">Clases de hoy</h2><div class="stack-list">${upcoming.length ? upcoming.map(x=>`<article class="reservation-card"><div class="activity-icon"><i class="${esc(x.activityIcon || "fa-regular fa-calendar")}"></i></div><div class="reservation-body"><h3>${esc(x.activityName || "Clase")}</h3><p>${esc(x.startTime || "—")} · ${esc(x.coachName || "Sin coach")}</p><p>${esc(x.reserved ?? 0)} / ${esc(x.capacity ?? 0)} lugares · ${esc(x.remaining ?? 0)} disponibles</p></div></article>`).join("") : `<div class="card empty-card"><p>No hay clases programadas para hoy.</p></div>`}</div><h2 class="section-heading">Reservas recientes</h2><div class="stack-list">${recent.length ? recent.map(x=>`<article class="reservation-card"><div class="activity-icon"><i class="${esc(x.activityIcon || "fa-regular fa-calendar")}"></i></div><div class="reservation-body"><h3>${esc(x.clientName || "Cliente")}</h3><p>${esc(x.activityName || "Clase")} · ${esc(x.reservationDate || "—")} · ${esc(x.startTime || "—")}</p><span class="badge success">${esc(x.status || "CONFIRMED")}</span></div></article>`).join("") : `<div class="card empty-card"><p>No hay reservas recientes.</p></div>`}</div><h2 class="section-heading">Asistencias recientes</h2><div class="stack-list">${attendances.length ? attendances.map(x=>`<article class="attendance-card"><div class="activity-icon"><i class="${esc(x.activityIcon || "fa-solid fa-check")}"></i></div><div><h3>${esc(x.fullName || "Cliente")}</h3><p>${esc(x.activityName || "Clase")} · ${esc(x.startTime || "—")}</p></div><span class="badge success">Asistió</span></article>`).join("") : `<div class="card empty-card"><p>No hay asistencias recientes.</p></div>`}</div></div></div>`;
}

function renderHomePage() {
    if (isManagerUser()) return renderManagerHomePage();
    if (isCoachUser()) return renderCoachHomePage();
    const client = AppState.client || AppState.user || {};
    const upcoming = AppState.reservations.filter(r => r.status === "CONFIRMED" && new Date(`${String(r.reservationDate).split("T")[0]}T${formatTime(r.startTime)}:00`) >= new Date()).sort((a,b)=>new Date(a.reservationDate)-new Date(b.reservationDate))[0];
    return `<div class="page"><div class="content">${renderHeader("Inicio")}<section class="hero"><span class="eyebrow">AURA WELLNESS</span><h1>¡Hola, ${esc((client.fullName || "Usuario").split(" ")[0])}! 👋</h1><p>Tu bienestar, nuestra prioridad.</p></section>${membershipCard(client)}${upcoming ? `<div class="card next-class"><div class="section-label">Próxima clase reservada <i class="fa-solid fa-chevron-right"></i></div><div class="class-main"><div class="activity-icon"><i class="fa-regular fa-calendar"></i></div><div><h3>${esc(upcoming.activityName || "Clase")}</h3><p>${formatDate(upcoming.reservationDate,{weekday:"long",day:"numeric",month:"long"})} · ${formatTime(upcoming.startTime)}</p><p>${esc(upcoming.coachName || "Coach")} · ${esc(upcoming.studio || "Aura Wellness")}</p></div></div></div>` : `<div class="card empty-card"><h3>No tienes próximas reservas</h3><p>Elige una clase y reserva tu lugar.</p><button class="outline-button" onclick="navigateTo('reserve')">Reservar clase</button></div>`}<h2 class="section-heading">Accesos rápidos</h2><div class="quick-grid"><button onclick="navigateTo('reserve')"><i class="fa-regular fa-calendar-plus"></i><span>Reservar<br>clase</span></button><button onclick="navigateTo('reservations')"><i class="fa-regular fa-calendar-check"></i><span>Mis<br>reservas</span></button><button onclick="navigateTo('qr')"><i class="fa-solid fa-qrcode"></i><span>Mi<br>código QR</span></button><button onclick="navigateTo('profile')"><i class="fa-regular fa-user"></i><span>Mi<br>perfil</span></button></div><div class="wellness-banner"><div><b>Tu bienestar,</b><br><strong>nuestra prioridad 🤎</strong></div><span>♧</span></div></div></div>`;
}

function coachScheduleForDate(dateKey = localDateKey()) {
    const target = dateObj(dateKey);
    const targetWeekday = target ? weekday(target).toLowerCase() : "";
    return AppState.assignedSchedules
        .filter(s => String(s.weekday || "").toLowerCase() === targetWeekday)
        .sort((a,b) => String(a.startTime).localeCompare(String(b.startTime)));
}

function renderCoachHomePage() {
    const coach = AppState.coach || AppState.user || {};
    const todayClasses = coachScheduleForDate(localDateKey());

    return `<div class="page"><div class="content">${renderHeader("Inicio")}
        <section class="hero"><span class="eyebrow">AURA WELLNESS · COACH</span><h1>¡Hola, ${esc((coach.fullName || "Coach").split(" ")[0])}! 👋</h1><p>Estas son tus clases asignadas.</p></section>
        <div class="card coach-identity-card"><div class="coach-avatar avatar">${esc(initials(coach.fullName || "Coach"))}</div><div><span class="eyebrow">PERFIL DE COACH</span><h2>${esc(coach.fullName || "Coach")}</h2><p>${esc(coach.email || AppState.user?.email || "")}</p></div><span class="badge success">Activo</span></div>
        <div class="coach-stats metric-row card"><div><strong>${todayClasses.length}</strong><span>Clases hoy</span></div><div><strong>${AppState.assignedSchedules.length}</strong><span>Clases asignadas</span></div><div><strong>${AppState.reservations.filter(r=>r.status === "CONFIRMED").length}</strong><span>Mis reservas</span></div></div>
        <h2 class="section-heading">Clases asignadas hoy</h2>
        <div class="stack-list">${todayClasses.length ? todayClasses.map(s=>`<article class="coach-class-card"><div class="activity-icon"><i class="${esc(s.icon || "fa-regular fa-calendar")}"></i></div><div class="class-info"><h3>${esc(s.name || s.activityName || "Clase")}</h3><p>${formatTime(s.startTime)} – ${formatTimeEnd(s.startTime,s.duration)}</p><p>${Number(s.capacity || 0)} lugares · ${esc(s.studio || "Aura Wellness")}</p></div><span class="badge success">Asignada</span></article>`).join("") : `<div class="card empty-card"><h3>No tienes clases asignadas hoy</h3><p>Tu agenda se actualizará automáticamente.</p></div>`}</div>
        <button class="wide-outline-button" onclick="navigateTo('reserve')"><span>Ver agenda completa</span><i class="fa-solid fa-chevron-right"></i></button>
        <div class="wellness-banner"><div><b>Tu bienestar,</b><br><strong>nuestra prioridad 🤎</strong></div><span>♧</span></div>
    </div></div>`;
}

async function renderCoachReservePageAsync() {
    if (AppState.coachAgendaTab !== "agenda") {
        const list = document.querySelector("#coachReservationsList");
        if (list) list.innerHTML = renderCoachReservationsList();
        return;
    }
    try { await loadCoachAvailabilityForDate(AppState.selectedDate); } catch (e) { console.error(e); }
    const list = document.querySelector("#reserveList");
    if (!list) return;
    list.innerHTML = AppState.schedules.length
        ? AppState.schedules.map(coachScheduleCard).join("")
        : `<div class="card empty-card"><h3>No tienes clases asignadas este día</h3><p>Solo puedes reservar clases que estén asignadas a tu perfil.</p></div>`;
}

function renderCoachAgendaTabs() {
    return `<div class="tabs coach-agenda-tabs"><button class="${AppState.coachAgendaTab === "agenda" ? "active" : ""}" onclick="setCoachAgendaTab('agenda')">Agenda</button><button class="${AppState.coachAgendaTab === "reservations" ? "active" : ""}" onclick="setCoachAgendaTab('reservations')">Mis reservas</button></div>`;
}

function renderCoachReservationsList() {
    const upcoming = AppState.reservations.filter(r=>r.status === "CONFIRMED").sort((a,b)=>String(a.reservationDate).localeCompare(String(b.reservationDate)) || String(a.startTime).localeCompare(String(b.startTime)));
    const history = AppState.reservations.filter(r=>r.status !== "CONFIRMED");
    return `<div id="coachReservationsList"><h2 class="section-heading">Próximas reservas</h2><div class="stack-list">${upcoming.length ? upcoming.map(r=>renderCoachReservationCard(r)).join("") : `<div class="card empty-card"><h3>No tienes reservas próximas</h3><button class="outline-button" onclick="setCoachAgendaTab('agenda')">Reservar una clase</button></div>`}</div><h2 class="section-heading">Historial</h2><div class="stack-list">${history.length ? history.slice(0,20).map(r=>renderCoachReservationCard(r,true)).join("") : `<div class="card empty-card"><p>Aún no tienes historial de reservas.</p></div>`}</div></div>`;
}

function setCoachAgendaTab(tab) {
    AppState.coachAgendaTab = tab === "reservations" ? "reservations" : "agenda";
    renderApp();
    if (AppState.coachAgendaTab === "agenda") renderCoachReservePageAsync();
}

function renderCoachReservePage() {
    if (AppState.coachAgendaTab === "reservations") {
        return `<div class="page"><div class="content">${renderHeader("Mi agenda")}
            <section class="hero compact"><span class="eyebrow">AGENDA PERSONAL</span><h1>Mi agenda</h1><p>Consulta tu agenda y administra tus reservas.</p></section>
            ${renderCoachAgendaTabs()}
            ${renderCoachReservationsList()}
        </div></div>`;
    }
    return `<div class="page"><div class="content">${renderHeader("Mi agenda")}
        <section class="hero compact"><span class="eyebrow">AGENDA PERSONAL</span><h1>Mi agenda</h1><p>Agenda una clase y consulta tus reservas.</p></section>
        ${renderCoachAgendaTabs()}
        <div class="card date-card"><label>Fecha<input type="date" value="${AppState.selectedDate}" onchange="selectCoachDate(this.value)"></label></div>
        <div class="section-title-row"><div><h2>Clases asignadas</h2><p>${formatDate(AppState.selectedDate,{weekday:"long",day:"numeric",month:"long"})}</p></div><button class="icon-button light" onclick="renderCoachReservePageAsync()"><i class="fa-solid fa-rotate"></i></button></div>
        <div id="reserveList" class="stack-list"><div class="card loading-card">Consultando tu agenda...</div></div>
    </div></div>`;
}

async function reserveCoachClass(scheduleId, reservationDate) {
    if (!scheduleId || !reservationDate) return showToast("No fue posible identificar la clase.", "error");
    try {
        await apiPost("/reservations/coach/batch", { scheduleId, reservationDates: [reservationDate] });
        showToast("Reservación realizada correctamente.", "success");
        await loadCoachProfile();
        if (AppState.currentPage === "reserve") await renderCoachReservePageAsync();
        renderApp();
    } catch (error) {
        showToast(error.message, "error");
        if (AppState.currentPage === "reserve") renderCoachReservePageAsync();
    }
}

async function loadCoachReservations() {
    try {
        const reservations = await apiGet("/reservations/coach");
        AppState.reservations = Array.isArray(reservations) ? reservations : [];
        renderApp();
    } catch (error) {
        showToast(error.message, "error");
    }
}

function renderCoachReservationCard(r, history = false) {
    const statusMap = { CONFIRMED:"Confirmada", CANCELLED:"Cancelada", ATTENDED:"Asistió", NO_SHOW:"No asistió" };
    const statusClass = r.status === "CONFIRMED" ? "success" : r.status === "CANCELLED" ? "cancelled" : "neutral";
    return `<article class="reservation-card"><div class="activity-icon"><i class="${esc(r.activityIcon || "fa-regular fa-calendar")}"></i></div><div class="reservation-body"><div class="reservation-top"><h3>${esc(r.activityName || "Clase")}</h3><span class="badge ${statusClass}">${statusMap[r.status] || esc(r.status || "—")}</span></div><p>${formatDate(r.reservationDate,{weekday:"long",day:"numeric",month:"long"})}</p><p>${formatTime(r.startTime)} ${r.duration ? `– ${formatTimeEnd(r.startTime,r.duration)}` : ""}</p><p>Reserva personal de coach</p>${!history && canCancelReservation(r) ? `<button class="cancel-link" onclick="cancelCoachReservation('${esc(r.reservationId)}')">Cancelar reserva <i class="fa-regular fa-trash-can"></i></button>` : ""}</div></article>`;
}

function renderCoachReservationsPage() {
    const upcoming = AppState.reservations.filter(r=>r.status === "CONFIRMED").sort((a,b)=>String(a.reservationDate).localeCompare(String(b.reservationDate)) || String(a.startTime).localeCompare(String(b.startTime)));
    const history = AppState.reservations.filter(r=>r.status !== "CONFIRMED");
    return `<div class="page"><div class="content">${renderHeader("Mis Reservas")}<section class="hero compact"><span class="eyebrow">COACH</span><h1>Mis reservas</h1><p>Consulta tus reservas personales y su estado.</p></section><h2 class="section-heading">Próximas reservas</h2><div class="stack-list">${upcoming.length ? upcoming.map(r=>renderCoachReservationCard(r)).join("") : `<div class="card empty-card"><h3>No tienes reservas próximas</h3><button class="outline-button" onclick="navigateTo('reserve')">Reservar una clase</button></div>`}</div><h2 class="section-heading">Historial</h2><div class="stack-list">${history.length ? history.slice(0,20).map(r=>renderCoachReservationCard(r,true)).join("") : `<div class="card empty-card"><p>Aún no tienes historial de reservas.</p></div>`}</div></div></div>`;
}

async function cancelCoachReservation(reservationId) {
    if (!reservationId) return;
    if (!confirm("¿Cancelar esta reservación personal?")) return;
    try {
        await apiDelete(`/reservations/${encodeURIComponent(reservationId)}`);
        showToast("Reservación cancelada.", "success");
        await loadCoachReservations();
    } catch (error) { showToast(error.message, "error"); }
}

function renderCoachProfilePage() {
    const c = AppState.coach || AppState.user || {};
    const name = c.fullName || "Coach";
    const assigned = AppState.assignedSchedules || [];
    return `<div class="page"><div class="content">${renderHeader("Mi Perfil")}
        <section class="profile-card card coach-profile-card"><div class="avatar coach-avatar">${esc(initials(name))}</div><span class="eyebrow">PERFIL DE COACH</span><h1>${esc(name)}</h1><p>${esc(c.coachId || AppState.user?.coachId || "—")}</p><p>${esc(c.email || AppState.user?.email || "")}</p>${c.phone ? `<p>${esc(c.phone)}</p>` : ""}<span class="badge ${Number(c.isActive) === 0 ? "cancelled" : "success"}">${Number(c.isActive) === 0 ? "Inactivo" : "Activo"}</span></section>
        <div class="card detail-card"><div class="section-title-row profile-section-title"><h2>Información personal</h2><button class="icon-button light" onclick="loadCoachProfile().then(renderApp)"><i class="fa-solid fa-rotate"></i></button></div>${detailRow("fa-regular fa-id-card","ID de coach",c.coachId)}${detailRow("fa-regular fa-envelope","Correo electrónico",c.email || AppState.user?.email)}${detailRow("fa-solid fa-phone","Teléfono",c.phone)}${detailRow("fa-solid fa-coins","Pago por clase",c.paymentPerClass != null ? `$${Number(c.paymentPerClass).toLocaleString("es-MX")}` : "—")}${detailRow("fa-regular fa-note-sticky","Notas",c.notes)}</div>
        <div class="card qr-card coach-qr-card"><div class="section-title-row profile-section-title"><div><h2>Mi código QR</h2><p>Identificación de coach</p></div><button class="icon-button light" onclick="loadCoachQr()"><i class="fa-solid fa-rotate"></i></button></div><div id="coachQrContainer" class="qr-container"><div class="qr-loading"><i class="fa-solid fa-spinner fa-spin"></i><span>Generando QR...</span></div></div><h2>${esc(name)}</h2><p>${esc(AppState.user?.userId || "—")}</p><div class="qr-caption"><i class="fa-solid fa-shield-halved"></i><span>Este código identifica tu cuenta de coach en FlowManager.</span></div></div>
        <div class="card detail-card"><h2>Clases asignadas</h2>${assigned.length ? `<div class="stack-list">${assigned.sort((a,b)=>String(a.weekday).localeCompare(String(b.weekday)) || String(a.startTime).localeCompare(String(b.startTime))).map(s=>`<article class="coach-class-card"><div class="activity-icon"><i class="${esc(s.icon || "fa-regular fa-calendar")}"></i></div><div class="class-info"><h3>${esc(s.name || s.activityName || "Clase")}</h3><p>${esc(s.weekday || "")} · ${formatTime(s.startTime)} – ${formatTimeEnd(s.startTime,s.duration)}</p><p>Capacidad: ${Number(s.capacity || 0)}</p></div></article>`).join("")}</div>` : `<p class="muted-copy">No tienes clases asignadas actualmente.</p>`}</div>
        <div class="card info-card"><i class="fa-regular fa-circle-info"></i><div><b>Cuenta de coach</b><p>Tu acceso está vinculado automáticamente a tu perfil de coach. Las reservaciones personales usan las reglas de FlowManager y el servidor vuelve a validar tu identidad.</p></div></div>
    </div></div>`;
}

function dateStrip() {
    const base = dateObj(AppState.selectedDate) || new Date();
    const days = [-2,-1,0,1,2].map(offset => { const d=new Date(base); d.setDate(d.getDate()+offset); return d; });
    return `<div class="date-strip">${days.map(d=>`<button class="date-chip ${localDateKey(d)===AppState.selectedDate?"selected":""}" onclick="selectDate('${localDateKey(d)}')"><small>${d.toLocaleDateString("es-MX",{weekday:"short"}).replace(".","").toUpperCase()}</small><b>${d.getDate()}</b></button>`).join("")}</div>`;
}
async function selectDate(date) {
    AppState.selectedDate = date; renderApp();
    try { await loadSchedulesForDate(date); renderApp(); } catch(e) { showToast(e.message,"error"); }
}
function scheduleCard(s) {
    const remaining = Number(s.remaining ?? s.capacity ?? 0);
    const already = AppState.reservations.some(r => r.status === "CONFIRMED" && r.scheduleId === s.scheduleId && String(r.reservationDate).split("T")[0] === AppState.selectedDate);
    const eligible = s.eligible !== false && remaining > 0 && !already;
    return `<article class="class-card"><div class="activity-icon"><i class="${esc(s.icon || "fa-regular fa-calendar")}"></i></div><div class="class-info"><h3>${esc(s.name || "Clase")}</h3><p>${formatTime(s.startTime)} – ${formatTimeEnd(s.startTime,s.duration)}</p><p>${esc(s.coachName || "Coach")} ${s.studio ? `· ${esc(s.studio)}` : ""}</p></div><div class="places"><strong class="${remaining <= 2 ? "low" : ""}">${remaining}</strong><span>lugares</span><button class="primary-mini" ${eligible ? "" : "disabled"} onclick="reserveClass('${esc(s.scheduleId)}','${AppState.selectedDate}')">${already ? "Reservada" : remaining <= 0 ? "Llena" : "Reservar"}</button></div></article>`;
}
function formatTimeEnd(start,duration) { if(!start || !duration) return "—"; const [h,m]=String(start).slice(0,5).split(":").map(Number); const x=new Date(2000,0,1,h,m+Number(duration)); return x.toLocaleTimeString("es-MX",{hour:"2-digit",minute:"2-digit",hour12:true}).replace(".",""); }
async function renderReservePageAsync() {
    try { await loadSchedulesForDate(AppState.selectedDate); } catch(e) { console.error(e); }
    const list = AppState.schedules;
    const content = document.querySelector("#reserveList");
    if (!content) return;
    content.innerHTML = list.length ? list.map(scheduleCard).join("") : `<div class="card empty-card"><h3>No hay clases disponibles</h3><p>No hay horarios para este día.</p></div>`;
}
function renderReservePage() {
    if (isCoachUser()) return renderCoachReservePage();
    return `<div class="page"><div class="content">${renderHeader("Reserva de Clase")}<section class="hero compact"><span class="eyebrow">AGENDA</span><h1>Reserva tu clase</h1><p>Elige una fecha y consulta los lugares reales.</p></section><div class="card date-card"><label>Fecha<input type="date" value="${AppState.selectedDate}" onchange="selectDate(this.value)"></label></div><div class="section-title-row"><div><h2>Clases disponibles</h2><p>${formatDate(AppState.selectedDate,{weekday:"long",day:"numeric",month:"long"})}</p></div><button class="icon-button light" onclick="renderReservePageAsync()"><i class="fa-solid fa-rotate"></i></button></div><div id="reserveList" class="stack-list"><div class="card loading-card">Consultando horarios...</div></div></div></div>`;
}
async function reserveClass(scheduleId, reservationDate) {
    const clientId = AppState.user?.clientId;
    if (!clientId || !scheduleId || !reservationDate) return showToast("No fue posible identificar la clase.","error");
    const button = event?.currentTarget; if (button) button.disabled=true;
    try {
        const pkg = (AppState.client?.packages || []).find(x=>x.status === "ACTIVE");
        await apiPost("/reservations", { clientId, scheduleId, reservationDate, clientMembershipId: pkg?.clientMembershipId || null });
        showToast("Clase reservada correctamente.","success");
        await refreshClientData(); await loadSchedulesForDate(reservationDate); renderApp();
    } catch(error) { showToast(error.message,"error"); if(button) button.disabled=false; }
}

function canCancelReservation(r) {
    if (r.status !== "CONFIRMED") return false;
    const date = String(r.reservationDate).split("T")[0]; const time = formatTime(r.startTime);
    const start = new Date(`${date}T${time}:00`); return Number.isFinite(start.getTime()) && start.getTime()-Date.now() >= 3*60*60*1000;
}
function reservationCard(r, history=false) {
    const statusMap={CONFIRMED:"Confirmada",CANCELLED:"Cancelada",ATTENDED:"Asistió",NO_SHOW:"No asistió"};
    return `<article class="reservation-card"><div class="activity-icon"><i class="${esc(r.activityIcon || "fa-regular fa-calendar")}"></i></div><div class="reservation-body"><div class="reservation-top"><h3>${esc(r.activityName || "Clase")}</h3><span class="badge ${r.status === "CONFIRMED" ? "success" : r.status === "CANCELLED" ? "cancelled" : "neutral"}">${statusMap[r.status] || esc(r.status)}</span></div><p>${formatDate(r.reservationDate,{weekday:"long",day:"numeric",month:"long"})}</p><p>${formatTime(r.startTime)} ${r.duration ? `– ${formatTimeEnd(r.startTime,r.duration)}` : ""}</p><p>${esc(r.coachName || "Coach")} ${r.studio ? `· ${esc(r.studio)}` : ""}</p>${!history && canCancelReservation(r) ? `<button class="cancel-link" onclick="cancelReservation('${esc(r.reservationId)}')">Cancelar reserva <i class="fa-regular fa-trash-can"></i></button>` : ""}</div></article>`;
}
function renderReservationsPage() {
    if (isCoachUser()) return renderCoachReservationsPage();
    const upcoming = AppState.reservations.filter(r=>r.status === "CONFIRMED").sort((a,b)=>new Date(a.reservationDate)-new Date(b.reservationDate));
    const history = AppState.reservations.filter(r=>r.status !== "CONFIRMED");
    return `<div class="page"><div class="content">${renderHeader("Mis Reservas")}<section class="hero compact"><h1>Mis reservas</h1><p>Consulta y administra tus clases.</p></section><div class="tabs"><button class="active">Próximas</button><button>Historial</button></div><h2 class="section-heading">Próximas reservas</h2><div class="stack-list">${upcoming.length ? upcoming.map(r=>reservationCard(r)).join("") : `<div class="card empty-card"><h3>No tienes reservas próximas</h3><button class="outline-button" onclick="navigateTo('reserve')">Reservar una clase</button></div>`}</div><h2 class="section-heading">Historial</h2><div class="stack-list">${history.length ? history.slice(0,20).map(r=>reservationCard(r,true)).join("") : `<div class="card empty-card"><p>Aún no tienes historial de reservas.</p></div>`}</div></div></div>`;
}
async function loadAndRenderReservations(){ try{ AppState.reservations=await apiGet(`/reservations/client/${encodeURIComponent(AppState.user.clientId)}`)||[]; renderApp(); }catch(e){showToast(e.message,"error");} }
async function cancelReservation(reservationId){
    if(!reservationId) return;
    if(!confirm("¿Cancelar esta reservación? La clase será devuelta a tu paquete si corresponde.")) return;
    try{ await apiDelete(`/reservations/${encodeURIComponent(reservationId)}`); showToast("Reservación cancelada.","success"); await refreshClientData(); }catch(e){showToast(e.message,"error");}
}

function renderAttendancePage(){
    return `<div class="page"><div class="content">${renderHeader("Mis Asistencias")}<section class="hero compact"><span class="eyebrow">HISTORIAL</span><h1>Mis asistencias</h1><p>Consulta tus clases realizadas.</p></section><div class="stack-list">${AppState.attendances.length ? AppState.attendances.map(a=>`<article class="attendance-card"><div class="activity-icon"><i class="${esc(a.activityIcon || "fa-solid fa-check")}"></i></div><div><h3>${esc(a.activityName || "Clase")}</h3><p>${formatDate(a.attendanceDate,{weekday:"long",day:"numeric",month:"long"})}</p><p>${formatTime(a.startTime)} ${a.coachName ? `· ${esc(a.coachName)}` : ""}</p></div><span class="badge success">Asistió</span></article>`).join("") : `<div class="card empty-card"><h3>No hay asistencias registradas</h3><p>Tu historial aparecerá aquí después de tus clases.</p></div>`}</div></div></div>`;
}
async function loadAndRenderAttendance(){try{AppState.attendances=await apiGet(`/attendance/client/${encodeURIComponent(AppState.user.clientId)}`)||[];renderApp();}catch(e){showToast(e.message,"error");}}

function renderQrPage(){
    if (isCoachUser()) {
        return `<div class="page"><div class="content">${renderHeader("Escanear QR")}
            <section class="hero compact"><span class="eyebrow">CONTROL DE ACCESO</span><h1>Escanear QR</h1><p>Escanea el código QR de una clienta para registrar su asistencia.</p></section>
            <div class="card scanner-card">
                <div id="qrReader" class="qr-reader"></div>
                <div id="qrScannerStatus" class="scanner-status"><i class="fa-solid fa-camera"></i><span>Solicitando acceso a la cámara...</span></div>
                <div class="scanner-actions">
                    <button class="primary-button" type="button" onclick="startQrScanner()"><i class="fa-solid fa-camera"></i> Activar cámara</button>
                    <label class="outline-button scanner-file-button"><i class="fa-regular fa-image"></i> Usar foto<input type="file" accept="image/*" capture="environment" onchange="scanQrFile(this.files[0])"></label>
                </div>
            </div>
            <div id="qrScanResult" class="card scanner-result hidden"></div>
            <div class="card info-card"><i class="fa-regular fa-circle-info"></i><div><b>Registro de asistencia</b><p>El servidor valida la reservación, el coach y la ventana de asistencia antes de registrar el acceso.</p></div></div>
        </div></div>`;
    }
    return `<div class="page"><div class="content">${renderHeader("Mi código QR")}<section class="hero compact"><span class="eyebrow">IDENTIFICACIÓN</span><h1>Mi código QR</h1><p>Muéstralo en recepción para registrar tu acceso.</p></section><div class="card qr-card"><div id="qrContainer" class="qr-container"><div class="qr-loading"><i class="fa-solid fa-spinner fa-spin"></i><span>Cargando QR...</span></div></div><h2>${esc(AppState.client?.fullName || AppState.user?.fullName || "Usuario")}</h2><p>${esc(AppState.client?.clientId || AppState.user?.clientId || "—")}</p></div><div class="card info-card"><i class="fa-regular fa-circle-info"></i><div><b>Información</b><p>Este código es personal e intransferible. Úsalo únicamente para tu acceso.</p></div></div></div></div>`;
}

let qrScanner = null;
let qrScannerRunning = false;
let qrScanBusy = false;

function setScannerStatus(message, type = "info") {
    const el = document.getElementById("qrScannerStatus");
    if (!el) return;
    const icon = type === "success" ? "fa-circle-check" : type === "error" ? "fa-triangle-exclamation" : "fa-camera";
    el.className = `scanner-status ${type}`;
    el.innerHTML = `<i class="fa-solid ${icon}"></i><span>${esc(message)}</span>`;
}

async function stopQrScanner() {
    qrScanBusy = false;
    if (qrScanner && qrScannerRunning) {
        try { await qrScanner.stop(); } catch (e) { console.warn("No fue posible detener el escáner:", e); }
    }
    if (qrScanner) { try { qrScanner.clear(); } catch (e) {} }
    qrScanner = null;
    qrScannerRunning = false;
}

async function startQrScanner() {
    if (!isCoachUser() || AppState.currentPage !== "qr") return;
    const reader = document.getElementById("qrReader");
    if (!reader) return;
    if (typeof Html5Qrcode === "undefined") {
        setScannerStatus("No fue posible cargar el escáner QR. Puedes usar una foto del código.", "error");
        return;
    }
    await stopQrScanner();
    reader.innerHTML = "";
    setScannerStatus("Apunta la cámara al código QR de la clienta.");
    qrScanner = new Html5Qrcode("qrReader", { verbose: false });
    try {
        await qrScanner.start(
            { facingMode: "environment" },
            { fps: 10, qrbox: { width: 240, height: 240 }, aspectRatio: 1 },
            decodedText => handleScannedQr(decodedText),
            () => {}
        );
        qrScannerRunning = true;
        setScannerStatus("Cámara activa. Coloca el QR dentro del recuadro.");
    } catch (error) {
        console.error("Error iniciando cámara QR:", error);
        setScannerStatus("No se pudo activar la cámara. Usa “Usar foto” o abre la PWA con HTTPS para el escaneo en vivo.", "error");
    }
}

function parseClientQr(decodedText) {
    const raw = String(decodedText || "").trim();
    if (!raw) return null;
    try {
        const data = JSON.parse(raw);
        if (data?.type === "FLOWMANAGER_CLIENT" && data.clientId) return String(data.clientId);
        return null;
    } catch (e) {
        const match = raw.match(/\bAU-\d{4,}\b/i);
        return match ? match[0].toUpperCase() : null;
    }
}

async function handleScannedQr(decodedText) {
    if (qrScanBusy) return;
    qrScanBusy = true;
    const clientId = parseClientQr(decodedText);
    if (!clientId) {
        setScannerStatus("El código no corresponde a una clienta de FlowManager.", "error");
        showToast("QR no válido.", "error");
        setTimeout(() => { qrScanBusy = false; if (qrScannerRunning) setScannerStatus("Apunta la cámara al código QR de la clienta."); }, 1600);
        return;
    }

    await stopQrScanner();
    setScannerStatus(`Cliente detectado: ${clientId}. Validando asistencia...`);
    const result = document.getElementById("qrScanResult");
    if (result) {
        result.classList.remove("hidden");
        result.innerHTML = `<div class="scanner-result-loading"><i class="fa-solid fa-spinner fa-spin"></i><span>Validando asistencia...</span></div>`;
    }

    try {
        const data = await apiPost("/attendance", { clientId });
        const clientName = data?.client?.fullName || data?.fullName || clientId;
        if (result) {
            result.innerHTML = `<div class="scanner-success"><i class="fa-solid fa-circle-check"></i><div><strong>Asistencia registrada</strong><span>${esc(clientName)}</span><small>${esc(data?.class?.name || "Clase")} · ${esc(formatTime(data?.class?.startTime || ""))}</small></div></div>`;
        }
        setScannerStatus("Asistencia registrada correctamente.", "success");
        showToast("Asistencia registrada correctamente.", "success");
        await loadCoachProfile();
    } catch (error) {
        if (result) {
            result.innerHTML = `<div class="scanner-failure"><i class="fa-solid fa-circle-xmark"></i><div><strong>No se pudo registrar</strong><span>${esc(error.message || "QR no válido")}</span></div></div><button class="outline-button" onclick="resetQrScannerView()">Escanear otra vez</button>`;
        }
        setScannerStatus(error.message || "No se pudo registrar la asistencia.", "error");
        showToast(error.message || "No se pudo registrar la asistencia.", "error");
    } finally {
        qrScanBusy = false;
    }
}

async function scanQrFile(file) {
    if (!file || !isCoachUser() || AppState.currentPage !== "qr") return;
    if (typeof Html5Qrcode === "undefined") return showToast("No fue posible cargar el lector QR.", "error");
    await stopQrScanner();
    setScannerStatus("Leyendo el código de la imagen...");
    const tempScanner = new Html5Qrcode("qrReader", { verbose: false });
    try {
        const decoded = await tempScanner.scanFile(file, true);
        try { await tempScanner.clear(); } catch (e) {}
        await handleScannedQr(decoded);
    } catch (error) {
        try { await tempScanner.clear(); } catch (e) {}
        setScannerStatus("No encontramos un QR válido en la imagen.", "error");
        showToast("No se encontró un QR válido en la imagen.", "error");
        qrScanBusy = false;
    }
}

function resetQrScannerView() {
    const result = document.getElementById("qrScanResult");
    if (result) { result.classList.add("hidden"); result.innerHTML = ""; }
    startQrScanner();
}

function renderLocalUserQr(container, userId){
    if (!container) return;
    container.innerHTML = "";
    if (!userId) {
        container.innerHTML = `<div class="qr-error"><i class="fa-solid fa-triangle-exclamation"></i><span>No fue posible identificar tu cuenta.</span></div>`;
        return;
    }
    const qrData = JSON.stringify({ type: "FLOWMANAGER_USER", userId });
    if (typeof QRCode === "undefined") {
        container.innerHTML = `<div class="qr-error"><i class="fa-solid fa-triangle-exclamation"></i><span>No fue posible cargar el generador de QR.</span><button class="outline-button" onclick="loadCoachQr()">Reintentar</button></div>`;
        return;
    }
    try {
        new QRCode(container, { text: qrData, width: 260, height: 260, colorDark: "#1d1d1f", colorLight: "#ffffff", correctLevel: QRCode.CorrectLevel.H });
    } catch (error) {
        console.error("Error generando QR de coach:", error);
        container.innerHTML = `<div class="qr-error"><i class="fa-solid fa-triangle-exclamation"></i><span>No fue posible generar el código QR.</span><button class="outline-button" onclick="loadCoachQr()">Reintentar</button></div>`;
    }
}
async function loadCoachQr(){
    if (!isCoachUser()) return;
    const containers = [document.getElementById("coachQrContainer"), document.getElementById("coachQrPageContainer")].filter(Boolean);
    containers.forEach(container => {
        const userId = AppState.user?.userId;
        renderLocalUserQr(container, userId);
    });
}
async function loadQr(){
    if (isCoachUser()) return loadCoachQr();
    const container=document.getElementById("qrContainer"); if(!container) return;
    try{
        const qr=await fetchClientQr(AppState.user.clientId); if(!qr) throw new Error("El servidor no devolvió un código QR.");
        if(qrObjectUrl) URL.revokeObjectURL(qrObjectUrl); qrObjectUrl=qr.startsWith("blob:")?qr:null;
        container.innerHTML=`<img src="${qr}" alt="Código QR">`;
    }catch(e){container.innerHTML=`<div class="qr-error"><i class="fa-solid fa-triangle-exclamation"></i><span>${esc(e.message)}</span><button class="outline-button" onclick="loadQr()">Reintentar</button></div>`;}
}

function renderProfilePage(){
    if (isManagerUser()) {
        const u = AppState.user || {};
        return `<div class="page"><div class="content">${renderHeader("Mi Perfil")}<section class="profile-card card"><div class="avatar">${esc(initials(u.fullName))}</div><h1>${esc(u.fullName || "Usuario")}</h1><p>${esc(u.email || "—")}</p><p>Rol: ${esc(u.isRoot ? "Root" : u.role || "Gerencia")}</p></section><div class="card detail-card"><h2>Acceso</h2>${detailRow("fa-regular fa-envelope","Correo electrónico",u.email)}${detailRow("fa-solid fa-user-shield","Rol",u.isRoot ? "Root / Gerencia" : u.role)}</div></div></div>`;
    }
    if (isCoachUser()) return renderCoachProfilePage();
    const c=AppState.client||AppState.user||{}; const name=c.fullName||"Usuario"; const pkg=(c.packages||[]).find(x=>x.status==="ACTIVE")||(c.packages||[])[0];
    return `<div class="page"><div class="content">${renderHeader("Mi Perfil")}<section class="profile-card card"><div class="avatar">${esc(initials(name))}</div><h1>${esc(name)}</h1><p>${esc(c.clientId||"—")}</p><p>${esc(c.userEmail||c.email||"")}</p>${c.phone?`<p>${esc(c.phone)}</p>`:""}</section><div class="card detail-card"><h2>Información personal</h2>${detailRow("fa-regular fa-calendar","Fecha de nacimiento",c.birthDate||c.birthdate)}${detailRow("fa-solid fa-phone","Teléfono",c.phone)}${detailRow("fa-regular fa-envelope","Correo electrónico",c.userEmail||c.email)}</div>${pkg?`<div class="card detail-card"><h2>Membresía actual</h2><h3 class="gold-text">${esc(pkg.membershipName||"Membresía")}</h3><p>Vence ${pkg.expiresAt?formatDate(pkg.expiresAt):"—"}</p><div class="metric-row compact-metrics"><div><strong>${pkg.remainingClasses==null?"∞":esc(pkg.remainingClasses)}</strong><span>${pkg.remainingClasses==null?"Ilimitado":"Clases"}</span></div><div><strong>${pkg.expiresAt?shortDate(pkg.expiresAt):"—"}</strong><span>Vencimiento</span></div><div><strong>✓</strong><span>${pkg.status==="ACTIVE"?"Activa":esc(pkg.status)}</span></div></div></div>`:""}</div></div>`;
}
function detailRow(icon,label,value){if(!value)return"";return `<div class="detail-row"><i class="${icon}"></i><span>${esc(label)}</span><strong>${esc(value)}</strong></div>`;}

function renderApp(){
    if(!app)return;
    if(AppState.currentPage==="login"){app.innerHTML=renderLoginPage();return;}
    let content="";
    switch(AppState.currentPage){case"home":content=renderHomePage();break;case"reserve":content=renderReservePage();break;case"reservations":content=isCoachUser()?renderCoachReservePage():renderReservationsPage();break;case"attendance":content=renderAttendancePage();break;case"qr":content=renderQrPage();break;case"profile":content=renderProfilePage();break;default:content=renderHomePage();}
    app.innerHTML=`${content}${renderBottomNavigation()}`;
    if(AppState.currentPage==="reserve") {
        if (isCoachUser()) renderCoachReservePageAsync();
        else renderReservePageAsync();
    }
    if(AppState.currentPage==="qr") { if (isCoachUser()) setTimeout(startQrScanner, 50); else loadQr(); }
    if(AppState.currentPage==="profile" && isCoachUser()) loadCoachQr();
}
function logoutUser(automatic = false) {
    stopInactivityWatcher();

    sessionStorage.removeItem("auraToken");
    sessionStorage.removeItem("auraUser");

    // Si la clienta cierra sesión manualmente,
    // eliminamos también la sesión recordada.
    if (!automatic) {
        localStorage.removeItem("auraToken");
        localStorage.removeItem("auraUser");
    }

    AppState.user = null;
    AppState.client = null;
    AppState.currentPage = "login";

    renderApp();

    if (automatic) {
        showToast(
            "Tu sesión se cerró por 10 minutos de inactividad.",
            "info"
        );
    }
}

document.addEventListener("visibilitychange", () => {

    if (document.visibilityState !== "visible") return;
    if (AppState.currentPage === "login") return;

    if (isManagerUser()) {
        refreshManagerData().then(renderApp).catch(console.error);
        return;
    }

    if (isCoachUser()) {
        loadCoachProfile().then(renderApp).catch(console.error);
        return;
    }

    refreshClientData().then(() => {
        if (AppState.currentPage === "reservations") {
            return loadAndRenderReservations();
        }
        renderApp();
    }).catch(console.error);

});


document.addEventListener("DOMContentLoaded", async () => {

    // Primero buscamos una sesión recordada.
    // Si no existe, buscamos la sesión normal.
    const token =
        localStorage.getItem("auraToken") ||
        sessionStorage.getItem("auraToken");

    const saved =
        localStorage.getItem("auraUser") ||
        sessionStorage.getItem("auraUser");

    if (token && saved) {
        try {
            AppState.user = JSON.parse(saved);
            AppState.currentPage = "home";

            startInactivityWatcher();
            renderApp();

            await refreshCurrentUserData();

            renderApp();
        } catch (e) {
            console.error(e);

            // Si la sesión ya no es válida, cerramos la sesión.
            logoutUser();
        }
    } else {
        renderApp();
    }
});
