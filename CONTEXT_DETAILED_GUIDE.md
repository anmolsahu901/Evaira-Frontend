# UserProfileContext - Detailed Explanation

## What is UserProfileContext?

`UserProfileContext` is a **React Context API** implementation that acts as a global state manager for user profile data. Instead of passing data through props across multiple screens, all profile data is stored in one central location that any screen can access.

---

## Why Use Context Instead of Props?

### ❌ Without Context (Props Drilling)

```typescript
// This creates a long chain of prop passing
<App>
  <CreateProfileScreen onSave={handleSave} />
    ↓ (passes data down)
<ProfileDetailsScreen fullName={fullName} />
    ↓ (passes data down)
<OccasionsScreen fullName={fullName} gender={gender} />
    ↓ (passes data down)
<FavoriteColorsScreen fullName={fullName} gender={gender} occasions={occasions} />
```

Problem: Each component must pass props even if it doesn't use them!

### ✅ With Context (Direct Access)

```typescript
// Any component can directly access and modify data
function AnyScreen() {
  const { fullName, gender, setFullName } = useUserProfile();
  // Use data directly without props!
}
```

Benefit: Clean, no prop drilling, centralized state!

---

## UserProfileContext Architecture

### Type Definitions

```typescript
// The color data structure
export type Color = {
  name: string; // e.g., "Navy"
  hex: string; // e.g., "#001F3F"
};

// The complete user profile
export type UserProfile = {
  fullName: string | null; // e.g., "John Doe"
  birthdate: string | null; // e.g., "1995-05-15"
  gender: string | null; // e.g., "Female"
  faceShape: string | null; // e.g., "Oval"
  bodyType: string | null; // e.g., "Athletic"
  occasions: string[]; // e.g., ["Party & Clubwear"]
  favoriteColors: Color[]; // e.g., [{name: "Navy", hex: "#..."}]
  userId: number | null; // Set after backend saves
  email: string | null; // Optional
};

// The context type (UserProfile + setters + helpers)
type UserProfileContextType = UserProfile & {
  // Setters
  setFullName: (name: string) => void;
  setBirthdate: (iso: string) => void;
  setGender: (gender: string) => void;
  setFaceShape: (shape: string) => void;
  setBodyType: (type: string) => void;
  setOccasions: (occasions: string[]) => void;
  setFavoriteColors: (colors: Color[]) => void;
  setUserId: (id: number | null) => void;
  setEmail: (email: string | null) => void;

  // Helpers
  resetProfile: () => void;
  getProfileData: () => UserProfile;
};
```

---

## How It Works - Step by Step

### Step 1: Create Context

```typescript
const UserProfileContext = createContext<UserProfileContextType | undefined>(
  undefined,
);
```

This creates an empty context container.

### Step 2: Create Provider Component

```typescript
export const UserProfileProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize all state variables
  const [fullName, setFullName] = useState<string | null>(null);
  const [birthdate, setBirthdate] = useState<string | null>(null);
  const [gender, setGender] = useState<string | null>(null);
  const [faceShape, setFaceShape] = useState<string | null>(null);
  const [bodyType, setBodyType] = useState<string | null>(null);
  const [occasions, setOccasions] = useState<string[]>([]);
  const [favoriteColors, setFavoriteColors] = useState<Color[]>([]);
  const [userId, setUserId] = useState<number | null>(null);
  const [email, setEmail] = useState<string | null>(null);

  // Create the context value object
  const value = {
    fullName, birthdate, gender, faceShape, bodyType, occasions, favoriteColors, userId, email,
    setFullName, setBirthdate, setGender, setFaceShape, setBodyType, setOccasions, setFavoriteColors, setUserId, setEmail,
    resetProfile, getProfileData
  };

  // Provide it to all children
  return (
    <UserProfileContext.Provider value={value}>
      {children}
    </UserProfileContext.Provider>
  );
};
```

### Step 3: Create Hook for Easy Access

```typescript
export const useUserProfile = () => {
  const ctx = useContext(UserProfileContext);
  if (!ctx)
    throw new Error("useUserProfile must be used within UserProfileProvider");
  return ctx;
};
```

This hook makes it easy to access context values anywhere.

### Step 4: Wrap App with Provider

In your `App.tsx` or root component:

```typescript
export default function App() {
  return (
    <UserProfileProvider>
      {/* All nested components can now use useUserProfile() */}
      <Navigation />
    </UserProfileProvider>
  );
}
```

### Step 5: Use in Any Screen

```typescript
import { useUserProfile } from "../context/UserProfileContext";

function CreateProfileScreen() {
  const { setFullName, setBirthdate } = useUserProfile();

  // When user clicks continue:
  setFullName("John Doe");
  setBirthdate("1995-05-15");
}
```

---

## State Flow Diagram

```
Initial State:
┌─────────────────────────────────┐
│ fullName: null                  │
│ birthdate: null                 │
│ gender: null                    │
│ faceShape: null                 │
│ bodyType: null                  │
│ occasions: []                   │
│ favoriteColors: []              │
│ userId: null                    │
│ email: null                     │
└─────────────────────────────────┘

After calling setFullName("John"):
┌─────────────────────────────────┐
│ fullName: "John"  ← Changed!    │
│ birthdate: null                 │
│ gender: null                    │
│ ... (rest unchanged)            │
└─────────────────────────────────┘

After calling setBirthdate("1995-05-15"):
┌─────────────────────────────────┐
│ fullName: "John"  ✓             │
│ birthdate: "1995-05-15"  ← Changed!
│ gender: null                    │
│ ... (rest unchanged)            │
└─────────────────────────────────┘

And so on...
```

---

## Helper Functions

### getProfileData()

Returns the complete user profile as an object:

```typescript
const profile = getProfileData();
// Returns:
{
  fullName: "John Doe",
  birthdate: "1995-05-15",
  gender: "Female",
  faceShape: "Oval",
  bodyType: "Athletic",
  occasions: ["Party & Clubwear"],
  favoriteColors: [{name: "Navy", hex: "#001F3F"}],
  userId: null,
  email: null
}
```

**When to use**: Before sending to backend, to collect all data at once.

### resetProfile()

Clears all profile data back to initial state:

```typescript
const { resetProfile } = useUserProfile();
resetProfile();
// After this:
// All fields are back to null/empty array
```

**When to use**: When user wants to restart profile creation, or after logout.

---

## Usage Examples

### Example 1: Simple Data Saving

```typescript
function CreateProfileScreen() {
  const { setFullName } = useUserProfile();
  const [nameInput, setNameInput] = useState('');

  const handleSave = () => {
    setFullName(nameInput);  // Save to global context
  };

  return (
    <View>
      <TextInput
        value={nameInput}
        onChangeText={setNameInput}
        placeholder="Enter name"
      />
      <Button title="Save" onPress={handleSave} />
    </View>
  );
}
```

### Example 2: Accessing Multiple Fields

```typescript
function DisplayProfileScreen() {
  const { fullName, gender, birthdate } = useUserProfile();

  return (
    <View>
      <Text>Name: {fullName}</Text>
      <Text>Gender: {gender}</Text>
      <Text>DOB: {birthdate}</Text>
    </View>
  );
}
```

### Example 3: Collecting All Data Before Submit

```typescript
async function FinalSubmitScreen() {
  const { getProfileData } = useUserProfile();

  const handleSubmit = async () => {
    const completeData = getProfileData();

    // Now send to backend
    const response = await submitToBackend(completeData);
  };

  return <Button title="Submit" onPress={handleSubmit} />;
}
```

### Example 4: Updating Arrays

```typescript
function OccasionsScreen() {
  const { occasions, setOccasions } = useUserProfile();

  const toggleOccasion = (occasion: string) => {
    if (occasions.includes(occasion)) {
      setOccasions(occasions.filter(o => o !== occasion));
    } else {
      setOccasions([...occasions, occasion]);
    }
  };

  return (
    // ... render occasions with toggle
  );
}
```

---

## Data Persistence Scope

```
┌─────────────────────────────────────┐
│   Context is scoped to this tree    │
│                                     │
│  App                                │
│  └─ UserProfileProvider             │
│     ├─ Screen 1  ✓ Can access       │
│     ├─ Screen 2  ✓ Can access       │
│     ├─ Screen 3  ✓ Can access       │
│     └─ Screen 4  ✓ Can access       │
│                                     │
│  Outside provider? ✗ Cannot access  │
└─────────────────────────────────────┘
```

**Important**: Data persists only while the app is running. When app closes, context data is lost. To persist across app restarts, use AsyncStorage or database.

---

## State Updates are Immediate

```typescript
// This happens synchronously:
setFullName("John");

// The component will re-render immediately
// and fullName will be "John" in the next render
```

---

## Accessing Context in Different Scenarios

### Scenario 1: Inside the Provider (✓ Works)

```typescript
<UserProfileProvider>
  <MyScreen />  {/* useUserProfile() works here */}
</UserProfileProvider>
```

### Scenario 2: Outside the Provider (✗ Error)

```typescript
<MyScreen />  {/* useUserProfile() throws error here */}
<UserProfileProvider>
  {/* ... */}
</UserProfileProvider>
```

### Scenario 3: Nested Providers (✓ Works - Uses Closest)

```typescript
<UserProfileProvider>
  <Screen1 />  {/* Uses outer provider */}
  <UserProfileProvider>
    <Screen2 />  {/* Uses inner provider (shadows outer) */}
  </UserProfileProvider>
</UserProfileProvider>
```

---

## Performance Considerations

### ✅ Optimized

- Each screen only reads/writes fields it needs
- Using hooks (not class components) keeps it efficient
- Data structure is simple and flat

### ⚠️ Watch Out For

If you have many screens all reading context, they all re-render when ANY field changes. For massive apps, consider splitting into multiple contexts.

```typescript
// Instead of one huge context:
const ContextA = ...;  // Personal info
const ContextB = ...;  // Preferences
const ContextC = ...;  // Settings
```

---

## Debugging Context

### Check if Provider is Wrapping

```typescript
// If you get "useUserProfile must be used within UserProfileProvider"
// it means the component is NOT inside the provider wrapper
```

### Log Context Values

```typescript
function DebugScreen() {
  const profile = useUserProfile();
  console.log("Current Profile:", profile);
  return null;
}
```

### Check DevTools

Using React DevTools, you can:

1. Navigate to Components tab
2. Find UserProfileProvider
3. See all current state values
4. Watch state changes in real-time

---

## Type Safety Benefits

```typescript
// TypeScript knows what's available:
const { fullName, gender } = useUserProfile();
// ^^ TypeScript auto-completes!

// Type errors caught at compile time:
const { invalidField } = useUserProfile();
// ^^ Error! No such field

// Setters are type-safe:
setFullName(123); // Error! Must be string
setGender(["array"]); // Error! Must be string
```

---

## Summary

| Aspect          | Explanation                                                  |
| --------------- | ------------------------------------------------------------ |
| **What**        | Global state manager for user profile                        |
| **Where**       | `context/UserProfileContext.tsx`                             |
| **How to Use**  | `const { data, setter } = useUserProfile()`                  |
| **Scope**       | Accessible to all components inside provider                 |
| **Persistence** | Only while app is running (use AsyncStorage for persistence) |
| **Updates**     | Immediate and synchronous                                    |
| **Benefits**    | No prop drilling, clean code, type-safe                      |

---

That covers everything about the UserProfileContext! It's a powerful tool for managing state across your app. 🚀
