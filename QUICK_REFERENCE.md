# Quick Reference - Profile Flow at a Glance

## The 4-Screen Journey

```
SCREEN 1: createProfile.tsx
├─ User enters: Full Name, Birth Date (Day/Month/Year)
├─ Context saves: fullName, birthdate
└─ Navigates to: profileDetails

SCREEN 2: profileDetails.tsx
├─ User selects: Gender, Face Shape, Body Type
├─ Context saves: gender, faceShape, bodyType
└─ Navigates to: occasions

SCREEN 3: occasions.tsx
├─ User selects: 3 occasions (optional)
├─ Context saves: occasions[]
└─ Navigates to: favoriteColors

SCREEN 4: favoriteColors.tsx
├─ User selects: 5 favorite colors (predefined or custom)
├─ Context saves: favoriteColors[]
├─ Gets all profile data from context
├─ POSTS to backend: Complete profile
└─ Navigates to: home (on success)
```

---

## What Gets Sent to Backend

```typescript
{
  fullName: string,              // "John Doe"
  birthdate: string,             // "1995-05-15" (YYYY-MM-DD)
  gender: string,                // "Female"
  faceShape: string,             // "Oval"
  bodyType: string,              // "Athletic"
  occasions: string[],           // ["Party & Clubwear", "Work Formal"]
  favoriteColors: {              // Array of color objects
    name: string,                // "Navy"
    hex: string                  // "#001F3F"
  }[]
}
```

---

## Files Modified/Created

```
✅ context/UserProfileContext.tsx    → Enhanced with all fields + helpers
✅ app/createProfile.tsx             → Saves fullName + birthdate
✅ app/profileDetails.tsx            → Saves gender + face + body
✅ app/occasions.tsx                 → Saves occasions + navigates
✅ app/favoriteColors.tsx            → Saves colors + submits backend
✅ lib/profileAPI.ts                 → NEW: Handles POST request
✅ PROFILE_FLOW_GUIDE.md             → NEW: Complete documentation
✅ BACKEND_SETUP_GUIDE.md            → NEW: Backend configuration
```

---

## One-Line Setup

1. **Update backend URL** in `lib/profileAPI.ts`
2. **Create POST endpoint** at `/api/user/profile` in your backend
3. **Done!** Flow works end-to-end

---

## Context Usage Anywhere in App

```typescript
import { useUserProfile } from "../context/UserProfileContext";

function AnyComponent() {
  const { fullName, gender, favoriteColors } = useUserProfile();
  // Use the data...
}
```

---

## Error Handling

The app automatically handles:

- ✅ Network errors
- ✅ Invalid responses
- ✅ User validation errors
- ✅ Shows error messages to user

---

## Key Functions in Context

```typescript
// Save individual fields
setFullName(name);
setBirthdate(date);
setGender(gender);
setFaceShape(shape);
setBodyType(type);
setOccasions(occasions);
setFavoriteColors(colors);

// Get all data at once
const profileData = getProfileData();

// Clear everything
resetProfile();
```

---

## Typical Backend Response

```json
{
  "success": true,
  "userId": 12345,
  "message": "Profile created successfully"
}
```

The `userId` is important - it identifies the user in your database!

---

## Customization

### Want to add more fields?

1. Add to `UserProfile` type in context
2. Add state variable in `UserProfileProvider`
3. Add to `getProfileData()` function
4. Use in any screen with `setters`
5. Update backend to receive new field

### Want to change order of screens?

Edit the route navigation in each `handleContinue()` function:

```typescript
router.push("/yourNewScreen");
```

### Want to change limits?

- **Occasions**: Change `3` to desired number in `occasions.tsx`
- **Colors**: Change `5` to desired number in `favoriteColors.tsx`

---

## Testing

1. Go through all 4 screens
2. Fill in all fields
3. Check browser console (Network tab) to see POST request
4. Verify backend receives the complete payload
5. Verify database has new user record
6. Check app shows success message

---

Done! Your profile system is ready to use. 🎉
