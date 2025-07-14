# Architecture Details

## System Architecture

### Frontend Architecture
- **SPA**: React 19 with Vite for fast development
- **Component-Based**: Reusable components with clear separation of concerns
- **State Management**: Zustand for global state, local state for component-specific data
- **Type Safety**: TypeScript throughout with strict mode

### API Layer
- **BaseApiClient**: Centralized API client with:
  - Automatic error handling and logging
  - Request/response interceptors
  - Zod schema validation for type safety
  - Development API delay simulation (VITE_DEV_API_DELAY)
  - Multi-tenant support via X-CLIENT-CODE header
  - JWT token management with refresh logic

### Authentication Flow
1. User submits credentials
2. API validates and returns JWT tokens (access + refresh)
3. Tokens stored in localStorage
4. User data extracted from JWT payload
5. Protected routes check authentication status
6. Automatic token refresh on 401 responses

### Multi-Tenant Architecture
- Client code extracted from URL path (/:clientCode)
- Stored in localStorage and Zustand store
- Sent with every API request via X-CLIENT-CODE header
- ServiceLayout component handles extraction and storage

### Error Handling System
- **Global Error Catching**: Captures all error types
- **Error Store**: Centralized error management with deduplication
- **Error Types**: 
  - error: General JavaScript errors
  - unhandledRejection: Promise rejections
  - apiError: API response errors
  - componentError: React component errors
- **Development Features**: ErrorModal for debugging

### Internationalization (i18n)
- **Library**: react-i18next with TypeScript support
- **Languages**: English (en), Vietnamese (vi)
- **Features**:
  - Type-safe translation keys
  - Language persistence in localStorage
  - Locale-specific configurations (e.g., name ordering)
  - Fallback strategies for missing translations

### Routing Architecture
- **Library**: React Router v7
- **Patterns**:
  - All routes lazy loaded for code splitting
  - Protected routes with authentication guards
  - Nested layouts for consistent UI
  - Error boundaries at route level

### Component Organization

#### Common Components
- Shared UI components used across the application
- Examples: AppLoader, ErrorBoundary, LanguageSwitcher

#### Layouts
- Page structure components
- AppLayout: Main authenticated app layout
- ServiceLayout: Multi-tenant wrapper
- ResponsiveAuthLayout: Mobile-responsive auth pages

#### Page Components
- Route-specific views
- Always lazy loaded
- Wrapped with error boundaries

### Performance Optimizations
- Route-based code splitting
- Lazy loading for all pages
- React.memo for expensive components
- Zustand selector optimization
- API response caching in BaseApiClient

### Development Features
- Environment-based configuration
- API delay simulation for testing loading states
- Comprehensive error logging and debugging
- Version and build information display
- Development-only UI elements

### Security Considerations
- JWT-based authentication
- CSRF protection via tokens
- Input validation on client and server
- Sensitive data never logged
- Proper error sanitization

### PWA Architecture
- Service worker ready
- Install prompt component
- Offline capability preparation
- App manifest configuration