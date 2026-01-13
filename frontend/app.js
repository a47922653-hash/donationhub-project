// app.js - DonationHub dApp dengan Archive System sebagai Moderation Tool
// =========================
// GLOBAL VARIABLES
// =========================
let web3;
let account;
let tnc;
let hub;
let TNC_DECIMALS = 18;
let TNC_SYMBOL = "TNC";
let CREATE_FEE_WEI = null;
let selectedCampaignId = null;
let balanceInterval;
let subscribed = false;
let floatingWalletVisible = false;

// Owner variables
let isContractOwner = false;
let contractOwnerAddress = null;

// Campaign archive system - SEBAGAI MODERATION TOOL
let archivedCampaigns = new Set();  // Campaign yang disembunyikan dari semua user

// =========================
// LOCALSTORAGE FUNCTIONS
// =========================
function saveArchiveToLocalStorage() {
    if (!account || !isContractOwner) return;
    
    const key = `donationhub_archive_${account.toLowerCase()}`;
    const archiveData = {
        archivedCampaigns: Array.from(archivedCampaigns),
        timestamp: Date.now(),
        version: "1.1"  // Version untuk moderasi tool
    };
    
    try {
        localStorage.setItem(key, JSON.stringify(archiveData));
        console.log("Archive saved to localStorage:", {
            count: archivedCampaigns.size,
            campaigns: Array.from(archivedCampaigns)
        });
    } catch (err) {
        console.error("Error saving archive to localStorage:", err);
    }
}

function loadArchiveFromLocalStorage() {
    if (!account) return false;
    
    const key = `donationhub_archive_${account.toLowerCase()}`;
    try {
        const savedData = localStorage.getItem(key);
        if (savedData) {
            const archiveData = JSON.parse(savedData);
            
            // Load archived campaigns
            if (archiveData.archivedCampaigns && Array.isArray(archiveData.archivedCampaigns)) {
                archivedCampaigns = new Set(archiveData.archivedCampaigns);
            }
            
            console.log("Archive loaded from localStorage:", {
                archivedCount: archivedCampaigns.size,
                version: archiveData.version || "1.0"
            });
            
            return true;
        }
    } catch (err) {
        console.error("Error loading archive from localStorage:", err);
    }
    
    return false;
}

function clearArchiveFromLocalStorage() {
    if (!account) return;
    
    const key = `donationhub_archive_${account.toLowerCase()}`;
    try {
        localStorage.removeItem(key);
        console.log("Archive cleared from localStorage");
    } catch (err) {
        console.error("Error clearing archive from localStorage:", err);
    }
}

// =========================
// DOM ELEMENTS
// =========================
let campaignTitleEl, recipientAddressEl, createCampaignBtn;
let createStatusBox, createStatusText, createTxLink;
let refreshCampaignsBtn, campaignsContainer;
let selectedCampaignText, selectedCampaignIdEl, donationAmountEl, donateBtn;
let donateStatusBox, donateStatusText, donateTxLink;
let toast, toastIcon, toastMessage;
let navLinks;

// Header Wallet Elements (COMPACT VERSION)
let headerConnectBtn, headerWalletInfo, headerWalletAddressEl, headerWalletBalanceEl;
let headerCopyBtn, headerLogoutBtn;

// Floating Wallet Elements
let floatingWallet, floatingWalletAddressEl, floatingWalletBalanceEl, floatingWalletNetworkEl;
let floatingCloseBtn, floatingCopyBtn, floatingLogoutBtn;

// =========================
// INITIALIZATION
// =========================
document.addEventListener("DOMContentLoaded", () => {
    initializeDOMElements();
    init();
});

function initializeDOMElements() {
    // Create campaign elements
    campaignTitleEl = document.getElementById("campaign-title");
    recipientAddressEl = document.getElementById("recipient-address");
    createCampaignBtn = document.getElementById("create-campaign-btn");
    createStatusBox = document.getElementById("create-status");
    createStatusText = document.getElementById("create-status-text");
    createTxLink = document.getElementById("create-tx-link");

    // Campaigns list elements
    refreshCampaignsBtn = document.getElementById("refresh-campaigns-btn");
    campaignsContainer = document.getElementById("campaigns-container");

    // Donate section elements
    selectedCampaignText = document.getElementById("selected-campaign-text");
    selectedCampaignIdEl = document.getElementById("selected-campaign-id");
    donationAmountEl = document.getElementById("donation-amount");
    donateBtn = document.getElementById("donate-btn");
    
    donateStatusBox = document.getElementById("donate-status");
    donateStatusText = document.getElementById("donate-status-text");
    donateTxLink = document.getElementById("donate-tx-link");

    // Toast notification elements
    toast = document.getElementById("toast");
    toastIcon = document.getElementById("toast-icon");
    toastMessage = document.getElementById("toast-message");
    
    // Navigation elements
    navLinks = document.querySelectorAll('.nav-link');
    
    // Header wallet elements - COMPACT VERSION
    headerConnectBtn = document.getElementById("header-connect-btn");
    headerWalletInfo = document.getElementById("header-wallet-info");
    headerWalletAddressEl = document.getElementById("header-wallet-address");
    headerWalletBalanceEl = document.getElementById("header-wallet-balance");
    
    // Tombol aksi header wallet
    headerCopyBtn = document.getElementById("header-copy-btn");
    headerLogoutBtn = document.getElementById("header-logout-btn");
    
    // Floating wallet elements
    floatingWallet = document.getElementById("floating-wallet");
    floatingWalletAddressEl = document.getElementById("floating-wallet-address");
    floatingWalletBalanceEl = document.getElementById("floating-wallet-balance");
    floatingWalletNetworkEl = document.getElementById("floating-wallet-network");
    floatingCloseBtn = document.querySelector(".floating-close-btn");
    floatingCopyBtn = document.getElementById("floating-copy-btn");
    floatingLogoutBtn = document.getElementById("floating-logout-btn");
}

function init() {
    // Scroll ke section yang aktif dari URL hash
    if (window.location.hash) {
        setTimeout(() => {
            const targetSection = document.querySelector(window.location.hash);
            if (targetSection) {
                window.scrollTo({
                    top: targetSection.offsetTop - 80,
                    behavior: 'smooth'
                });
                
                // Update nav link aktif
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === window.location.hash) {
                        link.classList.add('active');
                    }
                });
            }
        }, 100);
    }
    
    // Setup smooth scrolling untuk navigasi
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId.startsWith('#')) {
                e.preventDefault();
                const targetSection = document.querySelector(targetId);
                if (targetSection) {
                    window.scrollTo({
                        top: targetSection.offsetTop - 80,
                        behavior: 'smooth'
                    });
                    
                    // Update URL hash tanpa scroll tambahan
                    history.pushState(null, null, targetId);
                    
                    // Update active nav link
                    navLinks.forEach(navLink => {
                        navLink.classList.remove('active');
                    });
                    this.classList.add('active');
                }
            }
        });
    });
    
    // Update active nav link saat scroll
    window.addEventListener('scroll', () => {
        const sections = document.querySelectorAll('section[id]');
        const scrollPos = window.scrollY + 100;
        
        let currentSection = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                currentSection = sectionId;
            }
        });
        
        if (currentSection) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${currentSection}`) {
                    link.classList.add('active');
                }
            });
        }
    });

    // Setup event listeners
    setupEventListeners();
    
    // Check MetaMask availability
    if (!window.ethereum) {
        showToast("MetaMask tidak ditemukan. Install MetaMask.", "error");
        if (headerConnectBtn) {
            headerConnectBtn.textContent = "Install MetaMask";
            headerConnectBtn.onclick = () => window.open("https://metamask.io/download.html", "_blank");
        }
        disableAll();
        return;
    }

    // Initialize app state
    disableAll();
    renderPlaceholder("Silakan connect MetaMask untuk memuat campaign.");
    
    // Check for existing connection
    checkExistingConnection();
}

function setupEventListeners() {
    // Connect wallet button (HEADER COMPACT VERSION)
    if (headerConnectBtn) {
        headerConnectBtn.addEventListener("click", connectWallet);
    }
    
    // Header wallet actions
    if (headerCopyBtn) {
        headerCopyBtn.addEventListener("click", copyAddressToClipboard);
    }
    
    if (headerLogoutBtn) {
        headerLogoutBtn.addEventListener("click", disconnectWallet);
    }
    
    // Floating wallet actions
    if (floatingCloseBtn) {
        floatingCloseBtn.addEventListener("click", () => {
            floatingWallet.classList.remove("show");
            floatingWalletVisible = false;
        });
    }
    if (floatingCopyBtn) {
        floatingCopyBtn.addEventListener("click", copyAddressToClipboard);
    }
    if (floatingLogoutBtn) {
        floatingLogoutBtn.addEventListener("click", disconnectWallet);
    }
    
    // Form submissions
    const createCampaignForm = document.getElementById("create-campaign-form");
    if (createCampaignForm) {
        createCampaignForm.addEventListener("submit", onCreateCampaignOneClick);
    }
    
    if (refreshCampaignsBtn) {
        refreshCampaignsBtn.addEventListener("click", refreshCampaigns);
    }
    
    const donateForm = document.getElementById("donate-form");
    if (donateForm) {
        donateForm.addEventListener("submit", onDonateOneClick);
    }
    
    // Form validation
    if (campaignTitleEl) {
        campaignTitleEl.addEventListener("input", validateCreateForm);
    }
    if (recipientAddressEl) {
        recipientAddressEl.addEventListener("input", validateCreateForm);
        recipientAddressEl.addEventListener("blur", validateAddress);
    }
    if (donationAmountEl) {
        donationAmountEl.addEventListener("input", validateDonateForm);
    }
    
    // Window events
    if (window.ethereum) {
        window.ethereum.on("accountsChanged", handleAccountsChanged);
        window.ethereum.on("chainChanged", handleChainChanged);
    }
    
    // Scroll event for floating wallet
    window.addEventListener("scroll", handleScrollForFloatingWallet);
    
    // Click outside to close floating wallet
    document.addEventListener('click', (e) => {
        if (floatingWalletVisible && 
            floatingWallet && 
            !floatingWallet.contains(e.target) && 
            !e.target.closest('.header-wallet')) {
            floatingWallet.classList.remove("show");
            floatingWalletVisible = false;
        }
    });
}

function updateActiveNavLinkBasedOnScroll() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPos = window.scrollY + 100;
    
    let currentSection = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;
        const sectionId = section.getAttribute('id');
        
        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
            currentSection = sectionId;
        }
    });
    
    if (currentSection) {
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
        history.pushState(null, null, `#${currentSection}`);
    } else {
        // Jika tidak ada section yang aktif, set ke landing
        navLinks.forEach(link => link.classList.remove('active'));
        const landingLink = document.querySelector('a[href="#landing"]');
        if (landingLink) landingLink.classList.add('active');
        history.pushState(null, null, '#landing');
    }
}

async function checkExistingConnection() {
    try {
        if (!window.ethereum) return;
        
        const accounts = await window.ethereum.request({ method: "eth_accounts" });
        if (accounts && accounts.length > 0) {
            account = accounts[0];
            await initializeWeb3();
            await afterConnected();
        }
    } catch (err) {
        console.log("No existing connection:", err.message);
    }
}

// =========================
// OWNER CHECK FUNCTIONS
// =========================
async function checkIfUserIsOwner() {
    try {
        if (!hub || !account) {
            isContractOwner = false;
            return false;
        }
        
        contractOwnerAddress = await hub.methods.owner().call();
        isContractOwner = contractOwnerAddress.toLowerCase() === account.toLowerCase();
        
        console.log("Owner check:", {
            contractOwner: contractOwnerAddress,
            user: account,
            isOwner: isContractOwner
        });
        
        return isContractOwner;
    } catch (err) {
        console.error("Error checking owner:", err);
        isContractOwner = false;
        return false;
    }
}

async function displayOwnerBadge() {
    const isOwner = await checkIfUserIsOwner();
    
    // Hapus badge lama jika ada
    const oldBadge = document.getElementById('owner-badge');
    if (oldBadge) oldBadge.remove();
    
    // Tambahkan badge owner di header jika user adalah owner
    if (isOwner) {
        const headerRight = document.querySelector('.header-right');
        if (headerRight) {
            const ownerBadge = document.createElement('div');
            ownerBadge.id = 'owner-badge';
            ownerBadge.className = 'owner-badge';
            ownerBadge.innerHTML = `
                <i class="fas fa-crown"></i>
                <span>Contract Owner</span>
                ${archivedCampaigns.size > 0 ? 
                    `<span class="archive-badge">${archivedCampaigns.size} archived</span>` : ''}
            `;
            
            // Sisipkan sebelum network-badge
            const networkBadge = document.querySelector('.network-badge');
            if (networkBadge) {
                headerRight.insertBefore(ownerBadge, networkBadge);
            } else {
                headerRight.appendChild(ownerBadge);
            }
        }
    }
    
    return isOwner;
}

// =========================
// ARCHIVE FUNCTIONS - MODERATION TOOL
// =========================
function archiveCampaign(campaignId, title) {
    if (!isContractOwner) {
        showToast("Hanya Contract Owner yang bisa meng-archive campaign!", "error");
        return;
    }
    
    if (!confirm(`📁 ARCHIVE - MODERATION ACTION\n\nArchive campaign #${campaignId}?\n\n✅ Akan disembunyikan\n✅ Hanya muncul di Archive Section (owner only)\n✅ Bisa di-restore kapan saja.`)) {
        return;
    }
    
    archivedCampaigns.add(campaignId);
    saveArchiveToLocalStorage();
    
    showToast(`Campaign #${campaignId} di-archive (tersembunyi)`, "success");
    refreshCampaigns();
}

function restoreArchivedCampaign(campaignId) {
    archivedCampaigns.delete(campaignId);
    saveArchiveToLocalStorage();
    
    showToast(`Campaign #${campaignId} dikembalikan ke daftar utama`, "success");
    refreshCampaigns();
}

function clearAllArchived() {
    if (!isContractOwner) {
        showToast("Hanya owner yang bisa clear archive", "error");
        return;
    }
    
    if (archivedCampaigns.size === 0) {
        showToast("Tidak ada campaign yang di-archive", "info");
        return;
    }
    
    if (!confirm(`⚠️  CLEAR ALL ARCHIVED CAMPAIGNS\n\nIni akan menghapus ${archivedCampaigns.size} campaign dari archive:\n\n• Semua campaign akan kembali terlihat\n• Tidak menghapus dari blockchain\n• Hanya menghapus dari daftar archive\n\nLanjutkan?`)) {
        return;
    }
    
    archivedCampaigns.clear();
    saveArchiveToLocalStorage();
    
    showToast(`Semua campaign (${archivedCampaigns.size}) dihapus dari archive`, "success");
    refreshCampaigns();
}

function clearAllOwnerData() {
    if (!isContractOwner) {
        showToast("Hanya owner yang bisa clear data", "error");
        return;
    }
    
    if (!confirm(`⚠️  CLEAR ALL OWNER DATA\n\nIni akan menghapus:\n• Semua archived campaigns (${archivedCampaigns.size})\n\nData akan hilang permanen. Lanjutkan?`)) {
        return;
    }
    
    // Clear from memory
    archivedCampaigns.clear();
    
    // Clear from localStorage
    clearArchiveFromLocalStorage();
    
    // Update UI
    refreshCampaigns();
    
    showToast("Semua data owner telah dihapus", "success");
}

// =========================
// WALLET FUNCTIONS
// =========================
async function connectWallet() {
    try {
        // Set loading state for button
        if (headerConnectBtn) setButtonLoading(headerConnectBtn, "Connecting...");
        
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        account = accounts[0];

        await initializeWeb3();
        await afterConnected();

        showToast("Wallet berhasil terhubung!", "success");
        
    } catch (err) {
        showToast(parseError(err), "error");
    } finally {
        // Reset button
        if (headerConnectBtn) resetButton(headerConnectBtn, `<i class="fas fa-plug"></i> Connect Wallet`);
    }
}

async function initializeWeb3() {
    if (!window.ethereum || !account) return false;
    
    try {
        web3 = new Web3(window.ethereum);
        
        // Periksa config.js sudah dimuat
        if (typeof TNC_ADDRESS === 'undefined' || typeof HUB_ADDRESS === 'undefined') {
            console.error("Config.js belum dimuat atau ada error");
            showToast("Error: Konfigurasi kontrak tidak ditemukan", "error");
            return false;
        }
        
        tnc = new web3.eth.Contract(TNC_ABI, TNC_ADDRESS);
        hub = new web3.eth.Contract(HUB_ABI, HUB_ADDRESS);

        const ok = await checkNetwork();
        if (!ok) return false;

        await loadTokenMeta();
        await loadCreateFee();
        await setupEventSubscriptions();
        
        return true;
    } catch (err) {
        console.error("Error initializing Web3:", err);
        showToast("Gagal menginisialisasi Web3: " + err.message, "error");
        return false;
    }
}

async function checkNetwork() {
    try {
        const chainId = await window.ethereum.request({ method: "eth_chainId" });

        if (chainId !== CHAIN_ID_HEX) {
            // Update floating wallet network status
            if (floatingWalletNetworkEl) {
                floatingWalletNetworkEl.innerHTML = `<i class="fas fa-times-circle"></i> Wrong network`;
                floatingWalletNetworkEl.className = "floating-wallet-status";
                floatingWalletNetworkEl.style.color = "var(--danger-color)";
            }
            
            disableAll();
            showToast("Silakan switch ke Sepolia Testnet", "warning");
            
            try {
                await window.ethereum.request({
                    method: "wallet_switchEthereumChain",
                    params: [{ chainId: CHAIN_ID_HEX }],
                });
                setTimeout(() => location.reload(), 1000);
            } catch (switchError) {
                if (switchError.code === 4902) {
                    await window.ethereum.request({
                        method: "wallet_addEthereumChain",
                        params: [{
                            chainId: CHAIN_ID_HEX,
                            chainName: "Sepolia Testnet",
                            rpcUrls: ["https://rpc.sepolia.org"],
                            nativeCurrency: {
                                name: "Sepolia ETH",
                                symbol: "ETH",
                                decimals: 18
                            },
                            blockExplorerUrls: ["https://sepolia.etherscan.io"]
                        }]
                    });
                }
            }
            return false;
        }

        // Update floating wallet network status
        if (floatingWalletNetworkEl) {
            const isOwner = await checkIfUserIsOwner();
            if (isOwner) {
                floatingWalletNetworkEl.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 5px;">
                        <i class="fas fa-crown" style="color: gold;"></i>
                        <span>Owner • Sepolia</span>
                    </div>
                `;
                floatingWalletNetworkEl.style.color = "var(--text-color)";
            } else {
                floatingWalletNetworkEl.innerHTML = `<i class="fas fa-check-circle"></i> Sepolia`;
                floatingWalletNetworkEl.className = "floating-wallet-status";
                floatingWalletNetworkEl.style.color = "var(--success-color)";
            }
        }
        
        return true;
    } catch (error) {
        console.error("Network check error:", error);
        
        if (floatingWalletNetworkEl) {
            floatingWalletNetworkEl.innerHTML = `<i class="fas fa-exclamation-triangle"></i> Network Error`;
            floatingWalletNetworkEl.className = "floating-wallet-status";
            floatingWalletNetworkEl.style.color = "var(--warning-color)";
        }
        
        return false;
    }
}

// =========================
// FLOATING WALLET FUNCTIONS
// =========================
function toggleFloatingWallet() {
    if (!account) return;
    
    if (floatingWalletVisible) {
        floatingWallet.classList.remove("show");
        floatingWalletVisible = false;
    } else {
        floatingWallet.classList.add("show");
        floatingWalletVisible = true;
    }
}

function handleScrollForFloatingWallet() {
    if (!account) return;
    
    const scrollPosition = window.scrollY;
    const landingSection = document.getElementById('landing');
    const landingHeight = landingSection ? landingSection.offsetHeight : 0;
    
    // Show floating wallet when scrolling past 70% of landing section
    if (scrollPosition > landingHeight * 0.7) {
        floatingWallet.classList.add("show");
        floatingWalletVisible = true;
    } else if (!floatingWalletVisible) {
        // Only hide if user hasn't manually opened it
        floatingWallet.classList.remove("show");
    }
}

function updateFloatingWallet() {
    if (!account || !floatingWalletAddressEl || !floatingWalletBalanceEl) return;
    
    floatingWalletAddressEl.textContent = shorten(account);
    floatingWalletBalanceEl.textContent = headerWalletBalanceEl ? headerWalletBalanceEl.textContent : "0.00 TNC";
    
    // Update owner indicator in floating wallet
    if (isContractOwner) {
        // Tambahkan class owner version
        floatingWallet.classList.add('owner-version');
        
        // Update struktur floating wallet untuk owner
        updateFloatingWalletForOwner();
    } else {
        floatingWallet.classList.remove('owner-version');
        // Reset ke struktur default
        resetFloatingWalletToDefault();
    }
}

function updateFloatingWalletForOwner() {
    const floatingWalletContent = document.querySelector('.floating-wallet-content');
    if (!floatingWalletContent) return;
    
    // Update struktur HTML floating wallet untuk owner
    floatingWalletContent.innerHTML = `
        <div class="floating-wallet-header">
            <i class="fas fa-crown" style="color: gold;"></i>
            <span style="color: gold; font-weight: 700;">Owner Wallet</span>
            <button class="floating-close-btn">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="floating-wallet-details">
            <div class="floating-wallet-grid">
                <div class="floating-wallet-grid-item">
                    <div class="floating-wallet-grid-label">Address</div>
                    <div class="floating-wallet-grid-value" id="floating-grid-address">${shorten(account)}</div>
                </div>
                <div class="floating-wallet-grid-item">
                    <div class="floating-wallet-grid-label">Balance</div>
                    <div class="floating-wallet-grid-value" id="floating-grid-balance">${headerWalletBalanceEl ? headerWalletBalanceEl.textContent : "0.00 TNC"}</div>
                </div>
                <div class="floating-wallet-grid-item">
                    <div class="floating-wallet-grid-label">Role</div>
                    <div class="floating-wallet-grid-value" style="color: gold; font-weight: 600;">
                        <i class="fas fa-crown"></i> Contract Owner
                    </div>
                </div>
                <div class="floating-wallet-grid-item">
                    <div class="floating-wallet-grid-label">Network</div>
                    <div class="floating-wallet-grid-value">
                        <i class="fas fa-check-circle" style="color: var(--success-color);"></i>
                        Sepolia
                    </div>
                </div>
                <div class="floating-wallet-grid-item" style="grid-column: 1 / -1;">
                    <div class="floating-wallet-grid-label">Archive Stats</div>
                    <div class="floating-wallet-grid-value">
                        <span style="color: #6c5ce7;">
                            <i class="fas fa-archive"></i> 
                            ${archivedCampaigns.size} campaign tersembunyi
                        </span>
                    </div>
                </div>
            </div>
            <div class="floating-owner-actions">
                <button class="btn btn-outline btn-small" id="floating-view-owner-btn">
                    <i class="fas fa-eye"></i>
                    View Owner
                </button>
                <button class="btn btn-info btn-small" id="floating-view-archive-btn">
                    <i class="fas fa-archive"></i>
                    View Archive (${archivedCampaigns.size})
                </button>
                ${archivedCampaigns.size > 0 ? `
                <button class="btn btn-warning btn-small" id="floating-clear-data-btn" style="grid-column: 1 / -1;">
                    <i class="fas fa-trash"></i>
                    Clear Archive (${archivedCampaigns.size})
                </button>` : ''}
            </div>
            <div class="floating-wallet-actions">
                <button id="floating-copy-btn" class="btn btn-outline btn-small">
                    <i class="far fa-copy"></i>
                    Copy Address
                </button>
                <button id="floating-logout-btn" class="btn btn-danger btn-small">
                    <i class="fas fa-sign-out-alt"></i>
                    Logout
                </button>
            </div>
        </div>
    `;
    
    // Setup event listeners untuk tombol baru
    setupFloatingWalletOwnerButtons();
}

function resetFloatingWalletToDefault() {
    const floatingWalletContent = document.querySelector('.floating-wallet-content');
    if (!floatingWalletContent) return;
    
    floatingWalletContent.innerHTML = `
        <div class="floating-wallet-header">
            <i class="fas fa-wallet"></i>
            <span>Wallet Connected</span>
            <button class="floating-close-btn">
                <i class="fas fa-times"></i>
            </button>
        </div>
        <div class="floating-wallet-details">
            <div class="floating-wallet-item">
                <span class="floating-wallet-label">Address:</span>
                <span id="floating-wallet-address" class="floating-wallet-value">${shorten(account)}</span>
            </div>
            <div class="floating-wallet-item">
                <span class="floating-wallet-label">Balance:</span>
                <span id="floating-wallet-balance" class="floating-wallet-value">${headerWalletBalanceEl ? headerWalletBalanceEl.textContent : "0.00 TNC"}</span>
            </div>
            <div class="floating-wallet-item">
                <span class="floating-wallet-label">Network:</span>
                <span id="floating-wallet-network" class="floating-wallet-status">
                    <i class="fas fa-check-circle"></i>
                    Sepolia
                </span>
            </div>
            <div class="floating-wallet-actions">
                <button id="floating-copy-btn" class="btn btn-outline btn-small">
                    <i class="far fa-copy"></i>
                    Copy Address
                </button>
                <button id="floating-logout-btn" class="btn btn-danger btn-small">
                    <i class="fas fa-sign-out-alt"></i>
                    Logout
                </button>
            </div>
        </div>
    `;
    
    // Re-initialize event listeners
    floatingCloseBtn = document.querySelector(".floating-close-btn");
    floatingCopyBtn = document.getElementById("floating-copy-btn");
    floatingLogoutBtn = document.getElementById("floating-logout-btn");
    
    if (floatingCloseBtn) {
        floatingCloseBtn.addEventListener("click", () => {
            floatingWallet.classList.remove("show");
            floatingWalletVisible = false;
        });
    }
    if (floatingCopyBtn) {
        floatingCopyBtn.addEventListener("click", copyAddressToClipboard);
    }
    if (floatingLogoutBtn) {
        floatingLogoutBtn.addEventListener("click", disconnectWallet);
    }
}

function setupFloatingWalletOwnerButtons() {
    // View Owner Info button
    const viewOwnerBtn = document.getElementById('floating-view-owner-btn');
    if (viewOwnerBtn) {
        viewOwnerBtn.addEventListener('click', showOwnerInfo);
    }
    
    // View Archive button
    const viewArchiveBtn = document.getElementById('floating-view-archive-btn');
    if (viewArchiveBtn) {
        viewArchiveBtn.addEventListener('click', showArchivedCampaignsModal);
    }
    
    // Clear Archive Data button
    const clearDataBtn = document.getElementById('floating-clear-data-btn');
    if (clearDataBtn) {
        clearDataBtn.addEventListener('click', clearAllOwnerData);
    }
    
    // Copy button
    const copyBtn = document.getElementById('floating-copy-btn');
    if (copyBtn) {
        copyBtn.addEventListener('click', copyAddressToClipboard);
    }
    
    // Logout button
    const logoutBtn = document.getElementById('floating-logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', disconnectWallet);
    }
    
    // Close button
    const closeBtn = document.querySelector('.floating-close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            floatingWallet.classList.remove("show");
            floatingWalletVisible = false;
        });
    }
}

function showOwnerInfo() {
    if (!contractOwnerAddress) return;
    
    const info = `
📋 **CONTRACT OWNER INFORMATION**

**Contract Address:** ${HUB_ADDRESS}
**Owner Address:** ${contractOwnerAddress}
**Your Address:** ${account}
**Status:** ${isContractOwner ? '✅ YOU ARE THE OWNER' : '❌ NOT OWNER'}

**Archive Stats:** ${archivedCampaigns.size} campaign tersembunyi

**Explorer Links:**
• Contract: ${EXPLORER_ADDR}${HUB_ADDRESS}
• Owner: ${EXPLORER_ADDR}${contractOwnerAddress}
• Your Profile: ${EXPLORER_ADDR}${account}
    `;
    
    alert(info);
}

// =========================
// AFTER CONNECTED FUNCTIONS
// =========================
async function afterConnected() {
    if (!account) return;

    // Update header wallet - HIDE button, SHOW compact info
    if (headerConnectBtn && headerWalletInfo) {
        headerConnectBtn.style.display = "none";
        headerWalletInfo.classList.remove("hidden");
        if (headerWalletAddressEl) headerWalletAddressEl.textContent = shorten(account);
    }

    // Cek dan tampilkan owner badge
    await displayOwnerBadge();
    
    // Load archive dari localStorage jika user adalah owner
    if (isContractOwner) {
        loadArchiveFromLocalStorage();
        console.log("Owner archive loaded:", {
            archivedCount: archivedCampaigns.size,
            campaigns: Array.from(archivedCampaigns)
        });
    }
    
    // Enable buttons
    if (refreshCampaignsBtn) refreshCampaignsBtn.disabled = false;
    if (createCampaignBtn) createCampaignBtn.disabled = false;

    // Load data
    await refreshBalance();
    await refreshCampaigns();
    startBalanceAutoRefresh();

    // Validate forms
    validateCreateForm();
    validateDonateForm();
    
    // Update floating wallet
    updateFloatingWallet();
}

async function refreshBalance() {
    if (!tnc || !account) return;
    try {
        const bal = await tnc.methods.balanceOf(account).call();
        const decimals = TNC_DECIMALS || 18;
        const formatted = formatUnit(bal, decimals);
        
        // Update balance displays
        if (headerWalletBalanceEl) headerWalletBalanceEl.textContent = `${formatted} ${TNC_SYMBOL}`;
        if (floatingWalletBalanceEl) floatingWalletBalanceEl.textContent = `${formatted} ${TNC_SYMBOL}`;
        
        // Update grid balance jika ada
        const gridBalance = document.getElementById('floating-grid-balance');
        if (gridBalance) gridBalance.textContent = `${formatted} ${TNC_SYMBOL}`;
    } catch (error) {
        console.error("Error refreshing balance:", error);
        const errorText = "Error";
        if (headerWalletBalanceEl) headerWalletBalanceEl.textContent = errorText;
        if (floatingWalletBalanceEl) floatingWalletBalanceEl.textContent = errorText;
    }
}

function startBalanceAutoRefresh() {
    if (balanceInterval) clearInterval(balanceInterval);
    balanceInterval = setInterval(async () => {
        if (account && tnc) {
            await refreshBalance();
        }
    }, 15000);
}

function disconnectWallet() {
    // Show confirmation dialog
    if (!confirm("Apakah Anda yakin ingin logout dari wallet?")) {
        return;
    }
    
    account = null;
    web3 = null;
    tnc = null;
    hub = null;
    selectedCampaignId = null;
    isContractOwner = false;
    contractOwnerAddress = null;
    
    // Hanya reset setting, TIDAK clear localStorage
    // archivedCampaigns tetap disimpan di localStorage
    
    if (balanceInterval) {
        clearInterval(balanceInterval);
        balanceInterval = null;
    }
    
    // Reset header wallet - SHOW button, HIDE compact info
    if (headerConnectBtn && headerWalletInfo) {
        headerConnectBtn.style.display = "flex";
        headerWalletInfo.classList.add("hidden");
        if (headerWalletAddressEl) headerWalletAddressEl.textContent = "0x0000...0000";
        if (headerWalletBalanceEl) headerWalletBalanceEl.textContent = "0.00 TNC";
    }
    
    // Hapus owner badge
    const ownerBadge = document.getElementById('owner-badge');
    if (ownerBadge) ownerBadge.remove();
    
    // Reset floating wallet ke default
    if (floatingWallet) {
        floatingWallet.classList.remove('owner-version');
        resetFloatingWalletToDefault();
        floatingWallet.classList.remove("show");
        floatingWalletVisible = false;
    }
    
    // Reset forms
    if (campaignTitleEl) campaignTitleEl.value = "";
    if (recipientAddressEl) recipientAddressEl.value = "";
    if (donationAmountEl) donationAmountEl.value = "";
    if (selectedCampaignText) selectedCampaignText.textContent = "Klik \"Donate\" pada campaign di daftar";
    if (selectedCampaignIdEl) selectedCampaignIdEl.value = "";
    
    // Reset status boxes
    if (createStatusBox) createStatusBox.classList.add("hidden");
    if (donateStatusBox) donateStatusBox.classList.add("hidden");
    
    // Reset campaign list
    renderPlaceholder("Silakan connect MetaMask untuk memuat campaign.");
    disableAll();
    
    // Show notification
    showToast("Wallet berhasil logout", "success");
    
    // Update nav link berdasarkan posisi scroll saat ini
    updateActiveNavLinkBasedOnScroll();
}

// =========================
// CREATE CAMPAIGN (One-Click) - DENGAN GAS ESTIMATION
// =========================
async function onCreateCampaignOneClick(e) {
    e.preventDefault();

    try {
        if (!(await checkNetwork())) return;

        const title = campaignTitleEl.value.trim();
        const recipient = recipientAddressEl.value.trim();

        if (!title) {
            showToast("Judul campaign wajib diisi.", "warning");
            return;
        }
        
        if (!web3.utils.isAddress(recipient)) {
            showToast("Alamat recipient tidak valid.", "error");
            return;
        }

        if (!CREATE_FEE_WEI) await loadCreateFee();

        setButtonLoading(createCampaignBtn, "Creating...");

        const allowance = await tnc.methods.allowance(account, HUB_ADDRESS).call();
        const needApprove = web3.utils.toBN(allowance).lt(web3.utils.toBN(CREATE_FEE_WEI));

        if (needApprove) {
            setStatus(
                createStatusBox,
                createStatusText,
                createTxLink,
                "pending",
                "Step 1/2: Approve fee 1 TNC di MetaMask..."
            );

            // Estimate gas untuk approve
            const approveGasEstimate = await tnc.methods
                .approve(HUB_ADDRESS, CREATE_FEE_WEI)
                .estimateGas({ from: account });
            
            const txApprove = await tnc.methods
                .approve(HUB_ADDRESS, CREATE_FEE_WEI)
                .send({ 
                    from: account,
                    gas: Math.floor(approveGasEstimate * 1.2)
                });

            const approveHash = txApprove.transactionHash;
            setStatus(
                createStatusBox,
                createStatusText,
                createTxLink,
                "success",
                "Approve sukses. Lanjut create campaign...",
                approveHash
            );
            
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        setStatus(
            createStatusBox,
            createStatusText,
            createTxLink,
            "pending",
            needApprove ? "Step 2/2: Create campaign di MetaMask..." : "Create campaign di MetaMask..."
        );

        // Estimate gas untuk create campaign
        const createGasEstimate = await hub.methods
            .createCampaign(title, recipient)
            .estimateGas({ from: account });
        
        const txCreate = await hub.methods
            .createCampaign(title, recipient)
            .send({ 
                from: account,
                gas: Math.floor(createGasEstimate * 1.2)
            });

        const createHash = txCreate.transactionHash;
        setStatus(
            createStatusBox,
            createStatusText,
            createTxLink,
            "success",
            "Campaign berhasil dibuat!",
            createHash
        );

        campaignTitleEl.value = "";
        recipientAddressEl.value = "";
        showToast("Campaign berhasil dibuat!", "success");
        await refreshBalance();
        await refreshCampaigns();
        
    } catch (err) {
        console.error("Create campaign error:", err);
        setStatus(createStatusBox, createStatusText, createTxLink, "error", parseError(err));
        showToast(parseError(err), "error");
    } finally {
        resetButton(createCampaignBtn, `<i class="fas fa-rocket"></i> Create Campaign`);
        validateCreateForm();
    }
}

// =========================
// REFRESH CAMPAIGNS - DENGAN FILTER ARCHIVE YANG BENAR
// =========================
async function refreshCampaigns() {
    try {
        if (!hub) return;

        renderPlaceholder("Memuat campaign...");
        setButtonLoading(refreshCampaignsBtn, "Loading...");

        // Cek status owner sebelum load campaigns
        const userIsOwner = await checkIfUserIsOwner();
        
        const count = Number(await hub.methods.campaignCount().call());

        if (count === 0) {
            renderPlaceholder("Belum ada campaign.");
            return;
        }

        const list = [];
        for (let i = 1; i <= count; i++) {
            try {
                const c = await hub.methods.campaigns(i).call();
                list.push({
                    id: Number(c.id),
                    creator: c.creator,
                    recipient: c.recipient,
                    title: c.title,
                    totalDonated: c.totalDonated,
                    active: c.active
                });
            } catch (err) {
                console.error(`Error loading campaign ${i}:`, err);
            }
        }

        // LOGIC FILTER YANG BENAR:
        const filteredList = list.filter(campaign => {
            // SELALU hilangkan campaign yang di-archive dari view normal
            if (archivedCampaigns.has(campaign.id)) return false;
            
            // Untuk user biasa: HANYA campaign aktif yang TIDAK di-archive
            if (!userIsOwner) {
                return campaign.active; // Hanya campaign aktif
            }
            
            // Untuk owner di view normal: Tampilkan semua (aktif+nonaktif) TANPA yang archived
            return true; // Owner lihat semua kecuali archived
        });

        renderCampaigns(filteredList, userIsOwner);
    } catch (err) {
        renderPlaceholder("Gagal memuat campaign. " + parseError(err));
    } finally {
        resetButton(refreshCampaignsBtn, `<i class="fas fa-sync-alt"></i> Refresh`);
    }
}

// =========================
// UTILITY FUNCTIONS UNTUK FILTER
// =========================
function getCampaignsForUser(campaigns, userIsOwner) {
    return campaigns.filter(campaign => {
        // SELALU hilangkan yang di-archive dari view normal
        if (archivedCampaigns.has(campaign.id)) return false;
        
        // User biasa hanya lihat aktif
        if (!userIsOwner) return campaign.active;
        
        // Owner lihat semua di view normal
        return true;
    });
}

function getArchivedCampaigns(campaigns) {
    return campaigns.filter(campaign => 
        archivedCampaigns.has(campaign.id)
    );
}

function getActiveCampaignsForRegularUser(campaigns) {
    return campaigns.filter(campaign => 
        campaign.active && !archivedCampaigns.has(campaign.id)
    );
}

// =========================
// RENDER CAMPAIGNS
// =========================
function renderCampaigns(campaigns, userIsOwner = false) {
    if (!campaignsContainer) return;
    
    campaignsContainer.innerHTML = "";

    if (campaigns.length === 0) {
        if (userIsOwner) {
            // Owner: tampilkan pesan dengan info archive
            const message = archivedCampaigns.size > 0 ? 
                `Tidak ada campaign yang ditampilkan. ${archivedCampaigns.size} campaign tersembunyi di archive.` :
                "Tidak ada campaign.";
                
            renderPlaceholder(message);
        } else {
            // User biasa: pesan yang lebih sederhana
            renderPlaceholder("Tidak ada campaign aktif saat ini.");
        }
        return;
    }

    // Untuk OWNER: Tampilkan info dan archive stats
    if (userIsOwner) {
        const ownerInfo = document.createElement('div');
        ownerInfo.className = 'owner-info-box';
        ownerInfo.innerHTML = `
            <div class="owner-notice">
                <i class="fas fa-crown"></i>
                <span>Owner View: ${campaigns.length} campaign ditampilkan</span>
                ${archivedCampaigns.size > 0 ? 
                    `<span class="archive-count">
                        <i class="fas fa-archive"></i>
                        ${archivedCampaigns.size} campaign tersembunyi dari user biasa
                    </span>` : ''}
                <span class="owner-actions">
                    <button class="btn-owner-action btn-archive-action" id="show-archived-btn">
                        <i class="fas fa-archive"></i>
                        View Archive (${archivedCampaigns.size})
                    </button>
                </span>
            </div>
        `;
        campaignsContainer.appendChild(ownerInfo);
        
        const showArchivedBtn = document.getElementById('show-archived-btn');
        if (showArchivedBtn) {
            showArchivedBtn.addEventListener('click', showArchivedCampaignsModal);
        }
    }

    // Render campaign cards
    campaigns
        .slice()
        .reverse()
        .forEach((c) => {
            const card = document.createElement("div");
            card.className = "campaign-card";
            if (!c.active) card.classList.add('inactive-campaign');

            const statusClass = c.active ? "active" : "inactive";
            const statusText = c.active ? "Aktif" : "Nonaktif (PERMANEN)";
            const totalDonated = formatUnit(c.totalDonated, TNC_DECIMALS);
            
            const isCreator = account && c.creator.toLowerCase() === account.toLowerCase();
            
            // Hanya owner yang bisa delete/archive
            const canDelete = userIsOwner && c.active;
            const canArchive = userIsOwner;

            card.innerHTML = `
                <div class="campaign-header">
                    <div class="campaign-id">#${c.id}</div>
                    <div class="campaign-status ${statusClass}">${statusText}</div>
                </div>
                <div class="campaign-title">${escapeHtml(c.title)}</div>
                <div class="campaign-details">
                    <div class="campaign-detail">
                        <div class="detail-label">Creator</div>
                        <div class="detail-value" title="${c.creator}">
                            ${shorten(c.creator)}
                            ${isCreator ? ' <span class="you-badge">(Anda)</span>' : ''}
                        </div>
                    </div>
                    <div class="campaign-detail">
                        <div class="detail-label">Recipient</div>
                        <div class="detail-value" title="${c.recipient}">${shorten(c.recipient)}</div>
                    </div>
                </div>
                <div class="campaign-total">
                    <i class="fas fa-coins"></i>
                    <span>Total Donated: ${totalDonated} ${TNC_SYMBOL}</span>
                </div>
                <div class="campaign-footer">
                    <button class="btn btn-primary select-campaign-btn" 
                            data-id="${c.id}" 
                            data-title="${escapeHtml(c.title)}" 
                            ${!c.active ? 'disabled' : ''}>
                        <i class="fas fa-donate"></i> ${c.active ? 'Donate' : 'Tidak Aktif'}
                    </button>
                    ${userIsOwner ? `
                    <div class="owner-actions">
                        ${canDelete ? `
                        <button class="btn btn-danger delete-campaign-btn" 
                                data-id="${c.id}" 
                                data-title="${escapeHtml(c.title)}" 
                                title="Deactivate Campaign (PERMANEN)">
                            <i class="fas fa-ban"></i> Deactivate
                        </button>` : ''}
                        <button class="btn btn-archive archive-campaign-btn" 
                                data-id="${c.id}" 
                                data-title="${escapeHtml(c.title)}" 
                                title="Archive Campaign (sembunyikan dari semua user)">
                            <i class="fas fa-archive"></i> Archive
                        </button>
                    </div>` : ''}
                </div>
            `;

            campaignsContainer.appendChild(card);
        });

    // Setup event listeners untuk semua campaign
    setupCampaignEventListeners(userIsOwner);
}

function setupCampaignEventListeners(userIsOwner) {
    // Event listeners untuk tombol select campaign
    document.querySelectorAll(".select-campaign-btn:not([disabled])").forEach((btn) => {
        btn.addEventListener("click", () => {
            const id = Number(btn.getAttribute("data-id"));
            const title = btn.getAttribute("data-title");
            selectCampaign(id, title);
        });
    });

    // Event listeners untuk tombol delete (hanya untuk owner)
    if (userIsOwner) {
        document.querySelectorAll(".delete-campaign-btn").forEach((btn) => {
            btn.addEventListener("click", async () => {
                const id = Number(btn.getAttribute("data-id"));
                const title = btn.getAttribute("data-title");
                await deleteCampaign(id, title);
            });
        });

        document.querySelectorAll(".archive-campaign-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
                const id = Number(btn.getAttribute("data-id"));
                const title = btn.getAttribute("data-title");
                archiveCampaign(id, title);
            });
        });
    }
}

function renderPlaceholder(text) {
    if (!campaignsContainer) return;
    
    campaignsContainer.innerHTML = `
        <div class="placeholder-text">
            <i class="fas fa-spinner fa-spin"></i>
            <p>${escapeHtml(text)}</p>
        </div>
    `;
}

function selectCampaign(id, title) {
    selectedCampaignId = id;
    if (selectedCampaignIdEl) selectedCampaignIdEl.value = String(id);
    if (selectedCampaignText) selectedCampaignText.textContent = `#${id} — ${title}`;
    if (donationAmountEl) donationAmountEl.disabled = false;
    if (donateBtn) donateBtn.disabled = false;
    if (donationAmountEl) donationAmountEl.focus();
    showToast(`Campaign #${id} dipilih untuk donasi`, "success");
    validateDonateForm();
}

// =========================
// ARCHIVED CAMPAIGNS MODAL - MODERATION VIEW
// =========================
function showArchivedCampaignsModal() {
    // Buat modal untuk archived campaigns
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content archive-modal">
            <div class="modal-header">
                <h3><i class="fas fa-archive"></i> Archived Campaigns - Moderation View</h3>
                <span class="modal-subtitle">${archivedCampaigns.size} campaign tersembunyi dari semua user</span>
                <button class="modal-close-btn">&times;</button>
            </div>
            <div class="modal-body" id="archived-modal-content">
                <div class="archive-loading">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Memuat archived campaigns...</p>
                </div>
            </div>
            <div class="modal-footer">
                ${archivedCampaigns.size > 0 ? `
                <button class="btn btn-danger" id="clear-all-archived-btn">
                    <i class="fas fa-trash"></i> Clear All Archive
                </button>
                <button class="btn btn-success" id="restore-all-archived-btn">
                    <i class="fas fa-redo"></i> Restore All
                </button>` : ''}
                <button class="btn btn-outline" id="close-modal-btn">
                    <i class="fas fa-times"></i> Close
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Load archived campaigns
    loadArchivedCampaignsForModal();
    
    // Event listeners untuk modal
    const closeBtn = document.querySelector('.modal-close-btn');
    const closeModalBtn = document.getElementById('close-modal-btn');
    const clearBtn = document.getElementById('clear-all-archived-btn');
    const restoreAllBtn = document.getElementById('restore-all-archived-btn');
    
    const closeModal = () => {
        document.body.removeChild(modal);
    };
    
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
    if (clearBtn) clearBtn.addEventListener('click', () => {
        if (confirm(`Hapus semua ${archivedCampaigns.size} campaign dari archive?\n\nSemua campaign akan kembali terlihat.`)) {
            clearAllArchived();
            closeModal();
        }
    });
    if (restoreAllBtn) restoreAllBtn.addEventListener('click', () => {
        if (confirm(`Restore semua ${archivedCampaigns.size} campaign dari archive?\n\nSemua campaign akan kembali terlihat.`)) {
            archivedCampaigns.clear();
            saveArchiveToLocalStorage();
            showToast(`Semua ${archivedCampaigns.size} campaign di-restore`, "success");
            closeModal();
            refreshCampaigns();
        }
    });
    
    // Close modal ketika klik di luar
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });
}

async function loadArchivedCampaignsForModal() {
    try {
        const content = document.getElementById('archived-modal-content');
        if (!content) return;
        
        if (archivedCampaigns.size === 0) {
            content.innerHTML = `
                <div class="empty-archive">
                    <i class="fas fa-inbox"></i>
                    <h4>Tidak ada campaign yang di-archive</h4>
                    <p>Archive digunakan untuk menyembunyikan campaign dari SEMUA user.</p>
                    <p class="archive-tip">
                        <i class="fas fa-lightbulb"></i>
                        <strong>Tips:</strong> Gunakan tombol "Archive" pada campaign card 
                        untuk menyembunyikan campaign dari view normal.
                    </p>
                </div>
            `;
            return;
        }
        
        const archivedList = [];
        const count = Number(await hub.methods.campaignCount().call());
        
        for (let i = 1; i <= count; i++) {
            if (archivedCampaigns.has(i)) {
                const c = await hub.methods.campaigns(i).call();
                archivedList.push({
                    id: Number(c.id),
                    title: c.title,
                    active: c.active,
                    totalDonated: c.totalDonated,
                    creator: c.creator,
                    recipient: c.recipient
                });
            }
        }
        
        if (archivedList.length === 0) {
            content.innerHTML = '<p class="empty-state">Tidak ada campaign yang di-archive.</p>';
            return;
        }
        
        // KATEGORI ARCHIVE: Aktif vs Nonaktif
        const activeArchived = archivedList.filter(c => c.active);
        const inactiveArchived = archivedList.filter(c => !c.active);
        
        content.innerHTML = `
            <div class="archived-section">
                <div class="archive-info">
                    <p class="archive-description">
                        <i class="fas fa-info-circle"></i>
                        <strong>Moderation Tool:</strong> Campaign yang di-archive tidak terlihat oleh user biasa 
                        dan tersembunyi dari owner view normal. Hanya muncul di section ini.
                    </p>
                </div>
                
                <div class="archive-stats">
                    <div class="stat-card">
                        <div class="stat-number">${archivedList.length}</div>
                        <div class="stat-label">Total Archived</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number active">${activeArchived.length}</div>
                        <div class="stat-label">Masih Aktif</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number inactive">${inactiveArchived.length}</div>
                        <div class="stat-label">Sudah Nonaktif</div>
                    </div>
                </div>
                
                ${activeArchived.length > 0 ? `
                <div class="archive-category">
                    <h5><span class="badge active">AKTIF</span> Archived Active Campaigns (${activeArchived.length})</h5>
                    <p class="category-description">
                        Campaign ini masih aktif tapi disembunyikan dari semua user view.
                        <span class="warning-text"><i class="fas fa-exclamation-triangle"></i> User biasa TIDAK bisa melihat campaign ini.</span>
                    </p>
                    <div class="archived-list">
                        ${activeArchived.map(c => `
                            <div class="archived-item">
                                <div class="archived-item-info">
                                    <span class="archived-id">#${c.id}</span>
                                    <span class="archived-title">${escapeHtml(c.title)}</span>
                                    <div class="archived-meta">
                                        <span class="archived-creator" title="${c.creator}">Creator: ${shorten(c.creator)}</span>
                                        <span class="archived-status active">Aktif (Tersembunyi)</span>
                                        <span class="archived-total">${formatUnit(c.totalDonated, TNC_DECIMALS)} TNC</span>
                                    </div>
                                </div>
                                <div class="archive-actions">
                                    <button class="btn btn-small btn-success restore-from-modal-btn" data-id="${c.id}" 
                                            title="Restore ke daftar utama (akan terlihat oleh user biasa)">
                                        <i class="fas fa-eye"></i> Restore
                                    </button>
                                    <button class="btn btn-small btn-danger deactivate-from-archive-btn" data-id="${c.id}" 
                                            title="Deactivate PERMANEN (tetap di-archive)">
                                        <i class="fas fa-ban"></i> Deactivate
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>` : ''}
                
                ${inactiveArchived.length > 0 ? `
                <div class="archive-category">
                    <h5><span class="badge inactive">NONAKTIF</span> Archived Inactive Campaigns (${inactiveArchived.length})</h5>
                    <p class="category-description">
                        Campaign sudah nonaktif PERMANEN dan disembunyikan dari semua user.
                        <span class="info-text"><i class="fas fa-info-circle"></i> User biasa sudah TIDAK melihat campaign nonaktif.</span>
                    </p>
                    <div class="archived-list">
                        ${inactiveArchived.map(c => `
                            <div class="archived-item">
                                <div class="archived-item-info">
                                    <span class="archived-id">#${c.id}</span>
                                    <span class="archived-title">${escapeHtml(c.title)}</span>
                                    <div class="archived-meta">
                                        <span class="archived-creator" title="${c.creator}">Creator: ${shorten(c.creator)}</span>
                                        <span class="archived-status inactive">Nonaktif (PERMANEN)</span>
                                        <span class="archived-total">${formatUnit(c.totalDonated, TNC_DECIMALS)} TNC</span>
                                    </div>
                                </div>
                                <div class="archive-actions">
                                    <button class="btn btn-small btn-success restore-from-modal-btn" data-id="${c.id}" 
                                            title="Restore ke daftar utama (hanya owner yang lihat)">
                                        <i class="fas fa-eye"></i> Restore
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>` : ''}
            </div>
        `;
        
        // Event listeners
        document.querySelectorAll('.restore-from-modal-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = Number(btn.getAttribute('data-id'));
                restoreArchivedCampaign(id);
                setTimeout(() => {
                    const modal = document.querySelector('.modal-overlay');
                    if (modal) document.body.removeChild(modal);
                }, 500);
            });
        });
        
        document.querySelectorAll('.deactivate-from-archive-btn').forEach(btn => {
            btn.addEventListener('click', async () => {
                const id = Number(btn.getAttribute('data-id'));
                if (confirm(`Deactivate campaign #${id} dari archive?\n\nCampaign akan dinonaktifkan PERMANEN dan tetap di-archive.`)) {
                    try {
                        setStatus(donateStatusBox, donateStatusText, donateTxLink, "pending", 
                            "Deactivating campaign dari archive...");
                        
                        const gasEstimate = await hub.methods
                            .deactivateCampaign(id)
                            .estimateGas({ from: account });
                        
                        const tx = await hub.methods
                            .deactivateCampaign(id)
                            .send({ 
                                from: account,
                                gas: Math.floor(gasEstimate * 1.5)
                            });

                        const txHash = tx.transactionHash;
                        
                        setStatus(
                            donateStatusBox, 
                            donateStatusText, 
                            donateTxLink, 
                            "success", 
                            `✅ Campaign #${id} dinonaktifkan dari archive!`, 
                            txHash
                        );
                        
                        showToast(`✅ Campaign #${id} dinonaktifkan dari archive!`, "success");
                        
                        // Refresh modal
                        loadArchivedCampaignsForModal();
                        
                    } catch (err) {
                        console.error("Deactivate from archive error:", err);
                        const errorMsg = parseError(err);
                        setStatus(donateStatusBox, donateStatusText, donateTxLink, "error", errorMsg);
                        showToast(errorMsg, "error");
                    }
                }
            });
        });
        
    } catch (err) {
        console.error("Error loading archived campaigns:", err);
        const content = document.getElementById('archived-modal-content');
        if (content) {
            content.innerHTML = `
                <div class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <h4>Error loading archived campaigns</h4>
                    <p>${err.message}</p>
                    <button class="btn btn-small" onclick="loadArchivedCampaignsForModal()">
                        <i class="fas fa-redo"></i> Coba Lagi
                    </button>
                </div>
            `;
        }
    }
}

// =========================
// DELETE CAMPAIGN - PERMANENT DEACTIVATION
// =========================
async function deleteCampaign(campaignId, title) {
    // Validasi: hanya owner yang bisa delete
    if (!isContractOwner) {
        showToast("Hanya Contract Owner yang bisa menghapus campaign!", "error");
        return;
    }

    const action = confirm(`⚠️  DEACTIVATE CAMPAIGN - PERMANENT ACTION\n\nCampaign #${campaignId} akan dinonaktifkan PERMANEN.\nTidak bisa diaktifkan kembali atau menerima donasi.\n\nPilih:\n✅ OK → Deactivate + Archive (sembunyikan dari semua user)\n❌ Cancel → Hanya Deactivate (tetap terlihat di daftar)`);
    
    const shouldArchive = action;

    try {
        setStatus(donateStatusBox, donateStatusText, donateTxLink, "pending", 
            shouldArchive ? "Owner: Deactivating and archiving campaign..." : "Owner: Deactivating campaign...");
        
        const gasEstimate = await hub.methods
            .deactivateCampaign(campaignId)
            .estimateGas({ from: account });
        
        const gasWithBuffer = Math.floor(gasEstimate * 1.5);
        
        console.log("Owner deactivating campaign:", campaignId, "Archive:", shouldArchive);
        
        // Execute deactivate
        const tx = await hub.methods
            .deactivateCampaign(campaignId)
            .send({ 
                from: account,
                gas: gasWithBuffer
            });

        const txHash = tx.transactionHash;
        
        // Jika pilih archive, tambahkan ke archive list
        if (shouldArchive) {
            archivedCampaigns.add(campaignId);
            // Save to localStorage
            saveArchiveToLocalStorage();
        }
        
        // Update UI dengan feedback owner
        setStatus(
            donateStatusBox, 
            donateStatusText, 
            donateTxLink, 
            "success", 
            `✅ OWNER: Campaign #${campaignId} ${shouldArchive ? 'dinonaktifkan + di-archive' : 'dinonaktifkan'}!`, 
            txHash
        );
        
        showToast(`✅ Owner: Campaign #${campaignId} ${shouldArchive ? 'dinonaktifkan + di-archive' : 'dinonaktifkan'}!`, "success");
        
        // Refresh data
        await refreshCampaigns();
        
        // Reset selection jika campaign yang dihapus sedang dipilih
        if (selectedCampaignId === campaignId) {
            selectedCampaignId = null;
            if (selectedCampaignText) selectedCampaignText.textContent = "Klik \"Donate\" pada campaign di daftar";
            if (selectedCampaignIdEl) selectedCampaignIdEl.value = "";
            if (donationAmountEl) {
                donationAmountEl.value = "";
                donationAmountEl.disabled = true;
            }
            if (donateBtn) donateBtn.disabled = true;
        }
        
    } catch (err) {
        console.error("Owner delete campaign error:", err);
        const errorMsg = parseError(err);
        
        // Error spesifik untuk owner
        if (errorMsg.includes("Ownable: caller is not the owner")) {
            setStatus(donateStatusBox, donateStatusText, donateTxLink, "error", 
                "❌ ERROR: Anda bukan contract owner. Hanya owner yang bisa menghapus.");
            showToast("Anda bukan contract owner!", "error");
            
            // Update status owner
            await checkIfUserIsOwner();
            await refreshCampaigns();
        } else {
            setStatus(donateStatusBox, donateStatusText, donateTxLink, "error", errorMsg);
            showToast(errorMsg, "error");
        }
    }
}

// =========================
// DONATE (ONE-CLICK) - DENGAN GAS ESTIMATION
// =========================
async function onDonateOneClick(e) {
    e.preventDefault();

    try {
        if (!(await checkNetwork())) return;
        if (!selectedCampaignId) {
            showToast("Pilih campaign dulu dari daftar.", "warning");
            return;
        }

        const amtStr = String(donationAmountEl.value || "").trim();
        if (!amtStr || Number(amtStr) <= 0) {
            showToast("Masukkan jumlah donasi yang valid.", "error");
            return;
        }

        const amountWei = toUnit(amtStr);
        setButtonLoading(donateBtn, "Processing...");

        const allowance = await tnc.methods.allowance(account, HUB_ADDRESS).call();
        const needApprove = web3.utils.toBN(allowance).lt(web3.utils.toBN(amountWei));

        if (needApprove) {
            setStatus(
                donateStatusBox,
                donateStatusText,
                donateTxLink,
                "pending",
                "Step 1/2: Approve donasi di MetaMask..."
            );

            // Estimate gas untuk approve
            const approveGasEstimate = await tnc.methods
                .approve(HUB_ADDRESS, amountWei)
                .estimateGas({ from: account });
            
            const txApprove = await tnc.methods
                .approve(HUB_ADDRESS, amountWei)
                .send({ 
                    from: account,
                    gas: Math.floor(approveGasEstimate * 1.2)
                });

            const approveHash = txApprove.transactionHash;
            setStatus(
                donateStatusBox,
                donateStatusText,
                donateTxLink,
                "success",
                "Approve sukses. Lanjut donasi...",
                approveHash
            );
            
            await new Promise(resolve => setTimeout(resolve, 1000));
        }

        setStatus(
            donateStatusBox,
            donateStatusText,
            donateTxLink,
            "pending",
            needApprove ? "Step 2/2: Donasi di MetaMask..." : "Donasi di MetaMask..."
        );

        // Estimate gas untuk donate
        const donateGasEstimate = await hub.methods
            .donate(selectedCampaignId, amountWei)
            .estimateGas({ from: account });
        
        const txDonate = await hub.methods
            .donate(selectedCampaignId, amountWei)
            .send({ 
                from: account,
                gas: Math.floor(donateGasEstimate * 1.2)
            });

        const donateHash = txDonate.transactionHash;
        setStatus(
            donateStatusBox,
            donateStatusText,
            donateTxLink,
            "success",
            "Donasi berhasil dikirim!",
            donateHash
        );

        if (donationAmountEl) donationAmountEl.value = "";
        if (donateBtn) donateBtn.disabled = true;
        showToast("Donasi berhasil!", "success");
        await refreshBalance();
        await refreshCampaigns();
        
    } catch (err) {
        console.error("Donate error:", err);
        setStatus(donateStatusBox, donateStatusText, donateTxLink, "error", parseError(err));
        showToast(parseError(err), "error");
    } finally {
        resetButton(donateBtn, `<i class="fas fa-heart"></i> Donate Sekarang`);
        validateDonateForm();
    }
}

// =========================
// FORM VALIDATION
// =========================
function validateAddress() {
    const address = recipientAddressEl.value.trim();
    if (!address) {
        recipientAddressEl.style.borderColor = "";
        return;
    }
    
    if (web3 && !web3.utils.isAddress(address)) {
        recipientAddressEl.style.borderColor = "var(--danger-color)";
        showToast("Alamat tidak valid", "warning");
    } else if (web3 && web3.utils.isAddress(address)) {
        recipientAddressEl.style.borderColor = "var(--success-color)";
    }
}

function validateCreateForm() {
    if (!createCampaignBtn) return;
    
    const titleOk = campaignTitleEl.value.trim().length > 0;
    const addr = recipientAddressEl.value.trim();
    const addrOk = addr.length > 0 && (web3 ? web3.utils.isAddress(addr) : addr.length === 42);
    createCampaignBtn.disabled = !(titleOk && addrOk);
}

function validateDonateForm() {
    if (!donateBtn) return;
    
    const hasCampaign = !!selectedCampaignIdEl.value;
    const amtOk = Number(donationAmountEl.value || 0) > 0;
    donateBtn.disabled = !(hasCampaign && amtOk);
}

// =========================
// EVENT HANDLERS
// =========================
async function handleAccountsChanged(accounts) {
    if (!accounts || accounts.length === 0) {
        disconnectWallet();
    } else if (accounts[0] !== account) {
        account = accounts[0];
        // Reset owner status
        isContractOwner = false;
        contractOwnerAddress = null;
        archivedCampaigns.clear();
        
        await afterConnected();
        showToast("Akun berubah", "warning");
    }
}

async function handleChainChanged() {
    await checkNetwork();
    await afterConnected();
    showToast("Network berubah", "warning");
}

async function setupEventSubscriptions() {
    if (!hub || subscribed) return;

    try {
        hub.events.CampaignCreated({ fromBlock: "latest" })
            .on("data", async () => {
                console.log("New campaign created event detected");
                await refreshCampaigns();
            })
            .on("error", (err) => console.error("Event error:", err));

        hub.events.Donated({ fromBlock: "latest" })
            .on("data", async () => {
                console.log("New donation event detected");
                await refreshCampaigns();
                await refreshBalance();
            })
            .on("error", (err) => console.error("Event error:", err));

        subscribed = true;
    } catch (err) {
        console.error("Error setting up event subscriptions:", err);
    }
}

// =========================
// HELPER FUNCTIONS
// =========================
async function loadTokenMeta() {
    try {
        TNC_DECIMALS = Number(await tnc.methods.decimals().call());
    } catch {
        TNC_DECIMALS = 18;
    }
    try {
        TNC_SYMBOL = await tnc.methods.symbol().call();
    } catch {
        TNC_SYMBOL = "TNC";
    }
}

async function loadCreateFee() {
    try {
        CREATE_FEE_WEI = await hub.methods.createFee().call();
        console.log("Create Fee:", CREATE_FEE_WEI);
    } catch (err) {
        console.error("Error loading create fee:", err);
        CREATE_FEE_WEI = toUnit("1");
    }
}

function disableAll() {
    if (createCampaignBtn) createCampaignBtn.disabled = true;
    if (refreshCampaignsBtn) refreshCampaignsBtn.disabled = true;
    if (donationAmountEl) donationAmountEl.disabled = true;
    if (donateBtn) donateBtn.disabled = true;
}

function setButtonLoading(btn, text) {
    if (!btn) return;
    btn.disabled = true;
    btn.dataset._old = btn.innerHTML;
    btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> ${text}`;
}

function resetButton(btn, html) {
    if (!btn) return;
    btn.disabled = false;
    btn.innerHTML = html;
}

function setStatus(box, textEl, linkEl, type, message, txHash) {
    box.classList.remove("hidden", "pending", "success", "error");
    box.classList.add(type);
    textEl.textContent = message;

    if (txHash) {
        // Pastikan URL dibentuk dengan benar
        linkEl.href = `${EXPLORER_TX}${txHash}`;
        linkEl.target = "_blank";
        linkEl.rel = "noopener noreferrer";
        linkEl.classList.remove("hidden");
        
        // Pastikan link bisa diklik
        linkEl.onclick = null; // Hapus listener lama
        linkEl.addEventListener('click', (e) => {
            e.preventDefault();
            window.open(linkEl.href, '_blank', 'noopener,noreferrer');
        });
    } else {
        linkEl.classList.add("hidden");
    }
    
    box.classList.remove("hidden");
}

function showToast(msg, type) {
    if (!toast || !toastIcon || !toastMessage) return;
    
    toast.classList.remove("hidden", "success", "error", "warning");
    toast.classList.add(type);

    const icons = {
        'success': 'fa-check-circle',
        'error': 'fa-times-circle',
        'warning': 'fa-exclamation-triangle',
        'info': 'fa-info-circle'
    };
    
    toastIcon.className = `fas ${icons[type] || icons.info}`;
    toastMessage.textContent = msg;
    
    toast.classList.remove("hidden");
    setTimeout(() => toast.classList.add("hidden"), 2500);
}

function copyAddressToClipboard() {
    if (!account) return;
    navigator.clipboard.writeText(account)
        .then(() => showToast("Alamat wallet disalin!", "success"))
        .catch(() => showToast("Gagal menyalin alamat", "error"));
}

// =========================
// UNIT CONVERSION
// =========================
function toUnit(amountStr) {
    if (!web3) return "0";
    
    try {
        const parts = String(amountStr).split(".");
        const whole = parts[0] || "0";
        const frac = (parts[1] || "").padEnd(TNC_DECIMALS, "0").slice(0, TNC_DECIMALS);
        const base = web3.utils.toBN(10).pow(web3.utils.toBN(TNC_DECIMALS));
        const wholeBN = web3.utils.toBN(whole).mul(base);
        const fracBN = web3.utils.toBN(frac || "0");
        return wholeBN.add(fracBN).toString();
    } catch (error) {
        console.error("Error converting to unit:", error);
        return "0";
    }
}

function formatUnit(weiStr, decimals = TNC_DECIMALS) {
    if (!web3 || !weiStr) return "0";
    
    try {
        const bn = web3.utils.toBN(weiStr);
        const base = web3.utils.toBN(10).pow(web3.utils.toBN(decimals));
        const whole = bn.div(base).toString();
        let frac = bn.mod(base).toString().padStart(decimals, "0");
        frac = frac.replace(/0+$/, "");
        
        if (frac.length > 4) {
            frac = frac.substring(0, 4);
        }
        
        return frac ? `${whole}.${frac}` : whole;
    } catch (error) {
        console.error("Error formatting unit:", error);
        return "0";
    }
}

function shorten(addr) {
    if (!addr || addr.length < 10) return "-";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
}

function escapeHtml(s) {
    if (!s) return "";
    const div = document.createElement('div');
    div.textContent = s;
    return div.innerHTML;
}

function parseError(err) {
    if (!err) return "Unknown error";
    const msg = err?.message || String(err);
    
    if (msg.includes("User denied") || msg.includes("denied transaction")) 
        return "Transaksi dibatalkan oleh user.";
    if (msg.includes("insufficient funds")) 
        return "Saldo ETH tidak cukup untuk gas fee.";
    if (msg.includes("allowance") || msg.includes("transfer amount exceeds allowance")) 
        return "Allowance tidak cukup, approve terlebih dahulu.";
    if (msg.includes("gas limit") || msg.includes("gas too low") || msg.includes("exceeds block gas limit")) 
        return "Gas limit terlalu rendah. Coba refresh dan coba lagi.";
    if (msg.includes("transaction underpriced")) 
        return "Gas price terlalu rendah. Coba refresh dan coba lagi.";
    if (msg.includes("revert")) {
        if (msg.includes("Campaign not active")) return "Campaign tidak aktif.";
        if (msg.includes("Invalid recipient")) return "Alamat recipient tidak valid.";
        if (msg.includes("Donation failed")) return "Transfer donasi gagal.";
        if (msg.includes("Ownable: caller is not the owner")) 
            return "❌ HANYA CONTRACT OWNER: Anda bukan owner kontrak.";
        return "Smart contract error.";
    }
    
    return msg.length > 100 ? msg.substring(0, 100) + "..." : msg;
}
