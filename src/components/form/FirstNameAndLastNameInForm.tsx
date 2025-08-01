import {Grid, TextInput} from '@mantine/core';
import type {UseFormReturnType} from '@mantine/form';
import {useEffect} from 'react';
import {useTranslation} from '@/hooks/useTranslation';
import i18n from '@/lib/i18n';
import {getLocaleConfig} from '@/config/localeConfig';

export function FirstNameAndLastNameInForm<
  T extends {firstName: string; lastName: string},
>({
  form,
  isLoading,
  setShowAlert,
}: {
  readonly isLoading: boolean;
  readonly form: UseFormReturnType<T>;
  readonly setShowAlert: (show: boolean) => void;
}) {
  const {t} = useTranslation();
  // Focus first name field (based on locale order) on mount and trigger mount animation
  useEffect(() => {
    const timer = setTimeout(() => {
      const localeConfig = getLocaleConfig(i18n.language);
      const fieldToFocus =
        localeConfig.nameOrder === 'family-first'
          ? 'input[name="lastName"]'
          : 'input[name="firstName"]';
      const inputElement =
        document.querySelector<HTMLInputElement>(fieldToFocus);
      inputElement?.focus();
    }, 300);
    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <Grid>
      {(() => {
        const localeConfig = getLocaleConfig(i18n.language);
        const firstNameField = (
          <Grid.Col key="firstName" span={{base: 12, sm: 6}}>
            <TextInput
              required
              autoComplete="given-name"
              placeholder={t('auth.firstNamePlaceholder')}
              error={form.errors.firstName}
              disabled={isLoading}
              {...form.getInputProps('firstName')}
              onFocus={() => {
                setShowAlert(false);
              }}
            />
          </Grid.Col>
        );

        const lastNameField = (
          <Grid.Col key="lastName" span={{base: 12, sm: 6}}>
            <TextInput
              required
              autoComplete="family-name"
              placeholder={t('auth.lastNamePlaceholder')}
              error={form.errors.lastName}
              disabled={isLoading}
              {...form.getInputProps('lastName')}
              onFocus={() => {
                setShowAlert(false);
              }}
            />
          </Grid.Col>
        );

        // Return fields in order based on locale configuration
        return localeConfig.nameOrder === 'family-first'
          ? [lastNameField, firstNameField]
          : [firstNameField, lastNameField];
      })()}
    </Grid>
  );
}
