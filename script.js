// ============================================================
// DATA (Tetap sama seperti sebelumnya)
// ============================================================
const indicators = {
    wadah: {
        label: "Wadah Penampung", weight: 35,
        subFactors: [
            { label: "Terdeteksi objek berbentuk wadah" },
            { label: "Berpotensi menampung air hujan atau air tergenang" },
            { label: "Tidak memiliki drainase atau penutup" },
        ],
    },
    genangan: {
        label: "Air Tergenang", weight: 50,
        subFactors: [
            { label: "Air tidak mengalir / statis" },
            { label: "Permukaan air terbuka dan terekspos" },
            { label: "Berpotensi menjadi habitat jentik nyamuk" },
        ],
    },
};

const warnings = {
    got: {
        label: "Selokan / Got", icon: "🚰", weight: 10,
        message: "Terdeteksi selokan. Pastikan saluran air tidak tersumbat dan air dapat mengalir dengan lancar.",
    },
    clutter: {
        label: "Tumpukan Sampah / Barang Bekas", icon: "🗑️", weight: 10,
        message: "Terdeteksi tumpukan sampah. Lingkungan tidak terawat berpotensi menyembunyikan wadah penampung air.",
    },
};

const classMapping = {
    wadah_kosong: {
        indikator: { genangan: false, wadah: true }, warning: { got: false, clutter: false },
        deskripsi: "Wadah kosong terdeteksi. Berpotensi menampung air hujan.",
        mengapaBerbahaya: "Wadah kosong yang dibiarkan terbuka di luar ruangan dapat terisi air hujan kapan saja. Telur nyamuk Aedes aegypti bisa menempel di dinding wadah meski kering, dan menetas saat terisi air.",
        penanganan: "Tutup rapat wadah atau simpan terbalik. Jika tidak digunakan, segera buang atau daur ulang.",
    },
    selokan_berair: {
        indikator: { genangan: false, wadah: false }, warning: { got: true, clutter: false },
        deskripsi: "Selokan berair terdeteksi.",
        mengapaBerbahaya: "Selokan tersumbat adalah habitat ideal nyamuk. Kondisi aliran sulit diverifikasi hanya dari foto, sehingga tetap perlu diwaspadai.",
        penanganan: "Bersihkan selokan dari sampah dan lumpur agar air mengalir lancar. Lakukan rutin minimal sebulan sekali.",
    },
    wadah_berair: {
        indikator: { genangan: true, wadah: true }, warning: { got: false, clutter: false },
        deskripsi: "Wadah berisi air terdeteksi sebagai breeding spot aktif.",
        mengapaBerbahaya: "Wadah berisi air jernih dan tenang adalah tempat favorit Aedes aegypti. Nyamuk hanya butuh 7–10 hari untuk menetas menjadi dewasa.",
        penanganan: "Buang air tergenang. Jika wadah digunakan untuk air bersih, kuras dan sikat dindingnya minimal seminggu sekali.",
    },
    genangan_air: {
        indikator: { genangan: true, wadah: false }, warning: { got: false, clutter: false },
        deskripsi: "Genangan air di permukaan keras terdeteksi.",
        mengapaBerbahaya: "Genangan di lantai atau atap tetap bisa jadi tempat bertelur. Telur nyamuk mampu bertahan kering berbulan-bulan sebelum menetas saat tergenang lagi.",
        penanganan: "Keringkan genangan. Perbaiki kemiringan permukaan agar air mengalir ke saluran pembuangan.",
    },
    tumpukan_sampah: {
        indikator: { genangan: false, wadah: false }, warning: { got: false, clutter: true },
        deskripsi: "Tumpukan sampah terdeteksi sebagai faktor risiko laten.",
        mengapaBerbahaya: "Sampah sering menyembunyikan wadah kecil (kaleng/botol) yang tidak terlihat namun menampung air hujan.",
        penanganan: "Bersihkan dan buang sampah ke tempatnya. Pastikan tidak ada wadah tersembunyi di balik tumpukan.",
    },
    tidak_berpotensi: {
        indikator: { genangan: false, wadah: false }, warning: { got: false, clutter: false },
        deskripsi: "Tidak terdeteksi faktor risiko pada gambar ini.",
        mengapaBerbahaya: null,
        penanganan: null,
    },
};

const riskCategories = [
    { min: 0,   max: 0,   label: "Aman",          bgColor: "#dcfce7", borderColor: "#86efac", textColor: "#166534", description: "Tidak terdeteksi faktor risiko berkembang biaknya nyamuk DBD." },
    { min: 1,   max: 35,  label: "Risiko Rendah",  bgColor: "#fef9c3", borderColor: "#fde047", textColor: "#854d0e", description: "Terdeteksi sebagian kecil faktor risiko. Tetap perlu diwaspadai." },
    { min: 36,  max: 60,  label: "Risiko Sedang",  bgColor: "#ffedd5", borderColor: "#fdba74", textColor: "#9a3412", description: "Terdeteksi faktor risiko signifikan. Segera lakukan pencegahan." },
    { min: 61,  max: 100, label: "Risiko Tinggi",  bgColor: "#fee2e2", borderColor: "#fca5a5", textColor: "#991b1b", description: "Hampir semua faktor risiko terdeteksi. Segera bersihkan area ini." },
];

// ============================================================
// CORE LOGIC & CAMERA
// ============================================================
const MODEL_URL = "./model/";
let tmModel    = null;
let tmWebcam   = null;
let loopActive = false;
let isFrozen   = false;
let currentFacingMode = 'environment'; 

async function loadModel() {
    if (tmModel) return;
    try {
        tmModel = await tmImage.load(MODEL_URL + "model.json", MODEL_URL + "metadata.json");
    } catch (e) {
        console.error("Gagal memuat model:", e);
        alert("Model AI tidak ditemukan.");
    }
}

/**
 * FUNGSI BARU: Mendeteksi kamera secara robust setelah permission diberikan.
 */
async function updateCameraVisibility() {
    try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter(device => device.kind === 'videoinput');
        
        const btnGanti = document.getElementById('btn-ganti-kamera');
        
        // Tampilkan tombol ganti kamera hanya jika ada lebih dari 1 kamera
        if (videoInputs.length > 1) {
            btnGanti.style.display = 'inline-flex';
        } else {
            btnGanti.style.display = 'none';
        }
    } catch (e) {
        console.error("Gagal mendeteksi jumlah perangkat:", e);
    }
}

async function initWebcamGambar() {
    await loadModel();
    if (!tmModel) return;

    document.getElementById('gambar-upload-section').style.display = 'none';
    const container = document.getElementById('webcam-gambar-container');
    container.innerHTML = '';
    container.style.display = 'block';

    try {
        // Setup webcam
        tmWebcam = new tmImage.Webcam(280, 280, false);
        await tmWebcam.setup({ facingMode: currentFacingMode }); // Meminta permission di sini
        await tmWebcam.play();
        container.appendChild(tmWebcam.canvas);

        // UI Updates
        document.getElementById('btn-mulai-kamera').style.display  = 'none';
        document.getElementById('btn-tangkap-frame').style.display = 'inline-flex';
        document.getElementById('btn-reset-gambar').style.display  = 'inline-flex';
        document.getElementById('notif-cahaya').style.display      = 'block';

        // CEK KAMERA SEKARANG (setelah izin didapat dari .setup)
        await updateCameraVisibility();

        isFrozen = false;
        loopActive = true;
        loopWebcam();
    } catch (err) {
        console.error("Gagal akses kamera:", err);
        alert("Gagal mengakses kamera. Pastikan izin kamera diberikan.");
        resetGambar();
    }
}

async function gantiKamera() {
    if (!tmWebcam) return;
    
    // Matikan stream lama
    loopActive = false;
    isFrozen = false;
    tmWebcam.stop();

    // Toggle mode
    currentFacingMode = (currentFacingMode === 'environment') ? 'user' : 'environment';

    const container = document.getElementById('webcam-gambar-container');
    container.innerHTML = 'Memuat kamera...';

    // Restart dengan mode baru
    try {
        tmWebcam = new tmImage.Webcam(280, 280, false);
        await tmWebcam.setup({ facingMode: currentFacingMode });
        await tmWebcam.play();
        
        container.innerHTML = '';
        container.appendChild(tmWebcam.canvas);

        const btnTangkap = document.getElementById('btn-tangkap-frame');
        btnTangkap.textContent = '📸 Tangkap Frame';
        btnTangkap.disabled = false;

        loopActive = true;
        loopWebcam();
    } catch (e) {
        console.error("Ganti kamera gagal:", e);
    }
}

async function loopWebcam() {
    if (!loopActive) return;
    if (!isFrozen) {
        tmWebcam.update();
        await predictFromCanvas(tmWebcam.canvas);
    }
    window.requestAnimationFrame(loopWebcam);
}

async function tangkapFrame() {
    if (!tmWebcam || isFrozen) return;
    isFrozen = true;
    tmWebcam.pause();
    await predictFromCanvas(tmWebcam.canvas);
    const btn = document.getElementById('btn-tangkap-frame');
    btn.textContent = '✅ Frame Tertangkap';
    btn.disabled = true;
}

// ============================================================
// PREDICTION & UI RENDERING (Tetap sama)
// ============================================================
async function predictFromCanvas(canvasOrImg) {
    if (!tmModel) return;
    const prediction = await tmModel.predict(canvasOrImg);
    const best = prediction.reduce((a, b) => a.probability > b.probability ? a : b);
    renderHasil(best.className, best.probability);
}

document.getElementById('upload-input-gambar').addEventListener('change', async function(e) {
    const file = e.target.files[0];
    if (!file) return;
    await loadModel();
    if (!tmModel) return;

    const previewWrap = document.getElementById('upload-preview-wrap');
    const previewImg  = document.getElementById('upload-preview-img');
    const reader = new FileReader();
    reader.onload = function(ev) {
        previewImg.src = ev.target.result;
        previewWrap.style.display = 'block';
        document.getElementById('upload-label-text').textContent = file.name;
        previewImg.onload = async function() {
            await predictFromCanvas(previewImg);
        };
    };
    reader.readAsDataURL(file);
});

function renderHasil(className, confidence) {
    const key     = className.toLowerCase().replace(/\s+/g, '_');
    const mapping = classMapping[key];

    document.getElementById('prediksi-objek').innerHTML = mapping
        ? `<strong>${mapping.deskripsi}</strong>`
        : `<span>${className}</span>`;

    const pct = Math.round(confidence * 100);
    document.getElementById('confidence-bar-gambar').style.width = pct + '%';
    document.getElementById('confidence-pct-gambar').textContent = pct + '%';

    if (!mapping) return;

    let skor = 0;
    Object.keys(indicators).forEach(k => {
        if (mapping.indikator[k]) skor += indicators[k].weight;
    });
    Object.keys(warnings).forEach(k => {
        if (mapping.warning[k]) skor += warnings[k].weight;
    });

    // Render Faktor Potensi & Warning (Disederhanakan untuk efisiensi)
    const faktorBlock = document.getElementById('label-faktorpotensi');
    const faktorList  = document.getElementById('faktor-potensi-list');
    const aktifFaktor = Object.keys(indicators).filter(k => mapping.indikator[k]);
    faktorList.innerHTML = '';
    if (aktifFaktor.length > 0) {
        faktorBlock.style.display = 'flex';
        aktifFaktor.forEach(k => {
            const ind = indicators[k];
            const card = document.createElement('div');
            card.className = 'cp-result-card faktor-card';
            card.innerHTML = `<strong>✔ ${ind.label}</strong><ul class="subfactor-list">${ind.subFactors.map(sf => `<li>${sf.label}</li>`).join('')}</ul>`;
            faktorList.appendChild(card);
        });
    } else { faktorBlock.style.display = 'none'; }

    const warningBlock = document.getElementById('label-warning');
    const warningList  = document.getElementById('warning-list');
    const aktifWarning = Object.keys(warnings).filter(k => mapping.warning[k]);
    warningList.innerHTML = '';
    if (aktifWarning.length > 0) {
        warningBlock.style.display = 'flex';
        aktifWarning.forEach(k => {
            const w = warnings[k];
            const card = document.createElement('div');
            card.className = 'cp-result-card warning-card';
            card.innerHTML = `<strong>${w.icon} ${w.label}</strong><p class="warning-msg">${w.message}</p>`;
            warningList.appendChild(card);
        });
    } else { warningBlock.style.display = 'none'; }

    // Risk Score
    document.getElementById('riskscorebarresult').style.width  = skor + '%';
    document.getElementById('persentaseriskscore').textContent = skor + '%';

    const kategori = riskCategories.find(c => skor >= c.min && skor <= c.max) || riskCategories[0];
    const kategoriCard = document.getElementById('kategori-card');
    kategoriCard.style.background  = kategori.bgColor;
    kategoriCard.style.borderColor = kategori.borderColor;
    kategoriCard.style.borderStyle = 'solid';
    
    const katEl = document.getElementById('prediksi-kategori');
    katEl.style.color = kategori.textColor;
    katEl.textContent = kategori.label;

    const katDesc = document.getElementById('prediksi-kategori-desc');
    katDesc.style.color = kategori.textColor;
    katDesc.textContent = kategori.description;

    // Info Ringkas
    const infoWrap = document.getElementById('info-ringkas-gambar');
    if (mapping.penanganan === null) {
        infoWrap.innerHTML = `<div class="info-ringkas-header">...</div><div class="banner-aman">✅ Area ini aman!</div>`;
    } else {
        infoWrap.innerHTML = `
            <div class="info-ringkas-header">
                <span class="info-ringkas-icon">💡</span>
                <span class="info-ringkas-title">Informasi & Penanganan</span> 
            </div>
            <div class="info-accordion-item">
                <button class="info-acc-trigger" onclick="toggleInfoAcc(this)">⚠️ Mengapa Berbahaya? <span class="acc-icon">+</span></button>
                <div class="info-acc-body"><div class="info-acc-inner"><p>${mapping.mengapaBerbahaya}</p></div></div>
            </div>
            <div class="info-accordion-item">
                <button class="info-acc-trigger" onclick="toggleInfoAcc(this)">🧹 Cara Penanganan <span class="acc-icon">+</span></button>
                <div class="info-acc-body"><div class="info-acc-inner"><p>${mapping.penanganan}</p></div></div>
            </div>`;
    }
}

function resetGambar() {
    loopActive = false;
    isFrozen   = false;
    if (tmWebcam) { tmWebcam.stop(); tmWebcam = null; }
    currentFacingMode = 'environment';

    const container = document.getElementById('webcam-gambar-container');
    container.innerHTML = '';
    container.style.display = 'none';

    document.getElementById('gambar-upload-section').style.display  = 'block';
    document.getElementById('upload-preview-wrap').style.display     = 'none';
    document.getElementById('btn-mulai-kamera').style.display   = 'inline-flex';
    document.getElementById('btn-tangkap-frame').style.display = 'none';
    document.getElementById('btn-reset-gambar').style.display   = 'none';
    document.getElementById('btn-ganti-kamera').style.display   = 'none';
    document.getElementById('notif-cahaya').style.display       = 'none';
    
    // Reset output text
    document.getElementById('prediksi-objek').innerHTML = '<span class="result-placeholder">— Belum dianalisis —</span>';
    document.getElementById('confidence-bar-gambar').style.width = '0%';
    document.getElementById('riskscorebarresult').style.width = '0%';
}

// Global toggle functions
window.toggleInfoAcc = function(btn) {
    const body = btn.nextElementSibling;
    const isOpen = body.classList.contains('open');
    btn.classList.toggle('open', !isOpen);
    body.classList.toggle('open', !isOpen);
}

function toggleAccordion(btn) {
    // Cari elemen body yang ada tepat setelah tombol
    const body = btn.nextElementSibling;
    const icon = btn.querySelector('.acc-icon');
    
    // Cek apakah sekarang lagi terbuka atau tertutup
    const isOpen = body.classList.contains('open');

    // Toggle class 'open' (ini nanti yang diatur animasinya di CSS)
    if (!isOpen) {
        body.classList.add('open');
        btn.classList.add('active');
        if (icon) icon.textContent = '−'; // Ganti jadi tanda minus
    } else {
        body.classList.remove('open');
        btn.classList.remove('active');
        if (icon) icon.textContent = '+'; // Ganti jadi tanda plus
    }
}
