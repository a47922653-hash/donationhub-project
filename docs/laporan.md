# Laporan Praktikum Kriptografi
Minggu ke-: 16  
Topik: [TinyCoin Donation Platform Donasi Berbasis Smart Contract ERC-20 di Ethereum Sepolia Testnet]    
Kelompok: 3     
Anggota Kelompok: 
1. Zaki Fauzan Sulton
2. Achmad Wahyudi
3. Surya Subekti
4. Muhammad Syaiful Anhar
5. Ferdy Ramadhani
Kelas: [5IKRA]  

---

## 1. LATAR BELAKANG
Perkembangan teknologi informasi telah mendorong transformasi signifikan dalam berbagai sektor, termasuk dalam sistem donasi digital. Saat ini, aktivitas penggalangan dana banyak dilakukan melalui platform daring yang mempermudah proses donasi dan memperluas jangkauan donor. Namun demikian, sebagian besar platform donasi digital masih menerapkan arsitektur sistem yang bersifat terpusat, di mana pengelolaan dana sepenuhnya berada di tangan satu entitas atau organisasi tertentu. Kondisi ini menuntut tingkat kepercayaan yang tinggi dari para donor terhadap pengelola platform, baik dalam hal keamanan dana maupun transparansi penggunaannya.
    
Permasalahan utama dari sistem donasi terpusat terletak pada keterbatasan transparansi dan verifiabilitas. Donor umumnya tidak memiliki akses langsung untuk memantau aliran dana secara real-time ataupun memastikan bahwa dana yang disalurkan benar-benar sampai kepada pihak yang berhak. Informasi yang tersedia biasanya hanya berupa laporan internal yang dipublikasikan secara periodik oleh pengelola platform. Laporan semacam ini sulit untuk diaudit secara independen dan rawan terhadap manipulasi data, sehingga berpotensi menurunkan tingkat kepercayaan publik terhadap sistem donasi digital.
    
Di sisi lain, aspek keamanan juga menjadi tantangan penting. Sistem terpusat memiliki single point of failure, sehingga rentan terhadap serangan siber, penyalahgunaan wewenang, maupun kebocoran data. Ketika sistem inti dikompromikan, seluruh data dan dana donasi berpotensi terdampak. Oleh karena itu, dibutuhkan pendekatan teknologi yang mampu meminimalkan ketergantungan pada kepercayaan terhadap pihak tertentu dan menggantikannya dengan mekanisme keamanan yang bersifat matematis dan kriptografis.
    
Teknologi blockchain hadir sebagai solusi alternatif dengan menawarkan sistem pencatatan transaksi yang terdistribusi, transparan, dan bersifat immutable (tidak dapat diubah). Blockchain memanfaatkan prinsip-prinsip kriptografi seperti kriptografi kunci publik, fungsi hash, serta tanda tangan digital untuk menjamin keaslian, integritas, dan non-repudiation dari setiap transaksi. Dengan karakteristik tersebut, setiap transaksi yang tercatat di blockchain dapat diverifikasi secara publik tanpa memerlukan kepercayaan terhadap satu otoritas pusat.
    
Lebih lanjut, konsep smart contract memungkinkan logika bisnis dijalankan secara otomatis di atas blockchain sesuai dengan aturan yang telah ditentukan. Dalam konteks donasi, smart contract dapat digunakan untuk mengatur pembuatan campaign, penerimaan donasi, hingga penyaluran dana secara langsung tanpa perantara. Seluruh proses tersebut dijalankan berdasarkan kode program yang bersifat deterministik dan transparan, sehingga meminimalkan potensi kecurangan dan meningkatkan akuntabilitas sistem donasi digital.

Meskipun demikian, penerapan blockchain dan kriptografi sering kali dianggap kompleks bagi pengguna umum, terutama karena keterlibatan konsep teknis seperti wallet, private key, dan transaksi on-chain. Oleh sebab itu, diperlukan sebuah platform yang mampu mengintegrasikan teknologi blockchain dan kriptografi ke dalam sistem donasi, namun tetap menyediakan antarmuka pengguna berbasis website yang mudah digunakan. Pendekatan ini diharapkan dapat menjembatani kesenjangan antara kompleksitas teknologi dan kebutuhan pengguna awam.

Berdasarkan latar belakang tersebut, proyek TinyCoin Donation dikembangkan sebagai platform donasi berbasis website yang memanfaatkan smart contract dan token ERC-20 pada jaringan Ethereum Sepolia Testnet. Proyek ini tidak hanya berfungsi sebagai solusi konseptual untuk meningkatkan transparansi dan keamanan donasi digital, tetapi juga sebagai sarana pembelajaran dan eksplorasi penerapan kriptografi dalam sistem nyata. Dengan seluruh transaksi donasi dicatat secara on-chain dan divalidasi melalui mekanisme kriptografis, TinyCoin Donation merepresentasikan implementasi nyata integrasi kriptografi dalam sistem donasi digital modern

---

## 2. TUJUAN PROYEK
Tujuan dari proyek akhir ini adalah untuk merancang dan mengimplementasikan sebuah sistem donasi digital terdesentralisasi yang mengintegrasikan konsep dan mekanisme kriptografi dalam lingkungan blockchain. Secara khusus, tujuan proyek ini meliputi:
1. Menerapkan smart contract berbasis standar ERC-20 untuk mengelola proses donasi secara otomatis, transparan, dan tanpa perantara.
2. Mengimplementasikan mekanisme kriptografi berupa tanda tangan digital dan autentikasi berbasis wallet (MetaMask) sebagai bentuk otorisasi transaksi yang aman.
3. Menyediakan sistem pencatatan donasi yang bersifat on-chain sehingga seluruh transaksi dapat diverifikasi secara publik dan tidak dapat dimodifikasi.
4. Mengintegrasikan antarmuka website sebagai media interaksi pengguna yang menyederhanakan penggunaan teknologi blockchain tanpa mengurangi aspek keamanan.
5. Mengevaluasi peran teknologi blockchain dan kriptografi dalam meningkatkan kepercayaan, transparansi, serta keamanan pada sistem donasi digital.                

Dengan tercapainya tujuan tersebut, proyek TinyCoin Donation diharapkan dapat menjadi studi kasus penerapan kriptografi dalam sistem nyata serta menunjukkan relevansi blockchain sebagai solusi teknologi pada sistem sosial berbasis kepercayaan.

---

## 3. Alat dan Bahan
(- Python 3.x  
- Visual Studio Code / editor lain  
- Git dan akun GitHub  
- Library tambahan (misalnya pycryptodome, jika diperlukan)  )

---

## 4. Langkah Percobaan
(Tuliskan langkah yang dilakukan sesuai instruksi.  
Contoh format:
1. Membuat file `caesar_cipher.py` di folder `praktikum/week2-cryptosystem/src/`.
2. Menyalin kode program dari panduan praktikum.
3. Menjalankan program dengan perintah `python caesar_cipher.py`.)

---

## 5. Source Code
(Salin kode program utama yang dibuat atau dimodifikasi.  
Gunakan blok kode:

```python
# contoh potongan kode
def encrypt(text, key):
    return ...
```
)

---

## 6. Hasil dan Pembahasan
(- Lampirkan screenshot hasil eksekusi program (taruh di folder `screenshots/`).  
- Berikan tabel atau ringkasan hasil uji jika diperlukan.  
- Jelaskan apakah hasil sesuai ekspektasi.  
- Bahas error (jika ada) dan solusinya. 

Hasil eksekusi program Caesar Cipher:

![Hasil Eksekusi](screenshots/output.png)
![Hasil Input](screenshots/input.png)
![Hasil Output](screenshots/output.png)
)

---

## 7. Jawaban Pertanyaan
(Jawab pertanyaan diskusi yang diberikan pada modul.  
- Pertanyaan 1: …  
- Pertanyaan 2: …  
)
---

## 8. Kesimpulan
(Tuliskan kesimpulan singkat (2–3 kalimat) berdasarkan percobaan.  )

---

## 9. Daftar Pustaka
(Cantumkan referensi yang digunakan.  
Contoh:  
- Katz, J., & Lindell, Y. *Introduction to Modern Cryptography*.  
- Stallings, W. *Cryptography and Network Security*.  )

---

## 10. Commit Log
(Tuliskan bukti commit Git yang relevan.  
Contoh:
```
commit abc12345
Author: Nama Mahasiswa <email>
Date:   2025-09-20

    week2-cryptosystem: implementasi Caesar Cipher dan laporan )
```
