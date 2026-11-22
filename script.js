/* -------------------------------------------------------------
   AutoSetup PC - Application Logic, Supabase Auth & Game Deals
   ------------------------------------------------------------- */

// 1. SUPABASE CONFIGURATION
// Replace these placeholders with your actual Supabase Project URL and Anon Key
const SUPABASE_URL = "https://zqaizebbuorztjywcucc.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_NUZwi3uL3Bur8ayZZSL0dw_H_1zH2SL";

let supabaseClient = null;
const isSupabaseConfigured = SUPABASE_URL.startsWith("http") && !SUPABASE_URL.includes("YOUR_SUPABASE");

if (window.supabase && isSupabaseConfigured) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// Persistent anonymous session fallback
let sessionId = localStorage.getItem("autosetup_session_id");
if (!sessionId) {
    sessionId = "session_" + Math.random().toString(36).substring(2, 15);
    localStorage.setItem("autosetup_session_id", sessionId);
}

// 2. MASTER CATALOG OF SOFTWARE APPLICATIONS
const APP_DATABASE = [
    // Browsers
    { id: "Google.Chrome", name: "Google Chrome", cat: "browsers", size: 90, icon: "fa-brands fa-chrome", desc: "Fast & popular browser" },
    { id: "Mozilla.Firefox", name: "Mozilla Firefox", cat: "browsers", size: 85, icon: "fa-brands fa-firefox", desc: "Privacy-focused browser" },
    { id: "Brave.Brave", name: "Brave Browser", cat: "browsers", size: 95, icon: "fa-brands fa-brave", desc: "Ad-blocking fast browser" },
    { id: "Opera.Opera", name: "Opera", cat: "browsers", size: 80, icon: "fa-brands fa-opera", desc: "Feature-rich web browser" },

    // Gaming
    { id: "Valve.Steam", name: "Steam", cat: "gaming", size: 60, icon: "fa-brands fa-steam", desc: "PC Gaming store & client" },
    { id: "EpicGames.EpicGamesLauncher", name: "Epic Games Launcher", cat: "gaming", size: 120, icon: "fa-solid fa-gamepad", desc: "Store & Fortnite launcher" },
    { id: "Discord.Discord", name: "Discord", cat: "gaming", size: 90, icon: "fa-brands fa-discord", desc: "Voice & text chat client" },
    { id: "Guru3D.MSIAfterburner", name: "MSI Afterburner", cat: "gaming", size: 50, icon: "fa-solid fa-gauge-high", desc: "GPU overclock & monitoring" },

    // Media & Editing
    { id: "OBSProject.OBSStudio", name: "OBS Studio", cat: "media", size: 130, icon: "fa-solid fa-video", desc: "Screen recording & streaming" },
    { id: "BlenderFoundation.Blender", name: "Blender", cat: "media", size: 310, icon: "fa-solid fa-cube", desc: "3D creation suite" },
    { id: "GIMP.GIMP", name: "GIMP", cat: "media", size: 250, icon: "fa-solid fa-paintbrush", desc: "Open-source image editor" },
    { id: "BlackmagicDesign.DaVinciResolve", name: "DaVinci Resolve", cat: "media", size: 2100, icon: "fa-solid fa-clapperboard", desc: "Professional video editing" },
    { id: "Audacity.Audacity", name: "Audacity", cat: "media", size: 40, icon: "fa-solid fa-headphones", desc: "Audio editor & recorder" },
    { id: "Videolan.VLC", name: "VLC Media Player", cat: "media", size: 40, icon: "fa-solid fa-play-circle", desc: "Universal media player" },

    // Developer
    { id: "Microsoft.VisualStudioCode", name: "VS Code", cat: "developer", size: 90, icon: "fa-solid fa-code", desc: "Lightweight code editor" },
    { id: "Git.Git", name: "Git", cat: "developer", size: 50, icon: "fa-brands fa-git-alt", desc: "Version control system" },
    { id: "Docker.DockerDesktop", name: "Docker Desktop", cat: "developer", size: 550, icon: "fa-brands fa-docker", desc: "Container application platform" },
    { id: "OpenJS.NodeJS", name: "Node.js", cat: "developer", size: 30, icon: "fa-brands fa-node-js", desc: "JavaScript runtime environment" },
    { id: "Python.Python.3.11", name: "Python 3.11", cat: "developer", size: 30, icon: "fa-brands fa-python", desc: "Popular programming language" },
    { id: "Postman.Postman", name: "Postman", cat: "developer", size: 140, icon: "fa-solid fa-network-wired", desc: "API development platform" },

    // Utilities
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

// Default Starter Game Deals (Used offline or before Supabase table is populated)
const DEFAULT_GAME_DEALS = [
    {
        id: "deal-1",
        title: "Cyberpunk 2077: Ultimate Edition",
        store: "Steam",
        discount: 53,
        sale_price: 38.60,
        orig_price: 82.98,
        url: "https://store.steampowered.com/",
        note: "Includes Phantom Liberty expansion. Great benchmark for new GPUs!",
        author_email: "alex.gamer@example.com",
        upvotes: 42
    },
    {
        id: "deal-2",
        title: "The Witcher 3: Wild Hunt - Complete Edition",
        store: "GOG",
        discount: 75,
        sale_price: 12.49,
        orig_price: 49.99,
        url: "https://www.gog.com/",
        note: "DRM-free copy with all expansions included.",
        author_email: "rpg_fan@example.com",
        upvotes: 35
    },
    {
        id: "deal-3",
        title: "Alan Wake 2",
        store: "Epic Games",
        discount: 50,
        sale_price: 24.99,
        orig_price: 49.99,
        url: "https://store.epicgames.com/",
        note: "Incredible ray-tracing showcase for NVIDIA/AMD cards.",
        author_email: "night_springs@example.com",
        upvotes: 28
    },
    {
        id: "deal-4",
        title: "Hades II",
        store: "Steam",
        discount: 20,
        sale_price: 23.99,
        orig_price: 29.99,
        url: "https://store.steampowered.com/",
        note: "Runs effortlessly on any PC spec or handheld.",
        author_email: "indie_lover@example.com",
        upvotes: 19
    }
];

// 3. APPLICATION STATE
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

// 4. INITIALIZATION
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
        // Local Demo Auth fallback so testing works out-of-the-box before Supabase keys are added
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
            // Demo mode fallback when Supabase keys haven't been entered yet
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
   COMMUNITY GAME DEALS LOGIC
   ------------------------------------------------------------- */
async function loadGameDeals() {
    // Load local custom deals first for offline stability
    const localDeals = JSON.parse(localStorage.getItem("communityGameDeals") || "[]");
    let mergedDeals = [...localDeals, ...DEFAULT_GAME_DEALS];

    if (supabaseClient && navigator.onLine) {
        try {
            const { data, error } = await supabaseClient
                .from("game_deals")
                .select("*")
                .order("upvotes", { ascending: false });

            if (!error && data && data.length > 0) {
                mergedDeals = data;
            }
        } catch (err) {
            console.warn("Using cached/default game deals:", err.message);
        }
    }

    state.gameDeals = mergedDeals;
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
        grid.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 40px;">No game deals found matching your filter.</p>`;
        return;
    }

    filtered.forEach(deal => {
        const isVoted = state.upvotedDeals.has(String(deal.id));
        const card = document.createElement("article");
        card.className = "deal-card";
        card.innerHTML = `
            <div>
                <div class="deal-top">
                    <span class="store-pill">${escapeHtml(deal.store)}</span>
                    <span class="discount-badge">-${deal.discount}% OFF</span>
                </div>
                <h3 class="deal-title">${escapeHtml(deal.title)}</h3>
                ${deal.note ? `<p class="deal-note">"${escapeHtml(deal.note)}"</p>` : ""}
                <div class="deal-meta">
                    <i class="fa-solid fa-user-check"></i> Recommended by ${escapeHtml(deal.author_email || "Community Member")}
                </div>
            </div>
            <div class="deal-footer">
                <div class="price-box">
                    <span class="sale-price">$${Number(deal.sale_price).toFixed(2)}</span>
                    <span class="orig-price">$${Number(deal.orig_price).toFixed(2)}</span>
                </div>
                <div class="deal-actions">
                    <button class="upvote-btn ${isVoted ? "voted" : ""}" data-id="${deal.id}" title="Upvote this deal">
                        <i class="fa-solid fa-thumbs-up"></i> <span>${deal.upvotes || 0}</span>
                    </button>
                    <a href="${escapeHtml(deal.url)}" target="_blank" rel="noopener noreferrer" class="btn btn-primary btn-sm">
                        Get Deal <i class="fa-solid fa-arrow-up-right-from-square"></i>
                    </a>
                </div>
            </div>
        `;

        const upvoteBtn = card.querySelector(".upvote-btn");
        upvoteBtn.addEventListener("click", () => handleUpvoteDeal(deal.id));

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

    const newDeal = {
        id: "deal-" + Date.now(),
        title: document.getElementById("deal-title").value.trim(),
        store: document.getElementById("deal-store").value,
        discount: parseInt(document.getElementById("deal-discount").value, 10),
        sale_price: parseFloat(document.getElementById("deal-sale-price").value),
        orig_price: parseFloat(document.getElementById("deal-orig-price").value),
        url: document.getElementById("deal-url").value.trim(),
        note: document.getElementById("deal-note").value.trim(),
        author_email: state.currentUser.email,
        user_id: state.currentUser.id,
        upvotes: 1
    };

    submitBtn.disabled = true;

    try {
        if (supabaseClient && navigator.onLine) {
            const { id, ...dbPayload } = newDeal;
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
    // Top View Switcher (PC Setup Wizard vs Game Deals)
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

    // Auth Modal Controls
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

    // Share Game Deal Modal Controls
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

    // Close modal on backdrop click
    document.querySelectorAll(".modal-backdrop").forEach(backdrop => {
        backdrop.addEventListener("click", () => {
            backdrop.closest(".modal").classList.add("hidden");
        });
    });

    // Game Deal Search & Store Filters
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

    // Wizard Navigation
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

    // Presets Click
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

    // GPU Radios
    document.querySelectorAll('input[name="gpu"]').forEach(radio => {
        radio.addEventListener("change", (e) => {
            state.selectedGpu = e.target.value;
            saveStateToStorage();
        });
    });

    // GPU Guide Accordion
    document.getElementById("toggle-gpu-guide-btn").addEventListener("click", () => {
        document.getElementById("gpu-guide-content").classList.toggle("hidden");
    });

    // App Category Filters & Search
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

    // Script Format Tabs
    document.querySelectorAll(".tab-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            state.activeFormat = btn.dataset.format;
            generateScriptOutput();
        });
    });

    // Reset All Button
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

    // Script Copy & Download
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
        scriptText = `# AutoSetup PC - Automated Windows Installation Script
`;
        scriptText += `# Generated on: ${new Date().toLocaleDateString()}

`;
        scriptText += `Write-Host "Starting automated application installation..." -ForegroundColor Green

`;
        allPackages.forEach(pkg => {
            scriptText += `winget install --id "${pkg}" -e --silent --accept-package-agreements --accept-source-agreements
`;
        });
        scriptText += `
Write-Host "All applications installed successfully!" -ForegroundColor Green`;
    } else if (state.activeFormat === "bat") {
        scriptText = `@echo off
`;
        scriptText += `REM AutoSetup PC - Batch Installer

`;
        scriptText += `echo Starting automated application installation...

`;
        allPackages.forEach(pkg => {
            scriptText += `winget install --id "${pkg}" -e --silent --accept-package-agreements --accept-source-agreements
`;
        });
        scriptText += `
echo All setup tasks completed!
pause`;
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
