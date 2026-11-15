import type { ManualBookItem } from "@/types";

export const defaultManualBooks: ManualBookItem[] = [
    {
        id: "SOP-NAT-FIRE-01",
        title: "Penanganan Kebakaran Area Kritis & Tangki Bahan Bakar",
        hazardType: "Fire / Kebakaran",
        category: "natural_hazard",
        severity: "critical",
        summary: "Prosedur darurat tingkat 1 saat terjadi kobaran api aktif pada area berisiko tinggi seperti Tank Farm atau Utilitas.",
        steps: [
            {
                phase: "Tahap 1: Respon Cepat & Triase",
                title: "Aktivasi Alarm dan Isolasi Sirkuit",
                instructions: [
                    "Aktifkan tombol Fire Alarm Manual Call Point terdekat segera.",
                    "Perintahkan pemutusan darurat (Emergency Shutdown System / ESD) pipa aliran bahan bakar ke tangki.",
                    "Bunyikan sirine evakuasi pabrik dan umumkan melalui public address system.",
                ],
            },
            {
                phase: "Tahap 2: Pemadaman & Penahanan",
                title: "Penggelaran Tim Fire Brigade & Foam System",
                instructions: [
                    "Kerahkan tim Fire Brigade internal berpakaian pemadam tahan panas lengkap.",
                    "Aktifkan sistem deluge water spray dan injeksi foam proteksi tangki pendingin.",
                    "Hubungi dinas pemadam kebakaran setempat dan sediakan titik temu (rendezvous point).",
                ],
            },
            {
                phase: "Tahap 3: Pemulihan & Pasca Insiden",
                title: "Pendinginan, Gas Testing, dan Investigasi",
                instructions: [
                    "Lakukan pemantauan suhu inframerah hingga suhu permukaan tangki kembali di bawah 40°C.",
                    "Uji kadar gas berbahaya (LEL & VOC) sebelum mengizinkan personil masuk.",
                    "Susun laporan evaluasi insiden untuk komite HSE dalam kurun 24 jam.",
                ],
            },
        ],
        equipment: ["Pakaian Tahan Panas & SCBA", "Foam Extinguisher & Fire Hose Reel", "Detektor Multi-Gas", "Megaphone"],
        responsibleRoles: ["Incident Commander", "Chief Fire Warden", "HSE Lead", "Medical Responder"],
        estimatedResolutionTime: "30 - 60 Menit",
        lastUpdated: "2026-11-10",
    },
    {
        id: "SOP-NAT-FIRE-02",
        title: "Penanganan Asap & Percikan Api Ringan di Ruang Panel / Utilitas",
        hazardType: "Fire / Kebakaran",
        category: "natural_hazard",
        severity: "minor",
        summary: "Panduan pemadaman awal pada percikan api listrik skala kecil tanpa korban jiwa.",
        steps: [
            {
                phase: "Tahap 1: Respon Awal",
                title: "Identifikasi & Isolasi Arus",
                instructions: [
                    "Matikan Main Circuit Breaker (MCB) panel listrik yang mengeluarkan percikan api.",
                    "Pastikan area sekitar tidak terdapat bahan mudah terbakar.",
                ],
            },
            {
                phase: "Tahap 2: Pemadaman",
                title: "Gunakan APAR CO2 / Clean Agent",
                instructions: [
                    "Gunakan APAR jenis CO2 atau Clean Agent (hindari menggunakan media air).",
                    "Arahkan nozzle ke pangkal api dengan jarak aman 1.5 - 2 meter.",
                ],
            },
            {
                phase: "Tahap 3: Verifikasi",
                title: "Inspeksi Kelistrikan",
                instructions: [
                    "Panggil teknisi elektrik untuk verifikasi kabel putus atau overheat.",
                    "Dokumentasikan komponen yang terbakar dan pasang label out of service.",
                ],
            },
        ],
        equipment: ["APAR CO2 5kg", "Sarung Tangan Insulasi 1000V", "Thermal Camera Saku"],
        responsibleRoles: ["Area Supervisor", "Duty Electrician", "Floor Safety Officer"],
        estimatedResolutionTime: "10 - 20 Menit",
        lastUpdated: "2026-11-08",
    },
    {
        id: "SOP-MAN-PROT-01",
        title: "Penanganan Demonstrasi Massa & Blokade Gerbang Utama",
        hazardType: "Protester / Demonstrasi",
        category: "man_made",
        severity: "major",
        summary: "Protokol keamanan pengamanan perimeter saat kerumunan massa berkumpul atau mencoba memblokir akses pabrik.",
        steps: [
            {
                phase: "Tahap 1: Pengamanan Perimeter",
                title: "Penguncian Gerbang & Penjagaan Pos",
                instructions: [
                    "Kunci seluruh gerbang utama dan aktifkan perimeter barrier drop-arm.",
                    "Alihkan alur keluar masuk kendaraan logistik ke Gerbang Darurat Samping.",
                    "Posisikan tim satpam di balik barikade dengan perlengkapan anti huru-hara siap pakai.",
                ],
            },
            {
                phase: "Tahap 2: De-eskalasi & Koordinasi",
                title: "Negosiasi dan Komunikasi Aparat",
                instructions: [
                    "Hubungi Polsek dan Koramil setempat untuk bantuan pengamanan ring luar.",
                    "Chief Security dan Hubungan Industrial menemui perwakilan koordinator aksi secara tertib.",
                    "Dokumentasikan seluruh aktivitas melalui kamera CCTV zoom dan body-cam petugas.",
                ],
            },
            {
                phase: "Tahap 3: Normalisasi",
                title: "Pembersihan Akses & Pembukaan Jalur",
                instructions: [
                    "Setelah massa membubarkan diri, lakukan pembersihan spanduk atau serpihan.",
                    "Lakukan pemeriksaan pagar keliling apakah ada kerusakan struktural.",
                    "Buka kembali operasional normal setelah konfirmasi aman dari pihak kepolisian.",
                ],
            },
        ],
        equipment: ["Rompi Taktis & Helm Keamanan", "Barikade Crowd Control", "Handy Talky Frekuensi Darurat", "CCTV Recorder"],
        responsibleRoles: ["Head of Security", "Industrial Relations Manager", "Plant General Manager"],
        estimatedResolutionTime: "1 - 3 Jam",
        lastUpdated: "2026-11-12",
    },
    {
        id: "SOP-MAN-PROP-01",
        title: "Penanganan Kerusakan Fasilitas & Vandalisme Properti Pabrik",
        hazardType: "Damage Property / Vandalisme",
        category: "man_made",
        severity: "moderate",
        summary: "Langkah penanganan kerusakan fisik pada pagar, pos jaga, atau fasilitas pendukung operasional.",
        steps: [
            {
                phase: "Tahap 1: Pengamanan TKP",
                title: "Sterilisasi dan Pembatasan Area",
                instructions: [
                    "Pasang garis barikade/safety cone di sekitar lokasi kerusakan properti.",
                    "Pastikan tidak ada benda berbahaya seperti pecahan kaca atau logam tajam yang terserak.",
                ],
            },
            {
                phase: "Tahap 2: Inventarisasi Bukti",
                title: "Pengambilan Rekaman & Pencatatan",
                instructions: [
                    "Ambil foto detail kerusakan dan tarik rekaman CCTV 1 jam sebelum kejadian.",
                    "Wawancarai saksi mata atau personil yang bertugas saat insiden terjadi.",
                ],
            },
            {
                phase: "Tahap 3: Perbaikan Cepat",
                title: "Pemulihan Fisik",
                instructions: [
                    "Hubungi tim maintenance untuk penambalan darurat atau pengelasan struktur.",
                    "Input estimasi kerugian ke sistem inventory fasilitas.",
                ],
            },
        ],
        equipment: ["Safety Barricade Tape", "Camera / Dokumentasi Digital", "First Aid Kit (jika luka gores)"],
        responsibleRoles: ["Security Duty Officer", "Facility Maintenance Lead"],
        estimatedResolutionTime: "45 Menit - 2 Jam",
        lastUpdated: "2026-11-05",
    },
    {
        id: "SOP-NAT-FLOOD-01",
        title: "Penanganan Luapan Banjir & Genangan Air Area Gudang / Logistik",
        hazardType: "Flood / Banjir",
        category: "natural_hazard",
        severity: "major",
        summary: "Tindakan mitigasi genangan air limpasan hujan ekstrem pada area loading dock dan gudang penyimpanan.",
        steps: [
            {
                phase: "Tahap 1: Pengalihan & Pompa",
                title: "Aktivasi Pompa Submersible & Sandbag",
                instructions: [
                    "Nyalakan sistem pompa drainase darurat kapasitas tinggi di bak retensi barat.",
                    "Pasang barikade sandbag pada pintu masuk loading dock gudang.",
                    "Matikan saklar daya listrik lantai bawah untuk mencegah sengatan arus.",
                ],
            },
            {
                phase: "Tahap 2: Relokasi Aset",
                title: "Penyelamatan Pallet dan Bahan Baku",
                instructions: [
                    "Gunakan forklift untuk menaikkan pallet barang ke rak tier 2 dan tier 3 (ketinggian > 1.2m).",
                    "Pindahkan barang kimia peka air ke ruang transit kering.",
                ],
            },
            {
                phase: "Tahap 3: Pembersihan & Sanitasi",
                title: "Penyedotan Lumpur dan Desinfeksi",
                instructions: [
                    "Gunakan wet vacuum cleaner industri untuk menguras sisa genangan air kotor.",
                    "Semprotkan cairan disinfektan untuk mencegah perkembangbiakan jamur dan bakteri.",
                ],
            },
        ],
        equipment: ["Pompa Submersible 3-Phase", "Sandbags & Pallet Racks", "Wet Vacuum Cleaner", "Boots & Jas Hujan APD"],
        responsibleRoles: ["Warehouse Supervisor", "Utility Engineer", "Housekeeping Lead"],
        estimatedResolutionTime: "2 - 4 Jam",
        lastUpdated: "2026-11-09",
    },
    {
        id: "SOP-MAN-INTR-01",
        title: "Penanganan Penyusupan & Pelanggaran Batas Perimeter Pabrik",
        hazardType: "Unauthorized Intrusion / Penyusup",
        category: "man_made",
        severity: "critical",
        summary: "Prosedur penangkapan dan netralisasi orang tak dikenal yang melompati pagar atau memasuki zona terbatas.",
        steps: [
            {
                phase: "Tahap 1: Pelacakan & Isolasi",
                title: "Tracking Visual & Penutupan Jalur Keluar",
                instructions: [
                    "Operator CCTV mengunci target dan mengarahkan patroli darat via radio HT.",
                    "Kunci semua pintu akses elektronik (access door) menuju gedung produksi.",
                    "Kerahkan tim patroli bergerak (K9 atau Quick Reaction Team) ke koordinat target.",
                ],
            },
            {
                phase: "Tahap 2: Pengamanan Individu",
                title: "Penangkapan Secara Terukur",
                instructions: [
                    "Dekati pelaku dengan formasi perlindungan diri dan perintahkan tiarap / angkat tangan.",
                    "Lakukan penggeledahan badan untuk memastikan tidak membawa senjata tajam atau bahan peledak.",
                    "Borgol dan amankan ke ruang pemeriksaan pos keamanan pusat.",
                ],
            },
            {
                phase: "Tahap 3: Penyerahan ke Hukum",
                title: "BAP dan Penyerahan Polisi",
                instructions: [
                    "Catat identitas, motif, dan sita barang bawaan pelaku sebagai barang bukti.",
                    "Hubungi Babinkamtibmas / Polsek untuk serah terima pelaku beserta berita acara.",
                ],
            },
        ],
        equipment: ["Borgol Taktis", "Rompi Anti Tusuk", "Senter High-Lumen", "Handheld Metal Detector"],
        responsibleRoles: ["Quick Reaction Team", "Head of Security", "Legal Officer"],
        estimatedResolutionTime: "30 - 45 Menit",
        lastUpdated: "2026-11-13",
    },
    {
        id: "SOP-NAT-CHEM-01",
        title: "Penanganan Tumpahan Bahan Kimia Berbahaya (B3) di Jalur Produksi",
        hazardType: "Chemical Spill / Kebocoran B3",
        category: "natural_hazard",
        severity: "critical",
        summary: "Penanganan ceceran zat asam atau pelarut korosif pada lini produksi utama.",
        steps: [
            {
                phase: "Tahap 1: Evakuasi Radius 25m",
                title: "Isolasi Area dan Evakuasi Personil",
                instructions: [
                    "Instruksikan personil dalam radius 25 meter bergerak ke arah berlawanan mata angin (upwind).",
                    "Pasang rambu bahaya B3 dan matikan mesin di sekitarnya.",
                ],
            },
            {
                phase: "Tahap 2: Netralisasi Tumpahan",
                title: "Penggunaan Spill Kit B3",
                instructions: [
                    "Personil penangan wajib memakai Hazmat suit Level B dan respirator uap kimia.",
                    "Gelar absorbent boom melingkari tumpahan agar tidak mengalir ke selokan.",
                    "Taburkan bubuk penetral sesuai MSDS zat terkait hingga pH stabil.",
                ],
            },
            {
                phase: "Tahap 3: Pembuangan Limbah",
                title: "Pengemasan Drum Khusus B3",
                instructions: [
                    "Kumpulkan absorbent yang terkontaminasi ke dalam drum limbah B3 berlabel.",
                    "Serahkan ke fasilitas TPS Limbah B3 berizin.",
                ],
            },
        ],
        equipment: ["Chemical Spill Kit 120L", "Hazmat Suit Level B & Full Face Mask", "pH Indicator Strips"],
        responsibleRoles: ["Hazmat Response Specialist", "HSE Coordinator", "Production Foreman"],
        estimatedResolutionTime: "45 - 90 Menit",
        lastUpdated: "2026-11-04",
    },
    {
        id: "SOP-OPE-MECH-01",
        title: "Penanganan Kerusakan Kritis Mesin Conveyor & Kompresor Utama",
        hazardType: "Mechanical Breakdown",
        category: "operational",
        severity: "major",
        summary: "Prosedur respon cepat saat terjadi kegagalan motor penggerak atau getaran abnormal berlebih.",
        steps: [
            {
                phase: "Tahap 1: Lockout / Tagout (LOTO)",
                title: "Pemutusan Daya dan Pemasangan Gembok",
                instructions: [
                    "Tekan tombol Emergency Stop (E-Stop) pada panel stasiun kerja terdekat.",
                    "Pasang gembok LOTO pada pemutus sirkuit utama agar mesin tidak menyala otomatis.",
                ],
            },
            {
                phase: "Tahap 2: Diagnostik & Perbaikan",
                title: "Analisis Getaran dan Penggantian Part",
                instructions: [
                    "Periksa bearing dan tension belt menggunakan sensor getaran portabel.",
                    "Lakukan penggantian suku cadang atau penyelarasan (alignment) poros motor.",
                ],
            },
            {
                phase: "Tahap 3: Uji Coba Tanpa Beban",
                title: "Commissioning & Pencabutan LOTO",
                instructions: [
                    "Jalankan mesin uji coba mode manual tanpa beban selama 10 menit.",
                    "Lepas gembok LOTO dan verifikasi tanda tangan Foreman sebelum produksi jalan.",
                ],
            },
        ],
        equipment: ["LOTO Kit (Padlocks & Tags)", "Vibration Analyzer Tool", "Toolkit Mekanik Industri"],
        responsibleRoles: ["Maintenance Technician", "Mechanical Supervisor", "Safety Officer"],
        estimatedResolutionTime: "1 - 2 Jam",
        lastUpdated: "2026-11-01",
    },
];
