# i18n (Internationalization) Implementation Plan

## Overview
Implement multi-language support for the application using react-i18next with JSON translation files.

## Goals
- Support multiple languages (initially English and Vietnamese)
- Type-safe translation keys
- Easy-to-maintain translation files
- Seamless language switching
- Persistent language preference

## Technical Stack
- **Library**: react-i18next (v13+)
- **File Format**: JSON translation files
- **Languages**: English (en), Vietnamese (vi)
- **Storage**: localStorage for language persistence

## File Structure
```
src/
├── locales/
│   ├── en.json          # English translations
│   ├── vi.json          # Vietnamese translations
│   └── index.ts         # Type definitions & exports
├── lib/
│   └── i18n.ts         # i18n configuration
├── hooks/
│   └── useTranslation.ts # Custom hook wrapper
└── components/
    └── LanguageSwitcher.tsx # Language selector component
```

## Translation File Structure

### English (en.json)
```json
{
  "common": {
    "login": "Login",
    "logout": "Logout",
    "submit": "Submit",
    "cancel": "Cancel",
    "save": "Save",
    "delete": "Delete",
    "edit": "Edit",
    "loading": "Loading...",
    "error": "Error",
    "success": "Success"
  },
  "auth": {
    "welcomeBack": "Welcome back!",
    "email": "Email",
    "password": "Password",
    "rememberMe": "Remember me",
    "forgotPassword": "Forgot password?",
    "signIn": "Sign in",
    "signUp": "Sign up",
    "noAccount": "Do not have an account yet?",
    "haveAccount": "Already have an account?",
    "createAccount": "Create account",
    "backToHome": "Back to homepage"
  },
  "validation": {
    "emailRequired": "Email is required",
    "emailInvalid": "Invalid email format",
    "passwordRequired": "Password is required",
    "passwordWeak": "Password must be at least 8 characters with uppercase, lowercase, number and special character",
    "fieldRequired": "This field is required"
  },
  "notifications": {
    "loginSuccess": "Welcome back!",
    "loginSuccessMessage": "You have successfully logged in",
    "loginFailed": "Login failed",
    "invalidCredentials": "Invalid email or password. Please try again.",
    "somethingWentWrong": "Something went wrong. Please try again."
  },
  "errors": {
    "networkError": "Network error. Please check your connection.",
    "serverError": "Server error. Please try again later.",
    "unauthorized": "You are not authorized to perform this action.",
    "notFound": "The requested resource was not found."
  }
}
```

### Vietnamese (vi.json)
```json
{
  "common": {
    "login": "Đăng nhập",
    "logout": "Đăng xuất",
    "submit": "Gửi",
    "cancel": "Hủy",
    "save": "Lưu",
    "delete": "Xóa",
    "edit": "Sửa",
    "loading": "Đang tải...",
    "error": "Lỗi",
    "success": "Thành công"
  },
  "auth": {
    "welcomeBack": "Chào mừng trở lại!",
    "email": "Email",
    "password": "Mật khẩu",
    "rememberMe": "Ghi nhớ đăng nhập",
    "forgotPassword": "Quên mật khẩu?",
    "signIn": "Đăng nhập",
    "signUp": "Đăng ký",
    "noAccount": "Chưa có tài khoản?",
    "haveAccount": "Đã có tài khoản?",
    "createAccount": "Tạo tài khoản",
    "backToHome": "Về trang chủ"
  },
  "validation": {
    "emailRequired": "Email là bắt buộc",
    "emailInvalid": "Email không hợp lệ",
    "passwordRequired": "Mật khẩu là bắt buộc",
    "passwordWeak": "Mật khẩu phải có ít nhất 8 ký tự bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt",
    "fieldRequired": "Trường này là bắt buộc"
  },
  "notifications": {
    "loginSuccess": "Chào mừng trở lại!",
    "loginSuccessMessage": "Bạn đã đăng nhập thành công",
    "loginFailed": "Đăng nhập thất bại",
    "invalidCredentials": "Email hoặc mật khẩu không đúng. Vui lòng thử lại.",
    "somethingWentWrong": "Có lỗi xảy ra. Vui lòng thử lại."
  },
  "errors": {
    "networkError": "Lỗi mạng. Vui lòng kiểm tra kết nối.",
    "serverError": "Lỗi máy chủ. Vui lòng thử lại sau.",
    "unauthorized": "Bạn không có quyền thực hiện hành động này.",
    "notFound": "Không tìm thấy tài nguyên yêu cầu."
  }
}
```

## Implementation Steps

### Phase 1: Setup (Priority: High)
1. **Install Dependencies**
   ```bash
   yarn add i18next react-i18next i18next-http-backend i18next-browser-languagedetector
   yarn add -D @types/react-i18next
   ```

2. **Create i18n Configuration** (`src/lib/i18n.ts`)
   - Initialize i18next with react-i18next
   - Configure language detection
   - Set up fallback language
   - Configure interpolation options

3. **Create Translation Files**
   - Create `src/locales/en.json`
   - Create `src/locales/vi.json`
   - Ensure consistent key structure

4. **Type Safety** (`src/locales/index.ts`)
   - Export translation resources
   - Create TypeScript types from JSON structure
   - Configure module augmentation for react-i18next

### Phase 2: Integration (Priority: High)
1. **Add i18n Provider**
   - Wrap App component with I18nextProvider
   - Add Suspense for translation loading

2. **Create Custom Hook** (`src/hooks/useTranslation.ts`)
   - Wrapper around react-i18next useTranslation
   - Add type safety
   - Add namespace support

3. **Language Switcher Component**
   - Create dropdown/select component
   - Integrate with Mantine UI
   - Handle language change
   - Update localStorage

### Phase 3: Migration (Priority: Medium)
1. **LoginPage Migration**
   - Replace all hardcoded strings
   - Use translation keys
   - Update validation messages
   - Update notification messages

2. **Common Components**
   - Update buttons, labels, placeholders
   - Migrate error messages
   - Update loading states

3. **Form Validations**
   - Create validation message helpers
   - Use translated messages in Mantine forms
   - Handle dynamic validation messages

### Phase 4: Enhancement (Priority: Low)
1. **Advanced Features**
   - Pluralization support
   - Date/time formatting
   - Number formatting
   - Currency formatting

2. **Developer Experience**
   - Translation key autocomplete
   - Missing translation warnings
   - Development mode helpers

3. **Documentation**
   - Usage guidelines
   - Best practices
   - Common patterns

## Configuration Example

### i18n.ts
```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from '../locales/en.json';
import vi from '../locales/vi.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      vi: { translation: vi }
    },
    lng: localStorage.getItem('language') || 'en',
    fallbackLng: 'en',
    debug: import.meta.env.DEV,
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;
```

### Usage Example
```typescript
import { useTranslation } from './hooks/useTranslation';

function LoginPage() {
  const { t } = useTranslation();
  
  return (
    <>
      <Title>{t('auth.welcomeBack')}</Title>
      <TextInput 
        label={t('auth.email')}
        placeholder="you@example.com"
        error={form.errors.email && t('validation.emailRequired')}
      />
      <Button type="submit">
        {t('auth.signIn')}
      </Button>
    </>
  );
}
```

## Best Practices

1. **Key Naming Convention**
   - Use nested structure for organization
   - Use descriptive, semantic keys
   - Avoid abbreviations
   - Keep consistent naming patterns

2. **Translation Guidelines**
   - Keep translations concise
   - Consider UI space constraints
   - Maintain consistent tone
   - Use proper capitalization

3. **Performance**
   - Lazy load translations for large apps
   - Use namespaces to split translations
   - Cache translations in production

4. **Maintenance**
   - Regular review of translations
   - Keep both language files in sync
   - Document context for translators
   - Use translation management tools if needed

## Success Criteria

- [ ] All UI text is translatable
- [ ] Language switching works seamlessly
- [ ] Language preference persists across sessions
- [ ] Type safety for translation keys
- [ ] No hardcoded strings in components
- [ ] Smooth user experience during language change
- [ ] Clear documentation for developers

## Future Enhancements

1. **Additional Languages**
   - Add more language support as needed
   - Consider RTL language support

2. **Translation Management**
   - Integration with translation services
   - Crowdsourced translations
   - A/B testing for translations

3. **Advanced Formatting**
   - Rich text translations
   - Markdown support in translations
   - Dynamic content interpolation