import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.2/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-auth.js";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
  arrayUnion,
  arrayRemove
} from "https://www.gstatic.com/firebasejs/11.0.2/firebase-firestore.js";

// Konfigurasi Firebase LaporRembang
const firebaseConfig = {
  apiKey: "AIzaSyCTJQQS7UEPn0VVINsE12L6U5yFJEK50GM",
  authDomain: "laporrembang.firebaseapp.com",
  projectId: "laporrembang",
  storageBucket: "laporrembang.firebasestorage.app",
  messagingSenderId: "210766461038",
  appId: "1:210766461038:web:5586d02afea0b0398d4e7f",
  measurementId: "G-5WSWBGH604"
};

const PRIMARY_ADMIN_EMAIL = "wongapikapik@gmail.com";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

// Deteksi halaman aktif (admin.html vs index.html)
const IS_ADMIN_PAGE = window.location.pathname.toLowerCase().endsWith("admin.html");

// Data 14 Kecamatan resmi di Kabupaten Rembang beserta koordinat pusatnya
const KECAMATAN_REMBANG = [
  { name: "Rembang", lat: -6.7086, lng: 111.3418 },
  { name: "Lasem", lat: -6.6922, lng: 111.4414 },
  { name: "Kaliori", lat: -6.7125, lng: 111.2750 },
  { name: "Sulang", lat: -6.7931, lng: 111.3783 },
  { name: "Sumber", lat: -6.8017, lng: 111.2819 },
  { name: "Bulu", lat: -6.8661, lng: 111.3917 },
  { name: "Gunem", lat: -6.8542, lng: 111.4644 },
  { name: "Pamotan", lat: -6.7681, lng: 111.4789 },
  { name: "Pancur", lat: -6.7372, lng: 111.4711 },
  { name: "Sluke", lat: -6.6631, lng: 111.5150 },
  { name: "Kragan", lat: -6.6967, lng: 111.6114 },
  { name: "Sarang", lat: -6.7325, lng: 111.6861 },
  { name: "Sedan", lat: -6.7878, lng: 111.5719 },
  { name: "Sale", lat: -6.8658, lng: 111.5886 }
];

const STORAGE_KEY = "lapor_rembang_reports_v2";
const COADMIN_CACHE_KEY = "lapor_rembang_coadmins_v1";
const UPVOTED_KEY = "lapor_rembang_upvoted_v1";

// Data awal realistis wilayah Kabupaten Rembang (seeding otomatis jika Firestore kosong)
const INITIAL_REPORTS = [
  {
    id: "RBG-2026-101",
    title: "Banjir Rob Menggenangi Jalan Pemukiman Pesisir Tasikagung",
    category: "Bencana & Banjir Rob",
    urgency: "Darurat",
    kecamatan: "Rembang",
    desa: "Desa Tasikagung (Dekat Pelabuhan)",
    lat: -6.6985,
    lng: 111.3452,
    description: "Air pasang laut naik sejak pukul 11.30 WIB setinggi 35 cm menutup akses jalan warga menuju TPI Tasikagung. Mohon bantuan pompa penyedot dari BPBD.",
    phone: "0812-2840-1122",
    reporter: "Hendra Saputra",
    reporterEmail: "warga.tasikagung@example.com",
    reporterUid: "seed-1",
    status: "Sedang Ditangani",
    agency: "BPBD Kab. Rembang & DPUPR",
    createdAt: "2 jam lalu",
    timestampMs: Date.now() - 7200000,
    upvotes: 34,
    photo: ""
  },
  {
    id: "RBG-2026-102",
    title: "Lubang Jalan Dalam di Jalur Pantura Karangturi Lasem",
    category: "Infrastruktur & Jalan",
    urgency: "Tinggi",
    kecamatan: "Lasem",
    desa: "Desa Karangturi (Jalur Pantura)",
    lat: -6.6948,
    lng: 111.4435,
    description: "Terdapat lubang berdiameter sekitar 80 cm dengan kedalaman 15 cm di lajur arah Surabaya. Sangat membahayakan pengendara motor pada malam hari.",
    phone: "0857-4120-8890",
    reporter: "Siti Nurhaliza",
    reporterEmail: "siti.lasem@example.com",
    reporterUid: "seed-2",
    status: "Menunggu Verifikasi",
    agency: "PPK Bina Marga Pantura / Dinhub",
    createdAt: "4 jam lalu",
    timestampMs: Date.now() - 14400000,
    upvotes: 27,
    photo: ""
  },
  {
    id: "RBG-2026-103",
    title: "Lampu PJU Padam Sepanjang Jalan Raya Rembang - Blora KM 6",
    category: "PJU & Listrik",
    urgency: "Sedang",
    kecamatan: "Sulang",
    desa: "Desa Landoh",
    lat: -6.7840,
    lng: 111.3740,
    description: "Ada 5 titik lampu penerangan jalan umum yang padam total selama 3 malam berturut-turut sehingga jalan rawan kecelakaan.",
    phone: "0813-9011-3344",
    reporter: "Warga Anonim",
    reporterEmail: "warga.sulang@example.com",
    reporterUid: "seed-3",
    status: "Sedang Ditangani",
    agency: "Dinas Perhubungan Kab. Rembang",
    createdAt: "1 hari lalu",
    timestampMs: Date.now() - 86400000,
    upvotes: 19,
    photo: ""
  },
  {
    id: "RBG-2026-104",
    title: "Tumpukan Sampah Liar di Bahu Jalan Dekat Pasar Kragan",
    category: "Kebersihan & Lingkungan",
    urgency: "Sedang",
    kecamatan: "Kragan",
    desa: "Desa Karanganyar",
    lat: -6.6980,
    lng: 111.6130,
    description: "Sampah rumah tangga dan sisa pasar menumpuk di pinggir jalan dan menimbulkan bau menyengat. Armada pengangkut sudah menindaklanjuti pagi ini.",
    phone: "0821-3566-7712",
    reporter: "Ahmad Fauzi",
    reporterEmail: "ahmad.kragan@example.com",
    reporterUid: "seed-4",
    status: "Selesai",
    agency: "DLH Kabupaten Rembang",
    createdAt: "2 hari lalu",
    timestampMs: Date.now() - 172800000,
    upvotes: 41,
    photo: ""
  },
  {
    id: "RBG-2026-105",
    title: "Pohon Trembesi Miring Rawan Tumbang di Jalur Pamotan - Sedan",
    category: "Bencana & Banjir Rob",
    urgency: "Tinggi",
    kecamatan: "Pamotan",
    desa: "Desa Ringin",
    lat: -6.7715,
    lng: 111.4910,
    description: "Akar pohon besar di tepi jalan mulai terangkat setelah hujan deras disertai angin kencang kemarin sore.",
    phone: "0852-2590-4410",
    reporter: "Budi Santoso",
    reporterEmail: "budi.pamotan@example.com",
    reporterUid: "seed-5",
    status: "Menunggu Verifikasi",
    agency: "BPBD & DLH Kab. Rembang",
    createdAt: "5 jam lalu",
    timestampMs: Date.now() - 18000000,
    upvotes: 15,
    photo: ""
  },
  {
    id: "RBG-2026-106",
    title: "Antrean Truk Tambang Memakan Badan Jalan di Area Sluke",
    category: "Lalu Lintas & Laka",
    urgency: "Tinggi",
    kecamatan: "Sluke",
    desa: "Desa Trahan",
    lat: -6.6645,
    lng: 111.5180,
    description: "Parkir truk bermuatan di bahu jalan Pantura Sluke menyempitkan arus lalu lintas dari kedua arah pada jam berangkat kerja.",
    phone: "0877-3188-9021",
    reporter: "Rudi Hartono",
    reporterEmail: "rudi.sluke@example.com",
    reporterUid: "seed-6",
    status: "Sedang Ditangani",
    agency: "Satlantas Polres Rembang & Dinhub",
    createdAt: "6 jam lalu",
    timestampMs: Date.now() - 21600000,
    upvotes: 22,
    photo: ""
  }
];

let reports = [];
let upvotedIds = [];
let coAdminEmails = [];
let currentUser = null;
let currentRole = "guest"; // 'guest' | 'user' | 'coadmin' | 'admin'
let authMode = "login"; // 'login' | 'register'
let filterOnlyMine = false;
let justLoggedIn = false; // Flag agar perpindahan/scroll otomatis terjadi saat user baru login

let map;
let markersLayer;
let draftMarker;
let uploadedPhotoBase64 = "";

// Initialize App
document.addEventListener("DOMContentLoaded", () => {
  const savedUpvotes = localStorage.getItem(UPVOTED_KEY);
  upvotedIds = savedUpvotes ? JSON.parse(savedUpvotes) : [];

  const cachedCoAdmins = localStorage.getItem(COADMIN_CACHE_KEY);
  coAdminEmails = cachedCoAdmins ? JSON.parse(cachedCoAdmins) : [];

  if (!IS_ADMIN_PAGE) {
    populateKecamatanDropdowns();
    initMap();
  }

  bindEvents();
  initFirebaseSync();
});

// ==========================================
// FIREBASE AUTH & ROLE MANAGEMENT
// ==========================================
function resolveUserRole(user) {
  if (!user || !user.email) return "guest";
  const email = user.email.toLowerCase().trim();
  if (email === PRIMARY_ADMIN_EMAIL.toLowerCase()) return "admin";
  if (coAdminEmails.includes(email)) return "coadmin";
  return "user";
}

function updateAuthUI() {
  currentRole = resolveUserRole(currentUser);

  const btnOpenAuth = document.getElementById("btn-open-auth");
  const userProfileBar = document.getElementById("user-profile-bar");
  const navUserName = document.getElementById("nav-user-name");
  const navUserRole = document.getElementById("nav-user-role");

  if (!currentUser) {
    if (btnOpenAuth) btnOpenAuth.classList.remove("hidden");
    if (userProfileBar) {
      userProfileBar.classList.add("hidden");
      userProfileBar.classList.remove("flex");
    }
  } else {
    if (btnOpenAuth) btnOpenAuth.classList.add("hidden");
    if (userProfileBar) {
      userProfileBar.classList.remove("hidden");
      userProfileBar.classList.add("flex");
    }
    const displayName = currentUser.displayName || currentUser.email.split("@")[0];
    if (navUserName) navUserName.textContent = displayName;
  }

  // ====================================================
  // CABANG 1: LOGIKA HALAMAN ADMIN (admin.html)
  // ====================================================
  if (IS_ADMIN_PAGE) {
    const adminLevelBadge = document.getElementById("admin-level-badge");
    const adminLoggedEmail = document.getElementById("admin-logged-email");
    const adminRoleDesc = document.getElementById("admin-role-desc");
    const adminAccessGate = document.getElementById("admin-access-gate");
    const adminGateTitle = document.getElementById("admin-gate-title");
    const adminGateMessage = document.getElementById("admin-gate-message");
    const directLoginWrap = document.getElementById("admin-direct-login-wrap");
    const wrongRoleActions = document.getElementById("admin-wrong-role-actions");
    const adminAuthorizedContent = document.getElementById("admin-authorized-content");
    const coAdminManagerBox = document.getElementById("coadmin-manager-box");
    const btnExportCsv = document.getElementById("btn-export-csv");
    const btnSyncCloud = document.getElementById("btn-sync-cloud");

    if (!currentUser) {
      if (adminLevelBadge) {
        adminLevelBadge.textContent = "Terkunci â€¢ Belum Login";
        adminLevelBadge.className = "px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700";
      }
      if (adminLoggedEmail) adminLoggedEmail.textContent = "Silakan masuk menggunakan akun petugas";
      if (adminRoleDesc) adminRoleDesc.textContent = "Masuk sebagai Admin Utama atau Co-Admin untuk membuka dashboard kendali pengaduan.";
      if (adminAccessGate) adminAccessGate.classList.remove("hidden");
      if (directLoginWrap) directLoginWrap.classList.remove("hidden");
      if (wrongRoleActions) wrongRoleActions.classList.add("hidden");
      if (adminAuthorizedContent) adminAuthorizedContent.classList.add("hidden");
      if (btnExportCsv) btnExportCsv.classList.add("hidden");
      if (btnSyncCloud) btnSyncCloud.classList.add("hidden");
      if (adminGateTitle) adminGateTitle.textContent = "Login Petugas & Admin";
      if (adminGateMessage) {
        adminGateMessage.innerHTML = `Khusus <strong>Admin Utama (Level 1)</strong> (<code class="text-indigo-300 bg-slate-900 px-1.5 py-0.5 rounded">wongapikapik@gmail.com</code>) atau <strong>Co-Admin (Level 2)</strong> terdaftar.`;
      }
      return;
    }

    if (currentRole === "admin" || currentRole === "coadmin") {
      // Sukses login sebagai Admin / Co-Admin -> Buka Dashboard Admin!
      if (adminAccessGate) adminAccessGate.classList.add("hidden");
      if (adminAuthorizedContent) adminAuthorizedContent.classList.remove("hidden");
      if (btnExportCsv) btnExportCsv.classList.remove("hidden");
      if (btnSyncCloud) btnSyncCloud.classList.remove("hidden");
      if (adminLoggedEmail) adminLoggedEmail.textContent = currentUser.email;

      if (currentRole === "admin") {
        if (navUserRole) {
          navUserRole.textContent = "Admin Lv.1";
          navUserRole.className = "inline-block text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-600 text-white";
        }
        if (adminLevelBadge) {
          adminLevelBadge.textContent = "Level 1 â€¢ Admin Utama";
          adminLevelBadge.className = "px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/40";
        }
        if (adminRoleDesc) adminRoleDesc.textContent = "Akses penuh: Verifikasi status laporan, tugaskan dinas, hapus laporan tidak valid, dan kelola Co-Admin.";
        if (coAdminManagerBox) coAdminManagerBox.classList.remove("hidden");
        renderCoAdminList();
      } else {
        if (navUserRole) {
          navUserRole.textContent = "Co-Admin Lv.2";
          navUserRole.className = "inline-block text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500 text-slate-900";
        }
        if (adminLevelBadge) {
          adminLevelBadge.textContent = "Level 2 â€¢ Co-Admin";
          adminLevelBadge.className = "px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40";
        }
        if (adminRoleDesc) adminRoleDesc.textContent = "Akses operator: Verifikasi laporan warga, ubah status penanganan, dan tetapkan instansi dinas terkait.";
        if (coAdminManagerBox) coAdminManagerBox.classList.add("hidden");
      }

      if (justLoggedIn) {
        justLoggedIn = false;
        window.scrollTo({ top: 0, behavior: "smooth" });
      }

      renderAdminReports();
    } else {
      // Login dengan akun warga biasa di admin.html -> Tolak akses & tampilkan tombol ganti akun
      if (navUserRole) {
        navUserRole.textContent = "Warga Pelapor";
        navUserRole.className = "inline-block text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-700 text-slate-200";
      }
      if (adminLevelBadge) {
        adminLevelBadge.textContent = "Akses Ditolak â€¢ Warga";
        adminLevelBadge.className = "px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40";
      }
      if (adminLoggedEmail) adminLoggedEmail.textContent = currentUser.email;
      if (adminRoleDesc) adminRoleDesc.textContent = "Akun ini tidak terdaftar sebagai petugas admin.";

      if (adminAccessGate) adminAccessGate.classList.remove("hidden");
      if (directLoginWrap) directLoginWrap.classList.add("hidden");
      if (wrongRoleActions) wrongRoleActions.classList.remove("hidden");
      if (adminAuthorizedContent) adminAuthorizedContent.classList.add("hidden");
      if (btnExportCsv) btnExportCsv.classList.add("hidden");
      if (btnSyncCloud) btnSyncCloud.classList.add("hidden");

      if (adminGateTitle) adminGateTitle.textContent = "Akun Tidak Memiliki Akses Admin";
      if (adminGateMessage) {
        adminGateMessage.innerHTML = `Anda masuk sebagai <strong>${escapeHtml(currentUser.email)}</strong> (Warga Pelapor). Hanya <strong>Admin Utama</strong> atau <strong>Co-Admin</strong> terdaftar yang dapat membuka dashboard ini.`;
      }
    }
    return;
  }

  // ====================================================
  // CABANG 2: LOGIKA HALAMAN WARGA (index.html)
  // ====================================================
  const navAdminDot = document.getElementById("nav-admin-dot");
  const btnGotoAdmin = document.getElementById("btn-goto-admin");
  const reportAuthGate = document.getElementById("report-auth-gate");
  const reportForm = document.getElementById("report-form");
  const formReporterEmail = document.getElementById("form-reporter-email");
  const reporterInput = document.getElementById("reporter");
  const btnFilterMine = document.getElementById("btn-filter-mine");

  if (!currentUser) {
    if (navAdminDot) navAdminDot.className = "w-2 h-2 rounded-full bg-slate-400";
    if (btnGotoAdmin) btnGotoAdmin.classList.add("hidden");
    if (reportAuthGate) reportAuthGate.classList.remove("hidden");
    if (reportForm) reportForm.classList.add("hidden");
    if (btnFilterMine) btnFilterMine.classList.add("hidden");
    filterOnlyMine = false;
    renderReports();
    return;
  }

  // Jika Admin/Co-Admin baru saja login di index.html, langsung arahkan ke admin.html
  if ((currentRole === "admin" || currentRole === "coadmin") && justLoggedIn) {
    justLoggedIn = false;
    window.location.href = "admin.html";
    return;
  }

  // Buka Formulir Pengaduan untuk user yang sudah login
  const displayName = currentUser.displayName || currentUser.email.split("@")[0];
  if (formReporterEmail) formReporterEmail.textContent = currentUser.email;
  if (reporterInput && !reporterInput.value) {
    reporterInput.value = displayName;
  }

  if (reportAuthGate) reportAuthGate.classList.add("hidden");
  if (reportForm) reportForm.classList.remove("hidden");
  if (btnFilterMine) btnFilterMine.classList.remove("hidden");

  if (currentRole === "admin" || currentRole === "coadmin") {
    if (navUserRole) {
      navUserRole.textContent = currentRole === "admin" ? "Admin Lv.1" : "Co-Admin Lv.2";
      navUserRole.className = "inline-block text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-600 text-white";
    }
    if (navAdminDot) navAdminDot.className = "w-2 h-2 rounded-full bg-emerald-400";
    if (btnGotoAdmin) btnGotoAdmin.classList.remove("hidden");
  } else {
    if (navUserRole) {
      navUserRole.textContent = "Warga Pelapor";
      navUserRole.className = "inline-block text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-0.5 rounded bg-rembang-100 text-rembang-800";
    }
    if (navAdminDot) navAdminDot.className = "w-2 h-2 rounded-full bg-slate-400";
    if (btnGotoAdmin) btnGotoAdmin.classList.add("hidden");
  }

  // Jika warga baru saja login di index.html, langsung gulir ke formulir pengaduan yang baru terbuka
  if (justLoggedIn) {
    justLoggedIn = false;
    const formSection = document.getElementById("buat-laporan");
    if (formSection) {
      formSection.scrollIntoView({ behavior: "smooth" });
    }
  }

  renderReports();
}

function initFirebaseSync() {
  const statusBadge = document.getElementById("firebase-status-badge");

  // Listen to Auth State
  onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    if (user && user.email) {
      try {
        const role = resolveUserRole(user);
        await setDoc(
          doc(db, "users", user.uid),
          {
            email: user.email.toLowerCase(),
            displayName: user.displayName || user.email.split("@")[0],
            role,
            lastLoginAt: serverTimestamp()
          },
          { merge: true }
        );
      } catch (err) {
        console.warn("Gagal menyinkronkan profil pengguna ke Firestore:", err.message);
      }
    }
    updateAuthUI();
  });

  // Listen to Co-Admin list in Firestore (settings/roles)
  try {
    onSnapshot(
      doc(db, "settings", "roles"),
      (snap) => {
        if (snap.exists() && Array.isArray(snap.data().coAdmins)) {
          coAdminEmails = snap.data().coAdmins.map((e) => e.toLowerCase().trim());
          localStorage.setItem(COADMIN_CACHE_KEY, JSON.stringify(coAdminEmails));
          updateAuthUI();
        }
      },
      (err) => {
        console.warn("Fallback Co-Admin cache lokal aktif:", err.message);
      }
    );
  } catch (e) {
    console.warn("Firestore roles listener error:", e);
  }

  // Listen to Reports collection in real-time
  try {
    const qReports = query(collection(db, "reports"), orderBy("timestampMs", "desc"));
    onSnapshot(
      qReports,
      async (snapshot) => {
        if (statusBadge) {
          statusBadge.textContent = "Live Cloud Sync";
          statusBadge.className = IS_ADMIN_PAGE
            ? "text-[11px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-0.5 rounded-full"
            : "text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full";
        }

        if (snapshot.empty) {
          for (const item of INITIAL_REPORTS) {
            await setDoc(doc(db, "reports", item.id), item);
          }
          return;
        }

        reports = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
        refreshAllViews();
      },
      (err) => {
        console.warn("Firestore offline/permission fallback ke LocalStorage:", err.message);
        activateLocalFallback();
      }
    );
  } catch (err) {
    console.warn("Firestore init error:", err);
    activateLocalFallback();
  }
}

function activateLocalFallback() {
  const statusBadge = document.getElementById("firebase-status-badge");
  if (statusBadge) {
    statusBadge.textContent = "Mode Lokal (Offline)";
    statusBadge.className = IS_ADMIN_PAGE
      ? "text-[11px] font-semibold text-amber-300 bg-amber-950/60 border border-amber-500/30 px-2.5 py-0.5 rounded-full"
      : "text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full";
  }
  const saved = localStorage.getItem(STORAGE_KEY);
  reports = saved ? JSON.parse(saved) : [...INITIAL_REPORTS];
  if (!saved) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  }
  refreshAllViews();
}

function refreshAllViews() {
  if (IS_ADMIN_PAGE) {
    renderAdminReports();
  } else {
    renderStats();
    renderReports();
    renderMapMarkers();
  }
}

// ==========================================
// CO-ADMIN MANAGEMENT (LEVEL 1 ADMIN ONLY)
// ==========================================
function renderCoAdminList() {
  const container = document.getElementById("coadmin-list");
  if (!container) return;

  if (coAdminEmails.length === 0) {
    container.innerHTML = `<span class="text-xs text-slate-400 italic">Belum ada Co-Admin terdaftar. Tambahkan email di atas untuk memberikan akses Level 2.</span>`;
    return;
  }

  container.innerHTML = coAdminEmails
    .map(
      (email) => `
      <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200">
        <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
        <span class="font-medium">${escapeHtml(email)}</span>
        <button type="button" onclick="removeCoAdmin('${escapeHtml(email)}')" title="Cabut akses Co-Admin" class="text-slate-400 hover:text-rose-400 font-bold ml-1">&times;</button>
      </div>
    `
    )
    .join("");
}

window.removeCoAdmin = async function (email) {
  if (currentRole !== "admin") return;
  if (!confirm(`Cabut akses Co-Admin untuk ${email}?`)) return;

  const cleanEmail = email.toLowerCase().trim();
  coAdminEmails = coAdminEmails.filter((e) => e !== cleanEmail);
  localStorage.setItem(COADMIN_CACHE_KEY, JSON.stringify(coAdminEmails));
  renderCoAdminList();

  try {
    await setDoc(
      doc(db, "settings", "roles"),
      { coAdmins: arrayRemove(cleanEmail) },
      { merge: true }
    );
  } catch (err) {
    console.warn("Gagal menghapus Co-Admin di Firestore:", err.message);
  }
};

// ==========================================
// ADMIN PANEL TABLE & ACTIONS
// ==========================================
function renderAdminReports() {
  const totalEl = document.getElementById("adm-stat-total");
  if (totalEl) {
    totalEl.textContent = reports.length;
    document.getElementById("adm-stat-urgent").textContent = reports.filter(
      (r) => (r.urgency === "Darurat" || r.urgency === "Tinggi") && r.status !== "Selesai"
    ).length;
    document.getElementById("adm-stat-pending").textContent = reports.filter(
      (r) => r.status === "Menunggu Verifikasi"
    ).length;
    document.getElementById("adm-stat-progress").textContent = reports.filter(
      (r) => r.status === "Sedang Ditangani"
    ).length;
    document.getElementById("adm-stat-resolved").textContent = reports.filter(
      (r) => r.status === "Selesai"
    ).length;
  }

  const tbody = document.getElementById("admin-reports-tbody");
  if (!tbody) return;

  const admSearch = (document.getElementById("admin-search-input")?.value || "").toLowerCase().trim();
  const admStatus = document.getElementById("admin-status-filter")?.value || "ALL";

  const filtered = reports.filter((rep) => {
    const matchStatus = admStatus === "ALL" || rep.status === admStatus;
    const matchQuery =
      !admSearch ||
      rep.id.toLowerCase().includes(admSearch) ||
      rep.title.toLowerCase().includes(admSearch) ||
      rep.kecamatan.toLowerCase().includes(admSearch) ||
      (rep.reporter || "").toLowerCase().includes(admSearch);
    return matchStatus && matchQuery;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="py-6 text-center text-slate-400">Tidak ada laporan yang sesuai filter admin.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered
    .map((rep) => {
      const isAdminLv1 = currentRole === "admin";
      return `
      <tr class="hover:bg-slate-800/50 transition">
        <td class="py-3 px-4 align-top whitespace-nowrap">
          <div class="font-mono font-extrabold text-indigo-300">${escapeHtml(rep.id)}</div>
          <div class="text-[11px] text-slate-400 mt-0.5">${escapeHtml(rep.createdAt || "-")}</div>
          <span class="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded bg-slate-700 text-slate-200">${escapeHtml(rep.urgency)}</span>
        </td>
        <td class="py-3 px-4 align-top max-w-xs">
          <div class="font-bold text-white leading-snug">${escapeHtml(rep.title)}</div>
          <div class="text-[11px] text-slate-400 mt-0.5">Kec. ${escapeHtml(rep.kecamatan)} &bull; ${escapeHtml(rep.desa)}</div>
        </td>
        <td class="py-3 px-4 align-top">
          <div class="font-semibold text-slate-200">${escapeHtml(rep.reporter)}</div>
          <div class="text-[11px] text-slate-400">${escapeHtml(rep.reporterEmail || "-")}</div>
          ${rep.phone ? `<div class="text-[11px] text-emerald-400 font-mono mt-0.5">WA: ${escapeHtml(rep.phone)}</div>` : ""}
        </td>
        <td class="py-3 px-4 align-top">
          <input type="text" value="${escapeHtml(rep.agency || "")}" onchange="adminUpdateAgency('${rep.id}', this.value)" class="w-44 rounded-lg bg-slate-900 border border-slate-700 px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500" />
        </td>
        <td class="py-3 px-4 align-top">
          <select onchange="adminUpdateStatus('${rep.id}', this.value)" class="rounded-lg bg-slate-900 border border-slate-700 px-2.5 py-1.5 text-xs font-bold text-white focus:outline-none focus:ring-1 focus:ring-indigo-500">
            <option value="Menunggu Verifikasi" ${rep.status === "Menunggu Verifikasi" ? "selected" : ""}>Menunggu Verifikasi</option>
            <option value="Sedang Ditangani" ${rep.status === "Sedang Ditangani" ? "selected" : ""}>Sedang Ditangani</option>
            <option value="Selesai" ${rep.status === "Selesai" ? "selected" : ""}>Selesai</option>
          </select>
        </td>
        <td class="py-3 px-4 align-top text-right whitespace-nowrap space-x-1">
          <button type="button" onclick="openAdminReportDetail('${rep.id}')" class="px-2.5 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 font-semibold transition">
            Detail
          </button>
          <a href="index.html?lat=${rep.lat}&lng=${rep.lng}#peta-kejadian" class="inline-block px-2.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold transition">
            Peta
          </a>
          ${
            isAdminLv1
              ? `<button type="button" onclick="adminDeleteReport('${rep.id}')" class="px-2.5 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 font-semibold transition">Hapus</button>`
              : `<span class="inline-block px-1.5 text-[10px] text-slate-500 italic">Lv.2</span>`
          }
        </td>
      </tr>
      `;
    })
    .join("");
}

window.openAdminReportDetail = function (id) {
  const rep = reports.find((r) => r.id === id);
  if (!rep) return;

  const safePhoto = isSafeImageUrl(rep.photo) ? rep.photo : "";
  document.getElementById("adm-modal-id").textContent = `${rep.id} â€¢ ${rep.status}`;
  document.getElementById("adm-modal-title").textContent = rep.title;
  document.getElementById("adm-modal-body").innerHTML = `
    ${safePhoto ? `<img src="${safePhoto}" alt="Foto Bukti" class="w-full h-44 object-cover rounded-xl border border-slate-200" />` : ""}
    <div class="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200">
      <div><span class="text-slate-400 block">Kecamatan / Desa:</span><strong class="text-slate-800">Kec. ${escapeHtml(rep.kecamatan)}, ${escapeHtml(rep.desa)}</strong></div>
      <div><span class="text-slate-400 block">Kategori &amp; Urgensi:</span><strong class="text-slate-800">${escapeHtml(rep.category)} (${escapeHtml(rep.urgency)})</strong></div>
      <div><span class="text-slate-400 block">Pelapor:</span><strong class="text-slate-800">${escapeHtml(rep.reporter)} (${escapeHtml(rep.reporterEmail || "-")})</strong></div>
      <div><span class="text-slate-400 block">No. WhatsApp:</span><strong class="text-emerald-700 font-mono">${escapeHtml(rep.phone || "Tidak dicantumkan")}</strong></div>
      <div class="col-span-2"><span class="text-slate-400 block">Koordinat GPS:</span><span class="font-mono text-slate-700">${rep.lat}, ${rep.lng}</span></div>
    </div>
    <div>
      <span class="font-bold text-slate-800 block mb-1">Kronologi Lengkap:</span>
      <p class="p-3 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 leading-relaxed">${escapeHtml(rep.description)}</p>
    </div>
  `;

  const modal = document.getElementById("admin-detail-modal");
  modal.classList.remove("hidden");
  modal.classList.add("flex");
};

window.adminUpdateStatus = async function (id, newStatus) {
  if (currentRole !== "admin" && currentRole !== "coadmin") return;
  const target = reports.find((r) => r.id === id);
  if (target) target.status = newStatus;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  refreshAllViews();

  try {
    await updateDoc(doc(db, "reports", id), {
      status: newStatus,
      updatedBy: currentUser?.email || "admin"
    });
  } catch (err) {
    console.warn("Update status tersimpan lokal:", err.message);
  }
};

window.adminUpdateAgency = async function (id, newAgency) {
  if (currentRole !== "admin" && currentRole !== "coadmin") return;
  const target = reports.find((r) => r.id === id);
  if (target) target.agency = newAgency.trim();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  refreshAllViews();

  try {
    await updateDoc(doc(db, "reports", id), {
      agency: newAgency.trim(),
      updatedBy: currentUser?.email || "admin"
    });
  } catch (err) {
    console.warn("Update instansi tersimpan lokal:", err.message);
  }
};

window.adminDeleteReport = async function (id) {
  if (currentRole !== "admin") {
    alert("Hanya Admin Utama (Level 1) yang memiliki hak menghapus laporan.");
    return;
  }
  if (!confirm(`Hapus permanen laporan tiket ${id}?`)) return;

  reports = reports.filter((r) => r.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  refreshAllViews();

  try {
    await deleteDoc(doc(db, "reports", id));
  } catch (err) {
    console.warn("Hapus laporan tersimpan lokal:", err.message);
  }
};

function exportReportsToCsv() {
  if (currentRole !== "admin" && currentRole !== "coadmin") return;
  const headers = ["ID Tiket", "Waktu", "Judul", "Kategori", "Urgensi", "Kecamatan", "Desa", "Pelapor", "Email", "No HP", "Instansi", "Status"];
  const rows = reports.map((r) => [
    r.id,
    r.createdAt || "",
    `"${String(r.title || "").replace(/"/g, '""')}"`,
    `"${String(r.category || "").replace(/"/g, '""')}"`,
    r.urgency || "",
    r.kecamatan || "",
    `"${String(r.desa || "").replace(/"/g, '""')}"`,
    `"${String(r.reporter || "").replace(/"/g, '""')}"`,
    r.reporterEmail || "",
    r.phone || "",
    `"${String(r.agency || "").replace(/"/g, '""')}"`,
    r.status || ""
  ]);

  const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", `Laporan_Rembang_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// ==========================================
// MAP & PUBLIC UI RENDERING (index.html)
// ==========================================
function populateKecamatanDropdowns() {
  const formSelect = document.getElementById("kecamatan");
  const filterSelect = document.getElementById("filter-kecamatan");
  if (!formSelect || !filterSelect) return;

  KECAMATAN_REMBANG.forEach((kec) => {
    const opt1 = document.createElement("option");
    opt1.value = kec.name;
    opt1.textContent = `Kecamatan ${kec.name}`;
    formSelect.appendChild(opt1);

    const opt2 = document.createElement("option");
    opt2.value = kec.name;
    opt2.textContent = `Kec. ${kec.name}`;
    filterSelect.appendChild(opt2);
  });
}

function initMap() {
  const mapContainer = document.getElementById("rembang-map");
  if (!mapContainer || typeof L === "undefined") return;

  const urlParams = new URLSearchParams(window.location.search);
  const paramLat = parseFloat(urlParams.get("lat"));
  const paramLng = parseFloat(urlParams.get("lng"));
  const hasQueryCoords = !isNaN(paramLat) && !isNaN(paramLng);

  map = L.map("rembang-map").setView(
    hasQueryCoords ? [paramLat, paramLng] : [-6.735, 111.46],
    hasQueryCoords ? 15 : 11
  );

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  markersLayer = L.layerGroup().addTo(map);

  draftMarker = L.marker([-6.7086, 111.3418], { draggable: true })
    .addTo(map)
    .bindPopup("<b>Titik Lokasi Laporan Baru</b><br/>Geser pin atau klik peta untuk menyesuaikan.");

  draftMarker.on("dragend", (e) => {
    const pos = e.target.getLatLng();
    updateCoordinateInputs(pos.lat, pos.lng);
  });

  map.on("click", (e) => {
    const { lat, lng } = e.latlng;
    draftMarker.setLatLng([lat, lng]).openPopup();
    updateCoordinateInputs(lat, lng);
  });

  renderMapMarkers();
}

function updateCoordinateInputs(lat, lng) {
  const latInput = document.getElementById("lat");
  const lngInput = document.getElementById("lng");
  if (latInput) latInput.value = lat.toFixed(5);
  if (lngInput) lngInput.value = lng.toFixed(5);
}

function getMarkerColor(report) {
  if (report.status === "Selesai") return "#10b981";
  if (report.urgency === "Darurat" || report.urgency === "Tinggi") return "#f43f5e";
  return "#f59e0b";
}

function renderMapMarkers() {
  if (!markersLayer) return;
  markersLayer.clearLayers();

  reports.forEach((rep) => {
    const color = getMarkerColor(rep);
    const circle = L.circleMarker([rep.lat, rep.lng], {
      radius: 9,
      fillColor: color,
      color: "#ffffff",
      weight: 2.5,
      opacity: 1,
      fillOpacity: 0.9
    });

    circle.bindPopup(`
      <div style="min-width:190px">
        <div style="font-weight:800;color:#0284c7;font-size:11px;">${escapeHtml(rep.id)} &bull; Kec. ${escapeHtml(rep.kecamatan)}</div>
        <div style="font-weight:700;color:#0f172a;margin:3px 0;">${escapeHtml(rep.title)}</div>
        <div style="color:#475569;font-size:11px;">${escapeHtml(rep.desa)}</div>
        <div style="margin-top:6px;display:inline-block;padding:2px 7px;border-radius:6px;background:#f1f5f9;font-weight:700;font-size:10px;">
          Status: ${escapeHtml(rep.status)}
        </div>
      </div>
    `);

    circle.addTo(markersLayer);
  });
}

function renderStats() {
  const totalEl = document.getElementById("stat-total");
  if (!totalEl) return;

  const total = reports.length;
  const pending = reports.filter((r) => r.status === "Menunggu Verifikasi").length;
  const progress = reports.filter((r) => r.status === "Sedang Ditangani").length;
  const resolved = reports.filter((r) => r.status === "Selesai").length;

  totalEl.textContent = total;
  document.getElementById("stat-pending").textContent = pending;
  document.getElementById("stat-progress").textContent = progress;
  document.getElementById("stat-resolved").textContent = resolved;
}

function getUrgencyBadge(urgency) {
  switch (urgency) {
    case "Darurat":
      return "bg-rose-100 text-rose-800 border-rose-200";
    case "Tinggi":
      return "bg-orange-100 text-orange-800 border-orange-200";
    case "Sedang":
      return "bg-amber-100 text-amber-800 border-amber-200";
    default:
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
  }
}

function getStatusBadge(status) {
  switch (status) {
    case "Selesai":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "Sedang Ditangani":
      return "bg-sky-50 text-sky-700 border-sky-200";
    default:
      return "bg-amber-50 text-amber-700 border-amber-200";
  }
}

function renderReports() {
  const grid = document.getElementById("reports-grid");
  if (!grid) return;

  const keyword = (document.getElementById("search-reports")?.value || "").toLowerCase().trim();
  const kecFilter = document.getElementById("filter-kecamatan")?.value || "ALL";
  const statusFilter = document.getElementById("filter-status")?.value || "ALL";

  const filtered = reports.filter((rep) => {
    const matchMine =
      !filterOnlyMine ||
      (currentUser && (rep.reporterUid === currentUser.uid || rep.reporterEmail === currentUser.email));
    const matchKec = kecFilter === "ALL" || rep.kecamatan === kecFilter;
    const matchStatus = statusFilter === "ALL" || rep.status === statusFilter;
    const matchText =
      !keyword ||
      rep.title.toLowerCase().includes(keyword) ||
      rep.desa.toLowerCase().includes(keyword) ||
      rep.id.toLowerCase().includes(keyword) ||
      rep.category.toLowerCase().includes(keyword);
    return matchMine && matchKec && matchStatus && matchText;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full bg-white rounded-2xl border border-slate-200 p-10 text-center">
        <p class="text-sm font-bold text-slate-700">Tidak ada laporan yang sesuai filter.</p>
        <p class="text-xs text-slate-500 mt-1">Coba ubah pilihan kecamatan, status, atau kata kunci pencarian.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered
    .map((rep) => {
      const isUpvoted = upvotedIds.includes(rep.id);
      const isMine = currentUser && (rep.reporterUid === currentUser.uid || rep.reporterEmail === currentUser.email);
      const safePhoto = isSafeImageUrl(rep.photo) ? rep.photo : "";
      return `
      <article class="bg-white rounded-2xl border ${isMine ? "border-rembang-300 ring-1 ring-rembang-100" : "border-slate-200/90"} shadow-sm hover:shadow-md transition flex flex-col justify-between overflow-hidden">
        ${
          safePhoto
            ? `<img src="${safePhoto}" alt="Bukti kejadian" class="w-full h-40 object-cover border-b border-slate-100" />`
            : ""
        }
        <div class="p-5 space-y-3 flex-1">
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-1.5">
              <span class="font-mono text-[11px] font-bold text-rembang-700 bg-rembang-50 px-2.5 py-0.5 rounded-md border border-rembang-100">
                ${escapeHtml(rep.id)}
              </span>
              ${isMine ? `<span class="text-[10px] font-extrabold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">Laporan Anda</span>` : ""}
            </div>
            <span class="text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(rep.status)}">
              ${escapeHtml(rep.status)}
            </span>
          </div>

          <div>
            <h3 class="font-extrabold text-slate-900 text-base leading-snug">
              ${escapeHtml(rep.title)}
            </h3>
            <p class="text-xs font-semibold text-slate-500 mt-1">
              Kec. ${escapeHtml(rep.kecamatan)} &bull; ${escapeHtml(rep.desa)}
            </p>
          </div>

          <p class="text-xs text-slate-600 leading-relaxed line-clamp-3">
            ${escapeHtml(rep.description)}
          </p>

          <div class="flex flex-wrap items-center gap-1.5 pt-1">
            <span class="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
              ${escapeHtml(rep.category)}
            </span>
            <span class="text-[11px] font-bold px-2 py-0.5 rounded border ${getUrgencyBadge(rep.urgency)}">
              Urgensi: ${escapeHtml(rep.urgency)}
            </span>
          </div>
        </div>

        <div class="px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs">
          <div class="text-slate-500">
            <span class="font-semibold text-slate-700">${escapeHtml(rep.reporter)}</span> &bull; ${escapeHtml(rep.createdAt)}
          </div>
          <div class="flex items-center gap-2">
            <button type="button" onclick="focusOnMap(${rep.lat}, ${rep.lng})" title="Lihat di Peta" class="p-1.5 rounded-lg text-slate-500 hover:text-rembang-600 hover:bg-white border border-transparent hover:border-slate-200 transition">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"/></svg>
            </button>
            <button type="button" onclick="toggleUpvote('${rep.id}')" class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold border transition ${
              isUpvoted
                ? "bg-rembang-600 text-white border-rembang-600"
                : "bg-white text-slate-700 border-slate-200 hover:border-rembang-400"
            }">
              <span>&#9650;</span>
              <span>${rep.upvotes}</span>
            </button>
          </div>
        </div>
      </article>
      `;
    })
    .join("");
}

// ==========================================
// EVENT LISTENERS (AUTH, FORM, FILTERS)
// ==========================================
function openAuthModal() {
  const errBox = document.getElementById("auth-error-box");
  if (errBox) errBox.classList.add("hidden");
  const modal = document.getElementById("auth-modal");
  if (modal) {
    modal.classList.remove("hidden");
    modal.classList.add("flex");
  }
}

function closeAuthModal() {
  const modal = document.getElementById("auth-modal");
  if (modal) {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }
}

function showAuthError(msg) {
  const box = document.getElementById("auth-error-box");
  if (box) {
    box.textContent = msg;
    box.classList.remove("hidden");
  }
}

function translateFirebaseAuthError(code) {
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Email atau kata sandi salah.";
    case "auth/email-already-in-use":
      return "Email ini sudah terdaftar. Silakan gunakan tab Masuk.";
    case "auth/weak-password":
      return "Kata sandi terlalu lemah (minimal 6 karakter).";
    case "auth/popup-closed-by-user":
      return "Jendela login Google ditutup sebelum selesai.";
    case "auth/unauthorized-domain":
      return "Domain belum diizinkan di Firebase Console (Authentication > Settings > Authorized domains).";
    default:
      return "Terjadi kendala autentikasi: " + code;
  }
}

function bindEvents() {
  // Tombol Login Header (berlaku di index.html & admin.html)
  document.getElementById("btn-open-auth")?.addEventListener("click", () => {
    if (IS_ADMIN_PAGE) {
      document.getElementById("auth-email")?.focus();
    } else {
      openAuthModal();
    }
  });

  document.getElementById("btn-gate-login")?.addEventListener("click", openAuthModal);
  document.getElementById("btn-close-auth")?.addEventListener("click", closeAuthModal);

  // Ganti akun jika akun warga masuk ke admin.html
  document.getElementById("btn-admin-gate-switch")?.addEventListener("click", async () => {
    await signOut(auth);
  });

  // Modal Detail Laporan Admin
  document.getElementById("btn-close-adm-modal")?.addEventListener("click", () => {
    const modal = document.getElementById("admin-detail-modal");
    if (modal) {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    }
  });

  document.getElementById("btn-export-csv")?.addEventListener("click", exportReportsToCsv);
  document.getElementById("admin-search-input")?.addEventListener("input", renderAdminReports);
  document.getElementById("admin-status-filter")?.addEventListener("change", renderAdminReports);

  // Auth Tabs (Login vs Register di index.html)
  const tabLogin = document.getElementById("tab-login");
  const tabRegister = document.getElementById("tab-register");
  const nameWrap = document.getElementById("auth-name-wrap");
  const submitAuthBtn = document.getElementById("btn-email-auth-submit");

  tabLogin?.addEventListener("click", () => {
    authMode = "login";
    tabLogin.className = "py-1.5 rounded-lg bg-white text-slate-900 shadow-sm transition";
    tabRegister.className = "py-1.5 rounded-lg text-slate-500 hover:text-slate-800 transition";
    nameWrap?.classList.add("hidden");
    if (submitAuthBtn) submitAuthBtn.textContent = "Masuk Sekarang";
    document.getElementById("auth-error-box")?.classList.add("hidden");
  });

  tabRegister?.addEventListener("click", () => {
    authMode = "register";
    tabRegister.className = "py-1.5 rounded-lg bg-white text-slate-900 shadow-sm transition";
    tabLogin.className = "py-1.5 rounded-lg text-slate-500 hover:text-slate-800 transition";
    nameWrap?.classList.remove("hidden");
    if (submitAuthBtn) submitAuthBtn.textContent = "Daftar Akun Pelapor";
    document.getElementById("auth-error-box")?.classList.add("hidden");
  });

  // Google Sign-In (dipakai baik di modal index.html maupun di form langsung admin.html)
  document.getElementById("btn-google-login")?.addEventListener("click", async () => {
    try {
      justLoggedIn = true;
      await signInWithPopup(auth, googleProvider);
      closeAuthModal();
      updateAuthUI();
    } catch (err) {
      justLoggedIn = false;
      showAuthError(translateFirebaseAuthError(err.code || err.message));
    }
  });

  // Email/Password Auth Submit (dipakai baik di modal index.html maupun di form langsung admin.html)
  document.getElementById("email-auth-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("auth-email").value.trim();
    const password = document.getElementById("auth-password").value;
    const fullName = document.getElementById("auth-name")?.value.trim() || "";

    try {
      if (submitAuthBtn) submitAuthBtn.disabled = true;
      justLoggedIn = true;

      if (!IS_ADMIN_PAGE && authMode === "register") {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        if (fullName) {
          await updateProfile(cred.user, { displayName: fullName });
        }
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }

      e.target.reset();
      closeAuthModal();
      updateAuthUI();
    } catch (err) {
      justLoggedIn = false;
      showAuthError(translateFirebaseAuthError(err.code || err.message));
    } finally {
      if (submitAuthBtn) submitAuthBtn.disabled = false;
    }
  });

  // Logout
  document.getElementById("btn-logout")?.addEventListener("click", async () => {
    await signOut(auth);
    if (IS_ADMIN_PAGE) {
      window.location.href = "index.html";
    }
  });

  // Add Co-Admin Form (Level 1 Admin Only di admin.html)
  document.getElementById("coadmin-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (currentRole !== "admin") return;

    const input = document.getElementById("coadmin-email-input");
    const newEmail = input.value.toLowerCase().trim();
    if (!newEmail) return;

    if (newEmail === PRIMARY_ADMIN_EMAIL.toLowerCase()) {
      alert("Email tersebut sudah terdaftar sebagai Admin Utama (Level 1).");
      return;
    }

    if (!coAdminEmails.includes(newEmail)) {
      coAdminEmails.push(newEmail);
      localStorage.setItem(COADMIN_CACHE_KEY, JSON.stringify(coAdminEmails));
      renderCoAdminList();

      try {
        await setDoc(
          doc(db, "settings", "roles"),
          { coAdmins: arrayUnion(newEmail) },
          { merge: true }
        );
      } catch (err) {
        console.warn("Co-Admin disimpan lokal:", err.message);
      }
    }
    input.value = "";
  });

  // Sync / Refresh button in Admin Panel
  document.getElementById("btn-sync-cloud")?.addEventListener("click", () => {
    refreshAllViews();
  });

  // Filter Laporan Saya (index.html)
  const btnFilterMine = document.getElementById("btn-filter-mine");
  btnFilterMine?.addEventListener("click", () => {
    filterOnlyMine = !filterOnlyMine;
    btnFilterMine.className = filterOnlyMine
      ? "rounded-xl border border-rembang-600 bg-rembang-600 px-3 py-2 text-xs font-bold text-white transition"
      : "rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:border-rembang-500 transition";
    renderReports();
  });

  // Kecamatan select updates map focus & coordinates
  document.getElementById("kecamatan")?.addEventListener("change", (e) => {
    const found = KECAMATAN_REMBANG.find((k) => k.name === e.target.value);
    if (found && map && draftMarker) {
      map.setView([found.lat, found.lng], 13);
      draftMarker.setLatLng([found.lat, found.lng]);
      updateCoordinateInputs(found.lat, found.lng);
    }
  });

  // Geolocation GPS
  document.getElementById("btn-geolocate")?.addEventListener("click", () => {
    if (!navigator.geolocation) {
      alert("Browser Anda tidak mendukung fitur GPS.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        map.setView([latitude, longitude], 15);
        draftMarker.setLatLng([latitude, longitude]).openPopup();
        updateCoordinateInputs(latitude, longitude);
      },
      () => {
        alert("Gagal mengambil lokasi GPS. Pastikan izin lokasi diaktifkan.");
      }
    );
  });

  // Photo upload preview dengan kompresi otomatis agar aman untuk Firestore (<1MB)
  document.getElementById("photo")?.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    compressImageToBase64(file, 900, 0.72, (compressedDataUrl) => {
      uploadedPhotoBase64 = compressedDataUrl;
      document.getElementById("photo-preview").src = uploadedPhotoBase64;
      document.getElementById("photo-preview-wrap").classList.remove("hidden");
      document.getElementById("photo-label").textContent = file.name;
    });
  });

  document.getElementById("btn-remove-photo")?.addEventListener("click", () => {
    uploadedPhotoBase64 = "";
    document.getElementById("photo").value = "";
    document.getElementById("photo-preview-wrap").classList.add("hidden");
    document.getElementById("photo-label").textContent = "Pilih atau ambil foto kejadian (JPG/PNG)";
  });

  // Submit Report Form (Requires Login)
  document.getElementById("report-form")?.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!currentUser) {
      openAuthModal();
      return;
    }

    const isAnon = document.getElementById("anonymous").checked;
    const rawName = document.getElementById("reporter").value.trim();
    const defaultName = currentUser.displayName || currentUser.email.split("@")[0];
    const reporterName = isAnon ? "Warga Anonim" : rawName || defaultName;
    const category = document.getElementById("category").value;

    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const ticketCode = `RBG-2026-${randomSuffix}`;

    const newReport = {
      id: ticketCode,
      title: document.getElementById("title").value.trim(),
      category,
      urgency: document.getElementById("urgency").value,
      kecamatan: document.getElementById("kecamatan").value,
      desa: document.getElementById("desa").value.trim(),
      lat: parseFloat(document.getElementById("lat").value),
      lng: parseFloat(document.getElementById("lng").value),
      description: document.getElementById("description").value.trim(),
      phone: document.getElementById("phone").value.trim(),
      reporter: reporterName,
      reporterEmail: currentUser.email,
      reporterUid: currentUser.uid,
      status: "Menunggu Verifikasi",
      agency: mapCategoryToAgency(category),
      createdAt: new Date().toLocaleString("id-ID", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" }),
      timestampMs: Date.now(),
      upvotes: 1,
      photo: uploadedPhotoBase64
    };

    const submitBtn = document.getElementById("btn-submit-report");
    submitBtn.disabled = true;

    try {
      await setDoc(doc(db, "reports", ticketCode), newReport);
    } catch (err) {
      console.warn("Gagal simpan ke Firestore, menyimpan ke lokal:", err.message);
      reports.unshift(newReport);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
      refreshAllViews();
    } finally {
      submitBtn.disabled = false;
    }

    // Reset form & sinkronkan kembali marker peta
    e.target.reset();
    document.getElementById("reporter").value = defaultName;
    uploadedPhotoBase64 = "";
    document.getElementById("photo-preview-wrap").classList.add("hidden");
    document.getElementById("photo-label").textContent = "Pilih atau ambil foto kejadian (JPG/PNG)";
    if (map && draftMarker) {
      draftMarker.setLatLng([-6.7086, 111.3418]);
      updateCoordinateInputs(-6.7086, 111.3418);
    }

    // Show modal
    document.getElementById("modal-ticket-code").textContent = ticketCode;
    const modal = document.getElementById("ticket-modal");
    modal.classList.remove("hidden");
    modal.classList.add("flex");
  });

  // Filters
  document.getElementById("search-reports")?.addEventListener("input", renderReports);
  document.getElementById("filter-kecamatan")?.addEventListener("change", renderReports);
  document.getElementById("filter-status")?.addEventListener("change", renderReports);

  // Track Ticket
  document.getElementById("track-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    const code = document.getElementById("track-input").value.trim().toUpperCase();
    const resultBox = document.getElementById("track-result");
    const found = reports.find((r) => r.id.toUpperCase() === code);

    resultBox.classList.remove("hidden");
    if (!found) {
      resultBox.innerHTML = `<p class="text-rose-600 font-bold text-xs">Kode tiket "${escapeHtml(code)}" tidak ditemukan. Pastikan format sesuai (contoh: RBG-2026-101).</p>`;
      return;
    }

    resultBox.innerHTML = `
      <div class="space-y-1.5">
        <div class="flex items-center justify-between">
          <span class="font-mono font-extrabold text-rembang-700">${escapeHtml(found.id)}</span>
          <span class="text-xs font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(found.status)}">${escapeHtml(found.status)}</span>
        </div>
        <p class="font-bold text-slate-900">${escapeHtml(found.title)}</p>
        <p class="text-xs text-slate-600">Lokasi: Kec. ${escapeHtml(found.kecamatan)}, ${escapeHtml(found.desa)}</p>
        <p class="text-xs text-slate-600">Instansi Terkait: <span class="font-semibold text-slate-800">${escapeHtml(found.agency)}</span></p>
      </div>
    `;
  });

  // Modals
  document.getElementById("btn-close-modal")?.addEventListener("click", () => {
    const modal = document.getElementById("ticket-modal");
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    document.getElementById("daftar-laporan")?.scrollIntoView({ behavior: "smooth" });
  });

  const sosModal = document.getElementById("sos-modal");
  document.getElementById("btn-quick-sos")?.addEventListener("click", () => {
    sosModal?.classList.remove("hidden");
    sosModal?.classList.add("flex");
  });
  document.getElementById("btn-close-sos")?.addEventListener("click", () => {
    sosModal?.classList.add("hidden");
    sosModal?.classList.remove("flex");
  });
}

function compressImageToBase64(file, maxWidth, quality, callback) {
  const reader = new FileReader();
  reader.onload = (ev) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      let { width, height } = img;
      if (width > maxWidth) {
        height = Math.round((height * maxWidth) / width);
        width = maxWidth;
      }
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);
      callback(canvas.toDataURL("image/jpeg", quality));
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
}

function isSafeImageUrl(url) {
  if (!url || typeof url !== "string") return false;
  return url.startsWith("data:image/") || url.startsWith("https://") || url.startsWith("http://");
}

function mapCategoryToAgency(category) {
  if (category.includes("Infrastruktur")) return "DPUPR Kab. Rembang / Bina Marga";
  if (category.includes("Bencana")) return "BPBD Kabupaten Rembang";
  if (category.includes("Lalu Lintas")) return "Satlantas Polres Rembang & Dinhub";
  if (category.includes("PJU")) return "Dinas Perhubungan Kab. Rembang";
  if (category.includes("Kebersihan")) return "Dinas Lingkungan Hidup (DLH) Rembang";
  if (category.includes("Keamanan")) return "Polres Rembang & Satpol PP";
  if (category.includes("Kesehatan")) return "Dinkes & RSUD dr. R. Soetrasno";
  return "Call Center 112 Kab. Rembang";
}

window.toggleUpvote = async function (id) {
  const report = reports.find((r) => r.id === id);
  if (!report) return;

  if (upvotedIds.includes(id)) {
    upvotedIds = upvotedIds.filter((item) => item !== id);
    report.upvotes = Math.max(0, report.upvotes - 1);
  } else {
    upvotedIds.push(id);
    report.upvotes += 1;
  }

  localStorage.setItem(UPVOTED_KEY, JSON.stringify(upvotedIds));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  renderReports();

  try {
    await updateDoc(doc(db, "reports", id), { upvotes: report.upvotes });
  } catch (err) {
    // Silent fallback when offline
  }
};

window.focusOnMap = function (lat, lng) {
  const mapEl = document.getElementById("peta-kejadian");
  if (mapEl) {
    mapEl.scrollIntoView({ behavior: "smooth" });
  }
  if (map) {
    map.invalidateSize();
    map.setView([lat, lng], 15);
  }
};

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
