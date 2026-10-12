# 📂 Specimen Files (`ex/`)

This directory contains synthetic specimen test documents in both **PNG** and **PDF** formats for all 12 Indian identity cards.

Each document simulates an official A4 document (1240 × 1754 px at 150 DPI) containing:
1. Government department header banner.
2. Official dispatch notices, instructions, and text.
3. Centered/bottom ID Card section with Front and Back cards enclosed within red cut guidelines (`--- ✂ CUT ALONG DOTTED LINE ✂ ---`).
4. Dummy personal details, sample photo silhouettes, and test QR codes.

---

## 🗂️ Specimen Inventory & Card Coordinates

| File Name (PNG & PDF) | Document Type | Card Section Y-Range | Card Layout |
|---|---|---|---|
| `01_aadhaar_card_specimen` | e-Aadhaar A4 Sheet | `y: 1150 - 1478` | Dual: Front (Left) & Back (Right) |
| `02_apaar_id_specimen` | DigiLocker APAAR Registry | `y: 1050 - 1378` | Dual: Front & Back |
| `03_abc_card_specimen` | Academic Bank of Credits Sheet | `y: 1080 - 1408` | Dual: Front & Back |
| `04_ayushman_pmjay_specimen` | AB-PMJAY Golden Card Sheet | `y: 1050 - 1378` | Dual: Front & Back |
| `05_driving_licence_specimen` | Sarathi Form 7 DL Sheet | `y: 1080 - 1408` | Dual: Front & Back |
| `06_eshram_card_specimen` | e-Shram UAN Registration Sheet | `y: 1050 - 1378` | Dual: Front & Back |
| `07_family_id_specimen` | Parivar Pehchan Patra (PPP) Sheet | `y: 1060 - 1388` | Dual: Front & Back |
| `08_farmer_id_specimen` | AgriStack / PM-Kisan Digital ID | `y: 1080 - 1408` | Dual: Front & Back |
| `09_health_id_abha_specimen` | ABDM ABHA Card Document | `y: 1060 - 1388` | Dual: Front & Back |
| `10_ration_card_specimen` | NFSA ePDS Ration Card Sheet | `y: 1080 - 1408` | Dual: Front & Back |
| `11_pan_card_specimen` | Income Tax e-PAN Slip | `y: 1120 - 1448` | Dual: Front & Back |
| `12_voter_id_epic_specimen` | Election Commission e-EPIC Sheet | `y: 1100 - 1428` | Dual: Front & Back |

### Card Geometry within Specimen:
- **Card Width (`cw`)**: 520 px
- **Card Height (`ch`)**: 328 px (Aspect ratio ~ 1.585 : 1 matching ISO CR80)
- **Gap between Front and Back**: 20 px
- **Total Card Width**: 1060 px (Centered horizontally on 1240 px canvas: `x = 90` to `x = 1150`)

---

## 🔒 Privacy & Compliance Note
All documents in this directory use fictional names, sample numbers (`XXXX XXXX 4829`, `ABCPS1234F`), and synthetic silhouettes. No actual Personally Identifiable Information (PII) is included.
