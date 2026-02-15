// Frontend Authentication Implementation Guide

## Summary of Frontend Authentication Setup

### ✅ Completed Components

1. **Persistent Authentication (splash.tsx)**
   - Token saved to SecureStore on login
   - Token restored on app restart
   - User stays logged in between sessions

2. **Secure Logout (account.tsx + UserProfileContext.tsx)**
   - Clears token from SecureStore
   - Resets user context
   - Redirects to login screen

3. **Authenticated API Calls (lib/api.ts)**
   - `authenticatedFetch()` - Wrapper that adds Authorization header
   - `getAuthToken()` - Retrieves token from secure storage
   - `createUserProfile()` - Example authenticated endpoint

4. **Global Error Handler (hooks/use-api-handler.ts)**
   - `useApiHandler()` - Hook for handling 401 errors globally
   - Automatically logs out user if token expired or user deleted

---

## How to Use in Components

### Example 1: Making Authenticated API Calls

```typescript
import { createUserProfile } from '../lib/api';
import { useApiHandler } from '../hooks/use-api-handler';

export default function CreateProfileScreen() {
  const { handleError } = useApiHandler();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (profileData) => {
    setLoading(true);
    try {
      const result = await createUserProfile(profileData);

      if (result.ok) {
        console.log('✅ Profile created');
        // Navigate to next screen
      } else {
        // Handle error (includes 401 logout)
        await handleError(result.status, result.data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Component JSX
  );
}
```

### Example 2: Adding More Authenticated Endpoints

In `lib/api.ts`, add new functions following this pattern:

```typescript
export async function getUserProfile(): Promise<ApiResult> {
  return authenticatedFetch(`${API_URL}/profile`, {
    method: "GET",
  });
}

export async function updateUserProfile(data: any): Promise<ApiResult> {
  return authenticatedFetch(`${API_URL}/profile`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function getProductsByPreference(): Promise<ApiResult> {
  return authenticatedFetch(`${API_URL}/products/recommended`, {
    method: "GET",
  });
}
```

### Example 3: Handling Errors in Components

```typescript
import { useApiHandler } from "../hooks/use-api-handler";

export default function HomeScreen() {
  const { handleError } = useApiHandler();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const result = await getProductsByPreference();

    if (!result.ok) {
      await handleError(result.status, result.data);
      return;
    }

    // Use result.data
  };
}
```

---

## Token Flow

```
1. Login Screen
   ↓
   sendOtp(email) → Backend generates OTP
   ↓
   verifyOtp(email, otp) → Backend returns JWT token
   ↓
   setAuthToken(token) → Save to context
   ↓
   SecureStore.setItem('authToken', token) → Save securely [Done in login.tsx]

2. Authenticated Requests
   ↓
   getAuthToken() → Retrieve from SecureStore
   ↓
   authenticatedFetch(url) → Add Authorization header
   ↓
   if (401) → Clear token & redirect to login
   ↓
   else → Return response

3. Token Expiration (24 hours)
   ↓
   After expiration, next API call returns 401
   ↓
   User automatically logged out
   ↓
   Redirected to login screen

4. User Deletion
   ↓
   Backend rejects token if user not found
   ↓
   Returns 401 status
   ↓
   User automatically logged out
   ↓
   Redirected to login screen
```

---

## Testing Checklist

- [ ] Login works and saves token
- [ ] App restart loads user from SecureStore
- [ ] Logout clears token and redirects to login
- [ ] Authenticated API calls include Authorization header
- [ ] Expired tokens (401) redirect to login
- [ ] Deleted users (401 from backend) redirect to login
- [ ] Network errors show error alert
- [ ] Server errors show error alert

---

## Files Modified/Created

### Modified:

- ✅ `lib/api.ts` - Added authenticatedFetch() helper and getAuthToken()
- ✅ `splash.tsx` - Enabled persistent auth
- ✅ `account.tsx` - Added secure logout
- ✅ `context/UserProfileContext.tsx` - Added logout method

### Created:

- ✅ `hooks/use-api-handler.ts` - Global error handler hook
