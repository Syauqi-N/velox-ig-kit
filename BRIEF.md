# Velox IG Carousel Kit

Template postingan saham untuk IG Velox. Ukuran 1080×1350 (4:5), latar gelap, judul kapital besar, dan baris terakhir berwarna emas.

## Pembagian kerja

| Siapa | Tugas |
| --- | --- |
| **Muse** | Menulis copy (isi `post.json`) dan membuat **gambar hero tanpa teks** (pakai prompt di bawah). |
| **Template** (`render.mjs`) | Memasang logo, sumber, judul, slide isi, dan disclaimer secara presisi, lalu export PNG. |

Kenapa dipisah: model gambar sering salah eja teks Indonesia, angka, dan kode saham, serta merusak logo. Jadi semua teks dan logo dipasang oleh template, dan Muse cukup membuat visualnya.

## Cara pakai

1. Muse membuat gambar hero (1080×1350) dan menyimpannya di sebelah file JSON post.
2. Isi `post.json`. Lihat contoh di `examples/contoh.json`.
3. Render dari folder kit ini:
   ```bash
   node render.mjs examples/contoh.json
   ```
   Hasilnya ada di `out/<nama-json>/01.png, 02.png, ...`. Yang dibutuhkan hanya Node dan Google Chrome. Kalau Chrome tidak ada di PATH, isi path-nya lewat env `CHROME=/path/ke/chrome`.

Kalau Muse yang menyusun gambar akhirnya sendiri, pakai `out/frame/01.png`. File itu overlay PNG transparan berisi logo dan disclaimer (dibuat dari `brand/frame.json`). Spesifikasi layout lengkap ada di bawah.

## Format `post.json`

```json
{
  "sumber": "CNBC Indonesia",
  "handle": "@akun_ig_velox",
  "slides": [
    { "type": "cover", "layout": "top", "hero": "hero.png",
      "kicker": "Subjudul tipis", "headline": ["BARIS PUTIH", "BARIS PUTIH"], "accent": ["BARIS EMAS"] },
    { "type": "content", "chip": "Label kecil", "title": "Judul slide **kata emas**", "hero": "band.png",
      "blocks": [ { "text": "..." }, { "label": "Judul blok", "compare": { "from": "83", "to": "383" } } ] },
    { "type": "cta", "kicker": "Update saham tiap hari", "headline": ["FOLLOW &"], "accent": ["SIMPAN POST INI"] }
  ]
}
```

- `layout: "top"`: teks di atas, objek hero di bagian bawah. `layout: "bottom"`: kebalikannya.
- Judul idealnya 2–3 baris dengan ±18 karakter per baris. Ukuran huruf mengecil otomatis. Kalau tetap kepanjangan, kalimatnya turun ke baris baru (tidak terpotong).
- `sumber` muncul di cover dan slide isi.

### Slide isi (`content`)

Slide isi **jangan berupa tembok teks**. Ubah angka di berita menjadi visual. Satu slide berisi `chip` (opsional), `title`, lalu **2–3 blok** dari daftar di bawah. Tulis `**teks**` untuk menebalkan kata dengan warna emas. Contoh lengkap ada di `examples/hsc.json` (hasilnya di `out/hsc/`).

| Blok | Pakai untuk | Bentuk |
| --- | --- | --- |
| `text` | 1–2 kalimat pengantar | `"text": "BEI menghapus batas **Rp5 triliun**."` |
| `compare` | angka sebelum → sesudah (bar otomatis kalau naik) | `"compare": { "from": "83", "to": "383", "fromLabel": "Sebelumnya", "toLabel": "Sekarang", "note": "..." }` |
| `rows` | tabel angka + perubahan (+ hijau, − merah) | `"rows": [{ "label": "IHSG dibuka", "value": "5.139,09", "change": "+0,26%" }]` (opsional `"tone": "up"/"down"`) |
| `bar` | komposisi/perbandingan (naik/turun, porsi kepemilikan) | `"bar": [{ "label": "Naik", "value": 134, "tone": "up" }, { "label": "Stagnan", "value": 152 }]` |
| `timeline` | jadwal atau kronologi | `"timeline": [{ "date": "Jumat, 13 Nov", "text": "..." }]` |
| `card` | definisi/penjelasan singkat | `"card": { "title": "Apa itu HSC?", "body": "..." }` |
| `points` | 3 poin bernomor | `"points": [{ "title": "...", "body": "..." }]` |

Semua blok bisa diberi `"label"` (judul kecil emas di atasnya). Isi slide mengecil otomatis supaya muat. Kalau tetap kepanjangan, muncul **pita merah "KONTEN KEPANJANGAN"** di slide, tandanya teks atau bloknya harus dikurangi.

`hero` di slide isi bersifat opsional. Gambarnya tampil sebagai band di bagian atas slide (tinggi 640px, memudar ke bawah), dan isi slide turun ke bawah gambar. Pakai gambar tanpa teks dengan objek di tengah. Kalau ada gambar, pakai maksimal 2 blok.

## Warna (diambil dari logo shield Velox)

| Token | Hex | Dipakai untuk |
| --- | --- | --- |
| Navy | `#0a2540` | Warna utama logo, panel, teks di atas emas |
| Navy glow | `#0f2d4d` | Cahaya latar di tengah |
| Ink | `#03080f` | Latar paling gelap / tepi |
| Gold | `#ecd06e` | Aksen utama |
| Gold terang → gelap | `#fff3b0` → `#c39a3e` | Gradasi teks emas (atas → bawah) |
| Putih | `#ffffff` | Judul utama |

Font: **Montserrat** (OFL, ada di `fonts/`). Subjudul 400, judul 800 kapital, rapat (`letter-spacing -0.02em`).

## Spesifikasi layout (px, kanvas 1080×1350)

- **Header**: logo shield setinggi 58 di x=60, y=56, diikuti teks "VELOX" (Montserrat 800, 30px, tracking 0.1em). "Sumber: **X**" rata kanan, 22px.
- **Teks cover (layout top)**: mulai y=168, rata tengah. Kicker 44px, judul 104px (minimal 64px), line-height 1.02.
- **Teks cover (layout bottom)**: blok teks berakhir di 150px dari bawah.
- **Disclaimer**: pita di tengah bawah, 52px dari tepi bawah. Kiri tertulis "DISCLAIMER" (navy di atas emas). Kanan: "Bukan rekomendasi untuk membeli/menjual saham tertentu."
- **Area aman hero**: untuk layout top, objek utama ada di y 620–1220. Untuk layout bottom, objek ada di y 160–720.

## Prompt hero untuk Muse

Prompt dalam bahasa Inggris (biasanya lebih akurat). Ganti bagian `[...]`.

**Layout top (objek di bawah):**
```
Cinematic 3D render, [SUBJEK, mis: a glossy gold coin with an embossed abstract emblem /
a heavy mining truck carrying coal / a bank building facade], dramatic product lighting,
deep navy background (#0a2540) fading to near-black (#03080f), warm gold rim light (#ecd06e),
soft volumetric haze, reflective dark floor with a thin glowing gold horizon line,
subject placed in the LOWER HALF of the frame, upper 45% is empty dark negative space,
portrait 4:5, 1080x1350, high detail, premium financial news aesthetic.
NO text, NO letters, NO numbers, NO logos, NO watermark.
```

**Layout bottom (objek di atas):** pakai prompt yang sama, tapi ganti kalimat posisinya menjadi
`subject placed in the UPPER HALF of the frame, lower 45% is empty dark negative space`.

Palet hero: dominan navy dan hitam, dengan cahaya emas. Hindari neon pink/biru dan latar putih supaya feed tetap konsisten.
Kalau butuh logo emiten di koin, minta Muse membuat koin **polos**, lalu tempel logo resminya secara manual. Model gambar hampir selalu merusak logo.
