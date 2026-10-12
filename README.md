# 🇮🇳 Indian ID Card Cropper & Print-Ready Generator

A privacy-focused, **100% client-side web application** designed to import official Indian identity documents (A4 sheets / multi-page PDFs / receipts), automatically locate and crop the ID card portion (Front and Back), and export high-resolution, print-ready sheets (PVC card size, 4×6" photo paper, or A4 sheets for cyber cafes and print shops).

---

## 🔒 Privacy First: Why 100% Client-Side?

Indian identity documents (Aadhaar, PAN, Voter ID, Ayushman, etc.) contain sensitive Personally Identifiable Information (PII) including biometrics, QR codes, financial IDs, and full home addresses.

- **Zero Server Uploads**: Every PDF parsing, image cropping, and rendering operation runs entirely in your local browser using WebAssembly and Web Canvas APIs.
- **No Data Retention**: Your files never leave your device.
- **Offline Capable**: Works completely offline as a Progressive Web App (PWA).

---

## 📋 Comprehensive Directory of Indian IDs

Official Indian government portals issue e-cards as full A4 (or multi-page) documents with letters, disclaimers, and folding instructions. The table below details each identity card, its official portal, document layout, and card cutout specifications:

| # | ID Card Name | Issuing Authority | Official Portal Link | Original Document Format | Card Cutout Dimensions & Layout |
|---|---|---|---|---|---|
| 1 | **Aadhaar Card** | Unique Identification Authority of India (UIDAI) | [myaadhaar.uidai.gov.in](https://myaadhaar.uidai.gov.in) / [uidai.gov.in](https://uidai.gov.in) | 1-Page A4 PDF *(Password protected: Name 4 uppercase letters + YYYY)* | Bottom 1/3 section; side-by-side Front & Back cutouts (85.6mm × 54.0mm each) |
| 2 | **APAAR ID** *(Automated Permanent Academic Account Registry / One Nation One Student ID)* | Ministry of Education, Govt. of India | [apaar.education.gov.in](https://apaar.education.gov.in) / [digilocker.gov.in](https://www.digilocker.gov.in) | A4 PDF document via DigiLocker / ABC portal | Upper-center card box with 12-digit APAAR ID, student photo, QR code, and academic credits badge |
| 3 | **ABC Card** *(Academic Bank of Credits)* | UGC & Ministry of Education | [abc.gov.in](https://www.abc.gov.in) / [digilocker.gov.in](https://www.digilocker.gov.in) | DigiLocker A4 certificate or e-card slip | Standard card box with 12-digit ABC ID, QR code, and institution verification |
| 4 | **Ayushman Card** *(PM-JAY)* | National Health Authority (NHA), MoHFW | [beneficiary.nha.gov.in](https://beneficiary.nha.gov.in) / [pmjay.gov.in](https://pmjay.gov.in) | A4 PDF acknowledgement / printout | Bi-fold card section (Front: PM-JAY & ABHA ID, Photo, ₹5 Lakh cover logo; Back: Beneficiary guidelines) |
| 5 | **Driving Licence (DL)** | Ministry of Road Transport and Highways (MoRTH) | [parivahan.gov.in](https://parivahan.gov.in) / [sarathi.parivahan.gov.in](https://sarathi.parivahan.gov.in) | Sarathi Form 7 printout / DigiLocker A4 PDF | Card box with DL number, vehicle classes (LMV, MCWG), validity, photo & digital signature |
| 6 | **e-Shram Card** | Ministry of Labour & Employment | [eshram.gov.in](https://eshram.gov.in) | A4 PDF document containing UAN Card | Center/bottom cutout with 12-digit UAN number, photo, occupation, and QR code |
| 7 | **Family ID** *(Parivar Pehchan Patra - PPP / UP Family ID)* | State Governments (Haryana, UP, Karnataka, etc.) | [meraparivar.haryana.gov.in](https://meraparivar.haryana.gov.in) / [familyid.up.gov.in](https://familyid.up.gov.in) | Multi-page A4 document listing family tree | Header/summary card badge with 8-digit Family ID, Head of Family photo, and QR code |
| 8 | **Farmer ID** *(Kisan ID / AgriStack / PM-Kisan)* | Ministry of Agriculture & Farmers Welfare | [agristack.gov.in](https://agristack.gov.in) / [pmkisan.gov.in](https://pmkisan.gov.in) | PM-Kisan status sheet or AgriStack Digital ID | ID card box featuring Farmer ID, Aadhaar verification badge, land parcel link, and QR code |
| 9 | **Health ID** *(ABHA - Ayushman Bharat Health Account)* | National Health Authority (NHA) / ABDM | [abha.abdm.gov.in](https://abha.abdm.gov.in) | 1-Page A4 PDF from ABDM portal | Central card rectangle with 14-digit ABHA number, PHR address (@abdm), photo, and QR code |
| 10 | **Ration Card** | Dept of Food & Public Distribution (NFSA / ePDS) | [nfsa.gov.in](https://nfsa.gov.in) / State ePDS Portals | Full A4 ePDS certificate / RCMS slip | Front card slip with Ration Card number, FPS dealer code, category (AAY/PHH), and family head photo |
| 11 | **PAN Card** *(e-PAN)* | Income Tax Department (Protean / UTIITSL / e-Filing) | [eportal.incometax.gov.in](https://eportal.incometax.gov.in) / [onlineservices.nsdl.com](https://www.onlineservices.nsdl.com) / [pan.utiitsl.com](https://www.pan.utiitsl.com) | 1-Page A4 PDF (Letter on top, card on bottom) | Bottom slip with Front (Name, Father's Name, DOB, Photo, Signature, Hologram) and Back (QR code) |
| 12 | **Voter ID Card** *(e-EPIC)* | Election Commission of India (ECI) | [voters.eci.gov.in](https://voters.eci.gov.in) / [eci.gov.in](https://eci.gov.in) | 1 or 2-Page A4 PDF with voter guidelines | Two-part cutout (Front: EPIC No, photo, hologram; Back: Address in English & regional language, ERO sign) |

---

## 📐 Card Specifications & Printing Standards

### Standard Card Dimensions (ISO/IEC 7810 ID-1 / CR80)
- **Width**: `85.60 mm` (`3.370 inches` / `3.37"`)
- **Height**: `53.98 mm` (`2.125 inches` / `2.125"`)
- **Aspect Ratio**: `1.586 : 1`
- **Corner Radius**: `3.18 mm` (`1/8 inch`)
- **Pixel Dimensions for Print**:
  - **300 DPI**: `1011 × 638 px`
  - **600 DPI**: `2022 × 1275 px`

### Print Layout Standards
1. **Lamination Pouch Mode (Single Card Pair)**:
   - Front and Back aligned side-by-side or stacked top-to-bottom with a 2mm cut/fold guideline.
   - Folded size matches standard card pouch (approx. 90mm × 60mm).
2. **Photo Paper (4" × 6" / 10cm × 15cm)**:
   - Fits 1 or 2 cards with front and back sides, ideal for standard photo studio printers (e.g. Epson L805 / Canon G570).
3. **Full A4 Sheet (Cyber Cafe / CSC Center Batch Mode)**:
   - Arranges up to 5 complete ID cards (Front + Back = 10 blocks) with cutting registration marks.
4. **PVC Thermal Card Printer (Direct to Card)**:
   - Exact CR80 dimensions without borders for Zebra, Evolis, Magicard, or Fargo ID card printers.

---

## 📁 Specimen Directory (`ex/`)

The `ex/` directory contains synthetic, specimen documents for all 12 cards that replicate the real-world A4 layout, complete with headers, instructions, and card cutout areas for testing:

- `ex/01_aadhaar_card_specimen.png` & `.pdf`
- `ex/02_apaar_id_specimen.png` & `.pdf`
- `ex/03_abc_card_specimen.png` & `.pdf`
- `ex/04_ayushman_pmjay_specimen.png` & `.pdf`
- `ex/05_driving_licence_specimen.png` & `.pdf`
- `ex/06_eshram_card_specimen.png` & `.pdf`
- `ex/07_family_id_specimen.png` & `.pdf`
- `ex/08_farmer_id_specimen.png` & `.pdf`
- `ex/09_health_id_abha_specimen.png` & `.pdf`
- `ex/10_ration_card_specimen.png` & `.pdf`
- `ex/11_pan_card_specimen.png` & `.pdf`
- `ex/12_voter_id_epic_specimen.png` & `.pdf`

*(All specimen files use fictional dummy data to ensure 100% privacy and legal compliance).*

---

## 🛠️ Development Environment (NixOS)

This project runs inside a NixOS dev shell:
```bash
nix develop /etc/nixos#all-linux --command bash -c "<command>"
```
See [AGENTS.md](file:///mnt/data/projects/photo_croper/AGENTS.md) for full instructions.
