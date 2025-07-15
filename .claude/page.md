# App Pages Guidelines

Quick reference for creating pages in `src/pages/app/`

## Core Requirements

### File Conventions
- **Naming**: PascalCase with `Page` suffix (e.g., `UserManagementPage.tsx`)
- **Exports**: Named exports only - `export function PageName() { ... }`
- **Location**: All pages in `src/pages/app/` directory

### Standard Layout Pattern

```typescript
export function PageName() {
  return (
    <Container fluid mt="xl">
      <Stack gap="xl">
        {/* Header with navigation controls if needed */}
        <Container size="xl" px="md">
          <Group justify="space-between">
            <GoBack />
            <Button visibleFrom="sm">Secondary Action</Button>
          </Group>
        </Container>

        {/* Page Title */}
        <Title order={1} ta="center">
          {t('page.title')}
        </Title>

        {/* Centered Content */}
        <Box style={{
          display: 'flex',
          justifyContent: 'center',
          width: '100%',
          padding: '0 16px',
        }}>
          <Box style={{maxWidth: '600px', width: '100%'}}>
            <Card shadow="sm" padding="xl" radius="md">
              {/* Main content */}
            </Card>
          </Box>
        </Box>
      </Stack>
    </Container>
  );
}
```

## Responsive Design

### Mobile-First Approach
- **Tables**: Convert to cards on mobile using `visibleFrom="md"` / `hiddenFrom="md"`
- **Secondary Actions**: Hide on mobile with `visibleFrom="sm"`
- **Filters**: Stack vertically on mobile, horizontal on desktop

### Key Breakpoints
- Mobile: `< 576px` (card layouts)
- Desktop: `≥ 768px` (table/grid layouts)

## Essential Patterns

### Loading States
```typescript
<LoadingOverlay
  visible={isLoading}
  overlayProps={{blur: 2}}
  transitionProps={{duration: 300}}
/>
```

### Error Handling
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
      {error || t('common.checkFormErrors')}
    </Alert>
  )}
</Transition>
```

### Authentication Guard
```typescript
if (!user?.isRoot) {
  return <Navigate to="/home" />;
}
```

## Key Standards

### Container Sizing
- **Full width**: `Container fluid` for viewport-wide layouts
- **Content centering**: Max-width 600px Box wrapper for forms/cards
- **Complex pages**: Max-width up to 1200px for tables/lists

### i18n Requirements
- Always use translation keys: `t('section.key')`
- Respect locale-specific name ordering via `getLocaleConfig()`
- Apply translations to all user-facing text

### Performance
- Import specific components from Mantine
- Use proper TypeScript types
- Implement cleanup in useEffect hooks
- Consider pagination for large datasets

### Accessibility
- Maintain semantic HTML structure
- Ensure keyboard navigation
- Test with both light/dark themes
- Use proper ARIA labels where needed

## Quick Checklist

- [ ] Named export with Page suffix
- [ ] Container fluid with centered content pattern
- [ ] Mobile-responsive (cards on mobile, tables on desktop)
- [ ] Loading states implemented
- [ ] Error handling with alerts
- [ ] All text translated
- [ ] TypeScript types defined
- [ ] Authentication checks if needed

---

*Follow these patterns for consistency across all app pages.*