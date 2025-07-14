# Clarifications Needed from Product Team

## Store Configuration

1. **Google Maps API Key**
   - Who will provide the API key?
      → Dev team first, this is PoC
   - Budget considerations for API usage?
      →  Cheap plan, free is the best, but let say < 5$/month
      Is it possible?

2. **Store Data**
   - Can stores be edited after creation?
      → at the moment, NO
   - Multiple stores per account support?
      → YES
   - Store operating hours needed?
      → YES

## Staff Management

1. **Staff Clock-in URL**
   - Format: Is `/clock-in/{staffId}` acceptable?
      → should be hash (`/clock-in/${md5(storeId)}/${md5(staffId)}`)
   - Should URL be shortened or customizable?
      → don't need, we can use QR code
   - Expiration or security considerations?
      → no, will handle it in BE

2. **Working Patterns**
   - Default weekly hours for fulltime staff?
      → yes
   - Overtime rate calculations needed?
      → yes, but placeholder first
   - How to handle holiday pay?
      → custom rule, but placeholder first

3. **Leave Calculations**
   - Example: If 1 leave day = 8 hours for shift workers, confirm?
      → yes
   - Carry-over leave policy?
      → yes
   - Different leave types (sick, vacation)?
      → yes

4. **Permissions**
   - Exact access items for each role?
      → skip it now
   - Can permissions be customized per staff?
      → skip it now
   - Who can modify permissions?
      → skip it now

5. **Staff Notifications**
   - Email only or SMS also?
      → skip it now, will handle in server
   - What information in welcome email?
      → skip it now, will handle in server
   - Password setup process?
      → skip it now, will handle in server

6. **Business Rules**
   - Can staff be deleted or only deactivated?
      → both deactivate & delete
   - Duplicate email/phone handling?
      → yes
   - Minimum/maximum hourly rates?
      → yes
