# TinyCoin Donation

![Blockchain](https://img.shields.io/badge/Blockchain-Ethereum-blue)
![Network](https://img.shields.io/badge/Network-Sepolia_Testnet-orange)
![License](https://img.shields.io/badge/License-MIT-green)

Platform donasi berbasis blockchain menggunakan token ERC-20 TinyCoin (TNC) di jaringan Sepolia Testnet.

## Tentang Proyek
Proyek ini adalah implementasi sistem donasi terdesentralisasi dengan fitur:
- Pembuatan campaign donasi
- Donasi menggunakan token TNC
- Manajemen campaign oleh creator
- Antarmuka web yang responsif

## Teknologi yang Digunakan
- **Smart Contracts**: Solidity (Remix IDE)
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Web3 Library**: Web3.js 1.7.0
- **Wallet Integration**: MetaMask
- **Test Network**: Sepolia Testnet

## Struktur Proyek
```
donationhub-project/
├── contracts/
│   ├── TinyCoin.sol
│   └── DonationHub.sol
├── frontend/
│   ├── index.html
│   ├── styles.css
│   ├── config.js
│   ├── app.js
│   └── landing.js
├── screenshots/
├── docs/
│   └── laporan.md
├── README.md
└── .gitignore
```

## Setup:
1. Deploy contracts di Remix
2. Copy contract addresses
3. Edit frontend/config.js:
   ```javascript
   const TNC_ADDRESS = "alamat_TinyCoin";
   const HUB_ADDRESS = "alamat_DonationHub";
   ```
4. Buka index.html di browser

## Deployment
Kontrak telah dideploy di Sepolia Testnet:
- **TinyCoin**: [Alamat Kontrak]
- **DonationHub**: [Alamat Kontrak]

## Kontribusi
1. Fork repository
2. Buat branch fitur baru
3. Commit perubahan
4. Push ke branch
5. Buat Pull Request

## Lisensi
Proyek ini dilisensikan di bawah [MIT License](LICENSE).

---

**Catatan**: Pastikan MetaMask terpasang dan terkoneksi ke Sepolia Testnet sebelum menggunakan aplikasi.
