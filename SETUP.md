# Epic Training Simulator - Setup Guide

## Quick Start

This is a production-ready Epic training simulator built for certification exam preparation. It implements the Chronicles database structure and core Epic modules (Prelude and Grand Central).

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- A Convex account (free tier available at [convex.dev](https://convex.dev))

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/oldmangrizzz/Hyper.git
   cd Hyper
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Convex:**
   ```bash
   npx convex dev
   ```
   
   This will:
   - Prompt you to log in or create a Convex account
   - Create a new project or select an existing one
   - Generate the necessary files in `convex/_generated/`
   - Create a `.env.local` file with your Convex URL

4. **Run the development server** (in a new terminal):
   ```bash
   npm run dev
   ```

5. **Open the simulator:**
   Navigate to [http://localhost:3000](http://localhost:3000)

6. **Initialize the system:**
   On first launch, you'll see an initialization modal. Click "Initialize System" to create:
   - Facility structure (EAF)
   - Departments (DEP)
   - Rooms and Beds (ROM/BED)
   - Security Classes (ECL)
   - System Configuration (LSD)
   - Training Scenarios
   - Template Patient Records (Golden Records)

## Features

### 1. Prelude Registration Module
- Patient (EPT) creation and management
- Guarantor (EAR) linkage
- Real-time validation with Hard Stops, Soft Stops, and Warnings
- Pediatric constraint enforcement (age < 18 cannot self-guarantee)
- Address mismatch detection

### 2. Grand Central Bed Management
- Room and bed census overview
- Gender-aware bed assignment with validation
- Bed status tracking (Available, Occupied, Housekeeping)
- Real-time validation of gender restrictions
- Patient assignment and release workflows

### 3. Facility Structure & Settings
- Hierarchical settings visualization
- Rule of Specificity (Bubble-Up) demonstration
- Department → Revenue Location → Service Area → Facility → System Default
- Effective settings calculation and inheritance source display

### 4. Security (SEC 900)
- 4 pre-configured security classes
- Permission-based access control
- Security violation examples
- Bed Planner access requirements

### 5. Mitosis Reset Engine
- Manual trigger for data cleanup
- Preserves template "Golden Records"
- Date-sliding for template patients
- Statistics and history tracking

### 6. Training Scenarios
- 5 certification fail-states:
  1. **Inheritance Fail** - Settings override issues
  2. **Filing Order Fail** - Payer of Last Resort violations
  3. **Bed Logic Fail** - Gender restriction violations
  4. **RTE Mapping Fail** - Unmapped eligibility codes
  5. **Three-Day Window Fail** - ED-to-Inpatient bundling failures

## Usage Guide

### For Training

1. **Start with the Overview Tab**
   - Review system status and available features
   - Understand the Chronicles data kernel structure

2. **Practice Patient Registration**
   - Create test patients
   - Link guarantors
   - Observe validation rules in action
   - Test pediatric constraints

3. **Practice Bed Management**
   - Assign patients to beds
   - Test gender restriction validations
   - Experience hard stops when rules are violated

4. **Study Facility Inheritance**
   - Review the facility hierarchy
   - Understand how settings bubble up
   - See effective settings at each level

5. **Test Training Scenarios**
   - Review each fail-state scenario
   - Navigate to the relevant module
   - Attempt the action that should fail
   - Observe the expected outcome

### For Certification Exam Prep

- **Understand Hard Stops vs. Soft Stops**
  - Hard Stops: Block the action completely
  - Soft Stops: Warning that can be overridden
  - Warnings: Informational only

- **Master the Chronicles Hierarchy**
  - INI → Record → Contact → Item → Value
  - Static vs. Dynamic master files
  - Volatility types and mitosis behavior

- **Know Security Requirements**
  - Which actions require which security points
  - Common security violation scenarios
  - Permission inheritance patterns

## Architecture

### Frontend
- **Framework:** Next.js 16 (React 19) with TypeScript
- **Styling:** Tailwind CSS
- **State Management:** Convex React hooks
- **Components:** Custom UI component library

### Backend
- **Database:** Convex.dev (real-time reactive database)
- **Schema:** Chronicles-inspired INI/Record/Contact/Item/Value structure
- **Validation:** TypeScript business rules engine
- **Data Persistence:** Cloud-hosted Convex database

### Key Files
- `/app/page.tsx` - Main application shell
- `/app/components/` - UI modules for each feature
- `/app/components/ui.tsx` - Reusable UI component library
- `/convex/schema.ts` - Database schema
- `/convex/validation.ts` - Validation logic
- `/convex/bedManagement.ts` - Bed assignment logic
- `/convex/facilityStructure.ts` - Settings inheritance
- `/convex/mitosis.ts` - Reset engine
- `/convex/seedData.ts` - Data initialization

## Troubleshooting

### "System Not Initialized" error
- Click the "Initialize System" button in the Overview tab
- This only needs to be done once per Convex deployment

### Build errors about missing `convex/_generated/api`
- Run `npx convex dev` to generate the necessary files
- Make sure the Convex dev server is running

### Validation not working
- Check that you've initialized the system
- Verify that template patients and guarantors exist
- Review the validation logic in `/convex/validation.ts`

### Font loading warnings
- These are cosmetic and don't affect functionality
- They occur when the build environment doesn't have internet access to Google Fonts
- Fonts will load normally when running the dev server

## Development

### Adding New Features

1. **Backend (Convex):**
   - Update schema in `/convex/schema.ts`
   - Add queries/mutations in relevant files
   - Test with Convex dashboard

2. **Frontend:**
   - Create new component in `/app/components/`
   - Use UI components from `/app/components/ui.tsx`
   - Integrate with Convex hooks (`useQuery`, `useMutation`)

### Database Management

- **View data:** Use the Convex dashboard at `https://dashboard.convex.dev`
- **Reset data:** Run Mitosis from the UI, or use the `resetSystem` mutation
- **Add initial data:** Modify `/convex/seedData.ts`

## License

This project is for educational purposes. Epic, Chronicles, Grand Central, Prelude, and Hyperspace are trademarks of Epic Systems Corporation.

## Support

For questions or issues:
1. Check this README
2. Review the inline documentation in the code
3. Open an issue on GitHub

## Credits

Built for Epic certification exam preparation, implementing the specifications from:
- `Simulator.MD` - Technical architecture and requirements
- `Prelude.md` - Epic modules and certification concepts
