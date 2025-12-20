# Epic Grand Central & Prelude Training Simulator

A web-based training environment that simulates Epic's Chronicles database for Prelude (Registration) and Grand Central (ADT) modules. This simulator is designed to train Principal Trainer (PT) candidates for their TED 300 and MST certification exams.

## 🎯 Project Overview

This application replicates the underlying logic of Epic's Chronicles database without utilizing actual proprietary software. It provides a safe training environment where users can:

- Practice patient registration workflows (Prelude)
- Learn bed management and ADT operations (Grand Central)
- Understand Epic's INI > Record > Contact > Item > Value hierarchy
- Test facility structure settings inheritance ("bubble-up" logic)
- Experience Epic's validation rules (Hard Stops and Soft Stops)
- Practice with realistic training scenarios including fail-states

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (React) + TypeScript
- **Backend/Database**: Convex.dev (Reactive Database)
- **Styling**: Tailwind CSS
- **Validation Logic**: TypeScript Business Rules
- **Schema**: Epic Chronicles data structure simulation

## 📚 Documentation

This project includes comprehensive documentation about Epic systems:

- **[Prelude.md](./Prelude.md)** - Detailed documentation about Epic's Grand Central, Prelude, and Eligibility modules
- **[Simulator.MD](./Simulator.MD)** - Technical specification for this training simulator

## 🏗️ Architecture

### Chronicles Data Kernel

The simulator implements Epic's core data structure:

```
INI (Master Files) → Records → Contacts → Items → Values
```

Key master files implemented:
- **EPT** - Patient Records (Dynamic)
- **EAR** - Guarantor Records (Dynamic)
- **HSP** - Hospital Accounts (Dynamic)
- **DEP** - Departments (Static)
- **BED** - Beds (Static)
- **ROM** - Rooms (Static)
- **EAF** - Facilities (Static)
- **ECL** - Security Classes (Static)
- **LOR** - Workflow Rules (Static)
- **LVN** - Navigators (Static)

### Core Features

#### 1. Pediatric Guarantor Trap Validation
Implements Cook Children's Profile rules:
- Every patient must be linked to a guarantor
- Patients under 18 cannot be their own guarantor
- Address mismatch warnings

#### 2. Facility Structure & Settings Inheritance
Settings "bubble up" through the hierarchy:
```
Department → Revenue Location → Service Area → Facility → System Default
```

#### 3. Bed Management with Gender Validation
- Hard stops prevent gender-restricted bed violations
- Room and bed-level gender restrictions
- Bed availability tracking

#### 4. Mitosis Reset Engine
Automated nightly cleanup:
- Purges non-template dynamic records
- Preserves "Golden Records" (templates)
- Date-slides template records to maintain relative ages

#### 5. Training Scenarios
Five fail-state scenarios for testing:
1. **Inheritance Fail** - Setting override issues
2. **Filing Order Fail** - Insurance priority errors
3. **Bed Logic Fail** - Gender restriction violations
4. **RTE Mapping Fail** - Eligibility response mapping
5. **Three-Day Window Fail** - Visit bundling errors

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Convex account (free tier available)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/oldmangrizzz/Hyper.git
cd Hyper
```

2. Install dependencies:
```bash
npm install
```

3. Set up Convex:
```bash
npx convex dev
```

This will:
- Create a new Convex project (or link to existing)
- Generate the database schema
- Start the development server

4. Run the development server (in a new terminal):
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

### Initial Setup

Initialize the template "Golden Records" via the API or UI once the app is running.

## 📖 Usage

### Patient Registration

1. Create a new patient record (EPT)
2. Link to a guarantor (EAR)
3. System validates:
   - Guarantor linkage
   - Pediatric age constraints
   - Address matching

### Bed Assignment

1. View available beds
2. Select patient and bed
3. System validates:
   - Gender restrictions (room and bed level)
   - Bed availability
4. Complete assignment

### Settings Management

1. Configure settings at any hierarchy level
2. View effective settings with inheritance path
3. Test inheritance with validation scenarios

### Mitosis Reset

Run manual reset or schedule automated runs:
- Clears dynamic test data
- Preserves templates
- Updates template dates

## 🧪 Testing

The simulator includes built-in fail-state scenarios for training purposes.

## 📁 Project Structure

```
/
├── app/                    # Next.js app directory
│   ├── page.tsx           # Home page
│   └── layout.tsx         # Root layout
├── convex/                # Convex backend
│   ├── schema.ts          # Database schema
│   ├── validation.ts      # Validation logic
│   ├── mitosis.ts         # Reset engine
│   ├── facilityStructure.ts # Settings inheritance
│   ├── bedManagement.ts   # Bed operations
│   └── crud.ts            # CRUD operations
├── public/                # Static assets
├── Prelude.md            # Epic documentation
├── Simulator.MD          # Technical specification
└── README.md             # This file
```

## 🔒 Security

- No actual Epic software or data is used
- All data is simulated for training purposes
- Follows Epic's architectural patterns for educational value
- SEC 900 security class implementation (simulated)

## 📝 License

This project is for educational purposes. Epic, Chronicles, Grand Central, Prelude, and Hyperspace are trademarks of Epic Systems Corporation.

## 🙏 Acknowledgments

- Epic Systems for their innovative healthcare software architecture
- The Epic user community for documentation and insights
- Training materials and certification programs that inspired this simulator

---

**Note**: This is a training simulator and does not contain or connect to actual Epic software or patient data. All scenarios and data are simulated for educational purposes.
