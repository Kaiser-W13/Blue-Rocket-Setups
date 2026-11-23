/* -------------------------------------------------------------
   AutoSetup PC - Application Logic, Supabase Auth & CheapShark Steam Deals
   ------------------------------------------------------------- */

// 1. SUPABASE CONFIGURATION
const SUPABASE_URL = "https://zqaizebbuorztjywcucc.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_NUZwi3uL3Bur8ayZZSL0dw_H_1zH2SL";

let supabaseClient = null;
const isSupabaseConfigured = typeof SUPABASE_URL === "string" &&
    SUPABASE_URL.startsWith("http") &&
    !SUPABASE_URL.includes("YOUR_SUPABASE");

if (window.supabase && isSupabaseConfigured) {
    try {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    } catch (err) {
        console.warn("Supabase initialization skipped:", err.message);
    }
}

let sessionId = localStorage.getItem("autosetup_session_id");
if (!sessionId) {
    sessionId = "session_" + Math.random().toString(36).substring(2, 15);
    localStorage.setItem("autosetup_session_id", sessionId);
}

// 2. CHEAPSHARK API CONFIGURATION (Public API, no key required; storeID=1 is Steam)
const CHEAPSHARK_CONFIG = {
    dealsUrl: "https://www.cheapshark.com/api/1.0/deals?storeID=1&onSale=1&pageSize=30"
};

function on(id, eventName, handler) {
    const el = document.getElementById(id);
    if (el) {
        el.addEventListener(eventName, handler);
    }
}

// 3. MASTER CATALOG OF SOFTWARE APPLICATIONS
const APP_DATABASE = [
    { id: "Google.Chrome", name: "Google Chrome", cat: "browsers", size: 90, icon: "fa-brands fa-chrome", desc: "Fast & popular browser" },
    { id: "Mozilla.Firefox", name: "Mozilla Firefox", cat: "browsers", size: 85, icon: "fa-brands fa-firefox", desc: "Privacy-focused browser" },
    { id: "Brave.Brave", name: "Brave Browser", cat: "browsers", size: 95, icon: "fa-brands fa-brave", desc: "Ad-blocking fast browser" },
    { id: "Opera.Opera", name: "Opera", cat: "browsers", size: 80, icon: "fa-brands fa-opera", desc: "Feature-rich web browser" },

    { id: "Valve.Steam", name: "Steam", cat: "gaming", size: 60, icon: "fa-brands fa-steam", desc: "PC Gaming store & client" },
    { id: "EpicGames.EpicGamesLauncher", name: "Epic Games Launcher", cat: "gaming", size: 120, icon: "fa-solid fa-gamepad", desc: "Store & Fortnite launcher" },
    { id: "Discord.Discord", name: "Discord", cat: "gaming", size: 90, icon: "fa-brands fa-discord", desc: "Voice & text chat client" },
    { id: "Guru3D.MSIAfterburner", name: "MSI Afterburner", cat: "gaming", size: 50, icon: "fa-solid fa-gauge-high", desc: "GPU overclock & monitoring" },

    { id: "OBSProject.OBSStudio", name: "OBS Studio", cat: "media", size: 130, icon: "fa-solid fa-video", desc: "Screen recording & streaming" },
    { id: "BlenderFoundation.Blender", name: "Blender", cat: "media", size: 310, icon: "fa-solid fa-cube", desc: "3D creation suite" },
    { id: "GIMP.GIMP", name: "GIMP", cat: "media", size: 250, icon: "fa-solid fa-paintbrush", desc: "Open-source image editor" },
    { id: "BlackmagicDesign.DaVinciResolve", name: "DaVinci Resolve", cat: "media", size: 2100, icon: "fa-solid fa-clapperboard", desc: "Professional video editing" },
    { id: "Audacity.Audacity", name: "Audacity", cat: "media", size: 40, icon: "fa-solid fa-headphones", desc: "Audio editor & recorder" },
    { id: "Videolan.VLC", name: "VLC Media Player", cat: "media", size: 40, icon: "fa-solid fa-play-circle", desc: "Universal media player" },

    { id: "Microsoft.VisualStudioCode", name: "VS Code", cat: "developer", size: 90, icon: "fa-solid fa-code", desc: "Lightweight code editor" },
    { id: "Git.Git", name: "Git", cat: "developer", size: 50, icon: "fa-brands fa-git-alt", desc: "Version control system" },
    { id: "Docker.DockerDesktop", name: "Docker Desktop", cat: "developer", size: 550, icon: "fa-brands fa-docker", desc: "Container application platform" },
    { id: "OpenJS.NodeJS", name: "Node.js", cat: "developer", size: 30, icon: "fa-brands fa-node-js", desc: "JavaScript runtime environment" },
    { id: "Python.Python.3.11", name: "Python 3.11", cat: "developer", size: 30, icon: "fa-brands fa-python", desc: "Popular programming language" },
    { id: "Postman.Postman", name: "Postman", cat: "developer", size: 140, icon: "fa-solid fa-network-wired", desc: "API development platform" },

    { id: "7zip.7zip", name: "7-Zip", cat: "utilities", size: 5, icon: "fa-solid fa-file-zipper", desc: "File archiver & unzipper" },
    { id: "Adobe.Acrobat.Reader.64-bit", name: "Adobe Acrobat Reader", cat: "utilities", size: 250, icon: "fa-solid fa-file-pdf", desc: "PDF document viewer" },
    { id: "SlackTechnologies.Slack", name: "Slack", cat: "utilities", size: 100, icon: "fa-brands fa-slack", desc: "Team collaboration chat" },
    { id: "Microsoft.Teams", name: "Microsoft Teams", cat: "utilities", size: 130, icon: "fa-solid fa-people-group", desc: "Workplace communication" },
    { id: "LibreOffice.LibreOffice", name: "LibreOffice", cat: "utilities", size: 340, icon: "fa-solid fa-file-lines", desc: "Free office suite" }
];

const PRESETS = {
    office: ["Google.Chrome", "Adobe.Acrobat.Reader.64-bit", "SlackTechnologies.Slack", "LibreOffice.LibreOffice", "7zip.7zip"],
    gaming: ["Valve.Steam", "EpicGames.EpicGamesLauncher", "Discord.Discord", "Guru3D.MSIAfterburner", "Google.Chrome"],
    creator: ["OBSProject.OBSStudio", "BlenderFoundation.Blender", "GIMP.GIMP", "BlackmagicDesign.DaVinciResolve", "Audacity.Audacity"],
    developer: ["Microsoft.VisualStudioCode", "Git.Git", "Docker.DockerDesktop", "OpenJS.NodeJS", "Python.Python.3.11", "Postman.Postman"]
};

const DEFAULT_STEAM_DEALS = [
    {
        id: "steam-fallback-1",
        title: "Cyberpunk 2077",
        steamAppID: "1091500",
        store: "Steam",
        discount: 50,
        sale_price: 29.99,
        orig_price: 59.99,
        image: "https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/header.jpg",
        url: "https://store.steampowered.com/app/1091500/",
        note: "Open-world action RPG set in Night City. Starter fallback deal while offline or loading live CheapShark Steam data.",
        author_email: "CheapShark / Steam",
        upvotes: 42
    }
];

// 4. APPLICATION STATE
let state = {
    currentStep: 1,
    selectedApps: new Set(),
    selectedGpu: "none",
    activeFormat: "ps1",
    currentUser: null,
    authMode: "signin",
    gameDeals: [],
    upvotedDeals: new Set(JSON.parse(localStorage.getItem("upvotedDeals") || "[]"))
};

// 5. INITIALIZATION
document.addEventListener("DOMContentLoaded", async () => {
    try {
        loadStateFromStorage();
        renderAppGrid();
        setupEventListeners();
        updateUI();
        checkNetworkStatus();
    } catch (err) {
        console.error("UI initialization error:", err);
    }

    await initAuthSession();
    await loadGameDeals();
});

/* -------------------------------------------------------------
   CHEAPSHARK STEAM DEALS INTEGRATION
   ------------------------------------------------------------- */
function getFallbackSteamImage(steamAppID = "") {
    if (steamAppID) {
        return `https://cdn.cloudflare.steamstatic.com/steam/apps/${encodeURIComponent(String(steamAppID).trim())}/header.jpg`;
    }
    return "https://cdn.cloudflare.steamstatic.com/steam/apps/730/header.jpg";
}

function getFallbackSteamUrl(title = "", steamAppID = "") {
    if (steamAppID) {
        return `https://store.steampowered.com/app/${encodeURIComponent(String(steamAppID).trim())}/`;
    }
    return title
        ? `https://store.steampowered.com/search/?term=${encodeURIComponent(title)}`
        : "https://store.steampowered.com/";
}

function sanitizeUrl(rawUrl, fallbackUrl) {
    const candidate = String(rawUrl || "").trim();
    if (candidate.startsWith("https://") || candidate.startsWith("http://")) {
        return candidate;
    }
    return fallbackUrl;
}

function normalizeCheapSharkDeal(item, index) {
    if (!item || typeof item !== "object") return null;

    const title = item.title || "Untitled Steam Game";
    const steamAppID = item.steamAppID || "";
    const dealID = item.dealID || "";

    const salePrice = Number.parseFloat(item.salePrice);
    const origPrice = Number.parseFloat(item.normalPrice);
    const validSale = Number.isNaN(salePrice) ? 0 : salePrice;
    const validOrig = Number.isNaN(origPrice) ? validSale : origPrice;

    let discount = Math.round(Number.parseFloat(item.savings) || 0);
    if (discount <= 0 && validOrig > 0 && validSale < validOrig) {
        discount = Math.round(((validOrig - validSale) / validOrig) * 100);
    }

    // Link directly to the Steam store page when steamAppID is present; otherwise search Steam
    const directSteamUrl = getFallbackSteamUrl(title, steamAppID);
    const url = sanitizeUrl(directSteamUrl, getFallbackSteamUrl(title, steamAppID));
    const image = sanitizeUrl(item.thumb, getFallbackSteamImage(steamAppID));

    const ratingParts = [];
    if (item.steamRatingText) {
        ratingParts.push(`Steam: ${item.steamRatingText}${item.steamRatingPercent ? ` (${item.steamRatingPercent}\%)` : ""}`); } if (item.metacriticScore && Number(item.metacriticScore) > 0) { ratingParts.push(`Metacritic: ${item.metacriticScore}`); } if (item.dealRating) { ratingParts.push(`Deal Rating: ${item.dealRating}/10`); } const metaNote = ratingParts.length > 0 ? `${ratingParts.join(" • ")}. ` : "";      return { id: dealID ? `cs-${dealID}` : `cs-item-${index}`, title, steamAppID, store: "Steam", discount, sale_price: validSale, orig_price: validOrig, image, url, note: `${metaNote}Active Steam discount via CheapShark. Click "Open Deal" to go straight to Steam.`.trim(), author_email: "CheapShark API (Steam)", upvotes: Math.round(Number.parseFloat(item.dealRating) * 10) \vert{}\vert{} 0 }; }  async function fetchCheapSharkSteamDeals() { if (!navigator.onLine) { return []; }      try { const response = await fetch(CHEAPSHARK_CONFIG.dealsUrl, { method: "GET" });          if (!response.ok) { throw new Error(`CheapShark returned HTTP ${response.status}`); }          const data = await response.json(); if (!Array.isArray(data)) return [];          return data .map((item, idx) => normalizeCheapSharkDeal(item, idx)) .filter(Boolean); } catch (err) { console.warn("CheapShark Steam fetch failed:", err.message); return []; } }  /* ------------------------------------------------------------- GAME DESCRIPTION POPUP MODAL ------------------------------------------------------------- */ function openGameDescriptionPopup(deal) { const safeUrl = sanitizeUrl(deal.url, getFallbackSteamUrl(deal.title, deal.steamAppID)); const safeImg = sanitizeUrl(deal.image, getFallbackSteamImage(deal.steamAppID));      const storeBadge = document.getElementById("popup-store-badge"); const discBadge = document.getElementById("popup-discount-badge"); if (storeBadge) storeBadge.textContent = "Steam";      if (discBadge) { discBadge.textContent = `-${Number(deal.discount) \vert{}\vert{} 0}\% OFF`; }      const imgEl = document.getElementById("popup-game-image"); if (imgEl) { imgEl.src = safeImg; imgEl.alt = `${deal.title} cover art`; imgEl.onerror = () => { imgEl.onerror = null; imgEl.src = getFallbackSteamImage(deal.steamAppID); }; }      const titleEl = document.getElementById("popup-game-title"); if (titleEl) titleEl.textContent = deal.title;      const saleEl = document.getElementById("popup-sale-price"); const origEl = document.getElementById("popup-orig-price"); if (saleEl && origEl) { saleEl.textContent = `$${Number(deal.sale_price).toFixed(2)}`; if (Number(deal.orig_price) > Number(deal.sale_price)) { origEl.textContent = `$${Number(deal.orig_price).toFixed(2)}`; origEl.classList.remove("hidden"); } else { origEl.classList.add("hidden"); } }      const metaEl = document.getElementById("popup-source-meta"); if (metaEl) metaEl.textContent = `Source: ${deal.author_email \vert{}\vert{} "CheapShark / Community"}`;      const descEl = document.getElementById("popup-game-description"); if (descEl) { descEl.textContent = deal.note \vert{}\vert{} "No additional description provided for this Steam deal."; }      const linkEl = document.getElementById("popup-store-link"); if (linkEl) { linkEl.href = safeUrl; linkEl.innerHTML = `Open Deal <i class="fa-solid fa-arrow-up-right-from-square"></i>`; }      openModal("game-info-modal"); }  /* ------------------------------------------------------------- AUTHENTICATION (SUPABASE + LOCAL DEMO FALLBACK) ------------------------------------------------------------- */ async function initAuthSession() { if (supabaseClient) { try { const { data: { session } } = await supabaseClient.auth.getSession(); if (session && session.user) { setCurrentUser(session.user); await loadCloudBundleForUser(session.user.id); }              supabaseClient.auth.onAuthStateChange(async (_event, session) => { if (session && session.user) { setCurrentUser(session.user); await loadCloudBundleForUser(session.user.id); } else { setCurrentUser(null); } }); return; } catch (err) { console.warn("Auth session check skipped:", err.message); } }      const savedDemoUser = localStorage.getItem("demoAuthUser"); if (savedDemoUser) { try { setCurrentUser(JSON.parse(savedDemoUser)); } catch (_e) { localStorage.removeItem("demoAuthUser"); } } }  function setCurrentUser(user) { state.currentUser = user; const guestControls = document.getElementById("auth-guest-controls"); const userControls = document.getElementById("auth-user-controls"); const emailDisplay = document.getElementById("user-email-display");      if (user) { guestControls?.classList.add("hidden"); userControls?.classList.remove("hidden"); if (emailDisplay) emailDisplay.textContent = user.email; } else { guestControls?.classList.remove("hidden"); userControls?.classList.add("hidden"); if (emailDisplay) emailDisplay.textContent = ""; } }  async function handleAuthSubmit(e) { e.preventDefault(); const emailEl = document.getElementById("auth-email"); const passEl = document.getElementById("auth-password"); const feedback = document.getElementById("auth-message"); const submitBtn = document.getElementById("auth-submit-btn");      const email = (emailEl?.value \vert{}\vert{} "").trim(); const password = passEl?.value \vert{}\vert{} "";      feedback?.classList.add("hidden"); if (submitBtn) submitBtn.disabled = true;      try { if (supabaseClient) { if (state.authMode === "signup") { const { data, error } = await supabaseClient.auth.signUp({ email, password }); if (error) throw error; if (feedback) showFormFeedback(feedback, "Account created! Check your email or sign in now.", "success"); if (data.user && data.session) { closeModal("auth-modal"); } } else { const { error } = await supabaseClient.auth.signInWithPassword({ email, password }); if (error) throw error; closeModal("auth-modal"); } } else { const demoUser = { id: "demo-" + btoa(email), email }; localStorage.setItem("demoAuthUser", JSON.stringify(demoUser)); setCurrentUser(demoUser); closeModal("auth-modal"); } } catch (err) { if (feedback) showFormFeedback(feedback, err.message \vert{}\vert{} "Authentication failed.", "error"); } finally { if (submitBtn) submitBtn.disabled = false; } }  async function handleSignOut() { if (supabaseClient) { try { await supabaseClient.auth.signOut(); } catch (err) { console.warn("Sign out error:", err.message); } } localStorage.removeItem("demoAuthUser"); setCurrentUser(null); }  /* ------------------------------------------------------------- STATE MANAGEMENT & CLOUD SYNC ------------------------------------------------------------- */ async function saveStateToStorage() { const dataToSave = { selectedApps: Array.from(state.selectedApps), selectedGpu: state.selectedGpu }; localStorage.setItem("autoSetupState", JSON.stringify(dataToSave));      if (supabaseClient && navigator.onLine) { try { const payload = { session_id: state.currentUser ? state.currentUser.id : sessionId, user_id: state.currentUser ? state.currentUser.id : null, selected_apps: dataToSave.selectedApps, selected_gpu: dataToSave.selectedGpu, created_at: new Date() }; await supabaseClient .from("user_bundles") .upsert(payload, { onConflict: "session_id" }); } catch (err) { console.warn("Cloud sync skipped:", err.message); } } }  async function loadCloudBundleForUser(userId) { if (!supabaseClient \vert{}\vert{} !navigator.onLine) return; try { const { data, error } = await supabaseClient .from("user_bundles") .select("*") .eq("session_id", userId) .single();          if (!error && data) { state.selectedApps = new Set(data.selected_apps \vert{}\vert{} []); state.selectedGpu = data.selected_gpu \vert{}\vert{} "none"; const gpuRadio = document.querySelector(`input[name="gpu"][value="${state.selectedGpu}"]`); if (gpuRadio) gpuRadio.checked = true; renderAppGrid(); updateUI(); } } catch (e) { console.warn("Could not fetch user cloud bundle:", e.message); } }  function loadStateFromStorage() { const saved = localStorage.getItem("autoSetupState"); if (saved) { try { const parsed = JSON.parse(saved); state.selectedApps = new Set(parsed.selectedApps \vert{}\vert{} []); state.selectedGpu = parsed.selectedGpu \vert{}\vert{} "none"; const gpuRadio = document.querySelector(`input[name="gpu"][value="${state.selectedGpu}"]`); if (gpuRadio) gpuRadio.checked = true; } catch (e) { console.error("Failed to load saved state", e); } } }  /* ------------------------------------------------------------- GAME DEALS LOGIC ------------------------------------------------------------- */ async function loadGameDeals() { const localDeals = JSON.parse(localStorage.getItem("communityGameDeals") \vert{}\vert{} "[]") .map(d => ({ ...d, store: "Steam" })); let supabaseDeals = [];      if (supabaseClient && navigator.onLine) { try { const { data, error } = await supabaseClient .from("game_deals") .select("*") .order("upvotes", { ascending: false });              if (!error && data && data.length > 0) { supabaseDeals = data.map(d => ({ ...d, store: "Steam" })); } } catch (err) { console.warn("Using cached/default Steam deals:", err.message); } }      const cheapSharkDeals = await fetchCheapSharkSteamDeals(); const fallbackDeals = cheapSharkDeals.length > 0 ? [] : DEFAULT_STEAM_DEALS;      const seen = new Set(); const merged = [...localDeals, ...cheapSharkDeals, ...supabaseDeals, ...fallbackDeals].filter(item => { const key = String(item.title \vert{}\vert{} "").toLowerCase(); if (!key \vert{}\vert{} seen.has(key)) return false; seen.add(key); return true; });      state.gameDeals = merged; const searchInput = document.getElementById("deal-search"); renderGameDeals(getCurrentStoreFilter(), searchInput ? searchInput.value : ""); }  function renderGameDeals(storeFilter = "all", searchQuery = "") { const grid = document.getElementById("deals-grid"); if (!grid) return; grid.innerHTML = "";      const filtered = state.gameDeals.filter(deal => { const storeLabel = deal.store \vert{}\vert{} "Steam"; const matchesStore = storeFilter === "all" \vert{}\vert{} storeLabel === storeFilter; const q = (searchQuery \vert{}\vert{} "").toLowerCase(); const matchesSearch = !q \vert{}\vert{} deal.title.toLowerCase().includes(q) \vert{}\vert{} storeLabel.toLowerCase().includes(q) \vert{}\vert{} (deal.note && deal.note.toLowerCase().includes(q)); return matchesStore && matchesSearch; });      if (filtered.length === 0) { grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px;">No Steam deals found matching your filter.</p>`; return; }      filtered.forEach(deal => { const isVoted = state.upvotedDeals.has(String(deal.id)); const safeUrl = escapeHtml(sanitizeUrl(deal.url, getFallbackSteamUrl(deal.title, deal.steamAppID))); const safeImg = escapeHtml(sanitizeUrl(deal.image, getFallbackSteamImage(deal.steamAppID))); const discountVal = Number(deal.discount) \vert{}\vert{} 0;          const priceHtml = `<span class="sale-price">$${Number(deal.sale_price).toFixed(2)}</span> ${Number(deal.orig_price) > Number(deal.sale_price) ? `<span class="orig-price">$${Number(deal.orig_price).toFixed(2)}</span>` : ""}`;

        const card = document.createElement("article");
        card.className = "deal-card";
        card.innerHTML = `
            <img class="deal-cover" src="${safeImg}" alt="${escapeHtml(deal.title)} cover" loading="lazy">
            <div class="deal-body">
                <div class="deal-top">
                    <span class="store-pill">Steam</span>
                    <span class="discount-badge">-${discountVal}% OFF</span>
                </div>
                <h3 class="deal-title">${escapeHtml(deal.title)}</h3>
                ${deal.note ? `<p class="deal-note">${escapeHtml(deal.note)}</p>` : ""}
                <div class="deal-meta">
                    <i class="fa-solid fa-circle-info"></i> Click card for full description
                </div>
            </div>
            <div class="deal-footer">
                <div class="price-box">
                    ${priceHtml}
                </div>
                <div class="deal-actions">
                    <button type="button" class="btn btn-outline btn-sm info-popup-btn" title="View game description">
                        <i class="fa-solid fa-align-left"></i> Info
                    </button>
                    <button type="button" class="upvote-btn ${isVoted ? "voted" : ""}" data-id="${escapeHtml(String(deal.id))}" title="Upvote">
                        <i class="fa-solid fa-thumbs-up"></i> <span>${Number(deal.upvotes) || 0}</span>
                    </button>
                    <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">
                        Store <i class="fa-solid fa-arrow-up-right-from-square"></i>
                    </a>
                </div>
            </div>
        `;

        const imgEl = card.querySelector(".deal-cover");
        imgEl?.addEventListener("error", () => {
            imgEl.src = getFallbackSteamImage(deal.steamAppID);
        });

        card.addEventListener("click", (e) => {
            if (e.target.closest("a") || e.target.closest(".upvote-btn")) return;
            openGameDescriptionPopup({ ...deal, store: "Steam" });
        });

        const upvoteBtn = card.querySelector(".upvote-btn");
        upvoteBtn?.addEventListener("click", (e) => {
            e.stopPropagation();
            handleUpvoteDeal(deal.id);
        });

        grid.appendChild(card);
    });
}

async function handleDealSubmit(e) {
    e.preventDefault();
    const feedback = document.getElementById("deal-message");
    const submitBtn = document.getElementById("deal-submit-btn");

    if (!state.currentUser) {
        if (feedback) showFormFeedback(feedback, "Please sign in first to recommend a Steam deal.", "error");
        return;
    }

    const title = (document.getElementById("deal-title")?.value || "").trim();
    const rawUrl = (document.getElementById("deal-url")?.value || "").trim();
    const rawImg = (document.getElementById("deal-image")?.value || "").trim();
    const salePrice = parseFloat(document.getElementById("deal-sale-price")?.value || "0");
    const origPrice = parseFloat(document.getElementById("deal-orig-price")?.value || "0");
    const discount = parseInt(document.getElementById("deal-discount")?.value || "0", 10);

    const newDeal = {
        id: "deal-" + Date.now(),
        title,
        steamAppID: "",
        store: "Steam",
        discount,
        sale_price: salePrice,
        orig_price: origPrice,
        image: sanitizeUrl(rawImg, getFallbackSteamImage()),
        url: sanitizeUrl(rawUrl, getFallbackSteamUrl(title)),
        note: (document.getElementById("deal-note")?.value || "").trim(),
        author_email: state.currentUser.email,
        user_id: state.currentUser.id,
        upvotes: 1
    };

    if (submitBtn) submitBtn.disabled = true;

    try {
        if (supabaseClient && navigator.onLine) {
            const { id, image, steamAppID, ...dbPayload } = newDeal;
            const { data, error } = await supabaseClient
                .from("game_deals")
                .insert([dbPayload])
                .select()
                .single();

            if (error) throw error;
            if (data) newDeal.id = data.id;
        } else {
            const localDeals = JSON.parse(localStorage.getItem("communityGameDeals") || "[]");
            localDeals.unshift(newDeal);
            localStorage.setItem("communityGameDeals", JSON.stringify(localDeals));
        }

        state.gameDeals.unshift(newDeal);
        state.upvotedDeals.add(String(newDeal.id));
        localStorage.setItem("upvotedDeals", JSON.stringify(Array.from(state.upvotedDeals)));

        document.getElementById("deal-form")?.reset();
        closeModal("deal-modal");
        renderGameDeals(getCurrentStoreFilter(), document.getElementById("deal-search")?.value || "");
    } catch (err) {
        if (feedback) showFormFeedback(feedback, err.message || "Could not post deal.", "error");
    } finally {
        if (submitBtn) submitBtn.disabled = false;
    }
}

async function handleUpvoteDeal(dealId) {
    const key = String(dealId);
    const deal = state.gameDeals.find(d => String(d.id) === key);
    if (!deal) return;

    const alreadyVoted = state.upvotedDeals.has(key);
    if (alreadyVoted) {
        state.upvotedDeals.delete(key);
        deal.upvotes = Math.max(0, (deal.upvotes || 1) - 1);
    } else {
        state.upvotedDeals.add(key);
        deal.upvotes = (deal.upvotes || 0) + 1;
    }

    localStorage.setItem("upvotedDeals", JSON.stringify(Array.from(state.upvotedDeals)));
    renderGameDeals(getCurrentStoreFilter(), document.getElementById("deal-search")?.value || "");

    if (supabaseClient && navigator.onLine && typeof deal.id === "number") {
        try {
            await supabaseClient
                .from("game_deals")
                .update({ upvotes: deal.upvotes })
                .eq("id", deal.id);
        } catch (err) {
            console.warn("Upvote sync skipped:", err.message);
        }
    }
}

function getCurrentStoreFilter() {
    const activeBtn = document.querySelector("#store-filters .filter-btn.active");
    return activeBtn ? activeBtn.dataset.store : "all";
}

/* -------------------------------------------------------------
   RENDER SOFTWARE GRID & WIZARD UI
   ------------------------------------------------------------- */
function renderAppGrid(filterCat = "all", searchQuery = "") {
    const grid = document.getElementById("apps-grid");
    if (!grid) return;
    grid.innerHTML = "";

    const filtered = APP_DATABASE.filter(app => {
        const matchesCat = filterCat === "all" || app.cat === filterCat;
        const q = (searchQuery || "").toLowerCase();
        const matchesSearch = !q ||
            app.name.toLowerCase().includes(q) ||
            app.desc.toLowerCase().includes(q);
        return matchesCat && matchesSearch;
    });

    if (filtered.length === 0) {
        grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px;">No software matched your search.</p>`;
        return;
    }

    filtered.forEach(app => {
        const isChecked = state.selectedApps.has(app.id);
        const card = document.createElement("div");
        card.className = `app-item ${isChecked ? "selected" : ""}`;
        card.dataset.id = app.id;

        card.innerHTML = `
            <input type="checkbox" id="chk-${escapeHtml(app.id)}" ${isChecked ? "checked" : ""}>
            <i class="${escapeHtml(app.icon)} app-icon"></i>
            <div class="app-info">
                <h4>${escapeHtml(app.name)}</h4>
                <p>${escapeHtml(app.desc)}</p>
            </div>
        `;

        card.addEventListener("click", (e) => {
            if (e.target.tagName !== "INPUT") {
                const chk = card.querySelector('input[type="checkbox"]');
                if (chk) chk.checked = !chk.checked;
            }
            toggleAppSelection(app.id);
        });

        grid.appendChild(card);
    });
}

function toggleAppSelection(appId) {
    if (state.selectedApps.has(appId)) {
        state.selectedApps.delete(appId);
    } else {
        state.selectedApps.add(appId);
    }
    saveStateToStorage();
    renderAppGrid(getCurrentCategoryFilter(), document.get