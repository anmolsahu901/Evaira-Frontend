# Evaira - Expo App with Phone Authentication

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app). It includes phone-based authentication with a splash screen and login flow.

## Table of Contents

- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Component System](#component-system)
- [How to Add Components](#how-to-add-components)
- [Types of Components](#types-of-components)
- [File-Based Routing](#file-based-routing)
- [Customization](#customization)
- [Resources](#resources)

## Project Structure

This project follows Expo's recommended folder structure:

```
evaira/
├── app/                          # File-based routing directory
│   ├── _layout.tsx              # Root layout wrapper for all screens
│   ├── splash.tsx               # Splash screen (3 second hold)
│   ├── login.tsx                # Phone login screen
│   ├── modal.tsx                # Modal screen example
│   └── (tabs)/                  # Tab-based navigation group
│       ├── _layout.tsx          # Tabs layout configuration
│       ├── index.tsx            # Home/explore tab
│       └── explore.tsx          # Secondary tab
├── components/                   # Reusable UI components
│   ├── themed-text.tsx          # Text component with theme support
│   ├── themed-view.tsx          # View container with theme & background support
│   ├── hello-wave.tsx           # Wave animation component
│   ├── parallax-scroll-view.tsx # Parallax scrolling container
│   ├── haptic-tab.tsx           # Haptic feedback tab button
│   ├── external-link.tsx        # External link handler
│   └── ui/                      # Sub-components library
│       ├── collapsible.tsx      # Expandable section component
│       ├── icon-symbol.tsx      # Icon rendering component
│       └── icon-symbol.ios.tsx  # iOS-specific icon component
├── hooks/                        # Custom React hooks
│   ├── use-color-scheme.ts      # Theme color scheme hook
│   ├── use-color-scheme.web.ts  # Web-specific color scheme
│   └── use-theme-color.ts       # Dynamic theme color hook
├── constants/                    # Static constants
│   └── theme.ts                 # Theme colors and styling constants
├── assets/                       # Static assets
│   └── images/                  # Image assets
│       ├── icon.png             # App icon (splash screen)
│       ├── screenbg.png         # Login screen background
│       └── [other images]
├── package.json                  # Project dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
├── app.json                      # Expo configuration
├── eslint.config.js             # ESLint configuration
└── README.md                     # This file

```

### Directory Explanation

| Directory | Purpose |
|-----------|---------|
| `app/` | Contains all screen files and routing logic. Uses file-based routing (files = routes) |
| `components/` | Reusable UI components used across screens |
| `hooks/` | Custom React hooks for shared logic (state, effects, etc.) |
| `constants/` | Static values like theme colors, API endpoints, strings |
| `assets/` | Images, fonts, and other static media files |

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the App

```bash
npx expo start
```

You'll see options to open the app in:
- **Android Emulator** - For Android development
- **iOS Simulator** - For iOS development (macOS only)
- **Expo Go** - Quick sandbox testing on physical devices
- **Web** - Browser-based testing

### 3. Development Workflow

Edit files in the `app/` directory and see changes hot-reload automatically.

## Component System

### What Are Components?

Components are reusable, self-contained UI elements that encapsulate structure, style, and behavior. They're the building blocks of your app's interface.

### Component Benefits

- **Reusability** - Write once, use everywhere
- **Maintainability** - Update logic in one place
- **Consistency** - Unified UI/UX across the app
- **Testability** - Easy to test in isolation
- **Scalability** - Build complex UIs from simple pieces

## How to Add Components

### Step 1: Create the Component File

Create a new file in `components/` or `components/ui/`:

```tsx
// components/button.tsx
import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from './themed-text';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button({ title, onPress, variant = 'primary' }: ButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, styles[variant]]}
      onPress={onPress}
    >
      <ThemedText style={styles.text}>{title}</ThemedText>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
  },
  primary: {
    backgroundColor: '#007AFF',
  },
  secondary: {
    backgroundColor: '#E5E5EA',
  },
  text: {
    color: '#fff',
    fontWeight: '600',
  },
});
```

### Step 2: Export from Components

Add your component to the appropriate index file or import directly.

### Step 3: Use in Screens

```tsx
// app/index.tsx
import { Button } from '../components/button';

export default function HomeScreen() {
  return (
    <Button 
      title="Click Me" 
      onPress={() => console.log('Pressed!')}
      variant="primary"
    />
  );
}
```

## Types of Components

### 1. **Presentational (Dumb) Components**

Pure UI components that receive data via props and render it. They have no state or side effects.

```tsx
// components/card.tsx
interface CardProps {
  title: string;
  description: string;
}

export function Card({ title, description }: CardProps) {
  return (
    <View style={styles.card}>
      <ThemedText style={styles.title}>{title}</ThemedText>
      <ThemedText style={styles.description}>{description}</ThemedText>
    </View>
  );
}
```

**Use for:** UI elements, layouts, simple displays

---

### 2. **Container (Smart) Components**

Components that manage state, fetch data, and pass it to presentational components.

```tsx
// components/user-list-container.tsx
import { useState, useEffect } from 'react';
import { UserList } from './user-list';

export function UserListContainer() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Fetch users from API
    fetchUsers().then(setUsers);
  }, []);

  return <UserList users={users} />;
}
```

**Use for:** Data fetching, state management, logic

---

### 3. **Themed Components**

Components that automatically adapt to light/dark theme using the `useThemeColor` hook.

Example: `ThemedText` and `ThemedView`

```tsx
// Usage
<ThemedView>
  <ThemedText>This automatically adapts to theme</ThemedText>
</ThemedView>
```

**Use for:** App-wide theming consistency

---

### 4. **Custom Hook Components**

Reusable logic encapsulated in hooks, not rendering anything directly.

```tsx
// hooks/use-phone-validation.ts
import { useState } from 'react';

export function usePhoneValidation() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isValid, setIsValid] = useState(false);

  const validate = (phone: string) => {
    const valid = phone.length >= 10;
    setPhoneNumber(phone);
    setIsValid(valid);
  };

  return { phoneNumber, isValid, validate };
}

// Usage in component
const { phoneNumber, isValid, validate } = usePhoneValidation();
```

**Use for:** Reusable state logic, validation, API calls

---

### 5. **Screen Components**

Full-screen components that represent routes/pages in your app.

```tsx
// app/profile.tsx
import { ThemedView } from '../components/themed-view';

export default function ProfileScreen() {
  return (
    <ThemedView style={styles.container}>
      {/* Screen content */}
    </ThemedView>
  );
}
```

**Use for:** Entire screens accessible via routing

---

### 6. **Layout Components**

Components that structure and organize other components.

```tsx
// components/layouts/center-layout.tsx
export function CenterLayout({ children }) {
  return (
    <View style={styles.container}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
```

**Use for:** Reusable layout patterns

---

### 7. **Compound Components**

Components composed of related sub-components that work together.

```tsx
// components/form.tsx
export function Form({ children }: { children: React.ReactNode }) {
  return <View style={styles.form}>{children}</View>;
}

export function FormField({ label, children }) {
  return (
    <View style={styles.field}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      {children}
    </View>
  );
}

// Usage
<Form>
  <Form.Field label="Name">
    <TextInput />
  </Form.Field>
</Form>
```

**Use for:** Complex UI patterns with multiple parts

---

## File-Based Routing

This project uses Expo Router for file-based routing:

- **Files in `app/` become routes** - `app/login.tsx` → `/login`
- **Dynamic routes** - `app/[id].tsx` → `/123` or `/abc`
- **Layout files** - `_layout.tsx` acts as a wrapper
- **Groups** - `app/(tabs)/` organizes related screens without adding to URL

### Routing Examples

```
app/index.tsx              → / (home)
app/login.tsx              → /login
app/profile/[id].tsx       → /profile/123
app/(tabs)/index.tsx       → /index (inside tabs)
app/(tabs)/explore.tsx     → /explore (inside tabs)
```

## Customization

### Adding a New Screen

1. Create file in `app/` directory
2. Export a default React component
3. It's automatically routable!

```tsx
// app/settings.tsx
import { ThemedView } from '../components/themed-view';

export default function SettingsScreen() {
  return (
    <ThemedView>
      {/* Your settings UI */}
    </ThemedView>
  );
}
```

### Styling Approach

This project uses:
- **StyleSheet API** - React Native's optimized styling
- **Theme system** - Light/dark mode support via hooks
- **Responsive design** - Components adapt to screen size

## Resources

- [Expo Documentation](https://docs.expo.dev/) - Official guides and API docs
- [Expo Router Documentation](https://docs.expo.dev/router/introduction/) - File-based routing
- [React Native Styling](https://reactnative.dev/docs/style) - Complete StyleSheet guide
- [Learn Expo Tutorial](https://docs.expo.dev/tutorial/introduction/) - Step-by-step guide
- [Expo GitHub](https://github.com/expo/expo) - Open source code and issues
- [Expo Discord Community](https://chat.expo.dev) - Get help from the community

---

**Happy building! 🚀**
