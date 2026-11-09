/* -------------------------------------------------------------
   AutoSetup PC - JavaScript Application Logic
   ------------------------------------------------------------- */

// Master Catalog of Software Applications
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

// Preset Mapping Configurations
const PRESETS = {
    office: ["Google.Chrome", "Adobe.Acrobat.Reader.64-bit", "SlackTechnologies.Slack", "LibreOffice.LibreOffice", "7zip.7zip"],
    gaming: ["Valve.Steam", "EpicGames.EpicGamesLauncher", "Discord.Discord", "Guru3D.MSIAfterburner", "Google.Chrome"],
    creator: ["OBSProject.OBSStudio", "BlenderFoundation.Blender", "GIMP.GIMP", "BlackmagicDesign.DaVinciResolve", "Audacity.Audacity"],
    developer: ["Microsoft.VisualStudioCode", "Git.Git", "Docker.DockerDesktop", "OpenJS.NodeJS", "Python.Python.3.11", "Postman.Postman"]
};

// Application State
let state = {
    currentStep: 1,
    selectedApps: new Set(),
    selectedGpu: "none",
    activeFormat: "ps1"
};

// DOM Elements Initialization
document.addEventListener("DOMContentLoaded", () => {
    loadStateFromStorage();
    renderAppGrid();
    setupEventListeners();
    updateUI();
    checkNetworkStatus();
});

/* --- State Management & LocalStorage Persistence --- */
function saveStateToStorage() {
    const dataToSave = {
        selectedApps: Array.from(state.selectedApps),
        selectedGpu: state.selectedGpu
    };
    localStorage.setItem("autoSetupState", JSON.stringify(dataToSave));
}

function loadStateFromStorage() {
    const saved = localStorage.getItem("autoSetupState");
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            state.selectedApps = new Set(parsed.selectedApps || []);
            state.selectedGpu = parsed.selectedGpu || "none";
            
            // Sync GPU radio selection
            const gpuRadio = document.querySelector(`input[name="gpu"][value="${state.selectedGpu}"]`);
            if (gpuRadio) gpuRadio.checked = true;
        } catch (e) {
            console.error("Failed to load saved state", e);
        }
    }
}

/* --- Render Software Grid --- */
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
    const activeBtn = document.querySelector(".filter-btn.active");
    return activeBtn ? activeBtn.dataset.cat : "all";
}

/* --- Navigation & Wizard UI Updates --- */
function updateUI() {
    // Stepper header update
    document.querySelectorAll(".step-item").forEach(item => {
        const stepNum = parseInt(item.dataset.step);
        item.classList.remove("active", "completed");
        if (stepNum === state.currentStep) {
            item.classList.add("active");
        } else if (stepNum < state.currentStep) {
            item.classList.add("completed");
        }
    });

    // Step Visibility
    document.querySelectorAll(".wizard-step").forEach((step, idx) => {
        step.classList.toggle("active", idx + 1 === state.currentStep);
    });

    // Footer buttons
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

    // Counters
    document.getElementById("floating-count").textContent = state.selectedApps.size;
    document.getElementById("total-selected-count").textContent = state.selectedApps.size;

    // Estimated Size Calculation
    let totalSize = 0;
    state.selectedApps.forEach(id => {
        const app = APP_DATABASE.find(a => a.id === id);
        if (app) totalSize += app.size;
    });
    document.getElementById("estimated-download-size").textContent = totalSize > 1000 ? 
        `~${(totalSize / 1024).toFixed(1)} GB` : `~${totalSize} MB`;

    // GPU Display Text
    const gpuNames = { nvidia: "NVIDIA GeForce Driver", amd: "AMD Radeon Driver", intel: "Intel Arc/Graphics", none: "Standard Display Driver" };
    document.getElementById("selected-gpu-name").textContent = gpuNames[state.selectedGpu] || "None";
}

/* --- Event Listeners Setup --- */
function setupEventListeners() {
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

    // Stepper Direct Click
    document.querySelectorAll(".step-item").forEach(item => {
        item.addEventListener("click", () => {
            state.currentStep = parseInt(item.dataset.step);
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
                
                // Visual feedback
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
        const content = document.getElementById("gpu-guide-content");
        content.classList.toggle("hidden");
    });

    // Category Filters
    document.querySelectorAll(".filter-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            renderAppGrid(btn.dataset.cat, document.getElementById("app-search").value);
        });
    });

    // App Search Input
    document.getElementById("app-search").addEventListener("input", (e) => {
        renderAppGrid(getCurrentCategoryFilter(), e.target.value);
    });

    // Format Tabs
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

/* --- Script Generator logic --- */
function generateScriptOutput() {
    const appsList = Array.from(state.selectedApps);
    const codeElement = document.getElementById("script-preview-code");
    
    // Add GPU Driver winget package if selected
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
        scriptText = `# AutoSetup PC - Automated Windows Installation Script\n`;
        scriptText += `# Generated on: ${new Date().toLocaleDateString()}\n\n`;
        scriptText += `Write-Host "Starting automated application installation..." -ForegroundColor Green\n\n`;
        allPackages.forEach(pkg => {
            scriptText += `winget install --id "${pkg}" -e --silent --accept-package-agreements --accept-source-agreements\n`;
        });
        scriptText += `\nWrite-Host "All applications installed successfully!" -ForegroundColor Green`;
    } else if (state.activeFormat === "bat") {
        scriptText = `@echo off\n`;
        scriptText += `REM AutoSetup PC - Batch Installer\n\n`;
        scriptText += `echo Starting automated application installation...\n\n`;
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

/* --- Network Resilience / Spotty Coverage Listener --- */
function checkNetworkStatus() {
    const banner = document.getElementById("network-banner");
    
    function updateStatus() {
        if (navigator.onLine) {
            banner.classList.add("hidden");
        } else {
            banner.classList.remove("hidden");
        }
    }

    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);
    updateStatus();
}
