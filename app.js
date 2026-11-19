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
  getDoc,
  getDocs,
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
let useLocalFallback = false;

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

  populateKecamatanDropdowns();
  initMap();
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

  const navAdminLink = document.getElementById("nav-admin-link");
  const mobileAdminBadge = document.getElementById("mobile-admin-badge");
  const adminPanel = document.getElementById("admin-panel");
  const adminLevelBadge = document.getElementById("admin-level-badge");
  const adminLoggedEmail = document.getElementById("admin-logged-email");
  const adminRoleDesc = document.getElementById("admin-role-desc");
  const coAdminManagerBox = document.getElementById("coadmin-manager-box");

  const reportAuthGate = document.getElementById("report-auth-gate");
  const reportForm = document.getElementById("report-form");
  const formReporterEmail = document.getElementById("form-reporter-email");
  const reporterInput = document.getElementById("reporter");
  const btnFilterMine = document.getElementById("btn-filter-mine");

  if (!currentUser) {
    // Guest State
    btnOpenAuth.classList.remove("hidden");
    userProfileBar.classList.add("hidden");
    userProfileBar.classList.remove("flex");

    navAdminLink.classList.add("hidden");
    navAdminLink.classList.remove("inline-flex");
    mobileAdminBadge.classList.add("hidden");
    adminPanel.classList.add("hidden");

    reportAuthGate.classList.remove("hidden");
    reportForm.classList.add("hidden");
    btnFilterMine.classList.add("hidden");
    filterOnlyMine = false;
    return;
  }

  // Logged-in State
  btnOpenAuth.classList.add("hidden");
  userProfileBar.classList.remove("hidden");
  userProfileBar.classList.add("flex");

  const displayName = currentUser.displayName || currentUser.email.split("@")[0];
  navUserName.textContent = displayName;
  formReporterEmail.textContent = currentUser.email;
  if (!reporterInput.value) {
    reporterInput.value = displayName;
  }

  reportAuthGate.classList.add("hidden");
  reportForm.classList.remove("hidden");
  btnFilterMine.classList.remove("hidden");

  // Role Styling & Access Control
  if (currentRole === "admin") {
    navUserRole.textContent = "Admin Lv.1";
    navUserRole.className = "inline-block text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-0.2 rounded bg-indigo-600 text-white";

    navAdminLink.classList.remove("hidden");
    navAdminLink.classList.add("inline-flex");
    mobileAdminBadge.classList.remove("hidden");
    adminPanel.classList.remove("hidden");

    adminLevelBadge.textContent = "Level 1 â€¢ Admin Utama";
    adminLevelBadge.className = "px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/40";
    adminLoggedEmail.textContent = currentUser.email;
    adminRoleDesc.textContent = "Akses penuh: Verifikasi status laporan, tugaskan dinas, hapus laporan tidak valid, dan kelola hak akses Co-Admin.";
    coAdminManagerBox.classList.remove("hidden");
    renderCoAdminList();
  } else if (currentRole === "coadmin") {
    navUserRole.textContent = "Co-Admin Lv.2";
    navUserRole.className = "inline-block text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-0.2 rounded bg-amber-500 text-slate-900";

    navAdminLink.classList.remove("hidden");
    navAdminLink.classList.add("inline-flex");
    mobileAdminBadge.classList.remove("hidden");
    adminPanel.classList.remove("hidden");

    adminLevelBadge.textContent = "Level 2 â€¢ Co-Admin";
    adminLevelBadge.className = "px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40";
    adminLoggedEmail.textContent = currentUser.email;
    adminRoleDesc.textContent = "Akses operator: Verifikasi laporan warga, ubah status penanganan, dan tetapkan instansi dinas terkait.";
    coAdminManagerBox.classList.add("hidden");
  } else {
    navUserRole.textContent = "Warga Pelapor";
    navUserRole.className = "inline-block text-[10px] font-extrabold uppercase tracking-wider px-1.5 py-0.2 rounded bg-rembang-100 text-rembang-800";

    navAdminLink.classList.add("hidden");
    navAdminLink.classList.remove("inline-flex");
    mobileAdminBadge.classList.add("hidden");
    adminPanel.classList.add("hidden");
  }

  renderAdminReports();
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
        useLocalFallback = false;
        if (statusBadge) {
          statusBadge.textContent = "Live Cloud Sync";
          statusBadge.className = "text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full";
        }

        if (snapshot.empty) {
          // Seed initial reports if database is empty
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
  useLocalFallback = true;
  const statusBadge = document.getElementById("firebase-status-badge");
  if (statusBadge) {
    statusBadge.textContent = "Mode Lokal (Offline)";
    statusBadge.className = "text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full";
  }
  const saved = localStorage.getItem(STORAGE_KEY);
  reports = saved ? JSON.parse(saved) : [...INITIAL_REPORTS];
  if (!saved) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  }
  refreshAllViews();
}

function refreshAllViews() {
  renderStats();
  renderReports();
  renderMapMarkers();
  if (currentRole === "admin" || currentRole === "coadmin") {
    renderAdminReports();
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
  const tbody = document.getElementById("admin-reports-tbody");
  if (!tbody) return;

  if (reports.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="py-6 text-center text-slate-400">Belum ada data laporan masuk.</td></tr>`;
    return;
  }

  tbody.innerHTML = reports
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
        <td class="py-3 px-4 align-top text-right whitespace-nowrap space-x-1.5">
          <button type="button" onclick="focusOnMap(${rep.lat}, ${rep.lng})" class="px-2.5 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 font-semibold transition">
            Peta
          </button>
          ${
            isAdminLv1
              ? `<button type="button" onclick="adminDeleteReport('${rep.id}')" class="px-2.5 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/30 font-semibold transition">Hapus</button>`
              : `<span class="text-[10px] text-slate-500 italic">Lv.2</span>`
          }
        </td>
      </tr>
      `;
    })
    .join("");
}

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

// ==========================================
// MAP & PUBLIC UI RENDERING
// ==========================================
function populateKecamatanDropdowns() {
  const formSelect = document.getElementById("kecamatan");
  const filterSelect = document.getElementById("filter-kecamatan");

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
  map = L.map("rembang-map").setView([-6.735, 111.46], 11);

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
  document.getElementById("lat").value = lat.toFixed(5);
  document.getElementById("lng").value = lng.toFixed(5);
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
        <div style="font-weight:800;color:#0284c7;font-size:11px;">${rep.id} &bull; Kec. ${rep.kecamatan}</div>
        <div style="font-weight:700;color:#0f172a;margin:3px 0;">${escapeHtml(rep.title)}</div>
        <div style="color:#475569;font-size:11px;">${escapeHtml(rep.desa)}</div>
        <div style="margin-top:6px;display:inline-block;padding:2px 7px;border-radius:6px;background:#f1f5f9;font-weight:700;font-size:10px;">
          Status: ${rep.status}
        </div>
      </div>
    `);

    circle.addTo(markersLayer);
  });
}

function renderStats() {
  const total = reports.length;
  const pending = reports.filter((r) => r.status === "Menunggu Verifikasi").length;
  const progress = reports.filter((r) => r.status === "Sedang Ditangani").length;
  const resolved = reports.filter((r) => r.status === "Selesai").length;

  document.getElementById("stat-total").textContent = total;
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
  const keyword = document.getElementById("search-reports").value.toLowerCase().trim();
  const kecFilter = document.getElementById("filter-kecamatan").value;
  const statusFilter = document.getElementById("filter-status").value;

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
      return `
      <article class="bg-white rounded-2xl border ${isMine ? "border-rembang-300 ring-1 ring-rembang-100" : "border-slate-200/90"} shadow-sm hover:shadow-md transition flex flex-col justify-between overflow-hidden">
        ${
          rep.photo
            ? `<img src="${rep.photo}" alt="Bukti kejadian" class="w-full h-40 object-cover border-b border-slate-100" />`
            : ""
        }
        <div class="p-5 space-y-3 flex-1">
          <div class="flex items-center justify-between gap-2">
            <div class="flex items-center gap-1.5">
              <span class="font-mono text-[11px] font-bold text-rembang-700 bg-rembang-50 px-2.5 py-0.5 rounded-md border border-rembang-100">
                ${rep.id}
              </span>
              ${isMine ? `<span class="text-[10px] font-extrabold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">Laporan Anda</span>` : ""}
            </div>
            <span class="text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(rep.status)}">
              ${rep.status}
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
              Urgensi: ${rep.urgency}
            </span>
          </div>
        </div>

        <div class="px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between text-xs">
          <div class="text-slate-500">
            <span class="font-semibold text-slate-700">${escapeHtml(rep.reporter)}</span> &bull; ${rep.createdAt}
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
  document.getElementById("auth-error-box").classList.add("hidden");
  const modal = document.getElementById("auth-modal");
  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function closeAuthModal() {
  const modal = document.getElementById("auth-modal");
  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

function showAuthError(msg) {
  const box = document.getElementById("auth-error-box");
  box.textContent = msg;
  box.classList.remove("hidden");
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
  // Auth Modal Triggers
  document.getElementById("btn-open-auth").addEventListener("click", openAuthModal);
  document.getElementById("btn-gate-login").addEventListener("click", openAuthModal);
  document.getElementById("btn-close-auth").addEventListener("click", closeAuthModal);

  // Auth Tabs (Login vs Register)
  const tabLogin = document.getElementById("tab-login");
  const tabRegister = document.getElementById("tab-register");
  const nameWrap = document.getElementById("auth-name-wrap");
  const submitAuthBtn = document.getElementById("btn-email-auth-submit");

  tabLogin.addEventListener("click", () => {
    authMode = "login";
    tabLogin.className = "py-1.5 rounded-lg bg-white text-slate-900 shadow-2xs transition";
    tabRegister.className = "py-1.5 rounded-lg text-slate-500 hover:text-slate-800 transition";
    nameWrap.classList.add("hidden");
    submitAuthBtn.textContent = "Masuk Sekarang";
    document.getElementById("auth-error-box").classList.add("hidden");
  });

  tabRegister.addEventListener("click", () => {
    authMode = "register";
    tabRegister.className = "py-1.5 rounded-lg bg-white text-slate-900 shadow-2xs transition";
    tabLogin.className = "py-1.5 rounded-lg text-slate-500 hover:text-slate-800 transition";
    nameWrap.classList.remove("hidden");
    submitAuthBtn.textContent = "Daftar Akun Pelapor";
    document.getElementById("auth-error-box").classList.add("hidden");
  });

  // Google Sign-In
  document.getElementById("btn-google-login").addEventListener("click", async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      closeAuthModal();
    } catch (err) {
      showAuthError(translateFirebaseAuthError(err.code || err.message));
    }
  });

  // Email/Password Auth Submit
  document.getElementById("email-auth-form").addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("auth-email").value.trim();
    const password = document.getElementById("auth-password").value;
    const fullName = document.getElementById("auth-name").value.trim();

    try {
      submitAuthBtn.disabled = true;
      if (authMode === "register") {
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        if (fullName) {
          await updateProfile(cred.user, { displayName: fullName });
        }
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      e.target.reset();
      closeAuthModal();
    } catch (err) {
      showAuthError(translateFirebaseAuthError(err.code || err.message));
    } finally {
      submitAuthBtn.disabled = false;
    }
  });

  // Logout
  document.getElementById("btn-logout").addEventListener("click", async () => {
    await signOut(auth);
  });

  // Add Co-Admin Form (Level 1 Admin Only)
  document.getElementById("coadmin-form").addEventListener("submit", async (e) => {
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
  document.getElementById("btn-sync-cloud").addEventListener("click", () => {
    refreshAllViews();
  });

  // Filter Laporan Saya
  const btnFilterMine = document.getElementById("btn-filter-mine");
  btnFilterMine.addEventListener("click", () => {
    filterOnlyMine = !filterOnlyMine;
    btnFilterMine.className = filterOnlyMine
      ? "rounded-xl border border-rembang-600 bg-rembang-600 px-3 py-2 text-xs font-bold text-white transition"
      : "rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:border-rembang-500 transition";
    renderReports();
  });

  // Kecamatan select updates map focus & coordinates
  document.getElementById("kecamatan").addEventListener("change", (e) => {
    const found = KECAMATAN_REMBANG.find((k) => k.name === e.target.value);
    if (found && map && draftMarker) {
      map.setView([found.lat, found.lng], 13);
      draftMarker.setLatLng([found.lat, found.lng]);
      updateCoordinateInputs(found.lat, found.lng);
    }
  });

  // Geolocation GPS
  document.getElementById("btn-geolocate").addEventListener("click", () => {
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

  // Photo upload preview
  document.getElementById("photo").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      uploadedPhotoBase64 = ev.target.result;
      document.getElementById("photo-preview").src = uploadedPhotoBase64;
      document.getElementById("photo-preview-wrap").classList.remove("hidden");
      document.getElementById("photo-label").textContent = file.name;
    };
    reader.readAsDataURL(file);
  });

  document.getElementById("btn-remove-photo").addEventListener("click", () => {
    uploadedPhotoBase64 = "";
    document.getElementById("photo").value = "";
    document.getElementById("photo-preview-wrap").classList.add("hidden");
    document.getElementById("photo-label").textContent = "Pilih atau ambil foto kejadian (JPG/PNG)";
  });

  // Submit Report Form (Requires Login)
  document.getElementById("report-form").addEventListener("submit", async (e) => {
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

    const randomSuffix = Math.floor(100 + Math.random() * 900);
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

    // Reset form
    e.target.reset();
    document.getElementById("reporter").value = defaultName;
    uploadedPhotoBase64 = "";
    document.getElementById("photo-preview-wrap").classList.add("hidden");
    document.getElementById("photo-label").textContent = "Pilih atau ambil foto kejadian (JPG/PNG)";

    // Show modal
    document.getElementById("modal-ticket-code").textContent = ticketCode;
    const modal = document.getElementById("ticket-modal");
    modal.classList.remove("hidden");
    modal.classList.add("flex");
  });

  // Filters
  document.getElementById("search-reports").addEventListener("input", renderReports);
  document.getElementById("filter-kecamatan").addEventListener("change", renderReports);
  document.getElementById("filter-status").addEventListener("change", renderReports);

  // Track Ticket
  document.getElementById("track-form").addEventListener("submit", (e) => {
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
          <span class="font-mono font-extrabold text-rembang-700">${found.id}</span>
          <span class="text-xs font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(found.status)}">${found.status}</span>
        </div>
        <p class="font-bold text-slate-900">${escapeHtml(found.title)}</p>
        <p class="text-xs text-slate-600">Lokasi: Kec. ${escapeHtml(found.kecamatan)}, ${escapeHtml(found.desa)}</p>
        <p class="text-xs text-slate-600">Instansi Terkait: <span class="font-semibold text-slate-800">${escapeHtml(found.agency)}</span></p>
      </div>
    `;
  });

  // Modals
  document.getElementById("btn-close-modal").addEventListener("click", () => {
    const modal = document.getElementById("ticket-modal");
    modal.classList.add("hidden");
    modal.classList.remove("flex");
    document.getElementById("daftar-laporan").scrollIntoView({ behavior: "smooth" });
  });

  const sosModal = document.getElementById("sos-modal");
  document.getElementById("btn-quick-sos").addEventListener("click", () => {
    sosModal.classList.remove("hidden");
    sosModal.classList.add("flex");
  });
  document.getElementById("btn-close-sos").addEventListener("click", () => {
    sosModal.classList.add("hidden");
    sosModal.classList.remove("flex");
  });
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
  document.getElementById("peta-kejadian").scrollIntoView({ behavior: "smooth" });
  setTimeout(() => {
    map.setView([lat, lng], 15);
  }, 350);
};

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
