<<<<<<< HEAD
# Root-Nexus
=======
# 🚀 SectorSync — JIIT CSE Personal Student Cockpit

A high-performance personal campus dashboard tailored specifically for **JIIT Noida (Sector 62 / Sector 128)** Computer Science students.

Built with **Next.js 14 (App Router)**, **React 18**, **Tailwind CSS**, and **Lucide React** icons.

---

## 🎨 Dual Theme & Liquid Glass Design System

SectorSync features a fluid design system with switchable themes and accent tinges:

1. **Liquid Glass Dark Theme (Default)**
   - Deep obsidian background (`#07090e`) with multi-layered specular highlights (`border-t-white/20`).
   - Ambient radiant glow orbs that adapt to the selected tinge.
   - Glass pill badges, smooth reflections, and backdrop blur.

2. **Glassmorphism Light Theme**
   - Translucent frosted glass layers (`bg-white/70 backdrop-blur-xl`).
   - Subtle specular edge highlights with diffused drop shadows (`shadow-[0_8px_32px_rgba(31,38,135,0.07)]`).
   - High-contrast typography optimized for readability.

3. **Switchable Accent Tinges**
   - 💜 **Violet Glow** (Electric Violet / Indigo)
   - 🩵 **Cyan Frost** (Cyberpunk Cyan / Turquoise)
   - 💚 **Emerald Matrix** (Mint Green)
   - 🧡 **Sunset Amber** (Golden Amber)
   - 🩷 **Rose Blush** (Neon Rose)

*All theme and tinge preferences are automatically persisted in `localStorage`.*

---

## 🧭 Key Views & Features

### 1. Dashboard / Today at a Glance
- **Overall Attendance Quick Stats**: Total attended vs held count, aggregate percentage, and safety status.
- **Classes at Risk Counter**: Instant warning for any subject falling below the 75% threshold.
- **"Next Up" Live Class Card**: Dynamic card showing the upcoming lecture/lab, Room/Lab number (e.g. `CL-04 Abb-III`, `LT-2`), faculty name, and immediate bunk buffer impact.
- **"Today's Mess Menu" Preview**: Time-aware meal preview (Breakfast, Lunch, Snacks, Dinner) from Annapurna Mess with special dish badge (e.g., *Hot Gulab Jamun*, *Special Kadhi Chawal*).
- **Quick Action Launchers**: Direct jumps to Bunk Predictor, Timetable, Study Notes, and Cafe Rates.

### 2. Attendance & Bunk Predictor
- Tailored for the **JIIT 75% Rule** with configurable target threshold (75%, 80%, 85%).
- Complete enrolled course list:
  - `15B11CI111`: Software Development Fundamentals - I (SDF-1)
  - `15B11MA111`: Mathematics - I (Calculus & Linear Algebra)
  - `15B11PH111`: Physics - I (Oscillations & Modern Optics)
  - `15B11EC111`: Basic Electrical & Electronics Engineering (BEEE)
  - `15B11HS111`: English & Professional Communication
  - `15B17CI171`: Software Development Lab - I
  - `15B17PH171`: Physics Laboratory - I
- Interactive **`+ Present`** and **`+ Absent`** buttons with instant state calculation and `localStorage` persistence.
- Dynamic color progress bar: **Green (≥ 80%)**, **Amber (75%–79%)**, **Red (< 75%)**.
- Exact mathematical projection:
  - **Safe Bunk**: $\lfloor \frac{A - 0.75N}{0.75} \rfloor$
  - **Recovery Deficit**: $\lceil \frac{0.75N - A}{0.25} \rceil$
- **Hypothetical Bunk Simulator**: Tap `-` / `+` on any subject to preview what your attendance becomes if you skip upcoming classes.

### 3. Schedule & Timetable
- **Day Selector (Mon – Sat)** with session load summary (e.g., *3 Lectures, 1 Lab (2h), 2 Tutorials*).
- Distinct color tags for **Lecture** (blue), **Lab** (emerald), **Tutorial** (violet), and **Break** (amber).
- Exact Room & Lab numbers (`LT-1`, `LT-2`, `CL-04 Abb-III`, `TS-2 Physics Lab`, `FF-6`).
- Filter by session type (All, Lectures, Labs, Tutorials).

### 4. Notes & PYQs Hub
- Filter by subject and material type (**T1 Notes**, **T2 Notes**, **End-Sem**, **Lab Sheets**, **PYQs**).
- Resource cards with contributor tags, file formats (PDF, ZIP, DOC), file sizes, and simulated instant download button.
- **Interactive Student Scratchpad**:
  - Live markdown/text editor for quick lecture notes, hostel reminders, or exam checklists.
  - Category tags (*Academic*, *Doubts*, *Personal*, *Exam*).
  - Auto-persists to `localStorage` with real-time update timestamps.

### 5. Campus Food & Cafe Rates
- **Annapurna Mess Menu**: Full 7-day breakdown for Breakfast, Lunch, Snacks, and Dinner with daily special highlights.
- **Cafe & Tuck Shop Rates**: Searchable catalog of campus eateries (Nescafe Kiosk, Annapurna Tuck Shop, Sub-station Cafe, Jaypee Night Canteen) with pricing in ₹ and preparation times.
- **Quick Order Tray & Split Bill Calculator**: Add items to your tray to compute total cost and calculate per-person splits (e.g., split between 2 or 3 roommates).

---

## 🛠️ Development & Running

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

Default local address: **`http://localhost:3000`**
>>>>>>> 94fe9f1 (Commit - 1: Prototype)
