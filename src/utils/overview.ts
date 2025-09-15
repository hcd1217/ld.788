import type { CustomerOverview, EmployeeOverview } from '@/services/client/overview';

/**
 * Get employee full name by userId from overview data
 * Returns the userId if employee not found (fallback)
 */
export function getEmployeeNameByUserId(
  employeeMapByUserId: Map<string, EmployeeOverview> | undefined,
  userId: string | undefined | null,
): string {
  if (!userId) {
    return '-';
  }

  const employee = employeeMapByUserId?.get(userId);
  return employee?.fullName ?? userId;
}

/**
 * Get employee full name by userId from overview data
 * Returns the userId if employee not found (fallback)
 */
export function getCustomerNameByCustomerId(
  customerMapByCustomerId: Map<string, CustomerOverview> | undefined,
  customerId: string | undefined | null,
): string {
  if (!customerId) {
    return '-';
  }

  const customer = customerMapByCustomerId?.get(customerId);
  return customer?.name ?? customerId;
}
