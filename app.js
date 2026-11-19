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

const STORAGE_KEY = "lapor_rembang_reports_v1";
const UPVOTED_KEY = "lapor_rembang_upvoted_v1";

// Data awal realistis wilayah Kabupaten Rembang
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
    status: "Sedang Ditangani",
    agency: "BPBD Kab. Rembang & DPUPR",
    createdAt: "2 jam lalu",
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
    status: "Menunggu Verifikasi",
    agency: "PPK Bina Marga Pantura / Dinhub",
    createdAt: "4 jam lalu",
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
    status: "Sedang Ditangani",
    agency: "Dinas Perhubungan Kab. Rembang",
    createdAt: "1 hari lalu",
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
    status: "Selesai",
    agency: "DLH Kabupaten Rembang",
    createdAt: "2 hari lalu",
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
    status: "Menunggu Verifikasi",
    agency: "BPBD & DLH Kab. Rembang",
    createdAt: "5 jam lalu",
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
    status: "Sedang Ditangani",
    agency: "Satlantas Polres Rembang & Dinhub",
    createdAt: "6 jam lalu",
    upvotes: 22,
    photo: ""
  }
];

let reports = [];
let upvotedIds = [];
let map;
let markersLayer;
let draftMarker;
let uploadedPhotoBase64 = "";

// Initialize App
document.addEventListener("DOMContentLoaded", () => {
  loadState();
  populateKecamatanDropdowns();
  initMap();
  renderStats();
  renderReports();
  bindEvents();
});

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  reports = saved ? JSON.parse(saved) : [...INITIAL_REPORTS];
  if (!saved) {
    saveReports();
  }
  const savedUpvotes = localStorage.getItem(UPVOTED_KEY);
  upvotedIds = savedUpvotes ? JSON.parse(savedUpvotes) : [];
}

function saveReports() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
}

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
  // Center at Kabupaten Rembang
  map = L.map("rembang-map").setView([-6.735, 111.46], 11);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: '&copy; OpenStreetMap contributors'
  }).addTo(map);

  markersLayer = L.layerGroup().addTo(map);

  // Draft pin untuk lokasi laporan baru
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
  if (report.status === "Selesai") return "#10b981"; // emerald
  if (report.urgency === "Darurat" || report.urgency === "Tinggi") return "#f43f5e"; // rose
  return "#f59e0b"; // amber
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
    const matchKec = kecFilter === "ALL" || rep.kecamatan === kecFilter;
    const matchStatus = statusFilter === "ALL" || rep.status === statusFilter;
    const matchText =
      !keyword ||
      rep.title.toLowerCase().includes(keyword) ||
      rep.desa.toLowerCase().includes(keyword) ||
      rep.id.toLowerCase().includes(keyword) ||
      rep.category.toLowerCase().includes(keyword);
    return matchKec && matchStatus && matchText;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="col-span-full bg-white rounded-2xl border border-slate-200 p-10 text-center">
        <p class="text-sm font-bold text-slate-700">Tidak ada laporan yang sesuai filter.</p>
        <p class="text-xs text-slate-500 mt-1">Coba ubah pilihan kecamatan atau kata kunci pencarian.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered
    .map((rep) => {
      const isUpvoted = upvotedIds.includes(rep.id);
      return `
      <article class="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition flex flex-col justify-between overflow-hidden">
        ${
          rep.photo
            ? `<img src="${rep.photo}" alt="Bukti kejadian" class="w-full h-40 object-cover border-b border-slate-100" />`
            : ""
        }
        <div class="p-5 space-y-3 flex-1">
          <div class="flex items-center justify-between gap-2">
            <span class="font-mono text-[11px] font-bold text-rembang-700 bg-rembang-50 px-2.5 py-0.5 rounded-md border border-rembang-100">
              ${rep.id}
            </span>
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

function bindEvents() {
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

  // Submit Report Form
  document.getElementById("report-form").addEventListener("submit", (e) => {
    e.preventDefault();

    const isAnon = document.getElementById("anonymous").checked;
    const rawName = document.getElementById("reporter").value.trim();
    const reporterName = isAnon || !rawName ? "Warga Anonim" : rawName;
    const category = document.getElementById("category").value;

    const nextNum = 101 + reports.length;
    const ticketCode = `RBG-2026-${nextNum}`;

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
      reporter: reporterName,
      status: "Menunggu Verifikasi",
      agency: mapCategoryToAgency(category),
      createdAt: "Baru saja",
      upvotes: 1,
      photo: uploadedPhotoBase64
    };

    reports.unshift(newReport);
    saveReports();
    renderStats();
    renderReports();
    renderMapMarkers();

    // Reset form
    e.target.reset();
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

window.toggleUpvote = function (id) {
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
  saveReports();
  renderReports();
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
