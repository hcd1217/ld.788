import type { POFormValues } from './POForm';

/**
 * Creates a standardized address object from customer data
 */
export function createAddressFromCustomer(customerAddress: string | undefined) {
  if (!customerAddress) {
    return {
      oneLineAddress: '',
    };
  }

  return {
    oneLineAddress: customerAddress,
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
  };
}

/**
 * Prepares form values for submission by syncing addresses
 */
export function prepareSubmissionValues(values: POFormValues): POFormValues {
  return {
    ...values,
    useSameAddress: true,
    billingAddress: values.shippingAddress,
  };
}

/**
 * Calculates credit status for a customer
 */
export function calculateCreditStatus(
  customer: { creditLimit?: number; creditUsed: number } | undefined,
  totalAmount: number,
) {
  if (!customer || !customer.creditLimit) return undefined;

  const availableCredit = customer.creditLimit - customer.creditUsed;
  const afterOrderCredit = availableCredit - totalAmount;

  return {
    limit: customer.creditLimit,
    current: customer.creditUsed,
    available: availableCredit,
    afterOrder: afterOrderCredit,
    exceeds: afterOrderCredit < 0,
  };
}
