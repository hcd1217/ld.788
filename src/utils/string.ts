import { getLocaleConfig } from '@/config/localeConfig';
import i18n from '@/lib/i18n';

export function generateRandomString(length: number): string {
  return Math.random()
    .toString(36)
    .slice(2, 2 + length);
}

export function formatCurrency(value: number) {
  return value.toLocaleString('vi-VN', {
    style: 'currency',
    currency: 'VND',
  });
}

export function formatPhoneNumber(phoneNumber: string) {
  return phoneNumber.replace('+84', '0').replace(/(\d{4})(\d{3})(\d+)/, '$1-$2-$3');
}

export function formatDate(date: string | Date) {
  if (date instanceof Date) {
    return date.toLocaleDateString('vi-VN');
  }

  return new Date(date).toLocaleDateString('vi-VN');
}

export function convertCamelCaseToText(text: string) {
  // RoleHierarchy → Role Hierarchy
  return text.replaceAll(/([A-Z])/g, ' $1').replace(/^./, function (str) {
    return str.toUpperCase();
  });
}

/**
 * Normalizes Vietnamese characters to their English equivalents
 */
export function normalizeVietnameseChars(text?: string): string {
  if (!text) {
    return '';
  }
  const vietnameseMap: Record<string, string> = {
    à: 'a',
    á: 'a',
    ả: 'a',
    ã: 'a',
    ạ: 'a',
    ă: 'a',
    ằ: 'a',
    ắ: 'a',
    ẳ: 'a',
    ẵ: 'a',
    ặ: 'a',
    â: 'a',
    ầ: 'a',
    ấ: 'a',
    ẩ: 'a',
    ẫ: 'a',
    ậ: 'a',
    è: 'e',
    é: 'e',
    ẻ: 'e',
    ẽ: 'e',
    ẹ: 'e',
    ê: 'e',
    ề: 'e',
    ế: 'e',
    ể: 'e',
    ễ: 'e',
    ệ: 'e',
    ì: 'i',
    í: 'i',
    ỉ: 'i',
    ĩ: 'i',
    ị: 'i',
    ò: 'o',
    ó: 'o',
    ỏ: 'o',
    õ: 'o',
    ọ: 'o',
    ô: 'o',
    ồ: 'o',
    ố: 'o',
    ổ: 'o',
    ỗ: 'o',
    ộ: 'o',
    ơ: 'o',
    ờ: 'o',
    ớ: 'o',
    ở: 'o',
    ỡ: 'o',
    ợ: 'o',
    ù: 'u',
    ú: 'u',
    ủ: 'u',
    ũ: 'u',
    ụ: 'u',
    ư: 'u',
    ừ: 'u',
    ứ: 'u',
    ử: 'u',
    ữ: 'u',
    ự: 'u',
    ỳ: 'y',
    ý: 'y',
    ỷ: 'y',
    ỹ: 'y',
    ỵ: 'y',
    đ: 'd',
    // Uppercase variants
    À: 'A',
    Á: 'A',
    Ả: 'A',
    Ã: 'A',
    Ạ: 'A',
    Ă: 'A',
    Ằ: 'A',
    Ắ: 'A',
    Ẳ: 'A',
    Ẵ: 'A',
    Ặ: 'A',
    Â: 'A',
    Ầ: 'A',
    Ấ: 'A',
    Ẩ: 'A',
    Ẫ: 'A',
    Ậ: 'A',
    È: 'E',
    É: 'E',
    Ẻ: 'E',
    Ẽ: 'E',
    Ẹ: 'E',
    Ê: 'E',
    Ề: 'E',
    Ế: 'E',
    Ể: 'E',
    Ễ: 'E',
    Ệ: 'E',
    Ì: 'I',
    Í: 'I',
    Ỉ: 'I',
    Ĩ: 'I',
    Ị: 'I',
    Ò: 'O',
    Ó: 'O',
    Ỏ: 'O',
    Õ: 'O',
    Ọ: 'O',
    Ô: 'O',
    Ồ: 'O',
    Ố: 'O',
    Ổ: 'O',
    Ỗ: 'O',
    Ộ: 'O',
    Ơ: 'O',
    Ờ: 'O',
    Ớ: 'O',
    Ở: 'O',
    Ỡ: 'O',
    Ợ: 'O',
    Ù: 'U',
    Ú: 'U',
    Ủ: 'U',
    Ũ: 'U',
    Ụ: 'U',
    Ư: 'U',
    Ừ: 'U',
    Ứ: 'U',
    Ử: 'U',
    Ữ: 'U',
    Ự: 'U',
    Ỳ: 'Y',
    Ý: 'Y',
    Ỷ: 'Y',
    Ỹ: 'Y',
    Ỵ: 'Y',
    Đ: 'D',
  };
  return text.replaceAll(
    // cspell:disable-next-line
    /[ÀÁÂÃÈÉÊÌÍÒÓÔÕÙÚÝàáâãèéêìíòóôõùúýĂăĐđĨĩŨũƠơƯưẠạẢảẤấẦầẨẩẪẫẬậẮắẰằẲẳẴẵẶặẸẹẺẻẼẽẾếỀềỂểỄễỆệỈỉỊịỌọỎỏỐốỒồỔổỖỗỘộỚớỜờỞởỠỡỢợỤụỦủỨứỪừỬửỮữỰựỲỳỴỵỶỷỸỹ]/g,
    (char) => vietnameseMap[char] || char,
  );
}

export function renderFullName({
  firstName,
  lastName,
}: {
  readonly firstName?: string;
  readonly lastName?: string;
}) {
  const localeConfig = getLocaleConfig(i18n.language);
  const isVietnameseLocale = i18n.language === 'vi';

  // Normalize Vietnamese characters if displaying in English
  const normalizedFirstName = isVietnameseLocale ? firstName : normalizeVietnameseChars(firstName);
  const normalizedLastName = isVietnameseLocale ? lastName : normalizeVietnameseChars(lastName);

  if (localeConfig.nameOrder === 'family-first') {
    return `${normalizedLastName} ${normalizedFirstName}`;
  }

  return `${normalizedFirstName} ${normalizedLastName}`;
}
