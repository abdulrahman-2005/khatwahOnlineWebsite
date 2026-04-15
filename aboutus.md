# COMPANY CONTEXT DOCUMENT
> This file provides full context about Khatwa Online for use by AI tools, assistants, and agents. Treat this as the source of truth about who we are, what we build, and who we serve.

---

## 1. IDENTITY

**Brand Name:** خطوة اونلاين — Khatwah Online
**Translation:** "Step Online" / "Step to Online"
**Mission:** Help local businesses in Egypt transition from offline-only operations to a real online presence — e-commerce, reservations, inventory, and delivery.
**Founded by:** Three CS graduates from Arish, North Sinai, Egypt
**Stage:** Pre-revenue, launching operations
**website** https://khatwah.vercel.app/ - in development
---

## 2. TEAM

| Name | Role | Equity |
|------|------|--------|
| Abdelrahman | CTO / Product Lead / Admin | 40% |
| Ahmed | Backend Lead / Online Acquisition | 35% |
| Mahmoud | Offline Sales / Lead Generation | 25% |

**Team background:**
- All three founders are third-year Computer Science students, age 20, from Arish — they are native to the market they are targeting
- **Abdelrahman (CTO):** 7+ years of self-directed learning in software. Built fullstack SvelteKit applications for real paying clients including stripe payments, server management (Nginx, SSH), and database architecture. Designed and built a full accounting and admin system for a real construction business managing 30–100 accounts, reducing operational time from 8–12 hours to 2–4 hours daily. Currently learning Next.js and React. Strong AI-assisted development capability — can prototype and ship a full product within two weeks. Handles product architecture, scope assessment, pricing, and company accounting.
- **Ahmed (Backend Lead):** Completed a structured backend roadmap in .NET / C#, giving him strong system design and REST API fundamentals. Currently transitioning that knowledge to Node.js / Next.js / React. Has independently landed clients through online channels and produced short-form video content for marketing. Handles backend implementation, online client acquisition, and client-facing meetings.
- **Mahmoud (Sales):** Lifelong market experience — has worked in local shops and retail since childhood. Currently employed at a well-known local store. Handles offline lead generation, cold outreach to local businesses, and first-contact sales conversations. Brings warm introductions into technical meetings closed by Abdelrahman and Ahmed.
 

**Unfair advantage:**
- Low competetion: market is used to local bad looking old visual basic style apps with no modernization in mind and no plans for online exposure, we fill this gap

---

## 3. MARKET

### 3.1 Target Market — Stage 1 (Current)

**City:** Arish, North Sinai, Egypt
**Population:** 200,000–300,000
**Online business penetration:** ~5–20% estimated, mostly food delivery
**Current discovery method:** Facebook/Instagram page → phone call → manual process

**Client profile:**
- Medium to large local businesses
- Monthly profit range: 10,000–100,000+ EGP
- Target pricing: 10,000–15,000 EGP setup +/- 500–1,000 EGP/month subscription
- Interested segments (~20–30% of market): stores selling phones, home goods, tools, expensive products

**Client psychology:**
- Generally open to going online under the right circumstances
- Hard to convince on pricing — perceive 10–15k as unnecessary or excessive
- Will become easier to convert once peers visibly succeed online (social proof effect)

**End customer profile (buyer of our clients' products):**
- Residents of Arish
- Younger people who want to buy online but lack local options
- Established adults (30+) with money who want online convenience
- Pain point: no major Egyptian platforms (e.g. Noon, Amazon.eg) deliver natively to Arish, forcing residents to pay extra or travel

**Key geographic context:**
- Arish is the capital of North Sinai, near the Egyptian-Palestinian border
- The governorate was under instability for years due to regional conflict — now stable and safe
- Major e-commerce platforms still do not offer native delivery here
- This creates a real gap our clients' online stores can fill locally

---

## 4. EXPANSION STAGES

### Stage 1 — Local Market (Active)
- City: Arish
- Method: Offline outreach, face-to-face sales, local relationships
- Goal: Build initial client base, establish proof of concept and social proof

### Stage 2 — Egyptian Market
- Target: Neighboring governorates → Ismailia → Port Said → Suez → Cairo
- Method: Shift to online outreach and digital sales funnel
- Goal: Scale without proportional increase in headcount

### Stage 3 — Global Market
- Method: Same expansion model, reorganized pipeline and legal structure
- Note: International clients will be accepted at any stage if inbound, but will not be deliberately targeted until Stage 3

---

## 5. PRODUCTS & SERVICES

> We sell 3 services and operate 1 internal brand product.

---

### SERVICE 1 — Booking & Online Reservation App

**Problem it solves:**
Current process: customer searches social media → finds phone number → calls → gets told to come in person OR gives phone info manually → no confirmation system, no reminders, no payments.

**What we offer:**
- Web-based booking system for barbershops, clinics, service providers
- Customers view available calendar slots and book directly
- Optional: online payment integration
- Customer receives ticket/ID for their appointment
- Notifications for delays or changes
- Rewards and loyalty points system

---

### SERVICE 2 — Inventory Manager (3 Tiers)

**Tier 1 — Basic Inventory & POS**
- Standard inventory management and point-of-sale
- Automated P&L calculations
- Supplier cost and payment tracking
- Accounting automation

**Tier 2 — +Servicing**
- Everything in Basic
- Work order management for service businesses (phone repair, auto centers, etc.)
- Labor cost tracking, customer item intake, discount management

**Tier 3 — +Online Store**
- Everything in Servicing
- Inventory automatically synced to a live online store on the client's own domain
- "Show online" checkbox per product — instant catalogue publishing
- Live stock availability visible to end customers
- Full e-commerce: COD, payment methods, delivery management, offers, UI customization

---

### SERVICE 3 — Custom Software

- Any custom website or web application the client requests
- Scoped and priced per project

---

### BRAND PRODUCT — Khatwa City Catalogue (Internal)
khatwah.online/city/arish
**What it is:**
A Khatwa Online–owned directory website listing all online stores in Arish — both built by us and not.

**Why it exists:**
- Creates a centralized online discovery layer for the city
- Acts as a marketing channel we fully control
- Clients who subscribe get listed and can manage their own entry (logo, images, description, offers)
- Removes the "but who will find my store?" objection from client sales conversations
- We market the catalogue at our own cost → our clients get free exposure as part of their subscription

**Strategic value:**
- Gives us leverage: to be listed, a business needs a website
- Builds brand presence in the city independently of individual client deals
- Creates network effects: more stores listed → more users → more client value

---

## 6. BUSINESS MODEL

**Pricing Structure**
- Tiers based on each product
- types of delivery:
	1- One Time Fee: client pays for the product upfront and owns it fully and we keep maintaining it and bug fixing for ever for free and + an optional retainer for upgrades and custom edits if he wants to "eg. if there is a major update or something he gotta pay to recieve it" (RANGE: depends on product: 10-15+k EGP main +opt 500-1000EGP retainer)
	2- Subscription Based: on our infra, either as a SaaS system where client logs in to our platform and manages his system or by us hosting for him on our account on his seperate database as a seperate project (RANGE: depnds on product, 500-2000EGP)

**Revenue model:** Product Cost + Potential Retainers + Subscription Services

---

## 8. TECH STACK & DELIVERY

**Frontend:** ReactJS + TailWindCSS
**Backend:** NextJS + NodeJS + Javascript
**Database:** Supabase PostgreSQL
**Hosting / Infrastructure:** Vercel/Netlify
**NOTES** absolutely no typescript, online use javascript and JSX, this project doesnt handle typescript

---

*Last updated: April 2026*
*Maintained by: Abdelrahman*

