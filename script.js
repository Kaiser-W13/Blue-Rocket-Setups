/* -------------------------------------------------------------
   AutoSetup PC - Application Logic, Supabase Auth & Game Deals
   ------------------------------------------------------------- */

// 1. SUPABASE CONFIGURATION
const SUPABASE_URL = "https://zqaizebbuorztjywcucc.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_NUZwi3uL3Bur8ayZZSL0dw_H_1zH2SL";

let supabaseClient = null;
const isSupabaseConfigured = SUPABASE_URL.startsWith("http") && !SUPABASE_URL.includes("YOUR_SUPABASE");

if (window.supabase && isSupabaseConfigured) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

let sessionId = localStorage.getItem("autosetup_session_id");
if (!sessionId) {
    sessionId = "session_" + Math.random().toString(36).substring(2, 15);
    localStorage.setItem("autosetup_session_id", sessionId);
}

// 2. RAPIDAPI CONFIGURATION (codemeoww - Game Deals & Freebies API)
// Paste your RapidAPI key below and verify host/endpoint paths on RapidAPI's Endpoints tab.
const RAPIDAPI_KEY = "fc3e9b9815msh0d13f6d300e7037p18810bjsnd1b6157398e2";
const RAPIDAPI_HOST = "game-deals-freebies-api.p.rapidapi.com";
const RAPIDAPI_BASE_URL = `https://${RAPIDAPI_HOST}`;
const RAPIDAPI_ENDPOINTS = {
    deals: "/deals",
    freebies: "/freebies",
    epic: "/epic"
};

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

const DEFAULT_GAME_DEALS = [
    {
        id: "deal-1",
        title: "Cyberpunk 2077: Ultimate Edition",
        store: "Steam",
        discount: 53,
        sale_price: 38.60,
        orig_price: 82.98,
        image: "https://cdn.cloudflare.steamstatic.com/steam/apps/1091500/header.jpg",
        url: "https://store.steampowered.com/app/1091500/Cyberpunk_2077/",
        note: "Open-world action RPG set in Night City. Includes the base game and Phantom Liberty expansion with heavy GPU ray-tracing support.",
        author_email: "alex.gamer@example.com",
        upvotes: 42
    },
    {
        id: "deal-2",
        title: "Weekly Freebie Giveaway",
        store: "Freebies",
        discount: 100,
        sale_price: 0.00,
        orig_price: 19.99,
        image: "https://cdn2.unrealengine.com/egs-social-1920x1080-1920x1080-690624792.jpg",
        url: "https://store.epicgames.com/en-US/free-games",
        note: "100% OFF limited-time freebie. Claim it before the weekly rotation resets to keep it in your library permanently.",
        author_email: "freebie_alert@example.com",
        upvotes: 39
    },
    {
        id: "deal-3",
        title: "Alan Wake 2",
        store: "Epic Games",
        discount: 50,
        sale_price: 24.99,
        orig_price: 49.99,
        image: "https://cdn2.unrealengine.com/aw2-keyart-1920x1080-1920x1080-954976161.jpg",
        url: "https://store.epicgames.com/en-US/p/alan-wake-2",
        note: "Survival horror thriller following FBI agent Saga Anderson and writer Alan Wake across twin realities.",
        author_email: "night_springs@example.com",
        upvotes: 28
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
    loadStateFromStorage();
    renderAppGrid();
    setupEventListeners();
    updateUI();
    checkNetworkStatus();
    await initAuthSession();
    await loadGameDeals();
});

/* -------------------------------------------------------------
   IMAGE, STORE LINK & RAPIDAPI INTEGRATION
   ------------------------------------------------------------- */
function resolveStoreName(rawStore, forceFreebie = false) {
    if (forceFreebie) return "Freebies";
    const s = String(rawStore || "").toLowerCase();
    if (s.includes("steam")) return "Steam";
    if (s.includes("epic")) return "Epic Games";
    if (s.includes("free")) return "Freebies";
    return rawStore ? String(rawStore).trim() : "Steam";
}

function getFallbackStoreUrl(storeName, title = "") {
    const query = encodeURIComponent(title || "");
    switch (storeName) {
        case "Steam":
            return title ? `https://store.steampowered.com/search/?term=${query}` : "https://store.steampowered.com/";
        case "Epic Games":
            return title ? `https://store.epicgames.com/en-US/browse?q=${query}` : "https://store.epicgames.com/en-US/free-games";
        case "Freebies":
            return "https://store.epicgames.com/en-US/free-games";
        default:
            return "https://store.steampowered.com/";
    }
}

function sanitizeStoreUrl(rawUrl, storeName, title) {
    const candidate = String(rawUrl || "").trim();
    if (candidate.startsWith("https://") || candidate.startsWith("http://")) {
        return candidate;
    }
    return getFallbackStoreUrl(storeName, title);
}

function getFallbackGameImage(storeName) {
    if (storeName === "Epic Games" || storeName === "Freebies") {
        return "https://cdn2.unrealengine.com/egs-social-1920x1080-1920x1080-690624792.jpg";
    }
    return "https://cdn.cloudflare.steamstatic.com/steam/apps/730/header.jpg";
}

function sanitizeImageUrl(rawImage, storeName) {
    const candidate = String(rawImage || "").trim();
    if (candidate.startsWith("https://") || candidate.startsWith("http://")) {
        return candidate;
    }
    return getFallbackGameImage(storeName);
}

function normalizeRapidApiItem(item, categoryType, index) {
    const title = item.title || item.name || item.gameTitle || item.game || "Untitled Game Deal";
    const isFreebieCategory = categoryType === "freebies" || categoryType === "epic";
    const salePriceRaw = item.salePrice ?? item.sale_price ?? item.price ?? item.currentPrice ?? 0;
    const origPriceRaw = item.normalPrice ?? item.orig_price ?? item.originalPrice ?? item.retailPrice ?? salePriceRaw;
    const salePrice = Number.parseFloat(salePriceRaw) || 0;
    const origPrice = Number.parseFloat(origPriceRaw) || salePrice;

    let discount = Number.parseInt(item.discount ?? item.savings ?? item.discountPercent, 10);
    if (Number.isNaN(discount)) {
        if (salePrice === 0 && origPrice > 0) {
            discount = 100;
        } else if (origPrice > 0) {
            discount = Math.round(((origPrice - salePrice) / origPrice) * 100);
        } else {
            discount = isFreebieCategory ? 100 : 0;
        }
    }

    const isFreebie = isFreebieCategory || Boolean(item.isFreebie || item.free || salePrice === 0 || discount === 100);
    const store = resolveStoreName(
        item.store || item.storeName || item.platform || (categoryType === "epic" ? "Epic Games" : "Steam"),
        isFreebie
    );

    const rawLink = item.url || item.dealUrl || item.storeUrl || item.link || item.claimUrl || item.steamUrl || "";
    const url = sanitizeStoreUrl(rawLink, store, title);

    const rawImg = item.image || item.thumbnail || item.thumb || item.cover || item.banner || item.headerImage || "";
    const image = sanitizeImageUrl(rawImg, store);

    const historicLow = item.historicLow ?? item.historicalLow ?? item.cheapestPriceEver ?? item.cheapestPrice;
    const historicText = historicLow !== undefined && historicLow !== null && historicLow !== ""
        ? `Historic low: $${Number.parseFloat(historicLow).toFixed(2)}. `
        : "";
    const defaultDesc = isFreebie
        ? `Limited-time freebie / giveaway on ${store}. Click "Open Store Page" to claim.`
        : `Active game deal & price tracker listing on ${store}.`;
    const fullDescription = item.description || item.note || item.claimInstructions || defaultDesc;

    return {
        id: item.id || `rapid-${categoryType}-${index}-${title.slice(0, 12)}`,
        title,
        store,
        discount,
        sale_price: salePrice,
        orig_price: origPrice,
        image,
        url,
        note: `${historicText}${fullDescription}`.trim(),
        author_email: "Game Deals & Freebies API",
        upvotes: Number.parseInt(item.upvotes ?? item.rating ?? 0, 10) || 0
    };
}

function extractRapidList(payload) {
    if (Array.isArray(payload)) return payload;
    if (!payload || typeof payload !== "object") return [];

    const combined = [];
    if (Array.isArray(payload.active)) combined.push(...payload.active);
    if (Array.isArray(payload.upcoming)) combined.push(...payload.upcoming);
    if (combined.length > 0) return combined;

    const candidates = [
        payload.deals,
        payload.freebies,
        payload.giveaways,
        payload.data,
        payload.results,
        payload.items,
        payload.games
    ];
    for (const c of candidates) {
        if (Array.isArray(c)) return c;
    }
    return [];
}

async function fetchEndpoint(path, categoryType) {
    const response = await fetch(`${RAPIDAPI_BASE_URL}${path}`, {
        method: "GET",
        headers: {
            "X-RapidAPI-Key": RAPIDAPI_KEY,
            "X-RapidAPI-Host": RAPIDAPI_HOST
        }
    });

    if (!response.ok) {
        throw new Error(`RapidAPI ${path} returned HTTP ${response.status}`);
    }

    const payload = await response.json();
    const list = extractRapidList(payload);
    return list.map((item, idx) => normalizeRapidApiItem(item, categoryType, idx));
}

async function fetchAllRapidApiDealsAndFreebies() {
    const hasKey = RAPIDAPI_KEY && !RAPIDAPI_KEY.includes("YOUR_RAPIDAPI_KEY");
    if (!hasKey || !navigator.onLine) {
        return [];
    }

    const calls = [
        fetchEndpoint(RAPIDAPI_ENDPOINTS.deals, "deals"),
        fetchEndpoint(RAPIDAPI_ENDPOINTS.freebies, "freebies"),
        fetchEndpoint(RAPIDAPI_ENDPOINTS.epic, "epic")
    ];

    const results = await Promise.allSettled(calls);
    const combined = [];

    for (const res of results) {
        if (res.status === "fulfilled" && Array.isArray(res.value)) {
            combined.push(...res.value);
        } else if (res.status === "rejected") {
            console.warn("RapidAPI sub-endpoint skipped:", res.reason?.message || res.reason);
        }
    }

    return combined;
}

/* -------------------------------------------------------------
   GAME DESCRIPTION POPUP MODAL
   ------------------------------------------------------------- */
function openGameDescriptionPopup(deal) {
    const storeLabel = deal.store || "Steam";
    const isFree = Number(deal.sale_price) === 0 || Number(deal.discount) === 100;
    const safeUrl = sanitizeStoreUrl(deal.url, storeLabel, deal.title);
    const safeImg = sanitizeImageUrl(deal.image, storeLabel);

    document.getElementById("popup-store-badge").textContent = storeLabel;
    document.getElementById("popup-discount-badge").textContent = isFree
        ? "FREEBIE (100% OFF)"
        : `-${Number(deal.discount) || 0}% OFF`;

    const imgEl = document.getElementById("popup-game-image");
    imgEl.src = safeImg;
    imgEl.alt = `${deal.title} cover art`;
    imgEl.onerror = () => {
        imgEl.onerror = null;
        imgEl.src = getFallbackGameImage(storeLabel);
    };

    document.getElementById("popup-game-title").textContent = deal.title;
    document.getElementById("popup-sale-price").textContent = isFree
        ? "FREE"
        : `$${Number(deal.sale_price).toFixed(2)}`;

    const origEl = document.getElementById("popup-orig-price");
    if (Number(deal.orig_price) > 0 && !isFree) {
        origEl.textContent = `$${Number(deal.orig_price).toFixed(2)}`;
        origEl.classList.remove("hidden");
    } else {
        origEl.classList.add("hidden");
    }

    document.getElementById("popup-source-meta").textContent = `Source: ${deal.author_email || "Community"}`;
    document.getElementById("popup-game-description").textContent =
        deal.note || "No additional description provided for this game offer.";

    const linkEl = document.getElementById("popup-store-link");
    linkEl.href = safeUrl;
    linkEl.innerHTML = `${isFree ? "Claim Free on Store" : `Open ${storeLabel} Page`} <i class="fa-solid fa-arrow-up-right-from-square"></i>`;

    openModal("game-info-modal");
}

/* -------------------------------------------------------------
   AUTHENTICATION (SUPABASE + LOCAL DEMO FALLBACK)
   ------------------------------------------------------------- */
async function initAuthSession() {
    if (supabaseClient) {
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (session && session.user) {
            setCurrentUser(session.user);
            await loadCloudBundleForUser(session.user.id);
        }

        supabaseClient.auth.onAuthStateChange(async (_event, session) => {
            if (session && session.user) {
                setCurrentUser(session.user);
                await loadCloudBundleForUser(session.user.id);
            } else {
                setCurrentUser(null);
            }
        });
    } else {
        const savedDemoUser = localStorage.getItem("demoAuthUser");
        if (savedDemoUser) {
            setCurrentUser(JSON.parse(savedDemoUser));
        }
    }
}

function setCurrentUser(user) {
    state.currentUser = user;
    const guestControls = document.getElementById("auth-guest-controls");
    const userControls = document.getElementById("auth-user-controls");
    const emailDisplay = document.getElementById("user-email-display");

    if (user) {
        guestControls.classList.add("hidden");
        userControls.classList.remove("hidden");
        emailDisplay.textContent = user.email;
    } else {
        guestControls.classList.remove("hidden");
        userControls.classList.add("hidden");
        emailDisplay.textContent = "";
    }
}

async function handleAuthSubmit(e) {
    e.preventDefault();
    const email = document.getElementById("auth-email").value.trim();
    const password = document.getElementById("auth-password").value;
    const feedback = document.getElementById("auth-message");
    const submitBtn = document.getElementById("auth-submit-btn");

    feedback.classList.add("hidden");
    submitBtn.disabled = true;

    try {
        if (supabaseClient) {
            if (state.authMode === "signup") {
                const { data, error } = await supabaseClient.auth.signUp({ email, password });
                if (error) throw error;
                showFormFeedback(feedback, "Account created! Check your email or sign in now.", "success");
                if (data.user && data.session) {
                    closeModal("auth-modal");
                }
            } else {
                const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
                if (error) throw error;
                closeModal("auth-modal");
            }
        } else {
            const demoUser = { id: "demo-" + btoa(email), email };
            localStorage.setItem("demoAuthUser", JSON.stringify(demoUser));
            setCurrentUser(demoUser);
            closeModal("auth-modal");
        }
    } catch (err) {
        showFormFeedback(feedback, err.message || "Authentication failed.", "error");
    } finally {
        submitBtn.disabled = false;
    }
}

async function handleSignOut() {
    if (supabaseClient) {
        await supabaseClient.auth.signOut();
    }
    localStorage.removeItem("demoAuthUser");
    setCurrentUser(null);
}

/* -------------------------------------------------------------
   STATE MANAGEMENT & CLOUD SYNC
   ------------------------------------------------------------- */
async function saveStateToStorage() {
    const dataToSave = {
        selectedApps: Array.from(state.selectedApps),
        selectedGpu: state.selectedGpu
    };
    localStorage.setItem("autoSetupState", JSON.stringify(dataToSave));

    if (supabaseClient && navigator.onLine) {
        try {
            const payload = {
                session_id: state.currentUser ? state.currentUser.id : sessionId,
                user_id: state.currentUser ? state.currentUser.id : null,
                selected_apps: dataToSave.selectedApps,
                selected_gpu: dataToSave.selectedGpu,
                created_at: new Date()
            };
            await supabaseClient
                .from("user_bundles")
                .upsert(payload, { onConflict: "session_id" });
        } catch (err) {
            console.warn("Cloud sync skipped:", err.message);
        }
    }
}

async function loadCloudBundleForUser(userId) {
    if (!supabaseClient || !navigator.onLine) return;
    try {
        const { data, error } = await supabaseClient
            .from("user_bundles")
            .select("*")
            .eq("session_id", userId)
            .single();

        if (!error && data) {
            state.selectedApps = new Set(data.selected_apps || []);
            state.selectedGpu = data.selected_gpu || "none";
            const gpuRadio = document.querySelector(`input[name="gpu"][value="${state.selectedGpu}"]`);
            if (gpuRadio) gpuRadio.checked = true;
            renderAppGrid();
            updateUI();
        }
    } catch (e) {
        console.warn("Could not fetch user cloud bundle:", e.message);
    }
}

function loadStateFromStorage() {
    const saved = localStorage.getItem("autoSetupState");
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            state.selectedApps = new Set(parsed.selectedApps || []);
            state.selectedGpu = parsed.selectedGpu || "none";
            const gpuRadio = document.querySelector(`input[name="gpu"][value="${state.selectedGpu}"]`);
            if (gpuRadio) gpuRadio.checked = true;
        } catch (e) {
            console.error("Failed to load saved state", e);
        }
    }
}

/* -------------------------------------------------------------
   GAME DEALS & FREEBIES LOGIC
   ------------------------------------------------------------- */
async function loadGameDeals() {
    const localDeals = JSON.parse(localStorage.getItem("communityGameDeals") || "[]");
    let supabaseDeals = [];

    if (supabaseClient && navigator.onLine) {
        try {
            const { data, error } = await supabaseClient
                .from("game_deals")
                .select("*")
                .order("upvotes", { ascending: false });

            if (!error && data && data.length > 0) {
                supabaseDeals = data;
            }
        } catch (err) {
            console.warn("Using cached/default game deals:", err.message);
        }
    }

    const rapidDeals = await fetchAllRapidApiDealsAndFreebies();
    const baseCommunityDeals = supabaseDeals.length > 0 ? supabaseDeals : DEFAULT_GAME_DEALS;

    state.gameDeals = [...localDeals, ...rapidDeals, ...baseCommunityDeals];
    renderGameDeals();
}

function renderGameDeals(storeFilter = "all", searchQuery = "") {
    const grid = document.getElementById("deals-grid");
    grid.innerHTML = "";

    const filtered = state.gameDeals.filter(deal => {
        const matchesStore = storeFilter === "all" || deal.store === storeFilter;
        const matchesSearch = deal.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              (deal.note && deal.note.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesStore && matchesSearch;
    });

    if (filtered.length === 0) {
        grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px;">No game deals or freebies found matching your filter.</p>`;
        return;
    }

    filtered.forEach(deal => {
        const isVoted = state.upvotedDeals.has(String(deal.id));
        const storeLabel = escapeHtml(deal.store);
        const safeUrl = escapeHtml(sanitizeStoreUrl(deal.url, deal.store, deal.title));
        const safeImg = escapeHtml(sanitizeImageUrl(deal.image, deal.store));
        const isFree = Number(deal.sale_price) === 0 || Number(deal.discount) === 100;

        const card = document.createElement("article");
        card.className = "deal-card";
        card.innerHTML = `
            <img class="deal-cover" src="${safeImg}" alt="${escapeHtml(deal.title)} cover" loading="lazy">
            <div class="deal-body">
                <div class="deal-top">
                    <span class="store-pill">${storeLabel}</span>
                    <span class="discount-badge">${isFree ? "FREEBIE" : `-${Number(deal.discount) || 0}% OFF`}</span>
                </div>
                <h3 class="deal-title">${escapeHtml(deal.title)}</h3>
                ${deal.note ? `<p class="deal-note">${escapeHtml(deal.note)}</p>` : ""}
                <div class="deal-meta">
                    <i class="fa-solid fa-circle-info"></i> Click card for full description
                </div>
            </div>
            <div class="deal-footer">
                <div class="price-box">
                    <span class="sale-price">${isFree ? "FREE" : `$${Number(deal.sale_price).toFixed(2)}`}</span>
                    ${Number(deal.orig_price) > 0 && !isFree ? `<span class="orig-price">$${Number(deal.orig_price).toFixed(2)}</span>` : ""}
                </div>
                <div class="deal-actions">
                    <button type="button" class="btn btn-outline btn-sm info-popup-btn" title="View game description">
                        <i class="fa-solid fa-align-left"></i> Info
                    </button>
                    <button type="button" class="upvote-btn ${isVoted ? "voted" : ""}" data-id="${deal.id}" title="Upvote">
                        <i class="fa-solid fa-thumbs-up"></i> <span>${deal.upvotes || 0}</span>
                    </button>
                    <a href="${safeUrl}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">
                        ${isFree ? "Claim" : "Store"} <i class="fa-solid fa-arrow-up-right-from-square"></i>
                    </a>
                </div>
            </div>
        `;

        const imgEl = card.querySelector(".deal-cover");
        imgEl.addEventListener("error", () => {
            imgEl.src = getFallbackGameImage(deal.store);
        });

        card.addEventListener("click", (e) => {
            if (e.target.closest("a") || e.target.closest(".upvote-btn")) return;
            openGameDescriptionPopup(deal);
        });

        const upvoteBtn = card.querySelector(".upvote-btn");
        upvoteBtn.addEventListener("click", (e) => {
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
        showFormFeedback(feedback, "Please sign in first to recommend a game deal.", "error");
        return;
    }

    const store = document.getElementById("deal-store").value;
    const title = document.getElementById("deal-title").value.trim();
    const rawUrl = document.getElementById("deal-url").value.trim();
    const rawImg = document.getElementById("deal-image").value.trim();

    const newDeal = {
        id: "deal-" + Date.now(),
        title,
        store,
        discount: parseInt(document.getElementById("deal-discount").value, 10),
        sale_price: parseFloat(document.getElementById("deal-sale-price").value),
        orig_price: parseFloat(document.getElementById("deal-orig-price").value),
        image: sanitizeImageUrl(rawImg, store),
        url: sanitizeStoreUrl(rawUrl, store, title),
        note: document.getElementById("deal-note").value.trim(),
        author_email: state.currentUser.email,
        user_id: state.currentUser.id,
        upvotes: 1
    };

    submitBtn.disabled = true;

    try {
        if (supabaseClient && navigator.onLine) {
            const { id, image, ...dbPayload } = newDeal;
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

        document.getElementById("deal-form").reset();
        closeModal("deal-modal");
        renderGameDeals(getCurrentStoreFilter(), document.getElementById("deal-search").value);
    } catch (err) {
        showFormFeedback(feedback, err.message || "Could not post deal.", "error");
    } finally {
        submitBtn.disabled = false;
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
    renderGameDeals(getCurrentStoreFilter(), document.getElementById("deal-search").value);

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
    grid.innerHTML = "";

    const filtered = APP_DATABASE.filter(app => {
        const matchesCat = filterCat === "all" || app.cat === filterCat;
        const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                              app.desc.toLowerCase().includes(searchQuery.toLowerCase());
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
            <input type="checkbox" id="chk-${app.id}" ${isChecked ? "checked" : ""}>
            <i class="${app.icon} app-icon"></i>
            <div class="app-info">
                <h4>${app.name}</h4>
                <p>${app.desc}</p>
            </div>
        `;

        card.addEventListener("click", (e) => {
            if (e.target.tagName !== "INPUT") {
                const chk = card.querySelector('input[type="checkbox"]');
                chk.checked = !chk.checked;
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
    renderAppGrid(getCurrentCategoryFilter(), document.getElementById("app-search").value);
    updateUI();
}

function getCurrentCategoryFilter() {
    const activeBtn = document.querySelector("#category-filters .filter-btn.active");
    return activeBtn ? activeBtn.dataset.cat : "all";
}

function updateUI() {
    document.querySelectorAll(".step-item").forEach(item => {
        const stepNum = parseInt(item.dataset.step, 10);
        item.classList.remove("active", "completed");
        if (stepNum === state.currentStep) {
            item.classList.add("active");
        } else if (stepNum < state.currentStep) {
            item.classList.add("completed");
        }
    });

    document.querySelectorAll(".wizard-step").forEach((step, idx) => {
        step.classList.toggle("active", idx + 1 === state.currentStep);
    });

    const prevBtn = document.getElementById("prev-btn");
    const nextBtn = document.getElementById("next-btn");
    prevBtn.disabled = state.currentStep === 1;

    if (state.currentStep === 4) {
        nextBtn.style.display = "none";
        generateScriptOutput();
    } else {
        nextBtn.style.display = "inline-flex";
        nextBtn.innerHTML = `Next Step <i class="fa-solid fa-arrow-right"></i>`;
    }

    document.getElementById("floating-count").textContent = state.selectedApps.size;
    document.getElementById("total-selected-count").textContent = state.selectedApps.size;

    let totalSize = 0;
    state.selectedApps.forEach(id => {
        const app = APP_DATABASE.find(a => a.id === id);
        if (app) totalSize += app.size;
    });
    document.getElementById("estimated-download-size").textContent = totalSize > 1000 ?
        `~${(totalSize / 1024).toFixed(1)} GB` : `~${totalSize} MB`;

    const gpuNames = {
        nvidia: "NVIDIA GeForce Driver",
        amd: "AMD Radeon Driver",
        intel: "Intel Arc/Graphics",
        none: "Standard Display Driver"
    };
    document.getElementById("selected-gpu-name").textContent = gpuNames[state.selectedGpu] || "None";
}

/* -------------------------------------------------------------
   EVENT LISTENERS & MODALS
   ------------------------------------------------------------- */
function setupEventListeners() {
    document.querySelectorAll(".nav-tab").forEach(tab => {
        tab.addEventListener("click", () => {
            document.querySelectorAll(".nav-tab").forEach(t => t.classList.remove("active"));
            tab.classList.add("active");

            const targetView = tab.dataset.view;
            document.querySelectorAll(".view-section").forEach(sec => {
                sec.classList.toggle("hidden", sec.id !== targetView);
            });
        });
    });

    document.getElementById("close-game-info-modal").addEventListener("click", () => closeModal("game-info-modal"));
    document.getElementById("popup-close-btn").addEventListener("click", () => closeModal("game-info-modal"));

    document.getElementById("open-auth-modal-btn").addEventListener("click", () => openModal("auth-modal"));
    document.getElementById("close-auth-modal").addEventListener("click", () => closeModal("auth-modal"));
    document.getElementById("sign-out-btn").addEventListener("click", handleSignOut);
    document.getElementById("auth-form").addEventListener("submit", handleAuthSubmit);

    document.querySelectorAll(".auth-tab-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".auth-tab-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            state.authMode = btn.dataset.mode;

            const isSignUp = state.authMode === "signup";
            document.getElementById("auth-modal-title").textContent = isSignUp ? "Create an Account" : "Sign In to AutoSetup PC";
            document.getElementById("auth-submit-btn").textContent = isSignUp ? "Create Account" : "Sign In";
            document.getElementById("auth-message").classList.add("hidden");
        });
    });

    document.getElementById("open-deal-modal-btn").addEventListener("click", () => {
        if (!state.currentUser) {
            openModal("auth-modal");
            const authMsg = document.getElementById("auth-message");
            showFormFeedback(authMsg, "Sign in or create an account to share game deals with the community!", "success");
            return;
        }
        openModal("deal-modal");
    });
    document.getElementById("close-deal-modal").addEventListener("click", () => closeModal("deal-modal"));
    document.getElementById("deal-form").addEventListener("submit", handleDealSubmit);

    document.querySelectorAll(".modal-backdrop").forEach(backdrop => {
        backdrop.addEventListener("click", () => {
            backdrop.closest(".modal").classList.add("hidden");
        });
    });

    document.getElementById("deal-search").addEventListener("input", (e) => {
        renderGameDeals(getCurrentStoreFilter(), e.target.value);
    });

    document.querySelectorAll("#store-filters .filter-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll("#store-filters .filter-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            renderGameDeals(btn.dataset.store, document.getElementById("deal-search").value);
        });
    });

    document.getElementById("next-btn").addEventListener("click", () => {
        if (state.currentStep < 4) {
            state.currentStep++;
            updateUI();
        }
    });

    document.getElementById("prev-btn").addEventListener("click", () => {
        if (state.currentStep > 1) {
            state.currentStep--;
            updateUI();
        }
    });

    document.querySelectorAll(".step-item").forEach(item => {
        item.addEventListener("click", () => {
            state.currentStep = parseInt(item.dataset.step, 10);
            updateUI();
        });
    });

    document.querySelectorAll(".preset-card").forEach(card => {
        card.addEventListener("click", () => {
            const presetKey = card.dataset.preset;
            if (PRESETS[presetKey]) {
                state.selectedApps = new Set(PRESETS[presetKey]);
                saveStateToStorage();
                document.querySelectorAll(".preset-card").forEach(c => c.classList.remove("selected"));
                card.classList.add("selected");
                renderAppGrid();
                updateUI();
            }
        });
    });

    document.querySelectorAll('input[name="gpu"]').forEach(radio => {
        radio.addEventListener("change", (e) => {
            state.selectedGpu = e.target.value;
            saveStateToStorage();
        });
    });

    document.getElementById("toggle-gpu-guide-btn").addEventListener("click", () => {
        document.getElementById("gpu-guide-content").classList.toggle("hidden");
    });

    document.querySelectorAll("#category-filters .filter-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll("#category-filters .filter-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            renderAppGrid(btn.dataset.cat, document.getElementById("app-search").value);
        });
    });

    document.getElementById("app-search").addEventListener("input", (e) => {
        renderAppGrid(getCurrentCategoryFilter(), e.target.value);
    });

    document.querySelectorAll(".tab-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            state.activeFormat = btn.dataset.format;
            generateScriptOutput();
        });
    });

    document.getElementById("reset-btn").addEventListener("click", () => {
        if (confirm("Reset all selections and start over?")) {
            state.selectedApps.clear();
            state.selectedGpu = "none";
            document.getElementById("gpu-none").checked = true;
            saveStateToStorage();
            renderAppGrid();
            updateUI();
        }
    });

    document.getElementById("copy-script-btn").addEventListener("click", copyScriptToClipboard);
    document.getElementById("download-script-btn").addEventListener("click", downloadScriptFile);
}

/* -------------------------------------------------------------
   SCRIPT GENERATOR & HELPERS
   ------------------------------------------------------------- */
function generateScriptOutput() {
    const appsList = Array.from(state.selectedApps);
    const codeElement = document.getElementById("script-preview-code");

    const gpuPackages = {
        nvidia: "Nvidia.GeForceExperience",
        amd: "AMD.RadeonSoftware",
        intel: "Intel.GraphicsDriver"
    };

    let allPackages = [...appsList];
    if (gpuPackages[state.selectedGpu]) {
        allPackages.unshift(gpuPackages[state.selectedGpu]);
    }

    if (allPackages.length === 0) {
        codeElement.textContent = "# No software or drivers selected. Please go back and pick items to install.";
        return;
    }

    let scriptText = "";

    if (state.activeFormat === "ps1") {
        scriptText = `# AutoSetup PC - Automated Windows Installation Script\n# Generated on: ${new Date().toLocaleDateString()}\n\nWrite-Host "Starting automated application installation..." -ForegroundColor Green\n\n`;
        allPackages.forEach(pkg => {
            scriptText += `winget install --id "${pkg}" -e --silent --accept-package-agreements --accept-source-agreements\n`;
        });
        scriptText += `\nWrite-Host "All applications installed successfully!" -ForegroundColor Green`;
    } else if (state.activeFormat === "bat") {
        scriptText = `@echo off\nREM AutoSetup PC - Batch Installer\n\necho Starting automated application installation...\n\n`;
        allPackages.forEach(pkg => {
            scriptText += `winget install --id "${pkg}" -e --silent --accept-package-agreements --accept-source-agreements\n`;
        });
        scriptText += `\necho All setup tasks completed!\npause`;
    } else if (state.activeFormat === "cmd") {
        scriptText = allPackages.map(pkg => `winget install --id "${pkg}" -e --silent`).join(" && ");
    }

    codeElement.textContent = scriptText;
}

function copyScriptToClipboard() {
    const text = document.getElementById("script-preview-code").textContent;
    navigator.clipboard.writeText(text).then(() => {
        alert("Script copied to clipboard!");
    });
}

function downloadScriptFile() {
    const text = document.getElementById("script-preview-code").textContent;
    const extMap = { ps1: "ps1", bat: "bat", cmd: "txt" };
    const ext = extMap[state.activeFormat] || "txt";

    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `pc-setup-installer.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function openModal(id) {
    document.getElementById(id).classList.remove("hidden");
}

function closeModal(id) {
    document.getElementById(id).classList.add("hidden");
}

function showFormFeedback(el, message, type) {
    el.textContent = message;
    el.className = `form-feedback ${type}`;
    el.classList.remove("hidden");
}

function escapeHtml(str) {
    if (!str) return "";
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}

function checkNetworkStatus() {
    const banner = document.getElementById("network-banner");
    function updateStatus() {
        banner.classList.toggle("hidden", navigator.onLine);
    }
    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);
    updateStatus();
}
