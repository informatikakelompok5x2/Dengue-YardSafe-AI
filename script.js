// ============================================================
    // DATA
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
            mengapaBerbahaya: "Wadah kosong yang dibiarkan terbuka di luar ruangan dapat terisi air hujan kapan saja. Yang sering tidak disadari, telur nyamuk Aedes aegypti bisa menempel di dinding bagian dalam wadah meski saat ini wadah terlihat kering, dan langsung menetas begitu air masuk kembali.",
            penanganan: "Tutup rapat wadah kosong atau simpan dalam posisi terbalik agar tidak menampung air hujan. Jika tidak digunakan, segera buang atau daur ulang untuk mengurangi potensi tempat berkembang biak nyamuk.",
        },
        selokan_berair: {
            indikator: { genangan: false, wadah: false }, warning: { got: true, clutter: false },
            deskripsi: "Selokan berair terdeteksi. Kondisi aliran tidak dapat diverifikasi.",
            mengapaBerbahaya: "Selokan yang tersumbat atau alirannya lambat dapat menjadi genangan air yang hangat dan kaya nutrisi (kondisi ideal bagi nyamuk). Meski selokan yang mengalir lancar relatif aman, kondisi alirannya tidak bisa diverifikasi hanya dari foto, sehingga tetap perlu diwaspadai.",
            penanganan: "Bersihkan selokan dari sampah dan lumpur agar air dapat mengalir lancar. Pastikan tidak ada sumbatan yang menyebabkan air menggenang. Lakukan pembersihan rutin minimal sebulan sekali.",
        },
        wadah_berair: {
            indikator: { genangan: true, wadah: true }, warning: { got: false, clutter: false },
            deskripsi: "Wadah berisi air terdeteksi sebagai breeding spot aktif.",
            mengapaBerbahaya: "Wadah yang berisi air bersih dan tenang adalah tempat favorit nyamuk Aedes aegypti bertelur. Nyamuk hanya butuh waktu 7–10 hari untuk menyelesaikan siklus hidupnya dari telur hingga nyamuk dewasa dalam wadah semacam ini. Semakin lama air didiamkan, semakin tinggi risikonya.",
            penanganan: "Buang air yang tergenang di wadah, lalu tutup rapat wadah tersebut. Jika wadah digunakan untuk menampung air bersih, kuras dan sikat bagian dalamnya minimal seminggu sekali untuk mencegah jentik nyamuk.",
        },
        genangan_air: {
            indikator: { genangan: true, wadah: false }, warning: { got: false, clutter: false },
            deskripsi: "Genangan air di permukaan keras terdeteksi.",
            mengapaBerbahaya: "Genangan air di permukaan keras seperti lantai, halaman, atau atap dapat menjadi tempat bertelur nyamuk meskipun dangkal. Nyamuk Aedes aegypti dapat bertelur di permukaan air yang sangat tipis sekalipun, dan telurnya mampu bertahan kering selama berbulan-bulan sebelum menetas saat tergenang kembali.",
            penanganan: "Keringkan genangan dengan kain atau alat pel. Periksa sumber air dan pastikan tidak ada kebocoran pipa atau rembesan. Jika terjadi setelah hujan, perbaiki kemiringan permukaan agar air dapat mengalir ke saluran pembuangan.",
        },
        tumpukan_sampah: {
            indikator: { genangan: false, wadah: false }, warning: { got: false, clutter: true },
            deskripsi: "Tumpukan sampah terdeteksi sebagai faktor risiko laten.",
            mengapaBerbahaya: "Tumpukan sampah sering menyembunyikan wadah-wadah kecil seperti kaleng, botol, atau plastik bekas yang bisa menampung air hujan tanpa terlihat. Lingkungan yang tidak terawat juga cenderung dibiarkan dalam waktu lama, memberi nyamuk cukup waktu untuk berkembang biak tanpa gangguan.",
            penanganan: "Bersihkan dan buang sampah ke tempat pembuangan yang sesuai. Periksa apakah ada wadah atau genangan air tersembunyi di balik tumpukan. Jaga kebersihan lingkungan agar tidak menjadi tempat berkembang biak nyamuk.",
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
        { min: 36,  max: 60,  label: "Risiko Sedang",  bgColor: "#ffedd5", borderColor: "#fdba74", textColor: "#9a3412", description: "Terdeteksi faktor risiko yang cukup signifikan. Segera lakukan tindakan pencegahan." },
        { min: 61,  max: 85,  label: "Risiko Tinggi",  bgColor: "#fee2e2", borderColor: "#fca5a5", textColor: "#991b1b", description: "Hampir semua faktor risiko terdeteksi. Segera bersihkan area ini." },
    ];
 
    // ============================================================
    // TEACHABLE MACHINE
    // ============================================================
    const MODEL_URL = "./model/";
    let tmModel    = null;
    let tmWebcam   = null;
    let loopActive = false;
    let isFrozen   = false;
 
    async function loadModel() {
        if (tmModel) return;
        try {
            tmModel = await tmImage.load(MODEL_URL + "model.json", MODEL_URL + "metadata.json");
        } catch (e) {
            console.error("Gagal memuat model:", e);
            alert("Model AI tidak ditemukan. Pastikan folder ./model/ sudah ada.");
        }
    }
 
    let currentFacingMode = 'environment'; // default kamera belakang
    let hasMultipleCameras = false;
 
    // Cek jumlah kamera saat halaman load
    async function checkCameras() {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const cams = devices.filter(d => d.kind === 'videoinput');
            hasMultipleCameras = cams.length > 1;
        } catch(e) { hasMultipleCameras = false; }
    }
    checkCameras();
 
    async function initWebcamGambar() {
        await loadModel();
        if (!tmModel) return;
 
        document.getElementById('gambar-upload-section').style.display = 'none';
        const container = document.getElementById('webcam-gambar-container');
        container.innerHTML = '';
        container.style.display = 'block';
 
        // Setup webcam TM dengan facingMode
        tmWebcam = new tmImage.Webcam(280, 280, false);
        await tmWebcam.setup({ facingMode: currentFacingMode });
        await tmWebcam.play();
        container.appendChild(tmWebcam.canvas);
 
        document.getElementById('btn-mulai-kamera').style.display  = 'none';
        document.getElementById('btn-tangkap-frame').style.display = 'inline-flex';
        document.getElementById('btn-reset-gambar').style.display  = 'inline-flex';
        document.getElementById('notif-cahaya').style.display      = 'block';
        // Tampilkan tombol ganti kamera hanya kalau ada lebih dari 1 kamera
        if (hasMultipleCameras) {
            document.getElementById('btn-ganti-kamera').style.display = 'inline-flex';
        }
 
        isFrozen = false;
        loopActive = true;
        loopWebcam();
    }
 
    async function gantiKamera() {
        if (!tmWebcam) return;
        // Stop loop & webcam lama
        loopActive = false;
        isFrozen = false;
        tmWebcam.stop();
 
        // Toggle facing mode
        currentFacingMode = currentFacingMode === 'environment' ? 'user' : 'environment';
 
        const container = document.getElementById('webcam-gambar-container');
        container.innerHTML = '';
 
        // Restart dengan facing mode baru
        tmWebcam = new tmImage.Webcam(280, 280, false);
        await tmWebcam.setup({ facingMode: currentFacingMode });
        await tmWebcam.play();
        container.appendChild(tmWebcam.canvas);
 
        // Reset tangkap frame state
        const btnTangkap = document.getElementById('btn-tangkap-frame');
        btnTangkap.textContent = '📸 Tangkap Frame';
        btnTangkap.disabled = false;
 
        loopActive = true;
        loopWebcam();
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
 
        // Objek Terdeteksi
        document.getElementById('prediksi-objek').innerHTML = mapping
            ? `<strong>${mapping.deskripsi}</strong>`
            : `<span>${className}</span>`;
 
        // Confidence
        const pct = Math.round(confidence * 100);
        document.getElementById('confidence-bar-gambar').style.width = pct + '%';
        document.getElementById('confidence-pct-gambar').textContent = pct + '%';
 
        if (!mapping) return;
 
        // Hitung skor — indikator + warning weight
        let skor = 0;
        Object.keys(indicators).forEach(k => {
            if (mapping.indikator[k]) skor += indicators[k].weight;
        });
        Object.keys(warnings).forEach(k => {
            if (mapping.warning[k]) skor += warnings[k].weight;
        });
 
        // Faktor Potensi
        const faktorBlock = document.getElementById('label-faktorpotensi');
        const faktorList  = document.getElementById('faktor-potensi-list');
        const aktifFaktor = Object.keys(indicators).filter(k => mapping.indikator[k]);
        faktorList.innerHTML = '';
        if (aktifFaktor.length > 0) {
            faktorBlock.style.display = 'flex';
            aktifFaktor.forEach(k => {
                const ind  = indicators[k];
                const card = document.createElement('div');
                card.className = 'cp-result-card faktor-card';
                card.innerHTML = `<strong>✔ ${ind.label}</strong>
                    <ul class="subfactor-list">
                        ${ind.subFactors.map(sf => `<li>${sf.label}</li>`).join('')}
                    </ul>`;
                faktorList.appendChild(card);
            });
        } else {
            faktorBlock.style.display = 'none';
        }
 
        // Warning
        const warningBlock = document.getElementById('label-warning');
        const warningList  = document.getElementById('warning-list');
        const aktifWarning = Object.keys(warnings).filter(k => mapping.warning[k]);
        warningList.innerHTML = '';
        if (aktifWarning.length > 0) {
            warningBlock.style.display = 'flex';
            aktifWarning.forEach(k => {
                const w    = warnings[k];
                const card = document.createElement('div');
                card.className = 'cp-result-card warning-card';
                card.innerHTML = `<strong>${w.icon} ${w.label}</strong>
                    <p class="warning-msg">${w.message}</p>`;
                warningList.appendChild(card);
            });
        } else {
            warningBlock.style.display = 'none';
        }
 
        // Skor bar
        document.getElementById('riskscorebarresult').style.width  = skor + '%';
        document.getElementById('persentaseriskscore').textContent = skor + '%';
 
        // Kategori
        const kategori     = riskCategories.find(c => skor >= c.min && skor <= c.max) || riskCategories[riskCategories.length - 1];
        const kategoriCard = document.getElementById('kategori-card');
        kategoriCard.style.background  = kategori.bgColor;
        kategoriCard.style.borderColor = kategori.borderColor;
        kategoriCard.style.borderStyle = 'solid';
        const katEl = document.getElementById('prediksi-kategori');
        katEl.style.color   = kategori.textColor;
        katEl.textContent   = kategori.label;
        const katDesc = document.getElementById('prediksi-kategori-desc');
        katDesc.style.color = kategori.textColor;
        katDesc.textContent = kategori.description;
 
        // Info: Mengapa Berbahaya + Penanganan — dinamis per class
        const infoWrap = document.getElementById('info-ringkas-gambar');
        if (mapping.penanganan === null) {
            // tidak_berpotensi → banner aman, sembunyikan accordion
            infoWrap.innerHTML = `
                <div class="info-ringkas-header">
                    <span class="info-ringkas-icon">💡</span>
                    <span class="info-ringkas-title">Informasi & Penanganan</span>
                </div>
                <div class="banner-aman">
                    ✅ Area ini terdeteksi aman. Pertahankan kebersihan lingkungan!
                </div>`;
        } else {
            infoWrap.innerHTML = `
                <div class="info-ringkas-header">
                    <span class="info-ringkas-icon">💡</span>
                    <span class="info-ringkas-title">Informasi & Penanganan</span>
                </div>
                <div class="info-accordion-item">
                    <button class="info-acc-trigger" type="button" onclick="toggleInfoAcc(this)">
                        ⚠️ Mengapa Berbahaya? <span class="acc-icon">+</span>
                    </button>
                    <div class="info-acc-body">
                        <div class="info-acc-inner">
                            <p>${mapping.mengapaBerbahaya}</p>
                        </div>
                    </div>
                </div>
                <div class="info-accordion-item">
                    <button class="info-acc-trigger" type="button" onclick="toggleInfoAcc(this)">
                        🧹 Cara Penanganan <span class="acc-icon">+</span>
                    </button>
                    <div class="info-acc-body">
                        <div class="info-acc-inner">
                            <p>${mapping.penanganan}</p>
                        </div>
                    </div>
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
        document.getElementById('upload-label-text').textContent         = 'Klik di sini untuk memilih gambar';
        document.getElementById('upload-input-gambar').value             = '';
 
        document.getElementById('btn-mulai-kamera').style.display   = 'inline-flex';
        const btnTangkap = document.getElementById('btn-tangkap-frame');
        btnTangkap.style.display = 'none';
        btnTangkap.textContent   = '📸 Tangkap Frame';
        btnTangkap.disabled      = false;
        document.getElementById('btn-reset-gambar').style.display   = 'none';
        document.getElementById('btn-ganti-kamera').style.display   = 'none';
        document.getElementById('notif-cahaya').style.display       = 'none';
 
        document.getElementById('prediksi-objek').innerHTML              = '<span class="result-placeholder">— Belum dianalisis —</span>';
        document.getElementById('confidence-bar-gambar').style.width     = '0%';
        document.getElementById('confidence-pct-gambar').textContent     = '—';
        document.getElementById('label-faktorpotensi').style.display     = 'none';
        document.getElementById('label-warning').style.display           = 'none';
        document.getElementById('riskscorebarresult').style.width        = '0%';
        document.getElementById('persentaseriskscore').textContent       = '—';
        document.getElementById('prediksi-kategori').textContent         = '—';
        document.getElementById('prediksi-kategori-desc').textContent    = '';
        const kCard = document.getElementById('kategori-card');
        kCard.style.background  = '';
        kCard.style.borderColor = '';
        kCard.style.borderStyle = '';
 
        // Reset info ringkas ke default placeholder
        document.getElementById('info-ringkas-gambar').innerHTML = `
            <div class="info-ringkas-header">
                <span class="info-ringkas-icon">💡</span>
                <span class="info-ringkas-title">Informasi & Penanganan</span>
            </div>
            <div class="info-placeholder-msg">
                Unggah gambar atau gunakan kamera untuk melihat informasi penanganan.
            </div>`;
    }
 
    // ============================================================
    // NAV & SCROLL
    // ============================================================
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
            e.preventDefault();
            const t = document.querySelector(a.getAttribute('href'));
            if (t) t.scrollIntoView({ behavior: 'smooth' });
        });
    });
    window.addEventListener('scroll', () => {
        document.getElementById('navbar').classList.toggle('nav-scrolled', window.scrollY > 10);
    });
 
    // ============================================================
    // ACCORDION
    // ============================================================
    function toggleAccordion(btn) {
        const body   = btn.nextElementSibling;
        const isOpen = body.classList.contains('open');
        btn.classList.toggle('open', !isOpen);
        body.classList.toggle('open', !isOpen);
    }
    function toggleInfoAcc(btn) {
        const body   = btn.nextElementSibling;
        const isOpen = body.classList.contains('open');
        btn.classList.toggle('open', !isOpen);
        body.classList.toggle('open', !isOpen);
    }
 
