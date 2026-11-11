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

**Topik:** pilih 1 berita saham Bursa Efek Indonesia yang paling ramai dibahas hari ini dari media kredibel (CNBC Indonesia, Kontan, Bisnis.com, IDX Channel). Sebutkan judul dan link beritanya. Jangan mengarang angka; semua angka harus dari berita itu.

**Yang harus kamu hasilkan:**
1. **Gambar hero** 1080×1350 (4:5). Pakai template prompt "Layout top" di BRIEF: objek di setengah bawah, 45% bagian atas kosong dan gelap. Palet navy `#0a2540` + cahaya emas `#ecd06e`. **Tanpa teks, angka, atau logo apa pun di dalam gambar.**
2. **post.json** dengan format sama seperti contoh:
   - `cover`: `kicker` 1 kalimat pendek; `headline` 1–2 baris putih + `accent` 1 baris emas; tiap baris maksimal ±18 karakter, huruf kapital.
   - 1–2 slide `points`, masing-masing 3 poin (judul pendek + 1–2 kalimat penjelasan).
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
