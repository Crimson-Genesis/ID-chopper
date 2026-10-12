# Indian ID Card Cropper and Print-Ready Generator

A privacy-focused, 100% client-side web application designed to import official Indian identity documents (A4 sheets / multi-page PDFs / receipts), automatically locate and crop the ID card portion (Front and Back), and export high-resolution, print-ready sheets (PVC card size, 4x6 inch photo paper, or A4 sheets for cyber cafes and print shops).

---

## Privacy First: Why 100% Client-Side?

Indian identity documents (Aadhaar, PAN, Voter ID, Ayushman, etc.) contain sensitive Personally Identifiable Information (PII) including biometrics, QR codes, financial IDs, and full home addresses.

- **Zero Server Uploads**: Every PDF parsing, image cropping, and rendering operation runs entirely in your local browser using WebAssembly and Web Canvas APIs.
- **No Data Retention**: Your files never leave your device.
- **Offline Capable**: Works completely offline as a Progressive Web App (PWA).

---

## Comprehensive Directory of Indian IDs

Official Indian government portals issue e-cards as full A4 (or multi-page) documents with letters, disclaimers, and folding instructions. The table below details each identity card, its official portal, document layout, and card cutout specifications:

| # | ID Card Name | Issuing Authority | Official Portal Link | Original Document Format | Card Cutout Dimensions and Layout |
|---|---|---|---|---|---|
| 1 | **Aadhaar Card** | Unique Identification Authority of India (UIDAI) | [myaadhaar.uidai.gov.in](https://myaadhaar.uidai.gov.in) / [uidai.gov.in](https://uidai.gov.in) | 1-Page A4 PDF *(Password protected: Name 4 uppercase letters + YYYY)* | Bottom 1/3 section; side-by-side Front and Back cutouts (85.6mm x 54.0mm each) |
| 2 | **APAAR ID** *(Automated Permanent Academic Account Registry / One Nation One Student ID)* | Ministry of Education, Govt. of India | [apaar.education.gov.in](https://apaar.education.gov.in) / [digilocker.gov.in](https://www.digilocker.gov.in) | A4 PDF document via DigiLocker / ABC portal | Upper-center card box with 12-digit APAAR ID, student photo, QR code, and academic credits badge |
| 3 | **ABC Card** *(Academic Bank of Credits)* | UGC and Ministry of Education | [abc.gov.in](https://www.abc.gov.in) / [digilocker.gov.in](https://www.digilocker.gov.in) | DigiLocker A4 certificate or e-card slip | Standard card box with 12-digit ABC ID, QR code, and institution verification |
| 4 | **Ayushman Card** *(PM-JAY)* | National Health Authority (NHA), MoHFW | [beneficiary.nha.gov.in](https://beneficiary.nha.gov.in) / [pmjay.gov.in](https://pmjay.gov.in) | A4 PDF acknowledgement / printout | Bi-fold card section (Front: PM-JAY and ABHA ID, Photo, Rs 5 Lakh cover logo; Back: Beneficiary guidelines) |
| 5 | **Driving Licence (DL)** | Ministry of Road Transport and Highways (MoRTH) | [parivahan.gov.in](https://parivahan.gov.in) / [sarathi.parivahan.gov.in](https://sarathi.parivahan.gov.in) | Sarathi Form 7 printout / DigiLocker A4 PDF | Card box with DL number, vehicle classes (LMV, MCWG), validity, photo and digital signature |
| 6 | **e-Shram Card** | Ministry of Labour and Employment | [eshram.gov.in](https://eshram.gov.in) | A4 PDF document containing UAN Card | Center/bottom cutout with 12-digit UAN number, photo, occupation, and QR code |
| 7 | **Family ID** *(Parivar Pehchan Patra - PPP / UP Family ID)* | State Governments (Haryana, UP, Karnataka, etc.) | [meraparivar.haryana.gov.in](https://meraparivar.haryana.gov.in) / [familyid.up.gov.in](https://familyid.up.gov.in) | Multi-page A4 document listing family tree | Header/summary card badge with 8-digit Family ID, Head of Family photo, and QR code |
| 8 | **Farmer ID** *(Kisan ID / AgriStack / PM-Kisan)* | Ministry of Agriculture and Farmers Welfare | [agristack.gov.in](https://agristack.gov.in) / [pmkisan.gov.in](https://pmkisan.gov.in) | PM-Kisan status sheet or AgriStack Digital ID | ID card box featuring Farmer ID, Aadhaar verification badge, land parcel link, and QR code |
| 9 | **Health ID** *(ABHA - Ayushman Bharat Health Account)* | National Health Authority (NHA) / ABDM | [abha.abdm.gov.in](https://abha.abdm.gov.in) | 1-Page A4 PDF from ABDM portal | Central card rectangle with 14-digit ABHA number, PHR address (@abdm), photo, and QR code |
| 10 | **Ration Card** | Dept of Food and Public Distribution (NFSA / ePDS) | [nfsa.gov.in](https://nfsa.gov.in) / State ePDS Portals | Full A4 ePDS certificate / RCMS slip | Front card slip with Ration Card number, FPS dealer code, category (AAY/PHH), and family head photo |
| 11 | **PAN Card** *(e-PAN)* | Income Tax Department (Protean / UTIITSL / e-Filing) | [eportal.incometax.gov.in](https://eportal.incometax.gov.in) / [onlineservices.nsdl.com](https://www.onlineservices.nsdl.com) / [pan.utiitsl.com](https://www.pan.utiitsl.com) | 1-Page A4 PDF (Letter on top, card on bottom) | Bottom slip with Front (Name, Father's Name, DOB, Photo, Signature, Hologram) and Back (QR code) |
| 12 | **Voter ID Card** *(e-EPIC)* | Election Commission of India (ECI) | [voters.eci.gov.in](https://voters.eci.gov.in) / [eci.gov.in](https://eci.gov.in) | 1 or 2-Page A4 PDF with voter guidelines | Two-part cutout (Front: EPIC No, photo, hologram; Back: Address in English and regional language, ERO sign) |

---

## Card Specifications and Printing Standards

### Standard Card Dimensions (ISO/IEC 7810 ID-1 / CR80)
- **Width**: `85.60 mm` (`3.370 inches` / `3.37"`)
- **Height**: `53.98 mm` (`2.125 inches` / `2.125"`)
- **Aspect Ratio**: `1.586 : 1`
- **Corner Radius**: `3.18 mm` (`1/8 inch`)
- **Pixel Dimensions for Print**:
  - **300 DPI**: `1011 x 638 px`
  - **600 DPI**: `2022 x 1275 px`

### Print Layout Standards
1. **Lamination Pouch Mode (Single Card Pair)**:
   - Front and Back aligned side-by-side or stacked top-to-bottom with a 2mm cut/fold guideline.
   - Folded size matches standard card pouch (approx. 90mm x 60mm).
2. **Photo Paper (4" x 6" / 10cm x 15cm)**:
   - Fits 1 or 2 cards with front and back sides, ideal for standard photo studio printers (e.g. Epson L805 / Canon G570).
3. **Full A4 Sheet (Cyber Cafe / CSC Center Batch Mode)**:
   - Arranges up to 5 complete ID cards (Front + Back = 10 blocks) with cutting registration marks.
4. **PVC Thermal Card Printer (Direct to Card)**:
   - Exact CR80 dimensions without borders for Zebra, Evolis, Magicard, or Fargo ID card printers.

---

## Key Features

- **Unified File Manager**: Import multiple PDFs and images at once without file type segregation.
- **Smart Crop Cache**: Extracted Front and Back crops are preserved in memory across file switching, allowing you to crop Front from one document and Back from another document.
- **Single-Scroll Gravity Lock**: Multi-page PDFs snap cleanly exactly one page per scroll gesture with responsive page counters.
- **Instant Save Location Prompt**: Uses the modern Web File System Access API (`showSaveFilePicker`) to prompt for the exact directory and filename before saving, with seamless fallback for all browsers.
- **Monochrome Dark Aesthetics**: Minimalist high-contrast studio theme built strictly with modern SVG vector icons (zero emojis).
- **Password-Protected PDFs**: Client-side decryption for e-Aadhaar and password-locked government documents.
- **Custom Card Dimension Presets**: Supports all 12 official Indian IDs plus arbitrary custom card formats (school IDs, office passes, driver cards) with custom millimeter sizing.

---

## Deployment Guide

This project compiles to a pure static application (`dist/`) that can be hosted on **Vercel**, **Netlify**, **GitHub Pages**, or **Cloudflare Pages** with zero backend infrastructure.

### Option 1: Deploy to Vercel via Git (Recommended)

1. Push your repository to GitHub / GitLab / Bitbucket:
   ```bash
   git add .
   git commit -m "feat: complete Indian ID card cropper studio"
   git push origin main
   ```
2. Log in to [Vercel](https://vercel.com).
3. Click **Add New...** -> **Project**.
4. Import your Git repository.
5. Vercel automatically detects the Vite configuration:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Click **Deploy**. Your site will be live on a fast global edge CDN in under 1 minute.

### Option 2: Deploy to Vercel via CLI

Inside the NixOS development environment:
```bash
# In NixOS dev shell:
nix develop /etc/nixos#all-linux --command bash -c "npx -y vercel"
```
Follow the interactive prompts to log in and deploy. For production deployment:
```bash
nix develop /etc/nixos#all-linux --command bash -c "npx -y vercel --prod"
```

---

## Local Development (NixOS)

This project runs inside the NixOS dev shell:

```bash
# Start local development server
nix develop /etc/nixos#all-linux --command bash -c "npm run dev"

# Build production bundle
nix develop /etc/nixos#all-linux --command bash -c "npm run build"

# Preview production build locally
nix develop /etc/nixos#all-linux --command bash -c "npm run preview"
```
See [AGENTS.md](file:///mnt/data/projects/photo_croper/AGENTS.md) for environment guidelines and style rules.

