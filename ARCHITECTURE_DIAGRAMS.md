# Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                         EVAIRA FRONTEND                             │
│                                                                      │
│  ┌────────────────────────────────────────────────────────────────┐ │
│  │                   UserProfileContext                           │ │
│  │  ┌──────────────────────────────────────────────────────────┐  │ │
│  │  │ State (Persistent across all screens):                   │  │ │
│  │  │  • fullName                                              │  │ │
│  │  │  • birthdate                                             │  │ │
│  │  │  • gender                                                │  │ │
│  │  │  • faceShape                                             │  │ │
│  │  │  • bodyType                                              │  │ │
│  │  │  • occasions[]                                           │  │ │
│  │  │  • favoriteColors[]                                      │  │ │
│  │  │  • userId                                                │  │ │
│  │  │  • email                                                 │  │ │
│  │  └──────────────────────────────────────────────────────────┘  │ │
│  └────────────────────────────────────────────────────────────────┘ │
│           ↑                ↑                ↑                ↑       │
│           │                │                │                │       │
│  ┌────────┴──────┐  ┌─────┴──────┐  ┌─────┴──────┐  ┌─────┴──────┐ │
│  │ createProfile │  │profileDetal│  │ occasions  │  │fav.Colors  │ │
│  │               │  │            │  │            │  │            │ │
│  │ Input:        │  │ Input:     │  │ Input:     │  │ Input:     │ │
│  │ • Name        │→ │ • Gender   │→ │ • Occasion │→ │ • Colors   │ │
│  │ • Birthday    │  │ • Face     │  │ (up to 3)  │  │ (up to 5)  │ │
│  │               │  │ • Body     │  │            │  │            │ │
│  └────────────────┘  └────────────┘  └────────────┘  └────┬───────┘ │
│                                                           │         │
│                                                    ┌──────▼──────┐   │
│                                                    │ Collect ALL │   │
│                                                    │ Data via    │   │
│                                                    │getProfileData
│                                                    └──────┬──────┘   │
└─────────────────────────────────────────────────────────┼────────────┘
                                                           │
                                                    ┌──────▼──────────┐
                                                    │ profileAPI.ts   │
                                                    │                 │
                                                    │ Formats payload │
                                                    │ POST request    │
                                                    └──────┬──────────┘
                                                           │
                                                    ┌──────▼──────────┐
                                              ┌─────►Network Request ├────┐
                                              │     POST /api/user/  │    │
                                              │     profile           │    │
                                              └─────────────────────  ┘    │
                                                                           │
┌────────────────────────────────────────────────────────────────────────┘
│
│  ┌──────────────────────────────────────────────────────────────────┐
│  │                    BACKEND SERVER                                │
│  │                                                                  │
│  │  ┌────────────────────────────────────────────────────────────┐ │
│  │  │ POST /api/user/profile                                     │ │
│  │  │                                                            │ │
│  │  │ 1. Receive JSON payload                                   │ │
│  │  │ 2. Validate all fields                                    │ │
│  │  │ 3. Create user record                                     │ │
│  │  │ 4. Save occasions (multiple rows)                         │ │
│  │  │ 5. Save favorite colors (multiple rows)                   │ │
│  │  │ 6. Return userId in response                              │ │
│  │  └────────────────────────────────────────────────────────────┘ │
│  │                           │                                      │
│  │                           ▼                                      │
│  │  ┌────────────────────────────────────────────────────────────┐ │
│  │  │                 DATABASE                                   │ │
│  │  │                                                            │ │
│  │  │  USERS table                                              │ │
│  │  │  ├─ id (PK)                                               │ │
│  │  │  ├─ fullName                                              │ │
│  │  │  ├─ birthDate                                             │ │
│  │  │  ├─ gender                                                │ │
│  │  │  ├─ faceShape                                             │ │
│  │  │  ├─ bodyType                                              │ │
│  │  │  └─ email                                                 │ │
│  │  │                                                            │ │
│  │  │  USER_OCCASIONS table                                     │ │
│  │  │  ├─ id (PK)                                               │ │
│  │  │  ├─ userId (FK)                                           │ │
│  │  │  └─ occasion                                              │ │
│  │  │                                                            │ │
│  │  │  USER_FAVORITE_COLORS table                               │ │
│  │  │  ├─ id (PK)                                               │ │
│  │  │  ├─ userId (FK)                                           │ │
│  │  │  ├─ colorName                                             │ │
│  │  │  └─ hexCode                                               │ │
│  │  └────────────────────────────────────────────────────────────┘ │
│  └──────────────────────────────────────────────────────────────────┘
│
└────────────────────────────────────────────────────────────────────────
```

---

## Request/Response Flow

```
┌─────────────────────────────────────────┐
│        User Completes All 4 Screens     │
└──────────────────┬──────────────────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │ favoriteColors.tsx   │
        │ "Continue" clicked   │
        └──────────┬───────────┘
                   │
        ┌──────────▼───────────────────────┐
        │ setFavoriteColors(selected)      │
        │ profileData = getProfileData()   │
        │ submitUserProfile(profileData)   │
        └──────────┬───────────────────────┘
                   │
        ┌──────────▼───────────────────────┐
        │ profileAPI.ts                    │
        │                                  │
        │ format:                          │
        │ {                                │
        │   fullName: "John",              │
        │   birthDate: "1995-05-15",       │
        │   gender: "Female",              │
        │   faceShape: "Oval",             │
        │   bodyType: "Athletic",          │
        │   occasions: [...],              │
        │   favoriteColors: [...]          │
        │ }                                │
        └──────────┬───────────────────────┘
                   │
        ┌──────────▼───────────────────────┐
        │ fetch POST request               │
        │ to /api/user/profile             │
        └──────────┬───────────────────────┘
                   │
                   │ Network
                   │
                   ▼
        ┌──────────────────────┐
        │   BACKEND SERVER     │
        │ /api/user/profile    │
        └──────────┬───────────┘
                   │
        ┌──────────▼───────────────────────┐
        │ Validate request                 │
        │ Insert user record               │
        │ Insert occasions                 │
        │ Insert colors                    │
        └──────────┬───────────────────────┘
                   │
        ┌──────────▼───────────────────────┐
        │ Return JSON:                     │
        │ {                                │
        │   success: true,                 │
        │   userId: 12345,                 │
        │   message: "Profile created..."  │
        │ }                                │
        └──────────┬───────────────────────┘
                   │
                   │ Network
                   │
        ┌──────────▼───────────────────────┐
        │ Frontend receives response       │
        │ Check success: true              │
        │ Show success alert               │
        │ Navigate to /(tabs)/home         │
        └──────────────────────────────────┘
```

---

## Component Hierarchy

```
App.tsx
├── UserProfileProvider (Context)
│   │
│   └── Navigation
│       ├── (auth flow)
│       │   ├── createProfile.tsx
│       │   ├── profileDetails.tsx
│       │   ├── occasions.tsx
│       │   └── favoriteColors.tsx
│       │
│       └── (tabs flow - after auth)
│           ├── home.tsx
│           ├── discover.tsx
│           ├── cart.tsx
│           ├── wishlist.tsx
│           └── account.tsx
```

---

## Data State Lifecycle

```
INITIAL STATE
├─ fullName: null
├─ birthdate: null
├─ gender: null
├─ faceShape: null
├─ bodyType: null
├─ occasions: []
├─ favoriteColors: []
└─ userId: null

    ↓ User goes through screens ↓

AFTER SCREEN 1 (createProfile)
├─ fullName: "John Doe"  ✅
├─ birthdate: "1995-05-15"  ✅
└─ others: null/empty

    ↓

AFTER SCREEN 2 (profileDetails)
├─ fullName: "John Doe"  ✅
├─ birthdate: "1995-05-15"  ✅
├─ gender: "Female"  ✅
├─ faceShape: "Oval"  ✅
├─ bodyType: "Athletic"  ✅
└─ others: null/empty

    ↓

AFTER SCREEN 3 (occasions)
├─ Previous data  ✅
├─ occasions: ["Party & Clubwear", "Work Formal"]  ✅
└─ favoriteColors: []

    ↓

AFTER SCREEN 4 (favoriteColors)
├─ All previous data  ✅✅✅
├─ favoriteColors: [{name: "Navy", hex: "#001F3F"}, ...]  ✅
└─ userId: null (until backend responds)

    ↓

AFTER BACKEND RESPONSE
├─ All data from above  ✅✅✅✅
└─ userId: 12345  ✅
```

---

## Error Flow

```
User submits favoriteColors
        │
        ▼
Call submitUserProfile()
        │
    ┌───┴────┐
    │         │
    ▼         ▼
Success   Failure
    │         │
    ├─────┬───┤
    │     │
    ▼     ▼
Success Validation   Network   Backend
Alert   Error        Error     Error
    │     │           │         │
    └─────┴─────┬─────┴────┬────┘
                │          │
                ▼          ▼
           Show Error   Show Error
           Message      Message
                │          │
                └────┬─────┘
                     │
                     ▼
              Stay on current
              screen (no nav)
              User can retry
```

---

## Database Relationship Diagram

```
┌──────────────────────────┐
│        USERS             │
├──────────────────────────┤
│ id (PK)                  │
│ fullName        (String) │
│ birthDate       (Date)   │
│ gender          (String) │
│ faceShape       (String) │
│ bodyType        (String) │
│ email           (String) │
│ createdAt       (DateTime)│
│ updatedAt       (DateTime)│
└──────────┬───────────────┘
           │
       (1) │ (Many)
           │
    ┌──────┴────────────────────────┐
    │                               │
    ▼                               ▼
┌──────────────────────────┐  ┌──────────────────────────┐
│   USER_OCCASIONS         │  │  USER_FAVORITE_COLORS    │
├──────────────────────────┤  ├──────────────────────────┤
│ id (PK)                  │  │ id (PK)                  │
│ userId (FK)              │  │ userId (FK)              │
│ occasion    (String)     │  │ colorName   (String)     │
│ createdAt   (DateTime)   │  │ hexCode     (String)     │
└──────────────────────────┘  │ createdAt   (DateTime)   │
                              └──────────────────────────┘

Example Data:

USERS:
┌────┬──────────────┬────────────┬────────────┬────────────┬──────────────┬────────────┐
│ id │  fullName    │ birthDate  │  gender    │ faceShape  │  bodyType    │   email    │
├────┼──────────────┼────────────┼────────────┼────────────┼──────────────┼────────────┤
│ 1  │ John Doe     │ 1995-05-15 │ Female     │ Oval       │ Athletic     │ john@ex.com│
└────┴──────────────┴────────────┴────────────┴────────────┴──────────────┴────────────┘

USER_OCCASIONS:
┌────┬────────┬──────────────────────┐
│ id │ userId │ occasion             │
├────┼────────┼──────────────────────┤
│ 1  │ 1      │ Party & Clubwear     │
│ 2  │ 1      │ Work Formal          │
└────┴────────┴──────────────────────┘

USER_FAVORITE_COLORS:
┌────┬────────┬──────────────┬────────────┐
│ id │ userId │ colorName    │ hexCode    │
├────┼────────┼──────────────┼────────────┤
│ 1  │ 1      │ Navy         │ #001F3F    │
│ 2  │ 1      │ Blue         │ #0074D9    │
└────┴────────┴──────────────┴────────────┘
```

That's the complete architecture! 🏗️
