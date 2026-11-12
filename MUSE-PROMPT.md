# Prompt untuk Muse: tes topik pertama

Salin semua isi di bawah garis ini ke Muse. Kalau mau topik tertentu, ganti baris **Topik**.

---

Kamu desainer konten Instagram untuk **Velox**, komunitas investasi saham Indonesia. Buat **1 postingan carousel uji coba** mengikuti brand kit Velox.

**Baca dulu aset dan brief ini:**
- Brief (warna, layout, template prompt gambar): https://raw.githubusercontent.com/Syauqi-N/velox-ig-kit/main/BRIEF.md
- Contoh hasil jadi, acuan gaya: https://raw.githubusercontent.com/Syauqi-N/velox-ig-kit/main/out/contoh/01.png , https://raw.githubusercontent.com/Syauqi-N/velox-ig-kit/main/out/contoh/02.png , https://raw.githubusercontent.com/Syauqi-N/velox-ig-kit/main/out/contoh/03.png
- Overlay logo + disclaimer (PNG transparan 1080×1350): https://raw.githubusercontent.com/Syauqi-N/velox-ig-kit/main/out/frame/01.png
- Logo shield Velox: https://raw.githubusercontent.com/Syauqi-N/velox-ig-kit/main/brand/velox-shield.png
- Format data slide: https://raw.githubusercontent.com/Syauqi-N/velox-ig-kit/main/examples/contoh.json
- Contoh slide isi yang benar (angka jadi visual): https://raw.githubusercontent.com/Syauqi-N/velox-ig-kit/main/examples/hsc.json , hasilnya https://raw.githubusercontent.com/Syauqi-N/velox-ig-kit/main/out/hsc/01.png dan https://raw.githubusercontent.com/Syauqi-N/velox-ig-kit/main/out/hsc/02.png

**Topik:** pilih 1 berita saham Bursa Efek Indonesia yang paling ramai dibahas hari ini dari media kredibel (CNBC Indonesia, Kontan, Bisnis.com, IDX Channel). Sebutkan judul dan link beritanya. Jangan mengarang angka; semua angka harus dari berita itu.

**Yang harus kamu hasilkan:**
1. **Gambar hero** 1080×1350 (4:5). Pakai template prompt "Layout top" di BRIEF: objek di setengah bawah, 45% bagian atas kosong dan gelap. Palet navy `#0a2540` + cahaya emas `#ecd06e`. **Tanpa teks, angka, atau logo apa pun di dalam gambar.**
2. **post.json** dengan format sama seperti contoh:
   - `cover`: `kicker` 1 kalimat pendek; `headline` 1–2 baris putih + `accent` 1 baris emas; tiap baris maksimal ±18 karakter, huruf kapital.
   - 2 slide `content` (lihat bagian "Slide isi" di BRIEF). Tiap slide berisi `title` + **2–3 blok visual**. Angka dari berita **wajib** dijadikan `compare` / `rows` / `bar` / `timeline`, jangan ditulis sebagai paragraf. Tebalkan angka kunci dengan `**...**`. Maksimal 25 kata per `text`/`body`.
   - Opsional: 1 gambar band per slide isi (tanpa teks, objek di tengah), isi field `hero` di slide itu.
   - `cta` penutup.
   - `sumber`: nama media. `handle`: `@velox`.
3. **Caption IG**: 1 kalimat pembuka yang bikin penasaran, 3–4 kalimat ringkasan, "Sumber: …", lalu baris "Disclaimer: bukan rekomendasi untuk membeli/menjual saham tertentu.", lalu 5–8 hashtag.

**Aturan:**
- Bahasa Indonesia yang santai tapi informatif. Jangan ada ajakan beli/jual atau target harga.
- Jangan pakai warna neon pink atau neon biru.
- Kalau berita butuh logo emiten, buat objeknya polos (koin/gedung tanpa logo); logo ditempel manual nanti.

**Penyusunan slide akhir:**
- Kalau kamu bisa menyusun layer gambar: hero di paling bawah → teks sesuai "Spesifikasi layout" di BRIEF (font Montserrat) → overlay frame di paling atas. Kirim PNG per slide.
- Kalau tidak bisa: cukup kirim gambar hero + isi post.json + caption. Slide akan dirender dengan `node render.mjs post.json`.
