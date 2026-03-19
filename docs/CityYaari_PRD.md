# CityYaari — Product Requirements Document (PRD)

> **Discover People From Your City, Anywhere**

| Field | Details |
|---|---|
| Document Version | 1.0 |
| Status | Draft |
| Product | CityYaari – Community Platform |
| Platform | Mobile (iOS & Android via React Native) |
| Tech Stack | React Native · Node.js · Express.js · MongoDB |
| Target Audience | Students, Young Professionals, Relocators |

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Problem Statement](#2-problem-statement)
3. [Product Vision & Goals](#3-product-vision--goals)
4. [Target Users & Personas](#4-target-users--personas)
5. [Core Value Proposition](#5-core-value-proposition)
6. [Key Use Cases](#6-key-use-cases)
7. [Functional Requirements (MVP)](#7-functional-requirements-mvp)
8. [Non-Functional Requirements](#8-non-functional-requirements)
9. [Safety & Trust Features](#9-safety--trust-features)
10. [Tech Stack & Architecture](#10-tech-stack--architecture)
11. [Monetization Strategy](#11-monetization-strategy)
12. [Success Metrics & KPIs](#12-success-metrics--kpis)
13. [Assumptions & Constraints](#13-assumptions--constraints)
14. [Out of Scope (v1)](#14-out-of-scope-v1)
15. [Open Questions](#15-open-questions)
16. [Theme & Design System](#16-theme--design-system)
17. [Project Folder Structure](#17-project-folder-structure)

---

## 1. Product Overview

CityYaari is a community-based mobile platform that helps people connect with others from the same hometown who are living in a different city. It is designed for students, young professionals, and anyone who has relocated to a new city for education, work, or other reasons, and wants to find familiar faces from their hometown.

The platform enables users to:
- Discover people from their hometown in their current city
- Connect and chat privately
- Find flatmates or roommates
- Coordinate holiday travel
- Organize local meetups
- Form trip groups
- Build hometown-based communities

CityYaari acts as a **relocation support network** and **hometown community hub** — providing the social infrastructure that currently does not exist in a dedicated, purpose-built form.

**Taglines:**
- *Discover People From Your City, Anywhere*
- *Your city. Your people. Your Yaari.*

---

## 2. Problem Statement

Every year, millions of Indians move to new cities for college admissions, professional jobs, coaching programs, internships, and other opportunities. This migration creates a significant emotional and social challenge: people arrive in an unfamiliar city, often knowing no one from their hometown, and struggle to establish a support network.

### 2.1 Core Pain Points

- **Social Loneliness:** New arrivals feel disconnected and isolated. The absence of familiar social ties makes settling into a new city emotionally difficult.
- **Difficulty Finding Roommates:** Finding a trustworthy flatmate, ideally someone from the same hometown, is a significant challenge. Existing platforms like NoBroker and OLX are not built for social filtering by hometown.
- **Uncoordinated Holiday Travel:** During festival seasons (Diwali, Holi, Eid, Christmas), large numbers of people travel home simultaneously. There is no platform to discover and coordinate shared journeys with fellow travelers from the same origin city.
- **No Organized Hometown Community:** There is no platform where people from the same city, living in a new location, can organize meetups, form groups, or build a local community.
- **Fragmented Existing Solutions:** Current workarounds include WhatsApp groups, Facebook groups, LinkedIn searches, and mutual contacts. These are informal, unstructured, and do not provide discovery, safety features, or organized community tools.

### 2.2 Gap in the Market

No existing platform is purpose-built to connect people from the same hometown who are living in a new city. LinkedIn is professional-only. Facebook groups lack structured discovery. Dating apps are not appropriate. Local social apps (like Bumble BFF) lack hometown-based filtering. This gap represents a clear product opportunity.

---

## 3. Product Vision & Goals

### 3.1 Vision

To become the **largest platform in India** connecting hometown communities across cities — a trusted, go-to destination where anyone moving to a new city can instantly find their people.

### 3.2 Product Goals

- Enable hometown-based social discovery in any city across India.
- Reduce the emotional and logistical friction of relocating to a new city.
- Build trust through verified user profiles (student and employee verification).
- Create an engaged, active community through meetups, posts, and group activities.
- Build a sustainable monetization model via premium features, listings, and advertising.

---

## 4. Target Users & Personas

### 4.1 Primary Users

**Persona A: The Student**
- Age: 18–24
- Situation: Just moved to a new city for college or coaching (e.g., UPSC, CAT, JEE)
- Needs: Roommate from hometown, social connections, group for travel back home during holidays
- Frustration: Feels alone; doesn't know anyone; WhatsApp groups are disorganized
- Example: *Rahul from Lucknow, studying at Christ University, Bangalore*

**Persona B: The Young Professional / Fresher**
- Age: 22–30
- Situation: Joined a company in a metro city; relocated alone
- Needs: Flatmate, social network, weekend travel group, community events
- Frustration: Feels isolated in a big city; company colleagues are not from hometown
- Example: *Priya from Kanpur, working at Infosys, Pune*

### 4.2 Secondary Users

- **Mid-career Relocators:** People who move cities for career growth and want to quickly build a hometown-based social circle.
- **Freelancers & Remote Workers:** People with location flexibility who move cities frequently and want to maintain hometown connections wherever they are.
- **Community Organizers:** Local leaders who want to organize meetups and events for people from a specific hometown or region.

---

## 5. Core Value Proposition

CityYaari helps users instantly find people from their hometown in their current city. Unlike generic social platforms, CityYaari is built around the emotional anchor of hometown — a shared identity that creates instant trust, familiarity, and community.

| From City | Current City | Result |
|---|---|---|
| Lucknow | Bangalore | People from Lucknow currently in Bangalore |
| Kanpur | Delhi | People from Kanpur currently in Delhi |
| Patna | Mumbai | People from Patna currently in Mumbai |

---

## 6. Key Use Cases

### Use Case 1: Connect With Hometown People

A user can discover all people from their hometown currently living in their city. They can view profiles, send connection requests, and once accepted, start chatting privately. This is the **core loop** of the product.

- User sets their hometown (e.g., Lucknow) and current city (e.g., Bangalore)
- Feed shows profiles of people from Lucknow who are in Bangalore
- User can send a connection request with an optional note
- On acceptance, private chat is unlocked

### Use Case 2: Find Flatmates / Roommates

Users can post a flatmate listing or browse existing listings. Listings are filterable by city, area, budget, and preferably by hometown of the poster.

- Post fields: city, area/locality, monthly budget, preferred move-in date, number of people, preference for same-hometown flatmate, description
- Browsing filters: city, area, budget range, hometown preference
- Example listing: *Looking for Flatmate | City: Bangalore | Area: Whitefield | Budget: ₹12,000 | Preferred: From Lucknow*

### Use Case 3: Travel Together During Holidays

Before major Indian festivals and holidays, large numbers of people travel back to their hometowns. CityYaari allows users to post travel plans and connect with others traveling the same route.

- Post fields: origin city, destination city, travel date, mode of transport (train/bus/flight), train number (optional), number of co-travelers needed
- Example: *Travel Mate | Route: Bangalore to Lucknow | Date: 20 Dec | Train: Karnataka Express*
- Interested users can express interest and get connected

### Use Case 4: Meetups

Users can organize and discover offline meetups for their hometown community in their current city.

- Post fields: meetup title, city, venue name, address, date & time, max participants, description, entry fee (if any)
- Example: *Lucknow People Meetup | City: Bangalore | Venue: XYZ Restaurant | Date: 5 Jan | Spots: 10*
- Users can RSVP, view attendee list, and chat with participants

### Use Case 5: Trip Groups

Users can form or join small groups for leisure trips, weekend getaways, or short holidays with fellow hometown people in the same city.

- Post fields: destination, trip dates, departure city, group size, approximate budget per person, trip type (road trip, trek, beach, etc.)
- Example: *Weekend Trip to Coorg | From: Bangalore | Dates: 10–12 Jan | Group Size: 6 | Budget: ₹3,000 per person*

### Use Case 6: Communities

Users can create or join communities based on hometown, state, college, company, or batch. Communities serve as ongoing group spaces for discussion, announcements, and posts.

- Any user can create a community
- Community types: hometown-based, college-based, company-based, interest-based
- Inside a community: members can post, comment, and interact
- Example communities:
  - *Lucknow People in Bangalore*
  - *UP Students in Delhi*
  - *Infosys Freshers Batch 2026*
  - *IIT Kanpur Alumni in Mumbai*

---

## 7. Functional Requirements (MVP)

### 7.1 User Authentication

Authentication must be simple, fast, and reliable. Phone number is the primary identifier.

- Phone number + OTP-based signup and login (primary)
- Email signup/login (optional, secondary)
- OTP valid for 5 minutes; resend option after 30 seconds
- Session management: JWT-based authentication tokens
- Logout from device; ability to manage active sessions
- Account deletion option available in settings

### 7.2 User Profile

The profile is the core identity layer of the app.

- **Required fields:** Full name, Hometown city, Hometown state, Current city, Profession type (Student / Working Professional / Other)
- **Optional fields:** College name, Company name, Graduation year, Bio (max 200 characters), Profile picture
- Users can edit all profile fields at any time
- Profile visibility: public to all registered users by default
- Privacy setting: option to hide last seen and online status

**Sample Profile:**

| Field | Value |
|---|---|
| Name | Rahul Sharma |
| Hometown | Lucknow, Uttar Pradesh |
| Current City | Bangalore, Karnataka |
| Profession | Working Professional |
| Company | Infosys |
| Bio | Lucknow wala in Bangalore. Love cricket & biryani. |

### 7.3 Discover People

The discovery feed is the primary value-delivery screen.

- Default view: people sharing same hometown AND same current city as the logged-in user
- Manual filters available: Hometown city, Hometown state, Current city, Profession type
- Each profile card shows: name, profile picture, hometown, current city, profession, mutual connections count, verification badge (if any)
- Pagination / infinite scroll supported
- Blocked users do not appear in discovery

### 7.4 Connection Requests

Connection requests gate the private messaging feature, ensuring chats only happen between mutually consenting users.

- Any user can send a connection request to any other user they discover
- Optional message attached to the request (max 100 characters)
- Recipient receives a push notification
- Recipient can Accept or Decline
- On acceptance: both users become connections; chat is unlocked
- On decline: requester is not notified of the reason
- Rate limit: max 20 connection requests per day (to prevent spam)
- Pending requests visible in a dedicated inbox tab
- Users can withdraw a sent pending request

### 7.5 Messaging

Private 1:1 messaging between connected users. Messaging is unlocked only after a connection request is accepted.

- Text messages (primary)
- Real-time message delivery using WebSockets (Socket.io)
- Message status indicators: Sent, Delivered, Read (single/double tick)
- Push notifications for new messages
- Message list sorted by most recent conversation
- Ability to delete a message (for self only)
- Ability to block a user from within the chat
- No message history retention after a user is blocked

### 7.6 Posts

Posts allow users to share listings, travel plans, and general updates with the broader community.

- **Post categories:** Flatmate Search, Travel Mate, Trip Group, General
- **Common post fields:** Title, Category, Description, Location/City, User's current city (auto-populated)
- **Category-specific fields:**
  - Flatmate: area, budget per person, number of rooms, move-in date, gender preference
  - Travel Mate: origin, destination, travel date, mode of transport, seats available
  - Trip Group: destination, trip dates, group size, per-person budget
  - General: no additional fields
- Posts can be edited or deleted by the creator
- Posts auto-expire after 30 days (configurable)
- Users can express interest in a post; the poster is notified
- Reported posts are hidden pending moderation review

### 7.7 Meetups

Meetups enable offline community events.

- **Create meetup fields:** Title, City, Venue name, Full address, Date & time, Maximum spots, Description, Entry fee (optional, default free)
- Meetup organizer can set a cap on participants
- Participants can RSVP (Join / Withdraw)
- Organizer and all participants can see the attendee list
- Group chat automatically created for all meetup participants
- Organizer can cancel the meetup; all participants notified
- Meetups discoverable by current city filter

### 7.8 Communities

Communities are persistent group spaces for ongoing interaction around a shared identity.

- **Create community fields:** Name, Description, Type (Hometown / College / Company / Interest), City (optional), Cover photo (optional)
- Any user can create a community
- Any user can discover and join a community
- Community post feed: members can create posts within the community
- Community admin (creator) can remove members and delete posts
- Communities searchable by name and type
- Community member count displayed on community card

### 7.9 Search & Filters

A global search bar allows users to search across people, posts, meetups, and communities.

| Search Type | Filter Options |
|---|---|
| People | Hometown city, hometown state, current city, profession |
| Posts | Category, city, date range |
| Meetups | City, date |
| Communities | Name, type, city |

### 7.10 Profile Verification

Verification adds trust and credibility to user profiles. Users can voluntarily submit documents to get a verified badge.

- Student verification: Submit college ID card image or admission letter
- Employee verification: Submit company ID card, offer letter, or latest salary slip
- Documents reviewed by admin within 48 hours
- On approval: verified badge appears on profile
- Badge types: **Verified Student** | **Verified Employee**
- Verification status can be revoked if document is found invalid
- Document images stored securely; not visible to other users

---

## 8. Non-Functional Requirements

### 8.1 Performance
- App load time (cold start): < 3 seconds on a 4G connection
- API response time: < 500ms for 95th percentile of requests
- Real-time message delivery latency: < 1 second under normal load
- Discovery feed pagination: load 20 profiles per page

### 8.2 Scalability
- Architecture must support horizontal scaling of backend services
- MongoDB must be configured with sharding for user and post collections
- Target: support 100,000 registered users in the first 12 months

### 8.3 Availability
- Target uptime: 99.5% (excluding scheduled maintenance)
- Scheduled maintenance windows communicated 24 hours in advance

### 8.4 Security
- All API communication over HTTPS (TLS 1.2+)
- Passwords hashed with bcrypt
- JWT tokens expire after 7 days; refresh token mechanism in place
- Document uploads stored in encrypted cloud storage (e.g., AWS S3 with SSE)
- Rate limiting on all public-facing APIs to prevent abuse
- User data never shared with third parties without explicit consent

### 8.5 Compatibility
- iOS 14 and above
- Android 8.0 (Oreo) and above
- React Native cross-platform codebase with platform-specific adjustments where needed

---

## 9. Safety & Trust Features

Safety is a first-class product concern. Trust is the foundation of community.

| Feature | Description |
|---|---|
| Phone Verification | All users must verify via OTP at signup. Reduces fake accounts. |
| Document Verification | Optional but incentivized. Verified badge increases trust. |
| Report User | Any user can report another for inappropriate behavior, fake profile, or harassment. |
| Block User | Blocking immediately removes the user from discovery, messages, and all interactions. |
| Connection Rate Limit | Max 20 connection requests per day per user to prevent spam and mass solicitation. |
| Admin Moderation Panel | Backend admin dashboard to review reports, verify documents, ban users, and remove content. |
| Content Moderation | Posts and community content can be reported. Flagged content reviewed within 24 hours. |
| No Minors Policy | Users must confirm they are 18+ at signup. |

---

## 10. Tech Stack & Architecture

| Layer | Technology | Purpose |
|---|---|---|
| Frontend (Mobile) | React Native | Cross-platform iOS & Android app |
| Backend Runtime | Node.js | Server-side JavaScript runtime |
| Backend Framework | Express.js | REST API routing and middleware |
| Database | MongoDB | Primary NoSQL database for users, posts, messages |
| Real-time | Socket.io | WebSocket-based real-time messaging |
| Authentication | JWT + OTP (SMS) | Stateless auth; phone verification via SMS |
| File Storage | AWS S3 (recommended) | Profile pictures, verification documents |
| Push Notifications | Firebase FCM | Android & iOS push notifications |
| SMS Gateway | Twilio / MSG91 | OTP delivery |
| Hosting (API) | AWS EC2 / Railway.app | Backend server hosting |
| Hosting (DB) | MongoDB Atlas | Managed cloud MongoDB |

### 10.1 Key MongoDB Collections

- `users` — User profiles, auth info, verification status, hometown/city data
- `connections` — Connection request records and accepted connection pairs
- `messages` — Private chat messages between connected users
- `posts` — Flatmate, travel, trip, and general posts
- `meetups` — Meetup listings and RSVP records
- `communities` — Community metadata and membership records
- `community_posts` — Posts made within communities
- `reports` — User and content reports for admin review

---

## 11. Monetization Strategy

Monetization is planned for post-MVP phases. The focus of v1 is user acquisition and retention.

### 11.1 Premium Subscription (CityYaari Pro)

- Profile Boost: appear higher in discovery feeds for 7/30 days
- Unlimited connection requests (vs 20/day free limit)
- See who viewed your profile
- Priority customer support
- Pricing (indicative): ₹99/month or ₹799/year

### 11.2 Listings & Classifieds

- PG and flat listings for landlords and brokers
- Featured listing placement (paid)
- Verified landlord badge

### 11.3 Advertising

- Geo-targeted ads for local businesses (restaurants, coaching centers, gyms)
- Native ad units within the discovery feed and community feed
- Event sponsorship by brands targeting students and young professionals

### 11.4 Event & Meetup Monetization

- Paid meetup ticket sales (CityYaari takes a small platform fee)
- Sponsored community events by brands

---

## 12. Success Metrics & KPIs

| Category | Metric | Target (6 months) |
|---|---|---|
| User Growth | Total registered users | 50,000 |
| User Growth | Daily Active Users (DAU) | 5,000 |
| User Growth | Monthly Active Users (MAU) | 20,000 |
| Engagement | Connection requests sent per day | 2,000 |
| Engagement | Connections accepted (acceptance rate) | > 40% |
| Engagement | Messages sent per day | 10,000 |
| Engagement | Posts created per day | 500 |
| Community | Meetups created per month | 200 |
| Community | Communities created | 1,000 |
| Community | Average community members | > 15 |
| Retention | D7 retention | > 30% |
| Retention | D30 retention | > 15% |
| Trust | Verified user profiles | > 20% of users |

---

## 13. Assumptions & Constraints

### Assumptions

- Target users (students and young professionals) are smartphone users with consistent mobile internet access.
- Users are willing to share their hometown and current city on a semi-public profile.
- SMS OTP delivery is reliable in target markets (Tier 1 and Tier 2 Indian cities).
- A significant percentage of users will voluntarily pursue document verification in exchange for a visible trust badge.
- Initial traction can be driven via campus ambassador programs and WhatsApp/Telegram group marketing.

### Constraints

- MVP must be shipped within 3–4 months; scope must be tightly controlled.
- No web app in v1 — mobile only.
- No group messaging in v1 (only 1:1 chat); group chats are limited to meetup participant groups.
- Document verification is manual (admin-reviewed) in v1; no automated AI verification.

---

## 14. Out of Scope (v1 / MVP)

- Web application (desktop browser version)
- General-purpose social feed (not hometown-filtered)
- Video or voice calls within the app
- Automated AI-based document verification
- Payments or escrow for flatmate deposits or trip fees
- Job board or professional networking features
- Multi-language support (Hindi and regional languages deferred to v2)
- Advanced analytics dashboard for community admins
- API integrations with third-party travel booking platforms

---

## 15. Open Questions

| # | Question | Owner |
|---|---|---|
| 1 | Should profile visibility default to public or connections-only? What are the implications for discovery? | Product |
| 2 | What is the appropriate daily connection request limit? 20 is a starting point — needs validation with user research. | Product |
| 3 | Should we allow non-verified users to post flatmate and travel listings, or require phone verification at minimum? | Product / Legal |
| 4 | What is the moderation SLA for reported content? Do we need a 24/7 moderation team or can we start with business hours? | Ops |
| 5 | Should communities be public (anyone can join) or require admin approval? Should there be private communities? | Product |
| 6 | What happens to messages and connections when a user deletes their account? Should message history be preserved? | Legal / Engineering |
| 7 | How do we handle users who list multiple current cities (e.g., they travel frequently)? | Product |
| 8 | What is the go-to-market strategy for the first 3 cities? Which cities to launch in first? | Business |

---

## 16. Theme & Design System

### What CityYaari Should Feel Like

When someone opens the app they should feel: **clean, friendly, modern, and welcoming** — almost like *"a cozy community network."*

---

### 16.1 Color Palette

Use **3 main colors** only.

#### Primary Color — Trust (Deep Blue)

```
#2563EB
```

Meaning: trust · networking · community

#### Secondary Color — Warmth / "Yaari" Feeling (Warm Orange)

```
#F97316
```

Meaning: friendship · belonging · energy

#### Background Color

```
#F8FAFC
```

Very soft gray / white — makes the UI feel modern and premium.

#### Neutral Colors

```
Text Primary   →  #111827
Text Secondary →  #6B7280
Borders        →  #E5E7EB
```

---

### 16.2 Typography

Choose clean, modern fonts.

**Recommended: Inter**

Why Inter?
- Modern and readable
- Tech startup aesthetic
- Excellent legibility at all sizes

Other good choices: Poppins, SF Pro

---

### 16.3 UI Style

The app follows a **minimal card-based UI**.

**User Card example:**
```
┌──────────────────────────────┐
│  [ Profile Photo ]           │
│  Rahul Sharma                │
│  From: Lucknow               │
│  Working at: Infosys         │
│                              │
│         [ Connect ]          │
└──────────────────────────────┘
```

**Post Card example:**
```
┌──────────────────────────────┐
│  Looking for Flatmate        │
│  Whitefield, Bangalore       │
│  Budget: ₹12,000             │
│                              │
│  From: Kanpur                │
└──────────────────────────────┘
```

Cards should have:
- Rounded corners
- Light shadows
- Plenty of spacing

---

### 16.4 Icon Style

Use **simple outline icons**.

Good icon sets:
- [Lucide Icons](https://lucide.dev)
- [Feather Icons](https://feathericons.com)

Icons should be: thin · clean · minimal

---

### 16.5 UI Feel

The interface should feel:

✔ Airy &nbsp; ✔ Spacious &nbsp; ✔ Minimal &nbsp; ✔ Smooth

Avoid:

❌ Crowded screens &nbsp; ❌ Too many colors &nbsp; ❌ Heavy gradients

---

### 16.6 Navigation Style

Use **bottom tab navigation**.

```
[🏠 Home]  [🔍 Discover]  [👥 Communities]  [💬 Messages]  [👤 Profile]
```

This feels natural for mobile apps.

---

### 16.7 Animations

Subtle animations make apps feel premium.

Use:
- Smooth screen transitions
- Card hover effects
- Loading skeletons

Recommended libraries:
- **React Native Reanimated** (primary)
- **Framer Motion** (for any web views)

---

### 16.8 Theme Summary

| Property | Value |
|---|---|
| Style | Minimal modern social app |
| Primary Color | Blue `#2563EB` |
| Accent Color | Orange `#F97316` |
| Background | Light gray `#F8FAFC` |
| Font | Inter |
| UI Pattern | Card-based |
| Icons | Minimal outline (Lucide / Feather) |
| Animations | Smooth and subtle |

---

## 17. Project Folder Structure

### Full Project (Monorepo)

```
cityyaari/
│
├── mobile/                 # Expo React Native App
├── server/                 # Node.js + Express Backend
├── docs/                   # PRD, architecture docs
├── scripts/                # Deployment scripts
│
├── .env
├── README.md
└── package.json
```

---

### 📱 Expo Mobile App — `mobile/`

```
mobile/
│
├── app/                            # Expo Router screens
│
│   ├── (tabs)/
│   │   ├── index.jsx               # Home Feed
│   │   ├── discover.jsx            # Discover people from your city
│   │   ├── communities.jsx         # Communities
│   │   ├── meetups.jsx             # Meetups
│   │   ├── messages.jsx            # Chat
│   │   └── profile.jsx             # Profile
│
│   ├── user/
│   │   └── [userId].jsx            # User profile view
│
│   ├── community/
│   │   └── [communityId].jsx       # Community page
│
│   ├── meetup/
│   │   ├── create-meetup.jsx
│   │   └── [meetupId].jsx
│
│   ├── post/
│   │   ├── create-post.jsx
│   │   └── [postId].jsx
│
│   ├── chat/
│   │   └── [chatId].jsx
│
│   ├── auth/
│   │   ├── login.jsx
│   │   └── signup.jsx
│
│   └── _layout.jsx
│
│
├── src/
│
│   ├── assets/
│   │   ├── images/
│   │   ├── icons/
│   │   └── illustrations/
│
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.jsx
│   │   │   ├── Card.jsx
│   │   │   ├── Loader.jsx
│   │   │   ├── Modal.jsx
│   │   │   └── Avatar.jsx
│   │
│   │   ├── users/
│   │   │   ├── UserCard.jsx
│   │   │   ├── ConnectionButton.jsx
│   │   │   └── UserList.jsx
│   │
│   │   ├── posts/
│   │   │   ├── PostCard.jsx
│   │   │   ├── FlatmatePost.jsx
│   │   │   ├── TravelMatePost.jsx
│   │   │   └── TripPost.jsx
│   │
│   │   ├── communities/
│   │   │   ├── CommunityCard.jsx
│   │   │   └── CommunityFeed.jsx
│   │
│   │   ├── meetups/
│   │   │   ├── MeetupCard.jsx
│   │   │   ├── MeetupParticipants.jsx
│   │   │   └── MeetupCreator.jsx
│   │
│   │   ├── chat/
│   │   │   ├── ChatBubble.jsx
│   │   │   ├── ChatInput.jsx
│   │   │   └── MessageList.jsx
│   │
│   │   └── notifications/
│   │       └── NotificationCard.jsx
│
│   ├── services/
│   │   ├── api/
│   │   │   └── apiClient.js
│   │   ├── auth/
│   │   │   └── authService.js
│   │   ├── users/
│   │   │   └── userService.js
│   │   ├── posts/
│   │   │   └── postService.js
│   │   ├── meetups/
│   │   │   └── meetupService.js
│   │   ├── communities/
│   │   │   └── communityService.js
│   │   ├── chat/
│   │   │   └── chatService.js
│   │   └── notifications/
│   │       └── notificationService.js
│
│   ├── store/
│   │   ├── userStore.js
│   │   ├── feedStore.js
│   │   ├── chatStore.js
│   │   └── notificationStore.js
│
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useNotifications.js
│   │   └── useLocationFilter.js
│
│   ├── utils/
│   │   ├── constants.js
│   │   ├── formatDate.js
│   │   └── validation.js
│
│   ├── theme/
│   │   ├── colors.js
│   │   ├── typography.js
│   │   └── spacing.js
│
│   └── types/
│       ├── userTypes.js
│       ├── postTypes.js
│       └── meetupTypes.js
│
│
├── App.js
├── app.json
├── babel.config.js
├── metro.config.js
└── package.json
```

---

### 🖥️ Backend — `server/`

```
server/
│
├── src/
│
│   ├── config/
│   │   ├── db.js
│   │   └── env.js
│
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── userController.js
│   │   ├── postController.js
│   │   ├── communityController.js
│   │   ├── meetupController.js
│   │   ├── chatController.js
│   │   └── notificationController.js
│
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── postRoutes.js
│   │   ├── communityRoutes.js
│   │   ├── meetupRoutes.js
│   │   ├── chatRoutes.js
│   │   └── notificationRoutes.js
│
│   ├── models/
│   │   ├── User.js
│   │   ├── Post.js
│   │   ├── Community.js
│   │   ├── Meetup.js
│   │   ├── Message.js
│   │   └── Notification.js
│
│   ├── services/
│   │   ├── userService.js
│   │   ├── postService.js
│   │   ├── communityService.js
│   │   ├── meetupService.js
│   │   ├── chatService.js
│   │   └── notificationService.js
│
│   ├── socket/
│   │   └── socketServer.js         # Real-time chat via Socket.io
│
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── rateLimiter.js
│   │   └── errorHandler.js
│
│   ├── utils/
│   │   ├── logger.js
│   │   ├── tokenGenerator.js
│   │   └── validator.js
│
│   └── app.js
│
├── server.js
└── package.json
```

---

*CityYaari PRD v1.0 — Confidential — For internal use only*
