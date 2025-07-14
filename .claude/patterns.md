# Code Patterns & Examples

## Component Patterns

### Basic Component Structure
```typescript
type MyComponentProps = {
  readonly title: string
  readonly onAction: () => void
}

export function MyComponent({title, onAction}: MyComponentProps) {
  return <div>{title}</div>
}
```

### Lazy Loading Pattern
```typescript
const HomePage = lazy(async () => {
  const module = await import('@/pages/HomePage');
  return {default: module.HomePage};
});
```

## State Management (Zustand)

### Store Pattern
```typescript
type AppState = {
  // State
  user: User | undefined
  isAuthenticated: boolean
  // Actions
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

export const useAppStore = create<AppState>()(
  devtools(
    (set, get) => ({
      user: undefined,
      isAuthenticated: false,
      async login(email: string, password: string) {
        set({isLoading: true});
        try {
          const {user} = await authService.login({email, password});
          set({user, isAuthenticated: true, isLoading: false});
        } catch (error) {
          set({isLoading: false});
          throw error;
        }
      },
      logout: () => {
        authService.logout();
        set({user: undefined, isAuthenticated: false});
      }
    })
  )
);
```

## API Client Patterns

### API Call with Zod Validation
```typescript
const response = await apiClient.post<LoginResponse>(
  '/auth/login',
  credentials,
  LoginResponseSchema
);
```

### Error Handling
```typescript
try {
  const data = await apiClient.get('/users');
} catch (error) {
  if (error instanceof ApiError) {
    addApiError(error.message, error.status, '/users');
  }
}
```

## i18n Patterns

### Translation Usage
```typescript
const {t} = useTranslation();
return <Text>{t('auth.login.title')}</Text>
```

### Nested Keys
```json
{
  "auth": {
    "login": {
      "title": "Sign In",
      "email": "Email Address",
      "password": "Password"
    }
  }
}
```

## Form Patterns

### Mantine Form
```typescript
const form = useForm({
  initialValues: {
    email: '',
    password: ''
  },
  validate: {
    email: (value) => !value ? t('validation.required') : null,
    password: (value) => value.length < 8 ? t('validation.password.min') : null
  }
});
```

## Validation Patterns

### Email Validation
```typescript
const emailRegex = /^\S+@\S+\.\S+$/;
```

### Password Validation
```typescript
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$!%*?&()^])[A-Za-z\d@#$!%*?&()^]{8,}$/;
```

## Error Store Helpers

### Adding Errors
```typescript
addApiError(message, status, endpoint, contextData);
addComponentError(message, componentName, error);
```

## UI/UX Patterns

### Card Layout
```tsx
<Paper p="md" radius="md" withBorder shadow="sm">
  <Stack gap="md">
    {/* Content */}
  </Stack>
</Paper>
```

### Loading Overlay
```tsx
<LoadingOverlay visible={isLoading} overlayBlur={2} />
```

### Responsive Values
```tsx
<Container size={{base: 'sm', sm: 'md', lg: 'lg'}}>
```

### Transitions
```tsx
<Transition mounted={show} transition="slide-up" duration={400}>
  {(styles) => <div style={styles}>Content</div>}
</Transition>
```