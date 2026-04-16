# PerformIQ

**Data-driven Performance Management System with empathy-adjusted ratings, goal tracking, and AI-powered feedback.**

![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5.3-646CFF?logo=vite&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

---

## Overview

PerformIQ is a role-based performance management system designed around three core principles:

1. **Data-driven ratings** — Employee ratings are computed entirely from weighted goal completion. Managers can view but never edit ratings.
2. **Empathy-adjusted scoring** — Life events (medical leave, bereavement, etc.) ethically recalibrate ratings for affected periods with full transparency.
3. **Actionable insights** — AI-powered feedback, priority-sorted goal views, and drill-down reports turn data into decisions.

## Features by Role

### Employee
| Feature | Description |
|---------|-------------|
| **Dashboard** | Personal performance snapshot with rating trend, category breakdown, upcoming deadlines, and quick actions |
| **My Goals** | Priority-sorted goals (needs attention → on track → completed) with progress updates, file uploads, and weight change requests |
| **AI Feedback** | Personalized recommendations, skill radar, priority focus areas, and next steps based on goal data |
| **My Rating** | Transparent, read-only rating with full contribution breakdown and history |
| **Life Events** | Add/edit/delete life events with manager approval workflow and empathy adjustment visibility |

### Manager
| Feature | Description |
|---------|-------------|
| **Dashboard** | Team health overview, rating distribution chart, and pending approval alerts |
| **My Team** | Expandable member cards with goal heatmap, toggle between IDs/descriptions, and goal assignment |
| **Goal Management** | Unique goal union across team, custom goal creation |
| **Approvals** | Approve/reject weight changes and life events |
| **Team Report** | Filterable reports with bar chart comparison, detailed table, and individual drill-down |

### Admin
| Feature | Description |
|---------|-------------|
| **Dashboard** | Organization-wide metrics, department performance chart, and health summary |
| **User Management** | Full CRUD — add, edit, deactivate users with role/manager/group mapping |
| **Goal Management** | Full CRUD — add, edit, delete goal templates from the org catalog |
| **Rating Periods** | Create, edit, and activate evaluation periods with overlap validation |
| **Groups** | Role-based goal template groups with full CRUD |
| **Org Report** | Department and individual drill-down with manager filter |

## Demo Accounts

| Role | Email | Password |
|------|-------|----------|
| Employee | `emp1@demo.com` | `Demo1234!` |
| Manager | `mgr1@demo.com` | `Demo1234!` |
| Admin | `admin@demo.com` | `Demo1234!` |

## Getting Started

```bash
# Clone the repository
git clone https://github.com/<your-username>/performiq.git
cd performiq

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app runs at `http://localhost:3000` by default.

## Project Structure

```
performiq/
├── public/
│   └── vite.svg              # Favicon
├── src/
│   └── App.jsx               # Complete application (single-file SPA)
│   └── main.jsx              # React entry point
├── docs/
│   ├── Employee.md            # Employee role requirements
│   ├── Manager.md             # Manager role requirements
│   └── Admin.md               # Admin role requirements
├── index.html                 # HTML entry
├── package.json
├── vite.config.js
├── .gitignore
└── README.md
```

## Architecture Decisions

- **Single-file SPA**: The entire app lives in `App.jsx` for portability and demo simplicity. In production, components would be split into separate files under `src/components/`.
- **In-memory state**: All data is managed via React `useState` at the root `App` component and passed down as props. No external state library is needed at this scale.
- **No backend**: This is a fully client-side demo. In production, the state layer would be replaced with API calls to a backend (Node.js/Express + PostgreSQL recommended).
- **Recharts**: Used for all charts (area, bar, pie, radar) with consistent dark theme styling.

## Key Design Principles

- **No manager influence on ratings**: Ratings are computed purely from `Σ(completion × weight) / Σ(weight)` with optional empathy adjustments.
- **Empathy adjustment formula**: `rating × min(1 + approved_leave_days × 0.003, 1.10)` — capped at 10% boost.
- **Priority sorting**: Goals always show needs-attention first, then on-track, then completed.
- **Audit trail**: Every goal update is timestamped and logged. Life events show who approved them.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 |
| Build | Vite 5 |
| Charts | Recharts |
| Icons | Lucide React |
| Styling | Inline CSS with design tokens |

## License

MIT
