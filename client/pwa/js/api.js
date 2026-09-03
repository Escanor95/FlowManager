/* ====================================================
   AURA WELLNESS PWA - API SERVICE
   ==================================================== */
const API_URL = window.location.origin;

async function apiRequest(endpoint, options = {}) {
    const token = getAuthToken();
    const headers = { ...(options.headers || {}) };
    if (token) headers.Authorization = `Bearer ${token}`;
    if (options.body && !headers["Content-Type"]) headers["Content-Type"] = "application/json";

    let response;
    try {
        response = await fetch(`${API_URL}${endpoint}`, { ...options, headers });
    } catch (error) {
        console.error("API connection error:", error);
        throw new Error("No fue posible conectar con Aura Wellness.");
    }

    const type = response.headers.get("content-type") || "";
    let data = null;
    if (type.includes("application/json")) {
        try { data = await response.json(); } catch (_) { data = null; }
    } else if (response.status !== 204) {
        const text = await response.text();
        data = text ? { message: text } : null;
    }

    if (response.status === 401) {
        logoutUser();
        throw new Error(data?.message || "Tu sesión ha expirado.");
    }
    if (!response.ok) throw new Error(data?.message || "Ocurrió un error al comunicarse con Aura Wellness.");
    return data;
}

const apiGet = endpoint => apiRequest(endpoint, { method: "GET" });
const apiPost = (endpoint, body = {}) => apiRequest(endpoint, { method: "POST", body: JSON.stringify(body) });
const apiDelete = endpoint => apiRequest(endpoint, { method: "DELETE" });

/* QR: el endpoint existente devuelve JSON y puede requerir JWT. */
async function fetchClientQr(clientId) {
    const token = getAuthToken();
    const response = await fetch(`${API_URL}/clients/${encodeURIComponent(clientId)}/qr`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    const type = response.headers.get("content-type") || "";
    if (!response.ok) {
        let message = "No fue posible cargar el código QR.";
        if (type.includes("application/json")) {
            const data = await response.json();
            message = data?.message || message;
        }
        throw new Error(message);
    }
    if (type.includes("application/json")) {
        const data = await response.json();
        return data.qr || data.qrCode || data.qrDataUrl || data.image || data.data || null;
    }
    const blob = await response.blob();
    return URL.createObjectURL(blob);
}
