# 📡 API Integration Reference

## Backend Endpoint Specification

### Endpoint Details

- **Method**: `POST`
- **URL**: `http://localhost:8080/api/auth/profile`
- **Content-Type**: `application/json`

---

## Request Headers

```typescript
{
  'Content-Type': 'application/json',
  'Authorization': 'eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhbm1vbHNhaHU5MDFAZ21haWwuY29tIiwiaWF0IjoxNzcwMjU1NjM2LCJleHAiOjE3NzAzNDIwMzZ9.cqPvuxoP33HTIbHKME5xNptSRYhck6TFKFdTCrPjolY'
}
```

---

## Request Body Format

### Example Request

```json
{
  "name": "Anmol Sahu",
  "age": 25,
  "gender": "Male",
  "location": "Pune",
  "bodyType": "Hourglass",
  "faceShape": "Oval",
  "preferredOccasions": [
    "Party & Clubwear",
    "Traditional & Ethnic",
    "Work Formal"
  ],
  "favoriteColors": ["Black", "Royal Blue", "Emerald Green"]
}
```

### Field Specifications

| Field                | Type     | Required | Example              | Notes                               |
| -------------------- | -------- | -------- | -------------------- | ----------------------------------- |
| `name`               | string   | ✅ Yes   | "John Doe"           | Full name from Screen 1             |
| `age`                | number   | ✅ Yes   | 25                   | Age in years (13-120) from Screen 1 |
| `gender`             | string   | ✅ Yes   | "Male"               | From Screen 2 dropdown              |
| `location`           | string   | ✅ Yes   | "Pune"               | City/area from Screen 2             |
| `bodyType`           | string   | ✅ Yes   | "Athletic"           | From Screen 2 dropdown              |
| `faceShape`          | string   | ✅ Yes   | "Oval"               | From Screen 2 dropdown              |
| `preferredOccasions` | string[] | ✅ Yes   | ["Party & Clubwear"] | 1-3 selections from Screen 3        |
| `favoriteColors`     | string[] | ✅ Yes   | ["Black", "Blue"]    | 1-5 color names from Screen 4       |

---

## Available Options

### Gender Options

```javascript
["Female", "Male", "Non-binary", "Prefer not to say"];
```

### Face Shape Options

```javascript
["Round", "Square", "Oval", "Heart", "Diamond", "Oblong", "Triangle", "Pear"];
```

### Body Type Options (Dynamic)

```javascript
// Male body types
["Slim", "Average", "Athletic", "Muscular", "Stocky", "Other"][
  // Female body types
  ("Slim", "Average", "Athletic", "Curvy", "Pear-shaped", "Other")
][
  // Non-binary/Others
  ("Slim", "Average", "Athletic", "Curvy", "Muscular", "Other")
];
```

### Occasions Options

```javascript
[
  "Party & Clubwear",
  "Traditional & Ethnic",
  "Everyday Casuals",
  "Gen Z Trends",
  "Work Formal",
  "Activewear & Sporty",
];
```

### Color Options (12 Predefined)

```javascript
[
  "Navy",
  "Royal Blue",
  "Black",
  "Pink",
  "Red",
  "Emerald Green",
  "White",
  "Gray",
  "Purple",
  "Orange",
  "Yellow",
  "Brown",
];
```

**Note**: Plus custom colors entered by user (string values only)

---

## Response Format

### Success Response (Status: 200)

```json
{
  "success": true,
  "message": "Profile saved successfully"
}
```

### Error Response (Status: 400 or 500)

```json
{
  "success": false,
  "message": "Error description here"
}
```

---

## Code Reference

### Frontend Implementation

**submitUserProfile function in `lib/profileAPI.ts`:**

```typescript
import { UserProfile } from "../context/UserProfileContext";

const BASE_URL = "http://localhost:8080";

export const submitUserProfile = async (
  profile: UserProfile,
): Promise<{ success: boolean; message: string }> => {
  try {
    if (!profile.authToken) {
      return {
        success: false,
        message: "Authentication token is required",
      };
    }

    const payload = {
      name: profile.name,
      age: profile.age,
      gender: profile.gender,
      location: profile.location,
      bodyType: profile.bodyType,
      faceShape: profile.faceShape,
      preferredOccasions: profile.preferredOccasions,
      favoriteColors: profile.favoriteColors,
    };

    const response = await fetch(`${BASE_URL}/api/auth/profile`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: profile.authToken,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    return {
      success: true,
      message: data.message || "Profile submitted successfully",
    };
  } catch (error) {
    console.error("Error submitting profile:", error);
    return {
      success: false,
      message:
        error instanceof Error ? error.message : "Failed to submit profile",
    };
  }
};
```

### Context Type Definition

```typescript
export type UserProfile = {
  name: string | null;
  age: number | null;
  gender: string | null;
  location: string | null;
  faceShape: string | null;
  bodyType: string | null;
  preferredOccasions: string[];
  favoriteColors: string[];
  authToken: string | null;
};
```

---

## CURL Testing Examples

### Basic Request

```bash
curl -X POST 'http://localhost:8080/api/auth/profile' \
  -H 'Authorization: YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "John Doe",
    "age": 28,
    "gender": "Male",
    "location": "New York",
    "bodyType": "Athletic",
    "faceShape": "Square",
    "preferredOccasions": ["Work Formal", "Party & Clubwear"],
    "favoriteColors": ["Black", "Navy"]
  }'
```

### With Pretty Print

```bash
curl -X POST 'http://localhost:8080/api/auth/profile' \
  -H 'Authorization: YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "name": "Anmol Sahu",
    "age": 25,
    "gender": "Male",
    "location": "Pune",
    "bodyType": "Hourglass",
    "faceShape": "Oval",
    "preferredOccasions": [
      "Party & Clubwear",
      "Traditional & Ethnic",
      "Work Formal"
    ],
    "favoriteColors": [
      "Black",
      "Royal Blue",
      "Emerald Green"
    ]
  }' | jq '.'
```

---

## Frontend Data Flow

### Screen 1: createProfile.tsx

- Input: name (string), age (number)
- Context: `setName()`, `setAge()`

### Screen 2: profileDetails.tsx

- Input: gender, location, faceShape, bodyType
- Context: `setGender()`, `setLocation()`, `setFaceShape()`, `setBodyType()`

### Screen 3: occasions.tsx

- Input: select 1-3 occasions
- Context: `setPreferredOccasions()`

### Screen 4: favoriteColors.tsx

- Input: select 1-5 colors (predefined or custom)
- Context: `setFavoriteColors()`, `setAuthToken()`
- Action: Call `submitUserProfile(getProfileData())`

---

## Testing Checklist

- [ ] All required fields have values
- [ ] Authorization token is present
- [ ] Colors are array of strings (not objects)
- [ ] Occasions array has 1-3 items
- [ ] Age is between 13-120
- [ ] Endpoint is correct: `/api/auth/profile`
- [ ] Method is POST
- [ ] Content-Type is `application/json`
- [ ] Response parsed correctly
- [ ] Error messages handled gracefully

---

## Common Issues

| Issue               | Solution                                                |
| ------------------- | ------------------------------------------------------- |
| 401 Unauthorized    | Check if Authorization header is present and valid      |
| 400 Bad Request     | Verify all fields match the spec and have correct types |
| Missing field error | Ensure all required fields are included                 |
| Token expired       | Update token before submitting                          |
| Wrong endpoint      | Use `/api/auth/profile` not `/api/user/profile`         |
| CORS error          | Backend must have CORS enabled for your frontend URL    |

---

## Integration Status

✅ Frontend: Ready
✅ Data structure: Correct
✅ API utility: Implemented
✅ Context: Updated
⏳ Backend: Waiting for your endpoint

**Everything is aligned with your backend specification!**
