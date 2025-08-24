/**
 * Creates a standardized address object from customer data
 */
export function createAddressFromCustomer(
  customerAddress: string | undefined,
  googleMapsUrl?: string,
) {
  if (!customerAddress) {
    return {
      oneLineAddress: '',
      googleMapsUrl: googleMapsUrl || '',
    };
  }

  return {
    oneLineAddress: customerAddress,
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    googleMapsUrl: googleMapsUrl || '',
  };
}

// Note: prepareSubmissionValues was removed as it was just returning {...values} without any transformation
// If transformation is needed in the future, add a new function with actual logic
