import os
from PIL import Image, ImageDraw, ImageFont

# Dimensions for A4 sheet at 150 DPI (for fast, crisp rendering: 1240 x 1754)
A4_WIDTH = 1240
A4_HEIGHT = 1754

OUTPUT_DIR = "/mnt/data/projects/photo_croper/ex"
os.makedirs(OUTPUT_DIR, exist_ok=True)

# Helper to create a dummy QR pattern
def draw_dummy_qr(draw, x, y, size):
    draw.rectangle([x, y, x + size, y + size], fill="#FFFFFF", outline="#000000", width=2)
    step = size // 6
    # 3 corner markers
    for ox, oy in [(x, y), (x + size - 2 * step, y), (x, y + size - 2 * step)]:
        draw.rectangle([ox + 2, oy + 2, ox + 2 * step - 2, oy + 2 * step - 2], fill="#000000")
        draw.rectangle([ox + 5, oy + 5, ox + 2 * step - 5, oy + 2 * step - 5], fill="#FFFFFF")
        draw.rectangle([ox + 8, oy + 8, ox + 2 * step - 8, oy + 2 * step - 8], fill="#000000")
    # center pattern
    draw.rectangle([x + 2 * step, y + 2 * step, x + 4 * step, y + 4 * step], fill="#333333")

# Helper to create a dummy photo box
def draw_dummy_photo(draw, x, y, w, h, name="PHOTO"):
    draw.rectangle([x, y, x + w, y + h], fill="#E2E8F0", outline="#94A3B8", width=2)
    # Silhouette head and shoulders
    head_r = w // 4
    head_cx = x + w // 2
    head_cy = y + h // 3
    draw.ellipse([head_cx - head_r, head_cy - head_r, head_cx + head_r, head_cy + head_r], fill="#64748B")
    draw.pieslice([x + 10, head_cy + head_r, x + w - 10, y + h + 20], 180, 360, fill="#64748B")
    draw.rectangle([x + 2, y + h - 18, x + w - 2, y + h - 2], fill="#1E293B")
    draw.text((x + w // 2 - 20, y + h - 16), "SAMPLE", fill="#FFFFFF")

def draw_cut_guideline(draw, x, y, w, h):
    # Dotted or dashed border around card
    dash_len = 10
    gap_len = 6
    # Top and bottom
    for i in range(x, x + w, dash_len + gap_len):
        draw.line([(i, y), (min(i + dash_len, x + w), y)], fill="#DC2626", width=2)
        draw.line([(i, y + h), (min(i + dash_len, x + w), y + h)], fill="#DC2626", width=2)
    # Left and right
    for j in range(y, y + h, dash_len + gap_len):
        draw.line([(x, j), (x, min(j + dash_len, y + h))], fill="#DC2626", width=2)
        draw.line([(x + w, j), (x + w, min(j + dash_len, y + h))], fill="#DC2626", width=2)
    draw.text((x + 10, y - 18), "✂ CUT ALONG DOTTED LINE (CARD SECTION) ✂", fill="#DC2626")

CARDS = [
    {
        "id": "01_aadhaar_card_specimen",
        "title": "Unique Identification Authority of India (UIDAI)",
        "subtitle": "Government of India - e-Aadhaar Information Sheet",
        "doc_text": [
            "Enrollment No: 1024/78291/00192",
            "To: RAHUL SHARMA, S/O VIKRAM SHARMA",
            "H.No 42, Sector 15, Gandhinagar, Gujarat - 382016",
            "",
            "Aadhaar is a proof of identity, not of citizenship.",
            "It should be verified online at myaadhaar.uidai.gov.in.",
            "Keep your mobile number and email updated in Aadhaar.",
            "Please cut the lower portion along the dotted line for the wallet card."
        ],
        "card_type": "dual", # Front & Back side-by-side
        "card_y": 1150,
        "front_title": "भारत सरकार / GOVERNMENT OF INDIA",
        "front_sub": "मेरा आधार, मेरी पहचान",
        "name": "राहुल शर्मा / Rahul Sharma",
        "dob": "DOB: 15/08/1992 | Male",
        "id_val": "XXXX XXXX 4829",
        "back_title": "भारतीय विशिष्ट पहचान प्राधिकरण (UIDAI)",
        "back_address": "Address: S/O Vikram Sharma, H.No 42, Sector 15,\nGandhinagar, Gujarat - 382016\nHelpline: 1947 | help@uidai.gov.in"
    },
    {
        "id": "02_apaar_id_specimen",
        "title": "Ministry of Education - Government of India",
        "subtitle": "Automated Permanent Academic Account Registry (APAAR / One Nation One Student ID)",
        "doc_text": [
            "DigiLocker Verified Academic Credential Certificate",
            "Student Name: PRIYA PATEL | Academic Year: 2024-2026",
            "Institution: National Institute of Technology, Surat",
            "Program: Bachelor of Technology (Computer Science & Engineering)",
            "",
            "APAAR ID acts as a lifelong student ID linked with Academic Bank of Credits (ABC).",
            "This document is electronically generated and digitally signed.",
            "Cut the card section below for student identification."
        ],
        "card_type": "dual",
        "card_y": 1050,
        "front_title": "APAAR ID / ONE NATION ONE STUDENT ID",
        "front_sub": "Ministry of Education, Govt. of India",
        "name": "Priya Patel",
        "dob": "DOB: 24/03/2004 | Gender: Female",
        "id_val": "APAAR ID: 9481-2048-1923",
        "back_title": "Academic Bank of Credits (ABC)",
        "back_address": "NIT Surat - Enrollment: U20CS042\nVerified through DigiLocker & ABC Portal\nhttps://apaar.education.gov.in"
    },
    {
        "id": "03_abc_card_specimen",
        "title": "Academic Bank of Credits - Ministry of Education",
        "subtitle": "National Educational Technology Forum (NETF) Verification Document",
        "doc_text": [
            "DigiLocker ID: ABC-98210391209",
            "Holder: ARJUN VERMA",
            "Institution: Delhi University (Hansraj College)",
            "",
            "Credits Deposited: 74 Credits Verified",
            "This credit score record is valid across all National Credit Framework (NCrF) universities.",
            "Wallet format card is printed below for campus and examination access."
        ],
        "card_type": "dual",
        "card_y": 1080,
        "front_title": "ACADEMIC BANK OF CREDITS",
        "front_sub": "Ministry of Education, Govt. of India",
        "name": "Arjun Verma",
        "dob": "DOB: 10/11/2002 | Male",
        "id_val": "ABC ID: 192-384-910-231",
        "back_title": "National Academic Depository (NAD)",
        "back_address": "Hansraj College, University of Delhi\nRoll No: 2021/HAN/0912\nVerification: abc.gov.in"
    },
    {
        "id": "04_ayushman_pmjay_specimen",
        "title": "National Health Authority - Ayushman Bharat",
        "subtitle": "Pradhan Mantri Jan Arogya Yojana (AB-PMJAY) Golden Card Acknowledgement",
        "doc_text": [
            "Beneficiary State: Uttar Pradesh | District: Lucknow",
            "Family ID: UP-LKO-8829102",
            "Entitlement: Up to Rs. 5,00,000 per family per year for secondary & tertiary healthcare.",
            "",
            "Cashless treatment available at all empanelled public and private hospitals across India.",
            "Toll-Free Helpline: 14555 / 1800 111 565",
            "Card for hospital admission presentation is situated below."
        ],
        "card_type": "dual",
        "card_y": 1050,
        "front_title": "आयुष्मान कार्ड / AYUSHMAN CARD (PM-JAY)",
        "front_sub": "५ लाख रुपये तक मुफ्त उपचार / Cashless Health Cover",
        "name": "सुनीता देवी / Sunita Devi",
        "dob": "DOB: 02/05/1985 | Female",
        "id_val": "PMJAY ID: P18920491823",
        "back_title": "NATIONAL HEALTH AUTHORITY (NHA)",
        "back_address": "ABHA No: 14-8920-1920-8472\nAddress: Gram Rampur, Block Bakshi Ka Talab, Lucknow\nHelpline: 14555 | beneficiary.nha.gov.in"
    },
    {
        "id": "05_driving_licence_specimen",
        "title": "Ministry of Road Transport & Highways - MoRTH",
        "subtitle": "Parivahan Sewa - Sarathi DL Printout Form 7",
        "doc_text": [
            "Licensing Authority: RTO MH-12 (Pune, Maharashtra)",
            "Application Number: 284910284 / Date: 12-04-2023",
            "Holder: ROHIT DESHMUKH, S/O SURESH DESHMUKH",
            "",
            "Authorized to drive the following classes of vehicles throughout India:",
            "- MCWG (Motor Cycle With Gear): Valid till 14/04/2043",
            "- LMV (Light Motor Vehicle - Car): Valid till 14/04/2043",
            "Cut the driving licence card section below for driving wallet."
        ],
        "card_type": "dual",
        "card_y": 1080,
        "front_title": "INDIAN UNION DRIVING LICENCE",
        "front_sub": "Maharashtra State / RTO Pune (MH-12)",
        "name": "Rohit Deshmukh",
        "dob": "DOB: 14/04/1995 | Blood: B+ve",
        "id_val": "DL No: MH-1220230048192",
        "back_title": "VEHICLE ENDORSEMENTS & BADGES",
        "back_address": "COV: MCWG, LMV\nAddress: Flat 402, Shiv Shrushti, Kothrud, Pune - 411038\nIssued: 15/04/2023 | Valid To: 14/04/2043"
    },
    {
        "id": "06_eshram_card_specimen",
        "title": "Ministry of Labour & Employment - Govt of India",
        "subtitle": "National Database of Unorganised Workers (NDUW) - e-Shram Registration Slip",
        "doc_text": [
            "Registration Date: 22-09-2022 | State: Rajasthan",
            "Worker Name: MUKESH KUMAR GURJAR",
            "Social Security Entitlement: Pradhan Mantri Suraksha Bima Yojana (PMSBY)",
            "",
            "e-Shram card provides identity to unorganised sector workers across all Indian states.",
            "Portable across India for central & state welfare benefits.",
            "Cut the UAN Card section below."
        ],
        "card_type": "dual",
        "card_y": 1050,
        "front_title": "e-SHRAM CARD / ई-श्रम कार्ड",
        "front_sub": "श्रम एवं रोजगार मंत्रालय / Ministry of Labour",
        "name": "मुकेश कुमार गुर्जर / Mukesh Kumar",
        "dob": "DOB: 05/01/1988 | Male",
        "id_val": "UAN: 8491 0293 8472",
        "back_title": "NATIONAL SOCIAL SECURITY BOARD",
        "back_address": "Occupation: Agriculture / Construction\nAddress: Vill Piproli, Tehsil Bassi, Jaipur, Raj - 303301\nContact: eshram.gov.in | 14434"
    },
    {
        "id": "07_family_id_specimen",
        "title": "Government of Haryana / Citizen Resources Information Dept",
        "subtitle": "Parivar Pehchan Patra (Family ID) - Master Family Record",
        "doc_text": [
            "Family ID: PPP-8B29-4102 | District: Karnal",
            "Head of Family: SATISH CHANDER | Total Members: 4",
            "Verified Annual Family Income: Verified in Band 1.80L - 2.50L",
            "",
            "Family ID is required for DBT, Ayushman Bharat, Ration Card, and State Citizen Services.",
            "Scan QR code for real-time verification at meraparivar.haryana.gov.in.",
            "Official Family Smart Card cutout below:"
        ],
        "card_type": "dual",
        "card_y": 1060,
        "front_title": "PARIVAR PEHCHAN PATRA / परिवार पहचान पत्र",
        "front_sub": "Government of Haryana / परिवार पहचान पत्र",
        "name": "Satish Chander (Head of Family)",
        "dob": "Members: 4 | Ward: 12, Karnal",
        "id_val": "Family ID: 8B29-4102",
        "back_title": "FAMILY MEMBERS SUMMARY",
        "back_address": "1. Satish (Self) 2. Kamlesh (Spouse)\n3. Aman (Son) 4. Neha (Daughter)\nAddress: H.No 108, Model Town, Karnal - 132001"
    },
    {
        "id": "08_farmer_id_specimen",
        "title": "Ministry of Agriculture & Farmers Welfare - AgriStack",
        "subtitle": "Digital Agriculture Mission - Digital Farmer ID & PM-Kisan Certificate",
        "doc_text": [
            "Farmer ID: AGRI-MP-2024-910283",
            "Beneficiary: RAMESHWAR PRASAD PATIDAR",
            "District: Ujjain, Madhya Pradesh | Tehsil: Tarana",
            "Land Holding: 3.45 Hectares | Aadhaar Linked & Biometrically Seeded",
            "",
            "PM-Kisan Installment Status: Active (16th Installment Credited via DBT).",
            "Card below is for KCC loan subsidy and mandi procurement verification."
        ],
        "card_type": "dual",
        "card_y": 1080,
        "front_title": "DIGITAL FARMER ID / किसान पहचान पत्र",
        "front_sub": "AgriStack / Digital Agriculture Mission",
        "name": "Rameshwar Prasad Patidar",
        "dob": "Village: Bichhrod, Ujjain, MP",
        "id_val": "Farmer ID: MP-UJ-0918234",
        "back_title": "LAND & PM-KISAN PROFILE",
        "back_address": "Khasra Nos: 142/1, 142/2 | Area: 3.45 Ha\nPM-Kisan Reg: MP918204918\nPortal: agristack.gov.in | pmkisan.gov.in"
    },
    {
        "id": "09_health_id_abha_specimen",
        "title": "National Health Authority - Ayushman Bharat Digital Mission",
        "subtitle": "ABDM Digital Health Account - Official ABHA Card Sheet",
        "doc_text": [
            "ABHA (Ayushman Bharat Health Account) is your unique digital health identity.",
            "Link all your medical records, lab reports, and prescriptions securely.",
            "Holder: DRISHTI MENON",
            "Mobile: XXXXXXX842 | State: Kerala",
            "",
            "Share your health records digitally with verified doctors and clinics.",
            "Please cut out the ABHA Card format below:"
        ],
        "card_type": "dual",
        "card_y": 1060,
        "front_title": "ABHA CARD / आयुष्मान भारत स्वास्थ्य खाता",
        "front_sub": "National Health Authority - ABDM",
        "name": "Drishti Menon",
        "dob": "DOB: 18/09/1998 | Gender: Female",
        "id_val": "ABHA: 91-0492-9182-3819",
        "back_title": "AYUSHMAN BHARAT DIGITAL MISSION",
        "back_address": "ABHA Address: drishti.menon@abdm\nAddress: Palm Grove, Panampilly Nagar, Kochi - 682036\nPortal: abha.abdm.gov.in | Call: 14477"
    },
    {
        "id": "10_ration_card_specimen",
        "title": "Department of Food & Public Distribution - NFSA",
        "subtitle": "National Food Security Act - e-Ration Card Download Record",
        "doc_text": [
            "Ration Card No: 092819203912 | Scheme: Priority Household (PHH)",
            "Fair Price Shop (FPS) Code: 2819002 (Dealer: Shri Ram Ration Store)",
            "Head of Family: SHYAM SUNDAR MISHRA | District: Varanasi",
            "Monthly Grain Entitlement: 25 KG Wheat / Rice subsidized under NFSA.",
            "",
            "Portability: One Nation One Ration Card (ONORC) enabled across India.",
            "Pocket Card Format Cutout:"
        ],
        "card_type": "dual",
        "card_y": 1080,
        "front_title": "NATIONAL FOOD SECURITY CARD / राशन कार्ड",
        "front_sub": "NFSA Priority Household (PHH) / ONORC",
        "name": "Shyam Sundar Mishra",
        "dob": "Total Family Units: 5 Units",
        "id_val": "RC No: 0928 1920 3912",
        "back_title": "FAIR PRICE SHOP & GAS DETAILS",
        "back_address": "FPS: 2819002 Varanasi Cantt\nLPG Connection: IOCL Indane (Single Bottle)\nAddress: D-42/12 Godowlia, Varanasi - 221001"
    },
    {
        "id": "11_pan_card_specimen",
        "title": "Income Tax Department - Government of India",
        "subtitle": "Permanent Account Number (e-PAN) Acknowledgment & Letter",
        "doc_text": [
            "Acknowledgement No: N-882910294819203",
            "Issued under Section 139A of the Income-tax Act, 1961.",
            "To: AMITABH SEN, S/O BIKRAM SEN",
            "Address: 14/B Lake Road, Kolkata, West Bengal - 700029",
            "",
            "Important: PAN is mandatory for all financial transactions, bank accounts, and tax returns.",
            "Please cut the card portion below along the red boundary for PVC card lamination."
        ],
        "card_type": "dual",
        "card_y": 1120,
        "front_title": "आयकर विभाग / INCOME TAX DEPARTMENT",
        "front_sub": "भारत सरकार / GOVT. OF INDIA",
        "name": "AMITABH SEN / अमिताभ सेन",
        "dob": "Father: BIKRAM SEN | DOB: 12/06/1986",
        "id_val": "PAN: ABCPS1234F",
        "back_title": "INCOME TAX DEPARTMENT - GOVT OF INDIA",
        "back_address": "If found, please return to:\nIncome Tax PAN Services Unit, NSDL e-Gov / Protean\nHelpline: 020-27218080 | incometax.gov.in"
    },
    {
        "id": "12_voter_id_epic_specimen",
        "title": "Election Commission of India (ECI) / भारत निर्वाचन आयोग",
        "subtitle": "e-EPIC (Electors Photo Identity Card) Information Sheet",
        "doc_text": [
            "Downloaded from Voters Service Portal (voters.eci.gov.in)",
            "Assembly Constituency: 182-Alwar Urban | Parliamentary Constituency: Alwar",
            "Polling Station: Govt Senior Secondary School, Room No. 2",
            "",
            "Note: Possession of this card is not a guarantee of name in electoral roll.",
            "Check current voting status before election day on voter helpline app or 1950.",
            "Cut the e-EPIC card format below along dotted outline."
        ],
        "card_type": "dual",
        "card_y": 1100,
        "front_title": "ELECTION COMMISSION OF INDIA",
        "front_sub": "ELECTORS PHOTO IDENTITY CARD / मतदाता फोटो पहचान पत्र",
        "name": "NEHA RATHORE / नेहा राठौड़",
        "dob": "Father/Husband: DEEPAK RATHORE",
        "id_val": "EPIC NO: ZXC9182049",
        "back_title": "भारत निर्वाचन आयोग / ECI",
        "back_address": "Sex/Gender: Female | DOB: 08/02/1994\nAddress: H.No 12, Shivaji Park, Alwar, Rajasthan - 301001\nERO Signature: Verified Online | ECI 1950"
    }
]

def generate_document(card):
    img = Image.new("RGB", (A4_WIDTH, A4_HEIGHT), "#FFFFFF")
    draw = ImageDraw.Draw(img)
    
    # 1. Header Band
    draw.rectangle([0, 0, A4_WIDTH, 140], fill="#0F172A")
    draw.text((50, 35), card["title"], fill="#F8FAFC")
    draw.text((50, 75), card["subtitle"], fill="#94A3B8")
    
    # 2. National Emblem / Specimen watermark badge
    draw.rectangle([A4_WIDTH - 240, 25, A4_WIDTH - 40, 115], fill="#DC2626")
    draw.text((A4_WIDTH - 225, 45), "OFFICIAL SPECIMEN", fill="#FFFFFF")
    draw.text((A4_WIDTH - 210, 75), "FOR TESTING ONLY", fill="#FEE2E2")
    
    # 3. Document body text
    y_text = 180
    for line in card["doc_text"]:
        draw.text((60, y_text), line, fill="#334155")
        y_text += 32
        
    # Watermark diagonally in center of sheet
    draw.text((250, 650), "SPECIMEN - DUMMY DATA FOR TESTING", fill="#E2E8F0")
    draw.text((220, 720), "100% CLIENT-SIDE CARD CROPPING DEMO", fill="#E2E8F0")

    # 4. Card Section
    # CR80 card in pixels at this scale: ~500w x 315h
    cw = 520
    ch = 328
    cy = card["card_y"]
    
    # Total card bounding box (Front + Back side-by-side with 20px gap)
    total_w = cw * 2 + 20
    start_x = (A4_WIDTH - total_w) // 2
    
    draw_cut_guideline(draw, start_x - 10, cy - 10, total_w + 20, ch + 20)
    
    # FRONT CARD (Left)
    fx = start_x
    draw.rectangle([fx, cy, fx + cw, cy + ch], fill="#F8FAFC", outline="#0284C7", width=3)
    # Header of front card
    draw.rectangle([fx, cy, fx + cw, cy + 50], fill="#0284C7")
    draw.text((fx + 15, cy + 12), card["front_title"], fill="#FFFFFF")
    draw.text((fx + 15, cy + 32), card["front_sub"], fill="#E0F2FE")
    
    # Photo box
    draw_dummy_photo(draw, fx + 20, cy + 65, 100, 130)
    
    # Info on front
    draw.text((fx + 140, cy + 70), card["name"], fill="#0F172A")
    draw.text((fx + 140, cy + 105), card["dob"], fill="#475569")
    
    # Big ID number box
    draw.rectangle([fx + 140, cy + 145, fx + cw - 20, cy + 195], fill="#EFF6FF", outline="#93C5FD", width=1)
    draw.text((fx + 155, cy + 160), card["id_val"], fill="#1E3A8A")
    
    # Small QR on front
    draw_dummy_qr(draw, fx + cw - 110, cy + 205, 95)
    draw.text((fx + 20, cy + 295), "GOVERNMENT OF INDIA SPECIMEN", fill="#64748B")
    
    # BACK CARD (Right)
    bx = fx + cw + 20
    draw.rectangle([bx, cy, bx + cw, cy + ch], fill="#F8FAFC", outline="#0284C7", width=3)
    # Header of back card
    draw.rectangle([bx, cy, bx + cw, cy + 45], fill="#0369A1")
    draw.text((bx + 15, cy + 14), card["back_title"], fill="#FFFFFF")
    
    # Back address
    lines = card["back_address"].split("\n")
    by_text = cy + 60
    for bl in lines:
        draw.text((bx + 20, by_text), bl, fill="#334155")
        by_text += 26
        
    # Big QR on back
    draw_dummy_qr(draw, bx + cw - 140, cy + 180, 120)
    draw.text((bx + 20, cy + 295), "AUTHENTIC SCAN CODE | 100% PRIVATE", fill="#64748B")
    
    # Bottom margin text
    draw.text((60, A4_HEIGHT - 60), "End of official A4 document. Cropper website should detect & extract the rectangular card region above.", fill="#94A3B8")

    # Save PNG
    png_path = os.path.join(OUTPUT_DIR, f"{card['id']}.png")
    img.save(png_path, "PNG")
    
    # Save PDF
    pdf_path = os.path.join(OUTPUT_DIR, f"{card['id']}.pdf")
    img.save(pdf_path, "PDF", resolution=150.0)
    print(f"Generated: {png_path} and {pdf_path}")

def main():
    for card in CARDS:
        generate_document(card)
    print(f"Successfully generated all {len(CARDS)} specimen cards in {OUTPUT_DIR}")

if __name__ == "__main__":
    main()
