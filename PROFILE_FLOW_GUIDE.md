# User Profile Flow & Backend Integration Guide

## Overview

This guide explains the complete user profile flow across 4 screens and how data is collected and sent to your backend.

---

## 1. **User Profile Context - What It Does**

The `UserProfileContext` is a **React Context** that acts as a central storage for user data across your app. Think of it like a temporary database that stores user information while they navigate through screens.

### What It Stores:

```typescript
- fullName: string          // User's full name
- birthdate: string         // Date of birth (YYYY-MM-DD)
- gender: string            // Gender selection
- faceShape: string         // Face shape selection
- bodyType: string          // Body type selection
- occasions: string[]       // Array of selected occasions (up to 3)
- favoriteColors: Color[]   // Array of selected colors (up to 5)
- userId: number            // User ID from backend (after creation)
- email: string             // User's email
```

### Why Use Context?

- **Persistence**: Data stays in memory across screen navigation
- **No Props Drilling**: Access data anywhere using `useUserProfile()` hook
- **Centralized State**: Single source of truth for user profile data

---

## 2. **Complete 4-Screen Flow**

```
┌─────────────────────────────────────────────────────────────────┐
│                   USER PROFILE CREATION FLOW                    │
└─────────────────────────────────────────────────────────────────┘

1. CREATE PROFILE SCREEN
   ├─ Input: fullName, birthdate (day, month, year)
   ├─ Saves to Context: fullName, birthdate
   └─ Navigate to: /profileDetails

2. PROFILE DETAILS SCREEN
   ├─ Input: gender, faceShape, bodyType
   ├─ Saves to Context: gender, faceShape, bodyType
   └─ Navigate to: /occasions

3. OCCASIONS SCREEN
   ├─ Input: Select up to 3 occasions
   ├─ Saves to Context: occasions (array)
   └─ Navigate to: /favoriteColors

4. FAVORITE COLORS SCREEN
   ├─ Input: Select up to 5 colors (predefined or custom)
   ├─ Saves to Context: favoriteColors (array)
   └─ Makes POST Request to Backend with Complete Profile Data
```

---

## 3. **How Data Flows Through Each Screen**

### Screen 1: createProfile.tsx

```typescript
const { setFullName, setBirthdate } = useUserProfile();

// When user clicks continue:
setFullName(username.trim()); // Saves "John Doe"
setBirthdate("1995-05-15"); // Saves in YYYY-MM-DD format
```

### Screen 2: profileDetails.tsx

```typescript
const { setGender, setFaceShape, setBodyType } = useUserProfile();

// When user selects options:
setGender("Female"); // Saves selected gender
setFaceShape("Oval"); // Saves selected face shape
setBodyType("Athletic"); // Saves selected body type
```

### Screen 3: occasions.tsx

```typescript
const { setOccasions } = useUserProfile();

// When user clicks continue:
setOccasions(selected); // Saves ["Party & Clubwear", "Work Formal"]
```

### Screen 4: favoriteColors.tsx

```typescript
const { setFavoriteColors, getProfileData } = useUserProfile();

// When user clicks continue:
setFavoriteColors(selected); // Saves [{name: "Navy", hex: "#001F3F"}, ...]
const profileData = getProfileData(); // Gets ALL collected data
submitUserProfile(profileData); // Sends to backend
```

---

## 4. **Backend Integration - POST Request**

### API Endpoint

**POST** `/api/user/profile`

### Request Payload Structure

```json
{
  "fullName": "John Doe",
  "birthDate": "1995-05-15",
  "gender": "Female",
  "faceShape": "Oval",
  "bodyType": "Athletic",
  "occasions": ["Party & Clubwear", "Work Formal"],
  "favoriteColors": [
    {
      "name": "Navy",
      "hexCode": "#001F3F"
    },
    {
      "name": "Blue",
      "hexCode": "#0074D9"
    }
  ],
  "email": "john@example.com"
}
```

### Response Expected

```json
{
  "success": true,
  "userId": 12345,
  "message": "Profile created successfully"
}
```

---

## 5. **Setting Up Your Backend URL**

Open `lib/profileAPI.ts` and update:

```typescript
const BASE_URL = "YOUR_BACKEND_URL"; // Example: 'http://192.168.1.100:8080'
```

### Examples:

- **Local Development**: `http://localhost:8080`
- **Staging Server**: `https://api-staging.yourdomain.com`
- **Production**: `https://api.yourdomain.com`

---

## 6. **How the API Call Works**

Located in `lib/profileAPI.ts`:

```typescript
export const submitUserProfile = async (profile: UserProfile) => {
  // 1. Format data into request payload
  // 2. Send POST request to backend
  // 3. Wait for response
  // 4. Return success or error
  // 5. Handle in favoriteColors.tsx
};
```

### What Happens When User Submits:

1. ✅ User selects favorite colors
2. ✅ Clicks "Continue" button
3. ✅ App shows loading spinner
4. ✅ Collects all profile data from context
5. ✅ Calls `submitUserProfile(profileData)`
6. ✅ Sends POST request with complete data
7. ✅ Backend receives and stores in database
8. ✅ Backend returns userId
9. ✅ Shows success message
10. ✅ Navigate to home screen

---

## 7. **Using the Saved User Data**

After profile creation, access data anywhere:

```typescript
import { useUserProfile } from '../context/UserProfileContext';

function MyComponent() {
  const { fullName, gender, favoriteColors, userId } = useUserProfile();

  return (
    <View>
      <Text>{fullName}</Text>
      <Text>{gender}</Text>
      <Text>{favoriteColors.length} favorite colors</Text>
    </View>
  );
}
```

---

## 8. **Error Handling**

If the POST request fails:

```typescript
submitUserProfile(profileData)
  .then((response) => {
    if (response.success) {
      // Success - navigate to home
      router.replace("/(tabs)/home");
    } else {
      // Show error message from backend
      alert(`Error: ${response.message}`);
    }
  })
  .catch((error) => {
    // Network error or other exception
    alert("Failed to submit profile");
  });
```

---

## 9. **Resetting Profile**

To reset all profile data:

```typescript
const { resetProfile } = useUserProfile();

resetProfile(); // Clears all stored data
```

---

## Summary

| Part        | Location                         | Purpose                            |
| ----------- | -------------------------------- | ---------------------------------- |
| Context     | `context/UserProfileContext.tsx` | Stores all user data               |
| API Utility | `lib/profileAPI.ts`              | Handles POST request to backend    |
| Screen 1    | `app/createProfile.tsx`          | Collect name + birthdate           |
| Screen 2    | `app/profileDetails.tsx`         | Collect gender + face + body       |
| Screen 3    | `app/occasions.tsx`              | Collect occasions                  |
| Screen 4    | `app/favoriteColors.tsx`         | Collect colors + submit to backend |

That's it! Your profile system is now ready. Just update the backend URL and your backend endpoint, and you're good to go! 🚀
