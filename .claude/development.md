# Development Guidelines

## Code Style

### General Rules
- XO enforces strict linting rules
- Use functional components with hooks
- TypeScript for all new code
- Named exports preferred (no default exports)
- Use React.ReactElement instead of JSX.Element

### File Naming Conventions
- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Utilities/hooks**: camelCase (e.g., `useAuth.ts`)
- **Types/interfaces**: PascalCase without prefixes
- **API files**: Domain-based (e.g., `auth.ts`, `user.ts`)

### Component Guidelines
- Keep components focused and single-purpose
- Extract complex logic to custom hooks
- Use composition over inheritance
- Implement error boundaries for pages
- Consistent loading states

### TypeScript Patterns
- Use `readonly` for all component props
- Prefer interfaces over types for objects
- Use strict mode
- Avoid `any` - use `unknown` if type is truly unknown

## Best Practices

### State Management
- Keep stores focused on specific domains
- Don't duplicate server state in stores
- Use actions for all state mutations
- Handle loading/error states within stores
- Use selectors to optimize re-renders

### API Integration
- Always validate responses with Zod schemas
- Handle errors at the service layer
- Use proper TypeScript types for requests/responses
- Implement retry logic for critical endpoints
- Log errors in development only

### Performance
- Lazy load all route components
- Use React.memo for expensive pure components
- Implement proper caching strategies
- Monitor bundle size with build analysis
- Optimize images and assets

### Testing Strategy
- Unit tests for utilities and hooks
- Integration tests for API services
- Component tests for critical UI elements
- E2E tests for user workflows

### Security
- Never expose sensitive data in errors or logs
- Validate all user inputs
- Sanitize data before display
- Use HTTPS in production
- Implement proper CORS policies

### Multi-Tenant Considerations
- Always include clientCode in API requests
- Validate clientCode availability
- Handle tenant-specific configurations
- Properly isolate tenant data
- Test with multiple tenants

## Development Workflow

### Local Development
1. Run `yarn dev` to start dev server
2. Use `yarn type-check` for TypeScript validation
3. Run `yarn lint:fix` before committing
4. Test with different screen sizes
5. Check error handling with ErrorModal

### Before Committing
1. Run `yarn type-check` - must pass
2. Run `yarn lint:fix` - fix any issues
3. Test critical user flows
4. Check for console errors
5. Verify no sensitive data exposed

### Code Review Checklist
- [ ] TypeScript types properly defined
- [ ] Error handling implemented
- [ ] Loading states handled
- [ ] Responsive design tested
- [ ] i18n keys added for user-facing text
- [ ] No hardcoded values
- [ ] Follows existing patterns

### Debugging Tips
- Use React DevTools for component debugging
- Check Network tab for API issues
- Use ErrorModal in development
- Enable verbose logging with env variables
- Check Redux DevTools for state issues

## Common Pitfalls

### Avoid These Mistakes
1. Using `react-router-dom` instead of `react-router`
2. Default exports in components
3. Forgetting `readonly` on props
4. Not handling loading/error states
5. Hardcoding text instead of using i18n
6. Skipping TypeScript validation
7. Not testing error scenarios

### Performance Traps
- Inline function definitions in render
- Missing dependencies in useEffect
- Not memoizing expensive computations
- Unnecessary re-renders from poor state design
- Large bundle sizes from improper imports

## Environment Variables

### Available Variables
- `VITE_API_URL`: API base URL
- `VITE_DEV_API_DELAY`: Simulated API delay (ms)
- `VITE_APP_VERSION`: Application version
- `VITE_APP_BUILD`: Build identifier

### Adding New Variables
1. Add to `.env.example`
2. Update TypeScript types in `src/vite-env.d.ts`
3. Document in README
4. Use `import.meta.env.VITE_*` to access