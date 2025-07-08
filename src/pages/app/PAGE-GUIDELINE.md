# App Pages Guidelines

This document outlines the standards and patterns for creating pages in the `src/pages/app/` directory.

## File Location & Organization

### Directory Structure
```
src/pages/app/
├── PAGE-GUIDELINE.md          # This file
├── AddUserPage.tsx            # User creation
├── DashboardPage.tsx          # Main dashboard
├── ExplorePage.tsx            # Content exploration
├── HomePage.tsx               # App home page
├── ImportUsersPage.tsx        # Bulk user import
├── MorePage.tsx               # Additional features
├── NotificationPage.tsx       # Notifications
├── ProfilePage.tsx            # User profile
├── UserDetailPage.tsx         # User details view
└── UserManagementPage.tsx     # User management list
```

### Naming Conventions
- **File Names**: Use PascalCase with `Page` suffix (e.g., `UserManagementPage.tsx`)
- **Component Names**: Match the file name exactly
- **Export**: Use named exports, not default exports

```typescript
// ✅ Correct
export function UserManagementPage() { ... }

// ❌ Incorrect
export default function UserManagement() { ... }
```

## Mobile View Requirements

### Responsive Design Principles
All pages MUST support mobile devices using Mantine's responsive system:

#### Breakpoint Strategy
- **Mobile**: `< sm` (< 576px) - Card-based layouts
- **Tablet**: `sm - md` (576px - 768px) - Hybrid layouts
- **Desktop**: `≥ md` (≥ 768px) - Table/grid layouts

#### Layout Patterns

**1. Data Tables → Card Layout**
```typescript
// Desktop Table
<Box visibleFrom="md">
  <Table striped highlightOnHover>
    {/* Table content */}
  </Table>
</Box>

// Mobile Cards
<Box hiddenFrom="md">
  <Stack gap="sm">
    {items.map(item => (
      <Card key={item.id} withBorder padding="md">
        {/* Card content */}
      </Card>
    ))}
  </Stack>
</Box>
```

**2. Filter Controls**
```typescript
// Mobile: Vertical stack
<Box hiddenFrom="sm">
  <Stack gap="sm">
    <TextInput {...searchProps} />
    <Group grow>
      <Select {...filter1Props} />
      <Select {...filter2Props} />
    </Group>
  </Stack>
</Box>

// Desktop: Horizontal group
<Box visibleFrom="sm">
  <Group>
    <TextInput style={{minWidth: 250}} {...searchProps} />
    <Select style={{minWidth: 150}} {...filter1Props} />
    <Select style={{minWidth: 150}} {...filter2Props} />
  </Group>
</Box>
```

**3. Action Buttons**
```typescript
// Hide secondary actions on mobile
<Button
  variant="light"
  size="sm"
  visibleFrom="sm"
  onClick={handleSecondaryAction}
>
  Secondary Action
</Button>
```

## Style Standards

### Layout Structure
Every app page should follow this standard structure:

```typescript
export function PageName() {
  return (
    <Container size="xl" mt="xl">
      <Stack gap="xl">
        {/* Header Section */}
        <Group justify="space-between">
          <Anchor component="button" onClick={() => navigate(-1)}>
            <Center inline>
              <IconArrowLeft style={{width: rem(12), height: rem(12)}} />
              <Box ml={5}>{t('common.backToPreviousPage')}</Box>
            </Center>
          </Anchor>
          
          {/* Action Buttons */}
          <Group gap="sm">
            <Button variant="light" visibleFrom="sm">Secondary</Button>
            <Button>Primary Action</Button>
          </Group>
        </Group>

        {/* Page Title */}
        <Title order={1} ta="center">
          {t('page.title')}
        </Title>

        {/* Main Content */}
        <Paper withBorder shadow="md" p="md" radius="md">
          {/* Page content */}
        </Paper>
      </Stack>
    </Container>
  );
}
```

### Container Sizing
- **Default**: `size="xl"` for most pages
- **Forms**: `size="sm"` for focused forms (login, add user)
- **Details**: `size="md"` for detail views

### Spacing Standards
- **Page Margin**: `mt="xl"` for top margin
- **Stack Gap**: `gap="xl"` for main sections
- **Group Gap**: `gap="sm"` for related elements
- **Card Padding**: `p="md"` for standard cards

### Paper Components
Use consistent Paper styling for content sections:
```typescript
<Paper withBorder shadow="md" p="md" radius="md">
  {/* Content */}
</Paper>
```

### Typography
- **Page Titles**: `<Title order={1} ta="center">`
- **Section Headers**: `<Title order={2}>`
- **Body Text**: `<Text>` with appropriate sizes (`size="sm"`, `size="xs"`)
- **Emphasized Text**: `<Text fw={500}>` for names/important info

### Colors & Variants
- **Primary Actions**: Default button styling
- **Secondary Actions**: `variant="light"`
- **Destructive Actions**: `color="red"`
- **Success Actions**: `color="green"`
- **Status Badges**: Use semantic colors (green/red for active/inactive)

### Loading States
Always include loading overlays for async operations:
```typescript
<LoadingOverlay
  visible={isLoading}
  overlayProps={{blur: 2}}
  transitionProps={{duration: 300}}
/>
```

### Error Handling
Include proper error boundaries and alerts:
```typescript
<Transition mounted={showAlert} transition="fade">
  {(styles) => (
    <Alert
      withCloseButton
      style={styles}
      icon={<IconAlertCircle size={16} />}
      color="red"
      variant="light"
      onClose={() => setShowAlert(false)}
    >
      {t('common.checkFormErrors')}
    </Alert>
  )}
</Transition>
```

## Authentication & Permissions

### Root User Check
Pages requiring admin access should include:
```typescript
if (!user?.isRoot) {
  return <Navigate to="/home" />;
}
```

### Multi-tenant Awareness
Import and use client service for API calls:
```typescript
import {clientService} from '@/services/client';
```

## Internationalization

### Translation Keys
- Use structured translation keys: `t('section.key')`
- Common keys: `t('common.action')`, `t('auth.field')`
- Page-specific keys: `t('userManagement.action')`

### Name Display
Always respect locale-specific name ordering:
```typescript
import {getLocaleConfig} from '@/config/localeConfig';

const getDisplayName = (firstName: string, lastName: string) => {
  const localeConfig = getLocaleConfig(i18n.language);
  return localeConfig.nameOrder === 'family-first' 
    ? `${lastName} ${firstName}`
    : `${firstName} ${lastName}`;
};
```

## Performance Considerations

### State Management
- Use Zustand stores for global state
- Implement proper loading states
- Include error handling in async operations

### Memory Management
- Use `useCallback` for expensive functions
- Implement proper cleanup in `useEffect`
- Consider pagination for large datasets

### Bundle Optimization
- Import only needed components from Mantine
- Use specific icon imports from Tabler
- Follow lazy loading patterns established in routing

## Accessibility

### Focus Management
- Implement proper focus order
- Use `autoFocus` appropriately in forms
- Ensure keyboard navigation works

### Screen Readers
- Use proper ARIA labels
- Include descriptive alt text
- Maintain semantic HTML structure

### Color Contrast
- Follow Mantine's design tokens
- Test with both light and dark themes
- Ensure sufficient contrast ratios

## Testing Considerations

### Type Safety
- Run `yarn type-check` regularly during development
- Use proper TypeScript types for all props and state
- Leverage Mantine's built-in type definitions

### Responsive Testing
- Test on multiple screen sizes
- Verify mobile card layouts work properly
- Ensure touch targets are appropriately sized

### Cross-browser Compatibility
- Test on major browsers
- Verify responsive breakpoints work consistently
- Check for layout shifts and performance issues

---

*Follow these guidelines to ensure consistency, maintainability, and optimal user experience across all app pages.*