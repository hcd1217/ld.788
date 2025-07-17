export function generateRandomString(length: number): string {
  return Math.random()
    .toString(36)
    .slice(2, 2 + length);
}

export function formatPhoneNumber(phoneNumber: string) {
  return phoneNumber
    .replace('+84', '0')
    .replace(/(\d{4})(\d{3})(\d+)/, '$1-$2-$3');
}

export function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString();
}
