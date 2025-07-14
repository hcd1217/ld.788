# Store Configuration & Staff Management Implementation Plan

## Overview
Implement Store Configuration and Staff Management features with UI-first approach and mock APIs.

## Technical Stack
- **Maps**: Google Maps JavaScript API (Places Autocomplete + Maps) - Budget <$5/month
- **Forms**: Mantine form with validation
- **State**: Zustand stores with multi-store support
- **Mock API**: Fake service layer with simulated delays
- **Additional Libraries**:
  - `crypto-js` for MD5 hashing
  - `qrcode` for QR code generation

## Phase 1: Store Configuration

### Components Structure
```
pages/
  StoreConfigPage.tsx
components/
  store/
    StoreConfigForm.tsx
    LocationInput.tsx (with autocomplete)
    GoogleMapDisplay.tsx
```

### Key Implementation Points
- **Google Maps Integration**:
  - Use `@react-google-maps/api` library
  - Implement Places Autocomplete for address suggestions
  - Display map when address selected/entered
  - Store coordinates for future use

- **Multi-Store Support**:
  - Store selector/switcher component
  - Current store context
  - Store operating hours configuration

- **State Management**:
  - Create `useStoreConfigStore` for multi-store data
  - Current store selection state
  - Persist in localStorage

- **Mock API**:
  - `storeService.ts` with fake endpoints
  - Create-only operations (no edit initially)

## Phase 2: Staff Management

### Components Structure
```
pages/
  StaffListPage.tsx
  AddStaffPage.tsx
components/
  staff/
    StaffForm/
      BasicInfoSection.tsx
      WorkingPatternSection.tsx
      AccessPermissionSection.tsx
    StaffList.tsx
    StaffCard.tsx
```

### Key Implementation Points
- **Staff URL & QR Code**:
  - Generate URL: `/clock-in/${md5(storeId)}/${md5(staffId)}`
  - QR code generation for easy sharing
  - Display as read-only with copy button

- **Working Patterns**:
  - Toggle between Fulltime/Shift modes
  - Default weekly hours for fulltime
  - Leave types: sick, vacation, etc.
  - Leave calculation: 1 day = 8 hours for shift workers
  - Placeholders for overtime/holiday rates

- **Validation Rules**:
  - Email/phone duplicate checking
  - Min/max hourly rate limits
  - Required fields validation

- **Staff Status**:
  - Both deactivate and delete options
  - Status indicator (active/inactive)

- **State Management**:
  - Create `useStaffStore` for staff data
  - Handle CRUD operations with optimistic updates
  - Multi-store staff filtering

## Implementation Timeline

### Week 1: Foundation
- [ ] Setup Google Maps API integration
- [ ] Create base components structure
- [ ] Implement mock services

### Week 2: Store Configuration
- [ ] LocationInput with autocomplete
- [ ] GoogleMapDisplay component
- [ ] Store configuration form and persistence

### Week 3: Staff Management Core
- [ ] Staff form with all sections
- [ ] Permission matrix implementation
- [ ] Staff list and filtering

### Week 4: Polish & Integration
- [ ] Staff URL generation and display
- [ ] Notification simulation
- [ ] Error handling and validation
- [ ] UI polish and responsiveness

## Mock API Structure

### Store Endpoints
```typescript
// Mock responses
POST   /api/stores        - Create/update store
GET    /api/stores/{id}   - Get store details
```

### Staff Endpoints
```typescript
POST   /api/staff         - Create staff
GET    /api/staff         - List staff
GET    /api/staff/{id}    - Get staff details
PUT    /api/staff/{id}    - Update staff
DELETE /api/staff/{id}    - Delete staff
```

## Validation Rules
- **Store**: Name required, valid address required
- **Staff**: 
  - Email format validation
  - Phone number format
  - Hourly rate > 0
  - Leave days calculation validation

## UI/UX Considerations
- Loading states during API calls
- Success notifications on save
- Confirmation dialogs for destructive actions
- Responsive design for mobile access
- Clear visual hierarchy in forms

## Technical Debt & Future Considerations
- Real Google Maps API key needed
- Actual backend integration
- Email notification system
- Advanced permission customization
- Multi-store support