# Atelier — Luxury Wedding Planning & Execution Platform

Atelier is a full-stack, multi-tenant wedding management platform designed for boutique wedding planners. It streamlines event workspace management, household-grouped guest rosters, reception table and seat assignments, and frictionless, token-secured guest RSVPs.

---

## Key Features

### 1. Multi-Tenant Wedding Workspaces
* Create and manage independent wedding event workspaces with couple profiles, event dates, and venue details.
* Editorial dashboard interface built with Cormorant Garamond serif typography and warm ivory/champagne styling.

### 2. Household & Guest Roster Management
* Organize guests into **Household Groups** for unified RSVP tracking and family-level coordination.
* Track individual entrée selections (Chicken, Beef, Fish, Vegetarian, Vegan) and specific dietary restrictions or allergies.
* One-click **Copy RSVP Link** action per household to distribute private invitation URLs.

### 3. Reception Seating Chart & Table Management
* Create round, rectangular, or head reception tables with configurable seat capacities.
* Automatically generates individual seat records upon table creation.
* Real-time occupancy tracking (`Seated` vs. `Unseated` counts) with one-click guest-to-seat assignment and unassignment.

### 4. Token-Secured Public RSVP Portal (`/rsvp/[token]`)
* Zero-friction digital invitation portal accessible via unique, indexed household tokens—no guest account registration or login required.
* Strict token-scoped authorization ensures guests can only view and update records belonging to their own household.
* Live synchronization with the planner's workspace upon submission.

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | Next.js 16 (App Router, Turbopack), React, TypeScript, Tailwind CSS, Lucide Icons |
| **Backend** | ASP.NET Core Web API (.NET), Entity Framework Core |
| **Database** | PostgreSQL (Containerized via Docker) |
| **Architecture** | RESTful API, Modular Frontend Service Layer (`weddingApi`), Token-Based Scoped Access |

---

## Project Structure

```text
wedding-planner-platform/
├── backend/                        # ASP.NET Core Web API
│   ├── Controllers/                # Weddings, Households, Guests, Tables, Seating, RSVP endpoints
│   ├── Data/                       # Entity Framework Core DbContext & configurations
│   ├── Models/                     # Domain entities (Wedding, Household, Guest, Table, Seat)
│   └── Program.cs                  # Service registration, CORS policy, middleware pipeline
└── frontend/                       # Next.js 16 Application
    └── src/
        ├── app/
        │   ├── page.tsx            # Wedding Workspaces dashboard
        │   ├── wedding/[id]/       # Workspace detail view & modular feature tabs
        │   └── rsvp/[token]/       # Public token-secured guest invitation portal
        ├── services/
        │   └── weddingApi.ts       # Centralized typed API client
        └── types/
            └── wedding.ts          # Shared TypeScript domain interfaces
