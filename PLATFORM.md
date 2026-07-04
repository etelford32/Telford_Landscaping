# Command Center — Multi-Business Platform Blueprint

> Status: **design only**. Nothing in this document has been built yet. It is the
> agreed architecture for managing multiple businesses from one place without
> giving up per-business isolation. Code lands in later phases.

## The problem

One operator, four customer-facing businesses:

| Business | Domain | Notes |
| --- | --- | --- |
| Elliot Telford (personal / portfolio) | elliottelford.com | |
| Parker's Physics | parkersphysics.com | |
| Explore the Universe | exploretheuniverse2175.com | **Data must stay physically isolated** |
| Telford Landscaping | telfordlandscaping.com | Lead-gen + 3D design tool (this repo) |

Managing each as a fully separate stack (its own database + auth + dashboard +
deploy) means four of *everything* to log into and hold in your head. That does
not scale for one person. The cost that hurts isn't dollars — it's **surface
area**.

## The principle

**Separate on the front. Aggregate on the back.**

- Customers see four separate businesses — separate domains, brands, frontends.
  That separation is cheap and easy to keep (independent Vercel deploys).
- The operator sees **one control plane** — a single dashboard that aggregates
  leads, traffic, and revenue across all four.
- Businesses that need isolation **keep their own database**; they forward only
  the management-level summary they choose to share.

## Architecture: hub-and-spoke

```
   SPOKES  (separate frontend, domain, and DB where needed)
   ┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐
   │ elliottelford.com │  │ parkersphysics.com│  │ exploretheuniverse│  │ telfordlandscaping│
   │                   │  │                   │  │   2175.com  🔒     │  │      .com         │
   └─────────┬─────────┘  └─────────┬─────────┘  └─────────┬─────────┘  └─────────┬─────────┘
             │                      │                      │                      │
             └──────────────┬───────┴──────────┬───────────┴──────────────────────┘
                            │   reportEvent()   │   ← one shared module, dropped into every site
                            ▼                   ▼
                  ┌─────────────────────────────────────┐
                  │   HUB   (one Supabase project)       │  businesses · leads · events
                  └───────────────────┬─────────────────┘
                                      ▼
                  ┌─────────────────────────────────────┐
                  │   COMMAND CENTER  (one dashboard)    │  unified leads inbox + KPI tiles
                  └─────────────────────────────────────┘
                       also reads → GA4 (traffic) · Stripe (revenue)
```

There are exactly three things to build. Everything else stays as it is.

---

## Component 1 — The shared reporting contract

The "shared implementation, separate sites" piece. Every site keeps its own
codebase, but they all speak one contract. You standardize it once and paste it
into each site.

A single function, `reportEvent`, POSTs a management event to the Hub's ingest
endpoint. It is a **safe no-op** until the site is configured with a Hub URL and
key, so it can ship into a site long before the Hub exists.

```ts
// lib/platform/reportEvent.ts  (identical across every site)
type PlatformEvent = {
  business: string;                 // 'telford_landscaping'
  type: 'lead' | 'signup' | 'sale' | 'pageview_summary';
  payload?: Record<string, unknown>;
};

export async function reportEvent(event: PlatformEvent): Promise<void> {
  const url = process.env.PLATFORM_HUB_URL;
  const key = process.env.PLATFORM_HUB_KEY;
  if (!url || !key) return; // no-op until the Hub is wired up

  try {
    await fetch(`${url}/api/ingest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-hub-key': key },
      body: JSON.stringify({ ...event, ts: new Date().toISOString() }),
    });
  } catch {
    // Reporting must never break the host app. Swallow and move on.
  }
}
```

**Design rules**

- Fire-and-forget. A Hub outage never affects a customer-facing site.
- Server-side only (the ingest key is a secret; never expose it in the browser).
- The host app's own data write is the source of truth. `reportEvent` is a
  secondary, best-effort forward.

### How Telford Landscaping uses it

The lead endpoint already exists (`app/api/contact/route.ts`). It gains one line
after the local write:

```ts
leads.push(lead);                                   // existing local write
await reportEvent({                                 // new: forward to the Hub
  business: 'telford_landscaping',
  type: 'lead',
  payload: { name: lead.name, email: lead.email, city: lead.city },
});
```

The plant-care endpoint (`app/api/contact/plant-care/route.ts`) gets the same
treatment with `payload.service` / `payload.location`.

---

## Component 2 — The Hub

One central Supabase project (**kept separate from every business project**) that
stores only management-level data. It is not a mirror of anyone's customer
database — each spoke forwards only what it opts to share.

### Schema

```sql
-- Registry of the businesses being managed.
create table businesses (
  id          text primary key,          -- 'telford_landscaping'
  name        text not null,
  domain      text not null,
  ga4_property_id text,                   -- for the traffic tile
  created_at  timestamptz not null default now()
);

-- Aggregated leads across all businesses — the unified inbox.
create table leads (
  id          uuid primary key default gen_random_uuid(),
  business_id text not null references businesses(id),
  name        text,
  email       text,
  meta        jsonb not null default '{}',   -- city, service, source, ...
  status      text not null default 'new',   -- new | contacted | won | lost
  created_at  timestamptz not null default now()
);

-- Generic management events (signups, sales, daily summaries).
create table events (
  id          uuid primary key default gen_random_uuid(),
  business_id text not null references businesses(id),
  type        text not null,                 -- 'signup' | 'sale' | 'pageview_summary'
  payload     jsonb not null default '{}',
  created_at  timestamptz not null default now()
);

create index on leads (business_id, created_at desc);
create index on events (business_id, type, created_at desc);
```

### Row-Level Security

- All tables have RLS **on**.
- The **ingest endpoint** writes with the service role (server-side, behind the
  `x-hub-key` check) — never from a browser.
- The **dashboard** reads with an authenticated operator session; a policy
  restricts rows to businesses the signed-in operator owns. For a single operator
  this is simply "authenticated = full read."

### Ingest endpoint

A tiny API route on the Hub (`/api/ingest`) that:

1. Verifies the `x-hub-key` header against `PLATFORM_HUB_KEY`.
2. Validates the event shape.
3. Inserts into `leads` (for `type: 'lead'`) or `events` (everything else).

---

## Component 3 — The Command Center dashboard

One Next.js app (its own repo, its own deploy — e.g. `admin.elliottelford.com`).
It reads:

- **The Hub** — combined leads inbox + new-lead / signup / sale counts.
- **GA4 Data API** — sessions, conversions per business (one read-only Google
  service account, each business's GA4 property id stored in `businesses`).
- **Stripe** — revenue per business (one Stripe account with a `business`
  metadata tag, or one connected account per business).

### Pages (v1)

| Page | Shows |
| --- | --- |
| **Overview** | KPI tile per business: 7-day traffic, new leads, revenue, deploy status |
| **Leads** | Unified inbox across all businesses; filter by business; mark new/contacted/won/lost |
| **Business detail** | Drill into one business: its leads, its GA4 funnel, its revenue |

### Auth

Single-operator login (Supabase Auth on the Hub, magic-link or password). No
customer accounts here — this app is for you only.

---

## The isolation model (why Explore the Universe stays safe)

Each spoke chooses a **sharing tier**. Isolation is never broken; you only ever
send *up* what you deliberately choose to.

| Tier | What the spoke forwards | Use for |
| --- | --- | --- |
| **Full** | Lead name, email, message metadata | Telford Landscaping, Parker's Physics |
| **Metadata only** | Counts + timestamps + source (no PII, no content) | Explore the Universe 🔒 |
| **None** | Nothing forwarded; dashboard connects read-only on demand | Anything fully siloed |

Explore the Universe runs at **Metadata only**: the dashboard shows "3 new leads
today, from the pricing page," while the actual lead content never leaves its own
isolated project. You still see activity; the data stays locked down.

---

## Cost model

Everything can live in **one Supabase organization** on the **Pro plan**
(billing is per-org, not per-project):

| Item | Monthly |
| --- | --- |
| Pro plan (per org) | $25 |
| Compute: Hub + business projects (~$10 each, first covered by credit) | ~$10 × (N−1) |
| Vercel (hobby/pro per site) | $0–$20 |

Example — Hub + 4 business projects, default Micro compute, one org:
`$25 + $50 compute − $10 credit ≈ $65/mo` for the entire portfolio, with the Hub
tying it together. Explore the Universe keeps its own project (isolation) while
still surfacing in the dashboard.

---

## Phased rollout

| Phase | Work | Repo | Blocked by |
| --- | --- | --- | --- |
| **0** | Landscaping "hub-ready": add `reportEvent` (no-op), call it from both lead endpoints | `telford_landscaping` | nothing |
| **1** | Create the Hub Supabase project; apply schema + RLS; build `/api/ingest`; flip landscaping's `PLATFORM_HUB_*` env on | Hub repo | Supabase Pro upgrade |
| **2** | Build the Command Center dashboard (Overview + Leads inbox) reading the Hub | Command Center repo | Phase 1 |
| **3** | Add GA4 traffic tiles (Google service account) and Stripe revenue tiles (connector authorized) | Command Center repo | GA4 SA, Stripe auth |
| **4** | Drop the `reportEvent` module into the other three sites, set their sharing tier | each site repo | per-site |

## Repos & hosting

- **Hub** and **Command Center** each get their own repo (not this one). This repo
  (`telford_landscaping`) only ever holds the landscaping spoke + its copy of the
  shared `reportEvent` module.
- Suggested deploys: Hub = Supabase project + a minimal API (can be Supabase Edge
  Functions or a tiny Next route); Command Center = Vercel at an admin subdomain.

## Open decisions (revisit before Phase 1)

1. **One org or several?** One org = cheapest and simplest (recommended). Separate
   orgs only if a business needs its own billing entity (e.g. you might sell it).
2. **Stripe topology** — one account tagged by `business`, or one connected
   account per business? Depends on whether the businesses are separate legal
   entities.
3. **Hub API host** — Supabase Edge Functions vs. a small Next.js API on the
   Command Center deploy. Edge Functions keep the Hub self-contained.
4. **Sharing tier per business** — confirm Explore the Universe = Metadata only,
   and set the others.

---

*This document is the source of truth for the platform architecture. Update it as
decisions are made; build against it phase by phase.*
